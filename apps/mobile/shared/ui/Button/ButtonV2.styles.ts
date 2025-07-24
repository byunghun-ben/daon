import { cva } from "class-variance-authority";

// 컨테이너(TouchableOpacity) 스타일
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md transition-opacity active:opacity-80 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-error",
        outline: "border border-primary bg-transparent",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// 텍스트 컴포넌트용 스타일
export const buttonTextVariants = cva("font-medium text-center", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-primary",
      secondary: "text-white",
      ghost: "text-text",
      link: "text-primary",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
