# Carbon App Studies

This folder is for original IdleForest measurements that can support Carbon Hub pages.

The goal is not to claim official vendor emissions. The goal is to publish a transparent, repeatable estimate based on measured app data transfer plus explicit assumptions for device energy, server processing, and storage.

## Discord Study Protocol

Run each scenario at least three times, then publish the median and range.

| Scenario | What to do during the run |
| --- | --- |
| `discord-idle` | Leave Discord open with no intentional interaction. |
| `discord-text` | Send/read text messages, switch channels, react to messages. |
| `discord-media` | Browse image, GIF, embed, and file previews in active channels. |
| `discord-voice` | Join a voice call with one other participant. |
| `discord-video` | Join a video call with one other participant. |
| `discord-screen-share` | Watch or broadcast a screen share/stream. |

Recommended starting command:

```bash
pnpm carbon:study -- --app discord --scenario discord-voice --duration 600 --baseline-duration 120 --client "Discord desktop" --device "MacBook"
```

Short test run:

```bash
pnpm carbon:study -- --app discord --scenario discord-text --duration 30 --baseline-duration 10
```

Full-model example with explicit assumptions:

```bash
pnpm carbon:study -- \
  --app discord \
  --scenario discord-media \
  --duration 600 \
  --baseline-duration 120 \
  --client "Discord desktop" \
  --device "MacBook" \
  --network-gco2e-per-gb 55 \
  --server-gco2e-per-gb 15 \
  --device-watts 9 \
  --baseline-device-watts 6 \
  --electricity-gco2e-kwh 180 \
  --storage-gb-added 0.05 \
  --storage-days 365 \
  --storage-gco2e-gb-month 2
```

The script writes one JSON file per run and appends a row to `docs/carbon-studies/results/index.csv`.

After three or more comparable runs, generate a summary table:

```bash
pnpm carbon:study:summary -- --app discord
```

That writes `docs/carbon-studies/results/discord-summary.md` with medians and ranges by scenario.

## Measurement Limits

The runner measures aggregate traffic on the selected network interface, then subtracts a baseline. Device, server, and storage components are modeled from explicit command-line assumptions and stored in the result JSON.

Before a run:

- Close cloud sync, browser tabs, video calls, updates, and downloads.
- Use the same device, network, Discord client, and participants across scenarios.
- Record the client, device, and any caveats in `--client`, `--device`, and `--notes`.
- Keep the same factor assumptions across the whole study.
- Record durable media added during the scenario with `--storage-gb-added` when testing image/video uploads.
- Record device power assumptions with `--device-watts`, `--baseline-device-watts`, and `--electricity-gco2e-kwh` when testing video/screen-share modes.

Do not describe the output as Discord's official carbon footprint. Use language like:

> IdleForest measured Discord data transfer across controlled scenarios and converted the measured GB/hour to estimated CO2e/hour using a published digital-emissions methodology.

## Calculation

The runner calculates:

```text
baseline_GB_per_hour = baseline_bytes / baseline_seconds * 3600 / 1,000,000,000
raw_scenario_GB_per_hour = scenario_bytes / scenario_seconds * 3600 / 1,000,000,000
adjusted_GB_per_hour = max(0, raw_scenario_GB_per_hour - baseline_GB_per_hour)

network_gCO2e_per_hour = adjusted_GB_per_hour * network_gCO2e_per_GB
server_gCO2e_per_hour = adjusted_GB_per_hour * server_gCO2e_per_GB
device_gCO2e_per_hour =
  max(0, device_watts - baseline_device_watts) / 1000 * electricity_gCO2e_per_kWh
storage_GB_per_hour = storage_GB_added / scenario_hours
storage_gCO2e_per_hour =
  storage_GB_per_hour * storage_days / 30.4375 * storage_gCO2e_per_GB_month

total_gCO2e_per_hour =
  network + server + device + storage
```

The default carbon factor is intentionally configurable in the command:

```bash
pnpm carbon:study -- --network-gco2e-per-gb 55 ...
```

Before publishing, replace or justify every factor with the final methodology source used by the Carbon Hub page, such as Green Web Foundation CO2.js / Sustainable Web Design Model v4 for network transfer and a clearly named source for electricity and storage factors.

Useful methodology references:

- Green Web Foundation CO2.js: https://developers.thegreenwebfoundation.org/co2js/overview/
- Sustainable Web Design Model: https://sustainablewebdesign.org/
- Website Carbon methodology notes: https://www.websitecarbon.com/how-does-it-work/

## Publishing Checklist

- At least three runs per scenario.
- Median and range reported, not only a single run.
- Raw JSON/CSV retained.
- Formula, factor sources, run date, device, client, and limitations shown.
- Components reported separately: network, server, device, storage, and total.
- Supabase `carbon_apps.seo_content` says "IdleForest measured estimate" and "not a Discord vendor disclosure."
