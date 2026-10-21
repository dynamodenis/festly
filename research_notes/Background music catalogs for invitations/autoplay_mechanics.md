# Autoplay mechanics: starting background music from one "Open invitation" tap (mobile, as of Oct 2026)

Research date: 2026-10-20. Many of the primary policy documents are old (2016–2023) but still current; the notes flag where a 2026 status could not be confirmed. Not tested on devices. Every claim below comes from the cited sources.

## Q1. Current autoplay policies (Chrome, WebKit/Safari, Firefox), what counts as user activation, and how long transient activation lasts

### Takeaway
Every major engine lets audible `<audio>`/`<video>` playback start when `play()` is called during a real user gesture (a tap or click) in the same document. Without a gesture, Chrome permits it only after the user has interacted with the site, through MEI (desktop only), or for an installed PWA. Safari requires a gesture for each element. The safest design calls `audio.play()` synchronously inside the "Open invitation" click handler.

### Cited Findings
**Chrome**
- The policy launched in Chrome 66 (April 2018) for media elements and was extended to the Web Audio API in Chrome 71. Muted autoplay is always allowed. Autoplay with sound needs at least one of: the user interacted with the domain (click or tap), the MEI threshold was crossed (desktop only), or the site was added to the home screen (mobile) or installed as a PWA (desktop). — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- MEI is a per-origin ratio of visits to significant playbacks. A playback counts as significant only if it lasts more than 7 s, is unmuted, plays in the active tab, and the element is larger than 200x140. MEI only grants autoplay on desktop, so first-time mobile guests get nothing from it. — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- When autoplay is not allowed, `play()` rejects with `NotAllowedError`. Chrome recommends listening for that rejection and showing a play button. Chrome also says to use `"click"` as the activation event, because activation events are not consistent across browsers. — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- For Web Audio, create or `resume()` the AudioContext after a gesture. `state === "suspended"` means it was blocked. — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- User Activation v2 shipped in Chrome 72 (blog updated 2019-01-14). It keeps a *transient* bit, reset "after an expiry interval (about a second)" or when an API consumes it, and a *sticky* bit that is never reset for the frame's lifetime. — [Chrome: Making user activation consistent](https://developer.chrome.com/blog/user-activation)
- **Conflict on duration:** the 2019 Chrome blog says "about a second", but current Chromium source defines `kActivationLifespan = base::Seconds(5)` (60 s only in MemorySanitizer builds). — [Chromium user_activation_state.h](https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/public/common/frame/user_activation_state.h). The source code is more authoritative, so Chrome's current window is 5 s.

**HTML spec and MDN (user activation)**
- An activation-triggering event must be trusted (`isTrusted`). The qualifying events are `keydown` (excluding Esc and some reserved keys), `mousedown`, `pointerdown` with a mouse, `pointerup` with a non-mouse pointer, and `touchend`. *Transient* activation (`navigator.userActivation.isActive`) expires after a timeout and some APIs consume it. *Sticky* activation (`hasBeenActive`) lasts for the rest of the session. MDN lists autoplay of media and Web Audio among the features gated on sticky activation. — [MDN User activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation)
- The spec leaves the transient activation duration to the user agent, saying it is "expected be at most a few seconds". — [HTML spec §6.4](https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation)

**WebKit / Safari**
- Safari 11 (WebKit blog, 2017-06-08): assume "any use of `<video>` or `<audio>` requires a user gesture click to play". `play()` returns a promise, and a rejection means playback was blocked, so the page should show a play control. Permission applies per element, so to play tracks in sequence, change one element's `src` instead of creating new elements. — [WebKit: Auto-Play Policy Changes for macOS](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)
- iOS 10 (2016): muted videos, and videos with no audio track, may autoplay. Playback pauses if the element is unmuted or gains audio without a gesture. Autoplay waits until the element is visible. `playsinline` keeps video inline on iPhone; without it, iPhone video goes fullscreen. — [WebKit: New `<video>` Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/)
- Apple docs, quoted on Stack Overflow: "embedded media cannot be played automatically in Safari on iOS — the user always initiates playback." — [SO answer via search](https://backiee.wasmer.app/http_Stackoverflow_com/a/74561036) (quote of older Apple documentation; date unclear)
- WebKit's User Activation API post (2023-02-15, Safari TP 160) says the transient window is "a few seconds, maybe" and that engines choose their own value. — [WebKit: The User Activation API](https://webkit.org/blog/13862/the-user-activation-api/)

**Firefox**
- Firefox prefs: `media.autoplay.default` (0 = allow, 1 = block, 2 = prompt); `media.autoplay.block-webaudio` = true (AudioContext plays only after sticky activation); `media.block-autoplay-until-in-foreground` = true. Firefox also supports `navigator.getAutoplayPolicy("mediaelement" | "audiocontext")`, which returns `allowed`, `allowed-muted` or `disallowed`. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- MDN gives no support table for `getAutoplayPolicy`, so the notes treat it as not available everywhere and do not rely on it. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

### Inferences
- A tap on the cover is a valid gesture in every engine, so `audio.play()` called synchronously in that handler should succeed everywhere. Any `await` or network fetch before `play()` risks the gesture expiring, especially in Safari, where the window is short and unspecified.
- Firefox only blocks Web Audio until sticky activation, so after the first tap even later programmatic `play()` calls are likely allowed. Safari's per-element model is stricter: keep a single `Audio` element for the whole visit.

### Gaps
- WebKit's exact transient activation duration is not published.
- No 2025–2026 WebKit post restating the iOS autoplay rules was found. The 2016/2017 rules are assumed to still apply.
- No authoritative support matrix for `navigator.getAutoplayPolicy` was found (as of the research date it is believed to be Firefox-only; unverified).

## Q2. Does a parent-page tap let a cross-origin iframe player (SoundCloud, YouTube, Spotify) start audio via postMessage? allow="autoplay" on iOS?

### Takeaway
Only partly, and not on iOS. postMessage does not carry user activation into a cross-origin child. Under the spec and in WebKit, activation flows up to ancestor frames and across to same-origin frames, never down into a cross-origin iframe. Chrome can instead delegate autoplay to the iframe through `allow="autoplay"` once the top frame has autoplay permission, so Android Chrome is likely to work. WebKit has said it does not honor `allow="autoplay"`, so on iOS Safari, starting a SoundCloud, YouTube or Spotify embed from the parent's tap is unreliable to broken. The Capability Delegation proposal does not cover autoplay.

### Cited Findings
- HTML spec activation notification: the activated document's window, **all ancestor** windows, and **only same-origin descendant** windows get the activation timestamp. The spec defines no way for postMessage to propagate activation. — [HTML spec §6.4.2](https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation)
- Chrome 72: an interaction in a frame activates "all containing frames (and only those frames) regardless of their origin". The blog's example is a click in a *child* frame that lets the *parent* open a popup. A temporary workaround also extended activation to same-origin frames. — [Chrome: user activation](https://developer.chrome.com/blog/user-activation)
- WebKit (2023-02-15): "cross-origin iframes will not have transient activation" until the user activates an element *inside* them. — [WebKit: The User Activation API](https://webkit.org/blog/13862/the-user-activation-api/)
- Capability Delegation (WICG Draft CG Report, 2023-02-17, editor Mustaq Ahmed): `postMessage(msg, {targetOrigin, delegate: "<feature>"})` consumes the sender's transient activation and passes one capability to the iframe. Only **payment**, **fullscreen** and **display-capture** are defined, and autoplay/media is not included. The document is not on the W3C standards track. — [WICG Capability Delegation spec](https://wicg.github.io/capability-delegation/spec.html)
- Chrome: "A top frame that has received autoplay permission can delegate it to cross-origin iframes using `allow="autoplay"`". Same-origin iframes have it by default. Without the permission, `play()` rejects with `NotAllowedError`. The old `gesture=media` attribute is not supported. — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- MDN: the `autoplay` Permissions Policy defaults to `self`, and the iframe `allow` attribute accepts values such as `allow="autoplay"` and `allow="autoplay 'src' https://..."`. MDN marks the directive experimental. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay); [MDN Permissions-Policy: autoplay](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/autoplay)
- **WebKit bug 190794** (filed 2018-10-22, iOS 12; status still NEW/unresolved): an iframe added on click with `allow="autoplay"` does not play sound. Jer Noble (Apple, 2018-10-24) said "we do not honor that attribute". He suspects the iframe loads asynchronously, so its video is not created within the gesture, and adds "it's surprising that this ever worked, and I don't anticipate that we will fix this." — [WebKit Bugzilla 190794](https://bugs.webkit.org/show_bug.cgi?id=190794)
- YouTube IFrame API docs: browsers can block "unmuted playback without user interaction", and `playVideo()` is listed as a call that can be blocked. The newer `onAutoplayBlocked` event "fires any time the browser blocks autoplay or scripted video playback". The sample uses `playerVars: { playsinline: 1 }`. — [YouTube IFrame API reference](https://developers.google.com/youtube/iframe_api_reference)
- Community reports for iOS: `playVideo()`/`loadVideoById()` "will not work in many mobile environments". One workaround is `mute=1` + `playsinline=1`, but that plays silently and does not help with music. — [SO answer (mirror)](https://backiee.wasmer.app/http_Stackoverflow_com/a/74561036); Ionic forum, iOS embed, undated (around 2017): play did nothing until the user tapped inside the iframe (on the YouTube watermark) — [Ionic forum](https://forum.ionicframework.com/t/embed-youtube-video-wont-play-ios/112289)
- SoundCloud widget: a widget API test page reports `widget.play()` works on a laptop but "fails to start the song on the iPhone (iOS 6)". This is old, but it is the same mechanism. On XenForo forums (2020 thread), the mobile embed's play button stayed inactive until the user tapped SoundCloud's own "Listen in browser" link. No official SoundCloud statement on mobile programmatic play was found. — [SoundCloud widget test page](https://mrcoles.com/media/test2/soundcloud/); [XenForo thread](https://www.xenforo.com/community/threads/soundcloud-embed-on-mobile-has-annoying-link-to-app-and-play-button-not-working.183013)
- Spotify iFrame API docs: the `play` method "might not be supported in all browsers", and Safari blocks autoplay without user interaction. `resume()`/`togglePlay()` are documented alternatives. Community threads (around 2023–2024) report `play()` silently failing. — [Spotify iFrame API reference](https://developer.spotify.com/documentation/embeds/references/iframe-api); [Spotify community thread](https://community.spotify.com/t5/Spotify-for-Developers/Iframe-embedcontroller-play-broken/m-p/5821417). Spotify embeds also play only 30 s previews to users who are not logged in (general knowledge; not verified in this session).

### Inferences
- **Android Chrome:** after the cover tap, the top frame has sticky activation, so autoplay is permitted. With `allow="autoplay"` on the iframe, a postMessage-triggered `play()` inside a SoundCloud or YouTube iframe should be permitted by Chrome's delegation. This is likely to work, but the player must already be loaded and ready.
- **iOS Safari:** the iframe gets no activation, and `allow="autoplay"` is ignored according to the 2018 WebKit statement, with no evidence of change found through 2026. A parent-tap-to-iframe-play flow is therefore expected to fail or behave inconsistently. Only a tap *inside* the iframe reliably starts it. A cross-origin iframe player is not a sound basis for "one tap starts the music" on iPhone.
- Building the iframe inside the tap handler is worse still, because loading is asynchronous and the gesture will have expired by the time the player is ready (the cause Jer Noble describes).

### Gaps
- No 2024–2026 dated reproduction of SoundCloud `widget.play()` or YouTube `playVideo()` triggered from a parent tap on iOS 17/18/26 was found. The conclusion comes from WebKit's stated policy and older reports.
- WebKit's current (2026) position on `allow="autoplay"` was not confirmed; the only explicit statement is from 2018. No MDN browser-compat row for Safari loaded.
- It was not verified whether YouTube's `onAutoplayBlocked` fires reliably on iOS.

## Q3. HTMLAudioElement specifics: play() promise, unlocking, cross-origin, HLS, Media Session, background/locked behaviour

### Takeaway
A same-document `<audio>` element, with `play()` called synchronously in the tap, is the reliable path on both platforms. Plain cross-origin MP3/AAC playback needs no CORS; CORS matters only if the audio goes through Web Audio. Safari plays HLS natively, other browsers need hls.js/MSE, and iPhone gained ManagedMediaSource in iOS 17.1. Background and lock-screen playback on iOS has had regressions, so treat it as best effort.

### Cited Findings
- `play()` returns a promise. Handle `NotAllowedError` by showing a play button, and do not show a pause UI until playback has actually started. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay); [WebKit autoplay policy](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)
- The "unlock" pattern: call `play()` (optionally followed immediately by `pause()`) on the *same* element inside a click handler, and later `play()` calls on that element are allowed. The Spotify SDK thread notes that resuming an AudioContext alone does not unlock an HTMLMediaElement. — community reports summarised in [wisej answer](https://wisej.com/support/answers/11010) and [Spotify community thread](https://community.spotify.com/t5/Spotify-for-Developers/Web-Playback-SDK-Playing-song-directly-in-browser-issues-IOS/m-p/5540415/highlight/true) (community sources, undated or around 2023)
- WebKit grants autoplay permission per element, so keep one element and swap `src` for later tracks. — [WebKit autoplay policy](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)
- Chrome triggering `.click()` on another element from script did not carry the gesture on iOS (forum thread). — [SitePoint thread](https://www.sitepoint.com/community/t/handling-click-in-the-safari-browser/417837)
- HLS: ManagedMediaSource reached iPhone in Safari 17.1 (2023-10-25), after Safari 17.0 on iPad and Mac. hls.js has used it since 1.5 (2024). Native HLS is still preferred on Apple devices. One unverified claim says MMS on iPhone requires an AirPlay alternative source or `disableRemotePlayback`. — [Radiant Media Player blog](https://radiantmediaplayer.com/blog/at-last-safari-17.1-now-brings-the-new-managed-media-source-api-to-iphone.html); [DEV tutorial hls.js 1.6.13 on iOS](https://dev.to/masonwritescode/playing-hls-through-managed-media-source-on-iphone-with-hlsjs-3cn8); [Forasoft](https://www.forasoft.com/learn/video-streaming/glossary/terms-streaming/managed-media-source)
- Media Session on iOS: lock-screen artwork was fixed in iOS 16.4 (2023-03). Lock-screen controls appear only when a real HTML5 audio element is playing. — [dbushell.com 2023-03-20](https://dbushell.com/2023/03/20/ios-pwa-media-session-api/); [Capacitor/Ionic forum](https://forum.ionicframework.com/t/audio-in-the-background-for-ionic-capacitor-app/234073)
- Background audio on iOS: WebKit bug 261554 says background HTML5 audio broke in iOS 17, was fixed in 17.1, and regressed again. A commenter in February 2024 said it was still present on 17.3.1. — [WebKit Bugzilla 261554](https://bugs.webkit.org/show_bug.cgi?id=261554)
- An older bug (2021, iOS 15): with the screen locked, playback stopped at the end of the first track. It is marked fixed. — [WebKit Bugzilla 229688](https://bugs.webkit.org/show_bug.cgi?id=229688)
- Audio Session API (`navigator.audioSession.type`): the types are `auto`, `playback`, `transient`, `transient-solo`, `ambient` and `play-and-record`. `playback` is meant for music and does not mix with other audio; `ambient` mixes. — [W3C Audio Session WD](https://www.w3.org/TR/audio-session/); [MDN AudioSession.type](https://developer.mozilla.org/docs/Web/API/AudioSession/type)
- In WebKit bug 264473 (Safari 17/iOS 17, closed as INVALID), audio went silent when the type was `transient`; a later comment says the same on iOS 18. — [WebKit Bugzilla 264473](https://bugs.webkit.org/show_bug.cgi?id=264473)
- Safari stops silent autoplaying video in background tabs. Firefox blocks autoplay in background tabs until they are foregrounded. — [WebKit autoplay policy](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/); [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

### Inferences
- Cross-origin `src` on `<audio>` plays without CORS (a standard media-element behaviour; no source fetched in this session). `crossorigin` plus CORS headers are needed only to route the element through `AudioContext.createMediaElementSource`; otherwise output is muted or tainted. Avoid Web Audio unless effects are needed.
- On iOS, the HTMLAudioElement probably follows the "playback" category, which ignores the ring/silent switch, while Web Audio historically follows the switch (widely reported). Setting `navigator.audioSession.type = "playback"` where it is supported (Safari 16.4+/17) makes this explicit. Not verified in this session.
- For invitations, a background or locked screen is not a goal. Pausing on `visibilitychange` sidesteps the iOS background-audio regressions.

### Gaps
- No primary source was found on Low Power Mode affecting HTML audio on iOS. Low Power Mode is known to block muted *video* autoplay; nothing confirmed for audio after a gesture.
- No 2025–2026 status was found for WebKit bug 261554.
- The claim that cross-origin audio plays without CORS is not cited from a fetched source in this session.

## Q4. Recommended robust pattern

### Takeaway
Use one pre-created same-origin-document `<audio>` element, preferably with a progressive MP3/AAC from your CDN. Call `play()` synchronously as the first statement of the "Open invitation" click handler, before any await or state update that triggers async work. On rejection, show a "Tap to play" chip. Respect a persisted mute toggle, and pause on `visibilitychange` (hidden) and resume on visible only if the user had music on. Do not depend on iframe players on iOS.

### Cited Findings
- Check the promise, show a play button on `NotAllowedError`, and never show a pause button before playback starts. — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay); [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- Retry on the next user gesture rather than polling. MDN shows a `setInterval` retry, but notes that event-driven retry is cleaner. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- Reuse a single element and change `src` (WebKit's per-element permission). — [WebKit autoplay policy](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)
- Spotify docs recommend `resume()`/`togglePlay()` and warn that `play()` can be blocked, which again supports a user-initiated fallback control. — [Spotify iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api)

### Inferences
Sketch, derived from the sources above (not from a single source):
```js
const audio = new Audio();            // create at page load, not in the handler
audio.src = trackUrl; audio.preload = "auto"; audio.loop = true;
// optional: if ('audioSession' in navigator) navigator.audioSession.type = 'playback';

openBtn.addEventListener('click', () => {
  if (!userMuted) {
    audio.play()                       // synchronous, first thing in the gesture
      .then(() => showMusicToggle('playing'))
      .catch(err => { if (err.name === 'NotAllowedError') showTapToPlayChip(); });
  }
  revealInvitation();                  // animations/navigation after play()
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause();
  else if (wasPlaying && !userMuted) audio.play().catch(showTapToPlayChip);
});
```
- If a catalogue only offers iframe embeds, use them on desktop and Android with `allow="autoplay"` and a player that is ready before the tap. On iOS, show the embed's own play button (a tap inside the iframe) or a "Tap to play" chip that reveals the player. The design should not promise automatic start on iPhone.
- In SPA frameworks (React/Next), state updates and route transitions can push `play()` into a later task. Keep the `play()` call in the native handler itself.
- Use the Media Session API (title, artwork) for nicer lock-screen display, but treat it as optional.

### Gaps
- The pattern has not been tested on real devices. Recommend a QA matrix: iOS 18/26 Safari, iOS in-app browsers (WhatsApp, Instagram webviews, which often have stricter policies; no source fetched), and Android Chrome.
