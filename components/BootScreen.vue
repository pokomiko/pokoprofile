<template>
  <div class="boot-screen fixed inset-0 z-[3000] flex items-center justify-center">
    <div class="boot-card flex flex-col items-center gap-6 px-6">
      <img class="boot-logo object-contain" src="/images/poko-logo.webp" alt="PokoOS" />
      <div class="text-center">
        <h1 class="text-3xl font-bold">PokoOS</h1>
        <p class="text-sm text-current/62">initializing system engineer portfolio</p>
      </div>
      <div class="boot-track">
        <span />
      </div>
      <div class="font-mono text-xs text-current/52">loading kernel modules: terminal gallery monitor</div>
    </div>
  </div>
</template>

<style scoped>
.boot-screen {
  color: #f8fbff;
  background:
    radial-gradient(circle at 50% 28%, rgba(180, 220, 239, 0.28), transparent 24rem),
    linear-gradient(135deg, #071019, #111827 52%, #030712);
}

.boot-card {
  animation: bootRise 700ms ease both;
}

.boot-logo {
  width: clamp(9.5rem, 18vw, 15rem);
  height: clamp(9.5rem, 18vw, 15rem);
  filter: drop-shadow(0 20px 44px rgba(0, 0, 0, 0.4));
  animation: logoPulse 1450ms ease-in-out infinite;
}

.boot-track {
  width: min(20rem, 68vw);
  height: 0.42rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.boot-track span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #b4dcef, #f8fbff);
  animation: bootProgress 2100ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes bootProgress {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes bootRise {
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes logoPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.04);
  }
}

@media (max-width: 640px) {
  .boot-logo {
    width: clamp(8.5rem, 42vw, 12rem);
    height: clamp(8.5rem, 42vw, 12rem);
  }
}
</style>
