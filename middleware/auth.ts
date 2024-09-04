// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser();
  const notification = useNotification();
  const isDashboardRoute = to.path.startsWith("/dashboard");
  
  // const user////////////////////////
  // If the user is not logged in
  if (!user) {
    // Check if the route requires authentication
    if (isDashboardRoute) {
      notification.error({
        id: "Unauthorized",
        title: "Unauthorized",
        description: "You are not authorized to access this page",
      });
    }

    // Redirect to the login page if not authenticated
    if (to.path !== "/login" && to.path !== "/signup") {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath, ...to.query }, // Preserve existing query params
      });
    }
    return;
  }
});
