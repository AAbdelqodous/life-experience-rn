import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../components/ui/AppText';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t('help.faq1.question'),
      answer: t('help.faq1.answer'),
    },
    {
      question: t('help.faq2.question'),
      answer: t('help.faq2.answer'),
    },
    {
      question: t('help.faq3.question'),
      answer: t('help.faq3.answer'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleReportProblem = () => {
    Alert.alert(
      t('help.reportProblem'),
      t('help.reportProblemMessage'),
      [{ text: t('common.ok'), style: 'default' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('help.title'),
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
        {/* FAQ Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('help.faq')}</AppText>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={[styles.faqQuestion, isRTL && styles.faqQuestionRtl]}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
              >
                <AppText style={styles.faqQuestionText}>{faq.question}</AppText>
                <Ionicons
                  name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#757575"
                />
              </TouchableOpacity>
              {expandedFAQ === index && (
                <View style={[styles.faqAnswer, isRTL && styles.faqAnswerRtl]}>
                  <AppText style={styles.faqAnswerText}>{faq.answer}</AppText>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Us Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('help.contactUs')}</AppText>
          <View style={styles.contactCard}>
            <TouchableOpacity style={[styles.contactItem, isRTL && styles.contactItemRtl]}>
              <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="mail-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.contactInfo}>
                <AppText style={styles.contactLabel}>Email</AppText>
                <AppText style={styles.contactValue}>support@maintenancecenters.kw</AppText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactItem, isRTL && styles.contactItemRtl]}>
              <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="call-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.contactInfo}>
                <AppText style={styles.contactLabel}>{t('center.contact')}</AppText>
                <AppText style={styles.contactValue}>+965 2222 2222</AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Report Problem Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.reportButton, isRTL && styles.reportButtonRtl]}
            onPress={handleReportProblem}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
            <AppText style={styles.reportButtonText}>{t('help.reportProblem')}</AppText>
          </TouchableOpacity>
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
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  faqQuestionRtl: {
    flexDirection: 'row-reverse',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
    marginRight: 8,
  },
  faqAnswer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  faqAnswerRtl: {
    marginLeft: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  contactCard: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  contactItemRtl: {
    flexDirection: 'row-reverse',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  reportButtonRtl: {
    flexDirection: 'row-reverse',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
});
