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
