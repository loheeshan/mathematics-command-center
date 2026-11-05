import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That page doesn’t exist. Try the <Link href="/learn" className="underline">Master Core map</Link> or <Link href="/library" className="underline">search the library</Link>.</p>
    </div>
  );
}
