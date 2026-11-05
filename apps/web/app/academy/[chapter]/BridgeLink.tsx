"use client";
import Link from "next/link";
import { actions } from "@/lib/store";

export function BridgeLink({ href, returnHref, returnLabel }: { href: string; returnHref: string; returnLabel: string }) {
  return (
    <Link href={href} onClick={() => actions.setReturnTo({ href: returnHref, label: returnLabel })} className="rounded-lg border border-accent px-3 py-1 text-sm text-accent no-underline">
      I need the basics →
    </Link>
  );
}
