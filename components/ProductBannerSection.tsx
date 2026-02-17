import Image from "next/image";

interface ProductBannerSectionProps {
  imageUrl: string;
}

export default function ProductBannerSection({
  imageUrl,
}: ProductBannerSectionProps) {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-12 md:px-8 md:py-20">
      <div className="relative w-full max-w-3xl">
        <Image
          src={imageUrl}
          alt="Product banner"
          width={960}
          height={540}
          className="h-auto w-full rounded-lg object-contain"
          priority
        />
      </div>
    </section>
  );
}
