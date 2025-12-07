import { SidvyApiClient } from './client.js'
import {
  Workspace,
  ApiResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  DeleteWorkspaceRequest,
  DeleteWorkspaceResponse,
  ListWorkspacesParams,
} from '../types.js'

export class WorkspacesApi {
  constructor(private client: SidvyApiClient) {}

  /**
   * List all workspaces for the authenticated user
   */
  async listWorkspaces(params: ListWorkspacesParams = {}): Promise<ApiResponse<Workspace[]>> {
    const queryParams: Record<string, any> = {}

    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit

    return this.client.get<Workspace[]>('/workspace', queryParams)
  }

  /**
   * Get all workspaces (helper method that handles pagination)
   */
  async getAllWorkspaces(): Promise<Workspace[]> {
    const allWorkspaces: Workspace[] = []
    let page = 1
    const limit = 10 // Workspaces are limited to 2 per user, so small limit is fine
    let hasMore = true

    while (hasMore) {
      const response = await this.listWorkspaces({
        page,
        limit,
      })

      if (!this.client.isSuccessResponse(response)) {
        throw new Error(this.client.getErrorMessage(response))
      }

      allWorkspaces.push(...response.data)

      // Check if there are more pages
      if (response.meta?.pagination) {
        hasMore = page < response.meta.pagination.totalPages
        page++
      } else {
        hasMore = response.data.length === limit
        page++
      }
    }

    return allWorkspaces
  }

  /**
   * Get the default workspace
   */
  async getDefaultWorkspace(): Promise<ApiResponse<Workspace | null>> {
    const response = await this.listWorkspaces()

    if (!this.client.isSuccessResponse(response)) {
      return response
    }

    const defaultWorkspace = response.data.find((w) => w.isDefault)
    return {
      success: true,
      data: defaultWorkspace || null,
    }
  }

  /**
   * Get a specific workspace by ID
   */
  async getWorkspaceById(workspaceId: string): Promise<ApiResponse<Workspace | null>> {
    const response = await this.listWorkspaces()

    if (!this.client.isSuccessResponse(response)) {
      return response
    }

    const workspace = response.data.find((w) => w.id === workspaceId)
    return {
      success: true,
      data: workspace || null,
    }
  }

  /**
   * Get a workspace by name
   */
  async getWorkspaceByName(name: string): Promise<ApiResponse<Workspace | null>> {
    const response = await this.listWorkspaces()

    if (!this.client.isSuccessResponse(response)) {
      return response
    }

    const workspace = response.data.find((w) => w.name.toLowerCase() === name.toLowerCase())
    return {
      success: true,
      data: workspace || null,
    }
  }

  /**
   * Create a new workspace
   * Note: API enforces 2-workspace limit per user
   */
  async createWorkspace(workspaceData: CreateWorkspaceRequest): Promise<ApiResponse<Workspace>> {
    return this.client.post<Workspace>('/workspace', workspaceData)
  }

  /**
   * Update an existing workspace
   */
  async updateWorkspace(workspaceData: UpdateWorkspaceRequest): Promise<ApiResponse<Workspace>> {
    return this.client.put<Workspace>('/workspace', workspaceData)
  }

  /**
   * Delete a workspace and all its content
   * Note: Cannot delete default workspace
   */
  async deleteWorkspace(
    workspaceData: DeleteWorkspaceRequest,
  ): Promise<ApiResponse<DeleteWorkspaceResponse>> {
    return this.client.delete<DeleteWorkspaceResponse>('/workspace', workspaceData)
  }

  /**
   * Rename a workspace
   */
  async renameWorkspace(workspaceId: string, newName: string): Promise<ApiResponse<Workspace>> {
    return this.updateWorkspace({
      workspaceId,
      name: newName,
    })
  }

  /**
   * Check if user can create another workspace (max 2 allowed)
   */
  async canCreateWorkspace(): Promise<boolean> {
    try {
      const workspaces = await this.getAllWorkspaces()
      return workspaces.length < 2
    } catch (error) {
      return false
    }
  }

  /**
   * Get workspace statistics and content counts
   */
  async getWorkspaceStats(workspaceId?: string): Promise<ApiResponse<WorkspaceStats>> {
    const response = workspaceId
      ? await this.getWorkspaceById(workspaceId)
      : await this.getDefaultWorkspace()

    if (!this.client.isSuccessResponse(response) || !response.data) {
      return response as ApiResponse<WorkspaceStats>
    }

    const workspace = response.data

    const stats: WorkspaceStats = {
      id: workspace.id,
      name: workspace.name,
      isDefault: workspace.isDefault,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      contentCounts: workspace.contentCounts || { notes: 0, groups: 0, todos: 0 },
    }

    return {
      success: true,
      data: stats,
    }
  }

  /**
   * Get all workspace statistics
   */
  async getAllWorkspaceStats(): Promise<WorkspaceStats[]> {
    const workspaces = await this.getAllWorkspaces()

    return workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      isDefault: workspace.isDefault,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      contentCounts: workspace.contentCounts || { notes: 0, groups: 0, todos: 0 },
    }))
  }

  /**
   * Switch to a different workspace (helper method for context)
   * This doesn't call an API but helps manage the current workspace context
   */
  async switchWorkspace(workspaceId: string): Promise<ApiResponse<Workspace | null>> {
    return this.getWorkspaceById(workspaceId)
  }

  /**
   * Create a workspace with validation
   */
  async createWorkspaceIfPossible(name: string): Promise<ApiResponse<Workspace>> {
    // First check if we can create a workspace
    const canCreate = await this.canCreateWorkspace()

    if (!canCreate) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Maximum number of workspaces reached (2 per user)',
        },
      }
    }

    // Check if workspace with same name already exists
    const existingResponse = await this.getWorkspaceByName(name)
    if (this.client.isSuccessResponse(existingResponse) && existingResponse.data) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Workspace with this name already exists',
        },
      }
    }

    return this.createWorkspace({ name })
  }

  /**
   * Delete workspace with safety checks
   */
  async deleteWorkspaceWithConfirmation(
    workspaceId: string,
    confirmDelete: boolean = false,
  ): Promise<ApiResponse<DeleteWorkspaceResponse>> {
    if (!confirmDelete) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Workspace deletion requires explicit confirmation due to data loss',
        },
      }
    }

    // Check if it's the default workspace
    const workspaceResponse = await this.getWorkspaceById(workspaceId)
    if (!this.client.isSuccessResponse(workspaceResponse) || !workspaceResponse.data) {
      return workspaceResponse as ApiResponse<DeleteWorkspaceResponse>
    }

    if (workspaceResponse.data.isDefault) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot delete default workspace',
        },
      }
    }

    return this.deleteWorkspace({ workspaceId })
  }
}

export interface WorkspaceStats {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  contentCounts: {
    notes: number
    groups: number
    todos: number
  }
}
