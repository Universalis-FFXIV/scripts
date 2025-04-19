import { UpdateOpcodesHandler } from "@/services/UpdateOpcodesHandler.js";
import { Command } from "commander";
import { Text, useApp } from "ink";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UpdateOpcodesProps {
  params: unknown[];
  options: Record<string, string>;
  command: Command;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const UpdateOpcodes = (props: UpdateOpcodesProps) => {
  const [status, setStatus] = useState("working");
  const { exit } = useApp();

  const tempDirRef = useRef<string | null>(null);

  const getTempDir = useCallback(() => {
    if (tempDirRef.current !== null) {
      return tempDirRef.current;
    }
    const tempDir = mkdtempSync("umgmt-");
    console.log(tempDir); // temporary
    tempDirRef.current = tempDir;
    return tempDir;
  }, []);

  const handlerRef = useRef<UpdateOpcodesHandler | null>(null);

  const getHandler = useCallback(() => {
    if (handlerRef.current !== null) {
      return handlerRef.current;
    }
    const handler = new UpdateOpcodesHandler(getTempDir());
    handlerRef.current = handler;
    return handler;
  }, [getTempDir]);

  useEffect(() => {
    getHandler()
      .updateOpcodes()
      .then(() => setStatus("done"))
      .then(() => rm(getTempDir(), { recursive: true, force: true }))
      .then(() => setTimeout(exit, 3000));
  }, [exit, getHandler, getTempDir]);

  return <Text>{status}</Text>;
};
