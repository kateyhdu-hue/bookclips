export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: "Missing OPENAI_API_KEY. Add it in Vercel Project Settings > Environment Variables."
    });
  }

  try {
    const { rawText, languageHint = "zh" } = req.body || {};

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ ok: false, error: "Missing rawText" });
    }

const systemPrompt = languageHint === "en"
  ? "You clean OCR text from photographed physical books. Correct obvious OCR mistakes, remove page numbers, headers, footers and noise. Do not preserve physical line breaks from the image. Merge broken lines within the same paragraph into continuous prose. Keep paragraph breaks only when there is a clear paragraph boundary. Restore punctuation where appropriate. Preserve the author's wording and meaning. Do not summarize, explain, translate, expand, or invent missing content. Return only the corrected text."
  : "你负责清理从实体书照片 OCR 得到的文字。请修正明显 OCR 错字、乱码和断行错误，去掉页码、页眉、页脚、脚注编号和无关噪音。不要保留图片中的物理换行；同一自然段内被 OCR 拆开的行必须合并为连续文字。只有在明显是新的自然段时才换行。尽量恢复原书标点。必须保留作者原意和原文风格，不要总结、解释、扩写、翻译或编造缺失内容。只输出修正后的正文。";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: rawText
          }
        ],
        temperature: 0.1,
        max_output_tokens: 2000
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: result?.error?.message || "OpenAI correction failed",
        raw: result
      });
    }

    const text = result.output_text || extractTextFromResponses(result) || rawText;

    return res.status(200).json({
      ok: true,
      text,
      raw: result
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unexpected server error"
    });
  }
}

function extractTextFromResponses(result) {
  try {
    return (result.output || [])
      .flatMap(item => item.content || [])
      .map(content => content.text || "")
      .join("")
      .trim();
  } catch {
    return "";
  }
}
