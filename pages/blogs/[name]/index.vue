<template>
  <Suspense>
    <Blogs :subdirectory />
    <template #fallback>
      <div  class="">
        <UContainer>
          <div class="flex py-6">
            <Logo />
            <div
              class="flex flex-1 mx-auto flex-col items-center justify-center gap-4"
            >
              <USkeleton class="h-9 max-w-52 w-full" />
              <USkeleton class="h-9 max-w-52 w-full" />
            </div>

            <ColorMode />
          </div>
        </UContainer>

        <UContainer
          class="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-2"
        >
          <div v-for="i in 8" :key="i">
            <CardSkeleton />
          </div>
        </UContainer>
      </div>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
const route = useRoute();
const params = route.params;
const subdirectory = params.name as string;

definePageMeta({
  layout: false,
});

useHead({
  title: "Blogs",
  meta: [
    {
      name: "description",
      content: "Blog posts",
    },
  ],
});
</script>
