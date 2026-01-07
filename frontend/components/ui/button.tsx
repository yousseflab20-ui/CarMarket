import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
    Pressable,
    type PressableStateCallbackType,
    type PressableProps as RNPressableProps,
    View,
    type ViewStyle,
} from "react-native";

export const buttonVariants = cva(
    "flex-row items-center justify-center rounded-lg",
    {
        variants: {
            variant: {
                default: "bg-primary",
                destructive: "bg-destructive",
                outline: "border-2 border-border bg-background",
                secondary: "bg-secondary",
                ghost: "",
                link: "",
            },
            size: {
                default: "h-12 px-4",
                sm: "h-10 px-3",
                lg: "h-14 px-6",
                icon: "h-12 w-12",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends Omit<RNPressableProps, "style">,
    VariantProps<typeof buttonVariants> {
    className?: string;
    style?: ViewStyle;
}

const Button = React.forwardRef<View, ButtonProps>(
    ({ className, variant, size, children, ...props }, ref) => {
        const [isPressed, setIsPressed] = React.useState(false);

        return (
            <Pressable
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                {...props}
            >
                {(state: PressableStateCallbackType) => (
                    <View
                        className={`flex-row items-center justify-center gap-2 ${state.pressed || isPressed ? "opacity-80" : ""
                            }`}
                    >
                        {typeof children === "function" ? children(state) : children}
                    </View>
                )}
            </Pressable>
        );
    },
);

Button.displayName = "Button";

export { Button };
