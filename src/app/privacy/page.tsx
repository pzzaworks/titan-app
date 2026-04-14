import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import type { LegalSection } from "@/components/legal/LegalPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy",
  description:
    "Privacy notice for Titan, an experimental open-source DeFi app running on Ethereum Sepolia.",
  path: "/privacy",
  keywords: ["privacy notice", "privacy policy"],
});

const sections: LegalSection[] = [
  {
    title: "Overview",
    paragraphs: [
      "Titan is an experimental open-source DeFi app. This Privacy Notice explains what information Titan may process through the frontend and connected infrastructure when you browse the site, connect a wallet, and interact with Sepolia smart contracts.",
      "Titan is not built around user accounts, email signups, ad tracking, or social logins. The app is primarily a wallet-connected interface for blockchain interactions.",
    ],
  },
  {
    title: "Information the App May Process",
    paragraphs: [
      "When you use Titan, the app may process blockchain-facing and technical information needed to render the interface and submit transactions.",
    ],
    bullets: [
      "Public wallet address information when you connect a wallet.",
      "Public blockchain data such as balances, approvals, positions, votes, transaction hashes, and contract reads needed to display app state.",
      "Functional session data used to restore wallet connection state across requests and page loads.",
      "Standard technical request data handled by hosting, RPC, and wallet infrastructure such as IP address, browser metadata, timestamps, and request logs.",
    ],
  },
  {
    title: "Cookies and Local Session State",
    paragraphs: [
      "Titan uses wallet connection infrastructure built with wagmi and Reown AppKit. The app is configured to use functional cookie-based storage for wallet session state so the site can restore your connection status during server-side rendering and subsequent visits.",
      "Titan does not currently enable Reown analytics features in the app configuration. The frontend is intended to use only the technical state required to operate the wallet connection flow.",
    ],
  },
  {
    title: "Public Blockchain Data",
    paragraphs: [
      "Blockchain activity is public by design. If you connect a wallet, delegate voting power, claim from the faucet, swap, provide liquidity, stake, borrow, repay, or otherwise interact with contracts, those actions may become permanently visible on the Ethereum Sepolia network and on third-party block explorers.",
      "Titan cannot make onchain activity private, delete blockchain records, or prevent third parties from indexing public wallet activity.",
    ],
  },
  {
    title: "How Information Is Used",
    paragraphs: [
      "Titan uses the information it processes to operate the app and show you the state of the protocol interfaces.",
    ],
    bullets: [
      "To connect your wallet and maintain session continuity.",
      "To read contract state and display balances, allowances, governance status, staking data, liquidity positions, vault information, and faucet availability.",
      "To prepare and submit transactions that you explicitly approve in your wallet.",
      "To keep the app stable, troubleshoot failures, and operate the open-source interface.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "Titan may rely on third-party services to function, including wallet software, Reown AppKit infrastructure, public RPC endpoints, blockchain nodes, and block explorers you may choose to use independently.",
      "Those providers may process information under their own privacy terms. Titan does not control their independent collection, retention, or security practices.",
    ],
  },
  {
    title: "Data Sharing",
    paragraphs: [
      "Titan is not designed as an advertising or data-broker service. The app is not intended to sell personal information.",
      "However, information may necessarily be disclosed to infrastructure providers involved in serving the site, restoring wallet sessions, answering RPC requests, and broadcasting transactions that you choose to sign.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "Titan itself is designed to minimize app-level personal data collection, but technical logs and infrastructure records may be retained by hosting providers, wallet middleware, RPC services, or blockchain indexers according to their own policies.",
      "Public blockchain data may remain available indefinitely because onchain records are not under Titan's unilateral control.",
    ],
  },
  {
    title: "Your Choices",
    paragraphs: [
      "You can browse most of the public site without connecting a wallet. If you do not want wallet-linked activity associated with you, do not connect a wallet and do not submit blockchain transactions through Titan.",
      "You may also disconnect your wallet, clear browser cookies, or use a separate wallet profile when testing the app. These actions can reduce local session persistence, but they do not erase public blockchain history that already exists.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "This Privacy Notice may be updated as Titan evolves, including if the deployment scope, infrastructure providers, or feature set changes.",
      "Your continued use of Titan after an update means you accept the revised notice.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Notice"
      intro={
        <>
          Titan is currently a Sepolia-based experimental DeFi interface. The app aims to keep
          data collection narrow and functional, but blockchain usage, wallet integrations, and
          third-party infrastructure can still expose technical and public onchain information.
        </>
      }
      updatedOn="April 14, 2026"
      sections={sections}
    />
  );
}
