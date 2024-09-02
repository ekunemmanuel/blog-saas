<template>
  <NuxtLoadingIndicator color="primary"/>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UModal v-model="loading" :prevent-close="loading" />
  <!-- <UModal v-model="isOnline" :prevent-close="isOnline">
    <UCard>
      <p class="text-center">
        You are <span class="text-primary"> Offline </span>, make you are
        connected to a network
      </p>
    </UCard>
  </UModal> -->
  <UNotifications />
</template>
<script lang="ts" setup>
const loading = useLoading();
const online = useOnline();
const isOnline = computed(() => !online.value);


</script>
<style>
.firebase-emulator-warning {
  display: none;
}
</style>
