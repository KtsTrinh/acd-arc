import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

async function getProduct(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://acd-arc.com";
  const res = await fetch(`${base}/api/products/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Sản phẩm" };
  const img = product.thumbnail
    ? product.thumbnail.startsWith("http")
      ? product.thumbnail
      : `https://acd-arc.com${product.thumbnail}`
    : "";
  const price = product.priceAfterDiscount ?? product.price;
  const tags = (product.tags || []).map((t: any) => t?.tag?.name || t?.name).filter(Boolean).join(", ");
  const parts = [
    product.shortDesc || product.description,
    price ? `Giá: ${price}` : "",
    product.productCategory ? `Danh mục: ${product.productCategory}` : "",
    product.location ? `Địa điểm: ${product.location}` : "",
    product.client ? `Chủ đầu tư: ${product.client}` : "",
    product.year ? `Năm: ${product.year}` : "",
    product.floors ? `Tầng: ${product.floors}` : "",
    product.landArea ? `Đất: ${product.landArea}m²` : "",
    product.buildingArea ? `Sàn: ${product.buildingArea}m²` : "",
    tags ? `Tags: ${tags}` : "",
  ].filter(Boolean);
  const desc = parts.join(" | ");
  return {
    alternates: { canonical: `/products/${params.slug}` },
    title: product.name,
    description: desc,
    openGraph: {
      title: product.name,
      description: desc,
      url: `https://acd-arc.com/products/${params.slug}`,
      images: img ? [{ url: img }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc,
      images: img ? [img] : [],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailClient params={params} />;
}
