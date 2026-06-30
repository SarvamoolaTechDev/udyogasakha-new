'use client';
import { useCallback, useRef } from 'react';
import { paymentsApi } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

/** Loads Razorpay's checkout.js once and caches the promise across calls. */
function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Cannot load Razorpay on the server'));
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => { scriptLoadPromise = null; reject(new Error('Failed to load Razorpay checkout script')); };
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

export interface StartPaymentParams {
  purpose:      'LISTING_FEATURE' | 'CERTIFICATION_FEE' | 'REGISTRATION_FEE' | 'OTHER';
  referenceId?: string;
  amount:       number;   // in rupees (or major unit of `currency`)
  currency?:    string;   // defaults to INR server-side
  description:  string;
  prefillName?:  string;
  prefillEmail?: string;
  prefillPhone?: string;
  onSuccess?: (result: any) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Opens Razorpay's Standard Checkout modal.
 *
 * Deliberately does NOT pass a `method` config — leaving it unset means
 * Checkout shows every payment method enabled on the Razorpay account
 * (UPI, cards, netbanking, wallets, EMI, pay later, international cards
 * if activated) without any code here needing to know which ones exist.
 */
export function useRazorpayCheckout() {
  const inFlight = useRef(false);

  const startPayment = useCallback(async (params: StartPaymentParams) => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      await loadRazorpayScript();

      const order = await paymentsApi.createOrder({
        purpose:     params.purpose,
        referenceId: params.referenceId,
        amount:      params.amount,
        currency:    params.currency,
      });

      const rzp = new window.Razorpay({
        key:         order.razorpayKeyId,
        amount:      order.amount,
        currency:    order.currency,
        order_id:    order.orderId,
        name:        'Sarva Moola Udyoga Sakha',
        description: params.description,
        // No `method` block here — all enabled methods are shown automatically.
        prefill: {
          name:    params.prefillName,
          email:   params.prefillEmail,
          contact: params.prefillPhone,
        },
        theme: { color: '#D4A017' }, // matches the gold accent used across the app
        handler: async (response: any) => {
          try {
            const result = await paymentsApi.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            params.onSuccess?.(result);
          } catch (err) {
            params.onFailure?.(err);
          } finally {
            inFlight.current = false;
          }
        },
        modal: {
          ondismiss: () => {
            inFlight.current = false;
            params.onDismiss?.();
          },
        },
      });

      rzp.on('payment.failed', (resp: any) => {
        inFlight.current = false;
        params.onFailure?.(resp.error);
      });

      rzp.open();
    } catch (err) {
      inFlight.current = false;
      params.onFailure?.(err);
    }
  }, []);

  return { startPayment };
}
