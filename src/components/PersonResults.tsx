import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TextInput } from 'react-native-paper';
import { calculateResults } from '../utils/calculations';

interface PersonResultsProps {
  title: string;
  income: number;
  otherIncome: number;
  isOsvc: boolean;
  expenses: number;
  passiveIncome: number;
}

export default function PersonResults({
  title,
  income,
  otherIncome,
  isOsvc,
  expenses,
  passiveIncome,
}: PersonResultsProps) {
  const [pensionLevels, setPensionLevels] = useState([
    Math.round(income * 0.286),
    Math.round(income * 0.3358),
    Math.round(income * 0.4961),
  ]);

  const results = calculateResults({
    income,
    otherIncome,
    isOsvc,
    expenses,
    passiveIncome,
    pensionLevels,
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('cs-CZ');
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title>{title}</Title>
          {isOsvc && <Text style={styles.osvcBadge}>OSVČ</Text>}
        </View>

        <View style={styles.pensionGrid}>
          {pensionLevels.map((level, index) => (
            <View key={index} style={styles.pensionCard}>
              <TextInput
                label={`Invalidní důchod ${index + 1}. stupně`}
                value={level.toString()}
                onChangeText={(text) => {
                  const newLevels = [...pensionLevels];
                  newLevels[index] = Number(text) || 0;
                  setPensionLevels(newLevels);
                }}
                keyboardType="numeric"
                mode="outlined"
                dense
              />
              <Text style={styles.pensionPercent}>
                {Math.round((level / income) * 100)}% čisté mzdy
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.results}>
          <ResultItem
            title="Smrt"
            value={`${formatCurrency(results.death)} Kč`}
          />

          {results.invalidity.map((result, index) => (
            <ResultItem
              key={`inv-${index}`}
              title={`Invalidita ${index + 1}. stupně`}
              value={`${formatCurrency(result.total)} Kč`}
              details={[
                `Očekávaný příjem: ${formatCurrency(result.expectedIncome)} Kč`,
                `Konstantní: ${formatCurrency(result.constant)} Kč`,
                `Klesající: ${formatCurrency(result.variable)} Kč`,
              ]}
            />
          ))}

          <ResultItem
            title="Trvalé následky úrazu"
            value={`${formatCurrency(results.permanentInjury)} Kč`}
          />

          <ResultItem
            title="Pracovní neschopnost"
            value={`${formatCurrency(results.workDisability)} Kč/den`}
          />

          <ResultItem
            title="Hospitalizace"
            value={`${formatCurrency(results.hospitalization)} Kč/den`}
          />

          <ResultItem
            title="Úraz"
            value={`${formatCurrency(results.injury)} Kč`}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

interface ResultItemProps {
  title: string;
  value: string;
  details?: string[];
}

function ResultItem({ title, value, details }: ResultItemProps) {
  return (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      {details && details.map((detail, index) => (
        <Text key={index} style={styles.resultDetail}>{detail}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  osvcBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pensionGrid: {
    marginBottom: 16,
  },
  pensionCard: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pensionPercent: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  results: {
    marginTop: 16,
  },
  resultItem: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
  },
  resultDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});