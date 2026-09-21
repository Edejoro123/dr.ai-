const chatForm = document.getElementById('chat-form');
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');

// Simulated bot responses (replace with backend integration if needed)
const botReplies = {
  headache: {
    advice: "Headaches can be caused by stress, dehydration, or lack of sleep. Rest, drink water, and manage stress.",
    drug: "You can try over-the-counter pain relievers like ibuprofen or acetaminophen.",
  },
  fever: {
    advice: "Fever indicates an infection or illness. Stay hydrated, rest, and take antipyretics if needed.",
    drug: "Take acetaminophen or ibuprofen to reduce fever. Consult a doctor if it exceeds 103°F.",
    
  },
  cold: {
    advice: "Colds are caused by viruses. Rest, drink fluids, and try remedies for symptoms.",
    drug: "Use decongestants like pseudoephedrine or antihistamines like loratadine.",
  },
  default: {
    advice: "I'm here to help! Can you provide more details about your symptoms or concerns?",
    drug: "Consult a pharmacist or doctor for appropriate medication.",
  },
  greetings: "Hello! How can I assist you today with your health concerns?",
  thanks: "You're welcome! Stay healthy!",
  goodbye: "Goodbye! Take care and see you later!",
  no: "ok no problem Take care and see you later!",
  sex: 
};

// Function to display messages
function displayMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
  messageDiv.textContent = message;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the bottom
}

// Function to handle bot typing animation
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = `<span></span><span></span><span></span>`;
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return typingDiv;
}

// Function to process user input and generate bot reply
function processInput(input) {
  input = input.toLowerCase();
  
  // Greetings and farewells
  if (/^(hi|hello|hey|good morning|good evening|see you later)$/.test(input)) {
    return botReplies.greetings;
  }
  if (/^(thanks|thank you|thank you very much)$/.test(input)) {
    return botReplies.thanks;
  }
  if (/^(goodbye|bye|see you)$/.test(input)) {
    return botReplies.goodbye;
  }

  // Recognize "I have [sickness]" or "I'm feeling [sickness]"
  const illnessMatch = input.match(/(?:i have|i'm having|i feel|i caught|im having|i am having) ([a-z\s]+)/);
  if (illnessMatch) {
    const illness = illnessMatch[1].trim();
    const response = botReplies[illness] || botReplies.default;
    return `${response.advice} ${response.drug ? `Recommended drug: ${response.drug}` : ""}`;
  }

  // Default response
  return botReplies.default.advice;
}

// Handle form submission
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const userMessage = userInput.value.trim();

  if (userMessage) {
    displayMessage(userMessage, 'user'); // Show user's message
    userInput.value = ''; // Clear input

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Simulate delay before bot reply
    setTimeout(() => {
      typingIndicator.remove(); // Remove typing indicator
      const botReply = processInput(userMessage); // Generate bot reply
      displayMessage(botReply, 'bot'); // Show bot's message

      // Follow-up question
      setTimeout(() => {
        displayMessage("Do you have anything else I can help you with?", 'bot');
      }, 500);
    }, 3000); // 3-second delay
  }
});
