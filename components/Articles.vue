<template>
  <div>
    <div v-if="posts.length === 0">
      <div
        class="grid place-items-center min-h-[calc(100vh-128px)] md:min-h-[calc(100vh-64px)] px-4"
      >
        <EmptyCard>
          <template #title> You haven't made any article </template>
          <template #description>
            You can create a new article by clicking the button below.
          </template>
          <template #button>
            <UButton
              :to="`/dashboard/sites/${siteId}/new`"
              label="New Article"
              icon="heroicons:plus-circle"
            />
          </template>
        </EmptyCard>
      </div>
    </div>

    <UContainer v-else>
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Articles</h2>
          <p class="text-sm text-gray-500">
            You can view, edit, and delete your articles here. Click the
            ellipsis icon to see more actions.
          </p>
        </template>
        <ClientOnly>
          <UTable :rows="posts" :columns="columns">
            <template #coverImage-data="{ row }">
              <div class="size-[50px] overflow-hidden">
                <NuxtImg
                  width="50px"
                  height="50px"
                  class="rounded-md object-cover size-[50px]"
                  :src="row.coverImage"
                />
              </div>
            </template>

            <template #status-data="{ row }">
              <UBadge
                :color="row.status ? 'primary' : 'gray'"
                class="rounded-full px-4"
                variant="subtle"
              >
                {{ row.status ? "Published" : "Draft" }}
              </UBadge>
            </template>
            <template #title-data="{ row }">
              <p class="truncate max-w-[250px]">
                {{ row.title }}
              </p>
            </template>
            <template #actions-data="{ row }">
              <UDropdown :items="items(row)">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-20-solid"
                />
              </UDropdown>
            </template>
          </UTable>

          <template #placeholder>
            <div class="space-y-5">
              <div v-for="item in posts" :key="item.id">
                <USkeleton class="h-24" />
              </div>
            </div>
          </template>
        </ClientOnly>
      </UCard>
    </UContainer>
  </div>

  <UModal v-model="isOpen" :prevent-close="loading">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold">Delete article</h2>
      </template>
      <p>
        Are you sure you want to delete this article?This action cannot be
        undone.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="gray"
            variant="ghost"
            @click="cancel"
          />
          <UButton
            v-if="postId"
            color="rose"
            label="Delete"
            @click="deletePost(postId)"
            :loading
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { Post,  } from "~/types";

const { getDocs, fetchDoc, deleteFile, removeDoc, modifyDoc } = useFirebase();
const isOpen = ref(false);
const loading = useLoading();
const notification = useNotification();
const props = defineProps<{
  siteId: string;
  userId: string;
}>();

const { data: posts } = getDocs<Post>({
  collectionName: "posts",
  queryConfig: {
    where: [
      { fieldPath: "userId", opStr: "==", value: props.userId },
      {
        fieldPath: "siteId",
        opStr: "==",
        value: props.siteId,
      },
    ],
    orderBy: [
      {
        fieldPath: "createdAt",
        directionStr: "desc",
      },
    ],
  },
});

const columns: {
  key: keyof Post | string;
  label: string;
}[] = [
  {
    key: "coverImage",
    label: "Image",
  },
  {
    key: "title",
    label: "Title",
  },
  {
    key: "createdAt",
    label: "Created At",
  },
  {
    key: "updatedAt",
    label: "Updated At",
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "actions",
    label: "Actions",
  },
];
const postId = ref<string>();
const items = (row: Post) => [
  [
    {
      label: "View",
      icon: "i-heroicons-eye-20-solid",
      click: async () => {
        const { data: siteData } = await fetchDoc({
          collectionName: "sites",
          id: props.siteId,
        });
        if (siteData && siteData.exists()) {
          const site = siteData.data() as Site;
          navigateTo({
            name: "blogs-name-slug",
            params: {
              name: site.subdirectory,
              slug: row.slug,
            },
          });
          return;
        }
        navigateTo("/dashboard/sites");
      },
    },
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => {
        navigateTo({
          name: "dashboard-sites-siteId-postId",
          params: {
            siteId: props.siteId,
            postId: row.id,
          },
        });
      },
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => {
        isOpen.value = true;
        postId.value = row.id;
      },
    },
  ],
];

async function deletePost(id: string) {
  try {
    loading.value = true;
    const post = await fetchPost(id);
    if (post) {
      await deletePostImage(post.imageId);
      await updateSitePostIds(id);
      await updateUserPostIds(id);
      await removePost(id);

      notification.success({
        id: "success",
        title: "Success",
        description: "Article deleted successfully",
      });
    }
  } catch (error: any) {
    console.error(error);
    notification.error({
      id: "error",
      title: "Error",
      description: error.message,
    });
  } finally {
    loading.value = false;
    isOpen.value = false;
  }
}

async function fetchPost(id: string): Promise<Post | null> {
  const { data: post } = await fetchDoc({
    collectionName: "posts",
    id,
  });
  return post?.exists() ? (post.data() as Post) : null;
}

async function deletePostImage(imageId: string | undefined) {
  if (imageId) {
    await deleteFile({ path: `${imageId}` });
  }
}

async function updateSitePostIds(postId: string) {
  await modifyDoc({
    collectionName: "sites",
    id: props.siteId,
    arrayOperations: [
      {
        field: "postIds",
        remove: [postId],
      },
    ],
  });
}

async function updateUserPostIds(postId: string) {
  await modifyDoc({
    collectionName: "users",
    id: props.userId,
    arrayOperations: [
      {
        field: "postIds",
        remove: [postId],
      },
    ],
  });
}

async function removePost(id: string) {
  await removeDoc({
    collectionName: "posts",
    id,
  });
}

function cancel() {
  isOpen.value = false;
  postId.value = undefined;
}
</script>

<style></style>
