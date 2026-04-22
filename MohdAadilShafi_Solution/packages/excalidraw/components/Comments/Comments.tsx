import React from "react";

import { sceneCoordsToViewportCoords } from "@excalidraw/common";

import { CommentDialog } from "./CommentDialog";
import { CommentPin } from "./CommentPin";

import "./Comments.scss";

import type { AppState } from "../../types";

export interface CommentsProps {
  appState: AppState;
  onOpenComment: (id: string | null) => void;
  onSubmitComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
}

/**
 * Overlay that renders a pin per `appState.comments` entry and, if one is
 * active, the attached dialog. All coordinates are converted from scene space
 * to viewport space so pins track pan/zoom.
 */
export const Comments = ({
  appState,
  onOpenComment,
  onSubmitComment,
  onDeleteComment,
}: CommentsProps) => {
  const comments = Object.values(appState.comments);
  const activeComment = appState.activeCommentId
    ? appState.comments[appState.activeCommentId]
    : null;

  return (
    <>
      {comments.map((comment) => {
        const { x, y } = sceneCoordsToViewportCoords(
          { sceneX: comment.x, sceneY: comment.y },
          appState,
        );
        return (
          <CommentPin
            key={comment.id}
            comment={comment}
            x={x}
            y={y}
            isActive={appState.activeCommentId === comment.id}
            onClick={() => onOpenComment(comment.id)}
          />
        );
      })}
      {activeComment &&
        (() => {
          const { x, y } = sceneCoordsToViewportCoords(
            { sceneX: activeComment.x, sceneY: activeComment.y },
            appState,
          );
          return (
            <CommentDialog
              comment={activeComment}
              anchorX={x}
              anchorY={y}
              onSubmit={(text) => onSubmitComment(activeComment.id, text)}
              onClose={() => onOpenComment(null)}
              onDelete={() => onDeleteComment(activeComment.id)}
            />
          );
        })()}
    </>
  );
};
