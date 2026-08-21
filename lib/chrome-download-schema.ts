export const chromeDownloadHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to add the IdleForest tree-planting extension to Chrome",
  "totalTime": "PT10S",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Open the Chrome Web Store listing",
      "text": "Click Add to Chrome on this page to open the official IdleForest listing.",
      "url": "https://www.idleforest.com/download/chrome#step-1",
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Click Add to Chrome",
      "text": "On the store listing, click Add to Chrome and confirm. Chrome installs the extension.",
      "url": "https://www.idleforest.com/download/chrome#step-2",
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "You are done",
      "text": "The extension starts on its own. No account or settings needed, and trees get funded as you browse.",
      "url": "https://www.idleforest.com/download/chrome#step-3",
    },
  ],
};

export const chromeDownloadFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is the Chrome extension free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. There is no cost, no subscription, and no donation. The extension is funded by the revenue from idle bandwidth tasks, not by you.",
      },
    },
    {
      "@type": "Question",
      "name": "Will the extension slow down Chrome or my internet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. It uses only the bandwidth you are not using, and it steps back the moment you need it. When you start a video call, open a heavy site, or download a file, the extension backs off. Your browsing keeps its full speed.",
      },
    },
    {
      "@type": "Question",
      "name": "Is the extension safe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. IdleForest is featured on the Chrome Web Store and rated 4.8 stars from 33 reviews. It runs in the background and touches only spare bandwidth, not your personal data.",
      },
    },
    {
      "@type": "Question",
      "name": "What permissions does it need?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The extension needs the permissions Chrome requires to run background network tasks. It does not read your tabs, your bookmarks, or your browsing history. You can review the permissions on the store listing before you install.",
      },
    },
    {
      "@type": "Question",
      "name": "Does it work with Ecosia or other extensions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. IdleForest does not change your search engine or your other extensions. It runs alongside Ecosia, ad blockers, and anything else you already use. You can stack the impact.",
      },
    },
    {
      "@type": "Question",
      "name": "How do the trees get planted?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The extension uses your idle bandwidth to run small data tasks for paying clients. That revenue funds planting with Trees for the Future, Tree-Nation, and 1ClickImpact. You can see the live count on the transparency page.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I remove the extension?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Right-click the IdleForest icon in Chrome and choose remove, or manage it from the extensions menu. Once removed, no bandwidth is used. The trees you have already funded stay funded.",
      },
    },
    {
      "@type": "Question",
      "name": "Is there a version for Mac, Windows, or Linux?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. If you would rather run it outside the browser, IdleForest has a desktop app for Mac, Windows, and Linux. The desktop app can fund more trees because it runs even when Chrome is closed.",
      },
    },
  ],
};

export const chromeDownloadBreadcrumbSchema = {
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
      "name": "Chrome Extension",
      "item": "https://www.idleforest.com/download/chrome",
    },
  ],
};

export const chromeDownloadSchemas = [
  chromeDownloadHowToSchema,
  chromeDownloadFaqSchema,
  chromeDownloadBreadcrumbSchema,
];
