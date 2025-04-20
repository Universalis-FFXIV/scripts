import { useRefLazy } from "@/hooks/index.js";
import { GitRepository } from "@/services/GitRepository.js";
import {
  UpdateOpcodesHandler,
  UpdateOpcodesHandlerProgressStep,
} from "@/services/UpdateOpcodesHandler.js";
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

function getStepText(step: UpdateOpcodesHandlerProgressStep) {
  switch (step) {
    case "clone":
      return "Cloning repository...";
    case "update":
      return "Updating opcode definitions...";
    case "commit":
      return "Committing changed files...";
    case "push":
      return "Pushing to repository...";
  }
}

function getCompletedStepText(step: UpdateOpcodesHandlerProgressStep) {
  switch (step) {
    case "clone":
      return "Cloned repository";
    case "update":
      return "Updated opcode definitions";
    case "commit":
      return "Committed changed files";
    case "push":
      return "Pushed to repository";
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const UpdateOpcodes = (_props: UpdateOpcodesProps) => {
  const { exit } = useApp();
  const [progress, setProgress] = useState<UpdateOpcodesHandlerProgressStep[]>(
    [],
  );
  const lastCompletedStep = progress.at(-1);

  const tempDir = useRefLazy(() => mkdtempSync("umgmt-"));
  const gitRepo = useRefLazy(() => new GitRepository(tempDir()));
  const handler = useRefLazy(
    () =>
      new UpdateOpcodesHandler(
        ({ step }) => setProgress((steps) => [...steps, step]),
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
      <Static items={progress}>
        {(step) => (
          <Box key={step}>
            <Text dimColor>{getStepText(step)}</Text>
          </Box>
        )}
      </Static>

      <Box>
        <Text bold color="green">
          {lastCompletedStep
            ? lastCompletedStep !== "push"
              ? getCompletedStepText(lastCompletedStep)
              : "Done!"
            : ""}
        </Text>
      </Box>
    </>
  );
};
