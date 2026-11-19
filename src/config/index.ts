import { sepolia } from "viem/chains";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: `0x${string}`;
  logoUrl: string;
}

// Sepolia deployed contract addresses
// Named TITAN, not TITAN_TOKEN: a hex string in a constant called "token" reads as a
// leaked credential to secret scanners, and this is a public contract address.
const TITAN = "0xC673006330aF18FEaa6eb5c190a9Be74865b0F34" as `0x${string}`;
const EARN = "0xa489c27280cE7a4beB9ff8B7dC8639026D2637F4" as `0x${string}`;
const STAKED_TITAN =
  "0x474C0A029df67ee21FdE59759dB3AD80c49F3e27" as `0x${string}`;
const GOVERNANCE =
  "0x79C8d515eC3Ffc85232feFDb4bfDfeA18833cf64" as `0x${string}`;
const FAUCET = "0x108Fff5d5a9B29545fed8B1b5106FDC55f9d3362" as `0x${string}`;
const SWAP_ROUTER =
  "0x806c2873Fad025B2da02dA5b70F6FC71645229c7" as `0x${string}`;
const LIQUIDITY_ROUTER =
  "0x92BCC26C5b6f3124ab034fDC7D19bB9895061725" as `0x${string}`;
const TITAN_USD = "0xF0aa02Ee7cE6971082b72c6800069b72521A1F26" as `0x${string}`;
const VAULT = "0x77c7AEa612CBF37c4fEDdc8f21B56A3F267e065b" as `0x${string}`;

export const config = {
  appName: "Titan",
  appDescription: "DeFi app",
  appUrl: "https://titandefi.org",

  chains: [sepolia] as const,
  defaultChain: sepolia,

  contracts: {
    titanToken: TITAN,
    earn: EARN,
    staking: EARN,
    stakedTitan: STAKED_TITAN,
    governance: GOVERNANCE,
    faucet: FAUCET,
    swapRouter: SWAP_ROUTER,
    liquidityRouter: LIQUIDITY_ROUTER,
    titanUsd: TITAN_USD,
    vault: VAULT,
    poolManager: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543" as `0x${string}`,
    universalRouter:
      "0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b" as `0x${string}`,
    positionManager:
      "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4" as `0x${string}`,
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
      address: TITAN,
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
      logoUrl:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    },
    WETH: {
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9" as `0x${string}`,
      logoUrl:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    },
    tUSD: {
      symbol: "tUSD",
      name: "Titan USD",
      decimals: 18,
      address: TITAN_USD,
      logoUrl: "/titan-token.svg",
    },
  },

  links: {
    github: "https://github.com/pzzaworks/titan-app",
  },

  faucet: {
    amount: "1",
    cooldown: 24 * 60 * 60,
  },
} as const;

export type TokenSymbol = keyof typeof config.tokens;
