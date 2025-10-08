import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type FontVariant =
	| 'regular'
	| 'medium'
	| 'semibold'
	| 'extrabold'
	| 'black'
	| 'light'
	| 'extralight';

interface StyledTextProps extends RNTextProps {
	variant?: FontVariant;
}

const FONT_MAP: Record<FontVariant, string> = {
	regular: 'HubotSans-Regular',
	medium: 'HubotSans-Medium',
	semibold: 'HubotSans-SemiBold',
	extrabold: 'HubotSans-ExtraBold',
	black: 'HubotSans-Black',
	light: 'HubotSans-Light',
	extralight: 'HubotSans-ExtraLight',
};

export default function StyledText({
	variant = 'regular',
	style,
	children,
	...rest
}: StyledTextProps) {
	return (
		<RNText {...rest} style={[{ fontFamily: FONT_MAP[variant] }, style]}>
			{children}
		</RNText>
	);
}
