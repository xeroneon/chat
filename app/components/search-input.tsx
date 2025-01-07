import * as React from "react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { PiMagnifyingGlassBold } from "react-icons/pi";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  initialValue?: string;
}

export function SearchInput({
  className,
  initialValue,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Input
        type="search"
        name="search"
        placeholder="Search for a friend..."
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
        <PiMagnifyingGlassBold size={20} />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
}
