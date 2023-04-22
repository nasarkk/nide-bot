const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require("openai");
const token = '5713257425:AAHl_MOUYGz_DaaXJj0sDhTNYmdmD3DNYDA';
const openaiToken = "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";
const config = new Configuration({
  apiKey: openaiToken,
});

const openai = new OpenAIApi(config);

const bot = new Telegraf(token);

bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error.code === 403 && error.description === 'Forbidden: bot was blocked by the user') {
      console.warn(`Bot was blocked by the user: ${ctx.chat.id}`);
      // Perform any additional acation you want to tahake when the bot is blocbbked by a user
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
});

bot.catch((err, ctx) => {
  console.error(`Error handling update ${ctx.updateType}:`, err);
  ctx.reply('Oops! Something went wrong. Please try again.');
});
bot.catch((err, ctx) => {
  console.log(`Error encountered for ${ctx.updateType}`, err);
  const errMsg = err.message || 'An error occurred';

  if (errMsg.includes('Forbidden: bot was blocked by the user')) {
    console.log('The bot was blocked by the user.');
    // You can handle the error here, e.g., logging it or sending a notification to the developer.
  } 
});

const a = ["hi", '/ask', 'hlo', 'hiii', 'good morning', 'good afternoon', 'good evening', 'good night','hello', 'halo', 'hey','hi there', 'hi chatgpt', 'hai', '/chat', 'hi bot', 'heyy', 'hello there', 'h', 'hii', 'helo', 'hey there', 'how are u'];
const b = ['sex', 'horny', 'sexy', 'porn', 'nude', 'fuck', 'dick', 'dirty', 'flirt', 'bikini', 'how to make bomb']

const userMessageCount = {};

bot.on('photo', (ctx) => {
    const chatId = ctx.chat.id;
    bot.telegram.sendMessage(chatId, 'Upgrade your Plan to use this feature❗');
  }); 
  
  // Handle audio message
  bot.on('audio', (ctx) => {
    const chatId = ctx.chat.id;
    bot.telegram.sendMessage(chatId, 'You sent a audio! Ask questions as text');
  });
  
  // Handle video message
  bot.on('video', (ctx) => {
    const chatId = ctx.chat.id;
    bot.telegram.sendMessage(chatId, 'You sent a video! Ask questions as text');
  });

  bot.on('document', (ctx) => {
    const chatId = ctx.chat.id;
    bot.telegram.sendMessage(chatId, 'You sent a document! Ask questions as text');
  });


bot.start((ctx) => {
  //throw new Error('Example error1')
  ctx.reply('Welcome to ChatGPT bot! How can I help you.');
});


bot.on('message', async (ctx) => {
  //throw new Error('Example error')
  const msg = ctx.message;

  if (msg.text.startsWith('/start')) return;

  const userId = msg.from.id;
  if (!userMessageCount[userId]) {
    userMessageCount[userId] = 0;
  }

  if (userMessageCount[userId] < 3) {
    userMessageCount[userId]++;

    if (msg.text && a.includes(msg.text.toLowerCase())) {
      ctx.reply('Hello there! How can I assist you?');
    } 
    else if (msg.text && b.some(keyword => msg.text.toLowerCase().includes(keyword))) {
      ctx.reply('I am sorry, I am not able to provide this. Providing such data would not be appropriate for this platform.');
    }
    else if (msg.text === '/img') {
      ctx.reply('Type your prompt along with /img');
    }
    else if (msg.text.includes('/img')) {
      ctx.replyWithChatAction('upload_photo');

      const prompt = msg.text.replace('/img', '').trim();

      const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      image_url = response.data.data[0].url;

      ctx.replyWithPhoto(image_url);
    }
    else {
      ctx.replyWithChatAction('typing');
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: msg.text}],
      });

      ctx.reply(completion.data.choices[0].message.content);
    }
  }
  else {
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Upgrade Plan 💎',
              url: 't.me/chatgpt_paymentbot'
            }
          ],
          [
            {
              text: 'Public Channel 📢',
              url: 'https://t.me/chatgpt_ask'
            }
          ],
        ]
      }
    };
    ctx.reply("Upgrade your Plan for Unlimited Access❗Get GPT-4, ImageGPT, AI image Generator and more", opts);
  }
});

// Error handlerhxg
bot.catch((err, ctx) => {
  console.log(`Error for ${ctx.updateType}`, err);
}); 



bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
