import type { Metadata } from "next";
import { Notebook } from "./Notebook";
export const metadata: Metadata = { title: "Notebook" };
export default function Page() {
  return <Notebook />;
}
