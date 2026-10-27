import type { Scene } from '../types';

/**
 * Short branching role-plays. Every option points at a real phrase id so the
 * same dataset powers browsing, rehearsal and quizzes — one source of truth.
 */
export const SCENES: Scene[] = [
  {
    id: 'scene-bus',
    situationId: 'transport',
    title: 'Catching the right bus',
    intro: 'You are at the Mysuru bus stand. A bus pulls in and you are not sure it is yours.',
    turns: [
      {
        promptKn: 'ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು?',
        promptRom: 'Ellige hogabeku?',
        promptEn: 'The conductor asks: “Where do you want to go?”',
        options: [
          { phraseId: 'transport-2', label: '“Does this go to Mysuru?”', feedback: 'Good — confirm the route before you board.', good: true },
          { phraseId: 'transport-3', label: '“How much is the ticket?”', feedback: 'Too early — first check that the bus actually goes there.', good: false },
          { phraseId: 'basics-1', label: '“Hello”', feedback: 'Polite, but it does not solve your problem yet.', good: false },
        ],
      },
      {
        promptKn: 'ಹೌದು, ಒಳಗೆ ಬನ್ನಿ.',
        promptRom: 'Haudu, olage banni.',
        promptEn: '“Yes, come in.” You sit down and the conductor approaches.',
        options: [
          { phraseId: 'transport-3', label: '“How much is the ticket?”', feedback: 'Exactly right — always confirm the fare.', good: true },
          { phraseId: 'transport-6', label: '“I need to get down here”', feedback: 'Not yet — you have only just boarded.', good: false },
          { phraseId: 'food-2', label: '“I need water”', feedback: 'Not the priority on a moving bus.', good: false },
        ],
      },
      {
        promptKn: 'ನಿಮ್ಮ ನಿಲ್ದಾಣ ಬಂದಿದೆ.',
        promptRom: 'Nimma nildana bandide.',
        promptEn: '“Your stop has arrived.” You want to be sure before stepping off.',
        options: [
          { phraseId: 'transport-5', label: '“Which is the next stop?”', feedback: 'Good check if you are unsure, then get ready to get down.', good: true },
          { phraseId: 'transport-8', label: '“Stop here, please”', feedback: 'Close — but this phrase is for autos and taxis, not a bus at a stop.', good: false },
          { phraseId: 'basics-4', label: '“Excuse me”', feedback: 'Polite, but it does not get you off the bus.', good: false },
        ],
      },
    ],
  },
  {
    id: 'scene-market',
    situationId: 'market',
    title: 'Buying vegetables',
    intro: 'You are at a market stall in Bengaluru and want a kilo of tomatoes.',
    turns: [
      {
        promptKn: 'ಏನು ಬೇಕು?',
        promptRom: 'Enu beku?',
        promptEn: 'The vendor asks: “What do you want?”',
        options: [
          { phraseId: 'market-2', label: '“Give me one kilo”', feedback: 'Clear and direct — add the item name while pointing.', good: true },
          { phraseId: 'market-5', label: '“Please give me the bill”', feedback: 'You have not bought anything yet.', good: false },
          { phraseId: 'basics-6', label: '“I am fine”', feedback: 'That answers a greeting, not a question about shopping.', good: false },
        ],
      },
      {
        promptKn: 'ಅರವತ್ತು ರೂಪಾಯಿ.',
        promptRom: 'Aravattu rupayi.',
        promptEn: '“Sixty rupees.” You think that is a little high.',
        options: [
          { phraseId: 'market-3', label: '“Please reduce the price a little”', feedback: 'Perfect — say it with a smile.', good: true },
          { phraseId: 'market-4', label: '“Is it fresh?”', feedback: 'Useful, but it does not address the price.', good: false },
          { phraseId: 'basics-4', label: '“Sorry”', feedback: 'Not needed — bargaining is normal here.', good: false },
        ],
      },
      {
        promptKn: 'ಸರಿ, ಐವತ್ತು ಕೊಡಿ.',
        promptRom: 'Sari, aivattu kodi.',
        promptEn: '“Okay, give fifty.” Time to pay.',
        options: [
          { phraseId: 'market-8', label: '“Do you take UPI?”', feedback: 'Right — most Karnataka stalls accept UPI.', good: true },
          { phraseId: 'market-6', label: '“I need a bag”', feedback: 'Good, but ask about payment first.', good: false },
          { phraseId: 'market-7', label: '“Show me another one”', feedback: 'You already agreed on the price.', good: false },
        ],
      },
    ],
  },
  {
    id: 'scene-health',
    situationId: 'health',
    title: 'At the pharmacy',
    intro: 'You have a fever and need to be certain about the dosage.',
    turns: [
      {
        promptKn: 'ಏನು ಸಮಸ್ಯೆ?',
        promptRom: 'Enu samasye?',
        promptEn: 'The pharmacist asks: “What is the problem?”',
        options: [
          { phraseId: 'health-1', label: '“I have a fever”', feedback: 'Good — start with the symptom.', good: true },
          { phraseId: 'health-7', label: '“Is the doctor available?”', feedback: 'The pharmacist can still help with basic medicines.', good: false },
          { phraseId: 'basics-2', label: '“Thank you”', feedback: 'You have not described the problem yet.', good: false },
        ],
      },
      {
        promptKn: 'ಈ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ.',
        promptRom: 'Ee aushadhi tegedukolli.',
        promptEn: '“Take this medicine.” You did not catch the dosage.',
        options: [
          { phraseId: 'health-4', label: '“How many times a day?”', feedback: 'Essential — never leave without confirming the dosage.', good: true },
          { phraseId: 'health-3', label: '“Where can I get the medicine?”', feedback: 'It is already in front of you.', good: false },
          { phraseId: 'basics-8', label: '“Please speak slowly”', feedback: 'Helpful, but you still need the dosage.', good: false },
        ],
      },
      {
        promptKn: 'ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ.',
        promptRom: 'Dinakke eradu baari.',
        promptEn: '“Twice a day.” One last safety check.',
        options: [
          { phraseId: 'health-5', label: '“Should I take it after food?”', feedback: 'Excellent — this is the question that prevents mistakes.', good: true },
          { phraseId: 'health-6', label: '“I have an allergy”', feedback: 'Important if true, but say it before accepting a medicine.', good: false },
          { phraseId: 'health-8', label: '“Please write it down”', feedback: 'A good backup plan — keep this in mind as an alternative.', good: false },
        ],
      },
    ],
  },
  {
    id: 'scene-work',
    situationId: 'work',
    title: 'First day at college',
    intro: 'It is your first day and a classmate speaks quickly in Kannada.',
    turns: [
      {
        promptKn: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?',
        promptRom: 'Nimma hesaru enu?',
        promptEn: '“What is your name?”',
        options: [
          { phraseId: 'work-1', label: '“My name is …”', feedback: 'Natural start to any introduction.', good: true },
          { phraseId: 'work-2', label: '“I am new here”', feedback: 'Also friendly — but they asked for your name.', good: false },
          { phraseId: 'basics-1', label: '“Hello”', feedback: 'Warm, but it does not answer the question.', good: false },
        ],
      },
      {
        promptKn: 'ನಾಳೆ ಸಭೆ ಇದೆ.',
        promptRom: 'Naale sabhe ide.',
        promptEn: '“There is a meeting tomorrow.” You did not understand.',
        options: [
          { phraseId: 'work-3', label: '“Please repeat that”', feedback: 'Good — honest and polite.', good: true },
          { phraseId: 'work-6', label: '“When is the meeting?”', feedback: 'Also a smart follow-up if you caught the word “meeting”.', good: false },
          { phraseId: 'basics-2', label: '“Thank you”', feedback: 'Polite, but you would still be confused.', good: false },
        ],
      },
      {
        promptKn: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಒಂಬತ್ತು ಗಂಟೆ.',
        promptRom: 'Naale beligge ombattu gante.',
        promptEn: '“Tomorrow morning at nine.” You want to keep learning.',
        options: [
          { phraseId: 'work-7', label: '“How do you say this in Kannada?”', feedback: 'Great — it turns every conversation into a lesson.', good: true },
          { phraseId: 'work-8', label: '“See you tomorrow”', feedback: 'A lovely goodbye — use it after you finish asking.', good: false },
          { phraseId: 'emergency-8', label: '“I am safe”', feedback: 'Not relevant here.', good: false },
        ],
      },
    ],
  },
];
