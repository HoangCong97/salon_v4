import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

// Helper function to get local today's date at midnight UTC
function getLocalTodayUtc(customDate?: string): Date {
  if (customDate) {
    return new Date(customDate + "T00:00:00.000Z");
  }
  // Asia/Ho_Chi_Minh offset is UTC+7
  const localTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
  const todayStr = localTime.toISOString().split("T")[0];
  return new Date(todayStr + "T00:00:00.000Z");
}

@Controller("api/tenants/:tenantId/branches/:branchId/daily-turns")
export class TurnsController {

  // 1. GET QUEUE OF DAILY TURNS (AUTO-INITIALIZE IF EMPTY)
  @Get()
  async getDailyTurns(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Query("date") dateParam?: string
  ) {
    try {
      const targetDate = getLocalTodayUtc(dateParam);

      // Auto-initialization process:
      // 1. Load staff scheduled for this branch today (shifts not OFF)
      const scheduledShifts = await prisma.employeeShift.findMany({
        where: {
          tenantId,
          branchId,
          workDate: targetDate,
          isOff: false,
          deletedAt: null
        },
        select: {
          staffId: true
        }
      });

      let staffIds = scheduledShifts.map(s => s.staffId);

      // 2. Fallback: If no shifts scheduled, load all active staff assigned to this branch
      if (staffIds.length === 0) {
        const branchStaff = await prisma.user.findMany({
          where: {
            tenantId,
            deletedAt: null,
            userBranches: {
              some: {
                branchId,
                deletedAt: null
              }
            }
          },
          select: {
            id: true
          }
        });
        staffIds = branchStaff.map(s => s.id);
      }

      // 3. For each staff, ensure EmployeeDailyTurn record exists for targetDate (Optimized)
      const existingTurns = await prisma.employeeDailyTurn.findMany({
        where: {
          tenantId,
          branchId,
          staffId: { in: staffIds },
          workDate: targetDate,
          deletedAt: null
        },
        select: {
          staffId: true
        }
      });

      const existingStaffIds = new Set(existingTurns.map((t) => t.staffId));
      const missingStaffIds = staffIds.filter((id) => !existingStaffIds.has(id));

      if (missingStaffIds.length > 0) {
        await prisma.employeeDailyTurn.createMany({
          data: missingStaffIds.map((staffId) => ({
            tenantId,
            branchId,
            staffId,
            workDate: targetDate,
            totalWalkinCount: 0,
            totalBookedCount: 0,
            totalCustomersToday: 0
          })),
          skipDuplicates: true
        });
      }

      // 4. Fetch all turns records
      const turns = await prisma.employeeDailyTurn.findMany({
        where: {
          tenantId,
          branchId,
          workDate: targetDate,
          deletedAt: null
        },
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      // 5. Apply the standard queue sorting algorithm:
      // Primary: totalWalkinCount ASC (fewest turns first)
      // Secondary: lastAssignedAt ASC (longest waiting thợ first, nulls first)
      // Tertiary: staff name alphabetical
      turns.sort((a, b) => {
        if (a.totalWalkinCount !== b.totalWalkinCount) {
          return a.totalWalkinCount - b.totalWalkinCount;
        }
        
        if (!a.lastAssignedAt && b.lastAssignedAt) return -1;
        if (a.lastAssignedAt && !b.lastAssignedAt) return 1;
        if (a.lastAssignedAt && b.lastAssignedAt) {
          return new Date(a.lastAssignedAt).getTime() - new Date(b.lastAssignedAt).getTime();
        }

        return a.staff.name.localeCompare(b.staff.name);
      });

      return turns.map((t, idx) => ({
        id: t.id,
        queueNumber: idx + 1,
        staffId: t.staffId,
        staffName: t.staff.name,
        role: t.staff.role ? t.staff.role.name : "Employee",
        totalWalkinCount: t.totalWalkinCount,
        totalBookedCount: t.totalBookedCount,
        totalCustomersToday: t.totalCustomersToday,
        lastAssignedAt: t.lastAssignedAt ? t.lastAssignedAt.toISOString() : null
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch turns queue: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. ASSIGN CUSTOMER TURN (WALK-IN OR BOOKED)
  @Post("assign")
  async assignTurn(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Body() body: {
      staffId: string;
      turnType: "walkin" | "booked";
      date?: string;
    }
  ) {
    try {
      const { staffId, turnType, date } = body;
      if (!staffId || !turnType) {
        throw new HttpException("staffId và turnType là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      const targetDate = getLocalTodayUtc(date);

      // Find turn record
      const existing = await prisma.employeeDailyTurn.findFirst({
        where: {
          tenantId,
          branchId,
          staffId,
          workDate: targetDate,
          deletedAt: null
        }
      });

      if (!existing) {
        throw new HttpException("Không tìm thấy hàng đợi xoay tua của nhân viên hôm nay", HttpStatus.NOT_FOUND);
      }

      // Prepare updates
      const updatedWalkin = existing.totalWalkinCount + (turnType === "walkin" ? 1 : 0);
      const updatedBooked = existing.totalBookedCount + (turnType === "booked" ? 1 : 0);
      const totalCustomers = updatedWalkin + updatedBooked;

      return await prisma.employeeDailyTurn.update({
        where: { id: existing.id },
        data: {
          totalWalkinCount: updatedWalkin,
          totalBookedCount: updatedBooked,
          totalCustomersToday: totalCustomers,
          lastAssignedAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to assign turn: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. ADJUST TURN COUNT MANUALLY (MANAGER OVERRIDE)
  @Put(":staffId")
  async adjustTurnManually(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Param("staffId") staffId: string,
    @Body() body: {
      totalWalkinCount: number;
      totalBookedCount: number;
      date?: string;
    }
  ) {
    try {
      const { totalWalkinCount, totalBookedCount, date } = body;
      
      if (totalWalkinCount === undefined || totalBookedCount === undefined) {
        throw new HttpException("totalWalkinCount và totalBookedCount là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      const targetDate = getLocalTodayUtc(date);

      const existing = await prisma.employeeDailyTurn.findFirst({
        where: {
          tenantId,
          branchId,
          staffId,
          workDate: targetDate,
          deletedAt: null
        }
      });

      if (!existing) {
        throw new HttpException("Không tìm thấy hàng đợi của nhân viên này", HttpStatus.NOT_FOUND);
      }

      return await prisma.employeeDailyTurn.update({
        where: { id: existing.id },
        data: {
          totalWalkinCount,
          totalBookedCount,
          totalCustomersToday: totalWalkinCount + totalBookedCount,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to adjust turns count: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. RESET ALL SHIFTS TODAY TO 0
  @Post("reset")
  async resetQueue(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Body() body: { date?: string }
  ) {
    try {
      const targetDate = getLocalTodayUtc(body.date);

      await prisma.employeeDailyTurn.updateMany({
        where: {
          tenantId,
          branchId,
          workDate: targetDate,
          deletedAt: null
        },
        data: {
          totalWalkinCount: 0,
          totalBookedCount: 0,
          totalCustomersToday: 0,
          lastAssignedAt: null,
          updatedAt: new Date()
        }
      });

      return { success: true, message: "Hàng đợi đã được khởi động lại về 0" };
    } catch (error) {
      throw new HttpException(
        `Failed to reset queue: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 5. MANUALLY ADD STAFF TO DAILY QUEUE (FOR EXTRA WORK/COVERING)
  @Post("add-staff")
  async addStaffToQueue(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Body() body: {
      staffId: string;
      date?: string;
    }
  ) {
    try {
      const { staffId, date } = body;
      if (!staffId) {
        throw new HttpException("staffId là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      const targetDate = getLocalTodayUtc(date);

      // Check if user is already in the queue
      const existing = await prisma.employeeDailyTurn.findFirst({
        where: {
          tenantId,
          branchId,
          staffId,
          workDate: targetDate,
          deletedAt: null
        }
      });

      if (existing) {
        throw new HttpException("Nhân viên này đã có sẵn trong hàng đợi ngày hôm nay", HttpStatus.CONFLICT);
      }

      // Add to queue
      const newTurn = await prisma.employeeDailyTurn.create({
        data: {
          tenantId,
          branchId,
          staffId,
          workDate: targetDate,
          totalWalkinCount: 0,
          totalBookedCount: 0,
          totalCustomersToday: 0
        }
      });

      return newTurn;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to add staff to queue: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
