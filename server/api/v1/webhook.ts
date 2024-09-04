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
  return {
    statusCode: 200,
    message: "Event handled successfully",
  };
});

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

async function handlePaystackEvent(paystackEvent: PaystackEvent) {
  switch (paystackEvent.event) {
    case "subscription.create":
    case "subscription.disable":
    case "subscription.not_renew":
      await subscriptionEvent(paystackEvent.data);
      break;
    case "invoice.create":
      await invoiceEvent(paystackEvent.data);
      break;
    default:
      console.log("Unknown event type:", paystackEvent);
  }
}

async function verifyTransaction(reference: string) {
  try {
    const { paystackSecretKey } = useRuntimeConfig();
    const response = await $fetch<PaystackVerificationData>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );
    if (!response.status) {
      throw createError({
        statusCode: 400,
        message: "Invalid transaction reference",
      });
    }
    return {
      data: response.data,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "An error occurred while verifying transaction",
      data: error,
    });
  }
}

async function subscriptionEvent(subscriptionData: SubscriptionData) {
  try {
    const status = subscriptionData.status;
    const user = await getUserByEmail(subscriptionData.customer.email)
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
      nextPaymentDate:
        subscriptionData.next_payment_date == null
          ? null
          : formatDate(new Date(subscriptionData.next_payment_date)),
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
}6

async function invoiceEvent(invoiceData: InvoiceData) {
  try {
    const status = invoiceData.status;
    const user = await getUserByEmail(invoiceData.customer.email);
    if (!user) {
      return;
    }
    if (status.toLowerCase() != "success") {
      // do somethhing
      return;
    }

    const verifiedData = await verifyTransaction(
      invoiceData.transaction.reference
    );

    const subscription = {
      status: invoiceData.subscription.status,
      amount: invoiceData.amount / 100,
      subscriptionCode: invoiceData.subscription.subscription_code,
      token: invoiceData.subscription.email_token,
      customerCode: invoiceData.customer.customer_code,
      plan: {
        name: verifiedData.data.plan_object.name,
        code: verifiedData.data.plan_object.plan_code,
        amount: verifiedData.data.plan_object.amount / 100,
        interval: verifiedData.data.plan_object.interval,
      },
      nextPaymentDate:
        invoiceData.subscription.next_payment_date == null
          ? null
          : formatDate(new Date(invoiceData.subscription.next_payment_date)),
    };
    await updateUserData(user.uid, {
      subscription,
    });
  } catch (error) {
    console.log(error);

    throw createError({
      statusCode: 500,
      message: "An error occurred",
      data: error,
    });
  }
}

interface Plan {
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
}

type SubscriptionStatus =
  | "completed"
  | "cancelled"
  | "non-renewing"
  | "active"
  | "attention";

interface Customer {
  customer_code: string;
  email: string;
}

interface SubscriptionData {
  status: SubscriptionStatus;
  next_payment_date?: string;
  subscription_code: string;
  email_token: string;
  amount: number;
  customer: Customer;
  plan: Plan;
}

type PaystackEvent =
  | {
      event:
        | "subscription.create"
        | "subscription.not_renew"
        | "subscription.disable";
      data: SubscriptionData;
    }
  | InvoiceCreate;

interface VData {
  status: string;
  reference: string;
  amount: number;
  metadata: VMetadata;
  customer: Customer;
  plan: string;
  plan_object: Plan;
}
interface VMetadata {
  invoice_action: string;
}

interface PaystackVerificationData {
  status: boolean;
  data: VData;
}

interface InvoiceData {
  amount: number;
  status: string;
  paid_at: Date;
  subscription: SubscriptionData;
  customer: Customer;
  transaction: Transaction;
}
interface Transaction {
  reference: string;
  status: string;
  amount: string;
}
interface InvoiceCreate {
  event: "invoice.create";
  data: InvoiceData;
}
