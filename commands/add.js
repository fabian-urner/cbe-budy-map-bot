import { SlashCommandBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const doesUserExist = async (userId) => {
  const { data, error } = await supabase
    .from(process.env.STUDENT_TABLE_NAME)
    .select("discord_user_id")
    .eq("discord_user_id", userId);

  if (error) throw new Error(error.message);

  if (data.length > 0) return true;

  return false;
};

const getRandomPosition = (latitude, longitude) => {
  const randomize = (value) => {
    return (
      String(value).split(".")[0] + // Digits before the .
      "." + // .
      String(value).split(".")[1].slice(0, 2) + // Take the first two digts after the .
      Math.floor(Math.random() * 9)
    ); // add a third random digit between 0 an ß
  };

  return {
    lat: randomize(latitude),
    lon: randomize(longitude),
  };
};

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("adding your position by giving a zip-code")
  .addStringOption((option) =>
    option
      .setName("display-name")
      .setDescription("Your name which is displayed on the Map")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("zip-code")
      .setDescription("a valid german zip code ('Postleitzahl')")
      .setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.user;

  const userId = user.id;
  const displayName = interaction.options.getString("display-name");
  const avatar = user.displayAvatarURL();
  const zipCode = interaction.options.getString("zip-code");
  let position = {};
  const roles = [];

  if (await doesUserExist(user.id)) {
    await interaction.reply("⚠️ You're already listed!");
    return;
  }

  interaction.member.roles.cache.forEach((membership) => {
    roles.push({ name: membership.name, id: membership.id });
  });

  await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${zipCode},germany`
  )
    .then((res) => res.json())
    .then((data) => {
      position = getRandomPosition(data[0].lat, data[0].lon);
    });

  const { error } = await supabase.from(process.env.STUDENT_TABLE_NAME).insert({
    discord_user_id: userId,
    avatar_url: avatar,
    zip_code: zipCode,
    lat: position.lat,
    lon: position.lon,
    name: displayName,
    roles,
  });

  if (error) {
    await interaction.reply(
      "❌ Arrrgg! something went wrong with the Database"
    );
    return;
  }

  await interaction.reply("added you to the map! 🗺️");
}
