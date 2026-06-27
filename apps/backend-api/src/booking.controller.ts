import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

/**
 * BookingController — API for Appointments page
 * 
 * Handles CRUD operations for bookings + booking details.
 * GET returns data in ServiceItem[] format expected by the frontend grid.
 */
@Controller("api/tenants/:tenantId/bookings")
export class BookingController {

  // ─── Helper: format Date to "HH:mm" in Vietnam timezone ────────────────────
  private toVN(d: Date): Date {
    return new Date(d.getTime() + 7 * 60 * 60 * 1000);
  }

  private fmtTime(d: Date): string {
    const vn = this.toVN(d);
    return `${String(vn.getUTCHours()).padStart(2, "0")}:${String(vn.getUTCMinutes()).padStart(2, "0")}`;
  }

  // ─── Helper: format Date to "yyyy-MM-dd" in Vietnam timezone ──────────────
  private fmtDate(d: Date): string {
    const vn = this.toVN(d);
    const y = vn.getUTCFullYear();
    const m = String(vn.getUTCMonth() + 1).padStart(2, "0");
    const day = String(vn.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // ─── Helper: parse "HH:mm" + "yyyy-MM-dd" to Date ────────────────────────────
  private parseDateTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00+07:00`);
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET /api/tenants/:tenantId/bookings?branchId=...&date=yyyy-MM-dd
  // Returns ServiceItem[] for the frontend calendar grid
  // ════════════════════════════════════════════════════════════════════════════════
  @Get()
  async getBookings(
    @Param("tenantId") tenantId: string,
    @Query("branchId") branchId: string,
    @Query("date") date: string // yyyy-MM-dd
  ) {
    try {
      if (!branchId || !date) {
        throw new HttpException("branchId and date are required", HttpStatus.BAD_REQUEST);
      }

      // Build date range for the query day (in Vietnam timezone UTC+7)
      const dayStart = new Date(`${date}T00:00:00+07:00`);
      const dayEnd = new Date(`${date}T23:59:59+07:00`);

      const bookings = await prisma.booking.findMany({
        where: {
          tenantId,
          branchId,
          deletedAt: null,
          startTime: { gte: dayStart, lte: dayEnd },
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          bookingDetails: {
            where: { deletedAt: null },
            include: {
              service: { select: { id: true, name: true, duration: true, price: true } },
              staff: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startTime: "asc" },
      });

      // Transform to ServiceItem[] format expected by frontend
      const items = bookings.flatMap(booking => {
        const custName = booking.customer?.name ?? booking.customerName ?? "Khách vãng lai";
        const custPhone = booking.customer?.phone ?? booking.customerPhone ?? undefined;

        return booking.bookingDetails.map(detail => ({
          id: detail.id,
          groupId: booking.id,
          customerName: custName,
          customerPhone: custPhone,
          service: {
            id: detail.service.id,
            name: detail.service.name,
            duration: detail.duration ?? detail.service.duration ?? 30,
            price: Number(detail.service.price),
          },
          staffId: detail.staffId ?? "",
          startTime: this.fmtTime(detail.startTime ?? booking.startTime),
          date: this.fmtDate(booking.startTime),
          status: detail.status ?? booking.status,
          source: booking.source ?? "WALK_IN",
          note: booking.note ?? undefined,
        }));
      });

      return items;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch bookings: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // POST /api/tenants/:tenantId/bookings
  // Create a new booking with details
  // ════════════════════════════════════════════════════════════════════════════════
  @Post()
  async createBooking(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      branchId: string;
      customerId?: string;
      customerName?: string;
      customerPhone?: string;
      source?: string;
      note?: string;
      date: string; // yyyy-MM-dd
      details: Array<{
        serviceId: string;
        staffId?: string;
        startTime: string; // HH:mm
        duration?: number;
        status?: string;
      }>;
    }
  ) {
    try {
      const { branchId, customerId, customerName, customerPhone, source, note, date, details } = body;

      if (!branchId || !date || !details?.length) {
        throw new HttpException("branchId, date, and at least one detail are required", HttpStatus.BAD_REQUEST);
      }

      // Compute booking startTime/endTime from details
      const times = details.map(d => this.parseDateTime(date, d.startTime));
      const bookingStart = new Date(Math.min(...times.map(t => t.getTime())));

      // Fetch service durations to compute end time
      const serviceIds = details.map(d => d.serviceId);
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, duration: true },
      });
      const serviceDurationMap = new Map(services.map(s => [s.id, s.duration ?? 30]));

      const latestEnd = Math.max(...details.map(d => {
        const start = this.parseDateTime(date, d.startTime).getTime();
        const dur = d.duration ?? serviceDurationMap.get(d.serviceId) ?? 30;
        return start + dur * 60 * 1000;
      }));
      const bookingEnd = new Date(latestEnd);

      const booking = await prisma.booking.create({
        data: {
          tenantId,
          branchId,
          customerId: customerId || null,
          customerName: customerId ? null : (customerName || null),
          customerPhone: customerId ? null : (customerPhone || null),
          startTime: bookingStart,
          endTime: bookingEnd,
          status: "PENDING",
          source: source || "WALK_IN",
          note: note || null,
          bookingDetails: {
            create: details.map(d => ({
              serviceId: d.serviceId,
              staffId: d.staffId || null,
              startTime: this.parseDateTime(date, d.startTime),
              duration: d.duration || null,
              status: d.status || "PENDING",
            })),
          },
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          bookingDetails: {
            include: {
              service: { select: { id: true, name: true, duration: true, price: true } },
              staff: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Return in ServiceItem[] format
      const custName = booking.customer?.name ?? booking.customerName ?? "Khách vãng lai";
      const custPhone = booking.customer?.phone ?? booking.customerPhone ?? undefined;

      return booking.bookingDetails.map(detail => ({
        id: detail.id,
        groupId: booking.id,
        customerName: custName,
        customerPhone: custPhone,
        service: {
          id: detail.service.id,
          name: detail.service.name,
          duration: detail.duration ?? detail.service.duration ?? 30,
          price: Number(detail.service.price),
        },
        staffId: detail.staffId ?? "",
        startTime: this.fmtTime(detail.startTime ?? booking.startTime),
        date,
        status: detail.status ?? booking.status,
        source: booking.source ?? "WALK_IN",
        note: booking.note ?? undefined,
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create booking: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // PUT /api/tenants/:tenantId/bookings/:detailId/assign
  // Update staffId and/or startTime when drag-dropping a card
  // ════════════════════════════════════════════════════════════════════════════════
  @Put(":detailId/assign")
  async assignDetail(
    @Param("tenantId") tenantId: string,
    @Param("detailId") detailId: string,
    @Body() body: { staffId?: string; startTime?: string; date?: string }
  ) {
    try {
      const updateData: any = {};
      if (body.staffId !== undefined) {
        updateData.staffId = body.staffId || null;
      }
      if (body.startTime && body.date) {
        updateData.startTime = this.parseDateTime(body.date, body.startTime);
      }

      const detail = await prisma.bookingDetail.update({
        where: { id: detailId },
        data: updateData,
        include: {
          booking: { select: { tenantId: true } },
        },
      });

      // Verify tenant ownership
      if (detail.booking.tenantId !== tenantId) {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }

      return { success: true, id: detail.id };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to assign: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // PUT /api/tenants/:tenantId/bookings/:detailId/resize
  // Update duration when resizing a card
  // ════════════════════════════════════════════════════════════════════════════════
  @Put(":detailId/resize")
  async resizeDetail(
    @Param("tenantId") tenantId: string,
    @Param("detailId") detailId: string,
    @Body() body: { duration: number }
  ) {
    try {
      const detail = await prisma.bookingDetail.update({
        where: { id: detailId },
        data: { duration: body.duration },
        include: {
          booking: { select: { tenantId: true } },
        },
      });

      if (detail.booking.tenantId !== tenantId) {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }

      return { success: true, id: detail.id };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to resize: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // PUT /api/tenants/:tenantId/bookings/:detailId/status
  // Update status of a booking detail
  // ════════════════════════════════════════════════════════════════════════════════
  @Put(":detailId/status")
  async updateStatus(
    @Param("tenantId") tenantId: string,
    @Param("detailId") detailId: string,
    @Body() body: { status: string }
  ) {
    try {
      const detail = await prisma.bookingDetail.update({
        where: { id: detailId },
        data: { status: body.status },
        include: {
          booking: { select: { tenantId: true } },
        },
      });

      if (detail.booking.tenantId !== tenantId) {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }

      return { success: true, id: detail.id };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update status: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // DELETE /api/tenants/:tenantId/bookings/:detailId
  // Soft-delete a booking detail
  // ════════════════════════════════════════════════════════════════════════════════
  @Delete(":detailId")
  async deleteDetail(
    @Param("tenantId") tenantId: string,
    @Param("detailId") detailId: string
  ) {
    try {
      const detail = await prisma.bookingDetail.update({
        where: { id: detailId },
        data: { deletedAt: new Date() },
        include: {
          booking: {
            select: {
              tenantId: true,
              id: true,
              bookingDetails: { where: { deletedAt: null } },
            },
          },
        },
      });

      if (detail.booking.tenantId !== tenantId) {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }

      // If all details are deleted, soft-delete the booking too
      if (detail.booking.bookingDetails.length === 0) {
        await prisma.booking.update({
          where: { id: detail.booking.id },
          data: { deletedAt: new Date(), status: "CANCELLED" },
        });
      }

      return { success: true, id: detail.id };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
