# Discord Color Role Bot

## Overview
Discord bot that allows users to select and change color roles through an interactive dropdown menu with Arabic language support.

## Recent Changes (October 11, 2025)
- Initial project setup with Node.js 20 and discord.js
- Created main bot file (index.js) with color selection functionality
- Added command registration script (deploy-commands.js)
- Set up project documentation

## Project Architecture
- **index.js**: Main bot file with Discord client, event handlers, and color role logic
- **deploy-commands.js**: Command registration script for slash commands
- **README.md**: User documentation in Arabic
- **package.json**: Node.js dependencies

## Features
- Slash command `/colors` displays interactive dropdown menu
- 11 color options with Arabic labels
- Automatic removal of previous color roles
- Role assignment based on user selection
- Embedded messages with instructions
- Ephemeral confirmation messages

## Required Environment Variables
- DISCORD_BOT_TOKEN: Bot token from Discord Developer Portal
- DISCORD_CLIENT_ID: Application/Client ID
- DISCORD_GUILD_ID: Server ID (optional, for faster registration)

## Dependencies
- discord.js: Discord API wrapper
- Node.js 20
