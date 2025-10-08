import StyledText from "@/components/ui/StyledText";
import { useAuth } from "@/hooks/useAuth";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { logout } = useAuth();

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-neutral">
            <StyledText className="text-3xl">Welcome to the Home Screen!</StyledText>
            <TouchableOpacity
                className="mt-6 px-4 py-2 bg-primary rounded"
                onPress={() => logout()}
            >
                <StyledText className="text-white text-lg">Log Out</StyledText>
            </TouchableOpacity>
        </SafeAreaView>
    )
}