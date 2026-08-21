"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Monitor, Bot, Code2, Server, Terminal, Share2,
  BarChart3, Wallet, Users, Workflow, HardDrive, Shield, Store, Settings,
  Search, Bell, Menu, X, ExternalLink, Plus, Trash2, Upload, Download,
  Lock, Key, Activity, ChevronRight
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  LayoutDashboard, Monitor, Bot, Code2, Server, Terminal, Share2,
  BarChart3, Wallet, Users, Workflow, HardDrive, Shield, Store, Settings,
  Search, Bell, Menu, X, ExternalLink, Plus, Trash2, Upload, Download,
  Lock, Key, Activity, ChevronRight
};

export function Icon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  const C = map[name] || LayoutDashboard;
  return <C className={className} />;
}
