const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const root = require('node:path').resolve(__dirname, '..');
const ts = require(`${root}/node_modules/typescript`);
function load(relative) {
  const filename = `${root}/${relative}`;
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(root);
  mod._compile(compiled, filename);
  return mod.exports;
}
const { getHashnodeSitemapPosts } = load('lib/hashnode-blog.ts');
const { prepareFreeTreeGuideHtml, FREE_TREE_GUIDE_SLUG } = load('lib/free-tree-guide.ts');
const originalFetch = global.fetch;
const node = slug => ({ node: { slug, publishedAt: '2026-04-12T00:00:00.000Z' } });
const response = (slugs, hasNextPage, endCursor) => new Response(JSON.stringify({ data: { publication: { posts: { edges: slugs.map(node), pageInfo: { hasNextPage, endCursor } } } } }), { headers: { 'content-type': 'application/json' } });

(async () => {
  const cursors = [];
  global.fetch = async (url, options) => {
    const { variables } = JSON.parse(options.body);
    cursors.push(variables.after);
    assert.equal(variables.host, process.env.HASHNODE_PUBLICATION_HOST || 'idleforest.com/blog');
    return variables.after === null
      ? response(Array.from({ length: 30 }, (_, i) => `post-${i}`), true, 'page-2')
      : response(['post-29', FREE_TREE_GUIDE_SLUG], false, null);
  };
  const posts = await getHashnodeSitemapPosts();
  assert.equal(posts.length, 31);
  assert(posts.some(post => post.slug === FREE_TREE_GUIDE_SLUG));
  assert.deepEqual(cursors, [null, 'page-2']);
  console.log('PASS: paginates beyond 30 posts, includes older guide, deduplicates URLs, shares blog configuration');

  global.fetch = async () => response(['post'], true, 'repeated');
  await assert.rejects(getHashnodeSitemapPosts, /did not advance/);
  global.fetch = async () => response(['post'], true, null);
  await assert.rejects(getHashnodeSitemapPosts, /did not advance/);
  global.fetch = async () => new Response(JSON.stringify({ data: { publication: null } }), { headers: { 'content-type': 'application/json' } });
  await assert.rejects(getHashnodeSitemapPosts, /Missing Hashnode/);
  global.fetch = async (url, options) => JSON.parse(options.body).variables.after === null
    ? response(['post'], true, 'page-2')
    : new Response('Unavailable', { status: 503 });
  await assert.rejects(getHashnodeSitemapPosts, /503/);
  console.log('PASS: missing pages, API errors, and invalid cursors cannot publish a partial sitemap');

  const detailed = '<h2>Every Way to Plant Trees Without Spending a Dime</h2><p>Methods</p>';
  const oldTable = '<table><thead><tr><th>Effort Required</th><th>Notable Achievement</th></tr></thead></table>';
  const source = '<p>Old intro</p><h2>Why Planting Trees for Free Matters More Than You Think</h2><p>Background</p>' + detailed + oldTable + '<h2>Sources</h2><p>Original source links</p>';
  assert.equal(prepareFreeTreeGuideHtml(source), detailed + '<h2>Sources</h2><p>Original source links</p>');
  const changedCms = '<p>New CMS structure</p><table><tr><td>Keep this</td></tr></table>';
  assert.equal(prepareFreeTreeGuideHtml(changedCms), changedCms);
  assert.equal(prepareFreeTreeGuideHtml(detailed + '<table><tr><td>Another table</td></tr></table>'), detailed + '<table><tr><td>Another table</td></tr></table>');
  console.log('PASS: guide preserves detailed content, source links, unknown tables and changed CMS structure');
})().finally(() => { global.fetch = originalFetch; });
