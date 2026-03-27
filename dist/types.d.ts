export interface CreatePlanPayload {
    product_id: string;
    name: string;
    billing_cycles: Array<{
        tenure_type: string;
        sequence: number;
        frequency: {
            interval_unit: string;
            interval_count: number;
        };
        total_cycles: number;
        pricing_scheme: {
            fixed_price: {
                value: string;
                currency_code: string;
            };
        };
    }>;
    payment_preferences: {
        auto_bill_outstanding: boolean;
        setup_fee_failure_action: string;
        payment_failure_threshold: number;
    };
    description: string;
    status: string;
}
export interface CreateSubscriptionPayload {
    plan_id: string;
    subscriber: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
    };
}
export interface ProductPayload {
    name: string;
    type: string;
    description: string;
    category: string;
    image_url: string;
    home_url: string;
}
//# sourceMappingURL=types.d.ts.map