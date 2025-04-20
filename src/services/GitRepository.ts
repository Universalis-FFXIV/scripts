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

  getFilePath(...parts: string[]): string {
    return path.join(this.repoDir, ...parts);
  }
}
