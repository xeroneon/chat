import * as React from "react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { PiPaperPlaneTiltDuotone } from "react-icons/pi";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  initialValue?: string;
}

export function ChatInput({
  className,
  initialValue,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "input-container w-[calc(100%-2rem)] mx-4 transition-all duration-300",
        className
      )}
    >
      <Input
        type="input"
        name="message"
        placeholder="Message..."
        className="pr-10 rounded-full border-[3px] border-black dark:border-white"
        defaultValue={initialValue}
        {...props}
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      >
        <PiPaperPlaneTiltDuotone size={20} />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
}
