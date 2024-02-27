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

  switch (interaction.commandName) {
    case "remove":
      await del.execute(interaction);
      break;

    case "add":
      await add.execute(interaction);
      break;
  }
};

client.once(Events.ClientReady, () => {
  console.log("🤖 " + client.user.tag);
});

client.login(process.env.TOKEN);

client.on(Events.InteractionCreate, handleInteraction);
