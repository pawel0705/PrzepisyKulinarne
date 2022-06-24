import { CommentModel } from './comment.model';

export class GetRecipeModel {
  title: string;
  content: string;
  authorName: string;
  mainImageId: number;
  recipeId: number;
  authorId: number;
  createdDate: Date;
  rating: number;
  shortDescription: string;
  views: number;
  categoryId: number;
  comments: CommentModel[];

  constructor() {
    this.comments = [];
  }
}
