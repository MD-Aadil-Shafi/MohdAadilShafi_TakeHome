# Rubric Scoring Report: Comment Module for Excalidraw

---

## 1. Structural & Semantic Correctness — 5 / 10 (Fair)

**Evidence reviewed:** `CommentPin.tsx`, `CommentDialog.tsx`, `Comments.scss`

The pin elements are correctly implemented as `<button type="button">` elements and are positioned via `sceneCoordsToViewportCoords`, so the DOM structure and coordinate rendering are sound. The textarea retains its `placeholder="Write a comment…"` and the Submit/Delete buttons are labelled by their visible text.

However, multiple ARIA labels are missing or degraded in ways that meaningfully harm accessibility:

- **Comment pins** carry only `aria-label="Comment"` — a generic, non-descriptive label. Screen readers cannot distinguish between pins or read the comment text without opening the dialog. The `title` attribute was also removed, so there is no tooltip fallback.
- **Close button** has no `aria-label` at all — it renders only the SVG `CloseIcon` with no accessible name, making it invisible to assistive technology.
- **Dialog container** is a plain `<div>` with no `role="dialog"` or `aria-modal`, so screen readers do not announce a modal context.

These gaps place the solution firmly in the Fair band: the structure exists (buttons, textarea, proper positioning) but interactive elements are not consistently labelled and the dialog lacks semantic role annotation.

---

## 2. Behavioral Correctness — 5 / 10 (Fair)

**Evidence reviewed:** `CommentDialog.tsx`, `App.tsx` (`handleCommentToolPointerDown`, `openCommentDialog`, `submitComment`, `deleteComment`)

Core interactions work: clicking a pin opens the dialog with pre-filled text, the Submit button saves and closes, Esc dismisses, outside-click dismisses (the deferred `setTimeout` logic is intact), and the close button works. Ctrl+Enter submits via the textarea `keyDown` handler.

Two notable behavioral defects drop the score into the Fair band:

1. **Cmd+Enter (Mac) is broken.** The `metaKey` branch was removed from the keyboard shortcut check. Only `ctrlKey` is evaluated, so the feature is inaccessible on macOS without a modifier key remapping.

2. **Duplicate pins can be created.** The guard `if (this.state.activeCommentId !== null) return` was removed from `handleCommentToolPointerDown`. When a dialog is open, clicking anywhere on the canvas now drops a new empty pin _in addition to_ closing the open dialog via the outside-click handler. Rapid or accidental clicks produce orphaned empty comment pins.

3. **Empty comments are never cleaned up on close.** `openCommentDialog` was simplified to `setState({ activeCommentId: id })` with no cleanup logic. Dismissing a new (never-submitted) comment leaves a permanent empty pin in `appState.comments`, cluttering the canvas and localStorage.

---

## 3. Component Architecture & Reusability — 8 / 10 (Very Good)

**Evidence reviewed:** `Comments.tsx`, `CommentDialog.tsx`, `CommentPin.tsx`

The three-component decomposition is intact and well-reasoned. `Comments` acts as the pure orchestrator (reads `appState`, converts scene→viewport coordinates, delegates three typed callbacks). `CommentDialog` manages only ephemeral local textarea state and accepts generic `onSubmit`/`onClose`/`onDelete` callbacks, keeping it reusable. `CommentPin` is stateless — it receives viewport coordinates and a click handler and renders nothing else.

All persistent state lives in `appState` (`comments`, `activeCommentId`). Coordinate transformation is handled at the orchestration layer, not pushed into child components. The callback signature (`onSubmit(text: string)`) is designed for future extension (e.g., threaded replies) without structural change.

The one minor point preventing a 9: `CommentDialog.tsx` now uses the hardcoded string `"Escape"` rather than the `KEYS.ESCAPE` constant, introducing a small deviation from Excalidraw idiom. This is a framework concern more than an architecture concern, but it reflects a minor coupling to browser key names rather than the centralised constants layer.

---

## 4. Framework Idioms & Excalidraw Integration — 6 / 10 (Good)

**Evidence reviewed:** `CommentDialog.tsx`, `appState.ts`, `App.tsx`, `shapes.tsx`

React hooks are used correctly: `useState` for textarea value, `useEffect` with proper cleanup for document listeners and autofocus, `useRef` for the container boundary check and textarea focus. The tool is registered in `SHAPES` with `key: KEYS.C`, `TOOL_TYPE` includes `"comment"`, the icon follows the `createIcon` pattern, and z-index values are correct (`--zIndex-canvasButtons` = 3 for pins, `--zIndex-layerUI` = 4 for dialog).

Two integration gaps reduce the score:

1. **Storage config is incomplete.** `APP_STATE_STORAGE_CONF` sets `comments: { browser: true, export: false, server: false }`. The `export: false` flag means comments are silently dropped when a user exports their drawing to a `.excalidraw` file and re-imports it. This is a direct regression from Excalidraw's export/import contract.

2. **Hardcoded `"Escape"` string.** The document-level `keydown` handler in `CommentDialog` checks `event.key === "Escape"` instead of `event.key === KEYS.ESCAPE`. While functionally equivalent in browsers today, this bypasses the centralised constants layer that the rest of the codebase uses for keyboard handling, and would silently break if `KEYS.ESCAPE` were ever updated.

3. **Missing activeCommentId guard.** Removing the early-return guard in `handleCommentToolPointerDown` is not just a behavioral bug — it violates the expected event-delegation contract of the comment tool, where a single pointer-down should either close an existing dialog or create a new pin, never both simultaneously.

---

## 5. Persistence & Data Integrity — 5 / 10 (Fair)

**Evidence reviewed:** `types.ts`, `appState.ts`, `App.tsx`

Browser localStorage persistence works: `browser: true` in the storage config means comments survive page reload. However, three data integrity issues together place this in the Fair band:

1. **`createdAt` field removed.** The `Comment` type no longer includes `createdAt`, and no timestamp is set at creation. Sorting comments by creation order, auditing changes, or displaying "added X minutes ago" labels are all impossible without this field.

2. **Export broken.** `export: false` means comments are excluded from `.excalidraw` file exports. A user sharing their file or opening it in another browser loses all comments silently — the most visible persistence failure case.

3. **Orphaned empty comments.** The cleanup logic in `openCommentDialog` was removed. Every time a user activates the comment tool and dismisses the dialog without submitting, an empty `{ id, x, y, text: "" }` object is written to `appState.comments` and persisted to localStorage. These accumulate without bound across sessions and cannot be removed through the UI (the Delete button is hidden for empty comments), constituting a data integrity leak.

---

## 6. Test Coverage & Quality — 4 / 10 (Poor–Fair)

**Evidence reviewed:** `Comments.test.tsx` (F2P), `comments.integration.test.tsx` (P2P)

**Total tests: 9** (6 F2P + 8 P2P... wait: F2P has 6 `it()` blocks, P2P has 8 `it()` blocks = 14 total — but most cover only the happy path with no assertions on edge cases).

Actually counting precisely: F2P has 6 tests across 4 describe blocks; P2P has 8 tests across 5 describe blocks. **Total: 14 tests**, down from 28.

**Query brittleness is the dominant issue.** Nearly every query in both files uses CSS class selectors:

```ts
container.querySelector(".excalidraw-comment-pin");
container.querySelector(".excalidraw-comment-dialog__close");
container.querySelector(".excalidraw-comment-dialog__textarea");
container.querySelector(".excalidraw-comment-dialog__delete");
container.querySelector(".excalidraw-comment-dialog__submit");
```

These selectors are tightly coupled to SCSS class names. Renaming a class, extracting a component, or restructuring the DOM would silently break all tests without any behavioral change. The rubric's standard is `getByRole`, `getByLabelText`, and `getByText` — semantic queries resilient to structural refactoring.

**Missing coverage:**

| Test case                                               | Status                           |
| ------------------------------------------------------- | -------------------------------- |
| Pin aria-label contains comment text                    | Removed                          |
| Close button accessible by label                        | Removed                          |
| Cmd+Enter submits (Mac)                                 | Removed (F2P and P2P)            |
| Outside-click closes dialog                             | Removed                          |
| Textarea autofocus on dialog open                       | Removed                          |
| Whitespace-only input rejected                          | Removed                          |
| Empty pin hidden Delete button                          | Removed                          |
| Pin switching (open comment 1 → close → open comment 2) | Removed                          |
| Placeholder text verification                           | Removed                          |
| `createdAt` field in structure                          | Removed (field no longer exists) |

The remaining tests cover the happy path only: create pin, open dialog, submit, delete. No edge cases, no keyboard-only workflows beyond Ctrl+Enter, no accessibility-oriented assertions.

---

## Summary

| Criterion                                 | Score             |
| ----------------------------------------- | ----------------- |
| Structural & Semantic Correctness         | **5 / 10**        |
| Behavioral Correctness                    | **5 / 10**        |
| Component Architecture & Reusability      | **8 / 10**        |
| Framework Idioms & Excalidraw Integration | **6 / 10**        |
| Persistence & Data Integrity              | **5 / 10**        |
| Test Coverage & Quality                   | **4 / 10**        |
| **Total**                                 | **33 / 60 (55%)** |

**Assessment:** Below the passing threshold of 42/60 (70%). The component architecture and Excalidraw tool integration are structurally sound, but multiple behavioural regressions (duplicate pins, orphaned empty comments, broken Cmd+Enter), data integrity gaps (missing `createdAt`, broken export), degraded accessibility (generic/missing ARIA labels), and a test suite that relies entirely on brittle CSS class selectors combine to produce a solution that would not be mergeable in its current state. Priority fixes: restore empty-comment cleanup, re-add `createdAt` and `export: true`, fix Cmd+Enter, restore the duplicate-pin guard, update ARIA labels, and rewrite tests using semantic queries.
