export const useLoading = () => useState("loading", () => false);

export const usePlans = () =>
  useState("plans", () => {
    const {
      public: { basicPlan, enterprisePlan, proPlan },
    } = useRuntimeConfig();
    const plans = [
      {
        type: "Free",
        amount: "$0",
        description: "Perfect for getting started.",
        benefits: ["1 Site", "Up to 5 Articles"],
        label: "Get Started for Free",
        code: "free", // identifier for the plan
        interval: "weekly",
      },
      {
        type: "Basic",
        amount: "$1",
        description: "Great for growing blogs.",
        benefits: ["Up to 3 Sites", "Up to 150 Articles site"],
        label: "Choose Basic",
        code: basicPlan,
        interval: "weekly",
      },
      {
        type: "Pro",
        amount: "$3",
        description: "Perfect for professionals.",
        benefits: ["Up to 10 Sites", "Unlimited Articles site"],
        label: "Choose Pro",
        code: proPlan, // identifier for the plan
        interval: "weekly",
      },
      {
        type: "Enterprise",
        amount: "$25",
        description: "For large organizations.",
        benefits: ["Unlimited Sites", "Unlimited Articles"],
        label: "Choose Enterprise",
        code: enterprisePlan, // identifier for the plan
        interval: "weekly",
      },
    ];
    return plans;
  });
