import { defineConfig } from "@dethcrypto/eth-sdk";
import { ethSdkConfig } from "zodiac-roles-sdk";
import contracts from "../../contracts";

export default defineConfig({ ...ethSdkConfig, contracts });
