<template>
  <Suspense>
    <Blogs :subdirectory />
  </Suspense>
</template>

<script lang="ts" setup>
const route = useRoute();
const params = route.params;
const subdirectory = params.name as string;

definePageMeta({
  layout: false,
});

useHead({
  title: "Blogs",
  meta: [
    {
      name: "description",
      content: "Blog posts",
    },
  ],
});
</script>
