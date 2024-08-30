<template>
  <ClientOnly>
    <UCard class="text-center max-w-[500px] w-full">
      <div class="space-y-4">
        <UIcon
          name="ic:baseline-insert-drive-file"
          class="text-6xl text-primary-300"
        />
        <h2 class="text-xl font-semibold">
          <slot name="title">Empty</slot>
          <!-- You have no sites yet -->
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          <slot name="description"> No description provided </slot>
        </p>
        <div class="mx-auto">
          <slot name="button"> </slot>
        </div>
      </div>
    </UCard>
    <template #placeholder>
      loading...
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup></script>

<style></style>
