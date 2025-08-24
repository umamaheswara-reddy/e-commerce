import {
  ProductCategory,
  Product,
  Entity,
} from '../../core/models/entities.interface';

/**
 * Checks if an entity matches a search term in its label
 * (and recursively for nested categories).
 */
export function optionMatchingTerm(term: string, label: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  // Direct match
  if (label.toLowerCase().includes(normalized)) {
    return true;
  }

  return false;
}

export function productOptionsMatchingTerm<T extends Product>(
  term: string,
  productEntity: Product,
  productCategory: ProductCategory
): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  // Direct match
  if (optionMatchingTerm(term, productEntity.label)) return true;

  // Search children in product categories
  return (
    productCategory.children?.some((child) =>
      productCategoryChildrenMatchingTerm(normalized, child)
    ) ?? false
  );
}

function productCategoryChildrenMatchingTerm(
  normalized: string,
  productCategory: ProductCategory
): boolean {
  if (productCategory.label.toLowerCase().includes(normalized)) {
    return true;
  }
  return (
    productCategory.children?.some((child) =>
      productCategoryChildrenMatchingTerm(normalized, child)
    ) ?? false
  );
}
