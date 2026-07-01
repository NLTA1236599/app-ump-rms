export type UrgencyTier = 'critical' | 'high' | 'medium' | 'low';

export type UrgencyLevel = {
  tier: UrgencyTier;
  iconBg: string;
  iconColor: string;
  textColor: string;
  label: string;
};

export function getUrgencyLevel(daysRemaining: number): UrgencyLevel {
  if (daysRemaining < 0) {
    return {
      tier: 'critical',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-700 font-bold',
      label: 'Đã quá hạn',
    };
  }

  if (daysRemaining <= 7) {
    return {
      tier: 'high',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      textColor: 'text-red-600',
      label: 'Sắp hết hạn',
    };
  }

  if (daysRemaining <= 21) {
    return {
      tier: 'medium',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-600',
      label: 'Cần chú ý',
    };
  }

  return {
    tier: 'low',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-600',
    label: 'Sắp đến hạn',
  };
}
