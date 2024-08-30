<template>
  <div>
    <div v-if="sites.length === 0">
      <div
        class="grid place-items-center min-h-[calc(100vh-64px)] md:min-h-screen px-4"
      >
        <EmptyCard>
          <template #title> You have no sites yet </template>
          <template #description>
            You can create a new site by clicking the button below.
          </template>
          <template #button>
            <UButton
              to="/dashboard/sites/new"
              label="New Site"
              icon="heroicons:plus-circle"
            />
          </template>
        </EmptyCard>
      </div>
    </div>
    <UContainer v-else class="py-6">
      <UCard class="mt-4">
        <template #header>
          <div class="flex justify-between items-center">
            <div>
              <!-- <h2 class="text-lg font-semibold">Sites</h2> -->
              <p class="text-gray-500 dark:text-gray-400 mt-1">
                Manage your sites here.
              </p>
            </div>
            <UButton
              to="/dashboard/sites/new"
              label="New Site"
              icon="heroicons:plus-circle"
            />
          </div>
        </template>
        <div
          class="gap-2 grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] grid"
        >
          <div v-for="site in sites">
            <ClientOnly>
              <SiteCard :site="site" />
              <template #placeholder>
                <CardSkeleton />
              </template>
            </ClientOnly>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import type { Site } from "~/types";

const { getDocs } = useFirebase();
const user = useCurrentUser();
const route = useRoute();
if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

const { data: sites, pending } = getDocs<Site>({
  collectionName: "sites",
  queryConfig: {
    where: [{ fieldPath: "userId", opStr: "==", value: user.value?.uid }],
    orderBy: [
      {
        fieldPath: "createdAt",
        directionStr: "desc",
      },
    ],
  },
});
</script>

<style></style>
