import { z } from "zod";

const disableSubscriptionSchema = z.object({
  code: z.string(),
  token: z.string(),
});
export default defineEventHandler(async (event) => {
  const { error, data } = await readValidatedBody(
    event,
    disableSubscriptionSchema.safeParse
  );

  if (error) {
    const fieldErrors = error.errors.map((err) => ({
      message: err.message,
      field: err.path.join("."),
    }));

    throw createError({
      status: 400,
      message: "Invalid request data",
      data: fieldErrors,
    });
  }

  const { code, token } = data;

  const response = await disableSubscription(code, token);
  return response;
});

// Function to verify payment using Paystack API
async function disableSubscription(code: string, token: string) {
  const { paystackSecretKey } = useRuntimeConfig();
  try {
    const response = await $fetch<{
      status: boolean;
      message: string;
    }>(`https://api.paystack.co/subscription/disable`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
      body: {
        code,
        token,
      },
    });

    return response;
  } catch (error) {
    throw createError({
      status: 400,
      message: "Error disabling subscription",
    });
  }
}
