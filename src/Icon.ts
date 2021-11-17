import { MarkdownString } from "vscode";
import { IMeta } from "./IconSet";

export class Icon {
  constructor(private meta: IMeta, private path: string) {}

  get name() {
    return this.meta.name;
  }

  get tags() {
    return this.meta.tags.length ? this.meta.tags : ["Other"];
  }

  get version() {
    return this.meta.version;
  }

  get author() {
    return this.meta.author;
  }

  get codepoint() {
    return this.meta.codepoint;
  }

  get aliases() {
    return [this.name, ...this.meta.aliases];
  }

  get docLink() {
    return new MarkdownString(
      `[docs](https://materialdesignicons.com/icon/${this.name})`
    );
  }

  getRawSvgIcon(iconColor: string) {
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-${this.name}" width="24" height="24" viewBox="0 0 24 24">`,
      `<path fill="${iconColor}" d="${this.path}" />`,
      `</svg>`,
    ].join("");
  }

  getMarkdownPreviewIcon(iconColor: string, iconSize: number) {
    const dataUri = [
      "data:image/svg+xml;utf8;base64,",
      Buffer.from(this.getRawSvgIcon(iconColor)).toString("base64"),
      encodeSpaces(` | width=${iconSize} height=${iconSize}`),
    ].join("");
    return new MarkdownString(`![preview](${dataUri})`);
  }

  getDecorationIcon(iconColor: string, size = 24) {
    const origin = `${size / 2} ${size / 2}`;
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`,
      `<path transform-origin="${origin}" fill="${iconColor}" d="${this.path}"/>`,
      `</svg>`,
    ].join("");
  }
}

const encodeSpaces = (content: string) => {
  return content.replace(/ /g, "%20");
};
