import { cn } from "@/lib/utils";
import { Home, History, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "dashboard" | "history" | "profile";
  onTabChange: (tab: "dashboard" | "history" | "profile") => void;
}

const tabs = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    icon: Home,
  },
  {
    id: "history" as const,
    label: "History",
    icon: History,
  },
  {
    id: "profile" as const,
    label: "Profile",
    icon: User,
  },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="bottom-navigation">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={cn(
                "flex-1 py-3 px-2 text-center transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onTabChange(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-5 h-5 mb-1 mx-auto" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
