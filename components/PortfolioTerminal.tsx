"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { PokoWindow, type PokoWindowHandle } from "@/components/PokoWindow";
import { useTerminal, type TerminalLine, type TerminalTone } from "@/hooks/useTerminal";

type PortfolioTerminalProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  zIndex: number;
  active: boolean;
  onFocus: () => void;
};

function toneClass(tone?: TerminalTone) {
  return [
    tone === "muted" ? "text-current/58" : "",
    tone === "accent" ? "text-[var(--terminal-accent)]" : "",
    tone === "success" ? "text-emerald-300" : "",
    tone === "warning" ? "text-amber-300" : "",
    tone === "error" ? "text-rose-300" : ""
  ].filter(Boolean).join(" ");
}

function TerminalLineView({ line }: { line: TerminalLine }) {
  if (line.kind === "command") {
    return (
      <>
        <span className="terminal-prompt">poko@poko-os:~$ </span>
        <span>{line.command}</span>
      </>
    );
  }

  if (line.kind === "group") {
    return (
      <>
        {line.lines.map((item) => (
          <span key={item} className={`block whitespace-pre-wrap ${toneClass(line.tone)}`}>
            {item}
          </span>
        ))}
      </>
    );
  }

  if (line.kind === "link") {
    return (
      <a
        className="inline-flex items-center gap-2 rounded-md border border-current/25 px-2 py-0.5 text-[0.82rem] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-current/40"
        href={line.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{line.label}</span>
        <span className="text-current/45">{line.text}</span>
      </a>
    );
  }

  if (line.kind === "empty") {
    return <br />;
  }

  return <span className={toneClass(line.tone)}>{line.text}</span>;
}

export const PortfolioTerminal = forwardRef<PokoWindowHandle, PortfolioTerminalProps>(function PortfolioTerminal({
  open,
  onOpenChange,
  zIndex,
  active,
  onFocus
}, ref) {
  const windowRef = useRef<PokoWindowHandle | null>(null);
  const {
    prompt,
    cmdInput,
    setCmdInput,
    inputRef,
    contentRef,
    terminalLines,
    runCommand,
    focusCommandInput,
    scrollToBottom,
    handleKeydown
  } = useTerminal();

  useImperativeHandle(ref, () => ({
    restore: (focus?: () => void) => windowRef.current?.restore(focus ?? focusCommandInput)
  }), [focusCommandInput]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      focusCommandInput();
      scrollToBottom();
    });
  }, [focusCommandInput, scrollToBottom]);

  return (
    <PokoWindow
      ref={windowRef}
      open={open}
      onOpenChange={onOpenChange}
      title="Poko Terminal"
      subtitle="Linux command line for PokoOS"
      icon=">_"
      zIndex={zIndex}
      active={active}
      initialBounds={{ top: 96, left: 64, width: 540, height: 536 }}
      onFocus={onFocus}
    >
      <div className="terminal-app grid h-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <div
          ref={contentRef}
          className="terminal-output min-h-0 overflow-y-auto px-4 py-3 text-[0.86rem] leading-6"
          onClick={focusCommandInput}
        >
          {terminalLines.map((line, index) => (
            <div
              key={`${line.kind}-${index}`}
              className={`terminal-line ${line.kind === "command" ? "mt-2" : ""}`}
            >
              <TerminalLineView line={line} />
            </div>
          ))}
        </div>

        <form className="terminal-input-row border-t px-4 py-2" onSubmit={(event) => { event.preventDefault(); runCommand(); }}>
          <label className="flex items-center gap-2 text-sm">
            <span className="terminal-prompt shrink-0">{prompt}</span>
            <input
              ref={inputRef}
              value={cmdInput}
              onChange={(event) => setCmdInput(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-current outline-none placeholder:text-current/32"
              type="text"
              aria-label="Terminal command"
              autoComplete="off"
              spellCheck={false}
              placeholder="try neofetch"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  runCommand();
                  return;
                }

                handleKeydown(event);
              }}
            />
          </label>
        </form>
      </div>
    </PokoWindow>
  );
});
