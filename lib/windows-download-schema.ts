export const windowsDownloadHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to install the IdleForest tree-planting app on Windows",
  "totalTime": "PT1M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Download the app",
      "text": "Click Download for Windows on this page to get the .exe installer.",
      "url": "https://www.idleforest.com/download/windows#step-1",
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Run the Installer",
      "text": "Open the downloaded .exe file and follow the prompts. The install takes about a minute.",
      "url": "https://www.idleforest.com/download/windows#step-2",
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "You are done",
      "text": "Open IdleForest once and it runs on its own. No account or settings needed, and trees get funded as you use your computer.",
      "url": "https://www.idleforest.com/download/windows#step-3",
    },
  ],
};

export const windowsDownloadFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is the Windows app free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. There is no cost, no subscription, and no donation. The app is funded by the revenue from idle bandwidth tasks, not by you.",
      },
    },
    {
      "@type": "Question",
      "name": "Will it slow down my computer or internet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The app uses only the bandwidth you are not using, and it steps back the moment you need it. When you start a video call, open a heavy site, or download a file, the app backs off. Your computer keeps its full speed.",
      },
    },
    {
      "@type": "Question",
      "name": "Which versions of Windows does it support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "IdleForest runs on Windows 10 and Windows 11. The app is light and runs in the background without slowing your machine.",
      },
    },
    {
      "@type": "Question",
      "name": "Is it safe to install?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. IdleForest is featured on the Chrome Web Store and rated 4.8 stars from 33 reviews. The app runs in the background and touches only spare bandwidth, not your personal data.",
      },
    },
    {
      "@type": "Question",
      "name": "What data passes through my connection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Automated data requests from paying clients, such as uptime checks and price lookups. None of it is yours. Your files, logins, and browsing history never enter the process, and the tasks carry no cookies or identifiers.",
      },
    },
    {
      "@type": "Question",
      "name": "Do I need the Chrome extension too?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The desktop app works on its own and funds more trees than the extension because it runs even when your browser is closed. You can run both if you like, but you do not need to.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I uninstall it on Windows?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Open Settings, go to Apps, find IdleForest, and click uninstall. Once removed, no bandwidth is used. The trees you have already funded stay funded.",
      },
    },
  ],
};

export const windowsDownloadBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.idleforest.com/",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Windows App",
      "item": "https://www.idleforest.com/download/windows",
    },
  ],
};

export const windowsDownloadSchemas = [
  windowsDownloadHowToSchema,
  windowsDownloadFaqSchema,
  windowsDownloadBreadcrumbSchema,
];
