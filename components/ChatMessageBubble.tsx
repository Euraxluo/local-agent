"use client";

import React from "react";
import { ChatWindowMessage } from "@/schema/ChatWindowMessage";

interface ChatMessageBubbleProps {
  message: ChatWindowMessage;
  aiEmoji?: React.ReactNode;
  onRemovePressed?: () => void;
}

export function ChatMessageBubble({ message, aiEmoji, onRemovePressed }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-[80%] ${
          isUser
            ? "bg-blue-500 text-white rounded-l-lg rounded-br-lg"
            : "bg-gray-200 text-gray-800 rounded-r-lg rounded-bl-lg"
        } px-4 py-2`}
      >
        {!isUser && aiEmoji && <span className="mr-2">{aiEmoji}</span>}
        <div className="whitespace-pre-wrap">{message.content}</div>
        {onRemovePressed && (
          <button
            onClick={onRemovePressed}
            className="ml-2 text-sm opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}