import { GitRepository } from "./GitRepository.js";
import fs from "node:fs/promises";
import assert from "node:assert";

const opcodesUrl =
  "https://raw.githubusercontent.com/karashiiro/FFXIVOpcodes/master/opcodes.min.json";
const targetRepoUrl = "https://github.com/goaaats/universalis_act_plugin.git";
const definitionsPath = "universalis_act_plugin/definitions.json";

interface UpdateOpcodesHandlerProgress {
  message: string;
}

export class UpdateOpcodesHandler {
  constructor(
    private readonly onProgress: (
      progress: UpdateOpcodesHandlerProgress,
    ) => void,
    private readonly git: GitRepository,
    private readonly dryRun: boolean = false,
  ) {}

  async updateOpcodes() {
    this.onProgress({ message: "Cloning ACT plugin repository..." });
    await this.cloneRepo();
    this.onProgress({ message: "Cloned ACT plugin repository" });

    this.onProgress({ message: "Updating opcode definitions..." });
    await this.updateDefinitions();
    this.onProgress({ message: "Updated opcode definitions" });

    this.onProgress({ message: "Committing changed files..." });
    await this.commitDefinitions();
    this.onProgress({ message: "Committed changed files" });

    this.onProgress({ message: "Pushing to ACT plugin repository..." });
    await this.push();
    this.onProgress({ message: "Pushed to ACT plugin repository" });
  }

  private async cloneRepo() {
    await this.git.clone(targetRepoUrl);
  }

  private async updateDefinitions() {
    await updateOpcodes(this.git.getFilePath(definitionsPath));
  }

  private async commitDefinitions() {
    const pluginGit = new GitRepository(
      this.git.getFilePath("universalis_act_plugin"),
    );
    await pluginGit.add("definitions.json");
    await pluginGit.commit("Update opcodes");
  }

  private async push() {
    if (this.dryRun) {
      this.onProgress({ message: "[DRY RUN] Skipping git push" });
      return;
    }
    const pluginGit = new GitRepository(
      this.git.getFilePath("universalis_act_plugin"),
    );
    await pluginGit.push();
  }
}

interface OpcodeInfo {
  name: string;
  opcode: number;
}

function getOpcode(list: OpcodeInfo[], messageType: string) {
  const result = list.find((o) => o.name === messageType);
  assert(result);
  const { opcode } = result;
  return opcode;
}

interface RegionLists {
  region: string;
  lists: { ServerZoneIpcType: OpcodeInfo[] };
}

function updateOpcodes(outputFile: string) {
  return fetch(opcodesUrl)
    .then((res) => res.json() as Promise<RegionLists[]>)
    .then(
      (res) =>
        res.find((regionLists) => regionLists.region === "Global")?.lists,
    )
    .then((lists) => {
      assert(lists);
      return lists;
    })
    .then((lists) => ({
      ClientTrigger: -1,
      PlayerSpawn: getOpcode(lists.ServerZoneIpcType, "PlayerSpawn"),
      PlayerSetup: getOpcode(lists.ServerZoneIpcType, "PlayerSetup"),
      ItemMarketBoardInfo: getOpcode(
        lists.ServerZoneIpcType,
        "ItemMarketBoardInfo",
      ),
      MarketBoardItemRequestStart: getOpcode(
        lists.ServerZoneIpcType,
        "MarketBoardItemListingCount",
      ),
      MarketBoardOfferings: getOpcode(
        lists.ServerZoneIpcType,
        "MarketBoardItemListing",
      ),
      MarketBoardHistory: getOpcode(
        lists.ServerZoneIpcType,
        "MarketBoardItemListingHistory",
      ),
      MarketTaxRates: getOpcode(lists.ServerZoneIpcType, "ResultDialog"),
      ContentIdNameMapResp: -1,
    }))
    .then((res) => fs.writeFile(outputFile, JSON.stringify(res) + "\n"))
    .catch(console.error);
}
