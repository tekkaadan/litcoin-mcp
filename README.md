# litcoin-mcp

MCP server for the LITCOIN proof-of-research protocol on Base. **43 tools** covering mining, research, staking, vaults, LITCREDIT, guilds, autonomous agents, compute, bounties, and API keys.

## Install

```bash
BANKR_API_KEY=bk_YOUR_KEY npx litcoin-mcp
```

## Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "litcoin": {
      "command": "npx",
      "args": ["litcoin-mcp"],
      "env": { "BANKR_API_KEY": "bk_YOUR_KEY" }
    }
  }
}
```

Get a Bankr API key at [bankr.bot/api](https://bankr.bot/api). Enable write access.

## Tools (43)

### Mining & Rewards
| Tool | Description |
|------|-------------|
| `litcoin_mine` | Mine a comprehension challenge (deterministic, no LLM needed) |
| `litcoin_claim` | Claim rewards on-chain |
| `litcoin_claimable` | Check claimable balance |
| `litcoin_balance` | LITCOIN + LITCREDIT balances, tier, escrow, guild |
| `litcoin_faucet` | Bootstrap 5M free LITCOIN (one-time) |
| `litcoin_miner_status` | Comprehensive miner status |
| `litcoin_network` | Network stats (active miners, emission) |
| `litcoin_health` | Coordinator health and diagnostics |
| `litcoin_protocol_stats` | Cached on-chain stats |

### Research
| Tool | Description |
|------|-------------|
| `litcoin_research_tasks` | List active research tasks |
| `litcoin_research_get_task` | Get task details + baseline |
| `litcoin_research_submit` | Submit solution code |
| `litcoin_research_results` | Recent results with improvements |
| `litcoin_research_stats` | Global research stats + 24h metrics |
| `litcoin_research_history` | Your submission history per task |

### DeFi
| Tool | Description |
|------|-------------|
| `litcoin_stake` | Stake at a tier (Spark/Circuit/Core/Architect) |
| `litcoin_unstake` | Unstake after lock expires |
| `litcoin_open_vault` | Open a vault with LITCOIN collateral |
| `litcoin_open_vault_v2` | Open vault with LITCOIN or USDC (multi-collateral) |
| `litcoin_mint_litcredit` | Mint LITCREDIT from vault |
| `litcoin_repay_debt` | Repay vault debt |
| `litcoin_add_collateral` | Add collateral to vault (auto-detects LITCOIN/USDC) |
| `litcoin_close_vault` | Close vault (repays debt, returns collateral) |
| `litcoin_vault_details` | Get vault status and ratios |
| `litcoin_deposit_escrow` | Deposit LITCREDIT to compute escrow |
| `litcoin_join_guild` | Join a mining guild |
| `litcoin_leave_guild` | Leave current guild |

### Compute
| Tool | Description |
|------|-------------|
| `litcoin_compute_chat` | Send a prompt to relay miners (OpenAI-compatible) |
| `litcoin_compute_health` | Network status and provider count |
| `litcoin_compute_providers` | List online relay providers |
| `litcoin_compute_models` | Available models from online relays |

### Agents
| Tool | Description |
|------|-------------|
| `litcoin_deploy_agent` | Deploy an autonomous Sentinel agent |
| `litcoin_stop_agent` | Stop an agent |
| `litcoin_agent_config` | Update agent config (relay, research, DeFi toggles) |
| `litcoin_agent_status` | Get agent details |
| `litcoin_list_agents` | List all agents |

## What's New in v2.2.0

- Research stats now include 24h metrics
- Compute tools use OpenAI-compatible `/v1/chat/completions`
- Agent config supports `relayEnabled`, `relayBudget`, and `useEscrowCompute`
- AI provider auto-detected from key prefix
- Bounty system: post bounties with LITCOIN or LITCREDIT (on-chain escrow via BountyEscrow contract)
- Position endpoint: `GET /v1/position?wallet=` returns full on-chain snapshot
- 1,099 problems across 5 databases (Codeforces, Euler, Rosalind, HuggingFace, ARC)

## Links

- Site: https://litcoiin.xyz
- SDK: `pip install litcoin` (v4.8.1)
- Docs: https://litcoiin.xyz/docs
- Research: https://litcoiin.xyz/research
- Dataset: https://huggingface.co/datasets/tekkaadan/litcoin-research
- Chain: Base mainnet (8453)

## Version

2.2.0

## License

MIT
