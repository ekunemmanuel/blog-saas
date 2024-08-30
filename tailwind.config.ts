/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./components/**/*.{js,vue,ts}",
      "./layouts/**/*.vue",
      "./pages/**/*.vue",
      "./plugins/**/*.{js,ts}",
      "./nuxt.config.{js,ts}",
      "./app.vue",
    ],
    theme: {
      extend: {
        colors: {
          driftwood: {
            50: "#f8f6ee",
            100: "#eee9d3",
            200: "#dfd3a9",
            300: "#ccb678",
            400: "#bd9b52",
            500: "#a38040",
            600: "#956d39",
            700: "#785330",
            800: "#65452e",
            900: "#583b2b",
            950: "#321f16",
          },
        },
      },
    },
    plugins: [
      require("@tailwindcss/typography"),
    ],
  };