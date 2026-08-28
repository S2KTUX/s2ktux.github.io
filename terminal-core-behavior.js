import {
  TERMINAL_LIMITS,
  validateVirtualWrite,
} from "./terminal-resource-limits.js?v=20260826-phase5";

export function scoreChallengeResult(result) {
  return result && result.ok ? 100 : 0;
}

export function evaluateVirtualWrite({
  fs,
  node,
  nextContent,
  additionalNodes = node ? 0 : 1,
  availableBytes,
  limits = TERMINAL_LIMITS,
}) {
  return validateVirtualWrite(fs, node, nextContent, additionalNodes, {
    ...limits,
    virtualDiskBytes: availableBytes,
  });
}

export function dnfVersionLines(version, bootStartedAt) {
  return [
    version,
    `  Installed: dnf-0:${version}-9.el9.noarch at ${new Date(bootStartedAt)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)}`,
  ];
}

export function terminalSignalResult(signal) {
  if (signal === "C") return { status: 130, output: "^C" };
  if (signal === "Z") return { status: 148, output: "^Z" };
  throw new TypeError(`Señal de terminal no soportada: ${signal}`);
}
