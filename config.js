// GET /api/config
// Returns the real Photon / PlayFab IDs, pulled from Vercel Environment Variables
// so they never live in your Git repo or your compiled Unity build.
//
// Set these in Vercel -> Project -> Settings -> Environment Variables:
//   PHOTON_APP_ID          (Photon Realtime App Id)
//   PHOTON_VOICE_APP_ID    (Photon Voice App Id)
//   PHOTON_CHAT_APP_ID     (Photon Chat App Id)
//   PLAYFAB_TITLE_ID       (PlayFab Title Id)
//   PHOTON_REGION          (e.g. "eu")
//   CONFIG_SHARED_SECRET   (optional - if set, callers must send it as X-Config-Key)

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const requiredSecret = process.env.CONFIG_SHARED_SECRET;
  if (requiredSecret) {
    const provided = req.headers['x-config-key'];
    if (provided !== requiredSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    photonAppId: process.env.PHOTON_APP_ID || '',
    voiceAppId: process.env.PHOTON_VOICE_APP_ID || '',
    chatAppId: process.env.PHOTON_CHAT_APP_ID || '',
    playfabTitleId: process.env.PLAYFAB_TITLE_ID || '',
    region: process.env.PHOTON_REGION || 'eu',
  });
};
