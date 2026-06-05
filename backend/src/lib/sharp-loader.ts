import sharp from "sharp";

export async function loadSharp(): Promise<typeof sharp> {
  return sharp;
}
