import axios, { AxiosInstance, AxiosError } from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar: string | null;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

class AuthAPI {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: any) => void }> = [];

  constructor(baseURL: string = '/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();

    // Add request interceptor to attach access token
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue requests while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            if (!this.refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.api.post<RefreshTokenResponse>('/auth/refresh', {
              refreshToken: this.refreshToken,
            });

            const { accessToken } = response.data;
            this.setAccessToken(accessToken);
            this.saveTokensToStorage();

            // Process queued requests
            this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
            this.failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];

            // Dispatch logout action (this will be handled by the Redux store)
            window.dispatchEvent(new Event('auth:logout'));

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    this.saveTokensToStorage();
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    this.saveTokensToStorage();
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: this.refreshToken,
    });

    const { accessToken } = response.data;
    this.setAccessToken(accessToken);
    this.saveTokensToStorage();
    return accessToken;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private saveTokensToStorage(): void {
    if (this.accessToken) {
      localStorage.setItem('accessToken', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('refreshToken', this.refreshToken);
    }
  }

  private loadTokensFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      this.setTokens(accessToken, refreshToken);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken;
  }
}

export const authAPI = new AuthAPI();
