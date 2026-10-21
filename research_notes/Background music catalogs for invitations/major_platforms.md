# Major streaming platforms as host-selected background music on a public invitation page (as of 2026-10-20)

Use case: Festly (commercial) public invitation page; guest taps "Open invitation"; music starts and keeps playing while they scroll; host picks a song; Festly stores only a reference (id/title/artist/url).

Research date: 2026-10-20. Pages checked live that day. YouTube Developer Policies and the quota page both show "Last updated 2026-10-15 UTC".

## YouTube (IFrame Player API, Terms/Policies, oEmbed, Data API quota)

### Takeaway
Technically, the IFrame API can do almost everything needed: play after a click, loop, start/end, mute and volume. The policies rule out the "invisible background music" pattern. A hidden or off-screen player is a prohibited "background player", splitting audio from video is prohibited, and the player must be at least 200x200 with nothing covering it. A small visible floating player only complies if it is at least 200x200, fully visible and not covered. Even then, the core idea of using a music video as a page's audio-only soundtrack sits close to the "separate/isolate audio" prohibition. oEmbed works with no API key. The search quota changed: search.list is now its own bucket of 100 calls/day at 1 unit each, not 100 units out of 10,000.

### Cited Findings
**Player capabilities (IFrame API / parameters)**
- Loop needs the playlist parameter: "To loop a single video, set the `loop` parameter value to `1` and set the `playlist` parameter value to the same video ID already specified in the Player API URL." The page also says: "This parameter has limited support in IFrame embeds." — [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- `start`: "causes the player to begin playing the video at the given number of seconds from the start of the video". `end`: "specifies the time, measured in seconds from the start of the video, when the player should stop playing the video." — [Player Parameters](https://developers.google.com/youtube/player_parameters)
- `playsinline` "controls whether videos play inline or fullscreen on iOS" (1 = inline). `controls=0` hides controls. — [Player Parameters](https://developers.google.com/youtube/player_parameters)
- Autoplay param note: "If you enable Autoplay, playback will occur without any user interaction with the player; playback data collection and sharing will therefore occur upon page load." — [Player Parameters](https://developers.google.com/youtube/player_parameters)
- The IFrame API has `mute()`/`unMute()` and `setVolume()` ("Accepts an integer between 0 and 100"), plus `loadVideoById` with start/end seconds. — [IFrame Player API reference](https://developers.google.com/youtube/iframe_api_reference)
- There is an `onAutoplayBlocked` event. Browsers may block calls such as `playVideo`: "Instances where this policy may be triggered include unmuted playback without user interaction." — [IFrame Player API reference](https://developers.google.com/youtube/iframe_api_reference)
- "A playback only counts toward a video's official view count if it is initiated via a native play button in the player." This means a programmatic `playVideo()` from Festly's "Open invitation" button would not count views. — [IFrame Player API reference](https://developers.google.com/youtube/iframe_api_reference)

**Required Minimum Functionality (size / visibility / autoplay / overlays)**
- "Embedded players must have a viewport that is at least 200px by 200px." "If the player displays controls, it must be large enough to fully display the controls without shrinking the viewport below the minimum size." "We recommend 16:9 players be at least 480 pixels wide and 270 pixels tall." — [YouTube RMF](https://developers.google.com/youtube/terms/required-minimum-functionality)
- Autoplay / scripted playback: an API Client "must not initiate an automatic playback until the player is visible and more than half of the player is visible on the page or screen". "A page or screen must not have more than one YouTube player that automatically plays content simultaneously." (Wording reassembled from fetched fragments; the meaning matches the brief's quote.) — [YouTube RMF](https://developers.google.com/youtube/terms/required-minimum-functionality)
- "Any YouTube thumbnail that initiates a playback must be at least 120 pixels wide and 70 pixels tall." — [YouTube RMF](https://developers.google.com/youtube/terms/required-minimum-functionality)
- Overlays: "You must not display overlays, frames, or other visual elements in front of any part of a YouTube embedded player" and "must not use overlays, frames or other visual elements to obscure any part of an embedded player." — [YouTube RMF](https://developers.google.com/youtube/terms/required-minimum-functionality)

**Developer Policies (last updated 2026-10-15)**
- III.I.6: must not "modify, build upon, or block any portion or functionality of a YouTube player". — [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- III.I.7: must not "separate, isolate, or modify the audio or video components of any YouTube audiovisual content". III.I.8: must not "promote separately the audio or video components of any YouTube audiovisual content". — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- III.I.9: must not "create, include, or promote features that play content, including audio or video components, from a background player", where a background player is "a player that is not displayed in the page, tab, or screen that the user is viewing." — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- III.I.21: must not "situate the YouTube player in a nested or hierarchical iframe lineage to circumvent YouTube policies". — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- III.I.4: "you must not remove, obscure, alter, or disable any links that appear in YouTube players". III.I.5: no blocking/replacing YouTube ads. — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- Commerce: III.G.1 bars selling or sublicensing API Services or access to them without written approval, and bars selling ads "placed on or within YouTube audiovisual content". III.G.2 allows "selling an API Client" (i.e., a commercial app may use the API, subject to all other terms). — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- III.E.1: no downloading or caching of audiovisual content, and no offline playback. — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- III.E.4.j: Made-for-Kids videos — "API Clients must turn off tracking". — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)

**oEmbed (no API key)**
- Live test on 2026-10-20: `GET https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=2Vv-BfVoq4g&format=json` returned JSON with no key: `title`, `author_name`, `author_url`, `thumbnail_url` (hqdefault 480x360), and `html` (an iframe with `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`). — [YouTube oEmbed endpoint](https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=2Vv-BfVoq4g&format=json)

**Data API quota (this has changed from the brief's assumption)**
- Current text: "Projects that enable the YouTube Data API have a default quota allocation of 100 search.list calls, 100 videos.insert calls, and 10,000 units per day combined for all other endpoints." "The search.list and videos.insert methods have their own quota buckets. Each of these methods has a default daily limit of 100 per day. The quota cost is 1 per call." Each extra results page counts as another call. Quotas reset at midnight PT. `videos.list` costs 1 unit. — [Quota costs page, last updated 2026-10-15](https://developers.google.com/youtube/v3/determine_quota_cost)
- The brief's "search.list = 100 units of 10,000/day" is out of date. The practical ceiling is the same, about 100 searches/day per project by default.

### Inferences
- A muted, zero-size or off-screen iframe used to play audio violates III.I.9 (background player) and the 200x200 RMF minimum. Shrinking the player into a tiny floating "now playing" chip below 200x200 is non-compliant.
- A visible player of at least 200x200 that the guest can see and control while scrolling (e.g., sticky or floating) looks consistent with the RMF text if nothing overlays it and the "Open invitation" tap counts as user-initiated playback. A 200x200 floating video box is a heavy UI element on a phone-sized invitation, though.
- The bigger policy risk is the concept itself. Presenting a music video purely as page background audio (video hidden, scrolled away or de-emphasized) arguably "isolate[s] the audio ... components" (III.I.7). That is a judgment call, and the policies have no explicit "background music for a website" clause.
- Once the guest scrolls the player off-screen, a page-anchored player arguably becomes "not displayed in the page ... the user is viewing". The definition targets players not displayed in the page/tab, so a sticky player stays safer.
- Festly can sell its own product (III.G.2), but it should not market "YouTube music" as a paid feature, which edges toward III.G.1.b.
- Mobile: a guest's tap on Festly's own button followed by `player.playVideo()` (via postMessage into the cross-origin iframe) is the standard pattern and usually works in Chrome. iOS Safari is stricter about user-activation crossing into cross-origin iframes. Expect cases where `onAutoplayBlocked` fires and the guest must tap the native YouTube play button. Pre-creating the player before the tap and calling `playVideo()` synchronously in the click handler improves odds. This is engineering knowledge, not from an official source.

### Gaps
- Found no official Google statement on whether `playVideo()` triggered by a parent-page click reliably starts unmuted audio on iOS Safari / Android Chrome. Needs device testing.
- Found no YouTube policy text that explicitly addresses "background music on a website" or a minimum on-screen visibility while scrolling (as opposed to at autoplay start).
- The exact wording of the RMF autoplay sentence was assembled from fetched fragments. Re-check it on the page before quoting in legal-facing material.

## Spotify (Web API changes, Embed / iFrame API, Terms and Policy)

### Takeaway
Spotify is a poor fit. Since 27 Nov 2024, new apps lose 30-second preview URLs (and other endpoints). Since Feb/Mar 2026, Development Mode needs a Premium owner and is capped at 5 users. The Embed iFrame API has `play`/`togglePlay`/`seek`/`loadUri`, but logged-out guests reportedly get only 30-second previews. The Developer Policy bans commercial use of SDAs, syncing recordings with visual media, mixing with other audio, and public/business playback. The Widget Terms say the Play Button "may not be used for commercial purposes."

### Cited Findings
**Web API changes (27 Nov 2024)**
- Affected features: "Related Artists", "Recommendations", "Audio Features", "Audio Analysis", "Get Featured Playlists", "Get Category's Playlists", "30-second preview URLs" in multi-get responses ("SimpleTrack" object), "Algorithmic and Spotify-owned editorial playlists". — [Spotify blog 2024-11-27](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)
- Who it affects: "New apps that are registered on or after today's date" and "Existing apps that are still in development mode without a pending extension request". Apps with existing extended access are unaffected. — [Spotify blog 2024-11-27](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)
- Note: the post's summary wording lists preview URLs "in multi-get responses". In practice, developers report `preview_url` as null for new apps across track objects. That is not verified here; see Gaps.

**2026 changes**
- 6 Feb 2026: "Development Mode use will require a Spotify Premium account"; "Each Client ID will be limited to up to five authorized users"; one Development Mode Client ID per developer; "API access will be limited to a smaller set of supported endpoints" for new Client IDs. Applies to new Client IDs from 11 Feb and existing integrations from 9 Mar (endpoint changes for existing integrations postponed). — [Spotify blog 2026-02-06](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security); [Feb 2026 migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- 23 Jul 2026: Dev Mode Client ID cap raised to 25 per account, and quota is now counted per developer account and shared across Client IDs (per search-result summary of the post; not fetched directly). — [Spotify blog 2026-07-23](https://developer.spotify.com/blog/2026-07-23-web-api-quota-updates)

**Embed / iFrame API**
- Methods: `loadUri(spotifyUri)` (still supported, `loadEntity` recommended), `play()`, `pause()`, `resume()`, `togglePlay()`, `seek(seconds)`, `restart()`, `destroy()`, `loadEntity(uriOrUrl, preferVideo, startAt)`. Events: `ready`, `playback_update` (`playingURI`, `isPaused`, `isBuffering`, `duration`, `position`), `playback_started`. Options: `width`, `height`, `uri`, `url`. — [Spotify iFrame API reference](https://developer.spotify.com/documentation/embeds/references/iframe-api)
- `play` "might not be supported in all browsers and for all users". Safari blocks autoplay without user interaction. — [Spotify iFrame API reference](https://developer.spotify.com/documentation/embeds/references/iframe-api)
- The official docs don't say what logged-out listeners hear. Third-party docs say the embed plays "a 30-second long audio preview, and then the users are prompted to either login or to sign up". WordPress support says "you need a Spotify account to be able to listen to entire tracks". A Spotify community reply says full playback requires being logged in to spotify.com. Some logged-in users still report 30s. — [Zeroqode docs](https://docs.zeroqode.com/plugins/spotify-embed-plugin); [WordPress support](https://ja.wordpress.org/support/article/spotify-embed/); [Spotify Community](https://community.spotify.com/t5/Other-Podcasts-Partners-etc/Spotify-Play-Button-30-second-limit/td-p/4552931)
- Spotify oEmbed works with no key (live test 2026-10-20): `https://open.spotify.com/oembed?url=...track/...` returned `title`, `thumbnail_url`, and an embed iframe (`height 152`, `allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"`). — [Spotify oEmbed](https://open.spotify.com/oembed?url=https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v)

**Developer Policy (effective 15 May 2025)**
- "Except for the limited commercial uses for Non-Streaming SDAs (set out below) commercial uses are not permitted for SDAs." (IV.2). Disallowed: "any e-commerce (e.g., in-app payment or monetization) initiated via a Streaming SDA". — [Spotify Developer Policy](https://developer.spotify.com/policy)
- "Do not synchronize any sound recordings with any visual media, including any advertising, film..." (III.6). — [Policy](https://developer.spotify.com/policy)
- "Do not permit any device or system to segue, mix, re-mix, or overlap any Spotify Content with any other audio content" (III.7). — [Policy](https://developer.spotify.com/policy)
- "Do not create any product or service which includes any non-interactive internet webcasting service." (III.4). — [Policy](https://developer.spotify.com/policy)
- "Spotify is for personal, non-commercial use which means it can't be broadcast or played publicly from a business" (III.10). — [Policy](https://developer.spotify.com/policy)
- "If you use Spotify Widgets, you must also comply with the restrictions set out in the Spotify Widgets Terms." (V.1). "Audio Preview Clips may only be used to promote the underlying content" (V.2.2). — [Policy](https://developer.spotify.com/policy)

**Developer Terms (Version 10, effective 15 May 2025)**
- License "for private personal use; and (ii) on Approved Devices" (III.1.a). "You will not sell any Spotify Content or other data obtained from Spotify." (V.5). Widgets are excluded from the SDA definition and governed by the Widget Terms (I.2, II.17). — [Spotify Developer Terms](https://developer.spotify.com/terms)

**Widget (Embed) Terms (Version 2.0, effective 27 May 2014)**
- Grant: "reproduce and display the Spotify Widgets on any website or webpage controlled by you". — [Spotify Widget Terms](https://developer.spotify.com/documentation/embeds/terms)
- "Please note that the Spotify Play Button may not be used for commercial purposes." "This restriction does not prohibit you from embedding the Spotify Play Button on Websites that contain advertising." — [Widget Terms](https://developer.spotify.com/documentation/embeds/terms)
- "You shall display the Spotify Widgets in the form made available by Spotify, without alteration". "You shall not obfuscate the Spotify Widgets in any way, whether by banner advertisements or by any other means". "Do not use Spotify Content for any purpose other than delivering your Widget." No implying endorsement/co-branding. — [Widget Terms](https://developer.spotify.com/documentation/embeds/terms)

### Inferences
- An embed shown visibly on the invitation, started by the guest's tap via `controller.play()`, is technically feasible. Most anonymous guests would hear only about 30s and then get a login prompt, which fails the "keeps playing while they scroll" goal.
- Festly is a commercial product (likely selling invitation websites), so "Play Button may not be used for commercial purposes" and the Policy's "no commercial use for SDAs" plus "no sync with visual media" create real legal risk. The carve-out "embedding ... on Websites that contain advertising" is narrow. A plain link-out or visible "Listen on Spotify" embed as a non-autoplaying extra is the conservative option.
- Hiding the embed (to use it as background audio) would breach "shall not obfuscate".
- Preview-URL-based audio (an `<audio>` element) is not available to new apps and would breach V.2.2 ("only to promote the underlying content") anyway.

### Gaps
- No official Spotify statement on what anonymous visitors hear in embeds (full vs 30s). This relies on third-party and community sources.
- Did not verify current Extended Quota eligibility criteria (the 2025 criteria post was not fetched). Commonly reported as limited to established organizations with large user bases, but unverified here.
- Did not fetch the July 2026 post directly; its details come from a search summary.
- Whether `preview_url` is null in single-track responses for new apps is not stated in the 2024 post summary.

## Deezer (widget, simple API previews, terms)

### Takeaway
The public "simple API" still works without a key as of 2026-10-20 and returns a `preview` MP3 URL (30s clip) on tracks. The widget at widget.deezer.com embeds track/album/playlist/artist/podcast iframes. However, Deezer's developer Terms restrict use to non-commercial, "strictly private use within a family scope," with other uses requiring prior approval. That blocks Festly without a deal.

### Cited Findings
- Live test 2026-10-20: `GET https://api.deezer.com/search?q=perfect%20ed%20sheeran&limit=1` (no auth) returned track `id` 142986206, `title`, `isrc`, `link`, `duration`, artist/picture fields, and `preview: https://cdnt-preview.dzcdn.net/api/1/1/f/...mp3?hdnea=exp=1792511172~...~hmac=...`. The preview URL is a signed, expiring token URL (`exp=` / `hmac=`), so it should be re-fetched rather than stored. — [Deezer API search](https://api.deezer.com/search?q=perfect%20ed%20sheeran&limit=1)
- The developer track doc page notes: "You have to login to accept the terms and conditions of the simple API." — [Deezer developers – track](https://developers.deezer.com/api/track)
- App creation URL `https://developers.deezer.com/myapps/create` returned HTTP 302 (redirect, likely to login) on 2026-10-20. Whether new app registration is open was not confirmed. — [Deezer myapps](https://developers.deezer.com/myapps/create)
- Terms: use is non-commercial — developers "shall not perceive, receive, generate, benefit or create directly or indirectly, any moneys" (IV). "The use of the Content is limited to a strictly private use within a family scope." "the streaming of the recordings is limited to a strictly private use within a family scope" (IV). Full-length playback is limited to "users registered with a Premium+ account", "otherwise accessible only up to 30 seconds" (IV). Other uses "shall be beforehand reviewed and approved by DEEZER" (IX). Developers get "free and unlimited access to the DEEZER Plugins" (widgets and exportable player) (II). No last-updated date. — [Deezer developer Terms of Use](https://developers.deezer.com/termsofuse)
- Widget: embeds Album, Playlist, Track, Artist, Podcast, Episode. Theme, size and tracklist options. The sample iframe grants `encrypted-media; clipboard-write` but not `autoplay`. The page lists no JS control API and no autoplay option. — [Deezer Widget](https://widget.deezer.com/)

### Inferences
- Technically the easiest route to a legal-looking 30s clip without keys. Contractually, Festly (commercial, public) falls outside "strictly private use within a family scope" and the "no moneys" clause, so it would need Deezer's prior approval.
- A 30-second clip doesn't meet "keeps playing while they scroll" unless looped. Looping a preview as background is even further from "promote the underlying content"-style norms.
- The widget has no documented programmatic play, so the guest would tap play inside the widget itself.

### Gaps
- Could not confirm whether Deezer still accepts new developer app registrations in 2026, or any official deprecation notice for the simple API.
- No official doc on what anonymous users hear in the widget (presumably 30s per the terms).
- No date on the Terms of Use. They may be old (Open Deezer era, 2012).

## Apple Music (MusicKit JS, Apple Music API previews, DPLA)

### Takeaway
MusicKit JS exists to let Apple Music subscribers play their subscription. The DPLA bars using MusicKit for "purposes unrelated to facilitating access to Your end users' Apple Music subscriptions", requires user-initiated playback with standard controls and full songs, and says MusicKit Content "cannot be synchronized with any other content." The Catalog API returns 30-second preview URLs with a developer token. Whether preview-only, unauthenticated web use is allowed is officially unanswered (a July 2026 forum question had 0 replies). Not suitable for anonymous guests.

### Cited Findings
- DPLA definitions: "MusicKit JS" means "the JavaScript library that enables Apple Music users to access their subscription through Your Applications, websites, or web applications". "MusicKit APIs" = "the set of APIs that enable Apple Music users to access their subscription through Your Application or as otherwise permitted by Apple in the Documentation." — [Apple Developer Program License Agreement](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- DPLA 3.3.6(D) MusicKit (verbatim): "You agree not to call the MusicKit APIs or use MusicKit JS (or otherwise attempt to gain information through the MusicKit APIs or MusicKit JS) for purposes unrelated to facilitating access to Your end users' Apple Music subscriptions. If You access the MusicKit APIs or MusicKit JS, then You must follow the Apple Music Identity Guidelines. You agree not to require payment for or indirectly monetize access to the Apple Music service (e.g. in-app purchase, advertising, requesting user info) through Your use of the MusicKit APIs, MusicKit JS, or otherwise in any way. In addition: If You choose to offer music playback through the MusicKit APIs or MusicKit JS, full songs must be enabled for playback, and users must initiate playback and be able to navigate playback using standard media controls such as 'play,' 'pause,' and 'skip', and You agree to not misrepresent the functionality of these controls; You may not, and You may not permit Your end users to, download, upload, or modify any MusicKit Content and MusicKit Content cannot be synchronized with any other content, unless otherwise permitted by Apple in the Documentation; You may play MusicKit Content only as rendered by the MusicKit APIs or MusicKit JS and only as permitted in the Documentation (e.g., album art and music-related text from the MusicKit API may not be used separately from music playback or managing playlists); ... You may use MusicKit JS only as a stand-alone library ..." — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- MusicKit on the Web v3 docs (developer.apple.com/musickit/web redirects there) list full-length playback for subscribers, a `previewOnly` mode for non-subscribers, developer tokens, user authorization and autoplay restrictions as topics. Detail text was not retrievable (JS-rendered). — [MusicKit on the Web docs](https://js-cdn.music.apple.com/musickit/v3/docs/index.html)
- Previews: Apple staff on the forums say preview assets are "designed to be DRM free" and playable with standard players. App Store Guideline 5.2.5 (as quoted on the forums) says previews "may not be used for their entertainment value" (e.g., game soundtrack). — [Apple Dev Forums 685311](https://developer.apple.com/forums/thread/685311); [Apple Dev Forums 848839](https://developer.apple.com/forums/thread/848839)
- A July 2026 forum question asks whether preview-only playback (developer token only, `previews[].url` in an `<audio>` element, free web game) is permitted. It has 0 replies. — [Apple Dev Forums 836910](https://developer.apple.com/forums/thread/836910)

### Inferences
- Full-track background music for anonymous guests is impossible: it needs each guest to sign in with an Apple Music subscription, and "users must initiate playback ... with standard media controls".
- Looping 30s previews as ambient invitation music is "entertainment value" use unrelated to facilitating Apple Music subscriptions. It is likely non-compliant with 3.3.6(D) and the spirit of 5.2.5. The ban on synchronizing with "any other content" also cuts against pairing it with an animated invitation.
- Apple metadata (title/artwork) "may not be used separately from music playback", so even storing and displaying Apple artwork for a song card is restricted.

### Gaps
- No official Apple answer on preview-only unauthenticated web use.
- MusicKit v3 doc detail (previewOnly semantics, autoplay) couldn't be fetched as text.
- The Apple Music Identity Guidelines' current official page was not fetched.

