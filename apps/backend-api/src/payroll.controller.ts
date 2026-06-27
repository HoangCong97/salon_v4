import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/payrolls")
export class PayrollController {

  // 1. GET ALL PAYROLLS FOR A PERIOD
  @Get()
  async getPayrolls(
    @Param("tenantId") tenantId: string,
    @Query("period") period: string, // YYYY-MM
    @Query("branchId") branchId?: string
  ) {
    try {
      if (!period) {
        throw new HttpException("period (YYYY-MM) is required", HttpStatus.BAD_REQUEST);
      }

      const payrolls = await prisma.employeeMonthlyPayroll.findMany({
        where: {
          tenantId,
          branchId: branchId || undefined,
          salaryPeriod: period,
          deletedAt: null
        },
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return payrolls.map(p => ({
        id: p.id,
        tenantId: p.tenantId,
        branchId: p.branchId,
        staffId: p.staffId,
        salaryPeriod: p.salaryPeriod,
        baseSalary: Number(p.baseSalary),
        allowance: Number(p.allowance || 0),
        commissionAmount: Number(p.commissionAmount || 0),
        tipAmount: Number(p.tipAmount || 0),
        deductionAmount: Number(p.deductionAmount || 0),
        finalSalary: Number(p.finalSalary),
        status: p.status,
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        staff: p.staff
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch payrolls: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. GENERATE DRAFT PAYROLL FOR PERIOD
  @Post("generate")
  async generatePayroll(
    @Param("tenantId") tenantId: string,
    @Body() body: { period: string; branchId: string }
  ) {
    try {
      const { period, branchId } = body;
      if (!period || !branchId) {
        throw new HttpException("period and branchId are required", HttpStatus.BAD_REQUEST);
      }

      // Fetch all staff members assigned to this branch
      const userBranches = await prisma.userBranch.findMany({
        where: {
          branchId,
          deletedAt: null,
          user: {
            tenantId,
            deletedAt: null,
            status: "ACTIVE"
          }
        },
        include: {
          user: true
        }
      });

      const staffMembers = userBranches.map(ub => ub.user);
      const generated = [];

      // Period dates for advance lookup
      const [yearStr, monthStr] = period.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      for (const staff of staffMembers) {
        // Check if payroll already exists for this branch/staff/period
        const existing = await prisma.employeeMonthlyPayroll.findFirst({
          where: {
            tenantId,
            branchId,
            staffId: staff.id,
            salaryPeriod: period,
            deletedAt: null
          }
        });

        if (existing) {
          generated.push(existing);
          continue;
        }

        // Sum approved salary advances in this period
        const advances = await prisma.salaryAdvance.findMany({
          where: {
            tenantId,
            branchId,
            staffId: staff.id,
            advanceDate: {
              gte: startDate,
              lte: endDate
            },
            status: "APPROVED",
            deletedAt: null
          }
        });

        const totalAdvances = advances.reduce((sum, adv) => sum + Number(adv.amount), 0);

        // Fetch commissions (calculated from invoice items where this stylist is assigned, paid/completed in this period)
        const invoiceItems = await prisma.invoiceItem.findMany({
          where: {
            staffId: staff.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            invoice: {
              paymentStatus: "PAID",
              deletedAt: null
            }
          }
        });
        const totalCommissions = invoiceItems.reduce((sum, item) => sum + Number(item.employeeCommission || 0), 0);

        const baseSalary = Number(staff.baseSalary || 0);
        const finalSalary = baseSalary + totalCommissions - totalAdvances;

        const newPayroll = await prisma.employeeMonthlyPayroll.create({
          data: {
            tenantId,
            branchId,
            staffId: staff.id,
            salaryPeriod: period,
            baseSalary,
            allowance: 0,
            commissionAmount: totalCommissions,
            tipAmount: 0,
            deductionAmount: totalAdvances,
            finalSalary: finalSalary > 0 ? finalSalary : 0,
            status: "DRAFT"
          }
        });

        generated.push(newPayroll);
      }

      return generated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to generate payroll: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. BULK UPDATE PAYROLLS (Auto-save in grid table)
  @Put("bulk")
  async bulkUpdatePayrolls(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      payrolls: Array<{
        id: string;
        baseSalary: number;
        allowance: number;
        commissionAmount: number;
        tipAmount: number;
        deductionAmount: number;
        status: string;
      }>
    }
  ) {
    try {
      const { payrolls } = body;
      if (!Array.isArray(payrolls)) {
        throw new HttpException("payrolls must be an array", HttpStatus.BAD_REQUEST);
      }

      const updated = [];
      for (const p of payrolls) {
        const finalSalary = Number(p.baseSalary) + Number(p.allowance) + Number(p.commissionAmount) + Number(p.tipAmount) - Number(p.deductionAmount);
        
        const up = await prisma.employeeMonthlyPayroll.update({
          where: { id: p.id },
          data: {
            baseSalary: p.baseSalary,
            allowance: p.allowance,
            commissionAmount: p.commissionAmount,
            tipAmount: p.tipAmount,
            deductionAmount: p.deductionAmount,
            finalSalary: finalSalary > 0 ? finalSalary : 0,
            status: p.status,
            paidAt: p.status === "PAID" ? new Date() : null,
            updatedAt: new Date()
          }
        });
        updated.push(up);
      }

      return { success: true, updatedCount: updated.length };
    } catch (error) {
      throw new HttpException(
        `Failed to bulk update payrolls: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. UPDATE SINGLE PAYROLL RECORD
  @Put(":id")
  async updatePayroll(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      baseSalary?: number;
      allowance?: number;
      commissionAmount?: number;
      tipAmount?: number;
      deductionAmount?: number;
      status?: string;
    }
  ) {
    try {
      const existing = await prisma.employeeMonthlyPayroll.findUnique({
        where: { id }
      });

      if (!existing || existing.tenantId !== tenantId) {
        throw new HttpException("Payroll record not found", HttpStatus.NOT_FOUND);
      }

      const baseSalary = body.baseSalary !== undefined ? Number(body.baseSalary) : Number(existing.baseSalary);
      const allowance = body.allowance !== undefined ? Number(body.allowance) : Number(existing.allowance || 0);
      const commissionAmount = body.commissionAmount !== undefined ? Number(body.commissionAmount) : Number(existing.commissionAmount || 0);
      const tipAmount = body.tipAmount !== undefined ? Number(body.tipAmount) : Number(existing.tipAmount || 0);
      const deductionAmount = body.deductionAmount !== undefined ? Number(body.deductionAmount) : Number(existing.deductionAmount || 0);
      
      const finalSalary = baseSalary + allowance + commissionAmount + tipAmount - deductionAmount;
      const status = body.status || existing.status;
      const paidAt = status === "PAID" ? (existing.status === "PAID" ? existing.paidAt : new Date()) : null;

      return await prisma.employeeMonthlyPayroll.update({
        where: { id },
        data: {
          baseSalary,
          allowance,
          commissionAmount,
          tipAmount,
          deductionAmount,
          finalSalary: finalSalary > 0 ? finalSalary : 0,
          status,
          paidAt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update payroll: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 5. GET SALARY ADVANCES
  @Get("advances")
  async getAdvances(
    @Param("tenantId") tenantId: string,
    @Query("branchId") branchId?: string
  ) {
    try {
      const advances = await prisma.salaryAdvance.findMany({
        where: {
          tenantId,
          branchId: branchId || undefined,
          deletedAt: null
        },
        include: {
          staff: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          }
        },
        orderBy: {
          advanceDate: "desc"
        }
      });

      return advances.map(a => ({
        id: a.id,
        tenantId: a.tenantId,
        branchId: a.branchId,
        staffId: a.staffId,
        advanceDate: a.advanceDate.toISOString(),
        amount: Number(a.amount),
        status: a.status,
        note: a.note,
        staff: a.staff
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch advances: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 6. CREATE SALARY ADVANCE
  @Post("advances")
  async createAdvance(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      branchId: string;
      staffId: string;
      advanceDate: string; // YYYY-MM-DD
      amount: number;
      status?: string;
      note?: string;
    }
  ) {
    try {
      const { branchId, staffId, advanceDate, amount, status, note } = body;
      if (!branchId || !staffId || !advanceDate || !amount) {
        throw new HttpException("Missing required fields", HttpStatus.BAD_REQUEST);
      }

      const advance = await prisma.salaryAdvance.create({
        data: {
          tenantId,
          branchId,
          staffId,
          advanceDate: new Date(advanceDate),
          amount,
          status: status || "PENDING",
          note: note || null
        },
        include: {
          staff: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          }
        }
      });

      return {
        ...advance,
        amount: Number(advance.amount),
        advanceDate: advance.advanceDate.toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create advance: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 7. UPDATE SALARY ADVANCE
  @Put("advances/:id")
  async updateAdvance(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      amount?: number;
      status?: string;
      note?: string;
      advanceDate?: string;
    }
  ) {
    try {
      const existing = await prisma.salaryAdvance.findUnique({
        where: { id }
      });

      if (!existing || existing.tenantId !== tenantId) {
        throw new HttpException("Advance record not found", HttpStatus.NOT_FOUND);
      }

      const updated = await prisma.salaryAdvance.update({
        where: { id },
        data: {
          amount: body.amount !== undefined ? body.amount : existing.amount,
          status: body.status || existing.status,
          note: body.note !== undefined ? body.note : existing.note,
          advanceDate: body.advanceDate ? new Date(body.advanceDate) : existing.advanceDate,
          updatedAt: new Date()
        },
        include: {
          staff: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          }
        }
      });

      return {
        ...updated,
        amount: Number(updated.amount),
        advanceDate: updated.advanceDate.toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update advance: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 8. DELETE SALARY ADVANCE (SOFT DELETE)
  @Delete("advances/:id")
  async deleteAdvance(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      const existing = await prisma.salaryAdvance.findUnique({
        where: { id }
      });

      if (!existing || existing.tenantId !== tenantId) {
        throw new HttpException("Advance record not found", HttpStatus.NOT_FOUND);
      }

      await prisma.salaryAdvance.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete advance: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 9. GET ATTENDANCE ANOMALIES
  @Get("attendances")
  async getAttendances(
    @Param("tenantId") tenantId: string,
    @Query("branchId") branchId?: string
  ) {
    try {
      const attendances = await prisma.employeeAttendance.findMany({
        where: {
          tenantId,
          branchId: branchId || undefined,
          workStatus: { not: "PRESENT" },
          deletedAt: null
        },
        include: {
          staff: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          }
        },
        orderBy: {
          workDate: "desc"
        }
      });

      return attendances.map(a => ({
        id: a.id,
        tenantId: a.tenantId,
        branchId: a.branchId,
        staffId: a.staffId,
        workDate: a.workDate.toISOString(),
        checkInAt: a.checkInAt ? a.checkInAt.toISOString() : null,
        checkOutAt: a.checkOutAt ? a.checkOutAt.toISOString() : null,
        workStatus: a.workStatus,
        lateMinutes: a.lateMinutes,
        overTimeMinutes: a.overTimeMinutes,
        note: a.note,
        staff: a.staff
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch attendances: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 10. CREATE / UPDATE ATTENDANCE ANOMALY
  @Post("attendances")
  async saveAttendanceAnomaly(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      id?: string;
      branchId: string;
      staffId: string;
      workDate: string; // YYYY-MM-DD
      workStatus: string; // ABSENT, LATE, HALFDAY, etc.
      lateMinutes?: number;
      note?: string;
    }
  ) {
    try {
      const { id, branchId, staffId, workDate, workStatus, lateMinutes, note } = body;
      if (!branchId || !staffId || !workDate || !workStatus) {
        throw new HttpException("Missing required fields", HttpStatus.BAD_REQUEST);
      }

      const dateObj = new Date(workDate);

      // Check if anomaly already exists for staff/date
      let attendance;
      if (id) {
        attendance = await prisma.employeeAttendance.update({
          where: { id },
          data: {
            workStatus,
            lateMinutes: lateMinutes || 0,
            note: note || null,
            updatedAt: new Date()
          },
          include: {
            staff: {
              select: { id: true, name: true, email: true, phone: true, avatar: true }
            }
          }
        });
      } else {
        const existing = await prisma.employeeAttendance.findFirst({
          where: {
            tenantId,
            branchId,
            staffId,
            workDate: dateObj,
            deletedAt: null
          }
        });

        if (existing) {
          attendance = await prisma.employeeAttendance.update({
            where: { id: existing.id },
            data: {
              workStatus,
              lateMinutes: lateMinutes || 0,
              note: note || null,
              updatedAt: new Date()
            },
            include: {
              staff: {
                select: { id: true, name: true, email: true, phone: true, avatar: true }
              }
            }
          });
        } else {
          attendance = await prisma.employeeAttendance.create({
            data: {
              tenantId,
              branchId,
              staffId,
              workDate: dateObj,
              workStatus,
              lateMinutes: lateMinutes || 0,
              note: note || null
            },
            include: {
              staff: {
                select: { id: true, name: true, email: true, phone: true, avatar: true }
              }
            }
          });
        }
      }

      return {
        ...attendance,
        workDate: attendance.workDate.toISOString(),
        checkInAt: attendance.checkInAt ? attendance.checkInAt.toISOString() : null,
        checkOutAt: attendance.checkOutAt ? attendance.checkOutAt.toISOString() : null
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to save attendance: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 11. DELETE ATTENDANCE ANOMALY (SOFT DELETE)
  @Delete("attendances/:id")
  async deleteAttendance(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      const existing = await prisma.employeeAttendance.findUnique({
        where: { id }
      });

      if (!existing || existing.tenantId !== tenantId) {
        throw new HttpException("Attendance record not found", HttpStatus.NOT_FOUND);
      }

      await prisma.employeeAttendance.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete attendance: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
