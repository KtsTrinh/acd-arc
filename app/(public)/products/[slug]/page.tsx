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
  return {
    title: product.name,
    description: product.shortDesc || product.description || "",
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description || "",
      url: `https://acd-arc.com/products/${params.slug}`,
      images: img ? [{ url: img }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDesc || product.description || "",
      images: img ? [img] : [],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailClient params={params} />;
}
