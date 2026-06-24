import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId")
export class ShiftsController {

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

      const results = [];

      for (const s of shifts) {
        const utcDate = new Date(s.workDate + "T00:00:00.000Z");

        // Check if we should clear/delete this shift
        const isCleared = s.clear || (!s.isOff && !s.shiftName && !s.startTime && !s.endTime);

        // Find existing shift
        let existing = null;
        if (s.id) {
          existing = await prisma.employeeShift.findFirst({
            where: { id: s.id, tenantId, branchId, deletedAt: null }
          });
        } else {
          existing = await prisma.employeeShift.findFirst({
            where: {
              tenantId,
              branchId,
              staffId: s.staffId,
              workDate: utcDate,
              deletedAt: null
            }
          });
        }

        if (isCleared) {
          // If exists, soft delete it
          if (existing) {
            await prisma.employeeShift.update({
              where: { id: existing.id },
              data: { deletedAt: new Date() }
            });
          }
          continue;
        }

        if (existing) {
          // Update
          const updated = await prisma.employeeShift.update({
            where: { id: existing.id },
            data: {
              shiftName: s.shiftName || null,
              startTime: s.startTime || null,
              endTime: s.endTime || null,
              isOff: s.isOff,
              updatedAt: new Date()
            }
          });
          results.push(updated);
        } else {
          // Create
          const created = await prisma.employeeShift.create({
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
          results.push(created);
        }
      }

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
