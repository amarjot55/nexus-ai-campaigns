import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/mock-data";
import { MessageCircle, MessageSquare, Sparkles, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

const channelIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  WhatsApp: MessageCircle,
  SMS: MessageSquare,
  RCS: ImageIcon,
};

const statusColor: Record<string, string> = {
  Approved: "bg-success/20 text-success",
  Pending: "bg-warning/20 text-warning",
  Rejected: "bg-destructive/20 text-destructive",
};

function TemplatesPage() {
  const [filter, setFilter] = useState("all");
  const list = templates.filter((t) => filter === "all" || t.channel === filter);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Templates library</h1>
        <p className="text-sm text-muted-foreground">
          Pre-approved templates across channels, ranked by performance.
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="WhatsApp">WhatsApp</TabsTrigger>
          <TabsTrigger value="SMS">SMS</TabsTrigger>
          <TabsTrigger value="RCS">RCS</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const Icon = channelIcon[t.channel] || MessageSquare;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {t.channel}
                  </div>
                  <div className="mt-1 truncate font-semibold">{t.name}</div>
                </div>
                {t.recommended && (
                  <Badge className="ai-gradient shrink-0 gap-1 text-white">
                    <Sparkles className="h-3 w-3" /> AI pick
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <Badge className={statusColor[t.status]}>{t.status}</Badge>
                <span className="text-muted-foreground">
                  CTR <span className="font-semibold text-foreground">{t.ctr}%</span>
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
