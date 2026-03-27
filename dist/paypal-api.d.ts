import { CreatePlanPayload, CreateSubscriptionPayload, ProductPayload } from "./types";
export declare class PayPal {
    private client;
    constructor(clientId: string, clientSecret: string);
    createBillingPlan(planData: CreatePlanPayload): Promise<any>;
    getBillingPlans(): Promise<any>;
    getBillingPlan(planId: string): Promise<any>;
    deactivateBillingPlan(planId: string): Promise<any>;
    createSubscription(subscriptionData: CreateSubscriptionPayload): Promise<any>;
    createProduct(productData: ProductPayload): Promise<any>;
    get Client(): import("axios").AxiosInstance;
}
//# sourceMappingURL=paypal-api.d.ts.map