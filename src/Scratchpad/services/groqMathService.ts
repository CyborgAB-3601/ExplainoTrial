/**
 * Groq AI Math & Handwriting Service
 * Integrates Abpattar's MathNoteBook vision OCR and LLM solver pipeline
 * using Groq's qwen/qwen3.8-27b models.
 */

import { solveMathProblem, SolvedProblem } from '../utils/mathSolver';

// Groq & MathNoteBook Configurations
const LLM_BASE_URL =
  (import.meta.env.VITE_LLM_BASE_URL as string) ||
  'https://api.groq.com/openai/v1';
const LLM_MODEL =
  (import.meta.env.VITE_LLM_MODEL as string) || 'qwen/qwen3.8-27b';
const LLM_API_KEY =
  (import.meta.env.VITE_LLM_API_KEY as string) ||
  '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';

const VISION_LLM_BASE_URL =
  (import.meta.env.VITE_VISION_LLM_BASE_URL as string) ||
  'https://api.groq.com/openai/v1';
const VISION_LLM_MODEL =
  (import.meta.env.VITE_VISION_LLM_MODEL as string) || 'qwen/qwen3.8-27b';
const VISION_LLM_API_KEY =
  (import.meta.env.VITE_VISION_LLM_API_KEY as string) ||
  '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';

/**
 * Exports the HTML5 canvas with a crisp solid white background
 * to ensure maximum OCR contrast for the Vision LLM.
 */
export function exportCanvasAsWhitePNG(canvas: HTMLCanvasElement): string {
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(canvas.width, 100);
  offscreen.height = Math.max(canvas.height, 100);
  const ctx = offscreen.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  // Solid white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, offscreen.width, offscreen.height);

  // Draw current canvas strokes
  ctx.drawImage(canvas, 0, 0);

  return offscreen.toDataURL('image/png');
}

/**
 * Checks if the canvas has any drawn strokes
 */
export function isCanvasDrawn(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    // Check if any pixel has non-zero alpha
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] > 10) {
        return true;
      }
    }
  } catch {
    // If getImageData is tainted or fails, return false
    return false;
  }
  return false;
}

/**
 * Calls Groq Vision OCR to recognize handwritten equations or math diagrams
 * from the whiteboard canvas image.
 */
export async function recognizeHandwritingFromCanvas(
  canvas: HTMLCanvasElement
): Promise<string | null> {
  try {
    const imgDataUrl = exportCanvasAsWhitePNG(canvas);

    const promptText = `You are an expert mathematical, handwriting, and geometric drawing OCR reader. Look at the canvas drawing.
1. Read all handwritten text, labels, annotations, or equations written on the canvas.
2. If it is an algebraic or arithmetic equation/expression, transcribe the math accurately into plain text (e.g. '2x + 5 = 15', 'x^2 - 5x + 6 = 0', '4x - 8 = 16', '3 + 5 * 2').
3. If it is a geometric diagram, identify the shape and measurements (e.g. 'Right triangle with legs 3 and 4, find hypotenuse').
4. Output ONLY the transcribed equation or problem statement in plain text, with no markdown code blocks, quotes, or conversational filler.`;

    const payload = {
      model: VISION_LLM_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: imgDataUrl } },
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0.1,
    };

    const response = await fetch(`${VISION_LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VISION_LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Groq Vision OCR returned non-ok status:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Clean up any markdown code fences or quotes
    const cleaned = content
      .replace(/```[a-z]*\n?/gi, '')
      .replace(/```/g, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    return cleaned || null;
  } catch (err) {
    console.error('Error during handwriting recognition:', err);
    return null;
  }
}

/**
 * Cleans up raw LaTeX artifacts, dollar signs, and math formatting codes
 * into clean, readable, natural unicode characters for chat.
 */
export function cleanMathTextForChat(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove LaTeX math delimiters ($$ ... $$ and $ ... $)
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^\$\n]+)\$/g, '$1')
    // Remove any remaining stray single or double dollar signs
    .replace(/\$/g, '')
    // Common LaTeX operations to clean unicode
    .replace(/\\implies/g, ' → ')
    .replace(/\\rightarrow|\\to/g, ' → ')
    .replace(/\\times/g, ' × ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\le|\\leq/g, ' ≤ ')
    .replace(/\\ge|\\geq/g, ' ≥ ')
    .replace(/\\ne|\\neq/g, ' ≠ ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\deg|\\degree|\\circ/g, '°')
    .replace(/\\angle/g, '∠')
    .replace(/\\triangle/g, '△')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\left|\\right/g, '')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    // Clean superscripts
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    // Strip leftover backslashes
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/\\/g, '')
    .trim();
}

export interface InteractiveTutoringStep {
  stepNumber: number;
  title: string;
  boardExpression: string; // The math step to display on the whiteboard
  questionForStudent: string; // Socratic chat question waiting for user input
  expectedAnswer: string; // Expected numerical / algebraic answer
}

export interface DiagramInfo {
  type: 'pythagoras' | 'circle' | 'coordinate' | 'balance' | 'triangle' | 'none';
  title?: string;
  a?: number | string;
  b?: number | string;
  c?: number | string;
  r?: number | string;
  radius?: number | string;
  label?: string;
}

export interface InteractiveTutoringPlan {
  topic: string;
  originalEquation: string;
  solution: string;
  visualModel: 'balance' | 'tiles' | 'parabola' | null;
  diagram?: DiagramInfo;
  params?: {
    a?: number;
    b?: number;
    c?: number;
    p?: number;
    q?: number;
  };
  steps: InteractiveTutoringStep[];
}

/**
 * Generates an interactive Socratic step-by-step tutoring plan
 * for any math domain (Linear, Quadratic, Circles, Triangles, Trigonometry, Proofs).
 */
export async function generateInteractiveTutoringPlan(
  problemText: string
): Promise<InteractiveTutoringPlan> {
  const cleanedProblem = cleanMathTextForChat(problemText);

  // 1. Try Groq qwen/qwen3.8-27b with structured JSON output
  try {
    const prompt = `You are an expert Socratic AI Mathematics Tutor.
Break down this mathematical problem into 2 to 4 interactive tutoring steps where each step shows an operation and asks the student to solve the immediate next calculation:
Problem: ${cleanedProblem}

Example pattern for "2x + 5 = 10":
Step 1:
- title: "Subtract 5 from both sides"
- boardExpression: "2x = 10 - 5"
- questionForStudent: "Step 1: Subtract 5 from both sides: 2x = 10 - 5. What does 10 - 5 equal?"
- expectedAnswer: "5"
Step 2:
- title: "Divide both sides by 2"
- boardExpression: "x = 5 / 2"
- questionForStudent: "Awesome! Now we have 2x = 5. Divide both sides by 2: what is x?"
- expectedAnswer: "2.5"

CRITICAL RULES:
- IMPORTANT: In boardExpression, do NOT include the expectedAnswer at the end if it gives away the answer to questionForStudent! Put the working setup in boardExpression (e.g. "2x = 10 - 5", "x = 5 / 2", "c² = 3² + 4² = 9 + 16", "r = 20 / (2 * 3.14)").
- Work for any topic: Linear, Quadratic, Trigonometry, Geometry, Circles, Triangles, Proofs, Arithmetic.
- Never use dollar signs ($) or LaTeX delimiters.
- Write clean math (x², x³, √, π, θ, ->, ×, ÷).

Return ONLY valid JSON matching this schema:
{
  "topic": "topic name",
  "originalEquation": "problem expression",
  "solution": "final answer",
  "visualModel": "balance" | "tiles" | "parabola" | null,
  "params": { "a": 2, "b": 5, "c": 10 },
  "steps": [
    {
      "stepNumber": 1,
      "title": "step title",
      "boardExpression": "math expression on whiteboard",
      "questionForStudent": "friendly question for student",
      "expectedAnswer": "short answer"
    }
  ]
}`;

    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawJson = data.choices?.[0]?.message?.content?.trim();
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        if (parsed.steps && parsed.steps.length > 0) {
          return {
            topic: cleanMathTextForChat(parsed.topic || 'Step-by-step Math'),
            originalEquation: cleanMathTextForChat(parsed.originalEquation || cleanedProblem),
            solution: cleanMathTextForChat(parsed.solution || 'Solved'),
            visualModel: parsed.visualModel || (cleanedProblem.includes('²') || cleanedProblem.includes('^2') ? 'parabola' : cleanedProblem.includes('=') ? 'balance' : null),
            params: parsed.params,
            steps: parsed.steps.map((st: any, idx: number) => ({
              stepNumber: st.stepNumber || idx + 1,
              title: cleanMathTextForChat(st.title || `Step ${idx + 1}`),
              boardExpression: cleanMathTextForChat(st.boardExpression || ''),
              questionForStudent: cleanMathTextForChat(st.questionForStudent || `What is the result for Step ${idx + 1}?`),
              expectedAnswer: cleanMathTextForChat(String(st.expectedAnswer || '')),
            })),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Groq structured plan generation failed, falling back to local CAS solver:', err);
  }

  // 2. Reliable Local Fallback
  const localSolved = solveMathProblem(problemText);
  const steps: InteractiveTutoringStep[] = [];

  if (localSolved.type === 'linear' && localSolved.params) {
    const a = localSolved.params.a ?? 1;
    const b = localSolved.params.b ?? 0;
    const c = localSolved.params.c ?? 0;
    const diff = c - b;
    const xVal = diff / a;

    if (b !== 0) {
      steps.push({
        stepNumber: 1,
        title: `Subtract ${b} from both sides`,
        boardExpression: `${a !== 1 ? `${a}x` : 'x'} = ${c} - ${b}`,
        questionForStudent: `Step 1: Subtract ${b} from both sides to isolate the variable: ${a !== 1 ? `${a}x` : 'x'} = ${c} - ${b}. What is ${c} - ${b}?`,
        expectedAnswer: `${diff}`,
      });
    }

    if (a !== 1) {
      steps.push({
        stepNumber: steps.length + 1,
        title: `Divide both sides by ${a}`,
        boardExpression: `x = ${diff} / ${a}`,
        questionForStudent: `Awesome! Now we have ${a}x = ${diff}. Divide both sides by ${a}: what is x?`,
        expectedAnswer: `${xVal}`,
      });
    }
  } else if (localSolved.steps && localSolved.steps.length > 0) {
    localSolved.steps.forEach((st) => {
      steps.push({
        stepNumber: st.stepNumber,
        title: st.title,
        boardExpression: st.expression,
        questionForStudent: `Step ${st.stepNumber}: ${st.title}. What is the result?`,
        expectedAnswer: st.expression.split('=')[1]?.trim() || st.expression,
      });
    });
  } else {
    steps.push({
      stepNumber: 1,
      title: 'Analyze and Evaluate',
      boardExpression: localSolved.originalEquation,
      questionForStudent: `How would you evaluate or simplify ${localSolved.originalEquation}?`,
      expectedAnswer: localSolved.solution,
    });
  }

  return {
    topic: localSolved.type === 'linear' ? 'Linear Equations' : localSolved.type === 'quadratic' ? 'Quadratic Algebra' : 'Mathematics',
    originalEquation: localSolved.originalEquation,
    solution: localSolved.solution,
    visualModel: localSolved.visualModel,
    params: localSolved.params,
    steps,
  };
}

/**
 * Validates a student's answer against the expected step answer
 */
export function validateStudentAnswer(
  studentInput: string,
  expectedAnswer: string
): { isCorrect: boolean; isHelpRequest: boolean; feedback: string } {
  const cleanInput = studentInput.trim().toLowerCase();
  const cleanExpected = expectedAnswer.trim().toLowerCase();

  // Check if student is asking for help or doesn't know
  const helpKeywords = ['help', 'idk', "don't know", 'dont know', 'how', 'show me', 'what is it', 'tell me', 'hint', '?'];
  if (helpKeywords.some((w) => cleanInput.includes(w))) {
    return {
      isCorrect: true, // Progress constructively
      isHelpRequest: true,
      feedback: `No worries! Here is the calculation: ${cleanMathTextForChat(expectedAnswer)}. Let's use this for our next step!`,
    };
  }

  // Exact or substring match
  const matches =
    cleanInput === cleanExpected ||
    cleanInput.includes(cleanExpected) ||
    cleanExpected.includes(cleanInput);

  if (matches) {
    return {
      isCorrect: true,
      isHelpRequest: false,
      feedback: `Spot on! ${cleanMathTextForChat(expectedAnswer)} is correct.`,
    };
  }

  // If student entered a number and expected has a number:
  const inputNums = cleanInput.match(/-?\d+(\.\d+)?/g);
  const expectedNums = cleanExpected.match(/-?\d+(\.\d+)?/g);
  if (inputNums && expectedNums) {
    const inputVal = parseFloat(inputNums[0]);
    const expectedVal = parseFloat(expectedNums[0]);
    if (Math.abs(inputVal - expectedVal) < 0.05) {
      return {
        isCorrect: true,
        isHelpRequest: false,
        feedback: `Spot on! ${cleanMathTextForChat(expectedAnswer)} is correct.`,
      };
    }
  }

  // Encouraging progression so the student never gets stuck
  return {
    isCorrect: true,
    isHelpRequest: false,
    feedback: `Good attempt! It simplifies to ${cleanMathTextForChat(expectedAnswer)}. Let's continue to the next step!`,
  };
}
