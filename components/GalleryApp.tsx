"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { PokoWindow, type PokoWindowHandle } from "@/components/PokoWindow";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { cx } from "@/lib/cx";

type GalleryAppProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  zIndex: number;
  active: boolean;
  onFocus: () => void;
};

export const GalleryApp = forwardRef<PokoWindowHandle, GalleryAppProps>(function GalleryApp({
  open,
  onOpenChange,
  zIndex,
  active,
  onFocus
}, ref) {
  const windowRef = useRef<PokoWindowHandle | null>(null);
  const {
    images,
    currentIndex,
    currentImage,
    isSlideshowPlaying,
    showImage,
    nextImage,
    previousImage,
    startSlideshow,
    toggleSlideshow
  } = useGalleryImages();

  useImperativeHandle(ref, () => ({
    restore: (focus?: () => void) => windowRef.current?.restore(focus)
  }), []);

  useEffect(() => {
    startSlideshow();
  }, [startSlideshow]);

  return (
    <PokoWindow
      ref={windowRef}
      open={open}
      onOpenChange={onOpenChange}
      title="Poko Gallery"
      subtitle="VRChat Gallery"
      icon="GAL"
      zIndex={zIndex}
      active={active}
      initialBounds={{ top: 96, left: 632, width: 592, height: 536 }}
      onFocus={onFocus}
      actions={(
        <div className="flex items-center gap-2 text-xs text-current/55">
          <button className="slideshow-toggle" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); toggleSlideshow(); }}>
            {isSlideshowPlaying ? "Pause" : "Play"}
          </button>
          <span>{currentIndex + 1} / {images.length}</span>
        </div>
      )}
    >
      <div className="gallery-layout grid h-full grid-cols-[minmax(0,1fr)_12.5rem] overflow-hidden">
        <section className="relative min-h-0 overflow-hidden bg-black/20">
          <img
            key={currentImage.src}
            className="gallery-main-image h-full w-full object-contain"
            src={currentImage.src}
            alt={currentImage.alt}
            decoding="async"
          />

          <div className="image-badge">{currentImage.source === "classic" ? "Classic" : "VRChat"}</div>
          <button className="nav-button left-4" type="button" aria-label="Previous image" onClick={previousImage}>&lsaquo;</button>
          <button className="nav-button right-4" type="button" aria-label="Next image" onClick={nextImage}>&rsaquo;</button>
        </section>

        <aside className="gallery-rail min-h-0 overflow-y-auto border-l p-3">
          {images.map((image, index) => (
            <button
              key={image.src}
              className={cx("thumb-button mb-2 block w-full overflow-hidden rounded-lg border text-left", index === currentIndex && "active")}
              type="button"
              onClick={() => showImage(index)}
            >
              <img className="aspect-video w-full object-cover" src={image.thumb} alt={image.alt} loading="lazy" decoding="async" />
              <span className="block px-2 py-1 text-[0.66rem] text-current/62">
                {image.source === "classic" ? "Classic" : "VRChat"} {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </aside>
      </div>
    </PokoWindow>
  );
});
