import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, useTheme, Portal, Modal, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '../theme';

interface TimePickerButtonProps {
  label: string;
  value: string; // "HH:mm" format
  onChange: (time: string) => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

interface WheelPickerProps {
  data: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  theme: AppTheme;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ data, selectedIndex, onSelect, theme }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrolling, setScrolling] = useState(false);

  // Triple the data for infinite scroll effect
  const tripleData = [...data, ...data, ...data];
  const dataLength = data.length;

  useEffect(() => {
    if (scrollViewRef.current && !scrolling) {
      // Start in the middle section
      scrollViewRef.current.scrollTo({
        y: (selectedIndex + dataLength) * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex, scrolling, dataLength]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(y / ITEM_HEIGHT);
    const actualIndex = ((rawIndex % dataLength) + dataLength) % dataLength;

    if (actualIndex !== selectedIndex) {
      onSelect(actualIndex);
    }
  };

  const handleScrollBegin = () => setScrolling(true);

  const handleScrollEnd = (event: any) => {
    setScrolling(false);
    const y = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(y / ITEM_HEIGHT);

    // If scrolled to first or last section, jump to middle
    if (rawIndex < dataLength || rawIndex >= dataLength * 2) {
      const actualIndex = ((rawIndex % dataLength) + dataLength) % dataLength;
      scrollViewRef.current?.scrollTo({
        y: (actualIndex + dataLength) * ITEM_HEIGHT,
        animated: false,
      });
    }
  };

  return (
    <View style={styles.wheelContainer}>
      <View style={[styles.selectionIndicator, { backgroundColor: theme.colors.primaryContainer }]} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT,
        }}
      >
        {tripleData.map((item, index) => {
          const actualIndex = index % dataLength;
          const isSelected = actualIndex === selectedIndex;
          return (
            <View key={index} style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelItemText,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontWeight: isSelected ? '600' : '400',
                    opacity: isSelected ? 1 : 0.5,
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const TimePickerButton: React.FC<TimePickerButtonProps> = ({
  label,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();
  const [showPicker, setShowPicker] = useState(false);
  const [tempHour, setTempHour] = useState(0);
  const [tempMinute, setTempMinute] = useState(0);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handlePress = () => {
    const [h, m] = value.split(':').map(Number);
    setTempHour(h);
    setTempMinute(m);
    setShowPicker(true);
  };

  const handleConfirm = () => {
    const newTime = `${hours[tempHour]}:${minutes[tempMinute]}`;
    onChange(newTime);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  return (
    <>
      <Pressable onPress={handlePress}>
        <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
          <View style={styles.timeRow}>
            <Text variant="displaySmall" style={[styles.timeText, { color: theme.colors.primary }]}>
              {value}
            </Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={theme.colors.primary}
            />
          </View>
        </View>
      </Pressable>

      <Portal>
        <Modal
          visible={showPicker}
          onDismiss={handleCancel}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {label}
          </Text>

          <View style={styles.pickerContainer}>
            <WheelPicker
              data={hours}
              selectedIndex={tempHour}
              onSelect={setTempHour}
              theme={theme}
            />
            <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
            <WheelPicker
              data={minutes}
              selectedIndex={tempMinute}
              onSelect={setTempMinute}
              theme={theme}
            />
          </View>

          <View style={styles.modalButtons}>
            <Button onPress={handleCancel} textColor={theme.colors.onSurfaceVariant}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleConfirm} mode="contained">
              {t('common.ok')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontWeight: '600',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheelContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 80,
    overflow: 'hidden',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    zIndex: -1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 24,
  },
  separator: {
    fontSize: 32,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});
