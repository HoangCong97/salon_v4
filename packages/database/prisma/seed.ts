import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...");

  // 1. CLEAN UP EXISTING DATA IN RELATION ORDER
  console.log("🧹 Cleaning up old data...");
  
  await prisma.saasInvoice.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.customerReview.deleteMany({});
  await prisma.bookingDetail.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.packageUsageHistory.deleteMany({});
  await prisma.customerPurchasedPackage.deleteMany({});
  await prisma.servicePackageDetail.deleteMany({});
  await prisma.servicePackage.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.customerPoint.deleteMany({});
  await prisma.customer.deleteMany({});
  
  await prisma.userBranch.deleteMany({});
  await prisma.userSetting.deleteMany({});
  await prisma.employeeShift.deleteMany({});
  await prisma.employeeDailyTurn.deleteMany({});
  await prisma.employeeAttendance.deleteMany({});
  await prisma.salaryAdvance.deleteMany({});
  await prisma.employeeMonthlyPayroll.deleteMany({});
  await prisma.employeeSalaryConfig.deleteMany({});
  
  await prisma.commissionTemplateDetail.deleteMany({});
  await prisma.commissionTemplate.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.service.deleteMany({});
  
  await prisma.dailyEmployeeRevenue.deleteMany({});
  await prisma.dailyBranchRevenue.deleteMany({});
  await prisma.dailyRevenueReport.deleteMany({});
  await prisma.revenueExpenditure.deleteMany({});
  
  await prisma.branch.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.saasPlan.deleteMany({});

  console.log("✨ Database cleaned!");

  // 2. CREATE SAAS PLANS
  console.log("🌱 Seeding SaaS Plans...");
  const freePlan = await prisma.saasPlan.create({
    data: {
      name: "Dùng Thử (Free Trial)",
      code: "FREE",
      price: 0,
      maxBranches: 1,
      maxStaff: 5,
      features: ["Đặt lịch trực tuyến cơ bản", "Báo cáo doanh thu ngày", "Phân quyền Nhân viên/Khách hàng", "Thời hạn: 14 ngày"]
    }
  });

  const basicPlan = await prisma.saasPlan.create({
    data: {
      name: "Gói Cơ Bản (Basic)",
      code: "BASIC",
      price: 299000,
      maxBranches: 2,
      maxStaff: 15,
      features: ["Tất cả tính năng gói Free", "Báo cáo doanh thu chi tiết", "Quản lý ca kíp và tua làm thợ", "Hóa đơn & Bán hàng POS cơ bản", "SMS OTP thông báo"]
    }
  });

  const premiumPlan = await prisma.saasPlan.create({
    data: {
      name: "Gói Cao Cấp (Premium)",
      code: "PREMIUM",
      price: 799000,
      maxBranches: -1, // Unlimited
      maxStaff: -1, // Unlimited
      features: ["Tất cả tính năng gói Basic", "Cấu hình hoa hồng và lương thợ nâng cao", "Báo cáo chuyên sâu & biểu đồ phân tích", "Quản lý thẻ dịch vụ trả trước", "Hỗ trợ kỹ thuật 24/7 riêng biệt"]
    }
  });

  console.log("✅ SaaS Plans created!");

  // 3. CREATE TENANTS
  console.log("🌱 Seeding Tenants...");
  const tenant1 = await prisma.tenant.create({
    data: {
      name: "HairStar Beauty Salon",
      ownerName: "Nguyễn Văn A",
      phone: "0901234567",
      email: "contact@hairstar.vn",
      address: "123 Đường Ba Tháng Hai, Quận 10, TP.HCM",
      status: "ACTIVE",
      planId: premiumPlan.id
    }
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: "BarberShop House",
      ownerName: "Trần Thế B",
      phone: "0918765432",
      email: "info@barberhouse.com",
      address: "45 Nguyễn Trãi, Quận 1, TP.HCM",
      status: "ACTIVE",
      planId: basicPlan.id
    }
  });

  const tenant3 = await prisma.tenant.create({
    data: {
      name: "Seoul Hair & Spa",
      ownerName: "Kim Min Young",
      phone: "0977889900",
      email: "seoulhair@gmail.com",
      address: "200 Kim Mã, Quận Ba Đình, Hà Nội",
      status: "SUSPENDED",
      planId: basicPlan.id
    }
  });

  const tenant4 = await prisma.tenant.create({
    data: {
      name: "Salon Tóc Việt",
      ownerName: "Phạm Văn D",
      phone: "0987654321",
      email: "tocviet@outlook.com",
      address: "56 Nguyễn Huệ, TP. Huế",
      status: "PENDING",
      planId: freePlan.id
    }
  });

  console.log("✅ Tenants created!");

  // 4. CREATE SAAS INVOICES
  console.log("🌱 Seeding SaaS Invoices...");
  await prisma.saasInvoice.createMany({
    data: [
      {
        tenantId: tenant1.id,
        planId: premiumPlan.id,
        invoiceNumber: "INV-2026-001",
        amount: 4794000,
        paymentMethod: "Chuyển khoản (Vietcombank)",
        paymentStatus: "PENDING",
        createdAt: new Date("2026-06-20T10:00:00Z")
      },
      {
        tenantId: tenant2.id,
        planId: basicPlan.id,
        invoiceNumber: "INV-2026-002",
        amount: 1794000,
        paymentMethod: "Cổng thanh toán Momo",
        paymentStatus: "PAID",
        createdAt: new Date("2026-06-18T15:30:00Z")
      },
      {
        tenantId: tenant1.id,
        planId: premiumPlan.id,
        invoiceNumber: "INV-2026-003",
        amount: 799000,
        paymentMethod: "Cổng thanh toán VNPAY",
        paymentStatus: "PAID",
        createdAt: new Date("2026-06-15T09:00:00Z")
      },
      {
        tenantId: tenant3.id,
        planId: basicPlan.id,
        invoiceNumber: "INV-2026-004",
        amount: 299000,
        paymentMethod: "Chuyển khoản",
        paymentStatus: "OVERDUE",
        createdAt: new Date("2026-05-05T08:00:00Z")
      }
    ]
  });

  console.log("✅ SaaS Invoices created!");

  // 5. CREATE BRANCHES
  console.log("🌱 Seeding Branches...");
  const branch1a = await prisma.branch.create({
    data: {
      tenantId: tenant1.id,
      name: "HairStar - Chi nhánh Quận 1",
      phone: "02839998881",
      email: "branch1@hairstar.vn",
      address: "15 Lê Thánh Tôn, Quận 1, TP.HCM"
    }
  });

  const branch1b = await prisma.branch.create({
    data: {
      tenantId: tenant1.id,
      name: "HairStar - Chi nhánh Quận 3",
      phone: "02839998882",
      email: "branch2@hairstar.vn",
      address: "120 Nguyễn Đình Chiểu, Quận 3, TP.HCM"
    }
  });

  const branch2a = await prisma.branch.create({
    data: {
      tenantId: tenant2.id,
      name: "BarberShop - Chi nhánh Nguyễn Trãi",
      phone: "02837776661",
      email: "nguyentrai@barberhouse.com",
      address: "45 Nguyễn Trãi, Quận 1, TP.HCM"
    }
  });

  console.log("✅ Branches created!");

  // 6. CREATE ROLES & PERMISSIONS
  console.log("🌱 Seeding Roles & Permissions...");
  
  // Create default permissions
  const permBookCreate = await prisma.permission.create({ data: { slug: "booking.create", groupName: "Booking", name: "Tạo lịch hẹn", description: "Cho phép đặt lịch hẹn mới" } });
  const permBookView = await prisma.permission.create({ data: { slug: "booking.view", groupName: "Booking", name: "Xem lịch hẹn", description: "Xem danh sách lịch hẹn" } });
  const permInvoiceCreate = await prisma.permission.create({ data: { slug: "invoice.create", groupName: "Invoice", name: "Tạo hóa đơn", description: "Tạo và in hóa đơn thanh toán" } });
  const permReportView = await prisma.permission.create({ data: { slug: "report.view", groupName: "Report", name: "Xem báo cáo", description: "Xem báo cáo thống kê doanh thu" } });
  const permStaffManage = await prisma.permission.create({ data: { slug: "staff.manage", groupName: "Staff", name: "Quản lý nhân viên", description: "Quản lý thợ và phân ca ca kíp" } });

  // Create roles for tenant 1
  const roleAdmin = await prisma.role.create({
    data: {
      tenantId: tenant1.id,
      name: "Admin",
      description: "Quản trị viên tối cao của salon"
    }
  });

  const roleManager = await prisma.role.create({
    data: {
      tenantId: tenant1.id,
      name: "Manager",
      description: "Quản lý chi nhánh"
    }
  });

  // Link permissions to Admin Role
  await prisma.rolePermission.createMany({
    data: [
      { roleId: roleAdmin.id, permissionId: permBookCreate.id },
      { roleId: roleAdmin.id, permissionId: permBookView.id },
      { roleId: roleAdmin.id, permissionId: permInvoiceCreate.id },
      { roleId: roleAdmin.id, permissionId: permReportView.id },
      { roleId: roleAdmin.id, permissionId: permStaffManage.id }
    ]
  });

  // Link permissions to Manager Role
  await prisma.rolePermission.createMany({
    data: [
      { roleId: roleManager.id, permissionId: permBookCreate.id },
      { roleId: roleManager.id, permissionId: permBookView.id },
      { roleId: roleManager.id, permissionId: permInvoiceCreate.id }
    ]
  });

  console.log("✅ Roles & Permissions created!");

  // 7. CREATE USERS
  console.log("🌱 Seeding Users...");
  
  const user1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      roleId: roleAdmin.id,
      name: "Nguyễn Văn A (Admin)",
      email: "admin@hairstar.vn",
      password: "hashedpassword123", // Mock password
      phone: "0901234567",
      sex: "Nam",
      baseSalary: 15000000,
      status: "ACTIVE"
    }
  });

  const user2 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      roleId: roleManager.id,
      name: "Trần Thị Manager",
      email: "manager@hairstar.vn",
      password: "hashedpassword123",
      phone: "0907654321",
      sex: "Nữ",
      baseSalary: 10000000,
      status: "ACTIVE"
    }
  });

  const user3 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: "Lê Văn Stylist",
      email: "stylist@hairstar.vn",
      password: "hashedpassword123",
      phone: "0988776655",
      sex: "Nam",
      baseSalary: 6000000,
      status: "ACTIVE"
    }
  });

  // Link users to branches
  await prisma.userBranch.createMany({
    data: [
      { userId: user1.id, branchId: branch1a.id },
      { userId: user1.id, branchId: branch1b.id },
      { userId: user2.id, branchId: branch1a.id },
      { userId: user3.id, branchId: branch1a.id }
    ]
  });

  // Create settings
  await prisma.userSetting.create({
    data: {
      userId: user1.id,
      theme: "light",
      language: "vi"
    }
  });

  console.log("✅ Users created!");

  // 8. CREATE CUSTOMERS
  console.log("🌱 Seeding Customers...");
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Phan Văn Khách",
      phone: "0911223344",
      email: "customer1@gmail.com",
      credibilityScore: 100
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Hoàng Thị Điệu",
      phone: "0944556677",
      email: "customer2@gmail.com",
      credibilityScore: 95
    }
  });

  // Points
  await prisma.customerPoint.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      customerId: customer1.id,
      point: 120
    }
  });

  console.log("✅ Customers created!");

  // 9. CREATE SERVICE CATEGORIES & SERVICES
  console.log("🌱 Seeding Service Categories...");
  const catHair = await prisma.serviceCategory.create({
    data: {
      tenantId: tenant1.id,
      name: "Cắt Tóc Nam & Styling",
      color: "blue",
      defaultCommission: 10.00
    }
  });

  const catChemical = await prisma.serviceCategory.create({
    data: {
      tenantId: tenant1.id,
      name: "Hóa Chất (Uốn/Nhuộm)",
      color: "orange",
      defaultCommission: 15.00
    }
  });

  const catSpa = await prisma.serviceCategory.create({
    data: {
      tenantId: tenant1.id,
      name: "Gội Đầu & Spa",
      color: "green",
      defaultCommission: 12.00
    }
  });

  console.log("🌱 Seeding Services...");
  const service1 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Cắt Tóc Nam Premium",
      serviceCategory: "dịch vụ",
      categoryId: catHair.id,
      price: 150000,
      discountPrice: 120000,
      duration: 30
    }
  });

  const service2 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Uốn Tóc Chuyên Sâu",
      serviceCategory: "hóa chất",
      categoryId: catChemical.id,
      price: 500000,
      discountPrice: 450000,
      duration: 90
    }
  });

  const service3 = await prisma.service.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Gội Đầu Dưỡng Sinh Thảo Dược",
      serviceCategory: "dịch vụ",
      categoryId: catSpa.id,
      price: 100000,
      discountPrice: 100000,
      duration: 45
    }
  });

  console.log("✅ Services created!");

  // 10. CREATE BOOKINGS & INVOICES
  console.log("🌱 Seeding Bookings & Invoices...");
  
  // Future Booking (PENDING)
  const booking1 = await prisma.booking.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      customerId: customer1.id,
      startTime: new Date("2026-06-25T09:00:00Z"),
      endTime: new Date("2026-06-25T09:30:00Z"),
      status: "PENDING",
      note: "Khách yêu cầu thợ chính cắt"
    }
  });

  await prisma.bookingDetail.create({
    data: {
      bookingId: booking1.id,
      serviceId: service1.id,
      staffId: user3.id
    }
  });

  // Completed Booking (COMPLETED)
  const booking2 = await prisma.booking.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      customerId: customer2.id,
      startTime: new Date("2026-06-23T14:00:00Z"),
      endTime: new Date("2026-06-23T15:15:00Z"),
      status: "COMPLETED"
    }
  });

  await prisma.bookingDetail.createMany({
    data: [
      { bookingId: booking2.id, serviceId: service1.id, staffId: user3.id },
      { bookingId: booking2.id, serviceId: service3.id, staffId: user3.id }
    ]
  });

  // Review for booking2
  await prisma.customerReview.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      customerId: customer2.id,
      bookingId: booking2.id,
      ratingStars: 5,
      comment: "Dịch vụ rất tốt, gội đầu rất thư giãn!"
    }
  });

  // Invoice for booking2
  const invoice1 = await prisma.invoice.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      bookingId: booking2.id,
      customerId: customer2.id,
      staffId: user1.id, // Cashier
      startTime: new Date("2026-06-23T14:00:00Z"),
      endTime: new Date("2026-06-23T15:15:00Z"),
      totalPrice: 250000,
      discountAmount: 30000,
      finalAmount: 220000,
      paymentMethod: "TRANSFER",
      paymentStatus: "PAID",
      status: "COMPLETED",
      note: "Thanh toán bằng mã QR"
    }
  });

  await prisma.invoiceItem.createMany({
    data: [
      {
        invoiceId: invoice1.id,
        staffId: user3.id, // Stylist
        itemType: "SERVICE",
        itemId: service1.id,
        price: 150000,
        quantity: 1,
        totalPrice: 150000,
        discountAmount: 30000,
        finalAmount: 120000,
        employeeCommission: 12000 // 10% commission
      },
      {
        invoiceId: invoice1.id,
        staffId: user3.id, // Stylist
        itemType: "SERVICE",
        itemId: service3.id,
        price: 100000,
        quantity: 1,
        totalPrice: 100000,
        discountAmount: 0,
        finalAmount: 100000,
        employeeCommission: 10000
      }
    ]
  });

  console.log("✅ Bookings & Invoices created!");

  // 11. INVENTORIES & SERVICE PACKAGES
  console.log("🌱 Seeding Inventories & Packages...");
  await prisma.inventory.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Sáp Vuốt Tóc HairGlow Wax",
      costPrice: 120000,
      sellPrice: 200000,
      quantity: 50
    }
  });

  const package1 = await prisma.servicePackage.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Combo Thư Giãn Dưỡng Sinh 5 Lần",
      description: "Thẻ gội đầu dưỡng sinh thảo dược combo 5 lần",
      price: 500000,
      discountPrice: 400000,
      duration: 90 // 90 days validity
    }
  });

  await prisma.servicePackageDetail.create({
    data: {
      servicePackageId: package1.id,
      serviceId: service3.id,
      quantity: 5
    }
  });

  console.log("✅ Inventories & Packages created!");

  // 12. SEED REPORTS AND EXPENDITURES
  console.log("🌱 Seeding Reports & Expenditures...");
  
  await prisma.dailyRevenueReport.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      workDate: new Date("2026-06-23"),
      totalRevenue: 220000,
      totalCash: 0,
      totalCredit: 0,
      totalTransfer: 220000,
      status: "COMPLETED"
    }
  });

  await prisma.dailyBranchRevenue.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      workDate: new Date("2026-06-23"),
      totalRevenue: 220000,
      totalWalkinCount: 0,
      totalBookedCount: 1,
      totalCustomersToday: 1
    }
  });

  await prisma.dailyEmployeeRevenue.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      staffId: user3.id,
      workDate: new Date("2026-06-23"),
      totalRevenue: 220000,
      totalBookings: 1,
      totalCustomers: 1
    }
  });

  await prisma.revenueExpenditure.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      transactionDate: new Date("2026-06-01"),
      revenueExpenditureType: "expenditure",
      paymentType: "transfer",
      category: "rent",
      amount: 15000000,
      description: "Thanh toán tiền mặt bằng thuê tháng 6"
    }
  });

  console.log("✅ Reports & Expenditures created!");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
