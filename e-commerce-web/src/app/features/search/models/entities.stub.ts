import { EntityType } from '../../../core/models/entity-type.enum';
import { ExcludeSearchEntityTypes } from './search.models';

export const STUB_ENTITIES: ExcludeSearchEntityTypes<EntityType.Category>[] = [
  {
    id: 'prod-1',
    label: 'Samsung Galaxy S23 Ultra',
    type: EntityType.Product,
    categoryIds: ['cat-1-2-1', 'cat-1-2'], // Android Phones + Smartphones
    metadata: { brand: 'Samsung', price: 1199 },
  },
  {
    id: 'prod-2',
    label: 'Apple MacBook Air M3',
    type: EntityType.Product,
    categoryIds: ['cat-1-1-2', 'cat-1-1'], // Ultrabooks + Laptops & Computers
    metadata: { brand: 'Apple', price: 1499 },
  },
  {
    id: 'prod-3',
    label: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    type: EntityType.Product,
    categoryIds: ['cat-1', 'cat-1-3'], // Electronics & Gadgets + Wearable Tech
    metadata: { brand: 'Sony', price: 399 },
  },
  {
    id: 'prod-4',
    label: 'Dyson V15 Detect Cordless Vacuum',
    type: EntityType.Product,
    categoryIds: ['cat-2-1'], // Appliances
    metadata: { brand: 'Dyson', price: 749 },
  },

  // Deals
  {
    id: 'deal-1',
    label: 'Summer Sale – Up to 50% Off Electronics',
    type: EntityType.Deal,
  },
  {
    id: 'deal-2',
    label: 'Buy 1 Get 1 Free – Kitchen Essentials',
    type: EntityType.Deal,
  },

  // Trending
  {
    id: 'trend-1',
    label: 'Top Deals on Smart Home Devices',
    type: EntityType.Trending,
  },
  {
    id: 'trend-2',
    label: 'Trending: Minimalist Furniture Designs',
    type: EntityType.Trending,
  },

  // New Arrivals
  {
    id: 'new-1',
    label: 'New Arrival: GoPro Hero 12 Black',
    type: EntityType.NewArrival,
  },
  {
    id: 'new-2',
    label: 'Just Launched: Nike Air Zoom Pegasus 40',
    type: EntityType.NewArrival,
  },

  // Brands
  {
    id: 'brand-1',
    label: 'Nike',
    type: EntityType.Brand,
    metadata: { country: 'USA' },
  },
  {
    id: 'brand-2',
    label: 'Adidas',
    type: EntityType.Brand,
    metadata: { country: 'Germany' },
  },
  {
    id: 'brand-3',
    label: 'Samsung',
    type: EntityType.Brand,
    metadata: { country: 'South Korea' },
  },
  {
    id: 'brand-4',
    label: 'Apple',
    type: EntityType.Brand,
    metadata: { country: 'USA' },
  },
];
