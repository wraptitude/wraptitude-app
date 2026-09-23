import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useBranch } from '../branch/BranchContext';
import { colors } from '../styles/theme';

const ContactUs: React.FC = () => {
  const { branch } = useBranch();

  const open = async (url: string, label: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(`Unable to open ${label}`, `Please use this information directly: ${label === 'phone' ? branch.phone : label === 'email' ? branch.email : branch.address}`);
    }
  };

  const contactOptions = [
    { title: 'Call us', value: branch.phone, icon: 'call', url: `tel:${branch.phoneDial}`, label: 'phone' },
    { title: 'Email us', value: branch.email, icon: 'mail-outline', url: `mailto:${branch.email}`, label: 'email' },
    { title: 'Get directions', value: branch.address, icon: 'directions', url: branch.mapUrl, label: 'map' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <View style={styles.branchBadge}>
          <Icon name="place" size={16} color={colors.redLight} />
          <Text style={styles.branchBadgeText}>{branch.name} location</Text>
        </View>
        <Text style={styles.title}>Let’s talk.</Text>
        <Text style={styles.subtitle}>Questions about a service or your visit? Reach our {branch.name} team directly.</Text>
      </View>

      <View style={styles.options}>
        {contactOptions.map((option) => (
          <Pressable
            key={option.title}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            onPress={() => { open(option.url, option.label).catch(() => undefined); }}
            accessibilityRole="button"
            accessibilityLabel={`${option.title}: ${option.value}`}
          >
            <View style={styles.iconWrap}><Icon name={option.icon} size={23} color={colors.redLight} /></View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionValue}>{option.value}</Text>
            </View>
            <Icon name="chevron-right" size={23} color={colors.subtle} />
          </Pressable>
        ))}
      </View>

      <View style={styles.hoursCard}>
        <View style={styles.hoursHeading}>
          <Icon name="schedule" size={22} color={colors.redLight} />
          <Text style={styles.hoursTitle}>Opening hours</Text>
        </View>
        {branch.hours.split(';').map((line, index) => (
          <View key={line.trim()}>
            {index > 0 && <View style={styles.divider} />}
            <Text style={styles.hoursLine}>{line.trim()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 24, paddingBottom: 30 },
  intro: { marginBottom: 24 },
  branchBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.redTint, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 14 },
  branchBadgeText: { color: colors.redLight, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 10 },
  options: { gap: 12 },
  option: { minHeight: 85, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 46, height: 46, borderRadius: 13, backgroundColor: colors.redTint, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  optionCopy: { flex: 1 },
  optionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  optionValue: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  hoursCard: { marginTop: 24, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 18 },
  hoursHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 13 },
  hoursTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginLeft: 9 },
  hoursLine: { color: colors.text, fontSize: 14, lineHeight: 22, paddingVertical: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 3 },
  pressed: { opacity: 0.75 },
});

export default ContactUs;
