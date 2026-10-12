import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Phone, MessageCircle, Sparkles, Search, Instagram } from "lucide-react";
import { sampleContact } from "@/lib/mock-data";

export function CampaignPreview({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview campaign</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="whatsapp" className="mt-2">
          <TabsList className="flex-wrap">
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="rcs">RCS</TabsTrigger>
            <TabsTrigger value="google">Google Ads</TabsTrigger>
            <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp">
            <PhoneFrame subtitle="WhatsApp · Business">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#005c4b] px-3 py-2 text-sm text-white">
                <div className="font-semibold">Hi {sampleContact.name} 🎇</div>
                <div className="mt-1">
                  Diwali dhamaka! Flat <b>40% off</b> on ethnic wear. Your Delhi favourites are back
                  in stock.
                </div>
                <div className="mt-2 rounded-lg bg-white/10 px-2 py-1 text-xs">
                  Shop now → nexs.us/diw
                </div>
                <div className="mt-1 flex justify-end text-[10px] opacity-70">6:30 PM ✓✓</div>
              </div>
            </PhoneFrame>
          </TabsContent>

          <TabsContent value="sms">
            <PhoneFrame subtitle={`SMS · ${sampleContact.phone}`}>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                NEXUSAI: Hi {sampleContact.name}, flat 40% off this Diwali. Delhi exclusive. Shop:
                nexs.us/diw. To opt out, reply STOP.
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                142/160 chars · 1 SMS segment
              </div>
            </PhoneFrame>
          </TabsContent>

          <TabsContent value="rcs">
            <PhoneFrame subtitle="RCS · Verified Sender">
              <div className="max-w-[90%] overflow-hidden rounded-2xl border border-border bg-card">
                <div className="ai-gradient h-32" />
                <div className="p-3">
                  <div className="text-sm font-semibold">Diwali Collection is here</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Handpicked for {sampleContact.city}. Free delivery today.
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="h-8">
                      Shop now
                    </Button>
                    <Button size="sm" variant="outline" className="h-8">
                      View lookbook
                    </Button>
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </TabsContent>

          <TabsContent value="google">
            <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Search className="h-3 w-3" /> Sponsored · flipmart.in
              </div>
              <div className="text-lg font-medium text-primary">
                Diwali Sale — Flat 40% Off | Delivered in Delhi Today
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Handpicked festive wear for {sampleContact.city}. Free returns. Cashback on UPI.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta">
            <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 p-3">
                <div className="ai-gradient h-8 w-8 rounded-full" />
                <div className="text-sm font-semibold">flipmart.in</div>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  Sponsored
                </Badge>
              </div>
              <div className="ai-gradient h-56" />
              <div className="flex items-center gap-3 p-3 text-sm">
                <Instagram className="h-4 w-4" />
                <span className="text-muted-foreground">Diwali picks for Delhi · Shop now</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="h-3 w-3 text-primary" /> Agentic compliance checks
          </div>
          <div className="grid gap-1.5 text-sm sm:grid-cols-2">
            {[
              "DND check passed (8,420 users)",
              "Consent verified (opt-in on file)",
              "Template pre-approved by DLT",
              "WhatsApp template approved by Meta",
            ].map((c) => (
              <div key={c} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border p-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Recipients</div>
            <div className="font-semibold">8,420</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Est. cost</div>
            <div className="font-semibold">₹ 3,420</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Est. delivery</div>
            <div className="font-semibold">~ 4 min</div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Edit
            </Button>
            <Button className="ai-gradient text-white" onClick={onConfirm}>
              Confirm & schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PhoneFrame({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-2 w-full max-w-sm rounded-3xl border border-border bg-background p-3 shadow-xl">
      <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 text-xs text-muted-foreground">
        <Phone className="h-3 w-3" />
        {subtitle}
      </div>
      <div className="flex flex-col gap-2 py-3">{children}</div>
      <div className="mt-2 flex items-center justify-center gap-1 border-t border-border pt-2 text-[10px] text-muted-foreground">
        <MessageCircle className="h-3 w-3" /> Preview only — not sent
      </div>
    </div>
  );
}
