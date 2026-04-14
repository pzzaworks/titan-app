"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/useToast";

interface ProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (proposal: {
    title: string;
    description: string;
  }) => Promise<void>;
}

export function ProposalModal({ open, onOpenChange, onSubmit }: ProposalModalProps) {
  const { isConnected } = useAccount();
  const { open: openWallet } = useAppKit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!isConnected) {
      openWallet();
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a proposal title.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a proposal description.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ title, description });
      } else {
        // Mock submission
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast({
          title: "Proposal created",
          description: "Your proposal has been submitted successfully.",
          variant: "success",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Proposal failed",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[var(--color-background)]">
        <DialogHeader>
          <DialogTitle className="font-display text-[32px] leading-[0.98] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
            Create proposal
          </DialogTitle>
          <DialogDescription>
            Write the title and description, then submit it to governance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-foreground)]">
              Title
            </label>
            <Input
              placeholder="Enter proposal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-foreground)]">
              Description
            </label>
            <textarea
              placeholder="Describe your proposal in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[150px] w-full resize-none rounded-xl bg-white/78 px-4 py-3 text-sm text-[var(--color-foreground)] ring-offset-background placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full cursor-pointer"
            size="lg"
            variant={!isConnected ? "green" : "default"}
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {!isConnected ? "Connect Wallet" : isSubmitting ? "Creating..." : "Create Proposal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
