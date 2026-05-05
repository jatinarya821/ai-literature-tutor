async function testPollinations() {
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    console.log('Pollinations status:', response.status);
    const text = await response.text();
    console.log('Pollinations response:', text.substring(0, 100));
  } catch (e) {
    console.error('Pollinations error:', e.message);
  }
}

testPollinations();
