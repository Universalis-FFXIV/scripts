import { GitRepository } from "./GitRepository.js";
import path from "node:path";

const tfRepoUrl = "https://github.com/Universalis-FFXIV/universalis-tf.git";
const tfRepoName = "universalis-tf";
const submodulePath = "images/universalis-act-nginx/universalis_act_plugin";

interface UpdateOpcodesImageHandlerProgress {
  message: string;
}

export class UpdateOpcodesImageHandler {
  constructor(
    private readonly onProgress: (
      progress: UpdateOpcodesImageHandlerProgress,
    ) => void,
    private readonly git: GitRepository,
  ) {}

  async updateImage() {
    this.onProgress({ message: "Cloning Terraform repository..." });
    await this.cloneTfRepo();
    this.onProgress({ message: "Cloned Terraform repository" });

    this.onProgress({ message: "Updating submodule..." });
    await this.updateSubmodule();
    this.onProgress({ message: "Updated submodule" });

    this.onProgress({ message: "Committing submodule update..." });
    await this.commitSubmodule();
    this.onProgress({ message: "Committed submodule update" });

    this.onProgress({ message: "Pushing Terraform repository..." });
    await this.pushTfRepo();
    this.onProgress({ message: "Pushed Terraform repository" });

    this.onProgress({ message: "Done!" });
  }

  private async cloneTfRepo() {
    await this.git.clone(tfRepoUrl);
  }

  private async updateSubmodule() {
    // Create a new git instance in the submodule directory
    const tfGit = new GitRepository(this.git.getFilePath(tfRepoName));
    await tfGit.git.submoduleInit([submodulePath]);
    await tfGit.git.submoduleUpdate([submodulePath]);

    const submoduleDir = path.join(tfRepoName, submodulePath);
    const submoduleGit = new GitRepository(this.git.getFilePath(submoduleDir));
    await submoduleGit.pull("origin", "master");
  }

  private async commitSubmodule() {
    const tfGit = new GitRepository(this.git.getFilePath(tfRepoName));
    await tfGit.add(submodulePath);
    await tfGit.commit("Update universalis_act_plugin submodule");
  }

  private async pushTfRepo() {
    await this.git.push();
  }
}
