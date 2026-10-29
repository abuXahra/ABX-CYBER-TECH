import {
  BadgeCheck, Building2, Calendar, Clock, Code, Globe, HeartPulse, Headset, LayoutPanelTop, Leaf, LifeBuoy, type LucideIcon, Mail, MapPin, MessageCircle,
  Palette, Phone, RefreshCw, Rocket, Settings, Shield, ShieldCheck, ShoppingCart, Smartphone, Tag, Truck, Users,
} from "lucide-react";
import type { ICON_NAMES } from "@/lib/cms/sections";

const ICONS: Record<(typeof ICON_NAMES)[number], LucideIcon> = {
  globe: Globe, palette: Palette, "refresh-cw": RefreshCw, smartphone: Smartphone, "shopping-cart": ShoppingCart,
  "map-pin": MapPin, "shield-check": ShieldCheck, calendar: Calendar, users: Users, settings: Settings,
  clock: Clock, "life-buoy": LifeBuoy, code: Code, layout: LayoutPanelTop, rocket: Rocket, mail: Mail,
  phone: Phone, "message-circle": MessageCircle, tag: Tag, "badge-check": BadgeCheck, headset: Headset,
  shield: Shield, leaf: Leaf, "heart-pulse": HeartPulse, building: Building2, truck: Truck,
};

/** Resolves a CMS icon name (validated by the schema) to its icon. Unknown names fall back safely. */
export function Icon({ name, className, solid, strokeWidth }: { name: string; className?: string; solid?: boolean; strokeWidth?: number }) {
  const Cmp = (ICONS as Record<string, LucideIcon>)[name] ?? Globe;
  return <Cmp aria-hidden className={solid ? `${className ?? ""} fill-current` : className} strokeWidth={strokeWidth} />;
}
