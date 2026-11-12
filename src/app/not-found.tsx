import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <span
          className="text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded border"
          style={{
            borderColor: "rgba(184, 151, 94, 0.4)",
            color: "#B8975E",
            backgroundColor: "#FFFFFF",
          }}
        >
          404 • Not Found
        </span>
        <h1
          className="text-3xl font-semibold mb-4"
          style={{ color: "#292322" }}
        >
          Page Not Found
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#292322", opacity: 0.8 }}
        >
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded transition-opacity"
          style={{
            backgroundColor: "#A52232",
            color: "#FFFFFF",
          }}
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
