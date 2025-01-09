import * as React from "react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { PiMagnifyingGlassBold, PiAirplaneBold } from "react-icons/pi";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  initialValue?: string;
}

export function ChatInput({
  className,
  initialValue,
  ...props
}: SearchInputProps) {
  // Add state to handle keyboard visibility
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const handleResize = () => {
    if (window.visualViewport) {
      const viewportHeight = window.visualViewport.height;
      const keyboardHeight = window.innerHeight - viewportHeight;
      setKeyboardHeight(keyboardHeight);
    }
  };

  React.useEffect(() => {
    // Listen for viewport changes which occur when the keyboard opens/closes
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 w-[calc(100%-2rem)] mx-4 shrink-0 transition-all duration-300",
        className
      )}
      style={{ bottom: `${keyboardHeight + 15}px` }}
    >
      <Input
        type="input"
        name="search"
        placeholder="Message..."
        className="pr-10 rounded-full border-[3px] border-black dark:border-white"
        defaultValue={initialValue}
        onFocus={() => {
          // Optional: If you want to force adjust when focused on mobile
          if (window.innerWidth < 768) {
            // Assuming mobile screen width
            handleResize();
          }
        }}
        {...props}
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      >
        <PiMagnifyingGlassBold size={20} />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
}
