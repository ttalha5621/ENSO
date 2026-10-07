import { Bell, Bot, ChartLine, Earth, FileText, Film, LayoutDashboard, Layers, ListFilter, Map, Settings, Wrench } from 'lucide-react';

export const NAV_SECTIONS = [
  {
    id: 'monitor',
    label: 'nav.sectionMonitor',
    items: [
      { key: 'dashboard', path: '/', label: 'nav.dashboard', icon: LayoutDashboard, feature: 'dashboard' },
      {
        key: 'map', path: '/map', label: 'nav.map', icon: Map, feature: 'map-tools',
        children: [
          { panel: 'layers', label: 'nav.layers', icon: Layers },
          { panel: 'basemap', label: 'nav.basemap', icon: Map },
          { panel: 'legend', label: 'nav.legend', icon: ListFilter },
          { panel: 'tools', label: 'nav.tools', icon: Wrench },
        ],
      },
      { key: 'alerts', path: '/alerts', label: 'nav.alerts', icon: Bell, feature: 'alerts', badge: 'alerts' },
    ],
  },
  {
    id: 'insight',
    label: 'nav.sectionInsight',
    items: [
      { key: 'analytics', path: '/analytics', label: 'nav.analytics', icon: ChartLine, feature: 'analytics' },
      { key: 'viewers', path: '/viewers', label: 'nav.viewers', icon: Earth, feature: 'viewers' },
      { key: 'briefings', path: '/briefings', label: 'nav.briefings', icon: Film, feature: 'briefings' },
      { key: 'reports', path: '/reports', label: 'nav.reports', icon: FileText, feature: 'reports' },
    ],
  },
  {
    id: 'system',
    label: 'nav.sectionSystem',
    items: [
      { key: 'assistant', action: 'assistant', label: 'nav.assistant', icon: Bot, feature: 'assistant', ai: true },
      { key: 'settings', path: '/settings', label: 'nav.settings', icon: Settings, feature: 'settings' },
    ],
  },
];

export const NAV_PAGES = NAV_SECTIONS.flatMap((s) => s.items).filter((i) => i.path);
