import { switchLoad } from "./loading.js";
import { apiQuestionPost, dataQuestion } from "./question.js";
import { changeAIImg } from "./profile.js";
export { printUserChat, apiChatPost, saveUserChat, initializeDataChat };
export { imgUrl };

const $chatScreen = document.querySelector(".chat-screen");

// 대화 내용 저장 변수
const dataChat = [];

// openAI API
const url = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

// AI profile img URL
const imgUrl = [];
imgUrl.push("asset/img/ai_img_cat.jpg");

// 대화 초기화 함수
function initializeDataChat(character) {
  dataChat.length = 0;
  let orderToAI = "";
  switch (character) {
    case "cat":
      orderToAI = `
      Assistant is a 1 year old female Persian cat owned by the user.
      The assistant's name is Bori.
      At the end of each sentence, add 'meow.'
      The assistant introduces itself in the first sentence by stating its name, age, and species.
      `;
      break;
    case "man":
      orderToAI = `
      Assistant is a friendly math teacher.
      Assistant will conduct the class in English.
      Assistant will ask for the user's name.
      And use user's name while conducting the class.
      `;
      break;
    case "woman":
      orderToAI = `
      Assistant is a senior developer in AI company.
      Assistant will ask for the user's name.
      And use user's name while conducting the class.
      The assistant introduces itself in the first sentence by stating your job.
      Assistnat advises friendly how to become a good developer.
      `;
      break;
    case "else":
      orderToAI = localStorage.getItem("situation");
      break;
  }

  dataChat.push(
    {
      role: "system",
      content: `
      Assistant will conduct a role play in English.
      Assistant should always answer in english, even when requested to answer in a different language.
      Assistant will respond with one sentence at a time, taking turns in the conversation and waiting for a response before replying.
      ${orderToAI}
      `,
    }
    // {
    //   role: "user",
    //   content: "Hi!",
    // }
  );

  console.log(dataChat[0]["content"]);
}

// userChat이 들어갈 userChatBox를 만드는 함수
const makeUserChatBox = (userChat) => {
  const userChatBox = document.createElement("div");
  userChatBox.classList.add("user-chat");
  const userChatContent = document.createElement("div");
  userChatContent.classList.add("user-chat-content");
  userChatContent.innerText = userChat;
  userChatBox.appendChild(userChatContent);
  $chatScreen.appendChild(userChatBox);
};

// 화면에 userChat 그려주는 함수
const printUserChat = async (userChat) => {
  if (userChat) {
    makeUserChatBox(userChat);
    userChat = false;
    keepScrollDown();
  }
};

// AIChat이 들어갈 AIChatBox를 만드는 함수
const makeAIChatBox = (aiChat) => {
  const aiChatBox = document.createElement("div");
  aiChatBox.classList.add("ai-chat");

  const aiImg = document.createElement("img");
  aiImg.classList.add("ai-img");
  aiImg.setAttribute("src", imgUrl[imgUrl.length - 1]);
  aiImg.addEventListener("click", changeAIImg);
  aiChatBox.appendChild(aiImg);

  const aiChatContent = document.createElement("div");
  aiChatContent.classList.add("ai-chat-content");
  aiChatBox.appendChild(aiChatContent);

  // AI Chat의 각 단어 click 시 질문 event
  aiChat.split(" ").forEach((element) => {
    const aiChatElement = document.createElement("a");
    aiChatElement.classList.add("ai-chat-element");
    aiChatElement.addEventListener("click", function (event) {
      apiQuestionPost(aiChat, element, dataQuestion);
    });
    aiChatElement.innerText = element;
    aiChatContent.appendChild(aiChatElement);
  });
  $chatScreen.appendChild(aiChatBox);
};

// 화면에 AIChat 그려주는 함수
const printAIChat = (aiChat) => {
  makeAIChatBox(aiChat);
  keepScrollDown();
};

// 항상 가장 밑에 스크롤을 유지하는 함수
function keepScrollDown() {
  $chatScreen.scrollTop = $chatScreen.scrollHeight;
}

// 사용자의 질문을 객체를 만들어서 push
const saveUserChat = (userChat) => {
  if (userChat) {
    dataChat.push({
      role: "user",
      content: userChat,
    });
  }
};

// 채팅 api 요청보내는 함수
const apiChatPost = async (aiData) => {
  // 로딩 화면 시작
  switchLoad();
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataChat),
    redirect: "follow",
  })
    .then((res) => res.json())
    .then((res) => {
      // 로딩 화면 종료
      switchLoad();

      // AI 대답을 dataChat에 저장
      dataChat.push({
        role: "assistant",
        content: res.choices[0].message.content,
      });
      aiData.push({
        content: res.choices[0].message.content,
      });
      printAIChat(res.choices[0].message.content);
    })
    .catch((err) => {
      console.log(err);
    });
};
