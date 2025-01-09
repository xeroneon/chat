import React from "react";
import { Separator } from "./ui/separator";

type Props = {
  text: string;
};

export default function TitleSeparator({ text }: Props) {
  return (
    <div className="flex items-center mt-2">
      <h1 className="font-bold text-lg">{text}</h1>
    </div>
  );
}
