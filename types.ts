// types.ts
export type ScheduleItem = {
  Date: string;
  'Growth Stage': string;
  'Water per acre (liters)': number;
  'Total water (liters)': number;
};

export type CropCoefficientStage = {
  Kc: number;
  duration: number;
};

export type CropCoefficients = {
  initial: CropCoefficientStage;
  development: CropCoefficientStage;
  midSeason: CropCoefficientStage;
  lateSeason: CropCoefficientStage;
  totalDuration: number;
};

export type ClimateData = {
  ETo: number;
  Rainfall: number;
} | string;

export type KcResult = {
  Kc: number;
  growthStage: string;
};

export type LocationCoordinates = {
  lat: number;
  lon: number;
};

export type LocationsMap = {
  [key: string]: LocationCoordinates;
};

export type Language = 'en' | 'sw';

export type FormData = {
  location: string;
  crop: string;
  plantingDate: Date;
  farmSize: string;
  soilType: string;
};