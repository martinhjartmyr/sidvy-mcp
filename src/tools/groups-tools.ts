import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { GroupsApi } from '../api/groups.js'
import { SidvyApiClient } from '../api/client.js'

export class GroupsTools {
  constructor(
    private groupsApi: GroupsApi,
    private client: SidvyApiClient,
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'list_groups',
        description: 'List groups with hierarchical structure and filtering',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Filter by workspace ID' },
            parentId: {
              type: 'string',
              description: 'Filter by parent group ID (null for root groups)',
            },
            search: { type: 'string', description: 'Search groups by name' },
            sort: {
              type: 'string',
              enum: [
                'name:asc',
                'name:desc',
                'createdAt:asc',
                'createdAt:desc',
                'updatedAt:asc',
                'updatedAt:desc',
              ],
              description: 'Sort order for results',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Number of groups to return',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'create_group',
        description: 'Create a new group for organizing notes',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100, description: 'Group name' },
            workspaceId: {
              type: 'string',
              description: 'Workspace to create group in (optional, uses default)',
            },
            parentId: {
              type: 'string',
              description: 'Parent group for hierarchical organization (optional)',
            },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      {
        name: 'update_group',
        description: "Update a group's name or move it in the hierarchy",
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Group ID to update' },
            name: { type: 'string', minLength: 1, maxLength: 100, description: 'New group name' },
            parentId: {
              type: 'string',
              description: 'New parent group ID (can be null to move to root)',
            },
          },
          required: ['groupId'],
          additionalProperties: false,
        },
      },
      {
        name: 'delete_group',
        description: 'Delete a group and all its child groups (cascade delete)',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Group ID to delete' },
          },
          required: ['groupId'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_group_tree',
        description: 'Get the hierarchical tree structure of all groups in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace ID to get groups from' },
          },
          required: ['workspaceId'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_root_groups',
        description: 'Get all root-level groups (groups with no parent)',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: {
              type: 'string',
              description: 'Workspace to get root groups from (optional)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_child_groups',
        description: 'Get all child groups of a specific parent group',
        inputSchema: {
          type: 'object',
          properties: {
            parentId: { type: 'string', description: 'Parent group ID' },
            workspaceId: { type: 'string', description: 'Workspace to search in (optional)' },
          },
          required: ['parentId'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_group_path',
        description: 'Get the full path from root to a specific group',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Group ID to get path for' },
            workspaceId: { type: 'string', description: 'Workspace ID' },
          },
          required: ['groupId', 'workspaceId'],
          additionalProperties: false,
        },
      },
      {
        name: 'move_group',
        description: 'Move a group to a new parent (or to root level)',
        inputSchema: {
          type: 'object',
          properties: {
            groupId: { type: 'string', description: 'Group ID to move' },
            newParentId: {
              type: 'string',
              description: 'New parent group ID (omit to move to root level)',
            },
          },
          required: ['groupId'],
          additionalProperties: false,
        },
      },
      {
        name: 'create_group_path',
        description: 'Create a nested group structure from a path (creates missing parent groups)',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Array of group names representing the path (e.g., ["Projects", "Web Dev", "Frontend"])',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace to create groups in (optional)',
            },
          },
          required: ['path'],
          additionalProperties: false,
        },
      },
    ]
  }

  async handleToolCall(name: string, arguments_: any): Promise<any> {
    switch (name) {
      case 'list_groups':
        return this.handleListGroups(arguments_)
      case 'create_group':
        return this.handleCreateGroup(arguments_)
      case 'update_group':
        return this.handleUpdateGroup(arguments_)
      case 'delete_group':
        return this.handleDeleteGroup(arguments_)
      case 'get_group_tree':
        return this.handleGetGroupTree(arguments_)
      case 'get_root_groups':
        return this.handleGetRootGroups(arguments_)
      case 'get_child_groups':
        return this.handleGetChildGroups(arguments_)
      case 'get_group_path':
        return this.handleGetGroupPath(arguments_)
      case 'move_group':
        return this.handleMoveGroup(arguments_)
      case 'create_group_path':
        return this.handleCreateGroupPath(arguments_)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  private async handleListGroups(args: any) {
    const response = await this.groupsApi.listGroups(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        groups: response.data,
        pagination: response.meta?.pagination,
        count: response.meta?.count,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCreateGroup(args: any) {
    const response = await this.groupsApi.createGroup(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        group: response.data,
        message: `Group "${response.data.name}" created successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUpdateGroup(args: any) {
    const response = await this.groupsApi.updateGroup(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        group: response.data,
        message: `Group "${response.data.name}" updated successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleDeleteGroup(args: any) {
    const response = await this.groupsApi.deleteGroup(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        deleted: response.data.deleted,
        groupId: response.data.groupId,
        deletedChildGroups: response.data.deletedChildGroups,
        message: `Group deleted successfully (including ${response.data.deletedChildGroups} child groups)`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetGroupTree(args: any) {
    try {
      const tree = await this.groupsApi.getGroupTree(args.workspaceId)

      return {
        success: true,
        tree,
        message: `Retrieved group tree for workspace ${args.workspaceId}`,
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  private async handleGetRootGroups(args: any) {
    const response = await this.groupsApi.getRootGroups(args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        groups: response.data,
        count: response.data.length,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetChildGroups(args: any) {
    const response = await this.groupsApi.getChildGroups(args.parentId, args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        groups: response.data,
        parentId: args.parentId,
        count: response.data.length,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetGroupPath(args: any) {
    try {
      const path = await this.groupsApi.getGroupPath(args.groupId, args.workspaceId)

      return {
        success: true,
        path,
        pathString: path.join(' > '),
        groupId: args.groupId,
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  private async handleMoveGroup(args: any) {
    const response = await this.groupsApi.moveGroup(args.groupId, args.newParentId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        group: response.data,
        message: `Group "${response.data.name}" moved successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCreateGroupPath(args: any) {
    const response = await this.groupsApi.createGroupPath(args.path, args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        groups: response.data,
        path: args.path,
        pathString: args.path.join(' > '),
        message: `Group path "${args.path.join(' > ')}" created successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }
}
