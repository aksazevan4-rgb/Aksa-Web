export default function Footer() {
  return (
    <footer className="px-5 py-8 border-t border-border/60">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="font-mono text-xs text-text-tertiary">
          © {new Date().getFullYear()} Aksa Zevan. Dibangun dengan Next.js.
        </p>
        <p className="font-mono text-xs text-text-tertiary">
          AKSA<span className="text-purple">.</span>ID
        </p>
      </div>
    </footer>
  );
}
