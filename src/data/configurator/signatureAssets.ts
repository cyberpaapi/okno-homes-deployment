import manifest from "./signatureAssetManifest.json";

/** Reviewed derivatives only. No runtime access to masters or editor import tools. */
export type SignatureAsset = {
  slug: string;
  name: string;
  url: string;
  metersPerUnit: number;
  identity: string;
};
const asset = (slug: keyof typeof manifest, name: string, identity: string): SignatureAsset => ({
  slug, name, url: manifest[slug].url, metersPerUnit: manifest[slug].metersPerUnit, identity,
});
const assets: Record<string, SignatureAsset> = {
  forza: asset("forza", "Forza", "Supplied Forza geometry. Individual plan layouts are not represented separately."),
  tengo: asset("tengo", "Tengo", "Supplied Tengo geometry. Individual plan layouts are not represented separately."),
  kray: asset("kray", "Kray", "Supplied Kray geometry. Individual plan layouts are not represented separately."),
  tish: asset("tish", "Tish", "Supplied Tish 2 BHK geometry."),
};
export function signatureAsset(slug: string): SignatureAsset | undefined {
  return Object.prototype.hasOwnProperty.call(assets, slug) ? assets[slug] : undefined;
}
