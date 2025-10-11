const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'colors',
    description: 'اختر لونك المفضل من القائمة',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('بدء تسجيل أوامر التطبيق (/)...');

    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!clientId) {
      console.error('❌ خطأ: لم يتم العثور على DISCORD_CLIENT_ID في متغيرات البيئة');
      process.exit(1);
    }

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`✅ تم تسجيل الأوامر بنجاح في السيرفر (Guild ID: ${guildId})`);
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log('✅ تم تسجيل الأوامر بنجاح عالمياً (قد يستغرق الأمر بضع دقائق)');
    }
  } catch (error) {
    console.error('❌ خطأ في تسجيل الأوامر:', error);
  }
})();
