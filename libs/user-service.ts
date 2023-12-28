import { db } from "@/libs/prismaDb";
import { getSession } from "./auth-service";

export const getCurrentUser = async () => {
  try {
    const session = await getSession();
    if (!session?.user?.email) return null;

    const currentUser = await db.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!currentUser) return null;

    return currentUser;
  } catch {
    return null;
  }
};

export const getUsers = async () => {
  const session = await getSession();
  const selfUser = session?.user;
  if (!selfUser?.email) return [];

  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: selfUser?.email,
        },
      },
    });
    return users;
  } catch {
    return [];
  }
};
