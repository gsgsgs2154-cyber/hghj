const { Client, GatewayIntentBits, Partials, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
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
  { label: '⚫ أسود', value: 'black', role: 'Black' },
  { label: '🫒 زيتي', value: 'zz', role: 'zz' },
  { label: '⚪ أبيض', value: 'white', role: 'White' },
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

client.once('ready', () => {
  console.log(`✅ تم تسجيل الدخول كبوت: ${client.user.tag}`);
});

// ===== إرسال المنيو =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('🎨 اختر لونك')
      .setMinValues(1)
      .setMaxValues(colors.length) // نسمح بأكثر من اختيار لكن نتحقق لاحقًا
      .addOptions(colors.map(c => ({
        label: c.label,
        value: c.value
      })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختيار اللون')
      .setDescription('اختر لون واحد فقط، لو اخترت أكثر ستظهر رسالة خطأ')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ===== التعامل مع الاختيار =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'color_select') return;

  // ❌ لو اختار أكثر من لون
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

  // ⚡ بدون انتظار عشان السرعة
  if (addRoles.length) member.roles.add(addRoles).catch(() => {});
  if (removeRoles.length) member.roles.remove(removeRoles).catch(() => {});

  interaction.reply({
    content: '✅ تم تحديث لونك بنجاح 🎨',
    ephemeral: true
  });
});

// ===== تشغيل البوت =====
const TOKEN = process.env.DISCORD_BOT_TOKEN;
client.login(TOKEN);

app.get("/", (req, res) => res.send("✅ Bot is running!"));
app.listen(3000, () => console.log("🌐 Web server is live"));

