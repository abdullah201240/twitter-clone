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
  async getProfile(userId: string): Promise<ProfileData> {
    const response = await authAPI['api'].get<ProfileData>(`/profile/${userId}`);
    return response.data;
  }

  async updateProfile(data: UpdateProfilePayload): Promise<ProfileData> {
    const response = await authAPI['api'].put<ProfileData>('/profile/update', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<ProfileData> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await authAPI['api'].post<ProfileData>('/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadCoverImage(file: File): Promise<ProfileData> {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await authAPI['api'].post<ProfileData>('/profile/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const profileAPI = new ProfileAPI();
