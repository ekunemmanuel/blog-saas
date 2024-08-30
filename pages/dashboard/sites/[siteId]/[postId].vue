<template>
  <div>
    <ArticleForm :siteId :postId />
  </div>
</template>

<script setup lang="ts">
const params = useRoute().params;
const siteId = params.siteId as string;
const postId = params.postId as string;

useHead({
  title: "Edit Article",
  meta: [
    {
      name: "description",
      content: "Edit your article.",
    },
  ],
});
</script>

<style scoped></style>
