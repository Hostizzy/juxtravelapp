import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import styles from './CalendarBottomSheet.styles';

interface CalendarBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
  destination: string;
}

export default function CalendarBottomSheet({
  visible,
  onClose,
  checkInDate,
  checkOutDate,
  onConfirm,
  destination,
}: CalendarBottomSheetProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [tempCheckIn, setTempCheckIn] = useState<Date | null>(null);
  const [tempCheckOut, setTempCheckOut] = useState<Date | null>(null);

  // Sync state when modal is opened
  useEffect(() => {
    if (visible) {
      setTempCheckIn(checkInDate);
      setTempCheckOut(checkOutDate);
      if (checkInDate) {
        setCurrentMonth(new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1));
      } else {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      }
    }
  }, [visible, checkInDate, checkOutDate]);

  // Helpers for date comparisons
  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBeforeToday = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isInRange = (d: Date) => {
    if (!tempCheckIn || !tempCheckOut) return false;
    return d > tempCheckIn && d < tempCheckOut;
  };

  // Date selectors click handling
  const handleDayPress = (day: Date) => {
    if (isBeforeToday(day)) return;

    if (!tempCheckIn || (tempCheckIn && tempCheckOut)) {
      setTempCheckIn(day);
      setTempCheckOut(null);
    } else {
      if (day < tempCheckIn) {
        setTempCheckIn(day);
      } else if (isSameDay(day, tempCheckIn)) {
        setTempCheckIn(null);
      } else {
        setTempCheckOut(day);
      }
    }
  };

  // Month navigations
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar days grid generator
  const generateGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday...
    const totalDays = lastDay.getDate();

    const gridCells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      gridCells.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      gridCells.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const totalCells = gridCells.length;
    const nextDaysCount = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= nextDaysCount; d++) {
      gridCells.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return gridCells;
  };

  // Date Formatting helper
  const formatDateShort = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const calculateNights = () => {
    if (!tempCheckIn || !tempCheckOut) return 0;
    const diffTime = Math.abs(tempCheckOut.getTime() - tempCheckIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleConfirm = () => {
    if (tempCheckIn && tempCheckOut) {
      onConfirm(tempCheckIn, tempCheckOut);
    }
  };

  const getMonthNameYear = () => {
    return currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDestinationName = () => {
    const dest = destination.trim();
    if (!dest) return 'Goa Escape 🌴';
    if (dest.toLowerCase().includes('escape')) return dest;
    
    // Add emojis standard to the screen designs
    if (dest.toLowerCase().includes('goa')) return `${dest} Escape 🌴`;
    if (dest.toLowerCase().includes('manali')) return `${dest} Escape ⛰`;
    if (dest.toLowerCase().includes('kerala')) return `${dest} Escape 🌿`;
    if (dest.toLowerCase().includes('rajasthan')) return `${dest} Escape 🏜`;
    return `${dest} Escape 🗺`;
  };

  const getAIInsightText = () => {
    const dest = destination.toLowerCase();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthStr = monthNames[currentMonth.getMonth()];

    if (dest.includes('goa')) {
      return `June is ideal for Goa with pleasant weather. 95% traveler satisfaction.`;
    }
    if (dest.includes('manali')) {
      return `${monthStr} in Manali is breathtaking, with great mountain weather and local festivals.`;
    }
    if (dest.includes('kerala')) {
      return `${monthStr} in Kerala has lovely backwaters, lush greenery and lower stay prices.`;
    }
    if (dest.includes('rajasthan') || dest.includes('jaipur')) {
      return `${monthStr} offers majestic views of palaces in Rajasthan, with pleasant cool evenings.`;
    }
    return `${monthStr} is highly rated for visiting ${destination || 'your destination'}, offering pleasant travel windows.`;
  };

  const gridDays = generateGrid();
  const nightsCount = calculateNights();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Select Travel Dates</Text>
              <Text style={styles.headerSubtitle}>Choose your perfect travel window</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={20} color="#1A1F1E" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Trip Summary Card */}
            <View style={styles.tripSummaryCard}>
              <View style={styles.tripSummaryLeft}>
                <Text style={styles.tripSummaryDest}>{getDestinationName()}</Text>
                <Text style={styles.tripSummaryDates}>
                  {tempCheckIn ? formatDateShort(tempCheckIn) : 'Select'} →{' '}
                  {tempCheckOut ? formatDateShort(tempCheckOut) : 'Select'}
                </Text>
                <Text style={styles.tripSummaryMeta}>
                  {nightsCount > 0 ? `${nightsCount} Nights` : '0 Nights'}
                </Text>
              </View>
              <View style={styles.tripSummaryRight}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✨ Best Travel Window</Text>
                </View>
                <Text style={styles.tripSummaryHelper}>Less crowd expected</Text>
              </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {/* Month Header Navigation */}
              <View style={styles.monthHeaderRow}>
                <TouchableOpacity style={styles.navButton} onPress={prevMonth} activeOpacity={0.7}>
                  <Feather name="chevron-left" size={20} color="#1B7A69" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{getMonthNameYear()}</Text>
                <TouchableOpacity style={styles.navButton} onPress={nextMonth} activeOpacity={0.7}>
                  <Feather name="chevron-right" size={20} color="#1B7A69" />
                </TouchableOpacity>
              </View>

              {/* Week labels */}
              <View style={styles.weekLabelsRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((label) => (
                  <View key={label} style={styles.weekLabelCell}>
                    <Text style={styles.weekLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {gridDays.map(({ date, isCurrentMonth }, index) => {
                  const isCheckIn = isSameDay(date, tempCheckIn);
                  const isCheckOut = isSameDay(date, tempCheckOut);
                  const isBetween = isInRange(date);
                  const disabled = !isCurrentMonth || isBeforeToday(date);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.dayCell}
                      onPress={() => isCurrentMonth && handleDayPress(date)}
                      disabled={disabled}
                      activeOpacity={0.8}
                    >
                      {/* Connecting range backgrounds */}
                      {isCurrentMonth && tempCheckIn && tempCheckOut && (
                        <>
                          {isCheckIn && <View style={styles.rangeHighlightRight} />}
                          {isCheckOut && <View style={styles.rangeHighlightLeft} />}
                          {isBetween && <View style={styles.rangeHighlightMiddle} />}
                        </>
                      )}

                      {/* Day Number circle */}
                      <View
                        style={[
                          styles.dayCircle,
                          (isCheckIn || isCheckOut) && styles.dayCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            disabled && styles.dayTextDisabled,
                            isBetween && styles.dayTextInRange,
                            (isCheckIn || isCheckOut) && styles.dayTextSelected,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </View>

                      {/* Check-in / Check-out Pill Labels */}
                      {isCurrentMonth && isCheckIn && (
                        <View style={styles.checkLabelPill}>
                          <Text style={styles.checkLabelText}>Check-in</Text>
                        </View>
                      )}
                      {isCurrentMonth && isCheckOut && (
                        <View style={styles.checkLabelPill}>
                          <Text style={styles.checkLabelText}>Check-out</Text>
                        </View>
                      )}

                      {/* Intermediate Stay progress dots */}
                      {isCurrentMonth && isBetween && (
                        <View style={styles.progressDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Bottom Summary Section */}
            <View style={styles.bottomSummaryCard}>
              <View style={styles.summaryCardLeft}>
                <View style={styles.calendarIconCircle}>
                  <Feather name="calendar" size={22} color="#FFFFFF" />
                  {tempCheckIn && tempCheckOut && (
                    <View style={styles.checkBadge}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.summaryCardDetails}>
                  <Text style={styles.summaryLabel}>Selected Dates</Text>
                  {tempCheckIn && tempCheckOut ? (
                    <>
                      <Text style={styles.summaryDatesText}>
                        {formatDateShort(tempCheckIn)} – {formatDateShort(tempCheckOut)} •{' '}
                        {nightsCount} Nights
                      </Text>
                      <Text style={styles.summaryHelperText}>
                        Check-in on{' '}
                        {tempCheckIn.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                        • Check-out on{' '}
                        {tempCheckOut.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.summaryDatesText}>Choose dates above</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Check-in</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendBar} />
                <Text style={styles.legendText}>Your Stay</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Check-out</Text>
              </View>
            </View>

            {/* AI Travel Insight */}
            <View style={styles.insightCard}>
              <View style={styles.insightIconWrapper}>
                <Feather name="info" size={16} color="#1B7A69" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>✨ AI Travel Insight</Text>
                <Text style={styles.insightText}>{getAIInsightText()}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom CTA Button */}
          <View style={styles.stickyBottomContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { opacity: tempCheckIn && tempCheckOut ? 1 : 0.6 },
              ]}
              disabled={!tempCheckIn || !tempCheckOut}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>Confirm Dates →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
