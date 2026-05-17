import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "Xin lỗi, API Key chưa được cấu hình. Tôi không thể trả lời lúc này." });
    }

    const systemPrompt = "Bạn là AI Guru, chuyên gia phần cứng máy tính và công nghệ. Bạn hãy trả lời mọi câu hỏi của học sinh một cách trọn vẹn, không giới hạn chủ đề, nhiệt tình, ngôn ngữ dễ hiểu và truyền cảm hứng.";

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nCâu hỏi của học sinh: ${message}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json({ reply: "Hệ thống AI đang quá tải, vui lòng thử lại sau." });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
