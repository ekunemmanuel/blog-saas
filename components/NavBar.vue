<template>
  <UContainer
    class="backdrop-blur border-b border-gray-200 dark:border-gray-800 rounded-full"
  >
    <nav class="py-2 flex items-center justify-between">
      <Logo />

      <div>
        <div class="flex gap-2 md:hidden">
          <div v-if="isLoggedIn" class="flex gap-4"></div>
          <UButton
            v-else
            label="Sign in"
            color="black"
            variant="outline"
            class="rounded-full"
            to="/login"
          />

          <UButton
            icon="material-symbols:filter-list-rounded"
            @click="isSliderOpen = !isSliderOpen"
            variant="ghost"
          />
          <ColorMode />
        </div>
        <!-- large screen -->
        <div class="hidden items-center justify-between md:flex gap-4">
          <div v-if="isLoggedIn" class="flex gap-4">
            <UButton
              label="Logout"
              icon="hugeicons:logout-circle-01"
              trailing
              class="rounded-full"
              color="rose"
              variant="ghost"
              @click="logOut"
            />
            <UButton
              label="Dashboard"
              icon="heroicons:arrow-right-20-solid"
              trailing
              class="rounded-full"
              to="/dashboard"
            />
          </div>

          <div v-else class="flex gap-4 items-center">
            <UButton
              label="Sign in"
              color="gray"
              variant="ghost"
              class="rounded-full"
              to="/login"
            />
            <UButton
              label="Sign up"
              icon="heroicons:arrow-right-20-solid"
              trailing
              class="rounded-full"
              to="/signup"
            />
          </div>
          <ColorMode />
        </div>
      </div>
    </nav>
  </UContainer>

  <USlideover v-model="isSliderOpen">
    <UCard
      class="flex flex-col flex-1"
      :ui="{
        body: { base: 'flex-1 overflow-auto' },
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex justify-end">
          <UButton
            icon="material-symbols:close-small-outline-rounded"
            color="gray"
            @click="isSliderOpen = false"
          />
        </div>
      </template>
      <UButton
        label="Dashboard"
        icon="heroicons:arrow-right-20-solid"
        trailing
        class="rounded-full"
        to="/dashboard"
        block
      />
      <template #footer v-if="isLoggedIn">
        <UButton
          label="Logout"
          icon="hugeicons:logout-circle-01"
          trailing
          class="rounded-full"
          color="rose"
          variant="ghost"
          @click="logOut"
        />
      </template>
    </UCard>
  </USlideover>
</template>

<script lang="ts" setup>
const isSliderOpen = ref(false);
const user = useCurrentUser();
const { logOut } = useFirebase();

const isLargeScreen = useMediaQuery("(min-width: 768px)");

watch(isLargeScreen, (val) => {
  val ? (isSliderOpen.value = false) : isSliderOpen.value;
});
const isLoggedIn = computed(() => !!user.value);
</script>

<style></style>
