"use client";

import useConversation from "@/hooks/useConversation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";

import { MessageInput } from "./message-input";
import { sendMessage } from "@/actions/messages";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { CldUploadButton } from "next-cloudinary";

export const Form = () => {
  const { conversationId } = useConversation();

  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    startTransition(() => {
      setValue("message", "", { shouldValidate: true });
      const params = { ...data, conversationId };
      sendMessage(params).catch(() => toast.error("Message was not sent"));
    });
  };

  const handleUpload = (result: any) => {
    if (!isPending) {
      startTransition(() => {
        const params = { image: result?.info?.secure_url, conversationId };
        sendMessage(params).catch(() => toast.error("Message was not sent"));
      });
    }
  };
  return (
    <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
      <CldUploadButton
        options={{ maxFiles: 1 }}
        onUpload={handleUpload}
        uploadPreset="ic7wrbaa"
      >
        <HiPhoto
          size={30}
          className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
        />
      </CldUploadButton>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
          disabled={isPending}
        />
        <button
          disabled={isPending}
          type="submit"
          className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition"
        >
          <HiPaperAirplane size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
};
