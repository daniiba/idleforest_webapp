import { DollarSign, Trees, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KeyMetricsProps {
  totalIncome: number;
  treesFinanced: number;
  treeSurplus: number;
}

export const KeyMetrics = ({ totalIncome, treesFinanced, treeSurplus }: KeyMetricsProps) => {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      <Card className="p-8 bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow hover:border-brand-yellow transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-yellow rounded-lg">
            <DollarSign className="w-8 h-8 text-brand-navy" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Income</p>
            <h3 className="text-3xl font-bold text-white">€{formatNumber(totalIncome)}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-8 bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow hover:border-brand-yellow transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-yellow rounded-lg">
            <Trees className="w-8 h-8 text-brand-navy" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Trees Financed</p>
            <h3 className="text-3xl font-bold text-white">{formatNumber(treesFinanced)}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-8 bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow hover:border-brand-yellow transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-yellow rounded-lg">
            <TrendingUp className="w-8 h-8 text-brand-navy" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Tree Surplus</p>
            <h3 className="text-3xl font-bold text-white">{treeSurplus.toFixed(2)}%</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};