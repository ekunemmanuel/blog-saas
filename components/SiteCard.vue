<template>
  <Card>
    <template #image>
      <NuxtImg
        format="webp"
        class="rounded-lg h-full w-full object-cover"
        densities="x1"
        :src="site.imageUrl ?? '/placeholder-image.jpg'"
        sizes="xs:100vw sm:100vw"
        :alt="site.name"
      />
    </template>
    <template #name>
      {{ site.name }}
    </template>

    <template #description>
      {{ site.description }}
    </template>

    <template #button>
      <UButton
        :to="`/dashboard/sites/${site.id}`"
        label="View"
        icon="heroicons:eye"
        block
      />
    </template>
  </Card>
</template>

<script lang="ts" setup>
import type { Site } from "~/types";

defineProps<{
  site: Site;
}>();
</script>

<style></style>
