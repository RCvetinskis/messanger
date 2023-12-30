"use client";

import { Avatar } from "@/components/avatar";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { onCreateConversation } from "@/actions/conversation";
import { CreateConversationProps } from "@/types";
import toast from "react-hot-toast";
import { LoadingModal } from "@/components/loading-modal";
interface UserBoxProps {
  data: User;
}

export const UserBox = ({ data }: UserBoxProps) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      const props: CreateConversationProps = {
        userId: data.id,
      };
      onCreateConversation(props)
        .then((data) => {
          router.push(`/conversations/${data?.id}`);
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };
  return (
    <>
      {isPending && <LoadingModal />}

      <div
        onClick={handleClick}
        className="w-full relative flex items-center space-x-3 b-white p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
      >
        <Avatar user={data} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-900">{data.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
