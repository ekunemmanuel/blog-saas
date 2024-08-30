// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser();
  const notification = useNotification();
  // Redirect the user to the login page if not authenticated
  if (!user) {
    if (to.path !== "/login" && to.path !== "/signup") {
      return navigateTo({
        path: "/login",
        query: {
          redirect: to.fullPath,
        },
      });
    }
    return;
  }

  const isAdminRoute = to.path.startsWith("/dashboard");

  if (!isAdminRoute) {
    notification.error({
      id: "Unauthorized",
      title: "Unauthorized",
      description: "You are not authorized to access ad this page",
    });
    return navigateTo("/dashboard");
  }
});
