import { sepolia } from "viem/chains";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: `0x${string}`;
  logoUrl: string;
}

// Sepolia deployed contract addresses
const TITAN_TOKEN = "0xbA6720e72f929318E66AcED4389889640Aee0F6e" as `0x${string}`;
const EARN = "0x166fef8E2B712393690F44adD86591ccb7a2648c" as `0x${string}`;
const STAKED_TITAN = "0x4398317E8641E613a92e4af0Ea62eBFf7984818a" as `0x${string}`;
const FARMING = "0x4D179B9742eafdF130bfa08b5d815a1fb8b980EB" as `0x${string}`;
const GOVERNANCE = "0x482BFe34fC0535a2E3355EF8b4e2405bCD879f19" as `0x${string}`;
const FAUCET = "0x7D34B7286d2dC4836e6B0C2761C17b6693e5d241" as `0x${string}`;
const SWAP_ROUTER = "0x77a76b5eEC937361b8F05c15860AE81d9fe23b0E" as `0x${string}`;
const LIQUIDITY_ROUTER = "0x11450A1214D485072c1DC0aA82E2547D1ba8040d" as `0x${string}`;

export const config = {
  appName: "Titan",
  appDescription: "DeFi Super App",
  appUrl: "https://titandefi.org",

  chains: [sepolia] as const,
  defaultChain: sepolia,

  contracts: {
    titanToken: TITAN_TOKEN,
    earn: EARN,
    staking: EARN,
    stakedTitan: STAKED_TITAN,
    farming: FARMING,
    governance: GOVERNANCE,
    faucet: FAUCET,
    swapRouter: SWAP_ROUTER,
    liquidityRouter: LIQUIDITY_ROUTER,
    poolManager: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543" as `0x${string}`,
    universalRouter: "0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b" as `0x${string}`,
    positionManager: "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4" as `0x${string}`,
    quoter: "0x61B3f2011A92d183C7dbaDBdA940a7555Ccf9227" as `0x${string}`,
    stateView: "0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C" as `0x${string}`,
    permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`,
    weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9" as `0x${string}`,
  },

  tokens: {
    TITAN: {
      symbol: "TITAN",
      name: "Titan Token",
      decimals: 18,
      address: TITAN_TOKEN,
      logoUrl: "/titan-token.svg",
    },
    sTITAN: {
      symbol: "sTITAN",
      name: "Staked Titan",
      decimals: 18,
      address: STAKED_TITAN,
      logoUrl: "/titan-token.svg",
    },
    ETH: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as `0x${string}`,
      logoUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    },
    WETH: {
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9" as `0x${string}`,
      logoUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    },
  },

  links: {
    github: "https://github.com/pzzaworks",
  },

  faucet: {
    amount: "1",
    cooldown: 24 * 60 * 60,
  },
} as const;

export type TokenSymbol = keyof typeof config.tokens;
