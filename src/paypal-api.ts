import { PayPalClient } from "./paypal-client";
import {
  CreatePlanPayload,
  CreateSubscriptionPayload,
  ProductPayload,
  VerifyWebhookSignaturePayload,
} from "./types";

export class PayPal {
  private client: PayPalClient;

  constructor(clientId: string, clientSecret: string) {
    this.client = new PayPalClient(clientId, clientSecret);
  }

  async request(
    method: "GET" | "POST" | "PATCH",
    path: string,
    data?: any,
  ): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client.getClient().request({
        method,
        url: path,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to request ${method} ${path}: ${message}`);
    }
  }

  async createBillingPlan(planData: CreatePlanPayload): Promise<any> {
    return this.request("POST", "/v1/billing/plans", planData);
  }

  async getBillingPlans(): Promise<any> {
    return this.request("GET", "/v1/billing/plans");
  }

  async getBillingPlan(planId: string): Promise<any> {
    return this.request("GET", `/v1/billing/plans/${planId}`);
  }

  async deactivateBillingPlan(planId: string): Promise<any> {
    return this.request("POST", `/v1/billing/plans/${planId}/deactivate`, {});
  }

  async createSubscription(
    subscriptionData: CreateSubscriptionPayload,
  ): Promise<any> {
    const payload = {
      ...subscriptionData,
      application_context: {
        brand_name: "PlayFlix",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        ...(subscriptionData.application_context || {}),
      },
    };
    return this.request("POST", "/v1/billing/subscriptions", payload);
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    return this.request("GET", `/v1/billing/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(
    subscriptionId: string,
    reason = "Canceled by user",
  ): Promise<any> {
    await this.request("POST", `/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      reason,
    });
    return this.getSubscription(subscriptionId);
  }

  async activateSubscription(
    subscriptionId: string,
    reason = "Reactivated by user",
  ): Promise<any> {
    await this.request(
      "POST",
      `/v1/billing/subscriptions/${subscriptionId}/activate`,
      {
        reason,
      },
    );
    return this.getSubscription(subscriptionId);
  }

  async reviseSubscription(subscriptionId: string, planId: string): Promise<any> {
    await this.request("POST", `/v1/billing/subscriptions/${subscriptionId}/revise`, {
      plan_id: planId,
    });
    return this.getSubscription(subscriptionId);
  }

  async verifyWebhookSignature(
    payload: VerifyWebhookSignaturePayload,
  ): Promise<any> {
    return this.request(
      "POST",
      "/v1/notifications/verify-webhook-signature",
      payload,
    );
  }

  async createProduct(productData: ProductPayload): Promise<any> {
    return this.request("POST", "/v1/catalogs/products", productData);
  }

  get Client() {
    return this.client.getClient();
  }
}

