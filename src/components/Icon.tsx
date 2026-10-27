import {
  BookOpen, Briefcase, Bus, Check, ChevronRight, Compass, Hand, HeartPulse,
  Home, MapPin, MessageCircle, Mic, Play, Search, ShoppingBasket, Siren,
  Sparkles, Star, Utensils, Volume2, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Hand, Bus, ShoppingBasket, HeartPulse, Utensils, MapPin, Briefcase, Siren,
  Home, BookOpen, Compass, MessageCircle, Mic, Play, Search, Sparkles, Star,
  Check, ChevronRight, Volume2,
};

export function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? Sparkles;
  return <Component className={className} aria-hidden="true" />;
}
