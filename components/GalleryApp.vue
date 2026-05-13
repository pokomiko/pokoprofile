<template>
  <PokoWindow
    ref="windowRef"
    :model-value="modelValue"
    title="Poko Gallery"
    subtitle="classic slides + optimized VRChat media"
    icon="GAL"
    :z-index="zIndex"
    :active="active"
    :initial-bounds="{ top: 96, left: 632, width: 592, height: 536 }"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="$emit('focus')"
  >
    <template #actions>
      <div class="flex items-center gap-2 text-xs text-current/55">
        <button class="slideshow-toggle" type="button" @pointerdown.stop @click.stop="toggleSlideshow">
          {{ isSlideshowPlaying ? "Pause" : "Play" }}
        </button>
        <span>{{ currentIndex + 1 }} / {{ images.length }}</span>
      </div>
    </template>

    <div class="grid h-full grid-cols-[minmax(0,1fr)_12.5rem] overflow-hidden">
      <section class="relative min-h-0 overflow-hidden bg-black/20">
        <Transition name="gallery-image" mode="out-in">
          <img
            :key="currentImage.src"
            class="h-full w-full object-contain"
            :src="currentImage.src"
            :alt="currentImage.alt"
            decoding="async"
          />
        </Transition>

        <div class="image-badge">{{ currentImage.source === "classic" ? "Classic" : "VRChat" }}</div>
        <button class="nav-button left-4" type="button" aria-label="Previous image" @click="previousImage">&lsaquo;</button>
        <button class="nav-button right-4" type="button" aria-label="Next image" @click="nextImage">&rsaquo;</button>
      </section>

      <aside class="gallery-rail min-h-0 overflow-y-auto border-l p-3">
        <button
          v-for="(image, index) in images"
          :key="image.src"
          class="thumb-button mb-2 block w-full overflow-hidden rounded-lg border text-left"
          :class="{ active: index === currentIndex }"
          type="button"
          @click="showImage(index)"
        >
          <img class="aspect-video w-full object-cover" :src="image.thumb" :alt="image.alt" loading="lazy" decoding="async" />
          <span class="block px-2 py-1 text-[0.66rem] text-current/62">
            {{ image.source === "classic" ? "Classic" : "VRChat" }} {{ String(index + 1).padStart(2, "0") }}
          </span>
        </button>
      </aside>
    </div>
  </PokoWindow>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  zIndex: number;
  active: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  focus: [];
}>();

const windowRef = ref<{ restore: () => void } | null>(null);
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

onMounted(startSlideshow);

defineExpose({
  restore: () => windowRef.value?.restore()
});
</script>

<style scoped>
.gallery-rail {
  border-color: var(--glass-border);
  background: rgba(255, 255, 255, 0.06);
}

.slideshow-toggle,
.image-badge {
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.55rem;
}

.image-badge {
  position: absolute;
  left: 1rem;
  top: 1rem;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  backdrop-filter: blur(16px);
}

.thumb-button {
  border-color: transparent;
  background: rgba(255, 255, 255, 0.06);
  transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
}

.thumb-button:hover,
.thumb-button:focus-visible,
.thumb-button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  outline: none;
  transform: translateY(-1px);
}

.nav-button {
  position: absolute;
  top: 50%;
  display: flex;
  width: 2.7rem;
  height: 2.7rem;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 2rem;
  backdrop-filter: blur(16px);
}

.nav-button:hover,
.nav-button:focus-visible {
  background: var(--accent-soft);
  outline: none;
}

.gallery-image-enter-active,
.gallery-image-leave-active {
  transition: opacity 360ms ease, transform 360ms ease, filter 360ms ease;
}

.gallery-image-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: scale(1.035);
}

.gallery-image-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: scale(0.985);
}

@media (max-width: 760px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .gallery-rail {
    display: none;
  }
}

@media (max-width: 520px) {
  .nav-button {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.7rem;
  }

  .nav-button.left-4 {
    left: 0.75rem;
  }

  .nav-button.right-4 {
    right: 0.75rem;
  }

  .image-badge {
    left: 0.75rem;
    top: 0.75rem;
    font-size: 0.66rem;
  }
}
</style>
