import { SimpleGit, simpleGit } from "simple-git";
import path from "node:path";

export class GitRepository {
  public readonly git: SimpleGit;

  constructor(private readonly repoDir: string) {
    this.git = simpleGit(repoDir);
  }

  async clone(url: string) {
    await this.git.clone(url);
  }

  async add(path: string) {
    await this.git.add(path);
  }

  async commit(message: string) {
    await this.git.commit(message);
  }

  async push() {
    await this.git.push();
  }

  async pull(remote?: string, branch?: string) {
    if (remote && branch) {
      await this.git.pull(remote, branch);
    } else {
      await this.git.pull();
    }
  }

  async submoduleInit() {
    await this.git.submoduleInit();
  }

  async submoduleUpdate() {
    await this.git.submoduleUpdate(["--init"]);
  }

  getFilePath(...parts: string[]): string {
    return path.join(this.repoDir, ...parts);
  }
}
