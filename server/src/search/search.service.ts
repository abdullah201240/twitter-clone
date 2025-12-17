import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';

export interface SearchResult {
  id: string;
  type: 'user' | 'murmur';
  title: string;
  description: string;
  avatar?: string;
  createdAt: Date;
  score: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly esClient: Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Murmur)
    private readonly murmurRepository: Repository<Murmur>,
  ) {
    // Initialize Elasticsearch client
    this.esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || '',
        password: process.env.ELASTICSEARCH_PASSWORD || '',
      },
    });
  }

  async initializeIndices() {
    try {
      // Create users index
      await this.esClient.indices.create({
        index: 'users',
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            username: { type: 'text' },
            email: { type: 'text' },
            bio: { type: 'text' },
            avatar: { type: 'keyword' },
            createdAt: { type: 'date' },
          },
        },
      }).catch(err => {
        if (err.meta?.statusCode !== 400) {
          throw err;
        }
      });

      // Create murmurs index
      await this.esClient.indices.create({
        index: 'murmurs',
        mappings: {
          properties: {
            id: { type: 'keyword' },
            content: { type: 'text' },
            userId: { type: 'keyword' },
            userName: { type: 'text' },
            userUsername: { type: 'text' },
            userAvatar: { type: 'keyword' },
            mediaUrl: { type: 'keyword' },
            createdAt: { type: 'date' },
          },
        },
      }).catch(err => {
        if (err.meta?.statusCode !== 400) {
          throw err;
        }
      });

      this.logger.log('Elasticsearch indices initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Elasticsearch indices', error);
    }
  }

  async indexAllUsers() {
    try {
      const users = await this.userRepository.find();
      const body = users.flatMap(user => [
        { index: { _index: 'users', _id: user.id } },
        {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      ]);

      if (body.length > 0) {
        await this.esClient.bulk({
          operations: body
        });
        this.logger.log(`Indexed ${users.length} users`);
      }
    } catch (error) {
      this.logger.error('Failed to index users', error);
    }
  }

  async indexAllMurmurs() {
    try {
      const murmurs = await this.murmurRepository.find({ relations: ['user'] });
      const body = murmurs.flatMap(murmur => [
        { index: { _index: 'murmurs', _id: murmur.id } },
        {
          id: murmur.id,
          content: murmur.content,
          userId: murmur.userId,
          userName: murmur.user.name,
          userUsername: murmur.user.username,
          userAvatar: murmur.user.avatar,
          mediaUrl: murmur.mediaUrl,
          createdAt: murmur.createdAt,
        },
      ]);

      if (body.length > 0) {
        await this.esClient.bulk({
          operations: body
        });
        this.logger.log(`Indexed ${murmurs.length} murmurs`);
      }
    } catch (error) {
      this.logger.error('Failed to index murmurs', error);
    }
  }

  async indexUser(user: User) {
    try {
      await this.esClient.index({
        index: 'users',
        id: user.id,
        document: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index user ${user.id}`, error);
    }
  }

  async indexMurmur(murmur: Murmur) {
    try {
      // Load user relation if not already loaded
      if (!murmur.user) {
        const fullMurmur = await this.murmurRepository.findOne({
          where: { id: murmur.id },
          relations: ['user'],
        });
        if (fullMurmur) {
          murmur = fullMurmur;
        }
      }

      await this.esClient.index({
        index: 'murmurs',
        id: murmur.id,
        document: {
          id: murmur.id,
          content: murmur.content,
          userId: murmur.userId,
          userName: murmur.user?.name,
          userUsername: murmur.user?.username,
          userAvatar: murmur.user?.avatar,
          mediaUrl: murmur.mediaUrl,
          createdAt: murmur.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index murmur ${murmur.id}`, error);
    }
  }

  async deleteUserFromIndex(userId: string) {
    try {
      await this.esClient.delete({
        index: 'users',
        id: userId,
      }).catch(err => {
        if (err.meta?.statusCode !== 404) {
          throw err;
        }
      });
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId} from index`, error);
    }
  }

  async deleteMurmurFromIndex(murmurId: string) {
    try {
      await this.esClient.delete({
        index: 'murmurs',
        id: murmurId,
      }).catch(err => {
        if (err.meta?.statusCode !== 404) {
          throw err;
        }
      });
    } catch (error) {
      this.logger.error(`Failed to delete murmur ${murmurId} from index`, error);
    }
  }

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      // Multi-index search
      const result = await this.esClient.search({
        index: 'users,murmurs',
        query: {
          multi_match: {
            query,
            fields: [
              'name^2',
              'username^2',
              'bio',
              'content^1.5',
              'userName',
              'userUsername',
            ],
            fuzziness: 'AUTO',
            type: 'best_fields',
          },
        },
        highlight: {
          fields: {
            name: {},
            username: {},
            bio: {},
            content: {},
            userName: {},
            userUsername: {},
          },
        },
        size: limit,
      });

      const hits = result.hits.hits;
      const results: SearchResult[] = hits.map(hit => {
        const source: any = hit._source;
        const highlight: any = hit.highlight || {};

        if (hit._index === 'users') {
          return {
            id: source.id,
            type: 'user' as const,
            title: highlight.name?.[0] || source.name,
            description: highlight.bio?.[0] || source.bio || '',
            avatar: source.avatar,
            createdAt: new Date(source.createdAt),
            score: hit._score || 0,
          };
        } else {
          return {
            id: source.id,
            type: 'murmur' as const,
            title: `${source.userName} (@${source.userUsername})`,
            description: highlight.content?.[0] || source.content,
            avatar: source.userAvatar,
            createdAt: new Date(source.createdAt),
            score: hit._score || 0,
          };
        }
      });

      // Sort by score descending
      return results.sort((a, b) => b.score - a.score);
    } catch (error) {
      this.logger.error(`Search failed for query: ${query}`, error);
      return [];
    }
  }
}
