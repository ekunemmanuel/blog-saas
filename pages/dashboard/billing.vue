<template>
  <UContainer class="p-6">
    <p class="text-center text-primary">Pricing</p>
    <h1 class="lg:text-5xl max-w-2xl mx-auto text-center text-2xl md:text-4xl">
      Pricing Plans for Everyone and Every Budget!
    </h1>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-4 mt-8">
      <BillingCard
        v-for="billing in plans"
        :key="billing.plan"
        :billing="billing"
      />
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
const plans = usePlans();
</script>

<style></style>
