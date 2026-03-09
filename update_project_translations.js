const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const files = ['en.json', 'es.json', 'fr.json', 'de.json', 'pt.json'];

const projectsEn = {
    "tn-eden-madagascar": { "name": "Eden Reforestation Projects – Madagascar" },
    "if-kenya": { "name": "Global Forest Initiative – Kenya" },
    "tftf-kisumu7-awach": { "name": "Kisumu 7 – Awach, Kenya" },
    "tftf-senegal": { "name": "TFTF Projects – Senegal" },
    "pod-dream-uganda-rwenzori": { "name": "Dream International – Rwenzori Mountains, Uganda" },
    "pod-cameroon": { "name": "POD – Cameroon Agroforestry" },
    "tn-syzygium": {
        "name": "Replanting the burnt Mkussu Forest",
        "description": "Restoring the Mkussu Nature Forest Reserve in Lushoto District after fire damage."
    },
    "tn-plant-to-stop-poverty": {
        "name": "Plant to Stop Poverty",
        "description": "Helping rural communities implement agroforestry to combat poverty."
    },
    "default_contribution": "{partner} Contribution",
    "default_impact": "Planted {trees} trees with {partner} to support reforestation."
};

const projectsEs = {
    "tn-eden-madagascar": { "name": "Proyectos de Reforestación Eden – Madagascar" },
    "if-kenya": { "name": "Iniciativa Forestal Global – Kenia" },
    "tftf-kisumu7-awach": { "name": "Kisumu 7 – Awach, Kenia" },
    "tftf-senegal": { "name": "Proyectos TFTF – Senegal" },
    "pod-dream-uganda-rwenzori": { "name": "Dream International – Montañas Rwenzori, Uganda" },
    "pod-cameroon": { "name": "POD – Agroforestería en Camerún" },
    "tn-syzygium": {
        "name": "Replantando el Bosque Mkussu quemado",
        "description": "Restaurando la Reserva Forestal Natural Mkussu en el Distrito de Lushoto después de los daños por incendio."
    },
    "tn-plant-to-stop-poverty": {
        "name": "Plantar para detener la pobreza",
        "description": "Ayudando a las comunidades rurales a implementar la agroforestería para combatir la pobreza."
    },
    "default_contribution": "Contribución de {partner}",
    "default_impact": "Plantó {trees} árboles con {partner} para apoyar la reforestación."
};

const projectsFr = {
    "tn-eden-madagascar": { "name": "Projets de Reforestation Eden – Madagascar" },
    "if-kenya": { "name": "Initiative Forestière Mondiale – Kenya" },
    "tftf-kisumu7-awach": { "name": "Kisumu 7 – Awach, Kenya" },
    "tftf-senegal": { "name": "Projets TFTF – Sénégal" },
    "pod-dream-uganda-rwenzori": { "name": "Dream International – Montagnes Rwenzori, Ouganda" },
    "pod-cameroon": { "name": "POD – Agroforesterie au Cameroun" },
    "tn-syzygium": {
        "name": "Replantation de la forêt brûlée de Mkussu",
        "description": "Restauration de la réserve forestière naturelle de Mkussu dans le district de Lushoto après les dégâts causés par les incendies."
    },
    "tn-plant-to-stop-poverty": {
        "name": "Planter pour arrêter la pauvreté",
        "description": "Aider les communautés rurales à mettre en œuvre l'agroforesterie pour lutter contre la pauvreté."
    },
    "default_contribution": "Contribution de {partner}",
    "default_impact": "A planté {trees} arbres avec {partner} pour soutenir la reforestation."
};

const projectsDe = {
    "tn-eden-madagascar": { "name": "Eden Aufforstungsprojekte – Madagaskar" },
    "if-kenya": { "name": "Globale Waldinitiative – Kenia" },
    "tftf-kisumu7-awach": { "name": "Kisumu 7 – Awach, Kenia" },
    "tftf-senegal": { "name": "TFTF Projekte – Senegal" },
    "pod-dream-uganda-rwenzori": { "name": "Dream International – Rwenzori-Berge, Uganda" },
    "pod-cameroon": { "name": "POD – Agroforstwirtschaft in Kamerun" },
    "tn-syzygium": {
        "name": "Wiederbepflanzung des verbrannten Mkussu-Waldes",
        "description": "Wiederherstellung des Mkussu Naturwaldreservats im Distrikt Lushoto nach Brandschäden."
    },
    "tn-plant-to-stop-poverty": {
        "name": "Pflanzen gegen Armut",
        "description": "Unterstützung ländlicher Gemeinden bei der Umsetzung von Agroforstwirtschaft zur Bekämpfung der Armut."
    },
    "default_contribution": "{partner} Beitrag",
    "default_impact": "Hat {trees} Bäume mit {partner} gepflanzt, um die Aufforstung zu unterstützen."
};

const projectsPt = {
    "tn-eden-madagascar": { "name": "Projetos de Reflorestamento Eden – Madagascar" },
    "if-kenya": { "name": "Iniciativa Florestal Global – Quênia" },
    "tftf-kisumu7-awach": { "name": "Kisumu 7 – Awach, Quênia" },
    "tftf-senegal": { "name": "Projetos TFTF – Senegal" },
    "pod-dream-uganda-rwenzori": { "name": "Dream International – Montanhas Rwenzori, Uganda" },
    "pod-cameroon": { "name": "POD – Agrofloresta em Camarões" },
    "tn-syzygium": {
        "name": "Replantio da Floresta Mkussu queimada",
        "description": "Restaurando a Reserva Florestal Natural Mkussu no Distrito de Lushoto após danos causados por incêndios."
    },
    "tn-plant-to-stop-poverty": {
        "name": "Plantar para Combater a Pobreza",
        "description": "Ajudando comunidades rurais a implementar a agrofloresta para combater a pobreza."
    },
    "default_contribution": "Contribuição de {partner}",
    "default_impact": "Plantou {trees} árvores com {partner} para apoiar o reflorestamento."
};

const projectMaps = {
    'en.json': projectsEn,
    'es.json': projectsEs,
    'fr.json': projectsFr,
    'de.json': projectsDe,
    'pt.json': projectsPt
};

files.forEach(file => {
    const filePath = path.join(messagesDir, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    let data = JSON.parse(content);

    if (!data.Report) {
        data.Report = {};
    }

    data.Report.projects = projectMaps[file];

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file} with project translations`);
});
