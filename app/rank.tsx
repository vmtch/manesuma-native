import { useState, useRef, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { Text, View, Image } from "react-native";
import styles from './rankStyles';

type Props = PropsWithChildren<{
    time: number;
  }>;

export default function Rank({ children, time } : Props) {
    const [rank, setRank] = useState(0);

    useEffect(() => {
    }, [])

    useEffect(() => {
        if(time / 10000 < 4)
            setRank(Math.floor(time / 10000));
    }, [time]);

    function rankImage() {
        switch(rank){
            case 0:
                return <Image source={require('@/assets/images/rank/bronze.png')} resizeMode='stretch' style={styles.image}></Image>
            case 1:
                return <Image source={require('@/assets/images/rank/silver.png')} resizeMode='stretch' style={styles.image}></Image>
            case 2:
                return <Image source={require('@/assets/images/rank/gold.png')} resizeMode='stretch' style={styles.image}></Image>
            case 3:
                return <Image source={require('@/assets/images/rank/blue.png')} resizeMode='stretch' style={styles.image}></Image>
            default:
                return <Text>Error</Text>    
        }
        
    }

    return (
        <View style={styles.container}>
            <View style={styles.flexContainer}>
                <View style={styles.imageContainer}>{rankImage()}</View>
                <View style={styles.textContainer}><Text>{'ランク' + rank}</Text></View>
            </View>
        </View>
    )
}