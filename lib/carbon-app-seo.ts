type CarbonLocale = "en" | "es" | "de" | "pt" | "fr";

interface CarbonReviewer {
    name: string;
    role: string;
    organization: string;
}

interface CarbonSourceReference {
    title: string;
    url: string;
    note: string;
}

interface CarbonSeoExtension {
    searchTopics?: string[];
    reviewed_at: string;
    reviewer: CarbonReviewer;
    key_drivers: string[];
    assumptions: string[];
    reduction_tips: string[];
    uncertainty: string;
    source_references: CarbonSourceReference[];
}

export interface CarbonSeoSeedLocale {
    searchTopics?: string[];
    reviewed_at?: string;
    reviewer?: CarbonReviewer;
    key_drivers?: string[];
    assumptions?: string[];
    reduction_tips?: string[];
    uncertainty?: string;
    source_references?: CarbonSourceReference[];
    [key: string]: unknown;
}

export interface CarbonSeedEntry {
    app_name: string;
    category: string;
    slug: string;
    avg_usage_hours_day: string;
    co2_per_hour_grams: number;
    seo_content?: Record<string, CarbonSeoSeedLocale>;
    [key: string]: unknown;
}

const CARBON_LOCALES: CarbonLocale[] = ["en", "es", "de", "pt", "fr"];
const REVIEWED_AT = "2026-05-10";

const IEA_AI_URL = "https://www.iea.org/reports/energy-and-ai";
const IEA_DIGITAL_URL = "https://www.iea.org/reports/data-centres-and-data-transmission-networks";
const DIGITAL_CONTENT_LCA_URL = "https://www.nature.com/articles/s41467-024-47621-w";
const LLM_ENVIRONMENT_URL = "https://www.nature.com/articles/s41598-024-76682-6";
const INTERNET_USE_FOOTPRINT_URL = "https://doi.org/10.1016/j.resconrec.2020.105389";
const CARBON_TRUST_STREAMING_URL = "https://www.carbontrust.com/sites/default/files/documents/resource/public/Carbon-impact-of-video-streaming.pdf";
const CALIFORNIA_GAMING_URL = "https://www.energy.ca.gov/sites/default/files/2021-06/CEC-500-2019-042.pdf";
const CAMBRIDGE_BITCOIN_URL = "https://ccaf.io/cbeci/ghg/methodology2.Hashrate";
const CAMBRIDGE_BITCOIN_POWER_URL = "https://ccaf.io/cbnsi/cbeci/methodology";
const CAMBRIDGE_ETHEREUM_URL = "https://ccaf.io/cbnsi/ethereum/methodology";
const ETHEREUM_MERGE_URL = "https://ethereum.org/roadmap/merge/";
const TREE_OFFSET_URL = "https://ceepr.mit.edu/wp-content/uploads/2024/03/MIT-CEEPR-WP-2024-04.pdf";

function unique(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean)));
}

const REVIEWERS: Record<CarbonLocale, CarbonReviewer> = {
    en: { name: "IdleForest Research Team", role: "Editorial Review", organization: "IdleForest" },
    es: { name: "Equipo de investigación de IdleForest", role: "Revisión editorial", organization: "IdleForest" },
    de: { name: "IdleForest Forschungsteam", role: "Redaktionelle Prüfung", organization: "IdleForest" },
    pt: { name: "Equipa de investigação do IdleForest", role: "Revisão editorial", organization: "IdleForest" },
    fr: { name: "Équipe de recherche IdleForest", role: "Relecture éditoriale", organization: "IdleForest" },
};

const SOURCE_NOTES = {
    ieaAi: {
        en: "Useful for understanding how AI workloads, accelerators, and cooling drive electricity demand.",
        es: "Útil para entender cómo las cargas de IA, los aceleradores y la refrigeración impulsan la demanda eléctrica.",
        de: "Hilfreich, um zu verstehen, wie KI-Workloads, Beschleuniger und Kühlung den Strombedarf antreiben.",
        pt: "Útil para perceber como as cargas de IA, os aceleradores e o arrefecimento impulsionam a procura elétrica.",
        fr: "Utile pour comprendre comment les charges IA, les accélérateurs et le refroidissement font grimper la demande d'électricité.",
    },
    ieaDigital: {
        en: "Provides broader context on the infrastructure behind cloud and network energy use.",
        es: "Aporta contexto general sobre la infraestructura detrás del uso energético de la nube y de la red.",
        de: "Liefert breiteren Kontext zur Infrastruktur hinter dem Energieverbrauch von Cloud und Netzwerken.",
        pt: "Fornece contexto mais amplo sobre a infraestrutura por trás do consumo energético da cloud e da rede.",
        fr: "Apporte un contexte plus large sur l'infrastructure derrière la consommation d'énergie du cloud et des réseaux.",
    },
    digitalContent: {
        en: "Peer-reviewed life-cycle assessment covering web use, social media, video, music streaming, and video conferencing.",
        es: "Evaluación del ciclo de vida revisada por pares que cubre navegación web, redes sociales, vídeo, música en streaming y videoconferencias.",
        de: "Peer-reviewte Lebenszyklusanalyse zu Webnutzung, Social Media, Video, Musikstreaming und Videokonferenzen.",
        pt: "Avaliação de ciclo de vida com revisão por pares sobre navegação web, redes sociais, vídeo, streaming de música e videoconferência.",
        fr: "Analyse du cycle de vie évaluée par les pairs couvrant le web, les réseaux sociaux, la vidéo, le streaming musical et la visioconférence.",
    },
    internetUseFootprint: {
        en: "Peer-reviewed study used as a benchmark for internet data-transfer emissions and the rough footprint range behind mixed chat, voice, and media sessions.",
        es: "Estudio revisado por pares usado como referencia para las emisiones por transferencia de datos de internet y el rango aproximado detrás de sesiones mixtas de chat, voz y medios.",
        de: "Peer-reviewte Studie als Referenz für Emissionen aus Internet-Datentransfer und den groben Bereich hinter gemischten Chat-, Sprach- und Medien-Sessions.",
        pt: "Estudo com revisão por pares usado como referência para emissões de transferência de dados na internet e para o intervalo aproximado por trás de sessões mistas de chat, voz e media.",
        fr: "Étude évaluée par les pairs utilisée comme repère pour les émissions liées au transfert de données Internet et la plage approximative des sessions mixtes chat, voix et médias.",
    },
    llmEnvironmental: {
        en: "Peer-reviewed analysis of LLM energy and carbon impacts for real text-generation workloads.",
        es: "Análisis revisado por pares sobre el impacto energético y de carbono de los LLM en cargas reales de generación de texto.",
        de: "Peer-reviewte Analyse zu Energie- und Kohlenstoffwirkungen von LLMs bei realen Textgenerierungs-Workloads.",
        pt: "Análise com revisão por pares sobre os impactos energéticos e carbónicos dos LLM em cargas reais de geração de texto.",
        fr: "Analyse évaluée par les pairs des impacts énergétiques et carbone des LLM sur des charges réelles de génération de texte.",
    },
    carbonTrust: {
        en: "Useful benchmark for streaming emissions and the role of the viewing device.",
        es: "Referencia útil para las emisiones del streaming y el papel del dispositivo de visualización.",
        de: "Nützlicher Referenzwert für Streaming-Emissionen und die Rolle des Wiedergabegeräts.",
        pt: "Referência útil para as emissões do streaming e para o papel do dispositivo de visualização.",
        fr: "Référence utile pour les émissions du streaming et le rôle de l'appareil de visionnage.",
    },
    gaming: {
        en: "Helpful for understanding how device choice and gaming load change electricity use.",
        es: "Útil para entender cómo la elección del dispositivo y la carga del juego cambian el consumo eléctrico.",
        de: "Hilfreich, um zu verstehen, wie Gerätewahl und Gaming-Last den Stromverbrauch verändern.",
        pt: "Útil para perceber como a escolha do dispositivo e a carga de jogo alteram o consumo elétrico.",
        fr: "Utile pour comprendre comment le choix de l'appareil et la charge de jeu modifient la consommation électrique.",
    },
    bitcoin: {
        en: "Best-known public benchmark for Bitcoin network electricity demand.",
        es: "La referencia pública más conocida sobre la demanda eléctrica de la red Bitcoin.",
        de: "Bekanntester öffentlicher Referenzwert für den Strombedarf des Bitcoin-Netzwerks.",
        pt: "A referência pública mais conhecida para a procura elétrica da rede Bitcoin.",
        fr: "La référence publique la plus connue sur la demande électrique du réseau Bitcoin.",
    },
    bitcoinGhG: {
        en: "Methodology page for Cambridge's Bitcoin greenhouse-gas model, including uncertainty bounds.",
        es: "Página metodológica del modelo de gases de efecto invernadero de Bitcoin de Cambridge, con rangos de incertidumbre.",
        de: "Methodikseite von Cambridges Treibhausgasmodell für Bitcoin mit Unsicherheitsbandbreiten.",
        pt: "Página metodológica do modelo de emissões de gases com efeito de estufa do Bitcoin de Cambridge, incluindo intervalos de incerteza.",
        fr: "Page de méthodologie du modèle d'émissions de gaz à effet de serre du Bitcoin par Cambridge, avec bornes d'incertitude.",
    },
    ethereumMethodology: {
        en: "Cambridge methodology for post-Merge Ethereum electricity demand.",
        es: "Metodología de Cambridge para la demanda eléctrica de Ethereum tras The Merge.",
        de: "Cambridge-Methodik für den Strombedarf von Ethereum nach The Merge.",
        pt: "Metodologia de Cambridge para a procura elétrica do Ethereum após o The Merge.",
        fr: "Méthodologie de Cambridge pour la demande électrique d'Ethereum après The Merge.",
    },
    ethereumMerge: {
        en: "Official Ethereum documentation on the September 15, 2022 Merge and its energy reduction.",
        es: "Documentación oficial de Ethereum sobre The Merge del 15 de septiembre de 2022 y su reducción energética.",
        de: "Offizielle Ethereum-Dokumentation zum Merge vom 15. September 2022 und der damit verbundenen Energiereduktion.",
        pt: "Documentação oficial da Ethereum sobre o The Merge de 15 de setembro de 2022 e a respetiva redução energética.",
        fr: "Documentation officielle d'Ethereum sur The Merge du 15 septembre 2022 et la réduction d'énergie associée.",
    },
    treeOffset: {
        en: "Supports the offset conversion used by IdleForest: roughly 20kg CO2 absorbed per mature tree per year, with wide real-world variation.",
        es: "Respalda la conversión de compensación usada por IdleForest: unos 20kg de CO2 absorbidos por árbol maduro al año, con amplia variación real.",
        de: "Stützt die von IdleForest verwendete Ausgleichsrechnung: etwa 20kg CO2 pro ausgewachsenem Baum und Jahr, mit großer realer Streuung.",
        pt: "Sustenta a conversão de compensação usada pelo IdleForest: cerca de 20kg de CO2 absorvidos por árvore madura por ano, com grande variação real.",
        fr: "Soutient la conversion de compensation utilisée par IdleForest : environ 20kg de CO2 absorbés par arbre mature et par an, avec une forte variation réelle.",
    },
};

function treeOffsetReference(locale: CarbonLocale): CarbonSourceReference {
    return {
        title: "MIT CEEPR: How much can we reduce CO2 by planting trees?",
        url: TREE_OFFSET_URL,
        note: SOURCE_NOTES.treeOffset[locale],
    };
}

function sourceReferences(locale: CarbonLocale, kind: "ai" | "streaming" | "gaming" | "work" | "browsing" | "social" | "crypto" | "bitcoinOverride"): CarbonSourceReference[] {
    if (kind === "ai") {
        return [
            { title: "IEA: Energy and AI", url: IEA_AI_URL, note: SOURCE_NOTES.ieaAi[locale] },
            { title: "Scientific Reports: Environmental impact of large language models", url: LLM_ENVIRONMENT_URL, note: SOURCE_NOTES.llmEnvironmental[locale] },
            treeOffsetReference(locale),
        ];
    }

    if (kind === "streaming") {
        return [
            { title: "Carbon Trust: Carbon impact of video streaming (PDF)", url: CARBON_TRUST_STREAMING_URL, note: SOURCE_NOTES.carbonTrust[locale] },
            { title: "Nature Communications: The environmental sustainability of digital content consumption", url: DIGITAL_CONTENT_LCA_URL, note: SOURCE_NOTES.digitalContent[locale] },
            treeOffsetReference(locale),
        ];
    }

    if (kind === "gaming") {
        return [
            { title: "California Energy Commission: Computer gaming energy efficiency (PDF)", url: CALIFORNIA_GAMING_URL, note: SOURCE_NOTES.gaming[locale] },
            { title: "IEA: Data centres and data transmission networks", url: IEA_DIGITAL_URL, note: SOURCE_NOTES.ieaDigital[locale] },
            treeOffsetReference(locale),
        ];
    }

    if (kind === "work" || kind === "browsing") {
        return [
            { title: "Nature Communications: The environmental sustainability of digital content consumption", url: DIGITAL_CONTENT_LCA_URL, note: SOURCE_NOTES.digitalContent[locale] },
            { title: "IEA: Data centres and data transmission networks", url: IEA_DIGITAL_URL, note: SOURCE_NOTES.ieaDigital[locale] },
            treeOffsetReference(locale),
        ];
    }

    if (kind === "social") {
        return [
            { title: "Nature Communications: The environmental sustainability of digital content consumption", url: DIGITAL_CONTENT_LCA_URL, note: SOURCE_NOTES.digitalContent[locale] },
            { title: "Carbon Trust: Carbon impact of video streaming (PDF)", url: CARBON_TRUST_STREAMING_URL, note: SOURCE_NOTES.carbonTrust[locale] },
            treeOffsetReference(locale),
        ];
    }

    if (kind === "bitcoinOverride") {
        return [
            { title: "Cambridge Bitcoin GHG emissions methodology", url: CAMBRIDGE_BITCOIN_URL, note: SOURCE_NOTES.bitcoinGhG[locale] },
            { title: "Cambridge Bitcoin electricity methodology", url: CAMBRIDGE_BITCOIN_POWER_URL, note: SOURCE_NOTES.bitcoin[locale] },
            treeOffsetReference(locale),
        ];
    }

    return [
        { title: "Cambridge Bitcoin electricity methodology", url: CAMBRIDGE_BITCOIN_POWER_URL, note: SOURCE_NOTES.bitcoin[locale] },
        { title: "Cambridge Ethereum methodology", url: CAMBRIDGE_ETHEREUM_URL, note: SOURCE_NOTES.ethereumMethodology[locale] },
        treeOffsetReference(locale),
    ];
}

function discordSourceReferences(locale: CarbonLocale): CarbonSourceReference[] {
    return [
        {
            title: "Nature Communications: The environmental sustainability of digital content consumption",
            url: DIGITAL_CONTENT_LCA_URL,
            note: SOURCE_NOTES.digitalContent[locale],
        },
        {
            title: "Resources, Conservation and Recycling: The overlooked environmental footprint of increasing Internet use",
            url: INTERNET_USE_FOOTPRINT_URL,
            note: SOURCE_NOTES.internetUseFootprint[locale],
        },
        {
            title: "Carbon Trust: Carbon impact of video streaming (PDF)",
            url: CARBON_TRUST_STREAMING_URL,
            note: SOURCE_NOTES.carbonTrust[locale],
        },
        treeOffsetReference(locale),
    ];
}

const CATEGORY_SEO: Record<string, Record<CarbonLocale, Omit<CarbonSeoExtension, "reviewed_at" | "reviewer">>> = {
    AI: {
        en: {
            key_drivers: [
                "Model inference runs on accelerator-heavy infrastructure rather than lightweight web hosting.",
                "Longer prompts and longer outputs increase compute time, which usually raises electricity demand.",
                "Cooling and utilization matter because AI demand sits on top of the wider data-center stack."
            ],
            assumptions: [
                "The estimate reflects repeated use over time rather than a single prompt benchmark.",
                "It treats network, server, and cooling overhead as part of the user-facing footprint.",
                "It is most useful as a directional consumer estimate, not an exact vendor disclosure."
            ],
            reduction_tips: [
                "Batch related prompts instead of repeating similar requests in separate sessions.",
                "Prefer shorter outputs when you do not need long-form generation.",
                "Use lower-intensity digital workflows for simple tasks that do not need a large model."
            ],
            uncertainty: "AI emissions estimates can move materially as model architectures, hardware fleets, utilization levels, and regional electricity mixes change.",
            source_references: sourceReferences("en", "ai"),
            searchTopics: ["ai carbon footprint", "llm emissions", "carbon cost of ai"],
        },
        es: {
            key_drivers: [
                "La inferencia del modelo se ejecuta sobre infraestructura intensiva en aceleradores, no sobre un alojamiento web ligero.",
                "Prompts y respuestas más largas aumentan el tiempo de cálculo y suelen elevar la demanda eléctrica.",
                "La refrigeración y la utilización importan porque la demanda de IA se suma al resto de la pila del centro de datos."
            ],
            assumptions: [
                "La estimación refleja un uso repetido en el tiempo y no una sola prueba con un prompt.",
                "Incluye red, servidores y refrigeración como parte de la huella visible para la persona usuaria.",
                "Es más útil como estimación orientativa para consumidores que como divulgación exacta del proveedor."
            ],
            reduction_tips: [
                "Agrupa prompts relacionados en lugar de repetir solicitudes parecidas en sesiones separadas.",
                "Prefiere respuestas cortas cuando no necesites una generación larga.",
                "Usa flujos digitales menos intensivos para tareas simples que no requieran un gran modelo."
            ],
            uncertainty: "Las estimaciones de emisiones de la IA pueden variar mucho a medida que cambian las arquitecturas, el hardware, la utilización y el mix eléctrico regional.",
            source_references: sourceReferences("es", "ai"),
            searchTopics: ["huella de carbono de la ia", "emisiones de llm", "coste de carbono de la ia"],
        },
        de: {
            key_drivers: [
                "Die Inferenz läuft auf beschleunigerlastiger Infrastruktur statt auf leichtem Webhosting.",
                "Längere Prompts und längere Antworten erhöhen die Rechenzeit und damit meist auch den Strombedarf.",
                "Kühlung und Auslastung spielen eine Rolle, weil KI-Nachfrage auf dem gesamten Rechenzentrums-Stack aufsetzt."
            ],
            assumptions: [
                "Die Schätzung bildet wiederholte Nutzung über Zeit ab und keinen einzelnen Prompt-Test.",
                "Netzwerk-, Server- und Kühlungsaufwand werden als Teil des nutzerseitigen Fußabdrucks behandelt.",
                "Sie ist vor allem als grobe Verbraucherschätzung gedacht und nicht als exakte Anbieterangabe."
            ],
            reduction_tips: [
                "Bündle zusammenhängende Prompts statt ähnliche Anfragen in getrennten Sitzungen zu wiederholen.",
                "Bevorzuge kürzere Ausgaben, wenn du keinen langen Text brauchst.",
                "Nutze für einfache Aufgaben leichtere digitale Workflows, wenn kein großes Modell nötig ist."
            ],
            uncertainty: "KI-Emissionsschätzungen können sich deutlich verändern, wenn sich Modellarchitektur, Hardware-Flotten, Auslastung und regionaler Strommix ändern.",
            source_references: sourceReferences("de", "ai"),
            searchTopics: ["ki co2-fußabdruck", "llm emissionen", "klimakosten von ki"],
        },
        pt: {
            key_drivers: [
                "A inferência do modelo corre em infraestrutura intensiva em aceleradores, e não em alojamento web leve.",
                "Prompts e respostas mais longos aumentam o tempo de computação e normalmente a procura elétrica.",
                "O arrefecimento e a utilização importam porque a procura de IA assenta sobre toda a pilha do centro de dados."
            ],
            assumptions: [
                "A estimativa reflete uso repetido ao longo do tempo e não um teste isolado com um prompt.",
                "Inclui rede, servidores e arrefecimento como parte da pegada visível para o utilizador.",
                "É mais útil como estimativa direcional para consumidores do que como divulgação exata do fornecedor."
            ],
            reduction_tips: [
                "Agrupa prompts relacionados em vez de repetires pedidos semelhantes em sessões separadas.",
                "Prefere respostas mais curtas quando não precisas de geração longa.",
                "Usa fluxos digitais menos intensivos para tarefas simples que não precisem de um modelo grande."
            ],
            uncertainty: "As estimativas de emissões da IA podem mudar bastante à medida que mudam as arquiteturas, o hardware, a utilização e o mix elétrico regional.",
            source_references: sourceReferences("pt", "ai"),
            searchTopics: ["pegada de carbono da ia", "emissões de llm", "custo carbónico da ia"],
        },
        fr: {
            key_drivers: [
                "L'inférence des modèles tourne sur une infrastructure très dépendante des accélérateurs, bien plus lourde qu'un hébergement web classique.",
                "Des prompts et des réponses plus longs augmentent le temps de calcul, donc souvent la demande d'électricité.",
                "Le refroidissement et le taux d'utilisation comptent, car la demande IA repose sur toute la pile du centre de données."
            ],
            assumptions: [
                "L'estimation reflète un usage répété dans le temps et non un test sur un seul prompt.",
                "Elle intègre le réseau, les serveurs et le refroidissement dans l'empreinte côté utilisateur.",
                "Elle est surtout utile comme ordre de grandeur pour le grand public, pas comme déclaration fournisseur exacte."
            ],
            reduction_tips: [
                "Regroupez les prompts liés au lieu de répéter des demandes proches dans des sessions séparées.",
                "Préférez des réponses plus courtes quand vous n'avez pas besoin d'un long contenu généré.",
                "Utilisez des workflows numériques moins intensifs pour les tâches simples qui n'ont pas besoin d'un grand modèle."
            ],
            uncertainty: "Les estimations d'émissions de l'IA peuvent bouger fortement à mesure que changent les architectures, le matériel, le taux d'utilisation et le mix électrique régional.",
            source_references: sourceReferences("fr", "ai"),
            searchTopics: ["empreinte carbone de l'ia", "émissions des llm", "coût carbone de l'ia"],
        },
    },
    Streaming: {
        en: {
            key_drivers: [
                "Device choice can be as important as the platform itself, especially when a TV or console is involved.",
                "Higher resolutions typically increase both data transfer and local playback energy.",
                "Long sessions compound quickly because streaming is continuous rather than bursty."
            ],
            assumptions: [
                "The estimate represents a typical hour of use and folds together platform, network, and device overhead.",
                "It is designed for comparison between services rather than for a lab-grade device test.",
                "Actual impact changes with video quality, autoplay behavior, and playback hardware."
            ],
            reduction_tips: [
                "Stream at the lowest quality that still feels good for the context.",
                "Prefer smaller devices when you do not need a TV-sized screen.",
                "Cut autoplay loops on short-form platforms to reduce accidental watch time."
            ],
            uncertainty: "Streaming estimates vary with bitrate, codec efficiency, playback device, and local electricity mix, so the right interpretation is comparative rather than absolute.",
            source_references: sourceReferences("en", "streaming"),
            searchTopics: ["streaming carbon footprint", "video streaming emissions", "netflix emissions"],
        },
        es: {
            key_drivers: [
                "La elección del dispositivo puede importar tanto como la plataforma, especialmente si interviene una TV o una consola.",
                "Las resoluciones más altas suelen aumentar tanto la transferencia de datos como la energía del dispositivo.",
                "Las sesiones largas se acumulan rápido porque el streaming es continuo y no puntual."
            ],
            assumptions: [
                "La estimación representa una hora típica de uso e integra plataforma, red y dispositivo.",
                "Está pensada para comparar servicios, no para una prueba de laboratorio de un dispositivo concreto.",
                "El impacto real cambia con la calidad del vídeo, el autoplay y el hardware de reproducción."
            ],
            reduction_tips: [
                "Haz streaming con la calidad más baja que siga siendo adecuada para el contexto.",
                "Prefiere dispositivos más pequeños cuando no necesites una pantalla grande.",
                "Corta los bucles de reproducción automática en plataformas de vídeo corto para reducir tiempo accidental."
            ],
            uncertainty: "Las estimaciones de streaming varían con el bitrate, la eficiencia del códec, el dispositivo y el mix eléctrico local, así que conviene leerlas como comparativas.",
            source_references: sourceReferences("es", "streaming"),
            searchTopics: ["huella de carbono del streaming", "emisiones del streaming de vídeo", "emisiones de netflix"],
        },
        de: {
            key_drivers: [
                "Die Gerätewahl kann genauso wichtig sein wie die Plattform selbst, besonders bei TV oder Konsole.",
                "Höhere Auflösungen erhöhen meist sowohl Datenübertragung als auch Energiebedarf bei der Wiedergabe.",
                "Lange Sitzungen summieren sich schnell, weil Streaming kontinuierlich und nicht nur punktuell ist."
            ],
            assumptions: [
                "Die Schätzung steht für eine typische Nutzungsstunde und bündelt Plattform-, Netzwerk- und Geräteaufwand.",
                "Sie ist für den Vergleich zwischen Diensten gedacht, nicht als Labortest eines konkreten Geräts.",
                "Die tatsächliche Wirkung hängt von Videoqualität, Autoplay-Verhalten und Wiedergabehardware ab."
            ],
            reduction_tips: [
                "Streame in der niedrigsten Qualität, die für den Kontext noch gut genug ist.",
                "Nutze kleinere Geräte, wenn du keinen Fernseher brauchst.",
                "Begrenze Autoplay-Schleifen auf Kurzvideo-Plattformen, um versehentliche Sehdauer zu reduzieren."
            ],
            uncertainty: "Streaming-Schätzungen variieren je nach Bitrate, Codec-Effizienz, Wiedergabegerät und lokalem Strommix und sollten daher vergleichend gelesen werden.",
            source_references: sourceReferences("de", "streaming"),
            searchTopics: ["streaming co2-fußabdruck", "video streaming emissionen", "netflix emissionen"],
        },
        pt: {
            key_drivers: [
                "A escolha do dispositivo pode ser tão importante como a própria plataforma, sobretudo quando entra uma TV ou consola.",
                "Resoluções mais altas costumam aumentar tanto a transferência de dados como a energia de reprodução local.",
                "Sessões longas acumulam-se depressa porque o streaming é contínuo e não pontual."
            ],
            assumptions: [
                "A estimativa representa uma hora típica de uso e junta plataforma, rede e dispositivo.",
                "Foi pensada para comparar serviços, não para um teste de laboratório de um dispositivo específico.",
                "O impacto real muda com a qualidade de vídeo, o autoplay e o hardware de reprodução."
            ],
            reduction_tips: [
                "Faz streaming na qualidade mais baixa que continue adequada para o contexto.",
                "Prefere dispositivos mais pequenos quando não precisas de um ecrã de TV.",
                "Corta ciclos de autoplay em plataformas de vídeo curto para reduzir tempo acidental de visualização."
            ],
            uncertainty: "As estimativas de streaming variam com bitrate, eficiência do codec, dispositivo de reprodução e mix elétrico local, por isso devem ser lidas de forma comparativa.",
            source_references: sourceReferences("pt", "streaming"),
            searchTopics: ["pegada de carbono do streaming", "emissões do streaming de vídeo", "emissões da netflix"],
        },
        fr: {
            key_drivers: [
                "Le choix de l'appareil peut compter autant que la plateforme elle-même, surtout avec une TV ou une console.",
                "Des résolutions plus élevées augmentent généralement à la fois le transfert de données et l'énergie de lecture locale.",
                "Les longues sessions s'additionnent vite car le streaming est continu plutôt que ponctuel."
            ],
            assumptions: [
                "L'estimation représente une heure typique d'usage et agrège plateforme, réseau et appareil.",
                "Elle sert à comparer des services, pas à réaliser un test de laboratoire d'un appareil précis.",
                "L'impact réel varie avec la qualité vidéo, l'autoplay et le matériel de lecture."
            ],
            reduction_tips: [
                "Streamez à la qualité la plus basse qui reste satisfaisante pour le contexte.",
                "Préférez des appareils plus petits quand vous n'avez pas besoin d'un écran TV.",
                "Coupez les boucles d'autoplay sur les plateformes de formats courts pour réduire le temps de visionnage accidentel."
            ],
            uncertainty: "Les estimations du streaming varient selon le débit, l'efficacité du codec, l'appareil de lecture et le mix électrique local. Il faut donc les lire de façon comparative.",
            source_references: sourceReferences("fr", "streaming"),
            searchTopics: ["empreinte carbone du streaming", "émissions du streaming vidéo", "émissions de netflix"],
        },
    },
    Gaming: {
        en: {
            key_drivers: [
                "Gaming hardware power draw varies a lot across PCs, consoles, and in-game settings.",
                "Online multiplayer adds background server and data-transfer overhead.",
                "Session length matters because high-performance hardware pulls meaningful power continuously."
            ],
            assumptions: [
                "The estimate assumes active gameplay rather than a paused menu or launcher.",
                "It captures the combined effect of hardware energy use and online infrastructure.",
                "It is directional and should be read as a typical play-session estimate."
            ],
            reduction_tips: [
                "Lower frame rate caps and graphics settings when they do not affect the experience much.",
                "Use energy-efficient hardware when upgrading.",
                "Avoid leaving launchers and games idle in the background for long periods."
            ],
            uncertainty: "Gaming footprints can swing sharply depending on GPU load, device age, resolution, and whether play happens offline or online.",
            source_references: sourceReferences("en", "gaming"),
            searchTopics: ["gaming carbon footprint", "pc gaming emissions", "console energy use"],
        },
        es: {
            key_drivers: [
                "El consumo del hardware gaming varía mucho entre PC, consolas y ajustes gráficos.",
                "El multijugador online añade carga de servidores y transferencia de datos en segundo plano.",
                "La duración de la sesión importa porque el hardware de alto rendimiento consume potencia de forma continua."
            ],
            assumptions: [
                "La estimación supone juego activo y no un menú pausado o el launcher abierto.",
                "Capta el efecto combinado del uso eléctrico del hardware y de la infraestructura online.",
                "Es orientativa y debe leerse como una estimación típica de una sesión de juego."
            ],
            reduction_tips: [
                "Reduce límites de FPS y calidad gráfica cuando apenas cambien la experiencia.",
                "Elige hardware eficiente cuando actualices equipo.",
                "Evita dejar launchers y juegos abiertos en segundo plano durante mucho tiempo."
            ],
            uncertainty: "La huella del gaming puede variar mucho según la carga de la GPU, la antigüedad del dispositivo, la resolución y si juegas online u offline.",
            source_references: sourceReferences("es", "gaming"),
            searchTopics: ["huella de carbono del gaming", "emisiones del pc gaming", "consumo energético de consola"],
        },
        de: {
            key_drivers: [
                "Der Strombedarf von Gaming-Hardware variiert stark zwischen PCs, Konsolen und Grafikeinstellungen.",
                "Online-Multiplayer fügt zusätzlichen Server- und Datentransferaufwand hinzu.",
                "Die Sitzungsdauer zählt, weil leistungsstarke Hardware dauerhaft spürbar Strom zieht."
            ],
            assumptions: [
                "Die Schätzung geht von aktivem Spielen aus und nicht von pausierten Menüs oder einem offenen Launcher.",
                "Sie erfasst den kombinierten Effekt aus Geräteverbrauch und Online-Infrastruktur.",
                "Sie ist als typische Session-Schätzung und nicht als exakte Messung zu lesen."
            ],
            reduction_tips: [
                "Senke FPS-Limits und Grafiksettings, wenn sich das Spielerlebnis dadurch kaum verändert.",
                "Nutze beim Aufrüsten energieeffizientere Hardware.",
                "Lass Launcher und Spiele nicht unnötig lange im Hintergrund laufen."
            ],
            uncertainty: "Gaming-Fußabdrücke können je nach GPU-Last, Gerätealter, Auflösung und Online- oder Offline-Spiel stark schwanken.",
            source_references: sourceReferences("de", "gaming"),
            searchTopics: ["gaming co2-fußabdruck", "pc gaming emissionen", "stromverbrauch konsole"],
        },
        pt: {
            key_drivers: [
                "O consumo do hardware de gaming varia bastante entre PCs, consolas e definições gráficas.",
                "O multijogador online acrescenta carga de servidores e transferência de dados em segundo plano.",
                "A duração da sessão importa porque hardware de alto desempenho puxa energia continuamente."
            ],
            assumptions: [
                "A estimativa assume jogabilidade ativa e não um menu em pausa ou launcher aberto.",
                "Capta o efeito combinado do consumo do hardware e da infraestrutura online.",
                "É direcional e deve ser lida como uma estimativa típica de uma sessão de jogo."
            ],
            reduction_tips: [
                "Baixa os limites de FPS e as definições gráficas quando isso quase não alterar a experiência.",
                "Escolhe hardware eficiente quando fizeres upgrade.",
                "Evita deixar launchers e jogos parados em segundo plano por muito tempo."
            ],
            uncertainty: "As pegadas do gaming podem variar muito conforme a carga da GPU, a idade do dispositivo, a resolução e se o jogo é online ou offline.",
            source_references: sourceReferences("pt", "gaming"),
            searchTopics: ["pegada de carbono do gaming", "emissões do pc gaming", "consumo energético da consola"],
        },
        fr: {
            key_drivers: [
                "La consommation du matériel gaming varie fortement selon le PC, la console et les réglages en jeu.",
                "Le multijoueur en ligne ajoute une charge serveur et réseau en arrière-plan.",
                "La durée de session compte car le matériel performant tire une puissance significative en continu."
            ],
            assumptions: [
                "L'estimation suppose une partie active et non un menu en pause ou un launcher ouvert.",
                "Elle capte l'effet combiné de la consommation matérielle et de l'infrastructure en ligne.",
                "Elle doit être lue comme une estimation typique de session, pas comme une mesure absolue."
            ],
            reduction_tips: [
                "Réduisez les limites de FPS et les réglages graphiques quand cela change peu l'expérience.",
                "Choisissez un matériel plus efficace lors des upgrades.",
                "Évitez de laisser les launchers et les jeux tourner en arrière-plan trop longtemps."
            ],
            uncertainty: "L'empreinte du gaming peut varier fortement selon la charge GPU, l'âge de l'appareil, la résolution et le fait de jouer en ligne ou hors ligne.",
            source_references: sourceReferences("fr", "gaming"),
            searchTopics: ["empreinte carbone du gaming", "émissions du pc gaming", "consommation d'énergie console"],
        },
    },
    Work: {
        en: {
            key_drivers: [
                "Video, screen sharing, and participant count all change the intensity of online work tools.",
                "Background browser and app activity can keep the system drawing power even outside meetings.",
                "Meeting-heavy workflows create both device-side and network-side overhead."
            ],
            assumptions: [
                "The estimate reflects active use rather than an app left open but unused.",
                "It is built to compare common digital work behaviors, not to audit a specific office setup.",
                "It includes both the device and the infrastructure supporting the session."
            ],
            reduction_tips: [
                "Turn video off when it is not necessary for the meeting outcome.",
                "Reduce meeting length and unnecessary participants when possible.",
                "Close heavy browser tabs and background tools during focused work."
            ],
            uncertainty: "Work-tool emissions depend heavily on call quality, participant count, device efficiency, and how much multitasking happens during the session.",
            source_references: sourceReferences("en", "work"),
            searchTopics: ["zoom carbon footprint", "video meeting emissions", "digital work carbon footprint"],
        },
        es: {
            key_drivers: [
                "El vídeo, compartir pantalla y el número de participantes cambian la intensidad de las herramientas de trabajo online.",
                "La actividad en segundo plano del navegador y de otras apps puede mantener el sistema consumiendo energía fuera de las reuniones.",
                "Los flujos de trabajo llenos de reuniones añaden carga tanto del lado del dispositivo como de la red."
            ],
            assumptions: [
                "La estimación refleja uso activo y no una app abierta pero sin usar.",
                "Está pensada para comparar comportamientos digitales comunes de trabajo, no para auditar una oficina concreta.",
                "Incluye tanto el dispositivo como la infraestructura que sostiene la sesión."
            ],
            reduction_tips: [
                "Apaga la cámara cuando no sea necesaria para el resultado de la reunión.",
                "Reduce la duración de las reuniones y el número de participantes innecesarios.",
                "Cierra pestañas pesadas y herramientas en segundo plano durante trabajo concentrado."
            ],
            uncertainty: "Las emisiones de herramientas de trabajo dependen mucho de la calidad de la llamada, el número de participantes, la eficiencia del dispositivo y el multitarea durante la sesión.",
            source_references: sourceReferences("es", "work"),
            searchTopics: ["huella de carbono de zoom", "emisiones de videollamadas", "huella de carbono del trabajo digital"],
        },
        de: {
            key_drivers: [
                "Video, Bildschirmfreigabe und Teilnehmerzahl verändern die Intensität digitaler Arbeitstools.",
                "Browser und Apps im Hintergrund können das System auch außerhalb von Meetings weiter Strom ziehen lassen.",
                "Meeting-lastige Workflows erzeugen Zusatzaufwand sowohl auf Geräte- als auch auf Netzwerkseite."
            ],
            assumptions: [
                "Die Schätzung bildet aktive Nutzung ab und nicht nur eine geöffnete, ungenutzte App.",
                "Sie dient dem Vergleich typischer digitaler Arbeitsweisen und nicht der Prüfung eines konkreten Büros.",
                "Sie umfasst sowohl das Gerät als auch die unterstützende Infrastruktur."
            ],
            reduction_tips: [
                "Schalte Video aus, wenn es für das Meeting nicht nötig ist.",
                "Verkürze Meetings und reduziere unnötige Teilnehmende.",
                "Schließe schwere Browser-Tabs und Hintergrundtools während fokussierter Arbeit."
            ],
            uncertainty: "Die Emissionen von Arbeitstools hängen stark von Gesprächsqualität, Teilnehmerzahl, Geräteeffizienz und paralleler Nutzung während der Session ab.",
            source_references: sourceReferences("de", "work"),
            searchTopics: ["zoom co2-fußabdruck", "emissionen videokonferenz", "digitaler arbeits co2-fußabdruck"],
        },
        pt: {
            key_drivers: [
                "Vídeo, partilha de ecrã e número de participantes mudam a intensidade das ferramentas de trabalho online.",
                "Atividade de browser e apps em segundo plano pode manter o sistema a consumir energia mesmo fora das reuniões.",
                "Fluxos de trabalho cheios de reuniões criam carga tanto do lado do dispositivo como do lado da rede."
            ],
            assumptions: [
                "A estimativa reflete uso ativo e não apenas uma app aberta sem utilização.",
                "Foi criada para comparar comportamentos digitais de trabalho comuns, e não para auditar um escritório específico.",
                "Inclui tanto o dispositivo como a infraestrutura que suporta a sessão."
            ],
            reduction_tips: [
                "Desliga a câmara quando não for necessária para o objetivo da reunião.",
                "Reduz a duração das reuniões e os participantes desnecessários.",
                "Fecha separadores pesados e ferramentas em segundo plano durante trabalho focado."
            ],
            uncertainty: "As emissões das ferramentas de trabalho dependem muito da qualidade da chamada, do número de participantes, da eficiência do dispositivo e do multitasking na sessão.",
            source_references: sourceReferences("pt", "work"),
            searchTopics: ["pegada de carbono do zoom", "emissões de videochamadas", "pegada de carbono do trabalho digital"],
        },
        fr: {
            key_drivers: [
                "La vidéo, le partage d'écran et le nombre de participants changent l'intensité des outils de travail en ligne.",
                "L'activité en arrière-plan du navigateur et des apps peut maintenir le système en consommation même hors réunion.",
                "Les workflows très orientés réunion créent une charge côté appareil et côté réseau."
            ],
            assumptions: [
                "L'estimation reflète un usage actif et non une app ouverte mais inutilisée.",
                "Elle sert à comparer des usages numériques de travail courants, pas à auditer un bureau précis.",
                "Elle inclut à la fois l'appareil et l'infrastructure qui soutient la session."
            ],
            reduction_tips: [
                "Coupez la vidéo quand elle n'est pas nécessaire à l'objectif de la réunion.",
                "Réduisez la durée des réunions et les participants non indispensables.",
                "Fermez les onglets lourds et les outils en arrière-plan pendant le travail concentré."
            ],
            uncertainty: "Les émissions des outils de travail dépendent fortement de la qualité d'appel, du nombre de participants, de l'efficacité de l'appareil et du multitâche pendant la session.",
            source_references: sourceReferences("fr", "work"),
            searchTopics: ["empreinte carbone de zoom", "émissions visioconférence", "empreinte carbone du travail numérique"],
        },
    },
    Browsing: {
        en: {
            key_drivers: [
                "Open tabs, video-heavy pages, and extensions can keep CPU and memory usage elevated.",
                "Long browsing sessions compound modest hourly energy demand into a meaningful yearly total.",
                "Device efficiency matters because the browser is only one part of the system load."
            ],
            assumptions: [
                "The estimate assumes active browsing rather than a single page load snapshot.",
                "It treats browser energy as a blend of app overhead, site complexity, and device behavior.",
                "It is designed as a habit-level estimate rather than a measurement of one exact tab setup."
            ],
            reduction_tips: [
                "Close unused tabs and disable heavy extensions you no longer need.",
                "Prefer lighter browsing sessions on battery-efficient devices when possible.",
                "Reduce simultaneous media playback and script-heavy multitasking."
            ],
            uncertainty: "Browser emissions are especially sensitive to browsing habits, tab count, extensions, and the complexity of the pages being rendered.",
            source_references: sourceReferences("en", "browsing"),
            searchTopics: ["browser energy use", "chrome carbon footprint", "digital browsing emissions"],
        },
        es: {
            key_drivers: [
                "Las pestañas abiertas, las páginas con mucho vídeo y las extensiones pueden mantener alto el uso de CPU y memoria.",
                "Las sesiones largas de navegación convierten una demanda horaria modesta en un total anual relevante.",
                "La eficiencia del dispositivo importa porque el navegador es solo una parte de la carga del sistema."
            ],
            assumptions: [
                "La estimación supone navegación activa y no una sola carga de página.",
                "Trata la energía del navegador como una mezcla de sobrecarga de la app, complejidad del sitio y comportamiento del dispositivo.",
                "Está diseñada como una estimación de hábito y no como la medición exacta de una configuración de pestañas."
            ],
            reduction_tips: [
                "Cierra pestañas sin usar y desactiva extensiones pesadas que ya no necesites.",
                "Prioriza sesiones de navegación más ligeras en dispositivos eficientes cuando sea posible.",
                "Reduce la reproducción simultánea de medios y el multitarea cargado de scripts."
            ],
            uncertainty: "Las emisiones del navegador son especialmente sensibles a los hábitos de navegación, el número de pestañas, las extensiones y la complejidad de las páginas renderizadas.",
            source_references: sourceReferences("es", "browsing"),
            searchTopics: ["consumo energético del navegador", "huella de carbono de chrome", "emisiones de navegación digital"],
        },
        de: {
            key_drivers: [
                "Offene Tabs, videolastige Seiten und Erweiterungen können CPU- und Speicherlast erhöhen.",
                "Lange Surf-Sitzungen machen aus einer kleinen Stundenlast eine relevante Jahressumme.",
                "Die Effizienz des Geräts zählt, weil der Browser nur ein Teil der Systemlast ist."
            ],
            assumptions: [
                "Die Schätzung geht von aktivem Surfen aus und nicht von einem einzelnen Seitenaufruf.",
                "Browser-Energie wird als Mischung aus App-Overhead, Seitenkomplexität und Geräteverhalten betrachtet.",
                "Sie ist als Gewohnheits-Schätzung und nicht als Messung eines exakten Tab-Setups gedacht."
            ],
            reduction_tips: [
                "Schließe ungenutzte Tabs und deaktiviere schwere Erweiterungen, die du nicht mehr brauchst.",
                "Nutze wenn möglich effizientere Geräte für leichtere Surf-Sessions.",
                "Reduziere gleichzeitige Medienwiedergabe und skriptlastiges Multitasking."
            ],
            uncertainty: "Browser-Emissionen reagieren besonders stark auf Surfgewohnheiten, Tab-Anzahl, Erweiterungen und die Komplexität der gerenderten Seiten.",
            source_references: sourceReferences("de", "browsing"),
            searchTopics: ["stromverbrauch browser", "chrome co2-fußabdruck", "digitale browsing emissionen"],
        },
        pt: {
            key_drivers: [
                "Separadores abertos, páginas com muito vídeo e extensões podem manter o uso de CPU e memória elevado.",
                "Sessões longas de navegação transformam uma procura horária modesta num total anual relevante.",
                "A eficiência do dispositivo importa porque o browser é apenas uma parte da carga do sistema."
            ],
            assumptions: [
                "A estimativa assume navegação ativa e não apenas um carregamento isolado de página.",
                "Trata a energia do browser como uma mistura de overhead da app, complexidade do site e comportamento do dispositivo.",
                "Foi pensada como estimativa de hábito e não como medição exata de uma configuração de separadores."
            ],
            reduction_tips: [
                "Fecha separadores que não usas e desativa extensões pesadas de que já não precisas.",
                "Prefere sessões de navegação mais leves em dispositivos eficientes quando possível.",
                "Reduz reprodução simultânea de media e multitasking pesado em scripts."
            ],
            uncertainty: "As emissões do browser são especialmente sensíveis aos hábitos de navegação, número de separadores, extensões e complexidade das páginas renderizadas.",
            source_references: sourceReferences("pt", "browsing"),
            searchTopics: ["consumo energético do browser", "pegada de carbono do chrome", "emissões da navegação digital"],
        },
        fr: {
            key_drivers: [
                "Les onglets ouverts, les pages très vidéo et les extensions peuvent maintenir une forte charge CPU et mémoire.",
                "Les longues sessions de navigation transforment une faible demande horaire en total annuel significatif.",
                "L'efficacité de l'appareil compte car le navigateur n'est qu'une partie de la charge système."
            ],
            assumptions: [
                "L'estimation suppose une navigation active et non une simple photo d'un chargement de page.",
                "Elle traite l'énergie du navigateur comme un mélange entre overhead applicatif, complexité du site et comportement de l'appareil.",
                "Elle est conçue comme une estimation d'habitude et non comme la mesure exacte d'un setup d'onglets."
            ],
            reduction_tips: [
                "Fermez les onglets inutilisés et désactivez les extensions lourdes dont vous n'avez plus besoin.",
                "Privilégiez des sessions plus légères sur des appareils efficaces quand c'est possible.",
                "Réduisez la lecture simultanée de médias et le multitâche chargé en scripts."
            ],
            uncertainty: "Les émissions du navigateur dépendent fortement des habitudes de navigation, du nombre d'onglets, des extensions et de la complexité des pages affichées.",
            source_references: sourceReferences("fr", "browsing"),
            searchTopics: ["consommation d'énergie du navigateur", "empreinte carbone de chrome", "émissions de navigation numérique"],
        },
    },
    Social: {
        en: {
            key_drivers: [
                "Autoplay, recommendation loops, and image/video-heavy feeds extend session length.",
                "Short-form video often behaves more like streaming than lightweight browsing.",
                "The device and network layer still matter even when individual interactions feel small."
            ],
            assumptions: [
                "The estimate reflects active social-media use over time rather than a single refresh.",
                "It bundles app-side, network-side, and device-side energy demand into one consumer footprint.",
                "The number is most useful for comparing habits and platforms."
            ],
            reduction_tips: [
                "Disable autoplay and cut accidental scroll time where possible.",
                "Use smaller devices and lower brightness for casual sessions.",
                "Set app time limits if recommendation loops are extending usage."
            ],
            uncertainty: "Social-media footprints vary with media density, autoplay behavior, device, and the amount of video in the feed.",
            source_references: sourceReferences("en", "social"),
            searchTopics: ["social media carbon footprint", "tiktok emissions", "instagram carbon footprint"],
        },
        es: {
            key_drivers: [
                "El autoplay, los bucles de recomendación y los feeds cargados de imagen y vídeo alargan la sesión.",
                "El vídeo corto se comporta a menudo más como streaming que como navegación ligera.",
                "El dispositivo y la red siguen importando aunque cada interacción parezca pequeña."
            ],
            assumptions: [
                "La estimación refleja uso activo de redes sociales a lo largo del tiempo y no un simple refresh.",
                "Agrupa la demanda energética de app, red y dispositivo en una sola huella de consumo.",
                "Es especialmente útil para comparar hábitos y plataformas."
            ],
            reduction_tips: [
                "Desactiva el autoplay y reduce el tiempo de scroll accidental cuando puedas.",
                "Usa dispositivos más pequeños y menor brillo para sesiones casuales.",
                "Pon límites de tiempo si los bucles de recomendación alargan el uso."
            ],
            uncertainty: "La huella de las redes sociales varía con la densidad de medios, el autoplay, el dispositivo y la cantidad de vídeo del feed.",
            source_references: sourceReferences("es", "social"),
            searchTopics: ["huella de carbono de redes sociales", "emisiones de tiktok", "huella de carbono de instagram"],
        },
        de: {
            key_drivers: [
                "Autoplay, Empfehlungs-Schleifen und bild- oder videolastige Feeds verlängern die Sitzungsdauer.",
                "Kurzvideos verhalten sich oft eher wie Streaming als wie leichtes Browsing.",
                "Gerät und Netzwerk bleiben relevant, auch wenn einzelne Interaktionen klein wirken."
            ],
            assumptions: [
                "Die Schätzung bildet aktive Social-Media-Nutzung über Zeit ab und nicht nur ein einzelnes Aktualisieren.",
                "Sie bündelt App-, Netzwerk- und Geräteenergie in einem Verbraucher-Fußabdruck.",
                "Der Wert ist besonders nützlich, um Gewohnheiten und Plattformen zu vergleichen."
            ],
            reduction_tips: [
                "Deaktiviere Autoplay und reduziere versehentliche Scroll-Zeit, wo es möglich ist.",
                "Nutze kleinere Geräte und geringere Helligkeit für lockere Sessions.",
                "Setze App-Zeitlimits, wenn Empfehlungsschleifen die Nutzung verlängern."
            ],
            uncertainty: "Social-Media-Fußabdrücke variieren mit Mediendichte, Autoplay-Verhalten, Gerät und dem Videoanteil im Feed.",
            source_references: sourceReferences("de", "social"),
            searchTopics: ["social media co2-fußabdruck", "tiktok emissionen", "instagram co2-fußabdruck"],
        },
        pt: {
            key_drivers: [
                "Autoplay, ciclos de recomendação e feeds com muita imagem e vídeo prolongam a sessão.",
                "Vídeo curto comporta-se muitas vezes mais como streaming do que como navegação leve.",
                "O dispositivo e a rede continuam a importar mesmo quando cada interação parece pequena."
            ],
            assumptions: [
                "A estimativa reflete uso ativo de redes sociais ao longo do tempo e não um simples refresh.",
                "Junta a procura energética da app, da rede e do dispositivo numa única pegada de consumo.",
                "O valor é mais útil para comparar hábitos e plataformas."
            ],
            reduction_tips: [
                "Desativa o autoplay e reduz o tempo de scroll acidental sempre que possível.",
                "Usa dispositivos mais pequenos e menor brilho em sessões casuais.",
                "Define limites de tempo se os ciclos de recomendação estiverem a prolongar o uso."
            ],
            uncertainty: "A pegada das redes sociais varia com a densidade de media, o autoplay, o dispositivo e a quantidade de vídeo no feed.",
            source_references: sourceReferences("pt", "social"),
            searchTopics: ["pegada de carbono das redes sociais", "emissões do tiktok", "pegada de carbono do instagram"],
        },
        fr: {
            key_drivers: [
                "L'autoplay, les boucles de recommandation et les feeds riches en image et vidéo allongent la session.",
                "La vidéo courte se comporte souvent davantage comme du streaming que comme de la navigation légère.",
                "L'appareil et le réseau restent importants même quand chaque interaction semble minime."
            ],
            assumptions: [
                "L'estimation reflète un usage actif des réseaux sociaux dans le temps et non un simple rafraîchissement.",
                "Elle regroupe l'énergie côté app, réseau et appareil dans une seule empreinte consommateur.",
                "Le chiffre est surtout utile pour comparer des habitudes et des plateformes."
            ],
            reduction_tips: [
                "Désactivez l'autoplay et réduisez le temps de scroll accidentel quand c'est possible.",
                "Utilisez des appareils plus petits et une luminosité plus faible pour les sessions casual.",
                "Fixez des limites de temps si les boucles de recommandation rallongent l'usage."
            ],
            uncertainty: "L'empreinte des réseaux sociaux varie avec la densité média, l'autoplay, l'appareil et la quantité de vidéo dans le feed.",
            source_references: sourceReferences("fr", "social"),
            searchTopics: ["empreinte carbone des réseaux sociaux", "émissions de tiktok", "empreinte carbone d'instagram"],
        },
    },
    Crypto: {
        en: {
            key_drivers: [
                "Network design matters far more here than end-user device power draw.",
                "Proof-of-work systems can carry dramatically higher transaction-level emissions than lighter consensus systems.",
                "The way mining or validation energy is allocated across network activity changes the estimate."
            ],
            assumptions: [
                "The figure should be read as a transaction or usage estimate, not as one hour of consumer screen time.",
                "It represents a network-level approximation rather than a direct meter reading.",
                "The estimate is most useful for comparing categories of crypto activity, not for settling exact accounting debates."
            ],
            reduction_tips: [
                "Use lower-intensity networks where that choice is available and appropriate.",
                "Avoid unnecessary on-chain activity.",
                "Treat crypto usage as a high-variance footprint category and communicate uncertainty clearly."
            ],
            uncertainty: "Crypto estimates are unusually contested because they depend on network design, attribution method, and changing energy sources across miners or validators.",
            source_references: sourceReferences("en", "crypto"),
            searchTopics: ["bitcoin transaction emissions", "crypto carbon footprint", "ethereum vs bitcoin emissions"],
        },
        es: {
            key_drivers: [
                "Aquí importa mucho más el diseño de la red que el consumo del dispositivo final.",
                "Los sistemas proof-of-work pueden tener emisiones por transacción mucho más altas que consensos más ligeros.",
                "La forma de asignar la energía de minería o validación a la actividad de red cambia la estimación."
            ],
            assumptions: [
                "La cifra debe leerse como una estimación por transacción o por uso, no como una hora de pantalla del consumidor.",
                "Representa una aproximación a nivel de red y no una medición directa.",
                "Es más útil para comparar categorías de actividad cripto que para zanjar debates contables exactos."
            ],
            reduction_tips: [
                "Usa redes de menor intensidad cuando esa opción exista y tenga sentido.",
                "Evita actividad on-chain innecesaria.",
                "Trata el uso de cripto como una categoría de huella de alta variabilidad y comunica la incertidumbre con claridad."
            ],
            uncertainty: "Las estimaciones cripto son especialmente discutidas porque dependen del diseño de la red, del método de atribución y de fuentes energéticas cambiantes.",
            source_references: sourceReferences("es", "crypto"),
            searchTopics: ["emisiones por transacción de bitcoin", "huella de carbono cripto", "emisiones ethereum vs bitcoin"],
        },
        de: {
            key_drivers: [
                "Hier zählt das Netzwerkdesign deutlich mehr als der Stromverbrauch des Endgeräts.",
                "Proof-of-Work-Systeme können pro Transaktion deutlich höhere Emissionen haben als leichtere Konsensmodelle.",
                "Die Art, wie Mining- oder Validierungsenergie auf Netzwerkaktivität verteilt wird, verändert die Schätzung."
            ],
            assumptions: [
                "Die Zahl ist als Transaktions- oder Nutzungswert zu lesen und nicht als Stunde Bildschirmzeit eines Nutzers.",
                "Sie stellt eine Näherung auf Netzwerkebene dar und keine direkte Messung.",
                "Sie ist nützlicher für den Vergleich von Krypto-Aktivitätsarten als für exakte Bilanzdebatten."
            ],
            reduction_tips: [
                "Nutze energieärmere Netzwerke, wo diese Wahl verfügbar und sinnvoll ist.",
                "Vermeide unnötige On-Chain-Aktivität.",
                "Behandle Krypto als Kategorie mit hoher Unsicherheit und kommuniziere diese klar."
            ],
            uncertainty: "Krypto-Schätzungen sind besonders umstritten, weil sie von Netzwerkdesign, Zuordnungsmethode und sich ändernden Energiequellen abhängen.",
            source_references: sourceReferences("de", "crypto"),
            searchTopics: ["bitcoin transaktion emissionen", "krypto co2-fußabdruck", "ethereum vs bitcoin emissionen"],
        },
        pt: {
            key_drivers: [
                "Aqui o desenho da rede importa muito mais do que o consumo do dispositivo do utilizador.",
                "Sistemas proof-of-work podem ter emissões por transação muito mais altas do que consensos mais leves.",
                "A forma como a energia de mineração ou validação é atribuída à atividade da rede altera a estimativa."
            ],
            assumptions: [
                "O valor deve ser lido como uma estimativa por transação ou por uso, e não como uma hora de ecrã do consumidor.",
                "Representa uma aproximação ao nível da rede e não uma leitura direta.",
                "É mais útil para comparar categorias de atividade cripto do que para fechar debates contabilísticos exatos."
            ],
            reduction_tips: [
                "Usa redes de menor intensidade quando essa escolha estiver disponível e fizer sentido.",
                "Evita atividade on-chain desnecessária.",
                "Trata o uso de cripto como uma categoria de pegada de alta variabilidade e comunica bem a incerteza."
            ],
            uncertainty: "As estimativas de cripto são especialmente contestadas porque dependem do desenho da rede, do método de atribuição e de fontes energéticas em mudança.",
            source_references: sourceReferences("pt", "crypto"),
            searchTopics: ["emissões por transação de bitcoin", "pegada de carbono cripto", "emissões ethereum vs bitcoin"],
        },
        fr: {
            key_drivers: [
                "Ici, le design du réseau compte beaucoup plus que la consommation de l'appareil utilisateur.",
                "Les systèmes proof-of-work peuvent avoir des émissions par transaction bien plus élevées que des consensus plus légers.",
                "La manière d'attribuer l'énergie de minage ou de validation à l'activité du réseau change l'estimation."
            ],
            assumptions: [
                "Le chiffre doit être lu comme une estimation par transaction ou par usage, pas comme une heure d'écran consommateur.",
                "Il représente une approximation au niveau du réseau plutôt qu'une mesure directe.",
                "Il sert surtout à comparer des catégories d'activité crypto, pas à trancher des débats comptables précis."
            ],
            reduction_tips: [
                "Utilisez des réseaux moins intensifs quand ce choix existe et reste approprié.",
                "Évitez les activités on-chain inutiles.",
                "Traitez l'usage crypto comme une catégorie très variable et explicitez clairement l'incertitude."
            ],
            uncertainty: "Les estimations crypto sont particulièrement discutées car elles dépendent du design du réseau, de la méthode d'attribution et de sources d'énergie changeantes.",
            source_references: sourceReferences("fr", "crypto"),
            searchTopics: ["émissions par transaction bitcoin", "empreinte carbone crypto", "émissions ethereum vs bitcoin"],
        },
    },
};

const APP_OVERRIDES: Record<string, Partial<Record<CarbonLocale, Partial<Omit<CarbonSeoExtension, "reviewed_at" | "reviewer">>>>> = {
    chatgpt: {
        en: {
            key_drivers: [
                "Prompt volume and response length both change inference demand.",
                "AI inference sits on top of an accelerator-heavy compute stack that is more energy intensive than most ordinary web requests.",
                "Model size and utilization influence the real-world spread around any consumer estimate."
            ],
            assumptions: [
                "This page models repeated assistant use rather than a one-off prompt benchmark.",
                "The estimate includes model-serving overhead and surrounding data-center infrastructure.",
                "It is designed for consumer comparison and awareness, not vendor accounting."
            ],
            reduction_tips: [
                "Consolidate related prompts into one well-scoped request.",
                "Avoid long outputs when a short answer is enough.",
                "Use AI for the tasks where the value clearly outweighs the footprint."
            ],
            searchTopics: ["chatgpt carbon footprint", "how much co2 does chatgpt produce", "chatgpt energy use"],
        },
        es: {
            searchTopics: ["huella de carbono de chatgpt", "cuánto co2 produce chatgpt", "consumo energético de chatgpt"],
        },
        de: {
            searchTopics: ["chatgpt co2-fußabdruck", "wie viel co2 verursacht chatgpt", "energieverbrauch von chatgpt"],
        },
        pt: {
            searchTopics: ["pegada de carbono do chatgpt", "quanto co2 o chatgpt produz", "consumo energético do chatgpt"],
        },
        fr: {
            searchTopics: ["empreinte carbone de chatgpt", "combien de co2 produit chatgpt", "consommation énergétique de chatgpt"],
        },
    },
    netflix: {
        en: { searchTopics: ["netflix carbon footprint", "netflix emissions per hour", "streaming netflix co2"] },
        es: { searchTopics: ["huella de carbono de netflix", "emisiones de netflix por hora", "co2 de ver netflix"] },
        de: { searchTopics: ["netflix co2-fußabdruck", "netflix emissionen pro stunde", "co2 von netflix streaming"] },
        pt: { searchTopics: ["pegada de carbono da netflix", "emissões da netflix por hora", "co2 do streaming netflix"] },
        fr: { searchTopics: ["empreinte carbone de netflix", "émissions de netflix par heure", "co2 du streaming netflix"] },
    },
    youtube: {
        en: { searchTopics: ["youtube carbon footprint", "youtube emissions per hour", "video streaming co2"] },
        es: { searchTopics: ["huella de carbono de youtube", "emisiones de youtube por hora", "co2 del streaming de vídeo"] },
        de: { searchTopics: ["youtube co2-fußabdruck", "youtube emissionen pro stunde", "co2 von videostreaming"] },
        pt: { searchTopics: ["pegada de carbono do youtube", "emissões do youtube por hora", "co2 do streaming de vídeo"] },
        fr: { searchTopics: ["empreinte carbone de youtube", "émissions de youtube par heure", "co2 du streaming vidéo"] },
    },
    zoom: {
        en: { searchTopics: ["zoom carbon footprint", "zoom call emissions", "video meeting co2"] },
        es: { searchTopics: ["huella de carbono de zoom", "emisiones de una llamada de zoom", "co2 de videollamadas"] },
        de: { searchTopics: ["zoom co2-fußabdruck", "emissionen eines zoom calls", "co2 von videomeetings"] },
        pt: { searchTopics: ["pegada de carbono do zoom", "emissões de chamada zoom", "co2 de reuniões por vídeo"] },
        fr: { searchTopics: ["empreinte carbone de zoom", "émissions d'un appel zoom", "co2 des réunions vidéo"] },
    },
    bitcoin: {
        en: {
            source_references: sourceReferences("en", "bitcoinOverride"),
            searchTopics: ["bitcoin transaction carbon footprint", "bitcoin co2 per transaction", "bitcoin emissions estimate"],
        },
        es: {
            source_references: sourceReferences("es", "bitcoinOverride"),
            searchTopics: ["huella de carbono por transacción de bitcoin", "co2 de bitcoin por transacción", "estimación de emisiones de bitcoin"],
        },
        de: {
            source_references: sourceReferences("de", "bitcoinOverride"),
            searchTopics: ["bitcoin transaktion co2-fußabdruck", "bitcoin co2 pro transaktion", "bitcoin emissionsschätzung"],
        },
        pt: {
            source_references: sourceReferences("pt", "bitcoinOverride"),
            searchTopics: ["pegada de carbono por transação de bitcoin", "co2 do bitcoin por transação", "estimativa de emissões do bitcoin"],
        },
        fr: {
            source_references: sourceReferences("fr", "bitcoinOverride"),
            searchTopics: ["empreinte carbone par transaction bitcoin", "co2 du bitcoin par transaction", "estimation des émissions du bitcoin"],
        },
    },
    discord: {
        en: {
            source_references: discordSourceReferences("en"),
        },
        es: {
            source_references: discordSourceReferences("es"),
        },
        de: {
            source_references: discordSourceReferences("de"),
        },
        pt: {
            source_references: discordSourceReferences("pt"),
        },
        fr: {
            source_references: discordSourceReferences("fr"),
        },
    },
    ethereum: {
        en: {
            source_references: [
                { title: "Cambridge Ethereum methodology", url: CAMBRIDGE_ETHEREUM_URL, note: SOURCE_NOTES.ethereumMethodology.en },
                { title: "Ethereum.org: The Merge", url: ETHEREUM_MERGE_URL, note: SOURCE_NOTES.ethereumMerge.en },
            ],
            searchTopics: ["ethereum transaction carbon footprint", "ethereum co2 per transaction", "ethereum merge energy use"],
        },
        es: {
            source_references: [
                { title: "Cambridge Ethereum methodology", url: CAMBRIDGE_ETHEREUM_URL, note: SOURCE_NOTES.ethereumMethodology.es },
                { title: "Ethereum.org: The Merge", url: ETHEREUM_MERGE_URL, note: SOURCE_NOTES.ethereumMerge.es },
            ],
            searchTopics: ["huella de carbono por transacción de ethereum", "co2 de ethereum por transacción", "consumo energético de ethereum tras the merge"],
        },
        de: {
            source_references: [
                { title: "Cambridge Ethereum methodology", url: CAMBRIDGE_ETHEREUM_URL, note: SOURCE_NOTES.ethereumMethodology.de },
                { title: "Ethereum.org: The Merge", url: ETHEREUM_MERGE_URL, note: SOURCE_NOTES.ethereumMerge.de },
            ],
            searchTopics: ["ethereum transaktion co2-fußabdruck", "ethereum co2 pro transaktion", "energieverbrauch von ethereum nach dem merge"],
        },
        pt: {
            source_references: [
                { title: "Cambridge Ethereum methodology", url: CAMBRIDGE_ETHEREUM_URL, note: SOURCE_NOTES.ethereumMethodology.pt },
                { title: "Ethereum.org: The Merge", url: ETHEREUM_MERGE_URL, note: SOURCE_NOTES.ethereumMerge.pt },
            ],
            searchTopics: ["pegada de carbono por transação de ethereum", "co2 do ethereum por transação", "consumo energético do ethereum após o merge"],
        },
        fr: {
            source_references: [
                { title: "Cambridge Ethereum methodology", url: CAMBRIDGE_ETHEREUM_URL, note: SOURCE_NOTES.ethereumMethodology.fr },
                { title: "Ethereum.org: The Merge", url: ETHEREUM_MERGE_URL, note: SOURCE_NOTES.ethereumMerge.fr },
            ],
            searchTopics: ["empreinte carbone par transaction ethereum", "co2 de l'ethereum par transaction", "consommation d'énergie d'ethereum après the merge"],
        },
    },
    "google-chrome": {
        en: { searchTopics: ["chrome carbon footprint", "browser energy use", "digital browsing emissions"] },
        es: { searchTopics: ["huella de carbono de chrome", "consumo energético del navegador", "emisiones de navegación digital"] },
        de: { searchTopics: ["chrome co2-fußabdruck", "stromverbrauch browser", "digitale browsing emissionen"] },
        pt: { searchTopics: ["pegada de carbono do chrome", "consumo energético do browser", "emissões da navegação digital"] },
        fr: { searchTopics: ["empreinte carbone de chrome", "consommation d'énergie du navigateur", "émissions de navigation numérique"] },
    },
};

function buildSearchTopics(appName: string, locale: CarbonLocale): string[] {
    switch (locale) {
        case "es":
            return [`huella de carbono de ${appName}`, `emisiones de CO2 de ${appName}`, `cuánta energía usa ${appName}`];
        case "de":
            return [`${appName} co2-fußabdruck`, `${appName} co2-emissionen`, `wie viel energie verbraucht ${appName}`];
        case "pt":
            return [`pegada de carbono de ${appName}`, `emissões de CO2 de ${appName}`, `quanta energia usa ${appName}`];
        case "fr":
            return [`empreinte carbone de ${appName}`, `émissions de CO2 de ${appName}`, `combien d'énergie utilise ${appName}`];
        default:
            return [`${appName} carbon footprint`, `${appName} CO2 emissions`, `how much energy does ${appName} use`];
    }
}

function mergeLocaleSeo(
    app: CarbonSeedEntry,
    locale: CarbonLocale,
    existingSeo: CarbonSeoSeedLocale
): CarbonSeoSeedLocale {
    const categoryDefaults = CATEGORY_SEO[app.category]?.[locale] || CATEGORY_SEO.Browsing[locale];
    const override = APP_OVERRIDES[app.slug]?.[locale] || {};

    return {
        ...existingSeo,
        reviewed_at: existingSeo.reviewed_at || REVIEWED_AT,
        reviewer: existingSeo.reviewer || REVIEWERS[locale],
        key_drivers: existingSeo.key_drivers || override.key_drivers || categoryDefaults.key_drivers,
        assumptions: existingSeo.assumptions || override.assumptions || categoryDefaults.assumptions,
        reduction_tips: existingSeo.reduction_tips || override.reduction_tips || categoryDefaults.reduction_tips,
        uncertainty: existingSeo.uncertainty || override.uncertainty || categoryDefaults.uncertainty,
        source_references: existingSeo.source_references || override.source_references || categoryDefaults.source_references,
        searchTopics: unique([
            ...(existingSeo.searchTopics || []),
            ...(override.searchTopics || []),
            ...(categoryDefaults.searchTopics || []),
            ...buildSearchTopics(app.app_name, locale),
        ]),
    };
}

export function enrichCarbonSeedData(seedData: CarbonSeedEntry[]): CarbonSeedEntry[] {
    return seedData.map((app) => {
        const localizedSeo = Object.fromEntries(
            CARBON_LOCALES.map((locale) => {
                const baseSeo = app.seo_content?.en || {};
                const localeSeo = app.seo_content?.[locale] || {};
                const mergedExisting = locale === "en" ? { ...baseSeo } : { ...baseSeo, ...localeSeo };
                return [locale, mergeLocaleSeo(app, locale, mergedExisting)];
            })
        );

        return {
            ...app,
            seo_content: localizedSeo,
        };
    });
}
