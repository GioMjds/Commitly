import StyledText from '@/components/ui/StyledText';
import { useAuth } from '@/hooks/useAuth';
import { useGithubAuth } from '@/hooks/useGithubAuth';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { RegisterFormData } from '@/types/FirebaseAuth.types';
import { registerSchema } from '@/utils/validations';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

	const { register } = useAuth();
	const { signInWithGithub, request } = useGithubAuth();
	const { colors } = useThemedStyles();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		mode: 'onSubmit',
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const handleGithubSignup = async () => {
		const result = await signInWithGithub();
		if (result && result.success) {
			router.replace('/(screens)');
		} else if (result) {
			Alert.alert(
				'Error',
				result.message || 'GitHub signup failed. Please try again.'
			);
		}
	};

	const onSubmit = async (data: RegisterFormData) => {
		const result = await register(data);

		if (result.success) {
			Alert.alert(
				'Success!',
				'Registration successful! Please check your email for verification.',
				[
					{
						text: 'OK',
						onPress: () => router.push('/(auth)/verify'),
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
				showsVerticalScrollIndicator={false}
			>
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
						Create Account
					</StyledText>
					<StyledText
						variant="light"
						style={[styles.subtitle, { color: colors.textSecondary }]}
					>
						Join us and start your journey
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
									style={[styles.input, { 
										backgroundColor: colors.surface,
										color: colors.text,
										borderColor: colors.border
									}]}
									placeholder="Enter your email"
									placeholderTextColor="#94a3b8"
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
										style={[styles.passwordInput, { 
											backgroundColor: colors.surface,
											color: colors.text,
											borderColor: colors.border
										}]}
										placeholder="Create a password"
										placeholderTextColor="#94a3b8"
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
									color="#64748b"
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

					<View>
						<StyledText
							variant="medium"
							style={[styles.label, { color: colors.text }]}
						>
							Confirm Password
						</StyledText>
						<View style={styles.passwordContainer}>
							<Controller
								control={control}
								name="confirmPassword"
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										style={[styles.passwordInput, { 
											backgroundColor: colors.surface,
											color: colors.text,
											borderColor: colors.border
										}]}
										placeholder="Confirm your password"
										placeholderTextColor="#94a3b8"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										secureTextEntry={!showConfirmPassword}
										editable={!isSubmitting}
									/>
								)}
							/>
							<TouchableOpacity
								style={styles.eyeIcon}
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								<Ionicons
									name={showConfirmPassword ? 'eye-off' : 'eye'}
									size={25}
									color="#64748b"
								/>
							</TouchableOpacity>
						</View>
						{errors.confirmPassword && (
							<StyledText
								variant="light"
								style={styles.errorText}
							>
								{errors.confirmPassword.message}
							</StyledText>
						)}
					</View>

					<TouchableOpacity
						style={styles.registerButton}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					>
						<StyledText
							variant="semibold"
							style={styles.registerButtonText}
						>
							{isSubmitting
								? 'Creating Account...'
								: 'Create Account'}
						</StyledText>
					</TouchableOpacity>

					{/* Divider */}
					<View style={styles.dividerRow}>
						<View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
						<StyledText
							variant="regular"
							style={[styles.dividerText, { color: colors.textMuted }]}
						>
							OR
						</StyledText>
						<View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
					</View>

					{/* GitHub Sign Up Button */}
					<TouchableOpacity
						style={[styles.githubButton, { backgroundColor: colors.primary }]}
						onPress={handleGithubSignup}
						disabled={!request || isSubmitting}
					>
						<Ionicons name="logo-github" size={24} color="white" />
						<StyledText
							variant="semibold"
							style={styles.githubButtonText}
						>
							Sign up with GitHub
						</StyledText>
					</TouchableOpacity>

					<View style={styles.signInRow}>
						<StyledText variant="regular" style={[styles.signInText, { color: colors.text }]}>
							Already have an account?{' '}
						</StyledText>
						<Link href="/login" asChild>
							<TouchableOpacity>
								<StyledText
									variant="semibold"
									style={styles.signInLink}
								>
									Sign In
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
		marginBottom: 2,
	},
	logo: {
		width: 288,
		height: 166,
	},
	header: {
		marginBottom: 32,
	},
	title: {
		fontSize: 36,
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 24,
	},
	formContainer: {
		gap: 6,
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
	},
	passwordContainer: {
		position: 'relative',
	},
	passwordInput: {
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 16,
		paddingRight: 48,
		marginBottom: 8,
		borderWidth: 1,
	},
	eyeIcon: {
		position: 'absolute',
		right: 16,
		top: 12,
	},
	errorText: {
		color: '#EF4444',
		marginBottom: 16,
		fontSize: 18,
	},
	registerButton: {
		backgroundColor: '#7C3AED',
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 8,
		shadowColor: '#7C3AED',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	registerButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
	},
	dividerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 2,
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
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	githubButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		marginLeft: 8,
	},
	signInRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
	},
	signInText: {
		fontSize: 20,
	},
	signInLink: {
		color: '#0EA5A4',
		fontSize: 20,
	},
});
