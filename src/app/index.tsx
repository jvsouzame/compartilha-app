import { ActivityIndicator, View } from "react-native";

export default function StartPage() {
  return (
    <View
      className="flex-1 bg-white justify-center items-center"
      testID="start-page-container"
    >
      <ActivityIndicator
        size="large"
        color="gray"
        testID="activity-indicator"
      />
    </View>
  );
}
