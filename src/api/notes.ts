import { SidvyApiClient } from './client.js'
import {
  Note,
  ApiResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  DeleteNoteRequest,
  DeleteNoteResponse,
  ListNotesParams,
} from '../types.js'

export class NotesApi {
  constructor(private client: SidvyApiClient) {}

  /**
   * List notes with optional filtering and pagination
   */
  async listNotes(params: ListNotesParams = {}): Promise<ApiResponse<Note[]>> {
    const queryParams: Record<string, any> = {}

    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.workspaceId !== undefined) queryParams.workspaceId = params.workspaceId
    if (params.groupId !== undefined) queryParams.groupId = params.groupId
    if (params.isDeleted !== undefined) queryParams.isDeleted = params.isDeleted
    if (params.search !== undefined) queryParams.search = params.search
    if (params.sort !== undefined) queryParams.sort = params.sort

    return this.client.get<Note[]>('/note', queryParams)
  }

  /**
   * Search notes by content or name
   */
  async searchNotes(
    query: string,
    workspaceId?: string,
    limit: number = 20,
  ): Promise<ApiResponse<Note[]>> {
    return this.listNotes({
      search: query,
      workspaceId,
      limit,
      sort: 'updatedAt:desc',
    })
  }

  /**
   * Get a specific note by ID (via list with search)
   */
  async getNoteById(noteId: string, workspaceId?: string): Promise<ApiResponse<Note | null>> {
    const response = await this.listNotes({
      workspaceId,
      limit: 100, // Get a reasonable number to search through
    })

    if (!this.client.isSuccessResponse(response)) {
      return response
    }

    const note = response.data.find((n) => n.id === noteId)
    return {
      success: true,
      data: note || null,
    }
  }

  /**
   * Get notes by group ID
   */
  async getNotesByGroup(groupId: string, workspaceId?: string): Promise<ApiResponse<Note[]>> {
    return this.listNotes({
      groupId,
      workspaceId,
      sort: 'updatedAt:desc',
    })
  }

  /**
   * Get recent notes (most recently updated)
   */
  async getRecentNotes(workspaceId?: string, limit: number = 10): Promise<ApiResponse<Note[]>> {
    return this.listNotes({
      workspaceId,
      limit,
      sort: 'updatedAt:desc',
    })
  }

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return this.client.post<Note>('/note', noteData)
  }

  /**
   * Update an existing note
   */
  async updateNote(noteData: UpdateNoteRequest): Promise<ApiResponse<Note>> {
    return this.client.put<Note>('/note', noteData)
  }

  /**
   * Delete a note (soft delete - moves to trash)
   */
  async deleteNote(noteData: DeleteNoteRequest): Promise<ApiResponse<DeleteNoteResponse>> {
    return this.client.delete<DeleteNoteResponse>('/note', noteData)
  }

  /**
   * Get deleted notes (notes in trash)
   */
  async getDeletedNotes(workspaceId?: string): Promise<ApiResponse<Note[]>> {
    return this.listNotes({
      workspaceId,
      isDeleted: true,
      sort: 'updatedAt:desc',
    })
  }

  /**
   * Get all notes in a workspace (paginated)
   */
  async getAllNotesInWorkspace(
    workspaceId: string,
    includeDeleted: boolean = false,
  ): Promise<Note[]> {
    const allNotes: Note[] = []
    let page = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const response = await this.listNotes({
        workspaceId,
        isDeleted: includeDeleted,
        page,
        limit,
        sort: 'updatedAt:desc',
      })

      if (!this.client.isSuccessResponse(response)) {
        throw new Error(this.client.getErrorMessage(response))
      }

      allNotes.push(...response.data)

      // Check if there are more pages
      if (response.meta?.pagination) {
        hasMore = page < response.meta.pagination.totalPages
        page++
      } else {
        hasMore = response.data.length === limit
        page++
      }
    }

    return allNotes
  }

  /**
   * Helper method to create a note with markdown content
   */
  async createMarkdownNote(
    title: string,
    content: string,
    workspaceId?: string,
    groupId?: string,
  ): Promise<ApiResponse<Note>> {
    return this.createNote({
      name: title,
      content,
      workspaceId,
      groupId,
    })
  }

  /**
   * Helper method to append content to an existing note
   */
  async appendToNote(
    noteId: string,
    additionalContent: string,
    workspaceId?: string,
  ): Promise<ApiResponse<Note>> {
    const noteResponse = await this.getNoteById(noteId, workspaceId)

    if (!this.client.isSuccessResponse(noteResponse) || !noteResponse.data) {
      return noteResponse as ApiResponse<Note>
    }

    const currentNote = noteResponse.data
    const updatedContent = currentNote.content + '\n\n' + additionalContent

    return this.updateNote({
      id: noteId,
      content: updatedContent,
    })
  }
}
