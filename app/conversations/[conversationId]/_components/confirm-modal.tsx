"use client";

import useConversation from "@/hooks/useConversation";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";

import { Modal } from "@/components/modal";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/button";
import { onDeleteConversation } from "@/actions/conversation";

interface ConfirmModalProps {
  isOpen?: boolean;
  onClose: () => void;
}
export const ConfirmModal = ({ isOpen, onClose }: ConfirmModalProps) => {
  const router = useRouter();
  const { conversationId } = useConversation();

  const [isPending, setTransition] = useTransition();
  const onDelete = () => {
    setTransition(() => {
      onDeleteConversation(conversationId)
        .then(() => {
          router.push("/conversations");
          router.refresh();
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Delete conversation
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this conversation?
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button disabled={isPending} danger onClick={onDelete}>
          Delete
        </Button>

        <Button disabled={isPending} secondary onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
