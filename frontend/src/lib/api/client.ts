/**
 * Base API client using axios.
 * Handles authentication, error handling, and request/response interceptors.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
        }

        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Response from ${response.config.url}:`, response.data);
        }
        return response;
      },
      (error: AxiosError) => {
        // Handle common errors
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as { detail?: string };

          switch (status) {
            case 401:
              console.error('[API] Unauthorized - clearing auth');
              localStorage.removeItem('auth_token');
              // Could redirect to login page here
              break;
            case 403:
              console.error('[API] Forbidden:', data.detail);
              break;
            case 404:
              console.error('[API] Not found:', data.detail);
              break;
            case 500:
              console.error('[API] Server error:', data.detail);
              break;
            default:
              console.error(`[API] Error ${status}:`, data.detail);
          }
        } else if (error.request) {
          console.error('[API] No response received:', error.message);
        } else {
          console.error('[API] Request setup error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient().getClient();

// Export types for API responses
export interface ApiError {
  detail: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}
