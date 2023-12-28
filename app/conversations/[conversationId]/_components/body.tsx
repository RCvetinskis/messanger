"use client";
import useConversation from "@/hooks/useConversation";
import { FullMessageType } from "@/types";
import React, { useRef, useState, useEffect } from "react";
import { MessageBox } from "./message-box";
import { setSeenMessages } from "@/actions/messages";
interface BodyProps {
  initialMessages: FullMessageType[];
}

export const Body = ({ initialMessages }: BodyProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    setSeenMessages(conversationId).catch(() =>
      console.log("Error in useffect getting  seen messages")
    );
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          key={message.id}
          isLast={i === messages.length - 1}
          data={message}
        />
      ))}

      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};
