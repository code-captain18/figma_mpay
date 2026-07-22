import type { Bundle, BundleDuration } from "@/types";

export const BUNDLE_DURATIONS: BundleDuration[] = ["Daily", "Weekly", "Monthly"];

export const DATA_BUNDLES: Record<BundleDuration, Bundle[]> = {
  Daily: [
    { id: "d1", size: "100MB", validity: "1 day", price: 1.0 },
    { id: "d2", size: "250MB", validity: "1 day", price: 2.0, tag: "Popular" },
    { id: "d3", size: "500MB", validity: "1 day", price: 3.5 },
    { id: "d4", size: "1GB", validity: "1 day", price: 5.0 },
  ],
  Weekly: [
    { id: "w1", size: "1GB", validity: "7 days", price: 7.0 },
    { id: "w2", size: "2GB", validity: "7 days", price: 12.0, tag: "Popular" },
    { id: "w3", size: "3GB", validity: "7 days", price: 15.0 },
    { id: "w4", size: "5GB", validity: "7 days", price: 22.0 },
  ],
  Monthly: [
    { id: "m1", size: "5GB", validity: "30 days", price: 30.0 },
    { id: "m2", size: "10GB", validity: "30 days", price: 50.0, tag: "Best Value" },
    { id: "m3", size: "20GB", validity: "30 days", price: 80.0 },
    { id: "m4", size: "Unlimited", validity: "30 days", price: 120.0, tag: "Premium" },
  ],
};
