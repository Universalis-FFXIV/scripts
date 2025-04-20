import { useRefLazy } from "@/hooks/index.js";
import { GitRepository } from "@/services/GitRepository.js";
import { UpdateOpcodesHandler } from "@/services/UpdateOpcodesHandler.js";
import { Command } from "commander";
import { Box, Static, Text, useApp } from "ink";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { useEffect, useState } from "react";

export interface UpdateOpcodesProps {
  params: unknown[];
  options: Record<string, string>;
  command: Command;
}

export const UpdateOpcodes = () => {
  const { exit } = useApp();
  const [messages, setMessages] = useState<string[]>([]);
  const lastMessage = messages.at(-1);

  const tempDir = useRefLazy(() => mkdtempSync("umgmt-"));
  const gitRepo = useRefLazy(() => new GitRepository(tempDir()));
  const handler = useRefLazy(
    () =>
      new UpdateOpcodesHandler(
        ({ message }) => setMessages((msgs) => [...msgs, message]),
        gitRepo(),
      ),
  );

  useEffect(() => {
    handler()
      .updateOpcodes()
      .then(() => rm(tempDir(), { recursive: true, force: true }))
      .then(() => exit());
  }, [exit, handler, tempDir]);

  return (
    <>
      <Static items={messages}>
        {(message) => (
          <Box key={message}>
            <Text dimColor={message !== lastMessage}>{message}</Text>
          </Box>
        )}
      </Static>
    </>
  );
};
