// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "nuxt-vuefire"],

  runtimeConfig: {
    credential: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
  },

  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true,
    },
    config: {
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      appId: process.env.appId,
      storageBucket: process.env.storageBucket,
    },
  },

  compatibilityDate: "2024-08-27",
});