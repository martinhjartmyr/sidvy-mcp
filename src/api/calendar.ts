import { SidvyApiClient } from './client.js'
import { Note, ApiResponse, UpdateDailyNoteRequest, UpdateWeeklyNoteRequest } from '../types.js'

export class CalendarApi {
  constructor(private client: SidvyApiClient) {}

  /**
   * Get today's daily note (creates if doesn't exist)
   */
  async getDailyNote(workspaceId?: string): Promise<ApiResponse<Note>> {
    const params: Record<string, any> = {}
    if (workspaceId) params.workspaceId = workspaceId
    return this.client.get<Note>('/daily', params)
  }

  /**
   * Get a specific daily note by date (creates if doesn't exist)
   * @param date Date in YYYY-MM-DD format
   */
  async getDailyNoteByDate(date: string, workspaceId?: string): Promise<ApiResponse<Note>> {
    const params: Record<string, any> = { date }
    if (workspaceId) params.workspaceId = workspaceId
    return this.client.get<Note>('/daily', params)
  }

  /**
   * Update today's daily note content
   */
  async updateDailyNote(request: UpdateDailyNoteRequest): Promise<ApiResponse<Note>> {
    return this.client.put<Note>('/daily', request)
  }

  /**
   * Get current week's note (creates if doesn't exist)
   */
  async getWeeklyNote(workspaceId?: string): Promise<ApiResponse<Note>> {
    const params: Record<string, any> = {}
    if (workspaceId) params.workspaceId = workspaceId
    return this.client.get<Note>('/weekly', params)
  }

  /**
   * Get a specific weekly note by week and year (creates if doesn't exist)
   * @param week ISO week number (1-53)
   * @param year ISO week-numbering year
   */
  async getWeeklyNoteByWeek(
    week: number,
    year: number,
    workspaceId?: string,
  ): Promise<ApiResponse<Note>> {
    const params: Record<string, any> = { week, year }
    if (workspaceId) params.workspaceId = workspaceId
    return this.client.get<Note>('/weekly', params)
  }

  /**
   * Update current week's note content
   */
  async updateWeeklyNote(request: UpdateWeeklyNoteRequest): Promise<ApiResponse<Note>> {
    return this.client.put<Note>('/weekly', request)
  }

  /**
   * Append content to today's daily note
   */
  async appendToDailyNote(
    content: string,
    workspaceId?: string,
    date?: string,
  ): Promise<ApiResponse<Note>> {
    // First get the current daily note
    const currentNote = date
      ? await this.getDailyNoteByDate(date, workspaceId)
      : await this.getDailyNote(workspaceId)

    if (!this.client.isSuccessResponse(currentNote)) {
      return currentNote
    }

    // Append content
    const updatedContent = currentNote.data.content
      ? currentNote.data.content + '\n\n' + content
      : content

    return this.updateDailyNote({
      content: updatedContent,
      workspaceId,
      date,
    })
  }

  /**
   * Append content to current week's note
   */
  async appendToWeeklyNote(
    content: string,
    workspaceId?: string,
    week?: number,
    year?: number,
  ): Promise<ApiResponse<Note>> {
    // First get the current weekly note
    const currentNote =
      week !== undefined && year !== undefined
        ? await this.getWeeklyNoteByWeek(week, year, workspaceId)
        : await this.getWeeklyNote(workspaceId)

    if (!this.client.isSuccessResponse(currentNote)) {
      return currentNote
    }

    // Append content
    const updatedContent = currentNote.data.content
      ? currentNote.data.content + '\n\n' + content
      : content

    return this.updateWeeklyNote({
      content: updatedContent,
      workspaceId,
      week,
      year,
    })
  }
}
