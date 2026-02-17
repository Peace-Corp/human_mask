import { notFound } from "next/navigation";
import { getProductById, getProductVariants } from "@/lib/fetchers";
import ProductDetail from "./ProductDetail";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [product, variants] = await Promise.all([
    getProductById(id),
    getProductVariants(id),
  ]);

  if (!product) return notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-16 md:px-6 md:pt-20">
        <ProductDetail product={product} variants={variants} />
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <Footer />
      </div>
    </div>
  );
}
