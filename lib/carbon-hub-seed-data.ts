export interface CarbonHubSection {
    title: string;
    body: string;
}

export interface CarbonHubPlaybookItem {
    title: string;
    body: string;
}

export interface CarbonHubFaqItem {
    question: string;
    answer: string;
}

export interface CarbonHubLocaleContent {
    title: string;
    seoTitle: string;
    seoDescription: string;
    queryChips: string[];
    eyebrow: string;
    intro: string;
    categoryFilter?: string[];
    sections: CarbonHubSection[];
    playbook: CarbonHubPlaybookItem[];
    faq: CarbonHubFaqItem[];
    featuredComparisonPairs: [string, string][];
}

export interface CarbonHubSeedEntry {
    slug: string;
    content: Record<string, CarbonHubLocaleContent>;
}

export const CARBON_HUB_SEED_DATA: CarbonHubSeedEntry[] = [
    {
        slug: "overview",
        content: {
            en: {
                title: "Digital carbon footprint guides and calculators",
                seoTitle: "Digital Carbon Footprint Guides and Calculators | IdleForest",
                seoDescription: "Compare the carbon footprint of everyday apps, AI tools, games, browsers, streaming platforms, and online work habits in one connected hub.",
                queryChips: [
                    "digital carbon footprint",
                    "app carbon footprint",
                    "ai carbon footprint",
                    "streaming carbon footprint"
                ],
                eyebrow: "Carbon footprint cluster hub",
                intro: "Compare the carbon footprint of the apps, AI tools, games, browsers, and streaming platforms people use every day. Use this hub to move from broad definitions into practical calculators, comparisons, and methodology-backed guides.",
                sections: [
                    {
                        title: "Start with the biggest daily habits",
                        body: "The most useful entry points are usually the behaviors people repeat every day: streaming, AI prompts, meetings, social feeds, and long browser sessions."
                    },
                    {
                        title: "Use the cluster to narrow intent",
                        body: "This hub is designed to help people move from broad queries like digital carbon footprint into more specific searches such as ChatGPT emissions or Netflix versus YouTube."
                    },
                    {
                        title: "Read the estimate as directional guidance",
                        body: "These pages are built to compare common digital behaviors, not to reproduce proprietary vendor accounting line by line."
                    }
                ],
                playbook: [
                    {
                        title: "Own the parent topic",
                        body: "This page should tell users and search engines that the cluster covers AI, streaming, work, browsing, social, crypto, and gaming emissions in one coherent system."
                    },
                    {
                        title: "Route people to the best calculators",
                        body: "The strongest next clicks are usually the highest-demand app pages and the most intuitive comparison pages."
                    },
                    {
                        title: "Show breadth without going thin",
                        body: "The cluster performs best when a smaller number of pages are clearly deeper, better sourced, and easier to navigate than generic competitor templates."
                    }
                ],
                faq: [
                    {
                        question: "What is this carbon footprint hub for?",
                        answer: "It connects broad digital sustainability queries with practical calculators and comparison pages so people can understand which habits matter most."
                    },
                    {
                        question: "How should someone use this hub?",
                        answer: "Start with the broad category that matches the query, then move into the specific app page or comparison page that best matches the real habit you want to estimate."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
            },
            de: {
                title: "Leitfäden und Rechner zum digitalen CO2-Fußabdruck",
                seoTitle: "Leitfäden und Rechner zum digitalen CO2-Fußabdruck | IdleForest",
                seoDescription: "Vergleiche den CO2-Fußabdruck alltäglicher Apps, KI-Tools, Spiele, Browser, Streaming-Plattformen und digitaler Arbeitsgewohnheiten in einem verbundenen Hub.",
                queryChips: [
                    "digitaler CO2-Fußabdruck",
                    "CO2-Fußabdruck von Apps",
                    "KI CO2-Fußabdruck",
                    "Streaming CO2-Fußabdruck"
                ],
                eyebrow: "CO2-Fußabdruck-Cluster-Hub",
                intro: "Vergleiche den CO2-Fußabdruck von Apps, KI-Tools, Spielen, Browsern und Streaming-Plattformen, die Menschen täglich nutzen. Dieser Hub führt von allgemeinen Definitionen zu praktischen Rechnern, Vergleichen und methodisch erklärten Leitfäden.",
                sections: [
                    {
                        title: "Beginne mit den größten täglichen Gewohnheiten",
                        body: "Die nützlichsten Einstiege sind meist Verhaltensweisen, die Menschen jeden Tag wiederholen: Streaming, KI-Prompts, Meetings, Social-Feeds und lange Browsing-Sessions."
                    },
                    {
                        title: "Nutze den Cluster zur Eingrenzung der Suchintention",
                        body: "Dieser Hub hilft dabei, von breiten Suchanfragen wie digitaler CO2-Fußabdruck zu konkreteren Themen wie ChatGPT-Emissionen oder Netflix versus YouTube zu gelangen."
                    },
                    {
                        title: "Lies die Schätzung als Richtwert",
                        body: "Diese Seiten sind dafür gebaut, typische digitale Verhaltensweisen zu vergleichen und nicht proprietäre Anbieterabrechnungen exakt nachzubilden."
                    }
                ],
                playbook: [
                    {
                        title: "Das Elternthema besetzen",
                        body: "Diese Seite soll Nutzern und Suchmaschinen zeigen, dass der Cluster KI-, Streaming-, Arbeits-, Browsing-, Social-, Krypto- und Gaming-Emissionen in einem zusammenhängenden System abdeckt."
                    },
                    {
                        title: "Menschen zu den besten Rechnern führen",
                        body: "Die stärksten nächsten Klicks sind meist die gefragtesten App-Seiten und die naheliegendsten Vergleichsseiten."
                    },
                    {
                        title: "Breite zeigen, ohne dünn zu werden",
                        body: "Der Cluster funktioniert am besten, wenn eine kleinere Zahl von Seiten klar tiefer, besser belegt und leichter navigierbar ist als generische Wettbewerbsseiten."
                    }
                ],
                faq: [
                    {
                        question: "Wofür ist dieser CO2-Fußabdruck-Hub gedacht?",
                        answer: "Er verbindet breite Fragen zur digitalen Nachhaltigkeit mit praktischen Rechnern und Vergleichsseiten, damit Menschen verstehen, welche Gewohnheiten am meisten zählen."
                    },
                    {
                        question: "Wie sollte man diesen Hub nutzen?",
                        answer: "Beginne mit der übergeordneten Kategorie der Suchanfrage und wechsle dann zu der App- oder Vergleichsseite, die am besten zur tatsächlichen Gewohnheit passt, die du schätzen möchtest."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
            },
            es: {
                title: "Guías y calculadoras de huella de carbono digital",
                seoTitle: "Guías y calculadoras de huella de carbono digital | IdleForest",
                seoDescription: "Compara la huella de carbono de apps cotidianas, herramientas de IA, juegos, navegadores, plataformas de streaming y hábitos de trabajo digital en un solo hub conectado.",
                queryChips: [
                    "huella de carbono digital",
                    "huella de carbono de apps",
                    "huella de carbono de IA",
                    "huella de carbono del streaming"
                ],
                eyebrow: "Hub del clúster de huella de carbono",
                intro: "Compara la huella de carbono de las apps, herramientas de IA, juegos, navegadores y plataformas de streaming que la gente usa cada día. Este hub te lleva de las definiciones generales a calculadoras prácticas, comparaciones y guías con metodología.",
                sections: [
                    {
                        title: "Empieza por los hábitos diarios más importantes",
                        body: "Los mejores puntos de entrada suelen ser los comportamientos que la gente repite todos los días: streaming, prompts de IA, reuniones, feeds sociales y largas sesiones de navegación."
                    },
                    {
                        title: "Usa el clúster para afinar la intención de búsqueda",
                        body: "Este hub ayuda a pasar de consultas amplias como huella de carbono digital a búsquedas más concretas como emisiones de ChatGPT o Netflix frente a YouTube."
                    },
                    {
                        title: "Lee la estimación como una guía direccional",
                        body: "Estas páginas están pensadas para comparar comportamientos digitales comunes, no para reproducir línea por línea la contabilidad propietaria de un proveedor."
                    }
                ],
                playbook: [
                    {
                        title: "Dominar el tema padre",
                        body: "Esta página debe mostrar a usuarios y buscadores que el clúster cubre emisiones de IA, streaming, trabajo, navegación, social, cripto y gaming dentro de un mismo sistema."
                    },
                    {
                        title: "Llevar a la gente a las mejores calculadoras",
                        body: "Los siguientes clics más fuertes suelen ser las páginas de apps con mayor demanda y las comparativas más intuitivas."
                    },
                    {
                        title: "Mostrar amplitud sin caer en páginas finas",
                        body: "El clúster funciona mejor cuando un número menor de páginas es claramente más profundo, mejor citado y más fácil de navegar que las plantillas genéricas de la competencia."
                    }
                ],
                faq: [
                    {
                        question: "¿Para qué sirve este hub de huella de carbono?",
                        answer: "Conecta consultas amplias sobre sostenibilidad digital con calculadoras y comparativas prácticas para ayudar a entender qué hábitos importan más."
                    },
                    {
                        question: "¿Cómo debería usar alguien este hub?",
                        answer: "Empieza por la categoría general que coincida con la búsqueda y luego pasa a la página de app o comparación que mejor represente el hábito real que quieres estimar."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
            },
            pt: {
                title: "Guias e calculadoras de pegada de carbono digital",
                seoTitle: "Guias e calculadoras de pegada de carbono digital | IdleForest",
                seoDescription: "Compara a pegada de carbono de apps do dia a dia, ferramentas de IA, jogos, browsers, plataformas de streaming e hábitos de trabalho digital num único hub ligado.",
                queryChips: [
                    "pegada de carbono digital",
                    "pegada de carbono das apps",
                    "pegada de carbono da IA",
                    "pegada de carbono do streaming"
                ],
                eyebrow: "Hub do cluster de pegada de carbono",
                intro: "Compara a pegada de carbono das apps, ferramentas de IA, jogos, browsers e plataformas de streaming que as pessoas usam todos os dias. Este hub leva-te de definições gerais a calculadoras práticas, comparações e guias com metodologia.",
                sections: [
                    {
                        title: "Começa pelos maiores hábitos diários",
                        body: "Os pontos de entrada mais úteis costumam ser os comportamentos que as pessoas repetem todos os dias: streaming, prompts de IA, reuniões, feeds sociais e longas sessões de navegação."
                    },
                    {
                        title: "Usa o cluster para afinar a intenção de pesquisa",
                        body: "Este hub ajuda a passar de pesquisas amplas como pegada de carbono digital para temas mais concretos como emissões do ChatGPT ou Netflix versus YouTube."
                    },
                    {
                        title: "Lê a estimativa como uma orientação direcional",
                        body: "Estas páginas foram feitas para comparar comportamentos digitais comuns e não para reproduzir linha a linha a contabilidade proprietária de um fornecedor."
                    }
                ],
                playbook: [
                    {
                        title: "Dominar o tema principal",
                        body: "Esta página deve mostrar a utilizadores e motores de busca que o cluster cobre emissões de IA, streaming, trabalho, navegação, social, cripto e gaming num sistema coerente."
                    },
                    {
                        title: "Levar as pessoas às melhores calculadoras",
                        body: "Os cliques seguintes mais fortes costumam ser as páginas de apps com maior procura e as comparações mais intuitivas."
                    },
                    {
                        title: "Mostrar amplitude sem cair em páginas fracas",
                        body: "O cluster funciona melhor quando um número menor de páginas é claramente mais profundo, melhor suportado por fontes e mais fácil de navegar do que templates genéricos da concorrência."
                    }
                ],
                faq: [
                    {
                        question: "Para que serve este hub de pegada de carbono?",
                        answer: "Liga pesquisas amplas sobre sustentabilidade digital a calculadoras e comparações práticas para ajudar a perceber quais os hábitos que mais pesam."
                    },
                    {
                        question: "Como deve alguém usar este hub?",
                        answer: "Começa pela categoria geral que corresponde à pesquisa e depois passa para a página da app ou para a comparação que melhor representa o hábito real que queres estimar."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
            },
            fr: {
                title: "Guides et calculateurs d'empreinte carbone numérique",
                seoTitle: "Guides et calculateurs d'empreinte carbone numérique | IdleForest",
                seoDescription: "Comparez l'empreinte carbone des applications du quotidien, des outils d'IA, des jeux, des navigateurs, des plateformes de streaming et des habitudes de travail numérique dans un hub unique.",
                queryChips: [
                    "empreinte carbone numérique",
                    "empreinte carbone des applications",
                    "empreinte carbone de l'IA",
                    "empreinte carbone du streaming"
                ],
                eyebrow: "Hub du cluster d'empreinte carbone",
                intro: "Comparez l'empreinte carbone des applications, outils d'IA, jeux, navigateurs et plateformes de streaming utilisés au quotidien. Ce hub vous fait passer des définitions générales à des calculateurs pratiques, comparaisons et guides appuyés sur une méthodologie.",
                sections: [
                    {
                        title: "Commencez par les habitudes quotidiennes les plus lourdes",
                        body: "Les meilleurs points d'entrée sont souvent les comportements que l'on répète chaque jour : streaming, prompts IA, réunions, flux sociaux et longues sessions de navigation."
                    },
                    {
                        title: "Utilisez le cluster pour affiner l'intention de recherche",
                        body: "Ce hub aide à passer de requêtes larges comme empreinte carbone numérique à des recherches plus précises comme émissions de ChatGPT ou Netflix contre YouTube."
                    },
                    {
                        title: "Lisez l'estimation comme un repère directionnel",
                        body: "Ces pages sont conçues pour comparer des comportements numériques courants, et non pour reproduire ligne par ligne la comptabilité propriétaire d'un fournisseur."
                    }
                ],
                playbook: [
                    {
                        title: "Occuper le sujet parent",
                        body: "Cette page doit montrer aux utilisateurs et aux moteurs de recherche que le cluster couvre les émissions liées à l'IA, au streaming, au travail, à la navigation, au social, à la crypto et au gaming dans un même système."
                    },
                    {
                        title: "Orienter vers les meilleurs calculateurs",
                        body: "Les clics suivants les plus forts sont généralement les pages d'applications les plus demandées et les comparaisons les plus intuitives."
                    },
                    {
                        title: "Montrer de l'ampleur sans devenir superficiel",
                        body: "Le cluster fonctionne mieux lorsqu'un nombre plus réduit de pages est clairement plus profond, mieux sourcé et plus simple à parcourir que les modèles génériques des concurrents."
                    }
                ],
                faq: [
                    {
                        question: "À quoi sert ce hub d'empreinte carbone ?",
                        answer: "Il relie les requêtes larges sur la durabilité numérique à des calculateurs et comparaisons pratiques pour aider à comprendre quels usages comptent le plus."
                    },
                    {
                        question: "Comment utiliser ce hub ?",
                        answer: "Commencez par la grande catégorie qui correspond à la recherche, puis passez à la page application ou comparaison qui reflète le mieux l'usage réel à estimer."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
            }
        }
    },
    {
        slug: "ai",
        content: {
            en: {
                title: "AI Carbon Footprint",
                seoTitle: "AI Carbon Footprint: Emissions from Artificial Intelligence | IdleForest",
                seoDescription: "Understand the carbon footprint of AI models like ChatGPT and everyday AI use. Learn how inference, hardware, and data-center overhead shape digital emissions.",
                queryChips: ["ai carbon footprint", "carbon footprint of chatgpt", "llm emissions", "ai co2"],
                eyebrow: "AI emissions hub",
                intro: "Artificial intelligence offers incredible capabilities, but those systems also require heavy compute infrastructure. This hub is built to connect broad AI emissions searches to practical calculator pages and clearer methodology.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Training and inference are different search intents",
                        body: "Training headlines explain the scale of model development, while most consumer searches are really about inference: repeated everyday use of tools like ChatGPT."
                    },
                    {
                        title: "Hardware and cooling still matter",
                        body: "AI workloads sit on top of accelerator-heavy servers, networking, and cooling systems, so the visible product is only part of the footprint story."
                    }
                ],
                playbook: [
                    {
                        title: "Start with inference, not just training headlines",
                        body: "Most consumer search demand sits around everyday tools like ChatGPT, so the hub should explain how repeated inference accumulates over time."
                    },
                    {
                        title: "Connect infrastructure to usage behavior",
                        body: "People want to understand why AI feels heavier than a normal web request. Tie prompts, model size, accelerator use, and cooling into one explanation."
                    },
                    {
                        title: "Route visitors to the strongest proof page",
                        body: "This hub should repeatedly point people toward the ChatGPT leaf page and future AI benchmark pages."
                    }
                ],
                faq: [
                    {
                        question: "Why is AI carbon footprint content hard to rank with thin pages?",
                        answer: "Because searchers want explanation, methodology, and context. A thin hub rarely competes well unless it clearly adds original framing or data."
                    },
                    {
                        question: "What should this AI hub help people do?",
                        answer: "It should help them understand the major drivers of AI emissions, then move them into the calculator page that best matches the query."
                    }
                ],
                featuredComparisonPairs: []
            },
            de: {
                title: "KI-CO2-Fußabdruck",
                seoTitle: "KI-CO2-Fußabdruck: Emissionen künstlicher Intelligenz | IdleForest",
                seoDescription: "Verstehe den CO2-Fußabdruck von KI-Modellen wie ChatGPT und alltäglicher KI-Nutzung. Erfahre, wie Inferenz, Hardware und Rechenzentrums-Overhead digitale Emissionen formen.",
                queryChips: ["KI CO2-Fußabdruck", "ChatGPT CO2-Fußabdruck", "LLM Emissionen", "KI CO2"],
                eyebrow: "Hub für KI-Emissionen",
                intro: "Künstliche Intelligenz bietet enorme Möglichkeiten, benötigt aber auch rechenintensive Infrastruktur. Dieser Hub verbindet breite Suchanfragen zu KI-Emissionen mit praktischen Rechnerseiten und verständlicher Methodik.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Training und Inferenz sind unterschiedliche Suchintentionen",
                        body: "Schlagzeilen zum Training zeigen die Größe der Modellentwicklung, während sich die meisten Verbrauchersuchen in Wahrheit auf Inferenz beziehen: die wiederholte tägliche Nutzung von Tools wie ChatGPT."
                    },
                    {
                        title: "Hardware und Kühlung zählen weiterhin",
                        body: "KI-Workloads laufen auf Servern mit vielen Beschleunigern, Netzwerken und Kühlsystemen. Das sichtbare Produkt ist deshalb nur ein Teil der Emissionsgeschichte."
                    }
                ],
                playbook: [
                    {
                        title: "Mit Inferenz beginnen, nicht nur mit Trainings-Schlagzeilen",
                        body: "Der Großteil der Verbrauchernachfrage dreht sich um Alltagstools wie ChatGPT. Der Hub sollte daher erklären, wie sich wiederholte Inferenz über die Zeit aufsummiert."
                    },
                    {
                        title: "Infrastruktur mit Nutzungsverhalten verbinden",
                        body: "Menschen wollen verstehen, warum KI schwerer wirkt als eine normale Webanfrage. Verbinde Prompts, Modellgröße, Beschleuniger und Kühlung in einer Erklärung."
                    },
                    {
                        title: "Besucher zur stärksten Beweis-Seite führen",
                        body: "Dieser Hub sollte immer wieder auf die ChatGPT-Seite und künftige KI-Benchmark-Seiten verweisen."
                    }
                ],
                faq: [
                    {
                        question: "Warum ist dünner Inhalt zum KI-CO2-Fußabdruck schwer zu ranken?",
                        answer: "Weil Suchende Erklärung, Methodik und Kontext wollen. Ein dünner Hub konkurriert selten gut, wenn er nicht klar eigene Einordnung oder Daten bietet."
                    },
                    {
                        question: "Wobei sollte dieser KI-Hub helfen?",
                        answer: "Er sollte die wichtigsten Treiber von KI-Emissionen erklären und dann zur Rechnerseite führen, die am besten zur Suchanfrage passt."
                    }
                ],
                featuredComparisonPairs: []
            },
            es: {
                title: "Huella de carbono de la IA",
                seoTitle: "Huella de carbono de la IA: emisiones de la inteligencia artificial | IdleForest",
                seoDescription: "Entiende la huella de carbono de modelos de IA como ChatGPT y del uso cotidiano de la IA. Aprende cómo la inferencia, el hardware y la sobrecarga del centro de datos influyen en las emisiones digitales.",
                queryChips: ["huella de carbono de la IA", "huella de carbono de ChatGPT", "emisiones de LLM", "IA CO2"],
                eyebrow: "Hub de emisiones de IA",
                intro: "La inteligencia artificial ofrece capacidades enormes, pero también necesita infraestructura de cómputo intensiva. Este hub conecta búsquedas amplias sobre emisiones de IA con páginas de cálculo prácticas y una metodología más clara.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Entrenamiento e inferencia responden a intenciones distintas",
                        body: "Los titulares sobre entrenamiento muestran la escala del desarrollo de modelos, mientras que la mayoría de búsquedas de usuarios realmente tratan sobre inferencia: el uso cotidiano repetido de herramientas como ChatGPT."
                    },
                    {
                        title: "El hardware y la refrigeración siguen importando",
                        body: "Las cargas de IA se apoyan en servidores con muchos aceleradores, redes y sistemas de refrigeración, por lo que el producto visible es solo una parte de la historia."
                    }
                ],
                playbook: [
                    {
                        title: "Empieza por la inferencia, no solo por los titulares sobre entrenamiento",
                        body: "La mayor parte de la demanda de búsqueda de usuarios gira en torno a herramientas diarias como ChatGPT, así que el hub debe explicar cómo la inferencia repetida se acumula con el tiempo."
                    },
                    {
                        title: "Conecta la infraestructura con el comportamiento de uso",
                        body: "La gente quiere entender por qué la IA parece más pesada que una petición web normal. Une prompts, tamaño del modelo, aceleradores y refrigeración en una sola explicación."
                    },
                    {
                        title: "Lleva al visitante a la página con más evidencia",
                        body: "Este hub debe dirigir repetidamente a la página de ChatGPT y a futuras páginas de benchmarks de IA."
                    }
                ],
                faq: [
                    {
                        question: "¿Por qué es difícil posicionar contenido fino sobre huella de carbono de la IA?",
                        answer: "Porque los usuarios buscan explicación, metodología y contexto. Un hub fino rara vez compite bien si no aporta un enfoque o datos realmente propios."
                    },
                    {
                        question: "¿Qué debería ayudar a hacer este hub de IA?",
                        answer: "Debería ayudar a entender los grandes impulsores de las emisiones de la IA y luego llevar a la calculadora que mejor encaje con la búsqueda."
                    }
                ],
                featuredComparisonPairs: []
            },
            pt: {
                title: "Pegada de carbono da IA",
                seoTitle: "Pegada de carbono da IA: emissões da inteligência artificial | IdleForest",
                seoDescription: "Compreende a pegada de carbono de modelos de IA como o ChatGPT e do uso diário de IA. Aprende como a inferência, o hardware e a sobrecarga do centro de dados moldam as emissões digitais.",
                queryChips: ["pegada de carbono da IA", "pegada de carbono do ChatGPT", "emissões de LLM", "IA CO2"],
                eyebrow: "Hub de emissões de IA",
                intro: "A inteligência artificial oferece capacidades impressionantes, mas também exige infraestrutura de computação intensiva. Este hub liga pesquisas amplas sobre emissões de IA a páginas de cálculo práticas e a uma metodologia mais clara.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Treino e inferência respondem a intenções diferentes",
                        body: "As manchetes sobre treino mostram a escala do desenvolvimento dos modelos, enquanto a maioria das pesquisas dos utilizadores diz realmente respeito à inferência: o uso repetido no dia a dia de ferramentas como o ChatGPT."
                    },
                    {
                        title: "Hardware e arrefecimento continuam a contar",
                        body: "As cargas de IA assentam em servidores com muitos aceleradores, redes e sistemas de arrefecimento, por isso o produto visível é apenas uma parte da história."
                    }
                ],
                playbook: [
                    {
                        title: "Começa pela inferência, não apenas pelas manchetes sobre treino",
                        body: "A maior parte da procura dos utilizadores gira em torno de ferramentas diárias como o ChatGPT, por isso o hub deve explicar como a inferência repetida se acumula ao longo do tempo."
                    },
                    {
                        title: "Liga a infraestrutura ao comportamento de utilização",
                        body: "As pessoas querem perceber porque a IA parece mais pesada do que um pedido web normal. Junta prompts, dimensão do modelo, aceleradores e arrefecimento numa só explicação."
                    },
                    {
                        title: "Leva os visitantes para a página mais forte",
                        body: "Este hub deve apontar repetidamente para a página do ChatGPT e para futuras páginas de benchmark de IA."
                    }
                ],
                faq: [
                    {
                        question: "Porque é difícil posicionar conteúdo fraco sobre a pegada de carbono da IA?",
                        answer: "Porque quem procura quer explicação, metodologia e contexto. Um hub fraco raramente compete bem se não acrescentar enquadramento próprio ou dados."
                    },
                    {
                        question: "Em que deve ajudar este hub de IA?",
                        answer: "Deve ajudar a perceber os principais motores das emissões de IA e depois encaminhar para a calculadora que melhor corresponde à pesquisa."
                    }
                ],
                featuredComparisonPairs: []
            },
            fr: {
                title: "Empreinte carbone de l'IA",
                seoTitle: "Empreinte carbone de l'IA : émissions de l'intelligence artificielle | IdleForest",
                seoDescription: "Comprenez l'empreinte carbone de modèles d'IA comme ChatGPT et des usages quotidiens de l'IA. Découvrez comment l'inférence, le matériel et la surcharge des centres de données façonnent les émissions numériques.",
                queryChips: ["empreinte carbone de l'IA", "empreinte carbone de ChatGPT", "émissions des LLM", "IA CO2"],
                eyebrow: "Hub des émissions liées à l'IA",
                intro: "L'intelligence artificielle offre des capacités remarquables, mais elle exige aussi une infrastructure de calcul intensive. Ce hub relie les recherches générales sur les émissions de l'IA à des pages de calcul pratiques et à une méthodologie plus claire.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Entraînement et inférence répondent à des intentions différentes",
                        body: "Les gros titres sur l'entraînement montrent l'ampleur du développement des modèles, alors que la plupart des recherches d'utilisateurs portent en réalité sur l'inférence : l'usage répété au quotidien d'outils comme ChatGPT."
                    },
                    {
                        title: "Le matériel et le refroidissement comptent toujours",
                        body: "Les charges IA reposent sur des serveurs riches en accélérateurs, des réseaux et des systèmes de refroidissement, donc le produit visible ne représente qu'une partie de l'empreinte."
                    }
                ],
                playbook: [
                    {
                        title: "Commencer par l'inférence, pas seulement par les gros titres sur l'entraînement",
                        body: "La majorité de la demande des utilisateurs concerne des outils du quotidien comme ChatGPT. Le hub doit donc expliquer comment l'inférence répétée s'accumule dans le temps."
                    },
                    {
                        title: "Relier l'infrastructure au comportement d'usage",
                        body: "Les gens veulent comprendre pourquoi l'IA semble plus lourde qu'une requête web classique. Reliez prompts, taille du modèle, accélérateurs et refroidissement dans une seule explication."
                    },
                    {
                        title: "Orienter les visiteurs vers la page la plus forte",
                        body: "Ce hub doit orienter régulièrement vers la page ChatGPT et vers de futures pages de benchmark IA."
                    }
                ],
                faq: [
                    {
                        question: "Pourquoi un contenu superficiel sur l'empreinte carbone de l'IA est-il difficile à positionner ?",
                        answer: "Parce que les chercheurs veulent de l'explication, de la méthodologie et du contexte. Un hub superficiel rivalise rarement bien sans cadrage original ou données utiles."
                    },
                    {
                        question: "Que doit permettre ce hub IA ?",
                        answer: "Il doit aider à comprendre les principaux moteurs des émissions de l'IA, puis orienter vers le calculateur qui correspond le mieux à la requête."
                    }
                ],
                featuredComparisonPairs: []
            }
        }
    },
    {
        slug: "streaming",
        content: {
            en: {
                title: "Streaming Carbon Footprint",
                seoTitle: "Streaming Carbon Footprint: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Compare the carbon emissions of major streaming platforms and everyday viewing habits. Understand how devices, resolution, and autoplay shape the footprint.",
                queryChips: ["streaming carbon footprint", "netflix emissions", "youtube carbon footprint", "spotify co2"],
                eyebrow: "Streaming emissions hub",
                intro: "Streaming looks simple from the front end, but every viewing session depends on delivery infrastructure, transmission networks, and the device doing the playback. This hub is meant to connect that bigger picture to individual calculator pages.",
                categoryFilter: ["Streaming"],
                sections: [
                    {
                        title: "From data centers to devices",
                        body: "Streaming's footprint comes from three layers: the platform infrastructure, the network path delivering the media, and the device used to watch or listen."
                    },
                    {
                        title: "Not all streaming behavior is the same",
                        body: "Long-form video, short-form autoplay loops, music streaming, and live streams all look similar at a high level, but the user behavior and playback context can change the real impact."
                    }
                ],
                playbook: [
                    {
                        title: "Frame the device as part of the answer",
                        body: "Streaming searchers often assume the platform is the whole story, but playback device and resolution can change the footprint materially."
                    },
                    {
                        title: "Use the hub to segment intent",
                        body: "Long-form video, short-form feeds, music streaming, and live streams are related but not identical search intents. This hub should make those lanes clearer."
                    },
                    {
                        title: "Promote the strongest compare pages",
                        body: "Comparisons like Netflix vs YouTube or YouTube vs TikTok are natural next clicks and help strengthen the cluster when they are genuinely useful."
                    }
                ],
                faq: [
                    {
                        question: "What changes streaming emissions the most?",
                        answer: "The biggest swing factors are often watch time, resolution, autoplay behavior, and the device used for playback."
                    },
                    {
                        question: "Why is a streaming parent page useful?",
                        answer: "It helps connect broad streaming queries to the specific calculators and comparisons that best match the actual viewing habit."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            de: {
                title: "Streaming-CO2-Fußabdruck",
                seoTitle: "Streaming-CO2-Fußabdruck: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Vergleiche die CO2-Emissionen großer Streaming-Plattformen und typischer Sehgewohnheiten. Verstehe, wie Geräte, Auflösung und Autoplay den Fußabdruck beeinflussen.",
                queryChips: ["Streaming CO2-Fußabdruck", "Netflix Emissionen", "YouTube CO2-Fußabdruck", "Spotify CO2"],
                eyebrow: "Hub für Streaming-Emissionen",
                intro: "Streaming wirkt an der Oberfläche einfach, doch jede Sitzung hängt von Auslieferungsinfrastruktur, Übertragungsnetzen und dem Gerät ab, das die Wiedergabe übernimmt. Dieser Hub verbindet dieses größere Bild mit einzelnen Rechnerseiten.",
                categoryFilter: ["Streaming"],
                sections: [
                    {
                        title: "Von Rechenzentren bis zu Geräten",
                        body: "Der Fußabdruck von Streaming besteht aus drei Ebenen: der Plattforminfrastruktur, dem Netzwerkpfad zur Auslieferung der Medien und dem Gerät, auf dem angesehen oder gehört wird."
                    },
                    {
                        title: "Nicht jedes Streaming-Verhalten ist gleich",
                        body: "Langformatige Videos, Kurzvideo-Autoplay-Schleifen, Musikstreaming und Livestreams wirken auf hoher Ebene ähnlich, doch Nutzungsverhalten und Wiedergabekontext verändern den tatsächlichen Impact."
                    }
                ],
                playbook: [
                    {
                        title: "Das Gerät als Teil der Antwort zeigen",
                        body: "Wer nach Streaming sucht, nimmt oft an, dass nur die Plattform zählt. Tatsächlich können Wiedergabegerät und Auflösung den Fußabdruck deutlich verändern."
                    },
                    {
                        title: "Den Hub zur Segmentierung der Suchintention nutzen",
                        body: "Langformatiges Video, Kurzvideo-Feeds, Musikstreaming und Livestreams sind verwandt, aber keine identischen Suchintentionen. Dieser Hub sollte diese Unterschiede klarer machen."
                    },
                    {
                        title: "Die stärksten Vergleichsseiten hervorheben",
                        body: "Vergleiche wie Netflix vs YouTube oder YouTube vs TikTok sind natürliche nächste Klicks und stärken den Cluster, wenn sie wirklich hilfreich sind."
                    }
                ],
                faq: [
                    {
                        question: "Was verändert Streaming-Emissionen am stärksten?",
                        answer: "Die größten Einflussfaktoren sind oft Sehzeit, Auflösung, Autoplay-Verhalten und das Wiedergabegerät."
                    },
                    {
                        question: "Warum ist eine übergeordnete Streaming-Seite nützlich?",
                        answer: "Sie verbindet breite Streaming-Suchanfragen mit den konkreten Rechnern und Vergleichen, die am besten zur tatsächlichen Sehgewohnheit passen."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            es: {
                title: "Huella de carbono del streaming",
                seoTitle: "Huella de carbono del streaming: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Compara las emisiones de carbono de las principales plataformas de streaming y de los hábitos de consumo más comunes. Entiende cómo influyen el dispositivo, la resolución y el autoplay.",
                queryChips: ["huella de carbono del streaming", "emisiones de Netflix", "huella de carbono de YouTube", "Spotify CO2"],
                eyebrow: "Hub de emisiones del streaming",
                intro: "El streaming parece simple desde la superficie, pero cada sesión depende de la infraestructura de entrega, las redes de transmisión y el dispositivo que reproduce el contenido. Este hub conecta ese contexto con las calculadoras individuales.",
                categoryFilter: ["Streaming"],
                sections: [
                    {
                        title: "De los centros de datos al dispositivo",
                        body: "La huella del streaming se compone de tres capas: la infraestructura de la plataforma, la red que entrega los medios y el dispositivo con el que ves o escuchas."
                    },
                    {
                        title: "No todo comportamiento de streaming es igual",
                        body: "Vídeo largo, bucles de autoplay en vídeo corto, música en streaming y directos pueden parecer similares, pero el comportamiento del usuario y el contexto de reproducción cambian el impacto real."
                    }
                ],
                playbook: [
                    {
                        title: "Presentar el dispositivo como parte de la respuesta",
                        body: "Quien busca sobre streaming suele pensar que la plataforma es toda la historia, pero el dispositivo y la resolución pueden cambiar mucho la huella."
                    },
                    {
                        title: "Usar el hub para segmentar la intención",
                        body: "Vídeo largo, feeds de vídeo corto, música en streaming y directos son intenciones relacionadas, pero no idénticas. Este hub debe dejar esas diferencias más claras."
                    },
                    {
                        title: "Promocionar las comparativas más fuertes",
                        body: "Comparaciones como Netflix vs YouTube o YouTube vs TikTok son clics siguientes naturales y fortalecen el clúster cuando realmente aportan valor."
                    }
                ],
                faq: [
                    {
                        question: "¿Qué cambia más las emisiones del streaming?",
                        answer: "Los factores que más suelen mover la cifra son el tiempo de visionado, la resolución, el autoplay y el dispositivo usado para reproducir."
                    },
                    {
                        question: "¿Por qué es útil una página padre de streaming?",
                        answer: "Ayuda a conectar consultas generales sobre streaming con las calculadoras y comparaciones que mejor representan el hábito real de consumo."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            pt: {
                title: "Pegada de carbono do streaming",
                seoTitle: "Pegada de carbono do streaming: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Compara as emissões de carbono das principais plataformas de streaming e dos hábitos de consumo mais comuns. Percebe como o dispositivo, a resolução e o autoplay moldam a pegada.",
                queryChips: ["pegada de carbono do streaming", "emissões da Netflix", "pegada de carbono do YouTube", "Spotify CO2"],
                eyebrow: "Hub de emissões do streaming",
                intro: "O streaming parece simples à superfície, mas cada sessão depende da infraestrutura de entrega, das redes de transmissão e do dispositivo que faz a reprodução. Este hub liga esse contexto às calculadoras individuais.",
                categoryFilter: ["Streaming"],
                sections: [
                    {
                        title: "Dos centros de dados aos dispositivos",
                        body: "A pegada do streaming tem três camadas: a infraestrutura da plataforma, a rede que entrega os conteúdos e o dispositivo usado para ver ou ouvir."
                    },
                    {
                        title: "Nem todo o comportamento de streaming é igual",
                        body: "Vídeo longo, ciclos de autoplay em vídeo curto, música em streaming e transmissões em direto podem parecer semelhantes, mas o comportamento do utilizador e o contexto de reprodução mudam o impacto real."
                    }
                ],
                playbook: [
                    {
                        title: "Mostrar o dispositivo como parte da resposta",
                        body: "Quem pesquisa sobre streaming tende a assumir que a plataforma é toda a história, mas o dispositivo de reprodução e a resolução podem alterar bastante a pegada."
                    },
                    {
                        title: "Usar o hub para segmentar a intenção",
                        body: "Vídeo longo, feeds de vídeo curto, música em streaming e diretos são intenções relacionadas, mas não idênticas. Este hub deve tornar essas diferenças mais claras."
                    },
                    {
                        title: "Promover as comparações mais fortes",
                        body: "Comparações como Netflix vs YouTube ou YouTube vs TikTok são cliques seguintes naturais e fortalecem o cluster quando são realmente úteis."
                    }
                ],
                faq: [
                    {
                        question: "O que mais altera as emissões do streaming?",
                        answer: "Os fatores que mais costumam mexer no valor são o tempo de visualização, a resolução, o autoplay e o dispositivo usado na reprodução."
                    },
                    {
                        question: "Porque é útil uma página principal de streaming?",
                        answer: "Ajuda a ligar pesquisas amplas sobre streaming às calculadoras e comparações que melhor representam o hábito real de consumo."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            fr: {
                title: "Empreinte carbone du streaming",
                seoTitle: "Empreinte carbone du streaming : YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Comparez les émissions carbone des principales plateformes de streaming et des habitudes de visionnage courantes. Comprenez comment l'appareil, la résolution et l'autoplay influencent l'empreinte.",
                queryChips: ["empreinte carbone du streaming", "émissions de Netflix", "empreinte carbone de YouTube", "Spotify CO2"],
                eyebrow: "Hub des émissions du streaming",
                intro: "Le streaming paraît simple en surface, mais chaque session dépend de l'infrastructure de diffusion, des réseaux de transmission et de l'appareil qui assure la lecture. Ce hub relie ce contexte aux calculateurs individuels.",
                categoryFilter: ["Streaming"],
                sections: [
                    {
                        title: "Des centres de données jusqu'aux appareils",
                        body: "L'empreinte du streaming repose sur trois couches : l'infrastructure de la plateforme, le réseau qui achemine les contenus et l'appareil utilisé pour regarder ou écouter."
                    },
                    {
                        title: "Tous les usages du streaming ne se valent pas",
                        body: "Vidéo longue, boucles d'autoplay en vidéo courte, musique en streaming et live peuvent sembler proches, mais le comportement d'usage et le contexte de lecture modifient l'impact réel."
                    }
                ],
                playbook: [
                    {
                        title: "Montrer que l'appareil fait partie de la réponse",
                        body: "Les chercheurs supposent souvent que la plateforme explique tout, alors que l'appareil de lecture et la résolution peuvent modifier fortement l'empreinte."
                    },
                    {
                        title: "Utiliser le hub pour segmenter l'intention",
                        body: "Vidéo longue, flux de vidéos courtes, musique en streaming et live sont liés mais ne répondent pas à la même intention. Ce hub doit clarifier ces différences."
                    },
                    {
                        title: "Mettre en avant les comparaisons les plus fortes",
                        body: "Des comparaisons comme Netflix vs YouTube ou YouTube vs TikTok constituent des clics suivants naturels et renforcent le cluster lorsqu'elles sont réellement utiles."
                    }
                ],
                faq: [
                    {
                        question: "Qu'est-ce qui fait le plus varier les émissions du streaming ?",
                        answer: "Les principaux facteurs sont souvent le temps de visionnage, la résolution, l'autoplay et l'appareil utilisé pour la lecture."
                    },
                    {
                        question: "Pourquoi une page parent sur le streaming est-elle utile ?",
                        answer: "Elle aide à relier les recherches générales sur le streaming aux calculateurs et comparaisons qui correspondent le mieux à l'usage réel."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            }
        }
    },
    {
        slug: "digital-carbon-footprint",
        content: {
            en: {
                title: "Digital Carbon Footprint",
                seoTitle: "What Is a Digital Carbon Footprint? Definition and Guide | IdleForest",
                seoDescription: "Learn what a digital carbon footprint is and how browsing, meetings, social media, and everyday internet use contribute to emissions.",
                queryChips: ["digital carbon footprint", "internet emissions", "reduce digital footprint", "carbon footprint of internet"],
                eyebrow: "Digital sustainability hub",
                intro: "A digital carbon footprint is the emissions impact created by the devices, networks, and data centers supporting your online activity. This hub is designed to connect that broad concept to practical pages about browsing, work, and social habits.",
                categoryFilter: ["Browsing", "Social", "Work"],
                sections: [
                    {
                        title: "The cloud is physical infrastructure",
                        body: "Every search, feed refresh, file sync, and meeting still depends on servers, networking equipment, and electricity somewhere in the background."
                    },
                    {
                        title: "Habits matter more than isolated clicks",
                        body: "A single digital action is often tiny, but repeated patterns such as long meetings, autoplay feeds, and browser-heavy workdays add up over time."
                    }
                ],
                playbook: [
                    {
                        title: "Own the definition query",
                        body: "This page should act as the conceptual parent for browsing, work, and social emissions rather than just another thin collection page."
                    },
                    {
                        title: "Translate abstract infrastructure into habits",
                        body: "Searchers want to know how meetings, tabs, feeds, and media habits turn into emissions. This page should make that link explicit."
                    },
                    {
                        title: "Point to the most practical next steps",
                        body: "The strongest child pages for this hub are usually Chrome, Zoom, Google Meet, and the biggest social or video habits."
                    }
                ],
                faq: [
                    {
                        question: "What is a digital carbon footprint in plain language?",
                        answer: "It is the emissions impact created by the devices, networks, and data centers that support your digital activity."
                    },
                    {
                        question: "Which digital habits usually matter first?",
                        answer: "Video, device choice, time-on-platform, and meeting behavior usually move the number more than isolated lightweight actions."
                    }
                ],
                featuredComparisonPairs: [["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            de: {
                title: "Digitaler CO2-Fußabdruck",
                seoTitle: "Was ist ein digitaler CO2-Fußabdruck? Definition und Leitfaden | IdleForest",
                seoDescription: "Erfahre, was ein digitaler CO2-Fußabdruck ist und wie Browsing, Meetings, Social Media und alltägliche Internetnutzung zu Emissionen beitragen.",
                queryChips: ["digitaler CO2-Fußabdruck", "Internet Emissionen", "digitalen Fußabdruck reduzieren", "CO2-Fußabdruck des Internets"],
                eyebrow: "Hub für digitale Nachhaltigkeit",
                intro: "Ein digitaler CO2-Fußabdruck ist die Emissionswirkung, die durch Geräte, Netzwerke und Rechenzentren entsteht, welche deine Online-Aktivitäten ermöglichen. Dieser Hub verbindet das breite Konzept mit praktischen Seiten zu Browsing, Arbeit und Social-Gewohnheiten.",
                categoryFilter: ["Browsing", "Social", "Work"],
                sections: [
                    {
                        title: "Die Cloud ist physische Infrastruktur",
                        body: "Jede Suche, jede Feed-Aktualisierung, jede Dateisynchronisation und jedes Meeting hängt im Hintergrund weiterhin von Servern, Netzwerktechnik und Strom ab."
                    },
                    {
                        title: "Gewohnheiten zählen mehr als einzelne Klicks",
                        body: "Eine einzelne digitale Aktion ist oft klein, aber wiederholte Muster wie lange Meetings, Autoplay-Feeds und browserlastige Arbeitstage summieren sich über die Zeit."
                    }
                ],
                playbook: [
                    {
                        title: "Die Definitions-Suchanfrage besetzen",
                        body: "Diese Seite sollte als konzeptionelle Elternseite für Emissionen aus Browsing, Arbeit und Social Media dienen und nicht nur als weitere dünne Sammlungsseite."
                    },
                    {
                        title: "Abstrakte Infrastruktur in Gewohnheiten übersetzen",
                        body: "Suchende wollen wissen, wie Meetings, Tabs, Feeds und Mediengewohnheiten zu Emissionen werden. Diese Seite sollte diese Verbindung deutlich machen."
                    },
                    {
                        title: "Auf die praktischsten nächsten Schritte verweisen",
                        body: "Die stärksten Unterseiten für diesen Hub sind meist Chrome, Zoom, Google Meet und die größten Social- oder Video-Gewohnheiten."
                    }
                ],
                faq: [
                    {
                        question: "Was ist ein digitaler CO2-Fußabdruck in einfachen Worten?",
                        answer: "Er ist die Emissionswirkung, die durch Geräte, Netzwerke und Rechenzentren entsteht, welche deine digitalen Aktivitäten unterstützen."
                    },
                    {
                        question: "Welche digitalen Gewohnheiten zählen meist zuerst?",
                        answer: "Video, Gerätewahl, Zeit auf Plattformen und Meeting-Verhalten verändern die Zahl meist stärker als einzelne leichte Aktionen."
                    }
                ],
                featuredComparisonPairs: [["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            es: {
                title: "Huella de carbono digital",
                seoTitle: "¿Qué es una huella de carbono digital? Definición y guía | IdleForest",
                seoDescription: "Aprende qué es una huella de carbono digital y cómo la navegación, las reuniones, las redes sociales y el uso diario de internet contribuyen a las emisiones.",
                queryChips: ["huella de carbono digital", "emisiones de internet", "reducir huella digital", "huella de carbono de internet"],
                eyebrow: "Hub de sostenibilidad digital",
                intro: "La huella de carbono digital es el impacto en emisiones creado por los dispositivos, redes y centros de datos que sostienen tu actividad online. Este hub conecta ese concepto amplio con páginas prácticas sobre navegación, trabajo y hábitos sociales.",
                categoryFilter: ["Browsing", "Social", "Work"],
                sections: [
                    {
                        title: "La nube es infraestructura física",
                        body: "Cada búsqueda, actualización de feed, sincronización de archivos y reunión sigue dependiendo de servidores, equipos de red y electricidad en algún lugar del sistema."
                    },
                    {
                        title: "Los hábitos pesan más que los clics aislados",
                        body: "Una sola acción digital suele ser pequeña, pero patrones repetidos como reuniones largas, feeds con autoplay y jornadas de trabajo centradas en el navegador se acumulan con el tiempo."
                    }
                ],
                playbook: [
                    {
                        title: "Ganar la consulta de definición",
                        body: "Esta página debe actuar como padre conceptual de las emisiones de navegación, trabajo y social, y no como otra simple página de colección."
                    },
                    {
                        title: "Traducir infraestructura abstracta en hábitos",
                        body: "Los usuarios quieren saber cómo reuniones, pestañas, feeds y hábitos de medios se convierten en emisiones. Esta página debe explicarlo de forma directa."
                    },
                    {
                        title: "Apuntar a los siguientes pasos más prácticos",
                        body: "Las páginas hijas más fuertes de este hub suelen ser Chrome, Zoom, Google Meet y los mayores hábitos sociales o de vídeo."
                    }
                ],
                faq: [
                    {
                        question: "¿Qué es una huella de carbono digital en lenguaje sencillo?",
                        answer: "Es el impacto en emisiones creado por los dispositivos, redes y centros de datos que sostienen tu actividad digital."
                    },
                    {
                        question: "¿Qué hábitos digitales suelen importar primero?",
                        answer: "El vídeo, el tipo de dispositivo, el tiempo en plataforma y el comportamiento en reuniones suelen mover más la cifra que acciones ligeras aisladas."
                    }
                ],
                featuredComparisonPairs: [["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            pt: {
                title: "Pegada de carbono digital",
                seoTitle: "O que é uma pegada de carbono digital? Definição e guia | IdleForest",
                seoDescription: "Aprende o que é uma pegada de carbono digital e como a navegação, as reuniões, as redes sociais e o uso diário da internet contribuem para as emissões.",
                queryChips: ["pegada de carbono digital", "emissões da internet", "reduzir pegada digital", "pegada de carbono da internet"],
                eyebrow: "Hub de sustentabilidade digital",
                intro: "A pegada de carbono digital é o impacto em emissões criado pelos dispositivos, redes e centros de dados que suportam a tua atividade online. Este hub liga esse conceito amplo a páginas práticas sobre navegação, trabalho e hábitos sociais.",
                categoryFilter: ["Browsing", "Social", "Work"],
                sections: [
                    {
                        title: "A cloud é infraestrutura física",
                        body: "Cada pesquisa, atualização de feed, sincronização de ficheiros e reunião continua a depender de servidores, equipamento de rede e eletricidade em algum ponto do sistema."
                    },
                    {
                        title: "Os hábitos pesam mais do que cliques isolados",
                        body: "Uma ação digital isolada costuma ser pequena, mas padrões repetidos como reuniões longas, feeds com autoplay e dias de trabalho centrados no browser acumulam-se ao longo do tempo."
                    }
                ],
                playbook: [
                    {
                        title: "Ganhar a pesquisa de definição",
                        body: "Esta página deve funcionar como a página conceptual principal para emissões de navegação, trabalho e social, em vez de ser apenas mais uma coleção fraca."
                    },
                    {
                        title: "Traduzir infraestrutura abstrata em hábitos",
                        body: "Quem pesquisa quer perceber como reuniões, separadores, feeds e hábitos de consumo se transformam em emissões. Esta página deve tornar essa ligação explícita."
                    },
                    {
                        title: "Apontar para os próximos passos mais práticos",
                        body: "As páginas-filhas mais fortes deste hub costumam ser Chrome, Zoom, Google Meet e os maiores hábitos sociais ou de vídeo."
                    }
                ],
                faq: [
                    {
                        question: "O que é uma pegada de carbono digital em linguagem simples?",
                        answer: "É o impacto em emissões criado pelos dispositivos, redes e centros de dados que suportam a tua atividade digital."
                    },
                    {
                        question: "Que hábitos digitais costumam importar primeiro?",
                        answer: "Vídeo, escolha do dispositivo, tempo em plataforma e comportamento em reuniões costumam mexer mais no valor do que ações leves isoladas."
                    }
                ],
                featuredComparisonPairs: [["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            fr: {
                title: "Empreinte carbone numérique",
                seoTitle: "Qu'est-ce qu'une empreinte carbone numérique ? Définition et guide | IdleForest",
                seoDescription: "Découvrez ce qu'est une empreinte carbone numérique et comment la navigation, les réunions, les réseaux sociaux et l'usage quotidien d'internet contribuent aux émissions.",
                queryChips: ["empreinte carbone numérique", "émissions d'internet", "réduire son empreinte numérique", "empreinte carbone d'internet"],
                eyebrow: "Hub de durabilité numérique",
                intro: "L'empreinte carbone numérique correspond à l'impact en émissions créé par les appareils, les réseaux et les centres de données qui soutiennent votre activité en ligne. Ce hub relie ce concept large à des pages pratiques sur la navigation, le travail et les usages sociaux.",
                categoryFilter: ["Browsing", "Social", "Work"],
                sections: [
                    {
                        title: "Le cloud est une infrastructure physique",
                        body: "Chaque recherche, rafraîchissement de fil, synchronisation de fichiers et réunion dépend toujours de serveurs, d'équipements réseau et d'électricité quelque part dans le système."
                    },
                    {
                        title: "Les habitudes comptent plus que les clics isolés",
                        body: "Une action numérique isolée est souvent minime, mais des schémas répétés comme les longues réunions, les flux en autoplay et les journées de travail très dépendantes du navigateur s'additionnent avec le temps."
                    }
                ],
                playbook: [
                    {
                        title: "Occuper la requête de définition",
                        body: "Cette page doit servir de parent conceptuel pour les émissions liées à la navigation, au travail et au social, plutôt que d'être une simple page de collection supplémentaire."
                    },
                    {
                        title: "Traduire l'infrastructure abstraite en habitudes",
                        body: "Les chercheurs veulent comprendre comment réunions, onglets, flux et habitudes médias deviennent des émissions. Cette page doit rendre ce lien explicite."
                    },
                    {
                        title: "Orienter vers les prochaines étapes les plus utiles",
                        body: "Les pages filles les plus fortes pour ce hub sont généralement Chrome, Zoom, Google Meet et les principaux usages sociaux ou vidéo."
                    }
                ],
                faq: [
                    {
                        question: "Qu'est-ce qu'une empreinte carbone numérique en langage simple ?",
                        answer: "C'est l'impact en émissions créé par les appareils, les réseaux et les centres de données qui soutiennent votre activité numérique."
                    },
                    {
                        question: "Quels usages numériques comptent généralement le plus ?",
                        answer: "La vidéo, le choix de l'appareil, le temps passé sur les plateformes et le comportement en réunion influencent généralement plus le chiffre que des actions légères isolées."
                    }
                ],
                featuredComparisonPairs: [["zoom", "google-meet"], ["instagram", "tiktok"]]
            }
        }
    }
];
