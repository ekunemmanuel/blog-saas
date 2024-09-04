<template>
  <UCard
    class="p-4 border-2 !h-full"
    :class="[isPrimaryColor ? 'border-primary-500' : 'text-gray-500']"
    :ui="{
      body: {
        base: 'flex flex-col gap-2 h-full',
      },
    }"
  >
    <div class="relative">
      <div class="absolute -top-6">
        <UBadge v-if="isActivePlan" variant="subtle">Your Current Plan</UBadge>
      </div>
      <div class="flex justify-between gap-2 items-center">
        <div>
          <h2 class="text-lg font-semibold md:text-2xl">{{ billing.type }}</h2>
          <p class="text-sm">{{ billing.description }}</p>
        </div>
        <div class="font-bold uppercase">
          <p
            class="text-3xl font-bold"
            :class="[isPrimaryColor ? 'text-primary-500' : 'text-gray-500']"
          >
            {{ billing.amount }}
          </p>
          <p>{{ billing.interval }}</p>
        </div>
      </div>
    </div>
    <ul
      class="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-400 list-disc list-inside flex-1"
    >
      <li v-for="(benefit, index) in billing.benefits" :key="index">
        {{ benefit }}
      </li>
    </ul>
    <div>
      <slot></slot>
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
    code: string;
    label: string;
    interval: string;
  };
  plan?: string;
  isLoggedIn?: boolean;
}>();

const isActivePlan = computed(
  () => props.billing.type.toLowerCase() === props.plan?.toLowerCase()
);

const isPrimaryColor = computed(
  () => !props.plan || props.plan.toLowerCase() === "free" || isActivePlan.value
);
</script>

<style scoped></style>
