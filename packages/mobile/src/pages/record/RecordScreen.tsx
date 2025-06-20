import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function RecordScreen() {
  const recordTypes = [
    { id: 'feeding', title: '수유', color: '#4CAF50' },
    { id: 'diaper', title: '기저귀', color: '#FF9800' },
    { id: 'sleep', title: '수면', color: '#2196F3' },
    { id: 'tummy_time', title: '배밀이', color: '#9C27B0' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>활동 기록</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {recordTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.recordButton, { backgroundColor: type.color }]}
              onPress={() => {
                // TODO: Navigate to specific record screen
              }}>
              <Text style={styles.recordButtonText}>{type.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          <Text style={styles.emptyText}>최근 기록이 없습니다.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  recordButton: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  recentSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});