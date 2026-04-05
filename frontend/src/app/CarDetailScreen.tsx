import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform,
    Share,
    Modal,
    TextInput,
    Pressable,
    FlatList,
    Animated,
    StatusBar,
    SafeAreaView
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import ViewShot from "react-native-view-shot";
import {
    ArrowLeft,
    Share2,
    MapPin,
    Fuel,
    Users,
    Gauge,
    Clock,
    CheckCircle,
    Phone,
    Star,
    ChevronRight,
    Shield,
    RotateCcw,
    Headphones,
    Car as CarIcon,
    BadgeCheck,

    Edit,
} from "lucide-react-native";
import { useRef } from "react";
import { message } from "../service/chat/endpoint.message";
import * as Sharing from "expo-sharing";
import { createRating, getSellerRating } from "../service/rating/endpointrating";
import { useAuthStore } from "../store/authStore";
import { Car } from "../types/car";
import { User } from "../types/user";
import { SellerRatingResponse } from "../types/rating";
import { CarDetailParams, SpecCardProps, SellerCardProps, RateSellerModalProps, PerkChipProps, SectionHeaderProps } from "../types/screens/carDetail";

const { width: SCREEN_W } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

const C = {
    bg: "#080B12",
    surface: "#0D1117",
    card: "#131929",
    border: "#1E2A3A",
    elevated: "#182030",
    blue: "#3B82F6",
    blueDark: "#1D4ED8",
    blueGlow: "rgba(59,130,246,0.18)",
    green: "#10B981",
    greenGlow: "rgba(16,185,129,0.15)",
    amber: "#F59E0B",
    red: "#EF4444",
    purple: "#8B5CF6",
    cyan: "#06B6D4",
    white: "#F0F6FF",
    muted: "#8B9CB8",
    dim: "#5A6A82",
    faint: "#2A3A52",
    textDim: "#4A5A72",
};

export default function CarDetailScreen() {
    const params = useLocalSearchParams<any>();
    const { user, car, user2Id } = params as unknown as CarDetailParams;

    const queryClient = useQueryClient();
    const scrollY = useRef(new Animated.Value(0)).current;
    const viewRef = useRef<ViewShot>(null);

    const { user: currentUser } = useAuthStore();
    const user2IdNum = user2Id ? parseInt(user2Id) : undefined;
    const userObj = user ? JSON.parse(user) as User : null;
    const carObj = car ? JSON.parse(car) as Car : null;

    const isOwner = currentUser?.id === user2IdNum;

    if (!carObj) {
        return (
            <View style={styles.errorWrap}>
                <CarIcon size={48} color={C.dim} />

                <Text style={styles.errorText}>Car data missing.</Text>
            </View>
        );
    }

    const [activeImg, setActiveImg] = useState(0);
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");

    const images: string[] = Array.isArray(carObj.images) && carObj.images.length > 0
        ? carObj.images
        : [];

    const messageMutation = useMutation<any, Error, number>({
        mutationFn: message,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message"] }),
    });


    const { data: sellerRating } = useQuery<SellerRatingResponse, Error>({
        queryKey: ["getSellerRating", user2IdNum],
        queryFn: () => getSellerRating(user2IdNum!)
    })


    const submitRating = useMutation({
        mutationFn: (vars: { sellerId: number; rating: number; comment: string }) =>
            createRating(vars.sellerId, vars.rating, vars.comment),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ["getSellerRating", vars.sellerId] });
            setRateModalVisible(false);
            setUserRating(0);
            setUserComment("");
            Alert.alert("Success", "Thank you for your rating!");
        },
        onError: (err) => {
            console.error("❌ Rating submission failed:", err);
            Alert.alert("Error", "Failed to submit rating. Please try again.");
        }
    });
    console.log("rating user", sellerRating)

    const handleShare = async () => {
        try {
            if (!viewRef.current?.capture) return;

            const uri = await viewRef.current.capture();

            await Sharing.shareAsync(uri, {
                mimeType: "image/png",
                dialogTitle: "Share this car 🚗",
            });

        } catch (error) {
            console.log(error);
        }
    };

    const handleMessage = async () => {
        if (!user2IdNum) {
            Alert.alert("Error", "Seller information is missing.");
            return;
        }
        messageMutation.mutate(user2IdNum, {
            onSuccess: (data: { conversation: { id: any; }; id: any; conv: { id: any; }; }) => {
                const conversationId = data?.conversation?.id || data?.id || data?.conv?.id;
                if (conversationId) {
                    router.push({
                        pathname: "/ViewMessaageUse",
                        params: {
                            conversationId: conversationId.toString(),
                            otherUserId: user2IdNum.toString(),
                            otherUserName: userObj?.name || "Seller",
                            otherUserPhoto: userObj?.photo || "",
                        },
                    });
                } else {
                    Alert.alert("Error", "Failed to retrieve conversation.");
                }
            },
            onError: (err: any) => {
                console.error("❌ Failed to open conversation:", err);
                Alert.alert("Error", "Could not open conversation.");
            },
        });
    };

    const headerBg = scrollY.interpolate({
        inputRange: [IMAGE_HEIGHT - 80, IMAGE_HEIGHT - 20],
        outputRange: ["rgba(8,11,18,0)", "rgba(8,11,18,1)"],
        extrapolate: "clamp",
    });

    const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
    const topPad = statusBarHeight + 12;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <Animated.View style={[styles.stickyHeader, { backgroundColor: headerBg, paddingTop: topPad }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <ArrowLeft size={20} color={C.white} />
                </TouchableOpacity>
                <Text style={styles.stickyTitle} numberOfLines={1}>
                    {carObj.title}
                </Text>
                <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                    <Share2 size={18} color={C.white} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                <ViewShot ref={viewRef} options={{ format: "jpg", quality: 0.9 }}>
                    <View style={styles.imageWrap}>
                        {images.length > 0 ? (
                            <FlatList
                                data={images}
                                keyExtractor={(_, i) => i.toString()}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(e) => {
                                    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                                    setActiveImg(idx);
                                }}
                                renderItem={({ item }) => (
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.carImage}
                                        resizeMode="cover"
                                    />
                                )}
                            />
                        ) : (
                            <View style={styles.imageFallback}>
                                <View style={styles.imageFallbackIcon}>
                                    <CarIcon size={52} color={C.dim} />

                                </View>
                                <Text style={styles.imageFallbackText}>No photos available</Text>
                            </View>
                        )}

                        <View style={styles.imgGradientBottom} pointerEvents="none" />
                        <View style={styles.imgGradientTop} pointerEvents="none" />

                        {images.length > 1 && (
                            <View style={styles.dotsRow}>
                                {images.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[styles.dot, i === activeImg && styles.dotActive]}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={styles.badgesRow}>
                            <View style={[styles.badge, styles.badgeGreen]}>
                                <CheckCircle size={11} color={C.green} />
                                <Text style={[styles.badgeText, { color: C.green }]}>Available Now</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Luxury Edition</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.contentCard}>
                        <View style={styles.handle} />

                        <View style={styles.section}>
                            <Text style={styles.brandTag}>{carObj.brand ?? "Premium Brand"}</Text>
                            <Text style={styles.carTitle}>{carObj.title}</Text>
                            <View style={styles.subtitleRow}>
                                <View style={styles.yearChip}>
                                    <Text style={styles.yearChipText}>{carObj.year}</Text>
                                </View>
                                <View style={styles.ratingRow}>
                                    <Star size={12} color={C.amber} fill={C.amber} />
                                    <Text style={styles.ratingText}>4.8 · 127 reviews</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.specsGrid}>
                            <SpecCard
                                icon={<Gauge size={20} color={C.amber} />}
                                value={carObj.speed ?? 195}
                                unit="mph top"
                                accentColor={C.amber}
                            />
                            <SpecCard
                                icon={<Users size={20} color={C.blue} />}
                                value={carObj.seats ?? 5}
                                unit="seats"
                                accentColor={C.blue}
                            />
                            <SpecCard
                                icon={<Fuel size={20} color={C.green} />}
                                value={(carObj.mileage ?? 0).toLocaleString()}
                                unit="km range"
                                accentColor={C.green}
                            />
                        </View>

                        <Divider />

                        <View style={styles.section}>
                            <SectionHeader title="Listed by" action="View profile →" />
                            <SellerCard user={userObj} rating={sellerRating || null} onRate={() => setRateModalVisible(true)} reviews={sellerRating?.totalRatings || 0} />

                        </View>

                        <Divider />

                        <View style={styles.section}>
                            <SectionHeader title={`Reviews (${sellerRating?.totalRatings || 0})`} />
                            {Array.isArray(sellerRating?.ratings) && sellerRating?.ratings.length > 0 ? (
                                <View style={styles.reviewsList}>
                                    <ReviewItem review={sellerRating.ratings[0]} />
                                    {sellerRating.totalRatings > 0 && (
                                        <TouchableOpacity 
                                            style={styles.viewMoreReviewsBtn}
                                            onPress={() => {
                                                router.push({
                                                    pathname: "/ReviewsScreen",
                                                    params: {
                                                        sellerId: user2IdNum,
                                                        sellerName: userObj?.name || "Seller"
                                                    }
                                                });
                                            }}
                                        >
                                            <Text style={styles.viewMoreReviewsText}>
                                                View all {sellerRating.totalRatings} reviews →
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to rate this seller!</Text>
                            )}
                        </View>

                        <Divider />

                        <View style={styles.section}>
                            <SectionHeader title="Rental Details" />
                            <View style={styles.rentalRow}>
                                <View style={styles.rentalBox}>
                                    <Clock size={22} color={C.blue} />
                                    <Text style={styles.rentalLabel}>Daily Rate</Text>
                                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                                        <Text style={styles.rentalValue}>${carObj.pricePerDay}</Text>
                                        <Text style={styles.rentalUnit}>/day</Text>
                                    </View>
                                </View>
                                <View style={[styles.rentalBox, styles.rentalBoxGreen]}>
                                    <CheckCircle size={22} color={C.green} />
                                    <Text style={styles.rentalLabel}>Availability</Text>
                                    <Text style={[styles.rentalValue, { color: C.green, fontSize: 14 }]}>
                                        Ready Now
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.perksRow}>
                                <PerkChip icon={<Shield size={12} color={C.blue} />} label="Full Insurance" color={C.blue} />
                                <PerkChip icon={<RotateCcw size={12} color={C.muted} />} label="Free Cancel" color={C.muted} />
                                <PerkChip icon={<Headphones size={12} color={C.muted} />} label="24/7 Support" color={C.muted} />
                            </View>
                        </View>

                        <Divider />

                        <View style={styles.section}>
                            <SectionHeader title="Location" action="View Map →" />
                            <TouchableOpacity style={styles.locationCard} activeOpacity={0.7}>
                                <View style={styles.locationIconWrap}>
                                    <MapPin size={22} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.locationLabel}>Pickup Location</Text>
                                    <Text style={styles.locationName}>{carObj.location || "Marrakech, Morocco"}</Text>
                                </View>
                                <ChevronRight size={18} color={C.muted} />
                            </TouchableOpacity>
                        </View>

                        <Divider />

                        <View style={styles.section}>
                            <SectionHeader title="About this car" />
                            <Text style={styles.aboutText}>{carObj.description ?? "No description available."}</Text>
                        </View>

                        <View style={{ height: 120 }} />
                    </View>
                </ViewShot>
            </Animated.ScrollView>

            <Animated.View style={styles.ctaWrap}>
                <View style={styles.ctaInner}>
                    <View>
                        <Text style={styles.fromLabel}>{isOwner ? "Listed Price" : "Total Price"}</Text>
                        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                            <Text style={styles.ctaPrice}>${carObj.pricePerDay}</Text>
                            <Text style={styles.ctaPerDay}>/day</Text>
                        </View>
                    </View>

                    {isOwner ? (
                        <View style={styles.ctaBtns}>
                            <TouchableOpacity
                                style={styles.editListingBtn}
                                onPress={() => {
                                    router.push({
                                        pathname: "/EditCarScreen",
                                        params: { id: carObj.id }
                                    });
                                }}
                            >
                                <Edit size={18} color={C.blue} />
                                <Text style={[styles.messageBtnText, { color: C.blue }]}>Manage Listing</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.ctaBtns}>
                            <TouchableOpacity
                                style={styles.callBtn}
                                onPress={() => {
                                    router.push({
                                        pathname: "/CallScreen",
                                        params: {
                                            callID: `car_${carObj.id}_${user2IdNum}_${Date.now()}`,
                                            isVideoCall: 'true'
                                        }
                                    });
                                }}
                            >
                                <Phone size={22} color={C.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.messageBtn, messageMutation.isPending && styles.messageBtnLoading]}
                                onPress={handleMessage}
                                disabled={messageMutation.isPending}
                            >
                                <Text style={styles.messageBtnText}>
                                    {messageMutation.isPending ? "Connecting..." : "Contact"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Animated.View>

            <RateSellerModal
                visible={rateModalVisible}
                onClose={() => setRateModalVisible(false)}
                sellerName={userObj?.name || "Seller"}
                userRating={userRating}
                setUserRating={setUserRating}
                userComment={userComment}
                setUserComment={setUserComment}
                onSubmit={() => submitRating.mutate({
                    sellerId: user2IdNum!,
                    rating: userRating,
                    comment: userComment
                })}
                isSubmitting={submitRating.isPending}
            />
        </View>
    );
}


function SpecCard({
    icon,
    value,
    unit,
    accentColor,
}: SpecCardProps) {

    return (
        <View style={[styles.specCard, { borderTopColor: accentColor }]}>
            <View style={[styles.specIconWrap, { backgroundColor: accentColor + "18" }]}>
                {icon}
            </View>
            <Text style={styles.specValue}>{value}</Text>
            <Text style={styles.specUnit}>{unit}</Text>
        </View>
    );
}

function SellerCard({ user, rating, onRate }: SellerCardProps) {

    if (!user) return null;
    const avgRating = Number(rating?.averageRating || 0).toFixed(1);
    const totalRatings = rating?.totalRatings ?? 0;

    return (
        <View style={styles.premiumSellerCard}>
            <View style={styles.sellerMainInfo}>
                <View style={styles.sellerAvatarWrapper}>
                    {user.photo ? (
                        <Image source={{ uri: user.photo }} style={styles.sellerAvatarImg} />
                    ) : (
                        <View style={[styles.sellerAvatarImg, styles.sellerAvatarPlaceholder]}>
                            <Text style={styles.sellerAvatarText}>
                                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                            </Text>
                        </View>
                    )}
                    {user.verified && (
                        <View style={styles.verifiedBadgeIcon}>
                            <BadgeCheck size={14} color="#fff" fill="#3B82F6" />
                        </View>
                    )}
                </View>

                <View style={styles.sellerTextInfo}>
                    <View style={styles.sellerNameRow}>
                        <Text style={styles.pSellerName} numberOfLines={1}>{user.name ?? "Seller"}</Text>
                        {user.verified && (
                            <View style={styles.verifiedTag}>
                                <Shield size={10} color={C.blue} fill={C.blue + "20"} />
                                <Text style={styles.verifiedTagText}>Verified</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.pRatingRow}>
                        <View style={styles.pStarsGroup}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={10}
                                    color={s <= Math.floor(Number(avgRating)) ? C.amber : "rgba(255,255,255,0.1)"}
                                    fill={s <= Math.floor(Number(avgRating)) ? C.amber : "transparent"}
                                />
                            ))}
                        </View>
                        <Text style={styles.pRatingValue}>{avgRating}</Text>
                        <Text style={styles.pReviewCount}>({totalRatings} reviews)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sellerCardDivider} />
            {/* test photo user */}
            <View style={styles.sellerActionsRow}>
                <TouchableOpacity style={styles.pViewProfileBtn} onPress={() => router.push({
                    pathname: "SellerProfile",
                    params: {
                        user: JSON.stringify(user)
                    }
                })}>
                    <Text style={styles.pViewProfileBtnText}>View Profile</Text>
                    <ChevronRight size={14} color={C.muted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.pRateSellerBtn} onPress={onRate}>
                    <Star size={14} color={C.amber} fill={C.amber} />
                    <Text style={styles.pRateSellerBtnText}>Rate Seller</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function RateSellerModal({
    visible,
    onClose,
    sellerName,
    userRating,
    setUserRating,
    userComment,
    setUserComment,
    onSubmit,
    isSubmitting
}: RateSellerModalProps) {

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalDismiss} onPress={onClose} />
                <Animated.View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Rate {sellerName}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                            <Text style={{ color: C.muted, fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ratingStarsLarge}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setUserRating(star)}
                                style={styles.starTouch}
                            >
                                <Star
                                    size={36}
                                    color={star <= userRating ? C.amber : C.border}
                                    fill={star <= userRating ? C.amber : "transparent"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.inputLabel}>Your experience (optional)</Text>
                    <TextInput
                        style={styles.ratingInput}
                        placeholder="Write something about the seller..."
                        placeholderTextColor={C.dim}
                        multiline
                        numberOfLines={4}
                        value={userComment}
                        onChangeText={setUserComment}
                    />
                    {/* alert for submit rating */}
                    <TouchableOpacity
                        style={[styles.submitRatingBtn, (!userRating || isSubmitting) && styles.submitDisabled]}
                        disabled={!userRating || isSubmitting}
                        onPress={onSubmit}
                    >
                        <Text style={styles.submitRatingBtnText}>
                            {isSubmitting ? "Submitting..." : "Submit Rating"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

function SectionHeader({
    title,
    action,
}: SectionHeaderProps) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {action && <Text style={styles.sectionAction}>{action}</Text>}
        </View>
    );
}

function PerkChip({
    icon,
    label,
    color,
}: PerkChipProps) {

    return (
        <View style={[styles.perkChip, { borderColor: color + "30" }]}>
            {icon}
            <Text style={[styles.perkLabel, { color }]}>{label}</Text>
        </View>
    );
}

function ReviewItem({ review }: { review: any }) {
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const buyerName = review?.buyer?.name || "Client";
    const buyerPhoto = review?.buyer?.photo || defaultAvatar;

    return (
        <View style={styles.reviewItemCard}>
            <View style={styles.reviewHeader}>
                <Image source={{ uri: buyerPhoto }} style={styles.reviewAvatar} />
                <View style={styles.reviewHeaderContent}>
                    <Text style={styles.reviewBuyerName}>{buyerName}</Text>
                    <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            size={12}
                            color={s <= review.rating ? C.amber : "rgba(255,255,255,0.1)"}
                            fill={s <= review.rating ? C.amber : "transparent"}
                        />
                    ))}
                </View>
            </View>
            {!!review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
            )}
        </View>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.bg,
    },
    errorWrap: {
        flex: 1,
        backgroundColor: C.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    errorText: { color: C.muted, fontSize: 15, fontFamily: 'Lexend_400Regular' },

    stickyHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    stickyTitle: {
        flex: 1,
        textAlign: "center",
        color: C.white,
        fontSize: 15,
        fontFamily: "Lexend_700Bold",
        marginHorizontal: 8,
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconBtnLiked: {
        backgroundColor: "rgba(239,68,68,0.22)",
        borderColor: "rgba(239,68,68,0.4)",
    },

    imageWrap: {
        width: SCREEN_W,
        height: IMAGE_HEIGHT,
        backgroundColor: C.card,
        position: "relative",
        overflow: "hidden",
    },
    carImage: {
        width: SCREEN_W,
        height: IMAGE_HEIGHT,
    },
    imageFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.card,
        gap: 12,
    },
    imageFallbackIcon: {
        width: 90,
        height: 90,
        borderRadius: 24,
        backgroundColor: C.elevated,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
    },
    imageFallbackText: {
        color: C.dim,
        fontSize: 13,
        fontFamily: "Lexend_400Regular",
    },
    imgGradientTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: "transparent",
        opacity: 0.7,
    },
    imgGradientBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: "transparent",
    },
    imgTopRow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    dotsRow: {
        position: "absolute",
        bottom: 56,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    dotActive: {
        width: 20,
        borderRadius: 2.5,
        backgroundColor: "#fff",
    },
    badgesRow: {
        position: "absolute",
        bottom: 20,
        left: 16,
        flexDirection: "row",
        gap: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    badgeGreen: {
        backgroundColor: "rgba(16,185,129,0.15)",
        borderColor: "rgba(16,185,129,0.4)",
    },
    badgeText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 11,
        fontFamily: "Lexend_600SemiBold",
    },

    contentCard: {
        backgroundColor: C.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: C.faint,
        alignSelf: "center",
        marginTop: 14,
        marginBottom: 22,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    sectionTitle: {
        color: C.white,
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.2,
    },
    sectionAction: {
        color: C.blue,
        fontSize: 12,
        fontFamily: "Lexend_600SemiBold",
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginHorizontal: 20,
        marginVertical: 20,
        opacity: 0.6,
    },
    reviewsList: {
        flexDirection: "column",
        gap: 12,
    },
    viewMoreReviewsBtn: {
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "rgba(59,130,246,0.1)",
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.2)",
        marginTop: 6,
    },
    viewMoreReviewsText: {
        color: C.blue,
        fontSize: 13,
        fontFamily: "Lexend_600SemiBold",
    },
    emptyReviewsText: {
        color: C.dim,
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
        textAlign: "center",
        paddingVertical: 10,
        fontStyle: "italic",
    },
    reviewItemCard: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: C.border,
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: C.elevated,
    },
    reviewHeaderContent: {
        flex: 1,
    },
    reviewBuyerName: {
        color: C.white,
        fontSize: 14,
        fontFamily: "Lexend_600SemiBold",
    },
    reviewDate: {
        color: C.dim,
        fontSize: 11,
        fontFamily: "Lexend_400Regular",
        marginTop: 2,
    },
    reviewStars: {
        flexDirection: "row",
        gap: 2,
    },
    reviewComment: {
        color: C.muted,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "Lexend_400Regular",
    },

    brandTag: {
        color: C.blue,
        fontSize: 11,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 2.5,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    carTitle: {
        color: C.white,
        fontSize: 28,
        fontFamily: "Lexend_800ExtraBold",
        lineHeight: 32,
        marginBottom: 10,
    },
    subtitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    yearChip: {
        backgroundColor: C.card,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: C.border,
    },
    yearChipText: {
        color: C.muted,
        fontSize: 12,
        fontFamily: "Lexend_600SemiBold",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: C.muted,
        fontSize: 12,
        fontFamily: "Lexend_500Medium",
    },

    specsGrid: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    specCard: {
        flex: 1,
        backgroundColor: C.card,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: "center",
        gap: 6,
        borderTopWidth: 2.5,
        borderWidth: 1,
        borderColor: C.border,
    },
    specIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    specValue: {
        color: C.white,
        fontSize: 18,
        fontFamily: "Lexend_800ExtraBold",
        marginTop: 2,
    },
    specUnit: {
        color: C.textDim,
        fontSize: 10,
        fontFamily: "Lexend_400Regular",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    sellerCard: {
        backgroundColor: C.elevated,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    sellerPhotoWrap: {
        position: "relative",
        flexShrink: 0,
    },
    sellerPhoto: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: C.border,
    },
    sellerPhotoFallback: {
        backgroundColor: C.blueDark,
        alignItems: "center",
        justifyContent: "center",
    },
    verifiedBadge: {
        position: "absolute",
        bottom: -3,
        right: -3,
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    sellerName: {
        color: C.white,
        fontSize: 15,
        fontFamily: "Lexend_700Bold",
        marginBottom: 2,
    },
    sellerEmail: {
        color: C.textDim,
        fontSize: 12,
        fontFamily: "Lexend_400Regular",
        marginBottom: 6,
    },
    sellerStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    sellerStatText: {
        color: C.dim,
        fontSize: 11,
        fontFamily: "Lexend_500Medium",
    },
    ratingStars: {
        flexDirection: "row",
        gap: 2,
        marginRight: 4,
    },
    dotSep: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: C.faint,
        marginHorizontal: 8,
    },
    profileArrow: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
    },

    rentalRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 14,
    },
    rentalBox: {
        flex: 1,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 6,
    },
    rentalBoxGreen: {
        borderColor: "rgba(16,185,129,0.25)",
        backgroundColor: "rgba(16,185,129,0.06)",
    },
    rentalLabel: {
        color: C.textDim,
        fontSize: 10,
        fontFamily: "Lexend_400Regular",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    rentalValue: {
        color: C.white,
        fontSize: 20,
        fontFamily: "Lexend_800ExtraBold",
    },
    rentalUnit: {
        color: C.textDim,
        fontSize: 12,
        fontFamily: "Lexend_400Regular",
    },
    perksRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    perkChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: C.card,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    perkLabel: {
        fontSize: 11,
        fontFamily: "Lexend_500Medium",
    },

    locationCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 16,
        padding: 14,
        gap: 12,
    },
    locationIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(239,68,68,0.1)",
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    locationLabel: {
        color: C.textDim,
        fontSize: 10,
        fontFamily: "Lexend_400Regular",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    locationName: {
        color: C.white,
        fontSize: 14,
        fontFamily: "Lexend_600SemiBold",
    },

    aboutText: {
        color: C.muted,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: "Lexend_400Regular",
    },

    ctaWrap: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: Platform.OS === "ios" ? 30 : 18,
    },
    ctaInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    fromLabel: {
        color: C.textDim,
        fontSize: 10,
        fontFamily: "Lexend_400Regular",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 2,
    },
    ctaPrice: {
        color: C.white,
        fontSize: 26,
        fontFamily: "Lexend_800ExtraBold",
    },
    ctaPerDay: {
        color: C.textDim,
        fontSize: 13,
        fontFamily: "Lexend_400Regular",
    },
    ctaBtns: {
        flexDirection: "row",
        gap: 10,
        flex: 1,
        justifyContent: "flex-end",
    },
    callBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
    },
    messageBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: C.blue,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: C.blue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 10,
    },
    messageBtnLoading: {
        opacity: 0.7,
    },
    messageBtnText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.3,
    },
    editListingBtn: {
        flex: 1,
        flexDirection: "row",
        height: 52,
        borderRadius: 16,
        backgroundColor: "rgba(59,130,246,0.1)",
        borderWidth: 1,
        borderColor: C.blue,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    // Premium Seller Card Styles
    premiumSellerCard: {
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        padding: 20,
        marginBottom: 8,
    },
    sellerMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sellerAvatarWrapper: {
        position: 'relative',
    },
    sellerAvatarImg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    sellerAvatarPlaceholder: {
        backgroundColor: C.blueDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerAvatarText: {
        color: C.white,
        fontSize: 24,
        fontFamily: "Lexend_700Bold",
    },
    verifiedBadgeIcon: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: C.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: C.surface,
    },
    sellerTextInfo: {
        flex: 1,
        gap: 4,
    },
    sellerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pSellerName: {
        color: C.white,
        fontSize: 18,
        fontFamily: "Lexend_700Bold",
    },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.2)",
    },
    verifiedTagText: {
        color: C.blue,
        fontSize: 10,
        fontFamily: "Lexend_600SemiBold",
        textTransform: 'uppercase',
    },
    pRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pStarsGroup: {
        flexDirection: 'row',
        gap: 2,
    },
    pRatingValue: {
        color: C.white,
        fontSize: 14,
        fontFamily: "Lexend_700Bold",
    },
    pReviewCount: {
        color: C.muted,
        fontSize: 12,
        fontFamily: "Lexend_400Regular",
    },
    sellerCardDivider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        marginVertical: 18,
    },
    sellerActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pViewProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pViewProfileBtnText: {
        color: C.muted,
        fontSize: 13,
        fontFamily: "Lexend_600SemiBold",
    },
    pRateSellerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.25)",
    },
    pRateSellerBtnText: {
        color: C.amber,
        fontSize: 13,
        fontFamily: "Lexend_700Bold",
    },
    // Modal & Other existing styles (I'll keep them but refine if needed)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    modalDismiss: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        backgroundColor: "#161B22",
        borderRadius: 32,
        padding: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 22,
        fontFamily: "Lexend_700Bold",
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#21262D",
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    ratingStarsLarge: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    starTouch: {
        padding: 6,
    },
    inputLabel: {
        color: "#8B9CB8",
        fontSize: 14,
        fontFamily: "Lexend_500Medium",
        marginBottom: 12,
    },
    ratingInput: {
        backgroundColor: "#0D1117",
        borderRadius: 20,
        padding: 20,
        color: "#fff",
        fontSize: 15,
        fontFamily: "Lexend_400Regular",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        textAlignVertical: 'top',
        minHeight: 120,
        marginBottom: 28,
    },
    submitRatingBtn: {
        backgroundColor: "#3B82F6",
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    submitDisabled: {
        opacity: 0.4,
        backgroundColor: "rgba(255,255,255,0.05)",
        shadowOpacity: 0,
    },
    submitRatingBtnText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
    },
});
