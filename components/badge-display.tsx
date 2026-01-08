import React, { useState, useEffect } from 'react';
import { Shield, Star, Crown, Award, Trophy, Users, Gift, Trees, Timer, Network, DivideCircle, Phone, Computer } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from '@/lib/supabase/client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tiers: BadgeTier[];
}

interface BadgeTier {
  id: string;
  name: string;
  threshold: number;
}

interface BadgeProgress {
  id: string;
  user_id: string;
  badge_tier_id: string;
  current_value: number;
}

interface BadgeDisplayProps {
  userId: string;
  variant?: 'dark' | 'light';
}

type TierKey = 'master' | 'expert' | 'specialist' | 'apprentice' | 'locked';

interface ProcessedBadge {
  id: string;
  name: string;
  description: string;
  tier: TierKey;
  badgeType: string;
  progress: number;
  threshold: number;
  isEarlyAdopter: boolean;
}

const BadgeDisplay = ({ userId, variant = 'dark' }: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<ProcessedBadge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Define tier order for sorting
  const tierOrder = {
    master: 0,
    expert: 1,
    specialist: 2,
    apprentice: 3,
    locked: 4
  };

  const darkTiers = {
    locked: {
      style: {
        cardBg: '#0A1229',
        iconGradient: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)',
        borderColor: '#4A5568',
        glowColor: 'rgba(74, 85, 104, 0.5)',
        shadowColor: 'rgba(74, 85, 104, 0.15)',
        progressGradient: 'linear-gradient(90deg, #4A5568 0%, #2D3748 100%)',
        progressBg: '#1f2937',
        titleStyle: { color: '#4A5568' },
        textColor: '#9CA3AF',
        subTextColor: '#6B7280'
      }
    },
    apprentice: {
      style: {
        cardBg: '#0A1229',
        iconGradient: 'linear-gradient(135deg, #00A3FF 0%, #0047FF 100%)',
        borderColor: '#00A3FF',
        glowColor: 'rgba(0, 163, 255, 0.5)',
        shadowColor: 'rgba(0, 163, 255, 0.15)',
        progressGradient: 'linear-gradient(90deg, #00A3FF 0%, #0047FF 100%)',
        progressBg: '#1f2937',
        titleStyle: { color: '#00A3FF' },
        textColor: '#E5E7EB',
        subTextColor: '#9CA3AF'
      }
    },
    specialist: {
      style: {
        cardBg: '#0A1229',
        iconGradient: 'linear-gradient(135deg, #4B6BFF 0%, #0047FF 100%)',
        borderColor: '#4B6BFF',
        glowColor: 'rgba(75, 107, 255, 0.5)',
        shadowColor: 'rgba(75, 107, 255, 0.15)',
        progressGradient: 'linear-gradient(90deg, #4B6BFF 0%, #0047FF 100%)',
        progressBg: '#1f2937',
        titleStyle: { color: '#4B6BFF' },
        textColor: '#E5E7EB',
        subTextColor: '#9CA3AF'
      }
    },
    expert: {
      style: {
        cardBg: '#0A1229',
        iconGradient: 'linear-gradient(135deg, #FF00E5 0%, #7000FF 100%)',
        borderColor: '#FF00E5',
        glowColor: 'rgba(255, 0, 229, 0.5)',
        shadowColor: 'rgba(255, 0, 229, 0.15)',
        progressGradient: 'linear-gradient(90deg, #FF00E5 0%, #7000FF 100%)',
        progressBg: '#1f2937',
        titleStyle: {
          background: 'linear-gradient(90deg, #FF00E5 0%, #7000FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        },
        textColor: '#E5E7EB',
        subTextColor: '#9CA3AF'
      }
    },
    master: {
      style: {
        cardBg: '#0A1229',
        iconGradient: 'linear-gradient(135deg, #FF0000 0%, #FFA500 25%, #FFFF00 50%, #FF00FF 75%, #00FFFF 100%)',
        borderColor: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        shadowColor: 'rgba(255, 215, 0, 0.2)',
        progressGradient: 'linear-gradient(90deg, #FF0000, #FFA500, #FFFF00, #FF00FF, #00FFFF)',
        progressBg: '#1f2937',
        titleStyle: {
          background: 'linear-gradient(90deg, #FF0000, #FFA500, #FFFF00, #FF00FF, #00FFFF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        },
        textColor: '#E5E7EB',
        subTextColor: '#9CA3AF'
      }
    }
  };

  // Neobrutalist light theme - matches landing page design with brand-yellow and brand-navy
  const lightTiers = {
    locked: {
      style: {
        cardBg: '#F5F5F5',
        iconGradient: '#9CA3AF',
        borderColor: '#000000',
        glowColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 1)',
        progressGradient: '#9CA3AF',
        progressBg: '#E5E7EB',
        titleStyle: { color: '#6B7280' },
        textColor: '#374151',
        subTextColor: '#6B7280'
      }
    },
    apprentice: {
      style: {
        cardBg: '#FFFFFF',
        iconGradient: '#0B101F',
        borderColor: '#000000',
        glowColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 1)',
        progressGradient: '#0B101F',
        progressBg: '#E5E7EB',
        titleStyle: { color: '#0B101F' },
        textColor: '#1F2937',
        subTextColor: '#6B7280'
      }
    },
    specialist: {
      style: {
        cardBg: '#FFFFFF',
        iconGradient: '#0B101F',
        borderColor: '#000000',
        glowColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 1)',
        progressGradient: 'linear-gradient(90deg, #0B101F 0%, #E0F146 100%)',
        progressBg: '#E5E7EB',
        titleStyle: { color: '#0B101F' },
        textColor: '#1F2937',
        subTextColor: '#6B7280'
      }
    },
    expert: {
      style: {
        cardBg: '#FFFFFF',
        iconGradient: '#E0F146',
        borderColor: '#000000',
        glowColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 1)',
        progressGradient: 'linear-gradient(90deg, #0B101F 0%, #E0F146 100%)',
        progressBg: '#E5E7EB',
        titleStyle: { color: '#0B101F' },
        textColor: '#1F2937',
        subTextColor: '#6B7280'
      }
    },
    master: {
      style: {
        cardBg: '#E0F146',
        iconGradient: '#0B101F',
        borderColor: '#000000',
        glowColor: 'transparent',
        shadowColor: 'rgba(0, 0, 0, 1)',
        progressGradient: '#0B101F',
        progressBg: '#FFFFFF',
        titleStyle: { color: '#0B101F' },
        textColor: '#0B101F',
        subTextColor: '#374151'
      }
    }
  };

  const tiers = variant === 'light' ? lightTiers : darkTiers;

  const iconMap = {
    'Referral': Users,
    'Early Adopter': Crown,
    'Request': Computer,
    'Activity': Timer,
    'Referral Requests': Network,
    'Tree': Trees,
    'default': Shield
  };

  type IconKey = keyof typeof iconMap;

  const unitMap = {
    'Referral': 'referrals',
    'Early Adopter': '',
    'Request': 'requests',
    'Activity': 'days',
    'Referral Requests': 'requests',
    'Tree': 'trees',
    'default': 'points'
  };

  useEffect(() => {
    const fetchAllBadges = async () => {
      try {
        setLoading(true);

        const { data: badgeTypes, error: typesError } = await supabase
          .from('badge_types')
          .select(`
            *,
            badge_tiers (*)
          `);

        if (typesError) throw typesError;

        const { data: progressData, error: progressError } = await supabase
          .from('badge_progress')
          .select('*')
          .eq('user_id', userId);

        if (progressError) throw progressError;

        const processedBadges = badgeTypes.map(badgeType => {
          const tiers = badgeType.badge_tiers;
          const firstTier = tiers[0];

          const progress = progressData.find(p =>
            tiers.some((tier: BadgeTier) => tier.id === p.badge_tier_id)
          );

          const currentValue = progress?.current_value || 0;
          const isEarlyAdopter = badgeType.name === 'Early Adopter';

          let tier: TierKey = 'apprentice';
          let threshold, displayProgress;

          if (isEarlyAdopter) {
            // For Early Adopter, LOWER values are BETTER
            // Exact tier thresholds from the CSV

            if (currentValue <= 0) {
              // If no value, badge is locked
              tier = 'locked';
              displayProgress = 0;
              threshold = 10; // Default to first threshold
            } else {
              // Match the exact tier names and thresholds from CSV:
              // Pioneer: 10, Early Bird: 100, Trendsetter: 1000
              if (currentValue <= 10) {
                tier = 'master'; // Pioneer badge = master tier
                threshold = 10;
              } else if (currentValue <= 100) {
                tier = 'expert'; // Early Bird badge = expert tier
                threshold = 100;
              } else if (currentValue <= 1000) {
                tier = 'apprentice'; // Trendsetter badge = apprentice tier
                threshold = 1000;
              } else {
                tier = 'locked';
                threshold = 1000;
              }

              displayProgress = currentValue;
            }
          } else {
            // Standard badge logic - HIGHER values are BETTER
            const firstThreshold = firstTier?.threshold || 0;
            const isLocked = currentValue < firstThreshold;

            const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);

            if (isLocked) {
              tier = 'locked';
              threshold = firstThreshold;
              displayProgress = currentValue;
            } else {
              if (currentValue >= sortedTiers[sortedTiers.length - 1].threshold) {
                tier = 'master';
              } else if (currentValue >= sortedTiers[Math.floor(sortedTiers.length * 0.66)].threshold) {
                tier = 'expert';
              } else if (currentValue >= sortedTiers[Math.floor(sortedTiers.length * 0.50)].threshold) {
                tier = 'specialist';
              } else {
                tier = 'apprentice';
              }

              threshold = sortedTiers.find(t => t.threshold > currentValue)?.threshold ||
                sortedTiers[sortedTiers.length - 1].threshold;
              displayProgress = currentValue;
            }
          }

          return {
            id: badgeType.id,
            name: firstTier.name,
            description: firstTier.description,
            tier,
            badgeType: badgeType.name,
            progress: displayProgress,
            threshold,
            isEarlyAdopter
          };
        });

        // Sort badges by tier order
        const sortedBadges = processedBadges.sort((a, b) => {
          // First sort by tier
          const tierDiff = tierOrder[a.tier as TierKey] - tierOrder[b.tier as TierKey];
          if (tierDiff !== 0) return tierDiff;


          // If tiers are equal, sort by progress percentage
          // For Early Adopter, LOWER is better, so invert the percentage
          const aProgress = a.isEarlyAdopter
            ? ((a.threshold - a.progress) / a.threshold) * 100
            : (a.progress / a.threshold) * 100;
          const bProgress = b.isEarlyAdopter
            ? ((b.threshold - b.progress) / b.threshold) * 100
            : (b.progress / b.threshold) * 100;
          return bProgress - aProgress;
        });

        setBadges(sortedBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllBadges();
    }
  }, [userId]);

  const BadgeCard = ({ badge, tier }: any) => {
    const IconComponent = iconMap[badge.badgeType as IconKey] || iconMap.default;
    let progressPercentage;

    if (badge.isEarlyAdopter) {
      // For Early Adopter badges with the exact thresholds from CSV
      if (badge.tier === 'locked') {
        progressPercentage = 0;
      } else if (badge.tier === 'master') {
        // Pioneer: User #1-10 gets 100% fill
        progressPercentage = 100;
      } else if (badge.tier === 'expert') {
        // Early Bird: User #11-100: Calculate percentage within this range
        progressPercentage = 100 - ((badge.progress - 10) / 90) * 100;
      } else if (badge.tier === 'apprentice') {
        // Trendsetter: User #101-1000: Calculate percentage within this range
        progressPercentage = 100 - ((badge.progress - 100) / 900) * 100;
      }
    } else {
      progressPercentage = Math.min((badge.progress / badge.threshold) * 100, 100);
    }

    const unit = unitMap[badge.badgeType as IconKey] || unitMap.default;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={`w-full relative overflow-hidden transform transition-all ${variant === 'light' ? 'border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px]' : 'rounded-lg hover:scale-105'}`}
              style={{
                background: tier.style.cardBg,
                boxShadow: variant === 'light' ? '4px 4px 0px 0px rgba(0,0,0,1)' : `0 8px 32px ${tier.style.shadowColor}`,
              }}>
              <div className="p-6 flex flex-col items-center relative z-10">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 flex items-center justify-center ${variant === 'light' ? 'border-2 border-black' : 'rounded-full'}`}
                    style={{
                      background: tier.style.iconGradient,
                      boxShadow: variant === 'light' ? 'none' : `0 0 20px ${tier.style.glowColor}`
                    }}>
                    <IconComponent className={`w-10 h-10 ${variant === 'light' && tier.style.iconGradient === '#E0F146' ? 'text-black' : 'text-white'}`} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2" style={tier.style.titleStyle}>
                  {badge.isEarlyAdopter ?
                    (badge.tier === 'master' ? 'Pioneer' :
                      badge.tier === 'expert' ? 'Early Bird' :
                        badge.tier === 'apprentice' ? 'Trendsetter' : badge.name)
                    : badge.name}
                </h3>

                <div className="text-sm mb-2 text-center" style={{ color: tier.style.subTextColor }}>
                  <p className="text-lg font-medium mb-1" style={{ color: tier.style.textColor }}>
                    {badge.isEarlyAdopter ? (
                      badge.tier === 'locked' ?
                        `User #${badge.progress} / Required #${badge.threshold}` :
                        `User #${badge.progress}`
                    ) : (
                      `${badge.progress} / ${badge.threshold} ${unit}`
                    )}
                  </p>
                  <p style={{ color: tier.style.subTextColor }}>
                    {badge.tier === 'locked' ? 'Locked' :
                      `Current Tier: ${badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}`}
                  </p>
                </div>

                <div className="w-full mt-4">
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: tier.style.progressBg }}>
                    <div className="h-full transition-all duration-500"
                      style={{
                        width: `${progressPercentage}%`,
                        background: tier.style.progressGradient
                      }} />
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{badge.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return <div className={variant === 'light' ? 'text-neutral-600 font-bold' : 'text-brand-yellow'}>Loading badges...</div>;
  }

  const cardClass = variant === 'light'
    ? "p-0 bg-transparent border-0 shadow-none"
    : "p-4 sm:p-6 lg:p-8 bg-brand-navy border-2 border-brand-yellow/50";

  const titleClass = variant === 'light'
    ? "text-2xl font-extrabold font-candu uppercase text-black mb-6 flex items-center gap-2"
    : "text-2xl font-bold text-brand-yellow mb-6 flex items-center gap-2";

  return (
    <Card className={cardClass}>
      <h2 className={titleClass}>
        <Trophy className="w-6 h-6" />
        Badges
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            tier={tiers[badge.tier]}
          />
        ))}
      </div>
    </Card>
  );
};

export default BadgeDisplay;