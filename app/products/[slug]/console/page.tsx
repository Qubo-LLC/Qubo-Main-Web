import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EngineConsole from "@/components/EngineConsole";
import { PRODUCTS, getProduct } from "@/lib/products";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: `${p.name} Engine Console` } : {};
}

export default async function ConsolePage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <EngineConsole product={product} />;
}
