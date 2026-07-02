// Diagnóstico puntual: imprime las claves reales de `assets` que Steam
// devuelve para un appid, para confirmar el nombre correcto del asset
// "hero" panorámico (o si directamente no existe para este juego).
//
// Uso: node scripts/debug-steam-assets.mjs 381210

const appId = Number(process.argv[2] ?? 381210);

const inputJson = JSON.stringify({
  ids: [{ appid: appId }],
  context: { country_code: 'US', language: 'english', steam_realm: 1 },
  data_request: { include_assets: true },
});

const url = `https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(inputJson)}`;

const response = await fetch(url, {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    accept: 'application/json',
  },
});

if (!response.ok) {
  console.error(`HTTP ${response.status}`);
  process.exit(1);
}

const data = await response.json();
const item = data?.response?.store_items?.[0];

if (!item) {
  console.log('Steam no devolvió store_items para este appid.');
  process.exit(0);
}

console.log('appid:', item.appid);
console.log('assets disponibles:', Object.keys(item.assets ?? {}));
console.log(JSON.stringify(item.assets, null, 2));
