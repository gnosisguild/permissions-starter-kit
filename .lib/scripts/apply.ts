#!/usr/bin/env ts-node
import assert from "assert";
import open from "open";
import yargs from "yargs";
import SafeApiKit from "@safe-global/api-kit";
import { getAddress } from "ethers";
import {
  Permission,
  PermissionSet,
  checkIntegrity,
  processPermissions,
  chains,
  fetchRolesMod,
  ChainId,
  postRole,
} from "zodiac-roles-sdk";
import { Permissions } from "../types";
import "../globals";

/**
 * Posts permission to Zodiac Roles app for storage
 * @returns The hash under which permissions have been stored
 */
const post = async (
  permissions: (Permission | PermissionSet | Promise<PermissionSet>)[],
  members: `0x${string}`[],
) => {
  const awaitedPermissions = await Promise.all(permissions);
  const { targets, annotations } = processPermissions(awaitedPermissions);
  checkIntegrity(targets);

  return await postRole({ targets, annotations, members });
};

function parseMod(modArg: string) {
  const components = modArg.trim().split(":");
  assert(components.length === 2, `Invalid prefixed address: ${modArg}`);
  const [chainPrefix, modAddress] = components;

  const chainId = Object.keys(chains)
    .map((key) => parseInt(key) as ChainId)
    .find((id) => chains[id].prefix === chainPrefix);
  assert(chainId, `Chain is not supported: ${chainPrefix}`);

  // validates a valid ethereum address
  const address = getAddress(modAddress!) as `0x${string}`;

  return { chainId, chainPrefix, address };
}

const ZODIAC_ROLES_APP = "https://roles.gnosisguild.org";

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

  const [roleArg, modArg] = args._ as [string, string, string];
  const { chainId, chainPrefix, address } = parseMod(modArg);

  const modInfo = await fetchRolesMod({ chainId, address });
  if (!modInfo) {
    console.warn(`No Roles modifier has been indexed at ${modArg} yet`);
  }

  const permissions: Permissions = (
    await import(`../../roles/${roleArg}/permissions`)
  ).default;

  const members: `0x${string}`[] = (
    await import(`../../roles/${roleArg}/members`)
  ).default;

  const hash = await post(permissions, members);
  console.log(`Permissions posted under hash: ${hash}`);

  const diffUrl = `${ZODIAC_ROLES_APP}/${modArg}/roles/${roleArg}/diff/${hash}`;
  console.log("Preparing diff view...");
  await fetch(diffUrl);

  let ownedBySafe = false;
  const owner = modInfo && getAddress(modInfo.owner);
  if (owner) {
    const safeService = new SafeApiKit({
      chainId: BigInt(chainId),
    });
    try {
      await safeService.getSafeInfo(owner);
      ownedBySafe = true;
    } catch (e) {
      console.error(e);
    }
  }

  if (modInfo && ownedBySafe) {
    const safeUrl = `https://app.safe.global/apps/open?safe=${chainPrefix}:${owner}&appUrl=${encodeURIComponent(diffUrl)}`;
    console.log(`Proceed in Safe to apply: ${safeUrl}`);
    open(safeUrl);
  } else {
    console.log(`Proceed in the Roles app to apply: ${diffUrl}`);
    open(diffUrl);
  }
}

main();
