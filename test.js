// test-simple.js - NO INSTALLATION NEEDED
const fs = require('fs');
const path = require('path');

console.log('=== SIMPLE ENV TEST ===\n');

// 1. Check where we are
console.log('Current folder:', __dirname);

// 2. Look for .env.local
const envPath = path.join(__dirname, '.env.local');
console.log('Looking for .env.local at:', envPath);
console.log('File exists?', fs.existsSync(envPath));

// 3. If it exists, show JUST THE VARIABLE NAMES (not values)
if (fs.existsSync(envPath)) {
  console.log('\n=== CONTENT OF .env.local (VALUES HIDDEN) ===');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      // Hide the actual value for security
      const safeLine = line.replace(/=(.*)/, '=[HIDDEN_VALUE]');
      console.log(safeLine);
    }
  });
  
  // 4. Check for GEMINI/GENINI specifically
  console.log('\n=== CHECKING FOR GEMINI KEY ===');
  const hasGemini = content.toLowerCase().includes('gemini');
  const hasGenini = content.toLowerCase().includes('genini');
  
  console.log('Contains "GEMINI"?', hasGemini);
  console.log('Contains "GENINI"?', hasGenini);
  
  if (!hasGemini && !hasGenini) {
    console.log('❌ ERROR: No GEMINI_API_KEY found in .env.local!');
    console.log('You need to add: GEMINI_API_KEY=your_key_here');
  } else if (hasGenini) {
    console.log('⚠️ WARNING: Found "GENINI" (typo)! Should be "GEMINI"');
  }
} else {
  console.log('\n❌ ERROR: No .env.local file found!');
  console.log('Create a file called ".env.local" in this folder:');
  console.log(__dirname);
}

console.log('\n=== TEST COMPLETE ===');