"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalClient = void 0;
const axios_1 = __importDefault(require("axios"));
class PayPalClient {
    constructor(clientId, clientSecret) {
        this.baseURL = "https://api-m.sandbox.paypal.com";
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    async getAuthToken() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
        try {
            const response = await this.client.post(`/v1/oauth2/token`, "grant_type=client_credentials", {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to authenticate with PayPal: ${message}`);
        }
    }
    getClient() {
        return this.client;
    }
}
exports.PayPalClient = PayPalClient;
//# sourceMappingURL=paypal-client.js.map