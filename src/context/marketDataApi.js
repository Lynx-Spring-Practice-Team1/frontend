export const DEFAULT_TICKERS = [
  "ARKA", "PHNX", "MNVS", "STRM", "NOVA", "BYTE", "QNTM", "CRUX", "ORBT", "VRTX",
  "AURA", "CRVS", "IRON", "MRCR", "APEX", "GILT", "VALE", "VLCN", "SOLX", "CLDN",
  "PRMA", "HDRG", "WNDX", "ATLS", "HLIX", "MEDX", "GNTC", "CRYO", "PLSM", "NXGN",
  "DRAX", "LUMX", "CRST", "VOYA", "AXEL", "MRKT",
];

export async function fetchCandles(ticker, range = 'all') {
  try {
    const params = new URLSearchParams({ ticker });
    if (range && range !== 'all') params.set('range', range);
    const res = await fetch(`/api/candles?${params.toString()}`);
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(r => ({
      time: Number(r.time),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
    }));
  } catch {
    return [];
  }
}
