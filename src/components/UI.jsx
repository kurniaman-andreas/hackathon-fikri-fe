import { useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export const UI = ({ hidden, ...props }) => {
  const micButtonRef = useRef(null);

  useEffect(() => {
    const chatBox = document.getElementById("chat-box");
    const existingDefaultMessage = document.getElementById("default-message");

    if (!existingDefaultMessage) {
      const defaultMessage = document.createElement("p");
      defaultMessage.id = "default-message";
      defaultMessage.textContent = "Apakah ada yang bisa saya bantu?";
      chatBox?.appendChild(defaultMessage);
    }

    const handleMicButtonClick = async (event) => {
      event.preventDefault();

      const speechKey = "4d210f9e547840a7a9cc0a47784a3035"; // Ganti dengan kunci API Azure Speech Anda
      const serviceRegion = "southeastasia"; // Ganti dengan region Anda
      const apiKeyOpenAI = "224746b6ce8e4ddeac4a2a9442db5466"; // Ganti dengan kunci API OpenAI Anda
      const openAIEndpoint =
        "https://danie-m2lgughl-westeurope.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview";

      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        speechKey,
        serviceRegion
      );
      speechConfig.speechRecognitionLanguage = "id-ID";
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(
        speechConfig,
        audioConfig
      );

      const defaultMessageElement = document.getElementById("default-message");
      if (defaultMessageElement) {
        chatBox?.removeChild(defaultMessageElement); // Hapus pesan default
      }

      const listeningMessage = document.createElement("p");
      listeningMessage.textContent = "Mendengarkan...";
      chatBox?.appendChild(listeningMessage);

      recognizer.recognizeOnceAsync(async (result) => {
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const recognizedText = result.text;
          listeningMessage.textContent = `Anda: ${recognizedText}`;

          const previousMessages = chatBox?.querySelectorAll("p:not(#mic-btn)"); // Mengabaikan elemen tombol
          previousMessages?.forEach((msg) => chatBox?.removeChild(msg)); // Menghapus elemen yang ada

          const payload = {
            messages: [{ role: "user", content: recognizedText }],
          };

          const openAIResponse = await fetch(openAIEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": apiKeyOpenAI,
            },
            body: JSON.stringify(payload),
          });

          const openAIResult = await openAIResponse.json();
          const responseText = openAIResult.choices[0].message.content;

          const botMessage = document.createElement("p");
          botMessage.textContent = `Chatbot: ${responseText}`;
          chatBox?.appendChild(botMessage);

          const speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(
            speechKey,
            serviceRegion
          );
          speechSynthesisConfig.speechSynthesisVoiceName = "id-ID-ArdiNeural";
          const audioOutputConfig =
            SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
          const synthesizer = new SpeechSDK.SpeechSynthesizer(
            speechSynthesisConfig,
            audioOutputConfig
          );

          synthesizer.speakTextAsync(responseText);
        } else {
          listeningMessage.textContent = "Tidak ada ucapan yang dikenali.";
        }
      });
    };

    micButtonRef.current = document.getElementById("mic-btn");
    micButtonRef.current.addEventListener("click", handleMicButtonClick);

    return () => {
      micButtonRef.current.removeEventListener("click", handleMicButtonClick);
    };
  }, []);

  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between flex-col pointer-events-none">
        <div className="w-full flex flex-col items-end justify-center gap-4"></div>
        <div>
          <div className="bg-white w-[70px] h-[70px] rounded-full drop-shadow-lg flex items-center justify-center fixed left-[60px] top-[15px] -translate-x-1/2 pointer-events-auto text-black text-[20px] font-plus-jakarta-sans border-2">
            <img src="translate.svg" alt="Icon" className="w-[45px] h-[45px]" />
          </div>
          <div
            className="bg-white w-[220px] h-12 rounded-3xl flex items-center justify-center fixed left-1/2 top-[500px] -translate-x-1/2 pointer-events-auto text-black text-[20px] font-plus-jakarta-sans border-2"
            style={{ borderColor: "#9741FF" }}
          >
            <img src="Message.svg" alt="Icon" className="w-6 h-6 mr-2" />
            Kotak Layanan
          </div>
          <div className="bg-[#1A0C44] w-full h-72 flex items-center justify-center relative">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#7C59FB] to-[#FEF8FF]"></div>
            <div className="flex -mt-24 flex-col text-center text-3xl text-white font-medium">
              <div className="">Halo!</div>
              <div
                id="chat-box"
                className="w-full max-w-xl h-16 overflow-y-auto py-2 px-5 m-auto text-xl"
              ></div>
            </div>
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center fixed bottom-[25px] left-1/2 -translate-x-1/2 pointer-events-auto">
              <div className="flex justify-center items-center m-auto">
                <a href="#" id="mic-btn">
                  <img src="mic.svg" alt="Microphone" className="w-10 h-10" />
                </a>
              </div>
              <div className="w-24 h-24 flex items-center justify-center fixed bottom left-[150px] -translate-x-1/2 pointer-events-auto">
                <div className="flex justify-center items-center m-auto">
                  <a href="#" id="mic-btn">
                    <img
                      src="keyboard.svg"
                      alt="Microphone"
                      className="w-10 h-10"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
