<template>
  <div>
    <div v-if="filteredData">
      <div class="py-6">
        <UContainer class="pb-8 flex justify-between items-center">
          <div class="flex gap-2 items-center">
            <Back :to="`/blogs/${name}`" />
            <p class="text-2xl font-bold">Go Back</p>
          </div>
          <ColorMode />
        </UContainer>
        <UContainer v-if="post" class="">
          <div class="text-center text-sm">
            <ClientOnly>
              <h1>
                {{ post.createdAt }}
              </h1>
              <template #fallback>
                <USkeleton class="w-full max-w-52 mx-auto h-20" />
              </template>
            </ClientOnly>
          </div>
          <div
            class="md:text-3xl text-xl font-bold text-center mt-4 max-w-[600px] mx-auto"
          >
            <ClientOnly>
              <h1>
                {{ post.title }}
              </h1>
              <template #fallback>
                <USkeleton class="w-full h-20" />
              </template>
            </ClientOnly>
          </div>
          <div
            class="mt-8 max-w-screen-lg w-full relative overflow- m-auto my-4 h-80 md:h-[450px] md:rounded-2xl md:w-5/6 lg:w-2/3 md:mb-20 before:bg-white/20 before:size-[calc(100%+10px)] before:rounded-2xl before:absolute before:z-[-1] before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2"
          >
            <ClientOnly>
              <NuxtImg
                width="1200"
                height="630"
                :src="post.coverImage"
                :alt="post.title"
                class="w-full h-full object-cover rounded-2xl"
              />

              <template #placeholder>
                <USkeleton class="h-full" />
              </template>
            </ClientOnly>
          </div>
          <div
            class=" md:text-lg text-base font-semibold mb-4 max-w-5xl mx-auto"
          >
            <ClientOnly>
              <p>
                {{ post.description }}
              </p>
              <template #fallback>
                <USkeleton class="w-full h-20" />
              </template>
            </ClientOnly>
          </div>

          <ClientOnly>
            <BlogContent v-model="post.content" class="max-w-5xl mx-auto" />
            <template #placeholder>
              <USkeleton class="h-72 w-full" />
            </template>
          </ClientOnly>
        </UContainer>
      </div>
    </div>
    <div v-else>
      <UContainer class="min-h-screen grid place-items-center">
        <p>Site not found</p>
      </UContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Post, Site } from "~/types";

const route = useRoute();
const { name, slug } = route.params;
const { fetchDocs } = useFirebase();
const pending = ref(true);
const post = ref<Post>();
const filteredData = ref<Site | null>(null);

const { data: siteData } = await fetchDocs<Site>({
  collectionName: "sites",
  queryConfig: {
    where: [{ fieldPath: "subdirectory", opStr: "==", value: name }],
  },
});

filteredData.value = siteData.length ? siteData[0] : null;

if (!filteredData.value) {
  navigateTo(`/blogs/${name}`);
}

// Fetch posts data
const { data: posts } = await fetchDocs<Post>({
  collectionName: "posts",
  queryConfig: {
    where: [{ fieldPath: "slug", opStr: "==", value: slug as string }],
  },
});

pending.value = false;

if (posts.length === 0) {
  navigateTo(`/blogs/${name}`);
}

post.value = posts[0];

definePageMeta({
  layout: false,
});

useHead({
  title: "Blogs",
  meta: [
    {
      name: "description",
      content: "View your blogs.",
    },
  ],
});
</script>

<style></style>
