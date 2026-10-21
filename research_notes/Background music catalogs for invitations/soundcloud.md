# SoundCloud as a background-music source for Festly invitation pages (state as of Oct 2026)

Research date: 2026-10-20. Primary sources: developers.soundcloud.com (docs, API Terms of Use, blog), soundcloud.com/terms-of-use (fetched raw HTML 2026-10-20), help.soundcloud.com, live oEmbed call. Some help-center pages returned HTTP 403 to the fetcher; their content is reported only from search-result snippets and is flagged.

## 1. Widget API: embed params, SC.Widget methods, events, looping, sizes

### Takeaway
The HTML5 Widget (iframe at `w.soundcloud.com/player/` + `https://w.soundcloud.com/player/api.js`) is fully controllable via postMessage: `play/pause/seekTo/setVolume` plus `READY/PLAY/FINISH/ERROR` events. There is no loop parameter, so you loop by calling `seekTo(0)` + `play()` on `FINISH`. Track default height is 166px (classic compact). `visual=true` gives the large artwork-background player. `visual`/`hide_related`/`show_comments`/`show_reposts`/`show_teaser` exist in practice but are not on the current Widget docs page.

### Cited Findings
- Documented embed URL params: `auto_play` ("Starts playing the item automatically"), `color` (hex), `buying`, `sharing`, `download`, `show_artwork`, `show_playcount`, `show_user`, `start_track` (playlist index), `single_active` (if false, players on the page don't pause each other). — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- Methods: `bind(eventName, listener)`, `unbind(eventName)`, `load(url, options)` (reloads the iframe with a new widget; "All previously added event listeners continue working"), `play()`, `pause()`, `toggle()`, `seekTo(milliseconds)`, `setVolume(0-100)`, `next()`, `prev()`, `skip(soundIndex)`. — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- Getters are async callbacks ("values cannot be returned synchronously"): `getVolume`, `getDuration`, `getPosition`, `getSounds`, `getCurrentSound`, `getCurrentSoundIndex`, `isPaused`. — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- Events (`SC.Widget.Events`): audio: `LOAD_PROGRESS`, `PLAY_PROGRESS`, `PLAY`, `PAUSE`, `FINISH`, `SEEK`; UI: `READY`, `CLICK_DOWNLOAD`, `CLICK_BUY`, `OPEN_SHARE_PANEL`, `ERROR`. — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- The docs' sample iframe uses `allow="autoplay"`. The page says nothing about mobile behaviour. — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- No loop param is listed among the documented params. — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- oEmbed default `maxheight` is "166 for tracks and 450 for sets" (81/305 for the legacy flash widget). — [oEmbed docs](https://developers.soundcloud.com/docs/oembed)
- Live oEmbed output (2026-10-20) for a track returns `height:166` and iframe src `https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293&show_artwork=true&maxheight=166`, with `allow="autoplay; encrypted-media"`. So `visual=true` is still emitted by SoundCloud itself. — [oEmbed live call](https://soundcloud.com/oembed?format=json&url=https://soundcloud.com/forss/flickermood)

### Inferences
- Loop pattern: `widget.bind(SC.Widget.Events.FINISH, () => { widget.seekTo(0); widget.play(); })`.
- For a "now playing" chip in Festly, use `getCurrentSound` (returns a sound object with title/user/permalink) after `READY`.
- 166px compact (visual=false) is the smallest official form. `visual=true` at ~300–450px gives the big artwork player.

### Gaps
- `hide_related`, `show_comments`, `show_reposts`, `show_teaser`, `visual` are widely used but I found no current official documentation for them on the Widget page (grep of the docs HTML found none). Treat them as undocumented and possibly subject to change.
- No official statement of a minimum player size.

## 2. Terms: hidden/tiny widget, background audio, branding, attribution, commercial use, caching

### Takeaway
No SoundCloud document explicitly permits or forbids a hidden or tiny widget used as background audio. The words "hide"/"obscure"/"player"/"widget" do not appear in the API Terms. But two sources point against hiding it. The API Terms require "clearly visible backlinks" plus uploader and SoundCloud credit when displaying or streaming content, and forbid interfering with SoundCloud advertising. The consumer Terms of Use bar Widget use that aggregates content into a separate content service, or that implies endorsement. They also let SoundCloud "block your use of the Players and the Widget at any time." The lowest-risk approach is a visible compact (166px) player, or at least a visible "Music: <Title> by <Artist> on SoundCloud" credit linking to the permalink, with the widget kept on-screen.

### Cited Findings
- Consumer Terms of Use, section "Use of SoundCloud players and widget" (verbatim): "The Platform includes access to customizable players ("Players"), and an embeddable version of the SoundCloud waveform player ("Widget") for incorporation into users' own sites, third party sites or social media profiles, whether or not a Linked Service. This functionality is provided to enable Uploaders to put their Content wherever they wish, and to enable other users of the Platform to share and distribute Content within the parameters set by the Uploader. You may not, without the prior written consent of SoundCloud, use the Players or the Widget in such a way that you aggregate Content from the Platform into a separate destination that replicates substantially the offering of the Website, or comprises a content service of which Content from the Platform forms a material part. Similarly, you may not, without the prior written consent of SoundCloud, use the Players or the Widget to embed Content into any website or other destination dedicated to a particular artist (except where the relevant Content is your Content ...), or to a particular genre. You may not use the Players or Widget in any way that suggests that SoundCloud or any artist, audio creator or other third party endorses or supports your website, or your use of the Players or Widget. The foregoing shall apply whether such use is commercial or non-commercial. SoundCloud reserves the right to block your use of the Players and the Widget at any time and for any reason at its sole discretion." — [SoundCloud Terms of Use](https://soundcloud.com/terms-of-use) (raw HTML fetched 2026-10-20; the page's plain-language summary says "basically, don't try to use our players to create a new music or audio streaming service"; archived versions exist, e.g. [09-2025](https://soundcloud.com/terms-of-use/09-2025))
- Same ToU: the Terms cover "all related players, widgets, tools, ... APIs (which are also subject to separate API Terms of Use)". — [SoundCloud Terms of Use](https://soundcloud.com/terms-of-use)
- Uploader licence grant: uploaders license "operators and users of any other websites ... to which your Content has been shared or embedded using the Services ("Linked Services")" to use the Content "utilizing the features of the Platform ... and within the parameters set by you using the Services." This is the legal basis for embedding without a separate music licence. — [SoundCloud Terms of Use](https://soundcloud.com/terms-of-use)
- API Terms of Use effective date: 30 March 2024. — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- API Terms §08 Attribution requires that you "credits the Uploader as the creator of that User Content;" "credits SoundCloud as the source of that User Content;" and, on web, "clearly visible backlinks from the relevant sounds within your app to the URL" (the soundcloud.com permalink). Design assets: "must not make any changes or modifications". You must not use SoundCloud marks in your app's name. — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- API Terms §10: you must not "remove or attempt to remove or interfere with any advertising delivered via the SoundCloud API." Also bans "stream ripping" and "stream capture". — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- API Terms §06 Commercial: "Use of the SoundCloud API is permitted for some commercial purposes". Acceptable cases (paraphrased by fetcher): apps whose main purpose is creating/sharing User Content, delivering an uploader's content to their own ad-enabled site, promoting a user's own content, or cases SoundCloud approves individually. Unacceptable: "any in-app purchases which allow access to content or features already available via the SoundCloud platform;" and "any app that features any advertising, sponsorship or promotion around User Content". SoundCloud decides case by case. Also bars letting third-party commercial services embed User Content or SoundCloud functionality. "Access to the SoundCloud API is currently provided free of charge". — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- API Terms §03: must not build "any service that aggregates and streams User Content from multiple users" or "any playback experience which aggregates and streams User Content with content from other services". Must not use content "with or into any advertisement", in ads/games/videos without licences, or for AI training/fingerprinting. Must not access content the uploader hasn't enabled for API/public. Must not modify content. — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- API Terms §05 Caching: no file-save functionality and no app "designed to cache, download or persistently store any User Content". Session caching is allowed but "any cached content must cease to be available, accessible or playable within your app at the end of that session". "must not offer offline access". Reflect uploader changes (removals, disabled API access) as soon as reasonably possible. — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- API Terms contain no match for "player", "widget", "obscure" or "hide" (keyword scan by fetcher). — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- Custom players must credit the uploader and SoundCloud and link to the track URL. — [API Guide](https://developers.soundcloud.com/docs/api/guide)

### Inferences
- A plain oEmbed/widget embed (no API key) is governed mainly by the consumer ToU player clause. An invitation site is not "dedicated to a particular artist or genre" and is not a "content service of which Content ... forms a material part". That holds as long as music is incidental and Festly doesn't build a SoundCloud music browser/streaming product. Risk: a host-facing in-app search of the SoundCloud catalogue, plus paid tiers, could be read as Festly aggregating SoundCloud content into a commercial service. That would bring in the API Terms §06 restrictions, under which "some commercial purposes" are decided case by case.
- Hiding the widget (0px, display:none, offscreen) is not expressly banned. It does sit badly with the "clearly visible backlinks" attribution rule (API Terms), with the no-interference-with-ads rule, and with SoundCloud's discretionary block right. Recommended: keep a visible compact player, or a small visible mini-player with artwork, title, artist, "SoundCloud" credit and a link to the permalink. Avoid styling that implies the artist endorses the event.
- Storing only the track URL/id/title/artist/permalink (metadata, not audio) fits §05. Festly should re-validate references, since uploaders can delete tracks or disable embeds, and handle ERROR gracefully.
- If Festly sells premium invitations, don't gate SoundCloud music behind a paywall ("in-app purchases which allow access to content ... already available via the SoundCloud platform").

### Gaps
- No official guidance found on minimum visible size, opacity or "background-only" widget use. Written consent from SoundCloud would be the only certain route.
- Couldn't retrieve the help-center embedding FAQ (403), so no help-center statement on hidden embeds.
- The ToU page I fetched showed no visible "last updated" date. The latest dated archive surfaced by search is 09-2025.

## 3. API access for new developers (2025–2026), auth, rate limits, search

### Takeaway
Registration reopened as self-service on 18 May 2026, but only for Artist Pro subscribers (paid). It gives a Client ID and Secret with no manual review. Auth is OAuth 2.1, with client credentials via `https://secure.soundcloud.com/oauth/token`. Tokens last about 1h and token minting is tightly limited. Track search (`q=`) exists. The current rate-limits page lists 1,500 stream requests per 24h, 3,000 searches per hour and about 100 requests per minute general. The often-quoted "15,000 play requests/day" is an older figure.

### Cited Findings
- Blog, 18 May 2026 (Danny Preussler): "Officially, our public application registration program was closed for years." "The app registration portal was closed, and getting a key was nearly impossible for new projects." Last year, creators could "request access by chatting with our chatbot Otto and submitting their ideas for review." Now, "If you have a SoundCloud Artist-Pro subscription ... you can now instantly generate your own Client ID and Client Secret via our fully self-service portal." "No more chatbots, no more manual review forms, and no more waiting." — [SoundCloud dev blog](https://developers.soundcloud.com/blog/vibe-coding-ai-agent-docs-self-serve-api-keys)
- Registration docs: "You need a SoundCloud Artist Pro subscription to register API applications and receive credentials." Register via the SoundCloud API CLI (Node 18+, pairing URL) or the "Your Apps" page. Output is a Client ID + Client Secret ("Store the Client Secret in environment variables or a secrets manager"). No review step is described. Price not stated. — [Register app docs](https://developers.soundcloud.com/docs/api/register-app)
- API Terms §01: "you must register your app through the SoundCloud API registration process." "Your client ID is required for all calls to the SoundCloud API." — [API Terms](https://developers.soundcloud.com/docs/api/terms-of-use)
- Older context: VentureBeat reported an application-review regime. Third-party guides (RapidDev) still say registration is closed, which is outdated. — [VentureBeat](https://venturebeat.com/ai/soundcloud-now-makes-developers-apply-for-api-access); [RapidDev](https://www.rapidevelopers.com/md/flutterflow-integrations/soundcloud-api)
- Auth: "OAuth 2.1", with PKCE required for authorization code. The client credentials grant goes to `https://secure.soundcloud.com/oauth/token` with "only HTTP Basic authentication". "Access tokens expire after approximately 1 hour". Refresh tokens are single-use. Client-credentials token limits: 50 tokens per 12h per app, 30 per hour per IP. — [API Guide](https://developers.soundcloud.com/docs/api/guide)
- Search: `/tracks` supports `q` (matches title, username, description), an `access` filter (playable/preview/blocked) and range filters (bpm, duration). — [API Guide](https://developers.soundcloud.com/docs/api/guide)
- Rate limits (current page): general "on the order of 100 requests per minute" per app. `GET /tracks/:id/stream(s)` 1,500 per 24h. Search 3,000 per hour. Downloads 10/min. Reposts and likes 500 per 24h. Apps approved for higher production access may get "up to 10×". 429 + `Retry-After`. — [Rate limits](https://developers.soundcloud.com/docs/api/rate-limits)
- Older figure: secondary reporting of a 15,000 play-requests per 24h cap. — [Tiny Mix Tapes](https://tinymixtapes.com/node/146204%3Fver%3Damp) (old, undated in result; superseded by the rate-limits page above)

### Inferences
- Festly would need an Artist Pro subscription on a company account to get keys. Host-side search should be proxied server-side (TanStack Start server function) with one cached client-credentials token per hour, to stay within 50 tokens per 12h.
- 1,500 stream requests/day across all guests makes self-hosted streaming (section 4) unworkable at scale without the 10× approval. Widget plays don't touch Festly's API quota (see gap).

### Gaps
- Artist Pro price and whether a business may hold it for API purposes: not stated on the docs page.
- Whether widget plays count toward any app quota: the "Play Request Limit" section exists in the nav, but its content wasn't retrieved. The widget uses no Festly client_id, so presumably no.
- Whether `/tracks?q=` search falls under the 3,000/h "search" bucket or the general bucket: unclear.

## 4. Stream URLs in your own `<audio>`, formats, Go+/snippets, streamable, embeddable_by, geo

### Takeaway
Technically yes: `/tracks/{urn}/streams` returns HLS AAC (`hls_aac_160_url`, `hls_aac_96_url`), which needs hls.js in non-Safari browsers. Legacy progressive MP3, HLS MP3 and Opus were scheduled for removal on 31 Dec 2025. Using streams outside the widget triggers the full API Terms: attribution, session-only caching, no ads around content, and case-by-case commercial review. It also burns the 1,500 per day stream quota. Go+ tracks play only 30s previews in embeds. Uploaders can disable embed code and, separately, "app playback" (API).

### Cited Findings
- Blog (15 Sep 2025, "Deadline Extended"): the streams endpoint adds `hls_aac_160_url` (preferred) and `hls_aac_96_url` (fallback). Removal after 31 Dec 2025: `http_mp3_128_url` (progressive), `hls_mp3_128_url`, `hls_opus_64_url`. "Progressive MP3 playback will no longer be supported". `preview_mp3_128_url` stays for previews. — [SoundCloud dev blog](https://developers.soundcloud.com/blog/api-streaming-urls)
- An earlier notice pointed to 15 Nov 2025. A developer reported in a GitHub issue that the API still returned only the old fields. — [soundcloud/api #466](https://github.com/soundcloud/api/issues/466)
- Help center: standard streaming format is AAC, and legacy MP3 tracks are being migrated. — [Audio Streaming Formats](https://help.soundcloud.com/hc/en-us/articles/53385714099611-Audio-Streaming-Formats) (from search snippet)
- API guide: playback uses transcoded streams. Private tracks need `secret_token`. Calling `/tracks/:id/streams` on a blocked track returns an error. `access` values: `playable` (fully streamable), `preview` (snippet), `blocked` ("not streamable, only metadata is provided"). — [API Guide](https://developers.soundcloud.com/docs/api/guide)
- Go+ in embeds: Go tracks show only a 30-second preview in embedded players, because embeds can't sign in. Rights holders decide free vs Go+. — [Embedding a SoundCloud Go Track](https://help.soundcloud.com/hc/en-us/articles/115003448167-Embedding-a-SoundCloud-Go-Track); [Go+ tracks](https://help.soundcloud.com/hc/en-us/articles/360052599653-SoundCloud-Go-tracks) (search snippets; pages 403 to fetcher)
- Embedding control: the Permissions tab has "Display embed code". "Making the embed code private will not disable embedded players for that track that are already being used." Separate "Enable app playback": "Disabling app playback prevents supported third-party integrations from streaming your track via the SoundCloud API. This setting does not affect playback on SoundCloud itself or through official SoundCloud embeds." — [Embedding tracks FAQs](https://help.soundcloud.com/hc/en-us/articles/31423752369691-Embedding-tracks-FAQs) (search snippet; 403 on fetch)
- When a creator disables embedding, embed requests fail (WordPress ticket closed as creator preference). — [WordPress Trac #46843](https://core.trac.wordpress.org/ticket/46843)

### Inferences
- For Festly, the widget is the far better route. It needs no API key, no stream quota, no hls.js, and handles Go+/geo/monetization itself. Its ads are SoundCloud's, so you aren't "interfering". Uploader settings are respected automatically.
- In host-side search results, filter to `access=playable`. Warn hosts when a pick is a preview-only (Go+) track, because guests would hear 30s and then FINISH. Looping would replay the snippet.
- `streamable` / `embeddable_by` fields: legacy track fields. Not found in current docs (see gap). Use `access` plus a widget ERROR/oEmbed failure as the practical signals.

### Gaps
- Not confirmed whether the MP3/Opus fields are actually gone as of Oct 2026.
- `embeddable_by` and `streamable` are not covered in the current API guide. Couldn't confirm whether they're still returned.
- Geo-blocking behaviour in the widget: no official source found.

## 5. oEmbed for metadata from a pasted URL (no API key)

### Takeaway
`https://soundcloud.com/oembed?format=json&url=<permalink>` works with no key and with CORS JSON. It returns title, author_name, author_url, thumbnail_url and ready iframe HTML containing the numeric track id. This is ideal for a "paste a SoundCloud link" picker.

### Cited Findings
- Endpoint `https://soundcloud.com/oembed`. Accepts user/set/track URLs and returns JSON (CORS) or JSONP (`format=js`, `callback`). Params: `url` (required), `maxwidth`, `maxheight`, `color`, `auto_play`, `show_comments`. — [oEmbed docs](https://developers.soundcloud.com/docs/oembed)
- Live response (2026-10-20, no auth, HTTP 200): `{"version":1.0,"type":"rich","provider_name":"SoundCloud","height":166,"width":"100%","title":"Flickermood by Forss","description":...,"thumbnail_url":"https://i1.sndcdn.com/artworks-...-t500x500.jpg","html":"<iframe ... src=\"https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293&show_artwork=true&maxheight=166\"></iframe>","author_name":"Forss","author_url":"https://soundcloud.com/forss"}` — [oEmbed live call](https://soundcloud.com/oembed?format=json&url=https://soundcloud.com/forss/flickermood)

### Inferences
- Festly can store `{permalink, trackId (parsed from html src), title, author_name, author_url, thumbnail_url}`. The `title` is "Track by Artist", so author_name gives the artist. Re-call oEmbed on publish/open to detect removed or embed-disabled tracks (expect a non-200).
- A paste-link picker avoids the Artist Pro requirement entirely. Only in-app catalogue search needs API keys.

### Gaps
- Exact error status for embed-disabled or deleted tracks was not tested (likely 403/404).

## 6. Practical issues: ads, mobile/iOS Safari, play() after a parent-page gesture

### Takeaway
No official documentation was found on ads in the widget or on iOS behaviour. The core risk is that `widget.play()` is relayed by postMessage into a cross-origin iframe. Browsers (iOS Safari especially) may not treat that as a user gesture, so playback after "Open invitation" can be blocked. Community reports show widget playback failing on iPhone. Test on real devices. Fallback: make the visible player's own play button the gesture target.

### Cited Findings
- Widget control is via `window.postMessage` and async getters. The docs sample uses `allow="autoplay"`. Nothing is said about mobile. — [Widget API docs](https://developers.soundcloud.com/docs/api/html5-widget)
- Live oEmbed iframe includes `allow="autoplay; encrypted-media"`. — [oEmbed live call](https://soundcloud.com/oembed?format=json&url=https://soundcloud.com/forss/flickermood)
- Community reports: SoundCloud widget "works fine on a laptop, but fails to start the song on the iPhone" (old, iOS 6 era) — [mrcoles test page](https://mrcoles.com/media/test2/soundcloud/). A Tumult forum user reports the widget play button not starting on iOS — [Tumult forum](https://forums.tumult.com/t/soundcloud-in-ios/6873). Both are old and anecdotal.
- Go+ marketing says the subscription adds "ad-free streaming", which implies ads exist on free listening. Nothing explicit about ads inside embeds. — [Go+ tracks help](https://help.soundcloud.com/hc/en-us/articles/360052599653-SoundCloud-Go-tracks) (search snippet)

### Inferences
- Implementation pattern: create the iframe early (hidden behind the cover screen or in a mini-player), wait for READY, then call `widget.play()` synchronously in the "Open invitation" click handler. Listen for `PLAY` within about 1–2s. If it doesn't arrive (iOS), reveal the compact player and ask the guest to tap its play button, since a tap inside the iframe is a genuine gesture.
- `setVolume` may be ignored on iOS (iOS generally disallows programmatic volume on media elements), so fades may not work there. This is general platform behaviour, not SoundCloud-documented.
- Background playback when the tab is backgrounded or the screen is locked on iOS is unreliable for iframe audio.

### Gaps
- No authoritative 2024–2026 source on (a) whether audio ads play in the embedded widget, (b) current iOS Safari behaviour of `SC.Widget.play()` from a parent-page gesture, or (c) Android Chrome behaviour. Needs device testing.
- No GitHub issues from 2024–2026 on widget autoplay were found in this pass.
