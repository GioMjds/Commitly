import StyledText from '@/components/ui/StyledText';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthCallbackScreen() {
    const router = useRouter();
    const { colors } = useThemedStyles();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/(screens)');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View style={[styles.container, { backgroundColor: colors.neutral }]}>
            <ActivityIndicator size="large" color="#0066CC" />
            <StyledText variant="medium" style={[styles.text, { color: colors.text }]}>
                Completing GitHub sign-in...
            </StyledText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        marginTop: 16,
    },
});