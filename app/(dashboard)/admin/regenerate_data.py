
import csv
import json
import os
import re
from datetime import datetime
from collections import defaultdict

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(BASE_DIR, 'chrome-store-data.json')

# Input files - using the (3) versions as requested
INSTALLS_FILE = os.path.join(BASE_DIR, 'Installs_ofdclafhpmccdddnmfalihgkahgiomjk.csv')
UNINSTALLS_FILE = os.path.join(BASE_DIR, 'Uninstalls_ofdclafhpmccdddnmfalihgkahgiomjk.csv')
WEEKLY_USERS_FILE = os.path.join(BASE_DIR, 'Weekly users over time_ofdclafhpmccdddnmfalihgkahgiomjk.csv')

# Find desktop export files. Load all of them so older months are preserved when
# a newer rolling export no longer includes the earliest weeks.
desktop_files = [f for f in os.listdir(BASE_DIR) if f.startswith('export-weekly-active-users-waus') and f.endswith('.csv')]
desktop_files.sort()
DESKTOP_WAU_FILES = [os.path.join(BASE_DIR, f) for f in desktop_files]

# Old files to remove
OLD_FILES = [
    os.path.join(BASE_DIR, 'Installs_ofdclafhpmccdddnmfalihgkahgiomjk (2).csv'),
    os.path.join(BASE_DIR, 'Uninstalls_ofdclafhpmccdddnmfalihgkahgiomjk (2).csv'),
    os.path.join(BASE_DIR, 'Weekly users over time_ofdclafhpmccdddnmfalihgkahgiomjk (2).csv')
]

# Date Threshold
START_DATE_FILTER = datetime(2024, 11, 1)
WAU_ADJUSTMENT_START_DATE = datetime(2026, 5, 4)

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, '%d/%m/%Y')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

def get_month_key(date_obj):
    return date_obj.strftime('%b %Y')

def get_sort_key(month_str):
    return datetime.strptime(month_str, '%b %Y').strftime('%Y-%m')

def load_csv_data(filepath, value_column_index=1):
    data = {} # date -> value
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        if not header[0].startswith('Date'):
             if 'Date' not in header[0]:
                header = next(reader)
        
        for row in reader:
            if not row: continue
            date_str = row[0]
            val = int(row[value_column_index])
            dt = parse_date(date_str)
            data[dt] = val
    return data

def get_export_date(filepath):
    match = re.search(r'(\d{4})-(\d{2})-(\d{2})', os.path.basename(filepath))
    if not match:
        return None
    return datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))

def parse_desktop_wau_header(header_col, reference_date=None):
    # Logic: Look for all months and years. Use the LAST one found in the string.
    # Text normalization
    clean_col = header_col.replace('–', '-').strip()
    
    # regex for months
    months_map = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    }
    
    # Find all matches of months
    # We want indices to know which is last
    last_month_idx = -1
    found_month = 0
    
    for m in months_map:
        # Check for Month name (case sensitive or not? usually Title case in these files)
        # Use simple string find for robustness if format is "Jan" or "January"?
        # Provided file is "Nov", "Dec", "Jan", "Feb".
        idx = clean_col.rfind(m)
        if idx > last_month_idx:
            last_month_idx = idx
            found_month = months_map[m]
            
    if found_month == 0:
        return 0, 0
        
    # Find year
    # Look for 4 digits 202x
    found_year = 0
    years = re.findall(r'202\d', clean_col)
    if years:
        found_year = int(years[-1])
    elif reference_date:
        found_year = reference_date.year if found_month <= reference_date.month else reference_date.year - 1
    else:
        # Heuristic based on month
        # If Jan-Apr -> 2026. If May-Dec -> 2025.
        if found_month <= 4:
            found_year = 2026
        else:
            found_year = 2025
            
    return found_month, found_year

def load_desktop_data(filepath):
    monthly_desktop = defaultdict(list)
    reference_date = get_export_date(filepath)
    
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            header = next(reader)
            if not header or len(header) < 2: return {}
            
            # Row 2 contains values (series name, val1, val2...)
            row = next(reader)
            if not row or len(row) < 2: return {}
            
            for i in range(1, len(header)):
                col_name = header[i]
                val_str = row[i]
                if not val_str: continue
                val = int(val_str)
                
                m, y = parse_desktop_wau_header(col_name, reference_date)
                if m > 0:
                    key = datetime(y, m, 1).strftime('%b %Y')
                    monthly_desktop[key].append(val)
                    
    except Exception as e:
        print(f"Error loading desktop data: {e}")
        return {}
        
    # Average them
    final_desktop = []
    for key, values in monthly_desktop.items():
        avg = sum(values) // len(values) if values else 0
        final_desktop.append({
            "month": key,
            "wauAvg": avg
        })
        
    # Sort
    final_desktop.sort(key=lambda x: get_sort_key(x['month']))
    return final_desktop

def build_adjusted_wau_data(sorted_dates, installs_data, uninstalls_data, weekly_users_data):
    adjusted_wau_data = {}
    adjustment_events = []
    cumulative_net_users = 0
    previous_adjusted_wau = 0

    for dt in sorted_dates:
        if dt < START_DATE_FILTER:
            continue

        cumulative_net_users += installs_data.get(dt, 0) - uninstalls_data.get(dt, 0)
        reported_wau = weekly_users_data.get(dt, 0)

        if reported_wau <= 0:
            adjusted_wau_data[dt] = 0
            continue

        daily_net_growth = max(0, installs_data.get(dt, 0) - uninstalls_data.get(dt, 0))

        if dt == WAU_ADJUSTMENT_START_DATE:
            adjustment_events.append({
                "date": dt.strftime('%b %d, %Y'),
                "reportedWau": reported_wau,
                "previousAdjustedWau": previous_adjusted_wau,
                "dailyNetGrowth": daily_net_growth,
                "reason": "Reported Chrome WAU jumped faster than installs can explain"
            })

        if dt >= WAU_ADJUSTMENT_START_DATE:
            adjusted_wau = min(cumulative_net_users, previous_adjusted_wau + daily_net_growth)
        else:
            adjusted_wau = reported_wau

        adjusted_wau_data[dt] = max(0, adjusted_wau)
        previous_adjusted_wau = adjusted_wau_data[dt]

    return adjusted_wau_data, WAU_ADJUSTMENT_START_DATE, adjustment_events

def main():
    print("Loading data...")
    
    installs_data = load_csv_data(INSTALLS_FILE)
    uninstalls_data = load_csv_data(UNINSTALLS_FILE)
    weekly_users_data = load_csv_data(WEEKLY_USERS_FILE)
    
    all_dates = set(installs_data.keys()) | set(uninstalls_data.keys()) | set(weekly_users_data.keys())
    sorted_dates = sorted(list(all_dates))
    adjusted_wau_data, anomaly_start_date, adjustment_events = build_adjusted_wau_data(
        sorted_dates,
        installs_data,
        uninstalls_data,
        weekly_users_data
    )

    monthly_stats = defaultdict(lambda: {
        'installs': 0,
        'uninstalls': 0,
        'wau_samples': [],
        'wau_start': None,
        'wau_end': None,
        'reported_wau_samples': [],
        'reported_wau_start': None,
        'reported_wau_end': None,
        'dates': []
    })

    for dt in sorted_dates:
        # Filter by date
        if dt < START_DATE_FILTER:
            continue
            
        month_key = get_month_key(dt)
        stats = monthly_stats[month_key]
        stats['dates'].append(dt)
        
        stats['installs'] += installs_data.get(dt, 0)
        stats['uninstalls'] += uninstalls_data.get(dt, 0)
        
        reported_wau = weekly_users_data.get(dt, 0)
        wau = adjusted_wau_data.get(dt, reported_wau)
        if wau > 0:
            stats['wau_samples'].append(wau)
            if stats['wau_start'] is None:
                stats['wau_start'] = wau
            stats['wau_end'] = wau

        if reported_wau > 0:
            stats['reported_wau_samples'].append(reported_wau)
            if stats['reported_wau_start'] is None:
                stats['reported_wau_start'] = reported_wau
            stats['reported_wau_end'] = reported_wau

    # Aggregate
    monthly_data_output = []
    sorted_months = sorted(monthly_stats.keys(), key=get_sort_key)
    
    total_installs = 0
    total_uninstalls = 0
    current_wau = 0
    
    last_date = sorted_dates[-1] if sorted_dates else None
    if last_date:
        current_wau = adjusted_wau_data.get(last_date, weekly_users_data.get(last_date, 0))

    for month in sorted_months:
        stats = monthly_stats[month]
        
        installs = stats['installs']
        uninstalls = stats['uninstalls']
        net_growth = installs - uninstalls
        
        total_installs += installs
        total_uninstalls += uninstalls
        
        wau_avg = 0
        if stats['wau_samples']:
            wau_avg = sum(stats['wau_samples']) // len(stats['wau_samples'])
        
        wau_start = stats['wau_start'] if stats['wau_start'] is not None else 0
        wau_end_month = stats['wau_end'] if stats['wau_end'] is not None else 0
        reported_wau_avg = 0
        if stats['reported_wau_samples']:
            reported_wau_avg = sum(stats['reported_wau_samples']) // len(stats['reported_wau_samples'])

        reported_wau_start = stats['reported_wau_start'] if stats['reported_wau_start'] is not None else 0
        reported_wau_end = stats['reported_wau_end'] if stats['reported_wau_end'] is not None else 0
        is_wau_adjusted = (
            reported_wau_avg != wau_avg
            or reported_wau_start != wau_start
            or reported_wau_end != wau_end_month
        )
        
        monthly_data_output.append({
            "month": month,
            "installs": installs,
            "uninstalls": uninstalls,
            "netGrowth": net_growth,
            "wauStart": wau_start,
            "wauEnd": wau_end_month,
            "wauAvg": wau_avg,
            "reportedWauStart": reported_wau_start,
            "reportedWauEnd": reported_wau_end,
            "reportedWauAvg": reported_wau_avg,
            "isWauAdjusted": is_wau_adjusted
        })

    adjusted_wau_values = [x for x in adjusted_wau_data.values() if x > 0]
    reported_wau_values = [x for x in weekly_users_data.values() if x > 0]
    peak_wau_date = max(adjusted_wau_data, key=adjusted_wau_data.get) if adjusted_wau_data else None
    reported_peak_wau_date = max(weekly_users_data, key=weekly_users_data.get) if weekly_users_data else None

    totals = {
        "totalInstalls": total_installs,
        "totalUninstalls": total_uninstalls,
        "netUsers": total_installs - total_uninstalls,
        "currentWau": current_wau,
        "reportedCurrentWau": weekly_users_data.get(last_date, 0) if last_date else 0,
        "peakWau": max(adjusted_wau_values) if adjusted_wau_values else 0,
        "peakWauDate": peak_wau_date.strftime('%b %d, %Y') if peak_wau_date else "",
        "reportedPeakWau": max(reported_wau_values) if reported_wau_values else 0,
        "reportedPeakWauDate": reported_peak_wau_date.strftime('%b %d, %Y') if reported_peak_wau_date else ""
    }

    start_wau = 0
    end_wau = current_wau
    if monthly_data_output:
        start_wau = monthly_data_output[0]['wauStart']
        
    wau_growth_percent = 0
    if start_wau > 0:
        wau_growth_percent = int(((end_wau - start_wau) / start_wau) * 100)
        
    wau_growth_x = "0x"
    if start_wau > 0:
        wau_growth_x = f"{round(end_wau / start_wau)}x"

    year_over_year = {
        "wauGrowth": wau_growth_x,
        "wauGrowthPercent": wau_growth_percent,
        "startWau": start_wau,
        "endWau": end_wau
    }
    wau_adjustment = {
        "enabled": anomaly_start_date is not None,
        "method": "Reported Chrome WAU is used through May 3, 2026; from May 4, 2026 onward, adjusted WAU grows only by daily net installs and is capped by net installed users.",
        "anomalyStartDate": anomaly_start_date.strftime('%b %d, %Y') if anomaly_start_date else "",
        "events": adjustment_events
    }
    
    # Desktop Data
    desktop_data_by_month = {}
    if DESKTOP_WAU_FILES:
        for desktop_file in DESKTOP_WAU_FILES:
            if not os.path.exists(desktop_file):
                continue
            print(f"Processing desktop file: {os.path.basename(desktop_file)}")
            for row in load_desktop_data(desktop_file):
                desktop_data_by_month[row["month"]] = row["wauAvg"]

        desktop_data = [
            {"month": month, "wauAvg": wau_avg}
            for month, wau_avg in desktop_data_by_month.items()
        ]
        desktop_data.sort(key=lambda x: get_sort_key(x['month']))
    else:
        print("No desktop WAU file found.")
        desktop_data = []

    output_json = {
        "monthlyData": monthly_data_output,
        "desktopData": desktop_data,
        "totals": totals,
        "yearOverYear": year_over_year,
        "wauAdjustment": wau_adjustment
    }
    
    with open(JSON_FILE, 'w') as f:
        json.dump(output_json, f, indent=4)
    
    print(f"Successfully updated {JSON_FILE}")
    
    for old_file in OLD_FILES:
        if os.path.exists(old_file):
            try:
                os.remove(old_file)
                print(f"Removed old file: {os.path.basename(old_file)}")
            except OSError as e:
                print(f"Error removing {old_file}: {e}")

if __name__ == '__main__':
    main()
