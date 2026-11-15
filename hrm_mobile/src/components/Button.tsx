import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  let bg = Colors.primary;
  let textColor = Colors.textInverse;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bg = Colors.primaryMuted;
    textColor = Colors.primary;
  } else if (variant === 'danger') {
    bg = Colors.danger;
    textColor = Colors.textInverse;
  } else if (variant === 'success') {
    bg = Colors.success;
    textColor = Colors.textInverse;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textColor = Colors.textPrimary;
    borderColor = Colors.border;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'outline' ? 1 : 0 },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor, marginLeft: icon ? Spacing.sm : 0 }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  disabled: {
    opacity: 0.5,
  },
});
