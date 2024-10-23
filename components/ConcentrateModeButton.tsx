import type { PropsWithChildren } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
type Props = PropsWithChildren<{
  isConcentrateMode: boolean;
  setIsConcentrateMode: Function;
}>;

export default function ConcentrateModeButton({ children, isConcentrateMode, setIsConcentrateMode }: Props) {
  const toggleConcentrate = () => {
    setIsConcentrateMode(!isConcentrateMode);
  };

  return (
    <TouchableOpacity
        onPress={toggleConcentrate}
        style={[
          styles.centerButton,
          isConcentrateMode ? styles.centerButtonActive : null,
        ]}
      >
        <Text>集中モード: {isConcentrateMode ? 'オン' : 'オフ'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    centerButton: {
      marginBottom: 10,
      backgroundColor: '#8BC34A',
      padding: 10,
      borderRadius: 5,
    },
    centerButtonActive: {
      backgroundColor: '#558B2F',
    }
  });
  