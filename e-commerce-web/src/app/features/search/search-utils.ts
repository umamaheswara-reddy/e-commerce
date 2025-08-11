import { Category, Product } from '../../core/models/entities.interface';
import { EntityType } from '../../core/models/entity-type.enum';
import { SearchTermEntity } from './models/search.types';

/**
 * Checks if an entity matches a search term in its label
 * (and recursively for nested categories).
 */
export function optionMatchesTerm(
  searchEntity: SearchTermEntity,
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
    return (
      (searchEntity as Category).children?.some((child) =>
        optionMatchesTerm(child, normalized)
      ) ?? false
    );
  }

  return false;
}

/**
 * Matches entity by category ID.
 * Only applies if:
 *  - entity is a category (self/child match)
 *  - entity is a product (categoryIds array contains it)
 * Other entity types skip category matching.
 */
export function optionMatchesCategory(
  searchEntity: SearchTermEntity,
  categoryId: string
): boolean {
  if (!categoryId) return true;

  switch (searchEntity.type) {
    case EntityType.Category: {
      const category = searchEntity as Category;
      if (category.id === categoryId) return true;
      return (
        category.children?.some((child) =>
          optionMatchesCategory(child, categoryId)
        ) ?? false
      );
    }
    case EntityType.Product: {
      return (
        (searchEntity as Product).categoryIds?.includes(categoryId) ?? false
      );
    }
    default:
      // Deals, Brands, Services, etc. ignore category filtering
      return true;
  }
}
