import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, Spacing, Shadows } from '../styles/globalStyles';
import FirebaseService from '../services/FirebaseService';

const VALID_MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const DAYS_IN_MONTH = {
  'JAN': 31, 'FEB': 28, 'MAR': 31, 'APR': 30, 'MAY': 31, 'JUN': 30,
  'JUL': 31, 'AUG': 31, 'SEP': 30, 'OCT': 31, 'NOV': 30, 'DEC': 31
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EVENT_CATEGORIES = [
  'School Event',
  'Club Event'
];

export default function AdminEventModal({ visible, event, mode, eventType, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'School Event',
    date: '',
    month: '',
    startTime: '9',
    startPeriod: 'AM',
    endTime: '',
    endPeriod: 'PM',
    location: '',
    total: '',
    description: '',
    imageUri: null,
    reward: '',
    volunteerDate: '',
    volunteerMonth: '',
    startHour: '9',
    startHourPeriod: 'AM',
    endHour: '5',
    endHourPeriod: 'PM',
    volunteersNeeded: '',
  });

  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && event) {
      let startTime = '9', startPeriod = 'AM', endTime = '', endPeriod = 'PM';
      if (event.time) {
        const timeMatch = event.time.match(/(\d{1,2}):?\d*\s*(AM|PM)\s*-?\s*(\d{1,2})?:?\d*\s*(AM|PM)?/i);
        if (timeMatch) {
          startTime = timeMatch[1] || '9';
          startPeriod = timeMatch[2]?.toUpperCase() || 'AM';
          endTime = timeMatch[3] || '';
          endPeriod = timeMatch[4]?.toUpperCase() || 'PM';
        }
      }

      setFormData({
        title: event.title || '',
        category: event.category || 'School Event',
        date: event.date || '',
        month: event.month || '',
        startTime,
        startPeriod,
        endTime,
        endPeriod,
        location: event.location || '',
        total: event.total?.toString() || '',
        description: event.description || '',
        imageUri: event.imageUri || null,
        reward: event.reward || '',
        volunteerDate: event.volunteerDate || event.startDate || '',
        volunteerMonth: event.volunteerMonth || event.startMonth || '',
        startHour: event.startHour || '9',
        startHourPeriod: event.startHourPeriod || 'AM',
        endHour: event.endHour || '5',
        endHourPeriod: event.endHourPeriod || 'PM',
        volunteersNeeded: event.volunteersNeeded?.toString() || '',
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        category: eventType === 'volunteer' ? 'Club Event' : 'School Event',
        date: '',
        month: '',
        startTime: '9',
        startPeriod: 'AM',
        endTime: '',
        endPeriod: 'PM',
        location: '',
        total: '',
        description: '',
        imageUri: null,
        reward: '',
        volunteerDate: '',
        volunteerMonth: '',
        startHour: '9',
        startHourPeriod: 'AM',
        endHour: '5',
        endHourPeriod: 'PM',
        volunteersNeeded: '',
      });
    }
  }, [mode, event, eventType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange('imageUri', result.assets[0].uri);
    }
  };

  const validateDate = (date, month) => {
    const day = parseInt(date);
    const monthUpper = month.toUpperCase();

    if (!VALID_MONTHS.includes(monthUpper)) {
      return { isValid: false, error: 'Invalid month. Please use JAN, FEB, MAR, etc.' };
    }

    const maxDays = DAYS_IN_MONTH[monthUpper];
    if (day < 1 || day > maxDays) {
      return { isValid: false, error: `Day must be between 1 and ${maxDays} for ${monthUpper}` };
    }

    return { isValid: true };
  };

  const validateTime = (startTime, startPeriod, endTime, endPeriod) => {
    const startHour = parseInt(startTime);
    if (isNaN(startHour) || startHour < 1 || startHour > 12) {
      return { isValid: false, error: 'Start time must be between 1 and 12' };
    }

    if (endTime.trim()) {
      const endHour = parseInt(endTime);
      if (isNaN(endHour) || endHour < 1 || endHour > 12) {
        return { isValid: false, error: 'End time must be between 1 and 12' };
      }

      let start24 = startHour === 12 ? 0 : startHour;
      if (startPeriod === 'PM') start24 += 12;

      let end24 = endHour === 12 ? 0 : endHour;
      if (endPeriod === 'PM') end24 += 12;

      if (end24 <= start24) {
        return { isValid: false, error: 'End time must be after start time' };
      }
    }

    return { isValid: true };
  };

  const validateForm = () => {
    const { title, date, month, startTime, startPeriod, endTime, endPeriod, location, total, description, reward, volunteerDate, volunteerMonth, startHour, startHourPeriod, endHour, endHourPeriod, volunteersNeeded } = formData;
    
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Event title is required');
      return false;
    }

    if (eventType === 'volunteer') {
      if (!reward.trim()) {
        Alert.alert('Validation Error', 'Reward is required for volunteer events');
        return false;
      }
      if (!volunteerDate.trim()) {
        Alert.alert('Validation Error', 'Volunteer date is required');
        return false;
      }
      if (!volunteerMonth.trim()) {
        Alert.alert('Validation Error', 'Volunteer month is required');
        return false;
      }
      if (!startHour.trim()) {
        Alert.alert('Validation Error', 'Start hour is required');
        return false;
      }
      if (!endHour.trim()) {
        Alert.alert('Validation Error', 'End hour is required');
        return false;
      }
      if (!volunteersNeeded.trim() || isNaN(volunteersNeeded) || parseInt(volunteersNeeded) <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid number of volunteers needed');
        return false;
      }

      const dateValidation = validateDate(volunteerDate, volunteerMonth);
      if (!dateValidation.isValid) {
        Alert.alert('Validation Error', dateValidation.error);
        return false;
      }

      const timeValidation = validateTime(startHour, startHourPeriod, endHour, endHourPeriod);
      if (!timeValidation.isValid) {
        Alert.alert('Validation Error', timeValidation.error);
        return false;
      }
    } else {
      if (!date.trim()) {
        Alert.alert('Validation Error', 'Event date is required');
        return false;
      }
      if (!month.trim()) {
        Alert.alert('Validation Error', 'Event month is required');
        return false;
      }
      if (!startTime.trim()) {
        Alert.alert('Validation Error', 'Start time is required');
        return false;
      }
      if (!location.trim()) {
        Alert.alert('Validation Error', 'Event location is required');
        return false;
      }
      if (!total.trim() || isNaN(total) || parseInt(total) <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid total capacity');
        return false;
      }
      if (!description.trim()) {
        Alert.alert('Validation Error', 'Event description is required');
        return false;
      }

      const dateValidation = validateDate(date, month);
      if (!dateValidation.isValid) {
        Alert.alert('Validation Error', dateValidation.error);
        return false;
      }

      const timeValidation = validateTime(startTime, startPeriod, endTime, endPeriod);
      if (!timeValidation.isValid) {
        Alert.alert('Validation Error', timeValidation.error);
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let eventData = {
        ...formData,
        type: eventType,
      };

      if (eventType === 'volunteer') {
        eventData = {
          title: formData.title,
          category: formData.category,
          reward: formData.reward,
          volunteerDate: formData.volunteerDate,
          volunteerMonth: formData.volunteerMonth,
          startHour: formData.startHour,
          startHourPeriod: formData.startHourPeriod,
          endHour: formData.endHour,
          endHourPeriod: formData.endHourPeriod,
          volunteersNeeded: parseInt(formData.volunteersNeeded),
          booked: mode === 'edit' ? event.booked : 0,
          type: eventType,
          date: formData.volunteerDate,
          month: formData.volunteerMonth,
          time: `${formData.startHour}:00 ${formData.startHourPeriod} - ${formData.endHour}:00 ${formData.endHourPeriod}`,
          location: 'Various Locations',
          total: parseInt(formData.volunteersNeeded),
          description: `Volunteer opportunity: ${formData.title}. Reward: ${formData.reward} points. Date: ${formData.volunteerDate} ${formData.volunteerMonth}`,
          imageSource: require('../../assets/default.png'),
          imageUri: null,
        };
      } else {
        let timeString = `${formData.startTime}:00 ${formData.startPeriod}`;
        if (formData.endTime.trim()) {
          timeString += ` - ${formData.endTime}:00 ${formData.endPeriod}`;
        }

        eventData = {
          ...formData,
          time: timeString,
          total: parseInt(formData.total),
          booked: mode === 'edit' ? event.booked : 0,
          type: eventType,
        };
      }

      if (eventType !== 'volunteer' && formData.imageUri && formData.imageUri.startsWith('file://')) {
        try {
          console.log('=== DEBUG: Environment Variables ===');
          console.log('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
          console.log('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET:', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
          console.log('========================================');
          
          console.log('Starting image upload process...');
          const uploadResult = await FirebaseService.uploadImageToCloudinary(
            formData.imageUri,
            'events'
          );

          if (uploadResult.success) {
            eventData.imageSource = { uri: uploadResult.cloudinaryURL };
            eventData.imageUri = uploadResult.cloudinaryURL;
            console.log('Image uploaded successfully to Cloudinary:', uploadResult.cloudinaryURL);
          } else {
            console.log('FormData upload failed, trying base64 method...');
            const base64UploadResult = await FirebaseService.uploadImageToCloudinaryBase64(
              formData.imageUri,
              'events'
            );
            
            if (base64UploadResult.success) {
              eventData.imageSource = { uri: base64UploadResult.cloudinaryURL };
              eventData.imageUri = base64UploadResult.cloudinaryURL;
              console.log('Image uploaded successfully with base64 method:', base64UploadResult.cloudinaryURL);
            } else {
              throw new Error(base64UploadResult.error || 'Both upload methods failed');
            }
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          
          eventData.imageSource = require('../../assets/default.png');
          eventData.imageUri = null;
          
          setTimeout(() => {
            Alert.alert(
              'Upload Notice',
              'Image upload failed. The event will be saved with the default image. You can edit the event later to add an image.',
              [{ text: 'OK' }]
            );
          }, 100);
        }
      } else if (eventType !== 'volunteer') {
        if (formData.imageUri && formData.imageUri.startsWith('https://')) {
          eventData.imageSource = { uri: formData.imageUri };
          eventData.imageUri = formData.imageUri;
        } else {
          eventData.imageSource = require('../../assets/default.png');
          eventData.imageUri = null;
        }
      }

      onSave(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'An error occurred while saving the event. Please try again.');
    }
  };

  const handleDelete = () => {
    const itemType = eventType === 'volunteer' ? 'volunteer request' : 'event';
    const itemName = eventType === 'volunteer' ? 'Request' : 'Event';
    
    Alert.alert(
      `Delete ${itemName}`,
      `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(event.id)
        }
      ]
    );
  };

  const CategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.inputLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {EVENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              formData.category === category && styles.categoryChipSelected
            ]}
            onPress={() => handleInputChange('category', category)}
          >
            <Text style={[
              styles.categoryChipText,
              formData.category === category && styles.categoryChipTextSelected
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const TimePickerComponent = ({ label, timeValue, periodValue, onTimeChange, onPeriodChange, isRequired = false }) => {
    const periods = ['AM', 'PM'];

    const handleTimeChange = (value) => {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12)) {
        onTimeChange(numericValue);
      }
    };

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.inputLabel}>{label}</Text>
          {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
        <View style={styles.timeInputRow}>
          <View style={styles.timeInputContainer}>
            <TextInput
              style={[
                styles.timeInput,
                focusedInput === `${label.toLowerCase()}Time` && styles.textInputFocused
              ]}
              value={timeValue}
              onChangeText={handleTimeChange}
              onFocus={() => setFocusedInput(`${label.toLowerCase()}Time`)}
              onBlur={() => setFocusedInput(null)}
              placeholder="12"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.timeInputLabel}>Hour</Text>
          </View>

          <View style={styles.periodButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                periodValue === 'AM' && styles.periodButtonActive
              ]}
              onPress={() => onPeriodChange('AM')}
            >
              <Text style={[
                styles.periodButtonText,
                periodValue === 'AM' && styles.periodButtonTextActive
              ]}>
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                periodValue === 'PM' && styles.periodButtonActive
              ]}
              onPress={() => onPeriodChange('PM')}
            >
              <Text style={[
                styles.periodButtonText,
                periodValue === 'PM' && styles.periodButtonTextActive
              ]}>
                PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#1987B5', '#0C3A61']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={28} color={Colors.white} />
              </TouchableOpacity>
              
              <View style={styles.headerRow}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>
                    {mode === 'create' 
                      ? (eventType === 'volunteer' ? 'Request Volunteers' : 'Create Event')
                      : 'Edit Event'
                    }
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {eventType === 'volunteer' ? 'Volunteering Event' : 'Regular Event'}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {eventType !== 'volunteer' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Image</Text>
                <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                  {formData.imageUri ? (
                    <>
                      <Image
                        source={{ uri: formData.imageUri }}
                        style={styles.eventImage}
                      />
                      <View style={styles.imageOverlayEdit}>
                        <MaterialIcons name="edit" size={20} color={Colors.white} />
                        <Text style={styles.imagePickerTextEdit}>Change Image</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Image
                        source={require('../../assets/default.png')}
                        style={[styles.eventImage, { opacity: 0.5 }]}
                      />
                      <View style={styles.imageOverlay}>
                        <View style={styles.imageIconContainer}>
                          <MaterialIcons name="add-a-photo" size={32} color={Colors.white} />
                        </View>
                        <Text style={styles.imagePickerText}>Add Event Image</Text>
                        <Text style={styles.imagePickerSubtext}>Tap to upload from gallery</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.inputLabel}>
                  {eventType === 'volunteer' ? 'Volunteer Opportunity Name' : 'Event Title'}
                </Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  focusedInput === 'title' && styles.textInputFocused
                ]}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                onFocus={() => setFocusedInput('title')}
                onBlur={() => setFocusedInput(null)}
                placeholder={eventType === 'volunteer' ? 'Enter volunteer opportunity name' : 'Enter event title'}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <CategorySelector />

            {eventType === 'volunteer' ? (
              <>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Reward</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      focusedInput === 'reward' && styles.textInputFocused
                    ]}
                    value={formData.reward}
                    onChangeText={(value) => handleInputChange('reward', value)}
                    onFocus={() => setFocusedInput('reward')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="e.g., 5 (for Evaluation Points)"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.sectionTitle}>Volunteer Date</Text>
                <View style={styles.rowInputGroup}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.inputLabel}>Date</Text>
                      <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        focusedInput === 'volunteerDate' && styles.textInputFocused
                      ]}
                      value={formData.volunteerDate}
                      onChangeText={(value) => handleInputChange('volunteerDate', value)}
                      onFocus={() => setFocusedInput('volunteerDate')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="15"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.inputLabel}>Month</Text>
                      <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        focusedInput === 'volunteerMonth' && styles.textInputFocused
                      ]}
                      value={formData.volunteerMonth}
                      onChangeText={(value) => handleInputChange('volunteerMonth', value)}
                      onFocus={() => setFocusedInput('volunteerMonth')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="JUN"
                      placeholderTextColor={Colors.textMuted}
                      maxLength={3}
                    />
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Time Range</Text>
                
                <TimePickerComponent
                  label="Start Hour"
                  timeValue={formData.startHour}
                  periodValue={formData.startHourPeriod}
                  onTimeChange={(value) => handleInputChange('startHour', value)}
                  onPeriodChange={(value) => handleInputChange('startHourPeriod', value)}
                  isRequired={true}
                />

                <TimePickerComponent
                  label="End Hour"
                  timeValue={formData.endHour}
                  periodValue={formData.endHourPeriod}
                  onTimeChange={(value) => handleInputChange('endHour', value)}
                  onPeriodChange={(value) => handleInputChange('endHourPeriod', value)}
                  isRequired={true}
                />

                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Number of Volunteers Needed</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      focusedInput === 'volunteersNeeded' && styles.textInputFocused
                    ]}
                    value={formData.volunteersNeeded}
                    onChangeText={(value) => handleInputChange('volunteersNeeded', value)}
                    onFocus={() => setFocusedInput('volunteersNeeded')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="10"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.rowInputGroup}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.inputLabel}>Date</Text>
                      <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        focusedInput === 'date' && styles.textInputFocused
                      ]}
                      value={formData.date}
                      onChangeText={(value) => handleInputChange('date', value)}
                      onFocus={() => setFocusedInput('date')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="15"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.inputLabel}>Month</Text>
                      <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        focusedInput === 'month' && styles.textInputFocused
                      ]}
                      value={formData.month}
                      onChangeText={(value) => handleInputChange('month', value)}
                      onFocus={() => setFocusedInput('month')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="JUN"
                      placeholderTextColor={Colors.textMuted}
                      maxLength={3}
                    />
                  </View>
                </View>

                <TimePickerComponent
                  label="Start Time"
                  timeValue={formData.startTime}
                  periodValue={formData.startPeriod}
                  onTimeChange={(value) => handleInputChange('startTime', value)}
                  onPeriodChange={(value) => handleInputChange('startPeriod', value)}
                  isRequired={true}
                />

                <TimePickerComponent
                  label="End Time"
                  timeValue={formData.endTime}
                  periodValue={formData.endPeriod}
                  onTimeChange={(value) => handleInputChange('endTime', value)}
                  onPeriodChange={(value) => handleInputChange('endPeriod', value)}
                  isRequired={false}
                />
                <Text style={styles.helpText}>End time is optional</Text>

                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Location</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      focusedInput === 'location' && styles.textInputFocused
                    ]}
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                    onFocus={() => setFocusedInput('location')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Conference Room A"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Total Capacity</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      focusedInput === 'total' && styles.textInputFocused
                    ]}
                    value={formData.total}
                    onChangeText={(value) => handleInputChange('total', value)}
                    onFocus={() => setFocusedInput('total')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="50"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput, 
                      styles.textArea,
                      focusedInput === 'description' && styles.textInputFocused
                    ]}
                    value={formData.description}
                    onChangeText={(value) => handleInputChange('description', value)}
                    onFocus={() => setFocusedInput('description')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Enter event description..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          {mode === 'create' ? (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4DA2D9', '#15397E']}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.saveButtonIcon}>
                  <MaterialIcons 
                    name="add" 
                    size={22} 
                    color={Colors.white} 
                  />
                </View>
                <Text style={styles.saveButtonText}>
                  {eventType === 'volunteer' ? 'Request Volunteers' : 'Create Event'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            eventType === 'volunteer' ? (
              <View style={styles.editModeButtonContainer}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4DA2D9', '#15397E']}
                    style={styles.editButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.editButtonIcon}>
                      <MaterialIcons 
                        name="save" 
                        size={20} 
                        color={Colors.white} 
                      />
                    </View>
                    <Text style={styles.editButtonText}>
                      Edit Request
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButtonBottom} 
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F44336', '#D32F2F']}
                    style={styles.deleteButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.deleteButtonIcon}>
                      <MaterialIcons 
                        name="delete" 
                        size={20} 
                        color={Colors.white} 
                      />
                    </View>
                    <Text style={styles.deleteButtonText}>
                      Delete Request
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editModeButtonContainer}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4DA2D9', '#15397E']}
                    style={styles.editButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.editButtonIcon}>
                      <MaterialIcons 
                        name="save" 
                        size={20} 
                        color={Colors.white} 
                      />
                    </View>
                    <Text style={styles.editButtonText}>
                      Edit Event
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButtonBottom} 
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F44336', '#D32F2F']}
                    style={styles.deleteButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.deleteButtonIcon}>
                      <MaterialIcons 
                        name="delete" 
                        size={20} 
                        color={Colors.white} 
                      />
                    </View>
                    <Text style={styles.deleteButtonText}>
                      Delete Event
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxlarge,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  rowInputGroup: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.text,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
    letterSpacing: 0.5,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  requiredAsterisk: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.text,
    backgroundColor: Colors.white,
    ...Shadows.light,
    minHeight: 50,
  },
  textInputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    ...Shadows.medium,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
    ...Shadows.medium,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 135, 181, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  imageOverlayEdit: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(25, 135, 181, 0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.medium,
  },
  imageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  imagePickerText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.white,
    textAlign: 'center',
  },
  imagePickerTextEdit: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.white,
  },
  imagePickerSubtext: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  helpText: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    paddingLeft: Spacing.sm,
  },
  timePickerContainer: {
    marginBottom: Spacing.xl,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  timeInputContainer: {
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.text,
    backgroundColor: Colors.white,
    ...Shadows.light,
    minHeight: 50,
    textAlign: 'center',
    width: 70,
  },
  timeInputLabel: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  periodButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  periodButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    height: 50,
    ...Shadows.light,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: Colors.white,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
  },
  periodContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryContainer: {
    marginBottom: Spacing.xl,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.light,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  categoryChipText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: Colors.white,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
  },
  buttonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.medium,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    minHeight: 56,
  },
  saveButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.white,
    letterSpacing: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  editModeButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  editButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    minHeight: 56,
  },
  editButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.white,
    letterSpacing: 0.5,
  },
  deleteButtonBottom: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    minHeight: 56,
  },
  deleteButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
