<template>
  <div>
    <ArticleForm :siteId />
  </div>
</template>

<script setup lang="ts">
const params = useRoute().params;
const siteId = params.siteId as string;

useHead({
  title: "Create Article",
  meta: [
    {
      name: "description",
      content: "Create a new article.",
    },
  ],
});
</script>

<style scoped></style>
