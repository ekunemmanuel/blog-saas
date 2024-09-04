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

type PaystackEvent =
  | { event: "invoice.create"; data: InvoiceData }
  | { event: "invoice.payment_failed"; data: InvoicePaymentFailedData }
  | { event: "invoice.update"; data: InvoiceData }
  | {
      event:
        | "subscription.create"
        | "subscription.not_renew"
        | "subscription.disable";
      data: SubscriptionData;
    }
  | { event: "charge.success"; data: ChargeSuccessData };

// Example usage
async function handlePaystackEvent(paystackEvent: PaystackEvent) {
  switch (paystackEvent.event) {
    // case "invoice.create":
    //   handleInvoiceCreate(paystackEvent.data);
    //   break;
    // case "invoice.payment_failed":
    //   handleInvoicePaymentFailed(paystackEvent.data);
    //   break;
    // case "invoice.update":
    //   handleInvoiceUpdate(paystackEvent.data);
    //   break;
    // case "charge.success":
    //   handleChargeSuccess(paystackEvent.data);
    //   break;
    case "subscription.create":
    case "subscription.disable":
    case "subscription.not_renew":
      subscriptionEvent(paystackEvent.data);
      break;
    default:
      console.log("Unknown event type:", paystackEvent);
  }
}

async function subscriptionEvent(subscriptionData: SubscriptionData) {
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
    amount: subscriptionData.amount,
    code: subscriptionData.subscription_code,
    token: subscriptionData.email_token,
    authorization: {
      code: subscriptionData.authorization.authorization_code,
      signature: subscriptionData.authorization.signature,
    },
    customer: {
      email: subscriptionData.customer.email,
      code: subscriptionData.customer.customer_code,
    },
    plan: {
      name: subscriptionData.plan.name,
      code: subscriptionData.plan.plan_code,
      amount: subscriptionData.plan.amount,
      interval: subscriptionData.plan.interval,
    },
  };

  await updateUserData(user.uid, {
    subscription,
  });
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

async function handleInvoiceCreate(invoice: InvoiceData) {
  if (invoice.status.toLowerCase() !== "success") {
    return;
  }
  const user = await getUserByEmail(invoice.customer.email);
  if (!user) {
    return;
  }
  const paidAt = formatDate(new Date(invoice.paid_at));
  const invoiceCreate = {
    status: invoice.status,
    amount: invoice.amount,
    paidAt,
    authorization: invoice.authorization,
    customer: invoice.customer,
    reference: invoice.transaction.reference,
    subscription: invoice.subscription,
    paid: invoice.paid,
  };
  await updateUserData(user.uid, {
    invoiceCreate,
  });
}

async function handleInvoicePaymentFailed(invoice: InvoicePaymentFailedData) {
  if (invoice.status.toLowerCase() !== "success") {
    return;
  }
  const user = await getUserByEmail(invoice.customer.email);
  if (!user) {
    return;
  }
  const invoicePaymentFailed = {
    status: invoice.status,
    amount: invoice.amount,
    authorization: invoice.authorization,
    customer: invoice.customer,
    subscription: invoice.subscription,
    paid: invoice.paid,
  };
  await updateUserData(user.uid, {
    invoicePaymentFailed,
  });
}

async function handleInvoiceUpdate(invoice: InvoiceData) {
  if (invoice.status.toLowerCase() !== "success") {
    return;
  }
  const user = await getUserByEmail(invoice.customer.email);
  if (!user) {
    return;
  }
  const invoiceUpdate = {
    status: invoice.status,
    amount: invoice.amount,
    authorization: invoice.authorization,
    customer: invoice.customer,
    subscription: invoice.subscription,
    paid: invoice.paid,
  };
  await updateUserData(user.uid, {
    invoiceUpdate,
  });
}

async function handleChargeSuccess(charge: ChargeSuccessData) {
  if (charge.status.toLowerCase() !== "success") {
    return;
  }
  const user = await getUserByEmail(charge.customer.email);
  if (!user) {
    return;
  }
  const paidAt = formatDate(charge.paid_at);
  const chargeSuccess = {
    amount: charge.amount,
    authorization: charge.authorization,
    customer: charge.customer,
    plan: charge.plan,
    reference: charge.reference,
    paidAt,
  };
  await updateUserData(user.uid, {
    chargeSuccess,
  });
}

interface ChargeSuccessData {
  status: string;
  reference: string;
  amount: number;
  paid_at: Date;
  customer: Customer;
  authorization: Authorization;
  plan: Plan;
}

interface Authorization {
  authorization_code: string;
  signature: string;
}

interface Customer {
  email: string;
  customer_code: string;
}

interface InvoiceData {
  status: string;
  amount: number;
  paid_at: Date;
  authorization: Authorization;
  subscription: Subscription;
  customer: Customer;
  paid: boolean;
  transaction: Transaction;
}
interface InvoicePaymentFailedData {
  status: string;
  amount: number;
  authorization: Authorization;
  subscription: Subscription;
  customer: Customer;
  paid: boolean;
}

interface Subscription {
  status: string;
  subscription_code: string;
  email_token?: string;
}

interface Transaction {
  reference: string;
}

interface SubscriptionData {
  status: "completed" | "cancelled" | "non-renewing" | "active" | "attention";
  subscription_code: string;
  email_token: string;
  amount: number;
  authorization: Authorization;
  customer: Customer;
  plan: Plan;
}

interface Plan {
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
}