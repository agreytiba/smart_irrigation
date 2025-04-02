import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Platform,
  ActivityIndicator,
  FlatList,
  ListRenderItem
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import en from './langauge/en';
import sw from './langauge/sw';
// Type definitions
type FormData = {
  location: string;
  crop: string;
  plantingDate: Date;
  farmSize: string;
  soilType: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type ScheduleItem = {
  Date: string;
  'Growth Stage': string;
  'Water per acre (liters)': number;
  'Total water (liters)': number;
};

type CropCoefficientStage = {
  Kc: number;
  duration: number;
};

type CropCoefficients = {
  initial: CropCoefficientStage;
  development: CropCoefficientStage;
  midSeason: CropCoefficientStage;
  lateSeason: CropCoefficientStage;
  totalDuration: number;
};

type ClimateData = {
  ETo: number;
  Rainfall: number;
} | string;

type KcResult = {
  Kc: number;
  growthStage: string;
};

type LocationCoordinates = {
  lat: number;
  lon: number;
};

type LocationsMap = {
  [key: string]: LocationCoordinates;
};


// Add this type definition
type Language = 'en' | 'sw';
// Crop coefficients data
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

const fetchClimateData = async (location: string): Promise<ClimateData> => {
  const locations: LocationsMap = {
    "Kasapo": { "lat": -6.3585, "lon": 36.7219 },
    "Bangalala": { "lat": -6.4378, "lon": 36.7254 },
    
  };
  
  if (!(location in locations)) {
    return "Invalid Location";
  }

  const lat = locations[location].lat;
  const lon = locations[location].lon;
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

const calculateIrrigationFrequency = (
  crop: string, 
  soilType: string, 
  ETo: number, 
  rainfall: number, 
  growthStage: string
): number => {
  const baseFreq: Record<string, Record<string, number>> = {
    "maize": { "Initial": 3, "Development":3 , "Mid-Season": 3, "Late-Season": 5 },
    "beans": { "Initial": 4, "Development": 3, "Mid-Season": 3, "Late-Season": 5 },
    "tomatoes": { "Initial": 3, "Development": 3, "Mid-Season": 2, "Late-Season": 5 },
   
  };

  const cropFrequencies = baseFreq[crop];
  if (!cropFrequencies) return 7; // Default value if crop not found
  
  let adjustedFreq = cropFrequencies[growthStage] || 7;

  // Soil type adjustments
  if (soilType === "sandy") {
    adjustedFreq = Math.max(3, adjustedFreq - 1);
  } else if (soilType === "clay") {
    adjustedFreq += 1;
  }

  // Weather adjustments
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

const getKcValue = (crop: string, daysAfterPlanting: number): KcResult => {
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

const generateIrrigationSchedule = async (
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
    const climateData = await fetchClimateData(location);

    if (typeof climateData === "string") {
      return climateData;
    }

    const { ETo, Rainfall } = climateData;
    const { Kc, growthStage } = getKcValue(crop, daysAfterPlanting);
    const irrigationFreq = calculateIrrigationFrequency(crop, soilType, ETo, Rainfall, growthStage);

    const ETc = ETo * Kc;
    const IWR = Math.max(ETc - Math.max(0.6 * Rainfall - 10, 0), 0);
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

const FarmInputForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    location: '',
    crop: '',
    plantingDate: new Date(),
    farmSize: '',
    soilType: '',
  });

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<ScheduleItem[] | string | null>(null);
  const [error, setError] = useState<string | null>(null);

    // Add language state
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState(en);
  
    // Update translations when language changes
    useEffect(() => {
      setTranslations(language === 'en' ? en : sw);
    }, [language]);
  
    // Add language switcher function
    const toggleLanguage = () => {
      setLanguage(prev => prev === 'en' ? 'sw' : 'en');
    };
  

  const locations: SelectOption[] = [
    { label: 'Select Location', value: '' },
    { label: 'Kasapo', value: 'Kasapo' },
    { label: 'Bangalala', value: 'Bangalala' },
   
  ];

  const crops: SelectOption[] = [
    { label: 'Select Crop', value: '' },
    { label: 'Maize', value: 'maize' },
    
    { label: 'beans', value: 'beans' },
    { label: 'Potatoes', value: 'tomatoes' },
  ];

  const soilTypes: SelectOption[] = [
    { label: 'Select Soil Type', value: '' },
    { label: 'Clay', value: 'clay' },
    { label: 'Sandy', value: 'sandy' },
    
  ];

  const handleInputChange = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('plantingDate', selectedDate);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.location || !formData.crop || !formData.farmSize || !formData.soilType) {
      setError('jaza nafasi zote');
      return;
    }

    const farmSizeNum = parseFloat(formData.farmSize);
    if (isNaN(farmSizeNum) || farmSizeNum <= 0) {
      setError('tafadhali jaza ukubwa wa shamba');
      return;
    }

    setError(null);
    setLoading(true);
    setSchedule(null);

    try {
      const result = await generateIrrigationSchedule(
        formData.plantingDate,
        formData.crop,
        formData.farmSize,
        formData.soilType,
        formData.location
      );

      if (typeof result === 'string') {
        setError(result);
      } else {
        setSchedule(result);
      }
    } catch (err) {
      setError('Failed to generate irrigation schedule');
    } finally {
      setLoading(false);
    }
  };

  const renderScheduleItem: ListRenderItem<ScheduleItem> = ({ item }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.scheduleDate}>{item.Date}</Text>
      <Text>Stage: {item['Growth Stage']}</Text>
      <Text>Water/acre: {item['Water per acre (liters)']} liters</Text>
      <Text>Total water: {item['Total water (liters)']} liters</Text>
    </View>
  );

  return (
  <ScrollView style={styles.container}>
  <View style={styles.navbar}>
    <Text style={styles.navbarTitle}>{translations.header}</Text>
    <Text style={styles.mylan}>lugha</Text>
    <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
      <Text style={styles.languageButtonText}>
        {language === 'en' ? 'SW' : 'EN'}
      </Text>
    </TouchableOpacity>
  </View>
  
  {error && <Text style={styles.errorText}>{error}</Text>}

  {/* Location Picker */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{translations.location}</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={formData.location}
        onValueChange={(itemValue: string) => handleInputChange('location', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label={translations.selectLocation} value="" />
        <Picker.Item label={translations.kasapo} value="Kasapo" />
        <Picker.Item label={translations.bangalala} value="Bangalala" />
     
      </Picker>
    </View>
  </View>

  {/* Crop Picker */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{translations.crop}</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={formData.crop}
        onValueChange={(itemValue: string) => handleInputChange('crop', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label={translations.selectCrop} value="" />
        <Picker.Item label={translations.maize} value="maize" />
        <Picker.Item label={translations.beans} value="beans" />
        <Picker.Item label={translations.tomatoes} value="tomatoes" />
      </Picker>
    </View>
  </View>

  {/* Planting Date - Cross-platform solution */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{translations.plantingDate}</Text>
    {Platform.OS === 'web' ? (
      // Web implementation
      <input
        type="date"
        value={formData.plantingDate.toISOString().split('T')[0]}
        onChange={(e) => {
          const date = new Date(e.target.value);
          handleInputChange('plantingDate', date);
        }}
        style={{
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: 'white',
          width: '100%',
        }}
      />
    ) : (
      // Mobile implementation
      <>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{formData.plantingDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.plantingDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              if (Platform.OS !== 'ios') {
                setShowDatePicker(false);
              }
              if (selectedDate) {
                handleInputChange('plantingDate', selectedDate);
              }
            }}
          />
        )}
      </>
    )}
  </View>

  {/* Farm Size */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{translations.farmSize}</Text>
    <TextInput
      style={styles.textInput}
      placeholder={translations.enterFarmSize}
      keyboardType="numeric"
      value={formData.farmSize}
      onChangeText={(text: string) => handleInputChange('farmSize', text)}
    />
  </View>

  {/* Soil Type Picker */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{translations.soilType}</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={formData.soilType}
        onValueChange={(itemValue: string) => handleInputChange('soilType', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label={translations.selectSoilType} value="" />
        <Picker.Item label={translations.clay} value="clay" />
        <Picker.Item label={translations.sandy} value="sandy" />
        <Picker.Item label={translations.loamy} value="loamy" />
      
      </Picker>
    </View>
  </View>

  {/* Submit Button */}
  <TouchableOpacity
    style={styles.submitButton}
    onPress={handleSubmit}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text style={styles.submitButtonText}>{translations.submitButton}</Text>
    )}
  </TouchableOpacity>

  {/* Results Section */}
  {schedule && (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsHeader}>{translations.resultsHeader}</Text>
      
      {typeof schedule === 'string' ? (
        <Text style={styles.errorText}>{schedule}</Text>
      ) : (
        <FlatList
          data={schedule}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDate}>{item.Date}</Text>
              <Text>{translations.stage}: {item['Growth Stage']}</Text>
              <Text>{translations.waterPerAcre}: {item['Water per acre (liters)']} {translations.liters}</Text>
              <Text>{translations.totalWater}: {item['Total water (liters)']} {translations.liters}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      )}
    </View>
  )}
</ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1a3e1a',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop:20,
    marginBottom:20,
    backgroundColor: '#16a34a',
  },
  navbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  languageButtonText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
    lineHeight:10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#374151',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
    padding: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 20,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a3e1a',
  },
  scheduleItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  scheduleDate: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mylan: {
color:'#fff',
  }
});

export default FarmInputForm;