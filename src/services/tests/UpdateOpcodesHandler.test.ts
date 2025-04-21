import { beforeEach, describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => {
  return {
    writeFile: vi.fn(() => Promise.resolve()),
    default: { writeFile: vi.fn(() => Promise.resolve()) },
  };
});

import fs from "node:fs/promises";
import { UpdateOpcodesHandler } from "../UpdateOpcodesHandler.js";
import { GitRepository } from "../GitRepository.js";

const mockResponse = {
  json: () =>
    Promise.resolve([
      {
        region: "Global",
        lists: {
          ServerZoneIpcType: [
            { name: "PlayerSpawn", opcode: 1 },
            { name: "PlayerSetup", opcode: 2 },
            { name: "ItemMarketBoardInfo", opcode: 3 },
            { name: "MarketBoardItemListingCount", opcode: 4 },
            { name: "MarketBoardItemListing", opcode: 5 },
            { name: "MarketBoardItemListingHistory", opcode: 6 },
            { name: "ResultDialog", opcode: 7 },
          ],
        },
      },
    ]),
};

describe("UpdateOpcodesHandler", () => {
  const mockGit = {
    clone: vi.fn(() => Promise.resolve("")),
    add: vi.fn(() => Promise.resolve("")),
    commit: vi.fn(() => Promise.resolve("")),
    push: vi.fn(() => Promise.resolve("")),
    getFilePath: vi.fn((path) => `/test/repo/${path}`),
  };
  const mockProgress = vi.fn();
  const mockFetchFn = vi.fn(() => Promise.resolve(mockResponse));

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = mockFetchFn as unknown as typeof fetch;
  });

  describe("updateOpcodes", () => {
    it("should execute the full update flow", async () => {
      const handler = new UpdateOpcodesHandler(
        mockProgress,
        mockGit as unknown as GitRepository,
      );

      await handler.updateOpcodes();

      // Verify progress messages
      expect(mockProgress).toHaveBeenCalledTimes(8);
      expect(mockProgress).toHaveBeenCalledWith({
        message: "Cloning ACT plugin repository...",
      });

      // Verify git operations
      expect(mockGit.clone).toHaveBeenCalledTimes(1);
      expect(mockGit.add).toHaveBeenCalledTimes(1);
      expect(mockGit.commit).toHaveBeenCalledTimes(1);
      expect(mockGit.push).toHaveBeenCalledTimes(1);

      // Verify fetch was called
      expect(mockFetchFn).toHaveBeenCalledTimes(1);

      // Verify file was written with correct opcodes
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      const writeFileCalls = vi.mocked(fs.writeFile).mock.calls;
      const [, content] = writeFileCalls[0] ?? [];
      expect(content).toBeDefined();
      expect(typeof content).toBe("string");
      const parsedContent = JSON.parse(content as string);
      expect(parsedContent).toEqual(
        expect.objectContaining({
          PlayerSpawn: 1,
          PlayerSetup: 2,
          ItemMarketBoardInfo: 3,
        }),
      );
    });

    it("should skip push in dry run mode", async () => {
      const handler = new UpdateOpcodesHandler(
        mockProgress,
        mockGit as unknown as GitRepository,
        true,
      );

      await handler.updateOpcodes();

      // Verify git push was not called
      expect(mockGit.push).not.toHaveBeenCalled();

      // Verify dry run message
      expect(mockProgress).toHaveBeenCalledWith({
        message: "[DRY RUN] Skipping git push",
      });
    });
  });
});
