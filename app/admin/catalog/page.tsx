import AdminCatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

/**
 * Danh Mục Sản Phẩm (CMS) — hợp nhất 3 mục cũ:
 * Dự Án Kiến Trúc + Danh Mục Dự Án + Sản Phẩm & File 3D/CAD.
 * 4 nhóm: Dự án kiến trúc, Nội thất, Xây dựng, File kỹ thuật số.
 */
export default function AdminCatalogPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab;
  return <AdminCatalogClient initialTab={tab} />;
}
