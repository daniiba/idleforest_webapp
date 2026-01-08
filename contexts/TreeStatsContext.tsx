"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { plantingsData } from "@/lib/plantings";

interface TreeStats {
  plantedTrees: number;
  pendingTrees: number;
  totalTrees: number;
  loading: boolean;
}

const TreeStatsContext = createContext<TreeStats>({
  plantedTrees: 0,
  pendingTrees: 0,
  totalTrees: 0,
  loading: true,
});

export function TreeStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<TreeStats>({
    plantedTrees: 0,
    pendingTrees: 0,
    totalTrees: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Calculate planted trees from local data
      const plantedTrees = plantingsData.events.reduce((sum, e) => sum + e.trees, 0);

      // Fetch pending trees from Supabase donations table
      const supabase = createClient();
      const { data: donations, error } = await supabase
        .from("donations")
        .select("trees_planted");

      let pendingTrees = 0;
      if (!error && donations) {
        pendingTrees = donations.reduce((sum, d) => sum + (d.trees_planted || 0), 0);
      }

      const totalTrees = plantedTrees + pendingTrees;

      setStats({
        plantedTrees,
        pendingTrees,
        totalTrees,
        loading: false,
      });
    };

    fetchStats();
  }, []);

  return (
    <TreeStatsContext.Provider value={stats}>
      {children}
    </TreeStatsContext.Provider>
  );
}

export function useTreeStats() {
  return useContext(TreeStatsContext);
}
