import type { SVGProps } from "react";

export function LexicalLeapLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2l3.09 6.31L22 9.27l-5 4.87L18.18 22 12 18.31 5.82 22 7 14.14 2 9.27l6.91-1.06L12 2z" fill="hsl(var(--primary))" />
      <path d="M12 2l3.09 6.31L22 9.27l-5 4.87L18.18 22 12 18.31 5.82 22 7 14.14 2 9.27l6.91-1.06L12 2z" opacity="0.4" fill="hsl(var(--accent))" />
      <path d="M7 14.14l5-2.83 5 2.83" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />
    </svg>
  );
}
