# Vibe Workspace Product Spec

## Product summary
A web workspace for building software through task-scoped chat workflows, with project/folder/task hierarchy, per-project context and rules, task attachments, task-level model/provider selection, automatic GitHub repository bootstrap, Railway deploy linkage, and a right-hand operational pane that shows deploy truth, logs, and preview.

## UX contract
### Far-left rail
- project switcher
- create project action
- workspace identity / settings entry

### Left rail
- folders within selected project
- tasks within folder
- create folder
- create task
- visible task status and active selection

### Center pane
- selected task header
- task chat thread
- attachment list / add attachment
- model/provider selector and run controls
- task metadata: status, run state, updated at, repository/deploy linkage summary

### Right pane
- deploy target linkage
- last deploy status
- preview URL
- health/truth panel
- recent deploy events/log snippets

## Required product behaviors
1. A project can store rules, context, and skill references.
2. A folder belongs to a project.
3. A task belongs to a folder and project.
4. A task can hold many chat messages.
5. A task can hold attachments.
6. A task can persist model/provider selection state.
7. A project can link to one GitHub repository in MVP.
8. A project can link to one deploy target in MVP.
9. Deploy state must distinguish requested state from observed state.
10. The right pane must not present preview as live if the backend has not confirmed it.

## Suggested initial schema blocks
- projects and folders
- tasks and task messages
- attachments and storage adapter
- provider configuration and selection snapshot
- repository link and deploy target
- deploy runs/events and preview endpoint

## Critical paths
- create project -> folder -> task
- open task workspace and chat
- attach file to task
- choose model/provider on task
- request GitHub bootstrap for project
- request Railway linkage/deploy for project
- observe deploy status and preview truth in right pane

## MVP truth rules
- if bootstrap has not succeeded, show that honestly
- if Railway linkage has not succeeded, show that honestly
- if preview is stale, show stale or unavailable, not live
- if a run is in progress, show in progress, not done

## Failure-state requirements
- task with no attachments must still be usable
- deploy linkage failure must preserve the rest of the project workspace
- provider misconfiguration must fail clearly without corrupting task history
- attachment validation failure must not break the chat thread
