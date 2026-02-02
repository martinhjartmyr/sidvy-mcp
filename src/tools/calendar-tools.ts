import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { CalendarApi } from '../api/calendar.js'
import { SidvyApiClient } from '../api/client.js'

export class CalendarTools {
  constructor(
    private calendarApi: CalendarApi,
    private client: SidvyApiClient,
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'get_daily_note',
        description:
          "Get today's daily note or a specific date's note. Creates the note automatically if it doesn't exist, using the workspace's default daily template.",
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Date in YYYY-MM-DD format (defaults to today)',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default workspace)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'update_daily_note',
        description:
          "Update the content of today's daily note or a specific date's note. Creates the note first if it doesn't exist.",
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'New note content in markdown format',
            },
            date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Date in YYYY-MM-DD format (defaults to today)',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default workspace)',
            },
          },
          required: ['content'],
          additionalProperties: false,
        },
      },
      {
        name: 'append_to_daily_note',
        description:
          "Append content to today's daily note or a specific date's note. Creates the note first if it doesn't exist.",
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to append in markdown format',
            },
            date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Date in YYYY-MM-DD format (defaults to today)',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default workspace)',
            },
          },
          required: ['content'],
          additionalProperties: false,
        },
      },
      {
        name: 'get_weekly_note',
        description:
          "Get the current week's note or a specific week's note. Creates the note automatically if it doesn't exist, using the workspace's default weekly template.",
        inputSchema: {
          type: 'object',
          properties: {
            week: {
              type: 'number',
              minimum: 1,
              maximum: 53,
              description: 'ISO week number (1-53). Must be provided with year.',
            },
            year: {
              type: 'number',
              minimum: 1970,
              maximum: 2100,
              description: 'ISO week-numbering year. Must be provided with week.',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default workspace)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'update_weekly_note',
        description:
          "Update the content of the current week's note or a specific week's note. Creates the note first if it doesn't exist.",
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'New note content in markdown format',
            },
            week: {
              type: 'number',
              minimum: 1,
              maximum: 53,
              description: 'ISO week number (1-53). Must be provided with year.',
            },
            year: {
              type: 'number',
              minimum: 1970,
              maximum: 2100,
              description: 'ISO week-numbering year. Must be provided with week.',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default workspace)',
            },
          },
          required: ['content'],
          additionalProperties: false,
        },
      },
      {
        name: 'append_to_weekly_note',
        description:
          "Append content to the current week's note or a specific week's note. Creates the note first if it doesn't exist.",
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Content to append in markdown format',
            },
            week: {
              type: 'number',
              minimum: 1,
              maximum: 53,
              description: 'ISO week number (1-53). Must be provided with year.',
            },
            year: {
              type: 'number',
              minimum: 1970,
              maximum: 2100,
              description: 'ISO week-numbering year. Must be provided with week.',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID (optional, uses default workspace)',
            },
          },
          required: ['content'],
          additionalProperties: false,
        },
      },
    ]
  }

  async handleToolCall(name: string, arguments_: any): Promise<any> {
    switch (name) {
      case 'get_daily_note':
        return this.handleGetDailyNote(arguments_)
      case 'update_daily_note':
        return this.handleUpdateDailyNote(arguments_)
      case 'append_to_daily_note':
        return this.handleAppendToDailyNote(arguments_)
      case 'get_weekly_note':
        return this.handleGetWeeklyNote(arguments_)
      case 'update_weekly_note':
        return this.handleUpdateWeeklyNote(arguments_)
      case 'append_to_weekly_note':
        return this.handleAppendToWeeklyNote(arguments_)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  private async handleGetDailyNote(args: any) {
    const response = args.date
      ? await this.calendarApi.getDailyNoteByDate(args.date, args.workspaceId)
      : await this.calendarApi.getDailyNote(args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        date: args.date || new Date().toISOString().split('T')[0],
        message: `Daily note for ${args.date || 'today'} retrieved successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUpdateDailyNote(args: any) {
    const response = await this.calendarApi.updateDailyNote({
      content: args.content,
      workspaceId: args.workspaceId,
      date: args.date,
    })

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        date: args.date || new Date().toISOString().split('T')[0],
        message: `Daily note for ${args.date || 'today'} updated successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleAppendToDailyNote(args: any) {
    const response = await this.calendarApi.appendToDailyNote(
      args.content,
      args.workspaceId,
      args.date,
    )

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        date: args.date || new Date().toISOString().split('T')[0],
        message: `Content appended to daily note for ${args.date || 'today'}`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleGetWeeklyNote(args: any) {
    // Validate week/year combination
    if ((args.week !== undefined) !== (args.year !== undefined)) {
      throw new Error('Both week and year must be provided together, or neither')
    }

    const response =
      args.week !== undefined
        ? await this.calendarApi.getWeeklyNoteByWeek(args.week, args.year, args.workspaceId)
        : await this.calendarApi.getWeeklyNote(args.workspaceId)

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        week: args.week || this.getCurrentISOWeek(),
        year: args.year || this.getCurrentISOYear(),
        message: `Weekly note retrieved successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleUpdateWeeklyNote(args: any) {
    // Validate week/year combination
    if ((args.week !== undefined) !== (args.year !== undefined)) {
      throw new Error('Both week and year must be provided together, or neither')
    }

    const response = await this.calendarApi.updateWeeklyNote({
      content: args.content,
      workspaceId: args.workspaceId,
      week: args.week,
      year: args.year,
    })

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        week: args.week || this.getCurrentISOWeek(),
        year: args.year || this.getCurrentISOYear(),
        message: `Weekly note updated successfully`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  private async handleAppendToWeeklyNote(args: any) {
    // Validate week/year combination
    if ((args.week !== undefined) !== (args.year !== undefined)) {
      throw new Error('Both week and year must be provided together, or neither')
    }

    const response = await this.calendarApi.appendToWeeklyNote(
      args.content,
      args.workspaceId,
      args.week,
      args.year,
    )

    if (this.client.isSuccessResponse(response)) {
      return {
        success: true,
        note: response.data,
        week: args.week || this.getCurrentISOWeek(),
        year: args.year || this.getCurrentISOYear(),
        message: `Content appended to weekly note`,
      }
    } else {
      throw new Error(this.client.getErrorMessage(response))
    }
  }

  // Helper: Get current ISO week number
  private getCurrentISOWeek(): number {
    const date = new Date()
    const target = new Date(date.valueOf())
    const dayNr = (date.getDay() + 6) % 7
    target.setDate(target.getDate() - dayNr + 3)
    const firstThursday = target.valueOf()
    target.setMonth(0, 1)
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  }

  // Helper: Get current ISO week-numbering year
  private getCurrentISOYear(): number {
    const date = new Date()
    const target = new Date(date.valueOf())
    const dayNr = (date.getDay() + 6) % 7
    target.setDate(target.getDate() - dayNr + 3)
    return target.getFullYear()
  }
}
