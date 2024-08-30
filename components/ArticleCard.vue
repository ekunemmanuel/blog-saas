<template>
  <Card>
    <template #image>
      <ClientOnly>
        <NuxtImg
          format="webp"
          class="rounded-lg h-full w-full object-cover"
          densities="x1 x2"
          :src="article.coverImage"
          sizes="xs:100vw sm:100vw"
          :alt="article.title"
        />
      </ClientOnly>
      <div class="absolute top-0 right-0">
        <slot name="badge" />
      </div>
    </template>
    <template #name>
      {{ article.title }}
    </template>

    <template #description>
      {{ article.description }}
    </template>

    <template #button>
      <slot />
    </template>
  </Card>
</template>

<script lang="ts" setup>
import type { Post } from "~/types";

defineProps<{
  article: Post;
}>();
</script>

<style></style>
