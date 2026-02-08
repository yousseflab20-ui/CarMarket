import { Link } from 'expo-router';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';


export default function ModalScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text>Hello</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
