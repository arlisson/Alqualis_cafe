import React from 'react';
import {
  View
} from 'react-native';
import HeaderTitle from '../components/personalizados/headerTtitle';
import Cores from '../constants/Cores';
import Botao from '../components/personalizados/Botao';
import ViewCenter from '../components/personalizados/ViewCenter'
import { router } from 'expo-router';
/**
 * 
 * @description Tela inicial do APP
 */
export default function Index() {  

  

  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle texto='Gestão do Café' />
      <ViewCenter>
         <Botao texto='Gestão do Produtor' foto='person-outline'
          cor={Cores.marrom}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{produtor:true, titulo:'Gestão do Produtor'}})}
          />
          <Botao texto='Gestão da Plantação' foto='leaf-outline'
          cor={Cores.azul}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{plantacao:true, titulo:'Gestão da Plantação'}})}
          />
          <Botao texto='Outras Gestões' foto='file-tray-stacked-outline'
          cor={Cores.oliva}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{outros:true, titulo:'Outras Gestões'}})}
          /> 
          <Botao texto='Funções' foto='cog-outline'
          cor={Cores.caramelo}
          onPress={() => router.push({pathname:'(telas)/TelaInicial',params:{funcao:true, titulo:'Funções'}})}
          />            

         
      </ViewCenter>
      
    </View>
  );
}

