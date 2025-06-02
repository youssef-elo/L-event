import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../styles/globalStyles';
import { useEvents } from '../context/EventContext';
import { useUser } from '../context/UserContext';

export default function CommentsRatingSection({ eventId, onClose }) {
  const { 
    addComment, 
    getEventComments, 
    rateEvent, 
    getEventRating, 
    getUserEventRating 
  } = useEvents();
  const { user } = useUser();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [eventAverageRating, setEventAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Load comments and ratings when component mounts
  useEffect(() => {
    if (eventId) {
      loadCommentsAndRatings();
    }
  }, [eventId]);

  const loadCommentsAndRatings = async () => {
    setIsLoading(true);
    try {
      // Load comments
      const commentsResult = await getEventComments(eventId);
      if (commentsResult.success) {
        setComments(commentsResult.comments);
      }

      // Load event rating
      const ratingResult = await getEventRating(eventId);
      if (ratingResult.success) {
        setEventAverageRating(ratingResult.averageRating);
        setRatingCount(ratingResult.ratingCount);
      }

      // Load user's rating
      const userRatingResult = await getUserEventRating(eventId);
      if (userRatingResult.success && userRatingResult.rating !== null) {
        setUserRating(userRatingResult.rating);
      }
    } catch (error) {
      console.error('Error loading comments and ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const result = await addComment(eventId, newComment.trim());
      if (result.success) {
        setNewComment('');
        // Reload comments
        await loadCommentsAndRatings();
        Alert.alert('Success', 'Comment added successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to add comment');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRating = async (rating) => {
    setIsSubmittingRating(true);
    try {
      const result = await rateEvent(eventId, rating);
      if (result.success) {
        setUserRating(rating);
        // Reload ratings to get updated average
        await loadCommentsAndRatings();
        Alert.alert('Success', 'Rating submitted successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to submit rating');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStars = (rating, interactive = false, onPress = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => interactive && onPress && onPress(i)}
          style={styles.starButton}
        >
          <MaterialIcons
            name={i <= rating ? 'star' : 'star-border'}
            size={24}
            color={i <= rating ? '#FFD700' : Colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading comments and ratings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rate This Event</Text>
        
        {/* Event Average Rating */}
        <View style={styles.averageRatingContainer}>
          <View style={styles.starContainer}>
            {renderStars(Math.round(eventAverageRating))}
          </View>
          <Text style={styles.averageRatingText}>
            {eventAverageRating.toFixed(1)} ({ratingCount} rating{ratingCount !== 1 ? 's' : ''})
          </Text>
        </View>

        {/* User Rating */}
        <View style={styles.userRatingContainer}>
          <Text style={styles.userRatingLabel}>Your Rating:</Text>
          <View style={styles.starContainer}>
            {renderStars(userRating, true, handleRating)}
          </View>
          {isSubmittingRating && (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.ratingLoader} />
          )}
        </View>
      </View>

      {/* Comments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

        {/* Add Comment */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, isSubmittingComment && styles.submitButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={isSubmittingComment}
          >
            {isSubmittingComment ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <MaterialIcons name="send" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <View style={styles.commentsContainer}>
          {comments.length === 0 ? (
            <View style={styles.emptyCommentsContainer}>
              <MaterialIcons name="comment" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.userId}</Text>
                  <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textSecondary,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  starButton: {
    padding: Spacing.xs,
  },
  averageRatingText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
  },
  userRatingContainer: {
    alignItems: 'center',
  },
  userRatingLabel: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  ratingLoader: {
    marginTop: Spacing.xs,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.text,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    height: 44,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  commentsContainer: {
    gap: Spacing.md,
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyCommentsText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptyCommentsSubtext: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  commentItem: {
    backgroundColor: Colors.backgroundLight,
    padding: Spacing.md,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  commentAuthor: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.primary,
  },
  commentDate: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textMuted,
  },
  commentText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.text,
    lineHeight: 20,
  },
});
