// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { MessageSquare } from "lucide-react";

// type ConversationSummary = {
//   id: string;
//   otherParticipant: {
//     clerkUserId: string;
//     name: string;
//     imageUrl: string | null;
//   };
//   lastMessage: { body: string; senderId: string; createdAt: string } | null;
//   lastMessageAt: string | null;
// };

// export default function MessagesInboxPage() {
//   const [conversations, setConversations] = useState<ConversationSummary[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchConversations = async () => {
//       try {
//         const res = await fetch("/api/conversations");
//         const data = await res.json();
//         setConversations(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConversations();
//   }, []);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
//       <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

//         {loading ? (
//           <div className="space-y-3">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="h-20 rounded-2xl bg-white animate-pulse border"
//               />
//             ))}
//           </div>
//         ) : conversations.length === 0 ? (
//           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
//             <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-500">
//               No conversations yet. Message a provider from their profile to get
//               started.
//             </p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
//             {conversations.map((conv) => (
//               <Link
//                 key={conv.id}
//                 href={`/messages/${conv.id}`}
//                 className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
//               >
//                 <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0">
//                   {conv.otherParticipant.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-gray-900 truncate">
//                     {conv.otherParticipant.name}
//                   </p>
//                   <p className="text-sm text-gray-500 truncate">
//                     {conv.lastMessage?.body ?? "No messages yet"}
//                   </p>
//                 </div>
//                 {conv.lastMessageAt && (
//                   <span className="text-xs text-gray-400 shrink-0">
//                     {new Date(conv.lastMessageAt).toLocaleDateString("en-KE", {
//                       month: "short",
//                       day: "numeric",
//                     })}
//                   </span>
//                 )}
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

type ConversationSummary = {
  id: string;
  otherParticipant: {
    clerkUserId: string;
    name: string;
    imageUrl: string | null;
  };
  lastMessage: { body: string; senderId: string; createdAt: string } | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export default function MessagesInboxPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No conversations yet. Message a provider from their profile to get
              started.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0">
                  {conv.otherParticipant.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate ${
                      conv.unreadCount > 0
                        ? "font-semibold text-gray-900"
                        : "font-medium text-gray-900"
                    }`}
                  >
                    {conv.otherParticipant.name}
                  </p>
                  <p
                    className={`text-sm truncate ${
                      conv.unreadCount > 0 ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {conv.lastMessage?.body ?? "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {conv.lastMessageAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(conv.lastMessageAt).toLocaleDateString(
                        "en-KE",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
