import { PayPalClient } from "./paypal-client";
import {
  CreatePlanPayload,
  CreateSubscriptionPayload,
  ProductPayload,
} from "./types";

export class PayPal {
  private client: PayPalClient;

  constructor(clientId: string, clientSecret: string) {
    this.client = new PayPalClient(clientId, clientSecret);
  }

  async createBillingPlan(planData: CreatePlanPayload): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client
        .getClient()
        .post("/v1/billing/plans", planData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create billing plan: ${message}`);
    }
  }

  async getBillingPlans(): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client.getClient().get("/v1/billing/plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get billing plans: ${message}`);
    }
  }

  async getBillingPlan(planId: string): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client
        .getClient()
        .get(`/v1/billing/plans/${planId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get billing plan: ${message}`);
    }
  }

  async deactivateBillingPlan(planId: string): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client.getClient().post(
        `/v1/billing/plans/${planId}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to deactivate billing plan: ${message}`);
    }
  }

  async createSubscription(
    subscriptionData: CreateSubscriptionPayload,
  ): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client.getClient().post(
        "/v1/billing/subscriptions",
        {
          ...subscriptionData,
          application_context: {
            brand_name: "PlayFlix",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create subscription: ${message}`);
    }
  }

  async createProduct(productData: ProductPayload): Promise<any> {
    const token = await this.client.getAuthToken();
    try {
      const response = await this.client
        .getClient()
        .post("/v1/catalogs/products", productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create product: ${message}`);
    }
  }

  get Client() {
    return this.client.getClient();
  }
}

