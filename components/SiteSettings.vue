<template>
  <div>
    <UContainer class="p-6 space-y-6">
      <div class="flex gap-2 items-center mb-6">
        <Back :to="`/dashboard/sites/${siteId}`" />
        <h2 class="text-xl font-bold">Go back</h2>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Update Site</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Update your site by filling out the form below.
          </p>
        </template>
        <fieldset :disabled="loading">
          <UForm
            :schema="schema"
            :state="state"
            @submit="onSubmit"
            class="space-y-4"
          >
            <UFormGroup label="Name" name="name">
              <UInput v-model="state.name" />
            </UFormGroup>
            <UFormGroup label="Description" name="description">
              <UTextarea v-model="state.description" :maxrows="8" autoresize />
            </UFormGroup>
            <UButton
              type="submit"
              block
              trailing
              icon="heroicons:arrow-right-20-solid"
              :loading
            >
              Submit
            </UButton>
          </UForm>
        </fieldset>
      </UCard>

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
                class="size-[100px] overflow-hidden rounded-md"
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
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
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
const site = ref<Site>();
if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

const state = reactive<{
  name?: string;
  description?: string;
}>({
  name: undefined,
  description: undefined,
});
const { data: siteDoc } = await fetchDoc({
  collectionName: "sites",
  id: props.siteId,
});

if (siteDoc?.exists()) {
  previousImageId.value = siteDoc.data().imageId || null;
  previousImageUrl.value = siteDoc.data().imageUrl || null;
  site.value = {
    id: siteDoc.id,
    ...(siteDoc.data() as Site),
  };
  state.name = site.value.name;
  state.description = site.value.description;
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
const schema = z.object({
  name: z.string().min(3).max(40),

  description: z.string().min(3).max(300),
});

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const newData = event.data;

  try {
    if (!site.value || !site.value.id) return;

    await modifyDoc({
      collectionName: "sites",
      id: site.value.id,
      data: newData
    });
    notification.success({
      id:'success',
      description: 'Site details has been updated',
      title:"Success"
    })
  } catch (error) {
    notification.error({
      id:'error',
      description: 'Site details has not been updated',
      title:"Error"
    })
  }
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
    path: `${imageId.value}`,
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

watch(imageId, async (_, oldVal) => {
  if (oldVal) {
    await deleteFile({ path: `${oldVal}` });
  }
});

async function deleteSite(id: string) {
  try {
    loading.value = true;
    const site = await fetchSite(id);
    if (site) {
      await deletePosts(site.postIds ?? []);
      await deleteSiteImage(site.imageId);
      await updateUserSiteData(id);
      await removeSite(id);
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

async function fetchSite(id: string): Promise<Site | null> {
  const { data: site } = await fetchDoc({
    collectionName: "sites",
    id,
  });
  return site?.exists() ? (site.data() as Site) : null;
}

async function deletePosts(postIds: string[]) {
  for (const postId of postIds) {
    const post = await fetchPost(postId);
    if (post) {
      await deletePostImage(post.imageId);
      await removePost(postId);
    }
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

async function removePost(id: string) {
  await removeDoc({ collectionName: "posts", id });
}

async function deleteSiteImage(imageId: string | undefined) {
  if (imageId) {
    await deleteFile({ path: `${imageId}` });
  }
}

async function updateUserSiteData(siteId: string) {
  const siteData = await fetchSite(siteId);
  const postIds = siteData?.postIds || [];
  await modifyDoc({
    collectionName: "users",
    id: user.value?.uid!,
    arrayOperations: [
      { field: "postIds", remove: [...postIds] },
      { field: "siteIds", remove: [siteId] },
    ],
  });
}

async function removeSite(id: string) {
  await removeDoc({ collectionName: "sites", id });
}

function cancel() {
  isOpen.value = false;
}
</script>
