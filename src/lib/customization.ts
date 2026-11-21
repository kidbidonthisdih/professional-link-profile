import { z } from "zod";

export const customizationSchema = z.object({
  font: z.enum(["geist", "mono", "serif"]).default("geist"),
  accent: z.enum(["neutral", "violet", "mint", "rose", "ice"]).default("neutral"),
  alignment: z.enum(["center", "left"]).default("center"),
  avatarShape: z.enum(["circle", "square"]).default("circle"),
  avatarSize: z.number().min(64).max(120).default(96),
  radius: z.number().min(0).max(32).default(8),
  border: z.boolean().default(true),
  linkStyle: z.enum(["icons", "rows"]).default("icons"),
  effect: z.enum(["none", "rain", "snow"]).default("none"),
  backgroundDim: z.number().min(0).max(85).default(35),
  backgroundBlur: z.number().min(0).max(16).default(0),
  splashText: z.string().max(60).default("click to enter"),
  musicUrl: z.string().max(2000).refine(v => !v || /^https?:\/\//.test(v), "Use a direct http or https audio URL").default(""),
  musicTitle: z.string().max(80).default("On repeat"),
  musicVolume: z.number().min(0).max(100).default(50),
});

export type Customization = z.infer<typeof customizationSchema>;
export const DEFAULT_CUSTOMIZATION = customizationSchema.parse({});

export function readCustomization(value: unknown): Customization {
  const result = customizationSchema.safeParse(value);
  return result.success ? result.data : { ...DEFAULT_CUSTOMIZATION };
}

export const ACCENTS = [
  { value: "neutral", label: "Silver" },
  { value: "violet", label: "Lilac" },
  { value: "mint", label: "Mint" },
  { value: "rose", label: "Rose" },
  { value: "ice", label: "Ice" },
] as const;