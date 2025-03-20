bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    // Send the user's message to ChatGPT
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    // Send the ChatGPT response back to the user
    bot.sendMessage(chatId, response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);

    // Log the full error for debugging
    if (error.response) {
      console.error('OpenAI API Response Error:', error.response.data);
    } else if (error.request) {
      console.error('OpenAI API Request Error:', error.request);
    } else {
      console.error('OpenAI API Error:', error.message);
    }

    // Send a user-friendly error message
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
  }
});
