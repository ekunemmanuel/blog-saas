<template>
  <UCard
    class="p-4 border-2 border-primary-500 !h-full"
    :ui="{
      body: {
        base: 'flex flex-col gap-2  h-full',
      },
    }"
  >
    <div>
      <div class="flex justify-between items-end">
        <h2 class="text-lg font-semibold md:text-2xl">{{ billing.type }}</h2>
        <p class="text-primary-500 text-4xl font-bold">{{ billing.amount }}</p>
      </div>
      <p class="">{{ billing.description }}</p>
    </div>
    <ul
      class="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-400 list-disc list-inside flex-1"
    >
      <li v-for="(benefit, index) in billing.benefits" :key="index">
        {{ benefit }}
      </li>
    </ul>
    <div class="">
      <UButton
        @click="makePayment(billing.plan, billing.type)"
        block
        class="mt-4"
        :label="billing.label"
        :loading="loadingPlan === billing.plan"
        :disabled="loading"
      />
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const props = defineProps<{
  billing: {
    type: string;
    amount: string;
    description: string;
    benefits: string[];
    plan: string;
    label: string;
  };
}>();
const user = useCurrentUser();
const notification = useNotification();
const loadingPlan = ref<string | null>(null);
const i = ref(0);
const loading = useLoading();

async function makePayment(plan: string, type: string) {
  console.log(plan, type);

  if (plan == "free") {
    navigateTo("/dashboard");
    return;
  }
  if (user.value == undefined || user.value == null) {
    i.value++;
    notification.info({
      id: `billing-${i.value}`,
      title: "Sign In Required",
      description: "Please sign in or sign up to continue.",
    });

    setTimeout(() => {
      navigateTo("/dashboard/billing");
    }, 2000);
    return;
  }
  try {
    loadingPlan.value = plan;
    loading.value = true;
    // Call the payment API
    const { data } = await $fetch("/api/v1/payment", {
      method: "POST",
      body: {
        plan,
        email: user.value.email,
        userId: user.value.uid,
      },
    });
    navigateTo(data.authorization_url, {
      external: true,
    });
    notification.success({
      id: `billing-${i.value}`,
      title: "Redirecting to Payment",
      description: "You will be redirected to the payment page.",
    });
  } catch (error) {
    console.error(error);
    i.value++;
    notification.error({
      id: `billing-${i.value}`,
      title: "Payment Error",
      description: "An error occurred while processing your payment.",
    });
  } finally {
    loadingPlan.value = null;
    loading.value = false;
  }
}
</script>

<style></style>
