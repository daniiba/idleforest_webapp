# IdleForest Google Ads launch plan

## Measurement contract

The campaign is for desktop nodes only. Do not count a page view, signup, or download as the final acquisition.

| Event | Definition | Google Ads use |
| --- | --- | --- |
| Desktop download | Click on the Windows or macOS installer route | Diagnostic only |
| Desktop node connected | A new `win32` or `darwin` node is linked to the ad click within 7 days | Primary conversion at launch |
| Active day 14 | Node generated at least one request in the 7 days ending around day 14 and remains opted in | Secondary initially |
| Active day 30 | Node generated at least one request in the 7 days ending around day 30 and remains opted in | Secondary initially |
| Active day 90 | Same retention test around day 90 | Internal CAC/LTV reporting only |

Day-90 activity should not be uploaded as a Google Ads offline conversion. Google retains a GCLID for at most 90 days, and any delay between click and install makes a day-90 upload likely to be rejected. Keep it in the internal cohort report.

The campaign performance view estimates gross LTV using the current observed rate of **€0.27 per 1,000 requests**. Update that constant in the SQL view when realized monetization changes. This is gross revenue, not contribution margin.

## Code and infrastructure setup

1. Apply `supabase/migrations/20260819_create_paid_acquisition_tracking.sql`.
2. Add these two production environment variables:

   ```text
   CRON_SECRET=<long-random-secret>
   GOOGLE_ADS_EXPORT_SECRET=<different-long-random-secret>
   ```

   `CRON_SECRET` protects the daily retention job. `GOOGLE_ADS_EXPORT_SECRET` protects the scheduled CSV URL and should be different because it is included in the Data Manager connection URL.

   The following settings are optional:

   ```text
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
   GOOGLE_ADS_INSTALL_CONVERSION_NAME=IdleForest desktop node connected
   GOOGLE_ADS_ACTIVE_14D_CONVERSION_NAME=IdleForest active day 14
   GOOGLE_ADS_ACTIVE_30D_CONVERSION_NAME=IdleForest active day 30
   ```

   The `AW-` tag is not required for GCLID-based offline imports. Add it only if you also want the Google Ads tag on the website. The three conversion-name variables are overrides; the shown names are already the code defaults.

3. Deploy. Vercel calls `/api/admin/acquisition-retention` daily at 02:15 UTC and sends `CRON_SECRET` as a bearer token.
4. In the desktop app, after the first successful node sync, open the user's default browser once:

   ```text
   https://www.idleforest.com/api/acquisition/claim?node=<URL-ENCODED-NODE_IDENTIFIER>
   ```

   This is required for anonymous installs. Authenticated installs are also claimed when the welcome page detects the user's new desktop node.
5. Test one click with a fake GCLID and ValueTrack parameters, download, then connect a test desktop node. Confirm rows appear in:

   - `acquisition_attributions`
   - `acquisition_conversions`
   - `acquisition_node_snapshots` after the daily job
   - `acquisition_campaign_performance`

## Google Ads conversion setup

Before creating ads, complete Google Ads' **Free desktop software** certification as IdleForest's authoritative distribution site. Google requires this for free `.exe`, `.dmg`, zipped desktop software, extensions, and similar downloads, and every ad must contain the software name. In Google Ads, check **Admin → Policy → Account → Apply for certification**; if that option is not yet available in the account, use the Help Center application flow.

Enable auto-tagging first. Then create three **offline** conversion actions with the names used in the environment variables:

1. `IdleForest desktop node connected` — primary, count **one**, 90-day click window.
2. `IdleForest active day 14` — secondary, count **one**, 90-day click window.
3. `IdleForest active day 30` — secondary, count **one**, 90-day click window.

Connect Google Ads Data Manager to this scheduled CSV source:

```text
https://www.idleforest.com/api/admin/google-ads-conversions?key=<GOOGLE_ADS_EXPORT_SECRET>
```

Map `GCLID`, `GBRAID`, `WBRAID`, conversion name/time/value/currency, and order ID. Run it daily. The order ID deduplicates repeated imports.

After the account consistently records roughly 30+ active-day-14 conversions per month, test making day 14 primary and the initial node connection secondary. This shifts bidding from raw installs toward retained nodes without starving a new campaign of conversion volume.

For EEA, UK, and Swiss traffic, implement a consent banner/CMP and Consent Mode v2 before using uploaded first-party user data or remarketing. The current feed uses click IDs and does not upload email addresses.

## Campaign structure

Start with Search only. Do not launch Performance Max, Display, or broad match until the retained-node signal is stable.

- Campaign: `Search | Desktop Nodes | High Intent`
- Devices: computers only; set mobile and tablet bid adjustments to `-100%`.
- Networks: Google Search only; turn Search Partners off for the first test.
- Location option: people **in or regularly in** the target countries, not people merely interested in them.
- Languages: match the landing-page language. Start with English and a small country set rather than mixing all locales.
- Bidding: Maximize Clicks with a CPC cap during the first learning sample; switch to Maximize Conversions after real node conversions accumulate.
- Match types: exact and phrase only at launch.

Use this Final URL suffix at campaign level:

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}&utm_content={creative}&campaignid={campaignid}&adgroupid={adgroupid}&creative={creative}&device={device}&network={network}&matchtype={matchtype}
```

Split ad groups by promise and landing page:

| Ad group | Landing page | Purpose |
| --- | --- | --- |
| Help the environment for free | OS-matched desktop page | Higher-volume environmental-action searches; ad must say desktop app |
| Tree-charity alternative | OS-matched desktop page | Donation/charity searches; offer a free alternative to donating money |
| Environmental apps | OS-matched desktop page | Lower-volume users already looking for software |

## Keyword priorities

The table below is from Google Keyword Planner for **United States, English, Google Search, July 2025–June 2026**, checked on August 19, 2026. This account currently receives Google's volume bands rather than exact counts; bid estimates are shown in the account currency (EUR).

| Keyword | Avg. US searches/month | 3-month change | Competition | Top-of-page bid range | Launch decision |
| --- | ---: | ---: | --- | ---: | --- |
| `how to help environment` | 1K–10K | -90% | Medium | €0.51–€5.19 | Test, phrase + exact |
| `ways to help environment` | 1K–10K | -90% | Low | €0.06–€6.85 | Test, phrase + exact |
| `plant trees` | 1K–10K | -90% | Medium | €1.25–€6.70 | Exact only; aggressive gardening negatives |
| `green apps` | 1K–10K | 0% | Low | €2.98–€7.26 | Small test; desktop must be explicit |
| `sustainability app` | 100–1K | -90% | Low | — | Exact + phrase, low bid |
| `charity app` | 100–1K | 0% | Low | €2.71–€9.41 | Exact only; desktop must be explicit |
| `tree planting charity` | 100–1K | 0% | Medium | €2.00–€7.19 | Test as free donation alternative |
| `environmental charities` | 100–1K | 0% | Medium | €3.35–€13.41 | Small exact-only test |
| `best environmental charities` | 100–1K | 0% | Medium | €3.23–€13.07 | Small exact-only test |
| `plant a tree donation` | 100–1K | 0% | Medium | €2.89–€10.37 | Test as free donation alternative |
| `donate trees` | 100–1K | 0% | Medium | €2.35–€8.77 | Test as free donation alternative |
| `tree planting organizations` | 100–1K | 0% | Medium | €1.45–€5.47 | Exact only |

The direct product terms are real but too small to carry a campaign: `tree planting app`, `apps that plant trees`, `environmental apps`, `best environmental apps`, `climate change app`, and `apps to reduce carbon footprint` are each only **10–100 US searches/month**. Keep the strongest ones as low-bid exact matches so they can convert, but do not build the budget forecast around them.

### Launch set — environmental action

These have the most usable demand. The ad must answer the query directly: **help the environment for free by running the IdleForest desktop app**. Do not imply that clicking the ad plants a tree.

```text
[how to help environment]
"how to help environment"
[ways to help environment]
"ways to help environment"
[plant trees]
```

### Launch set — environmental apps

This is the only cluster that already implies software, but most demand is mobile or ambiguous. Target computers only and put **Desktop App for Windows & Mac** in the headline.

```text
[green apps]
"green apps"
[sustainability app]
"sustainability app"
[charity app]
[tree planting app]
[apps that plant trees]
```

### Launch set — free alternative to donating

These users clearly want environmental impact, but they expect a charity or monetary donation. Keep them in a separate, capped campaign. The ad must say **No donation required—install the free IdleForest desktop app** so clicks self-qualify before they cost money.

```text
[tree planting charity]
"tree planting charity"
[tree planting charities]
[environmental charities]
[best environmental charities]
[plant a tree donation]
[donate trees]
[tree planting organizations]
```

Do **not** launch `Ecosia alternative`: that query is for a search engine. Also exclude `give a tree` despite its 10K–100K band; current results are dominated by gifts, memorial certificates, and direct donations, and the term fell 90% both over three months and year over year. `distributed computing` and `background app` have 1K–10K bands but are technically or generically motivated, not environmental intent. `donate unused bandwidth`, `share unused bandwidth`, `passive donation`, and `passive charity` did not return enough US demand to appear as usable seeds.

Allocate the first test budget roughly 60% environmental action, 25% environmental apps, and 15% donation alternative. Keep exact and phrase traffic in separate ad groups. Judge expansion only on connected desktop nodes and active-day-14 CAC—not click-through rate or downloads.

## Negative keyword starter list

Apply account-level negatives for traffic that cannot create a desktop node:

```text
android
iphone
ios
ipad
apk
mobile
phone
game
simulator
roblox
minecraft
wallpaper
screensaver
jobs
salary
course
tutorial
github
source code
crypto
mining
paypal
cash out
make money
passive income
free saplings
tree seeds
tree nursery
tree planting service
garden
gardening
landscaping
arborist
tree removal
tree trimming
privacy trees
near me
memorial
certificate
gift
green screen
app design
ux design
```

Negate `extension`, `chrome extension`, `browser extension`, `ecosia`, `search engine`, and `treeclicks` account-wide. In the environmental-action campaign, cross-negate `charity`, `charities`, `donate`, and `donation`; add the opposite cross-negatives to the donation-alternative campaign so the experiments remain interpretable.

Review search terms at least twice a week during launch and add negatives from actual queries.

## Ad copy direction

Every ad must name **IdleForest**, state that it is a **desktop app**, and disclose the significant function: it uses spare internet bandwidth in the background to fund verified tree planting.

Example headlines:

```text
IdleForest Desktop App
Plant Trees in the Background
Free App for Windows
Free App for Mac
Use Spare Bandwidth for Trees
Works When Your Browser Is Closed
```

Example descriptions:

```text
Install IdleForest on your computer. It uses spare bandwidth in the background to fund verified tree planting. Free and removable anytime.

Turn idle internet capacity into tree funding. A lightweight Windows and Mac desktop app with transparent impact records.
```

Never use the direct installer route as the ad's final URL. Google disallows ad destinations that immediately initiate a file download. Use the explanatory Windows/Mac landing pages.

Before launch, reconcile installer wording with the actual files. In the current code the Mac route downloads `mac.zip`, while the landing page says a `.dmg` downloads directly. The landing page and installer instructions must accurately describe the delivered package to avoid trust and unwanted-software policy problems.

## Weekly decision table

| Signal | Action |
| --- | --- |
| High CTR, low download rate | Ad/landing promise mismatch |
| Downloads, low node-connect rate | Installer friction, security warning, or callback missing |
| Nodes, low day-14 activity | Pause the keyword even if install CAC looks good |
| Strong day-14, weak day-30 | Investigate opt-out/uninstall reasons and onboarding expectations |
| Day-30 gross LTV below CAC | Reduce bid or pause; do not wait for blended site LTV to hide it |
| Day-30 gross LTV/CAC ≥ 3 with enough volume | Expand phrase terms, geography, or budget gradually |

Use `acquisition_campaign_performance` as the internal cohort source. Import daily Google Ads costs into `acquisition_campaign_costs`; CAC is spend divided by actual connected desktop nodes, while 14/30/90-day gross LTV comes from the request totals of cohorts old enough to reach each milestone.
