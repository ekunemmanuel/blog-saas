<template>

  <Suspense>
    <Articles :site-id="siteId" />
  </Suspense>
</template>

<script setup lang="ts">
const params = useRoute().params;
const siteId = params.siteId as string;
// const subdirectory = "demo-tests";
useHead({
  title: "Articles",
  meta: [
    {
      name: "description",
      content: "View your artices.",
    },
  ],
});
</script>

<style scoped></style>
