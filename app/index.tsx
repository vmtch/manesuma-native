import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Subscription } from 'expo-modules-core';

// ハンドラーを設定する
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    //通知を受け取る時に音が鳴らさないようにしたいなら、
    //shouldPlaySoundをfalseにして下さい。
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSmartPhoneMode, setIsSmartPhoneMode] = useState(false);
  const [isConcentrate, setIsConcentrate] = useState(false);
  const [milliseconds, setMilliseconds] = useState(0);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [totalConcentrateTime, setTotalConcentrateTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isConcentrate) {
      const startTime = Date.now();

      interval = setInterval(() => {
        const currentTime = Date.now();
        setTotalConcentrateTime(currentTime - startTime);
        console.log("a")
      }, 100);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConcentrate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSmartPhoneMode) {
      const startTime = Date.now() - milliseconds;

      interval = setInterval(() => {
        const currentTime = Date.now();
        setMilliseconds(currentTime - startTime);
      }, 100);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSmartPhoneMode]);

  useEffect(() => {
    if (!isConcentrate) {
      setMilliseconds(0);
      setIsNotificationSent(false);
    }
  }, [isConcentrate]);

  useEffect(() => {
    if (milliseconds > breakTime && !isNotificationSent) {
      issueNotification();
      setIsNotificationSent(true);
    }
  }, [milliseconds]);

  useEffect(() => {
    // 通知を受信した際に通知内容を設定する
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // 通知の応答をログに表示する
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // クリーンアップ
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const showPermissionRequest = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission status:', status);
  };

  const issueNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('通知の許可がありません');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '休憩時間の超過',
        body: '休憩時間が過ぎました',
      },
      trigger: null, // 即時通知
    });
  };

  const toggleSmartPhoneMode = () => {
    if (!isConcentrate) {
      return;
    }
    setIsSmartPhoneMode(!isSmartPhoneMode);
  };

  const toggleConcentrate = () => {
    setIsConcentrate(!isConcentrate);
    setIsSmartPhoneMode(false);
  };

  const handleBreakTimeChange = (text: string) => {
    const time = parseInt(text, 10);
    if (!isNaN(time)) {
      setBreakTime(time * 1000); // 秒をミリ秒に変換
    }
  };

  return (
    <View style={styles.container}>
      <Text>{totalConcentrateTime}</Text>
      {/* 通知の権限ボタン */}
      <TouchableOpacity onPress={showPermissionRequest} style={styles.bellButton}>
        <Text>通知の権限</Text>
      </TouchableOpacity>

      {/* 集中モードボタン */}
      <TouchableOpacity
        onPress={toggleConcentrate}
        style={[
          styles.centerButton,
          isConcentrate ? styles.centerButtonActive : null,
        ]}
      >
        <Text>集中モード: {isConcentrate ? 'オン' : 'オフ'}</Text>
      </TouchableOpacity>

      {/* スマホモードボタン */}
      <TouchableOpacity
        onPress={toggleSmartPhoneMode}
        style={[
          styles.smartphoneButton,
          isSmartPhoneMode ? styles.smartphoneButtonActive : null,
        ]}
      >
        <Text>スマホモード: {isSmartPhoneMode ? 'オン' : 'オフ'}</Text>
      </TouchableOpacity>

      <View>
        <Text>
          残りスマホタイム{' '}
          {breakTime - milliseconds > 0
            ? ((breakTime - milliseconds) / 1000).toFixed(0) + '秒'
            : 'なし'}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text>休憩時間 (秒): </Text>
        <TextInput
          keyboardType="numeric"
          onChangeText={handleBreakTimeChange}
          placeholder="休憩時間を入力"
          editable={!isConcentrate}
          style={styles.input}
        />
      </View>

      {/* <View>
        <Text>通知内容: {notification?.request.content.title} - {notification?.request.content.body}</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  bellButton: {
    marginBottom: 10,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  centerButton: {
    marginBottom: 10,
    backgroundColor: '#8BC34A',
    padding: 10,
    borderRadius: 5,
  },
  centerButtonActive: {
    backgroundColor: '#558B2F',
  },
  smartphoneButton: {
    marginBottom: 10,
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 5,
  },
  smartphoneButtonActive: {
    backgroundColor: '#F57C00',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    width: 100,
    marginLeft: 5,
  },
});
