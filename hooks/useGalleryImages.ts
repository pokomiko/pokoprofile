"use client";

import { useEffect, useMemo, useState } from "react";

export type GalleryImage = {
  src: string;
  thumb: string;
  alt: string;
  source: "classic" | "vrchat";
};

const classicImages: GalleryImage[] = Array.from({ length: 10 }, (_, index) => {
  const file = `slide${index + 1}.webp`;

  return {
    src: `/images/${file}`,
    thumb: `/images/${file}`,
    alt: `Classic Poko gallery ${index + 1}`,
    source: "classic"
  };
});

const vrchatImages: GalleryImage[] = Array.from({ length: 21 }, (_, index) => {
  const file = `vrchat-${String(index + 1).padStart(2, "0")}.webp`;

  return {
    src: `/images/vrchat/${file}`,
    thumb: `/images/vrchat/thumbs/${file}`,
    alt: `Poko VRChat gallery ${index + 1}`,
    source: "vrchat"
  };
});

const images = [...classicImages, ...vrchatImages];

export function useGalleryImages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const currentImage = images[currentIndex] ?? images[0];

  useEffect(() => {
    if (!isSlideshowPlaying) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % images.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [isSlideshowPlaying]);

  const api = useMemo(() => ({
    images,
    currentIndex,
    currentImage,
    isSlideshowPlaying,
    showImage(index: number) {
      setCurrentIndex((index + images.length) % images.length);
    },
    nextImage() {
      setCurrentIndex((index) => (index + 1) % images.length);
    },
    previousImage() {
      setCurrentIndex((index) => (index - 1 + images.length) % images.length);
    },
    startSlideshow() {
      setIsSlideshowPlaying(true);
    },
    stopSlideshow() {
      setIsSlideshowPlaying(false);
    },
    toggleSlideshow() {
      setIsSlideshowPlaying((playing) => !playing);
    }
  }), [currentImage, currentIndex, isSlideshowPlaying]);

  return api;
}
