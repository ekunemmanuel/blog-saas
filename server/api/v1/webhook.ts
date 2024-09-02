import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createHmac } from "crypto";
import { getAuth } from "firebase-admin/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<PaystackEvent>(event);
  const { paystackSecretKey } = useRuntimeConfig();

  // Verify Paystack signature
  const hash = createHmac("sha512", paystackSecretKey)
    .update(JSON.stringify(body))
    .digest("hex");

  if (hash !== getHeader(event, "x-paystack-signature")) {
    throw createError({
      statusCode: 400,
      message: "Invalid signature",
    });
  }
  await handlePaystackEvent(body);
});

async function handlePaystackEvent(paystackEvent: PaystackEvent) {
  switch (paystackEvent.event) {
    case "subscription.create":
    case "subscription.disable":
    case "subscription.not_renew":
      await subscriptionEvent(paystackEvent.data);
      break;
    default:
      console.log("Unknown event type:", paystackEvent);
  }
}

async function subscriptionEvent(subscriptionData: SubscriptionData) {
  try {
    const status = subscriptionData.status;
    const user = await getUserByEmail(subscriptionData.customer.email);
    if (!user) {
      return;
    }
    if (status.toLowerCase() == "attention") {
      // do somethhing
      return;
    }

    const subscription = {
      status,
      amount: subscriptionData.amount / 100,
      subscriptionCode: subscriptionData.subscription_code,
      token: subscriptionData.email_token,
      customerCode: subscriptionData.customer.customer_code,
      plan: {
        name: subscriptionData.plan.name,
        code: subscriptionData.plan.plan_code,
        amount: subscriptionData.plan.amount / 100,
        interval: subscriptionData.plan.interval,
      },
      nextPaymentDate: formatDate(new Date(subscriptionData.next_payment_date)),
    };
    await updateUserData(user.uid, {
      subscription,
    });
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "An error occurred",
      data: error,
    });
  }
}

// Function to get a user by their email
async function getUserByEmail(email: string) {
  const auth = getAuth();
  return await auth.getUserByEmail(email);
}

// Function to update user data in Firestore
async function updateUserData(userId: string, params: any) {
  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    return;
  }
  await userRef.update({
    ...params,
    updatedAt: formatDate(Timestamp.now().toDate()),
  });
}

interface Customer {
  email: string;
  customer_code: string;
}

interface Subscription {
  status: string;
  subscription_code: string;
  email_token?: string;
}
interface Plan {
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
}

interface SubscriptionData {
  status: "completed" | "cancelled" | "non-renewing" | "active" | "attention";
  next_payment_date: string;
  subscription_code: string;
  email_token: string;
  amount: number;
  customer: Customer;
  plan: Plan;
}

type PaystackEvent = {
  event:
    | "subscription.create"
    | "subscription.not_renew"
    | "subscription.disable";
  data: SubscriptionData;
};
