import { useState, useCallback } from "react";
import {
  SKINCARE_CATEGORIES,
  type SkincareCategoryKey,
} from "@/constants/skincareCategories";
import type { SkincareProducts } from "@/stores/useAuthStore";

type Products = Record<SkincareCategoryKey, string[]>;

const emptyProducts = (): Products => ({
  cleanser: [],
  moisturizer: [],
  sunscreen: [],
});

export function useSkincareProducts(initial?: SkincareProducts | null) {
  const [products, setProducts] = useState<Products>(() => {
    const base = emptyProducts();
    if (!initial) return base;
    for (const cat of SKINCARE_CATEGORIES) {
      base[cat.key] = initial[cat.key] ?? [];
    }
    return base;
  });

  const addProduct = useCallback((category: SkincareCategoryKey, name: string) => {
    setProducts((prev) => ({
      ...prev,
      [category]: [...prev[category], name],
    }));
  }, []);

  const removeProduct = useCallback((category: SkincareCategoryKey, index: number) => {
    setProducts((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  }, []);

  return { products, addProduct, removeProduct };
}
