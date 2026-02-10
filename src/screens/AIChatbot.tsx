import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_ENDPOINT = 'https://0bdf9com0a.execute-api.us-east-2.amazonaws.com/PROD';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Welcome to Wraptitude! 👋 I'm your AI assistant. I can help you with questions about our services including Window Tinting, Vinyl Wrap, Ceramic Coating, and Paint Protection Film (PPF). How can I help you today?",
  timestamp: new Date(),
};


// windowHeight - statusBar(44) - headerMarginTop(44) - scrollPaddingTop(20) - scrollPaddingBottom(100)
const WINDOW_HEIGHT = Dimensions.get('window').height;
const CHROME_HEIGHT = 44 + 44 + 20 + 100;

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Typing indicator animation
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isLoading) return;

    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = animateDot(dot1Opacity, 0);
    const anim2 = animateDot(dot2Opacity, 200);
    const anim3 = animateDot(dot3Opacity, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    };
  }, [isLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({role: m.role, content: m.content}));
      conversationHistory.push({role: 'user', content: trimmed});

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({messages: conversationHistory}),
      });
      console.log('response', response);
      if (!response.ok) throw new Error('Failed to get response');
      console.log('response ok');
      const data = await response.json();
      console.log('data', JSON.stringify(data));
      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data;
      console.log('parsedBody', parsedBody);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: parsedBody.reply,
        timestamp: new Date(),
      };
      console.log('assistantMessage', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      console.log('messages', messages);
    } catch (error) {
      console.log('error');
      console.log('error', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again or contact us directly at (437) 340-1121.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const renderMessage = (item: Message) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubbleWrapper,
          isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper,
        ]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Icon name="smart-toy" size={18} color="#c70628" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text
            style={[
              styles.timestampText,
              isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={[styles.messageBubbleWrapper, styles.aiBubbleWrapper]}>
        <View style={styles.aiAvatar}>
          <Icon name="smart-toy" size={18} color="#c70628" />
        </View>
        <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
          <View style={styles.typingContainer}>
            <Animated.View
              style={[styles.typingDot, {opacity: dot1Opacity}]}
            />
            <Animated.View
              style={[styles.typingDot, {opacity: dot2Opacity}]}
            />
            <Animated.View
              style={[styles.typingDot, {opacity: dot3Opacity}]}
            />
          </View>
        </View>
      </View>
    );
  };

  // When keyboard is open, shrink container so input stays visible above keyboard
  const chatHeight = keyboardHeight > 0
    ? WINDOW_HEIGHT - 44 - 44 - 20 - keyboardHeight
    : WINDOW_HEIGHT - CHROME_HEIGHT;

  return (
    <View style={[styles.container, {height: chatHeight}]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
        {messages.map(item => (
          <React.Fragment key={item.id}>
            {renderMessage(item)}
          </React.Fragment>
        ))}
        {renderTypingIndicator()}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          multiline
          maxLength={500}
          returnKeyType="default"
          editable={!isLoading}
        />
        <Pressable
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}>
          <Icon
            name="send"
            size={20}
            color={
              !inputText.trim() || isLoading
                ? 'rgba(255, 255, 255, 0.3)'
                : '#FFFFFF'
            }
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  aiBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(199, 6, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#c70628',
    borderBottomRightRadius: 4,
    marginLeft: 60,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  timestampText: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A0A0A0',
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c70628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(199, 6, 40, 0.3)',
  },
});

export default AIChatbot;
