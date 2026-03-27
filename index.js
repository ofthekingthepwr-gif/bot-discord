const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  EmbedBuilder 
} = require('discord.js');

const express = require("express");
const app = express();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// 🔥 PORTA PRA RENDER
app.get("/", (req, res) => res.send("Bot online"));
app.listen(3000);

// IDs
const LOG_CHANNEL_ID = "1483201517526712421";

// cargos permitidos
const allowedRoles = [
  "1237796941308629051",
  "1237796941308629045",
  "1237796941295783992",
  "1275209726883397747",
  "1237796941295783988",
  "1237796941308629046",
  "1334690756140597260"
];

const punishCount = new Map();

function hasPermission(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator) ||
         member.roles.cache.some(role => allowedRoles.includes(role.id));
}

function getHora() {
  const agora = new Date();
  return agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const member = interaction.member;

  if (!hasPermission(member)) {
    let count = punishCount.get(member.id) || 1;
    punishCount.set(member.id, count + 1);

    let tempo = 5 * count;

    await member.timeout(tempo * 60 * 1000, "Sem permissão");

    return interaction.reply({
      content: `❌ Você não tem permissão! Mutado por ${tempo} minutos.`,
      ephemeral: true
    });
  }

  const user = interaction.options.getUser('usuario');
  const motivo = interaction.options.getString('motivo') || "Sem motivo";
  const tempo = interaction.options.getString('tempo');

  const guild = interaction.guild;
  const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
  const target = await guild.members.fetch(user.id);

  // BAN
  if (interaction.commandName === 'ban') {
    await target.ban({ reason: motivo });

    const embed = new EmbedBuilder()
      .setTitle("SCI Punições")
      .setDescription(`${user} foi banido por ${motivo}`)
      .setColor("Red")
      .setFooter({ text: `${guild.name} | Hoje às ${getHora()}` });

    logChannel.send({ embeds: [embed] });
    return interaction.reply({ content: "✅ Banido!", ephemeral: true });
  }

  // KICK
  if (interaction.commandName === 'kick') {
    await target.kick(motivo);

    const embed = new EmbedBuilder()
      .setTitle("SCI Punições")
      .setDescription(`${user} foi kickado por ${motivo}`)
      .setColor("Red")
      .setFooter({ text: `${guild.name} | Hoje às ${getHora()}` });

    logChannel.send({ embeds: [embed] });
    return interaction.reply({ content: "✅ Kickado!", ephemeral: true });
  }

  // MUTE
  if (interaction.commandName === 'mute') {
    let ms = 0;

    if (tempo.endsWith("m")) ms = parseInt(tempo) * 60 * 1000;
    if (tempo.endsWith("h")) ms = parseInt(tempo) * 60 * 60 * 1000;
    if (tempo.endsWith("s")) ms = parseInt(tempo) * 1000;

    await target.timeout(ms, motivo);

    const embed = new EmbedBuilder()
      .setTitle("SCI Punições")
      .setDescription(`${user} foi silenciado por ${tempo}`)
      .setColor("Red")
      .setFooter({ text: `${guild.name} | Hoje às ${getHora()}` });

    logChannel.send({ embeds: [embed] });
    return interaction.reply({ content: "✅ Mutado!", ephemeral: true });
  }
});

client.login("MTQ4NzEzNDM5NjQ4OTE0MjM4Mg.GJZl_K.ZIpN_fec1BnwlCtkTMncOgqKM6xLQsS0JS0xjM");
