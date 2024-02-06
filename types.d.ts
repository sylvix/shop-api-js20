// types.d.ts

export interface Product {
  id: number,
  title: string,
  price: number,
  description: string,
  image: string | null,
}

export type ProductWithoutId = Omit<Product, 'id'>;