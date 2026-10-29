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
      photos: [],
    },
    {
      id: "opening-video",
      type: "interstitial",
      title: "Introduksjonsvideo",
      video: "assets/videos/flight_K0RPS26_PA_video_no.mp4",
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
          src: "assets/photos/04-norge-4.jpg",
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
          credit: "Tomas Eidsvold",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/green-grass-near-body-of-water-during-daytime-NQvGi9VAf4U",
        },
        {
          src: "assets/photos/06-denmark-4.jpg",
          credit: "Marina Šurniene",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/brown-concrete-building-near-body-of-water-during-daytime-uW7GWyHsizI",
        },
        {
          src: "assets/photos/06-denmark-5.jpg",
          credit: "Christoffer Mouritsen",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/aerial-photography-of-yellow-train-seiUizmGpv8",
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
          credit: "Giuseppe Mondì",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/florence-cathedral-skyline-with-trees-Qq1fwSLM0N0",
        },
        {
          src: "assets/photos/07-italy-2.jpg",
          credit: "Cristina Gottardi",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/trevi-fountain-in-rome-italy-I1Lv2yX67GI",
        },
        {
          src: "assets/photos/07-italy-3.jpg",
          credit: "Clay Banks",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/brown-concrete-building-under-gray-sky-during-daytime-hi_52O-h5G8",
        },
        {
          src: "assets/photos/07-italy-4.jpg",
          credit: "La So",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/white-motor-scooter-near-building-vk4vjTNVrTg",
        },
        {
          src: "assets/photos/07-italy-5.jpg",
          credit: "Josh Hild",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/vernazza-village-on-cinque-terre-coast-K4WXehq5Alc",
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
          credit: "Bjorn Snelders",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/green-grass-on-mountain-under-white-cloudy-sky-Cd3Ek7rNXSk",
        },
        {
          src: "assets/photos/08-scotland-2.jpg",
          credit: "Zikang Zhou",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-grassy-hill-with-a-road-going-through-it-7ZbnCzxw4-o",
        },
        {
          src: "assets/photos/08-scotland-3.jpg",
          credit: "Connor Mollison",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/kilchurn-castle-ruins-on-loch-awe-3rkosR_Dgfg",
        },
        {
          src: "assets/photos/08-scotland-4.jpg",
          credit: "Zikang Zhou",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-castle-sitting-on-top-of-a-rocky-shore-wKcdpwBY53I",
        },
        {
          src: "assets/photos/08-scotland-5.jpg",
          credit: "Zikang Zhou",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-castle-sitting-on-top-of-a-rocky-shore-wKcdpwBY53I",
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
          credit: "Patrick Tomasso",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/manhattan-skyline-and-brooklyn-bridge-SVVTZtTGyaU",
        },
        {
          src: "assets/photos/09-usa-2.jpg",
          credit: "Stella He",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/a-tall-building-with-a-balcony-and-flowers-on-the-balconies-cyZuN_AViJQ",
        },
        {
          src: "assets/photos/09-usa-3.jpg",
          credit: "Matt Collamer",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/brown-brick-building-near-green-trees-during-daytime-UpYF6ibFud0",
        },
        {
          src: "assets/photos/09-usa-4.jpg",
          credit: "Thom Milkovic",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/space-needle-and-seattle-skyline-skUTVJi8-jc",
        },
        {
          src: "assets/photos/09-usa-5.jpg",
          credit: "Maarten van den Heuvel",
          license: "Unsplash License",
          source:
            "https://unsplash.com/photos/golden-gate-bridge-during-daytime-gZXx8lKAb7Y",
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
