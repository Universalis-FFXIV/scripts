import { render } from "ink";
import { Command, program } from "commander";
import { CommandRouter } from "./components/CommandRouter";

async function runCommand(...args: unknown[]) {
  const params: unknown[] = args.slice(0, args.length - 2);
  const options = args[args.length - 2] as Record<string, string>;
  const command = args[args.length - 1] as Command;

  // Render the application and wait until it completes or is terminated manually
  const { unmount, waitUntilExit } = render(
    <CommandRouter params={params} options={options} command={command} />,
  );

  process.on("SIGINT", unmount);
  process.on("SIGTERM", unmount);

  await waitUntilExit();
}

program
  .command("update-opcodes")
  .description(
    "Updates the universalis_act_plugin opcodes using the latest data from FFXIVOpcodes.",
  )
  .action(runCommand);

await program.parseAsync();
