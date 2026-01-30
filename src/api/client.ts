import { ApiResponse, SidvyConfig } from '../types.js'

export class SidvyApiClient {
  private config: SidvyConfig
  private baseHeaders: Record<string, string>

  constructor(config: SidvyConfig) {
    this.config = config
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Sidvy-MCP-Server/1.0.0',
    }

    if (config.apiToken) {
      this.baseHeaders.Authorization = `Bearer ${config.apiToken}`
    }
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const baseUrl = this.config.apiUrl.endsWith('/') ? this.config.apiUrl : this.config.apiUrl + '/'
    const endpoint = url.startsWith('/') ? url.slice(1) : url
    const fullUrl = new URL(endpoint, baseUrl)

    // Add query parameters
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          fullUrl.searchParams.append(key, String(params[key]))
        }
      })
    }

    const requestInit: RequestInit = {
      method,
      headers: this.baseHeaders,
      body: data ? JSON.stringify(data) : undefined,
    }

    if (this.config.debug) {
      console.error(`API Request: ${method} ${fullUrl.toString()}`)
      console.error('Request Headers:', JSON.stringify(this.baseHeaders, null, 2))
      if (data) {
        console.error('Request Data:', JSON.stringify(data, null, 2))
      }
    }

    try {
      const response = await fetch(fullUrl.toString(), requestInit)

      if (this.config.debug) {
        console.error(`API Response: ${response.status} ${fullUrl.toString()}`)
      }

      const responseData = await response.json().catch(() => null)

      if (this.config.debug && responseData) {
        console.error('Response Data:', JSON.stringify(responseData, null, 2))
      }

      if (!response.ok) {
        // Return error response in our format
        if (responseData) {
          return responseData as ApiResponse<T>
        }

        return {
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        } as ApiResponse<T>
      }

      // Wrap successful response in our ApiResponse format
      return {
        success: true,
        data: ((responseData as any)?.data || responseData || {}) as T,
        meta: (responseData as any)?.meta,
      } as ApiResponse<T>
    } catch (error) {
      if (this.config.debug) {
        console.error('API Error:', error)
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network or server error occurred',
        },
      } as ApiResponse<T>
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, params)
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data)
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data)
  }

  async delete<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, data)
  }

  // Helper method to check if response is successful
  isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
    return response.success === true
  }

  // Helper method to get error message from response
  getErrorMessage<T>(response: ApiResponse<T>): string {
    if (response.success === false) {
      return response.error.message
    }
    return 'Unknown error occurred'
  }

  // Update configuration (useful for changing tokens)
  updateConfig(newConfig: Partial<SidvyConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Update headers if token changed
    if (newConfig.apiToken !== undefined) {
      if (newConfig.apiToken) {
        this.baseHeaders.Authorization = `Bearer ${newConfig.apiToken}`
      } else {
        delete this.baseHeaders.Authorization
      }
    }
  }
}

// Utility function to create client from environment variables
export function createClientFromEnv(): SidvyApiClient {
  const config: SidvyConfig = {
    apiToken: process.env.SIDVY_API_TOKEN || '',
    apiUrl: process.env.SIDVY_API_URL || 'https://sidvy.com/api',
    defaultWorkspaceId: process.env.SIDVY_DEFAULT_WORKSPACE_ID,
    debug: process.env.DEBUG === 'true',
  }

  if (!config.apiToken) {
    throw new Error('SIDVY_API_TOKEN environment variable is required')
  }

  return new SidvyApiClient(config)
}
