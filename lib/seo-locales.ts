export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  fr: 'Français',
};

export const HOME_META_BY_LOCALE: Record<string, { title: string; description: string }> = {
  en: {
    title: 'IdleForest: The Free Tree Planting App, Plant While Browsing',
    description: 'The free tree planting app that works in the background. Install IdleForest and plant verified trees while you browse, no donations, no signup needed.',
  },
  es: {
    title: 'Planta árboles gratis mientras navegas | IdleForest',
    description: 'Planta árboles automáticamente sin cambiar tu forma de navegar. IdleForest usa ancho de banda inactivo para financiar reforestación.',
  },
  de: {
    title: 'Kostenlos Bäume pflanzen beim Surfen | IdleForest',
    description: 'Pflanze automatisch Bäume, ohne dein Surfverhalten zu ändern. IdleForest nutzt ungenutzte Bandbreite, um Wiederaufforstung zu finanzieren.',
  },
  pt: {
    title: 'Plante árvores grátis enquanto navega | IdleForest',
    description: 'Plante árvores automaticamente sem mudar a forma como navega. O IdleForest usa largura de banda inativa para financiar reflorestação.',
  },
  fr: {
    title: 'Plantez des arbres gratuitement en naviguant | IdleForest',
    description: 'Plantez des arbres automatiquement sans changer votre navigation. IdleForest utilise la bande passante inactive pour financer la reforestation.',
  },
};

export const DISCORD_BOT_TITLE_BY_LOCALE: Record<string, string> = {
  en: "Discord Bot | IdleForest - Grow Your Server's Forest",
  es: 'Bot de Discord | IdleForest - Haz crecer el bosque de tu servidor',
  de: 'Discord-Bot | IdleForest - Lass den Wald deines Servers wachsen',
  pt: 'Bot do Discord | IdleForest - Faça crescer a floresta do seu servidor',
  fr: 'Bot Discord | IdleForest - Faites grandir la forêt de votre serveur',
};

export const BUSINESS_TITLE_BY_LOCALE: Record<string, string> = {
  en: 'IdleForest for Business | ESG Reforestation for Teams',
  es: 'IdleForest para empresas | Reforestación ESG para equipos',
  de: 'IdleForest für Unternehmen | ESG-Aufforstung für Teams',
  pt: 'IdleForest para empresas | Reflorestação ESG para equipas',
  fr: 'IdleForest pour les entreprises | Reforestation ESG pour les équipes',
};

export const TEAMS_TITLE_BY_LOCALE: Record<string, string> = {
  en: 'Teams & Rankings - Leaderboards | IdleForest',
  es: 'Equipos y rankings - Clasificaciones | IdleForest',
  de: 'Teams und Rankings - Bestenlisten | IdleForest',
  pt: 'Equipas e rankings - Classificações | IdleForest',
  fr: 'Equipes et classements - Leaderboards | IdleForest',
};

export function getLocaleMeta<T>(items: Record<string, T>, locale: string): T {
  return items[locale] || items.en;
}
