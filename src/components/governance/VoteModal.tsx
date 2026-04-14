"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { ThumbsUp, ThumbsDown, MinusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

type VoteType = "for" | "against" | "abstain";

interface VoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: number;
  proposalTitle: string;
  onVote?: (proposalId: number, voteType: VoteType) => Promise<void>;
}

const voteOptions = [
  {
    type: "for" as VoteType,
    label: "For",
    icon: ThumbsUp,
    activeClass:
      "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    hoverClass:
      "hover:bg-[var(--color-primary)]/5",
  },
  {
    type: "against" as VoteType,
    label: "Against",
    icon: ThumbsDown,
    activeClass: "bg-[#f1d9d9] text-[#9d3f3f]",
    hoverClass: "hover:bg-[#f1d9d9]",
  },
  {
    type: "abstain" as VoteType,
    label: "Abstain",
    icon: MinusCircle,
    activeClass: "bg-white/72 text-[var(--color-foreground)]",
    hoverClass: "hover:bg-white/72",
  },
];

export function VoteModal({
  open,
  onOpenChange,
  proposalId,
  proposalTitle,
  onVote,
}: VoteModalProps) {
  const { isConnected } = useAccount();
  const { open: openWallet } = useAppKit();
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!isConnected) {
      openWallet();
      return;
    }

    if (!selectedVote) {
      toast({
        title: "Select a vote",
        description: "Please select how you want to vote.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      if (onVote) {
        await onVote(proposalId, selectedVote);
      } else {
        // Mock vote
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast({
          title: "Vote submitted",
          description: `You voted ${selectedVote} on proposal #${proposalId}.`,
          variant: "success",
        });
      }

      setSelectedVote(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Vote failed",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[var(--color-background)]">
        <DialogHeader>
          <DialogTitle className="font-display text-[32px] leading-[0.98] font-[300] tracking-[-0.03em] text-[var(--color-foreground)]">
            Cast your vote
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            Proposal #{proposalId}: {proposalTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Vote Options */}
          <div className="space-y-3">
            {voteOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedVote === option.type;
              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedVote(option.type)}
                  className={cn(
                    "w-full cursor-pointer rounded-xl p-4 transition-all duration-200",
                    isSelected
                      ? option.activeClass
                      : `bg-white/58 ${option.hoverClass}`,
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      isSelected
                        ? "bg-white/50"
                        : "bg-[var(--color-foreground)]/5",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <Button
            className="w-full cursor-pointer"
            size="lg"
            variant={!isConnected ? "green" : "default"}
            onClick={handleVote}
            disabled={isVoting || (isConnected && !selectedVote)}
            isLoading={isVoting}
          >
            {!isConnected
              ? "Connect Wallet"
              : !selectedVote
                ? "Select Vote"
                : isVoting
                  ? "Submitting..."
                  : "Submit Vote"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
