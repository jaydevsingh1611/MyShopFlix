export interface OrderItem {
  id: number;
  name: string;
  actualPrice: number;
  discountPrice?: number;
  quantity: number;
  image?: string;
}
