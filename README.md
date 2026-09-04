# Secure config + media site (Vercel)

## What's in here
```
api/config.js       -> serverless endpoint that returns Photon/PlayFab IDs from env vars
public/index.html   -> the page: shows one scaled image, loops all audio files together
public/media.json   -> tells index.html which files to load (edit this by hand)
public/image/       -> put your image here (jpg/png/etc.)
public/audio/       -> put your audio file(s) here (mp3/ogg/etc.)
vercel.json         -> disables caching on the config endpoint
PhotonVRManager.cs  -> your updated Unity script
```

## 1. Push to GitHub
Create a repo, add these files at the root (so `api/`, `public/`, `vercel.json` are
top-level folders), commit, push.

## 2. Import into Vercel
Vercel dashboard -> Add New -> Project -> import the GitHub repo. No build
settings needed, it's auto-detected (static `public/` + `api/` functions).

## 3. Set environment variables
In the Vercel project: **Settings -> Environment Variables**, add:

| Key                  | Value                          |
|----------------------|---------------------------------|
| `PHOTON_APP_ID`      | your Photon Realtime AppId      |
| `PHOTON_VOICE_APP_ID`| your Photon Voice AppId         |
| `PHOTON_CHAT_APP_ID` | your Photon Chat AppId          |
| `PLAYFAB_TITLE_ID`   | your PlayFab Title Id           |
| `PHOTON_REGION`      | e.g. `eu`                       |
| `CONFIG_SECRET`      | *(optional)* any random string  |

Apply them to Production (and Preview if you use it), then **redeploy** —
env var changes don't apply to already-running deployments.

## 4. Get your URL
After deploy you'll have something like `https://your-project.vercel.app`.
The config endpoint is `https://your-project.vercel.app/api/config`, the
image/audio page is the root URL itself.

## 5. Wire up the Unity script
In `PhotonVRManager.cs`:
- Set `ConfigURL` to `https://your-project.vercel.app/api/config`
- If you set `CONFIG_SECRET` in step 3, put the same value in `ConfigSecret`

These are private/hidden fields hardcoded in the script (not shown in the
Inspector), same pattern as the existing `AuthURL` field.

## 6. Add your media
Drop your image into `public/image/` and your audio file(s) into
`public/audio/`, then edit `public/media.json` to list their filenames:

```json
{
  "image": "background.jpg",
  "audio": ["track1.mp3", "track2.mp3"]
}
```

Commit + push — Vercel redeploys automatically. All listed audio files play
together on loop; the image is scaled to fit the screen. Browsers block
autoplay-with-sound until a click, so the page shows a small "click to
enter" overlay first.

## Security notes (read this)
- Doing this is a genuine improvement over hardcoding the IDs directly in
  the compiled build: the values aren't sitting in a decompilable binary,
  and you can rotate or revoke them centrally without shipping a new build.
- That said, Photon AppIds / a PlayFab Title Id aren't secret keys in the
  "protects access" sense — every legitimate client needs them just to
  connect, so *any* client (or anyone sniffing its network traffic) can see
  the response from `/api/config`. This setup mainly buys you obfuscation +
  rotation, not access control.
- `CONFIG_SECRET` only filters out casual scraping of the endpoint by
  people who never even installed your app — it's shipped inside the game
  build, so a motivated person could still extract it. It's not real
  authentication.
- The actual gatekeeping in your setup is the existing Photon Custom Auth /
  attestation flow (`AuthURL`) already in the script — that's what
  determines who's allowed to actually connect and play, independent of
  whether they can read the AppIds.
