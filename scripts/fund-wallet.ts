/**
 * Generate a new Monad wallet and fund it from the testnet faucet.
 * Usage: npx tsx scripts/fund-wallet.ts [--generate]
 *
 * --generate: Create a new random wallet and print the private key
 * Without flag: Fund the wallet from PRIVATE_KEY in .env
 */
import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { config, getNetwork } from "../backend/src/config.js";

const network = getNetwork();

async function generateWallet() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  console.log("\n--- New Wallet Generated ---");
  console.log(`Address:     ${account.address}`);
  console.log(`Private Key: ${privateKey}`);
  console.log("\nAdd to backend/.env:");
  console.log(`PRIVATE_KEY=${privateKey}\n`);
  return account.address;
}

async function fundFromFaucet(address: string) {
  console.log(`\nFunding ${address} from testnet faucet...`);
  const res = await fetch("https://agents.devnads.com/v1/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chainId: 10143, address }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log("Faucet response:", JSON.stringify(data, null, 2));
  } else {
    console.error("Faucet error:", res.status, JSON.stringify(data, null, 2));
  }
}

async function checkBalance(address: string) {
  const client = createPublicClient({
    chain: {
      id: network.chainId,
      name: "Monad Testnet",
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { default: { http: [network.rpcUrl] } },
    },
    transport: http(network.rpcUrl),
  });
  const balance = await client.getBalance({ address: address as `0x${string}` });
  console.log(`Balance: ${formatEther(balance)} MON`);
}

async function main() {
  const shouldGenerate = process.argv.includes("--generate");

  let address: string;
  if (shouldGenerate) {
    address = await generateWallet();
  } else if (config.privateKey) {
    const account = privateKeyToAccount(config.privateKey);
    address = account.address;
    console.log(`Using wallet from .env: ${address}`);
  } else {
    console.log("No PRIVATE_KEY in .env. Generating new wallet...");
    address = await generateWallet();
  }

  if (config.network === "testnet") {
    await fundFromFaucet(address);
    // Wait a moment for the tx to settle
    console.log("Waiting 5s for faucet tx to confirm...");
    await new Promise((r) => setTimeout(r, 5000));
  }

  await checkBalance(address);
}

main().catch(console.error);
