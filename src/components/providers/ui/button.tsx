import { ButtonHTMLAttributes } from "react";

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      className={`
        bg-black
        text-white
        px-6
        py-3
        rounded-2xl
        font-medium
        transition
        hover:opacity-90
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}