import { authAPI } from './auth-api';

export interface SearchResult {
  id: string;
  type: 'user' | 'murmur';
  title: string;
  description: string;
  avatar?: string;
  createdAt: string;
  score: number;
}

class SearchAPI {
  private api = authAPI.getApi();

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    try {
      const response = await this.api.get<{ results: SearchResult[] }>(
        `http://localhost:3001/api/search?${params}`
      );
      return response.data.results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async reindexAll(): Promise<{ message: string }> {
    const response = await this.api.get<{ message: string }>(
      'http://localhost:3001/api/search/reindex'
    );
    return response.data;
  }
}

export const searchAPI = new SearchAPI();
