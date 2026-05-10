import { motion as Motion } from "framer-motion";

export const SkeletonCampaignGrid = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="glass-card overflow-hidden">
        <div className="shimmer h-48 w-full" />
        <div className="space-y-3 p-5">
          <div className="shimmer h-4 w-2/3" />
          <div className="shimmer h-3 w-1/2" />
          <div className="shimmer h-2.5 w-full" />
          <div className="shimmer h-10 w-full rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <Motion.div
    className="glass-card mx-auto max-w-xl p-8 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-2xl">
      <i className="bi bi-inbox" />
    </div>
    <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
    <p className="mt-2 text-sm text-slate-300">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </Motion.div>
);

export const ErrorState = ({ title = "Something went wrong", description, onRetry }) => (
  <Motion.div
    className="glass-card mx-auto max-w-xl p-8 text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/20 text-2xl">
      <i className="bi bi-exclamation-triangle" />
    </div>
    <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
    <p className="mt-2 text-sm text-slate-300">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-cyan-500/30"
      >
        Retry
      </button>
    )}
  </Motion.div>
);
