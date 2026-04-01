import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/ui/AppText';

export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('privacy.title'),
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1A1A2E',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <AppText style={styles.lastUpdated}>{t('privacy.lastUpdated')}</AppText>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('privacy.dataCollection')}</AppText>
            <AppText style={styles.sectionText}>{t('privacy.dataCollectionText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('privacy.dataUsage')}</AppText>
            <AppText style={styles.sectionText}>{t('privacy.dataUsageText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('privacy.dataSharing')}</AppText>
            <AppText style={styles.sectionText}>{t('privacy.dataSharingText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('privacy.yourRights')}</AppText>
            <AppText style={styles.sectionText}>{t('privacy.yourRightsText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('privacy.security')}</AppText>
            <AppText style={styles.sectionText}>{t('privacy.securityText')}</AppText>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 24,
  },
});
