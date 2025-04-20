import { GitRepository } from "./GitRepository.js";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert";

const opcodesUrl =
  "https://raw.githubusercontent.com/karashiiro/FFXIVOpcodes/master/opcodes.min.json";
const targetRepoUrl = "https://github.com/goaaats/universalis_act_plugin.git";
const targetRepoName = "universalis_act_plugin";
const definitionsFileName = "definitions.json";

export type UpdateOpcodesHandlerProgressStep =
  | "clone"
  | "update"
  | "commit"
  | "push";

interface UpdateOpcodesHandlerProgress {
  step: UpdateOpcodesHandlerProgressStep;
}

export class UpdateOpcodesHandler {
  constructor(
    private readonly onProgress: (
      progress: UpdateOpcodesHandlerProgress,
    ) => void,
    private readonly git: GitRepository,
  ) {}

  async updateOpcodes() {
    this.onProgress({ step: "clone" });
    await this.cloneRepo();

    this.onProgress({ step: "update" });
    await this.updateDefinitions();

    this.onProgress({ step: "commit" });
    await this.commitDefinitions();

    this.onProgress({ step: "push" });
    await this.push();
  }

  private get definitionsPath() {
    return path.join(targetRepoName, definitionsFileName);
  }

  private async cloneRepo() {
    await this.git.clone(targetRepoUrl);
  }

  private async updateDefinitions() {
    await updateOpcodes(this.git.getFilePath(this.definitionsPath));
  }

  private async commitDefinitions() {
    await this.git.add(this.definitionsPath);
    await this.git.commit("Update opcodes");
  }

  private async push() {
    await this.git.push();
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
