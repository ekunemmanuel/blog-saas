<template>
  <div class="space-y-2 px-6">
    <h2 class="text-xl font-bold">Recent Articles</h2>
    <div v-if="pending">
      <div
        class="gap-2 grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] grid"
      >
        <div v-for="i in 4">
          <CardSkeleton />
        </div>
      </div>
    </div>
    <div v-else-if="articles.length <= 0" class="justify-center flex p-4">
      <EmptyCard>
        <template #title> You have no article yet </template>
        <template #description>
          You can create a new article by creating or using an already created
          site
        </template>
      </EmptyCard>
    </div>
    <div
      v-else
      class="gap-2 grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] grid"
    >
      <div v-for="article in articles">
        <ClientOnly>
          <ArticleCard :article="article">
            <template #badge>
              <UBadge
                :color="article.status ? 'primary' : 'gray'"
                class="rounded-full px-4"
              >
                {{ article.status ? "Published" : "Draft" }}
              </UBadge>
            </template>
            <UButton
              :to="`dashboard/sites/${article.siteId}/${article.id}`"
              label="Edit Article"
              icon="heroicons:pencil"
              block
            />
          </ArticleCard>
          <template #placeholder>
            <CardSkeleton />
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Post } from "~/types";

const { getDocs } = useFirebase();
const user = useCurrentUser();

const { data: articles, pending } = getDocs<Post>({
  collectionName: "posts",
  queryConfig: {
    where: [{ fieldPath: "userId", opStr: "==", value: user.value?.uid }],
    orderBy: [
      {
        fieldPath: "createdAt",
        directionStr: "asc",
      },
    ],
    limit: 6,
  },
});
</script>

<style></style>
