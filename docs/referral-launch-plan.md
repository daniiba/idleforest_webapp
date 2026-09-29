# Referral launch: "Plant a tree with a friend"

Goal: raise the K-factor by getting existing contributors to invite one person each, and by making every invitation convert better.

**The offer:** invite someone. Once their computer has contributed on 3 different days, we plant **one tree for each of you**.
Settings live in `referral_reward_settings`: trees per person, the number of active days, the inviter cap (10 rewards per 30 days), an on/off switch, and a program start date. You can change them without a deploy.

**The hook:** *your forest*. Each member gets an isometric island:
- trees they planted (green);
- trees earned by inviting (glowing yellow);
- one satellite island per person they invited, growing as that person plants.

It appears on `/referrals`, public profiles, the invite landing page, the desktop Invite tab, and in link previews (`/api/og/forest`).

---

## 1. Before launch (checklist)

**Database**
- [ ] Run the migrations in order: `20260928_…`, `20260929_…`, `20260930_…`, `20261001_…`.
- [ ] Enable **pg_cron** and **pg_net** (Database → Extensions), then re-run `20261001_…` if they were off when it ran.
- [ ] Add the cron secret to Vault, using the same value as `CRON_SECRET` in Vercel:
  `select vault.create_secret('<secret>', 'referral_cron_secret');`
- [ ] Check that the job exists: `select jobname, schedule from cron.job;` should list `referral-rewards-and-notifications` at `17 * * * *`.
- [ ] Check that the job runs: `select * from cron.job_run_details order by start_time desc limit 5;`.
  Also check the Vercel logs for `/api/cron/referrals`.

**Environment and apps**
- [ ] Vercel has `CRON_SECRET`, `ONE_CLICK_IMPACT_API_KEY`, `RESEND_API_KEY` and `UNSUBSCRIBE_SECRET`.
- [ ] Desktop: publish the new version, which has the Invite tab, the tray item, the forest island and the milestone card.

**Test run with two accounts (A invites B)**
1. A opens `/referrals` and copies the link.
2. B opens the link in a private window. Check that the landing page shows A's name and island.
3. B signs up. A gets the "joined" email.
4. B connects the desktop app. Once B's node reports traffic, A gets the "started contributing" email.
5. After B has 3 active days, the hourly job plants 1 tree each and both get the "tree planted" email.
6. Paste A's link into WhatsApp or Slack and check the preview shows A's forest.

## 2. Launch day

| When | Channel | What |
|---|---|---|
| Morning | Personal forest email | Admin → Lists → **Forest launch email**. Send yourself a test, then press **Start sending**. Every member with an active node gets their own forest image and one-tap invite buttons. It goes out in batches with the hourly referral job and nobody gets it twice. You can pause at any time. |
| Same time | Web app | The `/referrals` banner shows a **New** pill until 15 Nov. The forest panel sits at the top of `/referrals`. |
| Same time | Desktop | Release notes: "New: Invite tab, see your forest, plant a tree with a friend". The milestone card shows to anyone with 3+ active days. |
| Midday | Discord | Post the demo island image and the offer (copy below). Pin it. |
| Afternoon | Social | Post the demo image (`https://www.idleforest.com/api/og/forest?demo=1`) on X, LinkedIn and Instagram. |

## 3. Copy

**Discord / community**
> 🌳 **New: plant a tree with a friend.**
> Invite someone to IdleForest. Once their computer has contributed on 3 days, we plant a tree for you *and* one for them.
> We also built *your forest*: an island with every tree you've planted, the ones your invites earned, and a new island for everyone you bring along.
> Get your link → idleforest.com/referrals (desktop: tray icon → *Invite a friend*)

**X / LinkedIn**
> Your computer's idle internet can plant trees. Now so can your friends.
> Invite someone to @IdleForest and once they're contributing, we plant a tree for each of you. 🌳
> idleforest.com/referrals

**Instagram caption (with the island image)**
> This is what a forest looks like when it grows through people. Every island is someone you invited. 🌳
> Invite a friend and you both get a tree planted. Link in bio.

**Personal message people can send (already the default share text)**
> I've been using IdleForest: it runs quietly on my computer and turns internet bandwidth I'm not using into real trees. It's free and takes two minutes to set up. Join my forest: *link*

## 4. Follow-ups

- **Day 3 (manual):** send a one-line reminder to people who opened the launch email (`email_logs.opened_at`) but have no `link_copied` or `share_opened` event in `referral_events`. This is not automated yet.
- **Day 7:** a public thank-you post featuring the top 3 forests by invited people, with the members' permission.
- **Every week:** review the funnel (below). Change the reward only if activations stall, never mid-week.
- **15 Nov:** the "New" pill disappears automatically. Decide whether to keep the reward at 1 tree.

## 5. Measuring it

```sql
select * from get_referral_funnel(8);
```

| Column | Meaning |
|---|---|
| `sharers` | members who copied or shared their link that week |
| `landing_views` | invite page visits, excluding link-preview bots |
| `signups` | accounts created through a personal link |
| `activations` | invited people whose node started contributing |
| `viral_share` | referral activations ÷ all new contributors: the share of growth coming from referrals |
| `activations_per_sharer` | how many contributing people each sharer brings in: the closest weekly proxy for K |

What to watch:
- conversion from landing view to signup (the landing page's job);
- conversion from signup to activation (the reminder emails and desktop setup);
- whether `sharers` rises after the launch email.

## 6. Cost and guardrails

- **Cost:** each fully activated referral costs **2 trees** (1 each), at the 1ClickImpact per-tree price. An inviter earns at most 10 rewards per 30 days; their invitees are always rewarded.
- **Anti-abuse:**
  - The reward waits for 3 distinct contributing days. Empty or throwaway accounts never qualify.
  - Only signups after `program_started_at` count, so historical referrals are never paid.
  - Self-referral is blocked by a database constraint.
- **Kill switch:** `update referral_reward_settings set enabled = false;` stops new rewards immediately, and the copy everywhere stops promising trees.

## 6. Always-on nudges

- **Friend still setting up.** On `/referrals`, people who joined but have not started show as *Setting up*, with a **Remind** button. It opens a short, friendly check-in the member can send on WhatsApp, by email or copy. We do not email the member about it automatically.
- **Desktop forest updates.** The desktop app shows a system notification when someone you invited joins, when you both get a tree, and when your forest reaches 10, 25, 50, 100, 250 and more trees. At most one a day (rewards always), never on first launch. Clicking it opens the Invite tab. Members can turn it off in Settings → Forest updates.
- Run `20261003_referral_engagement.sql` and then `20261004_remove_friend_not_started_email.sql` before sending the launch email.
- The invite page and the privacy policy tell invited people that the person who invited them can see when they join and start planting.
