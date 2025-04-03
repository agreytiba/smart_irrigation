import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootTabParamList } from '../App';
import { ScheduleItem } from '../types';
import { Ionicons } from '@expo/vector-icons';

type ScheduleScreenProps = {
  route: RouteProp<RootTabParamList, 'Schedule'>;
};

// Growth stage colors mapping
const GROWTH_STAGE_COLORS = {
  'initial': {
    background: '#f0f9ff',
    border: '#bae6fd',
    text: '#0369a1'
  },
  'development': {
    background: '#f0fdf4',
    border: '#bbf7d0',
    text: '#15803d'
  },
  'mid-season': {
    background: '#fefce8',
    border: '#fef08a',
    text: '#a16207'
  },
  'late-season': {
    background: '#fff7ed',
    border: '#fed7aa',
    text: '#9a3412'
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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
    text: '#4b5563'
  };
};

const ScheduleScreen = ({ route }: ScheduleScreenProps) => {
  const { scheduleData } = route.params || {};

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
          index === (scheduleData?.length || 0) - 1 && styles.lastItem
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={18} color="#16a34a" />
            <Text style={styles.date}>{formatDate(item.Date)}</Text>
          </View>
          <View style={[
            styles.stageBadge,
            {
              backgroundColor: growthStageColors.background,
              borderColor: growthStageColors.border,
            }
          ]}>
            <Text style={[
              styles.stageText,
              { color: growthStageColors.text }
            ]}>
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
              <Text style={styles.detailLabel}>Water per acre</Text>
              <Text style={styles.detailValue}>{item['Water per acre (liters)']} liters</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calculator" size={16} color="#3b82f6" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Total water needed</Text>
              <Text style={styles.detailValue}>{item['Total water (liters)']} liters</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.subHeader}>Follow this plan for optimal water usage</Text>
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
          <Text style={styles.emptyText}>No schedule data available</Text>
          <Text style={styles.emptySubText}>Generate a schedule from the Irrigation tab</Text>
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
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
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
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  firstItem: {
    marginTop: 8,
  },
  lastItem: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginLeft: 8,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: '#eff6ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ScheduleScreen;