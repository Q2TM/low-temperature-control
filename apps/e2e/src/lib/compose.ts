import { spawn } from "node:child_process";

export type ComposeOptions = {
  /** Absolute path to the docker-compose.yaml */
  file: string;
  /** Compose project name. Must be unique per suite. */
  projectName: string;
  /** Optional list of services. If omitted, applies to all services in the file. */
  services?: string[];
  /** Stream stdout/stderr to the parent. Defaults to true. */
  inherit?: boolean;
};

function run(args: string[], opts: ComposeOptions): Promise<void> {
  const baseArgs = [
    "compose",
    "-f",
    opts.file,
    "-p",
    opts.projectName,
    ...args,
  ];
  return new Promise((resolve, reject) => {
    const child = spawn("docker", baseArgs, {
      stdio: opts.inherit === false ? "ignore" : "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`docker ${baseArgs.join(" ")} exited with ${code}`));
    });
  });
}

export async function composeUp(
  opts: ComposeOptions & { build?: boolean; wait?: boolean },
): Promise<void> {
  const args = ["up", "-d"];
  if (opts.build) args.push("--build");
  if (opts.wait) args.push("--wait");
  if (opts.services?.length) args.push(...opts.services);
  await run(args, opts);
}

export async function composeDown(
  opts: ComposeOptions & { volumes?: boolean },
): Promise<void> {
  const args = ["down"];
  if (opts.volumes !== false) args.push("-v");
  await run(args, opts);
}

export async function composeLogs(opts: ComposeOptions): Promise<void> {
  await run(["logs", "--no-color", "--tail", "200"], opts);
}
