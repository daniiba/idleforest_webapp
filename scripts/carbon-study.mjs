#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RESULTS_DIR = join(ROOT, "docs", "carbon-studies", "results");
const INDEX_CSV = join(RESULTS_DIR, "index.csv");

const DEFAULT_SCENARIOS = {
  "discord-idle": "Discord open, no intentional interaction",
  "discord-text": "Text chat and channel switching only",
  "discord-media": "Text chat with image, GIF, embed, and file-preview browsing",
  "discord-voice": "Voice call with one other participant",
  "discord-video": "Video call with one other participant",
  "discord-screen-share": "Screen share or stream viewing",
};

const DEFAULT_NETWORK_FACTOR_G_PER_GB = 55;
const FACTOR_SOURCE =
  "Configurable study assumption. Replace with project-approved source values before publishing.";

function usage(exitCode = 0) {
  console.log(`Carbon study runner

Usage:
  pnpm carbon:study -- --app discord --scenario discord-voice --duration 600 --baseline-duration 120

Options:
  --app <slug>                 App slug, e.g. discord
  --scenario <name>            Scenario name. Known Discord examples:
                              ${Object.keys(DEFAULT_SCENARIOS).join(", ")}
  --duration <seconds>         Scenario measurement duration. Default: 600
  --baseline-duration <sec>    Baseline measurement duration. Default: 120
  --interface <name>           Network interface. Default: active interface when detectable, else en0
  --prep <seconds>             Countdown before each phase. Default: 10
  --network-gco2e-per-gb <g>   Network carbon factor for measured transfer. Default: ${DEFAULT_NETWORK_FACTOR_G_PER_GB}
  --co2e-per-gb <grams>        Alias for --network-gco2e-per-gb
  --server-gco2e-per-gb <g>    Server/data-center processing factor per adjusted GB. Default: 0
  --device-watts <watts>       Scenario device power draw estimate. Default: 0
  --baseline-device-watts <w>  Baseline device power draw estimate. Default: 0
  --electricity-gco2e-kwh <g>  Electricity carbon intensity for device/storage energy. Default: 0
  --storage-gb-added <gb>      Durable media/storage added during the scenario run. Default: 0
  --storage-days <days>        Retention period for storage allocation. Default: 365
  --storage-gco2e-gb-month <g> Storage carbon factor per GB-month. Default: 0
  --device <text>              Device notes, e.g. "MacBook Air M2"
  --client <text>              Client notes, e.g. "Discord desktop" or "Discord web"
  --notes <text>               Extra notes stored with the run
  --no-prompts                 Run without waiting for Enter between phases
  --dry-run                    Print the plan without measuring
  --help                       Show this help

The script measures aggregate interface traffic. For credible app studies,
close sync-heavy apps, run a baseline first, and repeat each scenario 3+ times.`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  if (argv[0] === "--") {
    argv = argv.slice(1);
  }

  const args = {
    app: "discord",
    scenario: "discord-text",
    duration: 600,
    baselineDuration: 120,
    prep: 10,
    networkFactor: DEFAULT_NETWORK_FACTOR_G_PER_GB,
    serverFactor: 0,
    deviceWatts: 0,
    baselineDeviceWatts: 0,
    electricityGco2eKwh: 0,
    storageGbAdded: 0,
    storageDays: 365,
    storageFactorGbMonth: 0,
    prompts: true,
    dryRun: false,
    device: "",
    client: "",
    notes: "",
  };

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
      case "--duration":
        args.duration = Number(next());
        break;
      case "--baseline-duration":
        args.baselineDuration = Number(next());
        break;
      case "--interface":
        args.interfaceName = next();
        break;
      case "--prep":
        args.prep = Number(next());
        break;
      case "--co2e-per-gb":
      case "--network-gco2e-per-gb":
        args.networkFactor = Number(next());
        break;
      case "--server-gco2e-per-gb":
        args.serverFactor = Number(next());
        break;
      case "--device-watts":
        args.deviceWatts = Number(next());
        break;
      case "--baseline-device-watts":
        args.baselineDeviceWatts = Number(next());
        break;
      case "--electricity-gco2e-kwh":
        args.electricityGco2eKwh = Number(next());
        break;
      case "--storage-gb-added":
        args.storageGbAdded = Number(next());
        break;
      case "--storage-days":
        args.storageDays = Number(next());
        break;
      case "--storage-gco2e-gb-month":
        args.storageFactorGbMonth = Number(next());
        break;
      case "--device":
        args.device = next();
        break;
      case "--client":
        args.client = next();
        break;
      case "--notes":
        args.notes = next();
        break;
      case "--no-prompts":
        args.prompts = false;
        break;
      case "--dry-run":
        args.dryRun = true;
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

  if (!Number.isFinite(args.duration) || args.duration <= 0) {
    throw new Error("--duration must be a positive number of seconds.");
  }
  if (!Number.isFinite(args.baselineDuration) || args.baselineDuration < 0) {
    throw new Error("--baseline-duration must be zero or a positive number of seconds.");
  }
  if (!Number.isFinite(args.prep) || args.prep < 0) {
    throw new Error("--prep must be zero or a positive number of seconds.");
  }
  const nonNegativeOptions = [
    ["--network-gco2e-per-gb", args.networkFactor],
    ["--server-gco2e-per-gb", args.serverFactor],
    ["--device-watts", args.deviceWatts],
    ["--baseline-device-watts", args.baselineDeviceWatts],
    ["--electricity-gco2e-kwh", args.electricityGco2eKwh],
    ["--storage-gb-added", args.storageGbAdded],
    ["--storage-days", args.storageDays],
    ["--storage-gco2e-gb-month", args.storageFactorGbMonth],
  ];
  for (const [name, value] of nonNegativeOptions) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be zero or a positive number.`);
    }
  }

  return args;
}

function detectActiveInterface() {
  try {
    const output = execFileSync("route", ["get", "default"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const match = output.match(/interface:\s+(\S+)/);
    if (match?.[1]) return match[1];
  } catch {
    // Fall through to macOS Wi-Fi default.
  }
  return "en0";
}

function readInterfaceBytes(interfaceName) {
  const output = execFileSync("netstat", ["-ibn"], { encoding: "utf8" });
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const header = lines.find((line) => line.startsWith("Name "));
  if (!header) {
    throw new Error("Could not find netstat header. Try running outside sandbox permissions.");
  }

  const columns = header.split(/\s+/);
  const nameIndex = columns.indexOf("Name");
  const ibytesIndex = columns.indexOf("Ibytes");
  const obytesIndex = columns.indexOf("Obytes");
  if (nameIndex === -1 || ibytesIndex === -1 || obytesIndex === -1) {
    throw new Error("Could not find Name, Ibytes, and Obytes columns in netstat output.");
  }

  const candidates = lines
    .filter((line) => !line.startsWith("Name "))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts[nameIndex] === interfaceName)
    .map((parts) => ({
      rxBytes: Number(parts[ibytesIndex]),
      txBytes: Number(parts[obytesIndex]),
      raw: parts.join(" "),
    }))
    .filter((row) => Number.isFinite(row.rxBytes) && Number.isFinite(row.txBytes));

  if (candidates.length === 0) {
    throw new Error(`No byte counters found for interface "${interfaceName}" in netstat output.`);
  }

  return candidates.reduce((best, row) => {
    const total = row.rxBytes + row.txBytes;
    const bestTotal = best.rxBytes + best.txBytes;
    return total > bestTotal ? row : best;
  });
}

async function waitSeconds(seconds, label) {
  if (seconds <= 0) return;
  const started = Date.now();
  process.stdout.write(`${label}: ${seconds}s`);
  while (Date.now() - started < seconds * 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const remaining = Math.max(0, seconds - Math.round((Date.now() - started) / 1000));
    process.stdout.write(`\r${label}: ${remaining}s `);
  }
  process.stdout.write("\n");
}

async function waitForEnter(message, prompts) {
  if (!prompts) return;
  const rl = readline.createInterface({ input, output });
  await rl.question(`${message}\nPress Enter when ready.`);
  rl.close();
}

async function measurePhase({ label, seconds, prep, interfaceName }) {
  if (seconds <= 0) {
    return {
      label,
      durationSeconds: 0,
      rxBytes: 0,
      txBytes: 0,
      totalBytes: 0,
      start: null,
      end: null,
    };
  }

  await waitSeconds(prep, `${label} prep`);
  const startedAt = new Date();
  const start = readInterfaceBytes(interfaceName);
  await waitSeconds(seconds, label);
  const end = readInterfaceBytes(interfaceName);
  const endedAt = new Date();

  const rxBytes = Math.max(0, end.rxBytes - start.rxBytes);
  const txBytes = Math.max(0, end.txBytes - start.txBytes);
  return {
    label,
    durationSeconds: (endedAt.getTime() - startedAt.getTime()) / 1000,
    rxBytes,
    txBytes,
    totalBytes: rxBytes + txBytes,
    start: startedAt.toISOString(),
    end: endedAt.toISOString(),
  };
}

function bytesToGb(bytes) {
  return bytes / 1_000_000_000;
}

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function calculate({ baseline, scenario, assumptions }) {
  const scenarioBytesPerSecond = scenario.durationSeconds > 0 ? scenario.totalBytes / scenario.durationSeconds : 0;
  const baselineBytesPerSecond = baseline.durationSeconds > 0 ? baseline.totalBytes / baseline.durationSeconds : 0;
  const adjustedBytesPerSecond = Math.max(0, scenarioBytesPerSecond - baselineBytesPerSecond);
  const adjustedGbPerHour = bytesToGb(adjustedBytesPerSecond * 3600);
  const scenarioHours = scenario.durationSeconds > 0 ? scenario.durationSeconds / 3600 : 0;
  const storageGbPerHour = scenarioHours > 0 ? assumptions.storageGbAdded / scenarioHours : 0;
  const storageMonths = assumptions.storageDays / 30.4375;
  const incrementalDeviceWatts = Math.max(0, assumptions.deviceWatts - assumptions.baselineDeviceWatts);

  const components = {
    networkGco2ePerHour: adjustedGbPerHour * assumptions.networkFactorGco2ePerGb,
    serverGco2ePerHour: adjustedGbPerHour * assumptions.serverFactorGco2ePerGb,
    deviceGco2ePerHour:
      (incrementalDeviceWatts / 1000) * assumptions.electricityGco2ePerKwh,
    storageGco2ePerHour:
      storageGbPerHour * storageMonths * assumptions.storageFactorGco2ePerGbMonth,
  };
  const totalEstimatedGco2ePerHour = Object.values(components).reduce((sum, value) => sum + value, 0);

  return {
    baselineGbPerHour: round(bytesToGb(baselineBytesPerSecond * 3600), 6),
    rawScenarioGbPerHour: round(bytesToGb(scenarioBytesPerSecond * 3600), 6),
    adjustedGbPerHour: round(adjustedGbPerHour, 6),
    storageGbPerHour: round(storageGbPerHour, 6),
    incrementalDeviceWatts: round(incrementalDeviceWatts, 4),
    components: {
      networkGco2ePerHour: round(components.networkGco2ePerHour, 4),
      serverGco2ePerHour: round(components.serverGco2ePerHour, 4),
      deviceGco2ePerHour: round(components.deviceGco2ePerHour, 4),
      storageGco2ePerHour: round(components.storageGco2ePerHour, 4),
    },
    totalEstimatedGco2ePerHour: round(totalEstimatedGco2ePerHour, 4),
    estimatedGco2ePerHour: round(totalEstimatedGco2ePerHour, 4),
    carbonFactorGco2ePerGb: assumptions.networkFactorGco2ePerGb,
    carbonFactorSource: FACTOR_SOURCE,
  };
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function appendIndex(result) {
  const header = [
    "timestamp",
    "app",
    "scenario",
    "client",
    "device",
    "interface",
    "duration_seconds",
    "baseline_seconds",
    "scenario_rx_bytes",
    "scenario_tx_bytes",
    "baseline_rx_bytes",
    "baseline_tx_bytes",
    "adjusted_gb_per_hour",
    "storage_gb_per_hour",
    "network_gco2e_per_hour",
    "server_gco2e_per_hour",
    "device_gco2e_per_hour",
    "storage_gco2e_per_hour",
    "total_estimated_gco2e_per_hour",
    "network_factor_gco2e_per_gb",
    "server_factor_gco2e_per_gb",
    "device_watts",
    "baseline_device_watts",
    "electricity_gco2e_kwh",
    "storage_gb_added",
    "storage_days",
    "storage_gco2e_gb_month",
    "result_file",
    "notes",
  ];
  const row = [
    result.timestamp,
    result.app,
    result.scenario,
    result.client,
    result.device,
    result.interface,
    result.measurements.scenario.durationSeconds,
    result.measurements.baseline.durationSeconds,
    result.measurements.scenario.rxBytes,
    result.measurements.scenario.txBytes,
    result.measurements.baseline.rxBytes,
    result.measurements.baseline.txBytes,
    result.calculation.adjustedGbPerHour,
    result.calculation.storageGbPerHour,
    result.calculation.components.networkGco2ePerHour,
    result.calculation.components.serverGco2ePerHour,
    result.calculation.components.deviceGco2ePerHour,
    result.calculation.components.storageGco2ePerHour,
    result.calculation.totalEstimatedGco2ePerHour,
    result.assumptions.networkFactorGco2ePerGb,
    result.assumptions.serverFactorGco2ePerGb,
    result.assumptions.deviceWatts,
    result.assumptions.baselineDeviceWatts,
    result.assumptions.electricityGco2ePerKwh,
    result.assumptions.storageGbAdded,
    result.assumptions.storageDays,
    result.assumptions.storageFactorGco2ePerGbMonth,
    result.resultFile,
    result.notes,
  ];

  const headerLine = header.join(",");
  const line = row.map(csvEscape).join(",");
  const existingCsv = existsSync(INDEX_CSV) ? readFileSync(INDEX_CSV, "utf8") : "";
  const existingHeader = existingCsv.split(/\r?\n/, 1)[0] ?? "";
  const needsHeader = existingCsv.trim().length === 0 || existingHeader !== headerLine;
  writeFileSync(INDEX_CSV, `${needsHeader ? `${headerLine}\n` : ""}${line}\n`, {
    flag: "a",
  });
}

function writeResult(result) {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const filename = `${result.app}-${result.scenario}-${result.timestamp.replaceAll(":", "").replaceAll(".", "")}.json`;
  const filepath = join(RESULTS_DIR, filename);
  result.resultFile = `docs/carbon-studies/results/${filename}`;
  writeFileSync(filepath, `${JSON.stringify(result, null, 2)}\n`);
  appendIndex(result);
  return filepath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const interfaceName = args.interfaceName ?? detectActiveInterface();
  const scenarioDescription = DEFAULT_SCENARIOS[args.scenario] ?? "";

  console.log(`Carbon study plan
App: ${args.app}
Scenario: ${args.scenario}${scenarioDescription ? ` (${scenarioDescription})` : ""}
Interface: ${interfaceName}
Baseline: ${args.baselineDuration}s
Scenario duration: ${args.duration}s
Network factor: ${args.networkFactor} gCO2e/GB
Server factor: ${args.serverFactor} gCO2e/GB
Device watts: ${args.deviceWatts} W, baseline device watts: ${args.baselineDeviceWatts} W
Electricity factor: ${args.electricityGco2eKwh} gCO2e/kWh
Storage added: ${args.storageGbAdded} GB retained for ${args.storageDays} days
Storage factor: ${args.storageFactorGbMonth} gCO2e/GB-month`);

  if (args.dryRun) return;

  await waitForEnter(
    "Prepare the baseline state now. Close bandwidth-heavy apps, then leave Discord in the baseline state you want to subtract.",
    args.prompts,
  );
  const baseline = await measurePhase({
    label: "Baseline",
    seconds: args.baselineDuration,
    prep: args.prep,
    interfaceName,
  });

  await waitForEnter(
    `Prepare the scenario now: ${args.scenario}${scenarioDescription ? ` - ${scenarioDescription}` : ""}.`,
    args.prompts,
  );
  const scenario = await measurePhase({
    label: "Scenario",
    seconds: args.duration,
    prep: args.prep,
    interfaceName,
  });

  const assumptions = {
    networkFactorGco2ePerGb: args.networkFactor,
    serverFactorGco2ePerGb: args.serverFactor,
    deviceWatts: args.deviceWatts,
    baselineDeviceWatts: args.baselineDeviceWatts,
    electricityGco2ePerKwh: args.electricityGco2eKwh,
    storageGbAdded: args.storageGbAdded,
    storageDays: args.storageDays,
    storageFactorGco2ePerGbMonth: args.storageFactorGbMonth,
    factorSource: FACTOR_SOURCE,
  };

  const result = {
    timestamp: new Date().toISOString(),
    app: args.app,
    scenario: args.scenario,
    scenarioDescription,
    client: args.client,
    device: args.device,
    interface: interfaceName,
    notes: args.notes,
    limitations: [
      "Measures aggregate traffic on the selected network interface, not Discord process traffic alone.",
      "Use a quiet machine and repeat each scenario at least three times before publishing.",
      "Network transfer is measured; device, server, and storage components are modeled from explicit input assumptions.",
      "The CO2e result is an IdleForest estimate, not a Discord vendor disclosure.",
    ],
    assumptions,
    measurements: {
      baseline,
      scenario,
    },
    calculation: calculate({ baseline, scenario, assumptions }),
  };

  const filepath = writeResult(result);
  console.log(`
Saved result: ${filepath}
Adjusted transfer: ${result.calculation.adjustedGbPerHour} GB/hour
Network: ${result.calculation.components.networkGco2ePerHour} gCO2e/hour
Server: ${result.calculation.components.serverGco2ePerHour} gCO2e/hour
Device: ${result.calculation.components.deviceGco2ePerHour} gCO2e/hour
Storage: ${result.calculation.components.storageGco2ePerHour} gCO2e/hour
Total estimate: ${result.calculation.totalEstimatedGco2ePerHour} gCO2e/hour`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
