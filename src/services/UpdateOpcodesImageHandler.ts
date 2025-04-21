import { GitRepository } from "./GitRepository.js";
import path from "node:path";
import { execa } from "execa";

const tfRepoUrl = "https://github.com/Universalis-FFXIV/universalis-tf.git";
const tfRepoName = "universalis-tf";
const submodulePath = "images/universalis-act-nginx/universalis_act_plugin";
const dockerImagePath = "images/universalis-act-nginx";

interface UpdateOpcodesImageHandlerProgress {
  message: string;
}

export class UpdateOpcodesImageHandler {
  constructor(
    private readonly onProgress: (
      progress: UpdateOpcodesImageHandlerProgress,
    ) => void,
    private readonly git: GitRepository,
    private readonly dryRun: boolean = false,
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

    this.onProgress({ message: "Building and pushing Docker image..." });
    await this.buildAndPushDocker();
    this.onProgress({ message: "Built and pushed Docker image" });

    this.onProgress({ message: "Done!" });
  }

  private async cloneTfRepo() {
    await this.git.clone(tfRepoUrl);
  }

  private async updateSubmodule() {
    // Create a new git instance in the submodule directory
    const tfGit = new GitRepository(this.git.getFilePath(tfRepoName));
    await tfGit.submoduleInit(submodulePath);
    await tfGit.submoduleUpdate(submodulePath);

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
    if (this.dryRun) {
      this.onProgress({ message: "[DRY RUN] Skipping git push" });
      return;
    }
    await this.git.push();
  }

  private async buildAndPushDocker() {
    if (this.dryRun) {
      this.onProgress({ message: "[DRY RUN] Skipping Docker operations" });
      return;
    }

    const dockerDir = this.git.getFilePath(tfRepoName, dockerImagePath);

    await execa({
      cwd: dockerDir,
    })`docker build . -t karashiiro/universalis-act-nginx`;

    await execa({
      cwd: dockerDir,
    })`docker push karashiiro/universalis-act-nginx`;
  }
}
