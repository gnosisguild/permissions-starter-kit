const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export default [
  allow.mainnet.uniswap.positions_nft.mint({
    token0: c.or(dai, usdc),
    token1: weth,
    recipient: c.avatar,
  }),
] satisfies Permissions;
