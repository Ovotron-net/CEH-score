"use client"

<<<<<<< Updated upstream
import {useToast} from "@/hooks/use-toast"
import {Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,} from "@/components/ui/toast"
=======
<<<<<<< HEAD
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
>>>>>>> Stashed changes

export function Toaster() {
    const {toasts} = useToast()

<<<<<<< Updated upstream
=======
  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
=======
import {useToast} from "@/hooks/use-toast"
import {Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,} from "@/components/ui/toast"

export function Toaster() {
    const {toasts} = useToast()

>>>>>>> Stashed changes
    return (
        <ToastProvider>
            {toasts.map(function ({id, title, description, action, ...props}) {
                return (
                    <Toast key={id} {...props}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose/>
                    </Toast>
                )
            })}
            <ToastViewport/>
        </ToastProvider>
    )
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}




