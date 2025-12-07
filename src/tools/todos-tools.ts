import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { TodosApi } from '../api/todos.js'
import { SidvyApiClient } from '../api/client.js'

export class TodosTools {
  constructor(
    private todosApi: TodosApi,
    private client: SidvyApiClient,
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'list_todos',
        description: 'List todos with filtering options (by completion status, note, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Filter by workspace ID' },
            noteId: { type: 'string', description: 'Filter by note ID' },
            completed: { type: 'boolean', description: 'Filter by completion status' },
            isDeleted: { type: 'boolean', description: 'Include deleted todos (default: false)' },
            search: { type: 'string', description: 'Search todos by text' },
            sort: {
              type: 'string',
              enum: [
                'text:asc',
                'text:desc',
                'completed:asc',
                'completed:desc',
                'createdAt:asc',
                'createdAt:desc',
                'updatedAt:asc',
                'updatedAt:desc',
                'completedAt:asc',
                'completedAt:desc',
              ],
              description: 'Sort order for results',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Number of todos to return',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'create_todo',
        description: 'Create a new todo associated with a note',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'Todo text/description',
            },
            noteId: { type: 'string', description: 'ID of the note this todo belongs to' },
            lineNumber: {
              type: 'number',
              minimum: 1,
              description: 'Line number in the note where this todo appears',
            },
            completed: {
              type: 'boolean',
              description: 'Initial completion status (default: false)',
            },
            workspaceId: { type: 'string', description: 'Workspace ID (optional, uses default)' },
          },
          required: ['text', 'noteId', 'lineNumber'],
          additionalProperties: false,
        },
      },
      {
        name: 'update_todo',
        description: "Update a todo's text, completion status, or line number",
        inputSchema: {
          type: 'object',
          properties: {
            todoId: { type: 'string', description: 'Todo ID to update' },
            text: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'New todo text/description',
            },
            completed: { type: 'boolean', description: 'Completion status' },
            lineNumber: { type: 'number', minimum: 1, description: 'New line number in the note' },
          },
          required: ['todoId'],
          additionalProperties: false,
        },
      },
      {
        name: 'delete_todo',
        description: 'Delete a todo (soft delete)',
        inputSchema: {
          type: 'object',
          properties: {
            todoId: { type: 'string', description: 'Todo ID to delete' },
          },
          required: ['todoId'],
          additionalProperties: false,
        },
      },
      {
        name: 'toggle_todo',
        description: "Toggle a todo's completion status (complete <-> incomplete)",
        inputSchema: {
          type: 'object',
          properties: {
            todoId: { type: 'string', description: 'Todo ID to toggle' },
          },
          required: ['todoId'],
          additionalProperties: false,
        },
      },
      {
        name: 'complete_todo',
        description: 'Mark a todo as completed',
        inputSchema: {
          type: 'object',
          properties: {
            todoId: { type: 'string', description: 'Todo ID to complete' },
          },
          required: ['todoId'],
          additionalProperties: false,
        },
      },
      {
        name: 'uncomplete_todo',
        description: 'Mark a todo as incomplete',
        inputSchema: {
          type: 'object',
          properties: {
            todoId: { type: 'string', description: 'Todo ID to mark as incomplete' },
          },
          required: ['todoId'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_pending_todos',
        description: 'Get all incomplete/pending todos',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace to get todos from (optional)' },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Number of todos to return',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_completed_todos',
        description: 'Get all completed todos',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace to get todos from (optional)' },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Number of todos to return',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_todos_for_note',
        description: 'Get all todos associated with a specific note',
        inputSchema: {
          type: 'object',
          properties: {
            noteId: { type: 'string', description: 'Note ID to get todos for' },
            workspaceId: { type: 'string', description: 'Workspace to search in (optional)' },
          },
          required: ['noteId'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_todo_stats',
        description: 'Get statistics about todos (total, completed, pending, completion rate)',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace to get stats from (optional)' },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'search_todos',
        description: 'Search todos by text content',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', minLength: 1, description: 'Search query' },
            workspaceId: { type: 'string', description: 'Workspace to search in (optional)' },
          },
          required: ['query'],
          additionalProperties: false,
        },
      },
      {
        name: 'create_todos_for_note',
        description: 'Create multiple todos for a note at once',
        inputSchema: {
          type: 'object',
          properties: {
            noteId: { type: 'string', description: 'Note ID to create todos for' },
            todoTexts: {
              type: 'array',
              items: { type: 'string', minLength: 1, maxLength: 500 },
              description: 'Array of todo text strings',
            },
            startingLineNumber: {
              type: 'number',
              minimum: 1,
              description: 'Starting line number (default: 1)',
            },
            workspaceId: { type: 'string', description: 'Workspace ID (optional)' },
          },
          required: ['noteId', 'todoTexts'],
          additionalProperties: false,
        },
      },
    ]
  }

  async handleToolCall(name: string, arguments_: any): Promise<any> {
    switch (name) {
      case 'list_todos':
        return this.handleListTodos(arguments_)
      case 'create_todo':
        return this.handleCreateTodo(arguments_)
      case 'update_todo':
        return this.handleUpdateTodo(arguments_)
      case 'delete_todo':
        return this.handleDeleteTodo(arguments_)
      case 'toggle_todo':
        return this.handleToggleTodo(arguments_)
      case 'complete_todo':
        return this.handleCompleteTodo(arguments_)
      case 'uncomplete_todo':
        return this.handleUncompleteTodo(arguments_)
      case 'get_pending_todos':
        return this.handleGetPendingTodos(arguments_)
      case 'get_completed_todos':
        return this.handleGetCompletedTodos(arguments_)
      case 'get_todos_for_note':
        return this.handleGetTodosForNote(arguments_)
      case 'get_todo_stats':
        return this.handleGetTodoStats(arguments_)
      case 'search_todos':
        return this.handleSearchTodos(arguments_)
      case 'create_todos_for_note':
        return this.handleCreateTodosForNote(arguments_)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  private async handleListTodos(args: any) {
    const response = await this.todosApi.listTodos(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todos: response.data,
        pagination: response.meta?.pagination,
        count: response.meta?.count,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCreateTodo(args: any) {
    const response = await this.todosApi.createTodo(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todo: response.data,
        message: `Todo "${response.data.text}" created successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUpdateTodo(args: any) {
    const response = await this.todosApi.updateTodo(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todo: response.data,
        message: `Todo "${response.data.text}" updated successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleDeleteTodo(args: any) {
    const response = await this.todosApi.deleteTodo(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        deleted: response.data.deleted,
        todoId: response.data.todoId,
        softDeleted: response.data.softDeleted,
        message: 'Todo deleted successfully',
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleToggleTodo(args: any) {
    const response = await this.todosApi.toggleTodo(args.todoId)

    if (this.client.isSuccessResponse(response)) {
      const status = response.data.completed ? 'completed' : 'incomplete'
      return {
        success: true,
        todo: response.data,
        message: `Todo "${response.data.text}" marked as ${status}`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCompleteTodo(args: any) {
    const response = await this.todosApi.completeTodo(args.todoId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todo: response.data,
        message: `Todo "${response.data.text}" marked as completed`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUncompleteTodo(args: any) {
    const response = await this.todosApi.uncompleteTodo(args.todoId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todo: response.data,
        message: `Todo "${response.data.text}" marked as incomplete`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetPendingTodos(args: any) {
    const response = await this.todosApi.getPendingTodos(args.workspaceId, args.limit)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todos: response.data,
        count: response.data.length,
        type: 'pending',
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetCompletedTodos(args: any) {
    const response = await this.todosApi.getCompletedTodos(args.workspaceId, args.limit)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todos: response.data,
        count: response.data.length,
        type: 'completed',
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetTodosForNote(args: any) {
    const response = await this.todosApi.getTodosForNote(args.noteId, args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todos: response.data,
        noteId: args.noteId,
        count: response.data.length,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetTodoStats(args: any) {
    try {
      const stats = await this.todosApi.getTodoStats(args.workspaceId)

      return {
        success: true,
        stats,
        message: `Todo statistics: ${stats.completed}/${stats.total} completed (${stats.completionRate.toFixed(1)}%)`,
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  private async handleSearchTodos(args: any) {
    const response = await this.todosApi.searchTodos(args.query, args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        todos: response.data,
        query: args.query,
        count: response.data.length,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCreateTodosForNote(args: any) {
    try {
      const responses = await this.todosApi.createTodosForNote(
        args.noteId,
        args.todoTexts,
        args.workspaceId,
        args.startingLineNumber || 1,
      )

      const successful = responses.filter((r) => this.client.isSuccessResponse(r))
      const failed = responses.filter((r) => !this.client.isSuccessResponse(r))

      return {
        success: true,
        todos: successful.map((r) => (r as any).data),
        created: successful.length,
        failed: failed.length,
        message: `Created ${successful.length} todos for note (${failed.length} failed)`,
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
