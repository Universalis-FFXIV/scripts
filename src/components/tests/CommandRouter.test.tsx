import { render } from "ink-testing-library";
import { describe, it } from "node:test";
import { CommandRouter } from "../CommandRouter";
import { Command } from "commander";
import assert from "node:assert";

describe("CommandRouter", () => {
  it("renders successfully", () => {
    const { stdout, unmount } = render(
      <CommandRouter params={[]} options={{}} command={new Command("test")} />,
    );

    try {
      assert.notEqual(stdout.lastFrame(), "");
    } finally {
      unmount();
    }
  });
});
