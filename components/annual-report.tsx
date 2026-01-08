"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ExternalLink, Target, Trees } from "lucide-react"
import Link from "next/link"



// First donation: 34 trees for $11
const firstDonationTrees = 34
const firstDonationUSD = 11

const ourCommitments = {
  yearlyGoal: {
    trees: 1000,
    currentProgress: firstDonationTrees + 50 + 466 + 150 + 400, // 34 + 50 + 466 + 150 + 400 = 1100 trees total
    donationGoal: 500,
    currentDonations: firstDonationUSD + 15 + 164 + 80 + 153, // $11 + $15 + $164 + $80 + $153 = $423 total
  },
  milestones: [
    {
      date: "2025-11-20",
      description: "Tree Nation - Syzygium guineense",
      trees: 400,
      impact: "Restoring the Mkussu Nature Forest Reserve in Lushoto District after fire damage",
      receipt: {
        id: "TN-2bd099426b9a30d6",
        date: "2025-11-20",
        trees: 400,
        amount: "153.00",
        location: "Replanting the burnt Mkussu Forest, Tanzania",
        coordinates: "Various Locations",
        co2Offset: "20",
        platform: "Tree Nation",
        certificateUrl: "https://tree-nation.com/certificate/2bd099426b9a30d6"
      },
      image: "/report-images/mkussu-forest.jpg"
    },
    {
      date: "2025-01-17",
      description: "Tree Nation Contribution",
      trees: 50,
      impact: "Planted 50 trees through Tree Nation's global reforestation program",
      receipt: {
        id: "TN-8f474fdbcdfd8099",
        date: "2025-01-17",
        trees: 50,
        amount: "15.00",
        location: "Tree Nation Global Projects",
        coordinates: "Various Locations",
        co2Offset: "2.5",
        platform: "Tree Nation",
        certificateUrl: "https://tree-nation.com/certificate/8f474fdbcdfd8099"
      }
    },
    {
      date: "2025-09-05",
      description: "Trees for the Future – Normal trees",
      trees: 466,
      impact: "Planted 466 normal trees with Trees for the Future to support sustainable reforestation",
      receipt: {
        id: "TFTF-2025-09-05-466",
        date: "2025-09-05",
        trees: 466,
        amount: "164.00",
        location: "Trees for the Future Projects",
        coordinates: "Various Locations",
        co2Offset: "",
        platform: "Trees for the Future",
        certificateUrl: "/receits/tftf.pdf"
      }
    },
    {
      date: "2025-09-08",
      description: "Planting on Demand – Food trees",
      trees: 150,
      impact: "Planted 150 food trees with Planting on Demand to enhance local food security",
      receipt: {
        id: "POD-2025-09-08-150",
        date: "2025-09-08",
        trees: 150,
        amount: "80.00",
        location: "Planting on Demand Projects",
        coordinates: "Various Locations",
        co2Offset: "",
        platform: "Planting on Demand",
        certificateUrl: "/receits/pod.pdf"
      }
    },
    {
      date: "2024-11-12",
      description: "First contribution to Trees for the Future via IdleForest",
      trees: firstDonationTrees,
      impact: `Planted ${firstDonationTrees} trees through sustainable reforestation`,
      receipt: {
        id: "IF-2024-001",
        date: "2024-11-12",
        trees: firstDonationTrees,
        amount: firstDonationUSD.toFixed(2),
        location: "Global Forest Initiative",
        coordinates: "Various Locations",
        co2Offset: "2.5"
      }
    }
  ]
}

export default function CharityCommitments() {
  return (
    <div className="w-full">
      <div className="space-y-6">
        <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 rounded-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-3 text-2xl font-rethink-sans font-bold text-black">
              <Target className="h-8 w-8 text-black" />
              Our Tree Planting Progress
            </CardTitle>
            <CardDescription className="text-neutral-600 text-base mt-2 font-medium">
              Tracking our reforestation impact with Trees for the Future
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-8">
              <div className="space-y-6 bg-brand-gray/30 p-6 border-2 border-black/10">
                <h3 className="text-xl font-bold font-rethink-sans text-black mb-6">2024-2025 Contributions</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-black">
                      <span>Trees Planted</span>
                      <span>{ourCommitments.yearlyGoal.currentProgress} <span className="text-neutral-500">/ {ourCommitments.yearlyGoal.trees}</span></span>
                    </div>
                    <Progress value={(ourCommitments.yearlyGoal.currentProgress / ourCommitments.yearlyGoal.trees) * 100} className="h-4 bg-white border-2 border-black rounded-full [&>div]:bg-brand-green" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-black">
                      <span>Contribution Value (USD)</span>
                      <span>${ourCommitments.yearlyGoal.currentDonations.toFixed(2)} <span className="text-neutral-500">/ ${ourCommitments.yearlyGoal.donationGoal}</span></span>
                    </div>
                    <Progress value={(ourCommitments.yearlyGoal.currentDonations / ourCommitments.yearlyGoal.donationGoal) * 100} className="h-4 bg-white border-2 border-black rounded-full [&>div]:bg-brand-yellow" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold font-rethink-sans text-black mb-6">Impact Milestones</h3>
                <div className="space-y-6">
                  {ourCommitments.milestones
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((milestone, index) => (
                      <div key={index} className="group border-2 border-black bg-white p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-black text-lg">{milestone.description}</h4>
                              {index === 0 && <span className="px-2 py-0.5 border border-black bg-brand-yellow text-black text-xs font-bold uppercase tracking-wider">Latest</span>}
                            </div>
                            <p className="text-sm font-medium text-neutral-600">{new Date(milestone.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center bg-brand-green/20 px-3 py-1.5 border border-black self-start">
                            <Trees className="h-4 w-4 mr-2 text-black" />
                            <span className="text-sm font-bold text-black">{milestone.trees} trees</span>
                          </div>
                        </div>

                        {(milestone as any).image && (
                          <div className="mb-6 border-2 border-black overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={(milestone as any).image}
                              alt={milestone.description}
                              className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <p className="text-neutral-800 font-medium leading-relaxed mb-6">{milestone.impact}</p>
                        {(milestone as any).receipt?.certificateUrl && (
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white text-black border-2 border-black hover:bg-black hover:text-brand-yellow rounded-none font-bold transition-colors"
                              asChild
                            >
                              <a
                                href={(milestone as any).receipt.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                View Certificate
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