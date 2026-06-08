#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const IP_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

function normalizeArg(arg) {
  return arg
    .replace(/^--ip=/, "")
    .replace(/^--/, "")
    .trim();
}

function getIpFromArgs(args) {
  const explicitIpFlag = args.find((arg) => arg.startsWith("--ip="));
  if (explicitIpFlag) {
    return normalizeArg(explicitIpFlag);
  }

  const candidate = args.map(normalizeArg).find((arg) => IP_PATTERN.test(arg));
  return candidate || process.env.DEV_HTTPS_IP || "";
}

const ip = getIpFromArgs(process.argv.slice(2));

if (!IP_PATTERN.test(ip)) {
  console.error("Usage:");
  console.error("  pnpm dev:https --192.168.209.236");
  console.error("  pnpm dev:https 192.168.209.236");
  console.error("  pnpm dev:https -- --ip=192.168.209.236");
  console.error("");
  console.error("Before running, generate the matching certificate:");
  console.error("  mkdir -p certificates");
  console.error(
    "  mkcert -key-file certificates/<IP>-key.pem -cert-file certificates/<IP>.pem <IP>",
  );
  process.exit(1);
}

const keyPath = `./certificates/${ip}-key.pem`;
const certPath = `./certificates/${ip}.pem`;

if (!existsSync(keyPath) || !existsSync(certPath)) {
  console.error(`Missing certificate files for ${ip}:`);
  console.error(`  ${keyPath}`);
  console.error(`  ${certPath}`);
  console.error("");
  console.error("Generate them with:");
  console.error("  mkdir -p certificates");
  console.error(
    `  mkcert -key-file certificates/${ip}-key.pem -cert-file certificates/${ip}.pem ${ip}`,
  );
  process.exit(1);
}

const nextArgs = [
  "next",
  "dev",
  "--turbopack",
  "--experimental-https",
  "-H",
  "0.0.0.0",
  "--experimental-https-key",
  keyPath,
  "--experimental-https-cert",
  certPath,
];

const child = spawn("pnpm", ["exec", ...nextArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_ALLOWED_DEV_ORIGIN: ip,
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || `https://${ip}:3000`,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
