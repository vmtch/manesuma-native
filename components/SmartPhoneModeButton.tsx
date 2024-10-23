import type { PropsWithChildren } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
type Props = PropsWithChildren<{
  isSmartPhoneMode:boolean;
  setIsSmartPhoneMode: Function;
  isConcentrateMode: boolean;
}>;

export default function SmartPhoneModeButton({ children, isSmartPhoneMode, setIsSmartPhoneMode, isConcentrateMode }: Props) {
    // 集中モードがオフになったらスマホモードもオフにする
    if (!isConcentrateMode) {
        setIsSmartPhoneMode(false);
    }

    // 集中モードがオンのときのみスマホモードのオンオフ切り替えを行う
  const toggleSmartPhoneMode = () => {
    if(isConcentrateMode){
        setIsSmartPhoneMode(!isSmartPhoneMode);
    }
  };

  return (
    <TouchableOpacity
        onPress={toggleSmartPhoneMode}
        style={[
          styles.smartphoneButton,
          isSmartPhoneMode ? styles.smartphoneButtonActive : null,
        ]}
      >
        <Text>スマホモード: {isSmartPhoneMode ? 'オン' : 'オフ'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    smartphoneButton: {
        marginBottom: 10,
        backgroundColor: '#FF9800',
        padding: 10,
        borderRadius: 5,
    },
    smartphoneButtonActive: {
        backgroundColor: '#F57C00',
    },
});