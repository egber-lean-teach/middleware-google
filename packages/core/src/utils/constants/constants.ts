import { ICredential } from "../../types/credential";
import { IEstimatedTokenCount } from "../../types/estimatedTokenCount";

export const GOOGLE_AGENT: string = "Google";
export const VERTEXT_AGENT: string = "Vertex";
export const COST_TYPE: string = "AI";
export const PRODUCT_ID_FREE: string = "free-trial";

export const CURRENT_CREDENTIAL: ICredential = {
  name: "apiKey",
  value: "keyValue",
};

export const PROVIDER_GOOGLE: string = "google";
export const PROVIDER_VERTEX: string = "vertex";
export const MIDDLEWARE_SOURCE: string = "node";

export const ESTIMATED_TOKEN_COUNTS: IEstimatedTokenCount = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
};
