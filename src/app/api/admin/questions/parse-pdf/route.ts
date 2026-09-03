import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

// Allow up to 5 minutes for large PDF processing
export const maxDuration = 300;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in your .env file.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Uploaded file must be a PDF' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF must be under 50MB.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // ── Step 1: Upload file via File API (much more reliable for large PDFs) ──
    console.log(`Uploading PDF (${(file.size / 1024 / 1024).toFixed(1)}MB) to Gemini Files API...`);

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let uploadedFile;
    try {
      uploadedFile = await ai.files.upload({
        file: new Blob([fileBuffer], { type: 'application/pdf' }),
        config: { mimeType: 'application/pdf' },
      });
    } catch (uploadErr: any) {
      console.error('File upload failed:', uploadErr);
      return NextResponse.json(
        { error: 'Failed to upload PDF to AI service. Please try again.' },
        { status: 502 }
      );
    }

    if (!uploadedFile?.uri) {
      return NextResponse.json({ error: 'File upload returned no URI.' }, { status: 502 });
    }

    console.log(`File uploaded: ${uploadedFile.uri}`);

    // ── Step 2: Generate content referencing the uploaded file ──
    const prompt = `
      You are an expert exam content extractor.
      Extract ALL multiple choice questions from this PDF exam dump.
      
      Rules:
      1. Correctly identify the question text.
      2. Identify all options.
      3. Identify which option(s) are correct. If multiple are correct, mark all of them as is_correct: true, and set question_type to "multi_select". Otherwise "single_choice".
      4. For "domain_topic", infer a brief 1-3 word category based on the question content (e.g. "Data Modeling", "Agile", "Requirements").
      5. For "explanation", provide a brief 1-2 sentence explanation of why the answer is correct based on the text or general knowledge if not provided.
      6. For "source", use "PDF Import".
      7. For "is_verified", set it to true.
    `;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      description: "A list of extracted exam questions",
      items: {
        type: Type.OBJECT,
        properties: {
          domain_topic: { type: Type.STRING },
          question_type: { type: Type.STRING },
          question_text: { type: Type.STRING },
          explanation: { type: Type.STRING },
          source: { type: Type.STRING },
          is_verified: { type: Type.BOOLEAN },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                option_text: { type: Type.STRING },
                is_correct: { type: Type.BOOLEAN },
              },
              required: ["option_text", "is_correct"]
            }
          }
        },
        required: ["domain_topic", "question_type", "question_text", "explanation", "source", "is_verified", "options"]
      }
    };

    let lastError: any = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Gemini generate attempt ${attempt}/${MAX_RETRIES}...`);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            prompt,
            {
              fileData: {
                fileUri: uploadedFile.uri,
                mimeType: 'application/pdf',
              }
            }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            maxOutputTokens: 8192,
          }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned from Gemini");

        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (parseErr: any) {
          console.error("JSON Parse Error (truncated response):", parseErr.message);
          throw new Error("AI response was truncated because the PDF contains too many questions. Please split the PDF into smaller parts (e.g., 20-30 questions per file) and try again.");
        }
        
        console.log(`Successfully extracted ${parsed.length} questions from PDF`);
        return NextResponse.json({ questions: parsed });

      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || 0;
        const isRetryable = status === 503 || status === 429 ||
                            err?.message?.includes('timed out') ||
                            err?.message?.includes('UNAVAILABLE') ||
                            err?.message?.includes('overloaded');

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`Gemini API returned ${status}, retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        break;
      }
    }

    const userMessage = lastError?.message?.includes('timed out') || lastError?.message?.includes('UNAVAILABLE')
      ? 'The AI service is temporarily busy. Please wait 30 seconds and try again.'
      : lastError?.message || 'Failed to parse PDF';

    console.error('PDF Parse Error (all retries exhausted):', lastError);
    return NextResponse.json({ error: userMessage }, { status: 503 });

  } catch (error: any) {
    console.error('PDF Parse Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
