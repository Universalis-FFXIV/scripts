import { SimpleGit, simpleGit } from "simple-git";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert";

const opcodesUrl =
  "https://raw.githubusercontent.com/karashiiro/FFXIVOpcodes/master/opcodes.min.json";

const definitionsFileName = "definitions.json";

export class UpdateOpcodesHandler {
  private readonly git: SimpleGit;

  constructor(private readonly repoDir: string) {
    this.git = simpleGit(repoDir);
  }

  async updateOpcodes() {
    await this.cloneRepo();
    await this.updateDefinitions();
    await this.commitDefinitions();
    await this.push();
  }

  private get definitionsPath() {
    return path.join(
      this.repoDir,
      "universalis_act_plugin",
      definitionsFileName,
    );
  }

  private async cloneRepo() {
    await this.git.clone(
      "https://github.com/goaaats/universalis_act_plugin.git",
    );
  }

  private async updateDefinitions() {
    await updateOpcodes(this.definitionsPath);
  }

  private async commitDefinitions() {
    await this.git.add(`universalis_act_plugin/${definitionsFileName}`);
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
