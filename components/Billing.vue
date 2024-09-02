<template>
  <div class="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-4 mt-8">
    <BillingCard
      v-for="billing in plans"
      :key="billing.plan"
      :billing="billing"
      :plan="plan"
      :active="isLoggedIn"
    >
      <UButton
        @click="makePayment(billing.plan, billing.type)"
        block
        class="mt-4"
        :label="billing.label"
        :loading="loadingPlan === billing.plan"
        :disabled="buttonDisabled(billing.type)"
        :color="buttonColor(billing.type)"
        :variant="buttonVariant(billing.type)"
      />
    </BillingCard>
  </div>
</template>

<script lang="ts" setup>
import type { User } from "~/types";

const user = useCurrentUser();
const { subscribeToDoc } = useFirebase();
const { loadingPlan, makePayment, loading, plans } = useBilling();

const plan = ref<string>();
const isLoggedIn = computed(() => !!user.value);
const subscriptionStatus = ref<string>();

const unsubscribe = subscribeToDoc({
  collectionName: "users",
  id: user.value?.uid,
  onUpdate: (data) => {
    const users = data as User;
    plan.value = users.subscription?.plan.name.toLowerCase();
    subscriptionStatus.value = users.subscription?.status;
  },
  onError: (error) => {
    console.error("Error fetching document:", error);
  },
});

onUnmounted(() => {
  unsubscribe?.();
});

function buttonDisabled(billingType: string) {
  if (!isLoggedIn.value) return false;
  return plan.value !== billingType.toLowerCase() || subscriptionStatus.value === "active";
}

function buttonColor(billingType: string) {
  if (!isLoggedIn.value) return "primary";
  return plan.value === billingType.toLowerCase() ? "primary" : "gray";
}

function buttonVariant(billingType: string) {
  if (!isLoggedIn.value) return "solid";
  return plan.value === billingType.toLowerCase() ? "soft" : "ghost";
}
</script>

<style scoped></style>
