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

// ======== إرسال قائمة الألوان =========
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('🎨 اختر ألوانك المفضلة')
      .setMinValues(0)
      .setMaxValues(colors.length)
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر ألوانك المفضلة')
      .setDescription('اختر اللون اللي تحبه.\nلو شلت لون من القائمة راح تنشال رتبته منك تلقائيًا ✨')
      .setImage('https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ======== أمر إعطاء رتبة بالـ ID (إضافة فقط) =========
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!give-role')) return;
  if (!message.guild) return;

  if (!message.member.permissions.has('ManageRoles')) {
    return message.reply('❌ ما عندك صلاحية تعطي رتب');
  }

  const args = message.content.split(' ');
  const roleId = args[1];

  if (!roleId) {
    return message.reply('⚠️ استخدم الأمر هكذا:\n`!give-role ROLE_ID`');
  }

  const role = message.guild.roles.cache.get(roleId);
  if (!role) {
    return message.reply('❌ ما لقيت رتبة بهذا الـ ID');
  }

  try {
    if (message.member.roles.cache.has(role.id)) {
      return message.reply('🤷‍♂️ أنت أصلاً معك هذه الرتبة');
    }

    await message.member.roles.add(role);
    message.reply(`✅ تم إعطاؤك رتبة **${role.name}**`);
  } catch (error) {
    console.error(error);
    message.reply('❌ فشل إعطاء الرتبة (تأكد من صلاحيات البوت)');
  }
});

// ======== التعامل مع تفاعل الألوان =========
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    if (interaction.values.length > 1) {
      return await interaction.reply({
        content: '⚠️ يجب أن تختار لونًا واحدًا فقط!',
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedValues = interaction.values;
    const rolesToAdd = [];
    const rolesToRemove = [];

    for (const color of colors) {
      const role = interaction.guild.roles.cache.find(r => r.name === color.role);
      if (!role) continue;

      if (selectedValues.includes(color.value)) {
        if (!member.roles.cache.has(role.id)) rolesToAdd.push(role);
      } else {
        if (member.roles.cache.has(role.id)) rolesToRemove.push(role);
      }
    }

    if (rolesToAdd.length > 0) await member.roles.add(rolesToAdd);
    if (rolesToRemove.length > 0) await member.roles.remove(rolesToRemove);

    await interaction.reply({ content: '✅ تم تحديث لونك بنجاح 🎨', ephemeral: true });
  } catch (error) {
    console.error('❌ خطأ في تعديل الألوان:', error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء تحديث لونك. تأكد أن البوت لديه صلاحية إدارة الرتب.',
      ephemeral: true
    });
  }
});

// ======== تشغيل البوت والسيرفر =========
const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ لم يتم العثور على DISCORD_BOT_TOKEN');
  process.exit(1);
}
client.login(TOKEN);

app.get("/", (req, res) => {
  res.send("✅ Bot is running!");
});

app.listen(3000, () => console.log("🌐 Web server is live on port 3000"));
