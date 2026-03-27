"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPal = void 0;
const paypal_client_1 = require("./paypal-client");
class PayPal {
    constructor(clientId, clientSecret) {
        this.client = new paypal_client_1.PayPalClient(clientId, clientSecret);
    }
    async createBillingPlan(planData) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create billing plan: ${message}`);
        }
    }
    async getBillingPlans() {
        const token = await this.client.getAuthToken();
        try {
            const response = await this.client.getClient().get("/v1/billing/plans", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get billing plans: ${message}`);
        }
    }
    async getBillingPlan(planId) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get billing plan: ${message}`);
        }
    }
    async deactivateBillingPlan(planId) {
        const token = await this.client.getAuthToken();
        try {
            const response = await this.client.getClient().post(`/v1/billing/plans/${planId}/deactivate`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to deactivate billing plan: ${message}`);
        }
    }
    async createSubscription(subscriptionData) {
        const token = await this.client.getAuthToken();
        try {
            const response = await this.client.getClient().post("/v1/billing/subscriptions", {
                ...subscriptionData,
                application_context: {
                    brand_name: "PlayFlix",
                    locale: "en-US",
                    shipping_preference: "NO_SHIPPING",
                    user_action: "SUBSCRIBE_NOW",
                },
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create subscription: ${message}`);
        }
    }
    async createProduct(productData) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create product: ${message}`);
        }
    }
    get Client() {
        return this.client.getClient();
    }
}
exports.PayPal = PayPal;
//# sourceMappingURL=paypal-api.js.map