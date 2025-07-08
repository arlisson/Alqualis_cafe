import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TextInput, Modal, TouchableOpacity, FlatList, Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

export default function CadastrarPlantacao() {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [mesesSelecionados, setMesesSelecionados] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');

  /**
   * Alterna a seleção de um mês. Adiciona se não existir, remove se já estiver selecionado.
   * @param {string} mes - Mês a ser alternado na lista.
   */
  const toggleMes = (mes) => {
    setMesesSelecionados((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
    );
  };

  /**
   * Remove o último mês adicionado na lista de meses selecionados.
   */
  const removerUltimoMes = () => {
    setMesesSelecionados((prev) => prev.slice(0, -1));
  };

  /**
   * Limpa todos os meses da lista de selecionados.
   */
  const limparTodosMeses = () => {
    setMesesSelecionados([]);
  };

  /**
   * Pega a localização atual do usuário usando GPS e preenche latitude, longitude e altitude.
   */
  const pegarLocalizacao = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização nas configurações do dispositivo.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude.toFixed(6));
      setLongitude(location.coords.longitude.toFixed(6));
      setAltitude(location.coords.altitude?.toFixed(2) || 'N/A');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
      console.error(error);
    }
  };

  /**
   * Solicita permissão e abre o modal com o mapa centrado na localização atual do usuário.
   */
  const abrirMapa = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à localização nas configurações.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapVisible(true);
  };

  /**
   * Define a localização escolhida ao clicar no mapa e fecha o modal.
   * @param {Object} e - Evento de clique no mapa.
   */
  const selecionarLocalizacao = (e) => {
    const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(lon.toFixed(6));
    setAltitude('N/A');
    setMapVisible(false);
  };

  const mesesFormatados = mesesSelecionados.join(', ');

  /**
   * Renderiza um item da lista de meses para seleção.
   * @param {Object} item - Item contendo o nome do mês.
   * @returns {JSX.Element} Componente TouchableOpacity com o nome do mês.
   */
  const renderMeses = ({ item }) => (
    <TouchableOpacity onPress={() => toggleMes(item)} style={styles.mesItem}>
      <Text style={{ color: mesesSelecionados.includes(item) ? 'blue' : 'black' }}>{item}</Text>
    </TouchableOpacity>
  );


  const handleSalvar =()=>{
    console.log('OLá')
  };
  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde, paddingBottom: RFValue(30) }}>
      <HeaderTitle texto='Cadastrar Plantação' voltar='true' home='true' />
      <ViewCenter>
        <Label label='Nome da propriedade' input={true} />
        <Label label='Nome do Talhão' input={true} />
        <Label label='Produtor' dropdown={true} />
        <Label label='Variedade Plantada' dropdown={true} />
        <Label label='Comunidade' dropdown={true} />
        <Label label='Município' dropdown={true} />

        <Label label='Latitude' input={true} horizontal={true} value={latitude} onChangeText={setLatitude} />
        <Label label='Longitude' input={true} horizontal={true} value={longitude} onChangeText={setLongitude} />
        <Label label='Altitude' input={true} horizontal={true} value={altitude} onChangeText={setAltitude} />

        <Botao texto='Pegar localização' foto='pin-outline' onPress={pegarLocalizacao} />
        <Botao texto='Selecionar no mapa' foto='map-outline' onPress={abrirMapa} />

        <View style={styles.labelMesesContainer}>
          <Text style={styles.labelMeses}>Meses de Colheita</Text>
          <View style={styles.inputIconContainer}>
            <TextInput
              style={styles.inputMeses}
              placeholder="Meses de Colheita"
              value={mesesFormatados}
              editable={false}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="calendar-outline" size={RFValue(20)} color="#000" />
            </TouchableOpacity>
            {mesesSelecionados.length > 0 && (
              <TouchableOpacity onPress={removerUltimoMes} style={{ marginLeft: 10 }}>
                <Ionicons name="backspace-outline" size={20} color="#cc0000" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione os meses</Text>
              <FlatList
                data={meses}
                keyExtractor={(item) => item}
                renderItem={renderMeses}
              />
              <TouchableOpacity onPress={limparTodosMeses} style={styles.btnLimpar}>
                <Text style={{ color: '#cc0000' }}>Limpar Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnFechar}>
                <Text style={{ color: 'white' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={mapVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            {mapRegion && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={mapRegion}
                onPress={selecionarLocalizacao}
              >
                <Marker coordinate={{
                  latitude: parseFloat(latitude) || mapRegion.latitude,
                  longitude: parseFloat(longitude) || mapRegion.longitude,
                }} />
              </MapView>
            )}
            <TouchableOpacity onPress={() => setMapVisible(false)} style={{ padding: 15, backgroundColor: 'black' }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>Fechar mapa</Text>
            </TouchableOpacity>
          </View>
        </Modal>

      </ViewCenter>
      <Botao texto='Salvar' onPress={()=>handleSalvar()}/>
    </View>
  );
}

const styles = StyleSheet.create({
  labelMesesContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: RFValue(12),
  },
  labelMeses: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: RFValue(6),
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: RFValue(10),
    backgroundColor: '#fff',
    height: RFValue(40),
    justifyContent: 'space-between',
  },
  inputMeses: {
    flex: 1,
    fontSize: RFValue(14),
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mesItem: {
    paddingVertical: 10,
  },
  btnFechar: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  btnLimpar: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cc0000',
  },
});