import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Đã gộp vào trang Danh Mục Sản Phẩm (tab Danh Mục & Dự Án Hiển Thị) */
export default function AdminProjectsRedirect() {
  redirect("/admin/catalog?tab=MANAGE");
}
