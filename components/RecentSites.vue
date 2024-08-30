<template>
  <div class="space-y-2 px-6">
    <h2 class="text-xl font-bold">Recent Sites</h2>
    <div v-if="pending">
      <div
        class="gap-2 grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] grid"
      >
        <div v-for="i in 4">
          <CardSkeleton />
        </div>
      </div>
    </div>
    <div v-else-if="sites.length <= 0">
      <div class="justify-center flex p-4">
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
    <div
      v-else
      class="gap-2 grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] grid"
    >
      <div v-for="site in sites">
        <ClientOnly>
          <SiteCard :site="site"/>
          <template #placeholder>
            <CardSkeleton />
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Site } from "~/types";

const { getDocs } = useFirebase();
const user = useCurrentUser();

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
    limit: 6,
  },
});
</script>

<style></style>
