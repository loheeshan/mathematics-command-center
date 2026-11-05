import type { Metadata } from "next";
import { SIMULATIONS } from "@mcc/curriculum";
import { PageHeader } from "@/components/ui";
import { Gallery } from "./Gallery";

export const metadata: Metadata = { title: "Simulations" };

export default function SimsPage() {
  return (
    <div>
      <PageHeader title="Simulation gallery" kicker={`${SIMULATIONS.length} working labs`}>
        Every lab computes real values, responds live, has presets, a reset, a text/data alternative and a 3-question practice. Filter by level or domain.
      </PageHeader>
      <Gallery />
    </div>
  );
}
