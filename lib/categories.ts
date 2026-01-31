import { Heart, Briefcase, GraduationCap, Sparkles, Coffee, Zap, DollarSign } from 'lucide-react';

export const CATEGORIES = [
    { id: 'health', name: 'Saúde', color: 'green', icon: Heart },
    { id: 'work', name: 'Trabalho', color: 'blue', icon: Briefcase },
    { id: 'study', name: 'Estudos', color: 'violet', icon: GraduationCap },
    { id: 'spirituality', name: 'Espiritualidade', color: 'cyan', icon: Sparkles },
    { id: 'leisure', name: 'Lazer', color: 'yellow', icon: Coffee },
    { id: 'productivity', name: 'Produtividade', color: 'red', icon: Zap },
    { id: 'finance', name: 'Finanças', color: 'emerald', icon: DollarSign },
];

export function getCategory(id: string | null) {
    return CATEGORIES.find(c => c.id === id) || null;
}
