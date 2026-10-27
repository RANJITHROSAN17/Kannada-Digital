import type { CulturalNote, RegionalVariant } from '../types';

/**
 * Cultural and language context. Only claims we are confident about are
 * written as fact; anything regional or colloquial carries `caution` and the
 * UI renders a review badge instead of presenting it as standard Kannada.
 */
export const culturalNotes: CulturalNote[] = [
  {
    id: 'namaskar-mudra',
    title: 'Namaskara is a gesture as well as a word',
    body: 'The default greeting is ನಮಸ್ಕಾರ said with both palms together near the chest. It works at 7 a.m. and at 9 p.m., to a shopkeeper and to a professor. In shops and buses a spoken "namaskara" with a slight nod is enough; in homes and temples the folded-hands version is what people expect.',
    kind: 'etiquette',
  },
  {
    id: 'respect-plural',
    title: 'Respect lives in the grammar, not in extra words',
    body: 'Kannada marks respect with the plural/honorific -ರು: a teacher becomes ಶಿಕ್ಷಕರು, a name gets it too (ರಮೇಶರು). Use ನೀವು (you, respectful) rather than ನೀನು with anyone older or unfamiliar — ನೀನು is for close friends and children and can sound rude. "ನೀವು ಹೇಗಿದ್ದೀರಿ?" is safe with everyone.',
    kind: 'speech',
  },
  {
    id: 'akka-appa-mama',
    title: 'How strangers address each other politely',
    body: 'A woman a little older than you is often akka (elder sister), an older man is appa or tata, and in the Mysuru region mama (maternal uncle) is used warmly for any friendly man. "ಸಾರ್" and "ಮೇಡಂ" are also everyday. Using akka/appa with a shopkeeper or auto driver is normal and appreciated; using it with a government office staff member can feel too familiar.',
    kind: 'etiquette',
  },
  {
    id: 'head-wobble',
    title: 'The side-to-side tilt usually means "yes, I am listening"',
    body: 'The famous Kannada head tilt is agreement, acknowledgement or "okay okay" — not refusal. A slow tilt while someone explains directions means they are following you. A firm side-to-side with a raised eyebrow can mean "not really". Read the face and the words, not the tilt alone.',
    kind: 'culture',
  },
  {
    id: 'rising-tone-question',
    title: 'You can make a question without changing the word order',
    body: 'Kannada turns a statement into a yes/no question by raising the tone, or by adding ೇ / ಯಾ: ನೀರು ಕೊಡಿ ("give water") → ನೀರು ಕೊಡಬಹುದೇ? ("could you give water?"). That means short sentences you already know work as questions — and you will hear answers like ಇಲ್ಲೇ ("right here") with no verb at all.',
    kind: 'speech',
  },
  {
    id: 'footwear-and-temples',
    title: 'Footwear, leather and camera rules at temples',
    body: 'Footwear must be left outside temples and mutts, and many premises ban leather items such as belts and wallets. Photography is often prohibited inside the inner areas. Notice boards at the entrance are the authority — ask ಫೋಟೋ ತೆಗೆಯಬಹುದೇ? before lifting a camera, and dress with shoulders covered in religious places.',
    kind: 'etiquette',
  },
  {
    id: 'kannada-script',
    title: 'Reading a signboard is easier than reading a book',
    body: 'Kannada is written left to right and is an abugida: every consonant carries an inherent "a" that vowel signs (ಮಾತ್ರೆ) change. Its own digits ೦ ೧ ೨ ೩ ೪ ೫ ೬ ೭ ೮ ೯ appear on some boards, but prices and bus numbers are almost always in Arabic numerals. Learning ten letters and the digits is enough to decode town names and ಆಸ್ಪತ್ರೆ (hospital) / ನಿಲ್ದಾಣ (stand) boards.',
    kind: 'script',
  },
  {
    id: 'language-of-the-state',
    title: 'Kannada is the working language of public life',
    body: 'Kannada is the official language of Karnataka and appears first on most government, hospital and railway signage, and on shop boards under the state official-language policy. Knowing a greeting, a number and a few question words changes how quickly a government counter or a hospital desk can help you.',
    kind: 'culture',
  },
  {
    id: 'many-languages',
    title: 'Karnataka is not monolingual, and Kannada is the common bridge',
    body: 'Alongside Kannada, Tulu, Kodava, Konkani, Beary, Urdu and Marathi are spoken in different parts of the state, and every region has its own festival and food identity — Yakshagana and Kambala in the coastal south, Dasara in Mysuru, Karaga in Bengaluru. Speaking standard Kannada is the widely accepted common ground: nobody is offended by a learner trying, and mistakes are corrected out loud, kindly.',
    kind: 'culture',
  },
  {
    id: 'spoken-vs-written',
    title: 'Spoken Kannada drops syllables that writing keeps',
    body: 'Make ಮಾಡಿ is said as "maadi", ಇದೆ becomes "ide" and often "aaytu" replaces a whole verb phrase. That is why the app gives you a reader-friendly transliteration instead of a phonetic textbook one: it matches what you actually hear at a counter. Written Kannada in notices will look longer than the spoken version.',
    kind: 'speech',
  },
];

/**
 * Regional variants. Every entry here is `needs-native-review`: they are widely
 * reported in colloquial speech but must not be taught as universal Kannada.
 * The UI shows a caution badge and invites users to submit corrections.
 */
export const regionalVariants: RegionalVariant[] = [
  {
    id: 'rv-nan-nanu',
    standard: 'ನಾನು',
    standardTranslit: 'naanu',
    variant: 'ನಾನ್',
    variantTranslit: 'naan',
    english: 'I',
    region: 'Coastal Karnataka / Karavali speech (reportedly also parts of Udupi and Dakshina Kannada)',
    review: 'needs-native-review',
  },
  {
    id: 'rv-majjige-more',
    standard: 'ಮಜ್ಜಿಗೆ',
    standardTranslit: 'majjige',
    variant: 'ಮೋರು',
    variantTranslit: 'moru',
    english: 'buttermilk / curd water',
    region: 'ಮೋರು is attested in older and literary Kannada for buttermilk; ಮಜ್ಜಿಗೆ is the everyday word statewide (ಮೋರೆ, with a final ೆ, means "face")',
    review: 'needs-native-review',
  },
  {
    id: 'rv-bili-bolli',
    standard: 'ಬಿಳಿ',
    standardTranslit: 'bili',
    variant: 'ಬೊಳ್ಳಿ',
    variantTranslit: 'bolli',
    english: 'white',
    region: 'More common in North Karnataka spoken Kannada (reportedly Dharwad–Belagavi belt)',
    review: 'needs-native-review',
  },
  {
    id: 'rv-ee-enu',
    standard: 'ಇದು',
    standardTranslit: 'idu',
    variant: 'ಈ',
    variantTranslit: 'ee',
    english: 'this (used alone in speech: "ee enu?" for "idu enu?")',
    region: 'Spoken across much of the state; notices and writing use ಇದು',
    review: 'needs-native-review',
  },
];
