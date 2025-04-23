import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../utils/theme';

export const Tooltip = ({
  children,
  content,
  placement = 'bottom',
  offset = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [layout, setLayout] = useState(null);

  const handlePress = () => {
    setIsVisible(true);
  };

  const calculatePosition = () => {
    if (!layout) return {};

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const { x, y, width, height } = layout;

    const positions = {
      top: {
        top: y - offset,
        left: x + (width / 2),
        transform: [{ translateY: -40 }, { translateX: -100 }],
      },
      bottom: {
        top: y + height + offset,
        left: x + (width / 2),
        transform: [{ translateX: -100 }],
      },
      left: {
        top: y + (height / 2),
        left: x - offset,
        transform: [{ translateY: -20 }, { translateX: -200 }],
      },
      right: {
        top: y + (height / 2),
        left: x + width + offset,
        transform: [{ translateY: -20 }],
      },
    };

    return positions[placement];
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
      >
        {children}
      </TouchableOpacity>

      <Modal
        transparent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[
              styles.tooltip,
              calculatePosition(),
            ]}
          >
            <View style={[styles.arrow, styles[`arrow${placement}`]]} />
            <Text style={styles.content}>{content}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: 200,
    ...theme.shadows.medium,
  },
  content: {
    color: theme.colors.text,
    fontSize: 14,
  },
  arrow: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: theme.colors.surface,
  },
  arrowtop: {
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -6 }, { rotate: '45deg' }],
  },
  arrowbottom: {
    top: -6,
    left: '50%',
    transform: [{ translateX: -6 }, { rotate: '45deg' }],
  },
  arrowleft: {
    right: -6,
    top: '50%',
    transform: [{ translateY: -6 }, { rotate: '45deg' }],
  },
  arrowright: {
    left: -6,
    top: '50%',
    transform: [{ translateY: -6 }, { rotate: '45deg' }],
  },
});