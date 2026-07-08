// app/components/MobileOptimized.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// Bottom Sheet Component
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Desktop: centered modal
    return isOpen ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-lg px-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-md rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 px-6 py-7 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-200"
          >
            ✕
          </button>
          {children}
        </motion.div>
      </motion.div>
    ) : null;
  }

  // Mobile: bottom sheet with safe bottom padding, no horizontal scroll
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9998] bg-black/50"
        />
      )}

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30 }}
        className="
          fixed
          inset-x-0
          bottom-0
          z-[9999]
          rounded-t-3xl
          border-t border-cyan-400/30
          bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95
          px-3
          pt-2
          pb-[calc(1rem+env(safe-area-inset-bottom,0px))]
          max-h-[80vh]
          overflow-y-auto
          overflow-x-hidden
        "
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-2">
          <div className="h-1 w-10 rounded-full bg-slate-600" />
        </div>

        {title && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        <div className="w-full max-w-md mx-auto pb-4">{children}</div>
      </motion.div>
    </>
  );
}

// Responsive Container
export function ResponsiveContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        w-full
        max-w-7xl
        mx-auto
        px-4 md:px-6 lg:px-8
        overflow-x-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Touch-friendly button
export function TouchButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        min-h-[44px]
        min-w-[44px]
        px-4 py-3
        rounded-full
        font-semibold
        text-sm md:text-base
        transition-all
        ${
          variant === "primary"
            ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black"
            : "bg-slate-800 text-white"
        }
        disabled:opacity-50
        overflow-hidden
      `}
    >
      {children}
    </motion.button>
  );
}
