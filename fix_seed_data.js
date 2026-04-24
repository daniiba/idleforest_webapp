const fs = require('fs');

const seedFile = './lib/carbon-seed-data.ts';
let content = fs.readFileSync(seedFile, 'utf8');

// Use a regex or simple eval to load it? Since it's TS, it has 'export const'.
// Let's just do a simple replacement script.
// Actually, using TS to read and write an AST is hard.
// I'll regex it since the structure is very consistent:
// idleforest_pitch: "...",
// human_equivalent_comparison: "...",
