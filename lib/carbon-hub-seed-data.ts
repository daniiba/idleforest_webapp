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
                eyebrow: "Carbon footprint hub",
                intro: "Compare the carbon footprint of the apps, AI tools, games, browsers, and streaming platforms people use every day. Use this hub to understand the biggest digital habits, open focused calculators, and compare common activities.",
                sections: [
                    {
                        title: "Start with the habits you use most",
                        body: "The most useful entry points are usually the behaviors people repeat every day: streaming, AI prompts, meetings, social feeds, and long browser sessions."
                    },
                    {
                        title: "Move from broad topics to specific tools",
                        body: "Start with a broad topic like digital carbon footprint, then jump into the app page or comparison that best matches the tool or habit you actually use."
                    },
                    {
                        title: "Use the estimates as practical guidance",
                        body: "These pages are built to compare common digital behaviors, not to reproduce proprietary vendor accounting line by line."
                    }
                ],
                playbook: [
                    {
                        title: "Compare the biggest digital categories",
                        body: "This hub brings AI, streaming, work, browsing, social, crypto, and gaming pages together so you can see where different digital habits sit."
                    },
                    {
                        title: "Jump to the calculator that matches your routine",
                        body: "The best next step is usually the app page or comparison page that reflects the tool, platform, or habit you spend the most time with."
                    },
                    {
                        title: "Use comparisons to make tradeoffs clearer",
                        body: "Side-by-side comparisons help you understand which two related habits are likely to differ most in daily impact."
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
                featuredComparisonPairs: [["discord", "slack"], ["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
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
                eyebrow: "CO2-Fußabdruck-Hub",
                intro: "Vergleiche den CO2-Fußabdruck von Apps, KI-Tools, Spielen, Browsern und Streaming-Plattformen, die Menschen täglich nutzen. Dieser Hub hilft dir, die größten digitalen Gewohnheiten zu verstehen, passende Rechner zu öffnen und typische Aktivitäten direkt zu vergleichen.",
                sections: [
                    {
                        title: "Beginne mit den Gewohnheiten, die du am meisten nutzt",
                        body: "Die nützlichsten Einstiege sind meist Verhaltensweisen, die Menschen jeden Tag wiederholen: Streaming, KI-Prompts, Meetings, Social-Feeds und lange Browsing-Sessions."
                    },
                    {
                        title: "Wechsle von breiten Themen zu konkreten Tools",
                        body: "Starte mit einem breiten Thema wie digitaler CO2-Fußabdruck und springe dann zu der App- oder Vergleichsseite, die am besten zu deinem tatsächlichen Tool oder deiner Gewohnheit passt."
                    },
                    {
                        title: "Nutze die Schätzungen als praktische Orientierung",
                        body: "Diese Seiten sind dafür gebaut, typische digitale Verhaltensweisen zu vergleichen und nicht proprietäre Anbieterabrechnungen exakt nachzubilden."
                    }
                ],
                playbook: [
                    {
                        title: "Die wichtigsten digitalen Kategorien vergleichen",
                        body: "Dieser Hub bringt Seiten zu KI, Streaming, Arbeit, Browsing, Social Media, Krypto und Gaming zusammen, damit du die Unterschiede zwischen digitalen Gewohnheiten schneller einordnen kannst."
                    },
                    {
                        title: "Direkt zum passenden Rechner springen",
                        body: "Der beste nächste Schritt ist meist die App- oder Vergleichsseite, die das Tool, die Plattform oder die Gewohnheit abbildet, mit der du die meiste Zeit verbringst."
                    },
                    {
                        title: "Vergleiche für klarere Entscheidungen nutzen",
                        body: "Direkte Vergleiche helfen dir zu verstehen, welche zwei verwandten Gewohnheiten sich im Alltag am stärksten unterscheiden."
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
                featuredComparisonPairs: [["discord", "slack"], ["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
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
                eyebrow: "Hub de huella de carbono",
                intro: "Compara la huella de carbono de las apps, herramientas de IA, juegos, navegadores y plataformas de streaming que la gente usa cada día. Este hub te ayuda a entender los hábitos digitales que más pesan, abrir calculadoras concretas y comparar actividades comunes.",
                sections: [
                    {
                        title: "Empieza por los hábitos que más repites",
                        body: "Los mejores puntos de entrada suelen ser los comportamientos que la gente repite todos los días: streaming, prompts de IA, reuniones, feeds sociales y largas sesiones de navegación."
                    },
                    {
                        title: "Pasa de temas amplios a herramientas concretas",
                        body: "Empieza por un tema general como huella de carbono digital y luego entra en la página de app o comparación que mejor represente la herramienta o el hábito que realmente usas."
                    },
                    {
                        title: "Usa la estimación como orientación práctica",
                        body: "Estas páginas están pensadas para comparar comportamientos digitales comunes, no para reproducir línea por línea la contabilidad propietaria de un proveedor."
                    }
                ],
                playbook: [
                    {
                        title: "Comparar las principales categorías digitales",
                        body: "Este hub reúne páginas sobre IA, streaming, trabajo, navegación, social, cripto y gaming para que puedas ver mejor cómo se diferencian esos hábitos digitales."
                    },
                    {
                        title: "Ir directo a la calculadora más útil",
                        body: "El siguiente paso más útil suele ser la página de app o comparación que refleje la herramienta, la plataforma o el hábito al que dedicas más tiempo."
                    },
                    {
                        title: "Usar comparaciones para aclarar diferencias",
                        body: "Las comparaciones directas ayudan a entender qué dos hábitos relacionados pueden separarse más en su impacto diario."
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
                featuredComparisonPairs: [["discord", "slack"], ["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
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
                eyebrow: "Hub da pegada de carbono",
                intro: "Compara a pegada de carbono das apps, ferramentas de IA, jogos, browsers e plataformas de streaming que as pessoas usam todos os dias. Este hub ajuda-te a perceber os hábitos digitais com maior impacto, abrir calculadoras mais focadas e comparar atividades comuns.",
                sections: [
                    {
                        title: "Começa pelos hábitos que mais repetes",
                        body: "Os pontos de entrada mais úteis costumam ser os comportamentos que as pessoas repetem todos os dias: streaming, prompts de IA, reuniões, feeds sociais e longas sessões de navegação."
                    },
                    {
                        title: "Passa de temas amplos para ferramentas concretas",
                        body: "Começa com um tema geral como pegada de carbono digital e depois entra na página da app ou da comparação que melhor representa a ferramenta ou o hábito que usas de facto."
                    },
                    {
                        title: "Usa a estimativa como orientação prática",
                        body: "Estas páginas foram feitas para comparar comportamentos digitais comuns e não para reproduzir linha a linha a contabilidade proprietária de um fornecedor."
                    }
                ],
                playbook: [
                    {
                        title: "Comparar as principais categorias digitais",
                        body: "Este hub junta páginas de IA, streaming, trabalho, navegação, social, cripto e gaming para te ajudar a perceber melhor como esses hábitos digitais se diferenciam."
                    },
                    {
                        title: "Ir direto para a calculadora mais útil",
                        body: "O passo seguinte mais útil costuma ser a página da app ou da comparação que reflete a ferramenta, a plataforma ou o hábito em que passas mais tempo."
                    },
                    {
                        title: "Usar comparações para clarificar diferenças",
                        body: "As comparações diretas ajudam-te a perceber quais dois hábitos relacionados podem divergir mais no impacto do dia a dia."
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
                featuredComparisonPairs: [["discord", "slack"], ["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
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
                eyebrow: "Hub de l'empreinte carbone",
                intro: "Comparez l'empreinte carbone des applications, outils d'IA, jeux, navigateurs et plateformes de streaming utilisés au quotidien. Ce hub vous aide à comprendre les usages numériques les plus lourds, à ouvrir des calculateurs ciblés et à comparer des activités courantes.",
                sections: [
                    {
                        title: "Commencez par les habitudes que vous répétez le plus",
                        body: "Les meilleurs points d'entrée sont souvent les comportements que l'on répète chaque jour : streaming, prompts IA, réunions, flux sociaux et longues sessions de navigation."
                    },
                    {
                        title: "Passez des grands thèmes aux outils concrets",
                        body: "Commencez par un thème large comme l'empreinte carbone numérique, puis ouvrez la page application ou comparaison qui correspond le mieux à l'outil ou à l'usage que vous avez réellement."
                    },
                    {
                        title: "Utilisez l'estimation comme repère pratique",
                        body: "Ces pages sont conçues pour comparer des comportements numériques courants, et non pour reproduire ligne par ligne la comptabilité propriétaire d'un fournisseur."
                    }
                ],
                playbook: [
                    {
                        title: "Comparer les grandes catégories numériques",
                        body: "Ce hub rassemble les pages IA, streaming, travail, navigation, social, crypto et gaming pour vous aider à situer plus facilement ces différents usages numériques."
                    },
                    {
                        title: "Aller directement au calculateur le plus utile",
                        body: "L'étape suivante la plus utile est généralement la page application ou comparaison qui reflète l'outil, la plateforme ou l'usage auquel vous consacrez le plus de temps."
                    },
                    {
                        title: "Utiliser les comparaisons pour clarifier les écarts",
                        body: "Les comparaisons directes vous aident à comprendre quels deux usages proches peuvent le plus diverger dans leur impact quotidien."
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
                featuredComparisonPairs: [["discord", "slack"], ["netflix", "youtube"], ["youtube", "tiktok"], ["zoom", "google-meet"], ["bitcoin", "ethereum"]]
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
                eyebrow: "AI emissions guide",
                intro: "Artificial intelligence offers incredible capabilities, but it also relies on heavy compute infrastructure. Use this guide to understand what drives AI emissions and compare the tools you actually use.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Training and everyday use are different questions",
                        body: "Training headlines show the scale of model development, while most people really want to understand everyday inference: repeated use of tools like ChatGPT."
                    },
                    {
                        title: "Hardware and cooling still matter",
                        body: "AI workloads sit on top of accelerator-heavy servers, networking, and cooling systems, so the visible product is only part of the footprint story."
                    }
                ],
                playbook: [
                    {
                        title: "Start with everyday AI use",
                        body: "For most people, the main question is the repeated use of text and image tools like ChatGPT, Claude, or Midjourney, rather than one-off training headlines."
                    },
                    {
                        title: "Connect prompts to infrastructure",
                        body: "Prompt volume, model size, accelerator hardware (especially GPUs for image generation), and data center cooling all shape the footprint together."
                    },
                    {
                        title: "Open the closest matching tool page",
                        body: "After the overview, jump to the calculator page for the AI tool you use most, whether it's for text analysis or generating art."
                    }
                ],
                faq: [
                    {
                        question: "Why isn't there one simple AI number?",
                        answer: "Because emissions vary with model size, hardware, prompt volume, and how often you use the tool."
                    },
                    {
                        question: "What should I do after reading this guide?",
                        answer: "Start with the biggest drivers, then open the calculator page that matches the AI tool you use."
                    }
                ],
                featuredComparisonPairs: [["chatgpt", "claude"], ["chatgpt", "midjourney"], ["chatgpt", "gemini"]]
            },
            de: {
                title: "KI-CO2-Fußabdruck",
                seoTitle: "KI-CO2-Fußabdruck: Emissionen künstlicher Intelligenz | IdleForest",
                seoDescription: "Verstehe den CO2-Fußabdruck von KI-Modellen wie ChatGPT und alltäglicher KI-Nutzung. Erfahre, wie Inferenz, Hardware und Rechenzentrums-Overhead digitale Emissionen formen.",
                queryChips: ["KI CO2-Fußabdruck", "ChatGPT CO2-Fußabdruck", "LLM Emissionen", "KI CO2"],
                eyebrow: "Leitfaden zu KI-Emissionen",
                intro: "Künstliche Intelligenz bietet enorme Möglichkeiten, nutzt aber auch rechenintensive Infrastruktur. Nutze diesen Leitfaden, um die wichtigsten Treiber von KI-Emissionen zu verstehen und die Tools zu vergleichen, die du wirklich verwendest.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Training und Alltagsnutzung sind unterschiedliche Fragen",
                        body: "Schlagzeilen zum Training zeigen die Größe der Modellentwicklung, während die meisten Menschen eigentlich die alltägliche Inferenz verstehen wollen: die wiederholte Nutzung von Tools wie ChatGPT."
                    },
                    {
                        title: "Hardware und Kühlung zählen weiterhin",
                        body: "KI-Workloads laufen auf Servern mit vielen Beschleunigern, Netzwerken und Kühlsystemen. Das sichtbare Produkt ist deshalb nur ein Teil der Emissionsgeschichte."
                    }
                ],
                playbook: [
                    {
                        title: "Mit der alltäglichen KI-Nutzung beginnen",
                        body: "Für die meisten Menschen geht es vor allem um die wiederholte Nutzung von Text- und Bild-Tools wie ChatGPT, Claude oder Midjourney und nicht um einmalige Schlagzeilen zum Training."
                    },
                    {
                        title: "Prompts mit Infrastruktur verbinden",
                        body: "Prompt-Menge, Modellgröße, Beschleuniger-Hardware (insbesondere GPUs für die Bildgenerierung) und Rechenzentrumskühlung prägen den Fußabdruck gemeinsam."
                    },
                    {
                        title: "Die passendste Tool-Seite öffnen",
                        body: "Nach dem Überblick ist der beste nächste Schritt meist die Rechnerseite für das KI-Tool, das du am häufigsten nutzt – egal ob für Textanalyse oder das Generieren von Kunst."
                    }
                ],
                faq: [
                    {
                        question: "Warum gibt es nicht die eine einfache KI-Zahl?",
                        answer: "Weil Emissionen je nach Modellgröße, Hardware, Prompt-Menge und Nutzungshäufigkeit variieren."
                    },
                    {
                        question: "Was sollte ich nach diesem Leitfaden tun?",
                        answer: "Beginne mit den größten Treibern und öffne dann die Rechnerseite für das KI-Tool, das du tatsächlich nutzt."
                    }
                ],
                featuredComparisonPairs: [["chatgpt", "claude"], ["chatgpt", "midjourney"], ["chatgpt", "gemini"]]
            },
            es: {
                title: "Huella de carbono de la IA",
                seoTitle: "Huella de carbono de la IA: emisiones de la inteligencia artificial | IdleForest",
                seoDescription: "Entiende la huella de carbono de modelos de IA como ChatGPT y del uso cotidiano de la IA. Aprende cómo la inferencia, el hardware y la sobrecarga del centro de datos influyen en las emisiones digitales.",
                queryChips: ["huella de carbono de la IA", "huella de carbono de ChatGPT", "emisiones de LLM", "IA CO2"],
                eyebrow: "Guía de emisiones de la IA",
                intro: "La inteligencia artificial ofrece capacidades enormes, pero también depende de infraestructura de cómputo intensiva. Usa esta guía para entender qué impulsa las emisiones de la IA y comparar las herramientas que realmente utilizas.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Entrenamiento y uso cotidiano son preguntas distintas",
                        body: "Los titulares sobre entrenamiento muestran la escala del desarrollo de modelos, mientras que la mayoría de personas realmente quiere entender la inferencia cotidiana: el uso repetido de herramientas como ChatGPT."
                    },
                    {
                        title: "El hardware y la refrigeración siguen importando",
                        body: "Las cargas de IA se apoyan en servidores con muchos aceleradores, redes y sistemas de refrigeración, por lo que el producto visible es solo una parte de la historia."
                    }
                ],
                playbook: [
                    {
                        title: "Empieza por el uso cotidiano de la IA",
                        body: "Para la mayoría de personas, la pregunta principal es el uso repetido de herramientas de texto e imagen como ChatGPT, Claude o Midjourney, y no los titulares puntuales sobre entrenamiento."
                    },
                    {
                        title: "Conecta los prompts con la infraestructura",
                        body: "El volumen de prompts, el tamaño del modelo, el hardware acelerador (especialmente las GPUs para generar imágenes) y la refrigeración del centro de datos influyen juntos en la huella."
                    },
                    {
                        title: "Abre la página de la herramienta más cercana",
                        body: "Después de este resumen, el mejor paso suele ser abrir la calculadora de la herramienta de IA que más usas, ya sea para analizar texto o generar arte."
                    }
                ],
                faq: [
                    {
                        question: "¿Por qué no existe una sola cifra simple para la IA?",
                        answer: "Porque las emisiones cambian según el tamaño del modelo, el hardware, el volumen de prompts y la frecuencia de uso."
                    },
                    {
                        question: "¿Qué debería hacer después de leer esta guía?",
                        answer: "Empieza por los factores que más pesan y luego abre la calculadora de la herramienta de IA que realmente usas."
                    }
                ],
                featuredComparisonPairs: [["chatgpt", "claude"], ["chatgpt", "midjourney"], ["chatgpt", "gemini"]]
            },
            pt: {
                title: "Pegada de carbono da IA",
                seoTitle: "Pegada de carbono da IA: emissões da inteligência artificial | IdleForest",
                seoDescription: "Compreende a pegada de carbono de modelos de IA como o ChatGPT e do uso diário de IA. Aprende como a inferência, o hardware e a sobrecarga do centro de dados moldam as emissões digitais.",
                queryChips: ["pegada de carbono da IA", "pegada de carbono do ChatGPT", "emissões de LLM", "IA CO2"],
                eyebrow: "Guia de emissões de IA",
                intro: "A inteligência artificial oferece capacidades impressionantes, mas também depende de infraestrutura de computação intensiva. Usa este guia para perceber o que mais pesa nas emissões de IA e comparar as ferramentas que realmente usas.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Treino e uso diário são perguntas diferentes",
                        body: "As manchetes sobre treino mostram a escala do desenvolvimento dos modelos, enquanto a maioria das pessoas quer perceber a inferência do dia a dia: o uso repetido de ferramentas como o ChatGPT."
                    },
                    {
                        title: "Hardware e arrefecimento continuam a contar",
                        body: "As cargas de IA assentam em servidores com muitos aceleradores, redes e sistemas de arrefecimento, por isso o produto visível é apenas uma parte da história."
                    }
                ],
                playbook: [
                    {
                        title: "Começa pelo uso diário da IA",
                        body: "Para a maior parte das pessoas, a questão principal é o uso repetido de ferramentas de texto e imagem como o ChatGPT, Claude ou Midjourney, e não as manchetes pontuais sobre treino."
                    },
                    {
                        title: "Liga os prompts à infraestrutura",
                        body: "Volume de prompts, dimensão do modelo, hardware acelerador (especialmente GPUs para geração de imagens) e arrefecimento do centro de dados moldam a pegada em conjunto."
                    },
                    {
                        title: "Abre a página da ferramenta mais próxima",
                        body: "Depois deste resumo, o melhor passo costuma ser abrir a calculadora da ferramenta de IA que usas mais, seja para analisar texto ou gerar arte."
                    }
                ],
                faq: [
                    {
                        question: "Porque não existe um único número simples para a IA?",
                        answer: "Porque as emissões variam com a dimensão do modelo, o hardware, o volume de prompts e a frequência de utilização."
                    },
                    {
                        question: "O que devo fazer depois de ler este guia?",
                        answer: "Começa pelos fatores com maior impacto e depois abre a calculadora da ferramenta de IA que realmente usas."
                    }
                ],
                featuredComparisonPairs: [["chatgpt", "claude"], ["chatgpt", "midjourney"], ["chatgpt", "gemini"]]
            },
            fr: {
                title: "Empreinte carbone de l'IA",
                seoTitle: "Empreinte carbone de l'IA : émissions de l'intelligence artificielle | IdleForest",
                seoDescription: "Comprenez l'empreinte carbone de modèles d'IA comme ChatGPT et des usages quotidiens de l'IA. Découvrez comment l'inférence, le matériel et la surcharge des centres de données façonnent les émissions numériques.",
                queryChips: ["empreinte carbone de l'IA", "empreinte carbone de ChatGPT", "émissions des LLM", "IA CO2"],
                eyebrow: "Guide des émissions liées à l'IA",
                intro: "L'intelligence artificielle offre des capacités remarquables, mais elle dépend aussi d'une infrastructure de calcul intensive. Utilisez ce guide pour comprendre ce qui pèse le plus dans les émissions de l'IA et comparer les outils que vous utilisez réellement.",
                categoryFilter: ["AI"],
                sections: [
                    {
                        title: "Entraînement et usage quotidien sont deux questions différentes",
                        body: "Les gros titres sur l'entraînement montrent l'ampleur du développement des modèles, alors que la plupart des gens veulent surtout comprendre l'inférence au quotidien : l'usage répété d'outils comme ChatGPT."
                    },
                    {
                        title: "Le matériel et le refroidissement comptent toujours",
                        body: "Les charges IA reposent sur des serveurs riches en accélérateurs, des réseaux et des systèmes de refroidissement, donc le produit visible ne représente qu'une partie de l'empreinte."
                    }
                ],
                playbook: [
                    {
                        title: "Commencer par l'usage quotidien de l'IA",
                        body: "Pour la plupart des gens, la vraie question concerne l'usage répété d'outils de texte et d'image comme ChatGPT, Claude ou Midjourney, et non les gros titres ponctuels sur l'entraînement."
                    },
                    {
                        title: "Relier les prompts à l'infrastructure",
                        body: "Le volume de prompts, la taille du modèle, le matériel accélérateur (surtout les GPUs pour la génération d'images) et le refroidissement du centre de données influencent l'empreinte ensemble."
                    },
                    {
                        title: "Ouvrir la page de l'outil le plus proche",
                        body: "Après cette vue d'ensemble, la meilleure étape suivante est souvent d'ouvrir le calculateur de l'outil d'IA que vous utilisez le plus, que ce soit pour analyser du texte ou générer de l'art."
                    }
                ],
                faq: [
                    {
                        question: "Pourquoi n'y a-t-il pas un seul chiffre simple pour l'IA ?",
                        answer: "Parce que les émissions varient selon la taille du modèle, le matériel, le volume de prompts et la fréquence d'usage."
                    },
                    {
                        question: "Que faire après avoir lu ce guide ?",
                        answer: "Commencez par les facteurs les plus importants, puis ouvrez le calculateur de l'outil d'IA que vous utilisez réellement."
                    }
                ],
                featuredComparisonPairs: [["chatgpt", "claude"], ["chatgpt", "midjourney"], ["chatgpt", "gemini"]]
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
                eyebrow: "Streaming emissions guide",
                intro: "Streaming feels simple, but every session depends on platform infrastructure, networks, and the device doing playback. Use this guide to compare common streaming habits and then jump into the service you use most.",
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
                        title: "Include the device in the picture",
                        body: "Phones, TVs, laptops, and consoles can change the footprint even when the service stays the same."
                    },
                    {
                        title: "Separate different streaming habits",
                        body: "Long-form video, short-form feeds, music streaming, and live streams may look similar on the surface but can differ a lot in real use."
                    },
                    {
                        title: "Use comparisons when choosing between services",
                        body: "Side-by-side comparisons like Netflix vs YouTube or YouTube vs TikTok are most useful when you are deciding between two specific habits."
                    }
                ],
                faq: [
                    {
                        question: "What changes streaming emissions the most?",
                        answer: "The biggest swing factors are often watch time, resolution, autoplay behavior, and the device used for playback."
                    },
                    {
                        question: "How should I compare streaming apps?",
                        answer: "Start with the kind of watching or listening you do most, then open the calculator or comparison page that matches it."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            de: {
                title: "Streaming-CO2-Fußabdruck",
                seoTitle: "Streaming-CO2-Fußabdruck: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Vergleiche die CO2-Emissionen großer Streaming-Plattformen und typischer Sehgewohnheiten. Verstehe, wie Geräte, Auflösung und Autoplay den Fußabdruck beeinflussen.",
                queryChips: ["Streaming CO2-Fußabdruck", "Netflix Emissionen", "YouTube CO2-Fußabdruck", "Spotify CO2"],
                eyebrow: "Leitfaden zu Streaming-Emissionen",
                intro: "Streaming wirkt einfach, doch jede Sitzung hängt von Plattform-Infrastruktur, Netzwerken und dem Wiedergabegerät ab. Nutze diesen Leitfaden, um typische Streaming-Gewohnheiten zu vergleichen und dann zum Dienst zu springen, den du am meisten nutzt.",
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
                        title: "Das Gerät mitdenken",
                        body: "Handys, Fernseher, Laptops und Konsolen können den Fußabdruck verändern, selbst wenn derselbe Dienst genutzt wird."
                    },
                    {
                        title: "Unterschiedliche Streaming-Gewohnheiten trennen",
                        body: "Langformatiges Video, Kurzvideo-Feeds, Musikstreaming und Livestreams wirken ähnlich, können sich in der tatsächlichen Nutzung aber deutlich unterscheiden."
                    },
                    {
                        title: "Vergleiche für konkrete Entscheidungen nutzen",
                        body: "Direkte Vergleiche wie Netflix vs YouTube oder YouTube vs TikTok helfen vor allem dann, wenn du zwischen zwei konkreten Gewohnheiten abwägst."
                    }
                ],
                faq: [
                    {
                        question: "Was verändert Streaming-Emissionen am stärksten?",
                        answer: "Die größten Einflussfaktoren sind oft Sehzeit, Auflösung, Autoplay-Verhalten und das Wiedergabegerät."
                    },
                    {
                        question: "Wie sollte ich Streaming-Apps vergleichen?",
                        answer: "Beginne mit der Art des Schauens oder Hörens, die bei dir am häufigsten vorkommt, und öffne dann den passenden Rechner oder Vergleich."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            es: {
                title: "Huella de carbono del streaming",
                seoTitle: "Huella de carbono del streaming: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Compara las emisiones de carbono de las principales plataformas de streaming y de los hábitos de consumo más comunes. Entiende cómo influyen el dispositivo, la resolución y el autoplay.",
                queryChips: ["huella de carbono del streaming", "emisiones de Netflix", "huella de carbono de YouTube", "Spotify CO2"],
                eyebrow: "Guía de emisiones del streaming",
                intro: "El streaming parece simple, pero cada sesión depende de la infraestructura de la plataforma, las redes y el dispositivo que reproduce el contenido. Usa esta guía para comparar hábitos de streaming y luego entrar en el servicio que más utilizas.",
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
                        title: "Incluir el dispositivo en la ecuación",
                        body: "Móviles, televisores, portátiles y consolas pueden cambiar la huella incluso cuando el servicio es el mismo."
                    },
                    {
                        title: "Separar hábitos de streaming diferentes",
                        body: "Vídeo largo, feeds de vídeo corto, música en streaming y directos pueden parecer parecidos, pero cambian bastante en el uso real."
                    },
                    {
                        title: "Usar comparaciones para elegir entre servicios",
                        body: "Comparaciones directas como Netflix vs YouTube o YouTube vs TikTok son más útiles cuando estás decidiendo entre dos hábitos concretos."
                    }
                ],
                faq: [
                    {
                        question: "¿Qué cambia más las emisiones del streaming?",
                        answer: "Los factores que más suelen mover la cifra son el tiempo de visionado, la resolución, el autoplay y el dispositivo usado para reproducir."
                    },
                    {
                        question: "¿Cómo debería comparar apps de streaming?",
                        answer: "Empieza por el tipo de consumo que más repites y luego abre la calculadora o comparación que mejor lo represente."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            pt: {
                title: "Pegada de carbono do streaming",
                seoTitle: "Pegada de carbono do streaming: YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Compara as emissões de carbono das principais plataformas de streaming e dos hábitos de consumo mais comuns. Percebe como o dispositivo, a resolução e o autoplay moldam a pegada.",
                queryChips: ["pegada de carbono do streaming", "emissões da Netflix", "pegada de carbono do YouTube", "Spotify CO2"],
                eyebrow: "Guia de emissões do streaming",
                intro: "O streaming parece simples, mas cada sessão depende da infraestrutura da plataforma, das redes e do dispositivo que faz a reprodução. Usa este guia para comparar hábitos de streaming e depois entrar no serviço que mais usas.",
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
                        title: "Incluir o dispositivo na equação",
                        body: "Telemóveis, televisões, portáteis e consolas podem alterar a pegada mesmo quando o serviço é o mesmo."
                    },
                    {
                        title: "Separar hábitos de streaming diferentes",
                        body: "Vídeo longo, feeds de vídeo curto, música em streaming e diretos podem parecer parecidos, mas variam bastante no uso real."
                    },
                    {
                        title: "Usar comparações para escolher entre serviços",
                        body: "Comparações diretas como Netflix vs YouTube ou YouTube vs TikTok são mais úteis quando estás a decidir entre dois hábitos concretos."
                    }
                ],
                faq: [
                    {
                        question: "O que mais altera as emissões do streaming?",
                        answer: "Os fatores que mais costumam mexer no valor são o tempo de visualização, a resolução, o autoplay e o dispositivo usado na reprodução."
                    },
                    {
                        question: "Como devo comparar apps de streaming?",
                        answer: "Começa pelo tipo de consumo que mais repetes e depois abre a calculadora ou comparação que melhor o representa."
                    }
                ],
                featuredComparisonPairs: [["netflix", "youtube"], ["youtube", "tiktok"]]
            },
            fr: {
                title: "Empreinte carbone du streaming",
                seoTitle: "Empreinte carbone du streaming : YouTube, Netflix, Spotify | IdleForest",
                seoDescription: "Comparez les émissions carbone des principales plateformes de streaming et des habitudes de visionnage courantes. Comprenez comment l'appareil, la résolution et l'autoplay influencent l'empreinte.",
                queryChips: ["empreinte carbone du streaming", "émissions de Netflix", "empreinte carbone de YouTube", "Spotify CO2"],
                eyebrow: "Guide des émissions du streaming",
                intro: "Le streaming paraît simple, mais chaque session dépend de l'infrastructure de la plateforme, des réseaux et de l'appareil qui assure la lecture. Utilisez ce guide pour comparer les habitudes de streaming puis ouvrir le service que vous utilisez le plus.",
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
                        title: "Inclure l'appareil dans l'équation",
                        body: "Téléphones, téléviseurs, ordinateurs portables et consoles peuvent modifier l'empreinte même quand le service reste le même."
                    },
                    {
                        title: "Séparer les différents usages du streaming",
                        body: "Vidéo longue, flux de vidéos courtes, musique en streaming et live peuvent sembler proches, mais diffèrent beaucoup dans l'usage réel."
                    },
                    {
                        title: "Utiliser les comparaisons pour choisir entre services",
                        body: "Des comparaisons directes comme Netflix vs YouTube ou YouTube vs TikTok sont surtout utiles quand vous hésitez entre deux usages concrets."
                    }
                ],
                faq: [
                    {
                        question: "Qu'est-ce qui fait le plus varier les émissions du streaming ?",
                        answer: "Les principaux facteurs sont souvent le temps de visionnage, la résolution, l'autoplay et l'appareil utilisé pour la lecture."
                    },
                    {
                        question: "Comment comparer des apps de streaming ?",
                        answer: "Commencez par le type de visionnage ou d'écoute que vous répétez le plus, puis ouvrez le calculateur ou la comparaison qui lui correspond."
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
                eyebrow: "Digital emissions guide",
                intro: "A digital carbon footprint is the emissions impact created by the devices, networks, and data centers behind your online activity. Use this guide to connect that broad idea to everyday browsing, work, and social habits.",
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
                        title: "Start with the activities you repeat most",
                        body: "Use this page as a simple overview, then jump into the calculator that best matches your browsing, meeting, or social habit."
                    },
                    {
                        title: "Translate abstract infrastructure into habits",
                        body: "People want to know how meetings, tabs, feeds, and media habits turn into emissions. This page should make that link explicit."
                    },
                    {
                        title: "Follow the biggest next steps",
                        body: "The most useful next pages are usually browsers, meetings, and the social or video habits that take the most time."
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
                featuredComparisonPairs: [["discord", "slack"], ["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            de: {
                title: "Digitaler CO2-Fußabdruck",
                seoTitle: "Was ist ein digitaler CO2-Fußabdruck? Definition und Leitfaden | IdleForest",
                seoDescription: "Erfahre, was ein digitaler CO2-Fußabdruck ist und wie Browsing, Meetings, Social Media und alltägliche Internetnutzung zu Emissionen beitragen.",
                queryChips: ["digitaler CO2-Fußabdruck", "Internet Emissionen", "digitalen Fußabdruck reduzieren", "CO2-Fußabdruck des Internets"],
                eyebrow: "Leitfaden zu digitalen Emissionen",
                intro: "Ein digitaler CO2-Fußabdruck ist die Emissionswirkung von Geräten, Netzwerken und Rechenzentren hinter deinen Online-Aktivitäten. Nutze diesen Leitfaden, um das breite Thema mit alltäglichem Browsing, Arbeit und Social-Gewohnheiten zu verbinden.",
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
                        title: "Mit den Gewohnheiten anfangen, die du am häufigsten wiederholst",
                        body: "Nutze diese Seite als einfachen Überblick und springe dann in den Rechner, der am besten zu deinem Browsing, deinen Meetings oder deinen Social-Gewohnheiten passt."
                    },
                    {
                        title: "Abstrakte Infrastruktur in Gewohnheiten übersetzen",
                        body: "Menschen wollen wissen, wie Meetings, Tabs, Feeds und Mediengewohnheiten zu Emissionen werden. Diese Seite sollte diese Verbindung deutlich machen."
                    },
                    {
                        title: "Den wichtigsten nächsten Schritten folgen",
                        body: "Die nützlichsten nächsten Seiten sind meist Browser, Meetings sowie die Social- oder Video-Gewohnheiten, die am meisten Zeit einnehmen."
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
                featuredComparisonPairs: [["discord", "slack"], ["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            es: {
                title: "Huella de carbono digital",
                seoTitle: "¿Qué es una huella de carbono digital? Definición y guía | IdleForest",
                seoDescription: "Aprende qué es una huella de carbono digital y cómo la navegación, las reuniones, las redes sociales y el uso diario de internet contribuyen a las emisiones.",
                queryChips: ["huella de carbono digital", "emisiones de internet", "reducir huella digital", "huella de carbono de internet"],
                eyebrow: "Guía de emisiones digitales",
                intro: "La huella de carbono digital es el impacto en emisiones creado por los dispositivos, redes y centros de datos detrás de tu actividad online. Usa esta guía para conectar esa idea general con hábitos cotidianos de navegación, trabajo y redes sociales.",
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
                        title: "Empieza por las actividades que más repites",
                        body: "Usa esta página como una vista general sencilla y luego entra en la calculadora que mejor encaje con tu hábito de navegación, reuniones o redes sociales."
                    },
                    {
                        title: "Traducir infraestructura abstracta en hábitos",
                        body: "La gente quiere saber cómo reuniones, pestañas, feeds y hábitos de consumo se convierten en emisiones. Esta página debe explicarlo de forma directa."
                    },
                    {
                        title: "Sigue los siguientes pasos más importantes",
                        body: "Las páginas más útiles para seguir suelen ser navegadores, reuniones y los hábitos sociales o de vídeo a los que dedicas más tiempo."
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
                featuredComparisonPairs: [["discord", "slack"], ["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            pt: {
                title: "Pegada de carbono digital",
                seoTitle: "O que é uma pegada de carbono digital? Definição e guia | IdleForest",
                seoDescription: "Aprende o que é uma pegada de carbono digital e como a navegação, as reuniões, as redes sociais e o uso diário da internet contribuem para as emissões.",
                queryChips: ["pegada de carbono digital", "emissões da internet", "reduzir pegada digital", "pegada de carbono da internet"],
                eyebrow: "Guia de emissões digitais",
                intro: "A pegada de carbono digital é o impacto em emissões criado pelos dispositivos, redes e centros de dados por trás da tua atividade online. Usa este guia para ligar essa ideia geral a hábitos do dia a dia em navegação, trabalho e social.",
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
                        title: "Começa pelas atividades que mais repetes",
                        body: "Usa esta página como visão geral simples e depois entra na calculadora que melhor corresponde ao teu hábito de navegação, reuniões ou redes sociais."
                    },
                    {
                        title: "Traduzir infraestrutura abstrata em hábitos",
                        body: "As pessoas querem perceber como reuniões, separadores, feeds e hábitos de consumo se transformam em emissões. Esta página deve tornar essa ligação explícita."
                    },
                    {
                        title: "Segue os próximos passos mais importantes",
                        body: "As páginas mais úteis para continuar costumam ser browsers, reuniões e os hábitos sociais ou de vídeo em que passas mais tempo."
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
                featuredComparisonPairs: [["discord", "slack"], ["zoom", "google-meet"], ["instagram", "tiktok"]]
            },
            fr: {
                title: "Empreinte carbone numérique",
                seoTitle: "Qu'est-ce qu'une empreinte carbone numérique ? Définition et guide | IdleForest",
                seoDescription: "Découvrez ce qu'est une empreinte carbone numérique et comment la navigation, les réunions, les réseaux sociaux et l'usage quotidien d'internet contribuent aux émissions.",
                queryChips: ["empreinte carbone numérique", "émissions d'internet", "réduire son empreinte numérique", "empreinte carbone d'internet"],
                eyebrow: "Guide des émissions numériques",
                intro: "L'empreinte carbone numérique correspond à l'impact en émissions des appareils, réseaux et centres de données derrière votre activité en ligne. Utilisez ce guide pour relier cette idée générale à des usages quotidiens de navigation, de travail et de réseaux sociaux.",
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
                        title: "Commencer par les activités que vous répétez le plus",
                        body: "Utilisez cette page comme vue d'ensemble simple, puis ouvrez le calculateur qui correspond le mieux à vos habitudes de navigation, de réunion ou de réseaux sociaux."
                    },
                    {
                        title: "Traduire l'infrastructure abstraite en habitudes",
                        body: "Les gens veulent comprendre comment réunions, onglets, flux et habitudes médias deviennent des émissions. Cette page doit rendre ce lien explicite."
                    },
                    {
                        title: "Suivre les prochaines étapes les plus utiles",
                        body: "Les pages les plus utiles pour continuer sont généralement les navigateurs, les réunions et les usages sociaux ou vidéo qui prennent le plus de temps."
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
                featuredComparisonPairs: [["discord", "slack"], ["zoom", "google-meet"], ["instagram", "tiktok"]]
            }
        }
    }
];
