import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootTabParamList } from '../App';
import { ScheduleItem } from '../types';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n/localization';
import { useLanguage } from 'context/LanguageContext';

type ScheduleScreenProps = {
  route: RouteProp<RootTabParamList, 'Schedule'>;
};

const GROWTH_STAGE_COLORS = {
  initial: {
    background: '#f0f9ff',
    border: '#bae6fd',
    text: '#0369a1',
  },
  development: {
    background: '#f0fdf4',
    border: '#bbf7d0',
    text: '#15803d',
  },
  'mid-season': {
    background: '#fefce8',
    border: '#fef08a',
    text: '#a16207',
  },
  'late-season': {
    background: '#fff7ed',
    border: '#fed7aa',
    text: '#9a3412',
  },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(i18n.locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getGrowthStageColor = (stage: string) => {
  const lowerStage = stage.toLowerCase();
  if (lowerStage.includes('initial')) return GROWTH_STAGE_COLORS.initial;
  if (lowerStage.includes('development')) return GROWTH_STAGE_COLORS.development;
  if (lowerStage.includes('mid-season')) return GROWTH_STAGE_COLORS['mid-season'];
  if (lowerStage.includes('late-season')) return GROWTH_STAGE_COLORS['late-season'];
  return {
    background: '#f3f4f6',
    border: '#e5e7eb',
    text: '#4b5563',
  };
};

const ScheduleScreen = ({ route }: ScheduleScreenProps) => {
  const { scheduleData } = route.params || {};
  const { language } = useLanguage();
  const renderItem = ({ item, index }: { item: ScheduleItem; index: number }) => {
    const growthStageColors = getGrowthStageColor(item['Growth Stage']);

    return (
      <View
        style={[
          styles.scheduleItem,
          {
            borderLeftColor: growthStageColors.border,
            borderLeftWidth: 4,
          },
          index === 0 && styles.firstItem,
          index === (scheduleData?.length || 0) - 1 && styles.lastItem,
        ]}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={18} color="#16a34a" />
            <Text style={styles.date}>{formatDate(item.Date)}</Text>
          </View>
          <View
            style={[
              styles.stageBadge,
              {
                backgroundColor: growthStageColors.background,
                borderColor: growthStageColors.border,
              },
            ]}>
            <Text style={[styles.stageText, { color: growthStageColors.text }]}>
              {item['Growth Stage']}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="water" size={16} color="#3b82f6" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>{i18n.t('schedule.waterPerAcre')}</Text>
              <Text style={styles.detailValue}>
                {item['Water per acre (liters)']} {i18n.t('schedule.liters')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calculator" size={16} color="#3b82f6" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>{i18n.t('schedule.totalWater')}</Text>
              <Text style={styles.detailValue}>
                {item['Total water (liters)']} {i18n.t('schedule.liters')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.subHeader}>{i18n.t('schedule.description')}</Text>
      </View>

      {scheduleData ? (
        <FlatList
          data={scheduleData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>{i18n.t('schedule.noData')}</Text>
          <Text style={styles.emptySubText}>{i18n.t('schedule.hintText')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    marginBottom: 24,
  },
  subHeader: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 24,
  },
  scheduleItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 14,
    color: '#1f2937',
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  stageText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardBody: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
  },
  detailTextContainer: {
    marginLeft: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 6,
  },
  firstItem: { marginTop: 0 },
  lastItem: { marginBottom: 32 },
});

export default ScheduleScreen;
