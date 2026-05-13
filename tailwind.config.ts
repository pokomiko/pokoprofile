export default {
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Courier New", "monospace"]
      }
    }
  },
  plugins: []
};
