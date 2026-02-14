import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  encodeFunctionData,
  type PublicClient,
  type WalletClient,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config, getNetwork, TRADING } from "../config.js";
import { lensAbi, routerAbi, curveAbi, erc20Abi } from "./abis.js";

export class MonadTrader {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private chain: Chain;
  private account;

  constructor() {
    const network = getNetwork();
    this.account = privateKeyToAccount(config.privateKey);
    this.chain = {
      id: network.chainId,
      name: config.network === "testnet" ? "Monad Testnet" : "Monad",
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { default: { http: [network.rpcUrl] } },
    };

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(network.rpcUrl),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.chain,
      transport: http(network.rpcUrl),
    });
  }

  get address(): string {
    return this.account.address;
  }

  async getBalance(): Promise<string> {
    const balance = await this.publicClient.getBalance({
      address: this.account.address,
    });
    return formatEther(balance);
  }

  /**
   * Buy tokens via bonding curve router.
   */
  async buy(
    tokenAddress: `0x${string}`,
    monAmount: string
  ): Promise<{ hash: string; amountOut: string }> {
    if (config.dryRun) {
      console.log(`[DRY RUN] Would buy ${tokenAddress} with ${monAmount} MON`);
      return { hash: "0xDRY_RUN", amountOut: "0" };
    }

    const network = getNetwork();

    const [router, amountOut] = await this.publicClient.readContract({
      address: network.LENS,
      abi: lensAbi,
      functionName: "getAmountOut",
      args: [tokenAddress, parseEther(monAmount), true],
    });

    const slippageBps = BigInt(TRADING.slippageBps);
    const amountOutMin = (amountOut * (10000n - slippageBps)) / 10000n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + TRADING.deadlineSecs);

    const callData = encodeFunctionData({
      abi: routerAbi,
      functionName: "buy",
      args: [
        {
          amountOutMin,
          token: tokenAddress,
          to: this.account.address,
          deadline,
        },
      ],
    });

    const hash = await this.walletClient.sendTransaction({
      account: this.account,
      to: router,
      data: callData,
      value: parseEther(monAmount),
      chain: this.chain,
    });

    console.log(`Buy tx sent: ${hash}`);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Buy tx confirmed: ${receipt.status}`);

    return { hash, amountOut: formatEther(amountOut) };
  }

  /**
   * Sell all held tokens via bonding curve router.
   */
  async sell(
    tokenAddress: `0x${string}`
  ): Promise<{ hash: string; amountOut: string }> {
    if (config.dryRun) {
      console.log(`[DRY RUN] Would sell all ${tokenAddress}`);
      return { hash: "0xDRY_RUN", amountOut: "0" };
    }

    const network = getNetwork();

    // Get token balance
    const balance = await this.publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [this.account.address],
    });

    if (balance === 0n) {
      throw new Error("No tokens to sell");
    }

    // Get quote
    const [router, amountOut] = await this.publicClient.readContract({
      address: network.LENS,
      abi: lensAbi,
      functionName: "getAmountOut",
      args: [tokenAddress, balance, false],
    });

    // Approve router to spend tokens
    const approveHash = await this.walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [router, balance],
      account: this.account,
      chain: this.chain,
    });
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Sell
    const slippageBps = BigInt(TRADING.slippageBps);
    const amountOutMin = (amountOut * (10000n - slippageBps)) / 10000n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + TRADING.deadlineSecs);

    const callData = encodeFunctionData({
      abi: routerAbi,
      functionName: "sell",
      args: [
        {
          amountIn: balance,
          amountOutMin,
          token: tokenAddress,
          to: this.account.address,
          deadline,
        },
      ],
    });

    const hash = await this.walletClient.sendTransaction({
      account: this.account,
      to: router,
      data: callData,
      chain: this.chain,
    });

    console.log(`Sell tx sent: ${hash}`);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Sell tx confirmed: ${receipt.status}`);

    return { hash, amountOut: formatEther(amountOut) };
  }

  /**
   * Check graduation progress (0-10000 = 0-100%).
   */
  async getProgress(tokenAddress: `0x${string}`): Promise<number> {
    const network = getNetwork();
    const progress = await this.publicClient.readContract({
      address: network.LENS,
      abi: lensAbi,
      functionName: "getProgress",
      args: [tokenAddress],
    });
    return Number(progress);
  }

  /**
   * Check if a token can be bought (not graduated and not locked).
   */
  async canBuy(tokenAddress: `0x${string}`): Promise<boolean> {
    const network = getNetwork();
    const [graduated, locked] = await Promise.all([
      this.publicClient.readContract({
        address: network.CURVE,
        abi: curveAbi,
        functionName: "isGraduated",
        args: [tokenAddress],
      }),
      this.publicClient.readContract({
        address: network.CURVE,
        abi: curveAbi,
        functionName: "isLocked",
        args: [tokenAddress],
      }),
    ]);
    return !graduated && !locked;
  }

  /**
   * Get token balance for our wallet.
   */
  async getTokenBalance(tokenAddress: `0x${string}`): Promise<string> {
    const balance = await this.publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [this.account.address],
    });
    return formatEther(balance);
  }
}
