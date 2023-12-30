"use server";
import { db } from "@/libs/prismaDb";
import { getCurrentUser } from "@/libs/user-service";
import { SendMessageType } from "@/types";
import { pusherClient, pusherServer } from "@/libs/pusher";

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

    // wesbcoket add new message in real time
    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessage],
      });
    });

    return newMessage;
  } catch (error) {
    console.log("ERROR IN SEND MESSAGE");
    throw error;
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

    // Update all connections with new seen
    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    // If user has already seen the message, no need to go further
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return conversation;
    }

    // Update last message seen
    await pusherServer.trigger(
      conversationId!,
      "message:update",
      updatedMessage
    );
    return updatedMessage;
  } catch (error) {
    console.log("ERROR IN CREATE SETSEENMESSAGES");
    throw error;
  }
};
