import { useState, useRef, useEffect } from 'react';
import { Text, View, AppState } from "react-native";
import ConcentrateModeButton from '@/components/ConcentrateModeButton';
import * as Notifications from 'expo-notifications';
import styles from './indexStyles';

export default function App() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [isVisible, setIsVisible] = useState(false);
  const [isSmartPhoneMode, setIsSmartPhoneMode] = useState(false);
  const [isConcentrateMode, setIsConcentrateMode] = useState(false);
  const [totalSmartPhoneTime, setTotalSmartPhoneTime] = useState(0);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [totalConcentrateTime, setTotalConcentrateTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  // AppState EventListener
  useEffect(() => {
    const subscription = AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const _handleAppStateChange = (nextAppState : any) => {
    // activeになったとき
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      setIsSmartPhoneMode(false);
    }

    // backgroundになったとき
    if (
      appState.current.match(/active|inactive/) &&
      nextAppState === "background"
    ) {
      console.log("App has come to the background!");
      setIsConcentrateMode((prevIsConcentrate) => {
        if (prevIsConcentrate)
        {
          setIsSmartPhoneMode(true);
        }
        return prevIsConcentrate;
      })
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log("AppState", appState.current);
    setIsConcentrateMode((prevIsConcentrate) => {
      console.log("IsConcentrate", prevIsConcentrate);
      return prevIsConcentrate;
    })
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isConcentrateMode) {
      const startTime = Date.now();

      interval = setInterval(() => {
        const currentTime = Date.now();
        if (!isSmartPhoneMode)
          setTotalConcentrateTime(currentTime - startTime + totalConcentrateTime);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConcentrateMode, isSmartPhoneMode]);

  useEffect(() => {
    setBreakTime(totalConcentrateTime * 0.25 - totalSmartPhoneTime);
  }, [totalConcentrateTime, totalSmartPhoneTime])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSmartPhoneMode) {
      const startTime = Date.now();

      interval = setInterval(() => {
        const currentTime = Date.now();
        setTotalSmartPhoneTime(currentTime - startTime + totalSmartPhoneTime);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSmartPhoneMode]);

  useEffect(() => {
    if (!isConcentrateMode) {
      //setTotalSmartPhoneTime(0);
      setIsNotificationSent(false);
    }
  }, [isConcentrateMode]);

  useEffect(() => {
    if (0 > breakTime && !isNotificationSent) {
      issueNotification();
      //setIsNotificationSent(true);
    }
    else if(breakTime > 0) {
      setIsNotificationSent(false);
    }
  }, [breakTime]);
  
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification permission status:', status);
    })();
  }, []);

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
    if (!isConcentrateMode) {
      return;
    }
    setIsSmartPhoneMode(!isSmartPhoneMode);
  };


  const handleBreakTimeChange = (text: string) => {
    const time = parseInt(text, 10);
    if (!isNaN(time)) {
      setBreakTime(time * 1000); // 秒をミリ秒に変換
    }
  };

  return (
    <View style={styles.container}>
      {/* 集中モードボタン */}
      <ConcentrateModeButton isConcentrateMode={isConcentrateMode} setIsConcentrateMode={setIsConcentrateMode}/>

      <View>
        <Text>
          累計集中時間{' '}
          {new Date(totalConcentrateTime).toISOString().slice(11, 19)}
        </Text>
      </View>
      <View>
        <Text>
          持ちスマホタイム{' '}
          {breakTime >= 0 ? new Date(breakTime).toISOString().slice(11, 19) : "なし"}
        </Text>
      </View>
      <View>
        <Text>
          累計スマホタイム{' '}
          {new Date(totalSmartPhoneTime).toISOString().slice(11, 19)}
        </Text>
      </View>

      {/* <View>
        <Text>通知内容: {notification?.request.content.title} - {notification?.request.content.body}</Text>
      </View> */}
    </View>
  );
}