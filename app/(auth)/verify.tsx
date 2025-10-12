import StyledText from '@/components/ui/StyledText';
import { auth } from '@/configs/firebase';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthStore } from '@/store/AuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyScreen() {
	const { user, setLoading } = useAuthStore();
	const { colors } = useThemedStyles();

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
		<SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
			<View style={styles.content}>
				<View style={styles.iconSection}>
					<View style={[styles.iconContainer, { backgroundColor: colors.actionOpacity20 }]}>
						<Ionicons
							name="mail-outline"
							size={60}
							color="#0EA5A4"
						/>
					</View>

					<StyledText
						variant="black"
						style={[styles.title, { color: colors.text }]}
					>
						Verify Your Email
					</StyledText>

					<StyledText
						variant="light"
						style={[styles.subtitle, { color: colors.text }]}
					>
						We&apos;ve sent a verification link to
					</StyledText>

					<StyledText
						variant="semibold"
						style={[styles.email, { color: colors.text }]}
					>
						{user?.email}
					</StyledText>

					<StyledText
						variant="regular"
						style={[styles.description, { color: colors.textSecondary }]}
					>
						Please check your inbox and click the verification link
						to activate your account.
					</StyledText>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.verifyButton}
						onPress={checkEmailVerification}
					>
						<StyledText
							variant="semibold"
							style={styles.verifyButtonText}
						>
							I&apos;ve Verified My Email
						</StyledText>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.resendButton, { borderColor: colors.secondary }]}
						onPress={handleResendVerification}
					>
						<StyledText
							variant="semibold"
							style={styles.resendButtonText}
						>
							Resend Verification Email
						</StyledText>
					</TouchableOpacity>

					<View style={styles.backToSignIn}>
						<Link href="/login" asChild>
							<TouchableOpacity>
								<StyledText
									variant="medium"
									style={[styles.backToSignInText, { color: colors.textSecondary }]}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconSection: {
		alignItems: 'center',
		marginBottom: 40,
	},
	iconContainer: {
		padding: 24,
		borderRadius: 9999,
		marginBottom: 24,
	},
	title: {
		fontSize: 40,
		marginBottom: 16,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 24,
		opacity: 0.7,
		textAlign: 'center',
		marginBottom: 8,
	},
	email: {
		fontSize: 20,
		textDecorationLine: 'underline',
		textAlign: 'center',
		marginBottom: 24,
	},
	description: {
		fontSize: 18,
		textAlign: 'center',
	},
	buttonContainer: {
		width: '100%',
		gap: 16,
	},
	verifyButton: {
		backgroundColor: '#7C3AED',
		borderRadius: 16,
		paddingVertical: 16,
		marginBottom: 8,
		alignItems: 'center',
		shadowColor: '#7C3AED',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	verifyButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
	},
	resendButton: {
		borderWidth: 2,
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
	},
	resendButtonText: {
		color: '#0EA5A4',
		fontSize: 18,
	},
	backToSignIn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 16,
	},
	backToSignInText: {
		fontSize: 18,
	},
});
