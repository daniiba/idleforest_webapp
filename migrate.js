const fs = require('fs');

const enJsonPath = './messages/en.json';
const dataFile = fs.readFileSync('./lib/carbon-data.ts', 'utf-8');

// A very hacky fast regex way to pull out seo blocks for scaffolding without needing TS compiler
const slugs = [...dataFile.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);

const enData = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));

if (!enData.CarbonFootprint) enData.CarbonFootprint = {};
if (!enData.CarbonFootprint.content) enData.CarbonFootprint.content = {};

// We will just create scaffolding for the user to translate via JSON.
for (const slug of slugs) {
    if (!enData.CarbonFootprint.content[slug]) {
        enData.CarbonFootprint.content[slug] = {
            seo: {
                intro: `[English Intro for ${slug}]`, // User can override
            }
        };
    }
}

const langs = ['en', 'de', 'es', 'fr', 'pt'];
langs.forEach(lang => {
    try {
        const path = `./messages/${lang}.json`;
        const langData = JSON.parse(fs.readFileSync(path, 'utf-8'));
        if (!langData.CarbonFootprint) langData.CarbonFootprint = {};
        if (!langData.CarbonFootprint.content) langData.CarbonFootprint.content = {};
        
        for (const slug of slugs) {
            if (!langData.CarbonFootprint.content[slug]) {
                langData.CarbonFootprint.content[slug] = {
                    seo: {
                        intro: `Translate intro for ${slug}`,
                        faq_q1: `Translate Q1 for ${slug}`,
                        faq_a1: `Translate A1 for ${slug}`,
                        faq_q2: `Translate Q2 for ${slug}`,
                        faq_a2: `Translate A2 for ${slug}`,
                    }
                };
            }
        }
        
        fs.writeFileSync(path, JSON.stringify(langData, null, 2));
    } catch(e) {}
});

console.log("Scaffolding complete.");
