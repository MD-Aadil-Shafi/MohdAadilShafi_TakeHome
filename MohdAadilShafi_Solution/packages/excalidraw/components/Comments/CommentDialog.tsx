import React, { useEffect, useRef, useState } from "react";

import { KEYS } from "@excalidraw/common";
import { CloseIcon } from "../icons";

import "./Comments.scss";

import type { Comment } from "../../types";

export interface CommentDialogProps {
  comment: Comment;
  /** viewport-space position of the anchor (pin); dialog is placed relative to it */
  anchorX: number;
  anchorY: number;
  /** called when user presses Submit (or Cmd/Ctrl+Enter). `text` is the raw textarea value. */
  onSubmit: (text: string) => void;
  /** called when user dismisses without submitting (Esc, click outside) */
  onClose: () => void;
  /** optional destroy; used from the expanded view */
  onDelete?: () => void;
}

/**
 * Reusable floating comment panel. Anchored to a scene point via absolute
 * left/top (caller converts scene→viewport coords).
 *
 * Designed to grow into a thread view (list of messages + reply box); today
 * it's textarea + submit only.
 */
export const CommentDialog = ({
  comment,
  anchorX,
  anchorY,
  onSubmit,
  onClose,
  onDelete,
}: CommentDialogProps) => {
  const [text, setText] = useState(comment.text);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleDocPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    // defer so the click that opened the dialog doesn't immediately close it
    const id = window.setTimeout(() => {
      document.addEventListener("pointerdown", handleDocPointerDown);
    }, 0);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", handleDocPointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = () => {
    onSubmit(text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === KEYS.ENTER && event.ctrlKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      ref={containerRef}
      className="excalidraw-comment-dialog"
      style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="excalidraw-comment-dialog__header">
        <button
          type="button"
          className="excalidraw-comment-dialog__close"
          onClick={onClose}
        >
          {CloseIcon}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="excalidraw-comment-dialog__textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment…"
        rows={3}
      />
      <div className="excalidraw-comment-dialog__actions">
        {onDelete && comment.text && (
          <button
            type="button"
            className="excalidraw-comment-dialog__delete"
            onClick={onDelete}
          >
            Delete
          </button>
        )}
        <button
          type="button"
          className="excalidraw-comment-dialog__submit"
          onClick={handleSubmit}
          disabled={!text.trim()}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
