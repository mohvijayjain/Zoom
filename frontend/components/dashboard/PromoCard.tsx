import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Fully static marketing panel — no data, no client hooks. */
export function PromoCard() {
  return (
    <Card>
      <div className="flex items-center justify-between gap-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zoom-blue">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-[13px] font-medium text-zoom-blue">
              Workplace Pro
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-zoom-text">Upgrade and save!</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zoom-text-muted">
            Unlock savings up to 16% on an annual Zoom Workplace Pro plan.
          </p>

          <Button variant="primary" size="md" className="mt-5">
            Upgrade today
          </Button>
        </div>

        {/* Stand-in for the marketing illustration. */}
        <div
          aria-hidden="true"
          className="hidden h-[180px] w-[264px] shrink-0 rounded-xl bg-gradient-to-br from-[#0B5CFF] via-[#4A85FF] to-[#8FB4FF] md:block"
        />
      </div>
    </Card>
  );
}
