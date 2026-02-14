/**
 * Test buy/sell on Monad testnet via bonding curve router.
 * Usage: npx tsx scripts/test-trade.ts <token_address>
 *
 * Buys a small amount, then sells it back.
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config, getNetwork } from "../backend/src/config.js";

// Minimal ABIs for testing
const lensAbi = [
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "isBuy", type: "bool" },
    ],
    name: "getAmountOut",
    outputs: [
      { name: "router", type: "address" },
      { name: "amountOut", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const routerBuyAbi = [
  {
    inputs: [
      {
        components: [
          { name: "amountOutMin", type: "uint256" },
          { name: "token", type: "address" },
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

async function main() {
  const tokenAddress = process.argv[2] as `0x${string}`;
  if (!tokenAddress) {
    console.error("Usage: npx tsx scripts/test-trade.ts <token_address>");
    process.exit(1);
  }

  const network = getNetwork();
  const account = privateKeyToAccount(config.privateKey);
  const chain = {
    id: network.chainId,
    name: "Monad",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: [network.rpcUrl] } },
  };

  const publicClient = createPublicClient({ chain, transport: http(network.rpcUrl) });
  const walletClient = createWalletClient({ account, chain, transport: http(network.rpcUrl) });

  console.log(`\nWallet: ${account.address}`);
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${formatEther(balance)} MON`);
  console.log(`Token: ${tokenAddress}`);
  console.log(`Network: ${config.network}\n`);

  // Buy
  const buyAmount = "0.01"; // Very small test amount
  console.log(`Buying with ${buyAmount} MON...`);

  const [router, amountOut] = await publicClient.readContract({
    address: network.LENS,
    abi: lensAbi,
    functionName: "getAmountOut",
    args: [tokenAddress, parseEther(buyAmount), true],
  });

  console.log(`Router: ${router}`);
  console.log(`Expected tokens out: ${formatEther(amountOut)}`);

  const amountOutMin = (amountOut * 99n) / 100n;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

  const callData = encodeFunctionData({
    abi: routerBuyAbi,
    functionName: "buy",
    args: [
      {
        amountOutMin,
        token: tokenAddress,
        to: account.address,
        deadline,
      },
    ],
  });

  const hash = await walletClient.sendTransaction({
    account,
    to: router,
    data: callData,
    value: parseEther(buyAmount),
    chain,
  });

  console.log(`Buy tx: ${network.explorer}/tx/${hash}`);
  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Status: ${receipt.status}`);
  console.log("\nTest trade complete!");
}

main().catch(console.error);
