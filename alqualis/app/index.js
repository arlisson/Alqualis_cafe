import React from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import HeaderTitle from '../components/personalizados/headerTtitle';
import Cores from '../constants/Cores';

export default function Index() {
  
  
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto=' Gestão do Café' />
    
    </View>
  );
}

