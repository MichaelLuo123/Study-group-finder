import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ArrowLeft, Edit3, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../contexts/UserContext';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  isFlipped: boolean;
  isCompleted: boolean;
}

interface FlashcardSet {
  id: string;
  title: string;
  card_count: number;
}

interface FlashcardSetProps {
  flashcardSetId: string;
}

export default function FlashcardSet({ flashcardSetId }: FlashcardSetProps) {
  const router = useRouter();
  const { isDarkMode } = useUser();

  // Colors
  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const placeholderColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;
  const cardBackgroundColor = !isDarkMode ? '#F8F9FA' : '#2C2C2E';

  // State
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      front: 'What is the capital of France?',
      back: 'Paris',
      isFlipped: false,
      isCompleted: false,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const addCard = () => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: '',
      back: '',
      isFlipped: false,
      isCompleted: false,
    };
    setFlashcards([...flashcards, newCard]);
    setEditingCard(newCard.id);
  };

  const flipCard = (cardId: string) => {
    setFlashcards(flashcards.map(card => 
      card.id === cardId ? { ...card, isFlipped: !card.isFlipped } : card
    ));
  };

  const toggleComplete = (cardId: string) => {
    setFlashcards(flashcards.map(card => 
      card.id === cardId ? { ...card, isCompleted: !card.isCompleted } : card
    ));
  };

  const updateCard = (cardId: string, field: 'front' | 'back', value: string) => {
    setFlashcards(flashcards.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const deleteCard = (cardId: string) => {
    setFlashcards(flashcards.filter(card => card.id !== cardId));
  };

  const renderFlashcard = (card: Flashcard) => {
    const isEditing = editingCard === card.id;
    
    return (
      <View key={card.id} style={[styles.flashcard, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.flashcardHeader}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => toggleComplete(card.id)}
          >
            <View style={[
              styles.checkboxInner, 
              { borderColor: textColor },
              card.isCompleted && { backgroundColor: '#369942' }
            ]}>
              {card.isCompleted && (
                <Ionicons name="checkmark" size={20} style={[styles.checkmark, {color: textColor}]} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditingCard(isEditing ? null : card.id)}
          >
            <Edit3 size={18} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteCard(card.id)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.flashcardContent}
          onPress={() => !isEditing && flipCard(card.id)}
          disabled={isEditing}
        >
          <View style={styles.flashcardSide}>
            <Text style={[styles.flashcardLabel, { color: textColor }]}>
              {card.isFlipped ? 'BACK' : 'FRONT'}
            </Text>
            
            {isEditing ? (
              <View>
                <TextInput
                  style={[styles.flashcardInput, { color: textColor, borderColor: textColor }]}
                  value={card.front}
                  onChangeText={(text) => updateCard(card.id, 'front', text)}
                  placeholder="Enter front text..."
                  placeholderTextColor={placeholderColor}
                  multiline
                />
                <Text style={[styles.flashcardLabel, { color: textColor, marginTop: 10 }]}>BACK</Text>
                <TextInput
                  style={[styles.flashcardInput, { color: textColor, borderColor: textColor }]}
                  value={card.back}
                  onChangeText={(text) => updateCard(card.id, 'back', text)}
                  placeholder="Enter back text..."
                  placeholderTextColor={placeholderColor}
                  multiline
                />
              </View>
            ) : (
              <Text style={[styles.flashcardText, { color: textColor }]}>
                {card.isFlipped ? card.back : card.front}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <TextInput 
              placeholder='Flashcard Set Title' 
              placeholderTextColor={placeholderColor} 
              style={[styles.heading, { color: textColor }]} 
            />
          </View>

          <TouchableOpacity
          onPress={addCard}
         >
            <Plus size={24} color={textColor} />
            </TouchableOpacity>
        </View>

        {/* Flashcards List */}
        <View style={styles.flashcardsContainer}>
          {flashcards.map(renderFlashcard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
  },

  // Header Styles
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContent: {
    alignItems: 'center',
  },

  heading: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding:10,
    borderRadius: 10,
  },

  // Flashcards
  flashcardsContainer: {
    marginBottom: 20,
  },

  flashcard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  checkbox: {
    padding: 5,
  },

  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  editButton: {
    padding: 5,
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#E36062',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },

  flashcardSide: {
    flex: 1,
  },

  flashcardLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  flashcardText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    minHeight: 44,
  },

  flashcardInput: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 44,
    textAlignVertical: 'top',
    marginBottom: 8,
  },

  flipHint: {
    alignItems: 'center',
    marginTop: 8,
  },

  flipHintText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },

  // Study Button
  studyButton: {
    backgroundColor: '#5CAEF1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  studyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});