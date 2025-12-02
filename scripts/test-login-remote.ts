import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🔄 Attempting login to https://revenueparty.com/api/auth/login...');
    
    const response = await fetch('https://revenueparty.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin@revenueparty.com',
        password: 'test1234'
      }),
    });

    console.log(`\n📡 Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      console.log('📦 Response (JSON):', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('📄 Response (Text):', text.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testLogin();

