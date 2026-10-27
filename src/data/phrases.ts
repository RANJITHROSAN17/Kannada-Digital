import type { Phrase, Situation } from '../types';

/**
 * Curated, reviewable starter dataset. Transliteration is deliberately plain
 * ASCII (no diacritics) so a learner can read it aloud without linguistic
 * training. Native speakers can extend this file without touching any UI code.
 */
export const SITUATIONS: Situation[] = [
  {
    id: 'basics',
    title: 'First words',
    knTitle: 'ಮೊದಲ ಮಾತುಗಳು',
    icon: 'Hand',
    blurb: 'Greet people, be polite, and say you are still learning.',
    gradient: 'from-saffron-100 to-ivory-100',
    accent: 'text-saffron-600',
  },
  {
    id: 'transport',
    title: 'Bus & transport',
    knTitle: 'ಬಸ್ ಮತ್ತು ಪ್ರಯಾಣ',
    icon: 'Bus',
    blurb: 'Find the right bus, buy a ticket, and get down at your stop.',
    gradient: 'from-ink-50 to-ivory-100',
    accent: 'text-ink-500',
  },
  {
    id: 'market',
    title: 'Market & shopping',
    knTitle: 'ಮಾರುಕಟ್ಟೆ',
    icon: 'ShoppingBasket',
    blurb: 'Ask the price, bargain kindly, and pay without confusion.',
    gradient: 'from-leaf-100 to-ivory-100',
    accent: 'text-leaf-600',
  },
  {
    id: 'health',
    title: 'Hospital & pharmacy',
    knTitle: 'ಆಸ್ಪತ್ರೆ ಮತ್ತು ಔಷಧಾಲಯ',
    icon: 'HeartPulse',
    blurb: 'Describe a symptom and confirm how to take your medicine.',
    gradient: 'from-rose-100 to-ivory-100',
    accent: 'text-rose-600',
  },
  {
    id: 'food',
    title: 'Food & restaurants',
    knTitle: 'ಊಟ ಮತ್ತು ಹೋಟೆಲ್',
    icon: 'Utensils',
    blurb: 'Order a meal, control the spice, and ask for the bill.',
    gradient: 'from-amber-100 to-ivory-100',
    accent: 'text-amber-700',
  },
  {
    id: 'directions',
    title: 'Directions',
    knTitle: 'ದಾರಿ ಕೇಳುವುದು',
    icon: 'MapPin',
    blurb: 'Ask where a place is and actually understand the answer.',
    gradient: 'from-sky-100 to-ivory-100',
    accent: 'text-sky-700',
  },
  {
    id: 'work',
    title: 'College & workplace',
    knTitle: 'ಕಾಲೇಜು ಮತ್ತು ಕೆಲಸ',
    icon: 'Briefcase',
    blurb: 'Introduce yourself, ask for a repeat, and request help.',
    gradient: 'from-violet-100 to-ivory-100',
    accent: 'text-violet-700',
  },
  {
    id: 'emergency',
    title: 'Help & emergency',
    knTitle: 'ಸಹಾಯ ಮತ್ತು ತುರ್ತು',
    icon: 'Siren',
    blurb: 'The sentences you hope you never need, but should know.',
    gradient: 'from-red-100 to-ivory-100',
    accent: 'text-red-700',
  },
];

export const PHRASES: Phrase[] = [
  // --- First words -------------------------------------------------------
  { id: 'basics-1', situationId: 'basics', kn: 'ನಮಸ್ಕಾರ', rom: 'Namaskara', en: 'Hello / greetings', when: 'Any time of day, to anyone. A safe default greeting.', note: 'Said with palms together; it works in shops, offices and homes.', tags: ['hello', 'hi', 'greet', 'namaste', 'good morning'] },
  { id: 'basics-2', situationId: 'basics', kn: 'ಧನ್ಯವಾದ', rom: 'Dhanyavada', en: 'Thank you', when: 'After anyone helps you, however small the favour.', tags: ['thanks', 'thank you', 'grateful'] },
  { id: 'basics-3', situationId: 'basics', kn: 'ದಯವಿಟ್ಟು', rom: 'Dayavittu', en: 'Please', when: 'Put it before a request to soften it.', note: 'Politeness matters: a bare imperative can sound blunt.', tags: ['please', 'request', 'polite'] },
  { id: 'basics-4', situationId: 'basics', kn: 'ಕ್ಷಮಿಸಿ', rom: 'Kshamisi', en: 'Sorry / excuse me', when: 'To apologise, or to get someone’s attention.', tags: ['sorry', 'excuse me', 'pardon'] },
  { id: 'basics-5', situationId: 'basics', kn: 'ಹೇಗಿದ್ದೀರಾ?', rom: 'Hegiddeera?', en: 'How are you?', when: 'A friendly check-in with someone you have met.', tags: ['how are you', 'greeting'] },
  { id: 'basics-6', situationId: 'basics', kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', rom: 'Naanu chennagiddene', en: 'I am fine', when: 'The natural reply to “Hegiddeera?”', tags: ['fine', 'good', 'well'] },
  { id: 'basics-7', situationId: 'basics', kn: 'ನನಗೆ ಕನ್ನಡ ಬರುವುದಿಲ್ಲ', rom: 'Nanage Kannada baruvudilla', en: 'I don’t know Kannada', when: 'Say it early — people will slow down and help.', note: 'Admitting this openly usually switches the other person into helpful mode.', tags: ['i dont know kannada', 'beginner', 'help'] },
  { id: 'basics-8', situationId: 'basics', kn: 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ', rom: 'Dayavittu nidhanavagi maatanadi', en: 'Please speak slowly', when: 'When you cannot follow the speed of speech.', tags: ['slow', 'repeat', 'speak slowly'] },

  // --- Bus & transport ---------------------------------------------------
  { id: 'transport-1', situationId: 'transport', kn: 'ಈ ಬಸ್ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ?', rom: 'Ee bus ellige hoguttade?', en: 'Where does this bus go?', when: 'Ask the conductor before boarding.', tags: ['bus', 'where', 'route'] },
  { id: 'transport-2', situationId: 'transport', kn: 'ಇದು ಮೈಸೂರಿಗೆ ಹೋಗುತ್ತದೆಯೇ?', rom: 'Idu Mysurige hoguttadeye?', en: 'Does this go to Mysuru?', when: 'Swap “Mysuru” for your destination.', tags: ['bus', 'mysore', 'destination'] },
  { id: 'transport-3', situationId: 'transport', kn: 'ಟಿಕೆಟ್ ಎಷ್ಟು?', rom: 'Ticket eshtu?', en: 'How much is the ticket?', when: 'After telling the conductor your stop.', tags: ['ticket', 'price', 'fare', 'cost'] },
  { id: 'transport-4', situationId: 'transport', kn: 'ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ', rom: 'Ondu ticket kodi', en: 'One ticket, please', when: 'Hand over the money as you say it.', note: '“Ondu” = one. Numbers are in the Essentials section.', tags: ['ticket', 'one', 'buy'] },
  { id: 'transport-5', situationId: 'transport', kn: 'ಮುಂದಿನ ನಿಲ್ದಾಣ ಯಾವುದು?', rom: 'Mundina nildana yaavudu?', en: 'Which is the next stop?', when: 'Useful on unfamiliar routes.', tags: ['stop', 'next', 'station'] },
  { id: 'transport-6', situationId: 'transport', kn: 'ಇಲ್ಲಿ ಇಳಿಯಬೇಕು', rom: 'Illi iliyabeku', en: 'I need to get down here', when: 'Say it a little before your stop.', tags: ['get down', 'stop', 'alight'] },
  { id: 'transport-7', situationId: 'transport', kn: 'ಆಟೋ ಮೀಟರ್ ಹಾಕಿ', rom: 'Auto meter haaki', en: 'Please switch on the meter', when: 'Before an auto-rickshaw ride starts.', note: 'Asking for the meter is normal and not rude.', tags: ['auto', 'meter', 'taxi', 'fare'] },
  { id: 'transport-8', situationId: 'transport', kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ', rom: 'Illi nillisi', en: 'Stop here, please', when: 'When you have reached your destination.', tags: ['stop here', 'auto', 'taxi'] },

  // --- Market & shopping -------------------------------------------------
  { id: 'market-1', situationId: 'market', kn: 'ಇದು ಎಷ್ಟು?', rom: 'Idu eshtu?', en: 'How much is this?', when: 'Point at the item while asking.', tags: ['price', 'how much', 'cost', 'shopping'] },
  { id: 'market-2', situationId: 'market', kn: 'ಒಂದು ಕೆಜಿ ಕೊಡಿ', rom: 'Ondu kg kodi', en: 'Give me one kilo', when: 'At vegetable and fruit stalls.', tags: ['kilo', 'quantity', 'vegetables'] },
  { id: 'market-3', situationId: 'market', kn: 'ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ', rom: 'Swalpa kadime maadi', en: 'Please reduce the price a little', when: 'Friendly bargaining at markets.', note: 'Smile when you say it; aggressive haggling rarely helps.', tags: ['discount', 'bargain', 'cheap', 'less'] },
  { id: 'market-4', situationId: 'market', kn: 'ತಾಜಾ ಇದೆಯೇ?', rom: 'Taaja ideye?', en: 'Is it fresh?', when: 'Before buying produce.', tags: ['fresh', 'vegetables', 'quality'] },
  { id: 'market-5', situationId: 'market', kn: 'ಬಿಲ್ ಕೊಡಿ', rom: 'Bill kodi', en: 'Please give me the bill', when: 'At any shop, to keep the transaction clear.', tags: ['bill', 'receipt', 'pay'] },
  { id: 'market-6', situationId: 'market', kn: 'ಚೀಲ ಬೇಕು', rom: 'Cheela beku', en: 'I need a bag', when: 'When you forgot your own bag.', tags: ['bag', 'carry', 'plastic'] },
  { id: 'market-7', situationId: 'market', kn: 'ಇನ್ನೊಂದು ತೋರಿಸಿ', rom: 'Innondu thorisu', en: 'Please show me another one', when: 'When you want to compare options.', tags: ['another', 'show', 'options'] },
  { id: 'market-8', situationId: 'market', kn: 'ಯುಪಿಐ ಇದೆಯೇ?', rom: 'UPI ideye?', en: 'Do you take UPI?', when: 'Before you hand over cash.', note: 'UPI is extremely common, even at small Karnataka stalls.', tags: ['upi', 'payment', 'cash', 'digital'] },

  // --- Hospital & pharmacy ------------------------------------------------
  { id: 'health-1', situationId: 'health', kn: 'ನನಗೆ ಜ್ವರ ಬಂದಿದೆ', rom: 'Nanage jwara bandide', en: 'I have a fever', when: 'Start with the symptom, then answer follow-up questions.', tags: ['fever', 'sick', 'symptom', 'doctor'] },
  { id: 'health-2', situationId: 'health', kn: 'ನನಗೆ ಹೊಟ್ಟೆ ನೋವು', rom: 'Nanage hotte novu', en: 'I have a stomach ache', when: 'Point to where it hurts as you speak.', tags: ['stomach', 'pain', 'hurt'] },
  { id: 'health-3', situationId: 'health', kn: 'ಔಷಧಿ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?', rom: 'Aushadhi elli siguttade?', en: 'Where can I get the medicine?', when: 'Ask at the hospital reception.', tags: ['medicine', 'pharmacy', 'where'] },
  { id: 'health-4', situationId: 'health', kn: 'ದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ?', rom: 'Dinakke eshtu baari?', en: 'How many times a day?', when: 'Confirm the dosage before leaving the counter.', note: 'Repeat the answer back to be certain — dosages are easy to mishear.', tags: ['dosage', 'how often', 'times a day'] },
  { id: 'health-5', situationId: 'health', kn: 'ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಬೇಕೇ?', rom: 'Ootada nantara tegedukollabeke?', en: 'Should I take it after food?', when: 'A critical safety check for most medicines.', tags: ['after food', 'dosage', 'medicine'] },
  { id: 'health-6', situationId: 'health', kn: 'ನನಗೆ ಅಲರ್ಜಿ ಇದೆ', rom: 'Nanage allergy ide', en: 'I have an allergy', when: 'Say this before any injection or new medicine.', tags: ['allergy', 'safety', 'medicine'] },
  { id: 'health-7', situationId: 'health', kn: 'ಡಾಕ್ಟರ್ ಇದ್ದಾರೆಯೇ?', rom: 'Doctor iddaareye?', en: 'Is the doctor available?', when: 'At a clinic or pharmacy counter.', tags: ['doctor', 'available', 'clinic'] },
  { id: 'health-8', situationId: 'health', kn: 'ದಯವಿಟ್ಟು ಬರೆದು ಕೊಡಿ', rom: 'Dayavittu baredu kodi', en: 'Please write it down for me', when: 'When you need the dosage or name in writing.', tags: ['write', 'note', 'clarify'] },

  // --- Food & restaurants -------------------------------------------------
  { id: 'food-1', situationId: 'food', kn: 'ಒಂದು ಊಟ ಕೊಡಿ', rom: 'Ondu oota kodi', en: 'One meal, please', when: 'The simplest way to order a standard meal.', tags: ['order', 'meal', 'food'] },
  { id: 'food-2', situationId: 'food', kn: 'ನೀರು ಬೇಕು', rom: 'Neeru beku', en: 'I need water', when: 'Ask as soon as you sit down.', tags: ['water', 'drink'] },
  { id: 'food-3', situationId: 'food', kn: 'ಖಾರ ಕಡಿಮೆ ಮಾಡಿ', rom: 'Kaara kadime maadi', en: 'Please make it less spicy', when: 'Say it while ordering, not after.', note: '“Kaara” is the everyday word for chilli heat.', tags: ['spicy', 'less spicy', 'chilli'] },
  { id: 'food-4', situationId: 'food', kn: 'ಸಸ್ಯಾಹಾರಿ ಆಹಾರ ಇದೆಯೇ?', rom: 'Sasyaahaari aahaara ideye?', en: 'Do you have vegetarian food?', when: 'Useful in non-vegetarian restaurants.', tags: ['vegetarian', 'veg', 'food'] },
  { id: 'food-5', situationId: 'food', kn: 'ಇದು ಏನು?', rom: 'Idu enu?', en: 'What is this?', when: 'Point at an unfamiliar dish.', tags: ['what', 'dish', 'menu'] },
  { id: 'food-6', situationId: 'food', kn: 'ರುಚಿಯಾಗಿದೆ', rom: 'Ruchiyagide', en: 'It tastes good', when: 'A compliment that always lands well.', tags: ['tasty', 'delicious', 'compliment'] },
  { id: 'food-7', situationId: 'food', kn: 'ಬಿಲ್ ತನ್ನಿ', rom: 'Bill thanni', en: 'The bill, please', when: 'When you are ready to pay.', tags: ['bill', 'check', 'pay'] },
  { id: 'food-8', situationId: 'food', kn: 'ಪಾರ್ಸಲ್ ಮಾಡಿ', rom: 'Parcel maadi', en: 'Please pack it to go', when: 'For leftovers or takeaway.', tags: ['parcel', 'takeaway', 'pack'] },

  // --- Directions ---------------------------------------------------------
  { id: 'directions-1', situationId: 'directions', kn: 'ರೈಲು ನಿಲ್ದಾಣ ಎಲ್ಲಿ?', rom: 'Railu nildana elli?', en: 'Where is the railway station?', when: 'Ask a shopkeeper rather than someone rushing.', tags: ['station', 'train', 'where', 'directions'] },
  { id: 'directions-2', situationId: 'directions', kn: 'ಇದು ಎಷ್ಟು ದೂರ?', rom: 'Idu eshtu doora?', en: 'How far is it?', when: 'Follow up any direction with this.', tags: ['distance', 'far', 'how far'] },
  { id: 'directions-3', situationId: 'directions', kn: 'ನೇರವಾಗಿ ಹೋಗಿ', rom: 'Neravaagi hogi', en: 'Go straight', when: 'A word you will hear in answers — learn to recognise it.', tags: ['straight', 'direction', 'listen'] },
  { id: 'directions-4', situationId: 'directions', kn: 'ಎಡಕ್ಕೆ ತಿರುಗಿ', rom: 'Edakke tirugi', en: 'Turn left', when: 'Common in spoken directions.', tags: ['left', 'turn'] },
  { id: 'directions-5', situationId: 'directions', kn: 'ಬಲಕ್ಕೆ ತಿರುಗಿ', rom: 'Balakke tirugi', en: 'Turn right', when: 'Common in spoken directions.', tags: ['right', 'turn'] },
  { id: 'directions-6', situationId: 'directions', kn: 'ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ', rom: 'Naanu daari tappiddene', en: 'I am lost', when: 'Say it plainly; people will usually walk you there.', tags: ['lost', 'help', 'directions'] },
  { id: 'directions-7', situationId: 'directions', kn: 'ಇಲ್ಲಿಂದ ಹತ್ತಿರವೇ?', rom: 'Illinda hattirave?', en: 'Is it near here?', when: 'Checks whether you can walk.', tags: ['near', 'walk', 'close'] },
  { id: 'directions-8', situationId: 'directions', kn: 'ದಯವಿಟ್ಟು ತೋರಿಸಿ', rom: 'Dayavittu thorisu', en: 'Please show me', when: 'Ask for a point in the right direction.', tags: ['show', 'point', 'help'] },

  // --- College & workplace ------------------------------------------------
  { id: 'work-1', situationId: 'work', kn: 'ನನ್ನ ಹೆಸರು …', rom: 'Nanna hesaru ...', en: 'My name is …', when: 'The easiest way to start an introduction.', tags: ['name', 'introduce', 'myself'] },
  { id: 'work-2', situationId: 'work', kn: 'ನಾನು ಹೊಸಬ', rom: 'Naanu hosaba', en: 'I am new here', when: 'On your first day at college or work.', tags: ['new', 'first day', 'join'] },
  { id: 'work-3', situationId: 'work', kn: 'ದಯವಿಟ್ಟು ಪುನರಾವರ್ತಿಸಿ', rom: 'Dayavittu punaraavartisi', en: 'Please repeat that', when: 'Better than pretending you understood.', tags: ['repeat', 'again', 'pardon'] },
  { id: 'work-4', situationId: 'work', kn: 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ', rom: 'Nanage arthavaagalilla', en: 'I didn’t understand', when: 'Pair it with “speak slowly” for best results.', tags: ['understand', 'confused', 'help'] },
  { id: 'work-5', situationId: 'work', kn: 'ಸಹಾಯ ಮಾಡುತ್ತೀರಾ?', rom: 'Sahaaya maadutteera?', en: 'Could you help me?', when: 'A polite opener for any request.', tags: ['help', 'assist', 'please'] },
  { id: 'work-6', situationId: 'work', kn: 'ಸಭೆ ಯಾವಾಗ?', rom: 'Sabhe yaavaaga?', en: 'When is the meeting?', when: 'For classes, stand-ups and appointments.', tags: ['meeting', 'when', 'class'] },
  { id: 'work-7', situationId: 'work', kn: 'ಇದನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಗೆ ಹೇಳುತ್ತೀರಿ?', rom: 'Idannu Kannadalli hege helutteeri?', en: 'How do you say this in Kannada?', when: 'Turns any colleague into a teacher.', tags: ['how to say', 'learn', 'word'] },
  { id: 'work-8', situationId: 'work', kn: 'ನಾಳೆ ಸಿಗೋಣ', rom: 'Naale sigona', en: 'See you tomorrow', when: 'A warm, natural goodbye.', tags: ['bye', 'tomorrow', 'goodbye'] },

  // --- Help & emergency ---------------------------------------------------
  { id: 'emergency-1', situationId: 'emergency', kn: 'ಸಹಾಯ!', rom: 'Sahaaya!', en: 'Help!', when: 'Shout it clearly if you need immediate attention.', tags: ['help', 'emergency', 'urgent'] },
  { id: 'emergency-2', situationId: 'emergency', kn: 'ಪೊಲೀಸರನ್ನು ಕರೆಯಿರಿ', rom: 'Poleesarannu kareyiri', en: 'Please call the police', when: 'In an unsafe situation.', tags: ['police', 'call', 'emergency', '112'] },
  { id: 'emergency-3', situationId: 'emergency', kn: 'ಆಂಬುಲೆನ್ಸ್ ಬೇಕು', rom: 'Ambulance beku', en: 'I need an ambulance', when: 'For a medical emergency; also dial 108 in Karnataka.', note: '108 is the free statewide emergency ambulance number.', tags: ['ambulance', '108', 'medical', 'emergency'] },
  { id: 'emergency-4', situationId: 'emergency', kn: 'ನನ್ನ ಫೋನ್ ಕಳೆದುಹೋಗಿದೆ', rom: 'Nanna phone kaleduhogide', en: 'I have lost my phone', when: 'When you need to borrow a phone or report it.', tags: ['lost', 'phone', 'missing'] },
  { id: 'emergency-5', situationId: 'emergency', kn: 'ನನಗೆ ಸುಸ್ತಾಗಿದೆ', rom: 'Nanage sustaagide', en: 'I feel weak / dizzy', when: 'Describe how you feel before sitting down.', tags: ['dizzy', 'weak', 'tired', 'sick'] },
  { id: 'emergency-6', situationId: 'emergency', kn: 'ದಯವಿಟ್ಟು ನನ್ನ ಸ್ನೇಹಿತರಿಗೆ ಕರೆ ಮಾಡಿ', rom: 'Dayavittu nanna sneehitarige kare maadi', en: 'Please call my friend', when: 'If you cannot use your own phone.', tags: ['call', 'friend', 'contact'] },
  { id: 'emergency-7', situationId: 'emergency', kn: 'ಇಲ್ಲಿ ಔಷಧಾಲಯ ಇದೆಯೇ?', rom: 'Illi aushadhaalaya ideye?', en: 'Is there a pharmacy nearby?', when: 'When you need medicine urgently.', tags: ['pharmacy', 'nearby', 'medicine'] },
  { id: 'emergency-8', situationId: 'emergency', kn: 'ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆ', rom: 'Naanu surakshhitavaagiddene', en: 'I am safe', when: 'Reassure someone who is worried about you.', tags: ['safe', 'ok', 'fine'] },
];

/** One to ten — used by the Essentials panel and the quiz. */
export const NUMBERS: { kn: string; rom: string; en: string }[] = [
  { kn: '೧', rom: 'ondu', en: 'one' },
  { kn: '೨', rom: 'eradu', en: 'two' },
  { kn: '೩', rom: 'mooru', en: 'three' },
  { kn: '೪', rom: 'naalku', en: 'four' },
  { kn: '೫', rom: 'aidu', en: 'five' },
  { kn: '೬', rom: 'aaru', en: 'six' },
  { kn: '೭', rom: 'elu', en: 'seven' },
  { kn: '೮', rom: 'entu', en: 'eight' },
  { kn: '೯', rom: 'ombattu', en: 'nine' },
  { kn: '೧೦', rom: 'hattu', en: 'ten' },
];

export const PHRASE_BY_ID: Record<string, Phrase> = Object.fromEntries(
  PHRASES.map((phrase) => [phrase.id, phrase]),
);

export const SITUATION_BY_ID: Record<string, Situation> = Object.fromEntries(
  SITUATIONS.map((situation) => [situation.id, situation]),
);

export function phrasesForSituation(situationId: string): Phrase[] {
  return PHRASES.filter((phrase) => phrase.situationId === situationId);
}
