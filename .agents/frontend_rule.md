# QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN CODE FRONTEND (React + TypeScript + CSS)

Khi làm việc với Frontend trong dự án này, AI Agent phải tuân thủ nghiêm ngặt các quy tắc lập trình dưới đây để đảm bảo chất lượng, tốc độ và tính dễ bảo trì của hệ thống.

---

### 1. Coding Style
- Dùng **Prettier** và **ESLint**.
- Không format thủ công.
- Quy ước đặt tên:
  - Component, Interface, Type, Enum: `PascalCase`
  - Hook: `useXxx`
  - Biến/Hàm: `camelCase`
  - Hằng số: `UPPER_SNAKE_CASE`

### 2. React
- Mỗi component chỉ có **một trách nhiệm**.
- Component nên nhỏ (≈100–200 dòng, cân nhắc tách nếu >300).
- Không dùng `any` cho props.
- Không truyền quá nhiều props, ưu tiên gom thành object.
- Tách JSX dài thành component con.

### 3. TypeScript
- `strict: true`
- Không dùng `any` nếu có thể.
- `interface` cho object.
- `type` cho Union/Intersection.
- Hạn chế ép kiểu (`as any`).

### 4. State
- Chỉ lưu state cần thiết.
- Không lưu dữ liệu có thể tính toán.
- Không mutate state.
- Không duplicate state.

### 5. API
- Không gọi API trực tiếp trong JSX.
- Tách tầng:
```
Page
 └── Hook
      └── Service
           └── API
```
- Khuyến nghị TanStack Query v5.

### 6. CSS
- Tên class rõ ràng.
- Không lạm dụng inline style.
- Dùng CSS Variables.
- Có CSS Reset.
- Ưu tiên sử dụng CSS Modules.

### 7. Thư mục
```text
src/
 ├── assets/             // Lưu trữ các tài nguyên tĩnh (static assets) phục vụ cho giao diện.
 ├── components/         // Chứa các Shared Components (UI Components dùng chung) toàn hệ thống.
 ├── constants/          // Lưu trữ tất cả các hằng số cố định trong hệ thống
 ├── features/           // Thư mục này chia mã nguồn theo tính năng/nghiệp vụ cụ thể thay vì chia theo loại file. Mỗi feature bên trong sẽ đóng gói toàn bộ UI, logic, types riêng của tính năng đó.
 ├── hooks/              // Chứa các Custom Hooks dùng chung cho toàn bộ dự án.
 ├── pages/              // Chứa các Component đại diện cho các trang (màn hình) lớn tương ứng
 ├── services/           // Quản lý tầng kết nối và cấu hình với môi trường bên ngoài
 ├── styles/             // Quản lý cấu hình giao diện và thẩm mỹ toàn cục (Global Styles) của trang web.
 ├── types/              // Chứa các khai báo kiểu dữ liệu (TypeScript Interfaces, Types, Enums) dùng chung ở nhiều nơi trong dự án, giúp code đạt chuẩn Type-Safety
 └── utils/              // Chứa các hàm bổ trợ, tiện ích tinh khiết
```

### 8. Import Order
1. React
2. Third-party
3. Components
4. Hooks
5. Utils
6. Types
7. CSS

### 9. Error Handling
- Không bỏ trống `catch`.
- Log lỗi.
- Hiển thị thông báo phù hợp.
- Xử lý Loading / Empty / Error.

### 10. Performance
- Chỉ dùng `React.memo`, `useMemo`, `useCallback` khi cần.
- Lazy Loading cho route/component lớn.
- Virtual List khi dữ liệu rất lớn.

### 11. Accessibility (A11y)
- Ưu tiên HTML semantic.
- Ảnh có `alt`.
- Form có `label`.
- Hỗ trợ điều hướng bằng bàn phím.

### 12. Testing
- Unit Test.
- Integration Test.
- Có thể bổ sung E2E.

### 13. Git
#### Branch
- feature/*
- bugfix/*
- hotfix/*
- release/*

#### Commit
- feat
- fix
- refactor
- docs
- style
- test
- chore
- perf
- build

### 14. Checklist trước khi Merge
- Không còn `any` không cần thiết.
- Không còn `console.log`.
- Không có dead code.
- Không có import thừa.
- Component đúng Single Responsibility.
- DRY.
- Responsive.
- Có Loading / Empty / Error.
- Đã chạy Format, Lint và Test.

### 15. Recommended Stack
- React
- TypeScript (`strict`)
- Vite
- TanStack Query v5
- React Router
- ESLint
- Prettier
- Vitest
- React Testing Library
- CSS thuần + CSS Variables
- Conventional Commits

### AI Rules
AI khi sinh mã phải:
1. Tuân thủ toàn bộ tiêu chuẩn trên.
2. Không sinh `any` nếu không có lý do.
3. Luôn ưu tiên code dễ đọc, dễ bảo trì.
4. Không tạo component quá lớn.
5. Không lặp logic.
6. Luôn xử lý Loading, Empty, Error khi gọi API.
7. Tuân thủ naming convention, import order và folder structure.
8. Chỉ tối ưu hiệu năng khi thực sự cần.
