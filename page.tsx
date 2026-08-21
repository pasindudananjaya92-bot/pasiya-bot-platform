export default function VirtualPCPage() {
  const src = "https://pasiya-bot-platform.vercel.app/";
  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Virtual PC</h1>
          <p className="text-xs text-muted">Full desktop OS embedded inside the dashboard</p>
        </div>
        <a className="btn" href={src} target="_blank" rel="noopener noreferrer">Open standalone</a>
      </div>
      <div className="flex-1 min-h-[480px] rounded-xl border border-line overflow-hidden bg-black">
        <iframe title="Virtual PC" src={src} className="w-full h-full min-h-[480px]" />
      </div>
    </div>
  );
}
