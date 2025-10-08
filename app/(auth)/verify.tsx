import { View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledText from '@/components/ui/StyledText';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/AuthStore';
import { auth } from '@/configs/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyScreen() {
	const { user, setLoading } = useAuthStore();

	const checkEmailVerification = async () => {
        try {
            const updatedUser = auth.currentUser;
            if (updatedUser) {
                await updatedUser.reload();

                if (updatedUser?.emailVerified) {
                    Alert.alert(
                        'Email Verified!',
                        'Your email has been successfully verified.',
                        [
                            { text: "OK", onPress: () => router.replace('/(screens)') }
                        ]
                    );
                } else {
                    Alert.alert(
                        'Not Verified',
                        'Please verify your email before proceeding.'
                    );
                }
            }
        } catch (error) {
            console.error(`Error checking email verification: ${error}`);
        }
	};

	const handleResendVerification = async () => {
		setLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user);
                Alert.alert("Success", "Verification email sent! Please check your inbox.");
            } else {
                Alert.alert("Error", "No user found. Please register again.");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send verification email");
        } finally {
            setLoading(false);
        }
	};

	return (
		<SafeAreaView className="flex-1 bg-neutral">
			<View className="flex-1 px-6 justify-center items-center">
				<View className="items-center mb-10">
					<View className="bg-secondary/20 p-6 rounded-full mb-6">
						<Ionicons
							name="mail-outline"
							size={60}
							color="#0EA5A4"
						/>
					</View>

					<StyledText
						variant="black"
						className="text-3xl text-primary mb-4 text-center"
					>
						Verify Your Email
					</StyledText>

					<StyledText
						variant="light"
						className="text-lg text-primary opacity-70 text-center mb-2"
					>
						We&apos;ve sent a verification link to
					</StyledText>

					<StyledText
						variant="semibold"
						className="text-lg text-primary text-center mb-6"
					>
						{user?.email}
					</StyledText>

					<StyledText
						variant="regular"
						className="text-base text-primary opacity-70 text-center"
					>
						Please check your inbox and click the verification link
						to activate your account.
					</StyledText>
				</View>

				<View className="w-full space-y-4">
					<TouchableOpacity
						className="bg-action rounded-2xl py-4 items-center shadow-lg shadow-action/30"
						onPress={checkEmailVerification}
					>
						<StyledText
							variant="semibold"
							className="text-white text-lg"
						>
							I&apos;ve Verified My Email
						</StyledText>
					</TouchableOpacity>

					<TouchableOpacity
						className="border border-secondary rounded-2xl py-4 items-center"
						onPress={handleResendVerification}
					>
						<StyledText
							variant="semibold"
							className="text-secondary text-lg"
						>
							Resend Verification Email
						</StyledText>
					</TouchableOpacity>

					<View className="flex-row justify-center items-center mt-4">
						<Link href="/login" asChild>
							<TouchableOpacity>
								<StyledText
									variant="medium"
									className="text-primary opacity-70"
								>
									Back to Sign In
								</StyledText>
							</TouchableOpacity>
						</Link>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
