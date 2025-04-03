import { allow as allowAction } from "defi-kit/eth";

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDS = "0xdc035d45d973e3ec169d2276ddab16f1e407384f";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

export default [
  // allow swapping between stablecoins
  allowAction.cowswap.swap({
    sell: [USDC, DAI, USDS, USDT],
    buy: [USDC, DAI, USDS, USDT],
    feeAmountBp: 0,
  }),

  // allow buying WETH with WBTC
  allowAction.cowswap.swap({
    sell: [WBTC],
    buy: [WETH],
    feeAmountBp: 0,
  }),
] satisfies Permissions;
