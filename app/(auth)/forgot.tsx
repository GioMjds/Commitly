import StyledText from '@/components/ui/StyledText';
import { useAuth } from '@/hooks/useAuth';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/utils/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
	const { forgotPassword } = useAuth();
	const { colors } = useThemedStyles();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordSchema>({
		mode: 'onBlur',
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const onSubmit = async (data: ForgotPasswordSchema) => {
		const result = await forgotPassword(data.email);

		if (result.success) {
			Alert.alert(
				'Email Sent!',
				'Please check your inbox for password reset instructions.',
				[
					{
						text: 'OK',
						onPress: () => router.back(),
					},
				]
			);
		} else {
			Alert.alert('Error', result.message as string);
		}
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.content}>
					<View style={styles.logoContainer}>
						<Image
							source={require('@/assets/images/commitly1.png')}
							style={styles.logo}
							resizeMode="center"
						/>
					</View>
					<View style={styles.header}>
						<StyledText
							variant="black"
							style={[styles.title, { color: colors.text }]}
						>
							Reset Password
						</StyledText>
						<StyledText
							variant="light"
							style={[styles.subtitle, { color: colors.textSecondary }]}
						>
							Enter your email to receive reset instructions
						</StyledText>
					</View>

					<View style={styles.formContainer}>
						<View>
							<StyledText
								variant="medium"
								style={[styles.label, { color: colors.text }]}
							>
								Email
							</StyledText>
							<Controller
								control={control}
								name="email"
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										style={[
											styles.input,
											{
												backgroundColor: colors.surface,
												color: colors.text,
												borderColor: colors.border,
											}
										]}
										placeholder="Enter your email"
										placeholderTextColor={colors.textMuted}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										keyboardType="email-address"
										autoCapitalize="none"
									/>
								)}
							/>
							{errors.email && (
								<StyledText
									variant="medium"
									style={styles.errorText}
								>
									{errors.email.message}
								</StyledText>
							)}
						</View>

						<TouchableOpacity
							style={styles.resetButton}
							onPress={handleSubmit(onSubmit)}
							disabled={isSubmitting}
						>
							<StyledText
								variant="semibold"
								style={styles.resetButtonText}
							>
								{isSubmitting
									? 'Sending...'
									: 'Send Reset Link'}
							</StyledText>
						</TouchableOpacity>

						<View style={styles.backToSignIn}>
							<Link href="/login" asChild>
								<TouchableOpacity>
									<StyledText
										variant="semibold"
										style={styles.backToSignInText}
									>
										Back to Sign In
									</StyledText>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
	},
	logoContainer: {
		alignItems: 'center',
	},
	logo: {
		width: 192,
		height: 192,
		borderRadius: 96,
	},
	header: {
		marginBottom: 24,
	},
	title: {
		fontSize: 42,
		marginBottom: 8,
		textAlign: 'center'
	},
	subtitle: {
		fontSize: 22,
		textAlign: 'center'
	},
	formContainer: {
		gap: 24,
	},
	label: {
		marginBottom: 8,
	},
	input: {
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 16,
		marginBottom: 4,
		borderWidth: 1,
		fontSize: 16,
	},
	errorText: {
		color: '#EF4444',
		fontSize: 14,
	},
	resetButton: {
		backgroundColor: '#7C3AED',
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		shadowColor: '#7C3AED',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	resetButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
	},
	backToSignIn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	backToSignInText: {
		color: '#0EA5A4',
		fontSize: 20,
	},
});
