import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    // In a real app, you would call OpenAI/Anthropic/Gemini here.
    // For this demo, we use a smart responder logic.
    
    let response = "";
    const msg = message.toLowerCase();

    if (msg.includes('cpu')) {
      response = "CPU là bộ não của máy tính. Khi chọn CPU, bạn cần chú ý đến Socket (vòng chân cắm) phải tương thích với Mainboard nhé! Bạn đang dùng Intel hay AMD?";
    } else if (msg.includes('mainboard') || msg.includes('bo mạch')) {
      response = "Mainboard kết nối mọi linh kiện. Hãy chắc chắn bộ nguồn (PSU) của bạn có đủ dây cắm cho các khe cắm phụ trợ trên main nhé.";
    } else if (msg.includes('ram')) {
      response = "RAM giúp máy tính đa nhiệm. Hiện nay 16GB là mức tiêu chuẩn cho gaming và làm việc văn phòng mượt mà.";
    } else {
      response = "Tôi là AI Guru, rất vui được hỗ trợ bạn về kiến thức phần cứng máy tính. Bạn có thắc mắc cụ thể nào về các linh kiện không?";
    }

    return NextResponse.json({ reply: response });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
