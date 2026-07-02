# TIÊU CHUẨN THIẾT KẾ CƠ SỞ DỮ LIỆU (Database Design Standards)

Khi thiết kế cơ sở dữ liệu trong dự án này, AI Agent phải tuân thủ nghiêm ngặt các nguyên tắc dưới đây để đảm bảo cơ sở dữ liệu dễ mở rộng, dễ bảo trì, hiệu năng cao và đảm bảo tính toàn vẹn dữ liệu.

---

### 1. Database First Principles
- Chuẩn hóa dữ liệu (ưu tiên 3NF, chỉ denormalize khi có lý do).
- Không lưu dữ liệu có thể tính toán.
- Tránh dữ liệu trùng lặp.
- Mỗi bảng chỉ đại diện cho một thực thể.

### 2. Naming Convention
#### Table
- snake_case, danh từ số nhiều.
- Ví dụ:
  - users
  - roles
  - bookings
  - booking_details

#### Column
- snake_case
- id
- user_id
- created_at
- updated_at
- deleted_at

#### Foreign Key
- <table>_id
Ví dụ:
- customer_id
- salon_id
- booking_id

### 3. Primary Key
- Mỗi bảng phải có khóa chính.
- Ưu tiên UUID hoặc BigInt theo yêu cầu hệ thống.
- Không dùng dữ liệu nghiệp vụ làm Primary Key.

### 4. Foreign Key
- Luôn khai báo quan hệ.
- Thiết lập ON DELETE/UPDATE phù hợp.
- Không tạo orphan record.

### 5. Timestamp
Mỗi bảng nên có:
- created_at
- updated_at

Nếu hỗ trợ xóa mềm:
- deleted_at

### 6. Soft Delete
Ưu tiên:
- deleted_at DATETIME NULL

Không xóa vật lý nếu dữ liệu cần audit hoặc khôi phục.

### 7. Index
Tạo index cho:
- Foreign Key
- Cột tìm kiếm
- Cột lọc
- Cột sắp xếp
- Unique

Không tạo index dư thừa.

### 8. Unique Constraint
Ví dụ:
- email
- username
- phone (nếu yêu cầu)

### 9. Enum
Chỉ dùng cho giá trị ổn định.

Ví dụ:
- gender
- booking_status
- payment_status

Nếu danh sách có thể thay đổi, dùng bảng riêng.

### 10. Relationship
Ưu tiên mô hình:
- One-to-One
- One-to-Many
- Many-to-Many qua bảng trung gian.

Không lưu danh sách ID trong một cột.

### 11. Transaction
Sử dụng transaction khi:
- Ghi nhiều bảng.
- Thanh toán.
- Đặt lịch.
- Trừ tồn kho.

### 12. Audit
Nếu cần theo dõi:
- created_by
- updated_by
- deleted_by

### 13. Security
- Không lưu mật khẩu dạng plain text.
- Hash password.
- Không lưu secret trong database nếu không cần.
- Mã hóa dữ liệu nhạy cảm.

### 14. Performance
- Phân trang cho dữ liệu lớn.
- Tránh SELECT *.
- Chỉ lấy cột cần thiết.
- Tối ưu JOIN.
- Tránh N+1 Query.

### 15. Migration
- Database thay đổi qua Migration.
- Không sửa migration đã chạy production.
- Migration phải rollback được nếu có thể.

### 16. Prisma Guidelines
- Một model tương ứng một bảng.
- Khai báo relation đầy đủ.
- Sử dụng @@index, @@unique khi cần.
- Không bỏ relation chỉ vì tiện.

### 17. Common Tables
AI nên cân nhắc:
- users
- roles
- permissions
- user_roles
- files
- audit_logs
- notifications
- settings

### 18. Checklist
- Không dư dữ liệu.
- Không dư quan hệ.
- Có khóa chính.
- Có khóa ngoại.
- Có index hợp lý.
- Có timestamp.
- Có soft delete nếu cần.
- Chuẩn hóa dữ liệu.
- Không lưu dữ liệu tính toán.
- Có migration.

### AI Rules
AI phải:
1. Thiết kế theo chuẩn hóa trước, tối ưu sau.
2. Luôn khai báo Primary Key và Foreign Key.
3. Thêm index khi hợp lý.
4. Không tạo cột dư thừa.
5. Không lưu dữ liệu có thể suy ra.
6. Không lưu nhiều giá trị trong một cột.
7. Thiết kế quan hệ rõ ràng.
8. Hỗ trợ mở rộng trong tương lai.
9. Ưu tiên tính toàn vẹn dữ liệu hơn tối ưu sớm.
10. Khi dùng Prisma phải sinh model, relation và migration đúng chuẩn.
