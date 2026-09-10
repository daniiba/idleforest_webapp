import { plantingsData } from './plantings';

// Select specific dated funding events, not project totals or per-user estimates.
export const featuredPlantingRecords = [
  'evt-1ci-2026-05-15-busoga5',
  'evt-tn-2025-11-20-400',
].flatMap((id) => {
  const event = plantingsData.events.find((item) => item.id === id);
  if (!event) return [];
  const receipt = plantingsData.receipts.find((item) => item.id === event.receiptId);
  const project = plantingsData.projects.find((item) => item.id === event.projectId);
  if (!receipt?.url || !project) return [];
  return [{
    id,
    trees: event.trees,
    date: event.date,
    dateLabel: new Date(`${event.date}T00:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }),
    project: project.name,
    provider: receipt.provider,
    href: receipt.url,
    image: project.images?.[0] || '/report-images/mkussu-forest.jpg',
  }];
});
