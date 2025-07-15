import React from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter'
import { router, useLocalSearchParams } from 'expo-router';

export default function TelaInicial() {  
    const {produtor=false, plantacao=false , outros=false, titulo} = useLocalSearchParams()
    
  return (
    <View style={{flex: 1, backgroundColor:Cores.verde }}>
      <HeaderTitle  texto={titulo} voltar={true} home = {true}/>
      <ViewCenter>
        {produtor &&
            <>
                <Botao texto='Cadastrar Produtor' foto='person-add-outline'
                cor={Cores.marrom}
                onPress={() => router.push('(telas)/CadastrarProdutor')}
                />
                <Botao texto='Visualizar Produtor' foto='eye-outline'
                cor={Cores.marrom}
                onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Produtor', id: '1' } })}
                />
            </>
        }
        
        {plantacao &&
        <>
            <Botao texto='Cadastrar Plantação' foto='leaf-outline'
            cor={Cores.azul}
            onPress={() => router.push('(telas)/CadastrarPlantacao')}
            />
            <Botao texto='Visualizar Plantação' foto='eye-outline'
            cor={Cores.azul}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Plantação', id: '2', cor:Cores.azul } })}
            />
        
        </>
        }
        
        {outros &&
        <>
            <Botao texto='Cadastrar Cooperativa' foto='storefront-outline'
            cor={Cores.caramelo}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Cooperativa', id: '1' } })}
            />
            <Botao texto='Visualizar Cooperativas' foto='eye-outline'
            cor={Cores.caramelo}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Cooperativa', id: '3',cor:Cores.caramelo } })}
            />

            <Botao texto='Cadastrar Município' foto='business-outline'
            cor={Cores.verdeMusgo}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Município', id: '2' } })}
            />
            <Botao texto='Visualizar Município' foto='eye-outline'
            cor={Cores.verdeMusgo}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Município', id: '4',cor:Cores.verdeMusgo } })}
            />

            <Botao texto='Cadastrar Comunidade' foto='people-outline'
            cor={Cores.terracota}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Comunidade', id: '3' } })}
            />
            <Botao texto='Visualizar Comunidades' foto='eye-outline'
            cor={Cores.terracota}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Comunidade', id: '5',cor:Cores.terracota } })}
            />

            <Botao texto='Cadastrar Face de Exposição' foto='sunny-outline'
            cor={Cores.oliva}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Face de Exposição', id: '4' } })}
            />
            <Botao texto='Visualizar Face de Exposição' foto='eye-outline'
            cor={Cores.oliva}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Face de Exposição', id: '6',cor:Cores.oliva } })}
            />

            <Botao texto='Cadastrar Variedade' foto='eyedrop-outline'
            cor={Cores.vinho}
            onPress={() => router.push({ pathname: '(telas)/OutrosCadastros', params: { label: 'Variedade', id: '5' } })}
            />
            <Botao texto='Visualizar Variedade' foto='eye-outline'
            cor={Cores.vinho}
            onPress={() => router.push({ pathname: '(telas)/Visualizar', params: { titulo: 'Variedade', id: '7',cor: Cores.vinho } })}
            />
        
        </>
        }        
       
      </ViewCenter>
      
    </View>
  );
}

