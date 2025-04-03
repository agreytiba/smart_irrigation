import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootTabParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { generateIrrigationSchedule } from '../services/irrigationService';
import { FormData } from '../types';

type DropdownType = 'location' | 'crop' | 'soilType';

const IrrigationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();
  const [formData, setFormData] = useState<FormData>({
    location: '',
    crop: '',
    plantingDate: new Date(),
    farmSize: '',
    soilType: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType | null>(null);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const locationOptions = ['Kasapo', 'Bangalala'];
  const cropOptions = ['maize', 'beans', 'tomatoes'];
  const soilTypeOptions = ['clay', 'sandy', 'loamy'];

  const toggleDropdown = (type: DropdownType) => {
    if (activeDropdown === type) {
      closeDropdown();
    } else {
      setActiveDropdown(type);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeDropdown = () => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      if (isMounted.current) {
        setActiveDropdown(null);
      }
    });
  };

  const handleInputChange = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    if (isMounted.current) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!isMounted.current) return;

    // Validate all required fields
    if (!formData.location || !formData.crop || !formData.farmSize || !formData.soilType) {
      setError('Please fill all fields');
      return;
    }

    const farmSizeNum = parseFloat(formData.farmSize);
    if (isNaN(farmSizeNum) || farmSizeNum <= 0) {
      setError('Please enter a valid farm size (greater than 0)');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await generateIrrigationSchedule(
        formData.plantingDate,
        formData.crop,
        formData.farmSize,
        formData.soilType,
        formData.location
      );

      if (!isMounted.current) return;

      if (typeof result === 'string') {
        setError(result);
      } else {
        // Ensure data is serializable for navigation
        const serializableData = JSON.parse(JSON.stringify(result));
        
        try {
          console.log('Attempting navigation with data:', serializableData);
          navigation.navigate('Schedule', { 
            scheduleData: serializableData 
          });
        } catch (e) {
          console.error('Navigation error:', e);
          setError('Navigation failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error generating schedule:', err);
      if (isMounted.current) {
        setError('Failed to generate irrigation schedule. Please try again later.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const renderDropdownOptions = () => {
    let options: string[] = [];
    let property: keyof FormData = 'location';

    switch (activeDropdown) {
      case 'location':
        options = locationOptions;
        property = 'location';
        break;
      case 'crop':
        options = cropOptions;
        property = 'crop';
        break;
      case 'soilType':
        options = soilTypeOptions;
        property = 'soilType';
        break;
      default:
        return null;
    }

    return (
      <Modal
        transparent
        visible={!!activeDropdown}
        onRequestClose={closeDropdown}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.dropdownModal,
            {
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView style={styles.dropdownScroll}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange(property, option);
                  closeDropdown();
                }}
              >
                <Text style={styles.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Create Irrigation Plan</Text>
        <Text style={styles.subHeader}>Enter your farm details to get started</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Location Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Farm Location</Text>
        <TouchableOpacity 
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('location')}
        >
          <Text style={[styles.dropdownHeaderText, !formData.location && styles.placeholderText]}>
            {formData.location || 'Select location'}
          </Text>
          <Ionicons 
            name={activeDropdown === 'location' ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#4b5563" 
          />
        </TouchableOpacity>
      </View>

      {/* Crop Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Crop Type</Text>
        <TouchableOpacity 
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('crop')}
        >
          <Text style={[styles.dropdownHeaderText, !formData.crop && styles.placeholderText]}>
            {formData.crop || 'Select crop'}
          </Text>
          <Ionicons 
            name={activeDropdown === 'crop' ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#4b5563" 
          />
        </TouchableOpacity>
      </View>

      {/* Planting Date */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Planting Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={formData.plantingDate.toISOString().split('T')[0]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const date = new Date(e.target.value);
              handleInputChange('plantingDate', date);
            }}
            style={styles.webDateInput}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formData.plantingDate.toDateString()}</Text>
              <Ionicons name="calendar" size={18} color="#4b5563" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.plantingDate}
                mode="date"
                display="default"
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowDatePicker(false);
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
        <Text style={styles.label}>Farm Size (acres)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter farm size"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.farmSize}
            onChangeText={(text) => handleInputChange('farmSize', text)}
          />
          <Ionicons name="resize" size={18} color="#4b5563" style={styles.inputIcon} />
        </View>
      </View>

      {/* Soil Type Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Soil Type</Text>
        <TouchableOpacity 
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('soilType')}
        >
          <Text style={[styles.dropdownHeaderText, !formData.soilType && styles.placeholderText]}>
            {formData.soilType || 'Select soil type'}
          </Text>
          <Ionicons 
            name={activeDropdown === 'soilType' ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#4b5563" 
          />
        </TouchableOpacity>
      </View>

      {renderDropdownOptions()}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Generate Irrigation Plan</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 14,
  },
  inputIcon: {
    marginLeft: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  webDateInput: {
    width: '100%',
    paddingBlock:12,
    paddingInline:16,
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    backgroundColor: 'white',
    fontSize: 16,
    color: '#1f2937',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '50%',
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
});

export default IrrigationScreen;