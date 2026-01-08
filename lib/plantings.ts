export type Planting = {
  id: string;
  partner: string; // e.g., "Tree Nation", "Trees for the Future", "Planting on Demand"
  date: string; // ISO date
  trees: number;
  locationName: string; // human-readable place or project
  lat: number;
  lng: number;
  receiptUrl?: string;
};

// =============================
// Normalized local data model
// =============================

export type CountryCode = string; // ISO 3166-1 alpha-2, e.g., "SN", "CM", "TZ", "KE"

export type Partner = {
  id: string;
  name: string;
  website?: string;
};

export type Country = {
  code: CountryCode; // e.g., "SN"
  name: string; // e.g., "Senegal"
  lat: number; // centroid or representative point
  lng: number;
};

export type SpeciesEntry = {
  name: string;
  count?: number;
};

export type Project = {
  id: string; // e.g., "tftf-senegal"
  name: string; // e.g., "TFTF Projects – Senegal"
  partnerId: string; // FK -> Partner.id
  countryCode: CountryCode; // FK -> Country.code
  lat?: number; // optional precise project coords
  lng?: number;
  description?: string;
  externalRef?: string; // provider project id/URL
};

export type Receipt = {
  id: string; // e.g., "tftf-2025-09-05"
  provider: string; // e.g., "Trees for the Future"
  url?: string; // external URL (e.g., certificate)
  filePath?: string; // local path inside /public (keeping existing /receits/ folder)
  amount?: number;
  currency?: string; // e.g., "USD" | "EUR"
  date?: string; // ISO date
};

export type PlantingEvent = {
  id: string;
  date: string; // ISO date
  trees: number;
  projectId: string; // FK -> Project.id
  partnerId: string; // FK -> Partner.id
  countryCode: CountryCode; // denormalized for quick grouping
  lat?: number; // optional precise event coords
  lng?: number;
  receiptId?: string; // FK -> Receipt.id
  amount?: number;
  currency?: string;
  companyId?: string; // future: FK -> public.companies.id
  species?: SpeciesEntry[]; // optional tree species breakdown for this event
};

export type PlantingsData = {
  partners: Partner[];
  countries: Country[];
  projects: Project[];
  receipts: Receipt[];
  events: PlantingEvent[];
};

// ---------------------------------
// Seed data (local, no Supabase)
// ---------------------------------
export const plantingsData: PlantingsData = {
  partners: [
    { id: "tree-nation", name: "Tree-Nation", website: "https://tree-nation.com" },
    { id: "tftf", name: "Trees for the Future", website: "https://trees.org" },
    { id: "pod", name: "Planting on Demand" },
  ],
  countries: [
    { code: "TZ", name: "Tanzania", lat: -6.369028, lng: 34.888822 },
    { code: "KE", name: "Kenya", lat: 0.0236, lng: 37.9062 },
    { code: "SN", name: "Senegal", lat: 14.497401, lng: -14.452362 },
    { code: "CM", name: "Cameroon", lat: 7.369722, lng: 12.354722 },
    { code: "MG", name: "Madagascar", lat: -18.766947, lng: 46.869107 },
    { code: "UG", name: "Uganda", lat: 1.373333, lng: 32.290275 },
  ],
  projects: [
    { id: "tn-eden-madagascar", name: "Eden Reforestation Projects – Madagascar", partnerId: "tree-nation", countryCode: "MG" },
    { id: "if-kenya", name: "Global Forest Initiative – Kenya", partnerId: "tree-nation", countryCode: "KE" },
    { id: "tftf-kisumu7-awach", name: "Kisumu 7 – Awach, Kenya", partnerId: "tftf", countryCode: "KE" },
    { id: "tftf-senegal", name: "TFTF Projects – Senegal", partnerId: "tftf", countryCode: "SN" },
    { id: "pod-dream-uganda-rwenzori", name: "Dream International – Rwenzori Mountains, Uganda", partnerId: "pod", countryCode: "UG" },
    { id: "pod-cameroon", name: "POD – Cameroon Agroforestry", partnerId: "pod", countryCode: "CM" },
    {
      id: "tn-syzygium",
      name: "Replanting the burnt Mkussu Forest",
      partnerId: "tree-nation",
      countryCode: "TZ",
      lat: -4.76667,
      lng: 38.36667,
      description: "Restoring the Mkussu Nature Forest Reserve in Lushoto District after fire damage.",
      externalRef: "https://tree-nation.com/projects/replanting-the-burnt-mkussu-forest",
    },
  ],
  receipts: [
    {
      id: "tn-2025-01-17",
      provider: "Tree-Nation",
      date: "2025-01-17",
      url: "https://tree-nation.com/certificate/8f474fdbcdfd8099",
    },
    {
      id: "tftf-2025-09-05",
      provider: "Trees for the Future",
      date: "2025-09-05",
      amount: 164,
      currency: "USD",
      filePath: "/receits/tftf.pdf",
    },
    {
      id: "pod-2025-09-08",
      provider: "Planting on Demand",
      date: "2025-09-08",
      amount: 80,
      currency: "USD",
      filePath: "/receits/pod.pdf",
    },
    {
      id: "tn-2025-11-20",
      provider: "Tree-Nation",
      date: "2025-11-20",
      amount: 140,
      currency: "EUR",
      url: "https://tree-nation.com/certificate/2bd099426b9a30d6",
    },
  ],
  events: [
    {
      id: "evt-tn-2025-01-17-50",
      date: "2025-01-17",
      trees: 50,
      partnerId: "tree-nation",
      projectId: "tn-eden-madagascar",
      countryCode: "MG",
      receiptId: "tn-2025-01-17",
      species: [
        { name: "Rhizophora mucronata", count: 50 },
      ],
    },
    {
      id: "evt-if-2024-11-12-34",
      date: "2024-11-12",
      trees: 34,
      partnerId: "tree-nation",
      projectId: "if-kenya",
      countryCode: "KE",
      species: [
        { name: "Palm trees", count: 20 },
        { name: "Avocado", count: 14 },
      ],
    },
    {
      id: "evt-tftf-2025-09-05-466",
      date: "2025-09-05",
      trees: 466,
      partnerId: "tftf",
      projectId: "tftf-kisumu7-awach",
      countryCode: "KE",
      receiptId: "tftf-2025-09-05",
      amount: 164,
      currency: "USD",
      species: [
        { name: "Palm trees", count: 150 },
        { name: "Avocado", count: 100 },
        { name: "Mango", count: 50 },
        { name: "Native species", count: 166 },
      ],
    },
    {
      id: "evt-pod-2025-09-08-150",
      date: "2025-09-08",
      trees: 150,
      partnerId: "pod",
      projectId: "pod-dream-uganda-rwenzori",
      countryCode: "UG",
      receiptId: "pod-2025-09-08",
      amount: 80,
      currency: "USD",
      species: [
        { name: "Food trees", count: 150 },
      ],
    },
    {
      id: "evt-tn-2025-11-20-400",
      date: "2025-11-20",
      trees: 400,
      partnerId: "tree-nation",
      projectId: "tn-syzygium",
      countryCode: "TZ",
      receiptId: "tn-2025-11-20",
      species: [
        { name: "Syzygium guineense", count: 400 },
      ],
    },
  ],
};

// =============================
// Helpers
// =============================

export function getEventCoordinates(
  e: PlantingEvent,
  projects: Project[],
  countries: Country[]
): { lng: number; lat: number } {
  if (typeof e.lng === "number" && typeof e.lat === "number") return { lng: e.lng, lat: e.lat };
  const project = projects.find((p) => p.id === e.projectId);
  if (project?.lng != null && project?.lat != null) return { lng: project.lng, lat: project.lat };
  const country = countries.find((c) => c.code === e.countryCode);
  return { lng: country?.lng ?? 0, lat: country?.lat ?? 0 };
}

export function groupByCountry(events: PlantingEvent[]) {
  return events.reduce<Record<CountryCode, { trees: number; count: number }>>((acc, e) => {
    acc[e.countryCode] ??= { trees: 0, count: 0 };
    acc[e.countryCode].trees += e.trees;
    acc[e.countryCode].count += 1;
    return acc;
  }, {});
}

export function groupByProject(events: PlantingEvent[]) {
  return events.reduce<Record<string, { trees: number; count: number }>>((acc, e) => {
    acc[e.projectId] ??= { trees: 0, count: 0 };
    acc[e.projectId].trees += e.trees;
    acc[e.projectId].count += 1;
    return acc;
  }, {});
}

export function toGeoJSON(data: PlantingsData): GeoJSON.FeatureCollection {
  const features = data.events.map((e) => {
    const { lng, lat } = getEventCoordinates(e, data.projects, data.countries);
    const project = data.projects.find((p) => p.id === e.projectId);
    const country = data.countries.find((c) => c.code === e.countryCode);
    const partnerName = data.partners.find((p) => p.id === e.partnerId)?.name ?? e.partnerId;
    const receipt = e.receiptId ? data.receipts.find((r) => r.id === e.receiptId) : undefined;
    const species = e.species;
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        id: e.id,
        partner: partnerName,
        date: e.date,
        trees: e.trees,
        locationName: project?.name ?? project?.id ?? e.countryCode,
        receiptUrl: receipt?.url ?? receipt?.filePath ?? null,
        receiptId: e.receiptId ?? null,
        projectId: e.projectId,
        projectName: project?.name ?? null,
        countryCode: e.countryCode,
        countryName: country?.name ?? e.countryCode,
        species: species ?? null,
      },
    };
  });
  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}

// Group projects by identical coordinates, summarizing trees and receipts per location.
export function toGeoJSONProjectsByLocation(data: PlantingsData): GeoJSON.FeatureCollection {
  const aggregates = aggregateProjects(data)
    .filter((agg) => agg.totalTrees > 0); // remove zero-tree spots

  type LocKey = string;
  const buckets = new Map<LocKey, {
    lng: number;
    lat: number;
    countryName: string | null;
    countryCode: string | null;
    projects: Array<{
      projectId: string;
      projectName: string;
      partner: string;
      partnerId: string;
      trees: number;
      lastDate: string | null;
      receipts: Receipt[];
      speciesAggregate: { name: string; count: number }[];
      images: string[];
      eventsCount: number;
      receiptsCount: number;
    }>;
    totalTrees: number;
    totalReceipts: number;
    totalEvents: number;
  }>();

  for (const agg of aggregates) {
    const { project, country, partner, totalTrees, lastDate, receipts, events } = agg;
    const { lng, lat } = getProjectCoordinates(project, data.countries);
    const key = `${lng.toFixed(5)},${lat.toFixed(5)}`;

    // species aggregate per project
    const speciesCount = new Map<string, number>();
    for (const e of events) {
      if (!e.species) continue;
      for (const s of e.species) {
        const prev = speciesCount.get(s.name) ?? 0;
        const inc = typeof s.count === "number" ? s.count : 1;
        speciesCount.set(s.name, prev + inc);
      }
    }
    const speciesAggregate = Array.from(speciesCount.entries()).map(([name, count]) => ({ name, count }));

    // images placeholder; can be customized per project later
    const images: string[] = ["/preview.png"];

    const entry = buckets.get(key) ?? {
      lng,
      lat,
      countryName: country?.name ?? null,
      countryCode: country?.code ?? project.countryCode ?? null,
      projects: [],
      totalTrees: 0,
      totalReceipts: 0,
      totalEvents: 0,
    };

    entry.projects.push({
      projectId: project.id,
      projectName: project.name,
      partner: partner?.name ?? project.partnerId,
      partnerId: project.partnerId,
      trees: totalTrees,
      lastDate,
      receipts,
      speciesAggregate,
      images,
      eventsCount: events.length,
      receiptsCount: receipts.length,
    });
    entry.totalTrees += totalTrees;
    entry.totalReceipts += receipts.length;
    entry.totalEvents += events.length;
    buckets.set(key, entry);
  }

  const features: GeoJSON.Feature[] = [];
  for (const [key, loc] of Array.from(buckets.entries())) {
    // prepare lightweight projects array for properties
    const projectsLight = loc.projects.map((p: {
      projectId: string;
      projectName: string;
      partner: string;
      partnerId: string;
      trees: number;
      lastDate: string | null;
      receipts: Receipt[];
      speciesAggregate: { name: string; count: number }[];
      images: string[];
      eventsCount: number;
      receiptsCount: number;
    }) => ({
      projectId: p.projectId,
      projectName: p.projectName,
      partner: p.partner,
      partnerId: p.partnerId,
      trees: p.trees,
      lastDate: p.lastDate,
      receiptsCount: p.receiptsCount,
      eventsCount: p.eventsCount,
      receipts: p.receipts.map((r: Receipt) => ({
        id: r.id,
        provider: r.provider,
        url: r.url ?? null,
        filePath: r.filePath ?? null,
        amount: r.amount ?? null,
        currency: r.currency ?? null,
        date: r.date ?? null,
      })),
      speciesAggregate: p.speciesAggregate,
      images: p.images,
    }));

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
      properties: {
        id: key,
        countryCode: loc.countryCode,
        countryName: loc.countryName ?? loc.countryCode,
        trees: loc.totalTrees,
        receiptsCount: loc.totalReceipts,
        eventsCount: loc.totalEvents,
        projects: JSON.stringify(projectsLight),
      },
    } as GeoJSON.Feature);
  }

  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}

// =============================
// Project-level aggregation
// =============================

export type ProjectAggregate = {
  project: Project;
  country: Country | undefined;
  partner: Partner | undefined;
  events: PlantingEvent[];
  totalTrees: number;
  lastDate: string | null;
  receipts: Receipt[];
};

export function aggregateProjects(data: PlantingsData): ProjectAggregate[] {
  return data.projects.map((project) => {
    const events = data.events.filter((e) => e.projectId === project.id);
    const totalTrees = events.reduce((sum, e) => sum + e.trees, 0);
    const lastDate = events.length > 0 ? events.map((e) => e.date).sort().slice(-1)[0] : null;
    const receiptIds = new Set(events.map((e) => e.receiptId).filter(Boolean) as string[]);
    const receipts = Array.from(receiptIds)
      .map((rid) => data.receipts.find((r) => r.id === rid))
      .filter((r): r is Receipt => Boolean(r));
    const country = data.countries.find((c) => c.code === project.countryCode);
    const partner = data.partners.find((p) => p.id === project.partnerId);
    return { project, country, partner, events, totalTrees, lastDate, receipts };
  });
}

export function getProjectCoordinates(project: Project, countries: Country[]): { lng: number; lat: number } {
  if (typeof project.lng === "number" && typeof project.lat === "number") return { lng: project.lng, lat: project.lat };
  const country = countries.find((c) => c.code === project.countryCode);
  return { lng: country?.lng ?? 0, lat: country?.lat ?? 0 };
}

export function toGeoJSONProjects(data: PlantingsData): GeoJSON.FeatureCollection {
  const aggregates = aggregateProjects(data);
  const features = aggregates.map((agg) => {
    const { project, country, partner, totalTrees, lastDate, receipts, events } = agg;
    const { lng, lat } = getProjectCoordinates(project, data.countries);
    // Keep receipts in properties as a JSON string to comply with GeoJSON simple types
    const receiptsLight = receipts.map((r) => ({
      id: r.id,
      provider: r.provider,
      url: r.url ?? null,
      filePath: r.filePath ?? null,
      amount: r.amount ?? null,
      currency: r.currency ?? null,
      date: r.date ?? null,
    }));
    // Aggregate species across events (sum counts when provided)
    const speciesCount = new Map<string, number>();
    for (const e of events) {
      if (!e.species) continue;
      for (const s of e.species) {
        const prev = speciesCount.get(s.name) ?? 0;
        const inc = typeof s.count === "number" ? s.count : 1;
        speciesCount.set(s.name, prev + inc);
      }
    }
    const speciesAggregate = Array.from(speciesCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
    // Simple image list (placeholders for now)
    const images: string[] = ["/preview.png"]; // can be extended per project in the future
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        id: project.id,
        projectId: project.id,
        projectName: project.name,
        partner: partner?.name ?? project.partnerId,
        partnerId: project.partnerId,
        countryCode: project.countryCode,
        countryName: country?.name ?? project.countryCode,
        trees: totalTrees,
        lastDate: lastDate,
        eventsCount: events.length,
        receiptsCount: receipts.length,
        receipts: JSON.stringify(receiptsLight),
        speciesAggregate: JSON.stringify(speciesAggregate),
        images: JSON.stringify(images),
        locationName: project.name,
      },
    } as GeoJSON.Feature;
  });
  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}
