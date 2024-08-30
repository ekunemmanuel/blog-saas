<template>
  <div
    class="bg-white dark:bg-gray-950 shadow-md p-4 rounded-xl space-y-2 flex flex-col h-full"
  >
    <div class="h-[200px] overflow-hidden bg-black rounded-md relative">
      <slot name="image"></slot>
    </div>
    <div class="gap-4 flex flex-col justify-between flex-1">
      <div>
        <h2 class="truncate text-xl font-bold text-primary">
          <slot name="name"></slot>
        </h2>
        <p class="line-clamp-2">
          <slot name="description"></slot>
        </p>
      </div>
      <div>
        <slot name="button"></slot>
      </div>
    </div>
  </div>
</template>

<style></style>
