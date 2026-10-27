<!---
this readme sucks
--->

<!--- TITLE --->
<!-- <h1 align="left"> homura </h1> -->

# <samp>homura</samp>

<!--- SHORT DESCRIPTION --->
<img align="right" src="./avatar.png" width="96" alt="Homura Icon" />

![GitHub License](https://img.shields.io/github/license/janleigh/homura?style=for-the-badge)

> A (not-so) generic music bot for Discord.

<!--- FEATURES --->

## <samp>FEATURES</samp>

- **Find it. Play it.** Search Spotify, YouTube Music, and YouTube, or drop in a track or playlist URL.
- **Own the queue.** Browse, reorder, remove, and fast-track what plays next.
- **Keep the music moving.** Pause, resume, skip, stop, and check what is playing.
- **Set the vibe.** Loop a track, loop the queue, shuffle it, or dial in the volume.

<!--- SETUP --->

## <samp>SETUP</samp>

### Prerequisites

- [mise](https://mise.jdx.dev/)
- [Bun](https://bun.sh)
- A Discord Bot Token (get one from the [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/janleigh/homura.git
   cd homura
   ```

2. **Install Bun with mise**
   (Skip to #3 if bun is already installed)

   ```bash
   mise install
   ```

3. **Install dependencies**

   ```bash
   bun install
   ```

4. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Discord bot token:

   ```env
   DISCORD_TOKEN="your-bot-token-here"
   ```

5. **Configure bot settings (optional)**

   Edit `src/config.ts` to customize:
   - `DEV_SERVER_IDS` - Server IDs where developer commands will be registered
   - `DEV_USER_IDS` - User IDs who can use developer commands
   - `PRESENCE_OPTIONS` - Bot presence and activity settings

6. **Run the bot**

   ```bash
   bun dev    # For development (with debug logging)
   bun start  # For production (no debug logging)
   ```

### Required Bot Permissions

When inviting the bot to your server, make sure it has these permissions:

- `Send Messages` - For sending command responses
- `Embed Links` - For sending command responses
- `Connect` & `Speak` - For voice channel functionality

Optional permissions are:

- `Read Message History` - For reading previous messages
- `Move Members` - For moving members between voice channels

Or just use the [invite link below](#links) and switch the client id to your application as it includes all necessary permissions.

<!--- LINKS --->

## <samp>LINKS</samp>

- [Invite Homura](https://discord.com/oauth2/authorize?client_id=1543828308373016636&permissions=120974656&integration_type=0&scope=applications.commands+bot)
- [Support Server](https://discord.gg/VXXGbUHzKC)

<!--- LICENSE --->

## <samp>LICENSE</samp>

This project is licensed under the [AGPL-3.0](../LICENSE.md) license.
