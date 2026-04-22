import React from "react";

import "./Comments.scss";

import type { Comment } from "../../types";

export interface CommentPinProps {
  comment: Comment;
  /** viewport-space position (pixels from canvas container top-left) */
  x: number;
  y: number;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Small circular marker rendered above the canvas. Clicking expands the
 * associated comment dialog.
 */
export const CommentPin = ({
  comment,
  x,
  y,
  isActive,
  onClick,
}: CommentPinProps) => {
  const hasText = comment.text.length > 0;
  return (
    <button
      type="button"
      className={`excalidraw-comment-pin${
        isActive ? " excalidraw-comment-pin--active" : ""
      }`}
      style={{ left: `${x}px`, top: `${y}px` }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label="Comment"
    >
      <span className="excalidraw-comment-pin__dot" />
    </button>
  );
};
