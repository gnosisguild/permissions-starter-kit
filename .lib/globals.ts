import { allow as _allow } from "zodiac-roles-sdk/kit";
import { c as _c } from "zodiac-roles-sdk";
import type * as types from "./types";

declare global {
  var allow: typeof _allow;
  var c: typeof _c;
  type Contracts = types.Contracts;
  type Members = types.Members;
  type Permissions = types.Permissions;
}

globalThis.allow = _allow;
globalThis.c = _c;
