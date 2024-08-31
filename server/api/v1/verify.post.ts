import { z } from "zod";

const objectSchema = z.object({
  ref: z.string().min(4),
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
  const { ref } = data;
  const verifiedData = await verifyPayment(ref);
  return verifiedData;
});

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
