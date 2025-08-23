"use client";

import cn from "classnames";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Messages } from "./messages";
import { modelID, models } from "@/lib/models";
import { Footnote } from "./footnote";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  StopIcon,
} from "./icons";

export function Chat() {
  const [input, setInput] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<modelID>("gpt-5-nano");

  const { messages, sendMessage, status, stop } = useChat({
    id: "primary",
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });

  const isGeneratingResponse = ["streaming", "submitted"].includes(status);

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 pt-8 flex flex-col h-dvh items-center w-full max-w-3xl",
        {
          "justify-between": messages.length > 0,
          "justify-center gap-4": messages.length === 0,
        },
      )}
    >
      {messages.length > 0 ? (
        <Messages messages={messages} status={status} />
      ) : (
        <div className="flex flex-col gap-0.5 sm:text-2xl text-xl w-full">
          <div className="flex flex-row gap-2 items-center">
            <div>Welcome to 2b2AI</div>
          </div>
          <div className="dark:text-zinc-500 text-zinc-400">
            Enter a 2b2t player username to generate an analysis report!
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        <div className="flex relative flex-col gap-1 p-3 w-full rounded-2xl dark:bg-zinc-800 bg-zinc-100">
          <textarea
            className="mb-12 w-full bg-transparent outline-none resize-none min-h-12 placeholder:text-zinc-400"
            placeholder={messages.length === 0 ? "Enter a 2b2t player username to analyze" : "Continue the conversation..."}
            value={input}
            autoFocus
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                if (input === "") {
                  return;
                }

                if (isGeneratingResponse) {
                  toast.error("Please wait for the model to finish its response!");
                  return;
                }

                if (messages.length === 0) {
                  // first msg - player analysis
                  try {
                    const userMessage = `Please anaylyze: ${input}`;
                    
                    sendMessage(
                      { text: userMessage },
                      {
                        body: {
                          selectedModelId,
                          isAnalysis: true,
                          playerName: input,
                        },
                      }
                    );
                  } catch (error) {
                    console.error('Error starting analysis:', error);
                    toast.error('Failed to start analysis. Please try again.');
                  }
                } else {
                  // regular msg
                  sendMessage(
                    { text: input },
                    {
                      body: {
                        selectedModelId,
                      },
                    }
                  );
                }
                
                setInput("");
              }
            }}
          />



          <div className="absolute bottom-2.5 right-2.5 flex flex-row gap-2">
            <div className="relative w-fit text-sm p-1.5 rounded-lg flex flex-row items-center gap-0.5 dark:hover:bg-zinc-700 hover:bg-zinc-200 cursor-pointer">
              {/* <div>
                {selectedModel ? selectedModel.name : "Models Unavailable!"}
              </div> */}
              <div className="flex justify-center items-center px-1 text-zinc-500 dark:text-zinc-400">
                <span className="pr-1">{models[selectedModelId]}</span>
                <ChevronDownIcon />
              </div>

              <select
                className="absolute left-0 p-1 w-full opacity-0 cursor-pointer"
                value={selectedModelId}
                onChange={(event) => {
                  setSelectedModelId(event.target.value as modelID);
                }}
              >
                {Object.entries(models).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={cn(
                "size-8 flex flex-row justify-center items-center dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 p-1.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-300 hover:scale-105 active:scale-95 transition-all",
                {
                  "dark:bg-zinc-200 dark:text-zinc-500":
                    isGeneratingResponse || input === "",
                },
              )}
              onClick={async () => {
                if (input === "") {
                  return;
                }

                if (isGeneratingResponse) {
                  stop();
                } else {
                  try {
                    if (messages.length === 0) {
                      const userMessage = `Analyze player: ${input}`;
                      
                      sendMessage(
                        { text: userMessage },
                        {
                          body: {
                            selectedModelId,
                            isAnalysis: true,
                            playerName: input,
                          },
                        }
                      );
                    } else {
                      sendMessage(
                        { text: input },
                        {
                          body: {
                            selectedModelId,
                          },
                        }
                      );
                    }
                  } catch (error) {
                    console.error('Error sending message:', error);
                    toast.error('Failed to send message. Please try again.');
                  }
                }

                setInput("");
              }}
            >
              {isGeneratingResponse ? <StopIcon /> : <ArrowUpIcon />}
            </button>
          </div>
        </div>

        <Footnote />
      </div>
    </div>
  );
}
