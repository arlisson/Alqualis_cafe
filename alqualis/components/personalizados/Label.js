import React, { useState, useEffect,useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import DropdownComponent from './DropDownComponent';
import stylesGeral from '../../assets/styles/stylesGeral';
import { buscarRegistrosGenericos } from '../../database/database';

const formatCPF = (value = '') => {
  const digits = value.replace(/\D+/g, '');
  const part1 = digits.substring(0, 3);
  const part2 = digits.length > 3 ? digits.substring(3, 6) : '';
  const part3 = digits.length > 6 ? digits.substring(6, 9) : '';
  const part4 = digits.length > 9 ? digits.substring(9, 11) : '';
  let formatted = part1;
  if (part2) formatted += `.${part2}`;
  if (part3) formatted += `.${part3}`;
  if (part4) formatted += `-${part4}`;
  return formatted;
};

/**
 * Componente Label
 * 
 * Componente reutilizável que renderiza um campo de formulário dinâmico (texto, dropdown ou seleção múltipla)
 * com suporte a máscaras, validação obrigatória, verificação de duplicidade e exibição em linha.
 *
 * @component
 * @param {String} label - Texto exibido como rótulo do campo.
 * @param {Boolean} [input=false] - Define se o campo será um input de texto simples.
 * @param {Boolean} [dropdown=false] - Define se o campo será um dropdown (combobox).
 * @param {Boolean} [selectableInput=false] - Define se o campo será um input de seleção múltipla com modal.
 * @param {Boolean} [horizontal=false] - Define se o campo será exibido na horizontal.
 * @param {String|null} [icon=null] - Nome do ícone exibido no campo (Ionicons).
 * @param {Function|null} [onIconPress=null] - Função chamada ao pressionar o ícone.
 * @param {String|Array} [value=''] - Valor do campo (String para input/dropdown, array para múltipla seleção).
 * @param {Function} onChangeText - Função chamada ao alterar o valor do campo.
 * @param {Array} [data=[]] - Dados utilizados no dropdown (lista de objetos com label e value).
 * @param {String|null} [mainIconName=null] - Ícone principal exibido no input de seleção múltipla.
 * @param {Function|null} [onPressMainIcon=null] - Função chamada ao pressionar o ícone principal do input múltiplo.
 * @param {JSX.Element|null} [extraIcon=null] - Ícone extra exibido ao lado do campo.
 * @param {Boolean|null} [modalVisible=null] - Controle externo de visibilidade do modal de múltipla seleção.
 * @param {Function|null} [setModalVisible=null] - Função para alterar a visibilidade do modal (modo controlado).
 * @param {Function|null} [renderModalContent=null] - Função personalizada para renderizar o conteúdo do modal.
 * @param {Array} [options=[]] - Lista de opções disponíveis para seleção múltipla.
 * @param {String|null} [mask=null] - Define a máscara de entrada. Suporta: 'cpf' ou 'noSpaces'.
 * @param {Boolean} [required=false] - Define se o campo é obrigatório.
 * @param {Boolean} [showError=false] - Define se deve exibir mensagem de erro de campo obrigatório.
 * @param {Object|null} [verificarDuplicado=null] - Objeto para validação de duplicidade: { tabela: String, campo: String }.
 *
 * @example
 * <Label 
 *   label="CPF" 
 *   input 
 *   mask="cpf" 
 *   value={cpf} 
 *   onChangeText={setCpf} 
 *   required 
 *   showError 
 * />
 * 
 * @example
 * <Label 
 *   label="Produtor" 
 *   dropdown 
 *   data={[{ label: 'João', value: '1' }]} 
 *   value={produtor} 
 *   onChangeText={setProdutor} 
 * />
 * 
 * @example
 * <Label 
 *   label="Meses" 
 *   selectableInput 
 *   options={['Janeiro', 'Fevereiro']} 
 *   value={mesesSelecionados} 
 *   onChangeText={setMesesSelecionados} 
 * />
 */


export default function Label({
  label = 'Label',
  input = false,
  dropdown = false,
  selectableInput = false,
  horizontal = false,
  icon = null,
  onIconPress = null,
  value = '',
  onChangeText = () => {},
  data = [],
  mainIconName = null,
  onPressMainIcon = null,
  extraIcon = null,
  modalVisible: externalModalVisible = null,
  setModalVisible: externalSetModalVisible = null,
  renderModalContent = null,
  options = [],
  mask = null,
  required = false,
  showError = false, // NOVO: controle de erro pelo componente pai
  verificarDuplicado = null, // { tabela: 'produtor', campo: 'codigo_produtor' }

}) {
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const isExternal = Array.isArray(value) && typeof onChangeText === 'function';
  const [internalSelectedItems, setInternalSelectedItems] = useState([]);
  const selectedItems = isExternal ? value : internalSelectedItems;
  const setSelectedItems = isExternal ? onChangeText : setInternalSelectedItems;

  const modalVisible = externalModalVisible ?? internalModalVisible;
  const setModalVisible = externalSetModalVisible ?? setInternalModalVisible;

  const isEmpty = typeof value === 'string' && value.trim() === '';
  const showValidationError = showError && required && isEmpty;

  const [valorDuplicado, setValorDuplicado] = useState(false);
  const [mensagemDuplicado, setMensagemDuplicado] = useState('');
  const debounceTimeout = useRef(null);

  const removeSpaces = (value = '') => {
    return value.replace(/\s+/g, '');
  };


  const checarDuplicado = async (textoNormalizado) => {
  if (!verificarDuplicado || !textoNormalizado) {
    setValorDuplicado(false);
    setMensagemDuplicado('');
    return;
  }

  try {
    const registros = await buscarRegistrosGenericos(verificarDuplicado.tabela);

    const existe = registros.some((r) => {
      const valorBanco = r[verificarDuplicado.campo];
      if (!valorBanco) return false;

      const comparavel = verificarDuplicado.campo === 'cpf_produtor'
        ? valorBanco.replace(/\D/g, '')
        : valorBanco.trim().toUpperCase();

      return comparavel === textoNormalizado;
    });

    if (existe) {
      setValorDuplicado(true);
      setMensagemDuplicado(`Este(a) ${label} já está cadastrado(a)!`);
    } else {
      setValorDuplicado(false);
      setMensagemDuplicado('');
    }
  } catch (e) {
    Alert.alert('Erro ao verificar duplicidade:', e);
  }
};

  const handleToggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleClearAll = () => setSelectedItems([]);

  const internalModalContent = () => (
    <>
      <FlatList
        data={options}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleToggleItem(item)}
            style={{ paddingVertical: 10 }}
          >
            <Text style={{ color: selectedItems.includes(item) ? 'blue' : 'black' }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity onPress={handleClearAll} style={styles.btnLimpar}>
        <Text style={{ color: '#fff' }}>Limpar Todos</Text>
      </TouchableOpacity>
    </>
  );

  const displayValue = Array.isArray(selectedItems) ? selectedItems.join(', ') : '';

 const handleTextChange = (text) => {
  let formatted = text;

  if (mask === 'cpf') {
    formatted = formatCPF(text);
  } else if (mask === 'noSpaces') {
    formatted = removeSpaces(text);
  }

  onChangeText(formatted);

  if (verificarDuplicado) {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      let normalizado;

      if (mask === 'cpf') {
        normalizado = text.replace(/\D/g, '');
      } else if (mask === 'noSpaces') {
        normalizado = removeSpaces(text.trim().toUpperCase());
      }else {
        normalizado = text.trim().toUpperCase(); // ← normalização padrão
      }

      checarDuplicado(normalizado);
    }, 300);
  }
};


  if (horizontal) {
    return (
      <View style={styles.horizontalRow}>
        <Text style={styles.labelHorizontal}>
          {label}
          {required && <Text style={{ color: 'red' }}> *</Text>}
        </Text>
        <View style={styles.inputHorizontalContainer}>
          <TextInput
            style={styles.input}
            placeholder={label||'Digite aqui'}
            placeholderTextColor={'#000'}
            value={value}
            onChangeText={handleTextChange}
            keyboardType={mask === 'cpf' ? 'numeric' : 'default'}
            scrollEnabled={false}
            
          />
          
          {icon && (
            <Ionicons
              name={icon}
              size={RFValue(20)}
              color="#000"
              style={styles.icon}
              onPress={onIconPress}
            />
          )}
        </View>
        {showValidationError && (
          <Text style={styles.errorText}>Campo obrigatório</Text>
        )}
        {valorDuplicado && (
          <Text style={styles.errorText}>{mensagemDuplicado}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: 'red' }}> *</Text>}
      </Text>

      {input && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={label||'Digite aqui'}
              placeholderTextColor={'#000'}
              value={value}
              onChangeText={handleTextChange}
              keyboardType={mask === 'cpf' ? 'numeric' : 'default'}
              scrollEnabled={false}
            />
            {icon && (
              <Ionicons
                name={icon}
                size={RFValue(20)}
                color="#000"
                style={styles.icon}
                onPress={onIconPress}
              />
            )}
          </View>
          {showValidationError && (
            <Text style={styles.errorText}>Campo obrigatório</Text>
          )}
          {valorDuplicado && (
            <Text style={styles.errorText}>{mensagemDuplicado}</Text>
          )}
        </>
      )}

      {dropdown && (
        <View>
          <View style={stylesGeral.dropdownRow}>
            <View style={stylesGeral.dropdownWrapper}>
              <DropdownComponent
                label={label}
                data={data}
                value={value}
                onChange={onChangeText}
              />
            </View>
          </View>
          {showValidationError && (
            <Text style={styles.errorText}>Campo obrigatório</Text>
          )}
          {valorDuplicado && (
            <Text style={styles.errorText}>{mensagemDuplicado}</Text>
          )}
        </View>
      )}


      {selectableInput && (
        <>
          <View style={styles.inputIconContainer}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TextInput
                  style={styles.inputReadonly}
                  placeholder={label||'Digite aqui'}
                  placeholderTextColor={'#000'}
                  value={displayValue}
                  editable={true}
                  scrollEnabled={false}
                />
              </ScrollView>
            </View>
            {mainIconName && (
              <TouchableOpacity onPress={onPressMainIcon ?? (() => setModalVisible(true))}>
                <Ionicons name={mainIconName} size={RFValue(20)} color="#000" />
              </TouchableOpacity>
            )}
            {Array.isArray(selectedItems) && selectedItems.length > 0 && (
              extraIcon ?? (
                <TouchableOpacity
                  onPress={() => setSelectedItems((prev) => prev.slice(0, -1))}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="backspace-outline" size={20} color="#cc0000" />
                </TouchableOpacity>
              )
            )}
          </View>

          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{`Selecione ${label}`}</Text>
                {(renderModalContent || internalModalContent)()}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnFechar}>
                  <Text style={{ color: 'white' }}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: RFValue(5),
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: RFValue(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: RFValue(10),
    backgroundColor: '#fff',
    height: RFValue(40),
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: RFValue(14),
    color: '#000',
    
  },
  icon: {
    marginLeft: RFValue(10),
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: RFValue(8),
  },
  labelHorizontal: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginRight: RFValue(10),
    minWidth: RFValue(100),
    
  },
  inputHorizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: RFValue(10),
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
  inputReadonly: {
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
  btnFechar: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  btnLimpar: {
    marginTop: 10,
    backgroundColor: 'red',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  errorText: {
    color: 'red',
    fontSize: RFValue(12),
    marginTop: RFValue(4),
    marginLeft: RFValue(4),
  },
});
