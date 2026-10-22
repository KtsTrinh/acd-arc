import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Đã gộp vào trang Danh Mục Sản Phẩm */
export default function AdminProductsRedirect() {
  redirect("/admin/catalog");
}
