import { Command } from "commander";
import { Text, useApp } from "ink";

export interface CommandRouterProps {
  params: unknown[];
  options: Record<string, string>;
  command: Command;
}

export const CommandRouter = (props: CommandRouterProps) => {
  const { exit } = useApp();

  switch (props.command.name()) {
    case "update-opcodes":
      return <Text>TODO</Text>;
    case "test":
      return <Text>Hello, world!</Text>;
    default:
      return <>{exit()}</>;
  }
};
