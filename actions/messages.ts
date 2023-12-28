"use server";
import { db } from "@/libs/prismaDb";
import { getCurrentUser } from "@/libs/user-service";
import { SendMessageType } from "@/types";

export const sendMessage = async (params: SendMessageType) => {
  try {
    const currentUser = await getCurrentUser();

    const { message, image, conversationId } = params;
    if (!currentUser?.id || !currentUser?.email) {
      throw new Error("No user found");
    }

    const newMessage = await db.message.create({
      data: {
        body: message,
        image,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser.id,
          },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        seen: true,
        sender: true,
      },
    });

    const updatedConversation = await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });
    return newMessage;
  } catch {
    console.log("Error in send messages");
    return null;
  }
};

export const setSeenMessages = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      throw new Error("Unauthorized");
    }
    // find the existing conversation
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      throw new Error("Invalid id, conversation not found");
    }

    // find the last message

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return conversation;
    }

    // update seen of last message

    const updatedMessage = await db.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });
    return updatedMessage;
  } catch {
    console.log("Error in set messages seen");
    return null;
  }
};
