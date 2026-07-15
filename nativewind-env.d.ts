/// <reference types="nativewind/types" />

declare module "lucide-react-native" {
  export const Sparkles: LucideIcon;
  export const Zap: LucideIcon;
  export const Compass: LucideIcon;
  export const BarChart: LucideIcon;
  export const Flame: LucideIcon;
  export const Gift: LucideIcon;
  export const Shield: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Info: LucideIcon;
  export const Camera: LucideIcon;
  export const Upload: LucideIcon;
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";

  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type LucideIcon = FC<LucideProps>;

  export const Home: LucideIcon;
  export const Search: LucideIcon;
  export const Plus: LucideIcon;
  export const Bell: LucideIcon;
  export const User: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Check: LucideIcon;
  export const Star: LucideIcon;
  export const Heart: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const ThumbsDown: LucideIcon;
  export const Flag: LucideIcon;
  export const ListPlus: LucideIcon;
  export const X: LucideIcon;
  export const Settings: LucideIcon;
  export const Calendar: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const Share2: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Filter: LucideIcon;
  export const List: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Film: LucideIcon;
  export const Tv: LucideIcon;
  export const Lock: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Users: LucideIcon;
  export const Trash2: LucideIcon;
  export const Edit: LucideIcon;
  export const LogOut: LucideIcon;
  export const Bookmark: LucideIcon;
  export const Clock: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Award: LucideIcon;
  export const Send: LucideIcon;
  export const Image: LucideIcon;
  export const Smile: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const Play: LucideIcon;
  export const Tv: LucideIcon;
  export const Zap: LucideIcon;
  export const Clock: LucideIcon;
  export const BookOpen: LucideIcon;
  export const FileText: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Pencil: LucideIcon;
}
declare module "*.css";