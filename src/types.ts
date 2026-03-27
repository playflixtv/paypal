export type PayPalHttpMethod = "GET" | "POST" | "PATCH";

export type PayPalIntervalUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
export type PayPalTenureType = "TRIAL" | "REGULAR";
export type PayPalPlanStatus = "CREATED" | "INACTIVE" | "ACTIVE";
export type PayPalSubscriptionStatus =
  | "APPROVAL_PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export interface PayPalName {
  given_name: string;
  surname: string;
}

export interface PayPalSubscriber {
  name: PayPalName;
  email_address: string;
  payer_id?: string;
}

export interface PayPalMoney {
  value: string;
  currency_code: string;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalBillingFrequency {
  interval_unit: PayPalIntervalUnit;
  interval_count: number;
}

export interface PayPalPricingScheme {
  fixed_price: PayPalMoney;
}

export interface PayPalBillingCycle {
  tenure_type: PayPalTenureType;
  sequence: number;
  frequency: PayPalBillingFrequency;
  total_cycles: number;
  pricing_scheme: PayPalPricingScheme;
}

export interface PayPalPaymentPreferences {
  auto_bill_outstanding: boolean;
  setup_fee_failure_action: string;
  payment_failure_threshold: number;
}

export interface PayPalApplicationContext {
  brand_name?: string;
  locale?: string;
  shipping_preference?: string;
  user_action?: string;
  return_url?: string;
  cancel_url?: string;
}

export interface CreatePlanPayload {
  product_id: string;
  name: string;
  billing_cycles: PayPalBillingCycle[];
  payment_preferences: PayPalPaymentPreferences;
  description: string;
  status: PayPalPlanStatus;
}

export interface CreateSubscriptionPayload {
  plan_id: string;
  custom_id?: string;
  subscriber: PayPalSubscriber;
  application_context?: PayPalApplicationContext;
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

export interface VerifyWebhookSignatureResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

export interface PayPalProductResponse {
  id: string;
  name: string;
  type: string;
  description: string;
  category: string;
  image_url?: string;
  home_url?: string;
  create_time: string;
  update_time: string;
  links: PayPalLink[];
}

export interface PayPalPlanResponse {
  id: string;
  product_id: string;
  name: string;
  status: PayPalPlanStatus;
  description?: string;
  billing_cycles?: PayPalBillingCycle[];
  payment_preferences?: PayPalPaymentPreferences;
  create_time?: string;
  update_time?: string;
  links?: PayPalLink[];
}

export interface PayPalPlansListResponse {
  plans: PayPalPlanResponse[];
  total_items?: number;
  total_pages?: number;
  links?: PayPalLink[];
}

export interface PayPalSubscriptionResponse {
  id: string;
  plan_id: string;
  status: PayPalSubscriptionStatus;
  custom_id?: string;
  subscriber?: PayPalSubscriber;
  create_time?: string;
  update_time?: string;
  links?: PayPalLink[];
}

export interface PayPalOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  app_id?: string;
  nonce?: string;
}
