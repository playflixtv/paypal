# @playflixtv/paypal-sdk

Typed TypeScript SDK for PayPal Billing APIs used by Playflix.

It builds on PayPal’s official [`@paypal/paypal-server-sdk`](https://www.npmjs.com/package/@paypal/paypal-server-sdk) for OAuth and billing plans, and keeps the same public types and method names as before.

This package wraps common PayPal operations for:

- products
- billing plans
- subscriptions
- webhook signature verification

It is designed for backend/server use only.

---

## Installation

```bash
npm install @playflixtv/paypal-sdk
```

## Requirements

- Node.js **18+** (uses the global `fetch` API)
- PayPal REST credentials:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`

By default, the client uses PayPal Sandbox (`https://api-m.sandbox.paypal.com`). Pass `{ environment: PayPalEnvironment.Production }` for live.

---

## Quick start

```ts
import { PayPal, PayPalEnvironment } from "@playflixtv/paypal-sdk";

const paypal = new PayPal(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!,
  // { environment: PayPalEnvironment.Production },
);
```

---

## Typed imports

The SDK exports request/response types and enums for safer integrations.

```ts
import {
  PayPal,
  CreatePlanPayload,
  CreateSubscriptionPayload,
  VerifyWebhookSignaturePayload,
  PayPalSubscriptionResponse,
  PayPalPlanResponse,
  PayPalPlansListResponse,
  PayPalProductResponse,
} from "@playflixtv/paypal-sdk";
```

---

## API reference

## `new PayPal(clientId, clientSecret, options?)`

Creates a PayPal API client (backed by `@paypal/paypal-server-sdk`).

```ts
const paypal = new PayPal(clientId, clientSecret);
// Live:
// const paypal = new PayPal(clientId, clientSecret, {
//   environment: PayPalEnvironment.Production,
// });
```

## `paypal.Client`

Read-only access to the underlying PayPal [`Client`](https://github.com/paypal/PayPal-TypeScript-Server-SDK) from `@paypal/paypal-server-sdk` (OAuth, environment, advanced configuration).

## `request<TResponse, TPayload>(method, path, data?)`

Low-level typed request helper. Useful for endpoints not yet wrapped by first-class methods.

```ts
const response = await paypal.request<{ id: string }>("GET", "/v1/billing/plans/P-123");
```

---

## Products

## `createProduct(payload)`

Creates a PayPal catalog product.

```ts
const product = await paypal.createProduct({
  name: "Playflix Premium",
  type: "SERVICE",
  description: "Premium streaming subscription",
  category: "SOFTWARE",
  image_url: "https://example.com/logo.png",
  home_url: "https://playflix.tv",
});
```

Returns: `PayPalProductResponse`

---

## Billing plans

## `createBillingPlan(payload)`

Creates a billing plan associated with a PayPal product.

```ts
const planPayload: CreatePlanPayload = {
  product_id: "PROD-XXXX",
  name: "Premium Monthly",
  status: "ACTIVE",
  description: "Monthly premium plan",
  billing_cycles: [
    {
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      pricing_scheme: {
        fixed_price: { value: "19.90", currency_code: "USD" },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
};

const plan = await paypal.createBillingPlan(planPayload);
```

Returns: `PayPalPlanResponse`

## `getBillingPlans()`

Lists billing plans.

```ts
const plans = await paypal.getBillingPlans();
```

Returns: `PayPalPlansListResponse`

## `getBillingPlan(planId)`

Gets a specific billing plan.

```ts
const plan = await paypal.getBillingPlan("P-XXXX");
```

Returns: `PayPalPlanResponse`

## `deactivateBillingPlan(planId)`

Deactivates a billing plan.

```ts
await paypal.deactivateBillingPlan("P-XXXX");
```

Returns: empty object response from PayPal.

---

## Subscriptions

## `createSubscription(payload)`

Creates a subscription for a billing plan.

`application_context` defaults are applied automatically:

- `brand_name: "PlayFlix"`
- `locale: "en-US"`
- `shipping_preference: "NO_SHIPPING"`
- `user_action: "SUBSCRIBE_NOW"`

You can override defaults and add `return_url` / `cancel_url`.

```ts
const payload: CreateSubscriptionPayload = {
  plan_id: "P-XXXX",
  custom_id: "internal-customer-id",
  subscriber: {
    email_address: "customer@example.com",
    name: {
      given_name: "Jane",
      surname: "Doe",
    },
  },
  application_context: {
    return_url: "https://api.example.com/paypal/return",
    cancel_url: "https://api.example.com/paypal/cancel",
  },
};

const subscription = await paypal.createSubscription(payload);
```

Returns: `PayPalSubscriptionResponse`

## `getSubscription(subscriptionId)`

```ts
const subscription = await paypal.getSubscription("I-XXXX");
```

Returns: `PayPalSubscriptionResponse`

## `activateSubscription(subscriptionId, reason?)`

```ts
const subscription = await paypal.activateSubscription(
  "I-XXXX",
  "Reactivated by support",
);
```

Returns: latest `PayPalSubscriptionResponse`

## `reviseSubscription(subscriptionId, planId)`

Switches an existing subscription to another plan.

```ts
const subscription = await paypal.reviseSubscription("I-XXXX", "P-NEWPLAN");
```

Returns: latest `PayPalSubscriptionResponse`

## `cancelSubscription(subscriptionId, reason?)`

```ts
const subscription = await paypal.cancelSubscription(
  "I-XXXX",
  "User requested cancellation",
);
```

Returns: latest `PayPalSubscriptionResponse`

---

## Webhooks

## `verifyWebhookSignature(payload)`

Validates incoming webhook signatures using PayPal API.

```ts
const verifyPayload: VerifyWebhookSignaturePayload = {
  auth_algo: headers["paypal-auth-algo"] as string,
  cert_url: headers["paypal-cert-url"] as string,
  transmission_id: headers["paypal-transmission-id"] as string,
  transmission_sig: headers["paypal-transmission-sig"] as string,
  transmission_time: headers["paypal-transmission-time"] as string,
  webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
  webhook_event: body,
};

const verification = await paypal.verifyWebhookSignature(verifyPayload);
if (verification.verification_status !== "SUCCESS") {
  throw new Error("Invalid PayPal webhook signature");
}
```

Returns: `VerifyWebhookSignatureResponse`

---

## Error handling

SDK methods throw `Error` with a contextual message when PayPal request/auth fails.

```ts
try {
  const plans = await paypal.getBillingPlans();
} catch (error) {
  console.error("PayPal call failed:", error);
}
```

---

## Build

```bash
npm run build
```

---

## Notes

- Keep credentials server-side only.
- This SDK uses sandbox API base URL by default.
- Catalog products and webhook verification use the same OAuth token as the official SDK (the PayPal TypeScript server SDK does not yet expose controllers for those APIs).
- For unsupported endpoints, prefer `request<TResponse, TPayload>()` and contribute a typed wrapper method back to the SDK.

