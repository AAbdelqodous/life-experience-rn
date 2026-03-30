import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { OnboardingSlide } from '../../components/onboarding/OnboardingSlide';
import { OnboardingDots } from '../../components/onboarding/OnboardingDots';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';

const ONBOARDING_KEY = '@app/onboarding';
const { width } = Dimensions.get('window');

interface Slide {
  key: string;
  titleKey: string;
  subtitleKey: string;
  backgroundColor: string;
}

const SLIDES: Slide[] = [
  {
    key: 'slide1',
    titleKey: 'onboarding.slide1.title',
    subtitleKey: 'onboarding.slide1.subtitle',
    backgroundColor: '#E6F4FE',
  },
  {
    key: 'slide2',
    titleKey: 'onboarding.slide2.title',
    subtitleKey: 'onboarding.slide2.subtitle',
    backgroundColor: '#EAF7F0',
  },
  {
    key: 'slide3',
    titleKey: 'onboarding.slide3.title',
    subtitleKey: 'onboarding.slide3.subtitle',
    backgroundColor: '#FEF3E6',
  },
];

async function markOnboardingComplete() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  router.replace('/(auth)/');
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const isLast = activeIndex === SLIDES.length - 1;

  function onScroll(event: { nativeEvent: { contentOffset: { x: number } } }) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  function goNext() {
    if (isLast) {
      markOnboardingComplete();
      return;
    }
    flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  }

  function renderItem({ item }: ListRenderItemInfo<Slide>) {
    return (
      <OnboardingSlide
        title={t(item.titleKey)}
        subtitle={t(item.subtitleKey)}
        backgroundColor={item.backgroundColor}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipButton} onPress={markOnboardingComplete}>
        <AppText style={styles.skipText}>{t('onboarding.skip')}</AppText>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.flatList}
      />

      <View style={styles.footer}>
        <OnboardingDots count={SLIDES.length} activeIndex={activeIndex} />
        <AppButton
          title={isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          onPress={goNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: '#1A73E8',
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 24,
  },
  nextButton: {
    width: '100%',
  },
});
