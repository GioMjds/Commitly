import StyledText from '@/components/ui/StyledText';
import { useAuth } from '@/hooks/useAuth';
import { useGithubAuth } from '@/hooks/useGithubAuth';
import { RegisterFormData } from '@/types/FirebaseAuth.types';
import { registerSchema } from '@/utils/validations';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] =
		useState<boolean>(false);

	const { register } = useAuth();
	const { signInWithGithub, request } = useGithubAuth();

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
		<SafeAreaView className="flex-1 bg-neutral">
			<View className="flex-1 px-8 justify-center">
				<View className="items-center">
					<Image
						source={require('@/assets/images/commitly1.png')}
						className="w-48 h-48 self-center rounded-full"
						resizeMode="center"
					/>
				</View>

				<View className="mb-4">
					<StyledText
						variant="black"
						className="text-4xl text-center text-primary mb-2"
					>
						Create Account
					</StyledText>
					<StyledText
						variant="light"
						className="text-2xl text-center text-primary/70"
					>
						Join us and start your journey
					</StyledText>
				</View>

				<View className="space-y-6 mb-56">
					<View>
						<StyledText
							variant="medium"
							className="text-primary text-xl mb-2"
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
									className="bg-white rounded-2xl px-4 py-4 mb-2 font-hubot text-primary border border-gray-200"
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
								className="text-red-500 mb-4 text-lg"
							>
								{errors.email.message}
							</StyledText>
						)}
					</View>

					<View>
						<StyledText
							variant="medium"
							className="text-primary text-xl mb-2"
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
										className="bg-white rounded-2xl px-4 py-4 mb-2 font-hubot text-primary border border-gray-200 pr-12"
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
								className="text-red-500 mb-4 text-lg"
							>
								{errors.password.message}
							</StyledText>
						)}
					</View>

					<View>
						<StyledText
							variant="medium"
							className="text-primary text-xl mb-2"
						>
							Confirm Password
						</StyledText>
						<View className="relative">
							<Controller
								control={control}
								name="confirmPassword"
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										className="bg-white rounded-2xl px-4 py-4 mb-2 font-hubot text-primary border border-gray-200 pr-12"
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
								className="absolute right-4 top-3"
								onPress={() =>
									setShowConfirmPassword(!showConfirmPassword)
								}
							>
								<Ionicons
									name={
										showConfirmPassword ? 'eye-off' : 'eye'
									}
									size={25}
									color="#64748b"
								/>
							</TouchableOpacity>
						</View>
						{errors.confirmPassword && (
							<StyledText
								variant="light"
								className="text-red-500 mb-4 text-lg"
							>
								{errors.confirmPassword.message}
							</StyledText>
						)}
					</View>

					<TouchableOpacity
						className="bg-action rounded-2xl py-4 items-center shadow-lg mt-2 shadow-action/30"
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					>
						<StyledText
							variant="semibold"
							className="text-white text-lg"
						>
							{isSubmitting
								? 'Creating Account...'
								: 'Create Account'}
						</StyledText>
					</TouchableOpacity>

					{/* Divider */}
					<View className="flex-row items-center my-3">
						<View className="flex-1 h-px bg-gray-300" />
						<StyledText
							variant="regular"
							className="mx-4 text-primary/50"
						>
							OR
						</StyledText>
						<View className="flex-1 h-px bg-gray-300" />
					</View>

					{/* GitHub Sign Up Button */}
					<TouchableOpacity
						className="bg-primary rounded-2xl py-4 items-center flex-row justify-center shadow-lg shadow-primary/30"
						onPress={handleGithubSignup}
						disabled={!request || isSubmitting}
					>
						<Ionicons name="logo-github" size={24} color="white" />
						<StyledText
							variant="semibold"
							className="text-white text-lg ml-2"
						>
							Sign up with GitHub
						</StyledText>
					</TouchableOpacity>

					<View className="flex-row justify-center items-center mt-6">
						<StyledText variant="regular" className="text-primary text-xl">
							Already have an account?{' '}
						</StyledText>
						<Link href="/login" asChild>
							<TouchableOpacity>
								<StyledText
									variant="semibold"
									className="text-secondary text-xl"
								>
									Sign In
								</StyledText>
							</TouchableOpacity>
						</Link>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
