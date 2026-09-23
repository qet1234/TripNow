const AIRPORT_SOURCES = {
  NRT: {
    departure: {
      url: "https://www.narita-airport.jp/en/flight/dep-search/?searchDepArr=dep-search",
      strictInternational: true,
    },
    arrival: {
      url: "https://www.narita-airport.jp/en/flight/arr-search/?searchDepArr=arr-search",
      strictInternational: true,
    },
  },
  HND: {
    departure: {
      url: "https://tokyo-haneda.com/en/flight/int_search.html?result=1&type=int-departure",
      strictInternational: true,
    },
    arrival: {
      url: "https://tokyo-haneda.com/en/flight/int_search.html?result=1&type=int-arrival",
      strictInternational: true,
    },
  },
  KIX: {
    departure: {
      url: "https://www.kansai-airport.or.jp/en/flight/search?date=today&direction=DEP&duration=all&flight_type=INT&target=all",
      strictInternational: true,
    },
    arrival: {
      url: "https://www.kansai-airport.or.jp/en/flight/search?date=today&direction=ARR&duration=all&flight_type=INT&target=all",
      strictInternational: true,
    },
  },
  CTS: {
    departure: {
      url: "https://www.hokkaido-airports.com/en/new-chitose/airport/fis/?airline=&airlineType=international&airport=&flightNumber=&purposeType=departure&timeFrom=&timeTo=",
      strictInternational: true,
    },
    arrival: {
      url: "https://www.hokkaido-airports.com/en/new-chitose/airport/fis/?airline=&airlineType=international&airport=&flightNumber=&purposeType=arrival&timeFrom=&timeTo=",
      strictInternational: true,
    },
  },
  NGO: {
    departure: {
      url: "https://www.centrair.jp/en/flight/search/",
      strictInternational: false,
    },
    arrival: {
      url: "https://www.centrair.jp/en/flight/search/",
      strictInternational: false,
    },
  },
  FUK: {
    departure: {
      url: "https://www.fukuoka-airport.jp/pcfs/en/flight/index.php?type=ID",
      strictInternational: true,
    },
    arrival: {
      url: "https://www.fukuoka-airport.jp/pcfs/en/flight/index.php?type=IA",
      strictInternational: true,
    },
  },
  OKA: {
    departure: {
      url: "https://www.naha-airport.co.jp/en/flight/today/",
      strictInternational: false,
    },
    arrival: {
      url: "https://www.naha-airport.co.jp/en/flight/today/",
      strictInternational: false,
    },
  },
};

function decode(value = "") {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return decode(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function cellsFromRow(rowHtml) {
  return [...rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean);
}

function norm(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9가-힣一-龥]+/g, " ").trim();
}

function headerIndex(headers, terms) {
  return headers.findIndex((header) => {
    const h = norm(header);
    return terms.some((term) => h.includes(term));
  });
}

function valueAt(cells, index) {
  return index >= 0 && index < cells.length ? cells[index] : "";
}

function normalizeRow(headers, cells) {
  const indexes = {
    flight: headerIndex(headers, ["flight no", "flight number", "flight", "便名"]),
    destination: headerIndex(headers, ["destination", "to via", "origin", "from via", "目的地", "出発地"]),
    scheduled: headerIndex(headers, ["scheduled", "定刻", "time"]),
    estimated: headerIndex(headers, ["will dep", "will arr", "will", "変更", "expected"]),
    gate: headerIndex(headers, ["gate", "ゲート"]),
    terminal: headerIndex(headers, ["terminal", "ターミナル"]),
    status: headerIndex(headers, ["remarks", "status", "備考"]),
    airline: headerIndex(headers, ["airline", "航空会社"]),
  };

  const row = {
    flight: valueAt(cells, indexes.flight),
    destination: valueAt(cells, indexes.destination),
    scheduled: valueAt(cells, indexes.scheduled),
    estimated: valueAt(cells, indexes.estimated),
    gate: valueAt(cells, indexes.gate),
    terminal: valueAt(cells, indexes.terminal),
    status: valueAt(cells, indexes.status),
    airline: valueAt(cells, indexes.airline),
    cells,
  };

  if (!row.scheduled) {
    row.scheduled = cells.find((cell) => /\b\d{1,2}:\d{2}\b/.test(cell)) || "";
  }
  if (!row.flight) {
    row.flight = cells.find((cell) => /\b[A-Z0-9]{2,3}\s?\d{2,4}[A-Z]?\b/i.test(cell)) || "";
  }
  return row;
}

function parseTables(html, strictInternational) {
  const tableMatches = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
  const results = [];

  for (const tableMatch of tableMatches) {
    const table = tableMatch[1];
    if (!strictInternational) {
      const contextStart = Math.max(0, (tableMatch.index || 0) - 3500);
      const context = norm(stripTags(html.slice(contextStart, tableMatch.index || 0)));
      const lastInternational = context.lastIndexOf("international");
      const lastDomestic = context.lastIndexOf("domestic");
      if (lastInternational < 0 || lastInternational < lastDomestic) continue;
    }

    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => cellsFromRow(m[1]));
    if (!rows.length) continue;

    let headers = rows.find((cells) =>
      cells.some((cell) => /flight|便名|scheduled|定刻|destination|目的地|gate|ゲート|remarks|備考/i.test(cell)),
    ) || [];

    for (const cells of rows) {
      if (cells === headers || cells.length < 2) continue;
      const joined = cells.join(" ");
      if (!/\b\d{1,2}:\d{2}\b/.test(joined) && !/\b[A-Z0-9]{2,3}\s?\d{2,4}[A-Z]?\b/i.test(joined)) continue;
      const row = normalizeRow(headers, cells);
      if (row.flight || row.scheduled) results.push(row);
    }
  }

  const seen = new Set();
  return results.filter((row) => {
    const key = [row.flight, row.scheduled, row.destination, row.gate].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 40);
}

module.exports = async function handler(req, res) {
  const airport = String(req.query.airport || "").toUpperCase();
  const direction = req.query.direction === "arrival" ? "arrival" : "departure";
  const source = AIRPORT_SOURCES[airport];

  if (!source) {
    res.status(400).json({ error: "Unsupported airport" });
    return;
  }

  const selectedSource = source[direction];
  const url = selectedSource.url;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; TripNow/1.0; +https://tripnow.duckdns.org)",
        "accept-language": "en-US,en;q=0.9,ja;q=0.8",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      res.status(502).json({ error: "Official airport source unavailable", sourceUrl: url });
      return;
    }

    const html = await response.text();
    const flights = parseTables(html, selectedSource.strictInternational);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json({
      airport,
      direction,
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      flights,
      internationalOnly: true,
      fallback: flights.length === 0,
    });
  } catch (error) {
    res.status(502).json({
      error: error && error.name === "AbortError" ? "Official source timed out" : "Unable to read official airport source",
      sourceUrl: url,
    });
  } finally {
    clearTimeout(timeout);
  }
};
