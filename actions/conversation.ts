"use server";
import { getCurrentUser } from "@/libs/user-service";
import { db } from "@/libs/prismaDb";
import { CreateConversationProps } from "@/types";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/libs/pusher";

export const onCreateConversation = async (props: CreateConversationProps) => {
  try {
    const currentUser = await getCurrentUser();
    const { userId, isGroup, members, name } = props;

    if (!currentUser?.id || !currentUser?.email) {
      throw new Error("Unauthorized");
    }
    if (isGroup && (!members || members.length < 2 || !name)) {
      throw new Error("Invalid data");
    }
    // if group conversation
    if (isGroup && members) {
      const newConversation = await db.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      revalidatePath("/conversations");
      revalidatePath(`/conversations/${newConversation.id}`);

      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      return newConversation;
    }

    // if single conversation
    if (userId) {
      const existingConversations = await db.conversation.findMany({
        where: {
          OR: [
            {
              userIds: {
                equals: [currentUser.id, userId],
              },
            },
            {
              userIds: {
                equals: [userId, currentUser.id],
              },
            },
          ],
        },
      });

      const singleConversation = existingConversations[0];
      if (singleConversation) {
        return singleConversation;
      }
      const newConversation = db.conversation.create({
        data: {
          users: {
            connect: [
              {
                id: currentUser.id,
              },
              {
                id: userId,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      revalidatePath("/conversations");
      revalidatePath(`/conversations/${currentUser.id}`);

      const resolvedConversation = await newConversation;

      resolvedConversation.users.map((user) => {
        if (user.email) {
          pusherServer.trigger(
            user.email,
            "conversation:new",
            resolvedConversation
          );
        }
      });

      return resolvedConversation;
    }
  } catch (error) {
    console.log("ERROR IN CREATE CONVERSATION");
    throw error;
  }
};

export const onDeleteConversation = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      throw new Error("Unauthorized");
    }
    const existingConversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!existingConversation) {
      throw new Error("Invalid conversation id");
    }

    const deletedConversation = await db.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    revalidatePath("/conversations");
    revalidatePath(`/conversations/${currentUser.id}`);
    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:delete", {
          conversation: existingConversation,
          currentUser: currentUser.name,
        });
      }
    });

    return deletedConversation;
  } catch (error) {
    console.log("Error IN ONDELTECONVERSATION");
    throw error;
  }
};
