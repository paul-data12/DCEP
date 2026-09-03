import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processBatch(textBatch: string) {
  const prompt = `
    You are an expert exam content extractor.
    Extract ALL multiple choice questions from this text dump.
    
    Rules:
    1. Correctly identify the question text.
    2. Identify all options.
    3. Identify which option(s) are correct. If multiple are correct, mark all of them as is_correct: true, and set question_type to "multi_select". Otherwise "single_choice".
    4. For "domain_topic", infer a brief 1-3 word category based on the question content (e.g. "Data Modeling", "Agile", "Requirements").
    5. For "explanation", provide a brief 1-2 sentence explanation of why the answer is correct based on the text or general knowledge if not provided.
    6. For "source", use "PDF Import".
    7. For "is_verified", set it to true.
    
    TEXT:
    ${textBatch}
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      maxOutputTokens: 8192,
    }
  });

  return JSON.parse(response.text || '[]');
}

async function main() {
  const transcriptPath = '/Users/mac/.gemini/antigravity/brain/594d96eb-e9c9-42f8-a45e-606fbfff2bc8/.system_generated/logs/transcript_full.jsonl';
  const transcript = fs.readFileSync(transcriptPath, 'utf8');
  const lines = transcript.split('\n').filter(Boolean);
  let pdfText = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const line = JSON.parse(lines[i]);
      if (line.type === 'USER_INPUT' && line.content && line.content.includes('here is the first part')) {
        // Extract everything after ADDITIONAL_METADATA tag
        const match = line.content.match(/<\/ADDITIONAL_METADATA>([\s\S]*)$/);
        if (match) {
          pdfText = match[1];
          break;
        }
      }
    } catch(e) {}
  }

  if (!pdfText) {
    console.log("No PDF text found in transcript!");
    process.exit(1);
  }

  const chunks = pdfText.split(/Question:\s*\d+/i);
  chunks.shift(); // remove intro
  
  console.log(`Found ${chunks.length} questions to process...`);
  
  const batchSize = 15;
  let allQuestions: any[] = [];
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(chunks.length/batchSize)}`);
    const batch = chunks.slice(i, i + batchSize).join('\n\n---NEXT QUESTION---\n\n');
    try {
      const parsed = await processBatch(batch);
      allQuestions.push(...parsed);
      console.log(`  -> Extracted ${parsed.length} questions`);
    } catch (e: any) {
      console.error(`  -> Failed to process batch ${Math.floor(i/batchSize) + 1}`, e.message);
    }
    // Rate limit sleep
    await new Promise(r => setTimeout(r, 2000));
  }
  
  fs.writeFileSync('public/extracted_questions.json', JSON.stringify(allQuestions, null, 2));
  console.log(`Done! Saved ${allQuestions.length} questions to public/extracted_questions.json`);
}

main().catch(console.error);
