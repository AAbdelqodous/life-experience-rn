import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../components/ui/AppText';

export default function AboutScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const socialLinks = [
    {
      icon: 'logo-instagram',
      label: 'Instagram',
      url: 'https://instagram.com/maintenancecenters',
    },
    {
      icon: 'logo-twitter',
      label: 'Twitter',
      url: 'https://twitter.com/maintenancecenters',
    },
    {
      icon: 'logo-facebook',
      label: 'Facebook',
      url: 'https://facebook.com/maintenancecenters',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('about.title'),
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
      <View style={styles.container}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <AppText style={styles.logoText}>MC</AppText>
          </View>
        </View>

        {/* App Name */}
        <AppText style={styles.appName}>
          {isRTL ? 'مراكز الصيانة' : 'Maintenance Centers'}
        </AppText>

        {/* Tagline */}
        <AppText style={styles.tagline}>{t('about.tagline')}</AppText>

        {/* Version */}
        <AppText style={styles.version}>
          {t('about.version')}: 1.0.0
        </AppText>

        {/* Social Links */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('about.connectWithUs')}</AppText>
          <View style={styles.socialLinks}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialLink, isRTL && styles.socialLinkRtl]}
                activeOpacity={0.7}
              >
                <Ionicons name={link.icon as any} size={24} color="#2196F3" />
                <AppText style={styles.socialLabel}>{link.label}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('about.contact')}</AppText>
          <TouchableOpacity
            style={[styles.contactItem, isRTL && styles.contactItemRtl]}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={20} color="#757575" />
            <AppText style={styles.contactText}>support@maintenancecenters.kw</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactItem, isRTL && styles.contactItemRtl]}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={20} color="#757575" />
            <AppText style={styles.contactText}>+965 2222 2222</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  socialLinks: {
    gap: 12,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  socialLinkRtl: {
    flexDirection: 'row-reverse',
  },
  socialLabel: {
    fontSize: 15,
    color: '#1A1A2E',
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contactItemRtl: {
    flexDirection: 'row-reverse',
  },
  contactText: {
    fontSize: 15,
    color: '#1A1A2E',
    marginLeft: 12,
  },
});
