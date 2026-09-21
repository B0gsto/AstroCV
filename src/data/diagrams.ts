// One architecture diagram per case study, keyed by the project's content id.
// Coordinates are node centres on the diagram's own grid (default 1000 wide).
// Only draw what the case study states: a diagram is a claim about the system.

export type NodeKind = "core" | "key" | "store" | "external" | "person";

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  kind?: NodeKind;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  packets?: number;
  dur?: number;
}

export interface Diagram {
  caption: string;
  width?: number;
  height?: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const diagrams: Record<string, Diagram> = {
  "contract-management-platform": {
    caption:
      "A scanned contract is read three ways. Whatever each signal finds is merged into one record, managed in the platform and archived in Dynamics 365.",
    height: 380,
    nodes: [
      { id: "scan", label: "Scanned contract", sub: "from the point of sale", x: 110, y: 190, kind: "external" },
      { id: "text", label: "PDF text layer", sub: "when the file has one", x: 370, y: 70 },
      { id: "qr", label: "QR decode", sub: "when it carries a code", x: 370, y: 190 },
      { id: "ocr", label: "OCR", sub: "for everything else", x: 370, y: 310 },
      { id: "record", label: "One contract record", sub: "matched and structured", x: 630, y: 190, kind: "key" },
      { id: "app", label: "Next.js platform", sub: "find, review, manage", x: 880, y: 100 },
      { id: "d365", label: "Dynamics 365", sub: "archive", x: 880, y: 280, kind: "external" },
    ],
    edges: [
      { from: "scan", to: "text" },
      { from: "scan", to: "qr" },
      { from: "scan", to: "ocr" },
      { from: "text", to: "record" },
      { from: "qr", to: "record" },
      { from: "ocr", to: "record" },
      { from: "record", to: "app" },
      { from: "record", to: "d365" },
    ],
  },

  "cross-platform-mobile-app": {
    caption:
      "One codebase, two store releases. At runtime both apps sign in through Entra ID and talk to the same .NET backend.",
    height: 380,
    nodes: [
      { id: "code", label: "One codebase", sub: "React Native + Expo", x: 110, y: 190, kind: "key" },
      { id: "ios", label: "iOS app", sub: "App Store release", x: 370, y: 80 },
      { id: "android", label: "Android app", sub: "Google Play release", x: 370, y: 300 },
      { id: "entra", label: "Entra ID", sub: "the organisation's identity", x: 640, y: 190, kind: "external" },
      { id: "api", label: ".NET backend", x: 890, y: 190 },
    ],
    edges: [
      { from: "code", to: "ios", label: "build" },
      { from: "code", to: "android", label: "build" },
      { from: "ios", to: "entra", label: "sign in" },
      { from: "android", to: "entra", label: "sign in" },
      { from: "entra", to: "api", label: "token", packets: 2 },
    ],
  },

  "enterprise-integration-systems": {
    caption:
      "Every transaction ends one of three ways: done, retried with backoff, or handed to a person with the context attached. The same package is promoted through Dev, UAT and Prod.",
    height: 470,
    nodes: [
      { id: "queue", label: "Orchestrator queue", sub: "transactions + SLAs", x: 120, y: 90, kind: "store" },
      { id: "robot", label: "Robot", sub: "REFramework standard", x: 400, y: 90, kind: "key" },
      { id: "api", label: "REST APIs", sub: "OAuth · pagination · rate limits", x: 700, y: 90, w: 220, kind: "external" },
      { id: "retry", label: "Retry with backoff", sub: "transient errors", x: 260, y: 240 },
      { id: "person", label: "A person", sub: "business + permanent errors", x: 560, y: 240, w: 210, kind: "person" },
      { id: "logs", label: "Structured logs", sub: "one correlation ID per item", x: 860, y: 240, w: 210, kind: "store" },
      { id: "dev", label: "Dev", x: 200, y: 400, w: 130 },
      { id: "uat", label: "UAT", x: 500, y: 400, w: 130 },
      { id: "prod", label: "Prod", x: 800, y: 400, w: 130 },
    ],
    edges: [
      { from: "queue", to: "robot", packets: 2 },
      { from: "robot", to: "api", packets: 2 },
      { from: "robot", to: "retry", dashed: true },
      { from: "retry", to: "queue", dashed: true },
      { from: "robot", to: "person", dashed: true },
      { from: "robot", to: "logs" },
      { from: "dev", to: "uat", label: "versioned package" },
      { from: "uat", to: "prod", label: "release promotion" },
    ],
  },

  "viver-mobile-platform": {
    caption:
      "The app only ever talks to the gateway. Behind it, each Go service owns one concern, and the whole stack is traced and measured locally.",
    height: 500,
    nodes: [
      { id: "app", label: "Mobile app", sub: "React Native + Expo", x: 110, y: 230 },
      { id: "gw", label: "Gateway API", sub: "Go", x: 350, y: 230, w: 160, kind: "key" },
      { id: "auth", label: "Auth", x: 600, y: 50, w: 150 },
      { id: "profiles", label: "Profiles", x: 600, y: 122, w: 150 },
      { id: "discovery", label: "Discovery", x: 600, y: 194, w: 150 },
      { id: "matching", label: "Matching", x: 600, y: 266, w: 150 },
      { id: "chat", label: "Chat", x: 600, y: 338, w: 150 },
      { id: "media", label: "Media", x: 600, y: 410, w: 150 },
      { id: "pg", label: "PostgreSQL", sub: "migrations + seed data", x: 880, y: 194, kind: "store" },
      { id: "minio", label: "MinIO", sub: "object storage", x: 880, y: 410, kind: "store" },
      { id: "obs", label: "Prometheus · Grafana · Jaeger", x: 350, y: 440, w: 250, kind: "store" },
    ],
    edges: [
      { from: "app", to: "gw", packets: 2 },
      { from: "gw", to: "auth", packets: 0 },
      { from: "gw", to: "profiles" },
      { from: "gw", to: "discovery", packets: 0 },
      { from: "gw", to: "matching" },
      { from: "gw", to: "chat", packets: 0 },
      { from: "gw", to: "media" },
      { from: "auth", to: "pg", packets: 0 },
      { from: "profiles", to: "pg" },
      { from: "discovery", to: "pg", packets: 0 },
      { from: "matching", to: "pg" },
      { from: "chat", to: "pg", packets: 0 },
      { from: "media", to: "minio" },
      { from: "gw", to: "obs", dashed: true, label: "metrics + traces" },
    ],
  },

  "ai-code-review-server": {
    caption:
      "The model's answer is never trusted as it arrives. It has to pass a schema before it becomes a review, and every request is measured.",
    height: 400,
    nodes: [
      { id: "ui", label: "React dashboard", sub: "code or a diff", x: 110, y: 100 },
      { id: "mcp", label: "AI coding tool", sub: "over MCP", x: 110, y: 280, kind: "external" },
      { id: "api", label: "Express API", sub: "API key per request", x: 380, y: 190, kind: "key" },
      { id: "llm", label: "LLM", sub: "through OpenRouter", x: 640, y: 100, kind: "external" },
      { id: "zod", label: "Zod validation", sub: "reject anything off-schema", x: 890, y: 100, w: 200 },
      { id: "review", label: "Structured review", sub: "severity + risk score", x: 890, y: 280, w: 200 },
      { id: "prom", label: "Prometheus", sub: "metrics + structured logs", x: 380, y: 350, kind: "store" },
    ],
    edges: [
      { from: "ui", to: "api" },
      { from: "mcp", to: "api" },
      { from: "api", to: "llm", packets: 2 },
      { from: "llm", to: "zod", packets: 2 },
      { from: "zod", to: "review" },
      { from: "api", to: "prom", dashed: true },
    ],
  },

  "rust-cloud-terminal": {
    caption:
      "The terminal runs in the browser, so there is no always-on compute per user. The API only authenticates, streams snapshots and guards quotas.",
    height: 360,
    nodes: [
      { id: "wasm", label: "Browser terminal", sub: "Yew + WebAssembly", x: 120, y: 180, kind: "key" },
      { id: "axum", label: "Axum API", sub: "Rust", x: 460, y: 180 },
      { id: "s3", label: "S3", sub: "workspace snapshots + images", x: 830, y: 80, w: 230, kind: "store" },
      { id: "ddb", label: "DynamoDB", sub: "users + quotas", x: 830, y: 280, w: 230, kind: "store" },
    ],
    edges: [
      { from: "wasm", to: "axum", label: "JWT cookie", packets: 2 },
      { from: "axum", to: "s3", label: "streamed, never buffered" },
      { from: "axum", to: "ddb", label: "conditional writes" },
    ],
  },

  "astrocv-portfolio": {
    caption:
      "Content is typed at build time and shipped as static HTML. The only JavaScript on the page is the motion layer.",
    height: 340,
    nodes: [
      { id: "mdx", label: "MDX content", sub: "projects + writing", x: 110, y: 170 },
      { id: "collections", label: "Content collections", sub: "schema-checked", x: 350, y: 170, kind: "key" },
      { id: "build", label: "Astro build", x: 580, y: 170, w: 150 },
      { id: "html", label: "Static HTML + CSS", x: 830, y: 80, w: 200 },
      { id: "motion", label: "Motion layer", sub: "springs, scroll, transitions", x: 830, y: 260, w: 200 },
    ],
    edges: [
      { from: "mdx", to: "collections" },
      { from: "collections", to: "build", packets: 2 },
      { from: "build", to: "html" },
      { from: "build", to: "motion" },
    ],
  },
};
