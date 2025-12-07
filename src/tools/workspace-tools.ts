import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { WorkspacesApi } from '../api/workspaces.js'
import { SidvyApiClient } from '../api/client.js'

export class WorkspaceTools {
  constructor(
    private workspacesApi: WorkspacesApi,
    private client: SidvyApiClient,
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'list_workspaces',
        description: 'List all workspaces for the authenticated user with content counts',
        inputSchema: {
          type: 'object',
          properties: {
            includeStats: {
              type: 'boolean',
              description: 'Include content statistics (default: true)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'create_workspace',
        description: 'Create a new workspace (max 2 workspaces per user)',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100, description: 'Workspace name' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      {
        name: 'update_workspace',
        description: 'Update a workspace (currently only name changes supported)',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace ID to update' },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'New workspace name',
            },
          },
          required: ['workspaceId'],
          additionalProperties: false,
        },
      },
      {
        name: 'delete_workspace',
        description: 'Delete a workspace and all its content (cannot delete default workspace)',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace ID to delete' },
            confirmDelete: {
              type: 'boolean',
              description: 'Confirmation flag (required for safety)',
            },
          },
          required: ['workspaceId', 'confirmDelete'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_workspace',
        description: 'Get details of a specific workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace ID to retrieve' },
          },
          required: ['workspaceId'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_default_workspace',
        description: "Get the user's default workspace",
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'get_workspace_by_name',
        description: 'Find a workspace by its name',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workspace name to search for' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_workspace_stats',
        description: 'Get detailed statistics for a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default if not specified)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'can_create_workspace',
        description: 'Check if the user can create another workspace (max 2 allowed)',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'switch_workspace',
        description: 'Switch context to a different workspace (for subsequent operations)',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace ID to switch to' },
          },
          required: ['workspaceId'],
          additionalProperties: false,
        },
      },
      {
        name: 'rename_workspace',
        description: 'Rename an existing workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace ID to rename' },
            newName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'New workspace name',
            },
          },
          required: ['workspaceId', 'newName'],
          additionalProperties: false,
        },
      },
    ]
  }

  async handleToolCall(name: string, arguments_: any): Promise<any> {
    switch (name) {
      case 'list_workspaces':
        return this.handleListWorkspaces(arguments_)
      case 'create_workspace':
        return this.handleCreateWorkspace(arguments_)
      case 'update_workspace':
        return this.handleUpdateWorkspace(arguments_)
      case 'delete_workspace':
        return this.handleDeleteWorkspace(arguments_)
      case 'get_workspace':
        return this.handleGetWorkspace(arguments_)
      case 'get_default_workspace':
        return this.handleGetDefaultWorkspace(arguments_)
      case 'get_workspace_by_name':
        return this.handleGetWorkspaceByName(arguments_)
      case 'get_workspace_stats':
        return this.handleGetWorkspaceStats(arguments_)
      case 'can_create_workspace':
        return this.handleCanCreateWorkspace(arguments_)
      case 'switch_workspace':
        return this.handleSwitchWorkspace(arguments_)
      case 'rename_workspace':
        return this.handleRenameWorkspace(arguments_)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  private async handleListWorkspaces(args: any) {
    const response = await this.workspacesApi.listWorkspaces()

    if (this.client.isSuccessResponse(response)) {
      const workspaces = response.data
      const defaultWorkspace = workspaces.find((w) => w.isDefault)

      return {
        success: true,
        workspaces,
        count: workspaces.length,
        defaultWorkspace: defaultWorkspace?.id,
        maxWorkspaces: 2,
        canCreateMore: workspaces.length < 2,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCreateWorkspace(args: any) {
    const response = await this.workspacesApi.createWorkspaceIfPossible(args.name)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        workspace: response.data,
        message: `Workspace "${response.data.name}" created successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUpdateWorkspace(args: any) {
    const response = await this.workspacesApi.updateWorkspace(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        workspace: response.data,
        message: `Workspace "${response.data.name}" updated successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleDeleteWorkspace(args: any) {
    const response = await this.workspacesApi.deleteWorkspaceWithConfirmation(
      args.workspaceId,
      args.confirmDelete,
    )

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        deleted: response.data.deleted,
        workspaceId: response.data.workspaceId,
        deletedContent: response.data.deletedContent,
        message: `Workspace deleted successfully. Deleted ${response.data.deletedContent.notes} notes, ${response.data.deletedContent.groups} groups, and ${response.data.deletedContent.todos} todos.`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetWorkspace(args: any) {
    const response = await this.workspacesApi.getWorkspaceById(args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      if (response.data) {
        return {
          success: true,
          workspace: response.data,
        }
      } else {
        return {
          success: false,
          error: 'Workspace not found',
        }
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetDefaultWorkspace(args: any) {
    const response = await this.workspacesApi.getDefaultWorkspace()

    if (this.client.isSuccessResponse(response)) {
      if (response.data) {
        return {
          success: true,
          workspace: response.data,
          isDefault: true,
        }
      } else {
        return {
          success: false,
          error: 'No default workspace found',
        }
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetWorkspaceByName(args: any) {
    const response = await this.workspacesApi.getWorkspaceByName(args.name)

    if (this.client.isSuccessResponse(response)) {
      if (response.data) {
        return {
          success: true,
          workspace: response.data,
          searchName: args.name,
        }
      } else {
        return {
          success: false,
          error: `Workspace with name "${args.name}" not found`,
        }
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetWorkspaceStats(args: any) {
    const response = await this.workspacesApi.getWorkspaceStats(args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      const stats = response.data
      const totalContent =
        stats.contentCounts.notes + stats.contentCounts.groups + stats.contentCounts.todos

      return {
        success: true,
        stats,
        totalContent,
        message: `Workspace "${stats.name}" contains ${stats.contentCounts.notes} notes, ${stats.contentCounts.groups} groups, and ${stats.contentCounts.todos} todos`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCanCreateWorkspace(args: any) {
    try {
      const canCreate = await this.workspacesApi.canCreateWorkspace()
      const workspaces = await this.workspacesApi.getAllWorkspaces()

      return {
        success: true,
        canCreate,
        currentCount: workspaces.length,
        maxAllowed: 2,
        remainingSlots: Math.max(0, 2 - workspaces.length),
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  private async handleSwitchWorkspace(args: any) {
    const response = await this.workspacesApi.switchWorkspace(args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      if (response.data) {
        return {
          success: true,
          workspace: response.data,
          message: `Switched to workspace "${response.data.name}"`,
          currentWorkspaceId: response.data.id,
        }
      } else {
        return {
          success: false,
          error: 'Workspace not found',
        }
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleRenameWorkspace(args: any) {
    const response = await this.workspacesApi.renameWorkspace(args.workspaceId, args.newName)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        workspace: response.data,
        oldName: args.currentName, // This would need to be tracked separately
        newName: response.data.name,
        message: `Workspace renamed to "${response.data.name}"`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }
}
