import mongoose from "mongoose";

export function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export function toObjectId(id: string): mongoose.Types.ObjectId | null {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}
