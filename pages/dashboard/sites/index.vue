<template>
  <Suspense>
    <Sites />
  </Suspense>
</template>

<script setup lang="ts">
useHead({
  title: "Sites",
  meta: [
    {
      name: "description",
      content: "Manage your sites.",
    },
  ],
});
</script>
