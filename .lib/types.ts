import { NestedAddressesInput } from "@gnosis-guild/eth-sdk/dist/config";
import { ChainId, Permission, PermissionSet, chains } from "zodiac-roles-sdk";

type ChainName = (typeof chains)[ChainId]["name"];

export type Contracts = {
  [chainName in ChainName]?: NestedAddressesInput;
};

export type Members = `0x${string}`[];

export type Permissions = (
  | Permission
  | PermissionSet
  | Promise<PermissionSet>
)[];
