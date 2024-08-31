<template>
  <NuxtLoadingIndicator />
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

const route = useRoute();
const user = useCurrentUser();
const { trxref, reference } = route.query;
const notification = useNotification();
if (trxref || reference) {
  try {
    // make a api call to verify the transaction
    loading.value = true;
    const result = await $fetch("/api/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { ref: trxref || reference },
    });
    console.log(result);
  } catch (error: any) {
    if (Array.isArray(error.data.data)) {
      for (const key of error.data.data) {
        notification.error({
          id: key,
          title: key.field,
          description: key.message,
        });
      }
    } else {
      notification.error({
        id: "error",
        title: "Error",
        description: error.data.message,
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>
<style>
.firebase-emulator-warning {
  display: none;
}
</style>
