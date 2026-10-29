import Image from "next/image";
import type { MediaView } from "@/lib/cms/collections";
import { cn } from "@/lib/utils";

/** Renders a media-library image with responsive sizing and the editor-chosen focal point. */
export function CmsImage({
  media, alt, decorative, sizes, priority, className,
}: { media: MediaView | undefined; alt: string; decorative?: boolean; sizes: string; priority?: boolean; className?: string }) {
  if (!media) return null;
  return (
    <Image
      src={media.url} alt={decorative ? "" : alt || media.alt} width={media.width} height={media.height}
      sizes={sizes} priority={priority}
      style={{ objectPosition: `${media.focal.x * 100}% ${media.focal.y * 100}%` }}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
