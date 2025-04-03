export default {
  // Common
  languageButton: "Kiswahili",
  
  // HomeScreen
  home: {
    heroTitle: "Smart Irrigation System",
    heroSubtitle: "Optimizing Water Usage for Better Yields",
    feature1Title: "Optimal Timing",
    feature1Text: "Get precise irrigation schedules tailored to your crops",
    feature2Title: "Water Savings",
    feature2Text: "Reduce water usage while maintaining crop health",
    buttonText: "Get Started"
  },

  // IrrigationScreen
  irrigation: {
    header: "Create Irrigation Plan",
    subHeader: "Enter your farm details to get started",
    labels: {
      location: "Farm Location",
      crop: "Crop Type",
      plantingDate: "Planting Date",
      farmSize: "Farm Size (acres)",
      soilType: "Soil Type"
    },
    placeholders: {
      selectLocation: "Select location",
      selectCrop: "Select crop",
      selectSoil: "Select soil type",
      enterFarmSize: "Enter farm size"
    },
    submitButton: "Generate Irrigation Plan",
    errors: {
      fillAllFields: "Please fill all fields",
      validFarmSize: "Please enter a valid farm size",
      generateError: "Failed to generate schedule. Please try again later."
    }
  },

  // ScheduleScreen
  schedule: {
    header: "Your Irrigation Schedule",
    subHeader: "Follow this plan for optimal water usage",
    growthStage: "Growth Stage",
    waterPerAcre: "Water per acre",
    totalWater: "Total water needed",
    noData: {
      title: "No schedule data",
      message: "Generate a schedule from the Irrigation tab"
    }
  },

  // SettingsScreen
  settings: {
    header: "Settings",
    language: "Language",
    notifications: "Notifications",
    darkMode: "Dark Mode",
    about: "About"
  }
};