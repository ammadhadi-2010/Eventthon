import {
  Bell,
  Briefcase,
  CalendarDays,
  Info,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";

export const alertCategories = [
  { key: "all", label: "All Alerts", icon: Bell, count: 24, active: true },
  { key: "mentions", label: "Mentions", icon: MessageSquare, count: 6 },
  { key: "squad", label: "Squad Alerts", icon: Users, count: 5 },
  { key: "projects", label: "Project Updates", icon: CalendarDays, count: 4 },
  { key: "system", label: "System Alerts", icon: Info, count: 3 },
  { key: "jobs", label: "Job Alerts", icon: Briefcase, count: 2 },
  { key: "security", label: "Security Alerts", icon: Shield, count: 1 },
];

export const alertStats = [
  {
    key: "total",
    title: "Total Alerts",
    value: "24",
    detail: "+12% this week",
    tone: "purple",
    icon: Bell,
  },
  {
    key: "unread",
    title: "Unread",
    value: "6",
    detail: "View unread only",
    tone: "blue",
    icon: MessageSquare,
    isAction: true,
  },
  {
    key: "today",
    title: "Today",
    value: "5",
    detail: "+3 new alerts",
    tone: "green",
    icon: CalendarDays,
  },
  {
    key: "priority",
    title: "High Priority",
    value: "3",
    detail: "Requires attention",
    tone: "amber",
    icon: Shield,
  },
];

export const alertSections = [
  {
    title: "Today",
    items: [
      {
        id: "a1",
        user: "Sarah Khan",
        handle: "@Ammad S.",
        message: "mentioned you in a post",
        preview: '"@Ammad S. your insights on link building were super helpful"',
        time: "10:30 AM",
        unread: true,
        tone: "purple",
      },
      {
        id: "a2",
        user: "Aiman Ali",
        handle: "@Aiman AI",
        message: "joined your squad",
        preview: "+Aiman AI joined the squad",
        time: "09:45 AM",
        unread: false,
        tone: "green",
      },
      {
        id: "a3",
        user: "Nicho Agency",
        handle: "#Backlink Strategy",
        message: "project update available",
        preview: "2% progress added to milestone",
        time: "08:20 AM",
        unread: false,
        tone: "blue",
      },
    ],
  },
  {
    title: "Yesterday",
    items: [
      {
        id: "b1",
        user: "ET System",
        handle: "Profile Health",
        message: "your profile is 90% complete",
        preview: "Complete your profile to unlock more opportunities",
        time: "Yesterday",
        unread: false,
        tone: "amber",
      },
      {
        id: "b2",
        user: "Hira Saeed",
        handle: "@Ammad S.",
        message: "mentioned you in a comment",
        preview: '"Great work @Ammad S. on the latest campaign"',
        time: "Yesterday",
        unread: false,
        tone: "purple",
      },
    ],
  },
];

