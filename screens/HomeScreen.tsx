import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootTabParamList } from '../App';
import i18n from '../i18n/localization';
import { useLanguage } from '../context/LanguageContext';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();
  const { width } = useWindowDimensions();
  const { language } = useLanguage(); // This triggers re-render when language changes

  const CONTAINER_PADDING = 16;
  const CARD_GAP = 12;
  const cardWidth = (width - CONTAINER_PADDING * 2 - CARD_GAP) / 2;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingHorizontal: CONTAINER_PADDING }]}
        showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroImageContainer}>
          <Image
            source={require('../assets/hero.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{i18n.t('home.heroTitle')}</Text>
            <Text style={styles.heroSubtitle}>{i18n.t('home.heroSubtitle')}</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresWrapper}>
          <View style={[styles.featureCard, { width: cardWidth }]}>
            <Ionicons name="time-outline" size={28} color="#16a34a" />
            <Text style={styles.featureTitle}>{i18n.t('home.feature1_title')}</Text>
            <Text style={styles.featureText}>{i18n.t('home.feature1_text')}</Text>
          </View>

          <View style={[styles.featureCard, { width: cardWidth, marginLeft: CARD_GAP }]}>
            <Ionicons name="water-outline" size={28} color="#16a34a" />
            <Text style={styles.featureTitle}>{i18n.t('home.feature2_title')}</Text>
            <Text style={styles.featureText}>{i18n.t('home.feature2_text')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.buttonContainer, { left: CONTAINER_PADDING, right: CONTAINER_PADDING }]}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Irrigation')}>
          <Text style={styles.getStartedButtonText}>{i18n.t('home.getStarted')}</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { paddingBottom: 100 },
  heroImageContainer: {
    height: 300,
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  heroTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    lineHeight: 24,
  },
  featuresWrapper: { flexDirection: 'row', marginBottom: 25 },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 12,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: { position: 'absolute', bottom: 20 },
  getStartedButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
});

export default HomeScreen;
