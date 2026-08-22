(() => {
  const projects = {
    "dirde-ue-linux": {
      game: "Dead Island: Riptide DE",
      title: "DIRDE UE Linux 0.1.0",
      description: "Native Linux port of the Ultimate Edition Mod Menu.",
      image: "../assets/dirde-ue-linux-card.png",
      heroImage: "../assets/dirde-ue-linux-header.png",
      overview: "A native Linux port of FireEyeEian’s original mod menu, with released gameplay options, safe Data0 patching, and restore support.",
      nexus: "https://www.nexusmods.com/deadislandriptide/mods/31",
      originalNexus: "https://www.nexusmods.com/deadislandriptide/mods/3",
      github: "https://github.com/Kamui2040/DeadIsland-Riptide-Ultimate-edition-mod-menu/releases/tag/v0.1.0-dev0",
      changelog: [
        "0.1.0.dev0 — First public pre-release of the native Linux port of FireEyeEian’s Dead Island Riptide Ultimate Edition mod menu."
      ],
      features: [
        "Movement: reduced sprint and jump stamina, running with weapons, and better movement.",
        "Combat: bullet penetration and instant door breaking.",
        "Loot: improved loot, more ammo, deeper pockets, and increased durability.",
        "Comfort: 90% less sunflare, removed reverb and echo, and skipped intro videos.",
        "Vehicles: vehicle NoClip.",
        "Camera and firearms: 72/82 FOV options, improved weapon upgrades, and aiming adjustments.",
        "Zombies: One Hit, Hard, and Headshot Only difficulties, plus five zombie sizes.",
        "Forced spawns: Butchers, Rams, Bloaters, Thugs, Suiciders, and armed or melee bandits.",
        "Weather and time: night, rain, storms, and darker-night variants.",
        "Safe native Linux Data0 patching with backup and exact restore support, plus Flatpak and AppImage packages for x86-64 Linux."
      ],
      screenshots: [
        {
          src: "../assets/dirde-ue-linux-main-window.png",
          alt: "DIRDE UE Linux main application window showing the gameplay configuration options",
          caption: "Main application window"
        },
        {
          src: "../assets/dirde-ue-linux-about.png",
          alt: "DIRDE UE Linux About dialog with project and attribution details",
          caption: "About and attribution"
        }
      ]
    },
    "eco-aio": {
      game: "Fallout 4",
      title: "ECO Quick Menu Additions AiO",
      description: "All-in-one installer for K2040 ECO Quick Menu compatibility patches.",
      overview: "A single installer for the released ECO Quick Menu compatibility patch collection.",
      image: "../assets/fallout-4-eco-quick-menu-aio.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105461",
      features: [
        "Adds quick-menu compatibility support for supported Fallout 4 weapon mods through one all-in-one installer.",
        "FOMOD installer detects supported active weapons in the load order.",
        "All patches are ESL-flagged ESP files.",
        "Removes unnecessary edits and reorganizes menus for a more consistent workflow.",
        "Includes conditions for attachment-dependent options to reduce invalid menu choices.",
        "Shows a notification after the quick-menu injection completes successfully."
      ],
      changelog: [
        "1.0.1.11 — Added AER15 support and its MEC-R7 variant; split DKS-501 and AER15 variants into separate groups.",
        "1.0.0.9 — Added a patch for the H&K 45C Mk24.",
        "1.0.0.8 — Added patches for AQUILA and the X12 Plasmacaster.",
        "1.0.0.6 — Added patches for DKS-501 Redux and ACR-W17.",
        "1.0.0.4 — Initial release with patches for the HK USP, DKS-501, .357 Cattleman Revolver, and MW19 FAL."
      ]
    },
    "eco-single": {
      game: "Fallout 4",
      title: "ECO Quick Menu Single Patches",
      description: "Individual optional quick-menu compatibility patches for supported weapon mods.",
      overview: "Choose individual optional compatibility patches for supported Fallout 4 weapon mods.",
      image: "../assets/fallout-4-eco-quick-menu-single-patches.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105464",
      features: [
        "Provides individual optional patches that add weapon-specific quick-menu support.",
        "All patches are ESL-flagged ESP files.",
        "Lets players install only the patches for the weapons they use.",
        "Uses streamlined edits and reorganized menus for a more consistent workflow.",
        "Includes conditions for attachment-dependent options to reduce invalid menu choices.",
        "Shows a notification after the quick-menu injection completes successfully."
      ],
      changelog: [
        "31 May 2026 — AER15 compatibility patch uploaded.",
        "29 May 2026 — MEC-R7 compatibility patch uploaded.",
        "29 May 2026 — HK 45C Mk24 compatibility patch uploaded.",
        "29 May 2026 — X12 Plasmacaster compatibility patch uploaded.",
        "29 May 2026 — Aquila compatibility patch uploaded.",
        "29 May 2026 — DKS-501 Redux compatibility patch uploaded.",
        "29 May 2026 — ACR-W17 compatibility patch uploaded.",
        "28 May 2026 — DKS-501 Unofficial Update Vanilla compatibility patch uploaded.",
        "28 May 2026 — DKS-501 compatibility patch uploaded.",
        "28 May 2026 — .357 Cattleman Revolver compatibility patch uploaded.",
        "28 May 2026 — MW19 FAL compatibility patch uploaded.",
        "28 May 2026 — HK USP compatibility patch uploaded."
      ]
    },
    "eco-quick-menu-additions": {
      game: "Fallout 4",
      title: "ECO Quick Menu Additions",
      description: "Choose the all-in-one installer or individual optional compatibility patches.",
      overview: "A single home for K2040’s released ECO Quick Menu compatibility work. Choose the AiO installer for the complete collection, or install only the individual patches you need.",
      heroImage: "../assets/eco-quick-menu-additions-header.png",
      wideHero: true,
      features: [
        "Adds quick-menu compatibility support for supported Fallout 4 weapon mods.",
        "All released patches are ESL-flagged ESP files.",
        "Uses streamlined edits and reorganized menus for a more consistent workflow.",
        "Includes conditions for attachment-dependent options to reduce invalid menu choices.",
        "Shows a notification after the quick-menu injection completes successfully."
      ],
      variants: [
        {
          id: "aio",
          title: "AiO installer",
          description: "Install the complete released compatibility-patch collection through one FOMOD installer.",
          nexus: "https://www.nexusmods.com/fallout4/mods/105461",
          changelog: [
            "1.0.1.11 — Added AER15 support and its MEC-R7 variant; split DKS-501 and AER15 variants into separate groups.",
            "1.0.0.9 — Added a patch for the H&K 45C Mk24.",
            "1.0.0.8 — Added patches for AQUILA and the X12 Plasmacaster.",
            "1.0.0.6 — Added patches for DKS-501 Redux and ACR-W17.",
            "1.0.0.4 — Initial release with patches for the HK USP, DKS-501, .357 Cattleman Revolver, and MW19 FAL."
          ]
        },
        {
          id: "single-patches",
          title: "Single patches",
          description: "Install only the individual optional patches for the weapon mods you use.",
          nexus: "https://www.nexusmods.com/fallout4/mods/105464",
          changelog: [
            "31 May 2026 — AER15 compatibility patch uploaded.",
            "29 May 2026 — MEC-R7 compatibility patch uploaded.",
            "29 May 2026 — HK 45C Mk24 compatibility patch uploaded.",
            "29 May 2026 — X12 Plasmacaster compatibility patch uploaded.",
            "29 May 2026 — Aquila compatibility patch uploaded.",
            "29 May 2026 — DKS-501 Redux compatibility patch uploaded.",
            "28 May 2026 — DKS-501 Unofficial Update Vanilla, DKS-501, .357 Cattleman Revolver, MW19 FAL, and HK USP compatibility patches uploaded."
          ]
        }
      ]
    },
    "xedit-json-exporter": {
      game: "Fallout 4",
      title: "xEdit JSON Exporter",
      description: "Export Fallout 4 plugin data from xEdit to structured JSON.",
      overview: "A generic xEdit/FO4Edit script that exports selected records or complete plugin trees to readable JSON.",
      image: "../assets/fallout-4-xedit-json-exporter-card.png",
      heroImage: "../assets/fallout-4-xedit-json-exporter-header.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105775",
      features: [
        "Exports a complete plugin or selected records from xEdit to structured JSON.",
        "Read-only processing for ESP, ESL, and ESM files.",
        "Preserves the hierarchy shown in xEdit, including records, fields, subrecords, arrays, and nested elements.",
        "Creates filenames with exported record signatures when exporting selected records.",
        "Adds a summary of record types and counts for use by people and external tooling.",
        "Automatically names the output from the plugin and selected records when no filename is supplied."
      ],
      changelog: [
        "1.5 — Fixed full-plugin automatic naming so ESP, ESL, and ESM exports do not append every exported signature.",
        "1.4 — First public version."
      ]
    }
  };
  const projectTranslations = {
    de: {
      "dirde-ue-linux": {
        description: "Native Linux Port des Ultimate Edition Mod Menu.",
        overview: "Ein nativer Linux Port des ursprünglichen Mod Menu von FireEyeEian – mit veröffentlichten Gameplay-Optionen, sicherem Data0-Patching und Wiederherstellung.",
        features: [
          "Bewegung: weniger Ausdauerverbrauch beim Sprinten und Springen, Laufen mit Waffen und verbesserte Bewegung.",
          "Kampf: Geschosse durchdringen Ziele und Türen lassen sich sofort aufbrechen.",
          "Loot: bessere Beute, mehr Munition, größeres Inventar und höhere Haltbarkeit.",
          "Komfort: 90 % weniger Sonnenblendung, kein Hall oder Echo und übersprungene Intro-Videos.",
          "Fahrzeuge: NoClip für Fahrzeuge.",
          "Kamera und Schusswaffen: FOV-Optionen mit 72/82, bessere Waffen-Upgrades und Anpassungen beim Zielen.",
          "Zombies: One Hit, Hard und Headshot Only sowie fünf Zombiegrößen.",
          "Erzwungene Spawns: Butchers, Rams, Bloaters, Thugs, Suiciders sowie bewaffnete Banditen und Nahkämpfer.",
          "Wetter und Zeit: Nacht, Regen, Stürme und besonders dunkle Nächte.",
          "Sicheres natives Data0-Patching unter Linux mit Backup und exakter Wiederherstellung sowie Flatpak- und AppImage-Paketen für x86-64 Linux."
        ],
        changelog: ["0.1.0.dev0 — Erste öffentliche Vorabversion des nativen Linux Ports von FireEyeEians Dead Island Riptide Ultimate Edition Mod Menu."],
        screenshots: [
          { caption: "Hauptfenster", alt: "Hauptfenster von DIRDE UE Linux mit den Gameplay-Einstellungen" },
          { caption: "Info und Mitwirkende", alt: "Info-Dialog von DIRDE UE Linux mit Projekt- und Urheberangaben" }
        ]
      },
      "eco-quick-menu-additions": {
        description: "Wähle den AiO-Installer oder einzelne optionale Kompatibilitätspatches.",
        overview: "Die zentrale Seite für K2040s veröffentlichte ECO Quick Menu Patches. Nutze den AiO-Installer für die komplette Sammlung oder installiere nur die Einzelpatches, die du brauchst.",
        features: ["Erweitert unterstützte Fallout 4 Waffenmods um Quick-Menu-Kompatibilität.", "Alle veröffentlichten Patches sind ESL-gekennzeichnete ESP-Dateien.", "Schlankere Änderungen und neu geordnete Menüs sorgen für einen einheitlicheren Ablauf.", "Bedingungen für aufsatzabhängige Optionen vermeiden ungültige Menüeinträge.", "Nach erfolgreicher Quick-Menu-Einbindung erscheint eine Bestätigung."],
        variants: [
          { title: "AiO-Installer", description: "Installiere die komplette veröffentlichte Patch-Sammlung mit einem einzigen FOMOD-Installer.", changelog: ["1.0.1.11 — Unterstützung für AER15 und die MEC-R7-Variante hinzugefügt; DKS-501- und AER15-Varianten in getrennte Gruppen aufgeteilt.", "1.0.0.9 — Patch für H&K 45C Mk24 hinzugefügt.", "1.0.0.8 — Patches für AQUILA und X12 Plasmacaster hinzugefügt.", "1.0.0.6 — Patches für DKS-501 Redux und ACR-W17 hinzugefügt.", "1.0.0.4 — Erster Release mit Patches für HK USP, DKS-501, .357 Cattleman Revolver und MW19 FAL."] },
          { title: "Einzelpatches", description: "Installiere nur die optionalen Patches für die Waffenmods, die du verwendest.", changelog: ["31. Mai 2026 — Kompatibilitätspatch für AER15 hochgeladen.", "29. Mai 2026 — Kompatibilitätspatch für MEC-R7 hochgeladen.", "29. Mai 2026 — Kompatibilitätspatch für HK 45C Mk24 hochgeladen.", "29. Mai 2026 — Kompatibilitätspatch für X12 Plasmacaster hochgeladen.", "29. Mai 2026 — Kompatibilitätspatch für Aquila hochgeladen.", "29. Mai 2026 — Kompatibilitätspatch für DKS-501 Redux hochgeladen.", "28. Mai 2026 — Kompatibilitätspatches für DKS-501 Unofficial Update Vanilla, DKS-501, .357 Cattleman Revolver, MW19 FAL und HK USP hochgeladen."] }
        ]
      },
      "xedit-json-exporter": {
        description: "Exportiert Fallout 4 Plugin-Daten aus xEdit in strukturiertes JSON.",
        overview: "Ein allgemeines xEdit-/FO4Edit-Skript, das ausgewählte Records oder vollständige Plugin-Strukturen in gut lesbares JSON exportiert.",
        features: ["Exportiert ein vollständiges Plugin oder ausgewählte Records aus xEdit in strukturiertes JSON.", "Liest ESP-, ESL- und ESM-Dateien ohne sie zu verändern.", "Behält die in xEdit sichtbare Struktur mit Records, Feldern, Subrecords, Arrays und verschachtelten Elementen bei.", "Ergänzt Dateinamen beim Export ausgewählter Records um deren Signaturen.", "Erstellt eine Übersicht der Record-Typen und Mengen für Menschen und externe Tools.", "Erzeugt automatisch einen Dateinamen aus Plugin und Auswahl, wenn keiner angegeben wurde."],
        changelog: ["1.5 — Automatische Benennung kompletter Plugins korrigiert, damit ESP-, ESL- und ESM-Exporte nicht mehr jede exportierte Signatur anhängen.", "1.4 — Erste öffentliche Version."]
      }
    },
    "pt-PT": {
      "dirde-ue-linux": { description: "Port nativo para Linux do Ultimate Edition Mod Menu.", overview: "Port nativo para Linux do mod menu original de FireEyeEian, com opções de gameplay publicadas, patching seguro de Data0 e reposição.", features: ["Movimento: menos stamina ao correr e saltar, corrida com armas e movimento melhorado.", "Combate: penetração de balas e abertura instantânea de portas.", "Loot: loot melhorado, mais munições, inventário maior e durabilidade aumentada.", "Conforto: menos 90% de brilho solar, sem reverberação ou eco e vídeos iniciais ignorados.", "Veículos: NoClip para veículos.", "Câmara e armas: opções FOV 72/82, upgrades de armas melhorados e ajustes de mira.", "Zombies: dificuldades One Hit, Hard e Headshot Only, além de cinco tamanhos.", "Spawns forçados: Butchers, Rams, Bloaters, Thugs, Suiciders e bandidos armados ou corpo a corpo.", "Clima e hora: noite, chuva, tempestades e variantes de noite mais escura.", "Patching nativo seguro de Data0 em Linux, com backup e reposição exata, mais pacotes Flatpak e AppImage para Linux x86-64."], changelog: ["0.1.0.dev0 — Primeira pré-release pública do port nativo para Linux do Dead Island Riptide Ultimate Edition Mod Menu de FireEyeEian."], screenshots: [{ caption: "Janela principal", alt: "Janela principal do DIRDE UE Linux com as opções de gameplay" }, { caption: "Informação e créditos", alt: "Janela Sobre do DIRDE UE Linux com dados do projeto e créditos" }] },
      "eco-quick-menu-additions": { description: "Escolha o instalador AiO ou patches de compatibilidade opcionais individuais.", overview: "A página central para os patches ECO Quick Menu publicados por K2040. Use o instalador AiO para a coleção completa ou instale apenas os patches individuais de que precisa.", features: ["Adiciona suporte de quick menu a mods de armas compatíveis com Fallout 4.", "Todos os patches publicados são ficheiros ESP com flag ESL.", "Edições simplificadas e menus reorganizados tornam o processo mais consistente.", "As condições para opções dependentes de acessórios evitam escolhas inválidas.", "Apresenta uma confirmação quando a integração no quick menu termina."], variants: [{ title: "Instalador AiO", description: "Instale toda a coleção de patches publicada com um único instalador FOMOD.", changelog: ["1.0.1.11 — Adicionado suporte para AER15 e a variante MEC-R7; variantes DKS-501 e AER15 separadas em grupos próprios.", "1.0.0.9 — Adicionado um patch para H&K 45C Mk24.", "1.0.0.8 — Adicionados patches para AQUILA e X12 Plasmacaster.", "1.0.0.6 — Adicionados patches para DKS-501 Redux e ACR-W17.", "1.0.0.4 — Release inicial com patches para HK USP, DKS-501, .357 Cattleman Revolver e MW19 FAL."] }, { title: "Patches individuais", description: "Instale apenas os patches opcionais para os mods de armas que utiliza.", changelog: ["31 mai 2026 — Patch de compatibilidade para AER15 publicado.", "29 mai 2026 — Patch de compatibilidade para MEC-R7 publicado.", "29 mai 2026 — Patch de compatibilidade para HK 45C Mk24 publicado.", "29 mai 2026 — Patch de compatibilidade para X12 Plasmacaster publicado.", "29 mai 2026 — Patch de compatibilidade para Aquila publicado.", "29 mai 2026 — Patch de compatibilidade para DKS-501 Redux publicado.", "28 mai 2026 — Patches para DKS-501 Unofficial Update Vanilla, DKS-501, .357 Cattleman Revolver, MW19 FAL e HK USP publicados."] }] },
      "xedit-json-exporter": { description: "Exporta dados de plugins de Fallout 4 do xEdit para JSON estruturado.", overview: "Script genérico para xEdit/FO4Edit que exporta registos selecionados ou estruturas completas de plugins para JSON legível.", features: ["Exporta um plugin completo ou registos selecionados do xEdit para JSON estruturado.", "Processa ficheiros ESP, ESL e ESM sem os alterar.", "Mantém a hierarquia apresentada no xEdit, incluindo registos, campos, subregistos, arrays e elementos aninhados.", "Inclui as assinaturas dos registos nos nomes dos ficheiros ao exportar uma seleção.", "Cria um resumo dos tipos e quantidades de registos para pessoas e ferramentas externas.", "Gera automaticamente o nome do ficheiro a partir do plugin e da seleção quando não é indicado um nome."], changelog: ["1.5 — Corrigida a criação automática de nomes para plugins completos; as exportações ESP, ESL e ESM deixam de acrescentar todas as assinaturas.", "1.4 — Primeira versão pública."] }
    },
    es: {
      "dirde-ue-linux": { description: "Port nativo para Linux del Ultimate Edition Mod Menu.", overview: "Port nativo para Linux del mod menu original de FireEyeEian, con opciones de gameplay publicadas, parcheado seguro de Data0 y restauración.", features: ["Movimiento: menos resistencia al correr y saltar, carrera con armas y movimiento mejorado.", "Combate: penetración de balas y rotura instantánea de puertas.", "Loot: mejor loot, más munición, inventario más amplio y mayor durabilidad.", "Comodidad: 90% menos resplandor solar, sin reverberación ni eco y vídeos de introducción omitidos.", "Vehículos: NoClip para vehículos.", "Cámara y armas: opciones FOV 72/82, mejores upgrades y ajustes de apuntado.", "Zombis: dificultades One Hit, Hard y Headshot Only, además de cinco tamaños.", "Spawns forzados: Butchers, Rams, Bloaters, Thugs, Suiciders y bandidos armados o cuerpo a cuerpo.", "Clima y hora: noche, lluvia, tormentas y variantes de noche más oscura.", "Parcheado nativo seguro de Data0 en Linux, con backup y restauración exacta, más paquetes Flatpak y AppImage para Linux x86-64."], changelog: ["0.1.0.dev0 — Primera pre-release pública del port nativo para Linux del Dead Island Riptide Ultimate Edition Mod Menu de FireEyeEian."], screenshots: [{ caption: "Ventana principal", alt: "Ventana principal de DIRDE UE Linux con las opciones de gameplay" }, { caption: "Información y créditos", alt: "Ventana Acerca de de DIRDE UE Linux con información del proyecto y créditos" }] },
      "eco-quick-menu-additions": { description: "Elige el instalador AiO o parches de compatibilidad opcionales individuales.", overview: "La página central para los parches ECO Quick Menu publicados por K2040. Usa el instalador AiO para la colección completa o instala solo los parches individuales que necesites.", features: ["Añade compatibilidad con el quick menu a mods de armas compatibles con Fallout 4.", "Todos los parches publicados son archivos ESP con flag ESL.", "Los cambios simplificados y los menús reorganizados ofrecen un proceso más coherente.", "Las condiciones para opciones que dependen de accesorios evitan elecciones no válidas.", "Muestra una confirmación cuando termina la integración en el quick menu."], variants: [{ title: "Instalador AiO", description: "Instala toda la colección de parches publicada con un único instalador FOMOD.", changelog: ["1.0.1.11 — Añadido soporte para AER15 y su variante MEC-R7; variantes DKS-501 y AER15 separadas en grupos propios.", "1.0.0.9 — Añadido un parche para H&K 45C Mk24.", "1.0.0.8 — Añadidos parches para AQUILA y X12 Plasmacaster.", "1.0.0.6 — Añadidos parches para DKS-501 Redux y ACR-W17.", "1.0.0.4 — Lanzamiento inicial con parches para HK USP, DKS-501, .357 Cattleman Revolver y MW19 FAL."] }, { title: "Parches individuales", description: "Instala solo los parches opcionales para los mods de armas que uses.", changelog: ["31 may 2026 — Publicado el parche de compatibilidad para AER15.", "29 may 2026 — Publicado el parche de compatibilidad para MEC-R7.", "29 may 2026 — Publicado el parche de compatibilidad para HK 45C Mk24.", "29 may 2026 — Publicado el parche de compatibilidad para X12 Plasmacaster.", "29 may 2026 — Publicado el parche de compatibilidad para Aquila.", "29 may 2026 — Publicado el parche de compatibilidad para DKS-501 Redux.", "28 may 2026 — Publicados parches para DKS-501 Unofficial Update Vanilla, DKS-501, .357 Cattleman Revolver, MW19 FAL y HK USP."] }] },
      "xedit-json-exporter": { description: "Exporta datos de plugins de Fallout 4 desde xEdit a JSON estructurado.", overview: "Script genérico para xEdit/FO4Edit que exporta registros seleccionados o estructuras completas de plugins a JSON legible.", features: ["Exporta un plugin completo o registros seleccionados desde xEdit a JSON estructurado.", "Procesa archivos ESP, ESL y ESM sin modificarlos.", "Conserva la jerarquía que muestra xEdit, incluidos registros, campos, subregistros, arrays y elementos anidados.", "Añade las firmas de los registros a los nombres de archivo al exportar una selección.", "Crea un resumen de tipos y cantidades de registros para personas y herramientas externas.", "Genera automáticamente el nombre del archivo a partir del plugin y la selección si no se indica uno."], changelog: ["1.5 — Corregido el nombre automático de plugins completos; las exportaciones ESP, ESL y ESM ya no añaden todas las firmas.", "1.4 — Primera versión pública."] }
    },
    fr: {
      "dirde-ue-linux": { description: "Portage Linux natif de l’Ultimate Edition Mod Menu.", overview: "Portage Linux natif du mod menu original de FireEyeEian, avec les options de gameplay publiées, un patch Data0 sécurisé et la restauration.", features: ["Déplacement : coût d’endurance réduit pour la course et le saut, course avec une arme et déplacements améliorés.", "Combat : pénétration des balles et portes brisées instantanément.", "Loot : loot amélioré, plus de munitions, inventaire agrandi et durabilité accrue.", "Confort : éblouissement solaire réduit de 90 %, suppression de la réverbération et de l’écho, vidéos d’introduction ignorées.", "Véhicules : NoClip pour les véhicules.", "Caméra et armes : options FOV 72/82, upgrades d’armes améliorés et réglages de visée.", "Zombies : difficultés One Hit, Hard et Headshot Only, plus cinq tailles.", "Spawns forcés : Butchers, Rams, Bloaters, Thugs, Suiciders et bandits armés ou au corps à corps.", "Météo et heure : nuit, pluie, tempêtes et variantes de nuit plus sombre.", "Patch Data0 natif et sécurisé sous Linux, avec backup et restauration exacte, plus des paquets Flatpak et AppImage pour Linux x86-64."], changelog: ["0.1.0.dev0 — Première préversion publique du portage Linux natif du Dead Island Riptide Ultimate Edition Mod Menu de FireEyeEian."], screenshots: [{ caption: "Fenêtre principale", alt: "Fenêtre principale de DIRDE UE Linux avec les options de gameplay" }, { caption: "Informations et crédits", alt: "Fenêtre À propos de DIRDE UE Linux avec les informations du projet et les crédits" }] },
      "eco-quick-menu-additions": { description: "Choisissez l’installateur AiO ou des patchs de compatibilité individuels facultatifs.", overview: "La page centrale des patchs ECO Quick Menu publiés par K2040. Utilisez l’installateur AiO pour la collection complète ou installez uniquement les patchs individuels dont vous avez besoin.", features: ["Ajoute la compatibilité quick menu aux mods d’armes Fallout 4 pris en charge.", "Tous les patchs publiés sont des fichiers ESP marqués ESL.", "Des modifications allégées et des menus réorganisés rendent le processus plus cohérent.", "Les conditions liées aux accessoires évitent les choix de menu non valides.", "Affiche une confirmation lorsque l’intégration au quick menu est terminée."], variants: [{ title: "Installateur AiO", description: "Installez toute la collection de patchs publiée avec un seul installateur FOMOD.", changelog: ["1.0.1.11 — Ajout de la prise en charge d’AER15 et de sa variante MEC-R7 ; séparation des variantes DKS-501 et AER15 en groupes distincts.", "1.0.0.9 — Ajout d’un patch pour H&K 45C Mk24.", "1.0.0.8 — Ajout de patchs pour AQUILA et X12 Plasmacaster.", "1.0.0.6 — Ajout de patchs pour DKS-501 Redux et ACR-W17.", "1.0.0.4 — Première version avec des patchs pour HK USP, DKS-501, .357 Cattleman Revolver et MW19 FAL."] }, { title: "Patchs individuels", description: "Installez uniquement les patchs facultatifs correspondant aux mods d’armes utilisés.", changelog: ["31 mai 2026 — Publication du patch de compatibilité AER15.", "29 mai 2026 — Publication du patch de compatibilité MEC-R7.", "29 mai 2026 — Publication du patch de compatibilité HK 45C Mk24.", "29 mai 2026 — Publication du patch de compatibilité X12 Plasmacaster.", "29 mai 2026 — Publication du patch de compatibilité Aquila.", "29 mai 2026 — Publication du patch de compatibilité DKS-501 Redux.", "28 mai 2026 — Publication des patchs DKS-501 Unofficial Update Vanilla, DKS-501, .357 Cattleman Revolver, MW19 FAL et HK USP."] }] },
      "xedit-json-exporter": { description: "Exporte les données des plugins Fallout 4 de xEdit vers un JSON structuré.", overview: "Script générique pour xEdit/FO4Edit qui exporte des enregistrements sélectionnés ou des structures complètes de plugins vers un JSON lisible.", features: ["Exporte un plugin complet ou des enregistrements sélectionnés depuis xEdit vers un JSON structuré.", "Traite les fichiers ESP, ESL et ESM sans les modifier.", "Conserve la hiérarchie affichée dans xEdit, y compris les enregistrements, champs, sous-enregistrements, tableaux et éléments imbriqués.", "Ajoute les signatures des enregistrements aux noms de fichiers lors de l’export d’une sélection.", "Crée un résumé des types et du nombre d’enregistrements pour les personnes et les outils externes.", "Génère automatiquement le nom du fichier à partir du plugin et de la sélection si aucun nom n’est indiqué."], changelog: ["1.5 — Correction du nom automatique des plugins complets ; les exports ESP, ESL et ESM n’ajoutent plus toutes les signatures.", "1.4 — Première version publique."] }
    }
  };
  const requestedId = new URLSearchParams(location.search).get("project");
  const aliases = { "eco-aio": "eco-quick-menu-additions", "eco-single": "eco-quick-menu-additions" };
  const id = aliases[requestedId] || requestedId || "eco-quick-menu-additions";
  const baseProject = projects[id] || projects["eco-quick-menu-additions"];
  const storedLanguage = (() => {
    const supported = ["en", "de", "pt-PT", "es", "fr"];
    const hashLanguage = location.hash.slice(1);
    if (supported.includes(hashLanguage)) return hashLanguage;
    try { const saved = localStorage.getItem("k2040-language"); return supported.includes(saved) ? saved : "en"; } catch { return "en"; }
  })();
  const translated = projectTranslations[storedLanguage]?.[id] || {};
  const project = { ...baseProject, ...translated };
  if (translated.variants && baseProject.variants) {
    project.variants = baseProject.variants.map((variant, index) => ({ ...variant, ...translated.variants[index] }));
  }
  if (translated.screenshots && baseProject.screenshots) {
    project.screenshots = baseProject.screenshots.map((screenshot, index) => ({ ...screenshot, ...translated.screenshots[index] }));
  }
  window.K2040_PROJECT = { screenshots: project.screenshots || [] };

  const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
  const renderList = (selector, items) => { const list = document.querySelector(selector); if (!list || !Array.isArray(items)) return; list.replaceChildren(...items.map((item) => { const entry = document.createElement("li"); entry.textContent = item; return entry; })); };
  const addLink = (container, href, label, brand) => { if (!container || !href) return; const link = document.createElement("a"); link.className = "text-link"; link.href = href; link.textContent = label; if (brand) link.dataset.brand = brand; container.append(link); };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("[data-language-select]")?.addEventListener("change", () => setTimeout(() => location.reload(), 0));
    const detailStrings = window.K2040_TRANSLATIONS?.[storedLanguage]?.detail || window.K2040_TRANSLATIONS?.en?.detail || {};
    document.title = `${project.title} · K2040 Gaming Mods`;
    setText("[data-project-game]", project.game);
    setText("[data-project-title]", project.title);
    setText("[data-project-description]", project.description);
    setText("[data-project-overview]", project.overview);
    renderList("[data-project-changelog]", project.changelog);
    const features = document.querySelector("[data-project-features-section]");
    if (features && project.features?.length) { renderList("[data-project-features]", project.features); features.hidden = false; }
    const art = document.querySelector("[data-project-hero-art]");
    const hero = document.querySelector(".project-detail-hero");
    const heroArtwork = project.heroImage || project.image;
    if (hero && (project.heroImage || project.wideHero)) hero.classList.add("project-detail-hero--wide-art");
    if (art && heroArtwork) { const image = document.createElement("img"); image.src = heroArtwork; image.alt = `${project.title} ${detailStrings?.projectArtworkSuffix || "project artwork"}`; art.append(image); }
    const downloads = document.querySelector("[data-project-downloads]");
    const links = document.querySelector("[data-project-links]");
    addLink(downloads, project.nexus, detailStrings.nexusMods || "Nexus Mods", "nexus");
    addLink(downloads, project.github, detailStrings.githubRelease || "GitHub release", "github");
    addLink(links, project.nexus, detailStrings.openNexus || "Open Nexus Mods", "nexus");
    addLink(links, project.originalNexus, detailStrings.openOriginal || "Open original mod", "nexus");
    addLink(links, project.github, detailStrings.openGithub || "Open GitHub release", "github");
    const variants = document.querySelector("[data-project-variants-section]");
    const variantList = document.querySelector("[data-project-variants]");
    if (variants && variantList && project.variants?.length) {
      variantList.replaceChildren(...project.variants.map((variant) => {
        const item = document.createElement("article");
        item.className = "project-variant";
        item.id = variant.id;
        const title = document.createElement("h3"); title.textContent = variant.title;
        const description = document.createElement("p"); description.textContent = variant.description;
        const action = document.createElement("a"); action.className = "text-link"; action.href = variant.nexus; action.textContent = detailStrings.openNexus || "Open Nexus Mods"; action.dataset.brand = "nexus";
        const heading = document.createElement("h4"); heading.textContent = detailStrings.changelogTitle || "Changelog";
        const changelog = document.createElement("ul"); changelog.className = "detail-list";
        changelog.replaceChildren(...variant.changelog.slice(0, 5).map((entry) => { const line = document.createElement("li"); line.textContent = entry; return line; }));
        item.append(title, description, action, heading, changelog);
        return item;
      }));
      variants.hidden = false;
      document.querySelector("[data-project-links-section]")?.setAttribute("hidden", "");
      document.querySelector("[data-project-changelog-section]")?.setAttribute("hidden", "");
    }
    const downloadsNav = document.querySelector("[data-project-downloads-nav]");
    if (downloadsNav) downloadsNav.href = project.variants?.length ? "#project-variants" : "#project-downloads";
  });
})();
