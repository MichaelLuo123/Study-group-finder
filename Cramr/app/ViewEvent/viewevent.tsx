import { useUser } from '@/contexts/UserContext';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Bookmark, BookOpen, Calendar, Clock, Eye, Info, Laptop, MapPin, Send, Trash2, Upload, Users, X, } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Dimensions,
  Image,
 
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  bannerColor: number;
  description: string;
  location?: string | null;
  study_room?: string | null;
  virtual_room_link?: string | null;
  class: string;
  event_format: string;
  date_and_time: Date;
  creator_id: string;
  creator_profile_picture: string;
  created_at: string;
  event_type: string;
  status: string;
  capacity: number;
  tags: string[];
  is_online?: boolean;
}

interface RSVP {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  status: string;
}

const EventViewScreen = () => {
  const { isDarkMode, user } = useUser();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user: loggedInUser, updateUserData } = useUser();

  // Colors
  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const bannerColors = Colors.bannerColors;
  const placeholderTextColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;
  const cancelButtonColor = !isDarkMode ? Colors.light.cancelButton : Colors.dark.cancelButton;

  const userId = user?.id;
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  // Add refresh state
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateAndTime: Date | string | null) => {
    if (!dateAndTime) return 'Invalid date';
    try {
      const date = new Date(dateAndTime);
      if (isNaN(date.getTime())) return 'Invalid date';
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      return `${month}/${day}/${year}`;
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateAndTime: Date | string | null) => {
    if (!dateAndTime) return 'Select Time';
    try {
      const date = new Date(dateAndTime);
      if (isNaN(date.getTime())) return 'Select Time';
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const minutesStr = minutes.toString().padStart(2, '0');
      return `${hour12}:${minutesStr} ${ampm}`;
    } catch {
      return 'Select Time';
    }
  };
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // File viewer modal state
  const [showFileViewerModal, setShowFileViewerModal] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  


  // -------- Fetch Event --------
  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(normalizeEvent(data));
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const [bannerColor, setBannerColor] = useState<string | null>(null);

  useEffect(() => {
      const fetchBannerColor = async () => {
        if (!event?.creator_id) return;
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${event.creator_id}`);
          if (response.ok) {
            const data = await response.json();
            setBannerColor(bannerColors[data.banner_color] || null);
          } else {
            setBannerColor(null);
          }
        } catch (error) {
          console.error('Error fetching banner color:', error);
          setBannerColor(null);
        }
      };
      fetchBannerColor();
    }, [bannerColors, event?.creator_id]);
    
  const [isOwner, setIsOwner] = useState(false);

  const checkIfOwner = () => {
    if (event?.creator_id === loggedInUser?.id) {
      setIsOwner(true);
    }
  };

  useEffect(() => {
    checkIfOwner();
  }, [event, loggedInUser]);

  const fetchRSVPs = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvps`);
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps || []);
      }
    } catch (error) {
    }
  };

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {}
  };

  // -------- RSVP and Save status --------
  const fetchUserStatuses = async () => {
    if (!eventId || !userId) return;
    try {
      // Fetch RSVP status
      const rsvpRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd?user_id=${userId}`);
      if (rsvpRes.ok) {
        const rsvpData = await rsvpRes.json();
        setIsRSVPed(Boolean(rsvpData.rsvp?.status === 'accepted'));
      }

      // Fetch save status
      const saveRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`);
      if (saveRes.ok) {
        const saveData = await saveRes.json();
        setIsSaved(Boolean(saveData.is_saved));
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    }
  };

  // -------- Refresh function --------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchEvent(),
        fetchRSVPs(), 
        fetchComments(),
        fetchUserStatuses()
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [eventId, userId]);

  const fetchMaterials = async (retryCount = 0) => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/materials`);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched materials:', data.materials);
        console.log('Current userId:', userId);
        setMaterials(data.materials || []);
      } else {
        console.error('Failed to fetch materials, status:', res.status);

        if (retryCount < 3) {
          setTimeout(() => {
            console.log(`Retrying fetchMaterials (attempt ${retryCount + 1})`);
            fetchMaterials(retryCount + 1);
          }, Math.pow(2, retryCount) * 1000); 
        }
      }
    } catch (error) {
    }
  };

  // -------- Comment Handling --------
  const addComment = async () => {
    if (!comment.trim() || !userId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content: comment.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setComment('');
      }
    } catch (error) {
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (error) {
    }
  };

  // -------- RSVP / Save --------
  const toggleRSVP = async () => {
    if (busy || !eventId || !userId) return;
    setBusy(true);
    try {
      if (isRSVPed) {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        setIsRSVPed(false);
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, status: 'accepted' }),
        });
        setIsRSVPed(true);
      }
      await fetchEvent();
      await fetchRSVPs();
    } catch (err) {
      console.error('RSVP toggle error:', err);
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (busy || !eventId || !userId) return;
    setBusy(true);
    try {
      if (isSaved) {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`, {
          method: 'DELETE',
        });
        setIsSaved(false);
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setBusy(false);
    }
  };

  // -------- Effects --------
  useEffect(() => {
    fetchEvent();
    fetchRSVPs();
    fetchComments();
  }, [eventId]);

  useEffect(() => {
    fetchUserStatuses();
    if (!eventId || !userId) return;
    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setIsRSVPed(Boolean(data.rsvp?.status === 'accepted')))
      .catch(() => {});

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`)
      .then(res => res.json())
      .then(data => setIsSaved(Boolean(data.is_saved)))
      .catch(() => {});
  }, [eventId, userId]);

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayedRSVPs = rsvps.slice(0, 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAwareScrollView
        
        contentContainerStyle={styles.scrollContent}
        
        enableOnAndroid
        
        keyboardShouldPersistTaps="handled"
      
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5CAEF1']} // Android
            tintColor={'#5CAEF1'} // iOS
          />
        }
      >
        <View style={styles.content}>
          {/* Back Button */}
          <ArrowLeft
            size={24}
            color={textColor}
            onPress={() => router.back()}
            style={{ marginBottom: 15 }}
          />

          {/* Event Card */}
          <View style={[styles.eventCard, { backgroundColor: textInputColor }]}>
            <View style={[styles.eventHeader, { backgroundColor: bannerColor || textInputColor}]}>
              <Text style={[styles.eventTitle, { color: textColor }]}>{event.title}</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/Profile/External', params: { userId: event.creator_id } })}>
                {!!event.creator_profile_picture && (
                <Image source={{ uri: event.creator_profile_picture }} style={styles.ownerAvatar ? styles.ownerAvatar : require('../../assets/images/default_profile.jpg')} />
              </TouchableOpacity>
              )}
            </View>

            <View style={styles.eventContent}>
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <View style={[styles.tagsRow, { maxWidth: event.tags.length <= 2 ? 175 : 'auto'}]}>
                  {event.tags.slice(0, 3).map((tag, i) => (
                    <View key={i} style={[styles.tag, { borderColor: textColor }]}>
                      <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Event Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <BookOpen size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{event.class}</Text>
                </View>

                {/* Updated location handling to match EventCollapsible */}
                {event.event_format === 'In Person' && (
                  <View style={styles.detailRow}>
                    <MapPin size={20} color={textColor} />
                    <Text style={[styles.detailText, { color: textColor }]}>
                      {event.location}
                      {event.study_room && event.study_room}
                    </Text>
                  </View>
                )}

                {/* Added online event handling like EventCollapsible */}
                {event.event_format === 'Online' && (
                  <View style={styles.detailRow}>
                    <Laptop size={20} color={textColor} />
                    <TouchableOpacity
                      onPress={() =>
                        event.virtual_room_link
                          ? Linking.openURL(
                              event.virtual_room_link.startsWith('http://') || event.virtual_room_link.startsWith('https://')
                                ? event.virtual_room_link
                                : `http://${event.virtual_room_link}`
                            )
                          : null
                      }
                    >
                      <Text style={[styles.detailText, { color: textColor }]}>{event.virtual_room_link}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Calendar size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{formatDate(event.date_and_time)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{formatTime(event.date_and_time)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>
                    {rsvps.length}/{event.capacity}
                  </Text>
                </View>

                {/* RSVP Avatars */}
                <View style={styles.avatarsContainer}>
                  {displayedRSVPs.map((r, i) => (
                    <View key={i} style={styles.rsvpAvatar}>
                      <TouchableOpacity onPress={() => router.push({ pathname: '/Profile/External', params: { userId: r.user_id } })}>
                        <Image
                          source={r.profile_picture_url ? { uri: r.profile_picture_url } : require('../../assets/images/default_profile.jpg')}
                          style={styles.avatarImage}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Info Section */}
              {event.description && (
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Info size={20} color={textColor} />
                    <Text style={[styles.infoText, { color: textColor }]}>{event.description}</Text>
                  </View>
                </View>
              )}

              {/* RSVP + Save Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {isOwner && (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/CreateEvent/EditEvent', params: { eventId } })} style={styles.editButton}>
                  <Text style={[styles.editButtonText, { color: textColor }]}>Edit</Text>
                </TouchableOpacity>
                )}

                {!isOwner && (
                  <>
                    {(rsvps.length < event.capacity || isRSVPed) &&(
                      <>
                      <TouchableOpacity onPress={toggleRSVP}
                  disabled={busy}
                  style={[styles.rsvpButton, { backgroundColor: isRSVPed ? cancelButtonColor : '#5CAEF1' }]}
                >
                        <Text style={[styles.rsvpButtonText, { color: textColor }]}>
                    {isRSVPed ? 'RSVPed' : 'RSVP'}
                  </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={toggleSave}>
                        <Bookmark
                    color={textColor}
                    size={25}
                    fill={isSaved ? textColor : 'none'}
                    style={styles.saveButtonContainer}
                  />
                      </TouchableOpacity>
                      </>
                    )}
                    {!(rsvps.length < event.capacity || isRSVPed) && (
                      <TouchableOpacity onPress={toggleSave}>
                        <Bookmark color={textColor} size={25} fill={isSaved ? textColor : 'none'} style={[styles.saveButtonContainer, {marginTop: -20, marginLeft: 290, marginBottom: 10}]} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Study Materials (placeholder) */}
          <Text style={[styles.studyMaterialsTitle, { color: textColor }]}>Study Materials</Text>
          <View style={styles.materialsContainer}>
            <TouchableOpacity style={[styles.addMaterialCard, { borderColor: textColor }]}>
              <Text style={[styles.addMaterialPlus, { color: textColor }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: textColor }]}>
              Comments ({comments.length})
            </Text>

            {comments.map(c => (
              <View key={c.id} style={[styles.commentItem, { borderBottomColor: placeholderTextColor }]}>
                <View style={styles.commentHeader}>
                  <Image
                    source={c.profile_picture_url ? { uri: c.profile_picture_url } : require('../../assets/images/default_profile.jpg')}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentInfo}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={[styles.commentAuthor, { color: textColor }]}>{c.full_name || c.username}</Text>
                      {c.is_event_owner && (
                        <View style={styles.eventOwnerTag}>
                          <Text style={styles.eventOwnerTagText}>Event Owner</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.commentTime, { color: placeholderTextColor }]}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {c.user_id === userId && (
                    <TouchableOpacity onPress={() => deleteComment(c.id)} style={{ padding: 4 }}>
                      <Text style={{ color: '#E36062', fontSize: 18 }}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.commentContent, { color: textColor }]}>{c.content}</Text>
              </View>
            ))}

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: textInputColor, color: textColor }]}
                placeholder="Add a comment..."
                placeholderTextColor={placeholderTextColor}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity onPress={addComment} disabled={!comment.trim()}>
                <View style={{ padding: 10, opacity: comment.trim() ? 1 : 0.5, marginTop: -40}}>
                  <Send size={20} color={comment.trim() ? '#5CAEF1' : placeholderTextColor} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={false}
        onRequestClose={resetUploadForm}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Upload Study Material</Text>
              <TouchableOpacity onPress={resetUploadForm}>
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, {fontFamily: 'Poppins-Regular', color: textColor }]}>Title *</Text>
              <TextInput
                style={[styles.uploadInput, { backgroundColor: textInputColor, color: textColor }]}
                placeholder="Enter material title"
                placeholderTextColor={placeholderTextColor}
                value={uploadTitle}
                onChangeText={setUploadTitle}
              />

              <Text style={[styles.inputLabel, {fontFamily: 'Poppins-Regular', color: textColor }]}>Description</Text>
              <TextInput
                style={[styles.uploadInput, styles.descriptionInput, { backgroundColor: textInputColor, color: textColor }]}
                placeholder="Enter description (optional)"
                placeholderTextColor={placeholderTextColor}
                value={uploadDescription}
                onChangeText={setUploadDescription}
                multiline
                numberOfLines={3}
              />

                             <TouchableOpacity
                 style={[styles.filePickerButton, { borderColor: textColor }]}
                 onPress={handleFilePick}
               >
                 <Upload size={20} color={textColor} />
                 <Text style={[styles.filePickerText, { color: textColor }]}>
                   {selectedFile ? selectedFile.name : 'Select File'}
                 </Text>
               </TouchableOpacity>
               
                               <Text style={[styles.materialInfo, { color: placeholderTextColor, textAlign: 'center', marginTop: 8 }]}>
                  Maximum file size: 20MB • Supported: PDF, DOCX, PNG, JPG, PPTX
                </Text>

              {selectedFile && (
                <View style={styles.selectedFileInfo}>
                  <Text style={[styles.selectedFileName, { color: textColor }]}>{selectedFile.name}</Text>
                  <Text style={[styles.selectedFileSize, { color: placeholderTextColor }]}>
                    {formatBytes(selectedFile.size || 0)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: uploadTitle.trim() && selectedFile ? '#5CAEF1' : '#e0e0e0' }
                ]}
                onPress={handleUpload}
                disabled={!uploadTitle.trim() || !selectedFile || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.uploadButtonText, { color: textColor }]}>Upload Material</Text>
                )}
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
                 </SafeAreaView>
               </Modal>

        {/* File Viewer Modal */}
        <Modal
          visible={showFileViewerModal}
          animationType="slide"
          transparent={false}
          onRequestClose={closeFileViewer}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
            <View style={[styles.modalContent, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]} numberOfLines={1}>
                  {selectedFileName}
                </Text>
                <TouchableOpacity onPress={closeFileViewer}>
                  <X size={24} color={textColor} />
                </TouchableOpacity>
              </View>
              
              {selectedFileUrl && (
                <View style={styles.fileViewerContainer}>
                  {selectedFileType.toLowerCase().includes('png') || 
                   selectedFileType.toLowerCase().includes('jpg') || 
                   selectedFileType.toLowerCase().includes('jpeg') || 
                   selectedFileType.toLowerCase().includes('gif') ? (
                    // Image viewer
                    <Image 
                      source={{ uri: selectedFileUrl }} 
                      style={styles.imageViewer}
                      resizeMode="contain"
                    />
                  ) : (
                    // For other file types, show file info and options
                    <View style={styles.fileInfoContainer}>
                      <Text style={[styles.fileInfoText, { color: textColor }]}>
                        File: {selectedFileName}
                      </Text>
                      <Text style={[styles.fileInfoText, { color: placeholderTextColor }]}>
                        Type: {selectedFileType}
                      </Text>
                      <TouchableOpacity
                        style={styles.openInBrowserButton}
                        onPress={() => {
                          WebBrowser.openBrowserAsync(selectedFileUrl);
                          closeFileViewer();
                        }}
                      >
                        <Text style={styles.openInBrowserButtonText}>Open in Browser</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
        
      </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, fontFamily: 'Poppins-Regular' },
  scrollContent: { flexGrow: 1 },
  content: { padding: 20},
  eventCard: {
    borderRadius: 10,
    marginBottom: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    flex: 1,
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 16,
  },
  eventContent: {
    padding: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    flex: 1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginLeft: 30,
  },
  rsvpAvatar: {
    marginRight: 5,
  },
  avatarImage: {
    width: 25,
    height: 25,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  rsvpButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginRight: 15,
    flex: 1,
  },
  rsvpButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  saveButtonContainer: {
    alignContent: 'center',
    top: 10
  },
  commentsSection: {
    marginTop: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: -40,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomColor: '#666666',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  eventOwnerTag: {
    backgroundColor: '#5CAEF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  eventOwnerTagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  commentContent: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginLeft: 40,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  studyMaterialsSection: {
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
  },
  studyMaterialsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
    marginTop: 20,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  addMaterialCard: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  addMaterialPlus: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
  materialCard: {
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 120,
    maxWidth: width * 0.4,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  materialTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    flex: 1,
    marginRight: 8,
  },
  materialInfo: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  modalBody: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    marginTop: 16,
  },
  uploadInput: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  filePickerText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  selectedFileInfo: {
    marginBottom: 20,
  },
  selectedFileName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  uploadButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  materialDeleteButtonContainer: {
    padding: 4,
  },
  materialDeleteButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
  },
  materialDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    lineHeight: 16,
  },


  materialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    padding: 4,
    backgroundColor: 'rgba(92, 174, 241, 0.1)',
    borderRadius: 6,
  },
  materialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  fileTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fileViewerContainer: {
    flex: 1,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewer: {
    width: '100%',
    height: '100%',
    maxHeight: 500,
  },
  fileInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fileInfoText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  openInBrowserButton: {
    backgroundColor: '#5CAEF1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
     openInBrowserButtonText: {
     color: '#fff',
     fontSize: 16,
     fontFamily: 'Poppins-SemiBold',
   },
   headerRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 15,
   },
   connectionWarning: {
     backgroundColor: '#E36062',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 8,
   },
   connectionWarningText: {
     color: '#fff',
     fontSize: 12,
     fontFamily: 'Poppins-Medium',
   },
 });
 
export default EventViewScreen;