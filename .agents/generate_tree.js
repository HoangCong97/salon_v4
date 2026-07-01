const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['.git', 'node_modules', '.turbo', 'dist', '.agents', '.ai_env', 'build']);

const PATH_DESCRIPTIONS = {
  'apps': 'Thư mục chứa các ứng dụng độc lập trong hệ thống',
  'apps/backend-api': 'Dịch vụ Backend API sử dụng NestJS và Prisma',
  'apps/backend-api/src': 'Mã nguồn chính của backend NestJS',
  'apps/backend-api/src/import-engine': 'Module import dữ liệu từ Excel/CSV',
  'apps/backend-api/src/staff.controller.ts': 'API quản lý nhân viên và phân quyền chức vụ',
  'apps/backend-api/src/turns.controller.ts': 'API quản lý hàng đợi và lượt xoay tua thợ',
  'apps/tenant-portal': 'Ứng dụng quản trị Salon cho chủ salon/quản lý (React + Vite)',
  'apps/tenant-portal/src/pages/desktop/StaffManagement': 'Trang quản lý nhân viên, chức vụ, xoay tua thợ',
  'apps/tenant-portal/src/pages/desktop/StaffManagement/useStaffManagement.ts': 'Custom Hook chứa logic nghiệp vụ và state của StaffManagement',
  'apps/tenant-portal/src/pages/desktop/StaffManagement/index.tsx': 'Giao diện chính hiển thị StaffManagement (đã refactor tinh gọn)',
  'apps/customer-booking': 'Cổng đặt lịch hẹn online cho khách hàng (React/Next.js)',
  'apps/internal-admin': 'Trang quản trị SaaS dành cho Super Admin quản lý gói đăng ký',
  'apps/tenant-portal/src/components/desktop/ui': 'Thư mục chứa các component nguyên tử dùng chung cho Desktop (Button, Input, Modal, Tooltip)',
  'apps/tenant-portal/src/components/desktop/ui/Button.tsx': 'Component Button tái sử dụng dùng CSS Modules',
  'apps/tenant-portal/src/components/desktop/ui/Input.tsx': 'Component Input tái sử dụng dùng CSS Modules',
  'apps/tenant-portal/src/components/desktop/ui/Modal.tsx': 'Component Modal tái sử dụng dùng CSS Modules',
  'apps/tenant-portal/src/components/desktop/ui/Tooltip.tsx': 'Component Tooltip tái sử dụng dùng CSS Modules',
  'packages': 'Thư mục chứa các package dùng chung toàn dự án',
  'packages/database': 'Package quản lý kết nối cơ sở dữ liệu và Schema Prisma',
  'packages/database/prisma/schema.prisma': 'File schema cơ sở dữ liệu chính của dự án',
  'packages/shared-types': 'Các kiểu dữ liệu (TypeScript Interfaces) dùng chung',
  'packages/shared-utils': 'Các hàm tiện ích chia sẻ toàn hệ thống',
  '.agents': 'Thư mục cấu hình và tài liệu hướng dẫn AI Agent',
  '.agents/AGENTS.md': 'Quy tắc lập trình và tiêu chuẩn code bắt buộc cho AI',
  '.agents/AI_CONTEXT.md': 'Bản đồ tổng quan dự án và các luồng nghiệp vụ chính',
  '.agents/Atomic_UI_Components.md': 'Danh sách và quy chuẩn thiết kế các thành phần UI nguyên tử (Atoms)',
  '.agents/README.md': 'Hướng dẫn dành cho lập trình viên để tương tác với AI',
  '.agents/project_structure.txt': 'Sơ đồ cây cấu trúc thư mục kèm mô tả chi tiết'
};

function generateTree(dir, rootDir, prefix = '') {
  let result = '';
  try {
    const items = fs.readdirSync(dir).filter(item => !IGNORE_DIRS.has(item));
    
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      const connector = isLast ? '\\---' : '+---';
      const childPrefix = isLast ? '    ' : '|   ';
      
      // Calculate relative path for description lookup
      const relativePath = path.relative(rootDir, itemPath).replace(/\\/g, '/');
      const desc = PATH_DESCRIPTIONS[relativePath] ? `  <-- ${PATH_DESCRIPTIONS[relativePath]}` : '';
      
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

const rootDir = path.resolve(__dirname, '..');
const treeText = `Folder PATH listing with descriptions\nC:.\n` + generateTree(rootDir, rootDir);
fs.writeFileSync(path.join(rootDir, '.agents', 'project_structure.txt'), treeText);
console.log('Successfully generated .agents/project_structure.txt');
