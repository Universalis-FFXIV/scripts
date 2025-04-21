import { beforeEach, describe, it, expect, vi, Mock } from "vitest";

type MockExeca = typeof execa & {
  execaSpy: Mock;
};

vi.mock("execa", () => {
  const execaSpy = vi.fn();

  const execaFn = (...args: never[]) => {
    execaSpy(...args);

    // Return a template literal tag function when called with options
    if (args.length === 1 && typeof args[0] === "object") {
      const options = args[0];
      const tagFn = (...tagArgs: unknown[]) => {
        execaSpy(options, ...tagArgs);
        return Promise.resolve({ stdout: "", stderr: "" });
      };
      tagFn.sync = () => ({ stdout: "", stderr: "" });
      return tagFn;
    }

    // Normal function call
    return Promise.resolve({ stdout: "", stderr: "" });
  };

  execaFn.sync = () => ({ stdout: "", stderr: "" });
  execaFn.execaSpy = execaSpy; // Expose the spy on the function itself

  // Return both the spy for assertions and the function for execution
  return {
    default: execaFn,
    execa: execaFn,
  };
});

const mockGitInstance = {
  clone: vi.fn(() => Promise.resolve("")),
  add: vi.fn(() => Promise.resolve("")),
  commit: vi.fn(() => Promise.resolve("")),
  push: vi.fn(() => Promise.resolve("")),
  pull: vi.fn(() => Promise.resolve("")),
  submoduleInit: vi.fn(() => Promise.resolve("")),
  submoduleUpdate: vi.fn(() => Promise.resolve("")),
};

vi.mock("simple-git", () => {
  return {
    simpleGit: vi.fn(() => mockGitInstance),
    default: {
      simpleGit: vi.fn(() => mockGitInstance),
    },
  };
});

import { execa } from "execa";
import { UpdateOpcodesImageHandler } from "../UpdateOpcodesImageHandler.js";
import { GitRepository } from "../GitRepository.js";

describe("UpdateOpcodesImageHandler", () => {
  const repoDir = "/test/repo";
  const mockProgress = vi.fn();
  let handler: UpdateOpcodesImageHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new UpdateOpcodesImageHandler(
      mockProgress,
      new GitRepository(repoDir),
    );
  });

  describe("updateImage", () => {
    it("should execute the full update flow", async () => {
      await handler.updateImage();

      // Verify progress messages
      expect(mockProgress).toHaveBeenCalledWith({
        message: "Cloning Terraform repository...",
      });

      // Verify git operations
      expect(mockGitInstance.clone).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.submoduleInit).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.submoduleUpdate).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.pull).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.add).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.commit).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.push).toHaveBeenCalledTimes(1);

      // Verify Docker commands were executed
      const execaSpy = (execa as MockExeca).execaSpy;
      expect(execaSpy).toHaveBeenCalled();
    });

    it("should skip operations in dry run mode", async () => {
      handler = new UpdateOpcodesImageHandler(
        mockProgress,
        new GitRepository(repoDir),
        true,
      );

      await handler.updateImage();

      // Verify git push was not called
      expect(mockGitInstance.push).not.toHaveBeenCalled();

      // Verify Docker commands were not executed
      const execaSpy = (execa as MockExeca).execaSpy;
      expect(execaSpy).not.toHaveBeenCalled();

      // Verify dry run messages
      expect(mockProgress).toHaveBeenCalledWith({
        message: "[DRY RUN] Skipping git push",
      });
      expect(mockProgress).toHaveBeenCalledWith({
        message: "[DRY RUN] Skipping Docker operations",
      });
    });

    it("should correctly handle Git repository paths", async () => {
      await handler.updateImage();

      // Verify correct paths are used for submodule operations
      const submodulePath =
        "images/universalis-act-nginx/universalis_act_plugin";

      const initCalls = mockGitInstance.submoduleInit.mock.calls;
      expect(initCalls.length).toBeGreaterThan(0);
      const initArgs = initCalls[0] as unknown[][];
      expect(Array.isArray(initArgs[0])).toBe(true);
      expect(initArgs[0][0]).toBe(submodulePath);

      const updateCalls = mockGitInstance.submoduleUpdate.mock.calls;
      expect(updateCalls.length).toBeGreaterThan(0);
      const updateArgs = updateCalls[0] as unknown[][];
      expect(Array.isArray(updateArgs[0])).toBe(true);
      expect(updateArgs[0][1]).toBe(submodulePath);

      const addCalls = mockGitInstance.add.mock.calls as unknown[][];
      expect(addCalls.length).toBeGreaterThan(0);
      expect(addCalls[0][0]).toBe(submodulePath);
    });
  });
});
