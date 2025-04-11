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

  //The above 2 permissions are defined by defi-kit, but here's how
  //you can permit an arbitrary function on a contract already defined by defi-kit.
  //(if the contract is not defined by defi-kit, refer to and mimic the eth_wrapping example role)
  {
    targetAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", //AAVE Mainnet v3 Pool, can't go in contracts.ts or it'll conflict
    signature: "repayWithATokens(address,uint256,uint256)",
  },
] satisfies Permissions;
