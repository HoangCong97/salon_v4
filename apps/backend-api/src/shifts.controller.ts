import { Controller, Get, Post, Body, Param, Query, Headers, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";
import { NotificationGateway } from "./notification.gateway";

@Controller("api/tenants/:tenantId")
export class ShiftsController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  // 1. GET ALL SHIFTS FOR A BRANCH IN DATE RANGE
  @Get("branches/:branchId/shifts")
  async getBranchShifts(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException("startDate và endDate là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      const shifts = await prisma.employeeShift.findMany({
        where: {
          tenantId,
          branchId,
          workDate: {
            gte: new Date(startDate + "T00:00:00.000Z"),
            lte: new Date(endDate + "T23:59:59.999Z")
          },
          deletedAt: null
        },
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          workDate: "asc"
        }
      });

      return shifts.map(s => ({
        id: s.id,
        staffId: s.staffId,
        staffName: s.staff.name,
        workDate: s.workDate.toISOString().split("T")[0],
        shiftName: s.shiftName || "",
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        isOff: s.isOff
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch shifts: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. GET ALL STAFF OF A BRANCH (Used to populate scheduling rows)
  @Get("branches/:branchId/shifts/staff")
  async getBranchStaffForShifts(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string
  ) {
    try {
      const staffList = await prisma.user.findMany({
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
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      });

      return staffList.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role ? user.role.name : "Employee"
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch staff: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. BULK SAVE SHIFTS
  @Post("branches/:branchId/shifts/bulk")
  async bulkSaveShifts(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Headers("x-user-id") senderId: string,
    @Body() body: {
      shifts: Array<{
        id?: string;
        staffId: string;
        workDate: string; // YYYY-MM-DD
        shiftName?: string;
        startTime?: string;
        endTime?: string;
        isOff: boolean;
        clear?: boolean; // If true, deletes/clears this shift
      }>;
    }
  ) {
    try {
      const { shifts } = body;
      if (!Array.isArray(shifts)) {
        throw new HttpException("shifts must be an array", HttpStatus.BAD_REQUEST);
      }

      if (shifts.length === 0) {
        return { success: true, count: 0 };
      }

      const staffIds = Array.from(new Set(shifts.map((s) => s.staffId)));
      const dates = shifts.map((s) => new Date(s.workDate + "T00:00:00.000Z"));
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
      maxDate.setUTCHours(23, 59, 59, 999);

      const shiftIds = shifts.map((s) => s.id).filter(Boolean) as string[];

      // 1. Bulk query existing shifts for the given IDs or staff/date combinations
      const existingShifts = await prisma.employeeShift.findMany({
        where: {
          tenantId,
          branchId,
          OR: [
            { id: { in: shiftIds } },
            {
              staffId: { in: staffIds },
              workDate: {
                gte: minDate,
                lte: maxDate
              }
            }
          ],
          deletedAt: null
        }
      });

      const findExisting = (s: typeof shifts[0]) => {
        if (s.id) {
          return existingShifts.find((es) => es.id === s.id);
        }
        const utcDate = new Date(s.workDate + "T00:00:00.000Z");
        return existingShifts.find(
          (es) =>
            es.staffId === s.staffId &&
            es.workDate.getTime() === utcDate.getTime()
        );
      };

      // 2. Perform updates, creates, and soft deletes in parallel
      const operations = shifts.map(async (s) => {
        const utcDate = new Date(s.workDate + "T00:00:00.000Z");
        const isCleared = s.clear || (!s.isOff && !s.shiftName && !s.startTime && !s.endTime);
        const existing = findExisting(s);

        if (isCleared) {
          if (existing) {
            return prisma.employeeShift.update({
              where: { id: existing.id },
              data: { deletedAt: new Date() }
            });
          }
          return null;
        }

        if (existing) {
          return prisma.employeeShift.update({
            where: { id: existing.id },
            data: {
              shiftName: s.shiftName || null,
              startTime: s.startTime || null,
              endTime: s.endTime || null,
              isOff: s.isOff,
              updatedAt: new Date()
            }
          });
        } else {
          return prisma.employeeShift.create({
            data: {
              tenantId,
              branchId,
              staffId: s.staffId,
              workDate: utcDate,
              shiftName: s.shiftName || null,
              startTime: s.startTime || null,
              endTime: s.endTime || null,
              isOff: s.isOff
            }
          });
        }
      });

      const rawResults = await Promise.all(operations);
      const results = rawResults.filter((r) => r !== null);

      this.notificationGateway.broadcastToTenant(tenantId, "shifts.updated", { branchId, senderId });

      return { success: true, count: results.length };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to save shifts: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. GET PERSONAL SHIFTS OF AN EMPLOYEE
  @Get("staff/:staffId/shifts")
  async getPersonalShifts(
    @Param("tenantId") tenantId: string,
    @Param("staffId") staffId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException("startDate và endDate là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      const shifts = await prisma.employeeShift.findMany({
        where: {
          tenantId,
          staffId,
          workDate: {
            gte: new Date(startDate + "T00:00:00.000Z"),
            lte: new Date(endDate + "T23:59:59.999Z")
          },
          deletedAt: null
        },
        orderBy: {
          workDate: "asc"
        }
      });

      return shifts.map(s => ({
        id: s.id,
        workDate: s.workDate.toISOString().split("T")[0],
        shiftName: s.shiftName || "",
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        isOff: s.isOff
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch personal shifts: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
