import { Command } from "commander";
import { Text, useApp } from "ink";
import { UpdateOpcodes } from "./commands/UpdateOpcodes.js";

export interface CommandRouterProps {
  params: unknown[];
  options: Record<string, unknown>;
  command: Command;
}

export const CommandRouter = ({ command, options }: CommandRouterProps) => {
  const { exit } = useApp();

  switch (command.name()) {
    case "update-opcodes":
      return <UpdateOpcodes options={options} />;
    case "test":
      return <Text>Hello, world!</Text>;
    default:
      return <>{exit()}</>;
  }
};
