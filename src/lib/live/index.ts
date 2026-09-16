import type { LiveDataProvider } from "./types";
import { BattleMetricsProvider } from "./battlemetrics";
import { MockLiveDataProvider } from "./mock";

let provider: LiveDataProvider | undefined;

export function getLiveProvider(): LiveDataProvider {
  if (!provider) {
    provider =
      process.env.LIVE_DATA_PROVIDER === "battlemetrics"
        ? new BattleMetricsProvider()
        : new MockLiveDataProvider();
  }
  return provider;
}

export type { ClusterSnapshot, ServerSnapshot, ServerSummary } from "./types";
