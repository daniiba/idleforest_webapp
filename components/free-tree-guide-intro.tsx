import Link from 'next/link';
import { featuredPlantingRecords } from '@/lib/planting-proof';

const methods = [
  ['IdleForest desktop app', 'Use your computer as usual', 'Unused internet bandwidth funds verified planting; no donation or purchase required.'],
  ['Search engines and ad-funded apps', 'Search online or view ads', 'Advertising revenue pays for planting. Availability and contribution rates vary.'],
  ['Shopping extensions', 'Make a purchase you already planned', 'Merchant commissions fund trees. The extension may be free, but shopping costs money.'],
  ['Local tree giveaways', 'Collect and plant a tree', 'A local program supplies the tree. Check location, eligibility, season, and any fees.'],
  ['Volunteer planting', 'Join a local planting event', 'The organizer supplies trees and equipment. You contribute time and care.'],
];

export default function FreeTreeGuideIntro() {
  return (
    <>
      <p>
        You can plant trees for free through tools funded by advertising or unused internet bandwidth,
        local tree giveaways, and volunteer planting events. To fund trees online, choose a tool that
        fits your routine. To get a tree for your garden, look for a local giveaway and check its eligibility rules.
      </p>
      <p>
        With IdleForest, you can <strong>plant trees for free while you use your computer</strong>.
        The desktop app runs while your computer is on and connected to the internet, even with your browser closed.
        Paying clients fund bandwidth tasks, and the revenue supports tree planting through our partners.
        There is no subscription or donation. The Chrome extension is also free and works while your browser is open.
        Both use your internet connection and electricity; check your data plan before enabling bandwidth sharing.
      </p>
      <p>
        <Link href="/downloads">Get the free IdleForest app</Link>{' '}
        or <Link href="/transparency">check our verified planting records</Link>.
      </p>
      <h2>Choose a free tree-planting method</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr><th scope="col">Method</th><th scope="col">What you do</th><th scope="col">Who pays and what to check</th></tr>
          </thead>
          <tbody>
            {methods.map(([method, action, funding]) => (
              <tr key={method}><th scope="row">{method}</th><td>{action}</td><td>{funding}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Online tools fund trees in partner projects; they do not send you a seedling.
        For physical trees, check your council, parks department, or local nonprofit.
        Membership schemes that require a donation are not completely free.
      </p>
      <h2>What does free tree-planting funding look like in practice?</h2>
      <p>
        Here are two dated entries from IdleForest’s public funding records. Each links directly to the
        partner certificate so you can check the project and tree count yourself.
      </p>
      <ul>
        {featuredPlantingRecords.map((record) => (
          <li key={record.id}>
            <strong>{record.trees.toLocaleString('en-US')} trees</strong> — {record.project}, recorded{' '}
            <time dateTime={record.date}>{record.dateLabel}</time>.{' '}
            <a href={record.href} target="_blank" rel="noopener noreferrer">Open the {record.provider} certificate</a>.
          </li>
        ))}
      </ul>
      <p>
        These are community funding records, not a promise of a particular number of trees per user.
        A funding certificate alone does not measure long-term tree survival or carbon removal.
        Read <Link href="/how-it-works">how the bandwidth funding works</Link> and our{' '}
        <Link href="/transparency">full planting records</Link> for context.
      </p>
      <p className="text-sm">
        About this guide: IdleForest publishes this comparison and operates one of the tools listed.
        Compare the funding model, costs, and evidence for each option before choosing.
      </p>
    </>
  );
}
