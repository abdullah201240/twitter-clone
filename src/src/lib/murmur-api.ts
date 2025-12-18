import { authAPI } from './auth-api';

export interface Murmur {
  id: string;
  content: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  mediaUrl: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMurmurRequest {
  content: string;
  mediaUrl?: string;
}

export interface UploadResponse {
  filename: string;
  url: string;
  size: number;
}

export interface TimelineResponse {
  data: Murmur[];
  nextCursor: string | null;
}

export interface CommentData {
  id: string;
  content: string;
  userId: string;
  murmurId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

class MurmurAPI {
  private api = authAPI.getApi();

  async createMurmur(data: CreateMurmurRequest): Promise<Murmur> {
    const response = await this.api.post<Murmur>('http://localhost:3001/api/me/murmurs', data);
    return response.data;
  }

  async getUserMurmurs(userId: string, limit: number = 10, cursor?: string): Promise<TimelineResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    const response = await this.api.get<TimelineResponse>(`http://localhost:3001/api/users/${userId}/murmurs?${params}`);
    return response.data;
  }

  async getTimeline(limit: number = 10, cursor?: string): Promise<TimelineResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    const response = await this.api.get<TimelineResponse>(`http://localhost:3001/api/murmurs?${params}`);
    return response.data;
  }

  async getFeed(limit: number = 10, cursor?: string): Promise<TimelineResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    const response = await this.api.get<TimelineResponse>(`http://localhost:3001/api/feed?${params}`);
    return response.data;
  }

  async deleteMurmur(id: string): Promise<void> {
    await this.api.delete(`http://localhost:3001/api/me/murmurs/${id}`);
  }

  async toggleLike(murmurId: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await this.api.post<{ liked: boolean; likeCount: number }>(
      `http://localhost:3001/api/murmurs/${murmurId}/like`,
      {}
    );
    return response.data;
  }

  async getLikeStatus(murmurId: string): Promise<{ isLiked: boolean }> {
    const response = await this.api.get<{ isLiked: boolean }>(
      `http://localhost:3001/api/murmurs/${murmurId}/like-status`
    );
    return response.data;
  }

  async getMultipleLikeStatus(murmurIds: string[]): Promise<Record<string, boolean>> {
    // Validate input
    if (!murmurIds || murmurIds.length === 0) {
      return {};
    }
    
    // Limit the number of IDs to prevent abuse
    const limitedIds = murmurIds.slice(0, 100);
    
    const params = new URLSearchParams();
    limitedIds.forEach(id => params.append('ids', id));
    const response = await this.api.get<Record<string, boolean>>(
      `http://localhost:3001/api/murmurs/like-status?${params}`
    );
    return response.data;
  }

  async createComment(murmurId: string, content: string): Promise<CommentData> {
    const response = await this.api.post<CommentData>(
      `http://localhost:3001/api/murmurs/${murmurId}/comments`,
      { content }
    );
    return response.data;
  }

  async getComments(murmurId: string, limit: number = 20, offset: number = 0): Promise<CommentData[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const response = await this.api.get<CommentData[]>(
      `http://localhost:3001/api/murmurs/${murmurId}/comments?${params}`
    );
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.api.delete(`http://localhost:3001/api/comments/${commentId}`);
  }

  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<UploadResponse>('http://localhost:3001/api/murmurs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const murmurAPI = new MurmurAPI();