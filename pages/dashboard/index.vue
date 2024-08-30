<template>
  <div class="py-6 flex-col flex justify-between min-h-screen gap-6">
    <div>
      <RecentSites />
    </div>
    <div>
      <RecentArticles />
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const user = useCurrentUser();

if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

useHead({
  title: "Dashboard",
  meta: [
    {
      name: "description",
      content: "View your recent site and articles here",
    },
  ],
});
</script>

<style></style>
