export default [
  allow.mainnet.weth.deposit({ send: true }),
  allow.mainnet.weth.withdraw(),
] satisfies Permissions;
