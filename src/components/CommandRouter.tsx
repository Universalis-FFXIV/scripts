import { Command } from "commander";
import { Text, useApp } from "ink";
import { UpdateOpcodes } from "./commands/UpdateOpcodes.js";

export interface CommandRouterProps {
  params: unknown[];
  options: Record<string, string>;
  command: Command;
}

export const CommandRouter = ({ command }: CommandRouterProps) => {
  const { exit } = useApp();

  switch (command.name()) {
    case "update-opcodes":
      return <UpdateOpcodes />;
    case "test":
      return <Text>Hello, world!</Text>;
    default:
      return <>{exit()}</>;
  }
};
