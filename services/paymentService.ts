const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export interface PaymentCreateResponse {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  url_qrcode?: string;
  amount?: number;
  expiresAt?: string;
  message?: string;
}

export interface PaymentQueryResponse {
  success: boolean;
  isPaid: boolean;
  order?: {
    orderId: string;
    status: string;
    amount: number;
  };
  message?: string;
}

export interface Order {
  orderId: string;
  planId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
}

export async function createPayment(
  token: string,
  planId: 'monthly' | 'yearly',
  paymentMethod: 'alipay' | 'wechat'
): Promise<PaymentCreateResponse> {
  const response = await fetch(`${API_BASE}/api/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ planId, paymentMethod })
  });

  return await response.json();
}

export async function queryPaymentStatus(
  token: string,
  orderId: string
): Promise<PaymentQueryResponse> {
  const response = await fetch(`${API_BASE}/api/payment/query?orderId=${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
}

export async function getOrders(token: string): Promise<{ success: boolean; orders: Order[] }> {
  const response = await fetch(`${API_BASE}/api/payment/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
}
