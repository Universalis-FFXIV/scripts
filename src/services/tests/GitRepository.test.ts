import { beforeEach, describe, it, expect, vi } from "vitest";
import path from "node:path";

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

import { GitRepository } from "../GitRepository.js";

describe("GitRepository", () => {
  const repoDir = "/test/repo";
  let repo: GitRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new GitRepository(repoDir);
  });

  describe("clone", () => {
    it("should call git clone with provided URL", async () => {
      const url = "https://github.com/test/repo.git";
      await repo.clone(url);
      expect(mockGitInstance.clone).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.clone).toHaveBeenCalledWith(url);
    });
  });

  describe("add", () => {
    it("should call git add with provided path", async () => {
      const testPath = "test.txt";
      await repo.add(testPath);
      expect(mockGitInstance.add).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.add).toHaveBeenCalledWith(testPath);
    });
  });

  describe("commit", () => {
    it("should call git commit with provided message", async () => {
      const message = "test commit";
      await repo.commit(message);
      expect(mockGitInstance.commit).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.commit).toHaveBeenCalledWith(message);
    });
  });

  describe("push", () => {
    it("should call git push", async () => {
      await repo.push();
      expect(mockGitInstance.push).toHaveBeenCalledTimes(1);
    });
  });

  describe("pull", () => {
    it("should call git pull without arguments when no remote/branch provided", async () => {
      await repo.pull();
      expect(mockGitInstance.pull).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.pull).toHaveBeenCalledWith();
    });

    it("should call git pull with remote and branch when provided", async () => {
      await repo.pull("origin", "main");
      expect(mockGitInstance.pull).toHaveBeenCalledWith("origin", "main");
    });
  });

  describe("submoduleInit", () => {
    it("should call git submoduleInit with empty array when no path provided", async () => {
      await repo.submoduleInit();
      expect(mockGitInstance.submoduleInit).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.submoduleInit).toHaveBeenCalledWith([]);
    });

    it("should call git submoduleInit with path array when path provided", async () => {
      const submodulePath = "test/submodule";
      await repo.submoduleInit(submodulePath);
      expect(mockGitInstance.submoduleInit).toHaveBeenCalledWith([
        submodulePath,
      ]);
    });
  });

  describe("submoduleUpdate", () => {
    it("should call git submoduleUpdate with --init when no path provided", async () => {
      await repo.submoduleUpdate();
      expect(mockGitInstance.submoduleUpdate).toHaveBeenCalledTimes(1);
      expect(mockGitInstance.submoduleUpdate).toHaveBeenCalledWith(["--init"]);
    });

    it("should call git submoduleUpdate with --init and path when path provided", async () => {
      const submodulePath = "test/submodule";
      await repo.submoduleUpdate(submodulePath);
      expect(mockGitInstance.submoduleUpdate).toHaveBeenCalledWith([
        "--init",
        submodulePath,
      ]);
    });
  });

  describe("getFilePath", () => {
    it("should join repoDir with provided path parts", () => {
      const result = repo.getFilePath("test", "path");
      expect(result).toBe(path.join(repoDir, "test", "path"));
    });
  });
});
