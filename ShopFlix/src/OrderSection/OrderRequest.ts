export interface OrderItem {
  id: number;
  name: string;
  actualPrice: number;
  discountPrice?: number;
  quantity: number;
  image?: string;
}

/** Valid payment methods your backend accepts */
export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'WALLET'
  | 'COD';

/** Valid statuses for the order workflow */
export type OrderStatus = 'SHIPPED' |'PLACED'| 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

/** Valid payment statuses */
export type PaymentStatus = 'PAID' | 'CONFIRMED' | 'FAILED';

export interface OrderItemDTO {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderRequest {
  orderDate: string; // ISO timestamp
  userId: number | string;
  addressId: number;
  orderStatus: OrderStatus;
  items: OrderItemDTO[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryDate: string | null;
}

/**
 * Builds the payload object for placing an order.
 *
 * @param userId        ID of the placing user (string for guest, number for logged-in).
 * @param addressId     ID of the selected delivery address.
 * @param orderStatus   One of the valid OrderStatus strings.
 * @param items         Array of OrderItemDTO objects.
 * @param paymentMethod One of the valid PaymentMethod strings.
 * @param paymentStatus One of the valid PaymentStatus strings (defaults to PENDING).
 * @param deliveryDate  Optional delivery date as ISO string or null.
 * @returns             Fully-formed OrderRequest object.
 */
export function buildOrderRequest(
  userId: number | string,
  addressId: number,
  orderStatus: OrderStatus,
  items: OrderItemDTO[],
  paymentMethod: PaymentMethod,
  paymentStatus: PaymentStatus = 'PAID',
  deliveryDate: string | null = null
): OrderRequest {
  const normalizedItems = Array.isArray(items) ? items : [];

  const orderRequest: OrderRequest = {
    userId,
    addressId,
    orderStatus,
    items: normalizedItems,
    paymentMethod,
    paymentStatus,
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    orderDate: new Date().toISOString(),
  };

  const lineItems = normalizedItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
  }));
  const grandTotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);

  console.log('🛒 OrderRequest:', {
    userId: orderRequest.userId,
    addressId: orderRequest.addressId,
    orderStatus: orderRequest.orderStatus,
    paymentMethod: orderRequest.paymentMethod,
    paymentStatus: orderRequest.paymentStatus,
    deliveryDate: orderRequest.deliveryDate,
    orderDate: orderRequest.orderDate,
    items: lineItems,
    grandTotal,
  });

  return orderRequest;
}
