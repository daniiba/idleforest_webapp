
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
INSTALLS_FILE = os.path.join(BASE_DIR, 'Installs_ofdclafhpmccdddnmfalihgkahgiomjk (3).csv')
UNINSTALLS_FILE = os.path.join(BASE_DIR, 'Uninstalls_ofdclafhpmccdddnmfalihgkahgiomjk (3).csv')
WEEKLY_USERS_FILE = os.path.join(BASE_DIR, 'Weekly users over time_ofdclafhpmccdddnmfalihgkahgiomjk (3).csv')

# Find the latest desktop export file
desktop_files = [f for f in os.listdir(BASE_DIR) if f.startswith('export-weekly-active-users-waus') and f.endswith('.csv')]
desktop_files.sort(reverse=True) # Last one alphabetically (timestamped) should be latest
DESKTOP_WAU_FILE = os.path.join(BASE_DIR, desktop_files[0]) if desktop_files else None

# Old files to remove
OLD_FILES = [
    os.path.join(BASE_DIR, 'Installs_ofdclafhpmccdddnmfalihgkahgiomjk (2).csv'),
    os.path.join(BASE_DIR, 'Uninstalls_ofdclafhpmccdddnmfalihgkahgiomjk (2).csv'),
    os.path.join(BASE_DIR, 'Weekly users over time_ofdclafhpmccdddnmfalihgkahgiomjk (2).csv')
]

# Date Threshold
START_DATE_FILTER = datetime(2024, 11, 1)

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

def parse_desktop_wau_header(header_col):
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
                
                m, y = parse_desktop_wau_header(col_name)
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

def main():
    print("Loading data...")
    
    installs_data = load_csv_data(INSTALLS_FILE)
    uninstalls_data = load_csv_data(UNINSTALLS_FILE)
    weekly_users_data = load_csv_data(WEEKLY_USERS_FILE)
    
    monthly_stats = defaultdict(lambda: {
        'installs': 0, 
        'uninstalls': 0, 
        'wau_samples': [],
        'wau_start': None,
        'wau_end': None,
        'dates': []
    })
    
    all_dates = set(installs_data.keys()) | set(uninstalls_data.keys()) | set(weekly_users_data.keys())
    sorted_dates = sorted(list(all_dates))
    
    for dt in sorted_dates:
        # Filter by date
        if dt < START_DATE_FILTER:
            continue
            
        month_key = get_month_key(dt)
        stats = monthly_stats[month_key]
        stats['dates'].append(dt)
        
        stats['installs'] += installs_data.get(dt, 0)
        stats['uninstalls'] += uninstalls_data.get(dt, 0)
        
        wau = weekly_users_data.get(dt, 0)
        if wau > 0:
            stats['wau_samples'].append(wau)
            if stats['wau_start'] is None:
                stats['wau_start'] = wau
            stats['wau_end'] = wau

    # Aggregate
    monthly_data_output = []
    sorted_months = sorted(monthly_stats.keys(), key=get_sort_key)
    
    total_installs = 0
    total_uninstalls = 0
    current_wau = 0
    
    last_date = sorted_dates[-1] if sorted_dates else None
    if last_date:
        current_wau = weekly_users_data.get(last_date, 0)

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
        
        monthly_data_output.append({
            "month": month,
            "installs": installs,
            "uninstalls": uninstalls,
            "netGrowth": net_growth,
            "wauStart": wau_start,
            "wauEnd": wau_end_month,
            "wauAvg": wau_avg
        })

    totals = {
        "totalInstalls": total_installs,
        "totalUninstalls": total_uninstalls,
        "netUsers": total_installs - total_uninstalls,
        "currentWau": current_wau,
        "peakWau": max([x for x in weekly_users_data.values() if x > 0]) if weekly_users_data else 0,
        "peakWauDate": max(weekly_users_data, key=weekly_users_data.get).strftime('%b %d, %Y') if weekly_users_data else ""
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
    
    # Desktop Data
    desktop_data = []
    if DESKTOP_WAU_FILE and os.path.exists(DESKTOP_WAU_FILE):
        print(f"Processing desktop file: {os.path.basename(DESKTOP_WAU_FILE)}")
        desktop_data = load_desktop_data(DESKTOP_WAU_FILE)
    else:
        print("No desktop WAU file found.")

    output_json = {
        "monthlyData": monthly_data_output,
        "desktopData": desktop_data,
        "totals": totals,
        "yearOverYear": year_over_year
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
