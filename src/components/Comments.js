// src/components/Comments.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';

const Comments = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://your-laravel-api-url/api/products/${productId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = ''; // AsyncStorage'dan token'ı alın
      const response = await fetch('http://your-laravel-api-url/api/comments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(); // Yorumları yenile
      } else {
        Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentAuthor}>{item.user.name}</Text>
      <Text style={styles.commentDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yorum yazın..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleAddComment}
        >
          <Text style={styles.submitButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz yorum yapılmamış</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  commentDate: {
    color: '#666',
    fontSize: 12,
    marginVertical: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
});

export default Comments;