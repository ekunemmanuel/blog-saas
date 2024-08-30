<template>
  <main>
    <UContainer class="py-24 sm:py-32 md:py-40 relative">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl gap-16 sm:gap-y-24 flex flex-col"
      >
        <div class="text-center">
          <div class="mb-10">
            <UBadge variant="soft" class="rounded-full">
              Ultimate blogging saas for you
            </UBadge>
          </div>
          <h1
            class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl"
          >
            Setup your blog <span class="text-primary"> in Minutes </span>
          </h1>
          <div
            class="mt-6 text-lg tracking-tight text-gray-600 dark:text-gray-300"
          >
            Setting up your blog is hard and time consuming. We make it easy for
            you to create a blog in minutes
          </div>

          <div class="mt-10">
            <UButton to="/dashboard" v-if="user">Dashboard</UButton>
            <div
              v-else
              class="gap-4 flex flex-wrap justify-center items-center"
            >
              <UButton variant="soft" to="/login">Sign in</UButton>
              <UButton to="/signup">Try for free</UButton>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
    <!-- <UContainer class="py-24 sm:py-32 md:py-40 relative">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl gap-16 sm:gap-y-24 flex flex-col"
      >
        <div class="text-center">
          <p>Trusted by the best companies in the world</p>
        </div>
      </div>
    </UContainer>

    <UContainer class="py-24 sm:py-32">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl gap-16 sm:gap-y-24 flex flex-col"
      >
        <div class="text-center flex flex-col items-center">
          <h2
            class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl"
          >
            Get your blog up and running in minutes
          </h2>
          <div class="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <UCard
            class="relative rounded-xl before:hidden before:lg:block before:absolute before:bg-slate-300 before:-inset-[2px] before:h-[calc(100%+4px)] before:w-[calc(100%+4px)] before:z-[-1] before:rounded-[13px] shadow-md"
          >
            <UIcon name="heroicons:cog" size="32" class="mb-2" />
            <p
              class="text-gray-900 dark:text-white text-base font-bold truncate"
            >
              Easy to use
            </p>
            <div class="text-[15px] text-gray-500 dark:text-gray-400 mt-1">
              Id laborum laboris duis nostrud excepteur ut velit nulla magna
              Lorem proident non.
            </div>
          </UCard>
        </div>
      </div>
    </UContainer> -->

    <UContainer class="pb-8">
      <h2 class="text-center text-3xl">Pricing</h2>
      <div
        class="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-4 mt-8"
      >
        <BillingCard
          v-for="billing in plans"
          :key="billing.plan"
          :billing="billing"
        />
      </div>
    </UContainer>
  </main>
</template>

<script lang="ts" setup>
const user = useCurrentUser();
useHead({
  title: "Blog SaaS",
});

const plans = usePlans();
</script>

<style scoped></style>
