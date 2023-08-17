import HttpClient from './Utils/HttpClient';
import CategoryMapper from './mappers/CategoryMapper';

class CategoriesService {
  constructor() {
    this.HttpClient = new HttpClient('http://localhost:3001');
  }

  async listCategories() {
    const categories = await this.HttpClient.get('/category');

    return categories.map(CategoryMapper.toDomain);
  }
}
export default new CategoriesService();
