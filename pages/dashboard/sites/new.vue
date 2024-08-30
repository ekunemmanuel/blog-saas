<template>
  <UContainer class="grid place-items-center min-h-screen">
    <UCard class="max-w-[600px] w-full">
      <template #header>
        <h2 class="text-lg font-semibold">Create a new site</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Create a new site by filling out the form below.
        </p>
      </template>
      <fieldset :disabled="loading">
        <UForm
          :schema="schema"
          :state="state"
          @submit="onSubmit"
          class="space-y-4"
        >
          <template v-for="(value, key) in state" :key="key">
            <UFormGroup :label="capitalizeFirstLetter(key)" :name="key" required>
              <UInput
                v-if="key != 'description'"
                v-model="state[key]"
                :placeholder="key.toUpperCase()"
                :loading="key == 'subdirectory' ? checking : false"
                trailing
              />
              <UTextarea
                v-else
                v-model="state[key]"
                :placeholder="key.toUpperCase()"
                trailing
              />
            </UFormGroup>
          </template>
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
  </UContainer>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { Site } from "~/types";

const user = useCurrentUser();
const { createDoc, fetchDoc, fetchDocs, modifyDoc } = useFirebase();
const route = useRoute();
const loading = useLoading();
const notification = useNotification();
const checking = ref(false);
if (!user.value) {
  navigateTo({
    name: "login",
    query: { redirect: route.fullPath },
  });
}
const { data: userDoc } = await fetchDoc({
  collectionName: "users",
  id: user.value?.uid!,
});

if (!userDoc?.exists()) {
  notification.error({
    description: "User not found.",
    id: "get-user",
    title: "Error",
  });
  navigateTo("/dashboard/sites");
}

const checkSubdirectory = async (formattedSubdirectory: string) => {
  checking.value = true;
  try {
    const { data: querySnapshot } = await fetchDocs({
      collectionName: "sites",
      queryConfig: {
        where: [
          {
            fieldPath: "subdirectory",
            opStr: "==",
            value: formattedSubdirectory,
          },
        ],
      },
    });
    return querySnapshot.length === 0; // Return true if unique
  } catch (error) {
    console.error("Error checking subdirectory:", error);
    return false; // Return false if error
  } finally {
    checking.value = false;
  }
};

function capitalizeFirstLetter(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const schema = z.object({
  name: z.string().min(3).max(40),
  subdirectory: z
    .string()
    .min(3)
    .max(40)
    .regex(
      /^[a-z-]+$/,
      "Subdirectory must only contain lowercase letters and hyphens"
    )
    .refine(
      async (formattedSubdirectory) => {
        return await checkSubdirectory(formattedSubdirectory);
      },
      {
        message: "Subdirectory already exists.",
      }
    ),
  description: z.string().min(3).max(100),
});

const state = reactive({
  name: "",
  subdirectory: "",
  description: "",
});
type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { data } = event;

  loading.value = true;
  const { data: id, error } = await createDoc({
    collectionName: "sites",
    data: {
      ...data,
      subdirectory: data.subdirectory.toLowerCase().replace(/\s/g, "-"), // Convert to lowercase and replace spaces with dashes
      userId: user.value?.uid,
    } as Site,
  });
  if (error) {
    notification.error({
      description: error.message,
      id: "create-site",
      title: "Error",
    });
    loading.value = false;
    return;
  }

  await modifyDoc({
    collectionName: "users",
    id: userDoc?.id!,
    arrayOperations: [
      {
        field: "siteIds",
        add: [id],
      },
    ],
  });

  notification.success({
    description: "Site created successfully.",
    id: "create-site",
    title: "Success",
  });
  loading.value = false;
  navigateTo({ name: "dashboard-sites" });
}

watch(state, (val) => {
  const formatted = val.subdirectory.toLowerCase().replace(/\s/g, "-");
  state.subdirectory = formatted;
});

useHead({
  title: "Create a new site",
  meta: [
    {
      name: "description",
      content: "Create a new site by filling out the form below.",
    },
  ],
});
</script>

<style></style>
