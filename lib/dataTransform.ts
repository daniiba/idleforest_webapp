interface Project {
  name: string;
  amount: number;
}

interface CountryData {
  amount: number;
  code: string;
  projects: Project[];
  image?: Array<{
    url: string;
    thumbnails: {
      small: { url: string };
      large: { url: string };
      full: { url: string };
    };
  }>;
  url?: string;
}

interface DataEntry {
  totalIncome: number;
  numberOfTreesFinanced: number;
  treeSurplusPercent: number;
  contextNote: Record<string, unknown>;
  expanses: {
    trees: { amount: number };
    greenInvestments: { amount: number; total: number };
    operationalCosts: { 
      amount: number;
      items: Array<{ amount: number; type: string }>;
    };
    taxes: { 
      amount: number;
      items: Array<{ amount: number; type: string }>;
    };
    marketing: { amount: number };
  };
  treePayments: {
    totalFund: number;
    fundTransaction: number;
    paidToProjects: number;
    projectsByCountry: Record<string, CountryData>;
  };
}

interface ProjectLocation {
  name: string;
  lat: number;
  lng: number;
  money: number;
  historicalData: Array<{ period: string; money: number }>;
  projectDetails: {
    startYear: number;
    partners: string[];
    image?: {
      url: string;
      alt: string;
    };
  };
  url?: string;
  image?: CountryData['image'];
}

const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  AF: { lat: 33.9391, lng: 67.7100 }, // Afghanistan
  AL: { lat: 41.1533, lng: 20.1683 }, // Albania
  DZ: { lat: 36.7538, lng: 3.0588 }, // Algeria
  AO: { lat: -11.2027, lng: 17.8739 }, // Angola
  AR: { lat: -38.4161, lng: -63.6167 }, // Argentina
  AM: { lat: 40.0691, lng: 45.0382 }, // Armenia
  AU: { lat: -25.2744, lng: 133.7751 }, // Australia
  AT: { lat: 47.5162, lng: 14.5501 }, // Austria
  AZ: { lat: 40.1431, lng: 47.5769 }, // Azerbaijan
  BD: { lat: 23.6850, lng: 90.3563 }, // Bangladesh
  BY: { lat: 53.7098, lng: 27.9534 }, // Belarus
  BE: { lat: 50.8503, lng: 4.3517 }, // Belgium
  BJ: { lat: 9.3077, lng: 2.3158 }, // Benin
  BT: { lat: 27.5142, lng: 90.4336 }, // Bhutan
  BO: { lat: -16.2902, lng: -63.5887 }, // Bolivia
  BA: { lat: 43.9159, lng: 17.6791 }, // Bosnia and Herzegovina
  BW: { lat: -22.3285, lng: 24.6849 }, // Botswana
  BR: { lat: -14.2350, lng: -51.9253 }, // Brazil
  BN: { lat: 4.5353, lng: 114.7277 }, // Brunei
  BG: { lat: 42.7339, lng: 25.4858 }, // Bulgaria
  BF: { lat: 12.2383, lng: -1.5616 }, // Burkina Faso
  BI: { lat: -3.3731, lng: 29.9189 }, // Burundi
  KH: { lat: 12.5657, lng: 104.9910 }, // Cambodia
  CM: { lat: 7.3697, lng: 12.3547 }, // Cameroon
  CA: { lat: 56.1304, lng: -106.3468 }, // Canada
  CF: { lat: 6.6111, lng: 20.9394 }, // Central African Republic
  TD: { lat: 15.4542, lng: 18.7322 }, // Chad
  CL: { lat: -35.6751, lng: -71.5430 }, // Chile
  CN: { lat: 35.8617, lng: 104.1954 }, // China
  CO: { lat: 4.5709, lng: -74.2973 }, // Colombia
  CD: { lat: -4.0383, lng: 21.7587 }, // Congo (DRC)
  CG: { lat: -0.2280, lng: 15.8277 }, // Congo
  CR: { lat: 9.7489, lng: -83.7534 }, // Costa Rica
  CI: { lat: 7.5400, lng: -5.5471 }, // Ivory Coast
  HR: { lat: 45.1000, lng: 15.2000 }, // Croatia
  CU: { lat: 21.5218, lng: -77.7812 }, // Cuba
  CZ: { lat: 49.8175, lng: 15.4730 }, // Czech Republic
  DK: { lat: 56.2639, lng: 9.5018 }, // Denmark
  DJ: { lat: 11.8251, lng: 42.5903 }, // Djibouti
  DO: { lat: 18.7357, lng: -70.1627 }, // Dominican Republic
  EC: { lat: -1.8312, lng: -78.1834 }, // Ecuador
  EG: { lat: 26.8206, lng: 30.8025 }, // Egypt
  SV: { lat: 13.7942, lng: -88.8965 }, // El Salvador
  GQ: { lat: 1.6508, lng: 10.2679 }, // Equatorial Guinea
  ER: { lat: 15.1794, lng: 39.7823 }, // Eritrea
  EE: { lat: 58.5953, lng: 25.0136 }, // Estonia
  ET: { lat: 9.1450, lng: 40.4897 }, // Ethiopia
  FJ: { lat: -17.7134, lng: 178.0650 }, // Fiji
  FI: { lat: 61.9241, lng: 25.7482 }, // Finland
  FR: { lat: 46.2276, lng: 2.2137 }, // France
  GA: { lat: -0.8037, lng: 11.6094 }, // Gabon
  GM: { lat: 13.4432, lng: -15.3101 }, // Gambia
  GE: { lat: 42.3154, lng: 43.3569 }, // Georgia
  DE: { lat: 51.1657, lng: 10.4515 }, // Germany
  GH: { lat: 7.9465, lng: -1.0232 }, // Ghana
  GR: { lat: 39.0742, lng: 21.8243 }, // Greece
  GT: { lat: 15.7835, lng: -90.2308 }, // Guatemala
  GN: { lat: 9.9456, lng: -9.6966 }, // Guinea
  GW: { lat: 11.8037, lng: -15.1804 }, // Guinea-Bissau
  GY: { lat: 4.8604, lng: -58.9302 }, // Guyana
  HT: { lat: 18.9712, lng: -72.2852 }, // Haiti
  HN: { lat: 15.2000, lng: -86.2419 }, // Honduras
  HU: { lat: 47.1625, lng: 19.5033 }, // Hungary
  IS: { lat: 64.9631, lng: -19.0208 }, // Iceland
  IN: { lat: 20.5937, lng: 78.9629 }, // India
  ID: { lat: -0.7893, lng: 113.9213 }, // Indonesia
  IR: { lat: 32.4279, lng: 53.6880 }, // Iran
  IQ: { lat: 33.2232, lng: 43.6793 }, // Iraq
  IE: { lat: 53.1424, lng: -7.6921 }, // Ireland
  IL: { lat: 31.0461, lng: 34.8516 }, // Israel
  IT: { lat: 41.8719, lng: 12.5674 }, // Italy
  JM: { lat: 18.1096, lng: -77.2975 }, // Jamaica
  JP: { lat: 36.2048, lng: 138.2529 }, // Japan
  JO: { lat: 30.5852, lng: 36.2384 }, // Jordan
  KZ: { lat: 48.0196, lng: 66.9237 }, // Kazakhstan
  KE: { lat: -0.0236, lng: 37.9062 }, // Kenya
  KW: { lat: 29.3117, lng: 47.4818 }, // Kuwait
  KG: { lat: 41.2044, lng: 74.7661 }, // Kyrgyzstan
  LA: { lat: 19.8563, lng: 102.4955 }, // Laos
  LV: { lat: 56.8796, lng: 24.6032 }, // Latvia
  LB: { lat: 33.8547, lng: 35.8623 }, // Lebanon
  LS: { lat: -29.6099, lng: 28.2336 }, // Lesotho
  LR: { lat: 6.4281, lng: -9.4295 }, // Liberia
  LY: { lat: 26.3351, lng: 17.2283 }, // Libya
  LT: { lat: 55.1694, lng: 23.8813 }, // Lithuania
  MG: { lat: -18.7669, lng: 46.8691 }, // Madagascar
  MW: { lat: -13.2543, lng: 34.3015 }, // Malawi
  MY: { lat: 4.2105, lng: 101.9758 }, // Malaysia
  ML: { lat: 17.5707, lng: -3.9962 }, // Mali
  MR: { lat: 21.0079, lng: -10.9408 }, // Mauritania
  MU: { lat: -20.3484, lng: 57.5522 }, // Mauritius
  MX: { lat: 23.6345, lng: -102.5528 }, // Mexico
  MD: { lat: 47.4116, lng: 28.3699 }, // Moldova
  MN: { lat: 46.8625, lng: 103.8467 }, // Mongolia
  ME: { lat: 42.7087, lng: 19.3744 }, // Montenegro
  MA: { lat: 31.7917, lng: -7.0926 }, // Morocco
  MZ: { lat: -18.6657, lng: 35.5296 }, // Mozambique
  MM: { lat: 21.9162, lng: 95.9560 }, // Myanmar
  NA: { lat: -22.9576, lng: 18.4904 }, // Namibia
  NP: { lat: 28.3949, lng: 84.1240 }, // Nepal
  NL: { lat: 52.1326, lng: 5.2913 }, // Netherlands
  NZ: { lat: -40.9006, lng: 174.8860 }, // New Zealand
  NI: { lat: 12.8654, lng: -85.2072 }, // Nicaragua
  NE: { lat: 17.6078, lng: 8.0817 }, // Niger
  NG: { lat: 9.0820, lng: 8.6753 }, // Nigeria
  KP: { lat: 40.3399, lng: 127.5101 }, // North Korea
  NO: { lat: 60.4720, lng: 8.4689 }, // Norway
  OM: { lat: 21.4735, lng: 55.9754 }, // Oman
  PK: { lat: 30.3753, lng: 69.3451 }, // Pakistan
  PA: { lat: 8.5380, lng: -80.7821 }, // Panama
  PG: { lat: -6.3150, lng: 143.9555 }, // Papua New Guinea
  PY: { lat: -23.4425, lng: -58.4438 }, // Paraguay
  PE: { lat: -9.1900, lng: -75.0152 }, // Peru
  PH: { lat: 12.8797, lng: 121.7740 }, // Philippines
  PL: { lat: 51.9194, lng: 19.1451 }, // Poland
  PT: { lat: 39.3999, lng: -8.2245 }, // Portugal
  QA: { lat: 25.3548, lng: 51.1839 }, // Qatar
  RO: { lat: 45.9432, lng: 24.9668 }, // Romania
  RU: { lat: 61.5240, lng: 105.3188 }, // Russia
  RW: { lat: -1.9403, lng: 29.8739 }, // Rwanda
  SA: { lat: 23.8859, lng: 45.0792 }, // Saudi Arabia
  SN: { lat: 14.4974, lng: -14.4524 }, // Senegal
  RS: { lat: 44.0165, lng: 21.0059 }, // Serbia
  SL: { lat: 8.4606, lng: -11.7799 }, // Sierra Leone
  SG: { lat: 1.3521, lng: 103.8198 }, // Singapore
  SK: { lat: 48.6690, lng: 19.6990 }, // Slovakia
  SI: { lat: 46.1512, lng: 14.9955 }, // Slovenia
  SO: { lat: 5.1521, lng: 46.1996 }, // Somalia
  ZA: { lat: -30.5595, lng: 22.9375 }, // South Africa
  KR: { lat: 35.9078, lng: 127.7669 }, // South Korea
  SS: { lat: 6.8770, lng: 31.3070 }, // South Sudan
  ES: { lat: 40.4637, lng: -3.7492 }, // Spain
  LK: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka
  SD: { lat: 12.8628, lng: 30.2176 }, // Sudan
  SR: { lat: 3.9193, lng: -56.0278 }, // Suriname
  SE: { lat: 60.1282, lng: 18.6435 }, // Sweden
  CH: { lat: 46.8182, lng: 8.2275 }, // Switzerland
  SY: { lat: 34.8021, lng: 38.9968 }, // Syria
  TW: { lat: 23.6978, lng: 120.9605 }, // Taiwan
  TJ: { lat: 38.8610, lng: 71.2761 }, // Tajikistan
  TZ: { lat: -6.3690, lng: 34.8888 }, // Tanzania
  TH: { lat: 15.8700, lng: 100.9925 }, // Thailand
  TG: { lat: 8.6195, lng: 0.8248 }, // Togo
  TN: { lat: 33.8869, lng: 9.5375 }, // Tunisia
  TR: { lat: 38.9637, lng: 35.2433 }, // Turkey
  TM: { lat: 38.9697, lng: 59.5563 }, // Turkmenistan
  UG: { lat: 1.3733, lng: 32.2903 }, // Uganda
  UA: { lat: 48.3794, lng: 31.1656 }, // Ukraine
  AE: { lat: 23.4241, lng: 53.8478 }, // United Arab Emirates
  GB: { lat: 55.3781, lng: -3.4360 }, // United Kingdom
  US: { lat: 37.0902, lng: -95.7129 }, // United States
  UY: { lat: -32.5228, lng: -55.7658 }, // Uruguay
  UZ: { lat: 41.3775, lng: 64.5853 }, // Uzbekistan
  VE: { lat: 6.4238, lng: -66.5897 }, // Venezuela
  VN: { lat: 14.0583, lng: 108.2772 }, // Vietnam
  YE: { lat: 15.5527, lng: 48.5164 }, // Yemen
  ZM: { lat: -13.1339, lng: 27.8493 }, // Zambia
  ZW: { lat: -19.0154, lng: 29.1549 }  // Zimbabwe
};

// Rest of the file remains the same...

import data from './data.json';

// Sort data by period when importing
const sortedData = Object.fromEntries(
  Object.entries(data)
    .sort(([periodA], [periodB]) => {
      const [yearA, monthA] = periodA.split('-').map(Number);
      const [yearB, monthB] = periodB.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    })
);

const typedData = sortedData as unknown as Record<string, DataEntry>;



export const getMonthlyData = () => {
  return Object.entries(typedData).map(([period, values]) => {
    const expenses = values.expanses.trees.amount +
      values.expanses.greenInvestments.amount +
      values.expanses.operationalCosts.amount +
      values.expanses.taxes.amount +
      values.expanses.marketing.amount;

    return {
      period,
      income: values.totalIncome,
      trees: values.numberOfTreesFinanced,
      paidProjects: values.treePayments.paidToProjects,
      expenses,
      greenInvestments: values.expanses.greenInvestments.amount,
      operationalCosts: values.expanses.operationalCosts.amount,
      taxes: values.expanses.taxes.amount,
      marketing: values.expanses.marketing.amount,
      treeFund: values.treePayments.totalFund,
      fundTransaction: values.treePayments.fundTransaction
    };
  }).sort((a, b) => {
      const [yearA, monthA] = a.period.split('-').map(Number);
      const [yearB, monthB] = b.period.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
};

export const getHistoricalTreeData = () => {
  return Object.entries(typedData).map(([period, values]) => ({
    period,
    numberOfTreesFinanced: values.numberOfTreesFinanced,
    treeSurplusPercent: values.treeSurplusPercent
  }));
};

export const getProjectLocations = () => {
  return Object.entries(typedData).reduce((acc, [period, values]) => {
    Object.entries(values.treePayments.projectsByCountry).forEach(([countryName, countryData]) => {
      const existingProject = acc.find(p => p.name === countryName);
      const coordinates = countryCoordinates[countryData.code];
      
      if (existingProject) {
        existingProject.historicalData.push({
          period,
          money: countryData.amount
        });
        existingProject.money += countryData.amount;
        if (countryData.image && !existingProject.image) {
          existingProject.image = countryData.image;
        }
      } else {
        acc.push({
          name: countryName,
          lat: coordinates?.lat || 0,
          lng: coordinates?.lng || 0,
          money: countryData.amount,
          historicalData: [{
            period,
            money: countryData.amount
          }],
          projectDetails: {
            startYear: parseInt(period.split('-')[0]),
            partners: countryData.projects.map(p => p.name),
            image: countryData.image?.[0] ? {
              url: countryData.image[0].thumbnails.large.url,
              alt: `${countryName} project image`
            } : undefined
          },
          url: countryData.url,
          image: countryData.image
        });
      }
    });
    return acc;
  }, [] as ProjectLocation[]).map(project => ({
    ...project,
    historicalData: project.historicalData.sort((a, b) => a.period.localeCompare(b.period))
  }));
};

export const transformedData = typedData;