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
  custom_id?: string;
  subscriber: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
  };
  application_context?: {
    brand_name?: string;
    locale?: string;
    shipping_preference?: string;
    user_action?: string;
    return_url?: string;
    cancel_url?: string;
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

export interface VerifyWebhookSignaturePayload {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: Record<string, unknown>;
}

