import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/ui/AppText';

export default function TermsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('terms.title'),
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
          <AppText style={styles.lastUpdated}>{t('terms.lastUpdated')}</AppText>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('terms.acceptance')}</AppText>
            <AppText style={styles.sectionText}>{t('terms.acceptanceText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('terms.services')}</AppText>
            <AppText style={styles.sectionText}>{t('terms.servicesText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('terms.userResponsibilities')}</AppText>
            <AppText style={styles.sectionText}>{t('terms.userResponsibilitiesText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('terms.bookings')}</AppText>
            <AppText style={styles.sectionText}>{t('terms.bookingsText')}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('terms.limitation')}</AppText>
            <AppText style={styles.sectionText}>{t('terms.limitationText')}</AppText>
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
