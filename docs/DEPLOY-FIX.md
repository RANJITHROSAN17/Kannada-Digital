# Deploy the speaker-audio fix to GitHub Pages

**Status: pushed and live (28 October 2026).** Commit `f3c5550` was pushed to `main`; GitHub Actions `CI` and
`Deploy to GitHub Pages` both completed successfully. The live site at
`https://ranjithrosan17.github.io/Kannada-Digital/` now serves the fixed build, including
`public/audio/*.mp3`, `audio-precache.js` and `asset-precache.js`.

Verified on the public URL in headless Chromium:

- speaker click → `/audio/kn-0164.mp3` (HTTP 206 range response), `paused=false`, `currentTime≈1.0s`, `error=null`
- status line: “Playing recorded Kannada pronunciation — works even without a system Kannada voice”
- service worker `kannada-saathi-v4` precached 298 URLs; with the browser offline, a reload still rendered and
  the speaker played the cached MP3
- 0 console / page / request errors

The commands below are kept as a reference for any **future** push. The token used for this push has been
deleted from the workspace and should now be revoked/rotated.

```bash
cd /home/user/Kannada-Digital-clone

# Use a NEW fine-grained PAT with Contents: read+write on RANJITHROSAN17/Kannada-Digital only.
# Do not reuse the token that was pasted earlier in chat; rotate/revoke it.
export GITHUB_TOKEN='<YOUR_NEW_FINE_GRAINED_PAT>'
AUTH=$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)
git -c http.extraheader="AUTHORIZATION: basic $AUTH" push origin user-app-fixes:main
unset GITHUB_TOKEN AUTH
```

Then:

1. GitHub Actions `ci.yml` runs `npm ci`, typecheck, 83 tests, build and `npm audit`.
2. `deploy.yml` publishes the new `dist/` — including `public/audio/*.mp3` and `asset-precache.js` — to Pages.
3. Wait 1–2 minutes, hard-refresh the live site, and click any orange speaker icon.
4. **Revoke the PAT** after the deploy finishes.

If you want me to do the push, paste a fresh fine-grained token and I will use it once, never echo it, and delete
any temporary credential file immediately afterwards.
