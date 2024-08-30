<template>
  <UCard
    class="backdrop-blur-[4px]"
    :ui="{
      background: '!bg-[rgb(var(--color-primary-700)_/_0.1)]',
    }"
  >
    <template #header>
      <div class="text-center">
        <UIcon name="heroicons:lock-closed" size="50" />
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          {{ description }}
          <ULink
            :to="path.to"
            inactive-class="text-primary-500 dark:text-primary-400 duration-300 hover:text-primary-700 dark:hover:text-primary-200"
          >
            {{ path.name }}
          </ULink>
        </p>
      </div>
    </template>
    <fieldset :disabled="loading" class="space-y-6">
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <template v-for="(value, key) in state" :key="key">
          <UFormGroup
            :ui="{
              label: {
                base: 'text-sm font- semibold capitalize',
              },
            }"
            :label="key"
            :name="key"
            required
          >
            <UInput
              v-model="state[key]"
              :placeholder="key"
              :type="getFieldType(key)"
            />
          </UFormGroup>
        </template>
        <UButton
          type="submit"
          block
          class="rounded-full"
          trailing
          icon="heroicons:arrow-right-20-solid"
          :loading
        >
          {{ buttonText }}
        </UButton>
      </UForm>

      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
        By signing in, you agree to our
        <ULink
          inactive-class="text-primary-500 dark:text-primary-400 duration-300 hover:text-primary-700 dark:hover:text-primary-200"
        >
          Terms of Service </ULink
        >.
      </p>
    </fieldset>
    <!-- <Loading v-model="loading" /> -->
  </UCard>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { Login, SignUp } from "~/types";

const props = withDefaults(
  defineProps<{
    type?: "login" | "signup";
  }>(),
  {
    type: "login",
  }
);
const loading = useLoading();
const emit = defineEmits<{
  login: [value: Login];
  signup: [value: SignUp]; // named tuple syntax
}>();

const title = computed(() =>
  props.type === "login" ? "Welcome back" : "Create an account"
);
const description = computed(() =>
  props.type === "login" ? "Don't have an account?" : "Already have an account?"
);
const path = computed(() =>
  props.type === "login"
    ? {
        name: "Sign up",
        to: "/signup",
      }
    : {
        name: "Login",
        to: "/login",
      }
);

const buttonText = computed(() =>
  props.type === "login" ? "Continue" : "Create account"
);

const state = computed<Login | SignUp>(() =>
  props.type === "login"
    ? {
        email: "",
        password: "",
      }
    : {
        name: "",
        email: "",
        password: "",
      }
);

// Define the explicit schema types
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "First name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Define the union type for the schema
type LoginSchema = z.output<typeof loginSchema>;
type SignupSchema = z.output<typeof signupSchema>;

// Use the union type to represent both possible schemas
type Schema = LoginSchema | SignupSchema;

// Conditionally assign the schema based on props.type
const schema = computed(() =>
  props.type === "login" ? loginSchema : signupSchema
);

function getFieldType(key: string): string {
  return key.includes("password") ? "password" : "text";
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (props.type === "login") {
    const formData: Login = {
      email: event.data.email,
      password: event.data.password,
    };
    emit("login", formData);
  } else {
    const formData: SignUp = {
      name: (event.data as SignupSchema).name, // Explicitly cast to SignupSchema
      email: event.data.email,
      password: event.data.password,
    };
    emit("signup", formData);
  }
}
</script>

<style></style>
