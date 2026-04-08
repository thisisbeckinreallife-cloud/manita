// Semantic tool-call icon dispatcher. Maps the `tool` field of a
// TOOL_CALL payload to a small inline SVG. Unknown tools fall back to
// a neutral dot.

type IconProps = { className?: string };

function Svg({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-3.5 w-3.5"}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  read: (p) => (
    <Svg className={p.className}>
      <path d="M2 3h5a2 2 0 0 1 2 2v9a1 1 0 0 1-1-1H2z" />
      <path d="M14 3H9a2 2 0 0 0-2 2v9a1 1 0 0 0 1-1h6z" />
    </Svg>
  ),
  grep: (p) => (
    <Svg className={p.className}>
      <circle cx="7" cy="7" r="4" />
      <path d="m14 14-3.5-3.5" />
    </Svg>
  ),
  edit: (p) => (
    <Svg className={p.className}>
      <path d="M11 2 3 10v3h3l8-8z" />
      <path d="m10 3 3 3" />
    </Svg>
  ),
  write: (p) => (
    <Svg className={p.className}>
      <path d="M3 2h7l3 3v9H3z" />
      <path d="M10 2v3h3" />
      <path d="M6 9h4M6 11h4" />
    </Svg>
  ),
  bash: (p) => (
    <Svg className={p.className}>
      <rect x="1.5" y="3" width="13" height="10" rx="1" />
      <path d="m4 7 2 2-2 2M8 11h4" />
    </Svg>
  ),
  http: (p) => (
    <Svg className={p.className}>
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2c2 2 3 3.5 3 6s-1 4-3 6c-2-2-3-3.5-3-6s1-4 3-6z" />
    </Svg>
  ),
  run: (p) => (
    <Svg className={p.className}>
      <path d="M4 2v12l10-6z" />
    </Svg>
  ),
};

export function ToolIcon({
  tool,
  className,
}: {
  tool: string;
  className?: string;
}) {
  const key = tool.toLowerCase();
  const Match = ICONS[key];
  if (Match) return <Match className={className} />;
  return (
    <span
      className={`inline-block ${className ?? "h-3.5 w-3.5"} rounded-full bg-ink-500`}
      aria-hidden="true"
    />
  );
}
