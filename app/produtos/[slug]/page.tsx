import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, listProducts } from "../../../db/products";
import ProductDetail from "./product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug:string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title:"Produto não encontrado | Mimo Cherry" };
  return { title:`${product.name} | Mimo Cherry`, description:product.description, openGraph:{ title:product.name, description:product.description, images:[] }, twitter:{ title:product.name, description:product.description, images:[] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug:string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const recommendations = (await listProducts()).filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);
  return <ProductDetail product={product} recommendations={recommendations}/>;
}
