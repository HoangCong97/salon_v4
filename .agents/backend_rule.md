# QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN CODE BACKEND (NestJS + Prisma)

Khi làm việc với Backend trong dự án này, AI Agent phải tuân thủ nghiêm ngặt các quy tắc lập trình dưới đây để đảm bảo chất lượng, tốc độ và tính dễ bảo trì của hệ thống.

---

### 1. General
- TypeScript `strict: true`
- ESLint + Prettier
- SOLID, DRY, KISS
- Không dùng `any` nếu không cần.

### 2. Project Structure
```text
src/
 ├── app.module.ts
 ├── common/
 ├── config/
 ├── prisma/
 ├── modules/
 │    └── users/
 │         ├── controller/
 │         ├── service/
 │         ├── repository/
 │         ├── dto/
 │         ├── entities/
 │         └── users.module.ts
 └── main.ts
```

### 3. Naming
- Module: `UsersModule`
- Controller: `UsersController`
- Service: `UsersService`
- Repository: `UsersRepository`
- DTO: `CreateUserDto`
- Entity: `UserEntity`

### 4. Layer Architecture
```
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
   ↓
Database
```

- Không truy cập Prisma trực tiếp từ Controller.
- Business logic chỉ nằm trong Service.

### 5. Controller
- Chỉ nhận request và trả response.
- Validate bằng DTO.
- Không chứa business logic.

### 6. Service
- Chứa toàn bộ business logic.
- Gọi Repository.
- Không thao tác HTTP.

### 7. Repository
- Chỉ truy cập dữ liệu.
- Không chứa business logic.

### 8. Prisma
- Không viết SQL nếu Prisma hỗ trợ.
- Migration bằng Prisma Migrate.
- Không sửa migration đã release.

### 9. DTO
- Validate bằng class-validator.
- Luôn khai báo kiểu dữ liệu.

### 10. Error Handling
- Dùng HttpException phù hợp.
- Không để catch rỗng.
- Không trả stack trace cho client.

### 11. Authentication
- JWT.
- Password hash bằng bcrypt.
- Authorization bằng Guard.

### 12. Logging
- Dùng Logger của NestJS.
- Không để console.log trong production.

### 13. Configuration
- Biến môi trường qua ConfigModule.
- Không hard-code secret.

### 14. API
- RESTful.
- Danh từ số nhiều.
- HTTP Method đúng chuẩn.
- Có version API nếu cần.

### 15. Database
- Soft delete nếu phù hợp.
- Index cho cột thường truy vấn.
- Transaction cho thao tác nhiều bước.

### 16. Testing
- Unit Test Service.
- Integration Test API.
- Mock Repository.

### 17. Security
- Validation Pipe.
- Helmet.
- CORS.
- Rate Limit.
- Sanitize Input.

### 18. Code Review Checklist
- Không any.
- Không console.log.
- Không business logic trong Controller.
- Repository không chứa logic nghiệp vụ.
- Validate đầy đủ.
- Có xử lý lỗi.
- Có transaction nếu cần.
- Có test.

### 19. Recommended Stack
- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- class-validator
- class-transformer
- Swagger
- ESLint
- Prettier
- Vitest hoặc Jest

### AI Rules
AI phải:
1. Tuân thủ kiến trúc Controller → Service → Repository → Prisma.
2. Không truy cập Prisma từ Controller.
3. Không viết business logic trong Controller.
4. Sinh DTO đầy đủ.
5. Validate toàn bộ input.
6. Không hard-code secret.
7. Không dùng any nếu không cần.
8. Ưu tiên code dễ đọc, dễ mở rộng và dễ test.
