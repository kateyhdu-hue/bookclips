export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({ok:false,error:"Method not allowed"});
  const apiKey=process.env.GOOGLE_VISION_API_KEY;
  if(!apiKey)return res.status(500).json({ok:false,error:"Missing GOOGLE_VISION_API_KEY. Add it in Vercel Project Settings > Environment Variables."});
  try{
    const {base64Image,languageHint="zh"}=req.body||{};
    if(!base64Image||typeof base64Image!=="string")return res.status(400).json({ok:false,error:"Missing base64Image"});
    const content=base64Image.replace(/^data:image\/\w+;base64,/,"");
    const requestBody={requests:[{image:{content},features:[{type:"DOCUMENT_TEXT_DETECTION"}],imageContext:{languageHints:languageHint==="en"?["en"]:["zh","zh-CN","en"]}}]};
    const visionResponse=await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(requestBody)});
    const result=await visionResponse.json();
    if(!visionResponse.ok)return res.status(visionResponse.status).json({ok:false,error:result?.error?.message||"Google Vision request failed",raw:result});
    const first=result.responses?.[0];
    if(first?.error)return res.status(502).json({ok:false,error:first.error.message||"Google Vision processing failed",raw:result});
    const text=first?.fullTextAnnotation?.text||first?.textAnnotations?.[0]?.description||"";
    return res.status(200).json({ok:true,text,raw:result});
  }catch(error){return res.status(500).json({ok:false,error:error.message||"Unexpected server error"})}
}
