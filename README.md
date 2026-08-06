# The SeedSigner Manifesto — a reading edition

A single-page, story-flow presentation of the
[SeedSigner Independent Custody Guide](https://github.com/SeedSigner/independent_custody_guide),
built for people who have just discovered SeedSigner and want to understand the
reasoning behind the model — not just the steps.

It's a static site: three files and an image folder. No build step, no
dependencies, no external requests at all.

## Provenance and attribution

**All content and images come from the SeedSigner project's guide**, which is
MIT licensed (© 2022 SeedSigner). That licence is what makes this edition
possible, and it travels with the content — see [LICENSE](LICENSE).

What this edition does:

- Re-sequences the guide into eleven chapters with a continuous narrative arc
- Writes connective prose around the guide's own arguments, and keeps the
  author's voice in pull quotes
- Presents all 51 images from the source repository as captioned exhibits
- Links every chapter back to the corresponding section of the original README
- Collects every external link the guide cites into a sources appendix

What it deliberately does **not** do:

- Present itself as an official SeedSigner publication. The footer says so
  plainly, and points at the project repository for anything authoritative
  (software releases, PGP verification, hardware compatibility).
- Add technical claims that aren't in the source. The one place where
  present-day context is added — a note in chapter 08 that the testnet commands
  and faucet link have aged — is labelled `Editor's note — not from the guide`
  so it can't be mistaken for the author's words.

The closing call to action linking to beunruggable.com is the one piece of the
page that isn't about the guide. It picks up the guide's own suggestion, in
chapter 02, that some people should work through this with an "Uncle Jim" or a
self-custody coach.

If you publish this, keep the attribution and the licence file intact.

> **A note on prices.** The hero quotes a bill of materials of ~$70, which is
> what a build costs now. The figures inside the chapters — ~$35 total, a
> display at $15 or less, a camera at $10 or less — are the guide's own 2022
> numbers and are left exactly as written.

## Structure

```
index.html      the page — 11 chapters, 50 exhibits, semantic HTML
styles.css      design tokens + layout; dark and light themes
app.js          progressive enhancement only (see below)
images/         47 webp + 51 jpg/png fallbacks + 4 gifs + 4 gif posters
vercel.json     caching, security headers, CSP
favicon.ico     plus icon-192/512 and apple-touch-icon
LICENSE         the SeedSigner guide's MIT licence
```

The page is fully readable with JavaScript disabled. `app.js` only adds the
theme toggle, scroll reveals, nav-rail tracking, and play-on-view for the
animated GIFs.

## Design notes

- **No third-party requests.** No font CDN, no analytics, no trackers. A page
  arguing against leaking data to third parties shouldn't hotlink one, so the
  typography uses carefully chosen system stacks: an old-style serif (Charter /
  Iowan / Georgia) for prose, system monospace for all labels and data.
- **Visual direction: "evidence log."** The guide's reasoning comes from its
  author's digital-forensics background, so the page is built like a case
  dossier read on a device screen — numbered exhibits, hairline rules, and QR
  registration brackets as the recurring frame.
- **Both themes are designed**, driven by `prefers-color-scheme` with a toggle
  that overrides it in either direction and persists to `localStorage`. All
  text passes WCAG AA contrast in both.
- **Accessibility:** one `h1`, ordered headings, descriptive alt text on all 51
  images, visible focus states, a skip link, and `prefers-reduced-motion`
  honoured (scroll reveals are disabled).

## Image handling

The source images total 62MB, which is too heavy for a landing page. They were
resized to a maximum of 1500px and recompressed, then given webp variants served
through `<picture>` elements. A reader downloads **~6.5MB** (2.6MB webp + 3.9MB
gifs) instead of the original 62MB, and everything below the fold is lazy-loaded.
The jpg/png fallbacks stay in the repo for older browsers, so the folder itself
is 18MB — that costs the repo, not the reader.

If you replace an image, the webp variant and the jpg/png fallback have to stay
in sync, since each `<picture>` names both:

```bash
cwebp -q 76 images/foo.jpg -o images/foo.webp
```

The four animated GIFs also ship with a static first-frame poster
(`*_poster.jpg`). The page swaps the animation in only while the figure is near
the viewport and swaps the poster back when it leaves, so a 34,000px page isn't
repainting four animations you can't see.

## Running it locally

Any static server will do:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

## Deploying to Vercel on seedsigner.beunruggable.com

> **Create a new Vercel project for this.** Don't push it into the existing
> `become-unruggable` project — that would replace your main site.

### 1. Push this folder to its own repo

```bash
cd ~/Relayed/independent-custody-guide
git init -b main
git add .
git commit -m "The SeedSigner Manifesto — reading edition"
gh repo create seedsigner-manifesto --public --source=. --push
```

Use `--private` instead of `--public` if you'd rather keep it closed. Without
`gh`, create the repo on github.com and then:

```bash
git remote add origin git@github.com:<your-user>/seedsigner-manifesto.git
git push -u origin main
```

### 2. Import it as a new Vercel project

1. Go to <https://vercel.com/become-unruggable> → **Add New** → **Project**.
2. **Import** the `seedsigner-manifesto` repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory
   **empty** — it's a static folder and `vercel.json` handles the rest.
4. **Deploy**, then confirm the page loads on the `*.vercel.app` URL before
   touching any DNS.

### 3. Attach the subdomain

1. In the new project: **Settings → Domains → Add**.
2. Enter `seedsigner.beunruggable.com` and confirm.

What happens next depends on where `beunruggable.com` DNS lives:

- **Nameservers already on Vercel** — likely, since `firstsat.beunruggable.com`
  already runs there. Vercel creates the record itself; nothing else to do.
- **DNS at a registrar or Cloudflare** — add the record Vercel shows you:

  | Type  | Name         | Value                   |
  | ----- | ------------ | ----------------------- |
  | CNAME | `seedsigner` | `cname.vercel-dns.com.` |

  On Cloudflare, set it to **DNS only** (grey cloud). Proxying breaks Vercel's
  certificate issuance.

3. Wait for **Valid Configuration**. TLS is issued automatically, usually within
   a couple of minutes of DNS propagating.

### Alternative: straight from the CLI

No GitHub involved. Fine for a first look; the git flow above is better for
ongoing edits.

```bash
npm i -g vercel
vercel login
cd ~/Relayed/independent-custody-guide
vercel --scope become-unruggable          # creates the project, deploys a preview
vercel --prod --scope become-unruggable   # promote to production
```

Then attach the domain as in step 3.

### After it's live

- **If you deploy to any hostname other than
  `https://seedsigner.beunruggable.com`, update the four absolute URLs in
  `index.html`** — `canonical`, `og:url`, `og:image` and `twitter:image` — or the
  social preview image will 404. They're all in the first 40 lines.
- Check the social card by pasting the URL into
  [opengraph.xyz](https://www.opengraph.xyz/).
- Check the contents bar on a phone: it pins to the bottom below 1180px wide.

It's a plain static folder, so GitHub Pages, Netlify and Cloudflare Pages all
work too — no build command, publish directory is the repository root.

## Contributing upstream

The guide is explicitly a living document, and its author invites corrections —
including grammar and spelling — as pull requests or issues on
[the source repository](https://github.com/SeedSigner/independent_custody_guide).
If you spot something wrong in the guide's substance, that's where it belongs.
Fixes to this presentation belong here.
