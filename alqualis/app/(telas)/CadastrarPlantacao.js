import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import HeaderTitle from '../../components/personalizados/headerTtitle';
import Cores from '../../constants/Cores';
import Botao from '../../components/personalizados/Botao';
import ViewCenter from '../../components/personalizados/ViewCenter';
import Label from '../../components/personalizados/Label';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  buscarRegistrosGenericos,
  inserirPlantacao,
  buscarPlantacaoPorId,
  atualizarPlantacao,
  excluirPlantacao
} from '../../database/database';
import { router, useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';


export default function CadastrarPlantacao() {
  const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

  const [formSubmitted, setFormSubmitted] = useState(false); // NOVO

  const [facesRows, setFacesRows] = useState([]);
  const [facesOptions, setFacesOptions] = useState([]);
  const [produtoresOptions, setProdutoresOptions] = useState([]);
  const [variedadesOptions, setVariedadesOptions] = useState([]);
  const [comunidadesOptions, setComunidadesOptions] = useState([]);
  const [municipiosOptions, setMunicipiosOptions] = useState([]);

  const {id_plantacao} = useLocalSearchParams();
  /**
   * @description UseEffect para recuperar os dados de uma plantação para edição
   */
  useEffect(() => {
  if (
    !id_plantacao ||
    produtoresOptions.length === 0 ||
    variedadesOptions.length === 0 ||
    comunidadesOptions.length === 0 ||
    municipiosOptions.length === 0 ||
    facesRows.length === 0
  ) return;

  (async () => {
    try {
      const resultado = await buscarPlantacaoPorId(Number(id_plantacao));
      const dados = Array.isArray(resultado) ? resultado[0] : resultado;
      //console.log(dados)
      if (!dados) return;

      // Nome e localização
      setNomePropriedade(dados.nome_plantacao || '');
      setNomeTalhao(dados.nome_talhao || '');
      setLatitude(dados.latitude || '');
      setLongitude(dados.longitude || '');
      setAltitude(dados.altitude_media || '');

      // Meses
      setMesesSelecionados(dados.meses_colheita || []);

      // Faces de exposição: busca os nomes a partir dos IDs
      const nomesFaces = facesRows
        .filter(f => dados.faces.includes(f.id_face_exposicao))
        .map(f => f.nome_face_exposicao);
      setFacesSelecionadas(nomesFaces);

      // Dropdowns
      const safeFind = (lista, id) =>
        lista.find(item => item.value === id.toString()) || { label: '', value: id.toString() };

      setProdutor(safeFind(produtoresOptions, dados.id_produtor));
      setVariedade(safeFind(variedadesOptions, dados.id_variedade));
      setComunidade(safeFind(comunidadesOptions, dados.id_comunidade));
      setMunicipio(safeFind(municipiosOptions, dados.id_municipio));

    } catch (error) {
      //console.error('Erro ao carregar dados da plantação:', error);
      Alert.alert('Erro', `Não foi possível carregar os dados da plantação.\n${error}`);
    }
  })();
}, [
  id_plantacao,
  produtoresOptions,
  variedadesOptions,
  comunidadesOptions,
  municipiosOptions,
  facesRows
]);



  useEffect(() => {
    (async () => {
      try {
        const faces = await buscarRegistrosGenericos('face_exposicao');
        setFacesRows(faces);
        setFacesOptions(faces.map(f => f.nome_face_exposicao));

        const produtores = await buscarRegistrosGenericos('produtor');
        setProdutoresOptions(produtores.map(p => ({ label: p.nome_produtor, value: p.id_produtor.toString() })));

        const variedades = await buscarRegistrosGenericos('variedade');
        setVariedadesOptions(variedades.map(v => ({ label: v.nome_variedade, value: v.id_variedade.toString() })));

        const comunidades = await buscarRegistrosGenericos('comunidade');
        setComunidadesOptions(comunidades.map(c => ({ label: c.nome_comunidade, value: c.id_comunidade.toString() })));

        const municipios = await buscarRegistrosGenericos('municipio');
        setMunicipiosOptions(municipios.map(m => ({ label: m.nome_municipio, value: m.id_municipio.toString() })));
      } catch (e) {
        //console.error('Erro ao carregar opções:', e);
        Alert.alert('Erro', `Não foi possível carregar dados iniciais.\n${e}`);
      }
    })();
  }, []);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [mesesSelecionados, setMesesSelecionados] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');
  const [nomePropriedade, setNomePropriedade] = useState('');
  const [nomeTalhao, setNomeTalhao] = useState('');
  const [produtor, setProdutor] = useState(null);
  const [variedade, setVariedade] = useState(null);
  const [comunidade, setComunidade] = useState(null);
  const [municipio, setMunicipio] = useState(null);
  const [facesSelecionadas, setFacesSelecionadas] = useState([]);

  const verificaConexao = async ()=>{
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Alert.alert('Sem conexão com a internet', 'Verifique sua conexão e tente novamente.');
    }
  };

  const pegarLocalizacao = async () => {
    verificaConexao();

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão negada');
    }

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
      setAltitude(loc.coords.altitude?.toFixed(2) ?? 'N/A');
    } catch (error) {
      Alert.alert('Erro ao obter localização', error.message || 'Tente novamente.');
    }
  };


  const abrirMapa = async () => {

    verificaConexao();

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão negada');
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setMapRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapVisible(true);
  };

  const selecionarLocalizacao = e => {
    const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(lon.toFixed(6));
    setAltitude('N/A');
    setMapVisible(false);
  };

  const handleSalvar = async () => {
    setFormSubmitted(true); // ATIVA ERROS

    if (!nomePropriedade.trim() || !nomeTalhao.trim() || !produtor || !variedade || !comunidade || !municipio) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const facesIds = facesSelecionadas
        .map(nome => facesRows.find(f => f.nome_face_exposicao === nome))
        .filter(Boolean)
        .map(f => f.id_face_exposicao);

      const newId = await inserirPlantacao({
        id_produtor: parseInt(produtor.value, 10),
        id_variedade: parseInt(variedade.value, 10),
        id_comunidade: parseInt(comunidade.value, 10),
        id_municipio: parseInt(municipio.value, 10),
        nome_plantacao: nomePropriedade.toUpperCase(),
        latitude,
        longitude,
        altitude_media: altitude,
        nome_talhao: nomeTalhao.toUpperCase(),
        faces: facesIds,
        meses_colheita: mesesSelecionados,

      });

      if (newId) {
        setNomePropriedade('');
        setNomeTalhao('');
        setProdutor(null);
        setVariedade(null);
        setComunidade(null);
        setMunicipio(null);
        setFacesSelecionadas([]);
        setMesesSelecionados([]);
        setLatitude('');
        setLongitude('');
        setAltitude('');
        setFormSubmitted(false);
      }
    } catch (e) {
      //console.error(e);
      Alert.alert('Erro',`${e}`)
    }
  };

  const handleAtualizar = async () => {
  setFormSubmitted(true); // ativa mensagens de erro nos campos obrigatórios

  if (!nomePropriedade.trim() || !nomeTalhao.trim() || !produtor || !variedade || !comunidade || !municipio) {
    Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
    return;
  }

  try {
    const facesIds = facesSelecionadas
      .map(nome => facesRows.find(f => f.nome_face_exposicao === nome))
      .filter(Boolean)
      .map(f => f.id_face_exposicao);

    const sucesso = await atualizarPlantacao({
      id_plantacao: Number(id_plantacao),
      id_produtor: parseInt(produtor.value, 10),
      id_variedade: parseInt(variedade.value, 10),
      id_comunidade: parseInt(comunidade.value, 10),
      id_municipio: parseInt(municipio.value, 10),
      nome_plantacao: nomePropriedade.toUpperCase(),
      latitude,
      longitude,
      altitude_media: altitude,
      nome_talhao: nomeTalhao.toUpperCase(),
      faces: facesIds,
      meses_colheita: mesesSelecionados,
    });

    if (sucesso) {
      router.back(); // volta para a tela anterior após sucesso
    }

  } catch (e) {
    //console.error('Erro ao atualizar plantação:', e);
    Alert.alert('Erro', `Não foi possível atualizar a plantação.\n${e}`);
  }
};

const handleExcluir = async () => {
  Alert.alert(
    'Confirmar exclusão',
    'Tem certeza que deseja excluir esta plantação?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const sucesso = await excluirPlantacao(Number(id_plantacao));
            if (sucesso) {
              router.back(); // volta para a tela anterior
            }
          } catch (error) {
            //console.error('Erro ao excluir plantação:', error);
            Alert.alert('Erro', `Não foi possível excluir a plantação.\n${error}`);
          }
        },
      },
    ]
  );
};

  return (
    <View style={{ flex: 1, backgroundColor: Cores.verde, paddingBottom: RFValue(30) }}>
      {id_plantacao &&
       <HeaderTitle texto='Editar Plantação' voltar='true' home='true' />
      }
      {!id_plantacao &&
       <HeaderTitle texto='Cadastrar Plantação' voltar='true' home='true' />
      }
      <ViewCenter>
        <Label
          label='Nome da propriedade'
          input
          onChangeText={setNomePropriedade}
          value={nomePropriedade}
          required
          showError={formSubmitted}
        />
        <Label
          label='Nome do Talhão'
          input
          onChangeText={setNomeTalhao}
          value={nomeTalhao}
          required
          showError={formSubmitted}
        />
        <Label
          label="Face de Exposição"
          selectableInput
          options={facesOptions}
          mainIconName="compass-outline"
          value={facesSelecionadas}
          onChangeText={setFacesSelecionadas}
        />
        <Label
          label='Produtor'
          dropdown
          data={produtoresOptions}
          value={produtor}
          onChangeText={setProdutor}
          required
          showError={formSubmitted}
        />
        <Label
          label='Variedade'
          dropdown
          data={variedadesOptions}
          value={variedade}
          onChangeText={setVariedade}
          required
          showError={formSubmitted}
        />
        <Label
          label='Comunidade'
          dropdown
          data={comunidadesOptions}
          value={comunidade}
          onChangeText={setComunidade}
          required
          showError={formSubmitted}
        />
        <Label
          label='Município'
          dropdown
          data={municipiosOptions}
          value={municipio}
          onChangeText={setMunicipio}
          required
          showError={formSubmitted}
        />
        <Label
          label='Latitude'
          horizontal
          input
          value={latitude}
          onChangeText={setLatitude}
          
        />
        <Label
          label='Longitude'
          horizontal
          input
          value={longitude}
          onChangeText={setLongitude}
        />
        <Label
          label='Altitude'
          horizontal
          input
          value={altitude}
          onChangeText={setAltitude}
        />
        <Botao texto='Pegar localização' foto='pin-outline' onPress={pegarLocalizacao} />
        <Botao texto='Selecionar no mapa' foto='map-outline' onPress={abrirMapa} />

        <Label
          label="Meses de Colheita"
          selectableInput
          options={meses}
          value={mesesSelecionados}
          onChangeText={setMesesSelecionados}
          mainIconName="calendar-outline"
        />

        <Modal visible={mapVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            {mapRegion && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={mapRegion}
                onPress={selecionarLocalizacao}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(latitude) || mapRegion.latitude,
                    longitude: parseFloat(longitude) || mapRegion.longitude,
                  }}
                />
              </MapView>
            )}
            <TouchableOpacity
              onPress={() => setMapVisible(false)}
              style={{ padding: 15, backgroundColor: 'black' }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Fechar mapa
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ViewCenter>
      {!id_plantacao &&
        <Botao texto='Salvar' onPress={handleSalvar} /> 
      }     
      
      {id_plantacao &&
      <>
        <Botao texto='Editar' onPress={handleAtualizar} cor={Cores.azul} foto = 'create-outline'/> 
        <Botao texto='Excluir' onPress={handleExcluir} cor={Cores.vermelho} foto='trash-outline' /> 
      </>
      }  
    </View>
  );
}
