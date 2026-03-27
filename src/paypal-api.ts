import { PayPalClient } from "./paypal-client";
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

export class PayPal {
  private client: PayPalClient;

  constructor(clientId: string, clientSecret: string) {
    this.client = new PayPalClient(clientId, clientSecret);
  }

  async request<TResponse, TPayload = undefined>(
    method: PayPalHttpMethod,
    path: string,
    data?: TPayload,
  ): Promise<TResponse> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client.getClient().request<TResponse>({
        method,
        url: path,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data as TResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to request ${method} ${path}: ${message}`);
    }
  }

  async createBillingPlan(planData: CreatePlanPayload): Promise<PayPalPlanResponse> {
    return this.request<PayPalPlanResponse, CreatePlanPayload>(
      "POST",
      "/v1/billing/plans",
      planData,
    );
  }

  async getBillingPlans(): Promise<PayPalPlansListResponse> {
    return this.request<PayPalPlansListResponse>("GET", "/v1/billing/plans");
  }

  async getBillingPlan(planId: string): Promise<PayPalPlanResponse> {
    return this.request<PayPalPlanResponse>("GET", `/v1/billing/plans/${planId}`);
  }

  async deactivateBillingPlan(planId: string): Promise<Record<string, never>> {
    return this.request<Record<string, never>, Record<string, never>>(
      "POST",
      `/v1/billing/plans/${planId}/deactivate`,
      {},
    );
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
    return this.request<PayPalSubscriptionResponse, CreateSubscriptionPayload>(
      "POST",
      "/v1/billing/subscriptions",
      payload,
    );
  }

  async getSubscription(subscriptionId: string): Promise<PayPalSubscriptionResponse> {
    return this.request<PayPalSubscriptionResponse>(
      "GET",
      `/v1/billing/subscriptions/${subscriptionId}`,
    );
  }

  async cancelSubscription(
    subscriptionId: string,
    reason = "Canceled by user",
  ): Promise<PayPalSubscriptionResponse> {
    await this.request<Record<string, never>, { reason: string }>(
      "POST",
      `/v1/billing/subscriptions/${subscriptionId}/cancel`,
      { reason },
    );
    return this.getSubscription(subscriptionId);
  }

  async activateSubscription(
    subscriptionId: string,
    reason = "Reactivated by user",
  ): Promise<PayPalSubscriptionResponse> {
    await this.request<Record<string, never>, { reason: string }>(
      "POST",
      `/v1/billing/subscriptions/${subscriptionId}/activate`,
      { reason },
    );
    return this.getSubscription(subscriptionId);
  }

  async reviseSubscription(
    subscriptionId: string,
    planId: string,
  ): Promise<PayPalSubscriptionResponse> {
    await this.request<Record<string, never>, { plan_id: string }>(
      "POST",
      `/v1/billing/subscriptions/${subscriptionId}/revise`,
      { plan_id: planId },
    );
    return this.getSubscription(subscriptionId);
  }

  async verifyWebhookSignature(
    payload: VerifyWebhookSignaturePayload,
  ): Promise<VerifyWebhookSignatureResponse> {
    return this.request<
      VerifyWebhookSignatureResponse,
      VerifyWebhookSignaturePayload
    >(
      "POST",
      "/v1/notifications/verify-webhook-signature",
      payload,
    );
  }

  async createProduct(productData: ProductPayload): Promise<PayPalProductResponse> {
    return this.request<PayPalProductResponse, ProductPayload>(
      "POST",
      "/v1/catalogs/products",
      productData,
    );
  }

  get Client() {
    return this.client.getClient();
  }
}

