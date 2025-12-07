import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { NotesApi } from '../api/notes.js'
import { SidvyApiClient } from '../api/client.js'

export class NotesTools {
  constructor(
    private notesApi: NotesApi,
    private client: SidvyApiClient,
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'list_notes',
        description: 'List notes with optional filtering and search capabilities',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Filter by workspace ID' },
            groupId: { type: 'string', description: 'Filter by group ID' },
            search: { type: 'string', description: 'Search notes by name or content' },
            isDeleted: { type: 'boolean', description: 'Include deleted notes (default: false)' },
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
              description: 'Number of notes to return',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'create_note',
        description: 'Create a new note with markdown content',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 200, description: 'Note title/name' },
            content: { type: 'string', description: 'Note content in markdown format' },
            workspaceId: {
              type: 'string',
              description: 'Workspace to create note in (optional, uses default)',
            },
            groupId: { type: 'string', description: 'Group to organize note under (optional)' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      {
        name: 'update_note',
        description: "Update an existing note's content or metadata",
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Note ID to update' },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'New note title/name',
            },
            content: { type: 'string', description: 'New note content in markdown format' },
            groupId: { type: 'string', description: 'Move note to different group (can be null)' },
          },
          required: ['id'],
          additionalProperties: false,
        },
      },
      {
        name: 'delete_note',
        description: 'Delete a note (moves to trash)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Note ID to delete' },
          },
          required: ['id'],
          additionalProperties: false,
        },
      },
      {
        name: 'search_notes',
        description: 'Search notes by content or title with full-text search',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', minLength: 1, description: 'Search query' },
            workspaceId: { type: 'string', description: 'Workspace to search in (optional)' },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Number of results to return',
            },
          },
          required: ['query'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_note',
        description: 'Get a specific note by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Note ID to retrieve' },
            workspaceId: { type: 'string', description: 'Workspace to search in (optional)' },
          },
          required: ['id'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_recent_notes',
        description: 'Get recently updated notes',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'Workspace to get notes from (optional)' },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 50,
              description: 'Number of notes to return (default: 10)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'append_to_note',
        description: 'Append content to an existing note',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Note ID to append to' },
            content: { type: 'string', description: 'Content to append' },
            workspaceId: { type: 'string', description: 'Workspace to search note in (optional)' },
          },
          required: ['id', 'content'],
          additionalProperties: false,
        },
      },
    ]
  }

  async handleToolCall(name: string, arguments_: any): Promise<any> {
    switch (name) {
      case 'list_notes':
        return this.handleListNotes(arguments_)
      case 'create_note':
        return this.handleCreateNote(arguments_)
      case 'update_note':
        return this.handleUpdateNote(arguments_)
      case 'delete_note':
        return this.handleDeleteNote(arguments_)
      case 'search_notes':
        return this.handleSearchNotes(arguments_)
      case 'get_note':
        return this.handleGetNote(arguments_)
      case 'get_recent_notes':
        return this.handleGetRecentNotes(arguments_)
      case 'append_to_note':
        return this.handleAppendToNote(arguments_)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  private async handleListNotes(args: any) {
    const response = await this.notesApi.listNotes(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        notes: response.data,
        pagination: response.meta?.pagination,
        count: response.meta?.count,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleCreateNote(args: any) {
    const response = await this.notesApi.createNote(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        message: `Note "${response.data.name}" created successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUpdateNote(args: any) {
    const response = await this.notesApi.updateNote(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        message: `Note "${response.data.name}" updated successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleDeleteNote(args: any) {
    const response = await this.notesApi.deleteNote(args)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        deleted: response.data.deleted,
        noteId: response.data.noteId,
        movedToTrash: response.data.movedToTrash,
        message: 'Note moved to trash successfully',
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleSearchNotes(args: any) {
    const response = await this.notesApi.searchNotes(args.query, args.workspaceId, args.limit || 20)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        notes: response.data,
        query: args.query,
        count: response.data.length,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetNote(args: any) {
    const response = await this.notesApi.getNoteById(args.id, args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      if (response.data) {
        return {
          success: true,
          note: response.data,
        }
      } else {
        return {
          success: false,
          error: 'Note not found',
        }
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetRecentNotes(args: any) {
    const response = await this.notesApi.getRecentNotes(args.workspaceId, args.limit || 10)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        notes: response.data,
        count: response.data.length,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleAppendToNote(args: any) {
    const response = await this.notesApi.appendToNote(args.id, args.content, args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        message: `Content appended to note "${response.data.name}"`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }
}
