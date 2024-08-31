<template>
  <Sites />
</template>

<script setup lang="ts">

const user = useCurrentUser();
const route = useRoute();
if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

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
