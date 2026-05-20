import { categories, CategoryId } from '@/data/categories';

export const detectCategory = (title: string): CategoryId => {
  const query = title.trim().toLowerCase();

  if (!query) {
    return 'other';
  }

  const match = categories.find((category) =>
    category.keywords.some((keyword) => query.includes(keyword)),
  );

  return match?.id ?? 'other';
};
