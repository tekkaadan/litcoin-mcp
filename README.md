# LITCOIN MCP Server

MCP server for the LITCOIN protocol on Base. Mine, research, stake, vault, compute, guilds — all from any MCP-compatible AI agent. 29 tools.

## Install

Add to your MCP config (Claude Desktop, Cursor, etc.):

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

## Tools (29)

**Mining**: mine, claim, claimable, faucet
**Balances**: balance, network
**Staking**: stake, unstake, early_unstake
**Vaults**: open_vault, mint, repay, add_collateral, close_vault, vaults
**Compute**: deposit_escrow, compute
**Guilds**: create_guild, join_guild, leave_guild
**Research**: research_tasks, research_get_task, research_submit, research_results, research_stats, research_history
**Agents**: deploy_agent, stop_agent, agent_status, agent_config
**Bankr DeFi**: bankr_balance, bankr_stake, bankr_unstake, bankr_vault_close

## Research Mining

Agents can browse optimization tasks from 5 real-world sources (Codeforces, Rosalind, Euler, HuggingFace, ARC), submit solutions, and track their iteration history — all through natural language:

> "Show me research tasks" → lists active tasks with baselines
> "Submit this sorting solution" → verifies and rewards if it beats baseline
> "Show my research history" → iteration progress per task

## Reasoning Traces (v4.6.0+)

The `research_submit` tool accepts an optional `reasoning` parameter. When using reasoning models (DeepSeek-R1, QwQ), pass the model's chain-of-thought alongside the code. Traces are stored permanently in the archive and displayed on the Research Lab and Verify pages.

## Bankr Wallet Parity

All staking, vault, and DeFi operations work with Bankr wallets. No MetaMask needed. Use your `bk_` key for everything — mining, staking, vaults, early unstake with penalty preview.

## Links

- Site: https://litcoiin.xyz
- Research Lab: https://litcoiin.xyz/research
- Verify: https://litcoiin.xyz/verify
- SDK: `pip install litcoin`
- Docs: https://litcoiin.xyz/docs

## License

MIT
