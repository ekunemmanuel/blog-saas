<template>
  <div class="overlay h-screen flex items-center justify-center p-2">
    <div class="gradient"></div>
    <div class="flex flex-col justify-between h-full items-center">
      <div>
        <UButton
          label="Home"
          icon="heroicons:home"
          class="rounded-full"
          to="/"
        />
      </div>
      <div class="flex-1 h-full">
        <div class="flex items-center justify-center h-full">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.dark .gradient {
  @apply bg-[radial-gradient(50%_50%_at_50%_50%,rgb(var(--color-primary-400)_/_0.1)_0,rgb(var(--color-gray-950)))];
}

.gradient {
  @apply fixed -z-10 top-0 bottom-0 left-0 right-0 pointer-events-none;
}

.overlay {
  @apply bg-[linear-gradient(to_right,rgb(var(--color-gray-200))_0.5px,_transparent_0.5px),linear-gradient(to_bottom,rgb(var(--color-gray-200))_0.5px,_transparent_0.5px)] bg-[100px_100px];
}

.dark .overlay {
  @apply bg-[linear-gradient(to_right,rgb(var(--color-gray-900))_0.5px,_transparent_0.5px),linear-gradient(to_bottom,rgb(var(--color-gray-900))_0.5px,_transparent_0.5px)] bg-[100px_100px];
}
</style>
