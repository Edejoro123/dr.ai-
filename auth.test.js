const test = require('node:test');
const assert = require('node:assert/strict');

async function createServer() {
  const mod = require('./app');
  const app = mod.app || mod;

  if (!app || typeof app.listen !== 'function') {
    throw new Error('App export is missing');
  }

  const server = app.listen(3456);
  await new Promise((resolve) => server.once('listening', resolve));
  return server;
}

test('signup endpoint accepts patient data and stores a username/email record', async () => {
  const server = await createServer();

  try {
    const challengeResponse = await fetch('http://localhost:3456/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient01@example.com' })
    });
    const challengeData = await challengeResponse.json();
    assert.equal(challengeResponse.status, 200, 'challenge should be generated before signup');

    const response = await fetch('http://localhost:3456/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'patient01',
        email: 'patient01@example.com',
        password: 'StrongPass1!',
        role: 'patient',
        challenge: challengeData.challenge
      })
    });

    const data = await response.json();
    assert.equal(response.status, 201, 'signup should create a new account');
    assert.equal(data.user.username, 'patient01');
    assert.match(data.user.email, /example\.com/);
    assert.equal(data.user.password, '****');
  } finally {
    server.close();
  }
});

test('challenge endpoint generates a 7-character verification code and queue details', async () => {
  const server = await createServer();

  try {
    const response = await fetch('http://localhost:3456/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'challenge@example.com' })
    });

    const data = await response.json();
    assert.equal(response.status, 200, 'challenge should be created');
    assert.equal(data.challenge.length, 7, 'challenge should be exactly 7 characters');
    assert.match(data.challenge, /^[A-Za-z0-9]{7}$/);
    assert.equal(typeof data.queueStatus.capacity, 'number');
    assert.equal(typeof data.queueStatus.active, 'number');
  } finally {
    server.close();
  }
});

test('verifying a challenge does not consume it before signup finishes', async () => {
  const server = await createServer();

  try {
    const first = await fetch('http://localhost:3456/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'challenge-flow@example.com' })
    });
    const challengeData = await first.json();
    assert.equal(first.status, 200, 'challenge should be generated');

    const verify = await fetch('http://localhost:3456/api/auth/verify-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'challenge-flow@example.com', challenge: challengeData.challenge })
    });
    const verificationData = await verify.json();
    assert.equal(verify.status, 200, 'verification should succeed while the challenge remains active');
    assert.equal(verificationData.valid, true);

    const signup = await fetch('http://localhost:3456/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'challengeflowuser',
        email: 'challenge-flow@example.com',
        password: 'StrongPass1!',
        role: 'patient',
        challenge: challengeData.challenge
      })
    });

    const signupData = await signup.json();
    assert.equal(signup.status, 201, 'signup should succeed after challenge verification');
    assert.equal(signupData.user.email, 'challenge-flow@example.com');
  } finally {
    server.close();
  }
});

test('otp endpoints are removed and challenge-only verification remains', async () => {
  const server = await createServer();

  try {
    const sendResponse = await fetch('http://localhost:3456/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'otp@example.com' })
    });

    assert.equal(sendResponse.status, 404, 'otp endpoint should be removed');
  } finally {
    server.close();
  }
});
