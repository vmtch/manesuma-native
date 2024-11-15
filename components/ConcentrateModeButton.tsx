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
      width: 250,
      aspectRatio: 1,
      marginBottom: 10,
      backgroundColor: '#B9E5E8',
      padding: 10,
      borderRadius: 125,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerButtonActive: {
      backgroundColor: '#7AB2D3',
    }
  });
  