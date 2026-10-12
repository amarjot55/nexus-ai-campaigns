import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { campaigns } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAIPanel } from "@/components/ai/AIAssistant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
});

const statusColors: Record<string, string> = {
  Live: "bg-success/20 text-success",
  Paused: "bg-warning/20 text-warning",
  Scheduled: "bg-primary/20 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Completed: "bg-accent text-accent-foreground",
};

function CampaignsPage() {
  const ai = useAIPanel();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor omnichannel campaigns in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              ai?.submit(
                "Send WhatsApp and SMS campaign to users from Delhi who purchased in the last 30 days",
              )
            }
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> Create with AI
          </Button>
          <ManualCreateDialog />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {campaigns.map((c) => {
          const live = c.status === "Live";
          const sent = live ? c.sent + tick * 47 : c.sent;
          const delivered = live ? c.delivered + tick * 44 : c.delivered;
          const opened = live ? c.opened + tick * 22 : c.opened;
          const clicked = live ? c.clicked + tick * 4 : c.clicked;
          return (
            <Collapsible key={c.id} asChild>
              <Card className="p-0">
                <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {live && <span className="h-2 w-2 animate-live rounded-full bg-success" />}
                      <span className="font-semibold">{c.name}</span>
                      <Badge className={statusColors[c.status]}>{c.status}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.channel}</div>
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <div>Sent: {sent.toLocaleString("en-IN")}</div>
                    <div>Clicked: {clicked.toLocaleString("en-IN")}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:grid-cols-4">
                    <Stat label="Sent" value={sent} />
                    <Stat label="Delivered" value={delivered} />
                    <Stat label="Opened" value={opened} />
                    <Stat label="Clicked" value={clicked} />
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">
        {value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function ManualCreateDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" /> Create manually
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create campaign (the old way)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Campaign name</Label>
            <Input placeholder="e.g. New Year Push" className="mt-1" />
          </div>
          <div>
            <Label>Segment</Label>
            <Input placeholder="Choose segment…" className="mt-1" />
          </div>
          <div>
            <Label>Template</Label>
            <Input placeholder="Choose template…" className="mt-1" />
          </div>
          <p className="rounded-lg border border-primary/20 bg-accent/40 p-2 text-xs text-muted-foreground">
            Tip: try the AI builder — it configures all of this for you in one sentence.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setOpen(false);
              toast.success("Draft saved");
            }}
          >
            Save draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
