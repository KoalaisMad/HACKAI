import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Page not found
      </h1>
      <p className="text-[var(--muted-foreground)]">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Log in
        </Link>
        <Link
          href="/"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
