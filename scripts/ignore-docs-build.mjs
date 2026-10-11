import { execFileSync } from "node:child_process";
try {
  const files = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean);
  const docsOnly = files.length > 0 && files.every(file => file.startsWith("docs/") || ["README.md", "AGENTS.md", "WORKING-VERSION.md"].includes(file));
  console.log(docsOnly ? "Documentation-only commit; keep the tested deployment." : "Application change; build this commit.");
  process.exit(docsOnly ? 0 : 1);
} catch { console.log("No comparable parent; build this commit."); process.exit(1); }
