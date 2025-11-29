import { useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";

type CarouselItem = {
  url?: string;
  mediaId?: string;
  type: "image" | "video";
  caption?: string;
  alt?: string;
};

type BlockCarouselProps = {
  items: CarouselItem[];
  aspectRatio?: "video" | "square" | "wide";
};

const ratioClass: Record<NonNullable<BlockCarouselProps["aspectRatio"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[4/3]",
};

export function BlockCarousel({
  items,
  aspectRatio = "video",
}: BlockCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ loop: items.length > 1 });

  const slides = useMemo(
    () =>
      items.map((item, index) => (
        <div
          className="embla__slide flex-[0_0_100%] px-3"
          key={`${item.mediaId || item.url || index}`}
        >
          <div
            className={`${ratioClass[aspectRatio]} rounded-2xl overflow-hidden border border-brand-border bg-muted/20`}
          >
            {item.type === "video" ? (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                controls
                data-media
              />
            ) : (
              <img
                src={item.url}
                alt={item.alt || "Carousel media"}
                className="w-full h-full object-cover"
                data-media
                loading="lazy"
              />
            )}
          </div>
          {item.caption && (
            <p className="text-sm text-brand-text/80 text-center mt-3">
              {item.caption}
            </p>
          )}
        </div>
      )),
    [items, aspectRatio],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container flex">{slides}</div>
    </div>
  );
}









