import { useState, useRef, useEffect } from 'react';
import { Text, View, AppState, Button } from "react-native";
import ConcentrateModeButton from '@/components/ConcentrateModeButton';
import * as Notifications from 'expo-notifications';
import styles from './indexStyles';
import Rank from './rank';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const appState = useRef(AppState.currentState); // アプリの状態（アクティブかバックグラウンドか）
  const [isSmartPhoneMode, setIsSmartPhoneMode] = useState(false); // スマホモード
  const [isConcentrateMode, setIsConcentrateMode] = useState(false); // 集中モード
  const [totalSmartPhoneTime, setTotalSmartPhoneTime] = useState(0); // 累計スマホタイム
  const [allowedSmartPhoneTime, setAllowedSmartPhoneTime] = useState(0); // 持ちスマホタイム　増減する
  const [totalConcentrateTime, setTotalConcentrateTime] = useState(0); // 累計集中時間
  const [isNotificationSent, setIsNotificationSent] = useState(false); // 通知の無限発行防止フラグ

  // データ保存のヘルパ
  async function storeData(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch(err) {
      console.error(err);
    }
  }

  // データ取得のヘルパ
  async function getData(key: string) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch(err){
      console.error(err);
    }
  }

  // 累計集中時間の引き継ぎ
  useEffect(() => {
    (async () => {
      const t = await getData('totalConcentrateTime');
      setTotalConcentrateTime(Number(t || 0));
    })();
  }, []);

  // 累計集中時間の保存
  useEffect(() => {
    (async () => {
      await storeData('totalConcentrateTime', String(totalConcentrateTime));
    })();
  }, [totalConcentrateTime])

  // アプリがアクティブかバックグラウンドかによってスマホモードを切り替え
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
      // 集中モードがオンならスマホモードをオンにする
      setIsConcentrateMode((prevIsConcentrate) => {
        if (prevIsConcentrate)
        {
          setIsSmartPhoneMode(true);
        }
        return prevIsConcentrate;
      })
    }
    appState.current = nextAppState;
    console.log("AppState", appState.current);
    setIsConcentrateMode((prevIsConcentrate) => {
      return prevIsConcentrate;
    })
  };

  // 累計集中時間の加算
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isConcentrateMode && !isSmartPhoneMode) {
      const startTime = Date.now();

      interval = setInterval(() => {
        const currentTime = Date.now();
        setTotalConcentrateTime(currentTime - startTime + totalConcentrateTime);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConcentrateMode, isSmartPhoneMode]);

  // 持ちスマホタイムを計算
  useEffect(() => {
    setAllowedSmartPhoneTime(totalConcentrateTime * 0.25 - totalSmartPhoneTime);
  }, [totalConcentrateTime, totalSmartPhoneTime])

  // 累計スマホタイムの加算
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

  // 集中モードの切り替え時の処理
  useEffect(() => {
    if (!isConcentrateMode) {
      //setTotalSmartPhoneTime(0);
      setIsNotificationSent(false);
    }
  }, [isConcentrateMode]);

  // スマホ使いすぎ通知の発行管理
  useEffect(() => {
    if (0 > allowedSmartPhoneTime && !isNotificationSent) {
      issueNotification();
      setIsNotificationSent(true); // コメントアウトすると持ちスマホタイムが負の限り無限に通知が来る
    }
    else if(allowedSmartPhoneTime > 0) {
      setIsNotificationSent(false);
    }
  }, [allowedSmartPhoneTime]);
  
  // 通知の設定
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  
  // 通知の権限の取得
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      //console.log('Notification permission status:', status);
    })();
  }, []);

  // 通知の発行を行う関数
  const issueNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      //console.log('通知の許可がありません');
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
          {allowedSmartPhoneTime >= 0 ? new Date(allowedSmartPhoneTime).toISOString().slice(11, 19) : "なし"}
        </Text>
      </View>
      <View>
        <Text>
          累計スマホタイム{' '}
          {new Date(totalSmartPhoneTime).toISOString().slice(11, 19)}
        </Text>
      </View>
      <Rank time={totalConcentrateTime}/>
      <Button title={'reset'} onPress={() => {setTotalConcentrateTime(0)}}></Button>
    </View>
  );
}