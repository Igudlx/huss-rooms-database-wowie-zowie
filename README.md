# Config site setup

## 1. Add your assets
Drop these into the repo (paths matter, `index.html` already points at them):
```
images/site.png
audio/site.mp3
```

Final structure should look like:
```
index.html
images/site.png
audio/site.mp3
api/config.js
```

## 2. Push to GitHub, import into Vercel
- Push this folder as a repo.
- In Vercel, "Add New Project" -> import the repo.
- Framework Preset: **Other** (no build step needed).

## 3. Set your real IDs as Environment Variables
In Vercel -> your project -> Settings -> Environment Variables, add (use the
real values from your old script, not these placeholders):

| Key                   | Value (example)                         |
|-----------------------|------------------------------------------|
| PHOTON_APP_ID         | 8e5936a0-cf3b-40ef-b06b-6999694376b3     |
| PHOTON_VOICE_APP_ID   | cd093977-e614-471f-9e95-3c344cb55457     |
| PHOTON_CHAT_APP_ID    | fd186f92-161d-4339-8e3d-921c3e07ccb6     |
| PLAYFAB_TITLE_ID      | 91D57                                    |
| PHOTON_REGION         | eu                                       |
| CONFIG_SHARED_SECRET  | (optional) any random string             |

Redeploy after adding/changing env vars (Vercel doesn't hot-reload them into
already-built deployments).

## 4. Point Unity at it
In the Unity Inspector, on the `PhotonVRManager` component:
- `Config Server URL` -> your deployed URL, e.g. `https://your-project.vercel.app`
- `Config Server Key` -> only fill this in if you set `CONFIG_SHARED_SECRET` above; must match exactly.

That's the one and only place you paste the URL. The script builds
`{ConfigServerURL}/api/config` itself.

## 5. Test
- Visiting `https://your-project.vercel.app/api/config` in a browser should
  return JSON with your real IDs (or a 401 if you set the shared secret and
  aren't sending the header).
- Visiting `https://your-project.vercel.app/` should show only the full-screen
  image with audio looping in the background.
- Run the game in the Unity Editor - the remote config fetch runs even when
  attestation is skipped in-editor, so you can confirm it's pulling the IDs
  correctly without needing a Quest build.

## Note on real protection
An open `/api/config` endpoint is really just obfuscation: anyone who finds
the Vercel URL in your client can call the endpoint directly and get the same
IDs, no reverse engineering required. The shared-secret header raises the bar
slightly but the secret itself still lives in the client. If you want this to
actually be gated, the strongest option is folding these values into your
existing `/verify` attestation response, so only devices that pass Meta's
integrity check ever receive them.
