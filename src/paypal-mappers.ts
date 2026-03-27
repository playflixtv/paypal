import type {
  BillingPlan,
  PlanCollection,
  SubscriptionBillingCycle,
} from "@paypal/paypal-server-sdk";
import {
  IntervalUnit,
  PlanRequest,
  PlanRequestStatus,
  SetupFeeFailureAction,
  TenureType,
} from "@paypal/paypal-server-sdk";
import type {
  CreatePlanPayload,
  PayPalBillingCycle,
  PayPalLink,
  PayPalPlanResponse,
  PayPalPlansListResponse,
} from "./types";

function mapBillingCycle(bc: SubscriptionBillingCycle): PayPalBillingCycle {
  const ps = bc.pricingScheme;
  const fixed = ps?.fixedPrice
    ? {
        fixed_price: {
          currency_code: ps.fixedPrice.currencyCode ?? "",
          value: ps.fixedPrice.value ?? "",
        },
      }
    : undefined;
  return {
    tenure_type: bc.tenureType as PayPalBillingCycle["tenure_type"],
    sequence: bc.sequence,
    frequency: {
      interval_unit: bc.frequency.intervalUnit as PayPalBillingCycle["frequency"]["interval_unit"],
      interval_count: bc.frequency.intervalCount ?? 0,
    },
    total_cycles: bc.totalCycles ?? 0,
    pricing_scheme: fixed ?? {
      fixed_price: { currency_code: "", value: "" },
    },
  };
}

export function billingPlanToPublic(bp: BillingPlan): PayPalPlanResponse {
  const paymentPreferences = bp.paymentPreferences;
  return {
    id: bp.id ?? "",
    product_id: bp.productId ?? "",
    name: bp.name ?? "",
    status: (bp.status ?? "CREATED") as PayPalPlanResponse["status"],
    description: bp.description,
    billing_cycles: bp.billingCycles?.map(mapBillingCycle),
    payment_preferences: paymentPreferences
      ? {
          auto_bill_outstanding: paymentPreferences.autoBillOutstanding ?? false,
          setup_fee_failure_action:
            paymentPreferences.setupFeeFailureAction ?? "CONTINUE",
          payment_failure_threshold:
            paymentPreferences.paymentFailureThreshold ?? 0,
        }
      : undefined,
    create_time: bp.createTime,
    update_time: bp.updateTime,
    links: bp.links?.map(
      (l): PayPalLink => ({
        href: l.href,
        rel: l.rel,
        method: l.method != null ? String(l.method) : "",
      }),
    ),
  };
}

export function planCollectionToPublic(pc: PlanCollection): PayPalPlansListResponse {
  return {
    plans: (pc.plans ?? []).map(billingPlanToPublic),
    total_items: pc.totalItems,
    total_pages: pc.totalPages,
    links: pc.links?.map(
      (l): PayPalLink => ({
        href: l.href,
        rel: l.rel,
        method: l.method != null ? String(l.method) : "",
      }),
    ),
  };
}

function mapIntervalUnit(u: PayPalBillingCycle["frequency"]["interval_unit"]): IntervalUnit {
  const map: Record<string, IntervalUnit> = {
    DAY: IntervalUnit.Day,
    WEEK: IntervalUnit.Week,
    MONTH: IntervalUnit.Month,
    YEAR: IntervalUnit.Year,
  };
  return map[u] ?? IntervalUnit.Month;
}

function mapTenure(t: PayPalBillingCycle["tenure_type"]): TenureType {
  return t === "TRIAL" ? TenureType.Trial : TenureType.Regular;
}

function mapPlanStatus(s: CreatePlanPayload["status"]): PlanRequestStatus {
  if (s === "CREATED") {
    return PlanRequestStatus.Created;
  }
  if (s === "INACTIVE") {
    return PlanRequestStatus.Inactive;
  }
  return PlanRequestStatus.Active;
}

export function createPlanPayloadToPlanRequest(
  data: CreatePlanPayload,
): PlanRequest {
  return {
    productId: data.product_id,
    name: data.name,
    status: mapPlanStatus(data.status),
    description: data.description,
    billingCycles: data.billing_cycles.map((bc) => ({
      tenureType: mapTenure(bc.tenure_type),
      sequence: bc.sequence,
      totalCycles: bc.total_cycles,
      frequency: {
        intervalUnit: mapIntervalUnit(bc.frequency.interval_unit),
        intervalCount: bc.frequency.interval_count,
      },
      pricingScheme: {
        fixedPrice: {
          currencyCode: bc.pricing_scheme.fixed_price.currency_code,
          value: bc.pricing_scheme.fixed_price.value,
        },
      },
    })),
    paymentPreferences: {
      autoBillOutstanding: data.payment_preferences.auto_bill_outstanding,
      setupFeeFailureAction:
        data.payment_preferences.setup_fee_failure_action === "CANCEL"
          ? SetupFeeFailureAction.Cancel
          : SetupFeeFailureAction.Continue,
      paymentFailureThreshold: data.payment_preferences.payment_failure_threshold,
    },
  };
}
