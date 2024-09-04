import type { User } from "~/types"

// middleware/plan.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser();
  const notification = useNotification();

  if (!user) {
    // Redirect to login if the user is not authenticated
    if (to.path !== "/login" && to.path !== "/signup") {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }
    return;
  }

  const userData = await fetchDoc<User>({
    collectionName: "users",
    id: user.uid,
  });

  // Determine the user's plan
  const planType = userData?.subscription?.plan.code || "free";
  let planName = "Free";

  const plans = usePlans().value;

  // Ensure case insensitivity when matching plan codes
  const currentPlan = plans.find(
    (plan) => plan.code.toLowerCase() === planType.toLowerCase()
  );
  if (currentPlan) {
    planName = currentPlan.type;
  } else {
    // If no plan is found, default to Free
    planName = "Free";
  }

  const subscriptionStatus = userData?.subscription?.status;

  const postLimitReached =
    (planName === "Free" && (userData?.postIds?.length ?? 0) >= 5) ||
    (planName === "Basic" && (userData?.postIds?.length ?? 0) >= 150)
    // (planName === "Pro" && (userData?.postIds?.length ?? 0) >= 100); // Assuming Pro has a limit for illustration

  if (postLimitReached) {
    if (subscriptionStatus === "cancelled" || subscriptionStatus === "non-renewing" || subscriptionStatus === "attention") {
      notification.error({
        id: "limit-reached",
        title: "Limit Reached",
        description: `You have reached the limit for the ${planName} plan. Upgrade your plan to create more posts.`,
      });
      return navigateTo(`/dashboard/sites/${to.params.siteId}`);
    } else if (subscriptionStatus !== "active") {
      notification.error({
        id: "limit-reached",
        title: "Limit Reached",
        description: `Your subscription is not active, and you have reached the post limit. Upgrade your plan or renew your subscription to create more posts.`,
      });
      return navigateTo(`/dashboard/sites/${to.params.siteId}`);
    }
  } else {
    if (subscriptionStatus !== "active" && (subscriptionStatus === "cancelled" || subscriptionStatus === "non-renewing" || subscriptionStatus === "attention")) {
      notification.warning({
        id: "subscription-status",
        title: "Subscription Status",
        description: `Your subscription status is ${subscriptionStatus}. Please renew or upgrade your subscription.`,
      });
    }
  }
});