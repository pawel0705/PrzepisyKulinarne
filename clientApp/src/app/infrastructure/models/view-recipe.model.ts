export class ViewRecipeModel {
    id: string | number;
    title: string;
    content: string;
    categoryId: number;
    mainImageId: string;
    author: string;
    category: string;
    createdDate: Date | null;
    score: number;
  
    constructor() {
      this.id = null;
    }
  }