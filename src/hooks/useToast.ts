"use client";

import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

interface PromiseToastOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

function toast({ title, description, variant = "default" }: ToastOptions) {
  const message = title || "";
  const options = {
    description,
  };

  switch (variant) {
    case "success":
      return sonnerToast.success(message, options);
    case "destructive":
      return sonnerToast.error(message, options);
    default:
      return sonnerToast(message, options);
  }
}

// Promise-based toast - shows loading, then success/error
toast.promise = function<T>(
  promise: Promise<T>,
  options: PromiseToastOptions<T>
) {
  return sonnerToast.promise(promise, options);
};

// Loading toast that can be updated
toast.loading = function(message: string) {
  return sonnerToast.loading(message);
};

// Dismiss a specific toast or all toasts
toast.dismiss = sonnerToast.dismiss;

// Update/replace a toast by id
toast.success = function(message: string, options?: { description?: string }) {
  return sonnerToast.success(message, options);
};

toast.error = function(message: string, options?: { description?: string }) {
  return sonnerToast.error(message, options);
};

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
