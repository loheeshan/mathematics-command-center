import type { Metadata } from "next";
import { Library } from "./Library";
export const metadata: Metadata = { title: "Library & search" };
export default function Page() {
  return <Library />;
}
