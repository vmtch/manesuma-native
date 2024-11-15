import React from 'react';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DFF2EB',
        borderRadius: 5,
        width: '100%',
        height: 130,
        padding: 10,
        backgroundColor: '#DFF2EB'
    },
    flexContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    imageContainer: {
        flex: 1,
        height: '100%',
        backgroundColor: '#30F2EB'
    },
    image: {
        flex: 1,
    },
    textContainer: {
        flex: 1,
        height: '100%',
        backgroundColor: '#99F200'
    },
});

export default styles;