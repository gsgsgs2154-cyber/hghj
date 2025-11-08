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

// أمر إرسال قائمة الألوان
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('اختر ألوانك المفضلة 🎨')
      .setMinValues(1)
      .setMaxValues(colors.length)
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر ألوانك المفضلة')
      .setDescription('اختر الألوان التي تحبها من القائمة بالأسفل.\nيمكنك اختيار أكثر من لون، وسيتم منحك الرتب تلقائيًا حسب اختياراتك 💫')
      .setImage('https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// التفاعل مع قائمة الألوان
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedValues = interaction.values;

    const colorRoles = colors.map(c => c.role);
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

    // تعديل الرتب
    if (rolesToAdd.length > 0) await member.roles.add(rolesToAdd);
    if (rolesToRemove.length > 0) await member.roles.remove(rolesToRemove);

    await interaction.reply({ content: `✅ تم تحديث ألوانك بنجاح 🎨`, ephemeral: true });
  } catch (error) {
    console.error('❌ خطأ في تعديل الألوان:', error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء تحديث ألوانك. تأكد من أن البوت يمتلك صلاحية إدارة الرتب.',
      ephemeral: true
    });
  }
});

// تشغيل البوت والسيرفر
const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ خطأ: لم يتم العثور على DISCORD_BOT_TOKEN في متغيرات البيئة');
  process.exit(1);
}

client.login(TOKEN);

app.get("/", (req, res) => {
  res.send("✅ Bot is running!");
});

app.listen(3000, () => console.log("🌐 Web server is live on port 3000"));
