import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

const SUFFIX = "?size";

/** Reads the pixel size from a WebP header (lossy, lossless or extended). */
export function webpSize(buf: Buffer, file: string) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`${file} is not a WebP image`);
  }
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`${file} has an unknown WebP chunk "${chunk}"`);
}

/**
 * `import image from "./photo.webp?size"` gives `{ src, width, height }`, so
 * photos uploaded through the CMS get real dimensions without anyone typing them.
 */
export function imageSizePlugin(): Plugin {
  return {
    name: "moveis-machado-image-size",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(SUFFIX)) return null;
      const resolved = await this.resolve(source.slice(0, -SUFFIX.length), importer, {
        skipSelf: true,
      });
      return resolved && `${resolved.id}${SUFFIX}`;
    },
    load(id) {
      if (!id.endsWith(SUFFIX)) return null;
      const file = id.slice(0, -SUFFIX.length);
      this.addWatchFile(file);
      const { width, height } = webpSize(readFileSync(file), file);
      return `import src from ${JSON.stringify(file)};\nexport default { src, width: ${width}, height: ${height} };\n`;
    },
  };
}
