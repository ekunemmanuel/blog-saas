<template>
  <UCard
    class="p-4 border-2 !h-full"
    :class="[
      !active
        ? 'border-primary-500 text-primary-500'
        : isActivePlan
        ?  'border-primary-500 text-primary-500'
        : 'text-gray-500',
    ]"
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
      <div class="flex justify-between items-end">
        <h2 class="text-lg font-semibold md:text-2xl">{{ billing.type }}</h2>
        <p
          class="text-4xl font-bold"
          :class="[
            !active
              ? 'text-primary-500'
              : isActivePlan
              ? 'text-primary-500'
              : 'text-gray-500',
          ]"
        >
          {{ billing.amount }}
        </p>
      </div>
      <p>{{ billing.description }}</p>
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
    plan: string;
    label: string;
  };
  plan?: string;
  active?: boolean;
}>();

const isActivePlan = computed(
  () => props.billing.type.toLowerCase() === props.plan?.toLowerCase()
);
</script>

<style scoped></style>
