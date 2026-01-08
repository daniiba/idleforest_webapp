"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import { plantingsData, toGeoJSONProjectsByLocation } from "@/lib/plantings";
import { useTreeStats } from "@/contexts/TreeStatsContext";

// Tailwind brand colors for reference
// brand.yellow: #E0F146
// brand.gray:   #D9D9D9
// brand.navy:   #0B101F

export default function PlantingsMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { plantedTrees, pendingTrees, totalTrees, loading: statsLoading } = useTreeStats();
  type ReceiptLite = { id: string; provider: string; url: string | null; filePath: string | null; amount: number | null; currency: string | null; date: string | null };
  type SpeciesLite = { name: string; count: number };
  type SpotProject = {
    projectId: string;
    projectName: string;
    partner: string;
    partnerId: string;
    trees: number;
    lastDate: string | null;
    eventsCount: number;
    receiptsCount: number;
    receipts: ReceiptLite[];
    speciesAggregate: SpeciesLite[];
    images: string[];
  };

  const [selected, setSelected] = useState<
    | (
        | {
            kind: "project";
            id: string; // project id
            countryCode?: string | null;
            countryName?: string | null;
            lat: number;
            lng: number;
            project: SpotProject;
          }
        | {
            kind: "spot";
            id: string; // location key
            countryCode?: string | null;
            countryName?: string | null;
            lat: number;
            lng: number;
            trees: number;
            eventsCount: number;
            receiptsCount: number;
            projects: SpotProject[];
          }
      )
    | null
  >(null);

  const apiKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_MAPTILER_KEY : undefined;

  const geojson = useMemo(() => {
    return toGeoJSONProjectsByLocation(plantingsData);
  }, []);

  // Compute local planted trees for map display
  const localPlantedTrees = useMemo(() => {
    return plantingsData.events.reduce((sum, e) => sum + e.trees, 0);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!apiKey) {
      setError(
        "Map is unavailable: Missing NEXT_PUBLIC_MAPTILER_KEY. Please add it to .env.local and reload."
      );
      return;
    }

    try {
      maptilersdk.config.apiKey = apiKey as string;

      const map = new maptilersdk.Map({
        container: containerRef.current,
        style: maptilersdk.MapStyle.DATAVIZ.DARK,
        hash: false,
        center: [10, 8], // Africa/Europe view
        zoom: 2.3,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.on("load", () => {
        // Add a clustered GeoJSON source
        map.addSource("plantings", {
          type: "geojson",
          data: geojson as any,
          cluster: true,
          clusterMaxZoom: 8,
          clusterRadius: 50,
        });

        // Cluster circles
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "plantings",
          filter: ["has", "point_count"],
          paint: {
            // Outer halo in brand.yellow with opacity
            "circle-color": "#E0F146",
            "circle-opacity": 0.25,
            "circle-stroke-color": "#E0F146",
            "circle-stroke-width": 2,
            // Scale by point count
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              10, 22,
              50, 28,
              100, 34
            ],
          },
        });

        // Cluster count labels
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "plantings",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#0B101F", // navy text over yellow badge
          },
        });

        // Unclustered points
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "plantings",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#E0F146",
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#0B101F",
          },
        });

        // Click to zoom clusters
        map.on("click", "clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
          const clusterId = features[0].properties?.cluster_id as number;
          const source = map.getSource("plantings") as maptilersdk.GeoJSONSource;
          // @maptiler/sdk v3 returns a Promise for getClusterExpansionZoom
          (source as any).getClusterExpansionZoom(clusterId)
            .then((zoom: number) => {
              const [x, y] = (features[0].geometry as any).coordinates;
              map.easeTo({ center: [x, y], zoom });
            })
            .catch(() => {
              /* no-op */
            });
        });

        map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
        map.on("mouseenter", "unclustered-point", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "unclustered-point", () => (map.getCanvas().style.cursor = ""));

        // Selection for unclustered points (no in-map popup)
        map.on("click", "unclustered-point", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const coords = (f.geometry as any).coordinates.slice();
          const props = f.properties as any;

          // Parse projects array at this spot
          let projects: SpotProject[] = [];
          const rawProjects = (props as any).projects;
          if (rawProjects) {
            try {
              const arr = typeof rawProjects === "string" ? JSON.parse(rawProjects) : rawProjects;
              projects = (arr as any[]).map((p) => ({
                projectId: p.projectId as string,
                projectName: p.projectName as string,
                partner: p.partner as string,
                partnerId: p.partnerId as string,
                trees: Number(p.trees ?? 0),
                lastDate: (p.lastDate as string) || null,
                eventsCount: Number(p.eventsCount ?? 0),
                receiptsCount: Number(p.receiptsCount ?? 0),
                receipts: (p.receipts as any[])?.map((r) => ({
                  id: r.id as string,
                  provider: r.provider as string,
                  url: (r.url as string) ?? null,
                  filePath: (r.filePath as string) ?? null,
                  amount: typeof r.amount === "number" ? (r.amount as number) : r.amount != null ? Number(r.amount) : null,
                  currency: (r.currency as string) ?? null,
                  date: (r.date as string) ?? null,
                })) ?? [],
                speciesAggregate: ((p.speciesAggregate as any[]) ?? []).map((s) => ({ name: s.name as string, count: Number(s.count ?? 0) })),
                images: (p.images as string[]) ?? [],
              }));
            } catch {
              projects = [];
            }
          }

          // If exactly one project at this spot, present project view; otherwise spot view
          if (projects.length === 1) {
            const proj = projects[0];
            setSelected({
              kind: "project",
              id: proj.projectId,
              countryCode: (props.countryCode as string) || null,
              countryName: (props.countryName as string) || null,
              lat: coords[1],
              lng: coords[0],
              project: proj,
            });
          } else {
            setSelected({
              kind: "spot",
              id: (props.id as string) || `${coords[0]},${coords[1]}`,
              countryCode: (props.countryCode as string) || null,
              countryName: (props.countryName as string) || null,
              lat: coords[1],
              lng: coords[0],
              trees: Number(props.trees ?? projects.reduce((s, p) => s + p.trees, 0)),
              eventsCount: Number(props.eventsCount ?? projects.reduce((s, p) => s + p.eventsCount, 0)),
              receiptsCount: Number(props.receiptsCount ?? projects.reduce((s, p) => s + p.receiptsCount, 0)),
              projects,
            });
          }
        });

        // Fit bounds to all points
        if (geojson.features.length > 0) {
          const bounds = new maptilersdk.LngLatBounds();
          for (const f of geojson.features) {
            const coords = (f.geometry as any).coordinates as [number, number];
            bounds.extend(coords);
          }
          map.fitBounds(bounds, { padding: 60, duration: 800 });
        }

        // Navigation controls
        map.addControl(new maptilersdk.NavigationControl({ visualizePitch: true }));
      });

      return () => {
        map.remove();
      };
    } catch (e) {
      console.error(e);
      setError("Failed to initialize map. See console for details.");
    }
  }, [apiKey, geojson]);

  // When a spot/project is selected, scroll the details panel into view (helps on mobile)
  useEffect(() => {
    if (!selected) return;
    // Try to scroll to the details panel with a small offset
    const el = detailsRef.current;
    if (!el) return;
    try {
      const top = el.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top, behavior: "smooth" });
    } catch {
      // Fallback
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  return (
    <div className="w-full">
      <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-none md:rounded-xl overflow-hidden border border-gray-800 bg-brand-navy">
        {/* Info overlay */}
        <div className="absolute left-4 top-4 z-10 rounded-lg border border-gray-800 bg-gray-950/90 backdrop-blur px-4 py-3 text-white shadow">
          <div className="text-xs text-gray-300">Trees Planted</div>
          <div className="font-bold text-2xl text-brand-yellow leading-tight">{plantedTrees.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Across {plantingsData.events.length} contributions</div>
          
          {!statsLoading && pendingTrees > 0 && (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="text-xs text-gray-300">Trees to be Planted</div>
              <div className="font-bold text-xl text-brand-yellow/70 leading-tight">{pendingTrees.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">From business contributions</div>
            </>
          )}
        </div>

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white">{error}</div>
        ) : (
          <div ref={containerRef} className="absolute inset-0" />
        )}
      </div>

      {/* Selected details panel below the map */}
      {selected && (
        <div ref={detailsRef} className="mt-4 bg-brand-navy text-white px-0 sm:px-4 py-3 sm:py-4 sm:rounded-xl sm:border sm:border-brand-yellow/40 shadow-sm">
          <div className="px-4 sm:px-0 flex flex-col md:flex-row items-start justify-start md:justify-between gap-3 md:gap-4">
            {/* Left content */}
            <div className="w-full flex-1">
              {selected.kind === "project" ? (
                <>
                  <h3 className="text-lg md:text-xl font-semibold text-brand-yellow">{selected.project.projectName}</h3>
                  <div className="mt-1 text-xs text-gray-300">
                    {(selected.countryName || selected.countryCode) && (
                      <>
                        <span>{selected.countryName ?? selected.countryCode}</span>
                        <span className="mx-1 text-gray-500">→</span>
                      </>
                    )}
                    <span>{selected.project.partner}</span>
                    <span className="mx-1 text-gray-500">•</span>
                    <span>{selected.project.lastDate ? new Date(selected.project.lastDate).toLocaleDateString() : "No date"}</span>
                  </div>

                  {/* Metrics */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Trees</div>
                      <div className="text-sm font-semibold text-white">{selected.project.trees.toLocaleString()}</div>
                    </div>
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Events</div>
                      <div className="text-sm font-semibold text-white">{selected.project.eventsCount}</div>
                    </div>
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Avg / Event</div>
                      <div className="text-sm font-semibold text-white">{selected.project.eventsCount > 0 ? Math.round(selected.project.trees / selected.project.eventsCount).toLocaleString() : "-"}</div>
                    </div>
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Receipts</div>
                      <div className="text-sm font-semibold text-white">{selected.project.receiptsCount}</div>
                    </div>
                  </div>

                  {/* Receipts */}
                  {selected.project.receipts && selected.project.receipts.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-brand-yellow/80 mb-1">Receipts</div>
                      <ul className="text-xs text-gray-100 space-y-1">
                        {selected.project.receipts.map((r: ReceiptLite) => {
                          const href = r.url ?? r.filePath ?? null;
                          return (
                            <li key={r.id} className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate">
                                  <span className="text-gray-200">{r.provider}</span>
                                  <span className="mx-1 text-gray-400">•</span>
                                  <span className="text-gray-300">{r.date ? new Date(r.date).toLocaleDateString() : ""}</span>
                                </div>
                                {(r.amount != null || r.currency) && (
                                  <div className="text-[11px] text-gray-400">{r.amount != null ? r.amount : ""} {r.currency ?? ""}</div>
                                )}
                              </div>
                              {href && (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0 inline-flex items-center rounded-md bg-brand-yellow text-brand-navy px-2.5 py-1.5 text-[11px] font-semibold hover:opacity-90"
                                >
                                  View
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Species breakdown */}
                  {selected.project.speciesAggregate && selected.project.speciesAggregate.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-brand-yellow/80 mb-1">Species</div>
                      <div className="space-y-1">
                        {(() => {
                          const total = selected.project.speciesAggregate.reduce((sum: number, s: SpeciesLite) => sum + (s.count ?? 0), 0) || selected.project.trees;
                          return selected.project.speciesAggregate.slice(0, 8).map((s: SpeciesLite, idx: number) => {
                            const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                            return (
                              <div key={`${s.name}-${idx}`} className="">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-100 truncate mr-2">{s.name}</span>
                                  <span className="text-[11px] text-gray-400">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded mt-1 overflow-hidden">
                                  <div className="h-full bg-brand-yellow" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Images gallery */}
               {/*    {selected.project.images && selected.project.images.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-brand-yellow/80 mb-1">Images</div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {selected.project.images.slice(0, 4).map((src: string, idx: number) => (
                          <div key={`${src}-${idx}`} className="relative w-full pt-[56%] rounded-md overflow-hidden border border-gray-800 bg-gray-900">
                          
                            <img src={src} alt="Project image" className="absolute inset-0 h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </>
              ) : (
                // Spot with multiple projects
                <>
                  <h3 className="text-lg md:text-xl font-semibold text-brand-yellow">{selected.countryName ?? selected.countryCode}</h3>
                  <div className="mt-1 text-xs text-gray-300">Multiple projects at this location</div>

                  {/* Metrics (spot totals) */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Trees</div>
                      <div className="text-sm font-semibold text-white">{selected.trees.toLocaleString()}</div>
                    </div>
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Events</div>
                      <div className="text-sm font-semibold text-white">{selected.eventsCount}</div>
                    </div>
                    <div className="rounded-md border border-gray-800 bg-gray-950/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Receipts</div>
                      <div className="text-sm font-semibold text-white">{selected.receiptsCount}</div>
                    </div>
                  </div>

                  {/* Projects list with receipts */}
                  <div className="mt-3 space-y-2 sm:space-y-3">
                    {selected.projects.map((p: SpotProject) => (
                      <div key={p.projectId} className="border-t border-gray-800 bg-gray-950/40 p-4 sm:rounded-md sm:border sm:mt-0">
                        <div className="flex flex-col gap-1.5">
                          <div className="min-w-0 w-full">
                            <div className="text-sm font-semibold text-white">{p.projectName}</div>
                            <div className="text-[11px] text-gray-400">{p.partner} • {p.lastDate ? new Date(p.lastDate).toLocaleDateString() : "No date"}</div>
                          </div>
                          <div className="text-[12px] text-brand-yellow font-semibold">{p.trees.toLocaleString()} trees</div>
                        </div>
                        {p.receipts && p.receipts.length > 0 && (
                          <ul className="mt-2 text-xs text-gray-100 space-y-1">
                            {p.receipts.map((r: ReceiptLite) => {
                              const href = r.url ?? r.filePath ?? null;
                              return (
                                <li key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="truncate">
                                      <span className="text-gray-200">{r.provider}</span>
                                      <span className="mx-1 text-gray-400">•</span>
                                      <span className="text-gray-300">{r.date ? new Date(r.date).toLocaleDateString() : ""}</span>
                                    </div>
                                    {(r.amount != null || r.currency) && (
                                      <div className="text-[11px] text-gray-400">{r.amount != null ? r.amount : ""} {r.currency ?? ""}</div>
                                    )}
                                  </div>
                                  {href && (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="shrink-0 inline-flex items-center rounded-md bg-brand-yellow text-brand-navy px-2 py-1 text-[11px] font-semibold hover:opacity-90"
                                    >
                                      View
                                    </a>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Aggregated species for this spot */}
                  {(() => {
                    // Build aggregated species across all projects at this location
                    const speciesMap = new Map<string, number>();
                    selected.projects.forEach((p: SpotProject) => {
                      (p.speciesAggregate || []).forEach((s: SpeciesLite) => {
                        const prev = speciesMap.get(s.name) ?? 0;
                        speciesMap.set(s.name, prev + (s.count ?? 0));
                      });
                    });

                    const speciesAgg = Array.from(speciesMap.entries())
                      .map(([name, count]) => ({ name, count }))
                      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
                    if (speciesAgg.length === 0) return null;

                    const total = speciesAgg.reduce((sum, s) => sum + (s.count ?? 0), 0) || selected.trees;

                    return (
                      <div className="mt-4">
                        <div className="text-xs text-brand-yellow/80 mb-1">Species at this location</div>
                        <div className="space-y-1">
                          {speciesAgg.slice(0, 8).map((s, idx) => {
                            const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                            return (
                              <div key={`${s.name}-${idx}`}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-100 truncate mr-2">{s.name}</span>
                                  <span className="text-[11px] text-gray-400">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded mt-1 overflow-hidden">
                                  <div className="h-full bg-brand-yellow" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Images from all projects at this spot */}
                  {(() => {
                    const imagesSet = new Set<string>();
                    selected.projects.forEach((p: SpotProject) => {
                      (p.images || []).forEach((src) => imagesSet.add(src));
                    });
                    const imgs = Array.from(imagesSet);
                    if (imgs.length === 0) return null;
                    return (
                      <div className="mt-4">
                        <div className="text-xs text-brand-yellow/80 mb-1">Images</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {imgs.slice(0, 4).map((src, idx) => (
                            <div key={`${src}-${idx}`} className="relative w-full pt-[56%] rounded-md overflow-hidden border border-gray-800 bg-gray-900">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="Project image" className="absolute inset-0 h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            {/* Right controls */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start gap-3 sm:justify-end mt-3 sm:mt-0">
              <div className="sm:flex sm:flex-row sm:items-center sm:gap-3">
                {selected.kind === "project" ? (
                  <div className="inline-flex items-center rounded-md bg-brand-yellow/15 border border-brand-yellow/40 px-3 py-1.5 text-sm text-brand-yellow font-semibold">
                    {selected.project.trees.toLocaleString()} trees
                  </div>
                ) : (
                  <div className="inline-flex items-center rounded-md bg-brand-yellow/15 border border-brand-yellow/40 px-3 py-1.5 text-sm text-brand-yellow font-semibold">
                    {selected.trees.toLocaleString()} trees
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center rounded-md border border-brand-yellow/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
