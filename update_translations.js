const fs = require('fs');

const translations = {
  en: {
    Map: {
      title: "Planting Map – IdleForest",
      description: "Explore the interactive map of where IdleForest has planted trees with our partners.",
      heading: "Our planting map",
      text: "See where we've planted trees with partners like Trees for the Future and Tree-Nation. This map updates as we plant more."
    },
    Teams: {
      placeholder_search: "Search Teams",
      loading_teams: "Loading teams...",
      no_teams: "No Teams Found",
      no_teams_search: "No teams match your search",
      create_team_prompt: "Create a team to get started",
      loading_rankings: "Loading rankings...",
      all_time_rankings_label: "All-Time User Rankings",
      top_earners_label: "Top Earners",
      top_teams_label: "Top Teams",
      fastest_growing: "Fastest Growing",
      no_users: "No users found",
      no_data: "No data for this period",
      fastest_growing_label: "Fastest Growing (New Members)",
      members_total: "members total",
      no_teams_gained: "No teams gained members this period",
      created: "Created",
      period_today: "Today",
      period_week: "This Week",
      period_month: "This Month",
      all_time: "All Time",
      top_users: "Top Users",
      points: "Points",
      new_members: "New Members"
    },
    Report: {
      title: "Annual Report & Analytics | IdleForest",
      description: "View IdleForest's annual report and live analytics — trees planted, active users, bandwidth shared, and revenue generated for reforestation projects worldwide.",
      annual: "Annual",
      report: "Report",
      annual_report: "Annual Report",
      analytics: "Analytics",
      historical_data: "Historical Data",
      about_title: "About IdleForest",
      about_desc: "IdleForest is a passive browser extension that plants trees while you browse, game, or stream. It uses your unused internet bandwidth to fund reforestation projects.",
      free_to_use: "Free to use",
      no_account: "No account required",
      open_source: "Open source"
    }
  },
  es: {
    Map: {
      title: "Mapa de Plantación – IdleForest",
      description: "Explora el mapa interactivo de dónde IdleForest ha plantado árboles con nuestros socios.",
      heading: "Nuestro mapa de plantación",
      text: "Mira dónde hemos plantado árboles con socios como Trees for the Future y Tree-Nation. Este mapa se actualiza a medida que plantamos más."
    },
    Teams: {
      placeholder_search: "Buscar Equipos",
      loading_teams: "Cargando equipos...",
      no_teams: "No se encontraron equipos",
      no_teams_search: "Ningún equipo coincide con tu búsqueda",
      create_team_prompt: "Crea un equipo para empezar",
      loading_rankings: "Cargando clasificaciones...",
      all_time_rankings_label: "Clasificación de Usuarios Histórica",
      top_earners_label: "Mayores Ganadores",
      top_teams_label: "Mejores Equipos",
      fastest_growing: "Crecimiento Rápido",
      no_users: "No se encontraron usuarios",
      no_data: "No hay datos para este período",
      fastest_growing_label: "Crecimiento Rápido (Nuevos Miembros)",
      members_total: "miembros totales",
      no_teams_gained: "Ningún equipo ganó miembros este período",
      created: "Creado",
      period_today: "Hoy",
      period_week: "Esta Semana",
      period_month: "Este Mes",
      all_time: "Historico",
      top_users: "Mejores Usuarios",
      points: "Puntos",
      new_members: "Nuevos Miembros"
    },
    Report: {
      title: "Informe Anual y Análisis | IdleForest",
      description: "Ve el informe anual de IdleForest y análisis en vivo: árboles plantados, usuarios activos, ancho de banda compartido e ingresos generados para proyectos de reforestación.",
      annual: "Anual",
      report: "Informe",
      annual_report: "Informe Anual",
      analytics: "Análisis",
      historical_data: "Datos Históricos",
      about_title: "Acerca de IdleForest",
      about_desc: "IdleForest es una extensión de navegador pasiva que planta árboles mientras navegas, juegas o transmites. Usa tu ancho de banda de internet no utilizado para financiar proyectos de reforestación.",
      free_to_use: "Gratis de usar",
      no_account: "No requiere cuenta",
      open_source: "Código abierto"
    }
  },
  fr: {
    Map: {
      title: "Carte des Plantations – IdleForest",
      description: "Explorez la carte interactive des endroits où IdleForest a planté des arbres avec nos partenaires.",
      heading: "Notre carte des plantations",
      text: "Découvrez où nous avons planté des arbres avec des partenaires comme Trees for the Future et Tree-Nation. Cette carte est mise à jour au fur et à mesure de nos plantations."
    },
    Teams: {
      placeholder_search: "Rechercher des Équipes",
      loading_teams: "Chargement des équipes...",
      no_teams: "Aucune équipe trouvée",
      no_teams_search: "Aucune équipe ne correspond à votre recherche",
      create_team_prompt: "Créez une équipe pour commencer",
      loading_rankings: "Chargement des classements...",
      all_time_rankings_label: "Classement Général des Utilisateurs",
      top_earners_label: "Meilleurs Contributeurs",
      top_teams_label: "Meilleures Équipes",
      fastest_growing: "Croissance Rapide",
      no_users: "Aucun utilisateur trouvé",
      no_data: "Aucune donnée pour cette période",
      fastest_growing_label: "Croissance Rapide (Nouveaux Membres)",
      members_total: "membres au total",
      no_teams_gained: "Aucune équipe n'a gagné de membres cette période",
      created: "Créé",
      period_today: "Aujourd'hui",
      period_week: "Cette Semaine",
      period_month: "Ce Mois",
      all_time: "Toujours",
      top_users: "Meilleurs Utilisateurs",
      points: "Points",
      new_members: "Nouveaux Membres"
    },
    Report: {
      title: "Rapport Annuel & Analyses | IdleForest",
      description: "Consultez le rapport annuel et les analyses en direct d'IdleForest — arbres plantés, utilisateurs actifs, bande passante partagée et revenus générés pour les projets de reforestation.",
      annual: "Annuel",
      report: "Rapport",
      annual_report: "Rapport Annuel",
      analytics: "Analyses",
      historical_data: "Données Historiques",
      about_title: "À propos d'IdleForest",
      about_desc: "IdleForest est une extension de navigateur passive qui plante des arbres pendant que vous naviguez, jouez ou streamez. Elle utilise votre bande passante inutilisée pour financer des projets de reforestation.",
      free_to_use: "Gratuit à utiliser",
      no_account: "Aucun compte requis",
      open_source: "Open source"
    }
  },
  de: {
    Map: {
      title: "Pflanzkarte – IdleForest",
      description: "Erkunden Sie die interaktive Karte der Orte, an denen IdleForest mit unseren Partnern Bäume gepflanzt hat.",
      heading: "Unsere Pflanzkarte",
      text: "Sehen Sie, wo wir mit Partnern wie Trees for the Future und Tree-Nation Bäume gepflanzt haben. Diese Karte wird aktualisiert, wenn wir mehr pflanzen."
    },
    Teams: {
      placeholder_search: "Teams suchen",
      loading_teams: "Teams werden geladen...",
      no_teams: "Keine Teams gefunden",
      no_teams_search: "Keine Teams entsprechen Ihrer Suche",
      create_team_prompt: "Erstellen Sie ein Team, um zu beginnen",
      loading_rankings: "Ranglisten werden geladen...",
      all_time_rankings_label: "Allzeit-Benutzerrangliste",
      top_earners_label: "Top-Verdiener",
      top_teams_label: "Top-Teams",
      fastest_growing: "Am schnellsten wachsend",
      no_users: "Keine Benutzer gefunden",
      no_data: "Keine Daten für diesen Zeitraum",
      fastest_growing_label: "Am schnellsten wachsend (Neue Mitglieder)",
      members_total: "Mitglieder insgesamt",
      no_teams_gained: "Keine Teams haben in diesem Zeitraum Mitglieder gewonnen",
      created: "Erstellt",
      period_today: "Heute",
      period_week: "Diese Woche",
      period_month: "Diesen Monat",
      all_time: "Allzeit",
      top_users: "Top-Benutzer",
      points: "Punkte",
      new_members: "Neue Mitglieder"
    },
    Report: {
      title: "Jahresbericht & Analysen | IdleForest",
      description: "Sehen Sie sich den Jahresbericht und die Live-Analysen von IdleForest an — gepflanzte Bäume, aktive Benutzer, geteilte Bandbreite und für Aufforstungsprojekte erzielte Einnahmen.",
      annual: "Jahres",
      report: "Bericht",
      annual_report: "Jahresbericht",
      analytics: "Analysen",
      historical_data: "Historische Daten",
      about_title: "Über IdleForest",
      about_desc: "IdleForest ist eine passive Browser-Erweiterung, die Bäume pflanzt, während Sie surfen, spielen oder streamen. Sie nutzt ungenutzte Internetbandbreite, um Aufforstungsprojekte zu finanzieren.",
      free_to_use: "Kostenlos nutzbar",
      no_account: "Kein Konto erforderlich",
      open_source: "Open Source"
    }
  },
  pt: {
    Map: {
      title: "Mapa de Plantio – IdleForest",
      description: "Explore o mapa interativo de onde a IdleForest plantou árvores com nossos parceiros.",
      heading: "Nosso mapa de plantio",
      text: "Veja onde plantamos árvores com parceiros como Trees for the Future e Tree-Nation. Este mapa é atualizado à medida que plantamos mais."
    },
    Teams: {
      placeholder_search: "Pesquisar Equipes",
      loading_teams: "Carregando equipes...",
      no_teams: "Nenhuma Equipe Encontrada",
      no_teams_search: "Nenhuma equipe corresponde à sua pesquisa",
      create_team_prompt: "Crie uma equipe para começar",
      loading_rankings: "Carregando classificações...",
      all_time_rankings_label: "Classificação Histórica de Usuários",
      top_earners_label: "Maiores Ganhadores",
      top_teams_label: "Melhores Equipes",
      fastest_growing: "Crescimento Rápido",
      no_users: "Nenhum usuário encontrado",
      no_data: "Sem dados para este período",
      fastest_growing_label: "Crescimento Rápido (Novos Membros)",
      members_total: "membros no total",
      no_teams_gained: "Nenhuma equipe ganhou membros neste período",
      created: "Criado",
      period_today: "Hoje",
      period_week: "Esta Semana",
      period_month: "Este Mês",
      all_time: "Histórico",
      top_users: "Melhores Usuários",
      points: "Pontos",
      new_members: "Novos Membros"
    },
    Report: {
      title: "Relatório Anual e Análises | IdleForest",
      description: "Veja o relatório anual da IdleForest e análises ao vivo — árvores plantadas, usuários ativos, largura de banda compartilhada e receita gerada para projetos de reflorestamento.",
      annual: "Anual",
      report: "Relatório",
      annual_report: "Relatório Anual",
      analytics: "Análises",
      historical_data: "Dados Históricos",
      about_title: "Sobre a IdleForest",
      about_desc: "IdleForest é uma extensão passiva de navegador que planta árvores enquanto você navega, joga ou transmite. Ela usa a largura de banda de internet não utilizada para financiar projetos de reflorestamento.",
      free_to_use: "Gratuito para usar",
      no_account: "Nenhuma conta necessária",
      open_source: "Código aberto"
    }
  }
};

const langs = ['en', 'es', 'fr', 'de', 'pt'];

langs.forEach(lang => {
  const file = `messages/${lang}.json`;
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  data.Map = translations[lang].Map;
  data.Teams = translations[lang].Teams;
  data.Report = translations[lang].Report;
  
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
  console.log(`Updated ${file}`);
});
