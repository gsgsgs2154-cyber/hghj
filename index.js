const { Client, GatewayIntentBits, Partials, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

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
  { label: '🟢 أخضر فاتح', value: 'lightgreen', role: 'Light Green' },
  { label: '🔴 أحمر', value: 'red', role: 'Red' },
  { label: '🔵 أزرق', value: 'blue', role: 'Blue' },
  { label: '💗 زهري', value: 'pink', role: 'Pink' },
  { label: '⚪ سكني (Silver)', value: 'silver', role: 'Silver' },
  { label: '💛 أصفر', value: 'yellow', role: 'Yellow' },
  { label: '🟠 برتقالي', value: 'orange', role: 'Orange' },
  { label: '💜 بنفسجي', value: 'purple', role: 'Purple' },
  { label: '🌿 أخضر غامق', value: 'darkgreen', role: 'Dark Green' },
  { label: '🤎 بني غامق', value: 'brown', role: 'Brown' }
];

client.once('ready', () => {
  console.log(`✅ تم تسجيل الدخول كبوت: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('اختر لونك 🎨')
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر لونك المفضل')
      .setDescription('يمكنك اختيار لون واحد فقط من القائمة أدناه.\nسيُضاف اللون الذي تختاره وتُزال الألوان السابقة تلقائيًا.')
      .setColor('#5865F2');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'color_select') return;

  try {
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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() === '!colors') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('اختر لونك 🎨')
      .addOptions(colors.map(c => ({ label: c.label, value: c.value })));

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('🎨 اختر لونك المفضل')
      .setDescription('يمكنك اختيار لون واحد فقط من القائمة أدناه.\nسيُضاف اللون الذي تختاره وتُزال الألوان السابقة تلقائيًا.')
      .setColor('#5865F2');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ خطأ: لم يتم العثور على DISCORD_BOT_TOKEN في متغيرات البيئة');
  process.exit(1);
}

client.login(TOKEN);
