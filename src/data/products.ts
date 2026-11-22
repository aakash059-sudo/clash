import type { AisleCategory, MealBundle, Product } from '../types/grocery';

export const HERO_IMAGE = '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg';

export const AISLE_CATEGORIES: AisleCategory[] = [
  'All Drops',
  'Viral Pantry',
  'Late-Night Snacks',
  'Fresh & Staples',
  'Chilled Drinks',
];

export const PRODUCTS: Product[] = [
  {
    id: 'sichuan-truffle-chili-crisp',
    name: 'Sichuan Truffle Chili Crisp',
    category: 'Viral Pantry',
    unitSize: '170g Jar',
    price: 8.5,
    rating: 4.9,
    reviewCount: 128,
    tag: 'Viral Drop',
    image: '/src/assets/images/prod_chili_crisp_1795329869178.jpg',
    gallery: [
      '/src/assets/images/prod_chili_crisp_1795329869178.jpg',
      '/src/assets/images/prod_ramen_cup_1795329868322.jpg',
      '/src/assets/images/prod_sourdough_butter_1795329868199.jpg',
    ],
    description:
      'Small-batch Erjingtiao chilies, crispy shallots, toasted sesame, and black truffle oil. Spoon it over ramen, eggs, pizza, or vanilla ice cream.',
    ingredients:
      'Non-GMO sunflower oil, Sichuan chili flakes, fried shallots, toasted sesame, black truffle essence.',
    dietary: '100% Plant-based · Gluten-free · Store in a cool pantry up to 6 months.',
    packOptions: [
      { id: 'single', label: 'Single Jar', sizeNote: '170g', price: 8.5 },
      { id: 'double', label: '2-Pack', sizeNote: '340g', price: 15.5 },
      { id: 'party', label: 'Party 4-Pack', sizeNote: '680g', price: 29.0 },
    ],
    pairingIds: [
      'spicy-rose-carbonara-ramen',
      'sparkling-matcha-yuzu-tonic',
      'country-sourdough-butter',
    ],
  },
  {
    id: 'spicy-rose-carbonara-ramen',
    name: 'Spicy Rose Carbonara Ramen',
    category: 'Viral Pantry',
    unitSize: '2-Pack Bowl',
    price: 5.9,
    rating: 4.8,
    reviewCount: 214,
    tag: 'Top Pairing',
    image: '/src/assets/images/prod_ramen_cup_1795329868322.jpg',
    gallery: [
      '/src/assets/images/prod_ramen_cup_1795329868322.jpg',
      '/src/assets/images/prod_chili_crisp_1795329869178.jpg',
      '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg',
    ],
    description:
      'Chewy wheat noodles coated in velvety gochujang-parmesan cream sauce with roasted garlic oil. Ready in four minutes flat.',
    ingredients:
      'Artisanal wheat noodles, Korean gochujang paste, aged parmesan powder, sweet cream, garlic flakes.',
    dietary: 'Vegetarian · No artificial dyes · Cooks in 4 minutes.',
    packOptions: [
      { id: 'two-pack', label: '2-Pack', sizeNote: '280g', price: 5.9 },
      { id: 'four-pack', label: '4-Pack', sizeNote: '560g', price: 10.8 },
      { id: 'crate', label: 'Dorm 8-Pack', sizeNote: '1.12kg', price: 19.9 },
    ],
    pairingIds: [
      'sichuan-truffle-chili-crisp',
      'sparkling-matcha-yuzu-tonic',
      'strawberry-matcha-mochi',
    ],
  },
  {
    id: 'sparkling-matcha-yuzu-tonic',
    name: 'Sparkling Matcha Yuzu Tonic',
    category: 'Chilled Drinks',
    unitSize: '355ml Can',
    price: 3.75,
    rating: 4.9,
    reviewCount: 96,
    tag: 'Chilled',
    image: '/src/assets/images/prod_matcha_can_1795329868184.jpg',
    gallery: [
      '/src/assets/images/prod_matcha_can_1795329868184.jpg',
      '/src/assets/images/prod_cold_brew_1795329868782.jpg',
      '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg',
    ],
    description:
      'Ceremonial Uji matcha whisked with cold-pressed Japanese yuzu juice and crisp mountain sparkling water for clean zero-crash focus.',
    ingredients:
      'Carbonated spring water, ceremonial-grade Uji matcha, cold-pressed yuzu juice, organic agave.',
    dietary: '65mg natural L-theanine caffeine · Vegan · 35 calories per can.',
    packOptions: [
      { id: 'single', label: 'Single Can', sizeNote: '355ml', price: 3.75 },
      { id: 'four-pack', label: '4-Pack', sizeNote: '1.42L', price: 13.5 },
      { id: 'case', label: '12-Can Case', sizeNote: '4.26L', price: 36.0 },
    ],
    pairingIds: [
      'strawberry-matcha-mochi',
      'country-sourdough-butter',
      'hass-avocado-mango-box',
    ],
  },
  {
    id: 'country-sourdough-butter',
    name: 'Country Sourdough & Butter',
    category: 'Fresh & Staples',
    unitSize: '500g Loaf',
    price: 9.8,
    rating: 4.9,
    reviewCount: 164,
    image: '/src/assets/images/prod_sourdough_butter_1795329868199.jpg',
    gallery: [
      '/src/assets/images/prod_sourdough_butter_1795329868199.jpg',
      '/src/assets/images/prod_fresh_produce_1795329868290.jpg',
      '/src/assets/images/prod_chili_crisp_1795329869178.jpg',
    ],
    description:
      'Naturally leavened 36-hour fermented country loaf with blistered crust, paired with a tub of whipped sea-salt cultured butter.',
    ingredients:
      'Organic stone-milled wheat flour, wild starter, sea salt, grass-fed cultured cream butter.',
    dietary: 'Baked fresh every morning · Zero preservatives · Best toasted.',
    packOptions: [
      { id: 'single', label: 'Loaf + Butter', sizeNote: '500g', price: 9.8 },
      { id: 'double', label: '2 Loaves + Butter', sizeNote: '1kg', price: 17.5 },
    ],
    pairingIds: [
      'hass-avocado-mango-box',
      'sichuan-truffle-chili-crisp',
      'vietnamese-salt-cold-brew',
    ],
  },
  {
    id: 'hass-avocado-mango-box',
    name: 'Ripe Avocado & Mango Trio',
    category: 'Fresh & Staples',
    unitSize: '4-Piece Box',
    price: 7.4,
    rating: 4.7,
    reviewCount: 83,
    tag: 'Picked Today',
    image: '/src/assets/images/prod_fresh_produce_1795329868290.jpg',
    gallery: [
      '/src/assets/images/prod_fresh_produce_1795329868290.jpg',
      '/src/assets/images/prod_sourdough_butter_1795329868199.jpg',
      '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg',
    ],
    description:
      'Hand-checked eat-tonight Hass avocados, sweet honey Ataulfo mangoes, and two juicy key limes ready for toast or spicy fruit bowls.',
    ingredients: '2 Hass avocados, 2 Ataulfo mangoes, 2 fresh key limes.',
    dietary: 'Hand-ripened · Pesticide-free orchards · Zero plastic wrap.',
    packOptions: [
      { id: 'trio', label: 'Standard Box', sizeNote: '4 pcs + limes', price: 7.4 },
      { id: 'brunch', label: 'Brunch Double', sizeNote: '8 pcs + limes', price: 13.8 },
    ],
    pairingIds: [
      'country-sourdough-butter',
      'sichuan-truffle-chili-crisp',
      'sparkling-matcha-yuzu-tonic',
    ],
  },
  {
    id: 'strawberry-matcha-mochi',
    name: 'Hibiscus & Matcha Mochi',
    category: 'Late-Night Snacks',
    unitSize: '6-Piece Box',
    price: 6.9,
    rating: 4.9,
    reviewCount: 192,
    tag: '2 AM Favorite',
    image: '/src/assets/images/prod_mochi_bites_1795329869192.jpg',
    gallery: [
      '/src/assets/images/prod_mochi_bites_1795329869192.jpg',
      '/src/assets/images/prod_matcha_can_1795329868184.jpg',
      '/src/assets/images/prod_cold_brew_1795329868782.jpg',
    ],
    description:
      'Pillow-soft pounded rice dough wrapped around strawberry hibiscus jam gelato and earthy Uji matcha ice cream.',
    ingredients:
      'Sweet glutinous rice flour, organic strawberries, dried hibiscus, ceremonial matcha, sweet cream.',
    dietary: 'Gluten-free · Arrives insulated in dry-chilled pouches.',
    packOptions: [
      { id: 'box-6', label: '6-Piece Box', sizeNote: '210g', price: 6.9 },
      { id: 'box-12', label: '12-Piece Party', sizeNote: '420g', price: 12.5 },
    ],
    pairingIds: [
      'sparkling-matcha-yuzu-tonic',
      'vietnamese-salt-cold-brew',
      'spicy-rose-carbonara-ramen',
    ],
  },
  {
    id: 'vietnamese-salt-cold-brew',
    name: 'Salted Cream Cold Brew',
    category: 'Chilled Drinks',
    unitSize: '330ml Bottle',
    price: 4.6,
    rating: 4.8,
    reviewCount: 147,
    tag: 'Small Batch',
    image: '/src/assets/images/prod_cold_brew_1795329868782.jpg',
    gallery: [
      '/src/assets/images/prod_cold_brew_1795329868782.jpg',
      '/src/assets/images/prod_matcha_can_1795329868184.jpg',
      '/src/assets/images/prod_sourdough_butter_1795329868199.jpg',
    ],
    description:
      '18-hour slow-steeped Vietnamese robusta and arabica roast balanced with lightly salted sweet cream and caramel depth.',
    ingredients:
      'Cold-brewed single-origin Vietnamese coffee, condensed sweet cream, sea salt, cane sugar.',
    dietary: '140mg caffeine · Delivered ice-cold · Shake gently before pouring.',
    packOptions: [
      { id: 'single', label: 'Single Bottle', sizeNote: '330ml', price: 4.6 },
      { id: 'four-pack', label: '4-Bottle Pack', sizeNote: '1.32L', price: 16.8 },
    ],
    pairingIds: [
      'country-sourdough-butter',
      'strawberry-matcha-mochi',
      'hass-avocado-mango-box',
    ],
  },
  {
    id: 'midnight-noodle-crisp-bundle',
    name: 'Midnight Crunch Snack Pack',
    category: 'Late-Night Snacks',
    unitSize: '3-Item Combo',
    price: 16.5,
    rating: 5.0,
    reviewCount: 74,
    tag: 'Save $2.65',
    image: '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg',
    gallery: [
      '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg',
      '/src/assets/images/prod_ramen_cup_1795329868322.jpg',
      '/src/assets/images/prod_chili_crisp_1795329869178.jpg',
    ],
    description:
      'Our #1 late-night study and hangout stash: Spicy Rose Ramen 2-Pack, full jar of Truffle Chili Crisp, and a chilled Matcha Yuzu Tonic.',
    ingredients:
      'Includes 1x Sichuan Truffle Chili Crisp (170g), 1x Spicy Rose Ramen (2-Pack), 1x Sparkling Matcha Yuzu (355ml).',
    dietary: 'Vegetarian friendly · Packed in insulated express tote.',
    packOptions: [
      { id: 'solo', label: 'Solo Stash', sizeNote: '3 items', price: 16.5 },
      { id: 'roommate', label: 'Roommate Double', sizeNote: '6 items', price: 31.0 },
    ],
    pairingIds: [
      'strawberry-matcha-mochi',
      'vietnamese-salt-cold-brew',
      'hass-avocado-mango-box',
    ],
  },
];

export const MEAL_BUNDLES: MealBundle[] = [
  {
    id: 'bundle-ramen-club',
    name: '2 AM Ramen Club Kit',
    subtitle: 'Everything for a spicy, creamy midnight noodle bowl in 5 minutes.',
    itemsSummary: [
      'Spicy Rose Carbonara Ramen (2-Pack)',
      'Sichuan Truffle Chili Crisp (170g)',
      '2x Sparkling Matcha Yuzu Tonic',
    ],
    originalPrice: 21.9,
    bundlePrice: 17.5,
    image: '/src/assets/images/prod_ramen_cup_1795329868322.jpg',
    accentLabel: 'Save $4.40',
  },
  {
    id: 'bundle-brunch-drop',
    name: 'Morning Toast & Cold Brew Box',
    subtitle: 'Blistered sourdough, ripe avocados, and salted cream cold brew.',
    itemsSummary: [
      'Country Sourdough & Cultured Butter',
      'Ripe Avocado & Mango Trio',
      '2x Salted Cream Cold Brew (330ml)',
    ],
    originalPrice: 26.4,
    bundlePrice: 21.9,
    image: '/src/assets/images/prod_sourdough_butter_1795329868199.jpg',
    accentLabel: 'Save $4.50',
  },
];
