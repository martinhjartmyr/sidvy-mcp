# Sidvy MCP Server

A comprehensive MCP (Model Context Protocol) server that provides AI tools with full access to the Sidvy API - a powerful note-taking system with workspaces, groups, todos, and real-time synchronization.

## Features

- **Full CRUD Operations**: Complete access to notes, groups, todos, and workspaces
- **Authentication**: API key-based authentication for secure access
- **Workspace Management**: Multi-workspace support with user isolation
- **Hierarchical Groups**: Organize notes in nested group structures
- **Smart Todos**: Todo tracking with markdown checkbox synchronization
- **Search & Filter**: Full-text search across notes and advanced filtering
- **Simple Setup**: Direct Node.js execution, no complex packaging
- **Easy Integration**: Works with Claude Desktop, OpenAI ChatGPT, and other MCP-compatible AI tools

## Quick Start

### 1. Get Your API Token

1. Go to [Sidvy](https://sidvy.com)
2. Sign up or log in to your account
3. Generate an API token from your account settings
4. Copy the JWT token

### 2. Install and Build

```bash
# Clone the repository
git clone https://github.com/martinhjartmyr/sidvy-mcp.git
cd sidvy-mcp

# Install dependencies
pnpm install

# Build the server
pnpm run build
```

### 3. Set Up Environment

Create a `.env` file or set environment variables:

```bash
SIDVY_API_TOKEN=your_jwt_token_here
SIDVY_API_URL=https://sidvy.com/api
```

### 4. Configure Your AI Tool

#### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sidvy": {
      "command": "node",
      "args": ["/path/to/sidvy-mcp/build/index.js"],
      "env": {
        "SIDVY_API_TOKEN": "your_jwt_token_here",
        "SIDVY_API_URL": "https://sidvy.com/api"
      }
    }
  }
}
```

Alternative using absolute path:

```json
{
  "mcpServers": {
    "sidvy": {
      "command": "/path/to/sidvy-mcp/build/index.js",
      "env": {
        "SIDVY_API_TOKEN": "your_jwt_token_here",
        "SIDVY_API_URL": "https://sidvy.com/api"
      }
    }
  }
}
```

#### Claude Code Configuration

Add to your `~/.claude/settings.json` (or project-level `.claude/settings.json`):

```json
{
  "mcpServers": {
    "sidvy": {
      "command": "node",
      "args": ["/path/to/sidvy-mcp/build/index.js"],
      "env": {
        "SIDVY_API_TOKEN": "your_jwt_token_here",
        "SIDVY_API_URL": "https://sidvy.com/api"
      }
    }
  }
}
```

#### OpenAI ChatGPT Configuration

Add to your MCP configuration:

```json
{
  "name": "sidvy",
  "command": ["node", "/path/to/sidvy-mcp/build/index.js"],
  "env": {
    "SIDVY_API_TOKEN": "your_jwt_token_here",
    "SIDVY_API_URL": "https://sidvy.com/api"
  }
}
```

## Available Tools

### Notes Management

- `list_notes` - List notes with filtering and search
- `create_note` - Create new markdown notes
- `update_note` - Edit note content and metadata
- `delete_note` - Move notes to trash
- `search_notes` - Full-text search across notes
- `get_note` - Retrieve specific note by ID
- `get_recent_notes` - Get recently updated notes
- `append_to_note` - Add content to existing notes

### Groups Management

- `list_groups` - List groups with hierarchical structure
- `create_group` - Create new groups for organization
- `update_group` - Rename or move groups
- `delete_group` - Remove groups and children
- `get_group_tree` - Get complete group hierarchy
- `get_root_groups` - Get top-level groups
- `get_child_groups` - Get child groups of a parent
- `move_group` - Reorganize group structure
- `create_group_path` - Create nested group paths

### Todos Management

- `list_todos` - List todos with filtering
- `create_todo` - Create new todos
- `update_todo` - Edit todo text or status
- `delete_todo` - Remove todos
- `toggle_todo` - Switch completion status
- `complete_todo` / `uncomplete_todo` - Set completion state
- `get_pending_todos` - Get incomplete todos
- `get_completed_todos` - Get finished todos
- `get_todos_for_note` - Get todos for specific note
- `get_todo_stats` - Get completion statistics

### Workspace Management

- `list_workspaces` - List all workspaces
- `create_workspace` - Create new workspace (max 2)
- `update_workspace` - Rename workspaces
- `delete_workspace` - Remove workspace and content
- `get_workspace` - Get workspace details
- `get_default_workspace` - Get user's default workspace
- `get_workspace_stats` - Get content statistics
- `switch_workspace` - Change active workspace

## Example Usage

### With Claude Desktop

Once configured, you can ask Claude:

> "Create a new note called 'Meeting Notes' with a todo list for today's agenda"

> "Search for all notes containing 'project planning' and show me the recent ones"

> "Show me all my pending todos across all workspaces"

> "Create a group structure for 'Projects/Web Development/Frontend' and add a note there"

### Command Line Testing

You can test the server directly:

```bash
# Set environment variables
export SIDVY_API_TOKEN="your_token_here"

# Run the built server
node build/index.js

# Or run in development mode
pnpm run dev

# The server will start and wait for MCP protocol messages
```

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Available Commands

```bash
# Install dependencies
pnpm install

# Run in development mode with hot reload
pnpm run dev

# Build for production
pnpm run build

# Run built server
pnpm run start

# Clean build files
pnpm run clean
```

## Configuration Options

### Environment Variables

- `SIDVY_API_TOKEN` - Your JWT authentication token (required)
- `SIDVY_API_URL` - API base URL (default: https://sidvy.com/api)
- `DEBUG` - Enable debug logging (default: false)

### API Rate Limits

The Sidvy API has reasonable rate limits for normal usage. The MCP server handles rate limiting gracefully and will retry requests when appropriate.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
