import { EntityType } from '../../../core/models/entity-type.enum';
import { SearchEntity } from './search.models';

export const STUB_CATEGORIES: SearchEntity[] = [
  {
    id: 'cat-1',
    label: 'Electronics & Gadgets',
    type: EntityType.Category,
    children: [
      {
        id: 'cat-1-1',
        label: 'Laptops & Computers',
        type: EntityType.Category,
        children: [
          {
            id: 'cat-1-1-1',
            label: 'Gaming Laptops',
            type: EntityType.Category,
          },
          { id: 'cat-1-1-2', label: 'Ultrabooks', type: EntityType.Category },
          {
            id: 'cat-1-1-3',
            label: '2-in-1 Convertibles',
            type: EntityType.Category,
          },
        ],
      },
      {
        id: 'cat-1-2',
        label: 'Smartphones',
        type: EntityType.Category,
        children: [
          {
            id: 'cat-1-2-1',
            label: 'Android Phones',
            type: EntityType.Category,
          },
          { id: 'cat-1-2-2', label: 'iPhones', type: EntityType.Category },
        ],
      },
      {
        id: 'cat-1-3',
        label: 'Wearable Tech',
        type: EntityType.Category,
        children: [
          {
            id: 'cat-1-3-1',
            label: 'Smartwatches',
            type: EntityType.Category,
          },
          {
            id: 'cat-1-3-2',
            label: 'Fitness Trackers',
            type: EntityType.Category,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-2',
    label: 'Home & Kitchen',
    type: EntityType.Category,
    children: [
      {
        id: 'cat-2-1',
        label: 'Appliances',
        type: EntityType.Category,
        children: [
          {
            id: 'cat-2-1-1',
            label: 'Refrigerators',
            type: EntityType.Category,
          },
          { id: 'cat-2-1-2', label: 'Microwaves', type: EntityType.Category },
          {
            id: 'cat-2-1-3',
            label: 'Coffee Machines',
            type: EntityType.Category,
          },
        ],
      },
      {
        id: 'cat-2-2',
        label: 'Furniture',
        type: EntityType.Category,
        children: [
          { id: 'cat-2-2-1', label: 'Sofas', type: EntityType.Category },
          {
            id: 'cat-2-2-2',
            label: 'Dining Tables',
            type: EntityType.Category,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-3',
    label: 'Sports & Outdoors',
    type: EntityType.Category,
    children: [
      {
        id: 'cat-3-1',
        label: 'Cycling',
        type: EntityType.Category,
        children: [
          {
            id: 'cat-3-1-1',
            label: 'Mountain Bikes',
            type: EntityType.Category,
          },
          { id: 'cat-3-1-2', label: 'Road Bikes', type: EntityType.Category },
        ],
      },
      {
        id: 'cat-3-2',
        label: 'Camping',
        type: EntityType.Category,
        children: [
          { id: 'cat-3-2-1', label: 'Tents', type: EntityType.Category },
          {
            id: 'cat-3-2-2',
            label: 'Sleeping Bags',
            type: EntityType.Category,
          },
        ],
      },
    ],
  },
];
