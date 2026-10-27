# Deploy the speaker-audio fix to GitHub Pages

The fix is committed locally as `410215b` on branch `user-app-fixes`, but it has **not been pushed** to GitHub
because no fresh GitHub credentials are available in this workspace. The local preview on port **4173** already
serves the fixed build, so you can test the speaker icon there immediately.

To update the live submission URL `https://ranjithrosan17.github.io/Kannada-Digital/`, push the commit:

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
