---
name: session-handoff
description: Produce a structured, chat-only context handoff for a fresh session. Use when the user says "session handoff", "wrap up session", "hand off", "handoff summary", "summarize before I clear", "traspaso", "haz el traspaso", "handoff antes de limpiar", "cierra la sesión", or otherwise wants decisions, shipped changes, key files, running state, verification, deferrals, and open questions preserved before clearing context.
---

# Session Handoff

Produce a repeatable end-of-session summary that lets a fresh agent instance continue from the chat alone. Treat the audience as the next working agent, not a stakeholder.

## Gather state

Review the full conversation, including compacted summaries and prior user handoffs. Do not summarize only the latest turns.

Gather session state in this order:

1. Identify the user's original objective, scope, and constraints.
2. Reconstruct decisions and shipped work from the conversation and tool results.
3. Capture current plan and goal state:
   - Use the active todo list or plan state already visible in the thread.
   - Name a plan file only when a real file drove the work.
4. Capture execution state:
   - Record unfinished background Bash shells by ID and what command each is running.
   - If subagents were used, record any running, interrupted, or unfinished agents by name and task. Use `ListAgents` to confirm state when agents are still live.
   - Record known dev servers, ports, process IDs, branches, or worktrees started during the session.
5. List files created or modified in this session from known tool results. Use a targeted `git status --short -- <scoped paths>` only when needed to confirm known changes.
6. Name memory files only if this session actually changed them.
7. Capture deferred work and unanswered user decisions.

Do not run a broad filesystem audit, `git log`, repository-wide glob, or unrelated search. If the session did not touch it, it does not belong in the handoff.

## Produce the handoff

Output the handoff in chat only. Do not create a handoff file, update memory, commit changes, or mutate external systems.

Use exactly these sections:

```markdown
# Session Handoff: <one-line title>

## Where it started
<2-3 sentences describing the request, framing, and constraints>

## Decisions locked + what shipped
- <decision or change>: <why it matters and absolute path when applicable>
- ...

## Key files for next session
- `<absolute path>`: <why to read it>
- Plan file: `<absolute path>` or `none`
- Memory files touched: `<absolute paths>` or `none`

## Running state
- Background shells: <shell IDs, commands, and how to terminate> or `none`
- Subagents: <names and current state> or `none`
- Dev servers / ports: <URL, port, and process ID> or `none`
- Open worktrees / branches: <absolute paths and branch names> or `none`

## Verification: how to confirm things still work
- `<command>`: <expected result>
- ...

## Deferred + open questions
- Deferred: <item and why>
- Open: <question requiring user input and context>

## Pick up here
<1-2 sentences naming the single most likely next action>
```

## Hard rules

1. Keep every section. Write `none` when a section has no state.
2. Use absolute paths for real files.
3. Put a real plan file first under key files when one drove the session.
4. Report running state precisely. A yielded background shell or active subagent without an identifier is not actionable.
5. Distinguish completed, interrupted, and still-running work.
6. Never claim verification that was not actually run.
7. Keep the tone terse and operational. No emojis, hype, retrospective, or praise.
8. Avoid em dashes in user-facing output.
9. Recommend only one next action in `Pick up here`.

## Avoid

- Writing the handoff to disk.
- Updating memory as part of the handoff.
- Inventing a plan file, process ID, branch, or verification result.
- Re-auditing the whole repository to reconstruct work.
- Treating untracked user files as files created by this session without evidence.
- Omitting running state because nothing is active.
