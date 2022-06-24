export class RecipeListItemModel {
  id: string | number;
  title: string;
  description: string;
  categoryId: string | number;
  category: string;
  createdDate: Date;
  mainImageId: number;
  mainImageSrc: string;
  rating: number;
}
