import type { Client } from "@paypal/paypal-server-sdk";
import { Environment } from "@paypal/paypal-server-sdk";
import { PayPalHttpClient } from "./paypal-client";
import {
  billingPlanToPublic,
  createPlanPayloadToPlanRequest,
  planCollectionToPublic,
} from "./paypal-mappers";
import {
  CreatePlanPayload,
  CreateSubscriptionPayload,
  PayPalApplicationContext,
  PayPalHttpMethod,
  PayPalPlanResponse,
  PayPalPlansListResponse,
  PayPalProductResponse,
  PayPalSubscriptionResponse,
  ProductPayload,
  VerifyWebhookSignatureResponse,
  VerifyWebhookSignaturePayload,
} from "./types";

export type PayPalConstructorOptions = {
  environment?: Environment;
};

function formatError(err: unknown): string {
  if (err instanceof Error) {
    const withResult = err as Error & {
      result?: { message?: string; details?: unknown };
    };
    if (withResult.result && typeof withResult.result === "object") {
      const m = withResult.result.message;
      if (typeof m === "string" && m.length > 0) {
        return m;
      }
    }
    return err.message;
  }
  return String(err);
}

export class PayPal {
  private client: PayPalHttpClient;

  constructor(
    clientId: string,
    clientSecret: string,
    options?: PayPalConstructorOptions,
  ) {
    this.client = new PayPalHttpClient(
      clientId,
      clientSecret,
      options?.environment ?? Environment.Sandbox,
    );
  }

  async request<TResponse, TPayload = undefined>(
    method: PayPalHttpMethod,
    path: string,
    data?: TPayload,
  ): Promise<TResponse> {
    try {
      return await this.client.jsonRequest<TResponse>(
        method,
        path,
        data as unknown,
      );
    } catch (error) {
      throw new Error(
        `Failed to request ${method} ${path}: ${formatError(error)}`,
      );
    }
  }

  async createBillingPlan(planData: CreatePlanPayload): Promise<PayPalPlanResponse> {
    const subs = this.client.getSubscriptionsController();
    try {
      const response = await subs.createBillingPlan({
        body: createPlanPayloadToPlanRequest(planData),
      });
      return billingPlanToPublic(response.result);
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/billing/plans: ${formatError(error)}`,
      );
    }
  }

  async getBillingPlans(): Promise<PayPalPlansListResponse> {
    const subs = this.client.getSubscriptionsController();
    try {
      const response = await subs.listBillingPlans({});
      return planCollectionToPublic(response.result);
    } catch (error) {
      throw new Error(
        `Failed to request GET /v1/billing/plans: ${formatError(error)}`,
      );
    }
  }

  async getBillingPlan(planId: string): Promise<PayPalPlanResponse> {
    const subs = this.client.getSubscriptionsController();
    try {
      const response = await subs.getBillingPlan(planId);
      return billingPlanToPublic(response.result);
    } catch (error) {
      throw new Error(
        `Failed to request GET /v1/billing/plans/${planId}: ${formatError(error)}`,
      );
    }
  }

  async deactivateBillingPlan(planId: string): Promise<Record<string, never>> {
    const subs = this.client.getSubscriptionsController();
    try {
      await subs.deactivateBillingPlan(planId);
      return {};
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/billing/plans/${planId}/deactivate: ${formatError(error)}`,
      );
    }
  }

  async createSubscription(
    subscriptionData: CreateSubscriptionPayload,
  ): Promise<PayPalSubscriptionResponse> {
    const defaultApplicationContext: Required<
      Pick<
        PayPalApplicationContext,
        "brand_name" | "locale" | "shipping_preference" | "user_action"
      >
    > = {
      brand_name: "PlayFlix",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
    };

    const payload: CreateSubscriptionPayload = {
      ...subscriptionData,
      application_context: {
        ...defaultApplicationContext,
        ...(subscriptionData.application_context || {}),
      },
    };
    try {
      return await this.client.jsonRequest<PayPalSubscriptionResponse>(
        "POST",
        "/v1/billing/subscriptions",
        payload,
      );
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/billing/subscriptions: ${formatError(error)}`,
      );
    }
  }

  async getSubscription(subscriptionId: string): Promise<PayPalSubscriptionResponse> {
    try {
      return await this.client.jsonRequest<PayPalSubscriptionResponse>(
        "GET",
        `/v1/billing/subscriptions/${subscriptionId}`,
      );
    } catch (error) {
      throw new Error(
        `Failed to request GET /v1/billing/subscriptions/${subscriptionId}: ${formatError(error)}`,
      );
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    reason = "Canceled by user",
  ): Promise<PayPalSubscriptionResponse> {
    const subs = this.client.getSubscriptionsController();
    try {
      await subs.cancelSubscription({
        id: subscriptionId,
        body: { reason },
      });
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/billing/subscriptions/${subscriptionId}/cancel: ${formatError(error)}`,
      );
    }
    return this.getSubscription(subscriptionId);
  }

  async activateSubscription(
    subscriptionId: string,
    reason = "Reactivated by user",
  ): Promise<PayPalSubscriptionResponse> {
    const subs = this.client.getSubscriptionsController();
    try {
      await subs.activateSubscription({
        id: subscriptionId,
        body: { reason },
      });
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/billing/subscriptions/${subscriptionId}/activate: ${formatError(error)}`,
      );
    }
    return this.getSubscription(subscriptionId);
  }

  async reviseSubscription(
    subscriptionId: string,
    planId: string,
  ): Promise<PayPalSubscriptionResponse> {
    const subs = this.client.getSubscriptionsController();
    try {
      await subs.reviseSubscription({
        id: subscriptionId,
        body: { planId },
      });
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/billing/subscriptions/${subscriptionId}/revise: ${formatError(error)}`,
      );
    }
    return this.getSubscription(subscriptionId);
  }

  async verifyWebhookSignature(
    payload: VerifyWebhookSignaturePayload,
  ): Promise<VerifyWebhookSignatureResponse> {
    try {
      return await this.client.jsonRequest<VerifyWebhookSignatureResponse>(
        "POST",
        "/v1/notifications/verify-webhook-signature",
        payload,
      );
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/notifications/verify-webhook-signature: ${formatError(error)}`,
      );
    }
  }

  async createProduct(productData: ProductPayload): Promise<PayPalProductResponse> {
    try {
      return await this.client.jsonRequest<PayPalProductResponse>(
        "POST",
        "/v1/catalogs/products",
        productData,
      );
    } catch (error) {
      throw new Error(
        `Failed to request POST /v1/catalogs/products: ${formatError(error)}`,
      );
    }
  }

  get Client(): Client {
    return this.client.getSdkClient();
  }
}
