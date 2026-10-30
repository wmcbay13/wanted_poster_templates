/*
 * Copy library: preset headlines, crimes, rewards, warnings, footers.
 * Audience tags: kids | adults | couples | families | all
 */
(function (global) {
  'use strict';

  const L = {};

  L.kickers = [
    "The Haunted County Sheriff's Office",
    "By Order of the Haunted Sheriff",
    'Haunted County Police Bulletin',
    "Halloween Sheriff's Department",
    'Notice to All Ghouls & Goblins',
    'Official Spooktacular Notice',
  ];

  L.headlines = [
    'WANTED', 'DEAD OR ALIVE', 'DEAD OR ASLEEP', 'MOST WANTED', 'BEWARE!',
    'PUBLIC ENEMY #1', 'APPROACH WITH CAUTION', 'REWARD', 'HAVE YOU SEEN THIS GHOUL?',
  ];

  L.crimes = {
    kids: [
      'Suspected of stealing Halloween candy!',
      'Causing mischief after bedtime',
      'Last seen with crumbs on their face',
      'Disturbing the peace with scary noises',
      'Trading all the raisins for chocolate without permission',
      'Hiding under the bed and refusing to come out',
      'Teaching the family cat to say BOO',
      'Wearing a costume so good nobody recognized them',
    ],
    adults: [
      'Repeatedly falling asleep at parties',
      'Stealing drinks and making bad decisions',
      'Disappearing without saying goodbye',
      'Disturbing the peace after midnight',
      'Double-dipping in the graveyard guacamole',
      'Wearing the same costume three years in a row',
      'Telling the same ghost story at every party',
      'Eating all the full-size candy bars before the trick-or-treaters arrived',
    ],
    couples: [
      'Conspiring to steal all the Halloween candy',
      'Wearing coordinated costumes with intent to impress',
      'Slow dancing to "Monster Mash" in a public place',
      'Sharing one cauldron of punch with two straws',
      'Arriving fashionably late, together, again',
      'Finishing each other’s spooky sentences',
      'Plotting a haunted house heist',
    ],
    families: [
      'Organized Halloween mischief',
      'Operating an unlicensed haunted house',
      'Running a coordinated candy-collection syndicate',
      'Group-costume crimes against good taste',
      'Toilet-papering the neighborhood with a family-sized pack',
      'Hosting an unauthorized pumpkin-carving ring',
      'Harboring a fugitive black cat',
    ],
  };

  L.rewards = [
    { amount: '1,000 PIECES OF CANDY', a: 'kids' },
    { amount: '500 GUMMY WORMS', a: 'kids' },
    { amount: 'ONE GIANT COOKIE', a: 'kids' },
    { amount: 'ONE BUCKET OF TREATS', a: 'kids' },
    { amount: 'LIFETIME SUPPLY OF CANDY CORN', a: 'kids' },
    { amount: 'ONE BAG OF STOLEN HALLOWEEN TREATS', a: 'kids' },
    { amount: 'A PILLOWCASE OF FULL-SIZE BARS', a: 'kids' },
    { amount: 'AN EXTRA HOUR OF TRICK-OR-TREATING', a: 'kids' },
    { amount: '$5,000', note: 'or a strong coffee', a: 'adults' },
    { amount: 'ONE FREE COCKTAIL', a: 'adults' },
    { amount: '$10,000', note: 'in ghost money', a: 'adults' },
    { amount: 'ONE NIGHT OF UNINTERRUPTED SLEEP', a: 'adults' },
    { amount: 'ONE FREE BEER', a: 'adults' },
    { amount: '$13.13', note: 'and a slightly used broomstick', a: 'adults' },
    { amount: 'FIRST DIBS ON THE LEFTOVER PIZZA', a: 'adults' },
    { amount: '$25,000', note: 'for both suspects', a: 'couples' },
    { amount: 'TWO TICKETS TO THE HAUNTED HAYRIDE', a: 'couples' },
    { amount: 'ONE MILLION PIECES OF CANDY', a: 'families' },
    { amount: 'A YEAR’S SUPPLY OF PUMPKIN PIE', a: 'families' },
    { amount: '$10,000', note: 'payable in candy corn', a: 'all' },
  ];

  L.warnings = [
    'Approach With Chocolate',
    'May Cause Giggles',
    'Known Snack Thief',
    'May Say BOO Without Warning',
    'Approach With Caffeine',
    'Armed With Terrible Dance Moves',
    'Known to Ghost Everyone',
    'Extremely Loud and Questionably Dangerous',
    'Do Not Approach',
    'Armed With Bad Jokes',
    'Extremely Suspicious',
    'Considered Dangerous',
    'Known Candy Thief',
    'Do Not Feed After Midnight',
    'Bites (Mostly Snacks)',
  ];

  L.footers = [
    'Report Sightings to the Haunted Sheriff',
    'Last Seen Near the Candy Bowl',
    'Proceed at Your Own Risk',
    "Property of the Halloween Sheriff's Department",
    'Any Information Leading to Capture Will Be Rewarded',
  ];

  L.lastSeen = [
    'Near the candy bowl',
    'Lurking by the punch bowl',
    'Behind the haunted hedge',
    'On the dance floor, unfortunately',
    'Fleeing the pumpkin patch',
    'Asleep on the couch',
    'Heading for the exit without saying goodbye',
    'Near the cookie jar',
  ];

  global.Library = L;
})(typeof window !== 'undefined' ? window : globalThis);
