let autoTradeEnabled = false;

export function setAutoTrade(value: boolean): void {
  autoTradeEnabled = value;
}

export function getAutoTradeEnabled(): boolean {
  return autoTradeEnabled;
}