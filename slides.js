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
          alt: "Soloppgang over Serengeti-slettene",
          credit: "Giles Laurent",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:004_Sunrise_at_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg",
        },
        {
          src: "assets/photos/01-africa-2.jpg",
          alt: "Akasiatre på Serengeti-gresslettene",
          credit: "Bjørn Christian Tørrissen",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Serengeti-Landscape-2012.JPG",
        },
        {
          src: "assets/photos/01-africa-3.jpg",
          alt: "Afrikansk elefant med kalv i Serengeti",
          credit: "Charles J. Sharp",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:African_bush_elephant_(Loxodonta_africana)_with_calf_Serengeti_2.jpg",
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
          alt: "Luftfoto av Santa Barbara-stranden på Curaçao",
          credit: "dronepicr",
          license: "CC BY 2.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Curacao_Santa_Barbara_beach_(36699632905).jpg",
        },
        {
          src: "assets/photos/02-caribbean-2.jpg",
          alt: "Maho-stranden på den karibiske øya Saint Martin",
          credit: "alljengi",
          license: "CC BY-SA 2.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Maho_Beach,_near_Princess_Juliana_Airport,_Caribbean_island_of_Saint_Martin-8Feb2008_(4).jpg",
        },
        {
          src: "assets/photos/02-caribbean-3.jpg",
          alt: "Dunn's River Falls på Jamaica",
          credit: "Dr. Thomas Liptak",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Jamaica_Ocho_Rios_Dunn%27s_River_Falls_1.jpg",
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
          src: "assets/photos/03-ireland-1.jpg",
          alt: "Cliffs of Moher og O'Brien's Tower",
          credit: "Berthold Werner",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Ireland_Cliffs_of_Moher_BW_2025-09-11_14-27-51.jpg",
        },
        {
          src: "assets/photos/03-ireland-2.jpg",
          alt: "Dingle fyr over kysten",
          credit: "Superbass",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:2019-07-20-Dingle_Lighthouse-0673.jpg",
        },
        {
          src: "assets/photos/03-ireland-3.jpg",
          alt: "Steinete kystlinje på nordkysten av Valentia Island",
          credit: "Rauenstein",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Valentia_Island,_North_coast_3.jpg",
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
          alt: "Lyngenfjorden under fjellene",
          credit: "Ximonic (Simo Räsänen)",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:At_Lyngen_fjord,_Sp%C3%A5kenes_in_2012_June.jpg",
        },
        {
          src: "assets/photos/04-norge-2.jpg",
          alt: "Fiskeværet Reine i Lofoten",
          credit: "Ximonic (Simo Räsänen)",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Reine_in_Lofoten,_Norway,_2012_October.jpg",
        },
        {
          src: "assets/photos/04-norge-3.jpg",
          alt: "Utsikt over Geirangerfjorden fra Ørnesvingen",
          credit: "Ximonic (Simo Räsänen)",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Geirangerfjord_from_%C3%98rnesvingen,_2013_June.jpg",
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
          alt: "Rio de Janeiro og Sukkertoppen ved solnedgang",
          credit: "Wilfredor",
          license: "CC0",
          source:
            "https://commons.wikimedia.org/wiki/File:Rio_de_Janeiro_skyline_and_Sugarloaf_Mountain_at_sunset,_Brazil_3.jpg",
        },
        {
          src: "assets/photos/05-brazil-2.jpg",
          alt: "Soloppgang over Rio de Janeiro og Sukkertoppen",
          credit: "Donatas Dabravolskas",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Sugarloaf_Sunrise_2.jpg",
        },
        {
          src: "assets/photos/05-brazil-3.jpg",
          alt: "Fjelltopper i Serra dos Órgãos nasjonalpark",
          credit: "Carlos Perez Couto",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Amanhecer_no_Hercules_--.jpg",
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
          alt: "Nyhavn i København ved solnedgang",
          credit: "Moahim",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:2018_-_Nyhavn_on_sunset.jpg",
        },
        {
          src: "assets/photos/06-denmark-2.jpg",
          alt: "Dansk veterandamplokomotiv ved Græsted",
          credit: "Leif Jørgensen",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Steam_train_at_Gr%C3%A6sted_Veterantr%C3%A6f_2017.jpg",
        },
        {
          src: "assets/photos/06-denmark-3.jpg",
          alt: "Peblingesjøen i København",
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
          alt: "San Giuseppe-kirken i Monterosi i Lazio",
          credit: "Bjørn Christian Tørrissen",
          license: "CC BY-SA 3.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Monterosi-Chiesa-San-Giuseppe-2012.JPG",
        },
        {
          src: "assets/photos/07-italy-2.jpg",
          alt: "Høstede åkre på landsbygda nær Monterosi",
          credit: "Albarubescens",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:Fields_of_harvested_hay,_Monterosi_countryside_in_Latium.jpg",
        },
        {
          src: "assets/photos/07-italy-3.jpg",
          alt: "Åser med sypresser i Toscana ved solnedgang",
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
          alt: "Tidlig morgenutsikt over Det skotske høylandet fra Ben Lawers",
          credit: "Michal Klajban",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:View_southwest_from_Ben_Lawers,_Scottish_Highlands,_Scotland.jpg",
        },
        {
          src: "assets/photos/08-scotland-2.jpg",
          alt: "En liten innsjø mellom Beinn an Dothaidh og Beinn Dorain",
          credit: "Michal Klajban",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:A_small_loch_in_the_saddle_between_Beinn_an_Dothaidh_and_Beinn_Dorain,_Scotland_01.jpg",
        },
        {
          src: "assets/photos/08-scotland-3.jpg",
          alt: "Eilean Donan-slottet ved soloppgang",
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
          alt: "Benny Goodman med jazzorkesteret sitt",
          credit: "Hans Gerber",
          license: "CC BY-SA 4.0",
          source:
            "https://commons.wikimedia.org/wiki/File:ETH-Bibliothek_Z%C3%BCrich,_Bildarchiv_-_Com_C08-143-002_-_Benny_Goodman,_USA,_Jazz_Orchestra.jpg",
        },
        {
          src: "assets/photos/09-usa-2.jpg",
          alt: "Billie Holiday på klubben Downbeat i New York",
          credit: "William P. Gottlieb",
          license: "Public domain",
          source:
            "https://commons.wikimedia.org/wiki/File:Billie_Holiday,_Downbeat,_New_York,_N.Y.,_ca._Feb._1947_(William_P._Gottlieb_04251).jpg",
        },
        {
          src: "assets/photos/09-usa-3.jpg",
          alt: "Leonard Bernstein og Benny Goodman under en prøve",
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
