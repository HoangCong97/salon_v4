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
      name: "Gói Basic",
      code: "BASIC",
      price: 199000,
      maxBranches: 1,
      maxStaff: 5,
      features: ["Đặt lịch trực tuyến cơ bản", "Báo cáo doanh thu ngày", "Phân quyền Nhân viên/Khách hàng"]
    }
  });

  const basicPlan = await prisma.saasPlan.create({
    data: {
      name: "Gói Plus",
      code: "PLUS",
      price: 349000,
      maxBranches: 2,
      maxStaff: 15,
      features: ["Tất cả tính năng gói Basic", "Báo cáo doanh thu chi tiết", "Quản lý ca kíp và tua làm thợ", "Hóa đơn & Bán hàng POS cơ bản", "SMS OTP thông báo"]
    }
  });

  const premiumPlan = await prisma.saasPlan.create({
    data: {
      name: "Gói Premium",
      code: "PREMIUM",
      price: 799000,
      maxBranches: -1, // Unlimited
      maxStaff: -1, // Unlimited
      features: ["Tất cả tính năng gói Plus", "Cấu hình hoa hồng và lương thợ nâng cao", "Báo cáo chuyên sâu & biểu đồ phân tích", "Quản lý thẻ dịch vụ trả trước", "Hỗ trợ kỹ thuật 24/7 riêng biệt"]
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
      planId: premiumPlan.id,
      planStartedAt: new Date("2026-05-26T00:00:00Z"),
      planExpiresAt: new Date("2027-05-26T00:00:00Z"),
      planStatus: "ACTIVE"
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
      planId: basicPlan.id,
      planStartedAt: new Date("2026-06-10T00:00:00Z"),
      planExpiresAt: new Date("2026-07-10T00:00:00Z"),
      planStatus: "ACTIVE"
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
      planId: basicPlan.id,
      planStartedAt: new Date("2026-05-11T00:00:00Z"),
      planExpiresAt: new Date("2026-06-10T00:00:00Z"),
      planStatus: "EXPIRED"
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
      planId: freePlan.id,
      planStartedAt: new Date("2026-06-20T00:00:00Z"),
      planExpiresAt: new Date("2026-07-04T00:00:00Z"),
      planStatus: "TRIAL"
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
      name: "HairStar - Chi nhánh 2",
      phone: "02839998881",
      email: "branch1@hairstar.vn",
      address: "15 Lê Thánh Tôn, Quận 1, TP.HCM"
    }
  });

  const branch1b = await prisma.branch.create({
    data: {
      tenantId: tenant1.id,
      name: "HairStar - Chi nhánh 3",
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
  const standardPermissions = [
    { slug: "booking.view", groupName: "Lịch hẹn", name: "Xem lịch hẹn", description: "Xem danh sách lịch hẹn" },
    { slug: "booking.create", groupName: "Lịch hẹn", name: "Tạo lịch hẹn", description: "Cho phép đặt lịch hẹn mới" },
    { slug: "booking.edit", groupName: "Lịch hẹn", name: "Sửa lịch hẹn", description: "Cho phép chỉnh sửa lịch hẹn" },
    { slug: "booking.delete", groupName: "Lịch hẹn", name: "Xóa lịch hẹn", description: "Cho phép hủy/xóa lịch hẹn" },

    { slug: "pos.view", groupName: "Bán hàng POS", name: "Truy cập POS", description: "Cho phép truy cập màn hình bán hàng POS" },
    { slug: "invoice.view", groupName: "Hóa đơn", name: "Xem hóa đơn", description: "Xem lịch sử danh sách hóa đơn" },
    { slug: "invoice.create", groupName: "Hóa đơn", name: "Tạo hóa đơn", description: "Tạo và in hóa đơn thanh toán" },

    { slug: "customer.view", groupName: "Khách hàng", name: "Xem khách hàng", description: "Xem danh sách khách hàng" },
    { slug: "customer.manage", groupName: "Khách hàng", name: "Quản lý khách hàng", description: "Thêm, sửa, xóa khách hàng" },

    { slug: "service.view", groupName: "Dịch vụ", name: "Xem dịch vụ", description: "Xem danh mục và bảng giá dịch vụ" },
    { slug: "service.manage", groupName: "Dịch vụ", name: "Quản lý dịch vụ", description: "Thêm, sửa, xóa dịch vụ" },

    { slug: "inventory.view", groupName: "Kho hàng", name: "Xem kho hàng", description: "Xem số lượng tồn kho sản phẩm" },
    { slug: "inventory.manage", groupName: "Kho hàng", name: "Quản lý kho hàng", description: "Nhập, xuất, điều chỉnh kho hàng" },

    { slug: "staff.view", groupName: "Nhân sự", name: "Xem nhân sự", description: "Xem danh sách thông tin nhân viên" },
    { slug: "staff.manage", groupName: "Nhân sự", name: "Quản lý nhân sự", description: "Thêm, sửa, xóa và cấu hình lương nhân viên" },

    { slug: "shift.view", groupName: "Lịch trực", name: "Xem lịch trực ca", description: "Xem lịch ca kíp của nhân viên" },
    { slug: "shift.manage", groupName: "Lịch trực", name: "Phân ca xếp lịch", description: "Xếp lịch làm việc và chấm công" },

    { slug: "report.view", groupName: "Báo cáo", name: "Xem báo cáo", description: "Xem báo cáo thống kê doanh thu và hoạt động" },

    { slug: "branch.view", groupName: "Chi nhánh", name: "Xem chi nhánh", description: "Xem danh sách chi nhánh" },
    { slug: "branch.manage", groupName: "Chi nhánh", name: "Quản lý chi nhánh", description: "Thêm, sửa, cấu hình chi nhánh" },
  ];

  const dbPermissions = [];
  for (const p of standardPermissions) {
    const createdPerm = await prisma.permission.create({
      data: p
    });
    dbPermissions.push(createdPerm);
  }

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

  const roleCashier = await prisma.role.create({
    data: {
      tenantId: tenant1.id,
      name: "Cashier",
      description: "Nhân viên thu ngân"
    }
  });

  const roleEmployee = await prisma.role.create({
    data: {
      tenantId: tenant1.id,
      name: "Employee",
      description: "Kỹ thuật viên / Thợ làm tóc"
    }
  });

  // Link permissions to Admin Role (All permissions)
  await prisma.rolePermission.createMany({
    data: dbPermissions.map(p => ({
      roleId: roleAdmin.id,
      permissionId: p.id
    }))
  });

  // Link permissions to Manager Role (All except branch.manage and staff.manage)
  const managerExclusions = ["branch.manage", "staff.manage"];
  await prisma.rolePermission.createMany({
    data: dbPermissions
      .filter(p => !managerExclusions.includes(p.slug))
      .map(p => ({
        roleId: roleManager.id,
        permissionId: p.id
      }))
  });

  // Link permissions to Cashier Role
  const cashierSlugs = [
    "booking.view", "booking.create", "booking.edit",
    "pos.view", "invoice.view", "invoice.create",
    "customer.view", "customer.manage"
  ];
  await prisma.rolePermission.createMany({
    data: dbPermissions
      .filter(p => cashierSlugs.includes(p.slug))
      .map(p => ({
        roleId: roleCashier.id,
        permissionId: p.id
      }))
  });

  // Link permissions to Employee Role
  const employeeSlugs = ["booking.view", "shift.view"];
  await prisma.rolePermission.createMany({
    data: dbPermissions
      .filter(p => employeeSlugs.includes(p.slug))
      .map(p => ({
        roleId: roleEmployee.id,
        permissionId: p.id
      }))
  });

  console.log("✅ Roles & Permissions created!");

  // 7. CREATE USERS
  console.log("🌱 Seeding Users...");


  const user1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      roleId: roleAdmin.id,
      name: "Hoàng Công",
      email: "admin@hairstar.vn",
      password: "hashedpassword123", // Mock password
      phone: "0971218625",
      sex: "Nam",
      baseSalary: 0,
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
      roleId: roleEmployee.id,
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
      name: "Cơ bản",
      color: "blue",
      defaultCommission: 10.00
    }
  });

  const catChemical = await prisma.serviceCategory.create({
    data: {
      tenantId: tenant1.id,
      name: "Hóa chất",
      color: "orange",
      defaultCommission: 15.00
    }
  });

  const catSpa = await prisma.serviceCategory.create({
    data: {
      tenantId: tenant1.id,
      name: "Combo",
      color: "purple",
      defaultCommission: 12.00
    }
  });

  console.log("🌱 Seeding Services...");
  const serviceData = [
    // Combo
    { name: "COMBO Cơ Bản", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2", "CN3"], priceCN2: 140000, priceCN3: 140000, additional: [110000, 130000, 190000, 210000, 220000, 160000, 140000], status: "Hoạt động" },
    { name: "COMBO Cao cấp", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2", "CN3"], priceCN2: 210000, priceCN3: 210000, additional: [130000, 170000, 230000, 250000, 290000, 190000], status: "Hoạt động" },
    { name: "COMBO Thượng Hạng", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2", "CN3"], priceCN2: 280000, priceCN3: 280000, additional: [290000, 350000, 360000, 260000, 250000, 240000], status: "Hoạt động" },
    { name: "COMBO 1", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2"], priceCN2: 200000, priceCN3: 0, additional: [150000, 200000], status: "Ngừng" },
    { name: "COMBO 2", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2"], priceCN2: 280000, priceCN3: 0, additional: [230000, 280000], status: "Ngừng" },
    { name: "COMBO Nâng Cao", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2"], priceCN2: 189000, priceCN3: 0, additional: [189000], status: "Ngừng" },
    { name: "COMBO Đặc Biệt", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2"], priceCN2: 240000, priceCN3: 0, additional: [240000], status: "Ngừng" },
    { name: "COMBO Chăm Sóc", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2"], priceCN2: 130000, priceCN3: 0, additional: [130000], status: "Hoạt động" },
    { name: "Combo thường", catId: catSpa.id, serviceCategory: "Combo", branches: ["CN2"], priceCN2: 60000, priceCN3: 0, additional: [60000], status: "Hoạt động" },

    // Cơ bản
    { name: "Hớt tóc", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 70000, priceCN3: 70000, additional: [60000, 70000, 80000], status: "Hoạt động" },
    { name: "Cạo mặt", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 20000, priceCN3: 20000, additional: [10000, 15000], status: "Hoạt động" },
    { name: "Ráy tai", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 70000, priceCN3: 70000, additional: [30000, 50000, 60000, 70000], status: "Hoạt động" },
    { name: "Gội đầu massage", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 70000, priceCN3: 70000, additional: [50000, 60000, 70000], status: "Hoạt động" },
    { name: "Massage mặt", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 0, priceCN3: 0, additional: [], status: "Hoạt động" },
    { name: "Đánh mắt", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 50000, priceCN3: 50000, additional: [30000, 40000, 50000], status: "Hoạt động" },
    { name: "Nhổ tóc bạc", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 50000, priceCN3: 50000, additional: [80000, 100000], status: "Hoạt động" },
    { name: "Làm móng", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 80000, priceCN3: 80000, additional: [50000, 30000, 60000, 70000, 80000], status: "Hoạt động" },
    { name: "Đắp mặt nạ", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 50000, priceCN3: 50000, additional: [30000, 40000, 50000], status: "Hoạt động" },
    { name: "Lột mụn", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 40000, priceCN3: 40000, additional: [30000], status: "Hoạt động" },
    { name: "Hút mụn + Xông mặt", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 130000, priceCN3: 130000, additional: [100000, 120000], status: "Hoạt động" },
    { name: "Tẩy tế bào chết", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 40000, priceCN3: 40000, additional: [20000, 30000], status: "Hoạt động" },
    { name: "Tattoo", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 30000, priceCN3: 30000, additional: [10000, 20000, 30000], status: "Hoạt động" },
    { name: "Cắt tóc (Free thẻ tích điểm)", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 60000, priceCN3: 60000, additional: [], status: "Hoạt động" },
    { name: "Xoe lỗ ghèn", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2", "CN3"], priceCN2: 50000, priceCN3: 50000, additional: [], status: "Hoạt động" },
    { name: "Phụ dập xả tóc sấy tóc", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN3"], priceCN2: 0, priceCN3: 50000, additional: [], status: "Hoạt động" },
    { name: "sấy tạo kiểu", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN3"], priceCN2: 0, priceCN3: 40000, additional: [40000], status: "Hoạt động" },
    { name: "nhuộm thuốc của khách", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN3"], priceCN2: 0, priceCN3: 50000, additional: [50000], status: "Hoạt động" },
    { name: "Hấp dầu", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN2"], priceCN2: 250000, priceCN3: 0, additional: [250000], status: "Hoạt động" },
    { name: "kẹp giả", catId: catHair.id, serviceCategory: "Cơ bản", branches: ["CN3"], priceCN2: 0, priceCN3: 10000, additional: [100000], status: "Hoạt động" },

    // Hoá chất
    { name: "Nhuộm đen", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 300000, priceCN3: 300000, additional: [100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000 ], status: "Ngừng" },
    { name: "Nhuộm màu", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 500000, priceCN3: 500000, additional: [200000, 250000, 300000, 350000, 400000 ], status: "Hoạt động" },
    { name: "Tẩy tóc", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 300000, priceCN3: 300000, additional: [150000], status: "Hoạt động" },
    { name: "Uốn", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 300000, priceCN3: 300000, additional: [200000, 250000, 300000, 350000, 380000, 400000 ], status: "Hoạt động" },
    { name: "Duỗi", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 300000, priceCN3: 300000, additional: [200000, 250000, 300000, 350000, 400000, 450000, 500000], status: "Hoạt động" },
    { name: "Ép side", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 250000, priceCN3: 250000, additional: [270000, 350000], status: "Hoạt động" },
    { name: "Móc ligh", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 70000, priceCN3: 70000, additional: [70000, 100000], status: "Hoạt động" },
    { name: "Phục hồi tóc", catId: catChemical.id, serviceCategory: "Hoá chất", branches: ["CN2", "CN3"], priceCN2: 170000, priceCN3: 170000, additional: [], status: "Hoạt động" }
  ];

  let service1: any;
  let service3: any;

  for (const s of serviceData) {
    if (s.branches.includes("CN2")) {
      const created = await prisma.service.create({
        data: {
          tenantId: tenant1.id,
          branchId: branch1a.id,
          name: s.name,
          serviceCategory: s.serviceCategory,
          categoryId: s.catId,
          price: s.priceCN2,
          additionalPrices: s.additional,
          duration: 30,
          deletedAt: s.status === "Ngừng" ? new Date() : null
        }
      });
      if (s.name === "Hớt tóc") {
        service1 = created;
      }
      if (s.name === "Gội đầu massage") {
        service3 = created;
      }
    }
    if (s.branches.includes("CN3")) {
      await prisma.service.create({
        data: {
          tenantId: tenant1.id,
          branchId: branch1b.id,
          name: s.name,
          serviceCategory: s.serviceCategory,
          categoryId: s.catId,
          price: s.priceCN3,
          additionalPrices: s.additional,
          duration: 30,
          deletedAt: s.status === "Ngừng" ? new Date() : null
        }
      });
    }
  }

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

  const productData = [
    { name: "Gôm xịt", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Sáp Vuốt Tóc", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Keo Vuốt Tóc", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Wax H&T đen nhỏ", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Wax H&T đen lớn", branches: ["CN2", "CN3"], costPrice: 270000, sellPrice: 270000, status: "Hoạt động" },
    { name: "Wax H&T xanh nhỏ", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Wax H&T xanh lớn", branches: ["CN2", "CN3"], costPrice: 270000, sellPrice: 270000, status: "Hoạt động" },
    { name: "Wax H&T trắng nhỏ", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Wax H&T trắng lớn", branches: ["CN2", "CN3"], costPrice: 270000, sellPrice: 270000, status: "Hoạt động" },
    { name: "Wax Vol Canic", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Waz Crew trắng", branches: ["CN2", "CN3"], costPrice: 200000, sellPrice: 200000, status: "Hoạt động" },
    { name: "Gôm Reuzel xanh lá", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Gôm Reuzel xanh dương", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Gôm Perfect đen", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Gôm Butterfly Bạc nhỏ", branches: ["CN2", "CN3"], costPrice: 100000, sellPrice: 100000, status: "Hoạt động" },
    { name: "Tinh dầu dưỡng tóc", branches: ["CN2", "CN3"], costPrice: 200000, sellPrice: 200000, status: "Hoạt động" },
    { name: "Nước hoa", branches: ["CN2", "CN3"], costPrice: 170000, sellPrice: 170000, status: "Hoạt động" },
    { name: "Dụng cụ Ráy tai", branches: ["CN2", "CN3"], costPrice: 200000, sellPrice: 200000, status: "Hoạt động" },
    { name: "Dầu gội trị nấm", branches: ["CN3"], costPrice: 0, sellPrice: 90000, status: "Hoạt động" },
    { name: "Xịt tạo phồng tóc", branches: ["CN2"], costPrice: 120000, sellPrice: 120000, status: "Hoạt động" }
  ];

  for (const p of productData) {
    if (p.branches.includes("CN2")) {
      await prisma.inventory.create({
        data: {
          tenantId: tenant1.id,
          branchId: branch1a.id,
          name: p.name,
          costPrice: p.costPrice,
          sellPrice: p.sellPrice,
          quantity: 50,
          deletedAt: p.status === "Ngừng" ? new Date() : null
        }
      });
    }
    if (p.branches.includes("CN3")) {
      await prisma.inventory.create({
        data: {
          tenantId: tenant1.id,
          branchId: branch1b.id,
          name: p.name,
          costPrice: p.costPrice,
          sellPrice: p.sellPrice,
          quantity: 50,
          deletedAt: p.status === "Ngừng" ? new Date() : null
        }
      });
    }
  }


  const package1 = await prisma.servicePackage.create({
    data: {
      tenantId: tenant1.id,
      branchId: branch1a.id,
      name: "Combo Thư Giãn Dưỡng Sinh 5 Lần",
      description: "Thẻ gội đầu dưỡng sinh thảo dược combo 5 lần",
      price: 500000,
      discountAmount: 100000,
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
