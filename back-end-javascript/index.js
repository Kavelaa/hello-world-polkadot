#!/usr/bin/env node

const { program } = require("commander");
const { ApiPromise, WsProvider } = require("@polkadot/api");

program.option(
  "-s, --search <blockOrBlockHash>",
  "search block by its number or hash"
);

program.parse(process.argv);

console.log("fetching...");

let result;

if (program.search) {
  result = searchBlock(program.search);
} else {
  result = searchBlock();
}

printResultAndExit(result);

function printResultAndExit(result) {
  result
    .then((res) => {
      console.log(JSON.stringify(res, null, 2));
      process.exit();
    })
    .catch((err) => {
      console.error(err);

      process.exit();
    });
}

async function searchBlock(value) {
  const wsProvider = new WsProvider("wss://rpc.polkadot.io");
  const api = await ApiPromise.create({ provider: wsProvider });
  const {
    rpc: { chain },
  } = api;

  if (value === undefined) {
    const info = await chain.getBlock();

    return info;
  }

  const isBlockHash = /^0x/.test(value);

  let result;

  try {
    if (isBlockHash) {
      result = await chain.getBlock(value);
    } else {
      const blockHash = await chain.getBlockHash(value);
      result = await chain.getBlock(blockHash);
    }
  } catch (e) {
    console.log(e);
  }

  return result;
}
