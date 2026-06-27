import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/customer-portal")
export class CustomerPortalController {

  private toVN(d: Date): Date {
    return new Date(d.getTime() + 7 * 60 * 60 * 1000);
  }

  private fmtDate(d: Date): string {
    const vn = this.toVN(d);
    const y = vn.getUTCFullYear();
    const m = String(vn.getUTCMonth() + 1).padStart(2, "0");
    const day = String(vn.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  private parseDateTime(dateStr: string, timeStr: string): Date {
    // Input format: dateStr = "yyyy-MM-dd", timeStr = "HH:mm"
    return new Date(`${dateStr}T${timeStr}:00+07:00`);
  }

  // 1. GET ALL TENANTS
  @Get("tenants")
  async getTenants() {
    try {
      const tenants = await prisma.tenant.findMany({
        where: { deletedAt: null, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          brandName: true,
          slogan: true,
          logoUrl: true,
          bannerUrl: true,
          phone: true,
          email: true,
          address: true,
        }
      });
      return tenants;
    } catch (error) {
      throw new HttpException(`Failed to fetch tenants: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. GET BRANCHES FOR A TENANT (OR ALL BRANCHES)
  @Get("branches")
  async getBranches(@Query("tenantId") tenantId?: string) {
    try {
      const whereClause: any = { deletedAt: null };
      if (tenantId) {
        whereClause.tenantId = tenantId;
      }
      const branches = await prisma.branch.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: {
              name: true,
              logoUrl: true,
              brandName: true,
            }
          }
        },
        orderBy: { createdAt: "asc" }
      });
      return branches;
    } catch (error) {
      throw new HttpException(`Failed to fetch branches: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. GET SERVICES & CATEGORIES FOR A TENANT
  @Get(":tenantId/services")
  async getServices(@Param("tenantId") tenantId: string, @Query("branchId") branchId?: string) {
    try {
      const whereClause: any = { tenantId, deletedAt: null };
      if (branchId) {
        whereClause.OR = [
          { branchId: branchId },
          { branchId: null }
        ];
      }

      const categories = await prisma.serviceCategory.findMany({
        where: { tenantId, deletedAt: null },
        include: {
          services: {
            where: whereClause,
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { name: "asc" }
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        services: cat.services.map(s => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          discountPrice: Number(s.price) - Number(s.discountAmount || 0),
          duration: s.duration || 30,
          imageUrl: s.imageUrl,
        }))
      })).filter(cat => cat.services.length > 0);
    } catch (error) {
      throw new HttpException(`Failed to fetch services: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 4. GET PREPAID PACKAGES FOR A TENANT
  @Get(":tenantId/packages")
  async getPackages(@Param("tenantId") tenantId: string, @Query("branchId") branchId?: string) {
    try {
      const whereClause: any = { tenantId, deletedAt: null };
      if (branchId) {
        whereClause.OR = [
          { branchId: branchId },
          { branchId: null }
        ];
      }

      const packages = await prisma.servicePackage.findMany({
        where: whereClause,
        include: {
          details: {
            include: {
              service: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: Number(pkg.price),
        discountPrice: Number(pkg.price) - Number(pkg.discountAmount || 0),
        duration: pkg.duration, // days
        imageUrl: pkg.imageUrl,
        services: pkg.details.map(d => ({
          id: d.service.id,
          name: d.service.name,
          quantity: d.quantity,
        }))
      }));
    } catch (error) {
      throw new HttpException(`Failed to fetch service packages: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 5. GET STYLISTS/KTV FOR A BRANCH
  @Get(":tenantId/branches/:branchId/staff")
  async getStaff(@Param("tenantId") tenantId: string, @Param("branchId") branchId: string) {
    try {
      const staffList = await prisma.user.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: "ACTIVE",
          userBranches: {
            some: {
              branchId,
              deletedAt: null
            }
          },
          role: {
            name: {
              in: ["Employee", "Manager", "Kỹ thuật viên", "Stylist"],
              mode: "insensitive"
            }
          }
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          phone: true,
          sex: true,
          note: true
        }
      });
      return staffList;
    } catch (error) {
      throw new HttpException(`Failed to fetch staff: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 6. QUERY AVAILABLE TIME SLOTS
  @Get(":tenantId/bookings/time-slots")
  async getTimeSlots(
    @Param("tenantId") tenantId: string,
    @Query("branchId") branchId: string,
    @Query("date") dateStr: string, // yyyy-MM-dd
    @Query("serviceId") serviceId: string,
    @Query("staffId") staffId?: string // Optional
  ) {
    try {
      if (!branchId || !dateStr || !serviceId) {
        throw new HttpException("branchId, date, and serviceId are required", HttpStatus.BAD_REQUEST);
      }

      // 1. Fetch service duration
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { duration: true }
      });
      const duration = service?.duration || 30;

      // 2. Define salon hours (08:30 to 20:30) with 30m intervals
      const timeSlots = [
        "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
        "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
        "19:00", "19:30", "20:00"
      ];

      // Current time in Vietnam (GMT+7)
      const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);

      // 3. Retrieve all active bookings for this branch on the queried day
      const dayStart = new Date(`${dateStr}T00:00:00+07:00`);
      const dayEnd = new Date(`${dateStr}T23:59:59+07:00`);

      const activeBookings = await prisma.bookingDetail.findMany({
        where: {
          deletedAt: null,
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          booking: {
            branchId,
            tenantId,
            deletedAt: null,
            startTime: { gte: dayStart, lte: dayEnd }
          }
        },
        select: {
          staffId: true,
          startTime: true,
          duration: true,
          service: { select: { duration: true } }
        }
      });

      // 4. Fetch all active stylists at this branch
      const activeStylists = await prisma.user.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: "ACTIVE",
          userBranches: { some: { branchId, deletedAt: null } },
          role: {
            name: {
              in: ["Employee", "Manager", "Kỹ thuật viên", "Stylist"],
              mode: "insensitive"
            }
          }
        },
        select: { id: true }
      });

      const stylistIds = activeStylists.map(s => s.id);

      // 5. Evaluate each time slot
      const results = timeSlots.map(slotTime => {
        const slotStart = this.parseDateTime(dateStr, slotTime);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        // Check if slot start is in the past
        const slotStartVN = new Date(slotStart.getTime() + 7 * 60 * 60 * 1000);
        if (slotStartVN.getTime() < nowVN.getTime()) {
          return { time: slotTime, available: false, reason: "Trong quá khứ" };
        }

        // Overlap function: checks if slot [slotStart, slotEnd] conflicts with booking [bookingStart, bookingEnd]
        const isOverlapping = (bStart: Date, bDur: number) => {
          const bookingStart = new Date(bStart);
          const bookingEnd = new Date(bookingStart.getTime() + bDur * 60 * 1000);
          return slotStart.getTime() < bookingEnd.getTime() && slotEnd.getTime() > bookingStart.getTime();
        };

        if (staffId && staffId !== "any") {
          // Check specific stylist availability
          const stylistBookings = activeBookings.filter(b => b.staffId === staffId);
          const hasOverlap = stylistBookings.some(b => {
            const dur = b.duration || b.service.duration || 30;
            return b.startTime && isOverlapping(b.startTime, dur);
          });
          return {
            time: slotTime,
            available: !hasOverlap,
            stylistId: staffId
          };
        } else {
          // Check if there is at least one stylist who is free during this slot
          const freeStylists = stylistIds.filter(sId => {
            const stylistBookings = activeBookings.filter(b => b.staffId === sId);
            return !stylistBookings.some(b => {
              const dur = b.duration || b.service.duration || 30;
              return b.startTime && isOverlapping(b.startTime, dur);
            });
          });

          return {
            time: slotTime,
            available: freeStylists.length > 0,
            availableStylistIds: freeStylists
          };
        }
      });

      return results;
    } catch (error) {
      throw new HttpException(`Failed to query slots: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 7. CREATE A CUSTOMER BOOKING (ONLINE SOURCE)
  @Post(":tenantId/bookings")
  async createBooking(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      branchId: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      serviceId: string;
      staffId?: string; // Optional: "any" or specific ID
      date: string; // yyyy-MM-dd
      time: string; // HH:mm
      note?: string;
    }
  ) {
    try {
      const { branchId, customerName, customerPhone, customerEmail, serviceId, staffId, date, time, note } = body;

      if (!branchId || !customerName || !customerPhone || !serviceId || !date || !time) {
        throw new HttpException("Missing required fields", HttpStatus.BAD_REQUEST);
      }

      // 1. Fetch service to get price and duration
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true, duration: true, price: true }
      });
      if (!service) {
        throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
      }

      // 2. Find or create customer by phone number
      let customer = await prisma.customer.findFirst({
        where: {
          tenantId,
          phone: customerPhone,
          deletedAt: null
        }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            tenantId,
            branchId,
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
            credibilityScore: 100
          }
        });
      }

      // 3. Parse booking start & end times
      const startTime = this.parseDateTime(date, time);
      const duration = service.duration || 30;
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      // 4. Resolve staff assignment
      let assignedStaffId: string | null = null;
      if (staffId && staffId !== "any") {
        assignedStaffId = staffId;
      } else {
        // Find a free stylist for this slot
        const dayStart = new Date(`${date}T00:00:00+07:00`);
        const dayEnd = new Date(`${date}T23:59:59+07:00`);

        const activeBookings = await prisma.bookingDetail.findMany({
          where: {
            deletedAt: null,
            status: { notIn: ["CANCELLED", "NO_SHOW"] },
            booking: {
              branchId,
              tenantId,
              deletedAt: null,
              startTime: { gte: dayStart, lte: dayEnd }
            }
          },
          select: {
            staffId: true,
            startTime: true,
            duration: true,
            service: { select: { duration: true } }
          }
        });

        const activeStylists = await prisma.user.findMany({
          where: {
            tenantId,
            deletedAt: null,
            status: "ACTIVE",
            userBranches: { some: { branchId, deletedAt: null } },
            role: {
              name: {
                in: ["Employee", "Manager", "Kỹ thuật viên", "Stylist"],
                mode: "insensitive"
              }
            }
          },
          select: { id: true }
        });

        const isOverlapping = (bStart: Date, bDur: number) => {
          const bookingStart = new Date(bStart);
          const bookingEnd = new Date(bookingStart.getTime() + bDur * 60 * 1000);
          return startTime.getTime() < bookingEnd.getTime() && endTime.getTime() > bookingStart.getTime();
        };

        const freeStylists = activeStylists.filter(s => {
          const stylistBookings = activeBookings.filter(b => b.staffId === s.id);
          return !stylistBookings.some(b => {
            const dur = b.duration || b.service.duration || 30;
            return b.startTime && isOverlapping(b.startTime, dur);
          });
        });

        if (freeStylists.length > 0) {
          // Assign the first free stylist
          assignedStaffId = freeStylists[0].id;
        }
      }

      // 5. Create Booking in database
      const booking = await prisma.booking.create({
        data: {
          tenantId,
          branchId,
          customerId: customer.id,
          startTime,
          endTime,
          status: "PENDING",
          source: "ONLINE",
          note: note || null,
          bookingDetails: {
            create: {
              serviceId,
              staffId: assignedStaffId,
              startTime,
              duration,
              status: "PENDING"
            }
          }
        },
        include: {
          branch: { select: { name: true, address: true } },
          bookingDetails: {
            include: {
              service: { select: { name: true, price: true } },
              staff: { select: { name: true } }
            }
          }
        }
      });

      return {
        success: true,
        bookingId: booking.id,
        customer: { name: customer.name, phone: customer.phone },
        branchName: booking.branch.name,
        branchAddress: booking.branch.address,
        time: time,
        date: date,
        serviceName: booking.bookingDetails[0].service.name,
        staffName: booking.bookingDetails[0].staff?.name || "Ngẫu nhiên/Chưa gán",
        status: booking.status
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Failed to create booking: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 8. CUSTOMER PROFILE LOOKUP BY PHONE
  @Get("customers/profile")
  async getCustomerProfile(
    @Query("phone") phone: string,
    @Query("tenantId") tenantId: string
  ) {
    try {
      if (!phone || !tenantId) {
        throw new HttpException("Phone and tenantId are required", HttpStatus.BAD_REQUEST);
      }

      // 1. Fetch customer
      const customer = await prisma.customer.findFirst({
        where: { phone, tenantId, deletedAt: null },
        include: {
          points: {
            where: { deletedAt: null }
          },
          purchasedPackages: {
            where: { deletedAt: null },
            include: {
              package: true
            }
          },
          bookings: {
            where: { deletedAt: null },
            include: {
              branch: { select: { name: true } },
              reviews: { select: { id: true, ratingStars: true } },
              bookingDetails: {
                where: { deletedAt: null },
                include: {
                  service: { select: { name: true } },
                  staff: { select: { name: true } }
                }
              }
            },
            orderBy: { startTime: "desc" }
          }
        }
      });

      if (!customer) {
        throw new HttpException("Không tìm thấy thông tin khách hàng với số điện thoại này.", HttpStatus.NOT_FOUND);
      }

      // 2. Compute stats
      const totalPoints = customer.points.reduce((acc: number, p: any) => acc + (p.point || 0), 0);
      
      // Compute Membership Rank
      let membershipTier = "Thành viên Đồng";
      if (totalPoints >= 1000) {
        membershipTier = "Thành viên Kim Cương";
      } else if (totalPoints >= 500) {
        membershipTier = "Thành viên Vàng";
      } else if (totalPoints >= 200) {
        membershipTier = "Thành viên Bạc";
      }

      const activePackages = customer.purchasedPackages.map(pkg => ({
        id: pkg.id,
        packageName: pkg.package.name,
        quantity: pkg.quantity,
        usedQuantity: pkg.usedQuantity,
        remainingQuantity: Math.max(0, pkg.quantity - pkg.usedQuantity),
        expiryDate: pkg.expiryDate ? this.fmtDate(pkg.expiryDate) : "Vô thời hạn"
      }));

      const bookingHistory = customer.bookings.map(b => {
        const detail = b.bookingDetails[0];
        return {
          id: b.id,
          branchName: b.branch.name,
          startTime: b.startTime.toISOString(),
          date: this.fmtDate(b.startTime),
          time: this.toVN(b.startTime).toISOString().substr(11, 5),
          serviceName: detail?.service?.name || "Dịch vụ",
          staffName: detail?.staff?.name || "Chưa gán",
          status: b.status,
          hasReview: b.reviews.length > 0,
          reviewRating: b.reviews[0]?.ratingStars || null
        };
      });

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        credibilityScore: customer.credibilityScore,
        totalPoints,
        membershipTier,
        activePackages,
        bookingHistory
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Failed to load profile: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 9. LEAVE A CUSTOMER REVIEW
  @Post("bookings/:bookingId/reviews")
  async leaveReview(
    @Param("bookingId") bookingId: string,
    @Body() body: {
      ratingStars: number;
      comment?: string;
      phone: string;
      tenantId: string;
    }
  ) {
    try {
      const { ratingStars, comment, phone, tenantId } = body;

      if (!ratingStars || ratingStars < 1 || ratingStars > 5 || !phone || !tenantId) {
        throw new HttpException("Invalid review parameters", HttpStatus.BAD_REQUEST);
      }

      // Check if booking exists
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, tenantId, deletedAt: null },
        include: { customer: true }
      });

      if (!booking) {
        throw new HttpException("Booking not found", HttpStatus.NOT_FOUND);
      }

      // Validate customer matches phone
      if (!booking.customer || booking.customer.phone !== phone) {
        throw new HttpException("Unauthorized booking ownership", HttpStatus.FORBIDDEN);
      }

      // Check if review already exists
      const existingReview = await prisma.customerReview.findFirst({
        where: { bookingId, deletedAt: null }
      });

      if (existingReview) {
        throw new HttpException("Lịch hẹn này đã được đánh giá trước đó.", HttpStatus.BAD_REQUEST);
      }

      // Create review
      const review = await prisma.customerReview.create({
        data: {
          tenantId,
          branchId: booking.branchId,
          customerId: booking.customer.id,
          bookingId: booking.id,
          ratingStars,
          comment: comment || null
        }
      });

      // Award points (e.g. 10 points for a review)
      await prisma.customerPoint.create({
        data: {
          tenantId,
          branchId: booking.branchId,
          customerId: booking.customer.id,
          point: 10
        }
      });

      return {
        success: true,
        reviewId: review.id,
        message: "Cảm ơn bạn đã gửi đánh giá! Bạn được cộng 10 điểm thưởng."
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Failed to create review: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 10. GET LATEST REVIEWS FOR LANDING PAGE
  @Get(":tenantId/reviews")
  async getLatestReviews(
    @Param("tenantId") tenantId: string,
    @Query("limit") limitStr?: string
  ) {
    try {
      const limit = limitStr ? parseInt(limitStr, 10) : 6;
      const reviews = await prisma.customerReview.findMany({
        where: { tenantId, deletedAt: null },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          booking: {
            include: {
              bookingDetails: {
                include: {
                  service: { select: { name: true } }
                }
              }
            }
          }
        }
      });

      return reviews.map(r => ({
        id: r.id,
        customerName: r.customer.name,
        ratingStars: r.ratingStars,
        comment: r.comment,
        date: this.fmtDate(r.createdAt),
        serviceName: r.booking?.bookingDetails[0]?.service?.name || "Dịch vụ"
      }));
    } catch (error) {
      throw new HttpException(`Failed to fetch reviews: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
