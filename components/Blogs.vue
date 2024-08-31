<template>
  <div class="py-6 space-y-4">
    <UContainer>
      <div v-if="filteredData">
        <div class="flex justify-center  text-center">
          <Logo />
          <div class="flex-1">
            <h1 class="text-2xl font-bold mb-4">{{ filteredData.name }}</h1>
            <p class="dark:text-gray-400">{{ filteredData.description }}</p>
          </div>
          <ColorMode />
        </div>
      </div>
      <div v-else>
        <div class="flex justify-center items-center p-4 h-[calc(100vh-64px)]">
          <EmptyCard>
            <template #title>
              <h1 class="text-2xl font-bold">No data found</h1>
            </template>
            <template #description>
              <p class="dark:text-gray-400">
                No data found for this site. Please check back later.
              </p>
            </template>
          </EmptyCard>
        </div>
      </div>
    </UContainer>

    <UContainer class="space-y-2">
      <div
        v-if="pending"
        class="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-2"
      >
        <CardSkeleton v-for="i in 4" :key="i" />
      </div>
      <div v-else-if="articles.length === 0">
        <div class="flex justify-center items-center p-4 h-[calc(100vh-136px)]">
          <EmptyCard>
            <template #title>
              <h1 class="text-2xl font-bold">No articles found</h1>
            </template>
            <template #description>
              <p class="dark:text-gray-400">
                No articles found for this site. Please check back later.
              </p>
            </template>
          </EmptyCard>
        </div>
      </div>
      <div
        v-else
        class="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-2"
      >
        <div v-for="article in articles" :key="article.id">
          <ClientOnly>
            <ArticleCard :article="article">
              <UButton :to="`/blogs/${subdirectory}/${article.slug}`" block>
                Read Article
              </UButton>
            </ArticleCard>
            <template #placeholder>
              <CardSkeleton />
            </template>
          </ClientOnly>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import type { Post, Site } from "~/types";

const props = defineProps<{ subdirectory: string }>();
const { fetchDocs } = useFirebase();

const pending = ref(true);
const articles = ref<Post[]>([]);
const filteredData = ref<Site | null>(null);

// Fetch site data
const { data: siteData } = await fetchDocs<Site>({
  collectionName: "sites",
  queryConfig: {
    where: [
      { fieldPath: "subdirectory", opStr: "==", value: props.subdirectory },
    ],
  },
});
filteredData.value = siteData.length ? siteData[0] : null;
pending.value = false;

// Fetch articles if site data exists
if (filteredData.value) {
  const { data: articlesData } = await fetchDocs<Post>({
    collectionName: "posts",
    queryConfig: {
      where: [
        { fieldPath: "siteId", opStr: "==", value: filteredData.value.id },
        {
          fieldPath: "status",
          opStr: "==",
          value: true,
        },
      ],
      orderBy: [{ fieldPath: "createdAt", directionStr: "desc" }],
    },
  });
  articles.value = articlesData;
}
</script>
