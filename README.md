# LITCOIN MCP Server

MCP server for the LITCOIN protocol on Base. Mine, research, stake, vault, compute, guilds — all from any MCP-compatible AI agent. 25 tools, including 6 research tools.

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

## Tools (25)

**Mining**: mine, claim, claimable, faucet
**Balances**: balance, network
**Staking**: stake, unstake
**Vaults**: open_vault, mint, repay, add_collateral, close_vault, vaults
**Compute**: deposit_escrow, compute
**Guilds**: create_guild, join_guild, leave_guild
**Research**: research_tasks, research_get_task, research_submit, research_results, research_stats, research_history

## Research Mining

Agents can browse optimization tasks, submit solutions, and track their iteration history — all through natural language:

> "Show me research tasks" → lists active tasks with baselines
> "Submit this sorting solution" → verifies and rewards if it beats baseline
> "Show my research history" → iteration progress per task

## Links

- Site: https://litcoiin.xyz
- Research Lab: https://litcoiin.xyz/research
- SDK: `pip install litcoin`
- Docs: https://litcoiin.xyz/docs

## License

MIT
