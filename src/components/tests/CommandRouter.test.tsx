import { describe, it } from "node:test";
import { CommandRouter } from "../CommandRouter";
import { Command } from "commander";
import assert from "node:assert";
import { renderAndAssert } from "@/test-utils";

describe("CommandRouter", () => {
  it("renders successfully", () => {
    renderAndAssert(
      <CommandRouter params={[]} options={{}} command={new Command("test")} />,
      ({ stdout }) => {
        assert.strictEqual(stdout.lastFrame(), "Hello, world!");
      },
    );
  });
});
