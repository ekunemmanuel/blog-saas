<template>
  <div class="flex flex-col min-h-screen pb-6">
    <div class="flex-1">
      <UContainer class="p-6">
        <div v-if="data">
          <div class="space-y-4">
            <div>
              <h2 class="text-2xl font-semibold">{{ data.displayName }}</h2>
              <p>{{ data.email }}</p>
            </div>
            <div>
              <p><strong>Account Created:</strong> {{ data.createdAt }}</p>
              <p><strong>Last Updated:</strong> {{ data.updatedAt }}</p>
            </div>
            <div v-if="data.siteIds?.length" class="mt-4">
              <h3 class="text-xl font-semibold">Sites</h3>
              <p>{{ data.siteIds.length }}</p>
            </div>

            <div v-if="data.postIds?.length" class="mt-4">
              <h3 class="text-xl font-semibold">Posts</h3>
              <p>{{ data.postIds.length }}</p>
            </div>
            <div v-if="data.subscription" class="space-y-2">
              <div>
                <h3 class="text-xl font-semibold">Subscription Details</h3>
                <p>
                  <strong>Status: </strong>
                  <span class="capitalize">
                    {{ data.subscription.status }}
                  </span>
                </p>
                <p>
                  <strong>Customer Code:</strong>
                  {{ data.subscription.customerCode }}
                </p>
                <p>
                  <strong>Plan Name:</strong> {{ data.subscription.plan.name }}
                </p>
                <p>
                  <strong>Interval: </strong>
                  <span class="capitalize">
                    {{ data.subscription.plan.interval }}
                  </span>
                </p>
                <p>
                  <strong>Amount:</strong> NGN
                  {{ data.subscription.plan.amount }}
                </p>
                <p>
                  <strong>Next Payment:</strong>
                  {{ data.subscription.nextPaymentDate }}
                </p>
              </div>
              <div v-if="data.subscription.status == 'active'">
                <UButton
                  label="Disable"
                  @click="
                    disableSubscription(
                      data.subscription.subscriptionCode,
                      data.subscription.token
                    )
                  "
                />
              </div>
              <div v-else-if="data.subscription.status == 'cancelled'">
                <UButton
                  label="Enable"
                  @click="
                    makePayment(
                      data.subscription.plan.code,
                      data.subscription.plan.name
                    )
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <USkeleton class="h-40 w-full" />
        </div>
      </UContainer>
    </div>
    <div class="mt-4">
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
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              label="Delete"
              color="rose"
              @click="() => (isOpen = true)"
            />
          </div>
        </UCard>
      </UContainer>
    </div>
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
          <UButton color="rose" label="Delete" @click="deleteUserAccount" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { Post, Site, User } from "~/types";

const user = useCurrentUser();
const { makePayment, disableSubscription } = useBilling();
const { getDoc, removeDoc, fetchDoc, deleteFile, deleteAccount } =
  useFirebase();

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

async function deleteUserAccount() {
  loading.value = true;
  try {
    if (!user.value) return;

    const userData = await getUserData(user.value.uid);
    if (userData) {
      if (userData.subscription?.status === "active") {
        notification.info({
          title: "Info",
          description: "Disabling subscription...",
          id: "info",
        });
        await disableSubscription(
          userData.subscription?.subscriptionCode,
          userData.subscription?.token
        );
      }
      await deleteUserRelatedData(userData);

      await removeUser(userData.id);
    }
    await deleteAccount(user.value);

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

async function getUserData(uid: string): Promise<User | null> {
  const { data } = await fetchDoc({
    collectionName: "users",
    id: uid,
  });
  return data?.exists() ? (data.data() as User) : null;
}

async function deleteUserRelatedData(userData: User) {
  const siteIds = userData.siteIds || [];
  const postIds = userData.postIds || [];

  await Promise.allSettled([
    ...siteIds.map(deleteSite),
    ...postIds.map(deletePost),
  ]);
}

async function removeUser(userId: string) {
  await removeDoc({
    collectionName: "users",
    id: userId,
  });
}

async function deleteSite(id: string) {
  try {
    const siteData = await getSiteData(id);
    if (siteData) {
      await deleteSiteRelatedData(siteData);
      await removeSite(id);
    }
  } catch (error: any) {
    notification.error({
      title: "Error",
      description: error.message,
      id: "error",
    });
  }
}

async function getSiteData(id: string): Promise<Site | null> {
  const { data } = await fetchDoc({ collectionName: "sites", id });
  return data?.exists() ? (data.data() as Site) : null;
}

async function deleteSiteRelatedData(siteData: Site) {
  const postIds = siteData.postIds || [];
  await Promise.allSettled([
    ...postIds.map(deletePost),
    deleteFile({ path: `${siteData.imageId}` }),
  ]);
}

async function removeSite(id: string) {
  await removeDoc({
    collectionName: "sites",
    id,
  });
}

async function deletePost(id: string) {
  try {
    const postData = await getPostData(id);
    if (postData) {
      await deletePostRelatedData(postData);
      await removePost(id);
    }
  } catch (error: any) {
    notification.error({
      title: "Error",
      description: error.message,
      id: "error",
    });
  }
}

async function getPostData(id: string): Promise<Post | null> {
  const { data } = await fetchDoc({ collectionName: "posts", id });
  return data?.exists() ? (data.data() as Post) : null;
}

async function deletePostRelatedData(postData: Post) {
  if (postData.imageId) {
    await deleteFile({ path: `${postData.imageId}` });
  }
}

async function removePost(id: string) {
  await removeDoc({
    collectionName: "posts",
    id,
  });
}

useHead({
  title: "Profile Page",
  meta: [
    {
      name: "description",
      content: "Your profile page",
    },
  ],
});
</script>

<style></style>
