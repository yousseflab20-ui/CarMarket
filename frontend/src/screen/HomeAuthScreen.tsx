import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StatusBar,
    Dimensions,
    ScrollView,
    Animated,
} from 'react-native';
import { Button, Card, Divider, Icon } from '@rneui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface HomeScreenProps {
    navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps): React.ReactElement {
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleSignIn = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation?.navigate('SignUp');
        }, 1500);
    };

    return (
        <ImageBackground
            source={require('../assets/image/image-CreeCompt.jpg')}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode="cover"
        >
            <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    justifyContent: 'space-between',
                    paddingVertical: 40,
                }}
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        alignItems: 'center',
                        marginTop: 20,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Text
                            style={{
                                fontSize: 36,
                                fontWeight: '800',
                                color: '#fff',
                                letterSpacing: 2,
                            }}
                        >
                            CAR MARKET
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'rgba(255, 255, 255, 0.8)',
                            marginTop: 8,
                            letterSpacing: 1,
                        }}
                    >
                        Discover Your Dream Car
                    </Text>
                </Animated.View>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        paddingHorizontal: 20,
                        gap: 12,
                        paddingBottom: 20,
                    }}
                >
                    <Button
                        title="Sign In"
                        onPress={handleSignIn}
                        loading={loading}
                        buttonStyle={{
                            backgroundColor: '#3134F8',
                            paddingVertical: 14,
                            borderRadius: 12,
                        }}
                        containerStyle={{ width: '100%' }}
                        titleStyle={{
                            fontSize: 16,
                            fontWeight: '700',
                            letterSpacing: 0.5,
                        }}
                        icon={
                            <Icon
                                name="arrow-forward"
                                type="ionicon"
                                color="white"
                                size={20}
                                style={{ marginRight: 8 }}
                            />
                        }
                    />
                    <Button
                        title="Browse as Guest"
                        type="outline"
                        onPress={() => navigation?.navigate('SignUp')}
                        buttonStyle={{
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            borderWidth: 1.5,
                            paddingVertical: 12,
                            borderRadius: 10,
                        }}
                        titleStyle={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: 14,
                            fontWeight: '600',
                        }}
                        containerStyle={{ width: '100%' }}
                    />
                </Animated.View>
            </View>
        </ImageBackground>
    );
}