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

export type PaystackEvent =
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

export interface ChargeSuccessData {
  status: string;
  reference: string;
  amount: number;
  paid_at: Date;
  customer: Customer;
  authorization: Authorization;
  plan: Plan;
}

export interface Authorization {
  authorization_code: string;
  signature: string;
}

export interface Customer {
  email: string;
  customer_code: string;
}

export interface InvoiceData {
  status: string;
  amount: number;
  paid_at: Date;
  authorization: Authorization;
  subscription: Subscription;
  customer: Customer;
  paid: boolean;
  transaction: Transaction;
}
export interface InvoicePaymentFailedData {
  status: string;
  amount: number;
  authorization: Authorization;
  subscription: Subscription;
  customer: Customer;
  paid: boolean;
}

export interface Subscription {
  status: string;
  subscription_code: string;
  email_token?: string;
}

export interface Transaction {
  reference: string;
}

export interface SubscriptionData {
  status: "completed" | "cancelled" | "non-renewing" | "active" | "attention";
  subscription_code: string;
  email_token: string;
  amount: number;
  authorization: Authorization;
  customer: Customer;
  plan: Plan;
}

export interface Plan {
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
}


// import { getFirestore, Timestamp } from "firebase-admin/firestore";
// import { createHmac } from "crypto";
// import { User } from "~/types";
// import { getAuth } from "firebase-admin/auth";

// export default defineEventHandler(async (event) => {
//   const body = await readBody<PaystackWebhookData>(event);
//   const { paystackSecretKey } = useRuntimeConfig();

//   // Verify Paystack signature
//   const hash = createHmac("sha512", paystackSecretKey)
//     .update(JSON.stringify(body))
//     .digest("hex");

//   if (hash !== getHeader(event, "x-paystack-signature")) {
//     throw createError({
//       statusCode: 400,
//       message: "Invalid signature",
//     });
//   }

//   const { event: eventType, data } = body;

//   console.log({ body });

//   if (data.status !== "success") {
//     console.log({ more: body });
//     return;
//   }

//   try {
//     const ref =
//       eventType === "charge.success"
//         ? data.reference
//         : data.transaction.reference;
//     const { data: verifiedData } = await verifyPayment(ref);

//     if (verifiedData.status !== "success") {
//       console.log({
//         statusCode: 400,
//         message: "Payment verification failed",
//       });
//       return;
//     }

//     const user = await getUserByEmail(verifiedData.customer.email);
//     const userId = user.uid;
//     const plan = createPlanObject(
//       verifiedData.plan_object,
//       verifiedData.paid_at
//     );

//     await updateUserData(userId, {
//       plan,
//       customerCode: verifiedData.customer.customer_code,
//     });
//   } catch (error) {
//     console.log({
//       statusCode: 500,
//       message: "An error occurred during payment verification",
//       data: error,
//     });
//     throw createError({
//       statusCode: 500,
//       message: "An error occurred during payment verification",
//       data: error,
//     });
//   }
// });

// // Function to create a plan object with start and end dates
// function createPlanObject(
//   planObject: PaystackWebhookVerification["data"]["plan_object"],
//   paidAt: string
// ) {
//   return {
//     code: planObject.plan_code,
//     name: planObject.name,
//     interval: planObject.interval,
//     amount: planObject.amount,
//     startAt: formatDate(new Date(paidAt)),
//     endAt: formatDate(calculateEndDate(planObject.interval, new Date(paidAt))),
//   };
// }

// // Function to calculate the end date based on the interval
// function calculateEndDate(interval: string, startDate: Date): Date {
//   const endDate = new Date(startDate);
//   switch (interval) {
//     case "hourly":
//       endDate.setHours(endDate.getHours() + 1);
//       break;
//     case "daily":
//       endDate.setDate(endDate.getDate() + 1);
//       break;
//     case "weekly":
//       endDate.setDate(endDate.getDate() + 7);
//       break;
//     case "monthly":
//       endDate.setMonth(endDate.getMonth() + 1);
//       break;
//     case "quarterly":
//       endDate.setMonth(endDate.getMonth() + 3);
//       break;
//     case "biannually":
//       endDate.setMonth(endDate.getMonth() + 6);
//       break;
//     case "annually":
//     case "yearly":
//       endDate.setFullYear(endDate.getFullYear() + 1);
//       break;
//   }
//   return endDate;
// }

// // Function to verify payment using Paystack API
// async function verifyPayment(reference: string) {
//   const { paystackSecretKey } = useRuntimeConfig();
//   try {
//     const response = await $fetch<PaystackWebhookVerification>(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${paystackSecretKey}`,
//         },
//       }
//     );
//     console.log({ response });

//     return response;
//   } catch (error) {
//     throw createError({
//       status: 400,
//       message: "Error verifying payment",
//     });
//   }
// }

// // Function to get a user by their email
// async function getUserByEmail(email: string) {
//   const auth = getAuth();
//   return await auth.getUserByEmail(email);
// }

// // Function to update user data in Firestore
// async function updateUserData(userId: string, params: Partial<User>) {
//   const db = getFirestore();
//   const userRef = db.collection("users").doc(userId);
//   const userDoc = await userRef.get();
//   if (!userDoc.exists) {
//     return;
//   }
//   await userRef.update({
//     ...params,
//     updatedAt: formatDate(Timestamp.now().toDate()),
//   });
// }

// interface PaystackWebhookVerification {
//   event: "invoice.create" | "charge.success";
//   data: {
//     status: "success";
//     reference: string; // This is the reference for the transaction for charge.success event
//     amount: number;
//     paid_at: string;
//     authorization: {
//       authorization_code: string;
//       signature: string;
//     };
//     customer: {
//       email: string;
//       customer_code: string;
//     };
//     plan: string;
//     transaction: {
//       // This is only available for invoice.create event
//       reference: string; // This is the reference for the transaction
//     }; // This is only available for invoice.create event
//     plan_object: {
//       id: number;
//       name: string;
//       plan_code: string;
//       description: string;
//       amount: number;
//       interval: string;
//     };
//   };
// }

// interface PaystackWebhookData {
//   event: string;
//   data: {
//     status: string;
//     reference: string;
//     transaction: {
//       reference: string;
//       status: string;
//       amount: number;
//       currency: string;
//     };
//   };
// }

