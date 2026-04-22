# Problem Statement: Canvas Comment & Reply Threads

## Overview

Excalidraw currently lacks a native **commenting and threaded reply system** anchored directly to canvas regions. While the editor supports real-time collaboration (cursors, live shape edits, Excalidraw+ sharing), there is no way for collaborators to leave **persistent, contextual discussion** tied to a specific area or element on the canvas.

This gap forces teams to rely on external tools (Slack, Google Docs, email, screenshot annotations) to discuss what they see on the board — breaking the flow and losing the spatial context that makes visual collaboration valuable in the first place.

---

## The Problem

### 1. No persistent contextual feedback

When a collaborator wants to ask "why is this arrow here?" or suggest "move this block left", they have no in-canvas way to record that thought. Live-cursor chat disappears the moment someone leaves the session.

### 2. No async collaboration

Teams across time zones cannot leave feedback for others to read later. Excalidraw is effectively **synchronous-only** for discussion.

### 3. Loss of spatial context

Comments made in Slack/Docs lose the "where on the board" anchor. Readers have to mentally map a textual description back to a visual location.

### 4. No threaded conversation

Even if a note is left (e.g. via a text element), there's no structured way to **reply**, mark as resolved, tag users, or track who said what and when.

### 5. No review / approval workflow

Design-review or stakeholder-sign-off workflows (common in Figma/Miro) are impossible. There's no concept of "open" vs "resolved" feedback.

### 6. Visual clutter from workarounds

Users currently fake comments by placing text elements or sticky-note rectangles on the canvas, which:

- Pollute the actual diagram
- Are indistinguishable from real content
- Cannot be hidden, filtered, or resolved
- Do not carry author/timestamp metadata

---

## Proposed Solution

Introduce a first-class **Comment Thread** primitive — a dialog-box UI pinned to any `(x, y)` coordinate or attached to a specific element on the canvas. Multiple threads can co-exist across the board, each independently collapsible and expandable.

### Core Features

#### Thread Pins

- A small, unobtrusive pin icon (e.g. speech-bubble marker) rendered at the thread's anchor point
- Numbered or avatar-stamped so users can scan activity at a glance
- Click the pin → expands into a dialog box with the full thread

#### Collapsible Dialog Box

- **Collapsed state**: just the pin (minimal visual noise)
- **Expanded state**: floating panel with:
  - Original comment (author, avatar, timestamp, text)
  - Chronological reply chain
  - Reply input at the bottom
  - Resolve / Reopen toggle
  - Delete / Edit (author-only) controls
  - "…" overflow menu (copy link to thread, mute, etc.)

#### Multiple Simultaneous Threads

- Any number of threads can exist on a single canvas
- Each is positioned independently; they do not stack or conflict
- Threads pan & zoom with the canvas (anchored in world coordinates, not screen coordinates)

#### Anchoring Modes

- **Point anchor**: pinned to an `(x, y)` coordinate — stays put even if nearby shapes move
- **Element anchor**: attached to a specific element's ID — follows the element as it's dragged, resized, or grouped

#### Resolution Workflow

- Threads can be marked **Resolved** → pin fades / hides from default view
- Toggle "Show resolved" in the UI to re-surface them
- Resolving is reversible

#### Sidebar / Inbox Panel

- A dedicated side panel lists **all threads** on the current canvas:
  - Filter by: open / resolved / mentioning me / authored by me
  - Click a thread in the list → canvas pans/zooms to its pin
  - Great for review workflows and async catch-up

---

## Problems Resolved

| Problem | How the feature solves it |
| --- | --- |
| No persistent feedback | Threads are saved with the scene data; survive sessions and page reloads |
| No async collaboration | Users can leave comments for others to read and reply to later |
| Loss of spatial context | Every thread is pinned to an exact canvas location or element |
| No structured reply | Native reply chain with author, timestamp, and ordering |
| No review workflow | Open / resolved states + mentions + sidebar inbox enable review cycles |
| Visual clutter | Pins are small and collapsible; resolved threads can be hidden |
| External-tool dependency | Discussion lives inside Excalidraw, next to the thing being discussed |

---

## What Needs to Be Added

### Data Model

- New element type (or sidecar data) `CommentThread`:
  ```ts
  {
    id: string;
    anchor: { type: "point"; x: number; y: number }
          | { type: "element"; elementId: string; offsetX: number; offsetY: number };
    status: "open" | "resolved";
    createdBy: UserId;
    createdAt: timestamp;
    messages: Array<{
      id: string;
      author: UserId;
      text: string;
      createdAt: timestamp;
      editedAt?: timestamp;
      reactions?: Record<emoji, UserId[]>;
    }>;
  }
  ```
- Threads stored alongside scene JSON so they persist with the drawing

### UI Components

- `CommentPin` — canvas-rendered marker
- `CommentDialog` — floating, collapsible panel (React portal)
- `CommentSidebar` — list/filter view of all threads
- `CommentComposer` — text area

### Interactions

- New toolbar tool: "Add comment" (keyboard shortcut, e.g. `C`)
- Click canvas while tool active → creates a new thread at that point
- Click an element while tool active → creates a thread anchored to that element
- Threads participate in zoom/pan transforms
- Threads skipped by selection/export-to-image (unless explicitly included)

### Export / Import

- Export to PNG/SVG: option to include or exclude comment pins
- Export to `.excalidraw` JSON: preserves threads
- Print / PDF: include threads as footnotes option

### Permissions

- Read-only viewers can still read threads but not reply (configurable)
- Anonymous commenters allowed? (product decision)

---

## Out of Scope (for v1)

- Voice / video replies
- AI-summarized thread digests
- Integrations with Jira / Linear / GitHub issues

These are strong follow-ups but should not block shipping the core threaded-comment experience.

---

## Success Metrics

- Number of threads created per active canvas per week
- Thread resolution rate (open → resolved)
- Reduction in external-tool references ("see Slack thread…") in user surveys
- Async adoption: % of threads that receive a reply > 1 hour after creation
- Retention impact on team accounts
