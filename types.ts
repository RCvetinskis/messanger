import { Conversation, Message, User } from "@prisma/client";

export type CreateConversationProps = {
  userId: string;
  isGroup?: boolean;
  members?: { value: string }[];
  name?: string;
};

export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};

export type SendMessageType = {
  message?: string;
  image?: string;
  conversationId: string;
};
