import { Configuration } from "./Configuration";
import { Icon } from "./Icon";
import { IconSet, IVersionInfo, LightIconSet, RegularIconSet } from "./IconSet";

export class IconManager {
  regular: RegularIconSet;
  light: LightIconSet;

  constructor(private config: Configuration) {
    this.regular = new RegularIconSet(config.storagePath);
    this.light = new LightIconSet(config.storagePath);
  }

  private activeSet(): IconSet {
    return this.config.light ? this.light : this.regular;
  }

  public async getIconList(version?: string) {
    return this.activeSet().getIconList(version || this.config.mdiVersion);
  }

  public async getIcon(name: string): Promise<Icon | null> {
    return this.activeSet().getIcon(this.config.mdiVersion, name);
  }

  public async getAvailableVersions(): Promise<IVersionInfo> {
    return this.activeSet().getAvailableVersions();
  }
}
