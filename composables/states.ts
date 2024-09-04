export const useLoading = () => useState("loading", () => false);

export const usePlans = () =>
  useState("plans", () => {
    const plans = [
      {
        type: "Free",
        amount: "$0",
        description: "Perfect for getting started.",
        benefits: ["1 Site", "Up to 5 Articles"],
        label: "Get Started for Free",
        code: "free", // identifier for the plan
      },
      {
        type: "Basic",
        amount: "$10",
        description: "Great for growing blogs.",
        benefits: ["Up to 3 Sites", "Up to 150 Articles site"],
        label: "Choose Basic",
        code: "PLN_4haoatfu03xjols", // identifier for the plan
      },
      {
        type: "Pro",
        amount: "$20",
        description: "Perfect for professionals.",
        benefits: ["Up to 10 Sites", "Unlimited Articles site"],
        label: "Choose Pro",
        code: "PLN_wqc6m8emcvrf2gy", // identifier for the plan
      },
      {
        type: "Enterprise",
        amount: "$30",
        description: "For large organizations.",
        benefits: ["Unlimited Sites", "Unlimited Articles"],
        label: "Choose Enterprise",
        code: "PLN_kgq4k2o96yk841i", // identifier for the plan
      },
    ];
    return plans;
  });
