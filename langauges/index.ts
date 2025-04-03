import sw from './sw';
import en from './en';

export type LanguageCode = 'sw' | 'en';

export interface Translations {
  languageButton: string;
  home: {
    heroTitle: string;
    heroSubtitle: string;
    feature1Title: string;
    feature1Text: string;
    feature2Title: string;
    feature2Text: string;
    buttonText: string;
  };
  irrigation: {
    header: string;
    subHeader: string;
    labels: {
      location: string;
      crop: string;
      plantingDate: string;
      farmSize: string;
      soilType: string;
    };
    placeholders: {
      selectLocation: string;
      selectCrop: string;
      selectSoil: string;
      enterFarmSize: string;
    };
    submitButton: string;
    errors: {
      fillAllFields: string;
      validFarmSize: string;
      generateError: string;
    };
  };
  schedule: {
    header: string;
    subHeader: string;
    growthStage: string;
    waterPerAcre: string;
    totalWater: string;
    noData: {
      title: string;
      message: string;
    };
  };
  settings: {
    header: string;
    language: string;
    notifications: string;
    darkMode: string;
    about: string;
  };
}

const translations: Record<LanguageCode, Translations> = {
  sw,
  en
};

export default translations;