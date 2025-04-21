import { SimpleGit, simpleGit } from "simple-git";
import path from "node:path";

export class GitRepository {
  private readonly git: SimpleGit;

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

  async submoduleInit(submodulePath?: string) {
    await this.git.submoduleInit(submodulePath ? [submodulePath] : []);
  }

  async submoduleUpdate(submodulePath?: string) {
    await this.git.submoduleUpdate(
      submodulePath ? ["--init", submodulePath] : ["--init"],
    );
  }

  getFilePath(...parts: string[]): string {
    return path.join(this.repoDir, ...parts);
  }
}
