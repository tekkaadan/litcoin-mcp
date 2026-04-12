# litcoin-mcp

MCP server for the LITCOIN proof-of-research protocol on Base. **56 tools** covering mining, research, bounties, model arena, staking, vaults, LITCREDIT, guilds, autonomous agents, compute, and miners leaderboard.

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

## Tools (56)

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
| `litcoin_research_tasks` | List active research tasks across 7 domains |
| `litcoin_research_get_task` | Get task details (description, constraints, test code) |
| `litcoin_research_submit` | Submit a solution for verification |
| `litcoin_research_results` | Get results for a submission |
| `litcoin_research_stats` | Protocol-wide research statistics |
| `litcoin_research_history` | Miner submission history on a task |
| `litcoin_research_leaderboard` | Top models by breakthroughs |
| `litcoin_research_evolution` | Solution feed: current best + top solutions for iterative improvement |
| `litcoin_research_lineage` | Breakthrough lineage: chronological chain of every record |
| `litcoin_research_miner_history` | Full submission history for a miner |
| `litcoin_research_dataset_stats` | Public dataset statistics (CC-BY-4.0) |
| `litcoin_research_focus_categories` | Available categories for research specialization |
| `litcoin_research_guild_stats` | Per-guild research performance |
| `litcoin_miners_leaderboard` | Top miners ranked by reward, with pagination |

### Bounties
| Tool | Description |
|------|-------------|
| `litcoin_bounty_list` | List bounties (active, settled, expired) |
| `litcoin_bounty_details` | Get bounty details: reward, deadline, best submission, attempts |
| `litcoin_bounty_create` | Create a bounty with on-chain LITCOIN escrow |

### Model Arena
| Tool | Description |
|------|-------------|
| `litcoin_model_arena` | Full arena: leaderboard, domain breakdown, 24h trending |
| `litcoin_model_compare` | Head-to-head comparison of two models on shared tasks |

### DeFi
| Tool | Description |
|------|-------------|
| `litcoin_stake` | Stake at a tier (Spark/Circuit/Core/Architect) |
| `litcoin_stake_info` | Staking position details |
| `litcoin_early_unstake` | Early unstake with penalty |
| `litcoin_unstake` | Unstake after lock expires |
| `litcoin_open_vault` | Open a vault with LITCOIN collateral |
| `litcoin_open_vault_v2` | Open vault with LITCOIN or USDC (multi-collateral) |
| `litcoin_open_vault_bankr` | Open vault via Bankr wallet |
| `litcoin_mint` | Mint LITCREDIT from vault |
| `litcoin_mint_bankr` | Mint LITCREDIT via Bankr wallet |
| `litcoin_repay` | Repay vault debt |
| `litcoin_add_collateral` | Add collateral to vault |
| `litcoin_add_collateral_bankr` | Add collateral via Bankr wallet |
| `litcoin_close_vault` | Close vault (repays debt, returns collateral) |
| `litcoin_vaults` | List your vaults |
| `litcoin_vault_details` | Get vault status and ratios |
| `litcoin_deposit_escrow` | Deposit LITCREDIT to compute escrow |

### Guilds
| Tool | Description |
|------|-------------|
| `litcoin_create_guild` | Create a mining guild |
| `litcoin_join_guild` | Join a guild |
| `litcoin_leave_guild` | Leave current guild |
| `litcoin_stake_guild` | Stake into a guild position |
| `litcoin_unstake_guild` | Unstake from guild |
| `litcoin_guild_yield` | Guild yield stats |
| `litcoin_guild_member_yield` | Per-member yield breakdown |

### Compute
| Tool | Description |
|------|-------------|
| `litcoin_compute` | Send a prompt to relay miners (OpenAI-compatible) |

### Agents
| Tool | Description |
|------|-------------|
| `litcoin_deploy_agent` | Deploy an autonomous Sentinel agent |
| `litcoin_agent_stop` | Stop an agent |
| `litcoin_agent_config` | Update agent config (relay, research, DeFi toggles) |
| `litcoin_agent_list` | List all agents |

## What's New in v2.5.0

- **Bounty tools**: list, view, and create bounties with on-chain LITCOIN escrow
- **Model Arena**: full leaderboard, domain breakdown, 24h trending, head-to-head comparison
- **Miners leaderboard**: paginated top miners by reward, breakthroughs, models used
- 2,653 problems across 7 databases (algorithms, math, bioinformatics, pattern recognition, software engineering, ML, code optimization)
- 1.84M+ verified submissions in the open dataset
- LoRA proof: +3.0 points on HumanEval from LITCOIN training data

## Links

- Site: https://litcoin.app
- SDK: `pip install litcoin` (v4.9.2)
- Docs: https://litcoin.app/docs
- Research: https://litcoin.app/research
- Dataset: https://huggingface.co/datasets/tekkaadan/litcoin-research
- Chain: Base mainnet (8453)

## Version

2.5.0

## License

MIT
