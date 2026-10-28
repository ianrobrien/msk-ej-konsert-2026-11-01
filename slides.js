const norwayLocation = {
  place: "Norge",
  point: { latitude: 59.918636, longitude: 10.748033 }, // Oslo
};

window.CONCERT_CONFIG = {
  photoIntervalMs: 60_000,
  flightDurationMs: 60_000,
  slides: [
    {
      id: "start",
      type: "interstitial",
      title: "Velkommen",
      routeToNextSong: true,
      routeOrigin: norwayLocation,
      photos: [],
    },
    {
      id: "african-symphony",
      song: "African Symphony",
      place: "Afrika",
      point: { latitude: -3.360016, longitude: 36.669999 }, // Arusha
      photos: [
        {
          src: "assets/photos/01-africa-1.jpg",
          credit: "Hu Chen",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/brown-tree-on-surrounded-by-brown-grass-during-golden-hour-60XLoOgwkfA",
        },
        {
          src: "assets/photos/01-africa-2.jpg",
          credit: "Kelly Arnold",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/giraffe-during-daytime-ASKewSMebm0",
        },
        {
          src: "assets/photos/01-africa-3.jpg",
          credit: "Deon De Villiers",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/brown-elephant-on-brown-field-under-gray-clouds-7HRHhcueqZ8",
        },
        {
          src: "assets/photos/01-africa-4.jpg",
          credit: "David Tomaseti",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/zebras-drinking-from-calm-pond-Vw2HZQ1FGjU",
        },
        {
          src: "assets/photos/01-africa-5.jpg",
          credit: "Evgeny Matveev",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-variety-of-spices-are-on-display-in-a-store-eEpEs1CUaS4",
        },
      ],
    },
    {
      id: "banana-boat-song",
      song: "The Banana Boat Song",
      place: "Karibia",
      point: { latitude: 17.977077, longitude: -76.767434 }, // Kingston
      photos: [
        {
          src: "assets/photos/02-caribbean-1.jpg",
          credit: "Rock Staar",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/white-and-blue-bus-near-palm-tree-under-blue-sky-during-daytime-wGyHvtLcW_U",
        },
        {
          src: "assets/photos/02-caribbean-2.jpg",
          credit: "Tom Jur",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-street-lined-with-palm-trees-and-parked-cars-FCsYf14C_6M",
        },
        {
          src: "assets/photos/02-caribbean-3.jpg",
          credit: "Hugh Whyte",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/aerial-view-of-beach-during-daytime-SBOHLtENzEY",
        },
        {
          src: "assets/photos/02-caribbean-4.jpg",
          credit: "Fernando Jorge",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/birds-eye-photography-of-structures-EoQzRoLFkrw",
        },
        {
          src: "assets/photos/02-caribbean-5.jpg",
          credit: "Aiva Apsite",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-bunch-of-green-bananas-hanging-from-a-tree-3QVpFwWvCgc",
        },
      ],
    },
    {
      id: "portias-slottsorkester",
      song: "Portias slottsorkester",
      place: "Irland",
      point: { latitude: 53.346731, longitude: -6.25698 }, // Dublin
      incomingRoute: {
        from: "banana-boat-song",
        vehicle: "boat",
      },
      photos: [
        {
          src: "assets/photos/03-ireland-5.jpg",
          credit: "Wallace Bentt",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/view-photography-of-gray-castle-on-island-KViyTyPUsl8",
        },
        {
          src: "assets/photos/03-ireland-2.jpg",
          credit: "Henrique Craveiro",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/rock-formation-beside-sea-under-white-sky-ezJhm4xrHAM",
        },
        {
          src: "assets/photos/03-ireland-3.jpg",
          credit: "Ainars Djatlevskis",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/stone-castle-on-green-coastal-cliff-gJQLVTyQfgQ",
        },
        {
          src: "assets/photos/03-ireland-4.jpg",
          credit: "Saad Chaudhry",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/sea-and-cliff-during-daytime-Xm5jDcBv_oE",
        },
        {
          src: "assets/photos/03-ireland-1.jpg",
          credit: "Jason Murphy",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/white-and-black-concrete-building-under-blue-sky-during-daytime-rTG1TR6Ygb0",
        },
      ],
    },
    {
      id: "bruremarsj",
      song: "Bruremarsj",
      place: "Norge",
      point: norwayLocation.point,
      photos: [
        {
          src: "assets/photos/04-norge-1.jpg",
          credit: "Lightscape",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/aurora-borealis-on-body-of-water-during-daytime-ist1RQOfkcE",
        },
        {
          src: "assets/photos/04-norge-2.jpg",
          credit: "Sébastien Goldberg",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/brown-moose-on-gray-field-1r6rwX1FUdc",
        },
        {
          src: "assets/photos/04-norge-3.jpg",
          credit: "Joshua Kettle",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/an-aerial-view-of-a-river-running-through-a-city-SNVuKxmg0qY",
        },
        {
          src: "assets/photos/04-norge-5.jpg",
          credit: "Joshua Kettle",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/an-aerial-view-of-a-small-town-on-an-island-CfbAP2h8xzk",
        },
      ],
    },
    {
      id: "copacabana",
      song: "Copacabana",
      place: "Brasil",
      point: { latitude: -22.907308, longitude: -43.212117 }, // Rio de Janeiro
      photos: [
        {
          src: "assets/photos/05-brazil-1.jpg",
          credit: "Raphael Nogueira",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/christ-redeemer-statue-brazil-CErddu-JwKw",
        },
        {
          src: "assets/photos/05-brazil-2.jpg",
          credit: "Sébastien Goldberg",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/high-angle-photography-of-cable-car-Q8KGwGdDsW8",
        },
        {
          src: "assets/photos/05-brazil-3.jpg",
          credit: "Juliana e Mariana Amorim",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/two-teal-and-yellow-parrots-on-cable-AmLssHPF58k",
        },
        {
          src: "assets/photos/05-brazil-4.jpg",
          credit: "Davi Costa",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/aerial-photography-of-mountains-surrounded-by-sea-4lWIQ43CCmM",
        },
        {
          src: "assets/photos/05-brazil-5.jpg",
          credit: "Cassio Nunes",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/yellow-and-black-bird-on-green-fruit-LtkNnk5gsO8",
        },
      ],
    },
    {
      id: "pause",
      type: "interstitial",
      title: "Pause",
      photos: [],
    },
    {
      id: "rekrutter-aspiranter",
      type: "interstitial",
      title: "Innslag med rekrutter/aspiranter",
      routeOrigin: norwayLocation,
      routeFromPreviousSong: true,
      routeToNextSong: true,
      photos: [],
    },
    {
      id: "copenhagen-steam-railway-galop",
      song: "Copenhagen Steam Railway Galop",
      place: "Danmark",
      point: { latitude: 55.68051, longitude: 12.56154 }, // Copenhagen
      photos: [
        {
          src: "assets/photos/06-denmark-1.jpg",
          credit: "Nick Karvounis",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/red-boat-in-nyhavn-canal-copenhagen-cj9_lderSUk",
        },
        {
          src: "assets/photos/06-denmark-2.jpg",
          credit: "Leif Jørgensen",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Steam_train_at_Gr%C3%A6sted_Veterantr%C3%A6f_2017.jpg",
        },
        {
          src: "assets/photos/06-denmark-3.jpg",
          credit: "Dietmar Rabich",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Kopenhagen_(DK),_Peblinge-See,_S%C3%B8pavillonen_--_2017_--_1453.jpg",
        },
      ],
    },
    {
      id: "monterosi",
      song: "Monterosi",
      place: "Italia",
      point: { latitude: 41.897902, longitude: 12.481313 }, // Rome
      incomingRoute: {
        from: "copenhagen-steam-railway-galop",
        vehicle: "steam-train",
      },
      photos: [
        {
          src: "assets/photos/07-italy-1.jpg",
          credit: "Bjørn Christian Tørrissen",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Monterosi-Chiesa-San-Giuseppe-2012.JPG",
        },
        {
          src: "assets/photos/07-italy-2.jpg",
          credit: "Albarubescens",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Fields_of_harvested_hay,_Monterosi_countryside_in_Latium.jpg",
        },
        {
          src: "assets/photos/07-italy-3.jpg",
          credit: "Eric Kilby",
          license: "CC BY-SA 2.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Cypress_tree_alley_at_sunset_in_Asciano,_Tuscany.jpg",
        },
      ],
    },
    {
      id: "how-to-train-your-dragon",
      song: "How to Train Your Dragon",
      place: "Skottland",
      point: { latitude: 55.948328, longitude: -3.219091 }, // Edinburgh
      photos: [
        {
          src: "assets/photos/08-scotland-1.jpg",
          credit: "Michal Klajban",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:View_southwest_from_Ben_Lawers,_Scottish_Highlands,_Scotland.jpg",
        },
        {
          src: "assets/photos/08-scotland-2.jpg",
          credit: "Michal Klajban",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:A_small_loch_in_the_saddle_between_Beinn_an_Dothaidh_and_Beinn_Dorain,_Scotland_01.jpg",
        },
        {
          src: "assets/photos/08-scotland-3.jpg",
          credit: "Diliff",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Eilean_Donan_Castle,_Scotland_-_Jan_2011.jpg",
        },
      ],
    },
    {
      id: "sing-sing-sing",
      song: "Sing Sing Sing",
      place: "USA",
      point: { latitude: 40.7831, longitude: -73.9712 }, // New York City, inland anchor
      photos: [
        {
          src: "assets/photos/09-usa-1.jpg",
          credit: "Hans Gerber",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:ETH-Bibliothek_Z%C3%BCrich,_Bildarchiv_-_Com_C08-143-002_-_Benny_Goodman,_USA,_Jazz_Orchestra.jpg",
        },
        {
          src: "assets/photos/09-usa-2.jpg",
          credit: "William P. Gottlieb",
          license: "Public domain",
          source:
            "https://commons.wikimedia.org/wiki/File:Billie_Holiday,_Downbeat,_New_York,_N.Y.,_ca._Feb._1947_(William_P._Gottlieb_04251).jpg",
        },
        {
          src: "assets/photos/09-usa-3.jpg",
          credit: "William P. Gottlieb",
          license: "Public domain",
          source:
            "https://commons.wikimedia.org/wiki/File:Leonard_Bernstein_and_Benny_Goodman_in_rehearsal.jpg",
        },
      ],
    },
    {
      id: "finish",
      type: "interstitial",
      title: "Takk for musikken",
      photos: [],
    },
  ],
};
