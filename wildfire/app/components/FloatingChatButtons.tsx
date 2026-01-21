// app/components/FloatingChatButtons.tsx
"use client";

import { TouchButton } from "@/app/components/MobileOptimized";

type Props = {
  onChatWithMentor: () => void;
  onShareWithDad: () => void;
};

export function FloatingChatButtons({
  onChatWithMentor,
  onShareWithDad,
}: Props) {
  return (
    <div
      className="
        fixed
        right-4
        bottom-24
        z-[10000]
        flex flex-col gap-3
        pointer-events-auto
      "
    >
      <TouchButton variant="secondary" onClick={onChatWithMentor}>
        Chat with mentor
      </TouchButton>
      <TouchButton variant="primary" onClick={onShareWithDad}>
        Share with Dad
      </TouchButton>
    </div>
  );
}
