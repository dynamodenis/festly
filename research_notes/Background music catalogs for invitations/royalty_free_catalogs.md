# Royalty-free / CC / licensed-library music catalogs for Festly background music (as of 2026-10-20)

Method note: I checked primary sources where they loaded, and called the live APIs on 2026-10-20 (Audius search and stream; Openverse `/v1/audio/stats/`). Some official pages render only with JavaScript (Audius API Terms, docs.audius.co API reference) and could not be read. They are listed as gaps. Figures attributed to third-party aggregators are marked as unverified.

## Q1. Audius: API access, delivery, licence and terms for commercial third-party streaming

### Takeaway
Audius has an open REST API. A live search worked with only an `app_name` query parameter, and its `/stream` endpoint redirects to a signed, time-stamped MP3 URL on a content node, which fits a plain HTML `<audio>` element. Legally, tracks are API-accessible by default under the Audius Open Music License (OML). The OML lets "Music Players" stream tracks, and any commercial use requires attribution (artist, copyright notice, OML notice, link). However, many tracks carry an "All rights reserved" licence field, and the separate API Terms could not be read. So whether Festly can use Audius commercially is plausible but not confirmed.

### Cited Findings
- Live call `GET https://api.audius.co/v1/tracks/search?query=wedding%20piano&app_name=festly_research` returned JSON with no API key. Fields included `id`, `title`, `duration`, `genre`, `mood`, `license`, `is_streamable`, `is_stream_gated`, `allowed_api_keys`, `artwork` (CDN URLs) and `permalink`. — [Audius API live response](https://api.audius.co/v1/tracks/search?query=wedding%20piano&app_name=festly_research) (fetched 2026-10-20)
- In a live sample of 50 results for "wedding", the `license` field was `None` for 28 tracks, `"All rights reserved"` for 21 and `"Attribution CC BY"` for 1. Per-track licence metadata is therefore mostly empty or "All rights reserved". — [Audius API live response](https://api.audius.co/v1/tracks/search?query=wedding&app_name=festly_research&limit=50)
- Live `HEAD https://api.audius.co/v1/tracks/9bmzA/stream?app_name=festly_research` returned `HTTP/2 302` to `https://creatornode.audius.co/tracks/cidstream/<CID>?signature={...timestamp...}&skip_play_count=true`. The resolved URL is signed and time-stamped, so Festly should store the stable `/v1/tracks/{id}/stream` URL (or just the id), not the redirect target. — [Audius API live response](https://api.audius.co/v1/tracks/9bmzA/stream?app_name=festly_research)
- The SDK README lists a Free plan with a "10 requests/second" limit and "500,000 monthly requests", plus an Unlimited plan, with higher limits via api@audius.co. This comes from the SDK README on a jsDelivr mirror and is not verified on docs.audius.co. — [@audius/sdk README v15.3.1](https://cdn.jsdelivr.net/npm/@audius/sdk@15.3.1/README.md)
- Audius Terms of Use, "Last Updated: October 5, 2025": "By default, Content you upload to the Audius Service is made available to third-party services via the Audius API and is subject to the Open Music License. You may opt out of making your Content available to third-party services via the Audius API by disabling the API access using the toggle in your Audius settings…" — [Audius Terms of Use PDF](https://audius.co/documents/TermsOfUse.pdf)
- Terms of Use: "ANY THIRD PARTY SERVICE THAT SUBSEQUENTLY LINKS TO THE AUDIUS PROTOCOL WILL BE ABLE TO ACCESS AND USE SUCH CONTENT OUTSIDE OF THE AUDIUS SERVICE … AND THAT SUCH USE WILL NOT BE GOVERNED BY THE TERMS OF USE, BUT RATHER THE API TERMS AND THE OPEN MUSIC LICENSE" — [Audius Terms of Use PDF](https://audius.co/documents/TermsOfUse.pdf)
- Audius Open Music License, "Last Updated: 2 July, 2025", §1.2: "Licensor hereby grants to Music Players a worldwide, non-exclusive, royalty-free, perpetual, irrevocable right and license, with the right to sublicense, to reproduce, publicly perform, distribute, electronically or digitally transmit, stream, and otherwise use in whole or part, the Licensed Material, in connection with a Music Player's services." "Music Players" are defined as "developers creating or operating software applications designed to play back audio files on the Audius Protocol". — [Audius Open Music License](http://audius.org/open-music-license.pdf)
- OML §1.3 (Alternative License): an artist publishing under a separate licence "must provide a URI to such Alternative License in the human readable field in a JSON object linked to the Licensed Material." — [Audius OML](http://audius.org/open-music-license.pdf)
- OML §1.5, Attribution: "If a Licensee licenses the Licensed Material for commercial purposes, the Licensee must retain the following: a) identification of the Licensor (including by pseudonym if designated) … b) a copyright notice reflecting the copyright owner … c) a notice that refers to this OML; d) a URI or hyperlink to the Licensed Material to the extent reasonably practicable; e) If requested by the Licensor, Licensee must remove any of the information required by Section 1.5(a)…" — [Audius OML](http://audius.org/open-music-license.pdf)
- OML §3.1: "if a Licensee fails to comply with this OML with respect to a specific Licensed Material, then its rights to such Licensed Material under this OML terminate automatically" (reinstated if cured within 30 days, §3.2). — [Audius OML](http://audius.org/open-music-license.pdf)
- The Audius blog says new API Terms govern developer use of the API, and the OML "governs the use of your tracks via Audius' API in apps, games and other 3rd party services". It also says "Tracks are API-accessible unless you opt out in your settings." — [Audius blog: Terms of Service Update](https://blog.audius.co/posts/audius-terms-of-service-update)
- The Terms of Use PDF links the API Terms at https://audius.co/legal/api-terms. That page is a JavaScript single-page app and returned no readable text to a non-browser fetch. — [Audius Terms of Use PDF](https://audius.co/documents/TermsOfUse.pdf)

### Inferences
- Under the OML, Festly would likely count as a "Music Player" (software that plays back Audius audio). The OML grants streaming rights and says nothing to rule out commercial operators, so commercial streaming with OML attribution looks permitted. This is an inference from the licence text, not legal advice.
- The `license` field in track metadata ("All rights reserved") may be the artist's general label and not an "Alternative License" under OML §1.3. How the two interact for API consumers is unclear. A conservative build filters out stream-gated tracks (`is_stream_gated`) and tracks restricted by `allowed_api_keys`, re-checks `is_streamable`/`is_available` at play time, and shows the OML attribution.
- The OML does not grant permission to copy files into R2 in so many words. "reproduce … distribute" in §1.2 arguably covers it, but caching works against the artist opt-out mechanism. Streaming via the `/stream` endpoint is the safer pattern.
- Content quality and suitability for weddings varies: the catalogue is user-uploaded, mostly electronic and hip-hop, and includes explicit tracks.

### Gaps
- I could not read the API Terms text (audius.co/legal/api-terms is JS-only) or the official rate limits and API-key/app-name requirements on docs.audius.co (also JS-rendered). Whether `app_name` alone remains acceptable or an API key is now required for new apps is unconfirmed. In the live test, `app_name` alone worked.
- Total catalogue size is unverified.

## Q2. Openverse audio: providers, music vs sound effects, filters, URL field, rate limits and terms

### Takeaway
Openverse aggregates about 5.2 million audio items from only three sources: Wikimedia Commons, Jamendo and Freesound. ccMixter is absent from the live stats. Wikimedia (about 4M) and Freesound (about 0.6M) are mostly not music, so Jamendo (about 645k) is the real music source. A live audio search timed out during testing. Openverse also disclaims licence accuracy, and its rate limits are designed for low-volume use. It suits a search UI but is not the strongest production dependency for playback.

### Cited Findings
- Live `GET https://api.openverse.org/v1/audio/stats/` (2026-10-20) returned `jamendo` (Jamendo) media_count 644,709, `wikimedia_audio` (Wikimedia Commons) 3,983,517 and `freesound` (Freesound) 591,897. No ccMixter or FMA source was listed. — [Openverse audio stats](https://api.openverse.org/v1/audio/stats/)
- Live `GET https://api.openverse.org/v1/audio/?q=...&license_type=commercial&category=music` returned an empty body, and a repeat request timed out after more than 40 s (HTTP 000) on 2026-10-20. Availability or latency is therefore a concern, which could be transient. — live test
- "All Openverse content is under a Creative Commons license or is in the public domain." "Openverse cannot make any claims about the accuracy of license information." Users "should always verify the license of a particular work before using it." — [Openverse docs](https://docs.openverse.org/api/reference/made_with_ov.html)
- Rate limits: "Anonymous requests should be sufficient for most users. Registered users are automatically granted slightly higher limits. … Further increases to rate limits are available upon request." Registration issues a client_id and client_secret for OAuth2, and exceeding the limit returns "429: Too Many Requests". These quotes come via aggregators that mirror the Openverse API description. — [apis.io Openverse auth API](https://apis.io/apis/openverse/openverse-auth-api/); [Jentic Openverse](https://jentic.com/apis/openverse)
- An npm README lists anonymous limits of 100/day and 5/hour, and authenticated limits of 10,000/day and 100/minute. This is unofficial and unverified. — [mcp-openverse npm](https://www.npmjs.com/package/mcp-openverse)
- Openverse has acted against "out of terms" API usage, and its ToS prohibit scraping and circumventing rate limits, for example by using multiple machines. — [make.wordpress.org: mitigating out of terms API usage (2022)](https://make.wordpress.org/openverse/2022/06/17/mitigating-out-of-terms-api-usage/)

### Inferences
- With `category=music` and `license_type=commercial` (excludes NC), results would come almost entirely from Jamendo. Calling Jamendo directly gives better metadata, but Jamendo's own API terms restrict commercial use (see Q3). Openverse does not change the underlying CC licence terms. CC BY and CC BY-SA tracks still need attribution, and CC BY-ND is fine for unmodified background playback.
- From my prior knowledge of the API schema, not re-verified live: the result `url` field points at the provider-hosted file (for example a Jamendo MP3 or a Freesound preview), and results include `license`, `license_version`, `license_url`, `attribution`, `creator`, `foreign_landing_url`, `duration` and `category`. The `url` is a third-party host, so hotlinking depends on that provider's terms.
- Most Wikimedia audio is likely pronunciation clips, spoken word and historical recordings, not background music. This is an inference that has not been measured.

### Gaps
- Official current rate-limit numbers and the full Openverse Terms of Service text were not retrieved; the API docs are JS-rendered.
- Live search was not reproducible during this session, so result quality for "wedding" or "piano" music was not tested.

## Q3. Jamendo: developer API, free non-commercial tier, commercial path

### Takeaway
Jamendo's API is free only for non-commercial apps (35,000 requests/month), and any commercial use requires contacting Jamendo. It also requires credit and a backlink per track and forbids apps designed to cache content. A commercial web app like Festly cannot use the free tier as-is. The Jamendo Licensing catalogue sells per-project sync licences, a model built for single creators and not for a platform letting many end users pick tracks.

### Cited Findings
- Developer portal: Non-Commercial Apps plan, "Access our whole library", "Up to 35,000 API requests per month". It also advertises "Monetize your app", without stated terms. — [Jamendo developer portal v3.0](https://developer.jamendo.com/v3.0)
- API Terms of Use: "The API may be used freely for non-commercial uses." "Commercial use shall be understood as any use that is intended for or directed toward commercial advantage". Commercial use requires contacting Jamendo ("For any other type of use including but not limited to commercial uses"), and JAMENDO may charge for API use in future. — [Jamendo API Terms of Use](https://devportal.jamendo.com/api_terms_of_use)
- Attribution: the app must credit "the JAMENDO Members as the creators of the Content" and "provide a direct backlink from each Content in the Application to the relevant Content's page". — [Jamendo API Terms](https://devportal.jamendo.com/api_terms_of_use)
- Caching: "Applications must not be specifically designed to cache the content nor offering an offline access to the content." "Caching system may only be used to the extent reasonably necessary for the operation of the Application." — [Jamendo API Terms](https://devportal.jamendo.com/api_terms_of_use)
- "These Terms of Use were last modified on September 17, 2013." — [Jamendo API Terms](https://devportal.jamendo.com/api_terms_of_use)
- Every Jamendo CC licence includes BY (credit to the artist and a link to the licence). NC tracks "cannot be used for commercial purposes". — [Jamendo artist support: Creative Commons explained](https://support-artist.jamendo.com/creative-commons-explained)
- Jamendo Licensing individual licences are "a one-off purchase for one of the tracks featured on our website, linked to a single project". — [Jamendo Licensing: individual licenses](https://support-licensing.jamendo.com/individual-licenses)

### Inferences
- Festly would need a negotiated commercial API agreement with Jamendo. Even with one, CC BY-NC tracks probably can't be played on a commercial site without a Jamendo Licensing deal, and many Jamendo tracks are NC.
- Copying files to R2 conflicts with the "must not be specifically designed to cache" clause.

### Gaps
- No public commercial or "platform" price for the Jamendo API was found, and individual licence prices were not retrieved. The track `audio` field (streaming MP3 URL) format was not verified in this session.

## Q4. Free Music Archive and ccMixter

### Takeaway
I found no evidence of a current public FMA API. FMA nearly shut down in 2018 and later changed owners. Nothing current on a ccMixter API was found, and ccMixter is not among Openverse's audio sources. Neither looks like a dependable 2026 integration target.

### Cited Findings
- FMA announced its shutdown in November 2018 because of funding problems. — [TechRadar](https://www.techradar.com/news/the-free-music-archive-is-shutting-down-due-to-lack-of-funds)
- Reports conflict on the later owner. One says KitSplit took over FMA ([Spin](https://www.spin.com/?p=309866)); another says "In September 2019, Free Music Archive was acquired by Tribe of Noise" ([OfiLibre URJC](https://ofilibre.urjc.es/en/blog/free-music-archive/)).
- Openverse's live audio sources do not include ccMixter or FMA. — [Openverse audio stats](https://api.openverse.org/v1/audio/stats/)

### Gaps
- FMA API status for 2025-2026 and the ccMixter query API (historically `ccmixter.org/api/query`) could not be verified from primary sources in this session.

## Q5. Pixabay Music: API and licence for use in an app or website

### Takeaway
The official Pixabay API has no music or audio endpoint, only images (`/api/`) and videos (`/api/videos/`). The Content License allows free commercial use without attribution, but it bans standalone distribution, replicating a competing service and systematic copying. A Festly feature that lets hosts browse Pixabay's music catalogue would need scraping (prohibited) or a hand-curated set of downloaded tracks stored in R2.

### Cited Findings
- The Pixabay API docs link only `https://pixabay.com/api/` (images) and `https://pixabay.com/api/videos/` (videos). — [Pixabay API docs](https://pixabay.com/api/docs/) (fetched 2026-10-20)
- API rules: "By default, you can make up to 100 requests per 60 seconds." "requests must be cached for 24 hours." "Systematic mass downloads are not allowed." "permanent hotlinking of images (using Pixabay URLs in your app) is not allowed. If you intend to use the images, please download them to your server first." — [Pixabay API docs](https://pixabay.com/api/docs/)
- Licence summary: "Use Content for free"; "Use Content without having to attribute the author"; "You cannot sell or distribute Content (either in digital or physical form) on a Standalone basis." "Standalone means where no creative effort has been applied to the Content". — [Pixabay License summary](https://pixabay.com/service/license-summary/)
- Terms: "Audio" includes music, sounds and sound effects. Section 7A says "This includes the right to redistribute the Content under the Content License." Section 8: users may not "use or compile any Content to replicate a similar or competing service"; "Bulk, large-scale or systematic copying of Content is strictly prohibited"; and no "Data mining, extraction, scraping…". — [Pixabay Terms of Service](https://pixabay.com/service/terms/)
- The Pixabay FAQ advises keeping download records and linking to the licence when disputing claims, for example Content ID claims on music. — [Pixabay FAQ](https://pixabay.com/service/faq/)

### Inferences
- Playing a Pixabay track behind an invitation page combines it with a creative work, which arguably is not "Standalone". Exposing a big searchable Pixabay music library inside Festly risks the "competing service" and "systematic copying" clauses. A small curated set (for example 30 to 100 tracks downloaded manually and stored in R2) is the lowest-risk use.
- Pixabay audio URLs are not offered via API, and the API docs forbid permanent hotlinking for images. By analogy, music should be self-hosted in R2.

### Gaps
- No music-specific clause on apps or platforms was found.

## Q6. Commercial licensed libraries and AI music: Epidemic Sound, Artlist, Uppbeat, Soundstripe, Musicbed, Mubert, Beatoven, Soundraw

### Takeaway
Only Epidemic Sound (licensed library) and Mubert (AI) publicly advertise APIs with sublicensing to end users of a platform. Epidemic has a self-serve free prototyping tier with partner pricing not published. Mubert's sublicensing starts at $499/mo. Soundraw's API is reportedly $300/mo for 1,000 songs. For Artlist, Uppbeat, Soundstripe and Musicbed I found no public in-app streaming API.

### Cited Findings
- Epidemic Sound developer API targets "video editing software, AI content tools, social apps, podcast platforms, games". A free tier offers "Full catalog access for prototyping and evaluation". "Sublicensing for users is supported". Safelisted content is "licensed globally, forever". Sign-up is self-serve with no contract or card. — [Epidemic Sound for developers](https://www.epidemicsound.com/business/developers/)
- A February 2026 trade report says the Epidemic API lets third-party platforms "integrate the company's licensed music and sound effects catalog directly into their products". — [Net Influencer](https://www.netinfluencer.com/epidemic-sound-launches-api-to-embed-ai-powered-music-licensing-into-third-party-platforms/)
- A third-party aggregator says the partner-level API is "priced via custom commercial agreements". This is unverified. — [apis.io Epidemic plans](https://apis.io/plans/epidemic-sound/epidemic-sound-plans-pricing/)
- Mubert API: generation from text, image, BPM and genre, plus "Infinite music streams" over WebRTC. Plans: Trial $49/mo (sale price, list $99; 100 tracks and 100 streaming minutes), Startup $199/mo (5,000 tracks and minutes, monetized content), Startup+ $499/mo (30,000; adds "sublicensing"), and Custom via business@mubert.com. The site footer says music on mubert.com domains is "licensed by Mubert® Inc only for personal use", so the terms need confirming. — [Mubert API](https://mubert.com/api)
- Soundraw API: "integrate our royalty-free music engine directly into your own platform or software". Starter Plan $300/month for up to 1,000 songs with a 6-month minimum. This comes from a help centre on a third-party host and may be dated. — [Soundraw FAQ: API](https://docs.channel.io/soundraw-faq/en/articles/SOUNDRAW-API-fbf580fd)
- Beatoven.ai offers a public REST Composition API (public-api.beatoven.ai, Python SDK). No API price was found; consumer plans are about $10 to $20/mo. This comes from aggregators and is unverified. — [costbench Beatoven](https://costbench.com/software/ai-music-apis/beatoven-ai/); [API Evangelist Beatoven](https://providers.apievangelist.com/providers/beatoven/)
- Soundstripe consumer and business pricing (for example "$299 per quarter or $999 per year" business) appears in comparisons; no API information was found. — [The Post Flow comparison](https://thepostflow.com/post-production/video-editing/music-subscriptions-compared/)

### Inferences
- For Festly, Epidemic Sound is the most credible "licensed library with an API and end-user sublicensing" option. Pricing needs a sales conversation once past the prototype tier.
- With AI generators (Mubert, Soundraw, Beatoven), Festly can generate tracks once and store them in R2, if the plan grants distribution or sublicensing rights. Mubert's lower tiers exclude sublicensing.

### Gaps
- Artlist, Uppbeat, Musicbed: no primary-source information on APIs or platform licensing was retrieved. They are believed to be creator-subscription licences only, but this is unverified.
- Soundstripe API: a Soundstripe API existed in prior years per my background knowledge, but its 2026 status and pricing were not verified.
- Epidemic API paid-tier pricing and whether it permits playback on public web pages (as opposed to inside rendered videos) were not verified.

## Q7. Incompetech (Kevin MacLeod) and YouTube Audio Library

### Takeaway
Incompetech offers its music free under Creative Commons with required credit, or under a paid Standard License with no attribution. There is no API. Festly could download selected tracks into R2 and show the credit line. YouTube's Audio Library is framed for YouTube videos. Its help page disclaims anything off-platform and requires CC credit in the video description, so it should not be relied on for a web app.

### Cited Findings
- Incompetech licences: Creative Commons, "No charge. Requires that you credit the music." Standard License "For projects where attribution is not wanted or is impossible (radio/TV ads, corporate presentations, on-hold music, etc.)", paid via PayPal; price not shown. — [Incompetech licenses](https://incompetech.com/music/royalty-free/licenses/)
- YouTube Help: "YouTube can't give legal guidance, including guidance on issues with music that can occur off the platform." "If you're using a track with a Creative Commons license, you must credit the artist in your video's description." — [YouTube Help: Audio Library](https://support.google.com/youtube/answer/3376882)

### Inferences
- Incompetech is CC BY (version believed to be 4.0, not confirmed on the fetched page). Self-hosting in R2 with on-page credit, for example "Title by Kevin MacLeod (incompetech.com), Licensed under CC BY 4.0", is permitted by CC BY. CC BY allows redistribution, and Festly would not need to hotlink.
- YouTube Audio Library: no off-YouTube grant was found, so treat it as unusable for Festly.

### Gaps
- Incompetech Standard License price, exact CC version text, and catalogue size were not retrieved. Incompetech has no API, so search would rely on a manually curated list.
- No YouTube Audio Library terms granting off-platform use were found.
