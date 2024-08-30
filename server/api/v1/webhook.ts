import { defineEventHandler, readBody, createError } from "h3";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createHmac } from "crypto";
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  //   const secret = process.env.PAYSTACK_SECRET_KEY as string;
  const { paystackSeceretKey } = useRuntimeConfig();
  const hash = createHmac("sha512", paystackSeceretKey)
    .update(JSON.stringify(body))
    .digest("hex");

  if (hash != getHeader(event, "x-paystack-signature")) {
    throw createError({
      statusCode: 400,
      message: "Invalid signature",
    });
  }

  const { event: eventType, data } = body;
  console.log(body);

  if (eventType !== "charge.success" || data.status !== "success") {
    console.log(eventType, data.status);

    throw createError({
      statusCode: 400,
      message: "Invalid event type or status",
    });
  }

  const userId = data.metadata?.userId;
  const plan = {
    code: data.plan.plan_code,
    name: data.plan.name,
    interval: data.plan.interval,
    amount: data.plan.amount,
    startAt: formatDate(new Date(data.paid_at)),
    endAt: formatDate(
      calculateEndDate(data.plan.interval, new Date(data.paid_at))
    ),
  };

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User ID is missing in the metadata",
    });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw createError({
        statusCode: 404,
        message: `User with ID ${userId} does not exist`,
      });
    }

    const user = userDoc.data();

    if (user && user.status === "paid") {
      return {
        status: "info",
        message: "User has already paid",
        data: user,
      };
    }

    await userRef.update({
      status: "paid",
      updatedAt: formatDate(new Date()),
      plan,
      customerCode: data.customer.customer_code,
    });

    const r = {
      status: "success",
      message: "Payment verified and order status updated to paid",
      data,
    };
    console.log(r);
  } catch (error: any) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: "An error occurred during payment verification",
      data: error,
    });
  }
});

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
    default:
      // throw new Error(`Unknown interval: ${interval}`);
      break;
  }
  return endDate;
}

