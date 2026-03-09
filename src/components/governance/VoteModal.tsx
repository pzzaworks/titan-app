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
      "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    hoverClass:
      "hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5",
  },
  {
    type: "against" as VoteType,
    label: "Against",
    icon: ThumbsDown,
    activeClass: "border-red-500 bg-red-50 text-red-600",
    hoverClass: "hover:border-red-300 hover:bg-red-50",
  },
  {
    type: "abstain" as VoteType,
    label: "Abstain",
    icon: MinusCircle,
    activeClass: "border-gray-500 bg-gray-100 text-gray-600",
    hoverClass: "hover:border-gray-400 hover:bg-gray-50",
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
      <DialogContent className="sm:max-w-md bg-white border-[var(--color-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-foreground)]">
            Cast Your Vote
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
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                    isSelected
                      ? option.activeClass
                      : `border-[var(--color-border)] ${option.hoverClass}`,
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
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
