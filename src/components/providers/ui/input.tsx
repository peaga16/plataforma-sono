import { InputHTMLAttributes } from "react";

interface Props
  extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({
  className,
  ...props
}: Props) {
  return (
    <input
      className={`
        w-full
        border
        border-zinc-300
        p-3
        rounded-2xl
        outline-none
        focus:border-black
        ${className}
      `}
      {...props}
    />
  );
}