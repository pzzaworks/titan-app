<p align="center">
  <img src="public/titan-logo.svg" alt="Titan" width="80" />
</p>

<p align="center">
  A modern DeFi super app with Uniswap V4 integration.
</p>

<p align="center">
  <a href="https://titandefi.org"><img src="https://img.shields.io/badge/app-titandefi.org-blue" alt="Live App" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

## Features

- **Swap** - Trade tokens with Uniswap V4 pools
- **Liquidity** - Add/remove liquidity to V4 pools
- **Earn** - Deposit ETH, earn TITAN rewards
- **sTitan** - Stake TITAN, receive sTITAN with voting power
- **Borrow** - Deposit TITAN collateral, borrow tUSD stablecoin
- **Governance** - Create proposals and vote with sTITAN
- **Faucet** - Get test tokens on Sepolia

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.2.1
- **UI**: shadcn/ui + Radix UI
- **Web3**: wagmi 3.5.0 + viem 2.46.3
- **Wallet**: Reown AppKit 1.8.18
- **Animations**: Framer Motion 12.34.3

## Getting Started

```bash
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

Get your project ID at [cloud.reown.com](https://cloud.reown.com)

```bash
npm run dev
```

Open [http://localhost:3200](http://localhost:3200)

## Network

The app runs on **Ethereum Sepolia** testnet.

## Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/pzzaworks/titan-app](https://github.com/pzzaworks/titan-app)
