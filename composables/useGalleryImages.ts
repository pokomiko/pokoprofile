import { computed, onBeforeUnmount, ref } from "vue";

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
const currentIndex = ref(0);
const isSlideshowPlaying = ref(true);
let interval: ReturnType<typeof window.setInterval> | undefined;

const currentImage = computed(() => images[currentIndex.value]);

function showImage(index: number, resetTimer = true) {
  currentIndex.value = (index + images.length) % images.length;

  if (resetTimer && isSlideshowPlaying.value) {
    startSlideshow();
  }
}

function nextImage() {
  showImage(currentIndex.value + 1);
}

function previousImage() {
  showImage(currentIndex.value - 1);
}

function stopSlideshow() {
  if (interval) {
    window.clearInterval(interval);
    interval = undefined;
  }

  isSlideshowPlaying.value = false;
}

function startSlideshow() {
  if (interval) {
    window.clearInterval(interval);
  }

  isSlideshowPlaying.value = true;
  interval = window.setInterval(() => {
    showImage(currentIndex.value + 1, false);
  }, 6500);
}

function toggleSlideshow() {
  if (isSlideshowPlaying.value) {
    stopSlideshow();
    return;
  }

  startSlideshow();
}

export function useGalleryImages() {
  onBeforeUnmount(() => {
    stopSlideshow();
  });

  return {
    images,
    currentIndex,
    currentImage,
    isSlideshowPlaying,
    showImage,
    nextImage,
    previousImage,
    startSlideshow,
    stopSlideshow,
    toggleSlideshow
  };
}
