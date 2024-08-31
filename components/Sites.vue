<template>
  <div>
    <div v-if="sites.length <= 0">
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
    <div v-else>
      <UContainer class="py-6">
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
  </div>
</template>

<script lang="ts" setup>
import type { Site, User } from "~/types";

const { getDocs, fetchDoc } = useFirebase();

const user = useCurrentUser();


const { data } = await fetchDoc({
  collectionName: "users",
  id: user.value?.uid!,
});

if (data && !data.exists()) {
  console.error("User not found");
  navigateTo({ name: "login" });
}
const u = data?.data() as User;

const { data: sites } = getDocs<Site>({
  collectionName: "sites",
  queryConfig: {
    where: [{ fieldPath: "userId", opStr: "==", value: u.id }],
    orderBy: [
      {
        fieldPath: "createdAt",
        directionStr: "asc",
      },
    ],
  },
});
</script>

<style></style>
