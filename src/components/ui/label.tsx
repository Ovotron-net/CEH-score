"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

<<<<<<< Updated upstream
import {cn} from "@/utils/cn"
=======
<<<<<<< HEAD
import { cn } from "@/utils/cn"
>>>>>>> Stashed changes

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({className, ...props}, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className,
        )}
        {...props}
    />
))
Label.displayName = LabelPrimitive.Root.displayName

<<<<<<< Updated upstream
export {Label}
=======
export { Label }
=======
import {cn} from "@/utils/cn"

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({className, ...props}, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className,
        )}
        {...props}
    />
))
Label.displayName = LabelPrimitive.Root.displayName

export {Label}
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
