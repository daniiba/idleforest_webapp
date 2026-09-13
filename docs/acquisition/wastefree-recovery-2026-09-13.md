# Waste Free Planet desktop recovery — 13 September 2026

Live, read-only analysis of the configured IdleForest Supabase database and Resend contact records. No emails were sent and no production data was changed.

## Audience

| Current members | People |
| --- | ---: |
| No linked device | 6 |
| Browser extension only | 7 |
| At least one linked desktop | 20 |
| Total current profiles | 33 |

All 13 without desktops joined more than 24 hours ago, have confirmed account emails and no local unsubscribe, bounce, or complaint suppression found. These are completed signups without a currently linked desktop, not proven signup-form abandonments. A desktop might have been linked and subsequently removed.

Resend lookup for those 13:

- **6 subscribed contacts**, all with the extension but no desktop: the first campaign cohort to review.
- **7 contacts not found** (six without devices, one extension-only): provider absence does not establish permission to send a marketing campaign. Review subscription history before including them.

The page's **55** membership records include **22 active ledger entries with missing auth accounts and no current community profile**. Exclude these from email recovery. There are 66 distinct historical user IDs across membership/profile records. This audit does not delete or rewrite historical membership/funding records.

The 20 desktop users have opted-in linked desktops with positive lifetime request counts. That does not establish recent activity, 14-day retention, or that those requests accrued after joining Waste Free Planet. Do not label them all currently active.

## What we cannot reconstruct

The production `onboarding_events` table does not exist, despite the migration and application event calls being present in the repository. Therefore signup → download click → desktop connection timestamps cannot be reconstructed from this table. Anonymous visitors who left before supplying an email cannot be identified for email recovery from these records.

The existing migration is `supabase/migrations/20260511_create_onboarding_events.sql`. Apply through the normal migration process to collect future events; it cannot backfill past clicks. Signup events now include the company slug.

## Implemented flow

- Waste Free Planet landing copy leads with the desktop app. Phone visitors see a handoff explanation.
- Logged-out Waste Free Planet joining goes directly to account creation. The login alternative preserves company association; an explicit Waste Free Planet URL takes precedence over an old invite cookie.
- Mobile setup offers an explicitly requested email to the signed-in user's confirmed account address. The endpoint validates current community membership, preserves locale and company, uses a Resend idempotency key, and deduplicates requests over 24 hours using email logs.
- Desktop setup puts OS-specific download and same-account login first. Download clicks never imply installation or connection is complete.
- Logged-out setup links return through login to the same community setup page.

No new database migration is required for the handoff endpoint; it uses the existing `email_logs` table.

## Reactivation draft

Subject: **€115 donated to fund removal of 5,750 bottles**

Hi,

A cleanup milestone to share: IdleForest has just donated €115 to fund the removal of 5,750 bottles.

You joined Waste Free Planet on IdleForest and connected the browser extension. You can also help fund future cleanup by adding the desktop app.

Open this email on your computer, then:

1. Download IdleForest for Windows, Mac, or Linux.
2. Open the app and log in with this same account.

**[Connect my desktop](https://www.idleforest.com/en/welcome/c/wastefree-planet?utm_source=resend&utm_medium=email&utm_campaign=wfp_5750_desktop_recovery)**

Your Waste Free Planet membership stays linked. The app shares unused bandwidth while running, and you can pause it anytime.

Daniel
IdleForest

[Unsubscribe — render the recipient-specific signed link before sending]

Donation amount and quantity are supplied by the user. The draft says “fund the removal”; it does not claim verified completed collection or that these recipients personally funded the donation. The user supplied Plastic Bank certificate IR-2026-09-U7PHTE (September 13, 2026), confirming funding to gather 115 kg / 5,750 bottle equivalents. It is published at `/partner/wastefree/certificates/plastic-bank-2026-09-13.jpg`, linked from `/c/wastefree-planet#cleanup-certificate` and the HTML email draft. The €115 payment amount remains user-supplied; the certificate itself specifies mass and bottle equivalents.

## Send preparation and validation

Publish the new setup flow before a reactivation send. Refresh membership, node presence, provider subscription, local suppression and recent-send status immediately before sending; suppress anyone who has since connected a desktop. Review this exact copy and the six-recipient cohort before authorizing a send. Do not send through the generic desktop-followup endpoint, whose tree-bonus copy is not appropriate for this cleanup campaign.

Private cohort data is kept outside the repository in `/private/tmp/idleforest-wfp-work/`; email addresses are not included in this report or committed files.

Checks: TypeScript; scoped ESLint; device detection and email authorization/deduplication tests (`node scripts/test-desktop-setup.cjs`); actual local landing → signup navigation; mobile/desktop rendering with fixture account state. No real setup or campaign email was sent during tests.
