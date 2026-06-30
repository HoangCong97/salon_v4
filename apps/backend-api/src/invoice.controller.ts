import { Controller, Get, Post, Param, Body, Query, HttpException, HttpStatus } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/branches/:branchId/invoices")
export class InvoiceController {

  // 1. GET ALL INVOICES FOR A BRANCH
  @Get()
  async getInvoices(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string
  ) {
    try {
      return await prisma.invoice.findMany({
        where: {
          tenantId,
          branchId,
          deletedAt: null
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          cashier: {
            select: {
              id: true,
              name: true
            }
          },
          items: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    } catch (error) {
      throw new HttpException(
        `Failed to fetch invoices: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. CREATE INVOICE (POS CHECKOUT)
  @Post()
  async createInvoice(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Body() body: {
      customerId?: string;
      cashierId?: string;
      items: Array<{
        itemId: string;
        itemType: "SERVICE" | "PRODUCT" | "PACKAGE";
        staffId?: string;
        price: number;
        quantity: number;
        discountAmount?: number;
      }>;
      discountAmount?: number;
      paymentMethod?: string;
      paymentStatus?: string;
      note?: string;
    }
  ) {
    try {
      const { customerId, cashierId, items, discountAmount = 0, paymentMethod = "CASH", paymentStatus = "PAID", note } = body;

      if (!items || items.length === 0) {
        throw new HttpException("Danh sách mặt hàng thanh toán không được trống", HttpStatus.BAD_REQUEST);
      }

      // Calculate totals
      let totalPrice = 0;
      const invoiceItemsData: Array<{
        itemId: string;
        itemType: string;
        staffId: string | null;
        price: number;
        quantity: number;
        totalPrice: number;
        discountAmount: number;
        finalAmount: number;
        employeeCommission: number;
      }> = [];

      for (const item of items) {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = item.discountAmount || 0;
        const itemFinal = itemTotal - itemDiscount;
        totalPrice += itemTotal;

        // Calculate stylized employee commission:
        // - Service: 15% of final amount
        // - Package: 10% of final amount
        // - Product: Flat 10,000 VND per quantity
        let commission = 0;
        if (item.itemType === "SERVICE") {
          commission = Math.round(itemFinal * 0.15);
        } else if (item.itemType === "PACKAGE") {
          commission = Math.round(itemFinal * 0.10);
        } else if (item.itemType === "PRODUCT") {
          commission = 10000 * item.quantity;
        }

        invoiceItemsData.push({
          itemId: item.itemId,
          itemType: item.itemType,
          staffId: item.staffId || null,
          price: item.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
          discountAmount: itemDiscount,
          finalAmount: itemFinal,
          employeeCommission: commission
        });
      }

      const finalAmount = Math.max(0, totalPrice - discountAmount);

      const isUuid = (str?: string) => {
        if (!str) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      const dbCustomerId = isUuid(customerId) ? customerId : null;

      // Save Invoice and items in transaction
      const savedInvoice = await prisma.$transaction(async (tx) => {
        const inv = await tx.invoice.create({
          data: {
            tenantId,
            branchId,
            customerId: dbCustomerId,
            staffId: cashierId || null,
            totalPrice,
            discountAmount,
            finalAmount,
            paymentMethod,
            paymentStatus,
            status: "COMPLETED",
            note
          }
        });

        // 1. Bulk create invoice items
        if (invoiceItemsData.length > 0) {
          await tx.invoiceItem.createMany({
            data: invoiceItemsData.map((itData) => ({
              invoiceId: inv.id,
              ...itData
            }))
          });
        }

        // 2. Increment staff daily turn served customer count in bulk
        const staffIdsForTurns = Array.from(
          new Set(invoiceItemsData.map((it) => it.staffId).filter(Boolean))
        ) as string[];

        if (staffIdsForTurns.length > 0) {
          const localTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
          const todayStr = localTime.toISOString().split("T")[0];
          const targetDate = new Date(todayStr + "T00:00:00.000Z");

          // Bulk find turns for all assigned staff today
          const turns = await tx.employeeDailyTurn.findMany({
            where: {
              tenantId,
              branchId,
              staffId: { in: staffIdsForTurns },
              workDate: targetDate,
              deletedAt: null
            }
          });

          // Calculate total quantity per staffId in-memory
          const qtyPerStaff = new Map<string, number>();
          for (const itData of invoiceItemsData) {
            if (itData.staffId) {
              qtyPerStaff.set(
                itData.staffId,
                (qtyPerStaff.get(itData.staffId) || 0) + itData.quantity
              );
            }
          }

          // Update turns in parallel
          const updatePromises = turns.map((turn) => {
            const qty = qtyPerStaff.get(turn.staffId) || 0;
            return tx.employeeDailyTurn.update({
              where: { id: turn.id },
              data: {
                totalCustomersToday: turn.totalCustomersToday + qty,
                updatedAt: new Date()
              }
            });
          });

          await Promise.all(updatePromises);
        }

        return inv;
      });

      return await prisma.invoice.findUnique({
        where: { id: savedInvoice.id },
        include: {
          items: true,
          customer: true,
          cashier: true
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to perform checkout: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
