const { execSync } = require('child_process');

console.log('🚀 بدء تشغيل البوت...\n');

console.log('📝 تسجيل أوامر Discord...');
try {
  execSync('node deploy-commands.js', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ تحذير: فشل تسجيل الأوامر. تأكد من أن DISCORD_CLIENT_ID يطابق البوت الخاص بك.');
  console.log('يمكنك تسجيل الأوامر يدوياً لاحقاً باستخدام: node deploy-commands.js\n');
}

console.log('\n🤖 بدء تشغيل البوت...');
require('./index.js');
