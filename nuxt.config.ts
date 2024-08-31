// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "nuxt-vuefire", "@vueuse/nuxt", "@nuxt/image"],

  runtimeConfig: {
    credential: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
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

  imports: {
    dirs: ["./composables/firebase"],
  },

  routeRules: {
    // "/dashboard/profile": {
    //   redirect: "/404",
    // },
    "/blogs": {
      redirect: "/",
    },
  },

  compatibilityDate: "2024-08-27",
});
