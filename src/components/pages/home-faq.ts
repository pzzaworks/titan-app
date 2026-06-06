import type { FaqItem } from "@/lib/seo";

/**
 * Homepage FAQ content. Shared by the visible FAQ section and the FAQPage
 * JSON-LD so the rendered text and structured data stay identical, which Google
 * requires for FAQ rich results. Every answer is accurate to Titan: an
 * experimental Sepolia testnet app that uses test tokens only.
 */
export const homeFaqItems: FaqItem[] = [
  {
    question: "Is Titan real money or a mainnet app?",
    answer:
      "No. Titan is an experimental app that runs on the Ethereum Sepolia testnet, not on Ethereum mainnet. It uses test tokens only, so nothing you do in Titan involves real funds or real value.",
  },
  {
    question: "How do I get test tokens to use Titan?",
    answer:
      "Use the faucet. The Titan faucet lets you claim free Sepolia TITAN test tokens to fund your wallet, and you can claim again every 24 hours. Start there before trying swap, liquidity, earn, borrow, or governance.",
  },
  {
    question: "What can I do with the swap and liquidity features?",
    answer:
      "Swap lets you trade TITAN and supported Sepolia assets with routing, slippage controls, and visible price impact. Liquidity lets you open and manage TITAN and WETH pool positions, review ranges, and collect fees.",
  },
  {
    question: "How do earn and borrow work?",
    answer:
      "Earn lets you stake TITAN, track pending rewards, and manage testnet yield from one panel. Borrow lets you use TITAN as collateral to borrow tUSD and monitor your vault health.",
  },
  {
    question: "What is sTITAN?",
    answer:
      "sTITAN is Titan's liquid staking token. You deposit TITAN to mint sTITAN while keeping your governance voting power attached, so you can stay liquid and still participate in votes.",
  },
  {
    question: "How does governance work in Titan?",
    answer:
      "Governance lets you read proposals, activate your voting power, and vote with sTITAN directly in the app, so reviewing and voting on proposals stays in the same place as the rest of the flow.",
  },
  {
    question: "Do I need a wallet to use Titan?",
    answer:
      "Yes. Titan is a Web3 interface, so you connect an Ethereum wallet set to the Sepolia testnet. Once connected, you can claim test tokens from the faucet and use every feature in the app.",
  },
];
