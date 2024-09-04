import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import { User } from "~/types";

const objectSchema = z.object({
  email: z.string().email(),
  plan: z.string().min(4),
  userId: z.string().min(4),
});

export default defineEventHandler(async (event) => {
  const { error, data } = await readValidatedBody(
    event,
    objectSchema.safeParse
  );

  if (error) {
    const fieldErrors = error.errors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));

    throw createError({
      status: 400,
      message: "The input you provided is invalid",
      data: fieldErrors,
    });
  }

  try {
    const db = getFirestore();
    const userId = data.userId;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw createError({
        statusCode: 404,
        message: `User with ID ${userId} does not exist`,
        data: {
          message: "User with ID does not exist",
        },
      });
    }

    const user = userDoc.data() as User;

    // Check if the plan is still valid if it exists
    if (user.subscription && user.subscription?.status != "cancelled") {
      throw createError({
        statusCode: 400,
        message:
          "The current subscription is still valid until " +
          formatDate(new Date(user.subscription?.nextPaymentDate)),
        data: {
          message:
            "The current subscription is still valid until " +
            formatDate(new Date(user.subscription.nextPaymentDate)),
        },
      });
    }

    const { paystackSecretKey } = useRuntimeConfig();

    const { data: result } = await $fetch<{
      data: { authorization_url: string; reference: string };
    }>("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: {
        email: data.email,
        plan: data.plan,
        amount: 1000,
        metadata: {
          plan: data.plan,
          userId,
        },
      },
    });

    return {
      status: 200,
      data: result,
    };
  } catch (error) {
    console.log(error);

    throw createError({
      status: 400,
      message: "Pls try again or contact us",
      data: error,
    });
  }
});
