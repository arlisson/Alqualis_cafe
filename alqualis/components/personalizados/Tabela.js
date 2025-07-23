import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { RFValue } from 'react-native-responsive-fontsize';
import Cores from '../../constants/Cores';

/**
 * Componente Tabela
 *
 * Exibe uma tabela rolável horizontalmente com cabeçalho e linhas de dados,
 * permitindo ocultar colunas específicas e acionar um evento ao clicar em uma linha.
 *
 * @component
 * @param {Array<string>} header - Array com os nomes das colunas do cabeçalho.
 * @param {Array<Array<any>>} data - Array bidimensional contendo os dados das linhas da tabela.
 * @param {number} [columnMinWidth=RFValue(100)] - Largura mínima de cada coluna.
 * @param {Function} [onRowPress=() => {}] - Função chamada ao clicar em uma linha, recebe a linha completa no formato `{ label, value }`.
 * @param {Array<number>} [hiddenColumns=[]] - Índices das colunas que devem ser ocultadas.
 * @param {string} [headerColor=Cores.marrom] - Cor de fundo do cabeçalho.
 *
 * @example
 * <Tabela
 *   header={['ID', 'Nome', 'Email']}
 *   data={[
 *     [1, 'João', 'joao@email.com'],
 *     [2, 'Maria', 'maria@email.com']
 *   ]}
 *   columnMinWidth={120}
 *   hiddenColumns={[0]}
 *   onRowPress={(row) => console.log('Linha clicada:', row)}
 * />
 */

export default function Tabela({
  header = [],
  data = [],
  columnMinWidth = RFValue(100),
  onRowPress = () => {},
  hiddenColumns = [],
  headerColor = Cores.marrom,
}) {
  const screenWidth = Dimensions.get('window').width;

  const visibleIndices = header
    .map((_, index) => index)
    .filter((index) => !hiddenColumns.includes(index));

  const filteredHeader = header.filter((_, index) =>
    visibleIndices.includes(index)
  );

  const filteredData = data.map((row) =>
    row.filter((_, index) => visibleIndices.includes(index))
  );

  // 👇 Cálculo inteligente das larguras
  // ✅ Garante ao menos uma coluna para evitar erro no reduce
  const widthArr =
  visibleIndices.length === 0
    ? [screenWidth - 40]
    : visibleIndices.length === 1
    ? [screenWidth - 40]
    : visibleIndices.map(() => columnMinWidth);

  const totalWidth = widthArr.reduce((sum, w) => sum + w, 0);


  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal contentContainerStyle={{ width: totalWidth }}>
        <View style={styles.container}>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
            <Row
              data={filteredHeader}
              style={[styles.head, { backgroundColor: headerColor }]}
              textStyle={styles.textHead}
              widthArr={widthArr}
            />

            {filteredData.length === 0 ? (
              <Row
                data={['Nenhum registro encontrado']}
                style={styles.noDataRow}
                textStyle={styles.noDataText}
                widthArr={[totalWidth]}
              />
            ) : (
              filteredData.map((rowData, rowIndex) => (
                <TouchableOpacity
                  key={rowIndex}
                  onPress={() => {
                    const fullRow = header.map((label, idx) => ({
                      label,
                      value: data[rowIndex][idx],
                    }));
                    onRowPress(fullRow);
                  }}
                >
                  <Row
                    data={rowData}
                    style={[
                      styles.row,
                      { backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#e6f2ff' },
                    ]}
                    textStyle={styles.textRow}
                    widthArr={widthArr}
                  />
                </TouchableOpacity>
              ))
            )}
          </Table>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  head: {
    height: RFValue(40),
  },
  textHead: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: RFValue(13),
    color: '#fff',
  },
  row: {
    minHeight: RFValue(35),
    alignItems: 'center',
  },
  textRow: {
    textAlign: 'center',
    fontSize: RFValue(12),
    flexWrap: 'wrap',
    paddingHorizontal: 5,
  },
  noDataRow: {
    height: RFValue(35),
    backgroundColor: '#fff',
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    fontSize: RFValue(12),
  },
});
