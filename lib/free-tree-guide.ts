export const FREE_TREE_GUIDE_SLUG = 'how-to-plant-trees-for-free-every-method-how-they-work-and-whether-they-actually-help-2026-guide';
export const FREE_TREE_GUIDE_PATH = `/blog/${FREE_TREE_GUIDE_SLUG}`;
export const FREE_TREE_GUIDE_UPDATED_AT = '2026-09-10T00:00:00.000Z';
export const FREE_TREE_GUIDE_TITLE = 'How to Plant Trees for Free: Online Tools & Local Programs';
export const FREE_TREE_GUIDE_DESCRIPTION = 'Compare free ways to plant trees: use your computer, search online, support ad-funded planting, or find local tree giveaways. See who pays and how to start.';

// The article is served from Hashnode. Keep its detailed methods and sources,
// replacing only the dated introduction and moving its comparison to the top.
export function prepareFreeTreeGuideHtml(html: string) {
  const methodsHeading = /<h2\b[^>]*>\s*Every Way to Plant Trees Without Spending a Dime\s*<\/h2>/i.exec(html);
  if (!methodsHeading) return html;
  let body = html.slice(methodsHeading.index);
  // Replace the old summary table only when its known columns are present.
  body = body.replace(/<table\b[^>]*>[\s\S]*?<\/table>/i, (table) =>
    table.includes('Effort Required') && table.includes('Notable Achievement') ? '' : table,
  );
  return body;
}
