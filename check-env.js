require('dotenv').config({ path: '.env.local' });

console.log('🔧 Environment Variables Check:');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
