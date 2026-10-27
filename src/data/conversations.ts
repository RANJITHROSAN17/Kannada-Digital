import type { ConversationScenario } from '../types';

/**
 * Role-play scenes. The learner always plays themselves; the other speaker is
 * written in natural spoken Kannada (slightly colloquial, as people actually
 * talk), while every line the learner can say is a clean, reusable sentence.
 *
 * `tone` marks an option as `risky` when it would be understood but sounds
 * blunt or awkward — the simulator explains the difference instead of failing
 * the learner, which is how a real conversation teaches.
 */
export const conversations: ConversationScenario[] = [
  {
    id: 'bus-conductor',
    title: 'Boarding a bus',
    kannadaTitle: 'ಬಸ್‌ನಲ್ಲಿ ಕಂಡಕ್ಟರ್',
    category: 'transport',
    setting: 'A KSRTC / BMTC bus door, morning rush. The conductor leans out with change in his hand.',
    whoYouAre: 'A newcomer who needs to reach the bus stand across town.',
    goal: 'Board, pay the right fare, and get off at your stop.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        line: {
          speaker: 'other',
          kannada: 'ಏನು ಸಾರ್? ಎಲ್ಲಿಗೆ ಹೋಗ್ತೀರಿ?',
          transliteration: 'Enu saar? Ellige hogtiri?',
          english: 'Yes sir? Where are you going?',
          note: 'Conductors open with the destination question, not a greeting.',
        },
        options: [
          {
            id: 'n1a',
            kannada: 'ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗಬೇಕು. ಎಷ್ಟು ಟಿಕೆಟ್?',
            transliteration: 'Bus nildanakke hogabeku. Eshtu ticket?',
            english: 'I need to go to the bus station. How much is the ticket?',
            reply: {
              speaker: 'other',
              kannada: 'ಇಪ್ಪತ್ತು ರೂಪಾಯಿ. ಟಿಕೆಟ್ ತಗೊಳ್ಳಿ.',
              transliteration: 'Ippattu roopayi. Ticket tagolli.',
              english: 'Twenty rupees. Take the ticket.',
            },
            explanation:
              'Destination + fare in one breath is exactly how locals speak, so the conductor can answer in one go.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ದಯವಿಟ್ಟು, ನನಗೆ ಎರಡು ಟಿಕೆಟ್ ಬೇಕು.',
                transliteration: 'Dayavittu, nanage eradu ticket beku.',
                english: 'Please, I need two tickets.',
                note: 'Use when someone is travelling with you.',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1b',
            kannada: 'ಮೆಟ್ರೋ ನಿಲ್ದಾಣ ಬಳಿ ಇಳಿಯಬೇಕು.',
            transliteration: 'Metro nildana bali iliyyabeku.',
            english: 'I need to get down near the metro station.',
            reply: {
              speaker: 'other',
              kannada: 'ಆರು ರೂಪಾಯಿ. ಮುಂದಿನ ಸ್ಟಾಪ್‌ನಲ್ಲಿ ಇಳಿಯಿರಿ.',
              transliteration: 'Aaru roopayi. Mundina stop-nalli iliyiri.',
              english: 'Six rupees. Get off at the next stop.',
            },
            explanation:
              'Naming a landmark instead of an area is a good trick — the conductor hears "metro" and knows the stop.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇಳಿಯಬೇಕಾದ ಸ್ಟಾಪ್ ಬಂದಾಗ ಹೇಳಿ.',
                transliteration: 'Iliyabekaada stop bandaga heli.',
                english: 'Please tell me when the stop I need comes.',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1c',
            kannada: 'ಬಿಡಿ, ಮುಂದೆ ಹೋಗಿ.',
            transliteration: 'Bidi, munde hogi.',
            english: 'Leave it, go ahead.',
            reply: {
              speaker: 'other',
              kannada: 'ಟಿಕೆಟ್ ಇಲ್ಲದೆ ಪ್ರಯಾಣ ಮಾಡಬಾರದು ಸಾರ್.',
              transliteration: 'Ticket illade prayana madabardu saar.',
              english: 'You cannot travel without a ticket, sir.',
            },
            explanation:
              'This is how someone brushes off an offer they do not want. Using it with a conductor reads as refusing to pay — understood, but the wrong message.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಕ್ಷಮಿಸಿ, ಎಷ್ಟು ಎಂದು ಅರ್ಥವಾಗಲಿಲ್ಲ.',
                transliteration: 'Kshamisi, eshtu endu arthavagalilla.',
                english: 'Sorry, I did not catch how much.',
                note: 'Always safe: admit you missed the number and ask again.',
              },
            ],
            next: 'n2',
            tone: 'risky',
          },
        ],
      },
      {
        id: 'n2',
        line: {
          speaker: 'other',
          kannada: 'ಟಿಕೆಟ್ ಇಟ್ಟುಕೊಳ್ಳಿ. ಸೀಟ್ ಖಾಲಿ ಇದೆ.',
          transliteration: 'Ticket ittkollilli. Seat khaali ide.',
          english: 'Keep the ticket. There is a seat free.',
        },
        options: [
          {
            id: 'n2a',
            kannada: 'ಧನ್ಯವಾದಗಳು ಸಾರ್. ನನ್ನ ಸ್ಟಾಪ್ ಬಂದಾಗ ಹೇಳಬಹುದೇ?',
            transliteration: 'Dhanyavadagalu saar. Nanna stop bandaga helabahude?',
            english: 'Thank you, sir. Could you tell me when my stop comes?',
            reply: {
              speaker: 'other',
              kannada: 'ಹೌದ್ರಿ, ಹೇಳ್ತೀನಿ. ಕೂತಿರಿ.',
              transliteration: 'Houdri, helptini. Kootiri.',
              english: 'Yes, I will. Sit down.',
            },
            explanation:
              'A small ask, phrased as a question (-ಬಹುದೇ? = "is it possible to"). Conductors say yes far more often to this than to a demand.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ನಾನು ಮೊದಲ ಬಾರಿ ಇದ್ದೇನೆ, ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ.',
                transliteration: 'Naanu modal baari iddene, dayavittu sahaaya maadi.',
                english: 'This is my first time, please help me.',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
          {
            id: 'n2b',
            kannada: 'ಈ ಸೀಟ್ ನನಗೆ ಸಿಗುತ್ತದೆಯೇ?',
            transliteration: 'I seat nanage sigguttadeya?',
            english: 'Can I get this seat?',
            reply: {
              speaker: 'other',
              kannada: 'ಇಲ್ಲ ಸಾರ್, ಆ ಸೀಟ್ ಜನ ಆಕ್ಯುಪೈ ಮಾಡಿದ್ದಾರೆ.',
              transliteration: 'Illa saar, a seat jana occupy maadiddaare.',
              english: 'No sir, people have taken that seat.',
            },
            explanation:
              'Understood, and perfectly usable. The more idiomatic version is ಈ ಸೀಟ್ ಖಾಲಿ ಇದೆಯೇ? — ಖಾಲಿ (khaali, "free/vacant") is the word people reach for.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇದು ಖಾಲಿ ಇದೆಯೇ?',
                transliteration: 'Idu khaali ideya?',
                english: 'Is this free?',
              },
            ],
            next: 'n3',
            tone: 'neutral',
          },
        ],
      },
      {
        id: 'n3',
        line: {
          speaker: 'other',
          kannada: 'ಸಾರ್, ನಿಮ್ಮ ಸ್ಟಾಪ್!',
          transliteration: 'Saar, nimma stop!',
          english: 'Sir, your stop!',
        },
        options: [
          {
            id: 'n3a',
            kannada: 'ಆಯ್ತು, ಧನ್ಯವಾದಗಳು!',
            transliteration: 'Aytu, dhanyavadagalu!',
            english: 'Okay, thank you!',
            reply: {
              speaker: 'other',
              kannada: 'ಬನ್ನಿ ಸಾರ್.',
              transliteration: 'Banni saar.',
              english: 'You are welcome, sir.',
              note: 'ಬನ್ನಿ literally "come" — used as "welcome" in Kannada.',
            },
            explanation:
              'Short thanks is enough here. ಬನ್ನಿ as a reply means "welcome" — a very Kannada way to close.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ನನಗೆ ಸಹಾಯ ಮಾಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ.',
                transliteration: 'Nanage sahaaya maadiddakke dhanyavada.',
                english: 'Thanks for helping me.',
              },
            ],
            next: 'end',
            tone: 'smooth',
          },
        ],
      },
    ],
    takeaways: [
      'Name the destination first, then ask the fare — you get an answer in one turn.',
      'ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗಬೇಕು is reusable in any town in Karnataka.',
      'Asking ಬಂದಾಗ ಹೇಳಬಹುದೇ? turns a stranger into your stop alarm.',
    ],
  },
  {
    id: 'vegetable-market',
    title: 'Buying vegetables at the market',
    kannadaTitle: 'ಸಬ್ಜಿ ಅಂಗಡಿಯಲ್ಲಿ',
    category: 'shopping',
    setting: 'A morning vegetable stall with crates on the ground. The vendor is weighing for another customer.',
    whoYouAre: 'Someone cooking at home for the first week in a new city.',
    goal: 'Buy two items, agree a price, and pack without plastic.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        line: {
          speaker: 'other',
          kannada: 'ಏನು ಬೇಕು? ಹೊಸತು ಸಾರ್?',
          transliteration: 'Enu beku? Hosatu saar?',
          english: 'What do you need? New around here, sir?',
        },
        options: [
          {
            id: 'n1a',
            kannada: 'ಹೌದು, ನಾನು ಇಲ್ಲಿ ಹೊಸಬರು. ಒಂದು ಕಿಲೋ ಟೊಮೆಟೊ ಕೊಡಿ.',
            transliteration: 'Haadu, naanu illi hosabaru. Ondu kilo tomato kodi.',
            english: "Yes, I'm new here. One kilo of tomatoes, please.",
            reply: {
              speaker: 'other',
              kannada: 'ಆಯ್ತು. ಟೊಮೆಟೊ ನಲವತ್ತು ರೂಪಾಯಿ ಕೆಜಿಗೆ.',
              transliteration: 'Aytu. Tomato nalavattu roopayi kilo-ge.',
              english: 'Okay. Tomatoes are forty rupees a kilo.',
            },
            explanation:
              'Admitting you are new earns patience. Quantity + ಕೊಡಿ is the safest request shape in any Kannada shop.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಅರ್ಧ ಕಿಲೋ ಸಾಕು.',
                transliteration: 'Ardha kilo saaku.',
                english: 'Half a kilo is enough.',
                note: 'ಸಾಕು (saaku) = "enough" — the polite way to stop a vendor from piling on more.',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1b',
            kannada: 'ಈ ಟೊಮೆಟೊ ತಾಜಾ ಇದೆಯೇ?',
            transliteration: 'I tomato taaja ideya?',
            english: 'Are these tomatoes fresh?',
            reply: {
              speaker: 'other',
              kannada: 'ಇವು ಬೆಳಗ್ಗೆ ಬಂದದ್ದು ಸಾರ್. ನೋಡಿ, ಆಯ್ಕೆ ಮಾಡಿ.',
              transliteration: 'Ivu belagge bandaddu saar. Nodi, aayke maadi.',
              english: 'These came this morning. Look, pick them yourself.',
            },
            explanation:
              'Being invited to choose is normal and not an insult — ಆಯ್ಕೆ ಮಾಡಿ means "pick/choose".',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇದಕ್ಕಿಂತ ಕಡಿಮೆ ಸಿಗುತ್ತದೆಯೇ?',
                transliteration: 'Idakkinta kadime sigguttadeya?',
                english: 'Can I get them for less than this?',
              },
            ],
            next: 'n2',
            tone: 'neutral',
          },
        ],
      },
      {
        id: 'n2',
        line: {
          speaker: 'other',
          kannada: 'ಬೇರೆ ಏನಾದರೂ ಹಾಕವೇ?',
          transliteration: 'Bere enaadu haakave?',
          english: 'Shall I add anything else?',
        },
        options: [
          {
            id: 'n2a',
            kannada: 'ಅರವತ್ತು ಗ್ರಾಮ್ ಈರುಳ್ಳಿ ಹಾಕಿ.',
            transliteration: 'Aravattu gram yerulli haaki.',
            english: 'Add sixty grams of onions.',
            reply: {
              speaker: 'other',
              kannada: 'ಹಾಕ್ತೀನಿ. ಒಟ್ಟು ನೂರೈವತ್ತು ಆಯ್ತು.',
              transliteration: 'Haaktini. Ottu nooru aaivu aytu.',
              english: 'Adding it. One hundred eight in total.',
            },
            explanation:
              'Small quantities are asked in grams, not fractions, at fruit and vegetable stalls — the vendor hears the number and reaches for the weighing machine.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಎರಡು ಕೆಜಿ ಆಲೂಗಡ್ಡೆ ಕೊಡಿ.',
                transliteration: 'Eradu kilo aaloogadde kodi.',
                english: 'Two kilos of potatoes, please.',
                note: 'ಆಲೂಗಡ್ಡೆ (aaloogadde) is the Kannada word for potato.',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
          {
            id: 'n2b',
            kannada: 'ಇನ್ನೂ ಬೇಡ.',
            transliteration: 'Innu beda.',
            english: 'Nothing more, thanks.',
            reply: {
              speaker: 'other',
              kannada: 'ಸರಿ. ಒಟ್ಟು ನೂರು ರೂಪಾಯಿ.',
              transliteration: 'Sari. Ottu nooru roopayi.',
              english: 'Fine. One hundred rupees total.',
            },
            explanation:
              'A complete sentence to decline more — better than shaking your head, which can read as impolite at a stall.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಬೇಡ, ಧನ್ಯವಾದಗಳು.',
                transliteration: 'Beda, dhanyavadagalu.',
                english: 'No, thank you.',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n3',
        line: {
          speaker: 'other',
          kannada: 'ಚೀಲ ಹಾಕವೇ?',
          transliteration: 'Cheela haakave?',
          english: 'Shall I put it in a cover?',
        },
        options: [
          {
            id: 'n3a',
            kannada: 'ಪ್ಲಾಸ್ಟಿಕ್ ಬೇಡ, ನನ್ನ ಬ್ಯಾಗ್ ಇದೆ.',
            transliteration: 'Plastic beda, nanna bag ide.',
            english: 'No plastic, I have my own bag.',
            reply: {
              speaker: 'other',
              kannada: 'ಹೌದ್ರಿ, ಚೆನ್ನಾಯ್ತು. UPI ಆಗುತ್ತದೆ.',
              transliteration: 'Houdri, chennaaytu. UPI aaguttade.',
              english: 'Yes, good. UPI works here.',
            },
            explanation:
              'Karnataka bans single-use plastic carry bags in most cities, so this line is normal — vendors usually approve.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ನಗದು ಕೊಡುತ್ತೇನೆ.',
                transliteration: 'Nagadu koduttene.',
                english: 'I will pay in cash.',
              },
            ],
            next: 'n4',
            tone: 'smooth',
          },
          {
            id: 'n3b',
            kannada: 'ರಸೀದಿ ಕೊಡಿ.',
            transliteration: 'Rasidi kodi.',
            english: 'Please give me the receipt.',
            reply: {
              speaker: 'other',
              kannada: 'ಇಲ್ಲಿ ರಸೀದಿ ಇಲ್ಲ ಸಾರ್, ಮಾತಿನ ಲೆಕ್ಕ.',
              transliteration: 'Illi rasidi illa saar, maathina lekka.',
              english: 'There is no bill here sir, we count by word of mouth.',
            },
            explanation:
              'Perfectly fine to ask; on a street stall the honest answer is usually no. You have now heard ಮಾತಿನ ಲೆಕ್ಕ (verbal accounting).',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಸರಿ, ಕೊಡುತ್ತೇನೆ.',
                transliteration: 'Sari, koduttene.',
                english: 'Okay, I am paying.',
              },
            ],
            next: 'n4',
            tone: 'neutral',
          },
        ],
      },
      {
        id: 'n4',
        line: {
          speaker: 'other',
          kannada: 'ನಾಳೆ ಬನ್ನಿ, ಹೊಸ ಸಬ್ಜಿ ಬರುತ್ತೆ.',
          transliteration: 'Naale banni, hosu sabji barutte.',
          english: 'Come tomorrow, fresh stock arrives.',
        },
        options: [
          {
            id: 'n4a',
            kannada: 'ಒಳ್ಳೆಯದು. ನಾಳೆ ಬರುತ್ತೇನೆ, ಧನ್ಯವಾದಗಳು.',
            transliteration: 'Olleyadu. Naale baruttene, dhanyavadagalu.',
            english: 'Good. I will come tomorrow, thank you.',
            reply: {
              speaker: 'other',
              kannada: 'ಬನ್ನಿ, ನಾಳೆ ಕಾಯ್ತೀನಿ.',
              transliteration: 'Banni, naale kaytini.',
              english: 'Come, I will wait for you tomorrow.',
            },
            explanation:
              'Returning to one vendor is how you get the good produce and the fair price in a Karnataka market.',
            alternatives: [],
            next: 'end',
            tone: 'smooth',
          },
        ],
      },
    ],
    takeaways: [
      'Quantity + item + ಕೊಡಿ works at every stall in the state.',
      'ಸಾಕು and ಇನ್ನೂ ಬೇಡ are the two gentle ways to say "that is enough".',
      'Bringing your own bag is normal, and often welcomed.',
    ],
  },
  {
    id: 'tea-shop-order',
    title: 'Ordering at a tea shop',
    kannadaTitle: 'ಟೀಶಪ್‌ನಲ್ಲಿ ಆಟ',
    category: 'food',
    setting: 'A busy evening tea stall. Someone calls your order to the back.',
    whoYouAre: 'A colleague invited you for evening tea.',
    goal: 'Order a drink and a snack, ask for less spice, and pay the bill.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        line: {
          speaker: 'other',
          kannada: 'ಹೇಳಿ ಸಾರ್, ಏನು ಕೊಡವುದು?',
          transliteration: 'Heli saar, enu kodavudu?',
          english: 'Tell me sir, what shall I give?',
        },
        options: [
          {
            id: 'n1a',
            kannada: 'ಒಂದು ಫಿಲ್ಟರ್ ಕಾಫಿ ಮತ್ತು ಎರಡು ಇಡ್ಲಿ ಕೊಡಿ.',
            transliteration: 'Ondu filter coffee mattu eradu idli kodi.',
            english: 'One filter coffee and two idlis, please.',
            reply: {
              speaker: 'other',
              kannada: 'ಇಡ್ಲಿ ಖಾಲಿ. ದೋಸೆ ಹಾಕ್ಲಾ?',
              transliteration: 'Idli khaali. Dose haakla?',
              english: 'Idlis are over. Shall I give a dose?',
            },
            explanation:
              'ಸಿಗುವುದಿಲ್ಲ / ಖಾಲಿ is how "out of stock" is said. And here is your first real menu negotiation.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಬೇರೆ ಏನಾದರೂ ಇದೆಯೇ?',
                transliteration: 'Bere enaadu ideya?',
                english: 'Is there anything else?',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1b',
            kannada: 'ಮೆನು ತೋರಿಸಿ.',
            transliteration: 'Menu torisi.',
            english: 'Please show me the menu.',
            reply: {
              speaker: 'other',
              kannada: 'ಇಲ್ಲಿ ಮೆನು ಇಲ್ಲ ಸಾರ್, ಗೋಡೆ ಮೇಲೆ ಬರೆದಿದೆ.',
              transliteration: 'Illi menu illa saar, gode mele baredide.',
              english: 'No menu here sir, it is written on the wall.',
            },
            explanation:
              'Most tea stalls list items on the wall, not on paper. This exchange happens constantly.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇಲ್ಲಿ ಏನು ಒಳ್ಳೆಯದು?',
                transliteration: 'Illi enu olleyadu?',
                english: 'What is good here?',
                note: 'Asking for the stall\'s special is the fastest way to a good meal.',
              },
            ],
            next: 'n2',
            tone: 'neutral',
          },
        ],
      },
      {
        id: 'n2',
        line: {
          speaker: 'other',
          kannada: 'ದೋಸೆ ಸಾರ್. ಏನಾದರೂ ಸೇರಿಸವುದೇ?',
          transliteration: 'Dose saar. Enaadu serisavude?',
          english: 'One dose, sir. Add anything to it?',
        },
        options: [
          {
            id: 'n2a',
            kannada: 'ಖಾರ ಕಡಿಮೆ ಮಾಡಿ.',
            transliteration: 'Khaara kadime maadi.',
            english: 'Please make it less spicy.',
            reply: {
              speaker: 'other',
              kannada: 'ಸರಿ, ಕಡಿಮೆ ಚಟ್ನಿ ಹಾಕ್ತೀನಿ.',
              transliteration: 'Sari, kadime chetni haaktini.',
              english: 'Okay, I will put less chutney.',
            },
            explanation:
              'At a tea stall, spice usually means the chutney or the masala — the cook adjusts instantly.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಚಟ್ನಿ ಜಾಸ್ತಿ ಕೊಡಿ.',
                transliteration: 'Chetni jaasti kodi.',
                english: 'Give more chutney.',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
          {
            id: 'n2b',
            kannada: 'ಬೇಗ ಮಾಡಿ, ನನಗೆ ಟೈಮ್ ಇಲ್ಲ.',
            transliteration: 'Bega maadi, nanage time illa.',
            english: 'Make it fast, I have no time.',
            reply: {
              speaker: 'other',
              kannada: 'ಆಯ್ತು ಸಾರ್, ಐದೇ ನಿಮಿಷ.',
              transliteration: 'Aytu saar, aide nimisha.',
              english: 'Alright sir, five minutes only.',
            },
            explanation:
              'Understood, but it comes out flat. Softer: "ಎಷ್ಟು ಹೊತ್ತಾಗುತ್ತದೆ?" asks the same thing without pressure.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಎಷ್ಟು ಹೊತ್ತಾಗುತ್ತದೆ?',
                transliteration: 'Eshtu hottaguttade?',
                english: 'How long will it take?',
              },
            ],
            next: 'n3',
            tone: 'risky',
          },
        ],
      },
      {
        id: 'n3',
        line: {
          speaker: 'other',
          kannada: 'ದೋಸೆ ಸಿಕ್ಕಿತೇ? ರುಚಿ ನೋಡಿದಿರಾ?',
          transliteration: 'Dose sitthe? Ruchi nodidira?',
          english: 'Did you get the dose? Tried the taste?',
        },
        options: [
          {
            id: 'n3a',
            kannada: 'ತುಂಬಾ ರುಚಿಯಾಗಿದೆ!',
            transliteration: 'Tumba ruchiyaagide!',
            english: 'It is really tasty!',
            reply: {
              speaker: 'other',
              kannada: 'ಸಂತೋಷ ಸಾರ್. ಮತ್ತೆ ಬನ್ನಿ.',
              transliteration: 'Santhosha saar. Matte banni.',
              english: 'Glad to hear it sir. Come again.',
            },
            explanation:
              'Complimenting the food is the single easiest way to be remembered kindly by a small shop anywhere in Karnataka.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇನ್ನೊಂದು ದೋಸೆ ಕೊಡಿ.',
                transliteration: 'Innondu dose kodi.',
                english: 'One more dose, please.',
              },
            ],
            next: 'n4',
            tone: 'smooth',
          },
          {
            id: 'n3b',
            kannada: 'ಇನ್ನೂ ಬೇಡ.',
            transliteration: 'Innu beda.',
            english: 'Nothing more, thanks.',
            reply: {
              speaker: 'other',
              kannada: 'ಸರಿ, ಎಪ್ಪತ್ತು ರೂಪಾಯಿ ಆಗುತ್ತೆ.',
              transliteration: 'Sari, eppattu roopayi aagutte.',
              english: 'Okay, that comes to seventy rupees.',
            },
            explanation: 'A clean way to close the order before the bill arrives.',
            alternatives: [],
            next: 'n4',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n4',
        line: {
          speaker: 'other',
          kannada: 'ಬಿಲ್ ಕಟ್ಟಬೇಕು ಸಾರ್.',
          transliteration: 'Bill kattabeku saar.',
          english: 'You have to pay the bill, sir.',
        },
        options: [
          {
            id: 'n4a',
            kannada: 'UPI ಕೊಡಿ, ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತೇನೆ.',
            transliteration: 'UPI kodi, scan maaduttene.',
            english: 'Give me the UPI (QR), I will scan it.',
            reply: {
              speaker: 'other',
              kannada: 'ಇಲ್ಲಿ ಸಾರ್. ಪೇಮೆಂಟ್ ಆಯ್ತು.',
              transliteration: 'Illi saar. Payment aytu.',
              english: 'Here sir. Payment is done.',
            },
            explanation:
              'Even small stalls keep a QR plate out. Ask for it rather than assuming the stall takes only cash.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಎಷ್ಟು ಎಂದಿರಿ ಸಾರ್?',
                transliteration: 'Eshtu endiri saar?',
                english: 'How much did you say, sir?',
              },
            ],
            next: 'end',
            tone: 'smooth',
          },
        ],
      },
    ],
    takeaways: [
      'Ordering one item and a side in a single sentence avoids a second round trip.',
      'Rupees are usually said as numbers: ಇಪ್ಪತ್ತು (20), ನಲವತ್ತು (40), ನೂರು (100).',
      'A compliment and ಇನ್ನೂ ಬೇಡ book-end almost every food conversation.',
    ],
  },
  {
    id: 'clinic-visit',
    title: 'Explaining a problem at a clinic',
    kannadaTitle: 'ಕ್ಲಿನಿಕ್‌ನಲ್ಲಿ',
    category: 'health',
    setting: 'A government hospital OP room. You have the token slip in hand.',
    whoYouAre: 'A student with a two-day fever and a headache.',
    goal: 'Describe symptoms, understand the dosage, and leave without guessing.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        line: {
          speaker: 'other',
          kannada: 'ಏನು ಸಮಸ್ಯೆ?',
          transliteration: 'Enu samasye?',
          english: 'What is the problem?',
        },
        options: [
          {
            id: 'n1a',
            kannada: 'ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ. ತಲೆ ನೋವಾಗುತ್ತಿದೆ.',
            transliteration: 'Eradu dinagalinda jvara ide. Tale novaguttide.',
            english: 'I have had a fever for two days. My head hurts.',
            reply: {
              speaker: 'other',
              kannada: 'ಬೆಳಗ್ಗೆ ಎಷ್ಟು ಇತ್ತು? ಬೇರೆ ನೋವು ಇದೆಯಾ?',
              transliteration: 'Belagge eshtu ittu? Bere novu ideyaa?',
              english: 'What was it in the morning? Any other pain?',
            },
            explanation:
              'Duration + body part + ನೋವು gives a doctor usable information in one line. This is the highest-value Kannada you can learn.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ರಾತ್ರಿ ಹೆಚ್ಚು ಆಗುತ್ತಿದೆ.',
                transliteration: 'Raatri hecchu aaguttide.',
                english: 'It gets worse at night.',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1b',
            kannada: 'ಇಲ್ಲಿ ನೋವಾಗುತ್ತಿದೆ.',
            transliteration: 'Illi novaguttide.',
            english: 'It hurts here.',
            reply: {
              speaker: 'other',
              kannada: 'ಇಲ್ಲಿ ಅಂತ ಒತ್ತಿದಾಗ ನೋವೇ?',
              transliteration: 'Illi anta ottidaaga nove?',
              english: 'Does it hurt when I press here?',
            },
            explanation:
              'Pointing plus one sentence is enough when you cannot name the body part yet. The doctor will confirm by touching.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಹೌದು, ನೋವಾಗುತ್ತಿದೆ.',
                transliteration: 'Haadu, novaguttide.',
                english: 'Yes, it hurts.',
              },
              {
                speaker: 'user',
                kannada: 'ಇಲ್ಲ, ಈಗ ನೋವಿಲ್ಲ.',
                transliteration: 'Illa, iga novilla.',
                english: 'No, it does not hurt now.',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n2',
        line: {
          speaker: 'other',
          kannada: 'ಯಾವಾದರೂ ಔಷಧ ಸೇವಿಸಿದ್ದೀರಾ?',
          transliteration: 'Yaavaadu ausadha sevisiddira?',
          english: 'Have you taken any medicine?',
        },
        options: [
          {
            id: 'n2a',
            kannada: 'ನಾನು ಒಂದೇ ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ. ಬೇರೆ ಏನೂ ಇಲ್ಲ.',
            transliteration: 'Naanu onde maatre tegedukondiddene. Bere enu illa.',
            english: 'I took only one tablet. Nothing else.',
            reply: {
              speaker: 'other',
              kannada: 'ಸರಿ. ಈ ಔಷಧ ಮೂರು ದಿನ ಸೇವಿಸಿ.',
              transliteration: 'Sari. I ausadha mooru dina sevisi.',
              english: 'Fine. Take this medicine for three days.',
            },
            explanation:
              'Answer honestly — doctors change prescriptions based on what you already took.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇನ್ನೂ ಏನೂ ತೆಗೆದುಕೊಂಡಿಲ್ಲ.',
                transliteration: 'Innu enu tegedukondilla.',
                english: 'I have not taken anything yet.',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
          {
            id: 'n2b',
            kannada: 'ನನಗೆ ಈ ಔಷಧದಿಂದ ಅಲರ್ಜಿ ಆಗುತ್ತದೆ.',
            transliteration: 'Nanage i ausadhinda allergy aaguttade.',
            english: 'I get an allergic reaction to this medicine.',
            reply: {
              speaker: 'other',
              kannada: 'ಅದನ್ನು ನಿಲ್ಲಿಸಿ. ಬೇರೆ ಔಷಧ ಕೊಡುತ್ತೇನೆ.',
              transliteration: 'Adannu nilisi. Bere ausadha koduttene.',
              english: 'Stop that one. I will give a different medicine.',
            },
            explanation:
              'Say this before accepting any prescription. It changes the prescription immediately — it is not an inconvenience.',
            alternatives: [],
            next: 'n3',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n3',
        line: {
          speaker: 'other',
          kannada: 'ಈ ಮಾತ್ರೆ ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ.',
          transliteration: 'I maatre dinakke eradu baari tegedukolli.',
          english: 'Take this tablet twice a day.',
        },
        options: [
          {
            id: 'n3a',
            kannada: 'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಅಥವಾ ಊಟದ ನಂತರ?',
            transliteration: 'Khaali hotteyalli athava uttada nantara?',
            english: 'On an empty stomach or after food?',
            reply: {
              speaker: 'other',
              kannada: 'ಊಟದ ನಂತರ. ಐದು ದಿನ ಸಾಕು.',
              transliteration: 'Uttada nantara. Aidu dina saaku.',
              english: 'After food. Five days is enough.',
            },
            explanation:
              'Two choices in a question get a two-word answer. This one line prevents the most common dosage mistake.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಸರಿ, ಎಷ್ಟು ದಿನ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?',
                transliteration: 'Sari, eshtu dina tegedukollabeku?',
                english: 'Okay, how many days must I take it?',
              },
            ],
            next: 'n4',
            tone: 'smooth',
          },
          {
            id: 'n3b',
            kannada: 'ದಯವಿಟ್ಟು ಪೇಪರ್ ಮೇಲೆ ಬರೆಯಿರಿ.',
            transliteration: 'Dayavittu paper mele bareyeri.',
            english: 'Please write it on the paper.',
            reply: {
              speaker: 'other',
              kannada: 'ಬರೆಯುತ್ತೇನೆ: ಬೆಳಗ್ಗೆ ಒಂದು, ರಾತ್ರಿ ಒಂದು.',
              transliteration: 'Bareyuttene: belagge ondu, raatri ondu.',
              english: 'Writing it: one in the morning, one at night.',
            },
            explanation:
              'Asking for the prescription in writing is completely acceptable and useful when you cannot read Kannada well yet.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ನನಗೆ ಕನ್ನಡ ಓದಲು ಬರುತ್ತಿಲ್ಲ.',
                transliteration: 'Nanage Kannada odalu baruttilla.',
                english: "I cannot read Kannada.",
                note: 'Saying this early stops a stream of written instructions you cannot use.',
              },
            ],
            next: 'n4',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n4',
        line: {
          speaker: 'other',
          kannada: 'ಮೂರು ದಿನದ ನಂತರ ಬನ್ನಿ.',
          transliteration: 'Mooru dinada nantara banni.',
          english: 'Come again after three days.',
        },
        options: [
          {
            id: 'n4a',
            kannada: 'ಧನ್ಯವಾದಗಳು ಡಾಕ್ಟರ್. ನಾನು ಮೂರು ದಿನದ ಮೇಲೆ ಬರುತ್ತೇನೆ.',
            transliteration: 'Dhanyavadagalu doctor. Naanu mooru dinada mele baruttene.',
            english: 'Thank you, doctor. I will come after three days.',
            reply: {
              speaker: 'other',
              kannada: 'ಸರಿ. ನೀರು ಜಾಸ್ತಿ ಕುಡಿಯಿರಿ.',
              transliteration: 'Sari. Neeru jaasti kudiyiri.',
              english: 'Fine. Drink more water.',
            },
            explanation:
              'Repeating the date back is how you confirm you understood — works in any language, at any counter.',
            alternatives: [],
            next: 'end',
            tone: 'smooth',
          },
        ],
      },
    ],
    takeaways: [
      'Duration + part + ನೋವು is a complete symptom sentence.',
      'Ask the food-or-empty-stomach question before leaving the room.',
      'Repeating the follow-up date back confirms you understood.',
    ],
  },
  {
    id: 'auto-ride',
    title: 'Taking an auto and confirming the drop',
    kannadaTitle: 'ಆಟೋ ಪ್ರಯಾಣ',
    category: 'directions',
    setting: 'An auto pulls up outside your PG. The driver looks at the traffic ahead.',
    whoYouAre: 'A commuter late for a college lab session.',
    goal: 'Agree the route, use the meter, and get dropped at the exact gate.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        line: {
          speaker: 'other',
          kannada: 'ಎಲ್ಲಿಗೆ ಸಾರ್?',
          transliteration: 'Ellige saar?',
          english: 'Where to, sir?',
        },
        options: [
          {
            id: 'n1a',
            kannada: 'ಸರ್ವಿಸ್ ರೋಡ್ ಕಾಲೇಜು ಗೇಟ್. ಮೀಟರ್ ಹಾಕಿ.',
            transliteration: 'Service road college gate. Meter haaki.',
            english: 'The college gate on the service road. Please use the meter.',
            reply: {
              speaker: 'other',
              kannada: 'ಮೀಟರ್‌ನಲ್ಲಿ ಕಮಿಷನ್ ಇಲ್ಲ ಸಾರ್.',
              transliteration: 'Meter-nalli commission illa saar.',
              english: 'There is no commission on the meter, sir.',
            },
            explanation:
              'A common auto reply. If you hear it, you can hold your ground politely: "ಸರಿ, ಮೀಟರ್‌ನಲ್ಲಿಯೇ ಹೋಗುತ್ತೇನೆ."',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಸರಿ, ಮೀಟರ್‌ನಲ್ಲಿಯೇ ಹೋಗುತ್ತೇನೆ.',
                transliteration: 'Sari, meter-naliye hoguttene.',
                english: 'Okay, I will go by the meter.',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1b',
            kannada: 'ಎಷ್ಟು ತೆಗೆದುಕೊಳ್ಳುತ್ತೀರಿ?',
            transliteration: 'Eshtu tegedukolluttiri?',
            english: 'How much will you charge?',
            reply: {
              speaker: 'other',
              kannada: 'ಒಂದು ನೂರು ಕೊಡಿ ಸಾರ್.',
              transliteration: 'Ondu nooru kodi saar.',
              english: 'Give me one hundred, sir.',
            },
            explanation:
              'Asking the flat price first lets you compare it with the meter. Compare calmly; arguing in traffic helps nobody.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಬಿಡಿ, ಬೇರೆ ಆಟೋ ನೋಡುತ್ತೇನೆ.',
                transliteration: 'Bidi, bere auto noduttene.',
                english: 'Never mind, I will take another auto.',
                note: 'A polite way to walk away without a fight.',
              },
            ],
            next: 'n2',
            tone: 'neutral',
          },
        ],
      },
      {
        id: 'n2',
        line: {
          speaker: 'other',
          kannada: 'ಟ್ರಾಫಿಕ್ ತುಂಬಾ ಇದೆ. ಬೇಗ ಸಾಧ್ಯ ಇಲ್ಲ.',
          transliteration: 'Traffic tumba ide. Bega saadhya illa.',
          english: 'There is a lot of traffic. Cannot go fast.',
        },
        options: [
          {
            id: 'n2a',
            kannada: 'ಎಷ್ಟು ಹೊತ್ತಾಗುತ್ತದೆ?',
            transliteration: 'Eshtu hottaguttade?',
            english: 'How long will it take?',
            reply: {
              speaker: 'other',
              kannada: 'ಪದಿನೈದು ನಿಮಿಷ ಬೇಕು ಸಾರ್.',
              transliteration: 'Padinaaidu nimisha beku saar.',
              english: 'It will need fifteen minutes, sir.',
            },
            explanation:
              'One question, one number. Better than pressuring the driver in the middle of signal junctions.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಸರಿ, ಜಾಗ್ರತೆಯಾಗಿ ಓಡಿಸಿ.',
                transliteration: 'Sari, jaagrateyaagi odsi.',
                english: 'Okay, drive carefully.',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
          {
            id: 'n2b',
            kannada: 'ಬೇಗ ಹೋಗಿ, ನನಗೆ ಟೈಮ್ ಇಲ್ಲ.',
            transliteration: 'Bega hogi, nanage time illa.',
            english: 'Go fast, I have no time.',
            reply: {
              speaker: 'other',
              kannada: 'ಸಾರ್, ಸಿಗ್ನಲ್‌ನಲ್ಲಿ ಸಿಕ್ಕಿಬೀಳುತ್ತೇನೆ.',
              transliteration: 'Saar, signal-nalli sikibidaluttene.',
              english: 'Sir, I will just get stuck at the signal.',
            },
            explanation:
              'Understood, and it will annoy the driver. Asking how long it will take gets you the same information kindly.',
            alternatives: [],
            next: 'n3',
            tone: 'risky',
          },
        ],
      },
      {
        id: 'n3',
        line: {
          speaker: 'other',
          kannada: 'ಗೇಟ್ ಮುಂದೆಯೇ ನಿಲ್ಲಿಸವುದೇ?',
          transliteration: 'Gate mundeye nilllisavude?',
          english: 'Shall I stop just before the gate?',
        },
        options: [
          {
            id: 'n3a',
            kannada: 'ಹೌದು, ಅಲ್ಲೇ ನಿಲ್ಲಿಸಿ.',
            transliteration: 'Haadu, alle nilisi.',
            english: 'Yes, stop right there.',
            reply: {
              speaker: 'other',
              kannada: 'ಆಯ್ತು ಸಾರ್. ನೂರೈವತ್ತು ಆಯ್ತು.',
              transliteration: 'Aytu saar. Nooru aaivu aytu.',
              english: 'Okay sir. That is one hundred eight.',
            },
            explanation: 'ಅಲ್ಲೇ (right there) with a pointing finger is the clearest stop instruction there is.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇನ್ನೊಂದು ಅಡಿಯ ಮುಂದೆ ನಿಲ್ಲಿಸಿ.',
                transliteration: 'Innondu adiyan munde nilisi.',
                english: 'Please stop one more length ahead.',
              },
            ],
            next: 'n4',
            tone: 'smooth',
          },
          {
            id: 'n3b',
            kannada: 'ಲೋಡ್ ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಿ.',
            transliteration: 'Load tegedukollalu sahaaya maadi.',
            english: 'Please help me take out my luggage.',
            reply: {
              speaker: 'other',
              kannada: 'ಹೌದ್ರಿ, ಕೊಡುತ್ತೇನೆ.',
              transliteration: 'Houdri, koduttene.',
              english: 'Sure, I will help.',
            },
            explanation:
              'Asking for help with a bag is normal and usually answered immediately by auto and taxi drivers.',
            alternatives: [],
            next: 'n4',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n4',
        line: {
          speaker: 'other',
          kannada: 'ಸರಿಯಾಗಿ ಇಳಿಯಿರಿ ಸಾರ್.',
          transliteration: 'Sariyaagi iliyiri saar.',
          english: 'Get down carefully, sir.',
        },
        options: [
          {
            id: 'n4a',
            kannada: 'ಧನ್ಯವಾದಗಳು, ಸಾರ್.',
            transliteration: 'Dhanyavadagalu, saar.',
            english: 'Thank you, sir.',
            reply: {
              speaker: 'other',
              kannada: 'ಬನ್ನಿ ಸಾರ್.',
              transliteration: 'Banni saar.',
              english: 'Come again, sir.',
            },
            explanation:
              'Ending with ಧನ್ಯವಾದಗಳು is how a fifteen-rupee ride becomes a reliable driver you can call again.',
            alternatives: [],
            next: 'end',
            tone: 'smooth',
          },
        ],
      },
    ],
    takeaways: [
      'ಮೀಟರ್ ಹಾಕಿ is a request, not a fight — tone does most of the work.',
      'ಅಲ್ಲೇ ನಿಲ್ಲಿಸಿ + pointing beats any long description of a stop.',
      'ಎಷ್ಟು ಹೊತ್ತಾಗುತ್ತದೆ? converts impatience into usable information.',
    ],
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel check-in and housekeeping',
    kannadaTitle: 'ಹೋಟೆಲ್‌ನಲ್ಲಿ',
    category: 'travel',
    setting: 'A lodge reception in Mysuru after a long bus ride.',
    whoYouAre: 'A traveller with a booking and one backpack.',
    goal: 'Confirm the room, ask what is included, and sort out water and checkout.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        line: {
          speaker: 'other',
          kannada: 'ಬುಕಿಂಗ್ ಮಾಡಿದ್ದೀರಾ?',
          transliteration: 'Booking maadiddira?',
          english: 'Did you make a booking?',
        },
        options: [
          {
            id: 'n1a',
            kannada: 'ಹೌದು, ನನ್ನ ಹೆಸರಿನಲ್ಲಿ ಒಂದು ಕೋಣೆ ಬುಕ್ ಆಗಿದೆ.',
            transliteration: 'Haadu, nanna hesarinaalli ondu kone book aagide.',
            english: 'Yes, a room is booked in my name.',
            reply: {
              speaker: 'other',
              kannada: 'ಐಡಿ ಕೊಡಿ. ಎರಡು ರಾತ್ರಿ ಸಾರ್?',
              transliteration: 'ID kodi. Eradu raatri saar?',
              english: 'Give me the ID. Two nights, sir?',
            },
            explanation:
              'ID proof is required at all Karnataka hotels; handing it over with the booking name avoids a search.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಇಲ್ಲ, ಒಂದು ಕೋಣೆ ಖಾಲಿ ಇದೆಯೇ?',
                transliteration: 'Illa, ondu kone khaali ideya?',
                english: 'No — is a room free?',
              },
            ],
            next: 'n2',
            tone: 'smooth',
          },
          {
            id: 'n1b',
            kannada: 'ಒಂದು ರಾತ್ರಿಗೆ ಎಷ್ಟು?',
            transliteration: 'Ondu raatrige eshtu?',
            english: 'How much for one night?',
            reply: {
              speaker: 'other',
              kannada: 'ಎರಡು ಸಾವಿರ. ಟ್ಯಾಕ್ಸ್ ಪ್ರತ್ಯೇಕ.',
              transliteration: 'Eradu saavira. Tax pratyeka.',
              english: 'Two thousand. Tax is separate.',
            },
            explanation: 'Asking the tariff and the tax line before you hand over ID avoids a surprise on the bill.',
            alternatives: [],
            next: 'n2',
            tone: 'neutral',
          },
        ],
      },
      {
        id: 'n2',
        line: {
          speaker: 'other',
          kannada: 'ಕೀ ಕೊಡುತ್ತೇನೆ. ಎರಡನೇ ಮಹಡಿಯಲ್ಲಿ, ಎಡಕ್ಕೆ.',
          transliteration: 'Key koduttene. Eradane mahadiyalli, edakke.',
          english: 'I will give the key. Second floor, on the left.',
          note: 'Reception staff will usually say the floor number in Kannada.',
        },
        options: [
          {
            id: 'n2a',
            kannada: 'ಬೆಳಗಿನ ಉಪಹಾರ ಸಿಗುತ್ತದೆಯೇ?',
            transliteration: 'Belagina upahaara sigguttadeya?',
            english: 'Is breakfast available?',
            reply: {
              speaker: 'other',
              kannada: 'ಏಳು ಗಂಟೆಯಿಂದ ಹತ್ತು ಗಂಟೆ ವರೆಗೆ. ಟೀ ಟ್ರಾಲಿ ಮುಂದೆ ಇಡುತ್ತೇವೆ.',
              transliteration: 'Elu ganteyinda hatu gante varege. Tea trolley munde idutteve.',
              english: 'From seven to ten o clock. We keep the tea trolley outside.',
            },
            explanation:
              '-ಇಂದ -ಗೆ (from-to) is the pattern for timings. Listen for it on lifts, menus and notices.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ಊಟದ ಸಮಯ ಎಷ್ಟು?',
                transliteration: 'Uttada samaya eshtu?',
                english: 'What are the meal timings?',
              },
            ],
            next: 'n3',
            tone: 'smooth',
          },
          {
            id: 'n2b',
            kannada: 'ವೈ-ಫೈ ಪಾಸ್‌ವರ್ಡ್ ಏನು?',
            transliteration: 'Wi-Fi password enu?',
            english: 'What is the Wi-Fi password?',
            reply: {
              speaker: 'other',
              kannada: 'ಕಾರ್ಡ್ ರೂಮ್‌ನಲ್ಲಿ ಇದೆ. ನಂಬರ್ ಇದರ ಮೇಲೆ ಬರೆದಿದೆ.',
              transliteration: 'Card room-nalli ide. Number idara mele baredide.',
              english: 'The card is in the room. The number is written on it.',
            },
            explanation: 'A standard exchange; the credentials are usually on a card at the desk.',
            alternatives: [],
            next: 'n3',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n3',
        line: {
          speaker: 'other',
          kannada: 'ಬೇರೆ ಏನಾದರೂ ಬೇಕಾದರೆ ಕರೆದುಕೊಳ್ಳಿ.',
          transliteration: 'Bere enaadaru bekaadare karedukolli.',
          english: 'Call if you need anything else.',
        },
        options: [
          {
            id: 'n3a',
            kannada: 'ಬಿಸಿ ನೀರು ಸಿಗುತ್ತದೆಯೇ?',
            transliteration: 'Bisi neeru sigguttadeya?',
            english: 'Do I get hot water?',
            reply: {
              speaker: 'other',
              kannada: 'ಆರು ಗಂಟೆಗೆ ಸ್ವಿಚ್ ಆನ್ ಮಾಡುತ್ತೇವೆ ಸಾರ್.',
              transliteration: 'Aaru gantege switch aan maadutteve saar.',
              english: 'We switch it on at six, sir.',
            },
            explanation:
              'Geyser timings are a genuine question in many lodges; asking at check-in saves an evening of cold showers.',
            alternatives: [
              {
                speaker: 'user',
                kannada: 'ದಯವಿಟ್ಟು ರೂಮ್ ಸ್ವಚ್ಛ ಮಾಡಿಸಿ.',
                transliteration: 'Dayavittu room swachcha maadisi.',
                english: 'Please have the room cleaned.',
              },
            ],
            next: 'n4',
            tone: 'smooth',
          },
          {
            id: 'n3b',
            kannada: 'ಚೆಕ್ ಔಟ್ ಎಷ್ಟು ಗಂಟೆಗೆ?',
            transliteration: 'Check out eshtu gantege?',
            english: 'What time is checkout?',
            reply: {
              speaker: 'other',
              kannada: 'ಹನ್ನೊಂದು ಗಂಟೆ. ಲೇಟ್ ಬೇಕಾದರೆ ಹೇಳಿ.',
              transliteration: 'Hannondu gante. Late bekaadre heli.',
              english: 'Eleven. Tell me if you need it later.',
            },
            explanation:
              'Asking early is how you get a late checkout for free in small properties.',
            alternatives: [],
            next: 'n4',
            tone: 'smooth',
          },
        ],
      },
      {
        id: 'n4',
        line: {
          speaker: 'other',
          kannada: 'ದಯವಿಟ್ಟು ಸಹಿ ಮಾಡಿ ಇಲ್ಲಿ.',
          transliteration: 'Dayavittu sahi maadi illi.',
          english: 'Please sign here.',
        },
        options: [
          {
            id: 'n4a',
            kannada: 'ಆಯ್ತು. ಇದರಲ್ಲಿ ಏನಾದರೂ ಬರೆಯಬೇಕೇ?',
            transliteration: 'Aytu. Idaralli enaadaru bareyabeka?',
            english: 'Okay. Do I have to write anything in this?',
            reply: {
              speaker: 'other',
              kannada: 'ಹೆಸರು ಒಂದೇ ಬರೆಯಿರಿ ಸಾರ್. ರಜಿಸ್ಟರ್ ನೋಡುತ್ತೇನೆ.',
              transliteration: 'Hesaru onde bareyeri saar. Register noduttene.',
              english: 'Just write your name, sir. I will check the register.',
            },
            explanation:
              'Asking "do I need to write anything?" works at any counter in Karnataka, from banks to hostel offices.',
            alternatives: [],
            next: 'end',
            tone: 'smooth',
          },
        ],
      },
    ],
    takeaways: [
      'ID proof is mandatory at Karnataka hotels — have it out before the register.',
      'ಏಳರಿಂದ ಪತ್ತ್ರಿಗೆ style from-to answers cover meals, water and checkout.',
      'ಬೇಕಾದರೆ ಹೇಳಿ is the phrase that unlocks small extras, politely.',
    ],
  },
];

export const scenarioById = (id: string): ConversationScenario | undefined =>
  conversations.find((scenario) => scenario.id === id);

export function totalConversationTurns(scenario: ConversationScenario): number {
  return scenario.nodes.length;
}
