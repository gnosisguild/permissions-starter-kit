# permissions-starter-kit

Out of the box starting point for managing [Zodiac Roles](https://roles.gnosisguild.org) permissions

Keep the configuration of your Zodiac Roles Modifier as declarative statements in code.
The provided tooling automatically applies updates in a consistent and efficient way.

Learn more about the motivation behind this approach in our blog ["Permissions as Code"](https://engineering.gnosisguild.org/posts/permissions-as-code).

## Getting Started

[Use this template](https://github.com/new?template_name=permissions-starter-kit&template_owner=gnosisguild) to create a repository for your roles configuration.

### Initial Setup

After creating your own repository, clone it to work locally and open the project in a code editor such as [VSCode](https://code.visualstudio.com).

To initialize the project, open a terminal window and run the following command in the project root directory:  
 `yarn` _(If you encounter a 'command not found' error, ensure that you have [installed Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) and try again.)_

### Creating a New Role

Roles are defined as folders in the [roles/](./roles) directory.
Folder names correspond to [role keys](#role-keys).
The template includes two example roles: `eth_wrapping` and `position_management`.
You can either rename these folders or create new ones for your role.
Inside the role folder, create or edit the _permissions.ts_ file with the following boilerplate content:

```typescript
export default [
  // <- define your permissions here
] satisfies Permissions;
```

### Configuring Allowed Target Contracts

As a preparatory step before actually defining the role permissions, configure the addresses of all contracts you want to allow calling to.
Then, you can run a command that fetches the ABIs of these contracts.
This will provide automatic suggestions and correctness checks while authoring permissions.

Open [contracts.ts](./contracts.ts) in the editor and add labels and addresses of any contracts you plan to use as targets in your permissions.
At the top level of the exported object, define the host blockchain.
The following values are supported:
`mainnet`, `gnosis`, `polygon`, `arbitrumOne`, `avalanche`, `base`, `polygonMumbai`, `sepolia`

Then, insert all target contract addresses as records using recognizable labels:

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

<a name="sdk-setup-steps"></a>The following values are supported:

1. Save your changes in the contracts.ts file and run the following command in the terminal window:  
   `yarn setup`
2. Open the VSCode command palette:  
   Mac: `Cmd` + `Shift` + `P`  
   Windows: `Ctrl` + `Shift` + `P`
3. Type `restart` and select the option `TypeScript: Restart TS server` from the suggestions list

### Edit Permissions

In the _permissions.ts_ for your role, type `allow.`.
You will see suggestions appearing next to your cursor.
Select the path to the target contract as previously defined in [contracts.ts](./contracts.ts).

<img src="https://i.imgur.com/2jKAoNk.gif" alt="Using suggestion to complete permissions" />

If the suggestions you see in the editor do not match the structure of your [contracts.ts](./contracts.ts) records, ensure you have followed the [three steps described above](#sdk-setup-steps).

#### Set Conditions on Parameters

To limit allowed values for individual function parameters, you can use the Roles Modifier's conditions system.
Condition functions are available under the global `c` variable.

Read more about conditions in the [documentation](https://docs.roles.gnosisguild.org/sdk/conditions).

### Apply Updates

Once you have defined all permissions for the role, you can apply the update to your Roles mod.
If you need to set up a new Roles mod from scratch, refer to [this tutorial](https://zodiac.wiki/index.php?title=Roles_Modifier:_Operator_Tutorial).

In your terminal, run the following command:

```
yarn apply <role_key> <prefixed_address>
```

For example, to apply the role `eth_wrapping` to a mainnet Roles mod at address `0x1234123412341234123412341234123412341234`:

```
yarn apply eth_wrapping eth:0x1234123412341234123412341234123412341234
```

This will direct you to the Roles app, where you can review the updates that will be made to your role and confirm them by signing the apply transaction.

Applying permissions for the first time will create a new role.
Subsequent applications will update the existing role, efficiently removing, updating, and adding permissions so that the role configuration on chain accurately reflects the permissions defined in code.

## Folder Structure and Conventions

- [contracts.ts](./contracts.ts) – Lists all contracts that are used as targets in permissions
- [roles/](./roles) – Host directory for role configurations
  - [`role_key`/](./roles/eth_wrapping) – Each subfolder represents a distinct role. The folder name will be used as the [role key](#role-keys).
    - [permissions.ts](./roles/eth_wrapping/permissions.ts) – Defines all permissions for this role

There are some additional files and folders in the template repository, which you won't usually need to edit.
They contain the necessary wiring for automatically applying the permissions.

##### Role Keys

In the Zodiac Roles Modifier, every role is identified by a `bytes32` string.
Choose a role key that accurately describes the purpose of the role.
We recommend using only the following characters for role keys: `a...z`, `0...9`, `_`
The length must be less than 32 characters.

##### Prefixed Addresses

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
- Base: `base`
- Polygon Mumbai Testnet: `maticMumbai`
- Sepolia Testnet: `sep`
