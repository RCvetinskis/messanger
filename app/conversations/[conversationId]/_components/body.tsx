"use client";
import useConversation from "@/hooks/useConversation";
import { FullMessageType } from "@/types";
import React, { useRef, useState, useEffect } from "react";
import { MessageBox } from "./message-box";
import { setSeenMessages } from "@/actions/messages";
import { pusherClient } from "@/libs/pusher";
import { find } from "lodash";
interface BodyProps {
  initialMessages: FullMessageType[];
}

export const Body = ({ initialMessages }: BodyProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    setSeenMessages(conversationId).catch(() =>
      console.log("ERROR IN USEFFECT SEEN MESSAGES")
    );
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);

    bottomRef?.current?.scrollIntoView();

    const messageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => {
        if (find(current, { id: newMessage.id })) {
          return current;
        }
        return [...current, newMessage];
      });

      bottomRef?.current?.scrollIntoView();
      setSeenMessages(conversationId).catch(() =>
        console.log("ERROR IN MESSAGEHANDLER SEEN MESSAGES")
      );
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }
          return currentMessage;
        })
      );
    };

    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updateMessageHandler);
    };
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
