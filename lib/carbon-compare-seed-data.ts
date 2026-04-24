function buildSeedComparisonSlug(slugA: string, slugB: string): string {
    return [slugA, slugB].sort((left, right) => left.localeCompare(right)).join("-vs-");
}

export interface CarbonCompareLocaleContent {
    heading: string;
    summary: string;
    whyItDiffers: string[];
    actionAngle: string;
}

export interface CarbonCompareSeedEntry {
    slug: string;
    content: Record<string, CarbonCompareLocaleContent>;
}

export const CARBON_COMPARE_SEED_DATA: CarbonCompareSeedEntry[] = [
    {
        slug: buildSeedComparisonSlug("netflix", "youtube"),
        content: {
            en: {
                heading: "Streaming benchmark comparison",
                summary: "Netflix and YouTube sit in a similar consumer-video category, but their footprints can diverge depending on autoplay patterns, session length, and the device doing the playback.",
                whyItDiffers: [
                    "Netflix is usually used in longer, deliberate viewing sessions.",
                    "YouTube often spreads across short clips, autoplay chains, and device switching.",
                    "Both depend heavily on the screen and playback hardware rather than only the platform."
                ],
                actionAngle: "If you are trying to reduce this category first, focus on watch quality, autoplay, and the biggest screen in the room."
            },
            es: {
                heading: "Comparación de referencia de streaming",
                summary: "Netflix y YouTube pertenecen a una categoría similar de vídeo de consumo, pero sus huellas pueden divergir según el autoplay, la duración de la sesión y el dispositivo de reproducción.",
                whyItDiffers: [
                    "Netflix suele usarse en sesiones largas y más deliberadas.",
                    "YouTube se reparte más entre clips cortos, cadenas de autoplay y cambios de dispositivo.",
                    "En ambos casos pesa mucho la pantalla y el hardware de reproducción, no solo la plataforma."
                ],
                actionAngle: "Si quieres reducir primero esta categoría, céntrate en la calidad de reproducción, el autoplay y la pantalla más grande de la habitación."
            },
            de: {
                heading: "Streaming-Referenzvergleich",
                summary: "Netflix und YouTube liegen in einer ähnlichen Video-Kategorie, aber ihre Fußabdrücke können sich je nach Autoplay, Sitzungsdauer und Wiedergabegerät unterscheiden.",
                whyItDiffers: [
                    "Netflix wird meist in längeren, bewussten Sessions genutzt.",
                    "YouTube verteilt sich häufiger auf kurze Clips, Autoplay-Ketten und Gerätewechsel.",
                    "Bei beiden zählt der Bildschirm und die Wiedergabehardware stark, nicht nur die Plattform."
                ],
                actionAngle: "Wenn du diese Kategorie zuerst senken willst, konzentriere dich auf Bildqualität, Autoplay und den größten Bildschirm im Raum."
            },
            pt: {
                heading: "Comparação de referência de streaming",
                summary: "Netflix e YouTube pertencem a uma categoria semelhante de vídeo para consumidores, mas as respetivas pegadas podem divergir consoante o autoplay, a duração da sessão e o dispositivo de reprodução.",
                whyItDiffers: [
                    "A Netflix costuma ser usada em sessões mais longas e deliberadas.",
                    "O YouTube espalha-se mais por clips curtos, cadeias de autoplay e mudança de dispositivos.",
                    "Ambos dependem bastante do ecrã e do hardware de reprodução, e não apenas da plataforma."
                ],
                actionAngle: "Se queres reduzir primeiro esta categoria, foca-te na qualidade de visualização, no autoplay e no maior ecrã da divisão."
            },
            fr: {
                heading: "Comparaison de référence du streaming",
                summary: "Netflix et YouTube appartiennent à une catégorie proche de vidéo grand public, mais leurs empreintes peuvent diverger selon l'autoplay, la durée de session et l'appareil de lecture.",
                whyItDiffers: [
                    "Netflix est généralement utilisé lors de sessions plus longues et plus intentionnelles.",
                    "YouTube se répartit davantage entre clips courts, chaînes d'autoplay et changements d'appareil.",
                    "Dans les deux cas, l'écran et le matériel de lecture pèsent fortement, pas seulement la plateforme."
                ],
                actionAngle: "Si vous voulez réduire d'abord cette catégorie, concentrez-vous sur la qualité de lecture, l'autoplay et le plus grand écran de la pièce."
            }
        }
    },
    {
        slug: buildSeedComparisonSlug("youtube", "tiktok"),
        content: {
            en: {
                heading: "Short-form versus broader video consumption",
                summary: "This comparison is useful because both platforms encourage extended viewing loops, but the session pattern and media density often differ.",
                whyItDiffers: [
                    "Short-form feeds can extend use time through recommendation loops.",
                    "YouTube spans both long-form and short-form behavior, which changes the average energy pattern.",
                    "Playback device remains a major swing factor in both cases."
                ],
                actionAngle: "Reducing accidental watch time often matters more than shaving a few minutes off an intentional session."
            },
            es: {
                heading: "Vídeo corto frente a consumo de vídeo más amplio",
                summary: "Esta comparación es útil porque ambas plataformas fomentan bucles de visualización largos, aunque el patrón de sesión y la densidad de medios suelen cambiar.",
                whyItDiffers: [
                    "Los feeds de vídeo corto pueden alargar el uso mediante bucles de recomendación.",
                    "YouTube combina comportamiento de vídeo largo y corto, lo que cambia el patrón energético medio.",
                    "El dispositivo de reproducción sigue siendo un factor de gran peso en ambos casos."
                ],
                actionAngle: "Reducir el tiempo de visionado accidental suele importar más que recortar unos minutos de una sesión intencional."
            },
            de: {
                heading: "Kurzvideo versus breiterer Videokonsum",
                summary: "Dieser Vergleich ist nützlich, weil beide Plattformen längere Sehschleifen fördern, sich Sitzungsmuster und Mediendichte aber oft unterscheiden.",
                whyItDiffers: [
                    "Kurzvideo-Feeds können die Nutzung über Empfehlungsschleifen verlängern.",
                    "YouTube umfasst sowohl Lang- als auch Kurzformat, was das durchschnittliche Energiemuster verändert.",
                    "Das Wiedergabegerät bleibt in beiden Fällen ein wichtiger Hebel."
                ],
                actionAngle: "Versehentliche Sehzeit zu reduzieren bringt oft mehr als bei einer bewussten Session nur ein paar Minuten zu sparen."
            },
            pt: {
                heading: "Vídeo curto versus consumo de vídeo mais amplo",
                summary: "Esta comparação é útil porque ambas as plataformas incentivam ciclos prolongados de visualização, mas o padrão de sessão e a densidade de media costumam diferir.",
                whyItDiffers: [
                    "Feeds de vídeo curto podem prolongar o uso através de ciclos de recomendação.",
                    "O YouTube mistura comportamento de vídeo longo e curto, o que altera o padrão energético médio.",
                    "O dispositivo de reprodução continua a ser um fator importante nos dois casos."
                ],
                actionAngle: "Reduzir tempo de visualização acidental costuma valer mais do que cortar apenas alguns minutos de uma sessão intencional."
            },
            fr: {
                heading: "Vidéo courte contre consommation vidéo plus large",
                summary: "Cette comparaison est utile parce que les deux plateformes encouragent des boucles de visionnage prolongées, mais le modèle de session et la densité média diffèrent souvent.",
                whyItDiffers: [
                    "Les feeds de vidéo courte peuvent allonger l'usage via les boucles de recommandation.",
                    "YouTube couvre à la fois les usages longs et courts, ce qui change le profil énergétique moyen.",
                    "L'appareil de lecture reste un facteur déterminant dans les deux cas."
                ],
                actionAngle: "Réduire le temps de visionnage accidentel compte souvent davantage que gagner quelques minutes sur une session voulue."
            }
        }
    },
    {
        slug: buildSeedComparisonSlug("instagram", "tiktok"),
        content: {
            en: {
                heading: "Video-heavy social comparison",
                summary: "This comparison captures the line between general social browsing and social feeds dominated by video delivery.",
                whyItDiffers: [
                    "The more a feed leans toward autoplay video, the closer it behaves to streaming.",
                    "Session frequency can matter as much as session length in social products.",
                    "Brightness, screen size, and device type still influence the result on the user side."
                ],
                actionAngle: "If social is a major habit, the first lever is almost always autoplay and total time-on-feed."
            },
            es: {
                heading: "Comparación social con mucho vídeo",
                summary: "Esta comparación refleja la diferencia entre la navegación social general y los feeds dominados por el vídeo.",
                whyItDiffers: [
                    "Cuanto más se incline un feed hacia el autoplay de vídeo, más se comporta como streaming.",
                    "En productos sociales, la frecuencia de sesión puede importar tanto como la duración.",
                    "Brillo, tamaño de pantalla y tipo de dispositivo siguen influyendo del lado del usuario."
                ],
                actionAngle: "Si social es un hábito importante, la primera palanca casi siempre es el autoplay y el tiempo total en el feed."
            },
            de: {
                heading: "Video-lastiger Social-Vergleich",
                summary: "Dieser Vergleich zeigt die Grenze zwischen allgemeinem Social Browsing und Feeds, die stark von Videoausspielung geprägt sind.",
                whyItDiffers: [
                    "Je stärker ein Feed auf Autoplay-Video setzt, desto ähnlicher verhält er sich zu Streaming.",
                    "Bei Social-Produkten kann die Häufigkeit von Sessions genauso wichtig sein wie deren Dauer.",
                    "Helligkeit, Bildschirmgröße und Gerätetyp beeinflussen das Ergebnis auf Nutzerseite weiterhin."
                ],
                actionAngle: "Wenn Social ein großer Gewohnheitsblock ist, sind Autoplay und gesamte Feed-Zeit fast immer der erste Hebel."
            },
            pt: {
                heading: "Comparação social com forte peso de vídeo",
                summary: "Esta comparação mostra a fronteira entre navegação social geral e feeds dominados por entrega de vídeo.",
                whyItDiffers: [
                    "Quanto mais um feed depende de autoplay de vídeo, mais se aproxima do streaming.",
                    "Em produtos sociais, a frequência das sessões pode importar tanto como a duração.",
                    "Brilho, tamanho do ecrã e tipo de dispositivo continuam a influenciar o resultado do lado do utilizador."
                ],
                actionAngle: "Se as redes sociais são um hábito importante, a primeira alavanca é quase sempre o autoplay e o tempo total no feed."
            },
            fr: {
                heading: "Comparaison sociale très orientée vidéo",
                summary: "Cette comparaison trace la frontière entre la navigation sociale générale et les feeds dominés par la diffusion vidéo.",
                whyItDiffers: [
                    "Plus un feed penche vers l'autoplay vidéo, plus il se comporte comme du streaming.",
                    "Sur les produits sociaux, la fréquence des sessions peut compter autant que leur durée.",
                    "La luminosité, la taille d'écran et le type d'appareil influencent toujours le résultat côté utilisateur."
                ],
                actionAngle: "Si le social est une habitude majeure, le premier levier reste presque toujours l'autoplay et le temps total passé dans le feed."
            }
        }
    },
    {
        slug: buildSeedComparisonSlug("zoom", "google-meet"),
        content: {
            en: {
                heading: "Video meeting comparison",
                summary: "The main difference between these tools is usually not the brand itself but how people use the meeting stack: camera time, participant count, and screen sharing.",
                whyItDiffers: [
                    "Video on versus off changes the network and device burden quickly.",
                    "Meeting duration and number of participants dominate small platform-level differences.",
                    "Background multitasking can quietly raise the device-side load."
                ],
                actionAngle: "For work tools, the strongest reduction tactic is almost always turning unnecessary video off and shortening low-value meetings."
            },
            es: {
                heading: "Comparación de videollamadas",
                summary: "La principal diferencia entre estas herramientas no suele ser la marca, sino cómo se usa la pila de reuniones: tiempo de cámara, número de participantes y compartir pantalla.",
                whyItDiffers: [
                    "Tener la cámara activada o no cambia rápido la carga de red y dispositivo.",
                    "La duración de la reunión y el número de participantes pesan más que pequeñas diferencias de plataforma.",
                    "El multitarea en segundo plano puede elevar silenciosamente la carga del dispositivo."
                ],
                actionAngle: "En herramientas de trabajo, la táctica de reducción más fuerte casi siempre es apagar el vídeo cuando no haga falta y acortar reuniones de poco valor."
            },
            de: {
                heading: "Videomeeting-Vergleich",
                summary: "Der Hauptunterschied zwischen diesen Tools liegt meist nicht in der Marke, sondern in der Nutzung des Meeting-Stacks: Kamerazeit, Teilnehmerzahl und Bildschirmfreigabe.",
                whyItDiffers: [
                    "Video an oder aus verändert Netzwerk- und Gerätebelastung sehr schnell.",
                    "Meetingdauer und Teilnehmerzahl überwiegen kleine Plattformunterschiede.",
                    "Multitasking im Hintergrund kann die Gerätebelastung unauffällig erhöhen."
                ],
                actionAngle: "Bei Arbeitstools ist die stärkste Reduktionsmaßnahme fast immer, unnötiges Video auszuschalten und Meetings mit wenig Wert zu verkürzen."
            },
            pt: {
                heading: "Comparação de reuniões por vídeo",
                summary: "A principal diferença entre estas ferramentas raramente é a marca em si, mas sim a forma como as pessoas usam a pilha de reuniões: tempo de câmara, número de participantes e partilha de ecrã.",
                whyItDiffers: [
                    "Vídeo ligado ou desligado altera rapidamente a carga de rede e do dispositivo.",
                    "A duração da reunião e o número de participantes pesam mais do que pequenas diferenças de plataforma.",
                    "Multitasking em segundo plano pode aumentar discretamente a carga do dispositivo."
                ],
                actionAngle: "Em ferramentas de trabalho, a tática de redução mais forte é quase sempre desligar vídeo desnecessário e encurtar reuniões de baixo valor."
            },
            fr: {
                heading: "Comparaison d'outils de réunion vidéo",
                summary: "La principale différence entre ces outils n'est généralement pas la marque elle-même, mais la manière d'utiliser la pile de réunion: temps de caméra, nombre de participants et partage d'écran.",
                whyItDiffers: [
                    "Vidéo activée ou non change rapidement la charge réseau et appareil.",
                    "La durée de réunion et le nombre de participants dominent les petites différences de plateforme.",
                    "Le multitâche en arrière-plan peut augmenter discrètement la charge côté appareil."
                ],
                actionAngle: "Pour les outils de travail, la tactique de réduction la plus forte consiste presque toujours à couper la vidéo inutile et à raccourcir les réunions de faible valeur."
            }
        }
    },
    {
        slug: buildSeedComparisonSlug("bitcoin", "ethereum"),
        content: {
            en: {
                heading: "Consensus design comparison",
                summary: "This comparison matters because Bitcoin and Ethereum represent very different network energy profiles, especially after Ethereum's move away from proof-of-work.",
                whyItDiffers: [
                    "Consensus design affects the total network energy requirement.",
                    "Transaction attribution is still debated, so use the result directionally.",
                    "This is a systems comparison more than a device-use comparison."
                ],
                actionAngle: "If crypto is part of the footprint you are trying to cut, network choice matters more here than typical browser or app optimizations."
            },
            es: {
                heading: "Comparación de diseño de consenso",
                summary: "Esta comparación importa porque Bitcoin y Ethereum representan perfiles energéticos de red muy distintos, especialmente tras el abandono del proof-of-work por parte de Ethereum.",
                whyItDiffers: [
                    "El diseño del consenso afecta a la demanda energética total de la red.",
                    "La atribución por transacción sigue siendo debatida, así que conviene usar el resultado como orientación.",
                    "Es una comparación de sistemas más que una comparación de uso de dispositivo."
                ],
                actionAngle: "Si el cripto forma parte de la huella que quieres reducir, aquí importa más la elección de red que las optimizaciones típicas de navegador o app."
            },
            de: {
                heading: "Vergleich des Konsensdesigns",
                summary: "Dieser Vergleich ist wichtig, weil Bitcoin und Ethereum sehr unterschiedliche Energieprofile auf Netzebene haben, besonders seit Ethereums Abkehr von Proof-of-Work.",
                whyItDiffers: [
                    "Das Konsensdesign beeinflusst den gesamten Energiebedarf des Netzwerks.",
                    "Die Zuordnung pro Transaktion ist weiter umstritten, daher sollte das Ergebnis nur richtungsweisend gelesen werden.",
                    "Es ist eher ein Systemvergleich als ein Vergleich der Gerätenutzung."
                ],
                actionAngle: "Wenn Krypto Teil des Fußabdrucks ist, den du senken willst, zählt hier die Netzwerkwahl mehr als typische Browser- oder App-Optimierungen."
            },
            pt: {
                heading: "Comparação do desenho de consenso",
                summary: "Esta comparação importa porque Bitcoin e Ethereum representam perfis energéticos de rede muito diferentes, sobretudo depois de o Ethereum ter abandonado o proof-of-work.",
                whyItDiffers: [
                    "O desenho do consenso afeta a procura energética total da rede.",
                    "A atribuição por transação continua a ser debatida, por isso o resultado deve ser lido de forma direcional.",
                    "É uma comparação de sistemas mais do que uma comparação de uso do dispositivo."
                ],
                actionAngle: "Se o cripto faz parte da pegada que queres reduzir, a escolha da rede importa aqui mais do que otimizações típicas de browser ou app."
            },
            fr: {
                heading: "Comparaison du design de consensus",
                summary: "Cette comparaison compte parce que Bitcoin et Ethereum représentent des profils énergétiques réseau très différents, surtout depuis l'abandon du proof-of-work par Ethereum.",
                whyItDiffers: [
                    "Le design du consensus affecte la demande énergétique totale du réseau.",
                    "L'attribution par transaction reste débattue, il faut donc lire le résultat comme un ordre de grandeur.",
                    "C'est davantage une comparaison de systèmes qu'une comparaison d'usage d'appareil."
                ],
                actionAngle: "Si la crypto fait partie de l'empreinte que vous cherchez à réduire, le choix du réseau compte ici davantage que les optimisations classiques de navigateur ou d'app."
            }
        }
    },
    {
        slug: buildSeedComparisonSlug("fortnite", "league-of-legends"),
        content: {
            en: {
                heading: "Gaming hardware comparison",
                summary: "This is a useful compare page because the biggest driver is usually not the logo on the screen but how demanding the play session is on the hardware.",
                whyItDiffers: [
                    "Render intensity, frame rate, and hardware class change the device-side load.",
                    "Online infrastructure adds a layer beyond the console or PC itself.",
                    "Long active sessions are where the gap becomes meaningful."
                ],
                actionAngle: "If you are reducing gaming emissions, power draw and session length are usually the first two levers."
            },
            es: {
                heading: "Comparación de hardware gaming",
                summary: "Esta es una comparación útil porque el mayor factor no suele ser el logo en pantalla, sino lo exigente que resulta la sesión para el hardware.",
                whyItDiffers: [
                    "La intensidad de renderizado, la tasa de FPS y el tipo de hardware cambian la carga del dispositivo.",
                    "La infraestructura online añade una capa más allá de la propia consola o PC.",
                    "Las sesiones largas y activas son donde la diferencia se vuelve relevante."
                ],
                actionAngle: "Si quieres reducir emisiones del gaming, consumo eléctrico y duración de la sesión suelen ser las dos primeras palancas."
            },
            de: {
                heading: "Gaming-Hardware-Vergleich",
                summary: "Diese Vergleichsseite ist nützlich, weil der größte Treiber meist nicht das Logo auf dem Bildschirm ist, sondern wie anspruchsvoll die Session für die Hardware ist.",
                whyItDiffers: [
                    "Renderintensität, Bildrate und Hardwareklasse verändern die Gerätebelastung.",
                    "Online-Infrastruktur fügt eine zusätzliche Ebene jenseits von Konsole oder PC hinzu.",
                    "Bei langen aktiven Sessions wird die Lücke wirklich relevant."
                ],
                actionAngle: "Wenn du Gaming-Emissionen senken willst, sind Stromverbrauch und Sitzungsdauer meist die ersten beiden Hebel."
            },
            pt: {
                heading: "Comparação de hardware gaming",
                summary: "Esta é uma comparação útil porque o principal fator normalmente não é o logótipo no ecrã, mas sim o quão exigente a sessão é para o hardware.",
                whyItDiffers: [
                    "Intensidade de renderização, frame rate e classe de hardware mudam a carga do dispositivo.",
                    "A infraestrutura online acrescenta uma camada para lá da consola ou do PC.",
                    "É em sessões longas e ativas que a diferença se torna mais relevante."
                ],
                actionAngle: "Se estás a reduzir emissões do gaming, consumo elétrico e duração da sessão costumam ser as duas primeiras alavancas."
            },
            fr: {
                heading: "Comparaison de matériel gaming",
                summary: "Cette page de comparaison est utile car le principal facteur n'est généralement pas le logo à l'écran mais l'exigence de la session sur le matériel.",
                whyItDiffers: [
                    "L'intensité de rendu, la fréquence d'image et la classe de matériel changent la charge côté appareil.",
                    "L'infrastructure en ligne ajoute une couche au-delà de la console ou du PC.",
                    "Les longues sessions actives sont celles où l'écart devient significatif."
                ],
                actionAngle: "Si vous cherchez à réduire les émissions du gaming, la consommation électrique et la durée de session sont généralement les deux premiers leviers."
            }
        }
    }
];
