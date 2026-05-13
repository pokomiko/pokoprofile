<template>
  <header class="topbar fixed left-0 top-0 z-[2000] flex h-14 w-full items-center justify-between gap-3 border-b px-3">
    <div class="topbar-left">
      <button class="brand-button" type="button" title="PokoOS" aria-label="PokoOS">
        <img class="h-7 w-7 object-contain" src="/images/poko-logo.webp" alt="" />
      </button>

      <nav class="app-dock" aria-label="PokoOS apps">
        <button
          v-for="app in apps"
          :key="app.id"
          class="dock-icon"
          :class="{ active: activeApp === app.id, open: openApps[app.id] }"
          type="button"
          :title="app.label"
          :aria-label="`Open ${app.label}`"
          @click="$emit('launch', app.id)"
        >
          <span>{{ app.icon }}</span>
        </button>
      </nav>
    </div>

    <div class="topbar-right">
      <div class="social-links" aria-label="Social links">
        <a
          v-for="link in socialLinks"
          :key="link.label"
          class="social-link"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="link.label"
          :title="link.label"
        >
          <img v-if="link.icon" class="h-4 w-4 object-contain" :src="link.icon" :alt="link.label" />
          <span v-else>{{ link.short }}</span>
        </a>
      </div>

      <button class="theme-button" type="button" :title="themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="$emit('toggle-theme')">
        <span class="theme-glyph" :class="themeMode" />
      </button>

      <div class="hidden text-right text-[0.68rem] leading-tight text-current/70 sm:block">
        <div>{{ date }}</div>
        <div>{{ time }}</div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
type AppId = "terminal" | "gallery" | "monitor";

defineProps<{
  activeApp: AppId;
  openApps: Record<AppId, boolean>;
  themeMode: "dark" | "light";
}>();

defineEmits<{
  launch: [id: AppId];
  "toggle-theme": [];
}>();

const apps: Array<{ id: AppId; label: string; icon: string }> = [
  { id: "terminal", label: "Terminal", icon: ">_" },
  { id: "gallery", label: "Gallery", icon: "GAL" },
  { id: "monitor", label: "Monitor", icon: "MON" }
];
const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/pokomiko",
    icon: "https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
  },
  {
    label: "X",
    href: "https://x.com/Poko_miko",
    short: "X"
  },
  {
    label: "VRChat",
    href: "https://vrchat.com/home/user/usr_21c3ad19-5da2-4f9b-b373-0d0d8af38c7a",
    icon: "/images/VRChat.webp"
  }
];
const time = ref("");
const date = ref("");
let clockTimer: ReturnType<typeof window.setInterval> | undefined;

function updateTime() {
  const now = new Date();
  time.value = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(now);
  date.value = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(now);
}

onMounted(() => {
  updateTime();
  clockTimer = window.setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
  if (clockTimer) {
    window.clearInterval(clockTimer);
  }
});
</script>

<style scoped>
.topbar {
  color: var(--os-text);
  border-color: var(--glass-border);
  background: var(--glass-surface-strong);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(30px) saturate(1.35);
}

.topbar-left,
.topbar-right,
.social-links {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.topbar-left {
  flex: 1;
  justify-content: flex-start;
}

.topbar-right {
  justify-content: flex-end;
}

.brand-button,
.social-link,
.theme-button,
.dock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.9rem;
  transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.brand-button {
  gap: 0.5rem;
  min-width: 2.4rem;
  height: 2.4rem;
  padding: 0 0.65rem;
  background: rgba(255, 255, 255, 0.08);
}

.app-dock {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 1.1rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.08);
}

.dock-icon,
.social-link,
.theme-button {
  width: 2.2rem;
  height: 2.2rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--os-text);
  font-size: 0.76rem;
  font-weight: 800;
}

.dock-icon.open {
  box-shadow: inset 0 -2px 0 var(--accent);
}

.dock-icon.active,
.dock-icon:hover,
.social-link:hover,
.brand-button:hover,
.theme-button:hover,
.dock-icon:focus-visible,
.social-link:focus-visible,
.brand-button:focus-visible,
.theme-button:focus-visible {
  background: var(--accent-soft);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2);
  outline: none;
  transform: translateY(-1px);
}

.theme-glyph {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
}

.theme-glyph.dark {
  background: radial-gradient(circle at 68% 34%, transparent 0.38rem, var(--accent) 0.4rem);
}

.theme-glyph.light {
  background: var(--accent);
  box-shadow: 0 0 0 0.24rem var(--accent-soft);
}

@media (max-width: 640px) {
  .social-links {
    display: none;
  }
}

@media (max-width: 420px) {
  .topbar {
    gap: 0.35rem;
    padding-inline: 0.5rem;
  }

  .topbar-left,
  .topbar-right {
    gap: 0.35rem;
  }

  .brand-button {
    min-width: 2.15rem;
    height: 2.15rem;
    padding-inline: 0.45rem;
  }

  .brand-button img {
    width: 1.5rem;
    height: 1.5rem;
  }

  .app-dock {
    gap: 0.25rem;
    padding: 0.2rem;
  }

  .dock-icon,
  .theme-button {
    width: 2.05rem;
    height: 2.05rem;
    font-size: 0.68rem;
  }
}
</style>
