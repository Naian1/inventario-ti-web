export type Field = {
  id: string;
  categoryId: string;
  name: string;
  key: string;
  type: 'string' | 'number' | 'boolean';
};

export type Category = {
  id: string;
  name: string;
};

export type Item = {
  id: string;
  categoryId: string;
  [key: string]: any;
};

export type InventoryData = {
  categories: Category[];
  fields: Field[];
  items: Item[];
  users: { username: string; role: 'admin' | 'user' }[];
};
