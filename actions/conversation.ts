"use server";
import { getCurrentUser } from "@/libs/user-service";
import { db } from "@/libs/prismaDb";
import { CreateConversationProps } from "@/types";

export const createConversation = async (props: CreateConversationProps) => {
  try {
    const currentUser = await getCurrentUser();
    const { userId, isGroup, members, name } = props;

    if (!currentUser?.id || !currentUser?.email) {
      throw new Error("Unauthorized");
    }
    if (isGroup && (!members || members.length < 2 || !name)) {
      throw new Error("Invalid data");
    }

    if (isGroup && members) {
      const newConversation = await db.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value?: string }) => ({
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
      return newConversation;
    }
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

    return newConversation;
  } catch {
    return null;
  }
};
