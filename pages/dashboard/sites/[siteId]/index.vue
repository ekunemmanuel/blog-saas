<template>
  <div v-if="site">
    <UContainer class="p-4 md:flex items-center justify-between block space-y-4 md:space-0">
      <div>
        <h1 class="text-2xl font-bold">
          {{ site.name }}
        </h1>
      </div>
      <div class="flex justify-end gap-2">
        <UButton
          icon="heroicons:document-text"
          variant="ghost"
          label="View Blog"
          :to="`/blogs/${site.subdirectory}`"
          target="_blank"
          rel="noopener noreferrer"
        />
        <UButton
          variant="ghost"
          label="Settings"
          icon="heroicons:cog"
          :to="`/dashboard/sites/${site.id}/settings`"
        />
        <UButton
          :to="`/dashboard/sites/${site.id}/new`"
          label="Create Article"
          icon="heroicons:plus-circle"
        />
      </div>
    </UContainer>
    <Suspense>
      <Articles v-if="site.id && user" :siteId="site.id" :userId="user.uid!" />
    </Suspense>
  </div>
  <div v-else>
    <USkeleton class="h-24" />
  </div>
</template>

<script setup lang="ts">
import type { Site } from "~/types";

const route = useRoute();
const params = route.params;
const { fetchDoc } = useFirebase();
const user = useCurrentUser();
const notification = useNotification();

if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

const { data: siteData } = await fetchDoc({
  collectionName: "sites",
  id: params.siteId as string,
});

const { data: userData } = await fetchDoc({
  collectionName: "users",
  id: user.value?.uid as string,
});

if (!siteData?.exists()) {
  notification.error({
    id: "not-found",
    title: "Site Not Found",
    description: "Site not found",
  });
  navigateTo({
    name: "dashboard-sites",
  });
}

if (!userData?.exists()) {
  notification.error({
    id: "not-found",
    title: "User Not Found",
    description: "User not found",
  });
  navigateTo({
    name: "login",
  });
}

const site = {
  id: siteData?.id,
  ...siteData?.data(),
} as Site;

useHead({
  title: "Articles",
  meta: [
    {
      name: "description",
      content: "View your articles.",
    },
  ],
});
</script>

<style scoped></style>
