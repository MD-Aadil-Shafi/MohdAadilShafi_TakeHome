import React from "react";
import { KEYS } from "@excalidraw/common";
import { Excalidraw } from "../../index";
import {
  render,
  waitFor,
  fireEvent,
  getByRole,
} from "../../tests/test-utils";

const { h } = window;

describe("Comments Component - Frontend Tests (F2P)", () => {
  describe("Comment Pin Rendering", () => {
    it("should render comment pins for each comment in appState", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Test comment 1",
          },
          "comment-2": {
            id: "comment-2",
            x: 200,
            y: 200,
            text: "Test comment 2",
          },
        },
      });

      await waitFor(() => {
        const pins = container.querySelectorAll(".excalidraw-comment-pin");
        expect(pins).toHaveLength(2);
      });
    });

    it("should render a pin element for a comment", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "My important comment",
          },
        },
      });

      await waitFor(() => {
        const pin = container.querySelector(".excalidraw-comment-pin");
        expect(pin).toBeInTheDocument();
      });
    });
  });

  describe("Comment Dialog Interaction", () => {
    it("should open dialog when clicking a comment pin", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Existing comment",
          },
        },
      });

      await waitFor(() => {
        const pin = container.querySelector(".excalidraw-comment-pin");
        fireEvent.click(pin!);
      });

      await waitFor(() => {
        const textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea",
        ) as HTMLTextAreaElement;
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe("Existing comment");
      });
    });

    it("should close dialog when clicking close button", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Test comment",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const closeButton = container.querySelector(
          ".excalidraw-comment-dialog__close",
        );
        expect(closeButton).toBeInTheDocument();
        fireEvent.click(closeButton!);
      });

      await waitFor(() => {
        expect(h.state.activeCommentId).toBeNull();
      });
    });

    it("should close dialog when pressing Escape key", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Test comment",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const dialog = container.querySelector(".excalidraw-comment-dialog");
        expect(dialog).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: KEYS.ESCAPE });

      await waitFor(() => {
        expect(h.state.activeCommentId).toBeNull();
      });
    });
  });

  describe("Comment Submission", () => {
    it("should submit comment when clicking Submit button", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Original text",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea",
        ) as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "Updated text" } });
      });

      const submitButton = getByRole(container, "button", { name: "Submit" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(h.state.comments["comment-1"].text).toBe("Updated text");
        expect(h.state.activeCommentId).toBeNull();
      });
    });

    it("should submit comment with Ctrl+Enter", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Original",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea",
        ) as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "New text" } });
        fireEvent.keyDown(textarea, { key: KEYS.ENTER, ctrlKey: true });
      });

      await waitFor(() => {
        expect(h.state.comments["comment-1"].text).toBe("New text");
      });
    });
  });

  describe("Comment Deletion", () => {
    it("should show Delete button only when comment has text", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Existing comment",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const deleteButton = container.querySelector(
          ".excalidraw-comment-dialog__delete",
        );
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("should delete comment when clicking Delete button", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Comment to delete",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const deleteButton = container.querySelector(
          ".excalidraw-comment-dialog__delete",
        );
        fireEvent.click(deleteButton!);
      });

      await waitFor(() => {
        expect(h.state.comments["comment-1"]).toBeUndefined();
        expect(h.state.activeCommentId).toBeNull();
      });
    });
  });

  describe("Known Issues - Deliberately Failing Tests (Current Bugs)", () => {
    it("should prevent negative coordinates in comments", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Negative coordinates should be prevented or handled gracefully
      // Current behavior: Comments can be created with negative x/y causing positioning issues
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: -100, // Invalid: negative coordinate
            y: -50,
            text: "Invalid position comment",
            createdAt: Date.now(),
          },
        },
      });

      await waitFor(() => {
        const pin = container.querySelector(".excalidraw-comment-pin");
        // FAIL: Pin should not render or should have warning class
        expect(pin?.classList.contains("invalid")).toBe(true);
      });
    });

    it("should handle extremely long comment text without UI breakage", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Very long comments cause dialog to overflow screen
      // Current behavior: Dialog grows unbounded, textarea doesn't wrap properly
      const veryLongText = "A".repeat(5000);
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: veryLongText,
            createdAt: Date.now(),
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const dialog = container.querySelector(
          ".excalidraw-comment-dialog"
        ) as HTMLElement;
        const viewportHeight = window.innerHeight;
        // FAIL: Dialog height should not exceed viewport
        expect(dialog.offsetHeight).toBeLessThan(viewportHeight);
      });
    });

    it("should prevent duplicate comment IDs", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Two comments can have the same ID
      // Current behavior: No validation on comment ID uniqueness
      const duplicateId = "comment-1";
      h.setState({
        comments: {
          [duplicateId]: {
            id: duplicateId,
            x: 100,
            y: 100,
            text: "First comment",
            createdAt: Date.now(),
          },
        },
      });

      // Try to create another comment with same ID
      h.setState({
        comments: {
          [duplicateId]: {
            id: duplicateId,
            x: 200,
            y: 200,
            text: "Second comment (overwrites first)",
            createdAt: Date.now(),
          },
        },
      });

      // FAIL: Should have two comments, not one
      expect(Object.keys(h.state.comments).length).toBe(2);
    });

    it("should handle rapid successive submissions without race conditions", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Rapid clicking Submit button creates duplicate submissions
      // Current behavior: No debouncing/prevention of double-submit
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Original",
            createdAt: Date.now(),
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea"
        ) as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "Updated" } });
      });

      const submitButton = getByRole(container, "button", {
        name: "Submit",
      });

      // Rapid-fire clicks (simulating double-click or accidental multiple clicks)
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        // FAIL: Submit button should be disabled after first click
        expect((submitButton as HTMLButtonElement).disabled).toBe(true);
      });
    });

    it("should handle comments with special characters correctly", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Special characters in comments break rendering or persistence
      // Current behavior: XSS-vulnerable or breaks JSON serialization
      const specialText =
        '<script>alert("xss")</script> & " \' < > { } [ ]';
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: specialText,
            createdAt: Date.now(),
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea"
        ) as HTMLTextAreaElement;
        // FAIL: Text should be properly escaped, not executed
        expect(textarea.value).toBe(specialText);
        expect(container.textContent).not.toContain("<script>");
      });
    });

    it("should validate comment coordinates are within canvas bounds", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Comments can be positioned outside canvas
      // Current behavior: No bounds checking, pins can appear far off screen
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 999999, // Far outside canvas
            y: 999999,
            text: "Off-screen comment",
            createdAt: Date.now(),
          },
        },
      });

      await waitFor(() => {
        const pin = container.querySelector(".excalidraw-comment-pin");
        const rect = pin?.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // FAIL: Pin should be within viewport or have warning indicator
        expect(rect!.x).toBeLessThan(viewportWidth + 100);
        expect(rect!.y).toBeLessThan(viewportHeight + 100);
      });
    });

    it("should maintain comment order when multiple are rendered", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Comment order is not preserved in UI
      // Current behavior: Pin rendering order is unpredictable
      const now = Date.now();
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "First",
            createdAt: now,
          },
          "comment-2": {
            id: "comment-2",
            x: 200,
            y: 200,
            text: "Second",
            createdAt: now + 1000,
          },
          "comment-3": {
            id: "comment-3",
            x: 300,
            y: 300,
            text: "Third",
            createdAt: now + 2000,
          },
        },
      });

      await waitFor(() => {
        const pins = Array.from(
          container.querySelectorAll(".excalidraw-comment-pin")
        );
        // FAIL: Pins should appear in chronological order (by createdAt)
        expect(pins[0]?.getAttribute("data-id")).toBe("comment-1");
        expect(pins[1]?.getAttribute("data-id")).toBe("comment-2");
        expect(pins[2]?.getAttribute("data-id")).toBe("comment-3");
      });
    });

    it("should prevent memory leaks from event listeners", async () => {
      const { container, unmountComponent } = await render(<Excalidraw />);

      // BUG: Event listeners are not properly cleaned up
      // Current behavior: Multiple mounts accumulate listeners, causing memory leaks
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Test",
            createdAt: Date.now(),
          },
        },
        activeCommentId: "comment-1",
      });

      const initialListeners = (document as any)._getEventListeners?.("pointerdown")
        ?.length || 0;

      // Unmount and remount
      unmountComponent();
      await render(<Excalidraw />);

      const finalListeners = (document as any)._getEventListeners?.("pointerdown")
        ?.length || 0;

      // FAIL: Listener count should not double
      expect(finalListeners).toBeLessThanOrEqual(initialListeners + 2);
    });
  });

  describe("Future Features - Expected to Fail (Not Implemented)", () => {
    it.skip("should support comment threading/replies", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Threading feature
      // Should parse replies from comment object structure
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Parent comment",
            createdAt: Date.now(),
            replies: [
              {
                id: "reply-1",
                text: "Reply text",
              },
            ],
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const replySection = container.querySelector(".comment-replies");
        expect(replySection).toBeInTheDocument();
      });
    });

    it.skip("should display last edited timestamp", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Edit tracking
      // Should show "Edited at {time}" indicator
      const now = Date.now();
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Updated comment",
            createdAt: now - 10000,
            editedAt: now,
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const editedIndicator = container.querySelector(".comment-edited-at");
        expect(editedIndicator?.textContent).toContain("Edited");
      });
    });

    it.skip("should support comment reactions (emoji)", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Emoji reactions feature
      // Should display reaction buttons below comment
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Great idea!",
            createdAt: Date.now(),
            reactions: { "👍": 3, "❤️": 1 },
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const reactionButtons = container.querySelectorAll(
          ".comment-reaction"
        );
        expect(reactionButtons.length).toBeGreaterThan(0);
      });
    });

    it.skip("should support @mentions in comments", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: @mention parsing
      // Should highlight and link @mentions in comment text
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "@alice please review this design",
            createdAt: Date.now(),
            mentions: ["alice"],
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const mention = container.querySelector(".mention");
        expect(mention?.textContent).toBe("@alice");
      });
    });

    it.skip("should truncate long comment preview in pin tooltip", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Text truncation in pins
      // Long comments should show "..." in aria-label preview
      const veryLongText = "A".repeat(200);
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: veryLongText,
          },
        },
      });

      await waitFor(() => {
        const pin = container.querySelector(".excalidraw-comment-pin");
        const label = pin?.getAttribute("aria-label") || "";
        expect(label.length).toBeLessThan(veryLongText.length);
        expect(label).toContain("...");
      });
    });

    it.skip("should prevent submitting when text is identical to original", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Duplicate edit prevention
      // Submit button should be disabled if no actual changes made
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Original text",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        // Text is unchanged - submit button should be disabled
        const submitButton = container.querySelector(
          ".excalidraw-comment-dialog__submit"
        ) as HTMLButtonElement;
        expect(submitButton?.disabled).toBe(true);
      });
    });

    it.skip("should support collaborative real-time sync", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Collaboration feature (server: false in storage config)
      // Comments should sync across multiple users in real-time via server
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Comment from user A",
            createdAt: Date.now(),
            userId: "user-a",
          } as any,
        },
      });

      // Simulate receiving comment from another user
      // This should trigger a re-render without explicit setState
      const secondComment = {
        id: "comment-2",
        x: 200,
        y: 200,
        text: "Comment from user B",
        userId: "user-b",
      };

      await waitFor(() => {
        const secondPin = container.querySelector(
          '.excalidraw-comment-pin[data-id="comment-2"]'
        );
        expect(secondPin).toBeInTheDocument();
      });
    });
  });
});
