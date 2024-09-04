<template>
  <div class="flex h-lvh flex-col md:flex-row">
    <div class="max-w-[250px] w-full hidden md:block">
      <Sidebar />
    </div>
    <div class="block md:hidden">
      <div class="flex justify-between items-center p-4">
        <Logo />
        <UButton
          icon="material-symbols:filter-list-rounded"
          @click="isSliderOpen = !isSliderOpen"
          variant="ghost"
        />
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
    <USlideover v-model="isSliderOpen">
      <Sidebar v-model="isSliderOpen" />
    </USlideover>
  </div>
</template>

<script lang="ts" setup>
const isSliderOpen = ref(false);
const isLargeScreen = useMediaQuery("(min-width: 768px)");

watch(isLargeScreen, (val) => {
  val ? (isSliderOpen.value = false) : isSliderOpen.value;
});
</script>

<style></style>
