import { ScheduleItem, ClimateData, KcResult, CropCoefficients } from '../types';

//  declare of constant
const cropCoefficients: Record<string, CropCoefficients> = {
  maize: {
    initial: { Kc: 0.3, duration: 20 },
    development: { Kc: 0.7, duration: 40 },
    midSeason: { Kc: 1.15, duration: 50 },
    lateSeason: { Kc: 0.7, duration: 30 },
    totalDuration: 140
  },
  beans: {
    initial: { Kc: 0.35, duration: 20 },
    development: { Kc: 0.75, duration: 30 },
    midSeason: { Kc: 1.1, duration: 30 },
    lateSeason: { Kc: 0.5, duration: 10 },
    totalDuration: 90
  },
  tomatoes: {
    initial: { Kc: 0.45, duration: 30 },
    development: { Kc: 0.8, duration: 40 },
    midSeason: { Kc: 1.2, duration: 50 },
    lateSeason: { Kc: 0.7, duration: 30 },
    totalDuration: 150
  }
};

export const fetchClimateData = async (location: string): Promise<ClimateData> => {

  
  const locations = {
    "Kasapo": { "lat": -6.3585, "lon": 36.7219 },
    "Bangalala": { "lat": -6.4378, "lon": 36.7254 },
  };
  
  if (!(location in locations)) {
    return "Invalid Location";
  }

  const lat = locations[location as keyof typeof locations].lat;
  const lon = locations[location as keyof typeof locations].lon;
  // api key
  const apiKey = "9391c7771cc92c778d3ab513c1847a9e";
  const baseUrl = "https://api.openweathermap.org/data/2.5/weather?";
  const url = `${baseUrl}lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.status !== 200) {
      return `Error: ${data.message || "Failed to fetch climate data"}`;
    }

    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    const rainfall = data.rain ? data.rain["1h"] : 0;

    // FAO Penman-Monteith equation for ETo
    const windSpeed2m = windSpeed * (4.87 / Math.log(67.8 * 10 - 5.42));
    const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const ea = es * (humidity / 100);
    const gamma = 0.000665 * pressure;
    const delta = (4098 * es) / Math.pow(temp + 237.3, 2);
    const Rn = 15; // Net radiation (simplified)
    const G = 0; // Soil heat flux (assumed 0)

    const ETo = (0.408 * delta * (Rn - G) + gamma * (900 / (temp + 273)) * windSpeed2m * (es - ea)) /
                (delta + gamma * (1 + 0.34 * windSpeed2m));

    return { ETo: Math.round(ETo * 100) / 100, Rainfall: rainfall };
  } catch (error: any) {
    return `An error occurred: ${error.message}`;
  }
};

export const calculateIrrigationFrequency = (
  crop: string, 
  soilType: string, 
  ETo: number, 
  rainfall: number, 
  growthStage: string
): number => {
  const baseFreq: Record<string, Record<string, number>> = {
    "maize": { "Initial": 3, "Development": 3, "Mid-Season": 3, "Late-Season": 5 },
    "beans": { "Initial": 4, "Development": 3, "Mid-Season": 3, "Late-Season": 5 },
    "tomatoes": { "Initial": 3, "Development": 3, "Mid-Season": 2, "Late-Season": 5 },
  };

  const cropFrequencies = baseFreq[crop];
  if (!cropFrequencies) return 7;
  
  let adjustedFreq = cropFrequencies[growthStage] || 7;

  if (soilType === "sandy") {
    adjustedFreq = Math.max(3, adjustedFreq - 1);
  } else if (soilType === "clay") {
    adjustedFreq += 1;
  }

  if (ETo > 5) {
    adjustedFreq = Math.max(3, adjustedFreq - 1);
  }
  if (rainfall > 15) {
    adjustedFreq += 2;
  } else if (rainfall > 5) {
    adjustedFreq += 1;
  }

  return Math.max(3, adjustedFreq);
};

export const getKcValue = (crop: string, daysAfterPlanting: number): KcResult => {
  const stages = cropCoefficients[crop];

  if (daysAfterPlanting < stages.initial.duration) {
    return { Kc: stages.initial.Kc, growthStage: "Initial" };
  } else if (daysAfterPlanting < stages.initial.duration + stages.development.duration) {
    return { Kc: stages.development.Kc, growthStage: "Development" };
  } else if (daysAfterPlanting < stages.initial.duration + stages.development.duration + stages.midSeason.duration) {
    return { Kc: stages.midSeason.Kc, growthStage: "Mid-Season" };
  } else {
    return { Kc: stages.lateSeason.Kc, growthStage: "Late-Season" };
  }
};

export const generateIrrigationSchedule = async (
  plantingDate: Date, 
  crop: string, 
  farmSize: string, 
  soilType: string, 
  location: string
): Promise<ScheduleItem[] | string> => {
  const startDate = new Date(plantingDate);
  const totalDuration = cropCoefficients[crop].totalDuration;
  const farmSizeNum = parseFloat(farmSize);

  const schedule: ScheduleItem[] = [];
  let currentDate = new Date(startDate);
  let daysAfterPlanting = 0;

  while (daysAfterPlanting < totalDuration) {

    // call fetchClimate function
    const climateData = await fetchClimateData(location);

    if (typeof climateData === "string") {
      return climateData;
    }

    const { ETo, Rainfall } = climateData;

    const { Kc, growthStage } = getKcValue(crop, daysAfterPlanting);
    
    const irrigationFreq = calculateIrrigationFrequency(crop, soilType, ETo, Rainfall, growthStage);

    const ETc = ETo * Kc;
    const IWR = Math.max(ETc - Math.max(0.8 * Rainfall, 0), 0);
    const waterPerAcre = IWR * irrigationFreq * 4046.86;
    const totalWater = waterPerAcre * farmSizeNum;

    schedule.push({
      "Date": currentDate.toISOString().split('T')[0],
      "Growth Stage": growthStage,
      "Water per acre (liters)": Math.round(waterPerAcre * 100) / 100,
      "Total water (liters)": Math.round(totalWater * 100) / 100
    });

    currentDate.setDate(currentDate.getDate() + irrigationFreq);
    daysAfterPlanting += irrigationFreq;
  }

  return schedule;
};