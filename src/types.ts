// Type definitions based on swagger.json for Sidvy API

export interface ApiError {
  success: false
  error: {
    code:
      | 'UNAUTHORIZED'
      | 'VALIDATION_ERROR'
      | 'NOT_FOUND'
      | 'FORBIDDEN'
      | 'INTERNAL_ERROR'
      | 'MALFORMED_REQUEST'
      | 'HTTP_ERROR'
      | 'NETWORK_ERROR'
    message: string
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    pagination?: Pagination
    count?: number
    filters?: Record<string, any>
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiError

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface User {
  id: string
  name?: string | null
  email: string
  status: number
}

export interface Workspace {
  id: string
  name: string
  userId: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  contentCounts?: {
    notes: number
    groups: number
    todos: number
  }
}

export interface Note {
  id: string
  name: string
  content: string
  userId: string
  workspaceId: string
  groupId?: string | null
  isDeleted: boolean
  deletedAt?: string | null
  deletedBy?: string | null
  isEncrypted: boolean
  encryptionMetadata?: any | null
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  userId: string
  workspaceId: string
  parentId?: string | null
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  completedAt?: string | null
  userId: string
  workspaceId: string
  noteId: string
  lineNumber: number
  isDeleted: boolean
  deletedAt?: string | null
  deletedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionInfo {
  user?: {
    id: string
  }
  session?: any
  authenticated: boolean
}

// Request payload types
export interface CreateNoteRequest {
  name: string
  content?: string
  workspaceId?: string
  groupId?: string | null
}

export interface UpdateNoteRequest {
  id: string
  name?: string
  content?: string
  groupId?: string | null
}

export interface DeleteNoteRequest {
  id: string
}

export interface CreateGroupRequest {
  name: string
  workspaceId?: string
  parentId?: string | null
}

export interface UpdateGroupRequest {
  groupId: string
  name?: string
  parentId?: string | null
}

export interface DeleteGroupRequest {
  groupId: string
}

export interface CreateTodoRequest {
  text: string
  noteId: string
  lineNumber: number
  completed?: boolean
  workspaceId?: string
}

export interface UpdateTodoRequest {
  todoId: string
  text?: string
  completed?: boolean
  lineNumber?: number
}

export interface DeleteTodoRequest {
  todoId: string
}

export interface CreateWorkspaceRequest {
  name: string
}

export interface UpdateWorkspaceRequest {
  workspaceId: string
  name?: string
}

export interface DeleteWorkspaceRequest {
  workspaceId: string
}

// Query parameter types
export interface ListNotesParams {
  page?: number
  limit?: number
  workspaceId?: string
  groupId?: string
  isDeleted?: boolean
  search?: string
  sort?:
    | 'name:asc'
    | 'name:desc'
    | 'createdAt:asc'
    | 'createdAt:desc'
    | 'updatedAt:asc'
    | 'updatedAt:desc'
}

export interface ListGroupsParams {
  page?: number
  limit?: number
  workspaceId?: string
  parentId?: string
  search?: string
  sort?:
    | 'name:asc'
    | 'name:desc'
    | 'createdAt:asc'
    | 'createdAt:desc'
    | 'updatedAt:asc'
    | 'updatedAt:desc'
}

export interface ListTodosParams {
  page?: number
  limit?: number
  workspaceId?: string
  noteId?: string
  completed?: boolean
  isDeleted?: boolean
  search?: string
  sort?:
    | 'text:asc'
    | 'text:desc'
    | 'completed:asc'
    | 'completed:desc'
    | 'createdAt:asc'
    | 'createdAt:desc'
    | 'updatedAt:asc'
    | 'updatedAt:desc'
    | 'completedAt:asc'
    | 'completedAt:desc'
}

export interface ListWorkspacesParams {
  page?: number
  limit?: number
}

// Configuration types
export interface SidvyConfig {
  apiToken: string
  apiUrl: string
  defaultWorkspaceId?: string
  debug?: boolean
}

// Response types for specific operations
export interface DeleteNoteResponse {
  deleted: boolean
  noteId: string
  movedToTrash: boolean
}

export interface DeleteGroupResponse {
  deleted: boolean
  groupId: string
  deletedChildGroups: number
}

export interface DeleteTodoResponse {
  deleted: boolean
  todoId: string
  softDeleted: boolean
}

export interface DeleteWorkspaceResponse {
  deleted: boolean
  workspaceId: string
  deletedContent: {
    notes: number
    groups: number
    todos: number
  }
}
