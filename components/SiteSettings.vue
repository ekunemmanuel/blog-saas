<template>
  <div>
    <UContainer class="p-6 space-y-6">
      <div class="flex gap-2 items-center mb-6">
        <Back :to="`/dashboard/sites/${siteId}`" />
        <h2 class="text-xl font-bold">Go back</h2>
      </div>

      <UCard>
        <template #header>
          <h3 class="text-2xl font-bold">Image</h3>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            This is the image of your site you can change it here
          </p>
        </template>
        <div
          ref="dropZoneRef"
          class="h-[400px] flex items-center justify-center rounded-md border"
          :class="[isOverDropZone ? 'border-primary-300' : 'border-gray-300']"
        >
          <div
            class="text-center justify-center items-center flex flex-col gap-2"
          >
            <div class="flex gap-4 items-center" v-if="previousImageUrl">
              <div class="size-[100px] overflow-hidden rounded-md">
                <ClientOnly>
                  <NuxtImg
                    :src="previousImageUrl"
                    alt="Previous Image"
                    fit="cover"
                    class="w-full h-full object-cover"
                  />
                  <template #placeholder>
                    <USkeleton class="h-full w-full" />
                  </template>
                </ClientOnly>
              </div>
              <UIcon v-if="imageUrl" name="heroicons:arrow-right-20-solid" />
              <div
                v-if="imageUrl"
                class="size-[100px] overflow-hidden  rounded-md"
              >
                <ClientOnly>
                  <NuxtImg
                    :src="imageUrl"
                    alt="New Image"
                    fit="cover"
                    class="w-full h-full object-cover"
                  />
                  <template #placeholder>
                    <USkeleton class="h-full w-full bg-black" />
                  </template>
                </ClientOnly>
              </div>
            </div>
            <UIcon
              v-else
              name="ic:baseline-insert-drive-file"
              class="text-6xl text-primary-300"
            />
            Drop files here
            <div v-if="imageUrl" class="gap-2 flex items-center justify-center">
              <p>Updated</p>
            </div>
            <div v-else class="gap-2 flex items-center justify-center">
              <UButton :loading="uploading" type="button" @click="open"
                >Choose file</UButton
              >
            </div>
            <small> Once you upload an image, there is no turning back </small>
          </div>
        </div>
      </UCard>

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

    <UModal v-model="isOpen" :prevent-close="loading">
      <UCard>
        <template #header>
          <h2 class="text-2xl font-bold">Delete Site</h2>
        </template>
        <p>
          Are you sure you want to delete this site? This action cannot be
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
              v-if="siteId"
              color="rose"
              label="Delete"
              @click="deleteSite(siteId)"
              :loading
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { v4 } from "uuid";
import type { Post, Site } from "~/types";
const dropZoneRef = ref<HTMLDivElement>();
const imageId = ref<string>();
const uploading = ref(false);
const imageUrl = ref<string>();
const previousImageId = ref<string | null>(null);
const previousImageUrl = ref<string | null>(null);
const isOpen = ref(false);
const loading = useLoading();
const props = defineProps<{
  siteId: string;
}>();
const notification = useNotification();
const { modifyDoc, deleteFile, uploadFile, fetchDoc, removeDoc } =
  useFirebase();
const user = useCurrentUser();
const route = useRoute();

if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

const { data: site } = await fetchDoc({
  collectionName: "sites",
  id: props.siteId,
});

if (site?.exists()) {
  previousImageId.value = site.data().imageId || null;
  previousImageUrl.value = site.data().imageUrl || null;
} else {
  notification.error({
    id: "not-found",
    title: "Not Found",
    description: "The site you are looking for does not exist.",
  });
  navigateTo({
    path: "/dashboard/sites",
  });
}

function onDrop(files: File[] | null) {
  if (files) {
    handleFileChange(files[0]);
  }
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  dataTypes: ["image/jpeg", "image/png", "image/jpg"],
});

const { open, onChange } = useFileDialog({
  accept: "image/*",
  directory: false,
});

onChange((files) => {
  if (files) {
    handleFileChange(files[0]);
  }
});

async function handleFileChange(file: File) {
  if (!file) return;

  uploading.value = true;
  imageId.value = v4();
  const { url, uploadError } = await uploadFile({
    file,
    path: `sites/${props.siteId}/${imageId.value}`,
  });
  uploading.value = false;

  if (uploadError.value) {
    console.error(uploadError.value);
    return;
  }

  imageUrl.value = url.value!;
  await modifyDoc({
    collectionName: "sites",
    id: props.siteId,
    data: {
      imageId: imageId.value,
      imageUrl: imageUrl.value,
    },
  });

  notification.success({
    id: "image-uploader",
    title: "Success",
    description: "Image uploaded successfully",
  });

  setTimeout(() => {
    previousImageId.value = imageId.value!;
    previousImageUrl.value = imageUrl.value!;
    imageUrl.value = undefined;
  }, 2000);
}

watch(imageId, async (newVal, oldVal) => {
  if (oldVal) {
    await deleteFile({ path: `sites/${props.siteId}/${oldVal}` });
  }
});

async function deleteSite(id: string) {
  try {
    loading.value = true;
    const { data: site } = await fetchDoc({
      collectionName: "sites",
      id,
    });

    if (site?.exists()) {
      const data = site.data() as Site;
      // get all posts and delete them
      for (const postId of data.postIds ?? []) {
        const { data: post } = await fetchDoc({
          collectionName: "posts",
          id: postId,
        });
        // if post exists, delete the image and the post
        if (post?.exists()) {
          const postData = post.data() as Post;
          if (postData.imageId) {
            await deleteFile({
              path: `sites/${props.siteId}/posts/${postData.imageId}`,
            });
          }
          await removeDoc({ collectionName: "posts", id: postId });
        }
      }
      // delete site image
      if (data.imageId) {
        await deleteFile({ path: `sites/${props.siteId}/${data.imageId}` });
      }

      // remove site from user's siteIds and postIds
      await modifyDoc({
        collectionName: "users",
        id: user.value?.uid!,
        arrayOperations: [
          { field: "postIds", remove: [...data.postIds!] },
          { field: "siteIds", remove: [id] },
        ],
      });

      // delete site
      await removeDoc({ collectionName: "sites", id });
      notification.success({
        id: "success",
        title: "Success",
        description: "Site deleted successfully",
      });
      navigateTo({ path: "/dashboard/sites" });
    }
  } catch (error: any) {
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

function cancel() {
  isOpen.value = false;
}
</script>
