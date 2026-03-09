"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ExternalLink, Target, Trees } from "lucide-react"
import Link from "next/link"
import { plantingsData, PlantingEvent, Receipt } from "@/lib/plantings"
import { useTranslations } from "next-intl"

export default function CharityCommitments() {
  const t = useTranslations('Report')
  // Calculate totals
  const totalTrees = plantingsData.events.reduce((sum, e) => sum + e.trees, 0);

  // Calculate donations (approximate as some receipt amounts might be missing/mixed currencies)
  // For now we sum what we have in USD.
  const totalDonations = plantingsData.receipts.reduce((sum, r) => {
    if (r.currency === "USD" && r.amount) return sum + r.amount;
    // Simple conversion for EUR to USD (approx 1.05 for estimation if needed, but let's just stick to USD sums or knowns)
    // The previous hardcode had $423 total.
    // Let's just sum known USD amounts for now to avoid misleading currency math without a real converter.
    if (r.currency === "EUR" && r.amount) return sum + (r.amount * 1.05);
    return sum;
  }, 0);

  const goalTrees = 5000; // Updated goal to reflect higher progress
  const goalDonation = 2000;

  // Map events to milestones
  const milestones = plantingsData.events.map((event) => {
    const project = plantingsData.projects.find(p => p.id === event.projectId);
    const partner = plantingsData.partners.find(p => p.id === event.partnerId);
    const receipt = event.receiptId ? plantingsData.receipts.find(r => r.id === event.receiptId) : undefined;

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
      receipt: receipt ? {
        url: receipt.url || receipt.filePath,
        label: t('view_certificate')
      } : null,
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
                      {milestone.receipt && milestone.receipt.url && (
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white text-black border-2 border-black hover:bg-black hover:text-brand-yellow rounded-none font-bold transition-colors"
                            asChild
                          >
                            <a
                              href={milestone.receipt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              {milestone.receipt.label}
                            </a>
                          </Button>
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