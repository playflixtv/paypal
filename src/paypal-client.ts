import {
  Client,
  Environment,
  SubscriptionsController,
} from "@paypal/paypal-server-sdk";
import type { PayPalHttpMethod } from "./types";

export class PayPalHttpClient {
  private readonly paypalClient: Client;
  private readonly subscriptions: SubscriptionsController;
  private readonly baseUrl: string;

  constructor(
    clientId: string,
    clientSecret: string,
    environment: Environment = Environment.Sandbox,
  ) {
    this.paypalClient = new Client({
      environment,
      timeout: 60000,
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
    });
    this.subscriptions = new SubscriptionsController(this.paypalClient);
    this.baseUrl =
      environment === Environment.Production
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
  }

  getSdkClient(): Client {
    return this.paypalClient;
  }

  getSubscriptionsController(): SubscriptionsController {
    return this.subscriptions;
  }

  async getAccessToken(): Promise<string> {
    const token =
      await this.paypalClient.clientCredentialsAuthManager.updateToken(
        undefined,
      );
    return token.accessToken;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async jsonRequest<T>(
    method: PayPalHttpMethod | "DELETE",
    path: string,
    data?: unknown,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}${path}`;
    const hasBody =
      data !== undefined && method !== "GET" && method !== "DELETE";
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: hasBody ? JSON.stringify(data) : undefined,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `PayPal request failed ${response.status} ${method} ${path}: ${text}`,
      );
    }
    if (text === "" || response.status === 204) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }
}
