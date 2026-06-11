import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { apiService } from '../../../services/api';
import { updateProperty } from '../../../services/propertyService';
import { useAuthStore } from '../../../stores/authStore';
import i18n from '../../../locales/i18n';
import styles from './HostPropertyDetailScreen.styles';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'HostPropertyDetail'>;

interface PropertyLocation {
  address: string;
  city: string;
  state: string;
}

interface PropertyCapacity {
  rooms: number;
  maxGuests: number;
  comfortableGuests: number;
}

interface PropertyData {
  id: string;
  host_id: string;
  name: string;
  tagline: string;
  type: string;
  location: PropertyLocation;
  capacity: PropertyCapacity;
  price_per_night: number;
  weekend_price?: number;
  amenities: string[];
  activities: string[];
  honest_notes: string;
  host_story: string;
  photos: string[];
  status: 'active' | 'under_review' | 'draft' | string;
  minimum_stay?: number;
  cancellation_policy?: string;
  bookings?: number;
}

type PropertyType = 'Homestay' | 'Farmstay' | 'Villa' | 'Boutique Hotel' | 'Cottage';
type PolicyType = 'flexible' | 'moderate' | 'strict';

export default function HostPropertyDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DetailScreenRouteProp>();
  const { propertyId, checkIn, checkOut, guests } = route.params;
  const { user } = useAuthStore();

  // Loading & Screen states
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [property, setProperty] = useState<PropertyData | null>(null);

  const isHost = property?.host_id === user?.id;

  const calculateNights = (inStr?: string, outStr?: string) => {
    if (!inStr || !outStr) return 1;
    const d1 = new Date(inStr);
    const d2 = new Date(outStr);
    const diff = d2.getTime() - d1.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const handleBookNow = () => {
    if (!property) return;
    const inDate = checkIn || new Date().toISOString().split('T')[0];
    const outDate = checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const guestCount = guests || 1;
    const nights = calculateNights(inDate, outDate);
    const totalAmount = property.price_per_night * nights;

    navigation.navigate('GuestVerification', {
      propertyId: property.id,
      propertyName: property.name,
      checkIn: inDate,
      checkOut: outDate,
      guests: guestCount,
      totalAmount,
    });
  };

  // Editable Form fields
  const [name, setName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PropertyType>('Homestay');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [rooms, setRooms] = useState<number>(1);
  const [maxGuests, setMaxGuests] = useState<number>(1);
  const [comfortableGuests, setComfortableGuests] = useState<number>(1);
  const [pricePerNight, setPricePerNight] = useState<string>('0');
  const [weekendPrice, setWeekendPrice] = useState<string>('0');
  const [minimumStay, setMinimumStay] = useState<number>(1);
  const [policy, setPolicy] = useState<PolicyType>('flexible');
  const [honestNotes, setHonestNotes] = useState<string>('');
  const [hostStory, setHostStory] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const propertyTypes: PropertyType[] = ['Homestay', 'Farmstay', 'Villa', 'Boutique Hotel', 'Cottage'];
  const amenitiesList = [
    { id: 'wifi', label: 'WiFi' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'parking', label: 'Parking' },
    { id: 'ac', label: 'AC' },
    { id: 'pool', label: 'Pool' },
    { id: 'washing', label: 'Washing Machine' },
    { id: 'hotwater', label: 'Hot Water' },
    { id: 'tv', label: 'TV' },
    { id: 'garden', label: 'Garden' },
  ];

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        Alert.alert('Session Expired', 'Please login again.');
        navigation.replace('Auth');
        return;
      }

      const data = await apiService.get<PropertyData>(`/properties/${propertyId}`, token);
      if (data) {
        setProperty(data);
        populateForm(data);
      }
    } catch (error) {
      console.error('Failed to load property details:', error);
      Alert.alert('Error', 'Failed to load property details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: PropertyData) => {
    setName(data.name || '');
    setTagline(data.tagline || '');
    
    // Type normalization
    const displayType = (data.type || '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') as PropertyType;
    setSelectedType(propertyTypes.includes(displayType) ? displayType : 'Homestay');

    setAddress(data.location?.address || '');
    setCity(data.location?.city || '');
    setState(data.location?.state || '');
    
    setRooms(data.capacity?.rooms || 1);
    setMaxGuests(data.capacity?.maxGuests || 1);
    setComfortableGuests(data.capacity?.comfortableGuests || 1);
    
    setPricePerNight(String(data.price_per_night ?? 0));
    setWeekendPrice(String(data.weekend_price ?? 0));
    
    setMinimumStay(data.minimum_stay ?? 1);
    setPolicy((data.cancellation_policy || 'flexible') as PolicyType);
    setHonestNotes(data.honest_notes || '');
    setHostStory(data.host_story || '');
    setSelectedAmenities(data.amenities || []);
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const handleBack = () => {
    if (isEditing) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your edits?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            if (property) populateForm(property);
            setIsEditing(false);
          }}
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !city.trim() || !state.trim() || !address.trim()) {
      Alert.alert('Required Fields', 'Property Name, Complete Address, City, and State are required.');
      return;
    }

    setSaveLoading(true);
    try {
      const updates = {
        name,
        tagline,
        type: selectedType,
        address,
        city,
        state,
        rooms,
        maxGuests,
        comfortableGuests,
        pricePerNight: parseFloat(pricePerNight) || 0,
        weekendPrice: parseFloat(weekendPrice) || 0,
        minimumStay,
        cancellationPolicy: policy,
        honestNotes,
        hostStory,
        amenities: selectedAmenities,
      };

      const result = await updateProperty(propertyId, updates);
      if (result.success) {
        Alert.alert('Success', 'Property updated successfully!');
        setIsEditing(false);
        fetchPropertyDetails();
      } else {
        Alert.alert('Update Failed', result.error || 'Failed to save updates.');
      }
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'An error occurred while saving.');
    } finally {
      setSaveLoading(false);
    }
  };

  const renderStatusBanner = () => {
    if (!property) return null;
    const status = property.status?.toLowerCase();
    if (status === 'active') {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#E6F2EF' }]}>
          <Feather name="check-circle" size={16} color="#1A6B5A" />
          <Text style={[styles.statusBannerText, { color: '#1A6B5A' }]}>
            ACTIVE — Your property is live
          </Text>
        </View>
      );
    } else if (status === 'under_review') {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#F5E6D0' }]}>
          <Feather name="clock" size={16} color="#D4704A" />
          <Text style={[styles.statusBannerText, { color: '#D4704A' }]}>
            UNDER REVIEW — Our team is reviewing your listing
          </Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#F0EDE8' }]}>
          <Feather name="edit-3" size={16} color="#6B7370" />
          <Text style={[styles.statusBannerText, { color: '#6B7370' }]}>
            DRAFT — Not published yet
          </Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D4704A" />
        <Text style={{ color: '#FAF8F4', marginTop: 12 }}>Loading details...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FAF8F4' }}>Failed to find property details.</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Property Details</Text>
          {isHost ? (
            <TouchableOpacity 
              onPress={() => {
                if (isEditing) {
                  handleBack();
                } else {
                  setIsEditing(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.editButton}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {renderStatusBanner()}

        <ScrollView contentContainerStyle={[styles.scrollContent, !isHost && { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
          {/* Cover Photo */}
          {property.photos && property.photos.length > 0 ? (
            <Image source={{ uri: property.photos[0] }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={48} color="#6B7370" />
            </View>
          )}

          {/* VIEW MODE */}
          {!isEditing ? (
            <View>
              <Text style={styles.propertyName}>{property.name}</Text>
              
              <View style={styles.typeRow}>
                <View style={styles.typeChip}>
                  <Text style={styles.typeChipText}>
                    {property.type ? property.type.replace('_', ' ').toUpperCase() : 'HOMESTAY'}
                  </Text>
                </View>
              </View>

              <Text style={styles.locationText}>
                📍 {property.location?.city}, {property.location?.state}
              </Text>

              <Text style={styles.priceText}>
                ₹{(property.price_per_night ?? 0).toLocaleString('en-IN')} / night
              </Text>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>VIEWS</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{property.bookings ?? 0}</Text>
                  <Text style={styles.statLabel}>BOOKINGS</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>N/A</Text>
                  <Text style={styles.statLabel}>RATING</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>₹0</Text>
                  <Text style={styles.statLabel}>REVENUE</Text>
                </View>
              </View>

              {/* Technical Details */}
              <View style={styles.detailsCard}>
                <View style={styles.detailItem}>
                  <Text style={styles.sectionLabel}>CAPACITY</Text>
                  <Text style={styles.detailValue}>
                    Rooms: {property.capacity?.rooms || 1} | Max Guests: {property.capacity?.maxGuests || 1} | Comfort: {property.capacity?.comfortableGuests || 1}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.sectionLabel}>PRICE</Text>
                  <Text style={styles.detailValue}>
                    Base: ₹{(property.price_per_night ?? 0).toLocaleString('en-IN')} | Weekend: ₹{(property.weekend_price ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.sectionLabel}>MINIMUM STAY</Text>
                  <Text style={styles.detailValue}>
                    {property.minimum_stay ?? 1} {property.minimum_stay === 1 ? 'night' : 'nights'}
                  </Text>
                </View>

                <View style={styles.detailItemLast}>
                  <Text style={styles.sectionLabel}>CANCELLATION POLICY</Text>
                  <Text style={styles.detailValue}>
                    {property.cancellation_policy ? property.cancellation_policy.toUpperCase() : 'FLEXIBLE'}
                  </Text>
                </View>
              </View>

              {/* Amenities Section */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>AMENITIES</Text>
                <View style={styles.amenitiesGrid}>
                  {property.amenities && property.amenities.length > 0 ? (
                    property.amenities.map((amenityId) => {
                      const label = amenitiesList.find(a => a.id === amenityId)?.label ?? amenityId;
                      return (
                        <View key={amenityId} style={[styles.amenityChip, styles.amenityChipSelected]}>
                          <Text style={styles.amenityChipTextSelected}>{label}</Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noPhotosText}>No amenities specified</Text>
                  )}
                </View>
              </View>

              {/* Photos Grid */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>PHOTOS</Text>
                {property.photos && property.photos.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosList}>
                    {property.photos.map((photoUrl, idx) => (
                      <Image key={idx} source={{ uri: photoUrl }} style={styles.photoThumbnail} />
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noPhotosText}>No photos added</Text>
                )}
              </View>

              {/* Honest Notes */}
              {!!property.honest_notes && (
                <View style={styles.detailsCard}>
                  <Text style={styles.sectionLabel}>HONEST NOTES</Text>
                  <Text style={styles.detailValue}>{property.honest_notes}</Text>
                </View>
              )}

              {/* Host Story */}
              {!!property.host_story && (
                <View style={styles.detailsCard}>
                  <Text style={styles.sectionLabel}>HOST STORY</Text>
                  <Text style={styles.detailValue}>{property.host_story}</Text>
                </View>
              )}
            </View>
          ) : (
            // EDIT MODE
            <View style={{ paddingVertical: 16 }}>
              {/* PROPERTY NAME */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>PROPERTY NAME</Text>
                <TextInput
                  style={styles.editInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter property name"
                />
              </View>

              {/* TAGLINE */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>TAGLINE</Text>
                <TextInput
                  style={styles.editInput}
                  value={tagline}
                  onChangeText={setTagline}
                  placeholder="Enter tagline"
                />
              </View>

              {/* PROPERTY TYPE */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>PROPERTY TYPE</Text>
                <View style={styles.amenitiesGrid}>
                  {propertyTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.amenityChip, selectedType === type && styles.amenityChipSelected]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text style={[styles.amenityChipText, selectedType === type && styles.amenityChipTextSelected]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ADDRESS details */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>STREET ADDRESS</Text>
                <TextInput
                  style={styles.editInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter street address"
                />
                
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>CITY</Text>
                <TextInput
                  style={styles.editInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                />

                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>STATE</Text>
                <TextInput
                  style={styles.editInput}
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                />
              </View>

              {/* CAPACITY */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>ROOMS</Text>
                <TextInput
                  style={styles.editInput}
                  value={String(rooms)}
                  keyboardType="numeric"
                  onChangeText={(val) => setRooms(parseInt(val) || 1)}
                />

                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>MAX GUESTS</Text>
                <TextInput
                  style={styles.editInput}
                  value={String(maxGuests)}
                  keyboardType="numeric"
                  onChangeText={(val) => setMaxGuests(parseInt(val) || 1)}
                />

                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>COMFORTABLE GUESTS</Text>
                <TextInput
                  style={styles.editInput}
                  value={String(comfortableGuests)}
                  keyboardType="numeric"
                  onChangeText={(val) => setComfortableGuests(parseInt(val) || 1)}
                />
              </View>

              {/* PRICING */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>BASE PRICE PER NIGHT (₹)</Text>
                <TextInput
                  style={styles.editInput}
                  value={pricePerNight}
                  keyboardType="numeric"
                  onChangeText={setPricePerNight}
                />

                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>WEEKEND PRICE (₹)</Text>
                <TextInput
                  style={styles.editInput}
                  value={weekendPrice}
                  keyboardType="numeric"
                  onChangeText={setWeekendPrice}
                />
              </View>

              {/* MINIMUM STAY */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>MINIMUM STAY (NIGHTS)</Text>
                <TextInput
                  style={styles.editInput}
                  value={String(minimumStay)}
                  keyboardType="numeric"
                  onChangeText={(val) => setMinimumStay(parseInt(val) || 1)}
                />
              </View>

              {/* CANCELLATION POLICY */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>CANCELLATION POLICY</Text>
                <View style={styles.amenitiesGrid}>
                  {(['flexible', 'moderate', 'strict'] as PolicyType[]).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.amenityChip, policy === p && styles.amenityChipSelected]}
                      onPress={() => setPolicy(p)}
                    >
                      <Text style={[styles.amenityChipText, policy === p && styles.amenityChipTextSelected]}>
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* AMENITIES */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>AMENITIES</Text>
                <View style={styles.amenitiesGrid}>
                  {amenitiesList.map((item) => {
                    const isSelected = selectedAmenities.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.amenityChip, isSelected && styles.amenityChipSelected]}
                        onPress={() => toggleAmenity(item.id)}
                      >
                        <Text style={[styles.amenityChipText, isSelected && styles.amenityChipTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Instagram Reels Connection Button */}
              <TouchableOpacity
                style={styles.instagramReelsBtn}
                onPress={() => navigation.navigate(
                  'InstagramConnect',
                  { 
                    propertyId: property.id,
                    propertyName: property.name 
                  }
                )}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name="instagram" 
                  size={20} 
                  color="#833AB4" 
                />
                <Text style={styles.instagramReelsBtnText}>
                  Manage Reels
                </Text>
                <Feather 
                  name="chevron-right" 
                  size={16} 
                  color="#6B7370" 
                />
              </TouchableOpacity>

              {/* HONEST NOTES */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>HONEST NOTES</Text>
                <TextInput
                  style={styles.editInputMultiline}
                  value={honestNotes}
                  onChangeText={setHonestNotes}
                  multiline
                  placeholder="Tell guests about rules or nuances..."
                />
              </View>

              {/* HOST STORY */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionLabel}>HOST STORY</Text>
                <TextInput
                  style={styles.editInputMultiline}
                  value={hostStory}
                  onChangeText={setHostStory}
                  multiline
                  placeholder="Share a welcoming story about the cabin or property..."
                />
              </View>

              {/* ACTION BUTTONS */}
              {saveLoading ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color="#D4704A" />
                </View>
              ) : (
                <View>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => {
                      if (property) populateForm(property);
                      setIsEditing(false);
                    }} 
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        {!isHost && property && (
          <View style={styles.bookingBar}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>₹{(property.price_per_night ?? 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.priceLabel}>/ night</Text>
            </View>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={handleBookNow}
              activeOpacity={0.8}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
