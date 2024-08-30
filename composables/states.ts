export const useLoading = () => useState("loading", () => false);

export const usePlans = () =>
  useState("plans", () => {
    const plans = [
      {
        type: "Free",
        amount: "$0",
        description: "Perfect for getting started.",
        benefits: ["1 Site", "Up to 5 Articles", "Basic Analytics"],
        label: "Get Started for Free",
        plan: "free", // identifier for the plan
      },
      {
        type: "Basic",
        amount: "$10",
        description: "Great for growing blogs.",
        benefits: [
          "Up to 3 Sites",
          "Up to 50 Articles per site",
          "Advanced Analytics",
          "Email Support",
        ],
        label: "Choose Basic",
        plan: "PLN_30smi5qdmbedr8a", // identifier for the plan
      },
      {
        type: "Pro",
        amount: "$20",
        description: "Perfect for professionals.",
        benefits: [
          "Up to 10 Sites",
          "Unlimited Articles per site",
          "Priority Support",
          "Custom Domain Support",
        ],
        label: "Choose Pro",
        plan: "PLN_8btpnsiyj8e5p1o", // identifier for the plan
      },
      {
        type: "Enterprise",
        amount: "$30",
        description: "For large organizations.",
        benefits: [
          "Unlimited Sites",
          "Unlimited Articles",
          "Dedicated Account Manager",
          "24/7 Support",
        ],
        label: "Choose Enterprise",
        plan: "PLN_30smi5qdmbedr8a", // identifier for the plan
      },
    ];
    return plans;
  });
