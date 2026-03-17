#!/usr/bin/env node

/**
 * LITCOIN MCP Server
 *
 * Exposes the full LITCOIN protocol to any MCP-compatible AI agent.
 * Mine, claim, stake, vault, compute, guilds — all through tool calls.
 *
 * Usage:
 *   BANKR_API_KEY=bk_... npx litcoin-mcp
 *
 * Claude Desktop / Claude Code config:
 *   {
 *     "mcpServers": {
 *       "litcoin": {
 *         "command": "npx",
 *         "args": ["litcoin-mcp"],
 *         "env": { "BANKR_API_KEY": "bk_YOUR_KEY" }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ─── Config ──────────────────────────────────────────────────────────────────

const BANKR_API_KEY = process.env.BANKR_API_KEY || "";
const COORDINATOR = process.env.COORDINATOR_URL || "https://api.litcoiin.xyz";
const BANKR_BASE = "https://api.bankr.bot";

const CONTRACTS = {
  LITCOIN:        "0x316ffb9c875f900AdCF04889E415cC86b564EBa3",
  STAKING:        "0xC9584Ce1591E8EB38EdF15C28f2FDcca97A3d3B7",
  ORACLE:         "0x4f937937A3B7Ca046d0f2B5071782aFFC675241b",
  LITCREDIT:      "0x33e3d328F62037EB0d173705674CE713c348f0a6",
  VAULT_MANAGER:  "0xD23a9b32e38FABE2325e1d27f94EcCf0e4a2f058",
  CLAIMS:         "0xF703DcF2E88C0673F776870fdb12A453927C6A5e",
  COMPUTE_ESCROW: "0x28C351FE1A37434DD63882dA51b5f4CBade71724",
  GUILD:          "0xC377cbD6739678E0fae16e52970755f50AF55bD1",
  FAUCET:         "0x1659875dE16090c84C81DF1BDba3c3B4df093557",
};

const SELECTORS = {
  balanceOf:              "0x70a08231",
  totalStaked:            "0x817b1cd2",
  getTier:                "0xb45aae52",
  getStakeInfo:           "0xc3453153",
  getMiningBoostBps:      "0x1e9afdb1",
  timeUntilUnlock:        "0xd0228e8f",
  getOwnerVaultIds:       "0xa6f83a09",
  getVaultCollateralRatio:"0x31ef9daa",
  getMaxMintable:         "0x0725f4cb",
  isLiquidatable:         "0x211a4443",
  cpiPrice:               "0x3ad868db",
  litcoinPrice:           "0x1cb870fc",
  available:              "0x10098ad5",
  stake:                  "0x604f2177",
  unstake:                "0x2def6620",
  upgradeTier:            "0xa2949dd7",
  openVault:              "0x04a2ce7e",
  addCollateral:          "0xa8f35adf",
  mintLitCredit:          "0x91b4ffb4",
  repayDebt:              "0x015cb0a5",
  withdrawCollateral:     "0x767a7b05",
  closeVault:             "0x360c3288",
  deposit:                "0xb6b55f25",
  requestWithdraw:        "0x745400c9",
  cancelWithdraw:         "0x84b76824",
  completeWithdraw:       "0xf756fa21",
  approve:                "0x095ea7b3",
  createGuild:            "0x1c0e61dc",
  joinGuild:              "0xa3e77e2a",
  addDeposit:             "0xa6f1fd51",
  leaveGuild:             "0x0d3dfa92",
  stakeGuild:             "0x3deb2bb7",
  unstakeGuild:           "0x7b5f7292",
  earlyUnstake:           "0xfac16858",
  previewEarlyUnstake:    "0x1ffeb771",
  getLockRemaining:       "0xaa02a673",
  getGuildLockStatus:     "0xae3a39b4",
  getMember:              "0x2ada2596",
  getGuild:               "0xd3e96693",
  upgradeGuildTier:       "0x40c45dcc",
};

const RPC_URLS = [
  "https://base-mainnet.core.chainstack.com/0e8fb1d0e1b81bc55e077fc1546d4a78",
  "https://base.llamarpc.com",
  "https://base-rpc.publicnode.com",
  "https://mainnet.base.org",
];

const TIER_AMOUNTS = { 1: 1_000_000, 2: 5_000_000, 3: 50_000_000, 4: 500_000_000 };
const TIER_NAMES = { 1: "Spark", 2: "Circuit", 3: "Core", 4: "Architect" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bankrHeaders() {
  return { "Content-Type": "application/json", "X-API-Key": BANKR_API_KEY };
}

async function bankrGet(path) {
  const r = await fetch(`${BANKR_BASE}${path}`, { headers: bankrHeaders() });
  return r.json();
}

async function bankrPost(path, body) {
  const r = await fetch(`${BANKR_BASE}${path}`, {
    method: "POST", headers: bankrHeaders(), body: JSON.stringify(body),
  });
  return r.json();
}

async function coordGet(path, token) {
  const headers = { "Content-Type": "application/json", "X-Litcoin-SDK": "mcp-1.0.0" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${COORDINATOR}${path}`, { headers });
  return r.json();
}

async function coordPost(path, body, token) {
  const headers = { "Content-Type": "application/json", "X-Litcoin-SDK": "mcp-1.0.0" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${COORDINATOR}${path}`, {
    method: "POST", headers, body: JSON.stringify(body),
  });
  return r.json();
}

async function rpcCall(contract, calldata) {
  for (const rpc of RPC_URLS) {
    try {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: 1, method: "eth_call",
          params: [{ to: contract, data: calldata }, "latest"],
        }),
        signal: AbortSignal.timeout(8000),
      });
      const json = await r.json();
      return json.result || "0x" + "0".repeat(64);
    } catch { continue; }
  }
  return null;
}

function padAddr(addr) {
  return "000000000000000000000000" + addr.slice(2).toLowerCase();
}

function hex64(n) {
  return BigInt(n).toString(16).padStart(64, "0");
}

function decodeUint(hex, slot = 0) {
  if (!hex || hex === "0x") return 0n;
  const d = hex.startsWith("0x") ? hex.slice(2) : hex;
  const start = slot * 64;
  if (start + 64 > d.length) return 0n;
  return BigInt("0x" + d.slice(start, start + 64));
}

function toTokens(wei) {
  return Number(wei) / 1e18;
}

async function submitTx(to, calldata) {
  return bankrPost("/agent/submit", {
    transaction: { to, data: calldata, value: "0", chainId: 8453 },
  });
}

async function approveTx(token, spender, amountWei) {
  const cd = SELECTORS.approve + padAddr(spender) + hex64(amountWei);
  return submitTx(token, cd);
}

// ─── Auth State ──────────────────────────────────────────────────────────────

let _wallet = null;
let _authToken = null;
let _authExpiry = 0;

async function getWallet() {
  if (_wallet) return _wallet;
  const data = await bankrGet("/agent/me");
  for (const key of ["wallets", "addresses"]) {
    const items = data[key] || [];
    if (Array.isArray(items)) {
      for (const w of items) {
        const addr = typeof w === "object" ? w.address : w;
        if (typeof addr === "string" && addr.startsWith("0x")) {
          _wallet = addr.toLowerCase();
          return _wallet;
        }
      }
    }
  }
  for (const key of ["address", "evmAddress", "wallet"]) {
    if (data[key] && typeof data[key] === "string" && data[key].startsWith("0x")) {
      _wallet = data[key].toLowerCase();
      return _wallet;
    }
  }
  throw new Error("No wallet found from Bankr");
}

async function getAuth() {
  if (_authToken && Date.now() / 1000 < _authExpiry - 60) return _authToken;
  const wallet = await getWallet();
  const nonceRes = await coordPost("/v1/auth/nonce", { miner: wallet });
  const message = nonceRes.message;
  const sigRes = await bankrPost("/agent/sign", {
    signatureType: "personal_sign", message,
  });
  const verifyRes = await coordPost("/v1/auth/verify", {
    miner: wallet, message, signature: sigRes.signature,
  });
  _authToken = verifyRes.token;
  _authExpiry = Date.now() / 1000 + 3600;
  return _authToken;
}

// ─── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "litcoin",
  version: "2.2.0",
});

// ── Resources ────────────────────────────────────────────────────────────────

server.resource(
  "protocol-docs",
  "litcoin://docs",
  async () => ({
    contents: [{
      uri: "litcoin://docs",
      mimeType: "text/plain",
      text: "Full LITCOIN protocol documentation available at https://litcoiin.xyz/docs.md — fetch this URL for complete SDK reference, contract addresses, and API endpoints.",
    }],
  })
);

// ── Tools ────────────────────────────────────────────────────────────────────

// Balance
server.tool(
  "litcoin_balance",
  "Get LITCOIN and LITCREDIT token balances, staking tier, mining boost, and escrow balance for this wallet.",
  {},
  async () => {
    const wallet = await getWallet();
    const [litRaw, lcRaw, tierRaw, boostRaw, escrowRaw] = await Promise.all([
      rpcCall(CONTRACTS.LITCOIN, SELECTORS.balanceOf + padAddr(wallet)),
      rpcCall(CONTRACTS.LITCREDIT, SELECTORS.balanceOf + padAddr(wallet)),
      rpcCall(CONTRACTS.STAKING, SELECTORS.getTier + padAddr(wallet)),
      rpcCall(CONTRACTS.STAKING, SELECTORS.getMiningBoostBps + padAddr(wallet)),
      rpcCall(CONTRACTS.COMPUTE_ESCROW, SELECTORS.available + padAddr(wallet)),
    ]);
    const tier = Number(decodeUint(tierRaw));
    return {
      content: [{ type: "text", text: JSON.stringify({
        wallet,
        litcoin: toTokens(decodeUint(litRaw)),
        litcredit: toTokens(decodeUint(lcRaw)),
        stakingTier: tier,
        tierName: TIER_NAMES[tier] || "None",
        miningBoost: `${(Number(decodeUint(boostRaw)) / 10000).toFixed(2)}x`,
        escrowBalance: toTokens(decodeUint(escrowRaw)),
      }, null, 2) }],
    };
  }
);

// Network stats
server.tool(
  "litcoin_network",
  "Get LITCOIN network statistics: active miners, treasury balance, reward per solve, oracle prices.",
  {},
  async () => {
    const [stats, cpiRaw, litRaw] = await Promise.all([
      coordGet("/v1/claims/stats"),
      rpcCall(CONTRACTS.ORACLE, SELECTORS.cpiPrice),
      rpcCall(CONTRACTS.ORACLE, SELECTORS.litcoinPrice),
    ]);
    return {
      content: [{ type: "text", text: JSON.stringify({
        ...stats,
        oracleCpiPrice: toTokens(decodeUint(cpiRaw)),
        oracleLitcoinPrice: toTokens(decodeUint(litRaw)),
      }, null, 2) }],
    };
  }
);

// Mine one round
server.tool(
  "litcoin_mine",
  "Mine one round of LITCOIN. Requests a challenge, solves it deterministically, and submits the answer. Returns the reward earned.",
  {},
  async () => {
    const wallet = await getWallet();
    const token = await getAuth();
    const nonce = crypto.randomUUID();

    // Get challenge
    const challenge = await coordGet(`/v1/challenge?nonce=${nonce}`, token);
    if (challenge.error) {
      return { content: [{ type: "text", text: `Challenge error: ${challenge.error}` }] };
    }

    // Solve deterministically (same logic as SDK solver)
    const artifact = solveChallenge(challenge);

    // Submit
    const result = await coordPost("/v1/submit", {
      challengeId: challenge.challengeId,
      artifact,
      nonce,
    }, token);

    return {
      content: [{ type: "text", text: JSON.stringify({
        pass: result.pass,
        reward: result.reward,
        boostMultiplier: result.boostMultiplier,
        challengeId: challenge.challengeId,
      }, null, 2) }],
    };
  }
);

// Claim rewards
server.tool(
  "litcoin_claim",
  "Claim accumulated mining rewards on-chain. Transfers earned LITCOIN to your wallet.",
  {},
  async () => {
    const wallet = await getWallet();
    const result = await coordPost("/v1/claims/bankr", { wallet });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Check claimable
server.tool(
  "litcoin_claimable",
  "Check how much LITCOIN is available to claim.",
  {},
  async () => {
    const wallet = await getWallet();
    const status = await coordGet(`/v1/claims/status?wallet=${wallet}`);
    return {
      content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
    };
  }
);

// Stake
server.tool(
  "litcoin_stake",
  "Stake LITCOIN into a tier. Tier 1=Spark (1M), 2=Circuit (5M), 3=Core (50M), 4=Architect (500M). Auto-approves tokens.",
  { tier: z.number().min(1).max(4).describe("Staking tier (1-4)") },
  async ({ tier }) => {
    const amountWei = BigInt(TIER_AMOUNTS[tier]) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCOIN, CONTRACTS.STAKING, amountWei);
    const result = await submitTx(CONTRACTS.STAKING, SELECTORS.stake + hex64(tier));
    return {
      content: [{ type: "text", text: `Staked into ${TIER_NAMES[tier]} (tier ${tier}): ${JSON.stringify(result)}` }],
    };
  }
);

// Unstake
server.tool(
  "litcoin_unstake",
  "Unstake LITCOIN. Only works after the lock period expires.",
  {},
  async () => {
    const result = await submitTx(CONTRACTS.STAKING, SELECTORS.unstake);
    return { content: [{ type: "text", text: `Unstaked: ${JSON.stringify(result)}` }] };
  }
);

// Open vault
server.tool(
  "litcoin_open_vault",
  "Open a vault with LITCOIN collateral to mint LITCREDIT. Specify collateral in whole tokens.",
  { collateral: z.number().positive().describe("LITCOIN collateral amount in whole tokens") },
  async ({ collateral }) => {
    const wei = BigInt(Math.floor(collateral)) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCOIN, CONTRACTS.VAULT_MANAGER, wei);
    const result = await submitTx(CONTRACTS.VAULT_MANAGER, SELECTORS.openVault + hex64(wei));
    return { content: [{ type: "text", text: `Vault opened with ${collateral} LITCOIN: ${JSON.stringify(result)}` }] };
  }
);

// Mint LITCREDIT
server.tool(
  "litcoin_mint",
  "Mint LITCREDIT against an open vault. 1 LITCREDIT = 1,000 output tokens of AI inference.",
  {
    vault_id: z.number().describe("Vault ID"),
    amount: z.number().positive().describe("LITCREDIT to mint in whole tokens"),
  },
  async ({ vault_id, amount }) => {
    const wei = BigInt(Math.floor(amount)) * 10n ** 18n;
    const result = await submitTx(CONTRACTS.VAULT_MANAGER, SELECTORS.mintLitCredit + hex64(vault_id) + hex64(wei));
    return { content: [{ type: "text", text: `Minted ${amount} LITCREDIT from vault #${vault_id}: ${JSON.stringify(result)}` }] };
  }
);

// Repay debt
server.tool(
  "litcoin_repay",
  "Repay LITCREDIT debt on a vault.",
  {
    vault_id: z.number().describe("Vault ID"),
    amount: z.number().positive().describe("LITCREDIT to repay"),
  },
  async ({ vault_id, amount }) => {
    const wei = BigInt(Math.floor(amount)) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCREDIT, CONTRACTS.VAULT_MANAGER, wei);
    const result = await submitTx(CONTRACTS.VAULT_MANAGER, SELECTORS.repayDebt + hex64(vault_id) + hex64(wei));
    return { content: [{ type: "text", text: `Repaid ${amount} LITCREDIT on vault #${vault_id}: ${JSON.stringify(result)}` }] };
  }
);

// Add collateral
server.tool(
  "litcoin_add_collateral",
  "Add more LITCOIN collateral to an existing vault.",
  {
    vault_id: z.number().describe("Vault ID"),
    amount: z.number().positive().describe("LITCOIN to add"),
  },
  async ({ vault_id, amount }) => {
    const wei = BigInt(Math.floor(amount)) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCOIN, CONTRACTS.VAULT_MANAGER, wei);
    const result = await submitTx(CONTRACTS.VAULT_MANAGER, SELECTORS.addCollateral + hex64(vault_id) + hex64(wei));
    return { content: [{ type: "text", text: `Added ${amount} LITCOIN to vault #${vault_id}: ${JSON.stringify(result)}` }] };
  }
);

// Close vault
server.tool(
  "litcoin_close_vault",
  "Close a vault. Must repay all debt first.",
  { vault_id: z.number().describe("Vault ID") },
  async ({ vault_id }) => {
    const result = await submitTx(CONTRACTS.VAULT_MANAGER, SELECTORS.closeVault + hex64(vault_id));
    return { content: [{ type: "text", text: `Vault #${vault_id} closed: ${JSON.stringify(result)}` }] };
  }
);

// Vault info
server.tool(
  "litcoin_vaults",
  "List all vaults for this wallet with collateral, debt, health ratio, and liquidation status.",
  {},
  async () => {
    const wallet = await getWallet();
    const idsRaw = await rpcCall(CONTRACTS.VAULT_MANAGER, SELECTORS.getOwnerVaultIds + padAddr(wallet));
    if (!idsRaw || idsRaw === "0x" || idsRaw.length < 130) {
      return { content: [{ type: "text", text: "No vaults found." }] };
    }
    const data = idsRaw.slice(2);
    const count = Number(BigInt("0x" + data.slice(64, 128)));
    const vaults = [];
    for (let i = 0; i < count; i++) {
      const vid = Number(BigInt("0x" + data.slice(128 + i * 64, 192 + i * 64)));
      const [healthRaw, mintRaw, liqRaw] = await Promise.all([
        rpcCall(CONTRACTS.VAULT_MANAGER, SELECTORS.getVaultCollateralRatio + hex64(vid)),
        rpcCall(CONTRACTS.VAULT_MANAGER, SELECTORS.getMaxMintable + hex64(vid)),
        rpcCall(CONTRACTS.VAULT_MANAGER, SELECTORS.isLiquidatable + hex64(vid)),
      ]);
      vaults.push({
        vaultId: vid,
        healthRatioBps: Number(decodeUint(healthRaw)),
        maxMintable: toTokens(decodeUint(mintRaw)),
        liquidatable: decodeUint(liqRaw) !== 0n,
      });
    }
    return { content: [{ type: "text", text: JSON.stringify(vaults, null, 2) }] };
  }
);

// Deposit to escrow
server.tool(
  "litcoin_deposit_escrow",
  "Deposit LITCREDIT into the compute escrow for AI inference spending.",
  { amount: z.number().positive().describe("LITCREDIT to deposit") },
  async ({ amount }) => {
    const wei = BigInt(Math.floor(amount)) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCREDIT, CONTRACTS.COMPUTE_ESCROW, wei);
    const result = await submitTx(CONTRACTS.COMPUTE_ESCROW, SELECTORS.deposit + hex64(wei));
    return { content: [{ type: "text", text: `Deposited ${amount} LITCREDIT to escrow: ${JSON.stringify(result)}` }] };
  }
);

// Compute
server.tool(
  "litcoin_compute",
  "Send a prompt to the LITCOIN compute marketplace for AI inference. Uses LITCREDIT from escrow. Returns the AI response.",
  {
    prompt: z.string().describe("The prompt to send"),
    model: z.string().optional().describe("Model name (default: llama-3.3-70b)"),
  },
  async ({ prompt, model }) => {
    const result = await coordPost("/v1/compute/request", {
      prompt,
      model: model || "llama-3.3-70b",
      maxTokens: 1024,
    });
    return {
      content: [{ type: "text", text: result.response || JSON.stringify(result, null, 2) }],
    };
  }
);

// Create guild
server.tool(
  "litcoin_create_guild",
  "Create a new mining guild. You become the leader.",
  { name: z.string().describe("Guild name") },
  async ({ name }) => {
    const nameBytes = new TextEncoder().encode(name);
    const nameHex = Array.from(nameBytes).map(b => b.toString(16).padStart(2, "0")).join("");
    const padLen = (32 - nameBytes.length % 32) % 32;
    const calldata = SELECTORS.createGuild +
      hex64(32) +
      hex64(nameBytes.length) +
      nameHex + "00".repeat(padLen);
    const result = await submitTx(CONTRACTS.GUILD, calldata);
    return { content: [{ type: "text", text: `Guild "${name}" created: ${JSON.stringify(result)}` }] };
  }
);

// Join guild
server.tool(
  "litcoin_join_guild",
  "Join a mining guild with a LITCOIN deposit.",
  {
    guild_id: z.number().describe("Guild ID"),
    amount: z.number().positive().describe("LITCOIN to deposit"),
  },
  async ({ guild_id, amount }) => {
    const wei = BigInt(Math.floor(amount)) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCOIN, CONTRACTS.GUILD, wei);
    const result = await submitTx(CONTRACTS.GUILD, SELECTORS.joinGuild + hex64(guild_id) + hex64(wei));
    return { content: [{ type: "text", text: `Joined guild #${guild_id} with ${amount} LITCOIN: ${JSON.stringify(result)}` }] };
  }
);

// Leave guild
server.tool(
  "litcoin_leave_guild",
  "Leave your current mining guild. Returns your deposited tokens.",
  {},
  async () => {
    const result = await submitTx(CONTRACTS.GUILD, SELECTORS.leaveGuild);
    return { content: [{ type: "text", text: `Left guild: ${JSON.stringify(result)}` }] };
  }
);

// Faucet
server.tool(
  "litcoin_faucet",
  "Claim 5M LITCOIN from the bootstrap faucet. One-time per wallet. Solves a trial challenge to prove AI capability.",
  {},
  async () => {
    const wallet = await getWallet();
    // Get faucet challenge
    const challenge = await coordPost("/v1/faucet/challenge", {});
    if (challenge.error) {
      return { content: [{ type: "text", text: `Faucet error: ${challenge.error}` }] };
    }
    // Solve it
    const artifact = solveChallenge(challenge);
    // Submit
    const result = await coordPost("/v1/faucet/submit", {
      challengeId: challenge.challengeId || challenge.benchmarkId,
      artifact,
      wallet,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── Research Tools ─────────────────────────────────────────────────────────

server.tool(
  "litcoin_research_tasks",
  "List available research tasks. Agents solve real optimization problems (sorting, compression, ML training) for LITCOIN rewards. Returns active tasks with baselines and best results.",
  { type: z.string().optional().describe("Filter by type: code_optimization, algorithm, ml_training, prompt_engineering, data_science") },
  async ({ type }) => {
    const params = type ? `?type=${type}` : "";
    const data = await coordGet(`/v1/research/tasks${params}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_research_get_task",
  "Get full details for a specific research task including description, constraints, baseline, leaderboard, and entry function signature.",
  { task_id: z.string().describe("Task ID (e.g. 'sort-benchmark-001')") },
  async ({ task_id }) => {
    const data = await coordGet(`/v1/research/task/${task_id}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_research_submit",
  "Submit a research solution for verification. The coordinator runs your code in a sandbox — if it beats the baseline, you earn LITCOIN. Code must define the required entry function. No os/sys/subprocess imports allowed.",
  {
    task_id: z.string().describe("Task ID to submit against"),
    code: z.string().describe("Python code with the required entry function"),
  },
  async ({ task_id, code }) => {
    const wallet = await getWallet();
    const data = await coordPost("/v1/research/submit", {
      taskId: task_id, miner: wallet, code,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_research_results",
  "View verified research discoveries — every improvement submitted by miners with full code, metrics, and rewards. This is the public proof that mining produces real work.",
  {
    task_id: z.string().optional().describe("Filter by task ID"),
    limit: z.number().optional().describe("Max results (default 20)"),
  },
  async ({ task_id, limit }) => {
    const params = new URLSearchParams();
    if (task_id) params.set("taskId", task_id);
    if (limit) params.set("limit", String(limit));
    const qs = params.toString() ? `?${params}` : "";
    const data = await coordGet(`/v1/research/results${qs}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_research_stats",
  "Get global research statistics: active tasks, total submissions, improvements, breakthroughs, unique researchers, and recent records.",
  {},
  async () => {
    const data = await coordGet("/v1/research/stats");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_research_history",
  "Get your iteration history on research tasks. Shows personal bests, streaks, and progression over time for each task you've worked on. Karpathy-style iteration tracking.",
  {
    task_id: z.string().optional().describe("Filter to a specific task ID"),
  },
  async ({ task_id }) => {
    const wallet = await getWallet();
    const params = new URLSearchParams({ miner: wallet });
    if (task_id) params.set("taskId", task_id);
    const data = await coordGet(`/v1/research/history?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_miner_status",
  "Get comprehensive miner status: mining activity, relay connection (connected/disconnected), quality score, requests served, earnings breakdown (comprehension/research/staking/relay), guild membership, and overall health check. Essential for debugging relay issues.",
  {
    wallet: z.string().optional().describe("Wallet to check (defaults to your wallet)"),
  },
  async ({ wallet }) => {
    const w = wallet || await getWallet();
    const data = await coordGet(`/v1/miner/status?wallet=${w}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_guild_yield",
  "Get network-wide guild yield data: recent yield distribution history (24h chart data), per-member cumulative yields, total yield earned across all guilds. Shows how the 25% staking pool is distributed to guild members.",
  {},
  async () => {
    const data = await coordGet("/v1/guilds/yield");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_guild_member_yield",
  "Get your personal guild yield history: total yield earned, recent entries for charting, deposit amount, share percentage, and guild ID.",
  {
    wallet: z.string().optional().describe("Wallet to check (defaults to your wallet)"),
  },
  async ({ wallet }) => {
    const w = wallet || await getWallet();
    const data = await coordGet(`/v1/guilds/yield/${w}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "litcoin_protocol_stats",
  "Get cached protocol statistics: totalStaked, litcreditSupply, vaultCollateral, vaultDebt, cpiPrice, litcoinPrice, treasury balance. Updated every 120 seconds.",
  {},
  async () => {
    const data = await coordGet("/v1/protocol/stats");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Early Unstake ────────────────────────────────────────────────────────────

server.tool(
  "litcoin_early_unstake",
  "Preview or execute early unstake with penalty. Call without confirm to preview penalty amount. Call with confirm=true to execute. Returns penalty %, amount burned, and amount returned.",
  {
    confirm: z.boolean().optional().describe("Set true to execute. Omit to preview penalty."),
  },
  async ({ confirm }) => {
    const wallet = await getWallet();
    const r = await coordPost("/v1/bankr/early-unstake", { bankrKey: BANKR_API_KEY, confirm: confirm || false });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Stake Info ───────────────────────────────────────────────────────────────

server.tool(
  "litcoin_stake_info",
  "Get detailed staking info: current tier, lock remaining (seconds and human-readable), lock expired status, balance, and all positions.",
  {},
  async () => {
    const wallet = await getWallet();
    const r = await coordPost("/v1/bankr/balance", { bankrKey: BANKR_API_KEY });
    const info = {
      wallet: r.wallet,
      tier: r.tier,
      tierName: r.tierName,
      lockRemaining: r.lockRemaining,
      lockExpired: r.lockExpired,
      lockDays: r.lockRemaining > 0 ? Math.ceil(r.lockRemaining / 86400) : 0,
      balance: r.balance,
      litcredit: r.litcredit,
      escrow: r.escrow,
      vaults: r.vaults,
      guild: r.guild,
    };
    return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
  }
);

// ── Vault Details ────────────────────────────────────────────────────────────

server.tool(
  "litcoin_vault_details",
  "Get detailed info for each vault: collateral, debt, ratio, max mintable, healthy status. Call after checking balance to see vault IDs.",
  {},
  async () => {
    const r = await coordPost("/v1/bankr/vault/details", { bankrKey: BANKR_API_KEY });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Vault Open ───────────────────────────────────────────────────────────────

server.tool(
  "litcoin_open_vault_bankr",
  "Open a new vault by depositing LITCOIN as collateral. Uses Bankr key directly — no MetaMask needed. Handles approve + open in one call.",
  {
    amount: z.number().describe("LITCOIN amount to deposit as collateral"),
  },
  async ({ amount }) => {
    const r = await coordPost("/v1/bankr/vault/open", { bankrKey: BANKR_API_KEY, amount });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Vault Add Collateral (Bankr) ─────────────────────────────────────────────

server.tool(
  "litcoin_add_collateral_bankr",
  "Add LITCOIN collateral to an existing vault via Bankr. Handles approve + addCollateral in one call.",
  {
    vaultId: z.number().describe("Vault ID"),
    amount: z.number().describe("LITCOIN amount to add"),
  },
  async ({ vaultId, amount }) => {
    const r = await coordPost("/v1/bankr/vault/add-collateral", { bankrKey: BANKR_API_KEY, vaultId, amount });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Vault Mint (Bankr) ──────────────────────────────────────────────────────

server.tool(
  "litcoin_mint_bankr",
  "Mint LITCREDIT against vault collateral via Bankr. Checks maxMintable, accounts for 0.5% fee. Returns error with maxMintable if amount exceeds limit.",
  {
    vaultId: z.number().describe("Vault ID"),
    amount: z.number().describe("LITCREDIT amount to mint"),
  },
  async ({ vaultId, amount }) => {
    const r = await coordPost("/v1/bankr/vault/mint", { bankrKey: BANKR_API_KEY, vaultId, amount });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Stake Guild ──────────────────────────────────────────────────────────────

server.tool(
  "litcoin_stake_guild",
  "Guild leader stakes the guild pool at a tier (1-4). Requires leader role. Pool must have enough deposited LITCOIN for the tier. Locks the entire guild.",
  {
    guildId: z.number().describe("Guild ID"),
    tier: z.number().min(1).max(4).describe("Staking tier 1-4"),
    amount: z.number().describe("Amount to stake (total pool)"),
  },
  async ({ guildId, tier, amount }) => {
    const wallet = await getWallet();
    const wei = BigInt(Math.floor(amount)) * 10n ** 18n;
    await approveTx(CONTRACTS.LITCOIN, CONTRACTS.STAKING, wei.toString());
    const cd = SELECTORS.stakeGuild + hex64(guildId) + hex64(tier) + hex64(wei.toString());
    const result = await submitTx(CONTRACTS.GUILD, cd);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Unstake Guild ────────────────────────────────────────────────────────────

server.tool(
  "litcoin_unstake_guild",
  "Guild leader unstakes the guild. Requires lock to be expired. Frees all member tokens. Members can leave after this.",
  {
    guildId: z.number().describe("Guild ID"),
  },
  async ({ guildId }) => {
    const r = await coordPost("/v1/bankr/guild/unstake", { bankrKey: BANKR_API_KEY, guildId });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Deploy Agent ─────────────────────────────────────────────────────────────

server.tool(
  "litcoin_deploy_agent",
  "Deploy an autonomous mining agent. Strategies: conservative (~100 solves/hr), balanced (~400/hr), aggressive (~1600/hr), researcher (~300/hr + research). Set maxBudget to cap LITCOIN deployed across staking+vaults. Set targetTier to override staking target.",
  {
    strategy: z.enum(["conservative", "balanced", "aggressive", "researcher"]).describe("Agent strategy"),
    maxBudget: z.number().optional().describe("Max LITCOIN to deploy (null=unlimited)"),
    targetTier: z.number().min(1).max(4).optional().describe("Target staking tier (1-4)"),
    aiKey: z.string().optional().describe("AI API key for research (or use Bankr LLM)"),
    useBankrLLM: z.boolean().optional().describe("Use Bankr key as LLM key"),
  },
  async ({ strategy, maxBudget, targetTier, aiKey, useBankrLLM }) => {
    const body = {
      strategy,
      bankrKey: BANKR_API_KEY,
      aiKey: useBankrLLM ? BANKR_API_KEY : (aiKey || undefined),
      aiUrl: useBankrLLM ? "https://llm.bankr.bot/v1" : undefined,
      config: {
        maxBudget: maxBudget || null,
        targetTier: targetTier || null,
      },
    };
    const r = await coordPost("/v1/agent/deploy", body);
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Agent Config ─────────────────────────────────────────────────────────────

server.tool(
  "litcoin_agent_config",
  "Update a running agent's behavior. 9 boolean toggles (mine, research, autoClaim, autoStake, openVaults, mintLitcredit, autoDefend, depositEscrow, compound) plus targetTier (1-4 or null) and maxBudget (number or null). Changes take effect next cycle.",
  {
    agentId: z.string().describe("Agent ID"),
    mine: z.boolean().optional(),
    research: z.boolean().optional(),
    autoClaim: z.boolean().optional(),
    autoStake: z.boolean().optional(),
    openVaults: z.boolean().optional(),
    mintLitcredit: z.boolean().optional(),
    autoDefend: z.boolean().optional(),
    depositEscrow: z.boolean().optional(),
    compound: z.boolean().optional(),
    targetTier: z.number().min(1).max(4).nullable().optional().describe("Target staking tier"),
    maxBudget: z.number().nullable().optional().describe("Max LITCOIN to deploy"),
  },
  async ({ agentId, ...config }) => {
    const body = { agentId, bankrKey: BANKR_API_KEY, config };
    const r = await coordPost("/v1/agent/config", body);
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Agent List ───────────────────────────────────────────────────────────────

server.tool(
  "litcoin_agent_list",
  "List all running agents with solve counts, mining rates, recent activity, config, and on-chain snapshots. Shows solvesPerHour, lastSolveAt, comprehensionSolves, researchSolves.",
  {},
  async () => {
    const data = await coordGet("/v1/agents");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Agent Stop ───────────────────────────────────────────────────────────────

server.tool(
  "litcoin_agent_stop",
  "Stop a running agent. Requires ownership proof (same Bankr key used to deploy).",
  {
    agentId: z.string().describe("Agent ID to stop"),
  },
  async ({ agentId }) => {
    const r = await coordPost("/v1/agent/stop", { agentId, bankrKey: BANKR_API_KEY });
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ── Research Leaderboard ─────────────────────────────────────────────────────

server.tool(
  "litcoin_research_leaderboard",
  "Get the research leaderboard: top miners by reward, breakthroughs, submissions, quality score.",
  {
    taskId: z.string().optional().describe("Filter by task ID"),
  },
  async ({ taskId }) => {
    const q = taskId ? `?taskId=${taskId}` : "";
    const data = await coordGet(`/v1/research/leaderboard${q}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Health ───────────────────────────────────────────────────────────────────

server.tool(
  "litcoin_health",
  "Check coordinator health: uptime, active miners, treasury, emission, research sandbox status, error buffer. Use this as first diagnostic step.",
  {},
  async () => {
    const data = await coordGet("/v1/health");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

function solveChallenge(challenge) {
  const { doc, questions, constraints, entities } = challenge;
  if (!doc || !questions) return "";

  const answers = [];

  for (const q of questions) {
    // Try to find answer in document
    let answer = "";

    // Check entities for matching data
    if (entities) {
      for (const ent of entities) {
        if (q.toLowerCase().includes(ent.name?.toLowerCase() || "")) {
          // Return relevant entity data
          if (ent.revenue) answer = ent.revenue;
          else if (ent.founded) answer = String(ent.founded);
          else if (ent.role) answer = ent.role;
          else if (ent.value) answer = String(ent.value);
          break;
        }
      }
    }

    if (!answer) {
      // Extract from constraints
      for (const c of (constraints || [])) {
        if (typeof c === "string" && c.includes("=")) {
          const [key, val] = c.split("=").map(s => s.trim());
          if (q.toLowerCase().includes(key.toLowerCase())) {
            answer = val;
            break;
          }
        }
      }
    }

    if (!answer) answer = "N/A";
    answers.push(answer);
  }

  // Compute ASCII checksum
  const joined = answers.join("|");
  let checksum = 0;
  for (let i = 0; i < joined.length; i++) {
    checksum = (checksum + joined.charCodeAt(i)) % 256;
  }
  answers.push(String(checksum));

  return answers.join("|");
}

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
  if (!BANKR_API_KEY) {
    console.error("BANKR_API_KEY environment variable required. Get one at https://bankr.bot/api");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
