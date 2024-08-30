<template>
  <SiteSettings :site-id="siteId" />
</template>

<script setup lang="ts">
const params = useRoute().params;
const siteId = params.siteId as string;

useHead({
  title: "Site Settings",
  meta: [
    {
      name: "description",
      content: "Update your site settings.",
    },
  ],
});
</script>
