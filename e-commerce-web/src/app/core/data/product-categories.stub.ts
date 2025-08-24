import { ProductCategory } from '../../features/search/models/search.models';

export const STUB_PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-1',
    label: 'Electronics & Gadgets',
    children: [
      {
        id: 'cat-1-1',
        label: 'Laptops & Computers',
        children: [
          {
            id: 'cat-1-1-1',
            label: 'Gaming Laptops',
          },
          { id: 'cat-1-1-2', label: 'Ultrabooks' },
          {
            id: 'cat-1-1-3',
            label: '2-in-1 Convertibles',
          },
        ],
      },
      {
        id: 'cat-1-2',
        label: 'Smartphones',
        children: [
          {
            id: 'cat-1-2-1',
            label: 'Android Phones',
          },
          { id: 'cat-1-2-2', label: 'iPhones' },
        ],
      },
      {
        id: 'cat-1-3',
        label: 'Wearable Tech',
        children: [
          {
            id: 'cat-1-3-1',
            label: 'Smartwatches',
          },
          {
            id: 'cat-1-3-2',
            label: 'Fitness Trackers',
          },
        ],
      },
    ],
  },
  {
    id: 'cat-2',
    label: 'Home & Kitchen',
    children: [
      {
        id: 'cat-2-1',
        label: 'Appliances',
        children: [
          {
            id: 'cat-2-1-1',
            label: 'Refrigerators',
          },
          { id: 'cat-2-1-2', label: 'Microwaves' },
          {
            id: 'cat-2-1-3',
            label: 'Coffee Machines',
          },
        ],
      },
      {
        id: 'cat-2-2',
        label: 'Furniture',
        children: [
          { id: 'cat-2-2-1', label: 'Sofas' },
          {
            id: 'cat-2-2-2',
            label: 'Dining Tables',
          },
        ],
      },
    ],
  },
  {
    id: 'cat-3',
    label: 'Sports & Outdoors',
    children: [
      {
        id: 'cat-3-1',
        label: 'Cycling',
        children: [
          {
            id: 'cat-3-1-1',
            label: 'Mountain Bikes',
          },
          { id: 'cat-3-1-2', label: 'Road Bikes' },
        ],
      },
      {
        id: 'cat-3-2',
        label: 'Camping',
        children: [
          { id: 'cat-3-2-1', label: 'Tents' },
          {
            id: 'cat-3-2-2',
            label: 'Sleeping Bags',
          },
        ],
      },
    ],
  },
];
