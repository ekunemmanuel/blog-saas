<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});
useHead({
  title: "Dashboard - Job Board",
});
</script>

<style></style>
