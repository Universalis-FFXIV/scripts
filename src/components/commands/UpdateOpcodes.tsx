import { useRefLazy } from "@/hooks/index.js";
import { GitRepository } from "@/services/GitRepository.js";
import { UpdateOpcodesHandler } from "@/services/UpdateOpcodesHandler.js";
import { UpdateOpcodesImageHandler } from "@/services/UpdateOpcodesImageHandler.js";
import { Box, Static, Text, useApp } from "ink";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { useEffect, useState } from "react";

export interface UpdateOpcodesProps {
  options: Record<string, unknown>;
}

export const UpdateOpcodes = ({ options }: UpdateOpcodesProps) => {
  const { exit } = useApp();
  const [messages, setMessages] = useState<string[]>([]);
  const lastMessage = messages.at(-1);

  const tempDir = useRefLazy(() => mkdtempSync("umgmt-"));
  const gitRepo = useRefLazy(() => new GitRepository(tempDir()));
  const opcodesHandler = useRefLazy(
    () =>
      new UpdateOpcodesHandler(
        ({ message }) => setMessages((msgs) => [...msgs, message]),
        gitRepo(),
        options["dryRun"] === true,
      ),
  );
  const imageHandler = useRefLazy(
    () =>
      new UpdateOpcodesImageHandler(
        ({ message }) => setMessages((msgs) => [...msgs, message]),
        gitRepo(),
        options["dryRun"] === true,
      ),
  );

  useEffect(() => {
    opcodesHandler()
      .updateOpcodes()
      .then(() => imageHandler().updateImage())
      .then(() => rm(tempDir(), { recursive: true, force: true }))
      .then(() => exit());
  }, [exit, opcodesHandler, imageHandler, tempDir]);

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
