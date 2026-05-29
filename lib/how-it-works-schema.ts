export const howItWorksHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How IdleForest plants trees with your idle bandwidth",
  "totalTime": "PT10S",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Install the app",
      "text": "Add the Chrome extension in one click, or install the desktop app for Mac or Windows. No account, no payment.",
      "url": "https://www.idleforest.com/how-it-works#step-1",
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "It runs small data tasks in the background",
      "text": "The app sends small, sessionless data tasks through your spare bandwidth, with no cookies or personal data.",
      "url": "https://www.idleforest.com/how-it-works#step-2",
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Companies pay for those tasks",
      "text": "Businesses pay to run these tasks across many connections, and that revenue adds up across all users.",
      "url": "https://www.idleforest.com/how-it-works#step-3",
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "The money funds verified tree planting",
      "text": "IdleForest sends the revenue to reforestation partners who plant and verify the trees.",
      "url": "https://www.idleforest.com/how-it-works#step-4",
    },
  ],
};

export const howItWorksFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is IdleForest really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. There is no cost, no subscription, and no donation. You do not pay, and you are not asked to. The trees are funded by the revenue from idle bandwidth tasks, not by you.",
      },
    },
    {
      "@type": "Question",
      "name": "Will it slow down my computer or internet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The app uses only the bandwidth you are not using, and it steps aside the moment you need it. When you start a video call, open a heavy site, or download a file, IdleForest backs off. Your browsing keeps its full speed.",
      },
    },
    {
      "@type": "Question",
      "name": "What data passes through my connection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Automated data requests from paying clients, such as uptime checks and price lookups. None of it is yours. Your logins, files, and browsing history never enter the process, and the tasks carry no cookies or identifiers.",
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
      "name": "Can I use it with Ecosia or another search engine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. IdleForest does not change your search engine, your browser, or any setting. It runs alongside whatever you already use, including Ecosia, Brave, and Firefox. You can stack the impact.",
      },
    },
    {
      "@type": "Question",
      "name": "How much bandwidth does it use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only what is spare. The app reads how much capacity is free and uses a small part of it. When your connection gets busy, it backs off on its own, so you do not notice it running.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I know the trees are real?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The money goes to named reforestation partners who plant and verify the trees on the ground. You can see the running totals and the partners on the transparency page, with reports from each partner.",
      },
    },
    {
      "@type": "Question",
      "name": "Does it work on mobile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not yet. IdleForest runs as a Chrome extension and as a desktop app for Mac and Windows. Mobile networks carry far less idle bandwidth than home connections, so a mobile version is on the roadmap but not live.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I pause or uninstall it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can pause it at any time from the extension menu, or remove it like any other extension or program. Once removed, no bandwidth is used and no data is collected. The trees you have already funded stay funded.",
      },
    },
  ],
};

export const howItWorksBreadcrumbSchema = {
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
      "name": "How It Works",
      "item": "https://www.idleforest.com/how-it-works",
    },
  ],
};

export const howItWorksSchemas = [
  howItWorksHowToSchema,
  howItWorksFaqSchema,
  howItWorksBreadcrumbSchema,
];
