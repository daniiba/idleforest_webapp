export const linuxDownloadHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to install the IdleForest tree-planting app on Linux",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Download the package",
      "text": "Click Download for Linux on this page to get the 64-bit .deb package.",
      "url": "https://www.idleforest.com/download/linux#step-1",
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Install the package",
      "text": "Open the downloaded .deb file with your system package installer and follow the prompts.",
      "url": "https://www.idleforest.com/download/linux#step-2",
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Launch IdleForest",
      "text": "Open IdleForest once. No account or settings are needed, and trees get funded as you use your computer.",
      "url": "https://www.idleforest.com/download/linux#step-3",
    },
  ],
};

export const linuxDownloadFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is the Linux app free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. There is no cost, subscription, or donation. IdleForest is funded by revenue from idle bandwidth tasks, not by you.",
      },
    },
    {
      "@type": "Question",
      "name": "Which Linux systems does IdleForest support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The first Linux release is a 64-bit .deb package for x64 Linux systems that support Debian packages.",
      },
    },
    {
      "@type": "Question",
      "name": "Will IdleForest slow down my computer or internet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. IdleForest uses only bandwidth you are not using and steps back when you need your connection.",
      },
    },
    {
      "@type": "Question",
      "name": "Do I need the Chrome extension too?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The Linux app works on its own, including when your browser is closed. You can run both, but you do not need to.",
      },
    },
  ],
};

export const linuxDownloadBreadcrumbSchema = {
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
      "name": "Linux App",
      "item": "https://www.idleforest.com/download/linux",
    },
  ],
};

export const linuxDownloadSchemas = [
  linuxDownloadHowToSchema,
  linuxDownloadFaqSchema,
  linuxDownloadBreadcrumbSchema,
];
