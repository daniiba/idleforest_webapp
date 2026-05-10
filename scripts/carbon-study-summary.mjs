#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RESULTS_DIR = join(ROOT, "docs", "carbon-studies", "results");

function usage(exitCode = 0) {
  console.log(`Carbon study summary

Usage:
  pnpm carbon:study:summary -- --app discord

Options:
  --app <slug>       Filter by app slug
  --scenario <name>  Filter by scenario
  --out <path>       Output markdown path. Default: docs/carbon-studies/results/<app>-summary.md
  --help             Show this help`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  if (argv[0] === "--") {
    argv = argv.slice(1);
  }

  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) usage(1);
      return argv[i];
    };

    switch (arg) {
      case "--app":
        args.app = next();
        break;
      case "--scenario":
        args.scenario = next();
        break;
      case "--out":
        args.out = next();
        break;
      case "--help":
      case "-h":
        usage(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        usage(1);
    }
  }
  return args;
}

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function loadResults(args) {
  if (!existsSync(RESULTS_DIR)) return [];
  return readdirSync(RESULTS_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const path = join(RESULTS_DIR, name);
      return JSON.parse(readFileSync(path, "utf8"));
    })
    .filter((result) => !args.app || result.app === args.app)
    .filter((result) => !args.scenario || result.scenario === args.scenario);
}

function groupByScenario(results) {
  return results.reduce((groups, result) => {
    const key = `${result.app}/${result.scenario}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(result);
    return groups;
  }, new Map());
}

function buildMarkdown(results, args) {
  const groups = groupByScenario(results);
  const title = args.app ? `${args.app} Carbon Study Summary` : "Carbon Study Summary";
  const lines = [
    `# ${title}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "These figures are first-party measured estimates from network transfer plus explicit device, server, and storage assumptions. They are not vendor disclosures.",
    "",
    "| App | Scenario | Runs | Median GB/hour | Median network gCO2e/h | Median server gCO2e/h | Median device gCO2e/h | Median storage gCO2e/h | Median total gCO2e/h | Range total gCO2e/h |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const [, group] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const app = group[0].app;
    const scenario = group[0].scenario;
    const gb = group.map((result) => result.calculation.adjustedGbPerHour);
    const network = group.map((result) => result.calculation.components?.networkGco2ePerHour ?? result.calculation.estimatedGco2ePerHour ?? 0);
    const server = group.map((result) => result.calculation.components?.serverGco2ePerHour ?? 0);
    const device = group.map((result) => result.calculation.components?.deviceGco2ePerHour ?? 0);
    const storage = group.map((result) => result.calculation.components?.storageGco2ePerHour ?? 0);
    const total = group.map((result) => result.calculation.totalEstimatedGco2ePerHour ?? result.calculation.estimatedGco2ePerHour ?? 0);
    lines.push(
      [
        app,
        scenario,
        group.length,
        round(median(gb), 6),
        round(median(network), 4),
        round(median(server), 4),
        round(median(device), 4),
        round(median(storage), 4),
        round(median(total), 4),
        `${round(Math.min(...total), 4)}-${round(Math.max(...total), 4)}`,
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |"),
    );
  }

  lines.push(
    "",
    "Publish only scenarios with at least three comparable runs and a documented carbon factor.",
    "",
  );
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const results = loadResults(args);
  if (results.length === 0) {
    console.error("No matching carbon study JSON files found.");
    process.exit(1);
  }

  const markdown = buildMarkdown(results, args);
  const out = args.out
    ? join(ROOT, args.out)
    : join(RESULTS_DIR, `${args.app ?? "all"}-summary.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, markdown);
  console.log(`Saved summary: ${out}`);
}

main();
