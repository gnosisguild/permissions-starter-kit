# permissions-starter-kit

Out of the box starting point for managing [Zodiac Roles](https://roles.gnosisguild.org) permissions

Keep the configuration of your Zodiac Roles Modifier as declarative statements in code.
Rely on the tooling to automatically apply updates in a consistent and efficient manner.

## Getting started

[Use this template](https://github.com/new?template_name=permissions-starter-kit&template_owner=gnosisguild) to create a repository for your roles configuration.

### Initial setup

After having created your own repository, clone it to work locally and open the project in a code editor such as [VSCode](https://code.visualstudio.com).

To initialize the project, open a terminal window and run the following command in the project root directory:  
 `yarn` _(If you get a 'command not found' error, make sure to [install Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) and try again.)_

### Create a new role

Roles are defined as folders in the [roles/](./roles) directory.
Folder names correspond to [role keys](#role-keys).
The template includes two example roles: `eth_wrapping` and `position_management`.
You can rename the corresponding folders or create fresh folders for your new role.
Inside the role folder, create or edit the _permissions.ts_ file with the following boilerplate content:

```typescript
export default [
  // <- define your permissions here
] satisfies Permissions;
```

### Configure allowed target contracts

As a preparatory step before actually defining the role permissions, configure the addresses of all contracts you want to allow calling to.
Afterwards, you can run a command that fetches the ABIs of these contracts so you get automatic suggestions and correctness checks while authoring permissions.

Open [contracts.ts](./contracts.ts) in the editor and add labels and addresses of any contracts you plan to use as targets in your permissions.
On the top level of the exported object, define the host blockchain. Any of the following values are supported:
`mainnet`, `gnosis`, `polygon`, `arbitrumOne`, `avalanche`, `polygonMumbai`, `sepolia`

Then insert all target contract addresses as records using recognizable labels:

```typescript
import type { Contracts } from "./.lib/types";

export default {
  mainnet: {
    // <label>: "<contract address>",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",

    // Optionally, group contracts in labeled categories:
    uniswap: {
      positions_nft: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    },
  },
} satisfies Contracts;
```

<a name="sdk-setup-steps"></a>To make the changes take effect, follow these steps:

1. Save your changes in the contracts.ts file and run the following command in the terminal window:  
   `yarn setup`
2. Open the VSCode command palette:  
   Mac: `Cmd` + `Shift` + `P`  
   Windows: `Ctrl` + `Shift` + `P`
3. Type `restart` and select the option `TypeScript: Restart TS server` for the suggestions list

### Edit permissions

In the _permissions.ts_ for your role, type `allow.`.
You will see suggestions popping up next to your cursor.
Select the path to the target contract as previously defined in [contracts.ts](./contracts.ts).

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGJjc2JzYnY1NHVsZTVvMGNoYTM0eWs4cXBzNTd6cnA1Y3hiaDVnYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Xqp23A5ISwGlvKL3TH/giphy.gif" alt="Using suggestion to complete permissions" />

If the suggestions you get in the editor do not reflect the structure of your [contracts.ts](./contracts.ts) records, make sure to follow the [three steps described above](#sdk-setup-steps).

#### Set conditions on parameters

For scoping allowed values for individual function parameters, you can leverage the Roles Modifier's conditions system.

<img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2x2Z3VqOHFlYjhrcjg2dm9wcGxzbmJnbnppbXdjbHlob200MTVlOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8sGDcKWVdZBrQZBErf/giphy.gif" alt="Scope function parameters using conditions">

### Apply permissions

Once you're done defining all permissions for the role, you can apply the update to your Roles mod.
If you want to set up a new Roles mod from scratch, you can find help in [this tutorial](https://zodiac.wiki/index.php?title=Roles_Modifier:_Operator_Tutorial).

In your terminal, run the following command:

```
yarn apply <role_key> <prefixed_address>
```

For example for applying the role `eth_wrapping` to a mainnet Roles mod at address `0x1234123412341234123412341234123412341234`:

```
yarn apply eth_wrapping eth:0x1234123412341234123412341234123412341234
```

This will take you right to the Roles app, where you can review the updates that will be made to your role and confirm them by signing the apply transaction.

Applying permissions for the first time will create a new role.
Subsequent applies will patch the existing role, efficiently removing, updating and adding permissions so that the role configuration on chain will accurately mirror the permissions defined in code.

## Folder structure and conventions

- [contracts.ts](./contracts.ts) – Lists all contracts that are used as targets in permissions
- [roles/](./roles) – Host directory for role configurations
  - [`role_key`/](./roles/eth_wrapping) – Each subfolder represents a distinct role. The folder name will be used as the [role key](#role-keys).
    - [permissions.ts](./roles/eth_wrapping/permissions.ts) – Defines all permissions for this role

There are some additional files and folders in the template repository, which you won't usually have to edit.
They contain the necessary wiring for automatically applying the permissions.

##### Role keys

In the Zodiac Roles Modifier, every role is identified by a `bytes32` string.
Pick a role key that aptly describes the purpose of the role.
We recommend using only the following characters for role keys: `a...z`, `0...9`, `_`
The length must be below 32 characters.

##### Prefixed addresses

The Roles tooling adopts [EIP-3770](https://eips.ethereum.org/EIPS/eip-3770) chain-specific addresses for identifying a contract on a specific chain in a compact way:

```
eth:0x1234123412341234123412341234123412341234
```

Chain prefixes for the supported chains are as follows:

- Mainnet: `eth`
- Gnosis Chain: `gno`
- Polygon: `matic`
- Arbitrum One: `arb1`
- Avalanche: `avax`
- Polygon Mumbai Testnet: `maticMumbai`
- Sepolia Testnet: `sep`
