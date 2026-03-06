"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Plus, Trash2 } from "lucide-react";
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

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
}

interface ProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (proposal: {
    title: string;
    description: string;
    actions: ProposalAction[];
  }) => Promise<void>;
}

export function ProposalModal({ open, onOpenChange, onSubmit }: ProposalModalProps) {
  const { isConnected } = useAccount();
  const { open: openWallet } = useAppKit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actions, setActions] = useState<ProposalAction[]>([
    { target: "", value: "0", calldata: "0x" },
  ]);

  const addAction = () => {
    setActions([...actions, { target: "", value: "0", calldata: "0x" }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, field: keyof ProposalAction, value: string) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setActions(newActions);
  };

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

    // Validate actions
    for (let i = 0; i < actions.length; i++) {
      if (!actions[i].target || !actions[i].target.startsWith("0x")) {
        toast({
          title: "Invalid action",
          description: `Action ${i + 1}: Please enter a valid target address.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ title, description, actions });
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
      setActions([{ target: "", value: "0", calldata: "0x" }]);
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
      <DialogContent className="sm:max-w-2xl bg-white border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-foreground)]">Create Proposal</DialogTitle>
          <DialogDescription>
            Create a new governance proposal for the Titan DAO to vote on.
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
              className="flex min-h-[120px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] ring-offset-background placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 focus-visible:ring-offset-2 focus-visible:border-[var(--color-foreground)]/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-foreground)]">
                Actions
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            </div>

            {actions.map((action, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--color-border)] p-4 space-y-3 bg-[var(--color-foreground)]/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
                    Action {index + 1}
                  </span>
                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[var(--color-muted-foreground)]">
                      Target Address
                    </label>
                    <Input
                      placeholder="0x..."
                      value={action.target}
                      onChange={(e) => updateAction(index, "target", e.target.value)}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--color-muted-foreground)]">
                        Value (ETH)
                      </label>
                      <Input
                        placeholder="0"
                        value={action.value}
                        onChange={(e) => updateAction(index, "value", e.target.value)}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--color-muted-foreground)]">
                        Calldata
                      </label>
                      <Input
                        placeholder="0x"
                        value={action.calldata}
                        onChange={(e) => updateAction(index, "calldata", e.target.value)}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
