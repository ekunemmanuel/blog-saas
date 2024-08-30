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
    throw createError({
      statusCode: 400,
      message: "Invalid event type or status",
    });
  }

  const userId = data.metadata?.userId;

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
      updatedAt: new Intl.DateTimeFormat("en-NG").format(
        Timestamp.now().toDate()
      ),
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
