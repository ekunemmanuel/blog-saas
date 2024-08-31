import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createHmac } from "crypto";
import { User } from "~/types";
import { getAuth } from "firebase-admin/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<PaystackWebhookData>(event);
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

  const { event: eventType, data } = body;

  if (data.status !== "success") {
    console.log({ eventtype: eventType, data });

    return;
  }

  try {
    const ref =
      eventType === "charge.success"
        ? data.reference
        : data.transaction.reference;
    const { data: verifiedData } = await verifyPayment(ref);

    if (verifiedData.status !== "success") {
      console.log({
        statusCode: 400,
        message: "Payment verification failed",
      });
      return;
    }

    const user = await getUserByEmail(verifiedData.customer.email);
    const userId = user.uid;
    const plan = createPlanObject(
      verifiedData.plan_object,
      verifiedData.paid_at
    );

    await updateUserData(userId, plan as Partial<User>);
  } catch (error) {
    console.log({
      statusCode: 500,
      message: "An error occurred during payment verification",
      data: error,
    });
    return;
  }
});

// Function to create a plan object with start and end dates
function createPlanObject(
  planObject: PaystackWebhookVerification["data"]["plan_object"],
  paidAt: string
) {
  return {
    code: planObject.plan_code,
    name: planObject.name,
    interval: planObject.interval,
    amount: planObject.amount,
    startAt: formatDate(new Date(paidAt)),
    endAt: formatDate(calculateEndDate(planObject.interval, new Date(paidAt))),
  };
}

// Function to calculate the end date based on the interval
function calculateEndDate(interval: string, startDate: Date): Date {
  const endDate = new Date(startDate);
  switch (interval) {
    case "hourly":
      endDate.setHours(endDate.getHours() + 1);
      break;
    case "daily":
      endDate.setDate(endDate.getDate() + 1);
      break;
    case "weekly":
      endDate.setDate(endDate.getDate() + 7);
      break;
    case "monthly":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "quarterly":
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case "biannually":
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case "annually":
    case "yearly":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }
  return endDate;
}

// Function to verify payment using Paystack API
async function verifyPayment(reference: string) {
  const { paystackSecretKey } = useRuntimeConfig();
  const response = await $fetch<PaystackWebhookVerification>(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    }
  );
  return response;
}

// Function to get a user by their email
async function getUserByEmail(email: string) {
  const auth = getAuth();
  return await auth.getUserByEmail(email);
}

// Function to update user data in Firestore
async function updateUserData(userId: string, params: Partial<User>) {
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

interface PaystackWebhookVerification {
  event: "invoice.create" | "charge.success";
  data: {
    status: "success";
    reference: string; // This is the reference for the transaction for charge.success event
    amount: number;
    paid_at: string;
    authorization: {
      authorization_code: string;
      signature: string;
    };
    customer: {
      email: string;
      customer_code: string;
    };
    plan: string;
    transaction: {
      // This is only available for invoice.create event
      reference: string; // This is the reference for the transaction
    }; // This is only available for invoice.create event
    plan_object: {
      id: number;
      name: string;
      plan_code: string;
      description: string;
      amount: number;
      interval: string;
    };
  };
}

interface PaystackWebhookData {
  event: string;
  data: {
    status: string;
    reference: string;
    transaction: {
      reference: string;
      status: string;
      amount: number;
      currency: string;
    };
  };
}
