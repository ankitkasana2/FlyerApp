import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ViewStyle,
  Pressable,
} from 'react-native';
import Colors from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_WIDTH = SCREEN_WIDTH - 48;
const DAY_SIZE = Math.floor((CALENDAR_WIDTH - 32) / 7);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ─── helpers ──────────────────────────────────────────────────────────────────

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDisplay = (date: Date | null) => {
  if (!date) return 'Select Date';
  return date
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
};

// ─── CalendarModal ────────────────────────────────────────────────────────────

interface CalendarModalProps {
  visible: boolean;
  value: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  value,
  onConfirm,
  onCancel,
}) => {
  const today = useMemo(() => new Date(), []);
  const [draft, setDraft] = useState<Date>(value ?? today);
  const [viewYear, setViewYear] = useState(
    (value ?? today).getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    (value ?? today).getMonth(),
  );

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  }, [viewMonth]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay   = getFirstDayOfMonth(viewYear, viewMonth);

  // Build 6-row grid with leading/trailing nulls
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDay = useCallback(
    (day: number) => {
      setDraft(new Date(viewYear, viewMonth, day));
    },
    [viewYear, viewMonth],
  );

  const handleConfirm = () => onConfirm(draft);

  // Header date display
  const headerDay  = draft.toLocaleDateString('en-US', { weekday: 'short' });
  const headerDate = draft.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>

          {/* ── Header banner ─────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerYear}>{viewYear}</Text>
            <Text style={styles.headerDate}>
              {headerDay}, {headerDate}
            </Text>
          </View>

          {/* ── Month navigation ──────────────────────────────── */}
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={8}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.monthLabel}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>

            <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={8}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* ── Day-of-week labels ─────────────────────────────── */}
          <View style={styles.dayLabelsRow}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} style={styles.dayCell}>
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* ── Calendar grid ──────────────────────────────────── */}
          <View style={styles.grid}>
            {cells.map((day, idx) => {
              if (!day) {
                return <View key={`e-${idx}`} style={styles.dayCell} />;
              }

              const cellDate  = new Date(viewYear, viewMonth, day);
              const isSelected = isSameDay(cellDate, draft);
              const isToday    = isSameDay(cellDate, today);

              return (
                <TouchableOpacity
                  key={`d-${idx}`}
                  style={styles.dayCell}
                  onPress={() => handleDay(day)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayInner,
                      isSelected && styles.daySelected,
                      !isSelected && isToday && styles.dayToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        !isSelected && isToday && styles.dayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Buttons ────────────────────────────────────────── */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn} activeOpacity={0.8}>
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── DatePickerField ──────────────────────────────────────────────────────────

export interface DatePickerFieldProps {
  label?: string;
  isRequired?: boolean;
  value: Date | null;
  onChange: (date: Date) => void;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  isRequired = false,
  value,
  onChange,
  rightIcon,
  containerStyle,
}) => {
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {isRequired && <Text style={styles.required}> *</Text>}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <View style={[styles.input, rightIcon ? styles.inputWithIcon : null]}>
          <Text style={[styles.inputText, !value && { color: Colors.textSecondary }]}>
            {formatDisplay(value)}
          </Text>
        </View>
        {rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </TouchableOpacity>

      <CalendarModal
        visible={show}
        value={value}
        onConfirm={date => {
          onChange(date);
          setShow(false);
        }}
        onCancel={() => setShow(false)}
      />
    </View>
  );
};

export default DatePickerField;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Field ────────────────────────────────────────────────────────────────
  wrapper: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.textSecondary,
  },
  required: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  inputContainer: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    justifyContent: 'center',
    height: 50,
  },
  inputText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textPrimary,
  },
  inputWithIcon: { paddingRight: 44 },
  rightIconWrapper: {
    position: 'absolute',
    right: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Modal ────────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CALENDAR_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },

  // ── Header banner ────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 4,
  },
  headerYear: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.5,
  },
  headerDate: {
    color: '#fff',
    fontSize: 28,
    fontFamily: FontFamily.black,
    letterSpacing: 0.2,
  },

  // ── Month nav ────────────────────────────────────────────────────────────
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  navArrow: {
    color: Colors.primary,
    fontSize: 22,
    fontFamily: FontFamily.bold,
    lineHeight: 26,
    includeFontPadding: false,
  },
  monthLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.3,
  },

  // ── Day labels ───────────────────────────────────────────────────────────
  dayLabelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 6,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dayInner: {
    width: DAY_SIZE - 6,
    height: DAY_SIZE - 6,
    borderRadius: (DAY_SIZE - 6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: FontFamily.medium,
    lineHeight: 16,
    includeFontPadding: false,
  },
  dayTextSelected: {
    color: '#fff',
    fontFamily: FontFamily.bold,
  },
  dayTextToday: {
    color: Colors.primary,
    fontFamily: FontFamily.bold,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.8,
  },
  confirmBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  confirmText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.8,
  },
});
