import type { Metadata } from "next";
import { Exams } from "./Exams";
export const metadata: Metadata = { title: "Exams" };
export default function Page() {
  return <Exams />;
}
