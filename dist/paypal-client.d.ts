import { AxiosInstance } from "axios";
export declare class PayPalClient {
    private client;
    private clientId;
    private clientSecret;
    private baseURL;
    constructor(clientId: string, clientSecret: string);
    getAuthToken(): Promise<string>;
    getClient(): AxiosInstance;
}
//# sourceMappingURL=paypal-client.d.ts.map