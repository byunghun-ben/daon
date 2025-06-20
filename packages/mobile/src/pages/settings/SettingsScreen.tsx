import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function SettingsScreen() {
  const settingsOptions = [
    { id: 'profile', title: '프로필 관리', subtitle: '아이 정보 및 부모 정보' },
    { id: 'guardians', title: '보호자 관리', subtitle: '다른 보호자 초대 및 권한 설정' },
    { id: 'notifications', title: '알림 설정', subtitle: '푸시 알림 및 리마인더' },
    { id: 'backup', title: '데이터 백업', subtitle: '클라우드 백업 및 복원' },
    { id: 'privacy', title: '개인정보 보호', subtitle: '개인정보 처리방침' },
    { id: 'support', title: '고객 지원', subtitle: '문의하기 및 FAQ' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {settingsOptions.map((option) => (
          <TouchableOpacity key={option.id} style={styles.optionItem}>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.version}>다온 v1.0.0</Text>
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
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
});