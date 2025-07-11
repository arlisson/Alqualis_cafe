import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { RFValue } from 'react-native-responsive-fontsize';
import Cores from '../../constants/Cores';

export default function Tabela({
  header = [],
  data = [],
  columnWidth = RFValue(100),
  onRowPress = () => {},
  hiddenColumns = [],
}) {
  const visibleIndices = header
    .map((_, index) => index)
    .filter((index) => !hiddenColumns.includes(index));

  const filteredHeader = header.filter((_, index) =>
    visibleIndices.includes(index)
  );

  const filteredData = data.map((row) =>
    row.filter((_, index) => visibleIndices.includes(index))
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
            {/* Cabeçalho */}
            <Row
              data={filteredHeader}
              style={styles.head}
              textStyle={styles.textHead}
              widthArr={visibleIndices.map(() => columnWidth)}
            />

            {/* Dados ou mensagem de vazio */}
            {filteredData.length === 0 ? (
              (() => {
                const colCount = Math.max(1, filteredHeader.length);
                const rowData = ['Nenhum registro encontrado', ...Array(colCount - 1).fill('')];
                const widths = Array(colCount).fill(columnWidth);
                return (
                  <Row
                    data={rowData}
                    style={styles.noDataRow}
                    textStyle={styles.noDataText}
                    widthArr={widths}
                  />
                );
              })()
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
                    widthArr={visibleIndices.map(() => columnWidth)}
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
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  head: {
    height: RFValue(40),
    backgroundColor: Cores.marrom,
  },
  textHead: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: RFValue(13),
    color: '#fff',
  },
  row: {
    height: RFValue(35),
  },
  textRow: {
    textAlign: 'center',
    fontSize: RFValue(12),
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
