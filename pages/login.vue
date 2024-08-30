<template>
  <div>
    <MyForm @login="signIn" />
  </div>
</template>

<script lang="ts" setup>
const { signIn } = useFirebase();

definePageMeta({
  layout: "auth",
  middleware: "is-already-logged-in",
});

useHead({
  title: "Login",
  meta: [
    {
      name: "description",
      content: "Login to your account.",
    },
  ],
});
</script>

<style></style>
