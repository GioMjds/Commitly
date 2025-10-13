import StyledText from '@/components/ui/StyledText';
import { useAuth } from '@/hooks/useAuth';
import { useGithubAuth } from '@/hooks/useGithubAuth';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthStore } from '@/store/AuthStore';
import { type LoginSchema, loginSchema } from '@/utils/validations';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const { login } = useAuth();
	const { loading } = useAuthStore();
	const { signInWithGithub, request, githubLoading } = useGithubAuth();
	const { colors } = useThemedStyles();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		mode: 'onBlur',
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const handleGithubLogin = async () => {
		const result = await signInWithGithub();
		if (result && !result.success) {
			Alert.alert('Error', result.message || 'GitHub login failed. Please try again.');
		}
	}

	const onSubmit = async (data: LoginSchema) => {
		const result = await login({
			email: data.email,
			password: data.password,
		});

		if (result.success) {
			router.replace('/(screens)');
			return;
		}

		const message = result.message || 'Login failed. Please try again.';

		const passwordRelated = [
			'Incorrect password',
			'Please verify your email',
			'Invalid credential',
		];

		if (passwordRelated.some((m) => message.toLowerCase().includes(m.toLowerCase()))) {
			setError('password', { type: 'manual', message });
		} else {
			if (message.toLowerCase().includes('no account') || message.toLowerCase().includes('user')) {
				setError('email', { type: 'manual', message });
			} else {
				Alert.alert('Error', message);
			}
		}
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.neutral }]}>
			<ScrollView 
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.logoContainer}>
					<Image
						source={require('@/assets/images/commitly1.png')}
						style={styles.logo}
						resizeMode="contain"
					/>
				</View>

				<View style={styles.header}>
					<StyledText
						variant="black"
						style={[styles.title, { color: colors.text }]}
					>
						Welcome to Commitly
					</StyledText>
					<StyledText
						variant="light"
						style={[styles.subtitle, { color: colors.textSecondary }]}
					>
						Sign in to continue your journey
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
									editable={!isSubmitting}
								/>
							)}
						/>
						{errors.email && (
							<StyledText
								variant="light"
								style={styles.errorText}
							>
								{errors.email.message}
							</StyledText>
						)}
					</View>

					<View>
						<StyledText
							variant="medium"
							style={[styles.label, { color: colors.text }]}
						>
							Password
						</StyledText>
						<View style={styles.passwordContainer}>
							<Controller
								control={control}
								name="password"
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										style={[
											styles.input,
											styles.passwordInput,
											{
												backgroundColor: colors.surface,
												color: colors.text,
												borderColor: colors.border,
											}
										]}
										placeholder="Enter your password"
										placeholderTextColor={colors.textMuted}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										secureTextEntry={!showPassword}
										editable={!isSubmitting}
									/>
								)}
							/>
							<TouchableOpacity
								style={styles.eyeIcon}
								onPress={() => setShowPassword(!showPassword)}
							>
								<Ionicons
									name={showPassword ? 'eye-off' : 'eye'}
									size={25}
									color={colors.textMuted}
								/>
							</TouchableOpacity>
						</View>
						{errors.password && (
							<StyledText
								variant="light"
								style={styles.errorText}
							>
								{errors.password.message}
							</StyledText>
						)}
					</View>

					<TouchableOpacity style={styles.forgotPassword}>
						<Link href="/forgot" asChild>
							<StyledText
								variant="medium"
								style={styles.forgotPasswordText}
							>
								Forgot Password?
							</StyledText>
						</Link>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.signInButton}
						onPress={handleSubmit(onSubmit)}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator size="large" color="#EEEEEE" />
						) : (
							<StyledText
								variant="semibold"
								style={styles.signInButtonText}
							>
                                Sign In
                            </StyledText>
						)}
					</TouchableOpacity>

					{/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        <StyledText variant="regular" style={[styles.dividerText, { color: colors.textSecondary }]}>
                            OR
                        </StyledText>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    {/* GitHub Sign In Button */}
                    <TouchableOpacity
                        style={[styles.githubButton, { backgroundColor: colors.primary }]}
                        onPress={handleGithubLogin}
                        disabled={!request || githubLoading}
                    >
                        {githubLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="logo-github" size={24} color="white" />
                                <StyledText
                                    variant="semibold"
                                    style={styles.githubButtonText}
                                >
                                    Continue with GitHub
                                </StyledText>
                            </>
                        )}
                    </TouchableOpacity>

					<View style={styles.signUpRow}>
						<StyledText
							variant="regular"
							style={[styles.signUpText, { color: colors.text }]}
						>
							Don&apos;t have an account?{' '}
						</StyledText>
						<Link href="/register" asChild>
							<TouchableOpacity>
								<StyledText
									variant="semibold"
									style={styles.signUpLink}
								>
									Sign Up
								</StyledText>
							</TouchableOpacity>
						</Link>
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
		paddingHorizontal: 32,
		paddingVertical: 20,
	},
	logoContainer: {
		alignItems: 'center',
		marginTop: 20,
	},
	logo: {
		width: 288,
		height: 166,
	},
	header: {
		marginBottom: 32,
		marginTop: 2,
	},
	title: {
		fontSize: 36,
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 24,
		textAlign: 'center',
	},
	formContainer: {
		gap: 2,
		marginBottom: 40,
	},
	label: {
		fontSize: 20,
		marginBottom: 8,
	},
	input: {
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 16,
		marginBottom: 8,
		borderWidth: 1,
		fontSize: 16,
	},
	passwordContainer: {
		position: 'relative',
	},
	passwordInput: {
		paddingRight: 48,
	},
	eyeIcon: {
		position: 'absolute',
		right: 16,
		top: 12,
	},
	errorText: {
		color: '#EF4444',
		fontSize: 14,
		marginBottom: 16,
	},
	forgotPassword: {
		alignItems: 'flex-end',
	},
	forgotPasswordText: {
		color: '#0EA5A4',
		fontSize: 18,
		marginBottom: 16,
	},
	signInButton: {
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
	signInButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
	},
	dividerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 6,
	},
	dividerLine: {
		flex: 1,
		height: 1,
	},
	dividerText: {
		marginHorizontal: 16,
	},
	githubButton: {
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	githubButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		marginLeft: 8,
	},
	signUpRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
	},
	signUpText: {
		fontSize: 20,
	},
	signUpLink: {
		color: '#0EA5A4',
		fontSize: 20,
	},
});
