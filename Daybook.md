# Rustify Website — Daybook

Stand: 16. September 2026  
Projekt: `Website/rustify` (Next.js App Router)  
Zweck: Offizielle Cluster-Seite für die Rustify 2× Vanilla Server (EU + US).

Dieses Tagebuch hält fest, was an der Website gebaut und geändert wurde, wie die Site heute dasteht, und was als Nächstes sinnvoll ist — inklusive der Home-/Cinematic-/Footer-Ideen.

---

## 1. Was die Site heute kann

Routen:

| Route | Inhalt |
| --- | --- |
| `/` | Home: Logo, Tagline, Onboarding (Region → Wipe → Play), Cluster-Karten, Store-CTA |
| `/servers` | Live-Liste (aktuell Mock), Filter Region/Tags, Whitelist-Banner → Support |
| `/servers/[slug]` | Einzelserver: Connect, Map, Regeln, Map-Vote |
| `/map-voting` | Stimmen für die nächste Procedural-Map je Box |
| `/leaderboard` | All-time / Prime, Kategorien, Suche, Server-/Wipe-Filter, Find me |
| `/store` | Queue Skip $5, VIP $10 pro Server, Region VIP $25 |
| `/store/checkout` | Stripe, Coupon, Gift, One-time / Abo |
| `/store/success` | Beleg nach Zahlung |
| `/support` | Tickets: Report, Appeal, Whitelist, Store, Sonstiges |
| `/account` | Steam-Profil, Discord, aktive Ränge, Stats, Käufe |
| `/legal/*` | Terms, Privacy, Cookies, Complaints, Operator |

Auth & Backend (bereits im Stack, teils noch mit Platzhaltern):

- Steam OpenID Login
- Discord OAuth (Link für Support / Whitelist)
- Stripe Checkout + Webhook + Rechnungen
- JSON-Persistenz unter `.data/`
- Entitlements / optionales RCON
- Cookie-Banner, i18n (27 Sprachen), sticky Header

Live-Spieler und Wipe-Uhren laufen über `LIVE_DATA_PROVIDER=mock`, bis BattleMetrics / echte Server-IPs stehen.

---

## 2. Änderungen in dieser Session (16. Sep 2026)

Arbeitsschwerpunkt: Site von „funktioniert“ auf „so soll Rustify live wirken“. Reihenfolge grob wie gebaut.

### Leaderboard & Login

- ~40 Mock-Spieler, damit die Rangliste voll wirkt
- Extra-Kategorien (PvP, Scientists, Resources, Gambling, Raiding, Events, Puzzles, Bought, Looting, Building)
- Layout näher an BattleMetrics: All-time / Prime, Kategorie-Leiste, Suche, Server- und Wipe-Dropdown, Find me, Podium + Tabelle
- Abstand zwischen Suche und Top 3 vergrößert
- Kategorie-Pills in der Umrandung zentriert
- Steam-Login wieder angebunden; Account-Einstieg im Header

### Servers & Whitelist

- Filter **Monuments** und **Map Size** entfernt
- Banner **Whitelist required**: Antrag über Support, Staff muss verifizieren
- CTA **Request now** → `/support`
- Hover auf Containern, Buttons, Karten

### Header, Navigation, Map Voting

- Header an Codexbotz-Referenz angepasst, dann iteriert:
  - Nav mittig: Home, Servers, Map Voting, Leaderboard, Store, Support
  - Rechts nur Sprache + Account
  - **Join Discord** aus dem Header entfernt
  - Hintergrund transparent, Border/Outline bleibt
- Neue Seite **Map Voting**
- **Home** und **Servers** getrennt
- Home stellt das Cluster vor: 8 Boxen (EU/US × Main, Mondays, Monthly, Solo/Duo/Trio)
- Onboarding im Home-Hero: Region → Wipe-Art → Server öffnen

### Store & Checkout

- Pro Server: Queue Skip **$5** (nur Queue), VIP **$10** (Queue + Skinbox)
- Region VIP **$25** nur für EU **oder** US (alle 4 Boxen der Region)
- Region VIP silber, normales VIP grau
- Regions-Flags (EU-Sterne / US-Canton) korrigiert
- Jeder Server eigene Store-Zeile mit Abstand
- Checkout aufgeräumt: Coupon/Giftcard, Trennlinie am Total, Steam als `Name (id)`, Gift mit Profil-Lookup, Hover an Checkboxen
- Benefit-Bullets und unteres „Back to store“ raus; Back-Link nach oben
- Billing: **One-time** vs **Subscription**
- Success/Receipt professioneller (Invoice, Produkt, Steam, Next steps)

### Dev / LAN

- Next `allowedDevOrigins` für `192.168.1.217`, localhost, 127.0.0.1
- `npm run dev` bindet `0.0.0.0` (Handy im LAN)

### i18n

- 27 Sprachen wie in der Flaggenliste (EN, FR, DE, ES, RU, TR, ZH, IT, PL, UK, NL, EL, RO, SV, NO, DA, FI, HU, SK, CS, BG, ES-MX, HR, LT, LV, ET, JA)
- Client-Provider, English-Fallback, Auswahl in `localStorage`
- UI-Strings auf `t()` umgestellt (Header, Home, Servers, Store, Checkout, Leaderboard, Support, Account, Cookies, Footer, Map Voting)
- Rechtsdokumente bleiben Englisch, mit Hinweis darüber
- Sprachmenü scrollbar, Flaggen über flagcdn

### Support (kurz davor / gleicher Stack)

- Echtes Ticket-System statt Dummy-Support
- Kategorien, Discord-Link, Staff-Review-Log, Benachrichtigungen
- Whitelist-Queue hängt daran

---

## 3. Untersuchung: Lücken für einen echten Rust-Cluster

Die Site ist eine starke **Hülle**. Für Launch fehlen vor allem **Inhalt, Vertrauen, Live-Daten und die Home als Marke**.

### Trust & Marketing (Home ist zu dünn)

Home ist Hero + 8 Karten. Es fehlt alles, warum jemand *hier* statt auf einem anderen 2x spielt:

- Kein Trust-Strip (Uptime, Staff, Bans, Player-Zahlen)
- Kein „Powered by“ (Facepunch/Rust, Hoster, Payments)
- Kein Why-Rustify (2× vanilla, Chat-Übersetzung, Whitelist, Regeln)
- Keine Socials (Discord, YouTube, TikTok) — Discord sitzt nur in Env/Connect
- Footer ist eine Zeile Copyright + 3 Legal-Links
- Hintergründe sind SVG/Farbe, keine Cinematics
- Kein klarer Ending-CTA (Join Discord / Connect / Store)

### Live-Server-Wahrheit

- `LIVE_DATA_PROVIDER=mock` — Spielerzahlen, Queue, Online-Status sind Demo
- Connect-IPs sind TEST-NET (`203.0.113.x`)
- RCON/Game-API/Oxide-Grant noch nicht verdrahtet für echte VIP-Lieferung
- BattleMetrics-Mapping in `.env` vorbereitet, nicht aktiv
- Wipe-Uhren sind berechnet, nicht aus dem Gameserver bestätigt

### Community & Betrieb

- Keine Rules-Landingpage (Anti-cheat, raid, racism, RDM, group limit 8 vs 3)
- Kein öffentlicher Ban/Banwave-Log (nur Appeal-Ticket)
- Kein Status (outage, wipe delay, queue stuck)
- Kein Wipe-Kalender als eigene Ansicht (nur Countdown an der Box)
- Chat Translation wird als Tag gezeigt, nirgends erklärt
- Steam Group Link existiert in Config, kaum in der UI
- YouTube / TikTok fehlen komplett in `site.ts`

### Store / Compliance

- Operator-Felder sind Platzhalter (`[OPERATOR LEGAL NAME]`, IČO, Adresse)
- Stripe Keys / Webhook in Prod noch leer
- Abo-Kündigung (Customer Portal) in der UI nicht sichtbar
- Kits/Skins/BP-Wipes im Shop nicht als eigene SKUs (nur Ränge)
- Gift + Abo-Kantenfälle (wem gehört das Abo?) rechtlich klären

### Tech-Schulden

- Ticket-Formulare, Ruleset-Notizen, Server-Headlines noch oft Englisch trotz i18n
- Hydration-Warnung am Header/Skip-Link bei Locale
- Stats/Leaderboard Mock, Game-API `/api/game/stats` wartet auf Plugin
- Keine echte Map-Thumbnail-Pipeline (RustMaps URLs müssen live sein)
- Cookie Analytics/Marketing Gates ohne echte Tracker hinter der Zustimmung

---

## 4. Vorschläge — priorisiert

### A. Home neu schneiden (nächster Design-Schritt)

Vorschlag für die Scroll-Story, nah an deiner Skizze:

1. **Hero / Header**  
   Cinematic (stumm, Loop, Poster-Frame), dunkler Veil, Logo + eine Zeile Claim.  
   Onboarding **nicht** den ganzen Hero füllen: kompakt im Hero *oder* als zweite Section direkt darunter („Find your wipe“), damit das Video Luft hat.

2. **Trust bar** (volle Breite, marquee oder statisches Grid)  
   `POWERED BY Rust | Noctura.Cloud | Stripe`  
   `50K+ BANS · 24/7 STAFF · 99.9% UPTIME · 5M+ YEARLY PLAYERS`  
   Zahlen erst zeigen, wenn sie stimmen oder klar als Ziel/Markenzeichen gelabelt sind. Falsche Stats zerstören Trust bei Rust-Spielern sofort.

3. **Our Servers**  
   Die bestehenden 8 Karten hierher ziehen (live Players + Wipe-Countdown + Connect). HomeShowcase bleibt, wird aber zur Section mit Kicker „Our Servers“.

4. **Why Rustify**  
   4–6 Punkte, konkret: 2× gather/loot, vanilla stacks, Whitelist, Chat Translation, published wipes, EU+US, Group 8 vs SDT 3. Keine leeren Adjektive.

5. **Socials**  
   Discord (primär), YouTube, TikTok — echte URLs in `site.ts`. Optional Steam Group.

6. **Ending**  
   Dunkler Block: „Wipe starts Thursday 18:00 CEST“ + Connect / Discord / Store.

7. **Footer** (3–4 Spalten)  
   - **Quick Links:** Home, Servers, Map Voting, Leaderboard, Store, Support  
   - **Community:** Discord, YouTube, TikTok, Steam Group  
   - **Legal:** Terms, Privacy, Cookies, Complaints, Operator  
   - Brand + Copyright + kleiner Trust-Satz

### B. Cinematic Hintergründe

Seiten: **Home (Hero)**, **Map Voting**, **Servers**, **Store**.

Technik, die für Rust-Sites hält:

- Eine kurze WebM/MP4 (8–15s, kein Ton), plus JPG/WebP-Poster
- `prefers-reduced-motion`: nur Poster
- Mobil: Poster oder stark komprimiertes Loop, nicht 40 MB 4K
- Pro Seite ein Clip (Base-Raid / heli / oil / snow biome), nicht überall denselben Loop
- Overlay: Verlauf + Noise, Text bleibt lesbar (WCAG)
- Dateien z. B. `public/cinematics/home.webm` — nicht unkomprimiert aus Premiere

Ohne fertige Clips: erst Poster aus Ingame-Screens, Video nachziehen.

### C. Was ein Rust-Server auf der Site noch braucht

- **Rules** als eigene Seite + Kurzfassung auf jeder Server-Page  
- **How to join:** Steam → Whitelist → `connect ip:port` / Steam-Connect-Button erklärt  
- **Wipe schedule** Tabelle (Map vs BP, EU vs US Zeitzone)  
- **Staff / apply** (optional, wirkt seriös)  
- **Status** Discord-Webhook oder einfaches „all systems up“  
- BattleMetrics oder eigenes Plugin für echte Population  
- Oxide/Carbon: Queue Skip / VIP / Skinbox Groups wirklich setzen  
- Chat-Übersetzung: Screenshot oder 20-Sekunden-Clip im Why-Block  
- Killfeed / recent raids nur wenn Stats-Plugin liefert — sonst weglassen

### D. Store nach Launch

- Stripe Customer Portal (Abo kündigen)
- Gift nur One-time, Abo nur eigenes Steam
- Klarer Scope: „VIP gilt 30 Tage auf *dieser* Box“
- Optional: Kit-Shop erst nach den drei Rängen, sonst wieder unübersichtlich

### E. Qualität / Launch-Checkliste

- Operator-Identität und echte Domain (`SITE_URL`)
- `STEAM_API_KEY`, Discord App, Staff-Webhook, `STAFF_STEAM_IDS`
- Echte Server-Hosts, Query-Port, RCON
- i18n auf Ticket-Formulare und Regeln erweitern
- Hydration/Locale sauber (kein Flash EN → DE)
- OG-Images mit aktuellem Brand
- Impressum/VOP mit Anwalt gegenlesen (digitale Güter, Widerruf-Checkbox ist schon da)

---

## 5. Empfohlene Reihenfolge

1. Home-Restructure + Footer-Spalten (ohne Video, mit starken Postern)  
2. Trust bar + Social-URLs (Zahlen erst wenn belegt)  
3. Cinematics einhängen (Home → Store → Servers → Map Voting)  
4. Rules + How to join  
5. Live-Daten statt Mock  
6. Payments/RCON echt testen (ein Server, ein VIP)  
7. Restliche i18n und Legal-Platzhalter

---

## 6. Offene Inputs von dir

Für die nächste Design-Runde brauchst du bereitzulegen:

- Cinematic-Clips oder wenigstens Ingame-Screens (16:9)
- Finale Social-Links (Discord Invite, YT, TikTok)
- Ob die Trust-Zahlen (`50K+ BANS` usw.) live, gerundet oder vorerst weggelassen werden
- Onboarding: **im Hero** (kompakt) oder **darunter** (volle Section)
- Noctura.Cloud / Stripe Logo-Dateien (Nutzungsrechte)

Danach ist der nächste Build: Home-Story A + Footer, dann Videos.
