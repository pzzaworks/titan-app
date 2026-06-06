import { seoConfig } from "@/lib/seo";

/**
 * Serves /llms.txt for AI answer engines (ChatGPT, Perplexity, Claude, Google
 * AI Overviews). Follows the llms.txt convention: an H1 title, a blockquote
 * summary, then categorized sections of absolute links with short descriptions.
 * Every claim here is true to the app: Titan is an experimental Sepolia testnet
 * DeFi interface, not a mainnet product, and uses no real money.
 */

const { siteUrl, siteName, githubUrl, twitterUrl } = seoConfig;

const body = `# ${siteName} DeFi

> Titan is an experimental decentralized finance (DeFi) app running on the Ethereum Sepolia testnet. It brings token swaps, liquidity, staking, liquid staking (sTITAN), tUSD borrowing, governance voting, and a testnet faucet into one interface. Titan uses test tokens only - there is no real money, and it is not deployed on Ethereum mainnet.

## Core features

- [Swap](${siteUrl}/swap): Swap TITAN and supported Sepolia assets with routing, slippage controls, and price impact through a Uniswap V4 style interface.
- [Liquidity](${siteUrl}/liquidity): Open and manage TITAN/WETH pool positions, review ranges, and collect fees.
- [Earn](${siteUrl}/earn): Stake TITAN, track pending rewards, and manage testnet yield from one panel.
- [sTITAN](${siteUrl}/stitan): Deposit TITAN to mint sTITAN liquid staking tokens while keeping governance voting power attached.
- [Borrow](${siteUrl}/borrow): Use TITAN as collateral to borrow tUSD and monitor vault health.
- [Governance](${siteUrl}/governance): Read proposals, activate voting power, and vote with sTITAN.
- [Faucet](${siteUrl}/faucet): Claim free Sepolia TITAN test tokens to fund a wallet for the other flows.

## Getting started

- [Home](${siteUrl}): Overview of the Titan DeFi app and the full testnet loop.
- [Faucet](${siteUrl}/faucet): The recommended first step - claim test tokens, then move into swap, liquidity, earn, borrow, and governance.

## Legal

- [Privacy](${siteUrl}/privacy): Titan privacy notice.
- [Terms](${siteUrl}/terms): Titan terms of use.

## Links

- [GitHub](${githubUrl})
- [X / Twitter](${twitterUrl})
`;

export function GET(): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
