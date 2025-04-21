import { describe, expect, it } from "vitest";
import { CommandRouter } from "../CommandRouter.js";
import { Command } from "commander";
import { renderAndAssert } from "@/test-utils/index.js";

describe("CommandRouter", () => {
  it("renders successfully", () => {
    renderAndAssert(
      <CommandRouter params={[]} options={{}} command={new Command("test")} />,
      ({ stdout }) => {
        expect(stdout.lastFrame()).toBe("Hello, world!");
      },
    );
  });
});
