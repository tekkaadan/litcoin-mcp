# litcoin-mcp

MCP server for the LITCOIN proof-of-comprehension and proof-of-research protocol on Base. **43 tools** covering mining, research, staking, vaults, LITCREDIT, guilds, autonomous agents, and compute.

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
| `litcoin_research_tasks` | List active research tasks (19 types) |
| `litcoin_research_get_task` | Get task details |
| `litcoin_research_submit` | Submit solution code |
| `litcoin_research_results` | Recent results |
| `litcoin_research_stats` | Global research stats |
| `litcoin_research_history` | Your submission history |
| `litcoin_research_leaderboard` | Top researchers by reward |

### Staking
| Tool | Description |
|------|-------------|
| `litcoin_stake` | Stake into tier 1-4 (auto-approve) |
| `litcoin_unstake` | Unstake after lock expires |
| `litcoin_early_unstake` | Preview/execute early unstake with penalty |
| `litcoin_stake_info` | Tier, lock remaining, positions, guild |

### Vaults
| Tool | Description |
|------|-------------|
| `litcoin_open_vault` | Open vault (MetaMask) |
| `litcoin_open_vault_bankr` | Open vault (Bankr key) |
| `litcoin_mint` | Mint LITCREDIT (MetaMask) |
| `litcoin_mint_bankr` | Mint LITCREDIT (Bankr key) |
| `litcoin_repay` | Repay vault debt |
| `litcoin_add_collateral` | Add collateral (MetaMask) |
| `litcoin_add_collateral_bankr` | Add collateral (Bankr key) |
| `litcoin_close_vault` | Close vault |
| `litcoin_vaults` | List your vaults |
| `litcoin_vault_details` | Per-vault health, debt, collateral |

### Compute
| Tool | Description |
|------|-------------|
| `litcoin_deposit_escrow` | Deposit LITCREDIT for compute |
| `litcoin_compute` | AI inference via relay network |

### Guilds
| Tool | Description |
|------|-------------|
| `litcoin_create_guild` | Create a mining guild |
| `litcoin_join_guild` | Join guild with deposit |
| `litcoin_leave_guild` | Leave guild |
| `litcoin_stake_guild` | Leader stakes guild at tier |
| `litcoin_unstake_guild` | Leader unstakes guild |
| `litcoin_guild_yield` | Guild yield stats |
| `litcoin_guild_member_yield` | Your personal guild yield |

### Autonomous Agents
| Tool | Description |
|------|-------------|
| `litcoin_deploy_agent` | Deploy agent (4 strategies, budget limit) |
| `litcoin_agent_config` | Update 9 toggles + targetTier + maxBudget |
| `litcoin_agent_list` | List agents with solve rates and activity |
| `litcoin_agent_stop` | Stop agent |

## Agent Strategies

| Strategy | Mining Rate | Cycle | Risk |
|----------|-----------|-------|------|
| conservative | ~100/hr | 60 min | Low |
| balanced | ~400/hr | 30 min | Medium |
| aggressive | ~1,600/hr | 15 min | High |
| researcher | ~300/hr + research | 30 min | Medium |

Set `maxBudget` to cap how much the agent deploys. Set `targetTier` to override staking target.

## Key Info

- Chain: Base mainnet (8453)
- Token: `0x316ffb9c875f900AdCF04889E415cC86b564EBa3`
- Emission: 1.5%/day (~34.4M LITCOIN)
- 1 LITCREDIT = 1,000 output tokens of frontier AI
- Docs: https://litcoiin.xyz/docs
- Site: https://litcoiin.xyz

## Changelog

### 2.2.0 (March 2026)
- **14 new tools**: early_unstake, stake_info, vault_details, open_vault_bankr, add_collateral_bankr, mint_bankr, stake_guild, unstake_guild, deploy_agent, agent_config, agent_list, agent_stop, research_leaderboard, health
- Chainstack as primary RPC
- Added missing selectors (earlyUnstake, getLockRemaining, guild lock status)
- 43 tools total (was 29)

### 2.1.0
- Research tools (6), guild yield, miner status, protocol stats
- 29 tools

### 2.0.0
- Initial release with mining, staking, vaults, compute, guilds
