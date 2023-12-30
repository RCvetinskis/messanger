"use client";
import { Input } from "@/components/inputs/input";
import { Modal } from "@/components/modal";
import { Select } from "@/components/inputs/select";
import { User } from "@prisma/client";
import { Button } from "@/components/button";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { onCreateConversation } from "@/actions/conversation";

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}
export const GroupChatModal = ({
  isOpen,
  onClose,
  users,
}: GroupChatModalProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const members = watch("members");

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const props = { ...data, isGroup: true };

    startTransition(() => {
      onCreateConversation(props)
        .then(() => {
          router.refresh();
          onClose();
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12 ">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create a group chat
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Create a chat with more than 2 people
            </p>
            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                disabled={isPending}
                register={register}
                label="Name"
                id="name"
                required
                errors={errors}
              />
              <Select
                disabled={isPending}
                label="Members"
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
                value={members}
                onChange={(value) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button
              disabled={isPending}
              onClick={onClose}
              type="button"
              secondary
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              Create
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
