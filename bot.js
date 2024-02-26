"use strict";

import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import * as del from "./commands/remove.js";
import * as add from "./commands/add.js";

config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const handleInteraction = async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "remove") {
    await del.execute(interaction);
  }

  if (interaction.commandName === "add") {
    await add.execute(interaction);
  }
};

client.once(Events.ClientReady, () => {
  console.log("🤖 " + client.user.tag);
});

client.login(process.env.TOKEN);

client.on(Events.InteractionCreate, handleInteraction);
