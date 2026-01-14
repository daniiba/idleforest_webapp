import type { Metadata } from "next";
import Navigation from "@/components/navigation";
import { transformedData, getHistoricalTreeData, getMonthlyData, getProjectLocations } from "@/lib/dataTransform";
import Script from "next/script";
import EcosiaClient from "./EcosiaClient";

export const metadata: Metadata = {
  title: "Ecosia Financial Data & Historical Tree Planting Report | Complete Analysis",
  description: "Comprehensive analysis of Ecosia's financial data, historical tree planting records, income reports, and expense breakdowns. Track Ecosia's financial transparency with detailed charts and metrics from their official financial reports.",
  keywords: [
    "ecosia financial data",
    "ecosia historical data",
    "ecosia financial report",
    "ecosia income report",
    "ecosia expense breakdown",
    "ecosia tree planting data",
    "ecosia financial transparency",
    "ecosia revenue data",
    "ecosia historical tree data",
    "ecosia financial analysis",
    "ecosia financial statements",
    "ecosia annual report",
    "ecosia financial metrics",
    "ecosia historical performance"
  ],
  openGraph: {
    title: "Ecosia Financial Data & Historical Tree Planting Report",
    description: "Comprehensive analysis of Ecosia's financial data, historical tree planting records, and expense breakdowns with interactive charts and metrics.",
    type: "website",
    url: "https://idleforest.com/ecosia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecosia Financial Data & Historical Tree Planting Report",
    description: "Comprehensive analysis of Ecosia's financial data, historical tree planting records, and expense breakdowns.",
  },
  alternates: {
    canonical: "https://idleforest.com/ecosia",
  },
};


const Index = () => {
  const monthlyData = getMonthlyData();
  console.log({ monthlyData })
  const historicalTreeData = getHistoricalTreeData();
  const projectLocations = getProjectLocations();

  const totalIncome = monthlyData.reduce((acc, curr) => acc + curr.income, 0);
  const totalTreesFinanced = historicalTreeData.reduce((acc, curr) => acc + curr.numberOfTreesFinanced, 0);
  const avgTreeSurplus = historicalTreeData.reduce((acc, curr) => acc + curr.treeSurplusPercent, 0) / historicalTreeData.length;

  const latestData = monthlyData[monthlyData.length - 1];
  const totalTreeFund = latestData?.treeFund || 0;
  const treePlanting = monthlyData.reduce((acc, curr) => acc + curr.paidProjects, 0);
  const greenInvestments = monthlyData.reduce((acc, curr) => acc + curr.greenInvestments, 0);
  const operationalCosts = monthlyData.reduce((acc, curr) => acc + curr.operationalCosts, 0);
  const taxes = monthlyData.reduce((acc, curr) => acc + curr.taxes, 0);
  const marketing = monthlyData.reduce((acc, curr) => acc + curr.marketing, 0);

  return (
    <>
      <div className="relative min-h-screen bg-brand-gray pb-24">
        <Navigation />
        <div
          className="absolute inset-0"

        />

        <div className="relative z-10 py-16">
          <div className="container mx-auto px-4 mb-12">
            <div className="max-w-4xl">
              <h1 className="text-5xl text-black mb-6 font-rethink-sans">Ecosia Financial Data & Historical Tree Planting Report</h1>
              <p className="text-xl text-gray-700 mb-4">Comprehensive analysis of Ecosia's financial data and historical tree planting records. This dashboard visualizes Ecosia's income, expenses, and financial transparency through their official financial reports.</p>
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-black mt-6 mb-3">About Ecosia's Financial Data</h2>
                <p className="text-gray-600 mb-4">
                  Ecosia publishes detailed financial reports showing their revenue, operational costs, and tree planting investments. Our analysis tracks Ecosia's historical data to provide insights into their financial performance and environmental impact over time.
                </p>
                <h2 className="text-2xl font-bold text-black mt-6 mb-3">Understanding Ecosia's Historical Tree Planting Data</h2>
                <p className="text-gray-600 mb-4">
                  The historical data below includes Ecosia's tree planting progress, financial allocations to reforestation projects, and expense breakdowns. This financial transparency allows users to see exactly how Ecosia's revenue translates into real environmental action.
                </p>
              </div>
            </div>
          </div>

          <EcosiaClient
            monthlyData={monthlyData}
            transformedData={transformedData}
            historicalTreeData={historicalTreeData}
            projectLocations={projectLocations}
            totalIncome={totalIncome}
            totalTreesFinanced={totalTreesFinanced}
            avgTreeSurplus={avgTreeSurplus}
            totalTreeFund={totalTreeFund}
            treePlanting={treePlanting}
            greenInvestments={greenInvestments}
            operationalCosts={operationalCosts}
            taxes={taxes}
            marketing={marketing}
          />
        </div>
      </div>

      <Script
        id="ecosia-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "Ecosia Financial Data and Historical Tree Planting Report",
            "description": "Comprehensive financial data and historical records of Ecosia's tree planting efforts, including income reports, expense breakdowns, and environmental impact metrics.",
            "url": "https://idleforest.com/ecosia",
            "keywords": [
              "ecosia financial data",
              "ecosia historical data",
              "ecosia financial report",
              "ecosia tree planting data",
              "ecosia revenue data",
              "ecosia expense breakdown"
            ],
            "creator": {
              "@type": "Organization",
              "name": "IdleForest",
              "url": "https://idleforest.com"
            },
            "temporalCoverage": "2020/..",
            "spatialCoverage": {
              "@type": "Place",
              "name": "Global"
            }
          }),
        }}
      />
    </>
  );
};

export default Index;