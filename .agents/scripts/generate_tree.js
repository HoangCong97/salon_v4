const fs = require("fs");
const path = require("path");

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".turbo",
  "dist",
  ".next",
  ".agents_exam",
  ".codegraph",
  "build",
  "coverage",
]);

const PATH_DESCRIPTIONS = {
  apps: "Thư mục chứa các ứng dụng độc lập trong hệ thống Monorepo",
  "apps/backend-api": "Dịch vụ Backend API Gateway sử dụng NestJS và Prisma",
  "apps/backend-api/src": "Mã nguồn chính của backend NestJS",
  "apps/tenant-portal": "Ứng dụng quản trị Salon cho Chủ salon / Quản lý / Thu ngân (React + Vite)",
  "apps/customer-booking": "Cổng đặt lịch hẹn online cho khách hàng (React / Next.js App Router)",
  "apps/internal-admin": "Trang quản trị SaaS dành cho Super Admin",
  packages: "Thư mục chứa các package dùng chung toàn dự án",
  "packages/database": "Package quản lý kết nối CSDL và Prisma Schema (@salon/database)",
  "packages/database/prisma/schema.prisma": "File schema cơ sở dữ liệu chính của dự án",
  "packages/shared-types": "Các khai báo kiểu dữ liệu (TypeScript Interfaces) dùng chung (@salon/shared-types)",
  "packages/shared-utils": "Các hàm tiện ích chia sẻ toàn hệ thống (@salon/shared-utils)",
  ".agents": "Thư mục cấu hình và tài liệu quy chuẩn cho AI Agent",
  ".agents/AI_CONTEXT.md": "Bản đồ tổng quan dự án và các luồng nghiệp vụ chính",
  ".agents/rules": "Tập hợp các quy chuẩn lập trình chuyên sâu (Backend, Frontend, Database, Monorepo)",
  ".agents/skills": "Tập hợp các kỹ năng và quy trình tự động hóa tác vụ cho AI Agent",
  "GEMINI.md": "Quy tắc chỉ dẫn toàn cục cho AI Agent tại workspace root",
};

function generateTree(dir, rootDir, prefix = "") {
  let result = "";
  try {
    const items = fs.readdirSync(dir).filter((item) => !IGNORE_DIRS.has(item));

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      const connector = isLast ? "\\---" : "+---";
      const childPrefix = isLast ? "    " : "|   ";

      const relativePath = path.relative(rootDir, itemPath).replace(/\\/g, "/");
      const desc = PATH_DESCRIPTIONS[relativePath]
        ? `  <-- ${PATH_DESCRIPTIONS[relativePath]}`
        : "";

      if (stats.isDirectory()) {
        result += `${prefix}${connector}${item}${desc}\n`;
        result += generateTree(itemPath, rootDir, `${prefix}${childPrefix}`);
      } else {
        result += `${prefix}${connector}${item}${desc}\n`;
      }
    });
  } catch (e) {
    // Ignore errors
  }
  return result;
}

const rootDir = path.resolve(__dirname, "../..");
const treeText =
  `Folder PATH listing with descriptions\nC:.\n` +
  generateTree(rootDir, rootDir);

const outputDir = path.join(rootDir, ".agents");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, "project_structure.txt"),
  treeText,
);
console.log("Successfully generated .agents/project_structure.txt");
