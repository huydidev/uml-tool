# CrystallineUML

**Web-based UML Conceptual Data Model Designer**

Ứng dụng web cho phép thiết kế UML CDM (Conceptual Data Model) trực quan trên trình duyệt. Hỗ trợ parse SQL DDL tự động sinh diagram, kéo-thả entity, quản lý version lịch sử và chia sẻ bản vẽ với thành viên khác.

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | ReactJS, React Flow, Zustand |
| Backend | Spring Boot 3.x |
| Database | MongoDB |
| Cache / Lock | Redis |
| Auth | Spring Security + JWT |
| Real-time | WebSocket STOMP |
| Build tool | Vite |

---

## Tính năng

### Vẽ diagram
- Kéo-thả entity vào canvas từ toolbox
- Tạo relationship: Association, Inheritance, Aggregation, Composition
- Chỉnh sửa entity, attribute, method trực tiếp trên node
- Hỗ trợ 2 chế độ xem: Class và ERD

### SQL → Diagram
- Nhập SQL DDL trực tiếp vào editor (CodeMirror)
- Tự động parse và sinh UML diagram theo thời gian thực
- Đồng bộ 2 chiều: kéo node trên canvas cập nhật SQL, sửa SQL cập nhật canvas

### Lưu trữ & Version
- Auto-save debounce 1.5s sau mỗi thay đổi
- Lưu version thủ công với nhãn tùy chọn
- Xem lịch sử 50 version, restore về bất kỳ checkpoint nào

### Chia sẻ
- Share diagram qua link với token
- Phân quyền Viewer / Editor cho từng thành viên
- Quản lý danh sách người được chia sẻ

### Xác thực
- Đăng ký / đăng nhập bằng email + password
- JWT authentication, token blacklist qua Redis khi logout

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- Java 17+
- MongoDB
- Redis

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Mặc định chạy tại `http://localhost:5173`

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Mặc định chạy tại `http://localhost:8080`

### Cấu hình `application.properties`

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/humltool
spring.data.redis.host=localhost
spring.data.redis.port=6379
humltool.jwt.secret=your_secret_key_minimum_64_characters_long
humltool.jwt.expirationMs=864000000
```

### Vite proxy (frontend/vite.config.js)

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

---

## Cấu trúc thư mục

```
src/
├── apps/
│   ├── auth/           # Đăng nhập, đăng ký
│   ├── home/           # Trang danh sách diagram
│   └── workspace/      # Editor chính
│       ├── canvas/     # ReactFlow canvas, node, edge
│       ├── layout/     # Header, SidePanel
│       ├── modals/     # Save, Share modal
│       └── panel/      # SQL editor panel
├── shared/
│   ├── constants/      # Theme, edge configs
│   ├── hooks/          # useResizable, useCollab
│   └── utils/          # SQL parser
└── router/             # App routing
```

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/diagrams` | Danh sách diagram của user |
| POST | `/api/diagrams` | Tạo diagram mới |
| GET | `/api/diagrams/:id` | Lấy diagram theo id |
| PUT | `/api/diagrams/:id` | Cập nhật diagram |
| DELETE | `/api/diagrams/:id` | Xóa diagram |
| POST | `/api/versions/save/:id` | Lưu version |
| GET | `/api/versions/history/:id` | Lịch sử version |
| POST | `/api/share/:id` | Chia sẻ diagram |
| GET | `/api/share/:id/users` | Danh sách người được share |


