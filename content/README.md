# Nội dung CMS (CMS Content Snapshot)

Thư mục này chứa **ảnh chụp (snapshot) nội dung quản trị CMS** được xuất ra tự
động mỗi khi bạn lưu thay đổi trong trang quản trị.

| File | Nội dung |
| --- | --- |
| `site-settings.json` | Cấu hình hệ thống (tên studio, liên hệ, SEO, nền hero, mã nhúng...) |
| `projects.json` | Dự án kiến trúc kèm danh mục, ảnh bìa, thư viện ảnh và tags |
| `project-categories.json` | Danh mục dự án (Kim - Mộc - Thủy - Hỏa - Thổ) |
| `tags.json` | Thẻ (tags) dùng chung |
| `blog-posts.json` | Bài viết tạp chí kèm tác giả và tags |
| `products.json` | Sản phẩm CAD / model 3D / nội thất |
| `media.json` | Danh mục media trong Media Library |

## Vì sao có thư mục này?

Khi bạn thay đổi nội dung trong CMS và bấm **Đồng bộ mã nguồn**, toàn bộ dữ liệu
trên sẽ được ghi lại thành các file JSON trong thư mục này rồi **commit và push
lên GitHub**. Vercel liên kết với nhánh `main` nên sẽ **tự động deploy lại**.

Nhờ vậy mã nguồn trong VSCode luôn phản ánh đúng nội dung đang chạy trên
website, và mọi thay đổi đều có lịch sử trong Git.

## Cơ chế

- Trang quản trị → `/admin/sync` → nút **Đồng bộ ngay** (hoặc bật *tự động đồng bộ*).
- Hoặc dùng lệnh trong VSCode:
  ```bash
  npm run cms:sync              # kéo về + commit + push
  npm run cms:sync -- --dry-run # chỉ kéo về, không commit
  ```

## Lưu ý bảo mật

Không export những dữ liệu nhạy cảm: tài khoản người dùng (kể cả mật khẩu
đã mã hóa), đơn hàng, token tải file và khóa file sản phẩm (`fileKey`).
