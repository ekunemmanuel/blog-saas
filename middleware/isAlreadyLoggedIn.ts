export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = await getCurrentUser();
  
    if (user) {
      // i want it to redirect to where it is coming from
      return await navigateTo({
        path: "/",
      });
    }
  });