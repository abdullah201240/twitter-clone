import { authAPI } from './auth-api';

export interface ProfileData {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: string | null;
  coverImage: string | null;
  followersCount: number;
  followingCount: number;
  murmurCount: number;
  createdAt: string;
}

export interface FollowStatus {
  isFollowing: boolean;
}

export interface UserWithFollowStatus {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowed: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}

class ProfileAPI {
  private api = authAPI.getApi();

  async getProfile(userId: string): Promise<ProfileData> {
    const response = await this.api.get<ProfileData>(`http://localhost:3001/api/profile/${userId}`);
    return response.data;
  }

  async updateProfile(data: UpdateProfilePayload): Promise<ProfileData> {
    const response = await this.api.put<ProfileData>('http://localhost:3001/api/profile/update', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<ProfileData> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.api.post<ProfileData>('http://localhost:3001/api/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadCoverImage(file: File): Promise<ProfileData> {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await this.api.post<ProfileData>('http://localhost:3001/api/profile/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async toggleFollow(userId: string): Promise<FollowStatus> {
    const response = await this.api.post<FollowStatus>(`http://localhost:3001/api/profile/${userId}/follow`);
    return response.data;
  }

  async getFollowStatus(userId: string): Promise<FollowStatus> {
    const response = await this.api.get<FollowStatus>(`http://localhost:3001/api/profile/${userId}/follow-status`);
    return response.data;
  }

  async getFollowers(userId: string, limit: number = 20, offset: number = 0): Promise<UserWithFollowStatus[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const response = await this.api.get<UserWithFollowStatus[]>(`http://localhost:3001/api/profile/${userId}/followers?${params}`);
    return response.data;
  }

  async getFollowing(userId: string, limit: number = 20, offset: number = 0): Promise<UserWithFollowStatus[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const response = await this.api.get<UserWithFollowStatus[]>(`http://localhost:3001/api/profile/${userId}/following?${params}`);
    return response.data;
  }
}

export const profileAPI = new ProfileAPI();
