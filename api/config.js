// /api/config.js
// Vercel serverless function (Node.js runtime).
// Reads the connection IDs from Vercel Environment Variables and returns them as JSON.
// Set these in your Vercel project: Settings -> Environment Variables
//
//   PHOTON_APP_ID        (your Photon Realtime AppId)
//   PHOTON_VOICE_APP_ID   (your Photon Voice AppId)
//   PHOTON_CHAT_APP_ID    (your Photon Chat AppId)
//   PLAYFAB_TITLE_ID      (your PlayFab Title Id)
//   PHOTON_REGION         (e.g. "eu")   -- optional, defaults to "eu"
//   CONFIG_SECRET         -- optional shared secret, see README.md
//
// After adding/changing env vars in the Vercel dashboard you must redeploy
// (or use "Redeploy" from the dashboard) for them to take effect.

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Optional lightweight gate: if CONFIG_SECRET is set on Vercel, the caller
  // must send the same value in the X-App-Secret header.
  // NOTE: see README.md "Security notes" - this only filters out casual
  // scraping/bots, it is not a substitute for real auth.
  const expectedSecret = process.env.CONFIG_SECRET;
  if (expectedSecret) {
    const providedSecret = req.headers['x-app-secret'];
    if (providedSecret !== expectedSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const config = {
    photonAppId: process.env.PHOTON_APP_ID || '',
    voiceAppId: process.env.PHOTON_VOICE_APP_ID || '',
    chatAppId: process.env.PHOTON_CHAT_APP_ID || '',
    playfabTitleId: process.env.PLAYFAB_TITLE_ID || '',
    region: process.env.PHOTON_REGION || 'eu',
  };

  const missing = Object.entries(config)
    .filter(([key, value]) => key !== 'region' && !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // Don't leak which values exist - just flag that setup is incomplete.
    console.error('[config] Missing environment variables:', missing.join(', '));
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(config);
}
