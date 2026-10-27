import type { Category, CategoryId } from '../types';

/**
 * The eight everyday situations the app is built around. Ordered by how
 * urgently a newcomer to Karnataka usually needs them.
 */
export const categories: Category[] = [
  {
    id: 'transport',
    title: 'Transport & buses',
    kannadaTitle: 'ಸಾರಿಗೆ',
    icon: 'Bus',
    blurb: 'KSRTC stands, autos, metros, stops and fares — get where you are going.',
    accent: 'from-ink-600 to-ink-800',
  },
  {
    id: 'shopping',
    title: 'Shopping & markets',
    kannadaTitle: 'ಖರೀದಿ',
    icon: 'ShoppingBag',
    blurb: 'Price, weight, size, colour and billing without the awkward silence.',
    accent: 'from-saffron-500 to-saffron-700',
  },
  {
    id: 'food',
    title: 'Restaurants & tea',
    kannadaTitle: 'ಊಟ',
    icon: 'Utensils',
    blurb: 'Order filter coffee, a full meal, ask for less spice, get the bill.',
    accent: 'from-amber-500 to-orange-700',
  },
  {
    id: 'health',
    title: 'Hospital & pharmacy',
    kannadaTitle: 'ಆರೋಗ್ಯ',
    icon: 'Stethoscope',
    blurb: 'Describe pain, understand dosage, ask for help fast and clearly.',
    accent: 'from-rose-500 to-red-700',
  },
  {
    id: 'campus',
    title: 'College & workplace',
    kannadaTitle: 'ಕಾಲೇಜು',
    icon: 'GraduationCap',
    blurb: 'Classrooms, hostels, offices, leaves and "please repeat that".',
    accent: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'directions',
    title: 'Asking directions',
    kannadaTitle: 'ದಾರಿ ಕೇಳುವುದು',
    icon: 'MapPin',
    blurb: 'Left, right, straight, how far, and how to confirm you understood.',
    accent: 'from-sky-500 to-indigo-700',
  },
  {
    id: 'everyday',
    title: 'Everyday conversations',
    kannadaTitle: 'ದೈನಂದಿನ ಮಾತು',
    icon: 'MessagesSquare',
    blurb: 'Greetings, thanks, apologies and the phrases that open doors.',
    accent: 'from-violet-500 to-purple-700',
  },
  {
    id: 'travel',
    title: 'Hotel & tourism',
    kannadaTitle: 'ಪ್ರವಾಸ',
    icon: 'Plane',
    blurb: 'Check in, ask about meals and water, tickets and temple etiquette.',
    accent: 'from-cyan-600 to-blue-800',
  },
];

export const categoryById: Record<CategoryId, Category> = categories.reduce(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

export function getCategory(id: CategoryId): Category {
  return categoryById[id];
}
