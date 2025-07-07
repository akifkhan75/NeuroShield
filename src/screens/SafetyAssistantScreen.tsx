
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';
import { ChatMessage } from '../types';
import { API_BASE_URL } from '../services/apiService';

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  padding-top: ${Platform.OS === 'ios' ? '50px' : '16px'};
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
  background-color: white;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-left: 16px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const MessageListContainer = styled(View)`
  flex: 1;
  background-color: #f3f4f6;
`;

const InputBar = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 8px;
  border-top-width: 1px;
  border-top-color: #e5e7eb;
  background-color: white;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  background-color: #f3f4f6;
  border-radius: 9999px;
  padding: 12px 16px;
  font-size: 16px;
  border-width: 2px;
  border-color: transparent;
`;

const SendButton = styled(TouchableOpacity)`
  margin-left: 8px;
  background-color: #4f46e5;
  padding: 12px;
  border-radius: 9999px;
`;

const MessageBubble = styled(View)<{ role: 'user' | 'model' }>`
  padding: 12px;
  border-radius: 20px;
  margin: 4px 0;
  max-width: 80%;
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.role === 'user' ? '#4f46e5' : '#e5e7eb'};
  border-bottom-right-radius: ${props => props.role === 'user' ? '4px' : '20px'};
  border-bottom-left-radius: ${props => props.role === 'model' ? '4px' : '20px'};
`;

const MessageText = styled(Text)<{ role: 'user' | 'model' }>`
  font-size: 15px;
  color: ${props => props.role === 'user' ? 'white' : '#1f2937'};
`;

const TypingIndicatorContainer = styled(View)`
  padding: 12px;
  border-radius: 20px;
  background-color: #e5e7eb;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  flex-direction: row;
  align-items: center;
`;

const TypingDot = styled(Animated.View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #9ca3af;
  margin: 0 2px;
`;

const SafetyAssistantScreen = (props: { componentId: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([{ role: 'model', text: 'Hello! I am your personal safety assistant. Ask me for safety tips or advice. How can I help you today?' }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentInput = input;
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
      }));

      const response = await fetch(`${API_BASE_URL}/api/ai/safety-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyForApi,
          message: currentInput
        }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      setIsLoading(false);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const lastMsgIndex = prev.length - 1;
          const updatedMessages = [...prev];
          updatedMessages[lastMsgIndex] = {
              ...updatedMessages[lastMsgIndex],
              text: updatedMessages[lastMsgIndex].text + chunk
          };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
      setIsLoading(false);
    }
  };
  
  const TypingIndicator = () => (
    <TypingIndicatorContainer>
        <ActivityIndicator size="small" color="#9ca3af" />
    </TypingIndicatorContainer>
  );

  return (
    <Container>
      <Header>
        <BackButton onPress={() => Navigation.dismissModal(props.componentId)}>
          <Icon name="arrow-left" size={24} color="#1f2937" />
        </BackButton>
        <Icon name="message-circle" size={28} color="#4f46e5" style={{ marginLeft: 16 }}/>
        <HeaderTitle>Safety Assistant</HeaderTitle>
      </Header>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <MessageListContainer>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <MessageBubble role={item.role}>
                <MessageText role={item.role}>{item.text}</MessageText>
              </MessageBubble>
            )}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ padding: 16 }}
            ListFooterComponent={isLoading ? TypingIndicator : null}
          />
        </MessageListContainer>
        <InputBar>
          <StyledInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask for safety advice..."
            placeholderTextColor="#9ca3af"
            editable={!isLoading}
          />
          <SendButton onPress={handleSend} disabled={isLoading || !input.trim()} style={{ opacity: (isLoading || !input.trim()) ? 0.5 : 1 }}>
            <Icon name="send" size={24} color="white" />
          </SendButton>
        </InputBar>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default SafetyAssistantScreen;