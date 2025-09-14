require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

function loadEmailTemplate(templateName) {
  // Try multiple path resolutions for Next.js compatibility
  const possiblePaths = [
    path.join(__dirname, 'src/lib/email-templates', `${templateName}.html`),
    path.join(__dirname, '../src/lib/email-templates', `${templateName}.html`),
    path.join(process.cwd(), 'src/lib/email-templates', `${templateName}.html`),
    path.join(process.cwd(), 'email-templates', `${templateName}.html`)
  ];

  console.log('🔍 Looking for template:', templateName);
  console.log('📂 Current directory:', __dirname);
  console.log('🏠 Process CWD:', process.cwd());

  for (const templatePath of possiblePaths) {
    console.log('Checking path:', templatePath, fs.existsSync(templatePath) ? '✅ EXISTS' : '❌ NOT FOUND');
    try {
      if (fs.existsSync(templatePath)) {
        console.log('✅ Found template at:', templatePath);
        return fs.readFileSync(templatePath, 'utf8');
      }
    } catch (error) {
      console.log('Error reading path:', templatePath, error.message);
      continue;
    }
  }

  // If none of the paths work, throw error with debug info
  const debugInfo = possiblePaths.map(p => `${p} (${fs.existsSync(p) ? 'exists' : 'not found'})`).join(', ');
  throw new Error(`Failed to load email template: ${templateName}. Tried paths: ${debugInfo}`);
}

try {
  console.log('🧪 Testing Template Loading...');
  const template = loadEmailTemplate('email-verification');
  console.log('✅ Template loaded successfully!');
  console.log('📄 Template length:', template.length, 'characters');
  console.log('📄 Template preview:', template.substring(0, 100) + '...');
} catch (error) {
  console.error('❌ Template loading failed:');
  console.error(error.message);
}
