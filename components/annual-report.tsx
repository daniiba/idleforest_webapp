"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Check, Clock3, ExternalLink, Flag, Sprout, Target, Trees } from "lucide-react"
import { plantingsData, Receipt } from "@/lib/plantings"
import { useTranslations } from "next-intl"

const TREE_COST_USD = 0.55
const TREE_ROADMAP = [5000, 10000, 25000, 50000, 100000] as const

interface CharityCommitmentsProps {
  liveEarnings?: number | null
  liveSnapshotAt?: string | null
}

export default function CharityCommitments({ liveEarnings, liveSnapshotAt }: CharityCommitmentsProps) {
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

  // The previous 5,000-tree and $2,000 funding milestones have been reached.
  const goalTrees = 10000;
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
      impact: project?.description ? t(`projects.${project.id}.description`) : t('projects.default_impact', { trees: event.trees, partner: partner?.name || '' }),
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
              <div className="space-y-6 bg-brand-gray/30 p-6 border-2 border-black/10">
                <h3 className="text-xl font-bold font-rethink-sans text-black mb-6">{t('total_contributions')}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-black">
                      <span>{t('trees_planted_progress')}</span>
                      <span>{totalTrees} <span className="text-neutral-500">/ {goalTrees}</span></span>
                    </div>
                    <Progress value={Math.min((totalTrees / goalTrees) * 100, 100)} className="h-4 bg-white border-2 border-black rounded-full [&>div]:bg-brand-green" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-black">
                      <span>{t('est_donation')}</span>
                      <span>${totalDonations.toFixed(2)} <span className="text-neutral-500">/ ${goalDonation}</span></span>
                    </div>
                    <Progress value={Math.min((totalDonations / goalDonation) * 100, 100)} className="h-4 bg-white border-2 border-black rounded-full [&>div]:bg-brand-yellow" />
                  </div>
                </div>
              </div>

              <section className="overflow-hidden border-2 border-black bg-white" aria-labelledby="funding-pipeline-title">
                <div className="flex flex-col gap-3 border-b-2 border-black bg-black p-5 text-white sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
                      <Sprout className="h-4 w-4" />
                      {t('funding_pipeline_label')}
                    </div>
                    <h3 id="funding-pipeline-title" className="font-rethink-sans text-2xl font-extrabold">
                      {t('funding_pipeline_title')}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-neutral-300">
                      {t('funding_pipeline_desc')}
                    </p>
                  </div>
                  <div className="shrink-0 border-2 border-brand-yellow px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-brand-yellow">
                    {t('live_estimate')}
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border-2 border-black bg-black p-5 text-white">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-brand-yellow">
                        <Check className="h-4 w-4" />
                        {t('planted_verified')}
                      </div>
                      <div className="mt-3 text-4xl font-black tabular-nums">{totalTrees.toLocaleString()}</div>
                      <p className="mt-2 text-sm font-medium text-neutral-300">{t('planted_verified_desc')}</p>
                    </div>

                    <div
                      className="border-2 border-black bg-brand-yellow p-5 text-black"
                      style={{
                        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.26) 0, rgba(255,255,255,0.26) 10px, transparent 10px, transparent 20px)",
                      }}
                    >
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                        <Clock3 className="h-4 w-4" />
                        {t('funded_awaiting')}
                      </div>
                      <div className="mt-3 text-4xl font-black tabular-nums">{fundedAwaitingPlanting.toLocaleString()}</div>
                      <p className="mt-2 text-sm font-bold text-neutral-800">{t('funded_awaiting_desc')}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                      <span className="text-sm font-extrabold uppercase tracking-wide text-black">{t('funded_total')}</span>
                      <span className="font-rethink-sans text-2xl font-black tabular-nums text-black">
                        {fundedTreesTotal.toLocaleString()} {t('trees')}
                      </span>
                    </div>
                    <div
                      className="flex h-8 overflow-hidden border-2 border-black bg-white"
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
                    <div className="mt-2 flex justify-between gap-4 text-xs font-bold text-neutral-600">
                      <span>{t('planted')}</span>
                      <span className="text-right">{t('awaiting_planting')}</span>
                    </div>
                  </div>

                  <p className="border-l-4 border-brand-yellow pl-3 text-sm font-medium leading-relaxed text-neutral-700">
                    {t('funding_pipeline_note', { cost: TREE_COST_USD.toFixed(2) })}
                    {liveSnapshotAt && (
                      <> {t('funding_snapshot', { date: new Date(liveSnapshotAt).toLocaleDateString() })}</>
                    )}
                  </p>
                </div>
              </section>

              <section className="border-2 border-black bg-brand-gray/30 p-5 sm:p-6" aria-labelledby="roadmap-title">
                <div className="mb-5 flex items-start gap-3">
                  <Flag className="mt-1 h-6 w-6 shrink-0 text-black" />
                  <div>
                    <h3 id="roadmap-title" className="font-rethink-sans text-2xl font-extrabold text-black">
                      {t('roadmap_title')}
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-700">{t('roadmap_desc')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {TREE_ROADMAP.map((goal) => {
                    const reached = totalTrees >= goal;
                    const isNext = goal === nextTreeGoal;

                    return (
                      <div
                        key={goal}
                        className={`min-h-28 border-2 border-black p-3 ${
                          reached ? 'bg-black text-white' : isNext ? 'bg-brand-yellow text-black' : 'bg-white text-black'
                        }`}
                      >
                        <div className="flex min-h-8 items-start gap-1.5 text-[10px] font-extrabold uppercase tracking-wide">
                          {reached && <Check className="h-3.5 w-3.5 shrink-0 text-brand-yellow" />}
                          {reached ? t('goal_reached') : isNext ? t('goal_next') : t('goal_long_term')}
                        </div>
                        <div className="mt-3 font-rethink-sans text-2xl font-black tabular-nums">
                          {goal.toLocaleString()}
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${reached ? 'text-neutral-300' : 'text-neutral-600'}`}>
                          {t('trees')}
                        </div>
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

                      <p className="text-neutral-800 font-medium leading-relaxed mb-6">{milestone.impact}</p>
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
