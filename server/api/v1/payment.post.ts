import { z } from "zod";

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
    const { paystackSeceretKey } = useRuntimeConfig();

    const { data: result } = await $fetch<{
      data: { authorization_url: string; reference: string };
    }>("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSeceretKey}`,
        "Content-Type": "application/json",
      },
      body: {
        email: data.email,
        plan: data.plan,
        amount: 1000,
        metadata: {
          plan: data.plan,
          userId: data.userId,
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
    });
  }
});
