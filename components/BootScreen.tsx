export function BootScreen() {
  return (
    <div className="boot-screen fixed inset-0 z-[3000] flex items-center justify-center">
      <div className="boot-card flex flex-col items-center gap-6 px-6">
        <img className="boot-logo object-contain" src="/images/poko-logo.webp" alt="PokoOS" />
        <div className="text-center">
          <h1 className="text-3xl font-bold">PokoOS</h1>
          <p className="text-sm text-current/62">initializing system engineer portfolio</p>
        </div>
        <div className="boot-track">
          <span />
        </div>
        <div className="font-mono text-xs text-current/52">loading kernel modules: terminal gallery monitor</div>
      </div>
    </div>
  );
}
