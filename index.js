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
  { label: '🤎 بني غامق', value: 'brown', role: 'Brown' },
  { label: '❌ إزالة اللون', value: 'remove', role: null } // 👈 خيار لإزالة اللون تماماً
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
      .setPlaceholder('🎨 اختر لونك المفضل أو أزل اللون')
      .setMinValues(1)
      .setMaxValues(1) // ✅ يقدر يختار لون واحد فقط
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر لونك المفضل')
      .setDescription('يمكنك اختيار **لون واحد فقط** من القائمة أدناه.\nلو اخترت "❌ إزالة اللون" راح تنشال كل ألوانك.')
      .setImage('https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// التعامل مع التفاعل
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedValue = interaction.values[0];
    const colorRoles = colors.filter(c => c.role).map(c => c.role);

    // 🔸 إزالة كل الألوان إذا اختار "إزالة اللون"
    if (selectedValue === 'remove') {
      const rolesToRemove = member.roles.cache.filter(r => colorRoles.includes(r.name));
      if (rolesToRemove.size > 0) {
        await member.roles.remove(rolesToRemove);
        return await interaction.reply({ content: '🧹 تم إزالة لونك بنجاح!', ephemeral: true });
      } else {
        return await interaction.reply({ content: 'ℹ️ ما عندك أي لون حالياً.', ephemeral: true });
      }
    }

    // 🔄 تحديث اللون الواحد فقط
    const selected = colors.find(c => c.value === selectedValue);
    const role = interaction.guild.roles.cache.find(r => r.name === selected.role);

    if (!role) {
      return await interaction.reply({ content: `⚠️ ما لقيت رتبة باسم **${selected.role}**.`, ephemeral: true });
    }

    // إزالة كل الألوان القديمة
    const rolesToRemove = member.roles.cache.filter(r => colorRoles.includes(r.name));
    if (rolesToRemove.size > 0) await member.roles.remove(rolesToRemove);

    // إضافة اللون الجديد
    await member.roles.add(role);
    await interaction.reply({ content: `✅ تم تغيير لونك إلى ${selected.label}!`, ephemeral: true });

  } catch (error) {
    console.error('❌ خطأ في تعديل اللون:', error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء تغيير لونك. تأكد أن البوت يمتلك صلاحية إدارة الرتب.',
      ephemeral: true
    });
  }
});

// تشغيل السيرفر والبوت
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
