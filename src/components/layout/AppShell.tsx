import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Radio,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  Menu,
  Volume2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { brands } from "@/lib/mock-data";
import { AIAssistant, useAI, AIProvider } from "@/components/ai/AIAssistant";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: Send },
  { to: "/audience", label: "Audience", icon: Users },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavList({ onClick }: { onClick?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="ai-gradient grid h-9 w-9 place-items-center rounded-xl ai-glow-shadow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight">Nexus</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Agentic CPaaS
          </div>
        </div>
      </div>
      {nav.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [brand, setBrand] = useState(brands[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ai = useAI();

  return (
    <AIProvider controller={ai}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
          <NavList />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur md:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar p-0">
                <NavList onClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="max-w-32 truncate">{brand.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {brands.map((b) => (
                  <DropdownMenuItem key={b.id} onClick={() => setBrand(b)}>
                    {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-1">
              <span
                className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground sm:inline"
                title="Prototype by Amarjot Singh. Audience, channels and metrics are simulated."
              >
                Prototype · demo data
              </span>
              {/* TTS speaking indicator */}
              {ai?.ttsSpeaking && (
                <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                  <Volume2 className="h-3 w-3 animate-pulse" />
                  Speaking
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px]">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuItem>AI paused 'Flash Sale NCR'</DropdownMenuItem>
                  <DropdownMenuItem>A/B test winner ready to apply</DropdownMenuItem>
                  <DropdownMenuItem>WhatsApp latency spike detected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AR
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>

        <AIAssistant controller={ai} />
      </div>
    </AIProvider>
  );
}
