"use client";

import { Modal } from "@/components/modal";
import Image from "next/image";

interface ImageModalProps {
  src?: string | null;
  isOpen?: boolean;
  onClose: () => void;
}
export const ImageModal = ({ isOpen, src, onClose }: ImageModalProps) => {
  if (!src) {
    return null;
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80 h-80">
        <Image alt="Image" className="object-cover" fill src={src} />
      </div>
    </Modal>
  );
};
