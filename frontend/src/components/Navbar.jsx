export default function Navbar({ activePage, onPageChange }) {
  const baseButtonClass =
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
  const activeClass = "bg-slate-900 text-white";
  const inactiveClass = "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-lg font-bold text-slate-900">CloudTools</p>
          <p className="text-xs text-slate-500">CloudOps Utility Apps</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`${baseButtonClass} ${activePage === "expiration" ? activeClass : inactiveClass}`}
            onClick={() => onPageChange("expiration")}
          >
            Expiration Tracker
          </button>
          <button
            className={`${baseButtonClass} ${activePage === "knowledge" ? activeClass : inactiveClass}`}
            onClick={() => onPageChange("knowledge")}
          >
            Knowledge Articles
          </button>
        </div>
      </div>
    </nav>
  );
}
