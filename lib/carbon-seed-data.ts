import { enrichCarbonSeedData } from "@/lib/carbon-app-seo";

const BASE_CARBON_SEED_DATA = [
    {
        "app_name": "Fortnite",
        "category": "Gaming",
        "avg_usage_hours_day": "2.5",
        "co2_per_hour_grams": 150,
        "slug": "fortnite",
        "seo_content": {
            "en": {
                "intro": "Fortnite's carbon footprint is driven by high-performance gaming hardware and the massive server infrastructure required for 100-player battle royale matches.",
                "methodology_title": "How this Fortnite estimate is built",
                "methodology_summary": "This estimate combines electricity demand from gaming hardware with the always-on network and server activity needed to run online matches.",
                "methodology_bullets": [
                    "The hourly figure assumes active gameplay on a PC or console rather than an idle launcher screen.",
                    "Device power draw is the biggest variable, so older consoles and lower-power hardware may land below this estimate while gaming PCs can exceed it.",
                    "Online multiplayer adds background server and data-transfer emissions on top of the device itself."
                ],
                "faq": [
                    {
                        "question": "How much CO2 does Fortnite produce per hour?",
                        "answer": "Gaming on a high-end PC or console generates approximately 150g of CO2 per hour due to GPU power consumption and server communication."
                    }
                ],
                "idleforest_pitch": "Gamers have high bandwidth. Let your rig plant trees while you sleep.",
                "human_equivalent_comparison": "Driving a car for 550 km"
            },
            "es": {
                "intro": "La huella de carbono de Fortnite está impulsada por el hardware de juegos de alto rendimiento y la enorme infraestructura de servidores necesaria para las partidas de battle royale de 100 jugadores.",
                "methodology_title": "Cómo se calcula esta estimación de Fortnite",
                "methodology_summary": "Esta estimación combina la demanda de electricidad del hardware de juego con la actividad constante de red y servidores necesaria para ejecutar partidas online.",
                "methodology_bullets": [
                    "La cifra por hora asume juego activo en PC o consola, no una pantalla del lanzador en reposo.",
                    "El consumo del dispositivo es la mayor variable, por lo que las consolas antiguas y el hardware de menor consumo pueden quedar por debajo de esta estimación, mientras que los PC gaming pueden superarla.",
                    "El multijugador online añade emisiones de servidores y transferencia de datos además de las del propio dispositivo."
                ],
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce Fortnite por hora?",
                        "answer": "Jugar en un PC o consola de alta gama genera aproximadamente 150 g de CO2 por hora debido al consumo de energía de la GPU y la comunicación con el servidor."
                    }
                ],
                "idleforest_pitch": "Los gamers tienen un gran ancho de banda. Deja que tu PC plante árboles mientras duermes.",
                "human_equivalent_comparison": "Conducir un coche durante 550 km"
            },
            "de": {
                "intro": "Der CO2-Fußabdruck von Fortnite wird durch Hochleistungs-Gaming-Hardware und die massive Serverinfrastruktur bestimmt, die für Battle-Royale-Matches mit 100 Spielern erforderlich ist.",
                "methodology_title": "So wird diese Fortnite-Schätzung berechnet",
                "methodology_summary": "Diese Schätzung kombiniert den Strombedarf der Gaming-Hardware mit der permanenten Netzwerk- und Serveraktivität, die für Online-Matches nötig ist.",
                "methodology_bullets": [
                    "Der Stundenwert geht von aktivem Spielen auf PC oder Konsole aus, nicht von einem Launcher-Bildschirm im Leerlauf.",
                    "Der Stromverbrauch des Geräts ist die größte Variable. Ältere Konsolen und sparsamere Hardware können unter dieser Schätzung liegen, während Gaming-PCs darüber liegen können.",
                    "Online-Multiplayer verursacht zusätzlich zum Gerät selbst Emissionen durch Serverbetrieb und Datenübertragung."
                ],
                "faq": [
                    {
                        "question": "Wie viel CO2 produziert Fortnite pro Stunde?",
                        "answer": "Das Spielen an einem High-End-PC oder einer Konsole erzeugt aufgrund des GPU-Stromverbrauchs und der Serverkommunikation etwa 150 g CO2 pro Stunde."
                    }
                ],
                "idleforest_pitch": "Gamer haben hohe Bandbreite. Lass deinen PC Bäume pflanzen, während du schläfst.",
                "human_equivalent_comparison": "550 km Autofahrt"
            },
            "pt": {
                "intro": "A pegada de carbono do Fortnite é impulsionada pelo hardware de jogos de alto desempenho e pela enorme infraestrutura de servidores necessária para partidas de battle royale de 100 jogadores.",
                "methodology_title": "Como é calculada esta estimativa do Fortnite",
                "methodology_summary": "Esta estimativa combina a procura de eletricidade do hardware de jogo com a atividade contínua de rede e de servidores necessária para correr partidas online.",
                "methodology_bullets": [
                    "O valor por hora assume jogabilidade ativa num PC ou consola, e não um ecrã do launcher em repouso.",
                    "O consumo do dispositivo é a maior variável, por isso consolas mais antigas e hardware mais eficiente podem ficar abaixo desta estimativa, enquanto PCs gaming a podem ultrapassar.",
                    "O modo multijogador online acrescenta emissões de servidores e de transferência de dados além das do próprio dispositivo."
                ],
                "faq": [
                    {
                        "question": "Quanto CO2 o Fortnite produz por hora?",
                        "answer": "Jogar em um PC ou console de alto desempenho gera aproximadamente 150g de CO2 por hora devido ao consumo de energia da GPU e comunicação com o servidor."
                    }
                ],
                "idleforest_pitch": "Gamers têm muita largura de banda. Deixa o teu PC plantar árvores enquanto dormes.",
                "human_equivalent_comparison": "Conduzir um carro por 550 km"
            },
            "fr": {
                "intro": "L'empreinte carbone de Fortnite est alimentée par le matériel de jeu haute performance et l'énorme infrastructure de serveurs requise pour les matchs de battle royale à 100 joueurs.",
                "methodology_title": "Comment cette estimation de Fortnite est calculée",
                "methodology_summary": "Cette estimation combine la demande d'électricité du matériel de jeu avec l'activité réseau et serveur permanente nécessaire pour faire tourner des parties en ligne.",
                "methodology_bullets": [
                    "Le chiffre horaire suppose une partie active sur PC ou console, et non un écran de lancement laissé inactif.",
                    "La consommation de l'appareil est la variable la plus importante. Les anciennes consoles et le matériel plus économe peuvent rester sous cette estimation, tandis que les PC gaming peuvent la dépasser.",
                    "Le multijoueur en ligne ajoute des émissions liées aux serveurs et au transfert de données en plus de celles de l'appareil lui-même."
                ],
                "faq": [
                    {
                        "question": "Combien de CO2 Fortnite produit-il par heure ?",
                        "answer": "Jouer sur un PC ou une console haut de gamme génère environ 150 g de CO2 par heure en raison de la consommation d'énergie du GPU et de la communication avec le serveur."
                    }
                ],
                "idleforest_pitch": "Les joueurs ont une bande passante élevée. Laissez votre PC planter des arbres pendant votre sommeil.",
                "human_equivalent_comparison": "Conduire une voiture sur 550 km"
            }
        }
    },
    {
        "app_name": "Netflix",
        "category": "Streaming",
        "avg_usage_hours_day": "2.0",
        "co2_per_hour_grams": 55,
        "slug": "netflix",
        "seo_content": {
            "en": {
                "intro": "Netflix's carbon footprint comes from data centers, content delivery networks, and the device you watch on. If you're comparing Netflix emissions per hour, the biggest drivers are watch time, video quality, and whether you stream on a phone, laptop, TV, or console.",
                "methodology_title": "How this Netflix estimate is built",
                "methodology_summary": "The Netflix estimate is based on one hour of video streaming and reflects both digital infrastructure and the device used to watch the content.",
                "methodology_bullets": [
                    "The starting point is a streaming emissions benchmark for video-on-demand in Europe.",
                    "Watching in higher resolutions such as 4K usually increases data transfer and device energy use, pushing the total upward.",
                    "A TV or gaming console often has a larger impact than a laptop or phone watching the same stream."
                ],
                "faq": [
                    {
                        "question": "What is Netflix's carbon footprint?",
                        "answer": "Netflix emissions come from streaming infrastructure, network delivery, and the device you watch on. Total impact increases with watch time, resolution, and the energy mix powering your hardware."
                    },
                    {
                        "question": "How much CO2 does streaming Netflix create per hour?",
                        "answer": "On average, streaming HD video generates about 55g of CO2 per hour. This includes the energy for data transfer and local playback on standard devices."
                    }
                ],
                "idleforest_pitch": "Offset your binge-watching automatically.",
                "human_equivalent_comparison": "Charging 5,000 smartphones"
            },
            "es": {
                "intro": "El impacto del streaming de Netflix proviene de los centros de datos, las redes de entrega de contenido y su propio hardware de visualización. A medida que las resoluciones alcanzan el 4K, el costo de carbono por hora de entretenimiento continúa creciendo.",
                "methodology_title": "Cómo se calcula esta estimación de Netflix",
                "methodology_summary": "La estimación de Netflix se basa en una hora de streaming de vídeo y refleja tanto la infraestructura digital como el dispositivo usado para ver el contenido.",
                "methodology_bullets": [
                    "El punto de partida es una referencia de emisiones del streaming de vídeo bajo demanda en Europa.",
                    "Ver en resoluciones más altas como 4K suele aumentar la transferencia de datos y el consumo energético del dispositivo, elevando el total.",
                    "Un televisor o una consola suele tener un impacto mayor que un portátil o un teléfono reproduciendo el mismo contenido."
                ],
                "faq": [
                    {
                        "question": "¿Cuál es la huella de carbono de Netflix?",
                        "answer": "Las emisiones de Netflix provienen de la infraestructura de streaming, la entrega en red y el dispositivo en el que se visualiza. El impacto total aumenta con el tiempo de visualización, la resolución y la mezcla de energía que alimenta su hardware."
                    },
                    {
                        "question": "¿Cuánta CO2 genera el streaming de Netflix por hora?",
                        "answer": "En promedio, el streaming de video en alta definición genera unos 55 g de CO2 por hora. Esto incluye la energía para la transferencia de datos y la reproducción local en dispositivos estándar."
                    }
                ],
                "idleforest_pitch": "Compensa tus maratones de series automáticamente.",
                "human_equivalent_comparison": "Cargar 5.000 smartphones"
            },
            "de": {
                "intro": "Die Auswirkungen von Netflix-Streaming stammen von Rechenzentren, Inhaltsbereitstellungsnetzwerken und Ihrer eigenen Hardware. Da Auflösungen 4K erreichen, wachsen die CO2-Kosten pro Stunde Unterhaltung weiter.",
                "methodology_title": "So wird diese Netflix-Schätzung berechnet",
                "methodology_summary": "Die Netflix-Schätzung basiert auf einer Stunde Videostreaming und berücksichtigt sowohl die digitale Infrastruktur als auch das Gerät, auf dem der Inhalt angesehen wird.",
                "methodology_bullets": [
                    "Ausgangspunkt ist ein Emissionsrichtwert für Video-on-Demand-Streaming in Europa.",
                    "Höhere Auflösungen wie 4K erhöhen in der Regel die Datenübertragung und den Energieverbrauch des Geräts, wodurch der Gesamtwert steigt.",
                    "Ein Fernseher oder eine Spielkonsole hat oft einen größeren Einfluss als ein Laptop oder Smartphone, das denselben Stream abspielt."
                ],
                "faq": [
                    {
                        "question": "Wie groß ist der CO2-Fußabdruck von Netflix?",
                        "answer": "Netflix-Emissionen stammen aus der Streaming-Infrastruktur, der Netzwerkbereitstellung und dem Gerät, auf dem Sie schauen. Die Gesamtauswirkung steigt mit der Sehzeit, der Auflösung und dem Strommix, der Ihre Hardware versorgt."
                    },
                    {
                        "question": "Wie viel CO2 verursacht Netflix-Streaming pro Stunde?",
                        "answer": "Im Durchschnitt erzeugt das Streaming von HD-Videos etwa 55 g CO2 pro Stunde. Dies umfasst die Energie für den Datentransfer und die lokale Wiedergabe auf Standardgeräten."
                    }
                ],
                "idleforest_pitch": "Gleiche deinen Serienmarathon automatisch aus.",
                "human_equivalent_comparison": "5.000 Smartphones aufladen"
            },
            "pt": {
                "intro": "O impacto do streaming da Netflix vem de centros de dados, redes de entrega de conteúdo e do seu próprio hardware de visualização. À medida que as resoluções atingem 4K, o custo de carbono por hora de entretenimento continua a crescer.",
                "methodology_title": "Como é calculada esta estimativa da Netflix",
                "methodology_summary": "A estimativa da Netflix baseia-se numa hora de streaming de vídeo e reflete tanto a infraestrutura digital como o dispositivo usado para ver o conteúdo.",
                "methodology_bullets": [
                    "O ponto de partida é uma referência de emissões para streaming de vídeo a pedido na Europa.",
                    "Ver em resoluções mais altas, como 4K, normalmente aumenta a transferência de dados e o consumo energético do dispositivo, fazendo subir o total.",
                    "Uma televisão ou consola de jogos costuma ter um impacto maior do que um portátil ou telemóvel a reproduzir o mesmo conteúdo."
                ],
                "faq": [
                    {
                        "question": "Qual é a pegada de carbono da Netflix?",
                        "answer": "As emissões da Netflix vêm da infraestrutura de streaming, entrega de rede e do dispositivo em que assiste. O impacto total aumenta com o tempo de visualização, resolução e a mistura de energia que alimenta o seu hardware."
                    },
                    {
                        "question": "Quanto CO2 o streaming da Netflix gera por hora?",
                        "answer": "Em média, o streaming de vídeo HD gera cerca de 55g de CO2 por hora. Isso inclui a energia para transferência de dados e reprodução local em dispositivos padrão."
                    }
                ],
                "idleforest_pitch": "Compensa as tuas maratonas de séries automaticamente.",
                "human_equivalent_comparison": "Carregar 5.000 smartphones"
            },
            "fr": {
                "intro": "L'impact du streaming Netflix provient des centres de données, des réseaux de diffusion de contenu et de votre propre matériel de visionnage. À mesure que les résolutions atteignent la 4K, le coût carbone par heure de divertissement continue de croître.",
                "methodology_title": "Comment cette estimation de Netflix est calculée",
                "methodology_summary": "L'estimation de Netflix repose sur une heure de streaming vidéo et reflète à la fois l'infrastructure numérique et l'appareil utilisé pour regarder le contenu.",
                "methodology_bullets": [
                    "Le point de départ est un repère d'émissions pour le streaming de vidéo à la demande en Europe.",
                    "Regarder en plus haute résolution, comme la 4K, augmente généralement le transfert de données et la consommation d'énergie de l'appareil, ce qui fait monter le total.",
                    "Un téléviseur ou une console de jeu a souvent un impact plus important qu'un ordinateur portable ou un téléphone regardant le même flux."
                ],
                "faq": [
                    {
                        "question": "Quelle est l'empreinte carbone de Netflix ?",
                        "answer": "Les émissions de Netflix proviennent de l'infrastructure de streaming, de la diffusion sur le réseau et de l'appareil sur lequel vous regardez. L'impact total augmente avec le temps de visionnage, la résolution et le mix énergétique alimentant votre matériel."
                    },
                    {
                        "question": "Combien de CO2 le streaming Netflix génère-t-il par heure ?",
                        "answer": "En moyenne, le streaming de vidéo HD génère environ 55 g de CO2 par heure. Cela inclut l'énergie pour le transfert de données et la lecture locale sur des appareils standard."
                    }
                ],
                "idleforest_pitch": "Compensez automatiquement vos marathons de séries.",
                "human_equivalent_comparison": "Recharger 5 000 smartphones"
            }
        }
    },
    {
        "app_name": "TikTok",
        "category": "Social",
        "avg_usage_hours_day": "1.5",
        "co2_per_hour_grams": 160,
        "slug": "tiktok",
        "seo_content": {
            "en": {
                "intro": "TikTok's footprint comes from video delivery, device energy use, and the time people spend scrolling through high-definition short-form video.",
                "faq": [
                    {
                        "question": "What is TikTok's carbon footprint?",
                        "answer": "TikTok's footprint depends on video delivery, device energy use, and time spent scrolling. IdleForest estimates the impact with a simple usage-based calculator."
                    }
                ],
                "idleforest_pitch": "Scroll guilt-free by planting trees in the background.",
                "human_equivalent_comparison": "Driving 350km in a car"
            },
            "es": {
                "intro": "La huella de TikTok proviene de la entrega de video, el uso de energía del dispositivo y el tiempo que las personas pasan desplazándose por videos cortos de alta definición.",
                "faq": [
                    {
                        "question": "¿Cuál es la huella de carbono de TikTok?",
                        "answer": "La huella de TikTok depende de la entrega de video, el uso de energía del dispositivo y el tiempo dedicado al desplazamiento."
                    }
                ],
                "idleforest_pitch": "Desplázate sin culpa plantando árboles en segundo plano.",
                "human_equivalent_comparison": "Conducir 350 km en coche"
            },
            "de": {
                "intro": "Der Fußabdruck von TikTok stammt von der Videoübertragung, der Energienutzung der Geräte und der Zeit, die Menschen mit dem Scrollen durch hochauflösende Kurzvideos verbringen.",
                "faq": [
                    {
                        "question": "Wie groß ist der CO2-Fußabdruck von TikTok?",
                        "answer": "Der Fußabdruck von TikTok hängt von der Videoübertragung, der Energienutzung der Geräte und der Scrollzeit ab."
                    }
                ],
                "idleforest_pitch": "Scrolle ohne schlechtes Gewissen, indem du im Hintergrund Bäume pflanzt.",
                "human_equivalent_comparison": "350 km Autofahrt"
            },
            "pt": {
                "intro": "A pegada do TikTok vem da entrega de vídeo, uso de energia do dispositivo e do tempo que as pessoas passam a navegar por vídeos curtos de alta definição.",
                "faq": [
                    {
                        "question": "Qual é a pegada de carbono do TikTok?",
                        "answer": "A pegada do TikTok depende da entrega de vídeo, uso de energia do dispositivo e tempo gasto a navegar."
                    }
                ],
                "idleforest_pitch": "Faz scroll sem culpa enquanto plantas árvores em segundo plano.",
                "human_equivalent_comparison": "Conduzir 350 km de carro"
            },
            "fr": {
                "intro": "L'empreinte de TikTok provient de la diffusion vidéo, de la consommation d'énergie des appareils et du temps que les gens passent à faire défiler des vidéos courtes en haute définition.",
                "faq": [
                    {
                        "question": "Quelle est l'empreinte carbone de TikTok ?",
                        "answer": "L'empreinte de TikTok dépend de la diffusion vidéo, de la consommation d'énergie des appareils et du temps passé à défiler."
                    }
                ],
                "idleforest_pitch": "Faites défiler sans culpabilité en plantant des arbres en arrière-plan.",
                "human_equivalent_comparison": "Conduire 350 km en voiture"
            }
        }
    },
    {
        "app_name": "ChatGPT",
        "category": "AI",
        "avg_usage_hours_day": "0.5",
        "co2_per_hour_grams": 150,
        "slug": "chatgpt",
        "icon_slug": "ollama",
        "seo_content": {
            "en": {
                "intro": "ChatGPT's carbon footprint comes from every request, response, and supporting system behind the model. If you're asking how much CO2 ChatGPT produces, the answer depends on model size, response length, and how often you use it.",
                "methodology_title": "How this ChatGPT estimate is built",
                "methodology_summary": "This estimate converts repeated AI interactions into an hourly footprint by combining model inference demand with the surrounding data-center overhead.",
                "methodology_bullets": [
                    "Large language models run on accelerator-heavy infrastructure that consumes more energy per interaction than most ordinary web requests.",
                    "The estimate is meant to represent active usage over time, not a single prompt in isolation.",
                    "Real-world emissions vary with model size, response length, hardware efficiency, utilization, and the electricity mix of the data center."
                ],
                "faq": [
                    {
                        "question": "How much CO2 does ChatGPT produce?",
                        "answer": "The exact number depends on model size and hardware efficiency. Research indicates typical queries produce several grams of CO2 due to intensive GPU computations."
                    }
                ],
                "idleforest_pitch": "AI is smart. You should be too. Offset your prompts.",
                "human_equivalent_comparison": "Charging your smartphone 3,300 times"
            },
            "es": {
                "intro": "ChatGPT utiliza energía para cada consulta, respuesta y sistema de soporte detrás del modelo. Esta página ayuda a explicar cómo el uso cotidiano de la IA contribuye a las emisiones digitales.",
                "methodology_title": "Cómo se calcula esta estimación de ChatGPT",
                "methodology_summary": "Esta estimación convierte interacciones repetidas con IA en una huella por hora combinando la demanda de inferencia del modelo con la sobrecarga del centro de datos que la rodea.",
                "methodology_bullets": [
                    "Los modelos de lenguaje grandes se ejecutan en infraestructuras con gran uso de aceleradores que consumen más energía por interacción que la mayoría de las peticiones web normales.",
                    "La estimación pretende representar un uso activo a lo largo del tiempo, no un único prompt aislado.",
                    "Las emisiones reales varían según el tamaño del modelo, la longitud de la respuesta, la eficiencia del hardware, la utilización y la mezcla eléctrica del centro de datos."
                ],
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce ChatGPT?",
                        "answer": "El número exacto depende del tamaño del modelo y de la eficiencia del hardware. Las investigaciones indican que las consultas típicas producen varios gramos de CO2."
                    }
                ],
                "idleforest_pitch": "La IA es inteligente. Tú también deberías serlo. Compensa tus peticiones.",
                "human_equivalent_comparison": "Cargar tu smartphone 3.300 veces"
            },
            "de": {
                "intro": "ChatGPT verbraucht Energie für jede Anfrage, Antwort und jedes unterstützende System hinter dem Modell. Diese Seite hilft zu erklären, wie die tägliche KI-Nutzung zu digitalen Emissionen beiträgt.",
                "methodology_title": "So wird diese ChatGPT-Schätzung berechnet",
                "methodology_summary": "Diese Schätzung übersetzt wiederholte KI-Interaktionen in einen stündlichen Fußabdruck, indem sie den Inferenzbedarf des Modells mit dem umgebenden Rechenzentrums-Overhead kombiniert.",
                "methodology_bullets": [
                    "Große Sprachmodelle laufen auf beschleunigerlastiger Infrastruktur, die pro Interaktion mehr Energie verbraucht als die meisten gewöhnlichen Webanfragen.",
                    "Die Schätzung soll aktive Nutzung über die Zeit abbilden und nicht einen einzelnen Prompt isoliert betrachten.",
                    "Die tatsächlichen Emissionen variieren je nach Modellgröße, Antwortlänge, Hardwareeffizienz, Auslastung und Strommix des Rechenzentrums."
                ],
                "faq": [
                    {
                        "question": "Wie viel CO2 produziert ChatGPT?",
                        "answer": "Die genaue Zahl hängt von der Modellgröße und der Hardware-Effizienz ab. Untersuchungen zeigen, dass typische Abfragen mehrere Gramm CO2 erzeugen."
                    }
                ],
                "idleforest_pitch": "KI ist schlau. Du solltest es auch sein. Gleiche deine Anfragen aus.",
                "human_equivalent_comparison": "Dein Smartphone 3.300 Mal aufladen"
            },
            "pt": {
                "intro": "O ChatGPT usa energia para cada solicitação, resposta e sistema de suporte por trás do modelo. Esta página ajuda a explicar como o uso diário da IA contribui para as emissões digitais.",
                "methodology_title": "Como é calculada esta estimativa do ChatGPT",
                "methodology_summary": "Esta estimativa converte interações repetidas com IA numa pegada horária ao combinar a procura de inferência do modelo com a sobrecarga do centro de dados envolvente.",
                "methodology_bullets": [
                    "Os grandes modelos de linguagem correm em infraestruturas com forte uso de aceleradores, que consomem mais energia por interação do que a maioria dos pedidos web normais.",
                    "A estimativa pretende representar uma utilização ativa ao longo do tempo, e não um único prompt isolado.",
                    "As emissões reais variam consoante o tamanho do modelo, o comprimento da resposta, a eficiência do hardware, a utilização e o mix elétrico do centro de dados."
                ],
                "faq": [
                    {
                        "question": "Quanto CO2 o ChatGPT produz?",
                        "answer": "O número exato depende do tamanho do modelo e da eficiência do hardware. Pesquisas indicam que consultas típicas produzem vários gramas de CO2."
                    }
                ],
                "idleforest_pitch": "A IA é inteligente. Tu também deves ser. Compensa os teus pedidos.",
                "human_equivalent_comparison": "Carregar o teu smartphone 3.300 vezes"
            },
            "fr": {
                "intro": "ChatGPT utilise de l'énergie pour chaque requête, réponse et système de support derrière le modèle. Cette page aide à expliquer comment l'utilisation quotidienne de l'IA contribue aux émissions numériques.",
                "methodology_title": "Comment cette estimation de ChatGPT est calculée",
                "methodology_summary": "Cette estimation convertit des interactions répétées avec l'IA en une empreinte horaire en combinant la demande d'inférence du modèle avec la surcharge du centre de données qui l'entoure.",
                "methodology_bullets": [
                    "Les grands modèles de langage tournent sur des infrastructures très dépendantes des accélérateurs, qui consomment plus d'énergie par interaction que la plupart des requêtes web ordinaires.",
                    "L'estimation vise à représenter un usage actif dans le temps, et non un prompt unique pris isolément.",
                    "Les émissions réelles varient selon la taille du modèle, la longueur de la réponse, l'efficacité du matériel, le taux d'utilisation et le mix électrique du centre de données."
                ],
                "faq": [
                    {
                        "question": "Combien de CO2 produit ChatGPT ?",
                        "answer": "Le nombre exact dépend de la taille du modèle et de l'efficacité du matériel. Les recherches indiquent que les requêtes typiques produisent plusieurs grammes de CO2."
                    }
                ],
                "idleforest_pitch": "L'IA est intelligente. Vous devriez l'être aussi. Compensez vos requêtes.",
                "human_equivalent_comparison": "Recharger votre smartphone 3 300 fois"
            }
        }
    },
    {
        "app_name": "Claude",
        "category": "AI",
        "avg_usage_hours_day": "0.5",
        "co2_per_hour_grams": 140,
        "slug": "claude",
        "seo_content": {
            "en": {
                "intro": "Claude's carbon footprint involves large-scale inference processing in data centers. Each prompt contributes to electricity demand for both processing and cooling.",
                "faq": [
                    {
                        "question": "How much CO2 does Claude produce?",
                        "answer": "Like other LLMs, Claude generates several grams of CO2 per query depending on the model complexity and data center efficiency."
                    }
                ],
                "idleforest_pitch": "AI is smart. You should be too. Offset your prompts.",
                "human_equivalent_comparison": "Charging your smartphone 3,000 times"
            },
            "es": {
                "intro": "La huella de carbono de Claude implica un procesamiento de inferencia a gran escala en centros de datos. Cada prompt contribuye a la demanda de electricidad tanto para procesamiento como para refrigeración.",
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce Claude?",
                        "answer": "Al igual que otros LLMs, Claude genera varios gramos de CO2 por consulta."
                    }
                ],
                "idleforest_pitch": "La IA es inteligente. Tú también deberías serlo. Compensa tus peticiones.",
                "human_equivalent_comparison": "Cargar tu smartphone 3.000 veces"
            },
            "de": {
                "intro": "Der CO2-Fußabdruck von Claude beinhaltet groß angelegte Inferenzverarbeitung in Rechenzentren. Jeder Prompt trägt zum Strombedarf für Verarbeitung und Kühlung bei.",
                "faq": [
                    {
                        "question": "Wie viel CO2 produziert Claude?",
                        "answer": "Wie andere LLMs erzeugt Claude mehrere Gramm CO2 pro Abfrage."
                    }
                ],
                "idleforest_pitch": "KI ist schlau. Du solltest es auch sein. Gleiche deine Anfragen aus.",
                "human_equivalent_comparison": "Dein Smartphone 3.000 Mal aufladen"
            },
            "pt": {
                "intro": "A pegada de carbono do Claude envolve processamento de inferência em grande escala em centros de dados. Cada prompt contribui para a demanda de eletricidade para processamento e resfriamento.",
                "faq": [
                    {
                        "question": "Quanto CO2 o Claude produz?",
                        "answer": "Como outros LLMs, o Claude gera vários gramas de CO2 por consulta."
                    }
                ],
                "idleforest_pitch": "A IA é inteligente. Tu também deves ser. Compensa os teus pedidos.",
                "human_equivalent_comparison": "Carregar o teu smartphone 3.000 vezes"
            },
            "fr": {
                "intro": "L'empreinte carbone de Claude implique un traitement d'inférence à grande échelle dans les centres de données. Chaque prompt contribue à la demande d'électricité pour le traitement et le refroidissement.",
                "faq": [
                    {
                        "question": "Combien de CO2 produit Claude ?",
                        "answer": "Comme d'autres LLMs, Claude génère plusieurs grammes de CO2 par requête."
                    }
                ],
                "idleforest_pitch": "L'IA est intelligente. Vous devriez l'être aussi. Compensez vos requêtes.",
                "human_equivalent_comparison": "Recharger votre smartphone 3 000 fois"
            }
        }
    },
    {
        "app_name": "Midjourney",
        "category": "AI",
        "avg_usage_hours_day": "0.2",
        "co2_per_hour_grams": 250,
        "slug": "midjourney",
        "seo_content": {
            "en": {
                "intro": "Midjourney requires massive GPU power to generate high-resolution images. Image generation models typically consume more energy per request than text models.",
                "faq": [
                    {
                        "question": "How much CO2 does Midjourney produce?",
                        "answer": "Generating an image requires intense GPU computation, often resulting in higher emissions per query than text-based AI."
                    }
                ],
                "idleforest_pitch": "Create beautiful art without leaving an ugly footprint.",
                "human_equivalent_comparison": "Driving a car for 8 km"
            },
            "es": {
                "intro": "Midjourney requiere una enorme potencia de GPU para generar imágenes de alta resolución. Los modelos de generación de imágenes suelen consumir más energía por petición que los modelos de texto.",
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce Midjourney?",
                        "answer": "Generar una imagen requiere una computación intensa de GPU, lo que a menudo resulta en mayores emisiones por consulta que la IA de texto."
                    }
                ],
                "idleforest_pitch": "Crea arte hermoso sin dejar una huella fea.",
                "human_equivalent_comparison": "Conducir un coche durante 8 km"
            },
            "de": {
                "intro": "Midjourney benötigt massive GPU-Leistung, um hochauflösende Bilder zu generieren. Bildgenerierungsmodelle verbrauchen in der Regel mehr Energie pro Anfrage als Textmodelle.",
                "faq": [
                    {
                        "question": "Wie viel CO2 produziert Midjourney?",
                        "answer": "Das Generieren eines Bildes erfordert intensive GPU-Berechnungen, was oft zu höheren Emissionen pro Abfrage führt als textbasierte KI."
                    }
                ],
                "idleforest_pitch": "Erschaffe wunderschöne Kunst, ohne einen hässlichen Fußabdruck zu hinterlassen.",
                "human_equivalent_comparison": "8 km Autofahrt"
            },
            "pt": {
                "intro": "O Midjourney requer enorme potência de GPU para gerar imagens de alta resolução. Os modelos de geração de imagens normalmente consomem mais energia por pedido do que os modelos de texto.",
                "faq": [
                    {
                        "question": "Quanto CO2 o Midjourney produz?",
                        "answer": "Gerar uma imagem requer computação intensa de GPU, resultando frequentemente em emissões mais elevadas por consulta do que a IA baseada em texto."
                    }
                ],
                "idleforest_pitch": "Cria arte bonita sem deixar uma pegada feia.",
                "human_equivalent_comparison": "Conduzir um carro por 8 km"
            },
            "fr": {
                "intro": "Midjourney nécessite une puissance GPU massive pour générer des images haute résolution. Les modèles de génération d'images consomment généralement plus d'énergie par requête que les modèles de texte.",
                "faq": [
                    {
                        "question": "Combien de CO2 produit Midjourney ?",
                        "answer": "Générer une image nécessite un calcul GPU intense, entraînant souvent des émissions par requête plus élevées que l'IA basée sur le texte."
                    }
                ],
                "idleforest_pitch": "Créez de l'art magnifique sans laisser une empreinte laide.",
                "human_equivalent_comparison": "Conduire une voiture sur 8 km"
            }
        }
    },
    {
        "app_name": "Gemini",
        "category": "AI",
        "avg_usage_hours_day": "0.5",
        "co2_per_hour_grams": 145,
        "slug": "gemini",
        "seo_content": {
            "en": {
                "intro": "Gemini's multimodal capabilities mean it processes text, images, and audio, all of which require significant data center compute power.",
                "faq": [
                    {
                        "question": "How much CO2 does Gemini produce?",
                        "answer": "The emissions vary by the type of query (text vs image processing), but it generally aligns with other large foundation models."
                    }
                ],
                "idleforest_pitch": "Offset your AI workflows while planting real trees.",
                "human_equivalent_comparison": "Charging your smartphone 3,100 times"
            },
            "es": {
                "intro": "Las capacidades multimodales de Gemini significan que procesa texto, imágenes y audio, lo que requiere una importante potencia de cómputo en centros de datos.",
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce Gemini?",
                        "answer": "Las emisiones varían según el tipo de consulta, pero generalmente se alinean con otros grandes modelos fundamentales."
                    }
                ],
                "idleforest_pitch": "Compensa tus flujos de trabajo de IA mientras plantas árboles reales.",
                "human_equivalent_comparison": "Cargar tu smartphone 3.100 veces"
            },
            "de": {
                "intro": "Die multimodalen Fähigkeiten von Gemini bedeuten, dass es Text, Bilder und Audio verarbeitet, was allesamt erhebliche Rechenleistung in Rechenzentren erfordert.",
                "faq": [
                    {
                        "question": "Wie viel CO2 produziert Gemini?",
                        "answer": "Die Emissionen variieren je nach Art der Abfrage, entsprechen aber im Allgemeinen anderen großen Foundation-Modellen."
                    }
                ],
                "idleforest_pitch": "Gleiche deine KI-Workflows aus, während du echte Bäume pflanzt.",
                "human_equivalent_comparison": "Dein Smartphone 3.100 Mal aufladen"
            },
            "pt": {
                "intro": "As capacidades multimodais do Gemini significam que processa texto, imagens e áudio, o que requer um poder de computação significativo nos centros de dados.",
                "faq": [
                    {
                        "question": "Quanto CO2 o Gemini produz?",
                        "answer": "As emissões variam de acordo com o tipo de consulta, mas geralmente alinham-se com outros grandes modelos fundacionais."
                    }
                ],
                "idleforest_pitch": "Compensa os teus fluxos de trabalho de IA enquanto plantas árvores reais.",
                "human_equivalent_comparison": "Carregar o teu smartphone 3.100 vezes"
            },
            "fr": {
                "intro": "Les capacités multimodales de Gemini signifient qu'il traite le texte, les images et l'audio, ce qui nécessite une puissance de calcul importante dans les centres de données.",
                "faq": [
                    {
                        "question": "Combien de CO2 produit Gemini ?",
                        "answer": "Les émissions varient selon le type de requête, mais s'alignent généralement sur celles des autres grands modèles fondationnels."
                    }
                ],
                "idleforest_pitch": "Compensez vos workflows d'IA tout en plantant de vrais arbres.",
                "human_equivalent_comparison": "Recharger votre smartphone 3 100 fois"
            }
        }
    },
    {
        "app_name": "Zoom",
        "category": "Work",
        "avg_usage_hours_day": "3.0",
        "co2_per_hour_grams": 50,
        "slug": "zoom",
        "seo_content": {
            "en": {
                "intro": "A Zoom call can avoid travel emissions, but it still has a carbon footprint of its own. If you're estimating Zoom call emissions, the main factors are meeting length, participant count, camera use, and the device each person joins from.",
                "methodology_title": "How this Zoom estimate is built",
                "methodology_summary": "The Zoom estimate reflects one hour of video calling per participant and is shaped by both the streaming layer and the device handling the meeting.",
                "methodology_bullets": [
                    "Video calls increase network traffic compared with audio-only calls, especially when cameras stay on for the full meeting.",
                    "Participant count matters because each extra video stream adds more processing, transmission, and device energy use.",
                    "Turning video off, lowering resolution, or using efficient hardware can reduce the hourly footprint."
                ],
                "faq": [
                    {
                        "question": "How much CO2 does a Zoom call produce?",
                        "answer": "A standard video call generates about 50g of CO2 per hour per participant. This increases with higher video quality and more participants."
                    }
                ],
                "idleforest_pitch": "Remote work saves commutes but burns energy. Make your meetings carbon neutral.",
                "human_equivalent_comparison": "Driving form London to Oxford"
            },
            "es": {
                "intro": "Las reuniones de Zoom ofrecen beneficios ambientales al reducir los viajes, pero aún requieren una enorme potencia de red y servidor para conectar a los participantes a nivel mundial.",
                "methodology_title": "Cómo se calcula esta estimación de Zoom",
                "methodology_summary": "La estimación de Zoom refleja una hora de videollamada por participante y está determinada tanto por la capa de streaming como por el dispositivo que gestiona la reunión.",
                "methodology_bullets": [
                    "Las videollamadas aumentan el tráfico de red frente a las llamadas solo de audio, especialmente cuando las cámaras permanecen encendidas durante toda la reunión.",
                    "El número de participantes importa porque cada flujo de vídeo adicional añade más procesamiento, transmisión y consumo energético del dispositivo.",
                    "Apagar el vídeo, bajar la resolución o usar hardware eficiente puede reducir la huella por hora."
                ],
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce una llamada de Zoom?",
                        "answer": "Una videollamada estándar genera unos 50 g de CO2 por hora por participante."
                    }
                ],
                "idleforest_pitch": "El teletrabajo ahorra desplazamientos, pero consume energía. Haz que tus reuniones sean neutrales en carbono.",
                "human_equivalent_comparison": "Conducir de Londres a Oxford"
            },
            "de": {
                "intro": "Zoom-Meetings bieten Umweltvorteile durch weniger Reisen, erfordern aber dennoch massive Netzwerk- und Serverleistung, um Teilnehmer weltweit zu verbinden.",
                "methodology_title": "So wird diese Zoom-Schätzung berechnet",
                "methodology_summary": "Die Zoom-Schätzung bildet eine Stunde Videotelefonie pro Teilnehmer ab und wird sowohl von der Streaming-Ebene als auch vom Gerät geprägt, das das Meeting verarbeitet.",
                "methodology_bullets": [
                    "Videoanrufe erhöhen den Netzwerkverkehr im Vergleich zu reinen Audioanrufen, besonders wenn Kameras während des gesamten Meetings eingeschaltet bleiben.",
                    "Die Teilnehmerzahl ist wichtig, weil jeder zusätzliche Videostream mehr Verarbeitung, Übertragung und Energieverbrauch auf den Geräten verursacht.",
                    "Wer das Video ausschaltet, die Auflösung senkt oder effiziente Hardware nutzt, kann den stündlichen Fußabdruck verringern."
                ],
                "faq": [
                    {
                        "question": "Wie viel CO2 verursacht ein Zoom-Anruf?",
                        "answer": "Ein Standard-Videoanruf erzeugt etwa 50 g CO2 pro Stunde und Teilnehmer."
                    }
                ],
                "idleforest_pitch": "Remote-Arbeit spart Pendeln, verbraucht aber Energie. Mache deine Meetings klimaneutral.",
                "human_equivalent_comparison": "Fahrt von London nach Oxford"
            },
            "pt": {
                "intro": "As reuniões do Zoom proporcionam benefícios ambientais ao reduzir as viagens, mas ainda exigem uma enorme potência de rede e servidor para conectar os participantes globalmente.",
                "methodology_title": "Como é calculada esta estimativa do Zoom",
                "methodology_summary": "A estimativa do Zoom reflete uma hora de videochamada por participante e é moldada tanto pela camada de streaming como pelo dispositivo que gere a reunião.",
                "methodology_bullets": [
                    "As videochamadas aumentam o tráfego de rede face às chamadas apenas de áudio, especialmente quando as câmaras ficam ligadas durante toda a reunião.",
                    "O número de participantes importa porque cada fluxo de vídeo adicional acrescenta mais processamento, transmissão e consumo energético do dispositivo.",
                    "Desligar o vídeo, baixar a resolução ou usar hardware eficiente pode reduzir a pegada por hora."
                ],
                "faq": [
                    {
                        "question": "Quanto CO2 produz uma chamada de Zoom?",
                        "answer": "Uma videochamada padrão gera cerca de 50g de CO2 por hora por participante."
                    }
                ],
                "idleforest_pitch": "O trabalho remoto poupa viagens, mas consome energia. Torna as tuas reuniões neutras em carbono.",
                "human_equivalent_comparison": "Conduzir de Londres a Oxford"
            },
            "fr": {
                "intro": "Les réunions Zoom offrent des avantages environnementaux en réduisant les déplacements, mais elles nécessitent toujours une puissance de réseau et de serveur massive pour connecter les participants dans le monde entier.",
                "methodology_title": "Comment cette estimation de Zoom est calculée",
                "methodology_summary": "L'estimation de Zoom reflète une heure d'appel vidéo par participant et dépend à la fois de la couche de streaming et de l'appareil qui gère la réunion.",
                "methodology_bullets": [
                    "Les appels vidéo augmentent le trafic réseau par rapport aux appels audio seuls, surtout lorsque les caméras restent allumées pendant toute la réunion.",
                    "Le nombre de participants compte, car chaque flux vidéo supplémentaire ajoute du traitement, de la transmission et de la consommation d'énergie côté appareil.",
                    "Couper la vidéo, réduire la résolution ou utiliser un matériel efficace peut diminuer l'empreinte horaire."
                ],
                "faq": [
                    {
                        "question": "Combien de CO2 un appel Zoom produit-il ?",
                        "answer": "Un appel vidéo standard génère environ 50 g de CO2 par heure et par participant."
                    }
                ],
                "idleforest_pitch": "Le télétravail évite les trajets, mais consomme de l'énergie. Rendez vos réunions neutres en carbone.",
                "human_equivalent_comparison": "Conduire de Londres à Oxford"
            }
        }
    },
    {
        "app_name": "Instagram",
        "category": "Social",
        "avg_usage_hours_day": "1.0",
        "co2_per_hour_grams": 90,
        "slug": "instagram",
        "seo_content": {
            "en": {
                "intro": "Every photo, Reel, and Story on Instagram requires server storage and global network transmission, contributing to your personal digital footprint.",
                "faq": [
                    {
                        "question": "Does Instagram use a lot of energy?",
                        "answer": "Yes, loading infinite media feeds with high-resolution images and videos requires significant energy for both the device and the data centers."
                    }
                ],
                "idleforest_pitch": "Offset your scroll time without changing your habits.",
                "human_equivalent_comparison": "Driving 130km in a standard car"
            },
            "es": {
                "intro": "Cada foto, Reel e Story en Instagram requiere almacenamiento en servidor y transmisión por red global, lo que contribuye a tu huella digital personal.",
                "faq": [
                    {
                        "question": "¿Consume Instagram mucha energía?",
                        "answer": "Sí, cargar feeds de medios infinitos con imágenes y videos de alta resolución requiere una energía significativa."
                    }
                ],
                "idleforest_pitch": "Compensa tu tiempo de navegación sin cambiar tus hábitos.",
                "human_equivalent_comparison": "Conducir 130 km en un coche normal"
            },
            "de": {
                "intro": "Jedes Foto, Reel und jede Story auf Instagram erfordert Serverspeicherung und globale Netzwerkübertragung, was zu Ihrem persönlichen digitalen Fußabdruck beiträgt.",
                "faq": [
                    {
                        "question": "Verbraucht Instagram viel Energie?",
                        "answer": "Ja, das Laden unendlicher Medienfeeds mit hochauflösenden Bildern und Videos erfordert erhebliche Energie."
                    }
                ],
                "idleforest_pitch": "Gleiche deine Scroll-Zeit aus, ohne deine Gewohnheiten zu ändern.",
                "human_equivalent_comparison": "130 km in einem normalen Auto fahren"
            },
            "pt": {
                "intro": "Cada foto, Reel e Story no Instagram requer armazenamento em servidor e transmissão por rede global, contribuindo para a sua pegada digital pessoal.",
                "faq": [
                    {
                        "question": "O Instagram consome muita energia?",
                        "answer": "Sim, carregar feeds de media infinitos com imagens e vídeos de alta resolução exige uma energia significativa."
                    }
                ],
                "idleforest_pitch": "Compensa as tuas horas de ecrã sem mudar os teus hábitos.",
                "human_equivalent_comparison": "Conduzir 130 km num carro normal"
            },
            "fr": {
                "intro": "Chaque photo, Reel et Story sur Instagram nécessite un stockage sur serveur et une transmission sur le réseau mondial, contribuant ainsi à votre empreinte numérique personnelle.",
                "faq": [
                    {
                        "question": "Instagram consomme-t-il beaucoup d'énergie ?",
                        "answer": "Oui, le chargement de flux de médias infinis avec des images et des vidéos haute résolution nécessite une énergie importante."
                    }
                ],
                "idleforest_pitch": "Compensez votre temps de navigation sans changer vos habitudes.",
                "human_equivalent_comparison": "Conduire 130 km dans une voiture standard"
            }
        }
    },
    {
        "app_name": "Bitcoin (1 Tx)",
        "category": "Crypto",
        "avg_usage_hours_day": "N/A",
        "co2_per_hour_grams": 400000,
        "slug": "bitcoin",
        "seo_content": {
            "en": {
                "intro": "Bitcoin transactions have a high carbon footprint due to the massive energy consumption required for the proof-of-work mining process.",
                "methodology_title": "How this Bitcoin estimate is built",
                "methodology_summary": "Bitcoin is treated differently from the app pages because the unit here is one transaction rather than one hour of personal screen time.",
                "methodology_bullets": [
                    "The estimate uses network-level energy and emissions benchmarks for Bitcoin's proof-of-work system.",
                    "Transaction footprints are highly debated because they depend on how total mining energy is allocated across the network's activity.",
                    "The number shown should be read as a directional estimate for the carbon cost of a transaction, not a precise meter reading."
                ],
                "faq": [
                    {
                        "question": "How much CO2 does one Bitcoin transaction create?",
                        "answer": "Estimates suggest a single transaction can generate hundreds of kilograms of CO2, depending on the energy mix used by miners."
                    }
                ],
                "idleforest_pitch": "Crypto has a cost. IdleForest helps you pay it back to the planet.",
                "human_equivalent_comparison": "Burning half a ton of coal"
            },
            "es": {
                "intro": "Las transacciones de Bitcoin tienen una alta huella de carbono debido al enorme consumo de energía requerido para el proceso de minería de prueba de trabajo.",
                "methodology_title": "Cómo se calcula esta estimación de Bitcoin",
                "methodology_summary": "Bitcoin se trata de forma distinta a las páginas de apps porque aquí la unidad es una transacción y no una hora de tiempo personal frente a la pantalla.",
                "methodology_bullets": [
                    "La estimación utiliza referencias de energía y emisiones a nivel de red para el sistema de prueba de trabajo de Bitcoin.",
                    "La huella por transacción es muy debatida porque depende de cómo se reparta la energía total de minería entre la actividad de la red.",
                    "La cifra debe leerse como una estimación orientativa del coste de carbono de una transacción, no como una medición precisa."
                ],
                "faq": [
                    {
                        "question": "¿Cuánta CO2 genera una transacción de Bitcoin?",
                        "answer": "Las estimaciones sugieren que una sola transacción puede generar cientos de kilogramos de CO2."
                    }
                ],
                "idleforest_pitch": "Las criptomonedas tienen un coste. IdleForest te ayuda a devolvérselo al planeta.",
                "human_equivalent_comparison": "Quemar media tonelada de carbón"
            },
            "de": {
                "intro": "Bitcoin-Transaktionen haben einen hohen CO2-Fußabdruck aufgrund des massiven Energieverbrauchs, der für den Proof-of-Work-Mining-Prozess erforderlich ist.",
                "methodology_title": "So wird diese Bitcoin-Schätzung berechnet",
                "methodology_summary": "Bitcoin wird anders behandelt als die App-Seiten, weil die Einheit hier eine einzelne Transaktion und nicht eine Stunde persönlicher Bildschirmzeit ist.",
                "methodology_bullets": [
                    "Die Schätzung verwendet Energie- und Emissionsrichtwerte auf Netzwerkebene für das Proof-of-Work-System von Bitcoin.",
                    "Der Fußabdruck pro Transaktion ist stark umstritten, weil er davon abhängt, wie der gesamte Mining-Energieverbrauch auf die Netzwerkaktivität verteilt wird.",
                    "Der angezeigte Wert sollte als Richtwert für die CO2-Kosten einer Transaktion gelesen werden und nicht als präzise Messung."
                ],
                "faq": [
                    {
                        "question": "Wie viel CO2 verursacht eine Bitcoin-Transaktion?",
                        "answer": "Schätzungen deuten darauf hin, dass eine einzige Transaktion hunderte Kilogramm CO2 erzeugen kann."
                    }
                ],
                "idleforest_pitch": "Krypto hat seinen Preis. IdleForest hilft dir, ihn dem Planeten zurückzuzahlen.",
                "human_equivalent_comparison": "Eine halbe Tonne Kohle verbrennen"
            },
            "pt": {
                "intro": "As transações de Bitcoin têm uma pegada de carbono elevada devido ao enorme consumo de energia necessário para o processo de mineração de prova de trabalho.",
                "methodology_title": "Como é calculada esta estimativa do Bitcoin",
                "methodology_summary": "O Bitcoin é tratado de forma diferente das páginas de apps porque aqui a unidade é uma transação e não uma hora de tempo pessoal em frente ao ecrã.",
                "methodology_bullets": [
                    "A estimativa usa referências de energia e emissões ao nível da rede para o sistema de prova de trabalho do Bitcoin.",
                    "A pegada por transação é muito debatida porque depende de como a energia total da mineração é distribuída pela atividade da rede.",
                    "O valor apresentado deve ser lido como uma estimativa indicativa do custo de carbono de uma transação, e não como uma medição exata."
                ],
                "faq": [
                    {
                        "question": "Quanto CO2 cria uma transação de Bitcoin?",
                        "answer": "Estimativas sugerem que uma única transação pode gerar centenas de quilogramas de CO2."
                    }
                ],
                "idleforest_pitch": "As criptomoedas têm um custo. O IdleForest ajuda-te a devolvê-lo ao planeta.",
                "human_equivalent_comparison": "Queimar meia tonelada de carvão"
            },
            "fr": {
                "intro": "Les transactions Bitcoin ont une empreinte carbone élevée en raison de la consommation d'énergie massive requise pour le processus de minage en preuve de travail.",
                "methodology_title": "Comment cette estimation de Bitcoin est calculée",
                "methodology_summary": "Le Bitcoin est traité différemment des pages d'apps, car l'unité ici est une transaction et non une heure de temps personnel passé devant l'écran.",
                "methodology_bullets": [
                    "L'estimation s'appuie sur des repères de consommation d'énergie et d'émissions à l'échelle du réseau pour le système de preuve de travail de Bitcoin.",
                    "L'empreinte par transaction fait l'objet de nombreux débats, car elle dépend de la manière dont l'énergie totale du minage est répartie sur l'activité du réseau.",
                    "Le chiffre affiché doit être lu comme une estimation indicative du coût carbone d'une transaction, et non comme une mesure précise."
                ],
                "faq": [
                    {
                        "question": "Combien de CO2 une transaction Bitcoin crée-t-elle ?",
                        "answer": "Les estimations suggèrent qu'une seule transaction peut générer des centaines de kilogrammes de CO2."
                    }
                ],
                "idleforest_pitch": "La crypto a un coût. IdleForest vous aide à le rembourser à la planète.",
                "human_equivalent_comparison": "Brûler une demi-tonne de charbon"
            }
        }
    },
    {
        "app_name": "YouTube",
        "category": "Streaming",
        "avg_usage_hours_day": "1.0",
        "co2_per_hour_grams": 46,
        "slug": "youtube",
        "seo_content": {
            "en": {
                "intro": "YouTube's carbon footprint adds up across content processing, global delivery networks, and the device used for playback. If you're comparing YouTube emissions per hour or the CO2 cost of video streaming, watch time, resolution, and autoplay matter most.",
                "methodology_title": "How this YouTube estimate is built",
                "methodology_summary": "This estimate reflects one hour of YouTube viewing and bundles together platform infrastructure, network delivery, and playback on a consumer device.",
                "methodology_bullets": [
                    "YouTube behaves like other video streaming platforms, so watch quality and playback device both strongly affect the result.",
                    "Short clips can still add up because autoplay and recommendation loops extend total viewing time.",
                    "Watching on a phone generally uses less electricity than watching on a large TV or console."
                ],
                "faq": [
                    {
                        "question": "What is YouTube's carbon footprint?",
                        "answer": "YouTube streaming accounts for a large portion of internet traffic. The emissions come from data processing, storage, and network delivery."
                    }
                ],
                "idleforest_pitch": "Watch videos while planting a real forest.",
                "human_equivalent_comparison": "Manufacturing 2 plastic bottles"
            },
            "es": {
                "intro": "YouTube ofrece miles de millones de horas de video diariamente. La energía utilizada para el procesamiento de contenido y el streaming global se acumula en millones de dispositivos.",
                "methodology_title": "Cómo se calcula esta estimación de YouTube",
                "methodology_summary": "Esta estimación refleja una hora de visualización en YouTube y agrupa la infraestructura de la plataforma, la entrega por red y la reproducción en un dispositivo de consumo.",
                "methodology_bullets": [
                    "YouTube se comporta como otras plataformas de streaming de vídeo, así que la calidad de visualización y el dispositivo de reproducción afectan mucho al resultado.",
                    "Los clips cortos también pueden acumularse porque la reproducción automática y los bucles de recomendaciones alargan el tiempo total de visualización.",
                    "Ver en un teléfono suele consumir menos electricidad que verlo en una televisión grande o en una consola."
                ],
                "faq": [
                    {
                        "question": "¿Cuál es la huella de carbono de YouTube?",
                        "answer": "El streaming de YouTube representa una gran parte del tráfico de Internet. Las emisiones provienen del procesamiento de datos."
                    }
                ],
                "idleforest_pitch": "Mira vídeos mientras plantas un bosque real.",
                "human_equivalent_comparison": "Fabricar 2 botellas de plástico"
            },
            "de": {
                "intro": "YouTube liefert täglich Milliarden von Videostunden aus. Die für die Inhaltsverarbeitung und das globale Streaming verbrauchte Energie summiert sich über Millionen von Geräten.",
                "methodology_title": "So wird diese YouTube-Schätzung berechnet",
                "methodology_summary": "Diese Schätzung bildet eine Stunde YouTube-Nutzung ab und bündelt Plattforminfrastruktur, Netzwerkübertragung und Wiedergabe auf einem Endgerät.",
                "methodology_bullets": [
                    "YouTube verhält sich ähnlich wie andere Videostreaming-Plattformen, daher beeinflussen sowohl die Wiedergabequalität als auch das Gerät das Ergebnis stark.",
                    "Auch kurze Clips summieren sich, weil Autoplay und Empfehlungsschleifen die gesamte Wiedergabezeit verlängern.",
                    "Das Anschauen auf einem Smartphone verbraucht in der Regel weniger Strom als auf einem großen Fernseher oder einer Konsole."
                ],
                "faq": [
                    {
                        "question": "Wie groß ist der CO2-Fußabdruck von YouTube?",
                        "answer": "YouTube-Streaming macht einen großen Teil des Internetverkehrs aus. Die Emissionen stammen aus der Datenverarbeitung."
                    }
                ],
                "idleforest_pitch": "Schau Videos und pflanze gleichzeitig einen echten Wald.",
                "human_equivalent_comparison": "Herstellung von 2 Plastikflaschen"
            },
            "pt": {
                "intro": "O YouTube fornece milhares de milhões de horas de vídeo diariamente. A energia utilizada para o processamento de conteúdo e streaming global soma-se em milhões de dispositivos.",
                "methodology_title": "Como é calculada esta estimativa do YouTube",
                "methodology_summary": "Esta estimativa reflete uma hora de visualização no YouTube e junta a infraestrutura da plataforma, a entrega pela rede e a reprodução num dispositivo de consumo.",
                "methodology_bullets": [
                    "O YouTube comporta-se como outras plataformas de streaming de vídeo, por isso tanto a qualidade de visualização como o dispositivo de reprodução afetam fortemente o resultado.",
                    "Os clips curtos também se acumulam porque a reprodução automática e os ciclos de recomendações prolongam o tempo total de visualização.",
                    "Ver num telemóvel costuma gastar menos eletricidade do que ver numa televisão grande ou numa consola."
                ],
                "faq": [
                    {
                        "question": "Qual é a pegada de carbono do YouTube?",
                        "answer": "O streaming do YouTube representa uma grande parte do tráfego de Internet. As emissões vêm do processamento de dados."
                    }
                ],
                "idleforest_pitch": "Vê vídeos enquanto plantas uma floresta real.",
                "human_equivalent_comparison": "Fabricar 2 garrafas de plástico"
            },
            "fr": {
                "intro": "YouTube diffuse des milliards d'heures de vidéo chaque jour. L'énergie utilisée pour le traitement des contenus et le streaming mondial s'additionne sur des millions d'appareils.",
                "methodology_title": "Comment cette estimation de YouTube est calculée",
                "methodology_summary": "Cette estimation reflète une heure de visionnage sur YouTube et regroupe l'infrastructure de la plateforme, l'acheminement réseau et la lecture sur un appareil grand public.",
                "methodology_bullets": [
                    "YouTube se comporte comme les autres plateformes de streaming vidéo, donc la qualité de visionnage et l'appareil de lecture influencent fortement le résultat.",
                    "Les clips courts peuvent aussi s'accumuler, car l'autoplay et les boucles de recommandations allongent le temps total de visionnage.",
                    "Regarder sur un téléphone consomme généralement moins d'électricité que regarder sur un grand téléviseur ou une console."
                ],
                "faq": [
                    {
                        "question": "Quelle est l'empreinte carbone de YouTube ?",
                        "answer": "Le streaming sur YouTube représente une part importante du trafic internet. Les émissions proviennent du traitement des données."
                    }
                ],
                "idleforest_pitch": "Regardez des vidéos tout en plantant une vraie forêt.",
                "human_equivalent_comparison": "Fabriquer 2 bouteilles en plastique"
            }
        }
    },
    {
        "app_name": "Twitch",
        "category": "Streaming",
        "avg_usage_hours_day": "2.0",
        "co2_per_hour_grams": 55,
        "slug": "twitch",
        "seo_content": {
            "en": {
                "intro": "Twitch's live streaming technology requires significant bandwidth and instantaneous data processing, leading to continuous carbon emissions for each viewer.",
                "faq": [
                    {
                        "question": "How much CO2 does watching Twitch produce?",
                        "answer": "Watching a live stream generates about 55g of CO2 per hour due to server encoding and heavy data transfer."
                    }
                ],
                "idleforest_pitch": "Support your favorite streamers without hurting the planet.",
                "human_equivalent_comparison": "Driving a car for 160km"
            },
            "es": {
                "intro": "La tecnología de streaming en vivo de Twitch requiere un ancho de banda significativo y un procesamiento de datos instantáneo, lo que genera emisiones de carbono continuas.",
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce ver Twitch?",
                        "answer": "Ver un stream en vivo genera unos 55 g de CO2 por hora."
                    }
                ],
                "idleforest_pitch": "Apoya a tus streamers favoritos sin dañar el planeta.",
                "human_equivalent_comparison": "Conducir un coche durante 160 km"
            },
            "de": {
                "intro": "Die Live-Streaming-Technologie von Twitch erfordert eine erhebliche Bandbreite und sofortige Datenverarbeitung, was zu kontinuierlichen CO2-Emissionen führt.",
                "faq": [
                    {
                        "question": "Wie viel CO2 verursacht das Schauen von Twitch?",
                        "answer": "Das Schauen eines Live-Streams erzeugt etwa 55 g CO2 pro Stunde."
                    }
                ],
                "idleforest_pitch": "Unterstütze deine Lieblings-Streamer, ohne dem Planeten zu schaden.",
                "human_equivalent_comparison": "160 km Autofahrt"
            },
            "pt": {
                "intro": "A tecnologia de streaming em direto da Twitch exige uma largura de banda significativa e processamento instantâneo de dados, levando a emissões contínuas de carbono.",
                "faq": [
                    {
                        "question": "Quanto CO2 produz ver a Twitch?",
                        "answer": "Ver uma transmissão em direto gera cerca de 55g de CO2 por hora."
                    }
                ],
                "idleforest_pitch": "Apoia os teus streamers favoritos sem prejudicar o planeta.",
                "human_equivalent_comparison": "Conduzir um carro por 160 km"
            },
            "fr": {
                "intro": "La technologie de streaming en direct de Twitch nécessite une bande passante importante et un traitement instantané des données, ce qui entraîne des émissions de carbone continues.",
                "faq": [
                    {
                        "question": "Combien de CO2 regarder Twitch produit-il ?",
                        "answer": "Regarder un stream en direct génère environ 55 g de CO2 par heure."
                    }
                ],
                "idleforest_pitch": "Soutenez vos streamers préférés sans nuire à la planète.",
                "human_equivalent_comparison": "Conduire une voiture sur 160 km"
            }
        }
    },
    {
        "app_name": "League of Legends",
        "category": "Gaming",
        "avg_usage_hours_day": "2.5",
        "co2_per_hour_grams": 120,
        "slug": "league-of-legends",
        "icon_slug": "leagueoflegends",
        "seo_content": {
            "en": {
                "intro": "League of Legends players contribute to digital emissions through complex GPU rendering and the global server network powering million of matches simultaneously.",
                "faq": [
                    {
                        "question": "What is the environmental cost of gaming?",
                        "answer": "The cost depends on your PC hardware. PC gaming is generally more energy-intensive than mobile or console gaming."
                    }
                ],
                "idleforest_pitch": "Turn your gaming addiction into a reforestation project.",
                "human_equivalent_comparison": "Driving a car for 450 km"
            },
            "es": {
                "intro": "Los jugadores de League of Legends contribuyen a las emisiones digitales mediante el renderizado complejo de la GPU y la red global de servidores.",
                "faq": [
                    {
                        "question": "¿Cuál es el costo ambiental de los videojuegos?",
                        "answer": "El costo depende del hardware de tu PC. El juego en PC es generalmente más intensivo en energía."
                    }
                ],
                "idleforest_pitch": "Convierte tu adicción a los juegos en un proyecto de reforestación.",
                "human_equivalent_comparison": "Conducir un coche durante 450 km"
            },
            "de": {
                "intro": "League of Legends-Spieler tragen durch komplexes GPU-Rendering und das globale Servernetzwerk zu digitalen Emissionen bei.",
                "faq": [
                    {
                        "question": "Was sind die Umweltkosten von Gaming?",
                        "answer": "Die Kosten hängen von Ihrer PC-Hardware ab. PC-Gaming ist im Allgemeinen energieintensiver."
                    }
                ],
                "idleforest_pitch": "Verwandle deine Gaming-Sucht in ein Aufforstungsprojekt.",
                "human_equivalent_comparison": "450 km Autofahrt"
            },
            "pt": {
                "intro": "Os jogadores de League of Legends contribuem para as emissões digitais através de renderização complexa de GPU e da rede global de servidores.",
                "faq": [
                    {
                        "question": "Qual é o custo ambiental dos jogos?",
                        "answer": "O custo depende do hardware do seu PC. O jogo em PC é geralmente mais intensivo em energia."
                    }
                ],
                "idleforest_pitch": "Transforma o teu vício em jogos num projeto de reflorestação.",
                "human_equivalent_comparison": "Conduzir um carro por 450 km"
            },
            "fr": {
                "intro": "Les joueurs de League of Legends contribuent aux émissions numériques grâce au rendu GPU complexe et au réseau mondial de serveurs.",
                "faq": [
                    {
                        "question": "Quel est le coût environnemental du jeu vidéo ?",
                        "answer": "Le coût dépend du matériel de votre PC. Le jeu sur PC est généralement plus énergivore."
                    }
                ],
                "idleforest_pitch": "Transformez votre addiction aux jeux en projet de reforestation.",
                "human_equivalent_comparison": "Conduire une voiture sur 450 km"
            }
        }
    },
    {
        "app_name": "Google Chrome",
        "category": "Browsing",
        "avg_usage_hours_day": "4.0",
        "co2_per_hour_grams": 25,
        "slug": "google-chrome",
        "icon_slug": "googlechrome",
        "seo_content": {
            "en": {
                "intro": "Browser tabs and active background processes in Chrome consume CPU and RAM, translating to small but consistent energy usage throughout the day.",
                "methodology_title": "How this Chrome estimate is built",
                "methodology_summary": "The Chrome estimate focuses on active browsing behavior and background browser load rather than only the energy of a single page view.",
                "methodology_bullets": [
                    "Open tabs, video playback, extensions, and JavaScript-heavy websites all change how much CPU and memory the browser uses.",
                    "Long sessions matter because modest hourly power draw compounds over a full workday.",
                    "This estimate is most useful as a comparative signal for digital habits, not as a lab-grade measurement for one exact tab setup."
                ],
                "faq": [
                    {
                        "question": "Do browser tabs use energy?",
                        "answer": "Yes, every open tab requires memory and processing power. Active pages with video or complex scripts use significantly more energy."
                    }
                ],
                "idleforest_pitch": "Your browser is open anyway. Make it work for the earth.",
                "human_equivalent_comparison": "Charging your phone for a year"
            },
            "es": {
                "intro": "Las pestañas del navegador y los procesos de fondo activos en Chrome consumen CPU y RAM, lo que se traduce en un uso de energía pequeño pero constante.",
                "methodology_title": "Cómo se calcula esta estimación de Chrome",
                "methodology_summary": "La estimación de Chrome se centra en el comportamiento de navegación activa y en la carga del navegador en segundo plano, en lugar de solo la energía de una única página vista.",
                "methodology_bullets": [
                    "Las pestañas abiertas, la reproducción de vídeo, las extensiones y los sitios con mucho JavaScript cambian cuánto CPU y memoria usa el navegador.",
                    "Las sesiones largas importan porque un consumo horario modesto se acumula a lo largo de toda una jornada.",
                    "Esta estimación es más útil como señal comparativa de hábitos digitales que como una medición de laboratorio para una configuración exacta de pestañas."
                ],
                "faq": [
                    {
                        "question": "¿Consumen energía las pestañas del navegador?",
                        "answer": "Sí, cada pestaña abierta requiere memoria y potencia de procesamiento."
                    }
                ],
                "idleforest_pitch": "Tu navegador ya está abierto. Haz que trabaje por la Tierra.",
                "human_equivalent_comparison": "Cargar tu teléfono durante un año"
            },
            "de": {
                "intro": "Browser-Tabs und aktive Hintergrundprozesse in Chrome verbrauchen CPU und RAM, was zu einem geringen, aber stetigen Energieverbrauch über den Tag führt.",
                "methodology_title": "So wird diese Chrome-Schätzung berechnet",
                "methodology_summary": "Die Chrome-Schätzung konzentriert sich auf aktives Surfverhalten und Browserlast im Hintergrund statt nur auf die Energie eines einzelnen Seitenaufrufs.",
                "methodology_bullets": [
                    "Offene Tabs, Videowiedergabe, Erweiterungen und JavaScript-lastige Websites verändern, wie viel CPU und Arbeitsspeicher der Browser nutzt.",
                    "Lange Sitzungen sind wichtig, weil sich ein moderater stündlicher Stromverbrauch über einen ganzen Arbeitstag summiert.",
                    "Diese Schätzung ist eher als Vergleichssignal für digitale Gewohnheiten nützlich als als Labormessung für ein ganz bestimmtes Tab-Setup."
                ],
                "faq": [
                    {
                        "question": "Verbrauchen Browser-Tabs Energie?",
                        "answer": "Ja, jeder offene Tab benötigt Speicher und Rechenleistung."
                    }
                ],
                "idleforest_pitch": "Dein Browser ist ohnehin offen. Lass ihn für die Erde arbeiten.",
                "human_equivalent_comparison": "Dein Telefon ein Jahr lang aufladen"
            },
            "pt": {
                "intro": "Os separadores do navegador e os processos de segundo plano ativos no Chrome consomem CPU e RAM, traduzindo-se num uso de energia pequeno mas consistente.",
                "methodology_title": "Como é calculada esta estimativa do Chrome",
                "methodology_summary": "A estimativa do Chrome centra-se no comportamento de navegação ativa e na carga do browser em segundo plano, em vez de apenas na energia de uma única página visitada.",
                "methodology_bullets": [
                    "Separadores abertos, reprodução de vídeo, extensões e sites pesados em JavaScript alteram o uso de CPU e memória do browser.",
                    "As sessões longas importam porque um consumo horário modesto se acumula ao longo de um dia inteiro de trabalho.",
                    "Esta estimativa é mais útil como sinal comparativo de hábitos digitais do que como medição laboratorial para uma configuração exata de separadores."
                ],
                "faq": [
                    {
                        "question": "Os separadores do navegador consomem energia?",
                        "answer": "Sim, cada separador aberto requer memória e poder de processamento."
                    }
                ],
                "idleforest_pitch": "O teu browser já está aberto. Faz com que trabalhe pelo planeta.",
                "human_equivalent_comparison": "Carregar o teu telemóvel durante um ano"
            },
            "fr": {
                "intro": "Les onglets du navigateur et les processus d'arrière-plan actifs dans Chrome consomment du processeur et de la RAM, ce qui se traduit par une consommation d'énergie faible mais constante.",
                "methodology_title": "Comment cette estimation de Chrome est calculée",
                "methodology_summary": "L'estimation de Chrome se concentre sur le comportement de navigation active et la charge du navigateur en arrière-plan plutôt que sur l'énergie d'une seule page vue.",
                "methodology_bullets": [
                    "Les onglets ouverts, la lecture vidéo, les extensions et les sites riches en JavaScript modifient l'utilisation du processeur et de la mémoire par le navigateur.",
                    "Les longues sessions comptent, car une consommation horaire modeste s'additionne sur toute une journée de travail.",
                    "Cette estimation est surtout utile comme signal comparatif des habitudes numériques, et non comme mesure de laboratoire pour une configuration d'onglets précise."
                ],
                "faq": [
                    {
                        "question": "Les onglets du navigateur consomment-ils de l'énergie ?",
                        "answer": "Oui, chaque onglet ouvert nécessite de la mémoire et de la puissance de traitement."
                    }
                ],
                "idleforest_pitch": "Votre navigateur est déjà ouvert. Faites-le travailler pour la Terre.",
                "human_equivalent_comparison": "Recharger votre téléphone pendant un an"
            }
        }
    },
    {
        "app_name": "Minecraft",
        "category": "Gaming",
        "avg_usage_hours_day": "2",
        "co2_per_hour_grams": 100,
        "slug": "minecraft",
        "icon_slug": "fallback:gamepad",
        "seo_content": {
            "en": {
                "intro": "Minecraft uses procedural generation and server-side logic that requires continuous processing power, especially when playing on large multiplayer servers.",
                "faq": [
                    {
                        "question": "Is Minecraft bad for the environment?",
                        "answer": "Minecraft is less demanding than AAA games, but long play sessions on high-end hardware still contribute to your carbon footprint."
                    }
                ],
                "idleforest_pitch": "Building blocks? Build a forest instead.",
                "human_equivalent_comparison": "Driving 290km in a gas car"
            },
            "es": {
                "intro": "Minecraft utiliza generación procedimental y lógica de servidor que requiere una potencia de procesamiento continua, especialmente en servidores multijugador grandes.",
                "faq": [
                    {
                        "question": "¿Es Minecraft malo para el medio ambiente?",
                        "answer": "Minecraft es menos exigente que los juegos AAA, pero las sesiones largas siguen contribuyendo a tu huella de carbono."
                    }
                ],
                "idleforest_pitch": "¿Bloques de construcción? Construye un bosque en su lugar.",
                "human_equivalent_comparison": "Conducir 290 km en un coche de gasolina"
            },
            "de": {
                "intro": "Minecraft verwendet prozedurale Generierung und serverseitige Logik, die kontinuierliche Rechenleistung erfordert, insbesondere beim Spielen auf großen Multiplayer-Servern.",
                "faq": [
                    {
                        "question": "Ist Minecraft schlecht für die Umwelt?",
                        "answer": "Minecraft ist weniger anspruchsvoll als AAA-Spiele, aber lange Sitzungen tragen dennoch zu Ihrem CO2-Fußabdruck bei."
                    }
                ],
                "idleforest_pitch": "Bausteine? Baue stattdessen einen Wald.",
                "human_equivalent_comparison": "290 km im Verbrennerauto"
            },
            "pt": {
                "intro": "O Minecraft utiliza geração procedural e lógica do lado do servidor que exige poder de processamento contínuo, especialmente ao jogar em grandes servidores multijogador.",
                "faq": [
                    {
                        "question": "O Minecraft é mau para o ambiente?",
                        "answer": "O Minecraft é menos exigente do que os jogos AAA, mas sessões longas continuam a contribuir para a sua pegada de carbono."
                    }
                ],
                "idleforest_pitch": "Blocos de construção? Constrói uma floresta antes.",
                "human_equivalent_comparison": "Conduzir 290 km num carro a gasolina"
            },
            "fr": {
                "intro": "Minecraft utilise la génération procédurale et la logique côté serveur, ce qui nécessite une puissance de traitement continue, en particulier lors de jeux sur de grands serveurs multijoueurs.",
                "faq": [
                    {
                        "question": "Minecraft est-il mauvais pour l'environnement ?",
                        "answer": "Minecraft est moins exigeant que les jeux AAA, mais les longues sessions de jeu contribuent tout de même à votre empreinte carbone."
                    }
                ],
                "idleforest_pitch": "Des blocs de construction? Construisez plutôt une forêt.",
                "human_equivalent_comparison": "Conduire 290 km dans une voiture à essence"
            }
        }
    },
    {
        "app_name": "Microsoft Teams",
        "category": "Work",
        "avg_usage_hours_day": "2",
        "co2_per_hour_grams": 50,
        "slug": "microsoft-teams",
        "icon_slug": "fallback:users",
        "seo_content": {
            "en": {
                "intro": "Collaboration tools like Microsoft Teams require video processing, cloud storage for files, and network bandwidth for real-time communication.",
                "faq": [
                    {
                        "question": "Do work calls have a carbon footprint?",
                        "answer": "Yes, video conferencing generates CO2 through server processing and network data transfer."
                    }
                ],
                "idleforest_pitch": "Work meetings add up. Offset your 9-to-5.",
                "human_equivalent_comparison": "Using an LED bulb for 3 years non-stop"
            },
            "es": {
                "intro": "Las herramientas de colaboración como Microsoft Teams requieren procesamiento de video, almacenamiento en la nube y ancho de banda de red para la comunicación en tiempo real.",
                "faq": [
                    {
                        "question": "¿Tienen las llamadas de trabajo una huella de carbono?",
                        "answer": "Sí, la videoconferencia genera CO2 a través del procesamiento del servidor."
                    }
                ],
                "idleforest_pitch": "Las reuniones suman. Compensa tu horario de 9 a 5.",
                "human_equivalent_comparison": "Usar una bombilla LED durante 3 años seguidos"
            },
            "de": {
                "intro": "Zusammenarbeitstools wie Microsoft Teams erfordern Videoverarbeitung, Cloud-Speicher für Dateien und Netzwerkbandbreite für die Echtzeitkommunikation.",
                "faq": [
                    {
                        "question": "Haben Arbeitsanrufe einen CO2-Fußabdruck?",
                        "answer": "Ja, Videokonferenzen erzeugen CO2 durch Serververarbeitung und Datentransfer."
                    }
                ],
                "idleforest_pitch": "Meetings summieren sich. Gleiche deinen 9-to-5-Job aus.",
                "human_equivalent_comparison": "Nutzung einer LED-Lampe für 3 Jahre"
            },
            "pt": {
                "intro": "Ferramentas de colaboração como o Microsoft Teams exigem processamento de vídeo, armazenamento em nuvem e largura de banda para comunicação em tempo real.",
                "faq": [
                    {
                        "question": "As chamadas de trabalho têm uma pegada de carbono?",
                        "answer": "Sim, a videoconferência gera CO2 através do processamento no servidor."
                    }
                ],
                "idleforest_pitch": "As reuniões acumulam-se. Compensa as tuas horas de trabalho.",
                "human_equivalent_comparison": "Usar uma lâmpada LED durante 3 anos sem parar"
            },
            "fr": {
                "intro": "Les outils de collaboration comme Microsoft Teams nécessitent un traitement vidéo, un stockage cloud et une bande passante réseau pour la communication en temps réel.",
                "faq": [
                    {
                        "question": "Les appels professionnels ont-ils une empreinte carbone ?",
                        "answer": "Oui, la visioconférence génère du CO2 via le traitement sur les serveurs."
                    }
                ],
                "idleforest_pitch": "Les réunions s'additionnent. Compensez vos heures de bureau.",
                "human_equivalent_comparison": "Utiliser une ampoule LED pendant 3 ans sans s'arrêter"
            }
        }
    },
    {
        "app_name": "Twitter / X",
        "category": "Social",
        "avg_usage_hours_day": "1.0",
        "co2_per_hour_grams": 36,
        "slug": "twitter",
        "icon_slug": "x",
        "seo_content": {
            "en": {
                "intro": "Refreshing your feed on X (formerly Twitter) triggers cloud databases and content delivery networks to serve media-heavy timelines instantly.",
                "faq": [
                    {
                        "question": "How much CO2 does scrolling Twitter produce?",
                        "answer": "Scrolling for an hour generates about 36g of CO2, depending on the volume of videos and images in your feed."
                    }
                ],
                "idleforest_pitch": "Doomscrolling? Make it green planting.",
                "human_equivalent_comparison": "Driving 50km in a car"
            },
            "es": {
                "intro": "Actualizar tu feed en X activa bases de datos en la nube y redes de entrega de contenido para servir timelines con mucho contenido multimedia.",
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce desplazarse por Twitter?",
                        "answer": "Desplazarse durante una hora genera unos 36 g de CO2."
                    }
                ],
                "idleforest_pitch": "¿Navegando hacia la perdición? Conviértelo en plantación verde.",
                "human_equivalent_comparison": "Conducir 50 km en coche"
            },
            "de": {
                "intro": "Das Aktualisieren Ihres Feeds auf X aktiviert Cloud-Datenbanken und Inhaltsnetzwerke, um medienlastige Timelines sofort bereitzustellen.",
                "faq": [
                    {
                        "question": "Wie viel CO2 verursacht das Scrollen auf Twitter?",
                        "answer": "Eine Stunde Scrollen erzeugt etwa 36 g CO2."
                    }
                ],
                "idleforest_pitch": "Doomscrolling? Mach es zum grünen Pflanzen.",
                "human_equivalent_comparison": "50 km Autofahrt"
            },
            "pt": {
                "intro": "Atualizar o seu feed no X ativa bases de dados na nuvem e redes de entrega de conteúdo para fornecer linhas de tempo ricas em media instantaneamente.",
                "faq": [
                    {
                        "question": "Quanto CO2 produz navegar no Twitter?",
                        "answer": "Navegar durante uma hora gera cerca de 36g de CO2."
                    }
                ],
                "idleforest_pitch": "A fazer doomscrolling? Transforma-o numa plantação verde.",
                "human_equivalent_comparison": "Conduzir 50 km de carro"
            },
            "fr": {
                "intro": "Actualiser votre flux sur X active les bases de données cloud pour servir instantanément des fils d'actualité riches en médias.",
                "faq": [
                    {
                        "question": "Combien de CO2 regarder Twitter produit-il ?",
                        "answer": "Faire défiler pendant une heure génère environ 36 g de CO2."
                    }
                ],
                "idleforest_pitch": "Vous scrollez à l'infini ? Transformez cela en plantation verte.",
                "human_equivalent_comparison": "Conduire 50 km en voiture"
            }
        }
    },
    {
        "app_name": "Spotify",
        "category": "Streaming",
        "avg_usage_hours_day": "3.0",
        "co2_per_hour_grams": 2,
        "slug": "spotify",
        "seo_content": {
            "en": {
                "intro": "Audio streaming on Spotify is significantly more energy-efficient than video, but millions of simultaneous streams still create a noticeable carbon footprint.",
                "faq": [
                    {
                        "question": "Does Spotify have a high carbon footprint?",
                        "answer": "Audio streaming is very lean (~2g/hr), but downloaded music is even better as it reduces repeated network data transfer."
                    }
                ],
                "idleforest_pitch": "Your soundtrack shouldn't cost the Earth.",
                "human_equivalent_comparison": "Boiling 5 kettles of water"
            },
            "es": {
                "intro": "El streaming de audio en Spotify es más eficiente energéticamente que el de video, pero millones de streams simultáneos generan una huella de carbono.",
                "faq": [
                    {
                        "question": "¿Tiene Spotify una alta huella de carbono?",
                        "answer": "El streaming de audio es muy ligero (~2 g/hr)."
                    }
                ],
                "idleforest_pitch": "Tu banda sonora no debería costarle al planeta.",
                "human_equivalent_comparison": "Hervir 5 teteras de agua"
            },
            "de": {
                "intro": "Audio-Streaming auf Spotify ist deutlich energieeffizienter als Video, aber Millionen gleichzeitiger Streams verursachen dennoch einen CO2-Fußabdruck.",
                "faq": [
                    {
                        "question": "Hat Spotify einen hohen CO2-Fußabdruck?",
                        "answer": "Audio-Streaming ist sehr sparsam (~2 g/Std.)."
                    }
                ],
                "idleforest_pitch": "Dein Soundtrack sollte nicht die Welt kosten.",
                "human_equivalent_comparison": "5 Wasserkocher aufkochen"
            },
            "pt": {
                "intro": "O streaming de áudio no Spotify é significativamente mais eficiente do que o de vídeo, mas milhões de streams simultâneos criam uma pegada de carbono.",
                "faq": [
                    {
                        "question": "O Spotify tem uma pegada de carbono elevada?",
                        "answer": "O streaming de áudio é muito eficiente (~2g/h)."
                    }
                ],
                "idleforest_pitch": "A tua banda sonora não devia custar a Terra.",
                "human_equivalent_comparison": "Ferver 5 chaleiras de água"
            },
            "fr": {
                "intro": "Le streaming audio sur Spotify est nettement plus économe en énergie que la vidéo, mais des millions de flux simultanés créent tout de même une empreinte carbone.",
                "faq": [
                    {
                        "question": "Spotify a-t-il une empreinte carbone élevée ?",
                        "answer": "Le streaming audio est très sobre (~2 g/h)."
                    }
                ],
                "idleforest_pitch": "Votre bande-son ne devrait pas coûter la Terre.",
                "human_equivalent_comparison": "Faire bouillir 5 bouilloires d'eau"
            }
        }
    },
    {
        "app_name": "Roblox",
        "category": "Gaming",
        "avg_usage_hours_day": "1.5",
        "co2_per_hour_grams": 60,
        "slug": "roblox",
        "seo_content": {
            "en": {
                "intro": "Roblox's vast ecosystem of user-created games relies on cloud hosting and real-time multiplayer coordination, contributing to digital energy consumption.",
                "faq": [
                    {
                        "question": "How much CO2 does playing Roblox produce?",
                        "answer": "Playing generates about 60g of CO2 per hour on typical consumer hardware."
                    }
                ],
                "idleforest_pitch": "Play together, plant together.",
                "human_equivalent_comparison": "Driving 130km in a car"
            },
            "es": {
                "intro": "El ecosistema de Roblox se basa en el alojamiento en la nube y la coordinación multijugador en tiempo real, lo que contribuye al consumo de energía digital.",
                "faq": [
                    {
                        "question": "¿Cuánta CO2 produce jugar Roblox?",
                        "answer": "Jugar genera unos 60 g de CO2 por hora."
                    }
                ],
                "idleforest_pitch": "Jugad juntos, plantad juntos.",
                "human_equivalent_comparison": "Conducir 130 km en coche"
            },
            "de": {
                "intro": "Das riesige Ökosystem von Roblox basiert auf Cloud-Hosting und Echtzeit-Multiplayer-Koordination, was zum digitalen Energieverbrauch beiträgt.",
                "faq": [
                    {
                        "question": "Wie viel CO2 verursacht das Spielen von Roblox?",
                        "answer": "Das Spielen erzeugt etwa 60 g CO2 pro Stunde."
                    }
                ],
                "idleforest_pitch": "Zusammen spielen, zusammen pflanzen.",
                "human_equivalent_comparison": "130 km Autofahrt"
            },
            "pt": {
                "intro": "O vasto ecossistema do Roblox baseia-se em alojamento na nuvem e coordenação multijogador em tempo real, contribuindo para o consumo de energia digital.",
                "faq": [
                    {
                        "question": "Quanto CO2 produz jogar Roblox?",
                        "answer": "Jogar gera cerca de 60g de CO2 por hora."
                    }
                ],
                "idleforest_pitch": "Joguem juntos, plantem juntos.",
                "human_equivalent_comparison": "Conduzir 130 km de carro"
            },
            "fr": {
                "intro": "Le vaste écosystème de Roblox repose sur l'hébergement cloud et la coordination multijoueur en temps réel, contribuant à la consommation d'énergie numérique.",
                "faq": [
                    {
                        "question": "Combien de CO2 jouer à Roblox produit-il ?",
                        "answer": "Jouer génère environ 60 g de CO2 par heure."
                    }
                ],
                "idleforest_pitch": "Jouez ensemble, plantez ensemble.",
                "human_equivalent_comparison": "Conduire 130 km en voiture"
            }
        }
    },
    {
        "app_name": "Ethereum (Tx)",
        "category": "Crypto",
        "avg_usage_hours_day": "N/A",
        "co2_per_hour_grams": 13,
        "slug": "ethereum",
        "icon_slug": "ethereum",
        "seo_content": {
            "en": {
                "intro": "Since switching to Proof of Stake, Ethereum's carbon footprint per transaction has dropped by over 99%, making it one of the greener blockchains.",
                "faq": [
                    {
                        "question": "Is Ethereum environmentally friendly?",
                        "answer": "Compared to Bitcoin, yes. A transaction now uses about the same energy as charging a smartphone once."
                    }
                ],
                "idleforest_pitch": "Proof of Stake is better, but planting trees is best.",
                "human_equivalent_comparison": "Charging 1 smartphone"
            },
            "es": {
                "intro": "Desde el cambio a Proof of Stake, la huella de carbono de Ethereum por transacción ha disminuido en más del 99%.",
                "faq": [
                    {
                        "question": "¿Es Ethereum respetuoso con el medio ambiente?",
                        "answer": "Comparado con Bitcoin, sí. Una transacción consume ahora la misma energía que cargar un smartphone."
                    }
                ],
                "idleforest_pitch": "Proof of Stake is better, but planting trees is best.",
                "human_equivalent_comparison": "Charging 1 smartphone"
            },
            "de": {
                "intro": "Seit der Umstellung auf Proof of Stake ist der CO2-Fußabdruck von Ethereum pro Transaktion um über 99 % gesunken.",
                "faq": [
                    {
                        "question": "Ist Ethereum umweltfreundlich?",
                        "answer": "Im Vergleich zu Bitcoin ja. Eine Transaktion verbraucht jetzt etwa so viel Energie wie das einmalige Aufladen eines Smartphones."
                    }
                ],
                "idleforest_pitch": "Proof of Stake is better, but planting trees is best.",
                "human_equivalent_comparison": "Charging 1 smartphone"
            },
            "pt": {
                "intro": "Desde a mudança para Proof of Stake, a pegada de carbono do Ethereum por transação caiu mais de 99%.",
                "faq": [
                    {
                        "question": "O Ethereum é amigo do ambiente?",
                        "answer": "Comparado com o Bitcoin, sim. Uma transação utiliza agora a mesma energia que carregar um smartphone uma vez."
                    }
                ],
                "idleforest_pitch": "Proof of Stake is better, but planting trees is best.",
                "human_equivalent_comparison": "Charging 1 smartphone"
            },
            "fr": {
                "intro": "Depuis le passage au Proof of Stake, l'empreinte carbone d'Ethereum par transaction a chuté de plus de 99 %.",
                "faq": [
                    {
                        "question": "Ethereum est-il respectueux de l'environnement ?",
                        "answer": "Comparé au Bitcoin, oui. Une transaction utilise désormais autant d'énergie qu'une seule charge de smartphone."
                    }
                ],
                "idleforest_pitch": "Proof of Stake is better, but planting trees is best.",
                "human_equivalent_comparison": "Charging 1 smartphone"
            }
        }
    },
    {
        "app_name": "Google Meet",
        "category": "Work",
        "avg_usage_hours_day": "2.0",
        "co2_per_hour_grams": 45,
        "slug": "google-meet",
        "icon_slug": "googlemeet",
        "seo_content": {
            "en": {
                "intro": "Google Meet video calls rely on efficient Google infrastructure, but the combined energy use of meetings still adds up quickly. If you're comparing Google Meet with Zoom or estimating video meeting CO2, the biggest factors are call length, participant count, cameras on, and device choice.",
                "faq": [
                    {
                        "question": "Does Google Meet use a lot of data?",
                        "answer": "HD video calls use about 2-3GB of data per hour, which directly translates to network energy consumption."
                    }
                ],
                "idleforest_pitch": "Meeting adjourned. Trees planted.",
                "human_equivalent_comparison": "Driving 130km in a car"
            },
            "es": {
                "intro": "Las videollamadas de Google Meet se basan en los centros de datos eficientes de Google, pero la energía acumulada sigue siendo significativa.",
                "faq": [
                    {
                        "question": "¿Usa Google Meet muchos datos?",
                        "answer": "Las videollamadas en HD consumen unos 2-3 GB de datos por hora."
                    }
                ],
                "idleforest_pitch": "Reunión finalizada. Árboles plantados.",
                "human_equivalent_comparison": "Conducir 130 km en coche"
            },
            "de": {
                "intro": "Google Meet-Videoanrufe basieren auf den effizienten Rechenzentren von Google, dennoch bleibt die kumulierte Energie für globale Meetings erheblich.",
                "faq": [
                    {
                        "question": "Verbraucht Google Meet viele Daten?",
                        "answer": "HD-Videoanrufe verbrauchen etwa 2-3 GB Daten pro Stunde."
                    }
                ],
                "idleforest_pitch": "Meeting beendet. Bäume gepflanzt.",
                "human_equivalent_comparison": "130 km Autofahrt"
            },
            "pt": {
                "intro": "As videochamadas do Google Meet baseiam-se nos centros de dados eficientes da Google, mas a energia acumulada continua a ser significativa.",
                "faq": [
                    {
                        "question": "O Google Meet utiliza muitos dados?",
                        "answer": "As videochamadas HD utilizam cerca de 2-3GB de dados por hora."
                    }
                ],
                "idleforest_pitch": "Reunião terminada. Árvores plantadas.",
                "human_equivalent_comparison": "Conduzir 130 km de carro"
            },
            "fr": {
                "intro": "Les appels vidéo Google Meet reposent sur les centres de données efficaces de Google, mais l'énergie cumulée reste importante.",
                "faq": [
                    {
                        "question": "Google Meet consomme-t-il beaucoup de données ?",
                        "answer": "Les appels vidéo HD utilisent environ 2 à 3 Go de données par heure."
                    }
                ],
                "idleforest_pitch": "Réunion terminée. Arbres plantés.",
                "human_equivalent_comparison": "Conduire 130 km en voiture"
            }
        }
    },
    {
        "app_name": "Snapchat",
        "category": "Social",
        "avg_usage_hours_day": "0.5",
        "co2_per_hour_grams": 50,
        "slug": "snapchat",
        "seo_content": {
            "en": {
                "intro": "The constant transfer of image and video messages on Snapchat requires rapid server processing and mobile data usage.",
                "faq": [
                    {
                        "question": "What is the footprint of a Snap?",
                        "answer": "A single snap has a tiny footprint, but frequent use of AR filters and video stories increases energy consumption."
                    }
                ],
                "idleforest_pitch": "Snaps disappear. CO2 stays. Offset it.",
                "human_equivalent_comparison": "Driving 36km in a car"
            },
            "es": {
                "intro": "La transferencia constante de mensajes de imagen y video en Snapchat requiere un procesamiento rápido del servidor.",
                "faq": [
                    {
                        "question": "¿Cuál es la huella de un Snap?",
                        "answer": "Un solo snap tiene una huella pequeña, pero el uso frecuente de filtros aumenta el consumo."
                    }
                ],
                "idleforest_pitch": "Los snaps desaparecen. El CO2 se queda. Compénsalo.",
                "human_equivalent_comparison": "Conducir 36 km en coche"
            },
            "de": {
                "intro": "Die ständige Übertragung von Bild- und Videonachrichten auf Snapchat erfordert eine schnelle Serververarbeitung.",
                "faq": [
                    {
                        "question": "Wie groß ist der Fußabdruck eines Snaps?",
                        "answer": "Ein einzelner Snap hat einen winzigen Fußabdruck, aber die häufige Nutzung von Filtern erhöht den Verbrauch."
                    }
                ],
                "idleforest_pitch": "Snaps verschwinden. CO2 bleibt. Gleiche es aus.",
                "human_equivalent_comparison": "36 km Autofahrt"
            },
            "pt": {
                "intro": "A transferência constante de mensagens de imagem e vídeo no Snapchat exige um processamento rápido do servidor.",
                "faq": [
                    {
                        "question": "Qual é a pegada de um Snap?",
                        "answer": "Um único snap tem uma pegada pequena, mas o uso frequente de filtros aumenta o consumo."
                    }
                ],
                "idleforest_pitch": "Os snaps desaparecem. O CO2 fica. Compensa-o.",
                "human_equivalent_comparison": "Conduzir 36 km de carro"
            },
            "fr": {
                "intro": "Le transfert constant de messages images et vidéos sur Snapchat nécessite un traitement rapide sur les serveurs.",
                "faq": [
                    {
                        "question": "Quelle est l'empreinte d'un Snap ?",
                        "answer": "Un seul snap a une empreinte minuscule, mais l'utilisation fréquente de filtres augmente la consommation."
                    }
                ],
                "idleforest_pitch": "Les snaps disparaissent. Le CO2 reste. Compensez-le.",
                "human_equivalent_comparison": "Conduire 36 km en voiture"
            }
        }
    },
    {
        "app_name": "Reddit",
        "category": "Social",
        "avg_usage_hours_day": "1.0",
        "co2_per_hour_grams": 25,
        "slug": "reddit",
        "seo_content": {
            "en": {
                "intro": "Reddit timelines are relatively lean, but the hosting of millions of communities and media-heavy posts contributes to digital emissions.",
                "faq": [
                    {
                        "question": "Does Reddit use a lot of energy?",
                        "answer": "Compared to video platforms, Reddit is low-impact, generating about 25g of CO2 per hour."
                    }
                ],
                "idleforest_pitch": "Karma points for the planet.",
                "human_equivalent_comparison": "Driving 36km in a car"
            },
            "es": {
                "intro": "Las líneas de tiempo de Reddit son relativamente ligeras, pero el alojamiento de millones de comunidades contribuye a las emisiones digitales.",
                "faq": [
                    {
                        "question": "¿Consume Reddit mucha energía?",
                        "answer": "Comparado con las plataformas de video, Reddit tiene un bajo impacto."
                    }
                ],
                "idleforest_pitch": "Puntos de karma para el planeta.",
                "human_equivalent_comparison": "Conducir 36 km en coche"
            },
            "de": {
                "intro": "Reddit-Timelines sind relativ schlank, aber das Hosting von Millionen von Communities trägt zu den digitalen Emissionen bei.",
                "faq": [
                    {
                        "question": "Verbraucht Reddit viel Energie?",
                        "answer": "Im Vergleich zu Videoplattformen ist Reddit belastungsarm."
                    }
                ],
                "idleforest_pitch": "Karma-Punkte für den Planeten.",
                "human_equivalent_comparison": "36 km Autofahrt"
            },
            "pt": {
                "intro": "As linhas de tempo do Reddit são relativamente leves, mas o alojamento de milhões de comunidades contribui para as emissões digitais.",
                "faq": [
                    {
                        "question": "O Reddit consome muita energia?",
                        "answer": "Comparado com plataformas de vídeo, o Reddit tem baixo impacto."
                    }
                ],
                "idleforest_pitch": "Pontos de karma para o planeta.",
                "human_equivalent_comparison": "Conduzir 36 km de carro"
            },
            "fr": {
                "intro": "Les fils d'actualité de Reddit sont relativement sobres, mais l'hébergement de millions de communautés contribue aux émissions numériques.",
                "faq": [
                    {
                        "question": "Reddit consomme-t-il beaucoup d'énergie ?",
                        "answer": "Comparé aux plateformes vidéo, Reddit a un faible impact."
                    }
                ],
                "idleforest_pitch": "Points de karma pour la planète.",
                "human_equivalent_comparison": "Conduire 36 km en voiture"
            }
        }
    }
];

export const CARBON_SEED_DATA = enrichCarbonSeedData(BASE_CARBON_SEED_DATA);
