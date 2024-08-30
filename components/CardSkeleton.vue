<template>
  <div class="bg-white dark:bg-gray-950 shadow-md p-4 rounded-xl space-y-2">
    <div class="h-[200px] rounded-md">
      <USkeleton class="rounded-lg h-full w-full" />
    </div>
    <div class="space-y-4">
      <div>
        <USkeleton class="w-3/4 h-6" />

        <USkeleton class="w-full h-8 mt-1" />
      </div>
      <div class="">
        <USkeleton class="w-full h-10" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
