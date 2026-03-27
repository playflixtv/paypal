import axios, { AxiosInstance } from "axios";

export class PayPalClient {
  private client: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private baseURL: string = "https://api-m.sandbox.paypal.com";

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAuthToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      "base64",
    );
    try {
      const response = await this.client.post(
        `/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to authenticate with PayPal: ${message}`);
    }
  }

  getClient() {
    return this.client;
  }
}

