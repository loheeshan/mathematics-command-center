import type { Metadata } from "next";
import { Progress } from "./Progress";
export const metadata: Metadata = { title: "Progress" };
export default function Page() {
  return <Progress />;
}
