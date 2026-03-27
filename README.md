# @playflix/paypal-sdk

TypeScript wrapper used by Playflix to call PayPal billing APIs.

## Build

```bash
cd paypal-sdk
npm run build
```

## Usage

```ts
import { PayPal } from "@playflix/paypal-sdk";

const paypal = new PayPal(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!);
```

