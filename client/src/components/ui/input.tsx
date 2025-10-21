import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";
import type * as React from "react";

function Input({
  className,
  type,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: React.ComponentProps<"input">) {
  // Get dialog composition context if available (will be no-op if not inside Dialog)
  const dialogComposition = useDialogComposition();

  // Add composition event handlers to support input method editor (IME) para CJK languages.
  const compositionHandlers = useComposition<HTMLInputElement>({
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      const nativeEvent = e.nativeEvent as { isComposing?: boolean };
      const isComposing = nativeEvent.isComposing || dialogComposition.justEndedComposing();
      if (e.key === "Enter" && isComposing) {
        return;
      }
      onKeyDown?.(e);
    },
    onCompositionStart: (e: React.CompositionEvent<HTMLInputElement>) => {
      dialogComposition.setComposing(true);
      onCompositionStart?.(e);
    },
    onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => {
      dialogComposition.markCompositionEnd();
      setTimeout(() => {
        dialogComposition.setComposing(false);
      }, 100);
      onCompositionEnd?.(e);
    },
  });

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onCompositionStart={compositionHandlers.onCompositionStart}
      onCompositionEnd={compositionHandlers.onCompositionEnd}
      onKeyDown={compositionHandlers.onKeyDown}
      {...props}
    />
  );
}

export { Input };
