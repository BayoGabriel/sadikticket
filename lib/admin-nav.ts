import type { IconName } from "@/components/admin/ui/icons";
import type { Permission } from "@/lib/auth";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  permission: Permission;
  badgeKey?: "enquiries" | "orders" | "waitlist";
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard", permission: "dashboard" },
    ],
  },
  {
    label: "Events",
    items: [
      { href: "/admin/events", label: "Events", icon: "calendar", permission: "events" },
      { href: "/admin/orders", label: "Orders & tickets", icon: "ticket", permission: "orders", badgeKey: "orders" },
      { href: "/admin/check-in", label: "Check-in", icon: "scan", permission: "checkin" },
      { href: "/admin/waitlist", label: "Waitlist", icon: "clock", permission: "waitlist", badgeKey: "waitlist" },
      { href: "/admin/coupons", label: "Coupons", icon: "tag", permission: "coupons" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "inbox", permission: "enquiries", badgeKey: "enquiries" },
      { href: "/admin/subscribers", label: "Subscribers", icon: "users", permission: "subscribers" },
      { href: "/admin/reviews", label: "Reviews", icon: "star", permission: "reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/experiences", label: "Experiences", icon: "sparkles", permission: "content" },
      { href: "/admin/gallery", label: "Gallery & media", icon: "image", permission: "content" },
      { href: "/admin/faqs", label: "FAQs", icon: "help", permission: "content" },
      { href: "/admin/clients", label: "Clients", icon: "briefcase", permission: "content" },
      { href: "/admin/pages", label: "Policies & pages", icon: "file", permission: "content" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings", label: "Site settings", icon: "settings", permission: "settings" },
      { href: "/admin/emails", label: "Emails", icon: "send", permission: "emails" },
      { href: "/admin/team", label: "Team", icon: "users", permission: "team" },
      { href: "/admin/activity", label: "Activity log", icon: "activity", permission: "audit" },
    ],
  },
];

// Bottom tab bar on mobile — the daily essentials.
export const MOBILE_TABS: NavItem[] = [
  { href: "/admin", label: "Home", icon: "dashboard", permission: "dashboard" },
  { href: "/admin/events", label: "Events", icon: "calendar", permission: "events" },
  { href: "/admin/check-in", label: "Check-in", icon: "scan", permission: "checkin" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "inbox", permission: "enquiries", badgeKey: "enquiries" },
  { href: "/admin/orders", label: "Orders", icon: "ticket", permission: "orders", badgeKey: "orders" },
];
