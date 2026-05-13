import { computed, nextTick, ref } from "vue";

export type TerminalTone = "accent" | "muted" | "success" | "warning" | "error";

export type TerminalLine =
  | { kind: "command"; command: string }
  | { kind: "text"; text: string; tone?: TerminalTone }
  | { kind: "group"; lines: string[]; tone?: TerminalTone }
  | { kind: "link"; label: string; href: string; text: string }
  | { kind: "empty" };

type CommandContext = {
  args: string[];
  raw: string;
  command: string;
};

type CommandDefinition = {
  description: string;
  aliases?: string[];
  usage?: string;
  detail?: string;
  run: (context: CommandContext) => TerminalLine[] | void;
};

const prompt = "poko@poko-os:~$";
const themes = ["aqua", "violet", "mono", "light", "dark"] as const;
const portfolioLinks = {
  facebook: "https://www.facebook.com/pokomiko",
  x: "https://x.com/Poko_miko",
  vrchat: "https://vrchat.com/home/user/usr_21c3ad19-5da2-4f9b-b373-0d0d8af38c7a"
};

function text(text: string, tone?: TerminalTone): TerminalLine {
  return { kind: "text", text, tone };
}

function group(lines: string[], tone?: TerminalTone): TerminalLine {
  return { kind: "group", lines, tone };
}

function empty(): TerminalLine {
  return { kind: "empty" };
}

function normalizeCommand(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function distance(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, (_, index) => [index]);

  for (let index = 0; index <= a.length; index += 1) {
    matrix[0][index] = index;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      matrix[row][column] = b[row - 1] === a[column - 1]
        ? matrix[row - 1][column - 1]
        : Math.min(
          matrix[row - 1][column - 1] + 1,
          matrix[row][column - 1] + 1,
          matrix[row - 1][column] + 1
        );
    }
  }

  return matrix[b.length][a.length];
}

export function useTerminal() {
  const cmdInput = ref("");
  const inputRef = ref<HTMLInputElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);
  const activeTheme = ref<(typeof themes)[number]>("aqua");
  const terminalLines = ref<TerminalLine[]>([
    text("PokoOS terminal attached to /dev/portfolio", "success"),
    text("Linux-style command surface ready. Type \"help\" to begin.", "accent")
  ]);
  const logLines = ref<string[]>([
    "[sys] session attached",
    "[net] static portfolio mode"
  ]);
  const history = ref<string[]>([]);
  const historyCursor = ref(0);

  const commands: Record<string, CommandDefinition> = {
    help: {
      aliases: ["?", "commands"],
      description: "List available commands",
      usage: "help [command]",
      detail: "Display command descriptions. Use help -d <command> for a focused description.",
      run({ args }) {
        const detailTarget = args[0] === "-d" ? args[1] : args[0];

        if (detailTarget) {
          const target = resolveCommand(detailTarget);

          if (!target) {
            return [text(`help: no help topics match "${detailTarget}"`, "warning")];
          }

          const command = commands[target];
          return [
            text(`${target} - ${command.description}`, "accent"),
            text(command.usage ? `usage: ${command.usage}` : "usage: command", "muted"),
            text(command.detail ?? command.description)
          ];
        }

        return [
          text("PokoOS shell 3.0.0 - System Engineer portfolio", "accent"),
          group(commandNames.value.map((name) => `${name.padEnd(11)} ${commands[name].description}`)),
          empty(),
          text("Try: neofetch, devops, infra, monitor, projects, theme light", "muted")
        ];
      }
    },
    clear: {
      aliases: ["cls"],
      description: "Clear the terminal screen",
      detail: "Clear visible output while keeping the session alive.",
      run() {
        terminalLines.value = [text("Terminal cleared. Type \"help\" when ready.", "muted")];
        log("[cmd] clear");
      }
    },
    whoami: {
      aliases: ["me", "about"],
      description: "Show Poko profile",
      usage: "whoami",
      detail: "Print the profile owner and a short personal intro.",
      run() {
        return [
          text("poko", "accent"),
          group([
            "System Engineer portfolio owner.",
            "Focus: Linux operations, DevOps fundamentals, monitoring, automation, and reliable web systems.",
            "Current lane: sharpening CI/CD, containers, infrastructure-as-code, and observability."
          ])
        ];
      }
    },
    profile: {
      aliases: ["bio", "card"],
      description: "Print a compact portfolio card",
      run() {
        return [
          group([
            "Name: Poko",
            "Role: System Engineer",
            "Focus: Linux, DevOps, monitoring, automation",
            "Status: online",
            "Shell: PokoOS terminal"
          ], "accent")
        ];
      }
    },
    pwd: {
      description: "Print current directory",
      run() {
        return [text("/home/poko/portfolio")];
      }
    },
    ls: {
      aliases: ["dir"],
      description: "List portfolio files",
      run() {
        return [group(["about.txt", "devops.yml", "skills.json", "projects/", "gallery/", "monitoring/", "socials/"])];
      }
    },
    cat: {
      description: "Read a portfolio file",
      usage: "cat <file>",
      run({ args }) {
        const file = args.join(" ");

        if (file === "about.txt") {
          return commands.whoami.run({ args: [], raw: "whoami", command: "whoami" });
        }

        if (file === "skills.json" || file === "devops.yml") {
          return commands.skills.run({ args: [], raw: "skills", command: "skills" });
        }

        if (file === "vrchat.url") {
          return commands.vrchat.run({ args: [], raw: "vrchat", command: "vrchat" });
        }

        return [text(`cat: ${file || "<file>"}: No such portfolio file`, "warning")];
      }
    },
    skills: {
      aliases: ["stack", "tools"],
      description: "Show tools and strengths",
      run() {
        return [
          group([
            "Core: Linux, shell scripting, networking basics, Windows operations",
            "DevOps focus: Docker, CI/CD, Git workflows, infrastructure-as-code",
            "Observability: CPU/RAM monitoring, uptime checks, log-first debugging",
            "Frontend support: Nuxt, Vue, Tailwind, static deployment, asset optimization"
          ])
        ];
      }
    },
    projects: {
      aliases: ["work", "portfolio"],
      description: "List featured projects",
      run() {
        return [
          group([
            "[live] PokoOS Portfolio    OS-style Nuxt profile shell",
            "[live] Client Monitor      browser-side CPU/RAM dashboard",
            "[live] VRChat Gallery      optimized WebP media library",
            "[focus] DevOps Lab         CI/CD, containers, observability practice"
          ])
        ];
      }
    },
    experience: {
      aliases: ["exp", "timeline"],
      description: "Show work style timeline",
      run() {
        return [
          group([
            "2026  Building PokoOS as a System Engineer portfolio interface.",
            "2025  Optimized media assets and rebuilt the site around terminal workflows.",
            "Now   Focusing DevOps: containers, pipelines, monitoring, repeatable deploys."
          ])
        ];
      }
    },
    socials: {
      aliases: ["links", "contact"],
      description: "Show social links",
      run() {
        return [
          text("Known links:", "accent"),
          { kind: "link", label: "Facebook", href: portfolioLinks.facebook, text: "open facebook" },
          { kind: "link", label: "X", href: portfolioLinks.x, text: "open x" },
          { kind: "link", label: "VRChat", href: portfolioLinks.vrchat, text: "open vrchat" }
        ];
      }
    },
    open: {
      aliases: ["go"],
      description: "Open a known social link",
      usage: "open <facebook|x|vrchat>",
      run({ args }) {
        const target = args[0]?.toLowerCase() as keyof typeof portfolioLinks | undefined;

        if (!target || !portfolioLinks[target]) {
          return [text("open: choose facebook, x, or vrchat", "warning")];
        }

        window.open(portfolioLinks[target], "_blank", "noopener,noreferrer");
        log(`[nav] opened ${target}`);
        return [text(`Opening ${target} in a new tab...`, "success")];
      }
    },
    vrchat: {
      aliases: ["vrc"],
      description: "Show VRChat profile note",
      run() {
        return [
          text("VRChat presence detected.", "accent"),
          text("Poko keeps the social portal in the dock and terminal."),
          text("Try: open vrchat", "muted")
        ];
      }
    },
    gallery: {
      aliases: ["photos", "slideshow"],
      description: "Describe the site gallery",
      run() {
        return [
          group([
            "gallery/ contains optimized VRChat WebP captures.",
            "Open the Gallery app from the top dock for full window controls.",
            "Thumbnails are separated from full images for faster loading."
          ])
        ];
      }
    },
    theme: {
      aliases: ["themes", "colors"],
      description: "Switch terminal or OS theme",
      usage: "theme [aqua|violet|mono|light|dark]",
      run({ args }) {
        const theme = args[0] as (typeof themes)[number] | undefined;

        if (!theme) {
          return [text(`Active terminal theme: ${activeTheme.value}. Available: ${themes.join(", ")}`, "accent")];
        }

        if (!themes.includes(theme)) {
          return [text(`theme: "${theme}" is not available. Try ${themes.join(", ")}`, "warning")];
        }

        if (theme === "light" || theme === "dark") {
          window.dispatchEvent(new CustomEvent("poko:set-theme", { detail: { mode: theme } }));
          log(`[ui] os theme ${theme}`);
          return [text(`PokoOS switched to ${theme} mode.`, "success")];
        }

        activeTheme.value = theme;
        log(`[ui] terminal accent ${theme}`);
        return [text(`Terminal accent switched to ${theme}.`, "success")];
      }
    },
    now: {
      aliases: ["status", "currently"],
      description: "Show current site status",
      run() {
        return [
          group([
            "Status: online",
            "Mode: PokoOS desktop",
            "Current focus: DevOps foundations, monitoring, automation, and clean deployment flows"
          ])
        ];
      }
    },
    neofetch: {
      aliases: ["fetch"],
      description: "Show PokoOS system card",
      run() {
        return [
          group([
            "        ____        PokoOS",
            "   ___ / __ \\___    host: portfolio.local",
            "  / _ \\ /_/ / _ \\   role: System Engineer",
            " / .__/\\____/\\___/  focus: DevOps + Observability",
            "/_/                 shell: poko-terminal",
            "                    desktop: liquid glass windows"
          ], "accent")
        ];
      }
    },
    devops: {
      aliases: ["focus", "roadmap"],
      description: "Show current DevOps focus",
      run() {
        return [
          group([
            "Learning track:",
            "- Docker images, Compose workflows, and container networking",
            "- CI/CD pipelines with repeatable checks before deploy",
            "- Infrastructure-as-code concepts and environment hygiene",
            "- Monitoring, logs, alerts, and performance baselines"
          ])
        ];
      }
    },
    infra: {
      aliases: ["systems", "ops"],
      description: "Show systems engineering stack",
      run() {
        return [
          group([
            "OS: Linux-first mindset, Windows support when needed",
            "Network: DNS, HTTP, ports, firewalls, reverse proxy basics",
            "Runtime: Node/Nuxt, static hosting, build artifacts",
            "Practice: document, automate, observe, improve"
          ])
        ];
      }
    },
    monitor: {
      aliases: ["top", "htop"],
      description: "Open monitoring hint",
      run() {
        return [
          text("Open the Monitor app from the top dock for live client-side CPU/RAM estimates.", "accent"),
          group([
            "CPU source: event-loop delay estimate + browser hardware hints",
            "RAM source: JS heap when available, otherwise API unavailable"
          ], "muted")
        ];
      }
    },
    uname: {
      description: "Print kernel-style name",
      run() {
        return [text("PokoOS portfolio-kernel 3.0.0 x86_64 web-client")];
      }
    },
    uptime: {
      description: "Show browser session uptime",
      run() {
        return [text(`up ${Math.floor(performance.now() / 1000)} seconds, 1 visitor, load average: client-side`)];
      }
    },
    ps: {
      description: "List running PokoOS apps",
      run() {
        return [
          group([
            "PID   APP          STATE",
            "101   terminal     interactive",
            "202   gallery      windowed",
            "303   monitor      sampling",
            "404   topbar       resident"
          ])
        ];
      }
    },
    date: {
      aliases: ["time"],
      description: "Show local date and time",
      run() {
        return [text(new Intl.DateTimeFormat("en-GB", {
          dateStyle: "full",
          timeStyle: "medium",
          timeZone: "Asia/Bangkok"
        }).format(new Date()))];
      }
    },
    history: {
      aliases: ["hist"],
      description: "Show command history",
      run() {
        if (history.value.length === 0) {
          return [text("No commands in history yet.", "muted")];
        }

        return [group(history.value.map((item, index) => `${String(index + 1).padStart(2, "0")}  ${item}`))];
      }
    },
    echo: {
      description: "Print text back to the terminal",
      usage: "echo <text>",
      run({ args }) {
        return [text(args.join(" "))];
      }
    },
    random: {
      aliases: ["fortune", "quote"],
      description: "Print a tiny status line",
      run() {
        const lines = [
          "Tiny interfaces can still have a pulse.",
          "A profile site is a handshake, not a billboard.",
          "Good UI answers before visitors have to ask.",
          "The cleanest command is the one you remember."
        ];

        return [text(lines[Math.floor(Math.random() * lines.length)], "accent")];
      }
    },
    info: {
      description: "Show command metadata",
      usage: "info <command>",
      run({ args }) {
        const target = resolveCommand(args[0] ?? "");

        if (!target) {
          return [text(`info: ${args[0] || "<command>"}: not found`, "warning")];
        }

        return [text(`'${target}' ${commands[target].description.toLowerCase()}.`)];
      }
    }
  };

  const aliasMap = computed(() => {
    return Object.entries(commands).reduce<Record<string, string>>((acc, [name, definition]) => {
      acc[name] = name;
      definition.aliases?.forEach((alias) => {
        acc[alias] = name;
      });
      return acc;
    }, {});
  });

  const commandNames = computed(() => Object.keys(commands).sort());
  const allCommandTokens = computed(() => Object.keys(aliasMap.value).sort());

  function log(message: string) {
    const stamp = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date());

    logLines.value = [...logLines.value.slice(-8), `[${stamp}] ${message}`];
  }

  function resolveCommand(value: string) {
    return aliasMap.value[value.toLowerCase()];
  }

  function suggestCommand(value: string) {
    const [suggestion] = allCommandTokens.value
      .map((name) => ({ name, score: distance(value, name) }))
      .filter((item) => item.score <= 3)
      .sort((a, b) => a.score - b.score);

    return suggestion?.name;
  }

  function pushOutput(lines?: TerminalLine[] | void) {
    if (!lines || lines.length === 0) {
      return;
    }

    terminalLines.value.push(...lines);
  }

  function runCommand() {
    const raw = normalizeCommand(cmdInput.value);

    if (!raw) {
      return;
    }

    terminalLines.value.push({ kind: "command", command: raw });
    history.value.push(raw);
    historyCursor.value = history.value.length;

    const [token, ...args] = raw.split(" ");
    const commandName = resolveCommand(token);

    if (!commandName) {
      const suggestion = suggestCommand(token);
      terminalLines.value.push(text(`poko-shell: ${token}: command not found`, "error"));

      if (suggestion) {
        terminalLines.value.push(text(`Did you mean "${suggestion}"?`, "warning"));
      }

      log(`[err] ${token} not found`);
    } else {
      const output = commands[commandName].run({ args, raw, command: commandName });
      pushOutput(output);
    }

    cmdInput.value = "";
    nextTick(() => {
      focusCommandInput();
      scrollToBottom();
    });
  }

  function focusCommandInput() {
    inputRef.value?.focus();
  }

  function scrollToBottom() {
    if (!contentRef.value) {
      return;
    }

    contentRef.value.scrollTop = contentRef.value.scrollHeight;
  }

  function moveHistory(direction: -1 | 1) {
    if (history.value.length === 0) {
      return;
    }

    historyCursor.value = Math.min(Math.max(historyCursor.value + direction, 0), history.value.length);
    cmdInput.value = history.value[historyCursor.value] ?? "";

    nextTick(() => {
      const input = inputRef.value;
      input?.setSelectionRange(input.value.length, input.value.length);
    });
  }

  function autocomplete() {
    const raw = cmdInput.value;
    const [token, ...rest] = raw.split(" ");

    if (rest.length > 0) {
      return;
    }

    const matches = allCommandTokens.value.filter((name) => name.startsWith(token.toLowerCase()));

    if (matches.length === 1) {
      cmdInput.value = matches[0];
      return;
    }

    if (matches.length > 1) {
      terminalLines.value.push(text(matches.join("  "), "muted"));
      nextTick(scrollToBottom);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHistory(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHistory(1);
    } else if (event.key === "Tab") {
      event.preventDefault();
      autocomplete();
    }
  }

  return {
    prompt,
    cmdInput,
    inputRef,
    contentRef,
    terminalLines,
    logLines,
    activeTheme,
    commandNames,
    runCommand,
    focusCommandInput,
    scrollToBottom,
    handleKeydown
  };
}
