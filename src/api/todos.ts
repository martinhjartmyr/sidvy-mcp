import { SidvyApiClient } from './client.js'
import {
  Todo,
  ApiResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  DeleteTodoRequest,
  DeleteTodoResponse,
  ListTodosParams,
} from '../types.js'

export class TodosApi {
  constructor(private client: SidvyApiClient) {}

  /**
   * List todos with optional filtering and pagination
   */
  async listTodos(params: ListTodosParams = {}): Promise<ApiResponse<Todo[]>> {
    const queryParams: Record<string, any> = {}

    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.workspaceId !== undefined) queryParams.workspaceId = params.workspaceId
    if (params.noteId !== undefined) queryParams.noteId = params.noteId
    if (params.completed !== undefined) queryParams.completed = params.completed
    if (params.isDeleted !== undefined) queryParams.isDeleted = params.isDeleted
    if (params.search !== undefined) queryParams.search = params.search
    if (params.sort !== undefined) queryParams.sort = params.sort

    return this.client.get<Todo[]>('/todo', queryParams)
  }

  /**
   * Get todos for a specific note
   */
  async getTodosForNote(noteId: string, workspaceId?: string): Promise<ApiResponse<Todo[]>> {
    return this.listTodos({
      noteId,
      workspaceId,
      sort: 'createdAt:asc',
    })
  }

  /**
   * Get pending (incomplete) todos
   */
  async getPendingTodos(workspaceId?: string, limit?: number): Promise<ApiResponse<Todo[]>> {
    return this.listTodos({
      workspaceId,
      completed: false,
      limit,
      sort: 'createdAt:desc',
    })
  }

  /**
   * Get completed todos
   */
  async getCompletedTodos(workspaceId?: string, limit?: number): Promise<ApiResponse<Todo[]>> {
    return this.listTodos({
      workspaceId,
      completed: true,
      limit,
      sort: 'completedAt:desc',
    })
  }

  /**
   * Get recently completed todos
   */
  async getRecentlyCompleted(
    workspaceId?: string,
    limit: number = 10,
  ): Promise<ApiResponse<Todo[]>> {
    return this.getCompletedTodos(workspaceId, limit)
  }

  /**
   * Search todos by text
   */
  async searchTodos(query: string, workspaceId?: string): Promise<ApiResponse<Todo[]>> {
    return this.listTodos({
      search: query,
      workspaceId,
      sort: 'updatedAt:desc',
    })
  }

  /**
   * Get a specific todo by ID
   */
  async getTodoById(todoId: string, workspaceId?: string): Promise<ApiResponse<Todo | null>> {
    const response = await this.listTodos({
      workspaceId,
      limit: 100,
    })

    if (!this.client.isSuccessResponse(response)) {
      return response
    }

    const todo = response.data.find((t) => t.id === todoId)
    return {
      success: true,
      data: todo || null,
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(todoData: CreateTodoRequest): Promise<ApiResponse<Todo>> {
    return this.client.post<Todo>('/todo', todoData)
  }

  /**
   * Update an existing todo
   */
  async updateTodo(todoData: UpdateTodoRequest): Promise<ApiResponse<Todo>> {
    return this.client.put<Todo>('/todo', todoData)
  }

  /**
   * Delete a todo (soft delete)
   */
  async deleteTodo(todoData: DeleteTodoRequest): Promise<ApiResponse<DeleteTodoResponse>> {
    return this.client.delete<DeleteTodoResponse>('/todo', todoData)
  }

  /**
   * Toggle todo completion status
   */
  async toggleTodo(todoId: string): Promise<ApiResponse<Todo>> {
    const todoResponse = await this.getTodoById(todoId)

    if (!this.client.isSuccessResponse(todoResponse) || !todoResponse.data) {
      return todoResponse as ApiResponse<Todo>
    }

    const todo = todoResponse.data
    return this.updateTodo({
      todoId,
      completed: !todo.completed,
    })
  }

  /**
   * Mark todo as completed
   */
  async completeTodo(todoId: string): Promise<ApiResponse<Todo>> {
    return this.updateTodo({
      todoId,
      completed: true,
    })
  }

  /**
   * Mark todo as incomplete
   */
  async uncompleteTodo(todoId: string): Promise<ApiResponse<Todo>> {
    return this.updateTodo({
      todoId,
      completed: false,
    })
  }

  /**
   * Update todo text
   */
  async updateTodoText(todoId: string, newText: string): Promise<ApiResponse<Todo>> {
    return this.updateTodo({
      todoId,
      text: newText,
    })
  }

  /**
   * Move todo to different line in note
   */
  async moveTodo(todoId: string, newLineNumber: number): Promise<ApiResponse<Todo>> {
    return this.updateTodo({
      todoId,
      lineNumber: newLineNumber,
    })
  }

  /**
   * Get all todos in a workspace
   */
  async getAllTodosInWorkspace(
    workspaceId: string,
    includeDeleted: boolean = false,
    includeCompleted: boolean = true,
  ): Promise<Todo[]> {
    const allTodos: Todo[] = []
    let page = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const params: ListTodosParams = {
        workspaceId,
        isDeleted: includeDeleted,
        page,
        limit,
        sort: 'createdAt:desc',
      }

      // If we don't want completed todos, filter them out
      if (!includeCompleted) {
        params.completed = false
      }

      const response = await this.listTodos(params)

      if (!this.client.isSuccessResponse(response)) {
        throw new Error(this.client.getErrorMessage(response))
      }

      allTodos.push(...response.data)

      // Check if there are more pages
      if (response.meta?.pagination) {
        hasMore = page < response.meta.pagination.totalPages
        page++
      } else {
        hasMore = response.data.length === limit
        page++
      }
    }

    return allTodos
  }

  /**
   * Get todo statistics for a workspace
   */
  async getTodoStats(workspaceId?: string): Promise<TodoStats> {
    const response = await this.listTodos({
      workspaceId,
      limit: 1000, // Get a large number to calculate stats
    })

    if (!this.client.isSuccessResponse(response)) {
      throw new Error(this.client.getErrorMessage(response))
    }

    const todos = response.data
    const completed = todos.filter((t) => t.completed).length
    const pending = todos.filter((t) => !t.completed).length
    const deleted = todos.filter((t) => t.isDeleted).length

    return {
      total: todos.length,
      completed,
      pending,
      deleted,
      completionRate: todos.length > 0 ? (completed / (completed + pending)) * 100 : 0,
    }
  }

  /**
   * Create multiple todos for a note (bulk operation)
   */
  async createTodosForNote(
    noteId: string,
    todoTexts: string[],
    workspaceId?: string,
    startingLineNumber: number = 1,
  ): Promise<ApiResponse<Todo>[]> {
    const results: ApiResponse<Todo>[] = []

    for (let i = 0; i < todoTexts.length; i++) {
      const result = await this.createTodo({
        text: todoTexts[i],
        noteId,
        lineNumber: startingLineNumber + i,
        workspaceId,
        completed: false,
      })
      results.push(result)
    }

    return results
  }

  /**
   * Get deleted todos
   */
  async getDeletedTodos(workspaceId?: string): Promise<ApiResponse<Todo[]>> {
    return this.listTodos({
      workspaceId,
      isDeleted: true,
      sort: 'updatedAt:desc',
    })
  }

  /**
   * Get overdue todos (this would need additional date logic based on your needs)
   */
  async getTodosByNote(noteId: string, workspaceId?: string): Promise<ApiResponse<Todo[]>> {
    return this.getTodosForNote(noteId, workspaceId)
  }
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  deleted: number
  completionRate: number // Percentage
}
