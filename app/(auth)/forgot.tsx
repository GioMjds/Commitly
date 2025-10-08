import {
	View,
	TextInput,
	TouchableOpacity,
	Alert,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/utils/validations';
import StyledText from '@/components/ui/StyledText';
import { Link, router } from 'expo-router';

export default function ForgotPasswordScreen() {
	const { forgotPassword } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordSchema>({
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
		<SafeAreaView className="flex-1 bg-neutral">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="flex-1 px-6 justify-center">
					<View className="mb-10">
						<StyledText
							variant="black"
							className="text-4xl text-primary mb-2"
						>
							Reset Password
						</StyledText>
						<StyledText
							variant="light"
							className="text-lg text-primary opacity-70"
						>
							Enter your email to receive reset instructions
						</StyledText>
					</View>

					<View className="space-y-6">
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
										className="bg-white rounded-2xl px-4 py-4 text-primary border border-gray-200"
										placeholder="Enter your email"
										placeholderTextColor="#94a3b8"
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
									variant="light"
									className="text-red-500 mt-1 text-sm"
								>
									{errors.email.message}
								</StyledText>
							)}
						</View>

						<TouchableOpacity
							className="bg-action rounded-2xl py-4 items-center shadow-lg shadow-action/30"
							onPress={handleSubmit(onSubmit)}
							disabled={isSubmitting}
						>
							<StyledText
								variant="semibold"
								className="text-white text-lg"
							>
								{isSubmitting
									? 'Sending...'
									: 'Send Reset Link'}
							</StyledText>
						</TouchableOpacity>

						<View className="flex-row justify-center items-center mt-6">
							<Link href="/login" asChild>
								<TouchableOpacity>
									<StyledText
										variant="semibold"
										className="text-secondary"
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
