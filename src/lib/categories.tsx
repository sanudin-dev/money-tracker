import type { LucideIcon } from 'lucide-react'
import {
  UtensilsCrossedIcon,
  ShoppingBagIcon,
  FuelIcon,
  ZapIcon,
  ClapperboardIcon,
  Building2Icon,
  ShirtIcon,
  HeartPulseIcon,
  WrenchIcon,
  PlaneIcon,
  MonitorSmartphoneIcon,
  SofaIcon,
  DumbbellIcon,
  BabyIcon,
  PawPrintIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  PartyPopperIcon,
  GiftIcon,
  HelpCircleIcon,
} from 'lucide-react'

export type Category = {
  label: string
  icon: LucideIcon
  iconBg: string
}

/** All expense categories with display label, accent colour, and icon. */
export const CATEGORIES: Category[] = [
  { label: 'Food & Drink', iconBg: 'bg-orange-500', icon: UtensilsCrossedIcon },
  { label: 'Groceries', iconBg: 'bg-green-500', icon: ShoppingBagIcon },
  { label: 'Transport', iconBg: 'bg-blue-600', icon: FuelIcon },
  { label: 'Utilities', iconBg: 'bg-yellow-500', icon: ZapIcon },
  { label: 'Entertainment', iconBg: 'bg-purple-500', icon: ClapperboardIcon },
  { label: 'Rent / Mortgage', iconBg: 'bg-slate-500', icon: Building2Icon },
  { label: 'Clothing', iconBg: 'bg-pink-500', icon: ShirtIcon },
  { label: 'Healthcare', iconBg: 'bg-rose-500', icon: HeartPulseIcon },
  { label: 'Vehicle', iconBg: 'bg-teal-500', icon: WrenchIcon },
  { label: 'Travel', iconBg: 'bg-sky-500', icon: PlaneIcon },
  { label: 'Electronics', iconBg: 'bg-indigo-500', icon: MonitorSmartphoneIcon },
  { label: 'Home', iconBg: 'bg-violet-400', icon: SofaIcon },
  { label: 'Sports', iconBg: 'bg-emerald-600', icon: DumbbellIcon },
  { label: 'Kids', iconBg: 'bg-red-400', icon: BabyIcon },
  { label: 'Pets', iconBg: 'bg-amber-600', icon: PawPrintIcon },
  { label: 'Education', iconBg: 'bg-cyan-500', icon: GraduationCapIcon },
  { label: 'Donations', iconBg: 'bg-lime-500', icon: HeartHandshakeIcon },
  { label: 'Social Event', iconBg: 'bg-fuchsia-500', icon: PartyPopperIcon },
  { label: 'Gifts', iconBg: 'bg-rose-400', icon: GiftIcon },
  { label: 'Other', iconBg: 'bg-gray-500', icon: HelpCircleIcon },
]

/** Flat list of category labels for use in select options and validation. */
export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label)
