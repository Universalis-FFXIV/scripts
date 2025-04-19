import { Command } from "commander";
import { Text } from "ink";
import { useState, useEffect } from "react";

export interface CommandRouterProps {
  params: unknown[];
  options: Record<string, string>;
  command: Command;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CommandRouter = (props: CommandRouterProps) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((previousCounter) => previousCounter + 1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text color="green">{counter} tests passed</Text>;
};
