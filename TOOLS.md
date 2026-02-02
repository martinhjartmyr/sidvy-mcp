# MCP Tools Reference

This document provides a complete reference for all MCP tools provided by the Sidvy server.

## 📝 Notes Tools

### `list_notes`

List notes with optional filtering and search capabilities.

**Parameters:**

- `workspaceId` (string, optional): Filter by workspace ID
- `groupId` (string, optional): Filter by group ID
- `search` (string, optional): Search notes by name or content
- `isDeleted` (boolean, optional): Include deleted notes (default: false)
- `sort` (string, optional): Sort order (`name:asc`, `name:desc`, `createdAt:asc`, `createdAt:desc`, `updatedAt:asc`, `updatedAt:desc`)
- `limit` (number, optional): Number of notes to return (1-100)

### `create_note`

Create a new note with markdown content.

**Parameters:**

- `name` (string, required): Note title/name (1-200 chars)
- `content` (string, optional): Note content in markdown format
- `workspaceId` (string, optional): Workspace to create note in
- `groupId` (string, optional): Group to organize note under

### `update_note`

Update an existing note's content or metadata.

**Parameters:**

- `id` (string, required): Note ID to update
- `name` (string, optional): New note title/name (1-200 chars)
- `content` (string, optional): New note content in markdown format
- `groupId` (string, optional): Move note to different group

### `delete_note`

Delete a note (moves to trash).

**Parameters:**

- `id` (string, required): Note ID to delete

### `search_notes`

Search notes by content or title with full-text search.

**Parameters:**

- `query` (string, required): Search query (min 1 char)
- `workspaceId` (string, optional): Workspace to search in
- `limit` (number, optional): Number of results to return (1-100)

### `get_note`

Get a specific note by ID.

**Parameters:**

- `id` (string, required): Note ID to retrieve
- `workspaceId` (string, optional): Workspace to search in

### `get_recent_notes`

Get recently updated notes.

**Parameters:**

- `workspaceId` (string, optional): Workspace to get notes from
- `limit` (number, optional): Number of notes to return (1-50, default: 10)

### `append_to_note`

Append content to an existing note.

**Parameters:**

- `id` (string, required): Note ID to append to
- `content` (string, required): Content to append
- `workspaceId` (string, optional): Workspace to search note in

---

## 📁 Groups Tools

### `list_groups`

List groups with hierarchical structure and filtering.

**Parameters:**

- `workspaceId` (string, optional): Filter by workspace ID
- `parentId` (string, optional): Filter by parent group ID
- `search` (string, optional): Search groups by name
- `sort` (string, optional): Sort order
- `limit` (number, optional): Number of groups to return (1-100)

### `create_group`

Create a new group for organizing notes.

**Parameters:**

- `name` (string, required): Group name (1-100 chars)
- `workspaceId` (string, optional): Workspace to create group in
- `parentId` (string, optional): Parent group for hierarchical organization

### `update_group`

Update a group's name or move it in the hierarchy.

**Parameters:**

- `groupId` (string, required): Group ID to update
- `name` (string, optional): New group name (1-100 chars)
- `parentId` (string, optional): New parent group ID

### `delete_group`

Delete a group and all its child groups (cascade delete).

**Parameters:**

- `groupId` (string, required): Group ID to delete

### `get_group_tree`

Get the hierarchical tree structure of all groups in a workspace.

**Parameters:**

- `workspaceId` (string, required): Workspace ID to get groups from

### `get_root_groups`

Get all root-level groups (groups with no parent).

**Parameters:**

- `workspaceId` (string, optional): Workspace to get root groups from

### `get_child_groups`

Get all child groups of a specific parent group.

**Parameters:**

- `parentId` (string, required): Parent group ID
- `workspaceId` (string, optional): Workspace to search in

### `get_group_path`

Get the full path from root to a specific group.

**Parameters:**

- `groupId` (string, required): Group ID to get path for
- `workspaceId` (string, required): Workspace ID

### `move_group`

Move a group to a new parent (or to root level).

**Parameters:**

- `groupId` (string, required): Group ID to move
- `newParentId` (string, optional): New parent group ID

### `create_group_path`

Create a nested group structure from a path.

**Parameters:**

- `path` (array, required): Array of group names representing the path
- `workspaceId` (string, optional): Workspace to create groups in

---

## ✅ Todos Tools

### `list_todos`

List todos with filtering options.

**Parameters:**

- `workspaceId` (string, optional): Filter by workspace ID
- `noteId` (string, optional): Filter by note ID
- `completed` (boolean, optional): Filter by completion status
- `isDeleted` (boolean, optional): Include deleted todos
- `search` (string, optional): Search todos by text
- `sort` (string, optional): Sort order
- `limit` (number, optional): Number of todos to return (1-100)

### `create_todo`

Create a new todo associated with a note.

**Parameters:**

- `text` (string, required): Todo text/description (1-500 chars)
- `noteId` (string, required): ID of the note this todo belongs to
- `lineNumber` (number, required): Line number in the note (min 1)
- `completed` (boolean, optional): Initial completion status
- `workspaceId` (string, optional): Workspace ID

### `update_todo`

Update a todo's text, completion status, or line number.

**Parameters:**

- `todoId` (string, required): Todo ID to update
- `text` (string, optional): New todo text/description (1-500 chars)
- `completed` (boolean, optional): Completion status
- `lineNumber` (number, optional): New line number in the note (min 1)

### `delete_todo`

Delete a todo (soft delete).

**Parameters:**

- `todoId` (string, required): Todo ID to delete

### `toggle_todo`

Toggle a todo's completion status.

**Parameters:**

- `todoId` (string, required): Todo ID to toggle

### `complete_todo`

Mark a todo as completed.

**Parameters:**

- `todoId` (string, required): Todo ID to complete

### `uncomplete_todo`

Mark a todo as incomplete.

**Parameters:**

- `todoId` (string, required): Todo ID to mark as incomplete

### `get_pending_todos`

Get all incomplete/pending todos.

**Parameters:**

- `workspaceId` (string, optional): Workspace to get todos from
- `limit` (number, optional): Number of todos to return (1-100)

### `get_completed_todos`

Get all completed todos.

**Parameters:**

- `workspaceId` (string, optional): Workspace to get todos from
- `limit` (number, optional): Number of todos to return (1-100)

### `get_todos_for_note`

Get all todos associated with a specific note.

**Parameters:**

- `noteId` (string, required): Note ID to get todos for
- `workspaceId` (string, optional): Workspace to search in

### `get_todo_stats`

Get statistics about todos.

**Parameters:**

- `workspaceId` (string, optional): Workspace to get stats from

### `search_todos`

Search todos by text content.

**Parameters:**

- `query` (string, required): Search query (min 1 char)
- `workspaceId` (string, optional): Workspace to search in

### `create_todos_for_note`

Create multiple todos for a note at once.

**Parameters:**

- `noteId` (string, required): Note ID to create todos for
- `todoTexts` (array, required): Array of todo text strings
- `startingLineNumber` (number, optional): Starting line number (default: 1)
- `workspaceId` (string, optional): Workspace ID

---

## 🏢 Workspace Tools

### `list_workspaces`

List all workspaces for the authenticated user.

**Parameters:**

- `includeStats` (boolean, optional): Include content statistics

### `create_workspace`

Create a new workspace (max 2 per user).

**Parameters:**

- `name` (string, required): Workspace name (1-100 chars)

### `update_workspace`

Update a workspace name.

**Parameters:**

- `workspaceId` (string, required): Workspace ID to update
- `name` (string, optional): New workspace name (1-100 chars)

### `delete_workspace`

Delete a workspace and all its content.

**Parameters:**

- `workspaceId` (string, required): Workspace ID to delete
- `confirmDelete` (boolean, required): Confirmation flag for safety

### `get_workspace`

Get details of a specific workspace.

**Parameters:**

- `workspaceId` (string, required): Workspace ID to retrieve

### `get_default_workspace`

Get the user's default workspace.

**Parameters:** None

### `get_workspace_by_name`

Find a workspace by its name.

**Parameters:**

- `name` (string, required): Workspace name to search for

### `get_workspace_stats`

Get detailed statistics for a workspace.

**Parameters:**

- `workspaceId` (string, optional): Workspace ID

### `can_create_workspace`

Check if the user can create another workspace.

**Parameters:** None

### `switch_workspace`

Switch context to a different workspace.

**Parameters:**

- `workspaceId` (string, required): Workspace ID to switch to

### `rename_workspace`

Rename an existing workspace.

**Parameters:**

- `workspaceId` (string, required): Workspace ID to rename
- `newName` (string, required): New workspace name (1-100 chars)

---

## 📅 Calendar Tools

### `get_daily_note`

Get today's daily note or a specific date's note. Creates the note automatically if it doesn't exist, using the workspace's default daily template.

**Parameters:**

- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)
- `workspaceId` (string, optional): Workspace ID (uses default workspace)

### `update_daily_note`

Update the content of today's daily note or a specific date's note. Creates the note first if it doesn't exist.

**Parameters:**

- `content` (string, required): New note content in markdown format
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)
- `workspaceId` (string, optional): Workspace ID (uses default workspace)

### `append_to_daily_note`

Append content to today's daily note or a specific date's note. Creates the note first if it doesn't exist.

**Parameters:**

- `content` (string, required): Content to append in markdown format
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)
- `workspaceId` (string, optional): Workspace ID (uses default workspace)

### `get_weekly_note`

Get the current week's note or a specific week's note. Creates the note automatically if it doesn't exist, using the workspace's default weekly template.

**Parameters:**

- `week` (number, optional): ISO week number (1-53). Must be provided with year.
- `year` (number, optional): ISO week-numbering year. Must be provided with week.
- `workspaceId` (string, optional): Workspace ID (uses default workspace)

### `update_weekly_note`

Update the content of the current week's note or a specific week's note. Creates the note first if it doesn't exist.

**Parameters:**

- `content` (string, required): New note content in markdown format
- `week` (number, optional): ISO week number (1-53). Must be provided with year.
- `year` (number, optional): ISO week-numbering year. Must be provided with week.
- `workspaceId` (string, optional): Workspace ID (uses default workspace)

### `append_to_weekly_note`

Append content to the current week's note or a specific week's note. Creates the note first if it doesn't exist.

**Parameters:**

- `content` (string, required): Content to append in markdown format
- `week` (number, optional): ISO week number (1-53). Must be provided with year.
- `year` (number, optional): ISO week-numbering year. Must be provided with week.
- `workspaceId` (string, optional): Workspace ID (uses default workspace)

---

## Usage Examples

### Create a note with todos

```json
{
  "name": "create_note",
  "arguments": {
    "name": "Project Planning",
    "content": "# Project Planning\n\n## Tasks\n- [ ] Define requirements\n- [ ] Create mockups\n- [ ] Set up development environment"
  }
}
```

### Search for notes

```json
{
  "name": "search_notes",
  "arguments": {
    "query": "project planning",
    "limit": 10
  }
}
```

### Get workspace statistics

```json
{
  "name": "get_workspace_stats",
  "arguments": {}
}
```

### Get today's daily note

```json
{
  "name": "get_daily_note",
  "arguments": {}
}
```

### Append to daily note

```json
{
  "name": "append_to_daily_note",
  "arguments": {
    "content": "## Meeting Notes\n\n- Discussed project timeline\n- Action items assigned"
  }
}
```

### Get specific week's note

```json
{
  "name": "get_weekly_note",
  "arguments": {
    "week": 5,
    "year": 2025
  }
}
```

### Update weekly note

```json
{
  "name": "update_weekly_note",
  "arguments": {
    "content": "## Week 5 Summary\n\n### Accomplishments\n- Completed API integration\n- Fixed critical bugs\n\n### Next Week\n- Start UI testing"
  }
}
```
