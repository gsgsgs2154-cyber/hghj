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
      .setMaxValues(colors.length) // نتركها مفتوحة، لكن نتحقق لاحقاً
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر لونك المفضل')
      .setDescription('يمكنك اختيار لون واحد فقط.\nلو اخترت أكثر من لون، راح يرفض البوت العملية ويبلغك برسالة ⚠️')
      .setImage('https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// التعامل مع التفاعل
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    // ✅ التحقق من عدد الاختيارات
    if (interaction.values.length > 1) {
      return await interaction.reply({
        content: '⚠️ مسموح لك تختار **رتبة لون واحدة فقط!**',
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selected = colors.find(c => c.value === interaction.values[0]);

    const colorRoles = colors.map(c => c.role);
    await member.roles.remove(
      member.roles.cache.filter(r => colorRoles.includes(r.name))
    );

    const role = interaction.guild.roles.cache.find(r => r.name === selected.role);
    if (role) {
      await member.roles.add(role);
      await interaction.reply({ content: `✅ تم تغيير لونك إلى ${selected.label}!`, ephemeral: true });
    } else {
      await interaction.reply({ content: `⚠️ لم أجد رتبة باسم **${selected.role}**.`, ephemeral: true });
    }
  } catch (error) {
    console.error('خطأ في تغيير اللون:', error);
    const errorMsg = '❌ حدث خطأ أثناء تغيير لونك. تأكد من أن البوت لديه صلاحية إدارة الرتب.';
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
