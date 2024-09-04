import type { User } from "~/types";

// middleware/site.ts
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

  const siteLimitReached =
    (planName === "Free" && (userData?.siteIds?.length ?? 0) >= 1) ||
    (planName === "Basic" && (userData?.siteIds?.length ?? 0) >= 3) ||
    (planName === "Pro" && (userData?.siteIds?.length ?? 0) >= 10); // Assuming Pro has a limit for illustration

    console.log("siteLimitReached", siteLimitReached);
    

  if (siteLimitReached) {
    if (subscriptionStatus === "cancelled" || subscriptionStatus === "non-renewing" || subscriptionStatus === "attention") {
      notification.error({
        id: "limit-reached",
        title: "Limit Reached",
        description: `You have reached the limit for the ${planName} plan. Upgrade your plan to create more sites or posts.`,
      });
      return navigateTo("/dashboard/sites");
    } else if (subscriptionStatus !== "active") {
      notification.error({
        id: "limit-reached",
        title: "Limit Reached",
        description: `Your subscription is not active, and you have reached the site limit. Upgrade your plan or renew your subscription to create more sites.`,
      });
      return navigateTo("/dashboard/sites");
    }
    else {
      notification.warning({
        id: "limit-reached",
        title: "Limit Reached",
        description: `You have reached the limit for the ${planName} plan. Upgrade your plan to create more sites or posts.`,
      });
      return navigateTo("/dashboard/sites");
    }
  }else {
    if (subscriptionStatus !== "active" && (subscriptionStatus === "cancelled" || subscriptionStatus === "non-renewing" || subscriptionStatus === "attention")) {
      notification.warning({
        id: "subscription-status",
        title: "Subscription Status",
        description: `Your subscription status is ${subscriptionStatus}. Please renew or upgrade your subscription.`,
      });
    }
  }
});