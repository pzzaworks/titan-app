import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import type { LegalSection } from "@/components/legal/LegalPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms",
  description:
    "Terms of use for Titan, an experimental open-source DeFi app running on Ethereum Sepolia.",
  path: "/terms",
  keywords: ["terms of use", "legal"],
});

const sections: LegalSection[] = [
  {
    title: "Scope",
    paragraphs: [
      "These Terms apply to your access to and use of Titan, including the website, frontend, and public interfaces that interact with Titan smart contracts and related tooling.",
      "Titan is presented as an experimental, open-source DeFi project. The current public deployment is intended for Ethereum Sepolia testnet activity, product exploration, and technical experimentation rather than production financial use.",
    ],
  },
  {
    title: "Experimental Status",
    paragraphs: [
      "Titan is not marketed or operated as a mature production protocol. Smart contracts, frontend flows, token mechanics, governance flows, and integrations may contain bugs, design flaws, or incomplete features.",
      "The smart contracts and app flows available through Titan have not been represented here as audited. You should assume the software is unaudited, experimental, and subject to change, interruption, or failure at any time.",
    ],
    bullets: [
      "Do not assume Titan is suitable for mainnet assets, business-critical workflows, or high-value transactions.",
      "Do not rely on Titan for safekeeping, guaranteed availability, guaranteed execution, or guaranteed economic outcomes.",
      "Testnet tokens, balances, exchange rates, and displayed values may be reset, replaced, or become unavailable without notice.",
    ],
  },
  {
    title: "No Financial Advice",
    paragraphs: [
      "Nothing in Titan or in the repository, interface copy, documentation, or on-screen metrics is financial, investment, legal, tax, or accounting advice. Titan is software, not an advisory service.",
      "Any statistics, APR figures, price impact estimates, governance displays, faucet values, or vault health indicators are informational only and may be delayed, inaccurate, incomplete, or unavailable.",
    ],
  },
  {
    title: "Wallets and Transactions",
    paragraphs: [
      "You are solely responsible for your wallet, private keys, seed phrases, approvals, signatures, transaction settings, gas decisions, delegation choices, and any transaction you confirm through Titan or through your wallet provider.",
      "Blockchain transactions are irreversible once submitted and confirmed. Titan cannot cancel, reverse, recover, or guarantee any transaction, approval, delegation, liquidity action, borrow action, vote, stake, unstake, or faucet claim.",
    ],
    bullets: [
      "Always review the target network and contract interaction before signing.",
      "Always verify you are on Sepolia when using the currently published testnet deployment.",
      "Always confirm token approvals and spending permissions before accepting a wallet prompt.",
    ],
  },
  {
    title: "Open-Source and Third-Party Services",
    paragraphs: [
      "Titan is distributed as open-source software and may rely on third-party infrastructure and integrations, including wallet software, RPC providers, Reown AppKit, and Uniswap-related contracts or tooling where applicable.",
      "Those third-party services are outside Titan's control. Their availability, security posture, privacy practices, and operational behavior are governed by their own terms and policies, not these Terms.",
      "You can inspect the current public codebase in the Titan GitHub repository linked from the footer and project links section on this site.",
    ],
  },
  {
    title: "Acceptable Use",
    paragraphs: [
      "You agree not to use Titan in a way that violates applicable law, infringes the rights of others, attempts to damage the app or contracts, or interferes with other users, infrastructure providers, or testnet resources.",
    ],
    bullets: [
      "Do not use the app for unlawful conduct, sanctions evasion, fraud, or market abuse.",
      "Do not attempt to exploit bugs, overload the interface, spam the faucet, scrape infrastructure abusively, or interfere with governance, liquidity, or routing behavior.",
      "Do not misrepresent Titan as audited, production-ready, or risk-free.",
    ],
  },
  {
    title: "No Warranties",
    paragraphs: [
      "Titan is provided on an as is and as available basis to the fullest extent permitted by applicable law. No promise is made that the app, smart contracts, repositories, interfaces, or data outputs are accurate, secure, complete, reliable, or fit for any particular purpose.",
      "Titan may be changed, paused, deprecated, rate limited, or removed at any time. Features may stop working, contracts may be upgraded or replaced, and integrations may break without warning.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, Titan contributors, maintainers, and affiliated operators will not be liable for any direct, indirect, incidental, consequential, special, exemplary, or other losses arising out of or relating to your use of Titan.",
      "This includes, without limitation, losses related to failed transactions, protocol exploits, approval misuse, wallet compromise, inaccurate interface data, faucet unavailability, governance errors, routing issues, third-party outages, or loss of tokens whether on testnet or elsewhere.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "These Terms may be updated as the project evolves. Continued use of Titan after a change means you accept the updated Terms.",
      "If you do not agree with these Terms, you should stop using the Titan interface and related services.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={
        <>
          Titan is an experimental DeFi interface built in public and currently deployed for
          Sepolia testnet exploration. By using Titan, you acknowledge that this is an
          open-source, unaudited, testnet-first project and that you are using it at your own
          risk.
        </>
      }
      updatedOn="April 14, 2026"
      sections={sections}
    />
  );
}
