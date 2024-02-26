import { SlashCommandBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("removes your position on the CEB-Budy-Map");

export async function execute(interaction) {
  const user = interaction.user;

  const { error } = await supabase
    .from(process.env.STUDENT_TABLE_NAME)
    .delete()
    .eq("discord_user_id", user.id);

  if (error) {
    console.log(error);
    await interaction.reply(
      "❌ Arrrgg! something went wrong with the Database ❌"
    );
    return;
  }

  await interaction.reply("removed you from the Map! 🗺️");
}
