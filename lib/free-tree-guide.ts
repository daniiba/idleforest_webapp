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
  // Replace two unsupported claims in the known CMS copy with checkable evidence.
  body = body.replace(
    'The distributed network model is itself greener than traditional data centers, which consume 1-2% of global electricity. Distributed networks use 80-90% less energy than their data center equivalents, according to IdleForest\'s <a href="https://www.idleforest.com/transparency">transparency page</a>.',
    'Our <a href="/transparency">public planting records</a> document funding for partner projects. They do not establish that bandwidth sharing uses less energy than a data center or quantify net carbon removal.',
  ).replace(
    'Free tree planting creates genuine, measurable environmental impact when programs use verified reforestation partners, prioritize native species, employ long-term monitoring, and engage local communities. The leading tools in this space (Ecosia, Treeapp, IdleForest) all meet these criteria.',
    'Free tools can fund real planting projects. Check each provider’s funding records and project monitoring separately: a certificate records a contribution, while survival assessments and field reporting provide evidence about what happens after planting.',
  );
  return body;
}

// These pages answer different questions within the free tree-planting topic.
export const FREE_TREE_RELATED_ARTICLE_SLUGS = [
  FREE_TREE_GUIDE_SLUG,
  'does-ecosia-actually-plant-trees',
  '9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025',
  'best-chrome-extensions-for-climate-change-and-environmental-impact-2025-guide',
];

export const FREE_TREE_RESOURCES = [
  { href: FREE_TREE_GUIDE_PATH, title: 'Compare ways to plant trees for free', description: 'Choose between computer apps, search engines, local giveaways, and volunteering.' },
  { href: '/tree-planting-extension', title: 'Plant trees with a Chrome extension', description: 'See how IdleForest works while your browser is open and how to install it.' },
  { href: '/how-it-works', title: 'Who pays for the trees?', description: 'Follow how unused bandwidth earns revenue and funds partner projects.' },
  { href: '/transparency', title: 'Check IdleForest’s planting records', description: 'Open public project records and certificates before choosing a tool.' },
  { href: '/blog/does-ecosia-actually-plant-trees', title: 'Does Ecosia actually plant trees?', description: 'Look at the reporting behind search-funded tree planting.' },
];
