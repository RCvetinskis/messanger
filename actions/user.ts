"use server";
import { db } from "@/libs/prismaDb";
import { getCurrentUser } from "@/libs/user-service";
import { revalidatePath } from "next/cache";

export const onUpdateUser = async (name: string, image: any) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("Unauthorzied");
    }
    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        image,
      },
    });

    revalidatePath("/");
    return updatedUser;
  } catch (error) {
    console.log("ERROR IN ON UPDATE USER");
    throw error;
  }
};
