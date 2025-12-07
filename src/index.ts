#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import API classes and tools
import { createClientFromEnv } from './api/client.js'
import { NotesApi } from './api/notes.js'
import { GroupsApi } from './api/groups.js'
import { TodosApi } from './api/todos.js'
import { WorkspacesApi } from './api/workspaces.js'
import { NotesTools } from './tools/notes-tools.js'
import { GroupsTools } from './tools/groups-tools.js'
import { TodosTools } from './tools/todos-tools.js'
import { WorkspaceTools } from './tools/workspace-tools.js'

class SidvyMcpServer {
  private server: Server
  private client: ReturnType<typeof createClientFromEnv>
  private notesApi: NotesApi
  private groupsApi: GroupsApi
  private todosApi: TodosApi
  private workspacesApi: WorkspacesApi
  private notesTools: NotesTools
  private groupsTools: GroupsTools
  private todosTools: TodosTools
  private workspaceTools: WorkspaceTools
  private allTools: Tool[] = []

  constructor() {
    // Initialize API client
    try {
      this.client = createClientFromEnv()
    } catch (error: any) {
      if (process.env.DEBUG === 'true') {
        console.error('Failed to initialize API client:', error.message)
      }
      process.exit(1)
    }

    // Initialize API instances
    this.notesApi = new NotesApi(this.client)
    this.groupsApi = new GroupsApi(this.client)
    this.todosApi = new TodosApi(this.client)
    this.workspacesApi = new WorkspacesApi(this.client)

    // Initialize tool handlers
    this.notesTools = new NotesTools(this.notesApi, this.client)
    this.groupsTools = new GroupsTools(this.groupsApi, this.client)
    this.todosTools = new TodosTools(this.todosApi, this.client)
    this.workspaceTools = new WorkspaceTools(this.workspacesApi, this.client)

    // Collect all tools
    this.allTools = [
      ...this.notesTools.getTools(),
      ...this.groupsTools.getTools(),
      ...this.todosTools.getTools(),
      ...this.workspaceTools.getTools(),
    ]

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'sidvy-mcp',
        version: '1.0.0',
        description:
          'MCP Server for Sidvy API - A comprehensive note-taking system integration',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // Handle initialization
    this.server.setRequestHandler(InitializeRequestSchema, async () => {
      return {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'sidvy-mcp',
          version: '1.0.0',
        },
      }
    })

    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.allTools,
      }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        // Authentication is validated once at startup, no need to re-validate on each tool call

        // Route to appropriate tool handler
        if (this.notesTools.getTools().some((tool) => tool.name === name)) {
          const result = await this.notesTools.handleToolCall(name, args)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        } else if (this.groupsTools.getTools().some((tool) => tool.name === name)) {
          const result = await this.groupsTools.handleToolCall(name, args)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        } else if (this.todosTools.getTools().some((tool) => tool.name === name)) {
          const result = await this.todosTools.handleToolCall(name, args)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        } else if (this.workspaceTools.getTools().some((tool) => tool.name === name)) {
          const result = await this.workspaceTools.handleToolCall(name, args)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        } else {
          throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error: any) {
        // Log the full error for debugging
        if (process.env.DEBUG === 'true') {
          console.error(`Tool call error for ${name}:`, error)
        }
        
        // Return error as structured content
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: error.message || error.toString() || 'Unknown error occurred',
                  toolName: name,
                  arguments: args,
                  stack: process.env.DEBUG === 'true' ? error.stack : undefined,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
      }
    })
  }

  async run() {
    // Create transport and connect first - don't block on API validation
    const transport = new StdioServerTransport()
    if (process.env.DEBUG === 'true') {
      console.error(`🚀 Sidvy MCP Server starting...`)
      console.error(`📚 Available tools: ${this.allTools.length}`)
      console.error(`   - Notes: ${this.notesTools.getTools().length} tools`)
      console.error(`   - Groups: ${this.groupsTools.getTools().length} tools`)
      console.error(`   - Todos: ${this.todosTools.getTools().length} tools`)
      console.error(`   - Workspaces: ${this.workspaceTools.getTools().length} tools`)
      console.error(`🔗 API URL: ${process.env.SIDVY_API_URL || 'https://sidvy.com/api'}`)
    }
    
    await this.server.connect(transport)
    if (process.env.DEBUG === 'true') {
      console.error('✅ MCP Server connected and ready!')
    }

    // Validate authentication in background (optional - validation happens on first tool call anyway)
    if (process.env.DEBUG === 'true') {
      this.validateApiKeyInBackground()
    }
  }

  private async validateApiKeyInBackground() {
    try {
      console.error('🔍 Validating API key...')
      const workspacesResponse = await this.client.get<any[]>('/workspace')
      
      if (!workspacesResponse || !('data' in workspacesResponse) || !Array.isArray(workspacesResponse.data)) {
        console.error('❌ API key validation failed. Please check your SIDVY_API_TOKEN environment variable.')
        return
      }

      console.error('✅ API key validation successful')
      
      // Get default workspace info
      const defaultWorkspace = workspacesResponse.data.find((w: any) => w.isDefault)
      if (defaultWorkspace) {
        console.error(`📁 Default workspace: "${defaultWorkspace.name}" (${defaultWorkspace.id})`)
      }
    } catch (error: any) {
      console.error('❌ Failed to validate API key:', error.message)
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  if (process.env.DEBUG === 'true') {
    console.error('🛑 Shutting down Sidvy MCP Server...')
  }
  process.exit(0)
})

process.on('SIGTERM', () => {
  if (process.env.DEBUG === 'true') {
    console.error('🛑 Shutting down Sidvy MCP Server...')
  }
  process.exit(0)
})

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  if (process.env.DEBUG === 'true') {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  }
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  if (process.env.DEBUG === 'true') {
    console.error('Uncaught Exception:', error)
  }
  process.exit(1)
})

// Main execution
async function main() {
  const server = new SidvyMcpServer()
  await server.run()
}

// Only run if this file is executed directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.ts'))
) {
  main().catch((error) => {
    if (process.env.DEBUG === 'true') {
      console.error('Fatal error:', error)
    }
    process.exit(1)
  })
}

export { SidvyMcpServer }
