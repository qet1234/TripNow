import type { JapanRegion } from "@/src/data/japanRegions";

const FREE_JMA_ENDPOINT = "https://api.open-meteo.com/v1/jma";
const CACHE_TTL_MS = 10 * 60 * 1000;

export type WeatherCondition = {
  code: number;
  label: string;
  icon: string;
};

export type HourlyWeather = {
  time: string;
  temperatureC: number;
  precipitationMm: number;
  condition: WeatherCondition;
};

export type JapanWeather = {
  regionId: string;
  fetchedAt: number;
  timezone: string;
  current: {
    time: string;
    temperatureC: number;
    apparentTemperatureC: number;
    humidityPercent: number;
    precipitationMm: number;
    windSpeedKmh: number;
    condition: WeatherCondition;
  };
  today: {
    date: string;
    maxTemperatureC: number;
    minTemperatureC: number;
    precipitationMm: number;
    condition: WeatherCondition;
  };
  hourly: HourlyWeather[];
};

type OpenMeteoJmaResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
};

const cache = new Map<string, JapanWeather>();

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return { code, label: "맑음", icon: "☀️" };
  if (code === 1) return { code, label: "대체로 맑음", icon: "🌤️" };
  if (code === 2) return { code, label: "구름 조금", icon: "⛅" };
  if (code === 3) return { code, label: "흐림", icon: "☁️" };
  if (code === 45 || code === 48) return { code, label: "안개", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { code, label: "이슬비", icon: "🌦️" };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { code, label: "비", icon: "🌧️" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { code, label: "눈", icon: "🌨️" };
  }
  if ([95, 96, 99].includes(code)) {
    return { code, label: "뇌우", icon: "⛈️" };
  }
  return { code, label: "날씨 확인", icon: "🌤️" };
}

function buildJmaUrl(region: JapanRegion) {
  const params = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation",
      "weather_code",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
    ].join(","),
    timezone: "Asia/Tokyo",
    forecast_days: "4",
    cell_selection: "land",
  });

  return FREE_JMA_ENDPOINT + "?" + params.toString();
}

function buildHourlyForecast(response: OpenMeteoJmaResponse) {
  const currentTime = response.current.time;
  const startIndex = Math.max(
    0,
    response.hourly.time.findIndex((time) => time >= currentTime),
  );

  const result: HourlyWeather[] = [];

  for (
    let index = startIndex;
    index < response.hourly.time.length && result.length < 8;
    index += 3
  ) {
    result.push({
      time: response.hourly.time[index],
      temperatureC: response.hourly.temperature_2m[index],
      precipitationMm: response.hourly.precipitation[index],
      condition: getWeatherCondition(response.hourly.weather_code[index]),
    });
  }

  return result;
}

export async function fetchJapanWeather(
  region: JapanRegion,
  options?: { force?: boolean },
): Promise<JapanWeather> {
  const cached = cache.get(region.id);

  if (
    !options?.force &&
    cached &&
    Date.now() - cached.fetchedAt < CACHE_TTL_MS
  ) {
    return cached;
  }

  const response = await fetch(buildJmaUrl(region), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("일본 날씨 정보를 불러오지 못했습니다.");
  }

  const data = (await response.json()) as OpenMeteoJmaResponse;

  if (!data.current || !data.daily?.time?.length) {
    throw new Error("날씨 응답 형식이 올바르지 않습니다.");
  }

  const weather: JapanWeather = {
    regionId: region.id,
    fetchedAt: Date.now(),
    timezone: data.timezone,
    current: {
      time: data.current.time,
      temperatureC: data.current.temperature_2m,
      apparentTemperatureC: data.current.apparent_temperature,
      humidityPercent: data.current.relative_humidity_2m,
      precipitationMm: data.current.precipitation,
      windSpeedKmh: data.current.wind_speed_10m,
      condition: getWeatherCondition(data.current.weather_code),
    },
    today: {
      date: data.daily.time[0],
      maxTemperatureC: data.daily.temperature_2m_max[0],
      minTemperatureC: data.daily.temperature_2m_min[0],
      precipitationMm: data.daily.precipitation_sum[0],
      condition: getWeatherCondition(data.daily.weather_code[0]),
    },
    hourly: buildHourlyForecast(data),
  };

  cache.set(region.id, weather);
  return weather;
}
