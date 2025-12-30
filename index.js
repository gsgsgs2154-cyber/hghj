const { Client, GatewayIntentBits, Partials, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require("express");
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const colors = [
  { label: '⚫️ أسود', value: 'black', role: 'Black' },
  { label: '🫒 زيتي', value: 'zz', role: 'zz' },
  { label: '⚪️ أبيض', value: 'white', role: 'White' },
  { label: '🟢 أخضر فاتح', value: 'lightgreen', role: 'Light Green' },
  { label: '🔴 أحمر', value: 'red', role: 'Red' },
  { label: '💙 أزرق سماوي', value: 'sky', role: 'sky' },
  { label: '🌀 كحلي', value: 'bb', role: 'bb' },
  { label: '💗 زهري', value: 'pink', role: 'Pink' },
  { label: '🩶 رمادي', value: 'silver', role: 'Silver' },
  { label: '💛 أصفر', value: 'yellow', role: 'Yellow' },
  { label: '🟠 برتقالي', value: 'orange', role: 'Orange' },
  { label: '💜 بنفسجي', value: 'purple', role: 'Purple' },
  { label: '🌿 أخضر غامق', value: 'darkgreen', role: 'Dark Green' },
  { label: '🤎 بني غامق', value: 'brown', role: 'Brown' }
];

// ===== Ready =====
client.once('ready', () => {
  console.log(`✅ تم تسجيل الدخول كبوت: ${client.user.tag}`);
});

// ===== Logs تشخيص =====
client.on('error', console.error);
client.on('warn', console.warn);

// ===== أمر !colors مع Select Menu والصورة =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // أمر !colors
  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('🎨 اختر لونك')
      .setMaxValues(colors.length)
      .addOptions(colors.map(c => ({
        label: c.label,
        value: c.value
      })));

    const selectRow = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختيار اللون')
      .setDescription('اختر لون واحد فقط، لو اخترت أكثر ستظهر رسالة خطأ')
      .setColor('#5865F2')
      .setImage('https://pistachioentertainment.com/wp-content/uploads/2020/04/assorted-color-sequins-1191710.jpg');

    await message.channel.send({ embeds: [embed], components: [selectRow] });
  }

  // أمر !delete لإظهار زر إزالة الألوان
  if (message.content === '!delete') {
    const removeButton = new ButtonBuilder()
      .setCustomId('delete_colors')
      .setLabel('❌ إزالة اللون')
      .setStyle(ButtonStyle.Danger);

    const buttonRow = new ActionRowBuilder().addComponents(removeButton);

    const embed = new EmbedBuilder()
      .setTitle('🗑️ إزالة اللون')
      .setDescription('اضغط على الزر أدناه لإزالة جميع ألوانك')
      .setColor('#FF0000');

    await message.channel.send({ embeds: [embed], components: [buttonRow] });
  }
});

// ===== التعامل مع Select Menu =====
client.on('interactionCreate', async (interaction) => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'color_select') {
    if (interaction.values.length > 1) {
      return interaction.reply({
        content: '❌ مسموح تختار **لون واحد فقط**',
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);

    const addRoles = [];
    const removeRoles = [];

    for (const color of colors) {
      const role = interaction.guild.roles.cache.find(r => r.name === color.role);
      if (!role) continue;

      if (interaction.values[0] === color.value) {
        if (!member.roles.cache.has(role.id)) addRoles.push(role);
      } else {
        if (member.roles.cache.has(role.id)) removeRoles.push(role);
      }
    }

    if (addRoles.length) member.roles.add(addRoles).catch(() => {});
    if (removeRoles.length) member.roles.remove(removeRoles).catch(() => {});

    interaction.reply({
      content: '✅ تم تحديث لونك بنجاح 🎨',
      ephemeral: true
    });
  }

  // ===== التعامل مع الزر الأحمر لإزالة الألوان =====
    if (interaction.isButton() && interaction.customId === 'delete_colors') {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    const removeRoles = [];
    for (const color of colors) {
      const role = interaction.guild.roles.cache.find(r => r.name === color.role);
      if (!role) continue;
      if (member.roles.cache.has(role.id)) removeRoles.push(role);
    }

    if (removeRoles.length) member.roles.remove(removeRoles).catch(() => {});

    interaction.reply({
      content: '✅ تم إزالة جميع ألوانك!',
      ephemeral: true
    });
  }
});

// ===== تشغيل البوت =====
const TOKEN = process.env.DISCORD_BOT_TOKEN;

console.log("🔍 Checking bot token...");
console.log(TOKEN ? "✅ TOKEN FOUND" : "❌ TOKEN MISSING");
console.log("🚀 Attempting to login bot...");

client.login(TOKEN).catch(err => {
  console.error("❌ Login failed:", err);
});

// ===== Web Server =====
app.get("/", (req, res) => res.send("✅ Bot is running!"));
app.listen(3000, () => console.log("🌐 Web server is live"));
