<template>
  <div>
    <UContainer class="p-6">
      <div v-if="data" class="space-y-4">
        <h2 class="text-2xl font-semibold">{{ data.displayName }}</h2>
        <p><strong>Email:</strong> {{ data.email }}</p>

        <div v-if="data.plan" class="mt-4 p-4 border rounded-lg bg-gray-500">
          <h3 class="text-xl font-semibold">Plan Details</h3>
          <p><strong>Plan Name:</strong> {{ data.plan.name }}</p>
          <p><strong>Interval:</strong> {{ data.plan.interval }}</p>
          <p><strong>Amount:</strong> NGN{{ data.plan.amount / 100 }}</p>
          <p><strong>Start Date:</strong> {{ data.plan.startAt }}</p>
          <p><strong>End Date:</strong> {{ data.plan.endAt }}</p>
        </div>

        <div v-if="data.siteIds?.length" class="mt-4">
          <h3 class="text-xl font-semibold">Sites</h3>
          <ul class="list-disc ml-4">
            <li v-for="siteId in data.siteIds" :key="siteId">{{ siteId }}</li>
          </ul>
        </div>

        <div v-if="data.postIds?.length" class="mt-4">
          <h3 class="text-xl font-semibold">Posts</h3>
          <ul class="list-disc ml-4">
            <li v-for="postId in data.postIds" :key="postId">{{ postId }}</li>
          </ul>
        </div>

        <div class="mt-4">
          <p><strong>Customer Code:</strong> {{ data.customerCode }}</p>
          <p><strong>Account Created:</strong> {{ data.createdAt }}</p>
          <p><strong>Last Updated:</strong> {{ data.updatedAt }}</p>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-500">No user data available.</p>
      </div>
    </UContainer>
    <UContainer>
      <UCard
        :ui="{
          background: 'dark:bg-red-900 bg-red-400',
          ring: 'ring-1 ring-red-200 dark:ring-red-800',
        }"
      >
        <h3 class="text-2xl font-bold dark:text-red-200 text-red-700">
          Danger
        </h3>
        <p class="text-gray-900 dark:text-gray-200 mt-1">
          Are you sure you want to delete this article? This action cannot be
          undone.
        </p>
        <div class="flex justify-end gap-2">
          <UButton label="Delete" color="rose" @click="() => (isOpen = true)" />
        </div>
      </UCard>
    </UContainer>
  </div>
  <UModal v-model="isOpen" :prevent-close="loading">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold">Delete Account</h2>
      </template>
      <p>
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="gray"
            variant="ghost"
            @click="() => (isOpen = false)"
          />
          <UButton color="rose" label="Delete" @click="deleteAccount" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { Post, Site, User } from "~/types";

const user = useCurrentUser();
const {
  getDoc,
  removeDoc,
  fetchDoc,
  deleteFile,
  deleteAccount: deleteAccountFirebase,
} = useFirebase();
const notification = useNotification();
const isOpen = ref(false);
const loading = useLoading();
if (!user.value) {
  navigateTo("/login");
  throw createError({
    message: "You are not logged in",
    statusCode: 401,
  });
}
const { data, error } = getDoc<User>({
  collectionName: "users",
  id: user.value.uid,
});

if (error.value) {
  notification.error({
    title: "Error",
    description: error.value.message,
    id: "error",
  });
  navigateTo("/login");
}

async function deleteAccount() {
  loading.value = true;
  try {
    if (!user.value) return;

    const { data } = await fetchDoc({
      collectionName: "users",
      id: user.value.uid,
    });

    if (data && data.exists()) {
      const userData = data.data() as User;

      await Promise.all([
        ...(userData.siteIds?.map(deleteSite) || []),
        ...(userData.postIds?.map(deletePost) || []),
      ]);

      await removeDoc({ collectionName: "users", id: userData.id });
    }

    await deleteAccountFirebase(user.value);

    notification.success({
      title: "Success",
      description: "Account deleted successfully",
      id: "success",
    });
  } catch (error: any) {
    notification.error({
      title: "Error",
      description: error.message,
      id: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function deleteSite(id: string) {
  try {
    const { data } = await fetchDoc({ collectionName: "sites", id });

    if (data && data.exists()) {
      const siteData = data.data() as Site;

      await Promise.all([
        ...(siteData.postIds?.map(deletePost) || []),
        deleteFile({ path: `${siteData.imageId}` }),
      ]);

      await removeDoc({ collectionName: "sites", id: data.id });
    }
  } catch (error: any) {
    notification.error({
      title: "Error",
      description: error.message,
      id: "error",
    });
  }
}

async function deletePost(id: string) {
  try {
    const { data } = await fetchDoc({ collectionName: "posts", id });

    if (data && data.exists()) {
      const postData = data.data() as Post;

      if (postData.imageId) {
        await deleteFile({
          path: `${postData.imageId}`,
        });
      }

      await removeDoc({ collectionName: "posts", id: data.id });
    }
  } catch (error: any) {
    notification.error({
      title: "Error",
      description: error.message,
      id: "error",
    });
  }
}
</script>

<style></style>
