import { Session } from '@inrupt/solid-client-authn-node';

const session = new Session();
await session.login({
  clientId: 'E2E-Test-Client_329df950-6c6c-4fb8-a75a-235745a98647',
  clientSecret: 'ee0584b383621d8c899ee485d90ee59cfc667b75ebaff4f9d110bf88b7a6da6f546b96d5b895b6beaee25e0f558741c1cf1f6087eb363b1101988e381c00728f',
  oidcIssuer: 'http://localhost:3000',
});

console.log('Logged in:', session.info.isLoggedIn);
console.log('WebID:', session.info.webId);

const testUrl = 'http://localhost:3000/dev/test-debug.ttl';
console.log('Testing URL:', testUrl);

// Try to PATCH non-existent resource
const response = await session.fetch(testUrl, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/sparql-update',
  },
  body: 'INSERT DATA { <http://example.org/test> <http://example.org/prop> "value" . }',
});

console.log('Status:', response.status);
console.log('Status text:', response.statusText);
const body = await response.text();
console.log('Response:', body);
