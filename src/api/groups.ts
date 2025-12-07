import { SidvyApiClient } from './client.js'
import {
  Group,
  ApiResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  DeleteGroupRequest,
  DeleteGroupResponse,
  ListGroupsParams,
} from '../types.js'

export class GroupsApi {
  constructor(private client: SidvyApiClient) {}

  /**
   * List groups with optional filtering and pagination
   */
  async listGroups(params: ListGroupsParams = {}): Promise<ApiResponse<Group[]>> {
    const queryParams: Record<string, any> = {}

    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.workspaceId !== undefined) queryParams.workspaceId = params.workspaceId
    if (params.parentId !== undefined) queryParams.parentId = params.parentId
    if (params.search !== undefined) queryParams.search = params.search
    if (params.sort !== undefined) queryParams.sort = params.sort

    return this.client.get<Group[]>('/group', queryParams)
  }

  /**
   * Get all groups in a workspace (for building hierarchy)
   */
  async getAllGroupsInWorkspace(workspaceId: string): Promise<Group[]> {
    const allGroups: Group[] = []
    let page = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const response = await this.listGroups({
        workspaceId,
        page,
        limit,
        sort: 'name:asc',
      })

      if (!this.client.isSuccessResponse(response)) {
        throw new Error(this.client.getErrorMessage(response))
      }

      allGroups.push(...response.data)

      // Check if there are more pages
      if (response.meta?.pagination) {
        hasMore = page < response.meta.pagination.totalPages
        page++
      } else {
        hasMore = response.data.length === limit
        page++
      }
    }

    return allGroups
  }

  /**
   * Get root level groups (no parent)
   */
  async getRootGroups(workspaceId?: string): Promise<ApiResponse<Group[]>> {
    return this.listGroups({
      workspaceId,
      parentId: null as any, // API expects null for root groups
      sort: 'name:asc',
    })
  }

  /**
   * Get child groups of a specific parent group
   */
  async getChildGroups(parentId: string, workspaceId?: string): Promise<ApiResponse<Group[]>> {
    return this.listGroups({
      workspaceId,
      parentId,
      sort: 'name:asc',
    })
  }

  /**
   * Get a specific group by ID
   */
  async getGroupById(groupId: string, workspaceId?: string): Promise<ApiResponse<Group | null>> {
    const response = await this.listGroups({
      workspaceId,
      limit: 100,
    })

    if (!this.client.isSuccessResponse(response)) {
      return response
    }

    const group = response.data.find((g) => g.id === groupId)
    return {
      success: true,
      data: group || null,
    }
  }

  /**
   * Search groups by name
   */
  async searchGroups(query: string, workspaceId?: string): Promise<ApiResponse<Group[]>> {
    return this.listGroups({
      search: query,
      workspaceId,
      sort: 'name:asc',
    })
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: CreateGroupRequest): Promise<ApiResponse<Group>> {
    return this.client.post<Group>('/group', groupData)
  }

  /**
   * Update an existing group
   */
  async updateGroup(groupData: UpdateGroupRequest): Promise<ApiResponse<Group>> {
    return this.client.put<Group>('/group', groupData)
  }

  /**
   * Delete a group and all its children
   */
  async deleteGroup(groupData: DeleteGroupRequest): Promise<ApiResponse<DeleteGroupResponse>> {
    return this.client.delete<DeleteGroupResponse>('/group', groupData)
  }

  /**
   * Get the full path of a group (from root to the group)
   */
  async getGroupPath(groupId: string, workspaceId: string): Promise<string[]> {
    const allGroups = await this.getAllGroupsInWorkspace(workspaceId)
    const groupMap = new Map(allGroups.map((g) => [g.id, g]))

    const path: string[] = []
    let currentGroup = groupMap.get(groupId)

    while (currentGroup) {
      path.unshift(currentGroup.name)
      currentGroup = currentGroup.parentId ? groupMap.get(currentGroup.parentId) : undefined
    }

    return path
  }

  /**
   * Build a hierarchical tree of groups
   */
  async getGroupTree(workspaceId: string): Promise<GroupTreeNode[]> {
    const allGroups = await this.getAllGroupsInWorkspace(workspaceId)
    return this.buildGroupTree(allGroups)
  }

  /**
   * Helper method to build a tree structure from flat group list
   */
  private buildGroupTree(groups: Group[]): GroupTreeNode[] {
    const groupMap = new Map<string, GroupTreeNode>()
    const rootGroups: GroupTreeNode[] = []

    // Create nodes for all groups
    groups.forEach((group) => {
      groupMap.set(group.id, {
        ...group,
        children: [],
        level: 0,
        path: [],
      })
    })

    // Build the tree structure
    groups.forEach((group) => {
      const node = groupMap.get(group.id)!

      if (group.parentId) {
        const parent = groupMap.get(group.parentId)
        if (parent) {
          parent.children.push(node)
          node.level = parent.level + 1
          node.path = [...parent.path, parent.name]
        }
      } else {
        rootGroups.push(node)
      }
    })

    // Sort children recursively
    const sortChildren = (nodes: GroupTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach((node) => sortChildren(node.children))
    }

    sortChildren(rootGroups)
    return rootGroups
  }

  /**
   * Move a group to a new parent (or to root level)
   */
  async moveGroup(groupId: string, newParentId?: string): Promise<ApiResponse<Group>> {
    return this.updateGroup({
      groupId,
      parentId: newParentId || null,
    })
  }

  /**
   * Rename a group
   */
  async renameGroup(groupId: string, newName: string): Promise<ApiResponse<Group>> {
    return this.updateGroup({
      groupId,
      name: newName,
    })
  }

  /**
   * Create a nested group path (creates parent groups if they don't exist)
   */
  async createGroupPath(path: string[], workspaceId?: string): Promise<ApiResponse<Group[]>> {
    const createdGroups: Group[] = []
    let currentParentId: string | undefined = undefined

    for (const groupName of path) {
      // Check if group already exists at this level
      const existingGroupsResponse = await this.listGroups({
        workspaceId,
        parentId: currentParentId,
      })

      if (!this.client.isSuccessResponse(existingGroupsResponse)) {
        return existingGroupsResponse
      }

      let existingGroup = existingGroupsResponse.data.find((g) => g.name === groupName)

      if (!existingGroup) {
        // Create the group
        const createResponse = await this.createGroup({
          name: groupName,
          workspaceId,
          parentId: currentParentId,
        })

        if (!this.client.isSuccessResponse(createResponse)) {
          return createResponse
        }

        existingGroup = createResponse.data
      }

      createdGroups.push(existingGroup)
      currentParentId = existingGroup.id
    }

    return {
      success: true,
      data: createdGroups,
    }
  }
}

// Helper interface for building group trees
export interface GroupTreeNode extends Group {
  children: GroupTreeNode[]
  level: number
  path: string[] // Path from root to parent
}
