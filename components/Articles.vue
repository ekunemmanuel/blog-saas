<template>
  <div>
    <UContainer class="p-4">
      <div class="flex justify-end gap-2">
        <UButton
          icon="heroicons:document-text"
          variant="ghost"
          label="View Blog"
          :to="`/blogs/${subdirectory}`"
        />
        <UButton
          variant="ghost"
          label="Settings"
          icon="heroicons:cog"
          :to="`/dashboard/sites/${siteId}/settings`"
        />
        <UButton
          :to="`/dashboard/sites/${siteId}/new`"
          label="Create Article"
          icon="heroicons:plus-circle"
        />
      </div>
    </UContainer>
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
              <p class="truncate  max-w-[250px]">
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
import type { Post, Site } from "~/types";

const { getDocs, fetchDoc, deleteFile, removeDoc, modifyDoc } = useFirebase();
const user = useCurrentUser();
const isOpen = ref(false);
const loading = useLoading();
const route = useRoute();
const notification = useNotification();
if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}
const props = defineProps<{
  siteId: string;
}>();

const { data: site } = await fetchDoc({
  collectionName: "sites",
  id: props.siteId,
});


const { data: userData } = await fetchDoc({
  collectionName: "users",
  id: user.value?.uid!,
});

if (!site?.exists() || !userData?.exists()) {
  notification.error({
    id: "not-found",
    title: "Not Found",
    description: "The site you are looking for does not exist.",
  });
  navigateTo({
    path: "/dashboard/sites",
  });
}
const siteData = site?.data() as Site;
const subdirectory = siteData?.subdirectory;

const { data: posts } = getDocs<Post>({
  collectionName: "posts",
  queryConfig: {
    where: [
      { fieldPath: "userId", opStr: "==", value: user.value?.uid },
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
      click: () => console.log("View", row.id),
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
    const { data: post } = await fetchDoc({
      collectionName: "posts",
      id,
    });
    if (post?.exists()) {
      const data = post.data() as Post;
      await deleteFile({
        path: `sites/${props.siteId}/posts/${data.imageId}`,
      });
      await modifyDoc({
        collectionName: "sites",
        id: props.siteId,
        data: {},
        arrayOperations: [
          {
            field: "postIds",
            remove: [id],
          },
        ],
      });
      await modifyDoc({
        collectionName: "users",
        id: user.value?.uid!,
        data: {},
        arrayOperations: [
          {
            field: "postIds",
            remove: [id],
          },
        ],
      });
      await removeDoc({
        collectionName: "posts",
        id,
      });

      loading.value = false;
      isOpen.value = false;
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
    loading.value = false;
  } finally {
    loading.value = false;
  }
}

function cancel() {
  isOpen.value = false;
  postId.value = undefined;
}
</script>

<style></style>
