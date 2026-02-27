/**
 * Disciplex Icon System
 * Using Lucide React Native for consistent, premium icons
 */

import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Flame,
  Home,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Share2,
  Shield,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
  Bell,
  BellRing,
  Activity,
  Menu,
  LogOut,
  Play,
  UserCheck,
} from 'lucide-react-native';

// Icon sizes
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Icon colors (matching theme)
export const ICON_COLORS = {
  primary: '#F5F5F5',
  secondary: '#888888',
  muted: '#3A3A3A',
  gold: '#C9A84C',
  red: '#CC0000',
  success: '#2A7A4B',
  warning: '#8A6A00',
};

// Icon props interface
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Navigation Icons (for tab bar)
export const NavIcons = {
  Home: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Home size={size} color={color} strokeWidth={2} />
  ),
  Insights: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <BarChart3 size={size} color={color} strokeWidth={2} />
  ),
  Identity: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <User size={size} color={color} strokeWidth={2} />
  ),
  Settings: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Settings size={size} color={color} strokeWidth={2} />
  ),
};

// Action Icons
export const ActionIcons = {
  Check: ({ size = ICON_SIZES.md, color = ICON_COLORS.primary }: IconProps) => (
    <Check size={size} color={color} strokeWidth={2.5} />
  ),
  CheckCircle: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <CheckCircle2 size={size} color={color} strokeWidth={2} />
  ),
  Close: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <X size={size} color={color} strokeWidth={2} />
  ),
  Refresh: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <RefreshCw size={size} color={color} strokeWidth={2} />
  ),
  Share: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Share2 size={size} color={color} strokeWidth={2} />
  ),
  Lock: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Lock size={size} color={color} strokeWidth={2} />
  ),
  Unlock: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <Shield size={size} color={color} strokeWidth={2} />
  ),
};

// Status Icons
export const StatusIcons = {
  Success: ({ size = ICON_SIZES.md, color = ICON_COLORS.success }: IconProps) => (
    <CheckCircle2 size={size} color={color} strokeWidth={2} />
  ),
  Error: ({ size = ICON_SIZES.md, color = ICON_COLORS.red }: IconProps) => (
    <X size={size} color={color} strokeWidth={2} />
  ),
  Warning: ({ size = ICON_SIZES.md, color = ICON_COLORS.warning }: IconProps) => (
    <Flame size={size} color={color} strokeWidth={2} />
  ),
  Loading: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <RefreshCw size={size} color={color} strokeWidth={2} />
  ),
};

// Feature Icons
export const FeatureIcons = {
  Crown: ({ size = ICON_SIZES.lg, color = ICON_COLORS.gold }: IconProps) => (
    <Crown size={size} color={color} strokeWidth={2} />
  ),
  Trophy: ({ size = ICON_SIZES.lg, color = ICON_COLORS.gold }: IconProps) => (
    <Trophy size={size} color={color} strokeWidth={2} />
  ),
  Target: ({ size = ICON_SIZES.lg, color = ICON_COLORS.gold }: IconProps) => (
    <Target size={size} color={color} strokeWidth={2} />
  ),
  TrendingUp: ({ size = ICON_SIZES.lg, color = ICON_COLORS.success }: IconProps) => (
    <TrendingUp size={size} color={color} strokeWidth={2} />
  ),
  TrendingDown: ({ size = ICON_SIZES.lg, color = ICON_COLORS.red }: IconProps) => (
    <TrendingDown size={size} color={color} strokeWidth={2} />
  ),
  Zap: ({ size = ICON_SIZES.lg, color = ICON_COLORS.gold }: IconProps) => (
    <Zap size={size} color={color} strokeWidth={2} />
  ),
  Star: ({ size = ICON_SIZES.lg, color = ICON_COLORS.gold }: IconProps) => (
    <Star size={size} color={color} strokeWidth={2} />
  ),
};

// Notification Icons
export const NotificationIcons = {
  Bell: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Bell size={size} color={color} strokeWidth={2} />
  ),
  BellActive: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <BellRing size={size} color={color} strokeWidth={2} />
  ),
};

// Time Icons
export const TimeIcons = {
  Clock: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Clock size={size} color={color} strokeWidth={2} />
  ),
  Activity: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <Activity size={size} color={color} strokeWidth={2} />
  ),
};

// Utility Icons
export const UtilityIcons = {
  ChevronRight: ({ size = ICON_SIZES.sm, color = ICON_COLORS.secondary }: IconProps) => (
    <ChevronRight size={size} color={color} strokeWidth={2} />
  ),
  MoreHorizontal: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <MoreHorizontal size={size} color={color} strokeWidth={2} />
  ),
  Menu: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <Menu size={size} color={color} strokeWidth={2} />
  ),
  User: ({ size = ICON_SIZES.md, color = ICON_COLORS.secondary }: IconProps) => (
    <User size={size} color={color} strokeWidth={2} />
  ),
  UserCheck: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <UserCheck size={size} color={color} strokeWidth={2} />
  ),
  LogOut: ({ size = ICON_SIZES.md, color = ICON_COLORS.red }: IconProps) => (
    <LogOut size={size} color={color} strokeWidth={2} />
  ),
  Play: ({ size = ICON_SIZES.md, color = ICON_COLORS.gold }: IconProps) => (
    <Play size={size} color={color} strokeWidth={2} />
  ),
};

// Export all icons for convenience
export const Icons = {
  ...NavIcons,
  ...ActionIcons,
  ...StatusIcons,
  ...FeatureIcons,
  ...NotificationIcons,
  ...TimeIcons,
  ...UtilityIcons,
};
