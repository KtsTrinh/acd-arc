# ACD Architecture & Interior Design System

> **ACD = Portfolio Kiến Trúc + CMS Quản Trị + Media Library Dùng Chung + E-Commerce Số Hóa**  
> Dự án website kiến trúc động (dynamic), responsive hoàn chỉnh, code sạch, hiệu ứng mượt mà và tối ưu chi phí với 100% công nghệ mã nguồn mở.

---

## 🌊 1. Phong Cách Thiết Kế: Phong Thủy Mệnh Thủy (Water Element)

Giao diện website được thiết kế đặc thù cho gia chủ và thương hiệu **Mệnh Thủy**:
- **Tone màu chủ đạo**: Xanh đại dương huyền bí (Midnight Deep Blue `#070d1a`, Mariana Obsidian `#040810`, Dark Maritime Slate `#0b1426`).
- **Yếu tố tương sinh (Kim sinh Thủy)**: Kim loại ánh bạc phay xước, bạch kim, chrome sáng và kính Low-E tràn viền (`#f8fafc`, `#e2e8f0`, `#cbd5e1`).
- **Ánh sáng điểm xuyết**: Ánh sáng băng tuyết và phản quang mặt nước (Glacial Cyan `#06b6d4`, Sky Aqua `#38bdf8`, Cerulean Blue `#0ea5e9`).
- **Trải nghiệm Hero**: Khi vào trang chủ là một ảnh hero toàn màn hình ấn tượng kết hợp các thẻ hạng mục nhỏ (Biệt Thự & Villa, Nhà Phố, Nội Thất Cao Cấp, Penthouse, Resort Sinh Thái) cho phép bấm vào từng hạng mục ngay lập tức.

---

## 🛠️ 2. Công Nghệ & Kiến Trúc Kỹ Thuật

| Thành phần | Công nghệ sử dụng | Mục đích |
| :--- | :--- | :--- |
| **Frontend & SSR** | Next.js 14 (App Router) + React 18 | Dynamic web, SEO tốt, hiệu năng cao |
| **Ngôn ngữ** | TypeScript | Kiểm soát kiểu chặt chẽ, code sạch, dễ mở rộng |
| **Styling** | Tailwind CSS + Custom Water Theme | Giao diện Mệnh Thủy, glassmorphism, hiệu ứng nhẹ |
| **Kéo-thả** | `@dnd-kit/core` + `@dnd-kit/sortable` | Sắp xếp ảnh Gallery trong CMS không cần reload |
| **Database** | PostgreSQL 16 (Docker Compose) | Cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ an toàn |
| **ORM** | Prisma ORM | Quản lý schema, migrations và type-safe query |
| **Media Library** | Self-hosted + Physical/Cloud Abstraction | Thư viện dùng chung, liên kết qua `mediaId` đồng bộ toàn hệ thống |
| **E-Commerce & Download** | Tokenized Secure Download Stream | Bán file CAD/3D, bảo mật link 72h, max 5 lần tải |
| **Xác thực** | JWT + HTTP-only Cookie + Bcrypt | Phân quyền bảo mật USER & ADMIN |
| **Giỏ hàng** | Zustand (Persistent LocalStorage) | Quản lý giỏ hàng mượt mà không độ trễ |

---

## 📂 3. Cấu Trúc Thư Mục Dự Án

```
acd-website/
├── app/
│   ├── (public)/              # Giao diện khách hàng
│   │   ├── page.tsx           # Trang chủ (Hero lớn + 5 hạng mục nhanh + dự án + store)
│   │   ├── projects/          # Danh sách & chi tiết dự án kèm Lightbox Gallery
│   │   ├── products/          # Kho tài nguyên CAD, model 3D, nội thất
│   │   ├── cart/              # Giỏ hàng tài nguyên
│   │   ├── checkout/          # Thanh toán & quét mã VietQR tự động
│   │   ├── orders/[id]/       # Xác nhận đơn hàng & trung tâm tải file bảo mật
│   │   ├── account/           # Quản lý file đã mua, đếm ngược thời gian link tải
│   │   └── blog/              # Tạp chí kiến trúc & phong thủy
│   ├── (auth)/
│   │   ├── login/             # Đăng nhập (kèm nút đăng nhập nhanh Admin/User)
│   │   └── register/          # Đăng ký tài khoản mới
│   ├── admin/                 # Hệ thống quản trị CMS
│   │   ├── page.tsx           # Dashboard thống kê doanh thu & đơn hàng
│   │   ├── projects/          # Quản lý dự án & Gallery kéo-thả dnd-kit
│   │   ├── categories/        # Quản lý danh mục công trình
│   │   ├── products/          # Quản lý file CAD/3D và định dạng
│   │   ├── orders/            # Duyệt đơn hàng & cấp quyền tải token
│   │   ├── media/             # Thư viện Media dùng chung (Upload + Pinterest)
│   │   ├── blog/              # Soạn thảo bài viết tạp chí
│   │   ├── tags/              # Quản lý thẻ tag phân loại
│   │   └── users/             # Quản lý người dùng & phân quyền ADMIN
│   └── api/                   # REST Route Handlers
│       ├── auth/
│       ├── media/
│       ├── projects/
│       ├── products/
│       ├── orders/
│       └── downloads/[token]/ # Stream file an toàn qua mã token (không lộ link gốc)
├── components/
│   ├── admin/SortableGallery.tsx   # Gallery kéo-thả @dnd-kit
│   ├── gallery/LightboxGallery.tsx # Xem ảnh fullscreen, phím mũi tên & swipe
│   ├── media/MediaPickerModal.tsx  # Modal chọn ảnh dùng chung toàn hệ thống
│   ├── cart/CartDrawer.tsx         # Giỏ hàng trượt
│   └── layout/Navbar.tsx & Footer.tsx
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # Bcrypt & JWT verification
│   ├── storage.ts             # Lưu trữ ảnh vật lý & private files CAD/3D
│   ├── downloads.ts           # Sinh & kiểm tra token tải 72h / 5 lần
│   ├── cart.ts                # Zustand cart store
│   └── utils.ts               # Slugify tiếng Việt, format VND
├── prisma/
│   ├── schema.prisma          # PostgreSQL database schema
│   └── seed.js                # Dữ liệu khởi tạo (Projects, Media, CAD, Orders)
├── public/uploads/            # Nơi lưu ảnh vật lý người dùng upload
├── storage/private/           # Nơi lưu file CAD/3D bản quyền (không public URL)
├── docker-compose.yml         # Container PostgreSQL 16
└── middleware.ts              # Phân quyền Edge Middleware (/admin/*, /account/*)
```

---

## 🚀 4. Hướng Dẫn Khởi Chạy Dự Án

### Yêu cầu tiên quyết:
- **Node.js**: v18+ hoặc v20+ (Hiện đã tương thích cả Node v26)
- **Docker & Docker Compose**: Để chạy PostgreSQL container

### Bước 1: Khởi động cơ sở dữ liệu PostgreSQL
```bash
docker compose up -d
```
*(Cơ sở dữ liệu PostgreSQL 16 sẽ tự động chạy tại cổng `5432:5432`)*

### Bước 2: Đồng bộ cấu trúc Database & Nạp dữ liệu mẫu
```bash
npx prisma db push
node prisma/seed.js
```
*(Lệnh này sẽ nạp sẵn dự án biệt thự, ảnh kiến trúc Pinterest tuyển chọn, tài nguyên CAD, sản phẩm 3D và các tài khoản mẫu)*

### Bước 3: Khởi động máy chủ phát triển
```bash
npm run dev
```
Mở trình duyệt truy cập: **`http://localhost:3000`**

---

## 🔑 5. Tài Khoản Đăng Nhập Mẫu

Trang đăng nhập (`/login`) có tích hợp sẵn 2 nút click nhanh:

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản Trị (ADMIN)** | `admin@acd.vn` | `admin123` | Toàn quyền Dashboard, CMS, Media, Projects, Orders |
| **Khách Hàng (USER)** | `khachhang@gmail.com` | `user123` | Xem dự án, giỏ hàng, thanh toán, nhận link tải 72h |

---

## 💡 6. Các Tính Năng Nổi Bật

### 1. Media Library Dùng Chung Toàn Hệ Thống
- Upload trực tiếp file ảnh vật lý lưu vào thư mục `public/uploads`.
- Import nhanh URL hình ảnh chất lượng cao từ Pinterest / Unsplash / CDN.
- Đổi tên file (filename) và thuộc tính SEO (alt) ngay trên giao diện.
- **Tính năng đồng bộ**: Tất cả các Project, Cover, Gallery, Blog và Product chỉ tham chiếu tới `mediaId`. Khi đổi tên file media, toàn bộ những nơi đang hiển thị ảnh này đều tự động đồng bộ mà không cần sửa thủ công.

### 2. Gallery Kéo - Thả Bằng `@dnd-kit`
- Tích hợp `@dnd-kit/core` và `@dnd-kit/sortable` trong Admin Project.
- Kéo thả mượt mà để thay đổi vị trí thứ tự ảnh (`sortOrder`).
- Nhấn ngôi sao để đặt bất kỳ ảnh nào làm **Ảnh Cover**.
- Thêm ảnh hàng loạt từ Media Library hoặc xóa ảnh mà **không cần reload trang**.

### 3. Quy Trình Bán File CAD / Model 3D Bảo Mật
- Không bao giờ để link file thật dạng public (`/files/villa-cad.zip`).
- Tách bạch kho `public` (ảnh giao diện) và `private` (file sản phẩm nằm trong `storage/private`).
- Khi đơn hàng chuyển sang trạng thái **PAID** (quét mã VietQR hoặc Admin duyệt), hệ thống tự sinh mã Token bí mật:
  - Hiệu lực: **72 giờ**.
  - Giới hạn: **5 lượt tải**.
  - Khách hàng tải qua endpoint `/api/downloads/[token]` (máy chủ stream file sau khi kiểm tra quyền).

#   a c d - a r c  
 