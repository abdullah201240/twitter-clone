import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService, SearchResult } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 20,
  ): Promise<{ results: SearchResult[] }> {
    if (!query || query.trim().length === 0) {
      return { results: [] };
    }

    const results = await this.searchService.search(query, limit);
    return { results };
  }

  // Admin endpoint to reindex all data
  @Get('/reindex')
  @UseGuards(JwtAuthGuard)
  async reindexAll() {
    await this.searchService.initializeIndices();
    await this.searchService.indexAllUsers();
    await this.searchService.indexAllMurmurs();
    return { message: 'Reindexing completed' };
  }
}
