declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    order_id: string;
    name: string;
    prefill?: {
      name?: string;
      contact?: string;
      email?: string;
    };
    theme?: {
      color?: string;
    };
  }

  export default class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<{
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }>;
  }
}
