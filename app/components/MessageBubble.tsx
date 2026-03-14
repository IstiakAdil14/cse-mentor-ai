interface Props {
    role: "user" | "assistant";
    content: string;
  }
  
  export default function MessageBubble({ role, content }: Props) {
    const isUser = role === "user";
    return (
      <div
        className={`p-3 rounded-lg max-w-xl break-words ${
          isUser ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-black"
        }`}
      >
        {content}
      </div>
    );
  }