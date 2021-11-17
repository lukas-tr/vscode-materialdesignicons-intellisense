import axios from "axios";
import { sort } from "semver";
import * as tar from "tar";
import * as path from "path";
import * as fs from "fs";
import { log } from "./util";
import { IncomingMessage } from "http";
import { Icon } from "./Icon";
import { VersionNotFoundError } from "./errors";

export abstract class IconSet {
  private versionInfo?: IVersionInfo;
  private readonly SVG_NAME_REGEX = /\/([^/]*?).svg/;
  private icons: {
    [version: string]:
      | { all: Icon[]; byName: { [name: string]: Icon } }
      | undefined;
  } = {};

  constructor(protected storagePath: string) {}

  protected abstract getRegistryUrl(): string;
  protected abstract getPath(version: string): string;

  public async getAvailableVersions() {
    if (this.versionInfo) return this.versionInfo;
    this.versionInfo = await this.downloadVersionInfoFromNpm();
    return this.versionInfo;
  }

  public async getIconList(version: string) {
    const data = await this.getIconData(version);
    if (!data) throw new Error(`icon data for version ${version} not found`);
    return data.all;
  }

  public async getIcon(version: string, name: string): Promise<Icon | null> {
    const data = await this.getIconData(version);
    if (!data) throw new Error(`icon data for version ${version} not found`);
    return data.byName[name] || null;
  }

  private async getIconData(version: string) {
    if (this.icons[version]) {
      return this.icons[version];
    }
    const dataFromFs = await this.readDataFromFs(version);
    if (dataFromFs) {
      const data = this.convertIconData(dataFromFs);
      this.icons[version] = data;
      return data;
    }
    const versionInfo = await this.getAvailableVersions();
    const downloadInfo = versionInfo.versions.find(
      (v) => v.version === version
    );
    if (!downloadInfo) throw new VersionNotFoundError(`version ${version} not found`);
    const downloadResult = await this.downloadDataFromNpm(
      downloadInfo.downloadUrl,
      version
    );
    const icons = this.convertIconData(downloadResult);
    this.icons[version] = icons;
    return icons;
  }

  private convertIconData(data: IData) {
    const all = data.meta.map((meta) => new Icon(meta, data.paths[meta.name]));
    const byName: { [name: string]: Icon } = {};
    for (const icon of all) {
      byName[icon.name] = icon;
    }
    const d = {
      all,
      byName,
    };
    return d;
  }

  private async downloadVersionInfoFromNpm(): Promise<IVersionInfo> {
    const response = await axios.get(this.getRegistryUrl());
    const packageInfo = response.data;

    return {
      latest: packageInfo["dist-tags"].latest,
      // versions sorted with semver
      versions: sort(Object.keys(packageInfo.versions))
        .reverse()
        .map((version) => ({
          version: version,
          time: packageInfo.time[version],
          downloadUrl: packageInfo.versions[version].dist.tarball,
        })),
    };
  }

  private async readDataFromFs(version: string) {
    try {
      const data = await fs.promises.readFile(this.getPath(version));
      const d = JSON.parse(data.toString("utf8")) as IData;
      return d;
    } catch (error: any) {
      log(error);
      return null;
    }
  }

  private async downloadDataFromNpm(url: string, version: string) {
    const response = await axios.get<IncomingMessage>(url, {
      responseType: "stream",
    });
    const data: IData = {
      version,
      meta: [],
      paths: {},
    };
    return new Promise<IData>((resolve, reject) => {
      response.data
        .pipe(tar.t())
        .on("entry", (entry: tar.ReadEntry) => {
          const nameMatch = this.SVG_NAME_REGEX.exec(entry.path);
          let content = "";
          entry.on("data", (chunk) => {
            content += chunk.toString();
          });
          entry.on("end", () => {
            if (nameMatch) {
              const path = this.extractPathFromSvg(content);
              data.paths[nameMatch[1]] = path;
            } else if (entry.path.includes("package.json")) {
              data.version = JSON.parse(content).version;
            } else if (entry.path.includes("meta.json")) {
              data.meta = JSON.parse(content);
            }
          });
        })
        .on("finish", async () => {
          const destination = this.getPath(version);
          try {
            await fs.promises.mkdir(path.dirname(destination), {
              recursive: true,
            });
            await fs.promises.writeFile(
              destination,
              JSON.stringify(data),
              "utf8"
            );
          } catch (error: any) {
            log(error);
            return reject(error);
          }
          resolve(data);
        })
        .on("error", (error) => {
          log(error);
          reject(error);
        });
    });
  }

  private extractPathFromSvg(svg: string) {
    const reg = /\bd="(.*?)"/g;
    const match = reg.exec(svg);
    if (!match) {
      return "";
    }
    return match[1];
  }
}

export class RegularIconSet extends IconSet {
  private readonly REGISTRY_URL = "https://registry.npmjs.org/@mdi/svg";
  protected getRegistryUrl() {
    return this.REGISTRY_URL;
  }
  protected getPath(version: string) {
    return path.join(this.storagePath, "regular", version, "meta.json");
  }
}

export class LightIconSet extends IconSet {
  private readonly REGISTRY_URL = "https://registry.npmjs.org/@mdi/light-svg";
  protected getRegistryUrl() {
    return this.REGISTRY_URL;
  }
  protected getPath(version: string) {
    return path.join(this.storagePath, "light", version, "meta.json");
  }
}

export interface IVersionInfo {
  latest: string;
  versions: { version: string; time: string; downloadUrl: string }[];
}

export interface IData {
  version: string;
  meta: IMeta[];
  paths: { [iconName: string]: string };
}

export interface IMeta {
  id: string;
  name: string;
  codepoint: string;
  aliases: string[];
  tags: string[];
  author: string;
  version: string;
}
