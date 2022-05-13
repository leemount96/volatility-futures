const fetch = require('node-fetch');
require('dotenv').config({path: '../.env'});

const laevitasKey = process.env.LAEVITAS_API_KEY;
console.log(laevitasKey)

async function getSqueethData() {

  const response = await fetch(
    'https://gateway.laevitas.ch/analytics/defi/squeeth',
    {
      method: 'get',
      body: null,
      headers: {
        'apiKey': laevitasKey,
        'User-Agent': 'Node',
      },
    }
  );

  const json = await response.json();
  return json;
}


async function main() {
  const squeethJson = await getSqueethData();

  console.log("SqueethJson:", squeethJson);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});