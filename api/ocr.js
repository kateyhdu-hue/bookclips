export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.OCR_SPACE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: "Missing OCR_SPACE_API_KEY. Please add it in Vercel Project Settings > Environment Variables."
    });
  }

  try {
    const { base64Image, language = "chs" } = req.body || {};

    if (!base64Image || typeof base64Image !== "string") {
      return res.status(400).json({ ok: false, error: "Missing base64Image" });
    }

    const params = new URLSearchParams();
    params.append("base64Image", base64Image);
    params.append("language", language);
    params.append("isOverlayRequired", "false");
    params.append("OCREngine", "3");
    params.append("scale", "true");
    params.append("detectOrientation", "true");
    params.append("isTable", "false");

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const result = await ocrResponse.json();

    if (!ocrResponse.ok || result.IsErroredOnProcessing) {
      const message = Array.isArray(result.ErrorMessage)
        ? result.ErrorMessage.join("; ")
        : result.ErrorMessage || result.ErrorDetails || "OCR.space processing failed";

      return res.status(502).json({
        ok: false,
        error: message,
        raw: result
      });
    }

    const text = (result.ParsedResults || [])
      .map(item => item.ParsedText || "")
      .join("\n")
      .trim();

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
