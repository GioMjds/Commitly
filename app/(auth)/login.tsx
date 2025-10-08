import StyledText from '@/components/ui/StyledText';
import { useAuth } from '@/hooks/useAuth';
import { useGithubAuth } from '@/hooks/useGithubAuth';
import { useAuthStore } from '@/store/AuthStore';
import { type LoginSchema, loginSchema } from '@/utils/validations';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const { login } = useAuth();
	const { loading } = useAuthStore();
	const { signInWithGithub, request } = useGithubAuth();

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
		<SafeAreaView className="flex-1 bg-neutral">
			<View className="flex-1 px-8 justify-center">
				<View className="items-center">
					<Image
						source={require('@/assets/images/commitly1.png')}
						className="w-72 h-72 self-center rounded-full"
						resizeMode="contain"
					/>
				</View>

				<View className="mb-10">
					<StyledText
						variant="black"
						className="text-4xl text-center text-primary mb-2"
					>
						Welcome to Commitly
					</StyledText>
					<StyledText
						variant="light"
						className="text-2xl text-center text-primary/70"
					>
						Sign in to continue your journey
					</StyledText>
				</View>

				<View className="space-y-6 mb-56">
					<View>
						<StyledText
							variant="medium"
							className="text-primary mb-2"
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
									className="bg-white rounded-2xl px-4 py-4 mb-2 text-primary border border-gray-200"
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
								className="text-red-500 mb-4 text-sm"
							>
								{errors.email.message}
							</StyledText>
						)}
					</View>

					<View>
						<StyledText
							variant="medium"
							className="text-primary mb-2"
						>
							Password
						</StyledText>
						<View className="relative">
							<Controller
								control={control}
								name="password"
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										className="bg-white rounded-2xl px-4 py-4 mb-2 text-primary border border-gray-200 pr-12"
										placeholder="Enter your password"
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
								className="absolute right-4 top-3"
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
								className="text-red-500 mt-1 text-sm"
							>
								{errors.password.message}
							</StyledText>
						)}
					</View>

					<TouchableOpacity className="items-end">
						<Link href="/forgot" asChild>
							<StyledText
								variant="medium"
								className="text-secondary text-lg mb-4"
							>
								Forgot Password?
							</StyledText>
						</Link>
					</TouchableOpacity>

					<TouchableOpacity
						className="bg-action rounded-2xl py-4 items-center shadow-xl shadow-action/30"
						onPress={handleSubmit(onSubmit)}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator size="large" color="#EEEEEE" />
						) : (
							<StyledText
								variant="semibold"
								className="text-white text-lg"
							>
                                Sign In
                            </StyledText>
						)}
					</TouchableOpacity>

					{/* Divider */}
                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-gray-300" />
                        <StyledText variant="regular" className="mx-4 text-primary/50">
                            OR
                        </StyledText>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    {/* GitHub Sign In Button */}
                    <TouchableOpacity
                        className="bg-primary rounded-2xl py-4 items-center flex-row justify-center shadow-xl shadow-primary/30"
                        onPress={handleGithubLogin}
                        disabled={!request || loading}
                    >
                        <Ionicons name="logo-github" size={24} color="white" />
                        <StyledText
                            variant="semibold"
                            className="text-white text-lg ml-2"
                        >
                            Continue with GitHub
                        </StyledText>
                    </TouchableOpacity>

					<View className="flex-row justify-center items-center mt-6">
						<StyledText
							variant="regular"
							className="text-primary text-xl"
						>
							Don&apos;t have an account?{' '}
						</StyledText>
						<Link href="/register" asChild>
							<TouchableOpacity>
								<StyledText
									variant="semibold"
									className="text-secondary text-xl"
								>
									Sign Up
								</StyledText>
							</TouchableOpacity>
						</Link>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
