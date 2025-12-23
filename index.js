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

// ======== يوزرز مسموح لهم ========
const ALLOWED_USERS = [
  '809903116865634344',
  '937018739344408608'
];

// ======== ألوان ========
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

// ======== قائمة الألوان ========
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('🎨 اختر لونك')
      .setMinValues(0)
      .setMaxValues(colors.length)
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر لونك')
      .setDescription('اختر لون واحد فقط')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ======== إعطاء رتبة (نفسك أو غيرك) ========
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!give-role')) return;
  if (!message.guild) return;

  if (
    !message.member.permissions.has('ManageRoles') &&
    !ALLOWED_USERS.includes(message.author.id)
  ) {
    return message.reply('❌ ما عندك صلاحية');
  }

  const args = message.content.split(' ').slice(1);
  let targetMember;
  let roleId;

  if (args.length === 1) {
    targetMember = message.member;
    roleId = args[0];
  } else if (args.length === 2) {
    targetMember =
      message.mentions.members.first() ||
      await message.guild.members.fetch(args[0]).catch(() => null);
    roleId = args[1];
  }

  if (!targetMember || !roleId) {
    return message.reply('⚠️ الصيغة:\n`!give-role ROLE_ID`\n`!give-role @User ROLE_ID`');
  }

  const role = message.guild.roles.cache.get(roleId);
  if (!role) return message.reply('❌ الرتبة غير موجودة');

  try {
    if (targetMember.roles.cache.has(role.id)) {
      return message.reply('🤷‍♂️ معه الرتبة أصلًا');
    }

    await targetMember.roles.add(role);
    message.reply(`✅ تم إعطاء رتبة **${role.name}** لـ ${targetMember.user.tag}`);
  } catch (err) {
    console.error(err);
    message.reply('❌ فشل (تأكد أن رتبة البوت أعلى)');
  }
});

// ======== تفاعل الألوان ========
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  const member = await interaction.guild.members.fetch(interaction.user.id);

  for (const color of colors) {
    const role = interaction.guild.roles.cache.find(r => r.name === color.role);
    if (!role) continue;

    if (interaction.values.includes(color.value)) {
      await member.roles.add(role).catch(() => {});
    } else {
      await member.roles.remove(role).catch(() => {});
    }
  }

  interaction.reply({ content: '✅ تم تحديث لونك', ephemeral: true });
});

// ======== تشغيل البوت ========
const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) process.exit(1);

client.login(TOKEN);

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(3000, () => console.log("🌐 Server running"));

