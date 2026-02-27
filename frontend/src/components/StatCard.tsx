import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'gold' | 'green' | 'purple';
  subtitle?: string;
}

const colorMap = {
  blue: { bg: 'bg-navy', icon: 'bg-white/20 text-white', value: 'text-white', title: 'text-white/70' },
  gold: { bg: 'bg-gold', icon: 'bg-white/30 text-navy', value: 'text-navy', title: 'text-navy/70' },
  green: { bg: 'bg-emerald-600', icon: 'bg-white/20 text-white', value: 'text-white', title: 'text-white/70' },
  purple: { bg: 'bg-purple-600', icon: 'bg-white/20 text-white', value: 'text-white', title: 'text-white/70' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${c.title}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.value}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-1 ${c.title}`}>{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
