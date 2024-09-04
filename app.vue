<template>
  <NuxtLoadingIndicator color="primary" class="bg-primary" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UModal v-model="loading" :prevent-close="loading" />
  <!-- <UModal v-model="isOnline" :prevent-close="isOnline">
    <UCard>
      <p class="text-center">
        You are <span class="text-primary"> Offline </span>, make you are
        connected to a network
      </p>
    </UCard>
  </UModal> -->
  <UNotifications />
</template>
<script lang="ts" setup>
const loading = useLoading();
// const online = useOnline();
// const isOnline = computed(() => !online.value);

useHead({
  title:
    "Painite Blog - The Ultimate Blogging SaaS for Seamless Content Creation",
  meta: [
    {
      name: "description",
      content:
        "Painite Blog is the leading SaaS platform designed for effortless content creation, management, and publishing. Empower your blogging journey with our intuitive tools and features.",
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/ico",
      href: "/favicon.ico",
    },
  ],
});
const routes = useRoute();
useSeoMeta({
  ogTitle:
    "Painite Blog - The Ultimate Blogging SaaS for Seamless Content Creation",
  ogDescription:
    "Painite Blog is the leading SaaS platform designed for effortless content creation, management, and publishing. Empower your blogging journey with our intuitive tools and features.",
  ogImage: "/PAINITE.png",
  ogUrl: "https://painiteblog.vercel.app" + routes.path,
  twitterTitle:
    "Painite Blog - The Ultimate Blogging SaaS for Seamless Content Creation",
  twitterDescription:
    "Painite Blog is the leading SaaS platform designed for effortless content creation, management, and publishing. Empower your blogging journey with our intuitive tools and features.",
  twitterImage: "/PAINITE.png",
  twitterCard: "summary_large_image",
});
</script>
<style>
.firebase-emulator-warning {
  display: none;
}
</style>
