"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ExternalLink, Target, Trees } from "lucide-react"
import { plantingsData, Receipt } from "@/lib/plantings"
import { useTranslations } from "next-intl"

const TREE_COST_USD = 0.55
const TREE_ROADMAP = [5000, 10000, 25000, 50000, 100000] as const

interface CharityCommitmentsProps {
  liveEarnings?: number | null
}

export default function CharityCommitments({ liveEarnings }: CharityCommitmentsProps) {
  const t = useTranslations('Report')
  // Calculate totals
  const totalTrees = plantingsData.events.reduce((sum, e) => sum + e.trees, 0);

  // Calculate donations (approximate as some receipt amounts might be missing/mixed currencies)
  // For now we sum what we have in USD.
  const recordedDonationValue = plantingsData.receipts.reduce((sum, r) => {
    if (r.currency === "USD" && r.amount) return sum + r.amount;
    // Simple conversion for EUR to USD (approx 1.05 for estimation if needed, but let's just stick to USD sums or knowns)
    // The previous hardcode had $423 total.
    // Let's just sum known USD amounts for now to avoid misleading currency math without a real converter.
    if (r.currency === "EUR" && r.amount) return sum + (r.amount * 1.05);
    return sum;
  }, 0);

  const totalDonations = liveEarnings ?? recordedDonationValue;
  const fundedTreesTotal = Math.max(totalTrees, Math.floor(totalDonations / TREE_COST_USD));
  const fundedAwaitingPlanting = Math.max(fundedTreesTotal - totalTrees, 0);
  const plantedShare = fundedTreesTotal > 0 ? (totalTrees / fundedTreesTotal) * 100 : 0;
  const fundedShare = 100 - plantedShare;
  const nextTreeGoal = TREE_ROADMAP.find((goal) => goal > totalTrees);

  // The previous $2,000 funding milestone has been reached.
  const goalDonation = 5000;

  // Map events to milestones
  const milestones = plantingsData.events.map((event) => {
    const project = plantingsData.projects.find(p => p.id === event.projectId);
    const partner = plantingsData.partners.find(p => p.id === event.partnerId);
    
    // Resolve multiple receipts if available, otherwise single receipt
    const eventReceipts = event.receiptIds 
      ? event.receiptIds.map(rid => plantingsData.receipts.find(r => r.id === rid)).filter(Boolean) as Receipt[]
      : (event.receiptId ? [plantingsData.receipts.find(r => r.id === event.receiptId)].filter(Boolean) as Receipt[] : []);

    // Determine image based on project/partner or default
    let image: string | undefined = undefined;
    if (project?.images && project.images.length > 0) {
      image = project.images[0];
    }

    return {
      date: event.date,
      description: project ? t(`projects.${project.id}.name`) : t('projects.default_contribution', { partner: partner?.name || '' }),
      trees: event.trees,
      receipts: eventReceipts.map(r => ({
        url: r.url || r.filePath,
        label: t('view_certificate')
      })),
      image: image
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="w-full">
      <div className="space-y-6">
        <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 rounded-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-3 text-2xl font-rethink-sans font-bold text-black">
              <Target className="h-8 w-8 text-black" />
              {t('progress_title')}
            </CardTitle>
            <CardDescription className="text-neutral-600 text-base mt-2 font-medium">
              {t('progress_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-8">
              <section className="overflow-hidden border-2 border-black bg-white" aria-labelledby="impact-summary-title">
                <div className="grid gap-5 bg-black p-5 text-white sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
                      {t('funding_pipeline_label')}
                    </p>
                    <h3 id="impact-summary-title" className="mt-2 font-rethink-sans text-3xl font-black sm:text-4xl">
                      {totalTrees.toLocaleString()} <span className="text-xl font-bold text-neutral-300 sm:text-2xl">{t('trees_planted_progress')}</span>
                    </h3>
                  </div>
                  <div className="sm:text-right">
                    <div className="font-rethink-sans text-2xl font-black tabular-nums text-brand-yellow">
                      {fundedTreesTotal.toLocaleString()}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-neutral-300">{t('funded_total')}</div>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div
                    className="flex h-7 overflow-hidden border-2 border-black bg-white"
                    role="img"
                    aria-label={t('funding_pipeline_aria', {
                      planted: totalTrees.toLocaleString(),
                      awaiting: fundedAwaitingPlanting.toLocaleString(),
                    })}
                  >
                    <div className="h-full bg-black" style={{ width: `${plantedShare}%` }} />
                    <div
                      className="h-full border-l-2 border-black bg-brand-yellow"
                      style={{
                        width: `${fundedShare}%`,
                        backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 6px, transparent 6px, transparent 12px)",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-black tabular-nums text-black">{totalTrees.toLocaleString()}</span>
                      <span className="ml-1.5 font-medium text-neutral-600">{t('planted')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black tabular-nums text-black">{fundedAwaitingPlanting.toLocaleString()}</span>
                      <span className="ml-1.5 font-medium text-neutral-600">{t('awaiting_planting')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/15 pt-4 text-sm">
                    <span className="font-medium text-neutral-600">{t('next_funding_goal')}</span>
                    <span className="font-bold tabular-nums text-black">${totalDonations.toFixed(0)} / ${goalDonation.toLocaleString()}</span>
                  </div>
                  <p className="text-xs font-medium text-neutral-500">{t('funding_pipeline_note', { cost: TREE_COST_USD.toFixed(2) })}</p>
                </div>
              </section>

              <section aria-labelledby="roadmap-title">
                <h3 id="roadmap-title" className="mb-3 font-rethink-sans text-xl font-extrabold text-black">
                  {t('roadmap_title')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TREE_ROADMAP.map((goal) => {
                    const reached = totalTrees >= goal;
                    const isNext = goal === nextTreeGoal;

                    return (
                      <div
                        key={goal}
                        className={`flex items-center gap-2 border-2 border-black px-3 py-2 ${
                          reached ? 'bg-black text-white' : isNext ? 'bg-brand-yellow text-black' : 'bg-white text-black'
                        }`}
                      >
                        {reached && <Check className="h-4 w-4 shrink-0 text-brand-yellow" />}
                        <span className="font-rethink-sans text-lg font-black tabular-nums">{goal / 1000}K</span>
                        {isNext && <span className="border-l border-black/30 pl-2 text-[10px] font-extrabold uppercase tracking-wide">{t('goal_next')}</span>}
                      </div>
                    )
                  })}
                </div>
              </section>

              <div className="space-y-4">
                <h3 className="text-xl font-bold font-rethink-sans text-black mb-6">{t('impact_milestones')}</h3>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="group border-2 border-black bg-white p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-black text-lg">{milestone.description}</h4>
                            {index === 0 && <span className="px-2 py-0.5 border border-black bg-brand-yellow text-black text-xs font-bold uppercase tracking-wider">{t('latest')}</span>}
                          </div>
                          <p className="text-sm font-medium text-neutral-600">{new Date(milestone.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center bg-brand-green/20 px-3 py-1.5 border border-black self-start">
                          <Trees className="h-4 w-4 mr-2 text-black" />
                          <span className="text-sm font-bold text-black">{milestone.trees} {t('trees')}</span>
                        </div>
                      </div>

                      {milestone.image && (
                        <div className="mb-6 border-2 border-black overflow-hidden relative">
                          <img
                            src={milestone.image}
                            alt={milestone.description}
                            className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {milestone.receipts && milestone.receipts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {milestone.receipts.map((receipt, i) => receipt.url && (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="bg-white text-black border-2 border-black hover:bg-black hover:text-brand-yellow rounded-none font-bold transition-colors"
                              asChild
                            >
                              <a
                                href={receipt.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                {milestone.receipts.length > 1 ? `${receipt.label} ${i + 1}` : receipt.label}
                              </a>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
