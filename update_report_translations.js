const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const files = ['en.json', 'es.json', 'fr.json', 'de.json', 'pt.json'];

const reportKeysEn = {
    "progress_title": "Our Tree Planting Progress",
    "progress_desc": "Tracking our reforestation impact with our partners",
    "total_contributions": "Total Contributions",
    "trees_planted_progress": "Trees Planted",
    "est_donation": "Est. Donation Value (USD)",
    "impact_milestones": "Impact Milestones",
    "latest": "Latest",
    "trees": "trees",
    "view_certificate": "View Certificate",
    "historical_title": "Historical Performance of Idleforest",
    "historical_desc": "Tracking key performance indicators over time",
    "granularity": "Granularity:",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "total_requests": "Total Requests",
    "active_nodes": "Active Nodes",
    "total_earnings": "Total Earnings",
    "trees_planted_chart": "Trees Planted"
};

const reportKeysEs = {
    "progress_title": "Nuestro Progreso de Plantación",
    "progress_desc": "Rastreando nuestro impacto de reforestación con nuestros socios",
    "total_contributions": "Contribuciones Totales",
    "trees_planted_progress": "Árboles Plantados",
    "est_donation": "Valor Est. de Donación (USD)",
    "impact_milestones": "Hitos de Impacto",
    "latest": "Último",
    "trees": "árboles",
    "view_certificate": "Ver Certificado",
    "historical_title": "Rendimiento Histórico de Idleforest",
    "historical_desc": "Rastreando indicadores clave de rendimiento a lo largo del tiempo",
    "granularity": "Granularidad:",
    "daily": "Diario",
    "weekly": "Semanal",
    "monthly": "Mensual",
    "total_requests": "Solicitudes Totales",
    "active_nodes": "Nodos Activos",
    "total_earnings": "Ganancias Totales",
    "trees_planted_chart": "Árboles Plantados"
};

const reportKeysFr = {
    "progress_title": "Notre Progrès de Plantation",
    "progress_desc": "Suivi de notre impact de reforestation avec nos partenaires",
    "total_contributions": "Contributions Totales",
    "trees_planted_progress": "Arbres Plantés",
    "est_donation": "Valeur Est. des Dons (USD)",
    "impact_milestones": "Jalons d'Impact",
    "latest": "Dernier",
    "trees": "arbres",
    "view_certificate": "Voir le Certificat",
    "historical_title": "Performance Historique d'Idleforest",
    "historical_desc": "Suivi des indicateurs clés de performance au fil du temps",
    "granularity": "Granularité :",
    "daily": "Quotidien",
    "weekly": "Hebdomadaire",
    "monthly": "Mensuel",
    "total_requests": "Total des Requêtes",
    "active_nodes": "Nœuds Actifs",
    "total_earnings": "Total des Gains",
    "trees_planted_chart": "Arbres Plantés"
};

const reportKeysDe = {
    "progress_title": "Unser Baumpflanz-Fortschritt",
    "progress_desc": "Verfolgung unserer Aufforstungswirkung mit unseren Partnern",
    "total_contributions": "Gesamtbeiträge",
    "trees_planted_progress": "Gepflanzte Bäume",
    "est_donation": "Gesch. Spendenwert (USD)",
    "impact_milestones": "Wirkungs-Meilensteine",
    "latest": "Neueste",
    "trees": "Bäume",
    "view_certificate": "Zertifikat Ansehen",
    "historical_title": "Historische Leistung von Idleforest",
    "historical_desc": "Verfolgung der wichtigsten Leistungsindikatoren über die Zeit",
    "granularity": "Granularität:",
    "daily": "Täglich",
    "weekly": "Wöchentlich",
    "monthly": "Monatlich",
    "total_requests": "Gesamtanfragen",
    "active_nodes": "Aktive Knoten",
    "total_earnings": "Gesamteinnahmen",
    "trees_planted_chart": "Gepflanzte Bäume"
};

const reportKeysPt = {
    "progress_title": "Nosso Progresso de Plantio",
    "progress_desc": "Acompanhando nosso impacto de reflorestamento com nossos parceiros",
    "total_contributions": "Contribuições Totais",
    "trees_planted_progress": "Árvores Plantadas",
    "est_donation": "Valor Est. de Doação (USD)",
    "impact_milestones": "Marcos de Impacto",
    "latest": "Mais Recente",
    "trees": "árvores",
    "view_certificate": "Ver Certificado",
    "historical_title": "Desempenho Histórico do Idleforest",
    "historical_desc": "Acompanhando indicadores-chave de desempenho ao longo do tempo",
    "granularity": "Granularidade:",
    "daily": "Diário",
    "weekly": "Semanal",
    "monthly": "Mensal",
    "total_requests": "Solicitações Totais",
    "active_nodes": "Nós Ativos",
    "total_earnings": "Ganhos Totais",
    "trees_planted_chart": "Árvores Plantadas"
};

const keysMap = {
    'en.json': reportKeysEn,
    'es.json': reportKeysEs,
    'fr.json': reportKeysFr,
    'de.json': reportKeysDe,
    'pt.json': reportKeysPt
};

files.forEach(file => {
    const filePath = path.join(messagesDir, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    let data = JSON.parse(content);

    // 1. Append the new report keys
    if (!data['Report']) {
        data['Report'] = {};
    }

    const newKeys = keysMap[file];
    for (const [k, v] of Object.entries(newKeys)) {
        if (!data['Report'][k]) {
            data['Report'][k] = v;
        }
    }

    // 2. SEO String Replacements for Spanish and Portuguese
    if (file === 'es.json') {
        if (data.Landing && data.Landing.hero) {
            if (data.Landing.hero.title_line2 === "INTERNET INACTIVO EN") {
                data.Landing.hero.title_line2 = "INTERNET SIN USAR EN";
            }
        }
        if (data.Landing && data.Landing.how_it_works) {
            if (data.Landing.how_it_works.step2_desc) {
                data.Landing.how_it_works.step2_desc = data.Landing.how_it_works.step2_desc.replace("conexión a internet inactiva", "conexión a internet no utilizada");
            }
        }
        if (data.Landing && data.Landing.faq) {
            if (data.Landing.faq.slow_a1) {
                data.Landing.faq.slow_a1 = data.Landing.faq.slow_a1.replace("ancho de banda inactivo", "ancho de banda no utilizado");
            }
        }
        if (data.Transparency) {
            if (data.Transparency.hero_desc) {
                data.Transparency.hero_desc = data.Transparency.hero_desc.replace("ancho de banda inactivo", "ancho de banda no utilizado");
            }
            if (data.Transparency.how_bandwidth_desc) {
                data.Transparency.how_bandwidth_desc = data.Transparency.how_bandwidth_desc.replace("ancho de banda inactivo", "ancho de banda no utilizado");
            }
        }
    }

    if (file === 'pt.json') {
        if (data.Landing && data.Landing.hero) {
            if (data.Landing.hero.title_line2 === "INTERNET OCIOSA EM") {
                data.Landing.hero.title_line2 = "INTERNET NÃO UTILIZADA EM";
            }
            if (data.Landing.hero.description) {
                data.Landing.hero.description = data.Landing.hero.description.replace("largura de banda ociosa", "largura de banda não utilizada");
            }
        }
        if (data.Landing && data.Landing.faq) {
            if (data.Landing.faq.slow_a1) {
                data.Landing.faq.slow_a1 = data.Landing.faq.slow_a1.replace("largura de banda ociosa", "largura de banda não utilizada");
            }
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file}`);
});
