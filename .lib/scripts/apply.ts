#!/usr/bin/env ts-node
import assert from "assert";
import path from "path";
import { spawnSync } from "child_process";
import open from "open";
import yargs from "yargs";
import { getAddress, JsonRpcProvider, Contract } from "ethers";
import { chains, ChainId } from "zodiac-roles-sdk";
import { Permissions } from "../types";
import "../globals";

// @zodiac-os/sdk is ESM-only. Use native dynamic import via the Function
// constructor so TS doesn't downlevel it to `require()` under module: CommonJS.
type ZodiacSDK = typeof import("@zodiac-os/sdk");
const importSdk = (): Promise<ZodiacSDK> =>
  (Function("return import('@zodiac-os/sdk')") as () => Promise<ZodiacSDK>)();

const ROLES_MOD_ABI = ["function owner() view returns (address)"];

function parseMod(modArg: string) {
  const components = modArg.trim().split(":");
  assert(components.length === 2, `Invalid prefixed address: ${modArg}`);
  const [chainPrefix, modAddress] = components;

  const chainId = Object.keys(chains)
    .map((key) => parseInt(key) as ChainId)
    .find((id) => chains[id].prefix === chainPrefix);
  assert(chainId, `Chain is not supported: ${chainPrefix}`);

  const address = getAddress(modAddress!) as `0x${string}`;
  return { chainId, chainPrefix, address };
}

function pullOrg() {
  const result = spawnSync("zodiac", ["pull-org"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      // Silence Node's MODULE_TYPELESS_PACKAGE_JSON warning emitted when it
      // reparses zodiac.config.ts as ESM (the project's package.json has no
      // `type` field).
      NODE_OPTIONS:
        `${process.env.NODE_OPTIONS ?? ""} --disable-warning=MODULE_TYPELESS_PACKAGE_JSON`.trim(),
    },
  });
  assert(result.status === 0, "`zodiac pull-org` failed");
}

async function fetchModOwner(
  chainId: ChainId,
  address: `0x${string}`,
): Promise<`0x${string}` | null> {
  const provider = new JsonRpcProvider(
    `https://rpc.gnosisguild.org/${chainId}`,
  );
  const contract = new Contract(address, ROLES_MOD_ABI, provider);
  try {
    const owner: string = await contract.getFunction("owner")();
    return getAddress(owner) as `0x${string}`;
  } catch {
    return null;
  }
}

function firstWorkspaceName(): string {
  const codegen = require(path.resolve(process.cwd(), ".zodiac")) as {
    accounts: Record<string, unknown>;
  };
  const [name] = Object.keys(codegen.accounts);
  assert(
    name,
    "No workspaces found in Zodiac org. Create one at app.zodiac.eco.",
  );
  return name;
}

async function main() {
  const args = await yargs(process.argv.slice(2))
    .usage("$0 <role> <chain-prefix>:<mod-address>")
    .positional("role", {
      demandOption: true,
      describe:
        "The role key, i.e., the name of the folder with configuration to apply",
      type: "string",
    })
    .positional("mod", {
      demandOption: true,
      describe:
        'The chain-prefixed address of the Roles modifier, e.g. "eth:0x1234...5678"',
      type: "string",
    }).argv;

  const [roleArg, modArg] = args._ as [string, string];
  const { chainId, address } = parseMod(modArg);

  const owner = await fetchModOwner(chainId, address);
  assert(
    owner,
    `Address ${modArg} does not look like a Roles mod (could not read owner())`,
  );

  // pull-org auto-runs `zodiac init` (browser auth) when ZODIAC_API_KEY is
  // missing, then writes the key + fresh codegen to disk.
  pullOrg();

  // Load the API key that pull-org's subprocess wrote to .env, so the SDK
  // (which captures ZODIAC_API_KEY at module load time) sees it.
  require("dotenv").config();

  const workspace = firstWorkspaceName();

  const permissions: Permissions = (
    await import(`../../roles/${roleArg}/permissions`)
  ).default;

  const members: `0x${string}`[] = (
    await import(`../../roles/${roleArg}/members`)
  ).default;

  const { constellation, push } = await importSdk();

  const c = constellation({
    workspace,
    label: `Update role: ${roleArg}`,
    chain: chainId,
  });

  // EntityAccessor's index signature types the call as a new-node factory
  // (NewRolesProps requires `nonce`). At runtime the proxy just spreads the
  // overrides into the node, so passing `address` here yields a node spec
  // referencing the existing on-chain mod. Narrow the cast accordingly.
  type ConstellationNode = Parameters<
    typeof push
  >[0] extends readonly (infer N)[]
    ? N
    : never;
  type RolesFactory = (args: {
    address: `0x${string}`;
    roles: Record<
      string,
      { members: readonly `0x${string}`[]; permissions: Permissions }
    >;
  }) => ConstellationNode;

  const factory = c.roles[address] as unknown as RolesFactory;
  const rolesNode = factory({
    address,
    roles: {
      [roleArg]: { members, permissions },
    },
  });

  const results = await push([rolesNode]);
  const result = results[0];
  assert(result, "push() returned no result");
  console.log("Role update pushed. Open to review and confirm:");
  console.log(result.url);
  open(result.url);
}

main();
