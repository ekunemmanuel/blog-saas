<template>
  <UCard
    class="flex flex-col flex-1 h-full rounded-none"
    :ui="{
      body: { base: 'flex-1' },
      ring: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
    }"
  >
    <template #header>
      <div
        class="text-center flex md:justify-center justify-between items-center"
      >
        <Logo />
        <UButton
          variant="ghost"
          color="gray"
          label="close"
          @click="isSliderOpen = false"
          class="block md:hidden"
        />
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        active
        exact-active-class="dark:bg-primary bg-primary-300"
        :to="link.to"
        class="rounded-md p-2 dark:hover:bg-primary hover:bg-primary-300 duration-300"
        @click="isSliderOpen = false"
      >
        <span class="flex items-center gap-2">
          <UIcon :name="link.icon" class="text-[25px]" /> {{ link.label }}
        </span>
      </NuxtLink>
    </div>
    <template #footer>
      <div class="flex gap-2">
        <ColorMode />
        <div class="flex-1">
          <UButton
            label="Logout"
            icon="hugeicons:logout-circle-01"
            trailing
            class="rounded-full"
            color="rose"
            variant="ghost"
            block
            @click="logOut"
          />
        </div>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
const { logOut } = useFirebase();
const isSliderOpen = defineModel({
  default: false,
});

const links = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: "material-symbols-light:team-dashboard-outline",
  },
  {
    label: "Sites",
    to: "/dashboard/sites",
    icon: "material-symbols-light:link-rounded",
  },
  {
    label: "Billing",
    to: "/dashboard/billing",
    icon: "material-symbols:attach-money-rounded",
  },
  {
    label: "Profile",
    to: "/dashboard/profile",
    icon: "material-symbols-light:account-circle-outline",
  },
];
</script>

<style></style>
