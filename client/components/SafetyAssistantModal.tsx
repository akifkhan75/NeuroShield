import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { IconArrowLeft, IconBot } from '../constants';
import { ChatMessage } from '../types';

const Container = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background-color: #fff;
`;

const KAV = styled(KeyboardAvoidingView).attrs({
    behavior: Platform.OS === "ios" ? "padding" : "height"
})`
  flex: 1;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const MessageList = styled(FlatList<ChatMessage>)`
  flex: 1;
  background-color: #f3f4f6;
  padding: 16px;
`;

const InputBar = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 8px;
  border-top-width: 1px;
  border-top-color: #e5e7eb;
  background-color: white;
  gap: 8px;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  background-color: #f3f4f6;
  border-radius: 9999px;
  padding: 12px 16px;
  font-size: 16px;
`;

const SendButton = styled(TouchableOpacity)`
  background-color: #4f46e5;
  padding: 12px;
  border-radius: 9999px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
`;

const MessageRow = styled(View)<{ role: 'user' | 'model' }>`
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
  margin-vertical: 4px;
  justify-content: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled(View)<{ role: 'user' | 'model' }>`
  padding: 12px;
  border-radius: 20px;
  max-width: 80%;
  background-color: ${props => props.role === 'user' ? '#4f46e5' : '#e5e7eb'};
  border-bottom-right-radius: ${props => props.role === 'user' ? 4 : 20}px;
  border-bottom-left-radius: ${props => props.role === 'model' ? 4 : 20}px;
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
`;

interface SafetyAssistantModalProps {
  onClose: () => void;
}

const TypingIndicator: React.FC = () => (
    <TypingIndicatorContainer>
        <ActivityIndicator size="small" color="#6b7280" />
    </TypingIndicatorContainer>
);

export const SafetyAssistantModal: React.FC<SafetyAssistantModalProps> = ({ onClose }) => {
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
      const history = messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
      }));

      const response = await fetch('/api/ai/safety-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history,
          message: currentInput
        }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

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

  const renderMessageItem = ({ item }: { item: ChatMessage }) => (
    <MessageRow role={item.role}>
        {item.role === 'model' && <IconBot size={28} color="#6b7280" />}
        <MessageBubble role={item.role}>
            <MessageText role={item.role}>{item.text}</MessageText>
        </MessageBubble>
    </MessageRow>
  );

  return (
    <Container>
      <Header>
        <BackButton onPress={onClose}>
          <IconArrowLeft size={24} color="#1f2937" />
        </BackButton>
        <IconBot size={28} color="#4f46e5"/>
        <HeaderTitle>Safety Assistant</HeaderTitle>
      </Header>
      
      <KAV>
        <MessageList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => index.toString()}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />

        <InputBar>
            <StyledInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask for safety advice..."
            editable={!isLoading}
            />
            <SendButton onPress={handleSend} disabled={isLoading || !input.trim()}>
                <IconArrowLeft size={24} color="white" style={{ transform: [{rotate: '180deg'}] }}/>
            </SendButton>
        </InputBar>
      </KAV>
    </Container>
  );
};
