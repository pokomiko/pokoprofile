<template>
  <main
    class="poko-os relative min-h-screen overflow-hidden bg-[url('/images/bg.webp')] bg-cover bg-center bg-fixed font-mono"
    :class="themeMode === 'dark' ? 'theme-dark' : 'theme-light'"
  >
    <PokoTopBar
      :active-app="activeApp"
      :open-apps="openApps"
      :theme-mode="themeMode"
      @launch="launchApp"
      @toggle-theme="toggleTheme"
    />

    <img
      class="desktop-logo absolute bottom-8 right-8 z-[20] h-auto w-[18vw] min-w-[120px] max-w-[360px]"
      src="/images/poko-logo.webp"
      alt="Poko logo"
    />

    <PortfolioTerminal
      v-if="openApps.terminal"
      ref="terminalRef"
      v-model="openApps.terminal"
      :active="activeApp === 'terminal'"
      :z-index="zIndex.terminal"
      @focus="focusApp('terminal')"
    />

    <GalleryApp
      v-if="openApps.gallery"
      ref="galleryRef"
      v-model="openApps.gallery"
      :active="activeApp === 'gallery'"
      :z-index="zIndex.gallery"
      @focus="focusApp('gallery')"
    />

    <MonitorApp
      v-if="openApps.monitor"
      ref="monitorRef"
      v-model="openApps.monitor"
      :active="activeApp === 'monitor'"
      :z-index="zIndex.monitor"
      @focus="focusApp('monitor')"
    />

    <Transition name="boot">
      <BootScreen v-if="booting" />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import type { Ref } from "vue";

type AppId = "terminal" | "gallery" | "monitor";
type RestorableWindow = {
  restore: () => void;
};

const booting = ref(true);
const themeMode = ref<"dark" | "light">("dark");
const activeApp = ref<AppId>("terminal");
const openApps = reactive<Record<AppId, boolean>>({
  terminal: true,
  gallery: true,
  monitor: false
});
const zIndex = reactive<Record<AppId, number>>({
  terminal: 1002,
  gallery: 1001,
  monitor: 1000
});
const terminalRef = ref<RestorableWindow | null>(null);
const galleryRef = ref<RestorableWindow | null>(null);
const monitorRef = ref<RestorableWindow | null>(null);
let zCounter = 1010;
let bootTimer: ReturnType<typeof window.setTimeout> | undefined;

const appRefs: Record<AppId, Ref<RestorableWindow | null>> = {
  terminal: terminalRef,
  gallery: galleryRef,
  monitor: monitorRef
};

function focusApp(app: AppId, force = false) {
  if (!force && activeApp.value === app) {
    return;
  }

  activeApp.value = app;
  zCounter += 1;
  zIndex[app] = zCounter;
}

function launchApp(app: AppId) {
  openApps[app] = true;
  focusApp(app, true);
  nextTick(() => {
    appRefs[app].value?.restore();
  });
}

function applyTheme(mode: "dark" | "light") {
  themeMode.value = mode;
  document.documentElement.dataset.theme = mode;
}

function toggleTheme() {
  applyTheme(themeMode.value === "dark" ? "light" : "dark");
}

function handleThemeEvent(event: Event) {
  const detail = (event as CustomEvent<{ mode?: "dark" | "light" }>).detail;

  if (detail?.mode) {
    applyTheme(detail.mode);
  }
}

onMounted(() => {
  applyTheme(themeMode.value);
  window.addEventListener("poko:set-theme", handleThemeEvent);

  if (window.matchMedia("(max-width: 760px)").matches) {
    openApps.gallery = false;
    openApps.monitor = false;
    focusApp("terminal", true);
  }

  bootTimer = window.setTimeout(() => {
    booting.value = false;
  }, 2350);
});

onBeforeUnmount(() => {
  window.removeEventListener("poko:set-theme", handleThemeEvent);

  if (bootTimer) {
    window.clearTimeout(bootTimer);
  }
});
</script>

<style scoped>
.poko-os {
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--os-text);
  background-color: var(--os-bg);
}

.desktop-logo {
  opacity: 1;
  filter: drop-shadow(0 18px 36px rgba(255, 255, 255, 0.2));
}

.boot-enter-active,
.boot-leave-active {
  transition: opacity 420ms ease, transform 420ms ease;
}

.boot-enter-from,
.boot-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

@media (max-width: 640px) {
  .poko-os {
    background-attachment: scroll;
  }

  .desktop-logo {
    bottom: 1rem;
    right: 1rem;
    width: 28vw;
    min-width: 86px;
    max-width: 120px;
  }
}

@media (max-width: 420px) {
  .desktop-logo {
    bottom: 0.75rem;
    right: 0.75rem;
    width: 24vw;
    min-width: 72px;
  }
}
</style>
