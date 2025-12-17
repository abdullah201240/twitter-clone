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
  createdAt: string;
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
}

export const profileAPI = new ProfileAPI();
