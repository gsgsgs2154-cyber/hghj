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

// 🎨 قائمة الألوان
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
  { label: '🤎 بني غامق', value: 'brown', role: 'Brown' },
  { label: '❌ إزالة جميع الألوان', value: 'remove_all', role: null } // <-- الخيار الجديد
];

client.once('ready', () => {
  console.log(`✅ تم تسجيل الدخول كبوت: ${client.user.tag}`);
});

// 📜 إرسال القائمة في الشات
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('🎨 اختر ألوانك المفضلة أو احذفها')
      .setMinValues(1)
      .setMaxValues(colors.length)
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر ألوانك المفضلة')
      .setDescription('اختر الألوان اللي تحبها، أو اختر **❌ إزالة جميع الألوان** لحذفها كلها من حسابك.')
      .setImage('https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🎯 التفاعل مع القائمة
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedValues = interaction.values;
    const colorRoles = colors.filter(c => c.role).map(c => c.role);

    // 🧹 لو اختار إزالة كل الألوان
    if (selectedValues.includes('remove_all')) {
      const rolesToRemove = member.roles.cache.filter(r => colorRoles.includes(r.name));
      if (rolesToRemove.size > 0) {
        await member.roles.remove(rolesToRemove);
        return await interaction.reply({ content: '🧹 تم إزالة جميع ألوانك بنجاح!', ephemeral: true });
      } else {
        return await interaction.reply({ content: 'ℹ️ ما عندك أي ألوان حالياً.', ephemeral: true });
      }
    }

    // 🔄 تحديث الألوان بناءً على الاختيارات
    const rolesToAdd = [];
    const rolesToRemove = [];

    for (const color of colors) {
      if (!color.role) continue;
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

    await interaction.reply({ content: '✅ تم تحديث ألوانك بنجاح 🎨', ephemeral: true });

  } catch (error) {
    console.error('❌ خطأ في تعديل الألوان:', error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء تحديث ألوانك. تأكد من أن البوت يمتلك صلاحية إدارة الرتب.',
      ephemeral: true
    });
  }
});

// 🚀 تشغيل السيرفر والبوت
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
