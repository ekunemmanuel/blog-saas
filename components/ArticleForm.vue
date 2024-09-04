<template>
  <UContainer class="p-4">
    <div class="flex gap-2 items-center mb-6">
      <Back :to="`/dashboard/sites/${siteId}`" />
      <h2 class="text-xl font-bold">{{ header }}</h2>
    </div>

    <UCard>
      <template #header>
        <h3 class="text-2xl font-bold">Article Details</h3>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          {{ description }}
        </p>
      </template>
      <UForm
        :state="state"
        :schema="postSchema"
        @submit="onSubmit"
        class="space-y-4"
      >
        <UFormGroup name="title" label="Title" required>
          <UInput v-model="state.title" placeholder="Title" />
        </UFormGroup>
        <UFormGroup name="slug" label="Slug" required>
          <UInput
            v-model="state.slug"
            placeholder="Slug"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="link"
                :padded="false"
                label="Generate Slug"
                @click="generateSlug"
              />
            </template>
          </UInput>
        </UFormGroup>
        <UFormGroup name="description" label="Description" required>
          <UTextarea v-model="state.description" placeholder="Description" />
        </UFormGroup>
        <!-- Images Field -->
        <UFormGroup label="Image" name="coverImage">
          <div class="space-y-2">
            <UInput
              type="file"
              accept="image/png, image/jpeg, image/webp"
              @change="handleFileChange"
              :loading="uploading"
              trailing
            />
            <div
              class="size-[100px] overflow-hidden bg-black rounded-md"
              v-if="state.coverImage"
            >
              <ClientOnly>
                <NuxtImg
                  :src="state.coverImage"
                  alt="Uploaded Image"
                  fit="cover"
                  class="w-full h-full object-cover"
                />
              </ClientOnly>
            </div>
          </div>
        </UFormGroup>

        <UFormGroup name="content" label="Content" required>
          <ContentEditor v-model="state.content" />
        </UFormGroup>
        <UFormGroup name="status" label="Do you want it published" required>
          <UToggle v-model="state.status" />
        </UFormGroup>
        <UButton type="submit" :loading block>Submit</UButton>
      </UForm>
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { v4 } from "uuid";
import type { Post } from "~/types";

const { createDoc, uploadFile, modifyDoc, fetchDoc, deleteFile, fetchDocs } =
  useFirebase();
const user = useCurrentUser();
const notification = useNotification();
const route = useRoute();
const uploading = ref(false);
const loading = useLoading();
if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}

const props = defineProps<{
  siteId: string;
  postId?: string;
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
  navigateTo({
    path: "/dashboard/sites",
  });
}

const imageId = ref<string>();
const checking = ref(false);
const postSchema = z.object({
  content: z.string().min(10),
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(500),
  slug: z
    .string()
    .min(3)
    .max(110)
    .transform((value) => value.toLowerCase().replace(/\s/g, "-"))
    .refine(
      async (slug) => {
        return await checkSlug(slug);
      },
      {
        message: "Slug already exists.",
      }
    ),
  coverImage: z.string().url({
    message: "File hasn't been uploaded",
  }),
  status: z.boolean(),
});

const state = ref({
  content: "",
  title: "",
  description: "",
  slug: "",
  coverImage: "",
  status: false,
});

const checkSlug = async (slug: string) => {
  checking.value = true;
  try {
    const { data: querySnapshot } = await fetchDocs<Post>({
      collectionName: "posts",
      queryConfig: {
        where: [
          {
            fieldPath: "slug",
            opStr: "==",
            value: slug,
          },
        ],
      },
    });

    if (querySnapshot.length === 0) {
      return true; // Return true if unique
    }

    const post = querySnapshot[0];
    if (post.id === postId.value) {
      return true;
    }
  } catch (error) {
    console.error("Error checking slug:", error);
    return false; // Return false if error
  } finally {
    checking.value = false;
  }
};

const postId = computed(() => (!!props.postId ? props.postId : undefined));

const header = computed(() =>
  !!props.postId ? "Edit Article" : "New Article"
);
const description = computed(() =>
  !!props.postId ? "Editing article" : "Create a new article for your site."
);

if (postId.value) {
  const { data: post } = await fetchDoc({
    collectionName: "posts",
    id: postId.value,
  });

  if (post?.exists()) {
    const data = post.data() as Post;
    state.value = {
      content: data.content,
      title: data.title,
      description: data.description,
      slug: data.slug,
      coverImage: data.coverImage,
      status: data.status,
    };
    imageId.value = data.imageId;
  } else {
    // Handle case where post does not exist
    notification.error({
      id: "post-not-found",
      title: "Error",
      description: "Post not found.",
    });
    navigateTo(`/dashboard/sites/${props.siteId}`);
  }
}

type Schema = z.infer<typeof postSchema>;

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const data: Post = {
    siteId: props.siteId,
    userId: user.value?.uid!,
    imageId: imageId.value!,

    ...event.data,
    // content: JSON.stringify(event.data.content),
  };

  if (postId.value) {
    try {
      // Update post
      await modifyDoc({
        collectionName: "posts",
        id: postId.value,
        data,
      });
      notification.success({
        id: "post-success",
        title: "Success",
        description: "Article has been updated",
      });
    } catch (error: any) {
      console.error(error);
      notification.error({
        id: "post-error",
        title: "Error",
        description: error.message,
      });
    }
  } else {
    // Create new post
    const { data: pId, error } = await createDoc({
      collectionName: "posts",
      data: data,
    });
    if (error) {
      console.error(error);
      notification.error({
        id: "post-error",
        title: "Error",
        description: error.message,
      });
      return;
    }
    // Add the postId to the user's postIds array
    await modifyDoc({
      collectionName: "users",
      id: user.value?.uid!,
      arrayOperations: [
        {
          field: "postIds",
          add: [pId],
        },
      ],
    });

    // Add the postId to the site's postIds array
    await modifyDoc({
      collectionName: "sites",
      id: props.siteId,
      arrayOperations: [
        {
          field: "postIds",
          add: [pId],
        },
      ],
    });

    notification.success({
      id: "post-success",
      title: "Success",
      description: "Article has been created",
    });
  }

  navigateTo(`/dashboard/sites/${props.siteId}`);
};

const handleFileChange = async (fileList: FileList) => {
  if (fileList) {
    const files = Array.from(fileList);
    imageId.value = v4();
    uploading.value = true;
    const { url, uploadError } = await uploadFile({
      file: files[0],
      path: `${imageId.value}`,
    });
    uploading.value = false;
    if (uploadError.value) {
      uploading.value = false;
      console.error(uploadError.value);
      return;
    }
    notification.success({
      id: "image-uploader",
      title: "Success",
      description: "Image uploaded successfully",
    });

    state.value.coverImage = url.value!;
    if (postId.value) {
      await modifyDoc({
        collectionName: "posts",
        id: postId.value,
        data: {
          coverImage: state.value.coverImage,
        },
      });
    }
  }
};
watch(state.value, (val) => {
  const formattedSlug = val.slug.toLowerCase().replace(/\s/g, "-");
  state.value.slug = formattedSlug;
});

watch(imageId, async (newVal, oldVal) => {
  if (oldVal != undefined) {
    if (postId) {
      await modifyDoc({
        collectionName: "posts",
        id: postId.value!,
        data: {
          imageId: newVal,
          coverImage: state.value.coverImage,
        },
      });
    }
    await deleteFile({
      path: `${oldVal}`,
    });
  }
});
function generateSlug() {
  const formattedTitle = state.value.title.toLowerCase().replace(/\s/g, "-");
  state.value.slug = formattedTitle;
}
</script>

<style></style>
