import { sendMessage, getMessages } from '../services/dbService.js';
import { formatDateTime } from '../utils/helpers.js';

export function renderChatBubble(userId) {
  const chatBubble = document.createElement('div');
  chatBubble.className = 'chat-bubble';
  chatBubble.id = 'chatBubble';
  
  chatBubble.innerHTML = `
    <button class="chat-button" id="chatButton" title="Mở chat">
      <i class="fas fa-comments"></i>
    </button>
    <div class="chat-window hidden" id="chatWindow">
      <div class="chat-header">
        <h3>Trò chuyện</h3>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input">
        <input type="text" id="chatMessageInput" placeholder="Nhập tin nhắn...">
        <button id="sendMessageBtn">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(chatBubble);
  
  setupChatEvents(userId);
}

function setupChatEvents(userId) {
  const chatButton = document.getElementById('chatButton');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('chatMessageInput');
  const sendBtn = document.getElementById('sendMessageBtn');

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      messageInput.focus();
      loadMessages(userId);
    }
  });

  // Send message
  const sendMessage_ = async () => {
    const message = messageInput.value.trim();
    if (!message) return;

    // Kiểm tra nếu conversation ID đã tồn tại, nếu không tạo mới
    let conversationId = sessionStorage.getItem('chatConversationId');
    if (!conversationId) {
      conversationId = `conv_${Date.now()}`;
      sessionStorage.setItem('chatConversationId', conversationId);
    }

    const result = await sendMessage({
      conversationId,
      senderId: userId,
      senderName: 'You',
      text: message,
      timestamp: new Date()
    });

    if (result.success) {
      messageInput.value = '';
      loadMessages(userId);
    }
  };

  sendBtn.addEventListener('click', sendMessage_);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage_();
    }
  });

  // Close chat khi click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.chat-bubble')) {
      chatWindow.classList.add('hidden');
    }
  });
}

async function loadMessages(userId) {
  const conversationId = sessionStorage.getItem('chatConversationId');
  if (!conversationId) return;

  const chatMessages = document.getElementById('chatMessages');
  const messages = await getMessages(conversationId);

  if (messages.length === 0) {
    chatMessages.innerHTML = '<div class="text-center text-muted p-2">Chưa có tin nhắn</div>';
    return;
  }

  chatMessages.innerHTML = messages.map(msg => `
    <div class="message ${msg.senderId === userId ? 'message-sent' : 'message-received'}">
      <small>${formatDateTime(msg.createdAt)}</small>
      <p>${escapeHtml(msg.text)}</p>
    </div>
  `).join('');

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
