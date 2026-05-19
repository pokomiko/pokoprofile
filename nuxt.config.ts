export default defineNuxtConfig({
  compatibilityDate: "2026-05-13",
  css: ["~/assets/css/tailwind.css"],
  devtools: {
    enabled: false
  },
  experimental: {
    appManifest: false
  },
  modules: ["@nuxtjs/tailwindcss"],
  app: {
    head: {
      title: "Poko Website",
      htmlAttrs: {
        lang: "en"
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" }
      ],
      link: [
        { rel: "icon", type: "image/webp", href: "/images/poko-logo.webp" },
        { rel: "shortcut icon", href: "/images/poko-logo.webp" }
      ]
    }
  }
});
