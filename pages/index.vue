<template>
  <main>
    <UContainer class="py-14 md:py-20 relative">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl gap-16 sm:gap-y-24 flex flex-col"
      >
        <div class="text-center">
          <div class="mb5">
            <UBadge variant="soft" class="rounded-full">
              Ultimate blogging saas for you
            </UBadge>
          </div>
          <h1
            class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl max-w-xl mx-auto"
          >
            Setup your blog <span class="text-primary"> in Minutes </span>
          </h1>
          <div
            class="mt-6 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-gray-600 dark:text-gray-300"
          >
            Setting up your blog is hard and time consuming. We make it easy for
            you to create a blog in minutes
          </div>

          <div class="my-5">
            <UButton to="/dashboard" v-if="user">Dashboard</UButton>
            <div
              v-else
              class="gap-4 flex flex-wrap justify-center items-center"
            >
              <UButton variant="soft" to="/login">Sign in</UButton>
              <UButton to="/signup">Try for free</UButton>
            </div>
          </div>

          <div class="flex items-center gap-2 justify-center">
            <div class="flex">
              <UAvatarGroup
                size="sm"
                :ui="{
                  margin: '-me-2.5',
                  wrapper: 'items-center',
                }"
              >
                <UAvatar
                  alt="Emmanuel Apabiekun"
                />
                <UAvatar
                  alt="Daniel Oluwagbemiga"
                />
                <UAvatar
                  alt="Ayo Ayoola"
                />
                <UAvatar
                  alt="Wale Ogunniyi"
                />
                <UAvatar
                  alt="Tobi Ola"
                />
              </UAvatarGroup>
            </div>
            <div class="flex flex-col items-start">
              <div>
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  class="text-primary text-sm"
                  name="material-symbols-light:star-rounded"
                />
              </div>
              <p class="text-xs">5 Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
    <UContainer>
      <div class="w-full bg-primary p-1 rounded-md">
        <ClientOnly>
          <Preview  />
          <template #fallback>
            <USkeleton class="h-[600px] w-full" />
          </template>
        </ClientOnly>
      </div>
    </UContainer>
    <UContainer class="py-8">
      <h2 class="text-center text-3xl">Pricing</h2>
      <Billing />
    </UContainer>
  </main>
</template>

<script lang="ts" setup>
const user = useCurrentUser();
useHead({
  title:
    "Painite Blog - The Ultimate Blogging SaaS for Seamless Content Creation",
  meta: [
    {
      name: "description",
      content:
        "Painite Blog is the leading SaaS platform designed for effortless content creation, management, and publishing. Empower your blogging journey with our intuitive tools and features.",
    },
  ],
});
</script>

<style scoped></style>
