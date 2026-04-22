# Rubric: Comment Module for Excalidraw

## Context

**Task:** Implement a Figma-like comment system for Excalidraw that allows users to create, view, edit, and delete comments anchored to scene coordinates.

**Problem Statement:** Enable annotation in Excalidraw by providing a comment tool in the toolbar, allowing users to drop comments at specific canvas locations, edit them inline, and have comments persist in appState with localStorage integration.

---

## Global Scoring Scale

| Score | Level | Description |
| --- | --- | --- |
| **9–10** | Excellent | Thorough, idiomatic, well-aligned with intent. Edge cases handled, performance considered. |
| **8–9** | Very Good | Meets all requirements. Minor gaps in polish or edge cases. |
| **6–7** | Good | Meets core requirements. Some gaps in completeness or polish. |
| **3–5** | Fair | Partially meets requirements. Notable gaps or bugs. |
| **1–2** | Poor | Fundamentally misunderstands the requirement or missing core functionality. |

---

## Criteria Overview

1. **Structural & Semantic Correctness** – UI renders proper semantic HTML, accessible roles/labels, and correct DOM structure.
2. **Behavioral Correctness** – User interactions produce expected results; event handlers wired correctly; dialog open/close/submit work.
3. **Component Architecture & Reusability** – Components properly decomposed; state lifted appropriately; duplication avoided.
4. **Framework Idioms & Excalidraw Integration** – React hooks used idiomatically; integrates properly with appState, tool system, and coordinate transformations.
5. **Persistence & Data Integrity** – Comments persist to localStorage; appState storage config correct; comments preserved across sessions.
6. **Test Coverage & Quality** – F2P component tests and P2P integration tests cover critical user workflows with semantic queries.

---

## Detailed Criteria Definitions

### 1. Structural & Semantic Correctness

**What this criterion evaluates:**  
Does the UI render with proper semantic HTML elements, accessible ARIA labels/roles, and correct DOM structure? Does the comment dialog have all required UI elements (textarea, buttons with proper labels, close icon)? Are comment pins positioned correctly and accessible to keyboard navigation?

**Justification for this criterion:**  
A comment system must be usable by all users, including those with assistive technologies. Semantic HTML and proper ARIA labels ensure that screen readers can describe the UI, form fields are correctly associated, and interactive elements are discoverable. Correct positioning ensures pins are visible and clickable without interfering with canvas interaction.

**Guidance for scoring:**

- **9–10 (Excellent):**

  - Comment pins render with semantic `<button>` elements
  - All aria-labels are present and descriptive (e.g., "Comment: {text}" for pins, "Close comment" for close button)
  - Dialog uses semantic `<div>` with proper role or is implemented as a proper dialog pattern
  - Textarea has proper placeholder text ("Write a comment…")
  - Buttons are labeled: "Submit", "Delete", "Close"
  - All interactive elements are keyboard-focusable and navigable
  - Close button icon is accessible (not just an icon, but wrapped in a button with aria-label)
  - Pins correctly positioned at converted viewport coordinates (not scattered or misaligned)

- **8–9 (Very Good):**

  - Semantic elements present (buttons, textarea)
  - Most aria-labels present; may be missing one non-critical label
  - Dialog structure is correct but may lack explicit role
  - Pins positioned correctly most of the time; minor alignment issues in edge cases
  - All buttons are labeled

- **6–7 (Good):**

  - Basic semantic structure present (buttons, textarea)
  - Some aria-labels missing or generic (e.g., missing comment text in pin label)
  - Dialog structure adequate but not fully semantic
  - Pins positioned but with occasional offset or alignment issues
  - Buttons present but labeling inconsistent

- **3–5 (Fair):**

  - Non-semantic elements used (e.g., `<div>` with click handlers instead of `<button>`)
  - Multiple missing or incorrect aria-labels
  - Dialog lacks clear structure or roles
  - Pins misaligned or hard to click
  - Interactive elements not clearly labeled

- **1–2 (Poor):**
  - No semantic structure; all custom divs with click handlers
  - No ARIA labels or accessibility considerations
  - Dialog structure unclear or broken
  - Pins not positioned or not visible
  - UI elements not findable by testing utilities

---

### 2. Behavioral Correctness

**What this criterion evaluates:**  
Do user interactions produce the expected results? When a user clicks a pin, does the dialog open with the correct comment text? When they click Submit, is the comment saved and dialog closed? When they click outside the dialog or press Esc, does it close? Do keyboard shortcuts (Ctrl+Enter, Cmd+Enter) submit? Does clicking a pin again re-open the dialog?

**Justification for this criterion:**  
The comment system is worthless if interactions don't work as users expect. Behavioral correctness is the difference between a polished feature and a broken prototype. This includes event delegation, preventing event bubbling (so clicking a pin doesn't also try to create a new comment), and proper lifecycle management (opening/closing dialogs, cleaning up empty comments).

**Guidance for scoring:**

- **9–10 (Excellent):**

  - Clicking a pin opens dialog with correct comment text
  - Clicking Submit button saves comment and closes dialog
  - Pressing Ctrl+Enter or Cmd+Enter in textarea submits
  - Pressing Esc key closes dialog
  - Clicking outside dialog closes it without creating a new comment
  - Clicking close button properly closes dialog
  - Clicking an existing pin re-opens its comment (no duplicate comments created)
  - Empty comments are deleted when dialog closes without submission
  - Clicking canvas with comment tool creates new comment
  - Pin stopPropagation prevents event bubbling to canvas

- **8–9 (Very Good):**

  - All core interactions work (open, submit, close)
  - Keyboard shortcuts work
  - Outside-click close works
  - Rare edge case bug (e.g., double-click creates two comments in rapid succession)

- **6–7 (Good):**

  - Most interactions work correctly
  - One keyboard shortcut may not work (e.g., Cmd+Enter missing)
  - Outside-click close may be flaky or require precise timing
  - Minor edge case issues

- **3–5 (Fair):**

  - Some interactions work; some are buggy
  - Keyboard shortcuts not implemented
  - Outside-click close doesn't work reliably
  - Duplicate comments can be created
  - Dialog doesn't always close properly

- **1–2 (Poor):**
  - Core interactions broken (dialog doesn't open, submit doesn't save)
  - Event handling fundamentally broken (event bubbling not prevented)
  - Dialog management is chaotic (doesn't close, creates orphaned state)
  - Keyboard interaction not implemented

---

### 3. Component Architecture & Reusability

**What this criterion evaluates:**  
Are components properly decomposed into reusable units (Comments, CommentDialog, CommentPin)? Is state lifted appropriately (e.g., comments in appState, not in component local state)? Is duplication avoided? Does CommentDialog accept generic callbacks (onSubmit, onClose, onDelete) making it reusable for future features like threading?

**Justification for this criterion:**  
Good component architecture makes code maintainable, testable, and extensible. A monolithic component would be hard to test and hard to reuse. Proper separation of concerns (orchestration in Comments, dialog logic in CommentDialog, pin UI in CommentPin) makes the code clearer and easier to extend (e.g., to support threaded replies by swapping `text: string` for `messages: Array`).

**Guidance for scoring:**

- **9–10 (Excellent):**

  - Three well-separated components: Comments (orchestrator), CommentDialog (reusable dialog), CommentPin (pin button)
  - Comments renders all pins and conditionally renders active dialog
  - CommentDialog is pure component: takes comment object + callbacks, no side effects
  - CommentPin is stateless: just renders button with label/title
  - State lives in appState (comments, activeCommentId), not in component local state
  - Callbacks (onOpenComment, onSubmitComment, onDeleteComment) are generic and testable
  - Coordinate transformation (scene→viewport) is handled at orchestration level
  - No duplication of dialog or pin rendering logic
  - Structure designed to support threading (callback-based, not tightly coupled)

- **8–9 (Very Good):**

  - Three components present with clear separation
  - Mostly pure components; minor side effect in CommentDialog
  - State mostly in appState; minimal local state
  - Callbacks present but could be slightly more generic
  - Some minor duplication

- **6–7 (Good):**

  - Components present but boundaries less clear
  - Some local state in components when it should be in appState
  - Callbacks work but are implementation-specific (not as reusable)
  - Moderate duplication (e.g., multiple similar event handlers)

- **3–5 (Fair):**

  - Components exist but lack clear separation
  - Significant state duplication or confusion (local state mixed with appState)
  - Tight coupling (CommentDialog calls appState directly instead of via callback)
  - Noticeable duplication

- **1–2 (Poor):**
  - Monolithic component or no component decomposition
  - State management fundamentally broken
  - Callbacks not used; tight coupling throughout
  - Extensive duplication

---

### 4. Framework Idioms & Excalidraw Integration

**What this criterion evaluates:**  
Does the solution use React hooks idiomatically (useState, useEffect, useRef)? Does it integrate properly with Excalidraw's appState, tool system (SHAPES array, TOOL_TYPE), and coordinate transformation utilities (sceneCoordsToViewportCoords)? Are z-index values set correctly (pins above canvas, dialog above pins)? Does the comment tool follow toolbar integration patterns?

**Justification for this criterion:**  
Excalidraw is a complex, mature codebase with established patterns. A solution that fights the framework (e.g., storing comments in component state instead of appState, not using sceneCoordsToViewportCoords, not registering the tool properly) will be fragile, hard to merge, and inconsistent with the codebase. This criterion ensures the solution is idiomatic and maintainable within the Excalidraw ecosystem.

**Guidance for scoring:**

- **9–10 (Excellent):**

  - React hooks used idiomatically: useState for local dialog state (text), useEffect for event listeners, useRef for focus/container
  - Comments properly added to appState with storage config (browser: true, export: true, server: false)
  - Comment tool registered in SHAPES array with keybinding (C key)
  - TOOL_TYPE updated and exported correctly
  - Tool activates via toolbar button or C key shortcut
  - Proper scene→viewport coordinate transformation via sceneCoordsToViewportCoords
  - Z-index hierarchy correct (pins z-index: 3, dialog z-index: 4, above canvas z-index: 2)
  - Dialog positioned with absolute coords (left, top) relative to viewport
  - Event handlers properly attached (pointerDown, click, outside-click via document listener)
  - Keyboard shortcuts use KEYS constants (KEYS.ESCAPE, KEYS.ENTER)
  - No direct DOM manipulation; all state-driven
  - Follows Excalidraw naming conventions (excalidraw-comment-\*, comments in appState)

- **8–9 (Very Good):**

  - React hooks used well; minor inefficiency (e.g., unnecessary re-render)
  - appState integration correct; storage config may be incomplete
  - Tool registration works; minor integration issue
  - Coordinate transformation present; correct most of the time
  - Z-index mostly correct
  - Event handling mostly correct; one listener may leak

- **6–7 (Good):**

  - React hooks present but not optimally used
  - appState has comments but storage config incomplete or incorrect
  - Tool registered but not fully integrated (e.g., toolbar button missing)
  - Coordinate transformation present but not used consistently
  - Z-index issues in some cases
  - Event handling works but with some leaks or inefficiencies

- **3–5 (Fair):**

  - React hooks present but misused (e.g., state in wrong place)
  - appState integration incomplete (comments not persisted)
  - Tool not properly registered
  - Coordinate transformation missing or incorrect
  - Z-index problems (pins behind canvas, dialog behind pins)
  - Event handling buggy (listeners not cleaned up)

- **1–2 (Poor):**
  - React patterns fundamentally misunderstood
  - Comments not in appState (local state only)
  - Tool not registered or integrated
  - No coordinate transformation
  - Z-index completely broken
  - Event handling fundamentally broken

---

### 5. Persistence & Data Integrity

**What this criterion evaluates:**  
Do comments persist to localStorage via Excalidraw's appState storage mechanism? Are comments preserved when the page is reloaded? Is the comment data structure correct and complete (id, x, y, text, createdAt)? Can comments be exported/imported correctly? Are empty comments properly cleaned up (not left orphaned in appState)?

**Justification for this criterion:**  
Persistence is essential for a comment system. If comments disappear on page reload, the feature is useless. Proper integration with Excalidraw's storage and export mechanisms ensures comments work seamlessly with the rest of the application. Data integrity (no orphaned comments, correct structure) ensures the system is reliable and maintainable.

**Guidance for scoring:**

- **9–10 (Excellent):**

  - Comments persist to localStorage correctly
  - Comments survive page reload with all data intact
  - Comment structure is correct: { id, x, y, text, createdAt }
  - Storage config in appState properly configured (browser: true, export: true, server: false)
  - Empty comments are deleted when dialog closes without submission
  - Comments can be exported and re-imported correctly
  - No orphaned comments in appState (no comments without activeCommentId cleanup)
  - createdAt is set to Date.now() at creation and never modified
  - Coordinates (x, y) are in scene space and don't change when panning/zooming

- **8–9 (Very Good):**

  - Persistence works; occasional minor issue
  - Storage config mostly correct
  - Data structure is correct
  - Export/import works; minor edge case issue

- **6–7 (Good):**

  - Persistence works most of the time
  - Storage config incomplete (e.g., missing export: true)
  - Data structure mostly correct; missing one field (e.g., missing createdAt)
  - Empty comment cleanup works most of the time

- **3–5 (Fair):**

  - Persistence doesn't work reliably
  - Storage config incorrect or missing
  - Data structure incomplete
  - Orphaned comments in appState
  - Export/import doesn't work

- **1–2 (Poor):**
  - No persistence (comments only in memory)
  - Storage config missing or completely wrong
  - Data structure fundamentally broken
  - Comments lost on reload

---

### 6. Test Coverage & Quality

**What this criterion evaluates:**  
Are there comprehensive F2P (component) and P2P (integration) tests? Do tests cover critical user workflows (create, edit, submit, delete, open/close, keyboard shortcuts)? Do tests use semantic queries (getByRole, getByLabelText) instead of brittle queries (getByTestId, CSS selectors)? Are tests maintainable and not overly brittle?

**Justification for this criterion:**  
Tests are a form of documentation and a safety net for refactoring. A solution without tests may work today but break silently during future changes. Tests using semantic queries are more resilient to UI refactoring than tests relying on DOM structure or test IDs. Comprehensive test coverage gives confidence that the feature works as intended.

**Guidance for scoring:**

- **9–10 (Excellent):**

  - F2P tests (Comments.test.tsx): ~13 tests covering pin rendering, dialog interaction, submission, deletion, focus management
  - P2P tests (comments.integration.test.tsx): ~14 tests covering tool activation, full workflows, keyboard shortcuts, multiple comments
  - All tests use semantic queries: getByRole, getByLabelText, getByText (no getByTestId with hardcoded IDs)
  - Tests cover happy path and edge cases:
    - Opening/closing dialog
    - Submitting with button and keyboard shortcuts (Ctrl+Enter, Cmd+Enter)
    - Deleting comments
    - Empty comment cleanup
    - Multiple comments
    - Outside-click close
    - Pin re-opening
    - Esc key close
  - Tests properly use waitFor and React state assertions
  - Tests are maintainable: clear test names, arranged logically in describe blocks
  - Both F2P and P2P tests pass without warnings

- **8–9 (Very Good):**

  - ~25 total tests covering most critical workflows
  - Mostly semantic queries; 1–2 brittleness issues (e.g., one getByTestId)
  - Covers happy path and most edge cases
  - One test may be flaky or missing edge case

- **6–7 (Good):**

  - ~15–20 tests covering core workflows
  - Semantic queries mostly used; a few brittle patterns (CSS selectors, structure traversal)
  - Covers happy path; some edge cases missing (e.g., no Cmd+Enter test, no outside-click test)
  - Tests are somewhat maintainable

- **3–5 (Fair):**

  - ~10 tests or fewer
  - Mix of semantic and brittle queries
  - Covers only happy path; most edge cases untested
  - Tests are fragile and hard to maintain

- **1–2 (Poor):**
  - Few or no tests
  - Brittle queries (lots of getByTestId, CSS selectors)
  - Tests don't actually verify behavior (e.g., no assertions)
  - Tests fail or are skipped

---

## Rubric Summary

| Criterion                                 | Max Score |
| ----------------------------------------- | --------- |
| Structural & Semantic Correctness         | 10        |
| Behavioral Correctness                    | 10        |
| Component Architecture & Reusability      | 10        |
| Framework Idioms & Excalidraw Integration | 10        |
| Persistence & Data Integrity              | 10        |
| Test Coverage & Quality                   | 10        |
| **Total**                                 | **60**    |

---

## Scoring Notes

- **Passing Score:** 42/60 (70%) – Core functionality works, tests present, integration with Excalidraw mostly correct.
- **Excellent Score:** 54+/60 (90%+) – All requirements met, edge cases handled, tests comprehensive, idiomatic React and Excalidraw patterns.
- **Weighting:** Each criterion is equally important. A solution strong in architecture but weak in tests is not acceptable, and vice versa.

---

## Example Scoring Scenario

**Scenario:** A solution with:

- ✅ Excellent semantic HTML and accessibility (10/10)
- ✅ Excellent behavioral correctness (10/10)
- ✅ Good component architecture with minor duplication (7/10)
- ✅ Excellent Excalidraw integration (10/10)
- ✅ Excellent persistence (10/10)
- ⚠️ Fair test coverage with brittle queries (5/10)

**Total Score:** 52/60 (87%)  
**Assessment:** Very strong solution with solid feature implementation, but test quality is a gap. Before merging, tests should be refactored to use semantic queries and expanded to cover edge cases.
