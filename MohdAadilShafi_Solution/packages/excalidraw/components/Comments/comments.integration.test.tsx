import React from "react";
import { Excalidraw } from "../../index";
import {
  render,
  waitFor,
  fireEvent,
  getByRole,
} from "../../tests/test-utils";
import { UI } from "../../tests/helpers/ui";

const { h } = window;

describe("Comments Integration Tests (P2P)", () => {
  describe("Comment Tool Activation", () => {
    it("should activate comment tool when clicking toolbar button", async () => {
      await render(<Excalidraw />);

      UI.clickTool("comment");

      await waitFor(() => {
        expect(h.state.activeTool.type).toBe("comment");
      });
    });
  });

  describe("Comment Dialog with Direct State Setup", () => {
    it("should open and close comment dialog using button", async () => {
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

      const closeButton = container.querySelector(
        ".excalidraw-comment-dialog__close",
      );
      fireEvent.click(closeButton!);

      await waitFor(() => {
        expect(h.state.activeCommentId).toBeNull();
      });
    });

    it("should submit comment text changes", async () => {
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
        expect(textarea.value).toBe("Original text");
      });

      const textarea = container.querySelector(
        ".excalidraw-comment-dialog__textarea",
      ) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Updated text" } });

      const submitButton = getByRole(container, "button", { name: "Submit" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(h.state.comments["comment-1"].text).toBe("Updated text");
        expect(h.state.activeCommentId).toBeNull();
      });
    });

    it("should delete comment using Delete button", async () => {
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

  describe("Multiple Comments Workflow", () => {
    it("should handle multiple comments independently", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "First comment",
          },
          "comment-2": {
            id: "comment-2",
            x: 200,
            y: 200,
            text: "Second comment",
          },
        },
      });

      await waitFor(() => {
        const pins = container.querySelectorAll(".excalidraw-comment-pin");
        expect(pins).toHaveLength(2);
      });
    });
  });

  describe("Comment Dialog UI Elements", () => {
    it("should display form elements", async () => {
      const { container } = await render(<Excalidraw />);

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Test",
          },
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea",
        );
        const submitButton = container.querySelector(
          ".excalidraw-comment-dialog__submit",
        );
        const closeButton = container.querySelector(
          ".excalidraw-comment-dialog__close",
        );

        expect(textarea).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
        expect(closeButton).toBeInTheDocument();
      });
    });

    it("should disable Submit button when textarea is empty", async () => {
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
        fireEvent.change(textarea, { target: { value: "" } });
      });

      const submitButton = container.querySelector(
        ".excalidraw-comment-dialog__submit",
      ) as HTMLButtonElement;

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Comment Dialog Keyboard Shortcuts", () => {
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

      let textarea: HTMLTextAreaElement;
      await waitFor(() => {
        textarea = container.querySelector(
          ".excalidraw-comment-dialog__textarea",
        ) as HTMLTextAreaElement;
        expect(textarea).toBeInTheDocument();
      });

      fireEvent.change(textarea!, { target: { value: "Updated via keyboard" } });
      fireEvent.keyDown(textarea!, { key: "Enter", ctrlKey: true });

      await waitFor(() => {
        expect(h.state.comments["comment-1"].text).toBe("Updated via keyboard");
        expect(h.state.activeCommentId).toBeNull();
      });
    });
  });

  describe("Known Issues - Deliberately Failing Tests (Current Bugs)", () => {
    it("should prevent closing and reopening comment without losing focus", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Focus is lost when rapidly opening/closing dialogs
      // Current behavior: No focus management between dialog transitions
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

      let textarea: HTMLTextAreaElement;
      await waitFor(() => {
        textarea = getByRole(container, "textbox") as HTMLTextAreaElement;
        expect(document.activeElement).toBe(textarea);
      });

      const closeButton = getByLabelText(container, "Close comment");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(h.state.activeCommentId).toBeNull();
      });

      // Re-open immediately
      const pin = getByLabelText(container, "Comment: Test");
      fireEvent.click(pin);

      // FAIL: Focus should immediately return to textarea
      await waitFor(() => {
        expect(document.activeElement).toBe(
          container.querySelector(".excalidraw-comment-dialog__textarea")
        );
      });
    });

    it("should handle localStorage quota exceeded gracefully", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: No error handling when localStorage quota is full
      // Current behavior: Silent failure, comments don't persist
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error("QuotaExceededError");
      };

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Large comment",
            createdAt: Date.now(),
          },
        },
        activeCommentId: "comment-1",
      });

      const textarea = getByRole(container, "textbox") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Updated text" } });
      const submitButton = getByRole(container, "button", { name: "Submit" });
      fireEvent.click(submitButton);

      // FAIL: Should show error message or toast notification
      await waitFor(() => {
        const errorMessage = container.querySelector(".error-toast");
        expect(errorMessage?.textContent).toContain("storage");
      });

      Storage.prototype.setItem = originalSetItem;
    });

    it("should prevent comment creation when tool is not active", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Comments can be created even when tool is not active
      // Current behavior: Canvas click creates comments regardless of tool state
      h.setState({
        activeTool: { type: "selection" }, // Not comment tool
      });

      const canvas = container.querySelector(
        "canvas.interactive"
      ) as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();

      fireEvent.click(canvas, {
        clientX: rect.left + 100,
        clientY: rect.top + 100,
      });

      // FAIL: Should not create comment if tool not active
      expect(Object.keys(h.state.comments).length).toBe(0);
    });

    it("should properly handle pan/zoom affecting comment pin positions", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Comment pins don't update position when canvas is panned/zoomed
      // Current behavior: Pins stay in original viewport position, don't follow content
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 0,
            y: 0,
            text: "Comment at origin",
            createdAt: Date.now(),
          },
        },
      });

      const pin = getByLabelText(
        container,
        "Comment: Comment at origin"
      ) as HTMLElement;
      const initialLeft = pin.style.left;

      // Pan canvas (simulate viewport scroll in scene space)
      h.setState({
        scrollX: 100,
        scrollY: 100,
      });

      // FAIL: Pin position should update to reflect pan
      expect(pin.style.left).not.toBe(initialLeft);
    });

    it("should validate comment text is not null or undefined", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Comments can have null/undefined text causing crashes
      // Current behavior: No validation, can break rendering
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: null, // Invalid: null text
            createdAt: Date.now(),
          } as any,
        },
      });

      // FAIL: Should use default text or skip rendering
      const pin = container.querySelector(".excalidraw-comment-pin");
      expect(pin?.getAttribute("aria-label")).not.toContain("null");
    });

    it("should prevent infinite loops when activeCommentId references non-existent comment", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Orphaned activeCommentId causes console errors
      // Current behavior: Dialog tries to render non-existent comment data
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Valid comment",
            createdAt: Date.now(),
          },
        },
        activeCommentId: "comment-999", // References deleted comment
      });

      // FAIL: Dialog should not render or should show "comment deleted" message
      await waitFor(() => {
        const dialog = container.querySelector(".excalidraw-comment-dialog");
        expect(dialog).not.toBeInTheDocument();
      });
    });

    it("should handle simultaneous edits to same comment cleanly", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Concurrent updates can cause data loss (simulation)
      // Current behavior: Last write wins, no merge strategy
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

      const textarea = getByRole(container, "textbox") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Edit A" } });

      // Simulate another edit coming in from elsewhere
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Edit B",
            createdAt: Date.now(),
          },
        },
      });

      // FAIL: Should resolve conflict or notify user
      const updatedTextarea = getByRole(
        container,
        "textbox"
      ) as HTMLTextAreaElement;
      expect(updatedTextarea.value).toBe("Edit A"); // Local edit should persist
    });

    it("should handle exporting comments with corrupted createdAt field", async () => {
      const { container } = await render(<Excalidraw />);

      // BUG: Corrupted timestamp breaks export
      // Current behavior: Export includes invalid dates causing JSON stringify to fail
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Comment",
            createdAt: "invalid-date", // Invalid: string instead of number
          } as any,
        },
      });

      // Try to export
      try {
        JSON.stringify(h.state.comments);
        // FAIL: Should either validate or sanitize before export
        const isValid = Object.values(h.state.comments).every(
          (c: any) => typeof c.createdAt === "number"
        );
        expect(isValid).toBe(true);
      } catch (e) {
        // Should not throw during normal operation
        expect(e).not.toBeDefined();
      }
    });
  });

  describe("Future Features - Expected to Fail (Not Implemented)", () => {
    it.skip("should support adding replies to existing comments", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Threading feature
      UI.clickTool("comment");

      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Original comment",
            createdAt: Date.now(),
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const replyButton = getByRole(container, "button", { name: "Reply" });
        expect(replyButton).toBeInTheDocument();
      });
    });

    it.skip("should export comments with metadata to file", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Comments export feature
      // Should be able to export all comments as JSON with user info, timestamps, etc
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Comment to export",
            createdAt: Date.now(),
          } as any,
        },
      });

      const exportButton = getByRole(container, "button", {
        name: "Export Comments",
      });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(container.querySelector(".export-dialog")).toBeInTheDocument();
      });
    });

    it.skip("should support comment search/filter", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Comment search feature
      // Should be able to search through all comments by text
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "This is a test comment",
            createdAt: Date.now(),
          },
          "comment-2": {
            id: "comment-2",
            x: 200,
            y: 200,
            text: "Another comment with different text",
            createdAt: Date.now(),
          },
        } as any,
      });

      const searchInput = getByRole(container, "textbox", {
        name: "Search comments",
      });
      fireEvent.change(searchInput, { target: { value: "test" } });

      await waitFor(() => {
        const pins = container.querySelectorAll(".excalidraw-comment-pin");
        expect(pins).toHaveLength(1);
      });
    });

    it.skip("should resolve/close comments to mark as addressed", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Comment resolution feature
      // Should be able to mark comments as resolved (e.g., feedback addressed)
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Please fix this issue",
            createdAt: Date.now(),
            resolved: false,
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const resolveButton = getByRole(container, "button", {
          name: "Mark as Resolved",
        });
        fireEvent.click(resolveButton);
      });

      await waitFor(() => {
        expect((h.state.comments["comment-1"] as any).resolved).toBe(true);
      });
    });

    it.skip("should support comment bulk operations", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Bulk comment operations
      // Should be able to select multiple comments and delete/export them together
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Comment 1",
          },
          "comment-2": {
            id: "comment-2",
            x: 200,
            y: 200,
            text: "Comment 2",
          },
          "comment-3": {
            id: "comment-3",
            x: 300,
            y: 300,
            text: "Comment 3",
          },
        },
      });

      const selectAllButton = getByRole(container, "button", {
        name: "Select all comments",
      });
      fireEvent.click(selectAllButton);

      const deleteButton = getByRole(container, "button", {
        name: "Delete selected",
      });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(Object.keys(h.state.comments).length).toBe(0);
      });
    });

    it.skip("should notify users when comments are mentioned", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: User mentions & notifications
      // Should send notification when user is @mentioned in a comment
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "@Alice can you check this?",
            createdAt: Date.now(),
            mentions: ["user-1"],
          } as any,
        },
      } as any);

      await waitFor(() => {
        const notification = container.querySelector(".notification");
        expect(notification?.textContent).toContain("mentioned");
      });
    });

    it.skip("should support comment pinning (highlighting important comments)", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: Comment pinning/importance feature
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "Critical issue!",
            createdAt: Date.now(),
            isPinned: true,
          } as any,
        },
        activeCommentId: "comment-1",
      });

      await waitFor(() => {
        const pinButton = getByRole(container, "button", { name: /pinned/i });
        expect(pinButton).toBeInTheDocument();
      });
    });

    it.skip("should support integrating comments with version control (git blame)", async () => {
      const { container } = await render(<Excalidraw />);

      // NOT IMPLEMENTED: VCS integration
      // Should link comments to git commits or line changes
      h.setState({
        comments: {
          "comment-1": {
            id: "comment-1",
            x: 100,
            y: 100,
            text: "This line was changed in commit abc123",
            createdAt: Date.now(),
            linkedCommit: "abc123",
          } as any,
        },
      });

      await waitFor(() => {
        const commitLink = container.querySelector(".commit-link");
        expect(commitLink?.getAttribute("href")).toContain("abc123");
      });
    });
  });
});
