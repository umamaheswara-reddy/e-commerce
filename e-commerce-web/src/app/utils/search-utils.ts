// src/app/utils/search-utils.ts

import {
  Category,
  EntityType,
  SearchEntity,
  Product,
} from '../features/search/models/entity.models';

/**
 * Checks if an entity matches a search term in its label
 * (and recursively for nested categories).
 */
export function optionMatchesTerm(
  searchEntity: SearchEntity,
  term: string
): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  // Direct match
  if (searchEntity.label.toLowerCase().includes(normalized)) {
    return true;
  }

  // Recursively search children for categories
  if (searchEntity.type === EntityType.Category) {
    const category = searchEntity as Category;
    return (
      category.children?.some((child) =>
        optionMatchesTerm(child, normalized)
      ) ?? false
    );
  }

  return false;
}

export function optionMatchesCategory(
  searchEntity: SearchEntity,
  categoryId: string
): boolean {
  if (!categoryId) return true;

  // For categories: check self or children recursively
  if (searchEntity.type === EntityType.Category) {
    const category = searchEntity as Category;
    if (category.id === categoryId) return true;
    return (
      category.children?.some((child) =>
        optionMatchesCategory(child, categoryId)
      ) ?? false
    );
  }

  // For products: check categoryIds array
  if (searchEntity.type === EntityType.Product) {
    const product = searchEntity as Product;
    return product.categoryIds?.includes(categoryId) ?? false;
  }

  return false;
}
