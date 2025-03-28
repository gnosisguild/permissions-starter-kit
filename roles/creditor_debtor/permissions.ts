import { allow as allowAction } from "defi-kit/eth";

export default [
  allowAction.aave_v3.deposit({
    market: "Core",
    targets: ["USDC", "WETH"],
  }),
  allowAction.aave_v3.borrow({
    market: "Core",
    targets: ["USDC", "WETH"],
  }),
] satisfies Permissions;
