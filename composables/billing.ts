export const useBilling = () => {
  const user = useCurrentUser();
  const notification = useNotification();
  const loadingPlan = ref<string | null>(null);
  const i = ref(0);
  const loading = useLoading();
  const plans = usePlans();

  async function makePayment(plan: string, type: string) {
    if (plan == "free") {
      navigateTo("/dashboard");
      return;
    }
    if (user.value == undefined || user.value == null) {
      i.value++;
      notification.info({
        id: `billing-${i.value}`,
        title: "Sign In Required",
        description: "Please sign in or sign up to continue.",
      });

      setTimeout(() => {
        navigateTo("/dashboard/billing");
      }, 2000);
      return;
    }
    try {
      loadingPlan.value = plan;
      loading.value = true;
      // Call the payment API
      const { data } = await $fetch("/api/v1/payment", {
        method: "POST",
        body: {
          plan,
          email: user.value.email,
          userId: user.value.uid,
        },
      });
      navigateTo(data.authorization_url, {
        external: true,
      });
      notification.success({
        id: `billing-${i.value}`,
        title: "Redirecting to Payment",
        description: "You will be redirected to the payment page.",
      });
    } catch (error: any) {
      if (error.data.data.message) {
        i.value++;
        notification.warning({
          id: `billing-${i.value}`,
          title: "Payment Error",
          description: error.data.data.message,
        });
        return
      }
      i.value++;
      notification.error({
        id: `billing-${i.value}`,
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
      });
    } finally {
      loadingPlan.value = null;
      loading.value = false;
    }
  }

  async function disableSubscription(code: string, token: string) {
    try {
      loading.value = true;
      await $fetch("/api/v1/subscription/disable", {
        method: "POST",
        body: {
          code,
          token,
        },
      });
      notification.success({
        id: `billing-${i.value}`,
        title: "Subscription Cancelled",
        description: "Your subscription has been successfully cancelled.",
      });
    } catch (error) {
      console.error(error);
      i.value++;
      notification.error({
        id: `billing-${i.value}`,
        title: "Subscription Error",
        description: "An error occurred while cancelling your subscription.",
      });
    } finally {
      loading.value = false;
    }
  }

  return {
    makePayment,
    loadingPlan,
    loading,
    plans,
    disableSubscription,
  };
};
