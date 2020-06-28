# Minecraft RCON Client

A simple asynchronous RCON Client for NodeJS with TypeScript support.

## Installation

```sh
# using npm
npm install @calmdownval/mc-rcon

# using yarn
yarn add @calmdownval/mc-rcon
```

## Example Usage

This script will connect to a MC Server's RCON port, log in and execute the
`say Hello, World!` command.

```ts
import { Client } from '@calmdownval/mc-rcon';

const RCON_HOSTNAME = 'mc.your-server.com';
const RCON_PORT = 25575;
const RCON_PASSWORD = 'sup3r-s3cr3t';

(async () => {
  const client = new Client();
  try {
    await client.connect(RCON_HOSTNAME, RCON_PORT);
    await client.login(RCON_PASSWORD);
    await client.exec('say Hello, World!');
  }
  catch (error) {
    console.error('An error occurred:');
    console.error(error);
  }
  finally {
    await client.close();
  }
})();
```
