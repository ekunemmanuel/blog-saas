<template>
  <div>
    <MyForm type="signup" @signup="signup" />
  </div>
</template>

<script lang="ts" setup>
import type { SignUp } from "~/types";

const { signUp, createDoc } = useFirebase();
const notification = useNotification();

async function signup(data: SignUp) {
  const { data: user, error } = await signUp(data);
  if (error) {

    return;
  }
  await createDoc({
    collectionName: "users",
    data: {
      ...user,
    },
    id: user?.id,
  });
  notification.success({
    id: "signup",
    description: "User signed up successfully",
    title: "Success",
  });
  const route = useRoute();
  const redirect = route.query.redirect as string;

  navigateTo(redirect && redirect !== "/" ? redirect : "/dashboard");
}

definePageMeta({
  layout: "auth",
  middleware: "is-already-logged-in",
});

useHead({
  title: "Sign Up",
  meta: [
    {
      name: "description",
      content: "Sign up for an account.",
    },
  ],
});
</script>

<style></style>
