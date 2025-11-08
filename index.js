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

// إرسال القائمة
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('🎨 اختر لونك المفضل')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر لونك المفضل')
      .setDescription('اختر لون واحد فقط 🎨\nلو ضغطت على نفس اللون اللي عندك، راح تنشال رتبته منك تلقائيًا ⚡')
      .setImage('https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// التعامل مع التفاعل (select menu)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedValue = interaction.values[0];
    const selectedColor = colors.find(c => c.value === selectedValue);
    const colorRoles = colors.map(c => c.role);

    const role = interaction.guild.roles.cache.find(r => r.name === selectedColor.role);
    if (!role) {
      return await interaction.reply({
        content: `⚠️ لم أجد رتبة باسم **${selectedColor.role}**.`,
        ephemeral: true
      });
    }

    // ✅ إذا عنده نفس اللون، يشيله
    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      return await interaction.reply({
        content: `🧹 تمت إزالة لونك ${selectedColor.label}!`,
        ephemeral: true
      });
    }

    // ✅ إذا اختار لون جديد
    // احذف كل الألوان القديمة
    const oldColors = member.roles.cache.filter(r => colorRoles.includes(r.name));
    if (oldColors.size > 0) await member.roles.remove(oldColors);

    // ضيف اللون الجديد
    await member.roles.add(role);
    await interaction.reply({
      content: `✅ تم تغيير لونك إلى ${selectedColor.label}!`,
      ephemeral: true
    });

  } catch (error) {
    console.error('❌ خطأ في تعديل اللون:', error);
    const errorMsg = '❌ حدث خطأ أثناء تغيير لونك. تأكد أن البوت لديه صلاحية إدارة الرتب.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMsg, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
});

// تشغيل السيرفر والبوت
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
