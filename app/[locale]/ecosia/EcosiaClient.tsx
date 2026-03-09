"use client"
import BrowserButtons from "@/components/browser-buttons";
import { ExpensesChart } from "@/components/ecosia/ExpensesChart";
import { HistoricalChart } from "@/components/ecosia/HistoricalChart";
import { KeyMetrics } from "@/components/ecosia/KeyMetrics";
import { PartnerNetwork } from "@/components/ecosia/PartnerNetwork";
import { ProjectMap } from "@/components/ecosia/ProjectMap";
import { TreeEfficiencyChart } from "@/components/ecosia/TreeEfficiencyChart";
import { TreeProgressChart } from "@/components/ecosia/TreeProgressChart";
import { Card } from "@/components/ui/card";

interface EcosiaClientProps {
  monthlyData: any[];
  transformedData: Record<string, any>;
  historicalTreeData: any[];
  projectLocations: any[];
  totalIncome: number;
  totalTreesFinanced: number;
  avgTreeSurplus: number;
  totalTreeFund: number;
  treePlanting: number;
  greenInvestments: number;
  operationalCosts: number;
  taxes: number;
  marketing: number;
}

export default function EcosiaClient({
  monthlyData,
  transformedData,
  historicalTreeData,
  projectLocations,
  totalIncome,
  totalTreesFinanced,
  avgTreeSurplus,
  totalTreeFund,
  treePlanting,
  greenInvestments,
  operationalCosts,
  taxes,
  marketing,
}: EcosiaClientProps) {
  return (
    <>
      <div className="max-w-[800px] mx-auto bg-brand-navy backdrop-blur-sm border-2 rounded-lg border-brand-yellow py-8 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col  items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-2xl  text-white mb-2 font-rethink-sans">Want to help plant even more trees?</h2>
              <p className="text-gray-300">Join our initiative to turn unused bandwidth into trees - a perfect complement to your Ecosia searches.</p>
            </div>
            <BrowserButtons />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-12">
        <KeyMetrics
          totalIncome={totalIncome}
          treesFinanced={totalTreesFinanced}
          treeSurplus={avgTreeSurplus}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpensesChart data={monthlyData} />
          <Card className="p-8 bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
            <h2 className="text-2xl font-bold mb-6 text-white">Ecosia Financial Report Highlights - Key Metrics</h2>
            <div className="space-y-6">
              {[
                { label: "Total Tree Fund (from Ecosia's Report)", value: totalTreeFund },
                { label: "Tree Planting Projects (from Ecosia's Report)", value: treePlanting },
                { label: "Green Investments (from Ecosia's Report)", value: greenInvestments },
                { label: "Operational Costs (from Ecosia's Report)", value: operationalCosts },
                { label: "Taxes (from Ecosia's Report)", value: taxes },
                { label: "Marketing (from Ecosia's Report)", value: marketing }
              ].map((item, index) => (
                <div key={index}>
                  <p className="text-gray-400 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold text-white">€{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <section>
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Ecosia Historical Financial Data & Trends</h2>
            <p className="text-gray-600 max-w-3xl">
              Track Ecosia's financial performance over time with historical income data, expense trends, and tree planting investments. This historical analysis reveals patterns in Ecosia's revenue growth and their commitment to environmental projects.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HistoricalChart data={monthlyData} />
            <TreeProgressChart data={transformedData} />
          </div>
        </section>

        <section>
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Ecosia Tree Planting Projects - Global Impact Data</h2>
            <p className="text-gray-600 max-w-3xl">
              Explore where Ecosia's financial investments in tree planting are making a real-world impact. This map shows the geographical distribution of reforestation projects funded by Ecosia's revenue.
            </p>
          </div>
          <ProjectMap projects={projectLocations} />
        </section>
        
        <section>
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Ecosia Financial Efficiency & Partnership Data</h2>
            <p className="text-gray-600 max-w-3xl">
              Analyze how efficiently Ecosia converts their financial resources into tree planting outcomes. This data shows the relationship between Ecosia's financial investments and their environmental partnerships.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TreeEfficiencyChart data={transformedData} />
            <PartnerNetwork data={transformedData} />
          </div>
        </section>

        <section className="container mx-auto px-4 mt-16 mb-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-black mb-6">Frequently Asked Questions About Ecosia's Financial Data</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">Where does Ecosia's financial data come from?</h3>
                <p className="text-gray-600">
                  All financial data presented here is sourced from Ecosia's official financial reports and transparency statements. Ecosia publishes detailed monthly and annual financial reports showing their income, expenses, and tree planting investments.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">How far back does Ecosia's historical data go?</h3>
                <p className="text-gray-600">
                  Our analysis includes Ecosia's historical financial data and tree planting records spanning multiple years, allowing you to track their growth and environmental impact over time.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">What financial metrics does Ecosia report?</h3>
                <p className="text-gray-600">
                  Ecosia's financial reports include total revenue, operational costs, marketing expenses, taxes, green investments, tree fund allocations, and the number of trees financed. This comprehensive financial transparency sets Ecosia apart from traditional search engines.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">How can I verify Ecosia's financial data?</h3>
                <p className="text-gray-600">
                  Ecosia publishes their official financial reports on their website. You can cross-reference the data presented here with their official statements to verify accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
