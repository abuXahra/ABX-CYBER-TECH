import type { MediaView } from "@/lib/cms/collections";
import { CmsImage } from "@/components/cms/cms-image";

/**
 * CSS laptop + smartphone frames. Used when the administrator supplies replacement screenshots in the CMS
 * (hero → "Laptop screen" / "Phone screen"). Screens are ordinary media-library images.
 */
export function DeviceFrames({ laptop, phone, laptopAlt, phoneAlt }: { laptop?: MediaView; phone?: MediaView; laptopAlt: string; phoneAlt: string }) {
  return (
    <div className="relative h-full w-full">
      <span aria-hidden className="absolute right-[18%] top-[2%] size-[26%] rounded-full bg-accent/30" />
      <span aria-hidden className="absolute right-[3%] top-[14%] size-[22%] rounded-full bg-primary/25" />
      <div className="absolute left-[7%] top-[10%] w-[66%] drop-shadow-2xl">
        <div className="rounded-[0.9rem] bg-dark p-[0.45rem] pb-[0.45rem] ring-1 ring-black/30">
          <div className="aspect-[16/10] overflow-hidden rounded-[0.4rem] bg-surface">
            {laptop && <CmsImage media={laptop} alt={laptopAlt} sizes="(min-width:900px) 40vw, 90vw" className="object-top" />}
          </div>
        </div>
        <div className="mx-auto h-[0.8rem] w-[112%] -translate-x-[5.4%] rounded-b-[1.2rem] bg-gradient-to-b from-line to-foreground/30" />
      </div>
      <div className="absolute right-[9%] top-[22%] w-[17%] drop-shadow-2xl">
        <div className="rounded-[1.6rem] bg-dark p-[0.35rem] ring-1 ring-black/30">
          <div className="aspect-[9/19] overflow-hidden rounded-[1.3rem] bg-surface">
            {phone && <CmsImage media={phone} alt={phoneAlt} sizes="(min-width:900px) 12vw, 40vw" className="object-top" />}
          </div>
        </div>
      </div>
    </div>
  );
}
