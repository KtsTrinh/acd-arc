import AdminCatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

/** Danh mục sản phẩm (CMS) - quản lý theo nhóm/hạng mục sản phẩm. */
export default function AdminCatalogPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab;
  return <AdminCatalogClient initialTab={tab} />;
}
