/**
 * Lightweight mathematical equation parser and step-by-step solver
 * for Scratchpad interactive workspace.
 */

export interface SolutionStep {
  stepNumber: number;
  title: string;
  expression: string;
  explanation: string;
}

export interface SolvedProblem {
  rawInput: string;
  type: 'linear' | 'quadratic' | 'arithmetic' | 'conceptual';
  originalEquation: string;
  solution: string;
  steps: SolutionStep[];
  aiExplanation: string;
  visualModel: 'balance' | 'tiles' | 'parabola' | null;
  params?: {
    a?: number;
    b?: number;
    c?: number;
    p?: number;
    q?: number;
  };
}

export function solveMathProblem(input: string): SolvedProblem {
  const clean = input.trim();

  // 1. Check for Linear Equation: ax + b = c or ax - b = c or ax = c or x + b = c
  // Handles formats like: 2x + 5 = 15, 3x - 7 = 14, 2x = 10, x + 4 = 12, 4x + 8 = 24
  const linearMatch = clean.match(/^([+-]?\s*\d*)\s*([a-zA-Z])\s*([+-]\s*\d+)?\s*=\s*([+-]?\s*\d+)$/);
  if (linearMatch) {
    const rawA = linearMatch[1].replace(/\s+/g, '');
    const variable = linearMatch[2];
    const rawB = linearMatch[3] ? linearMatch[3].replace(/\s+/g, '') : '0';
    const rawC = linearMatch[4].replace(/\s+/g, '');

    const a = rawA === '' || rawA === '+' ? 1 : rawA === '-' ? -1 : parseFloat(rawA);
    const b = parseFloat(rawB);
    const c = parseFloat(rawC);

    if (a !== 0) {
      const step1Result = c - b;
      const finalX = step1Result / a;
      const bAbs = Math.abs(b);
      const bSign = b >= 0 ? '+' : '-';

      const steps: SolutionStep[] = [];

      if (b !== 0) {
        steps.push({
          stepNumber: 1,
          title: `Subtract ${b >= 0 ? b : `(${b})`} from both sides`,
          expression: `${a !== 1 ? `${a}${variable}` : variable} = ${step1Result}`,
          explanation: `To isolate the ${variable}-term, apply the inverse operation: ${b >= 0 ? `subtract ${b}` : `add ${bAbs}`} symmetrically from both sides.`,
        });
      }

      if (a !== 1) {
        steps.push({
          stepNumber: steps.length + 1,
          title: `Divide both sides by ${a}`,
          expression: `${variable} = ${finalX}`,
          explanation: `Divide both sides by the coefficient ${a} to isolate ${variable}.`,
        });
      }

      const formattedOriginal = `${a !== 1 ? `${a}` : ''}${variable} ${b !== 0 ? `${bSign} ${bAbs} ` : ''}= ${c}`;

      const aiExplanation = `Let's solve ${formattedOriginal} step-by-step:

• Step 1: ${b !== 0 ? `Subtract ${b} from both sides to isolate the variable term:
  ${a !== 1 ? `${a}` : ''}${variable} = ${c} - ${b}  →  ${a !== 1 ? `${a}` : ''}${variable} = ${step1Result}` : `The variable term is already isolated.`}

• Step 2: ${a !== 1 ? `Divide both sides by ${a}:
  ${variable} = ${step1Result} / ${a}  →  ${variable} = ${finalX}` : `${variable} is already isolated.`}

Result: ${variable} = ${finalX} ✅
You can also inspect this physically on the Balance Scale model above!`;

      return {
        rawInput: clean,
        type: 'linear',
        originalEquation: formattedOriginal,
        solution: `${variable} = ${finalX}`,
        steps,
        aiExplanation,
        visualModel: 'balance',
        params: { a, b, c },
      };
    }
  }

  // 2. Check for Quadratic Equation: ax^2 + bx + c = 0 or factoring trinomials x^2 + 5x + 6
  const quadraticMatch = clean.match(/^([+-]?\s*\d*)\s*([a-zA-Z])\^?2\s*([+-]\s*\d*)\s*([a-zA-Z])?\s*([+-]\s*\d+)?\s*(=\s*0)?$/i);
  if (quadraticMatch) {
    const rawA = quadraticMatch[1].replace(/\s+/g, '');
    const variable = quadraticMatch[2];
    const rawB = quadraticMatch[3] ? quadraticMatch[3].replace(/\s+/g, '') : '0';
    const rawC = quadraticMatch[5] ? quadraticMatch[5].replace(/\s+/g, '') : '0';

    const a = rawA === '' || rawA === '+' ? 1 : rawA === '-' ? -1 : parseFloat(rawA) || 1;
    const b = rawB === '' || rawB === '+' ? 1 : rawB === '-' ? -1 : parseFloat(rawB) || 0;
    const c = parseFloat(rawC) || 0;

    const discriminant = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = c - (b * b) / (4 * a);

    let rootsStr = 'No real roots';
    let r1: number | null = null;
    let r2: number | null = null;
    if (discriminant >= 0) {
      r1 = (-b - Math.sqrt(discriminant)) / (2 * a);
      r2 = (-b + Math.sqrt(discriminant)) / (2 * a);
      rootsStr = r1 === r2 ? `${variable} = ${r1.toFixed(2)}` : `${variable} = ${r1.toFixed(2)}, ${variable} = ${r2.toFixed(2)}`;
    }

    // Try finding integer factors p, q such that p + q = b and p * q = c (when a === 1)
    let p = 2;
    let q = 3;
    if (a === 1 && c !== 0) {
      for (let i = -10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
          if (i + j === b && i * j === c) {
            p = i;
            q = j;
            break;
          }
        }
      }
    }

    const steps: SolutionStep[] = [
      {
        stepNumber: 1,
        title: 'Compute Discriminant (Δ)',
        expression: `Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${discriminant}`,
        explanation: discriminant > 0 ? 'Δ > 0, so the quadratic has two distinct real roots.' : discriminant === 0 ? 'Δ = 0, so the quadratic has one repeated real root.' : 'Δ < 0, so the quadratic has complex roots.',
      },
      {
        stepNumber: 2,
        title: 'Calculate Vertex & Roots',
        expression: `Vertex: (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)}) | Roots: ${rootsStr}`,
        explanation: `The vertex of the parabola is at x = -b/(2a). The quadratic formula yields ${rootsStr}.`,
      },
    ];

    const aiExplanation = `Quadratic Analysis for ${a !== 1 ? a : ''}${variable}² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}${variable} ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0:

• Discriminant: Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${discriminant}
• Vertex: (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})
• Real Roots: ${rootsStr}
${a === 1 && p + q === b && p * q === c ? `• Factored Form: (${variable} ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`})(${variable} ${q >= 0 ? `+ ${q}` : `- ${Math.abs(q)}`}) = 0` : ''}

You can explore this visually on the Quadratic Curve or Algebra Tiles tab!`;

    return {
      rawInput: clean,
      type: 'quadratic',
      originalEquation: `${a !== 1 ? a : ''}${variable}² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}${variable} ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0`,
      solution: rootsStr,
      steps,
      aiExplanation,
      visualModel: 'parabola',
      params: { a, b, c, p, q },
    };
  }

  // 3. Fallback for arithmetic or natural language math question
  try {
    // Check if simple math expression like 25 * 4 or 100 / 5
    if (/^[\d\s+\-*/().^]+$/.test(clean)) {
      // Safe arithmetic evaluation
      const sanitized = clean.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      return {
        rawInput: clean,
        type: 'arithmetic',
        originalEquation: clean,
        solution: `${result}`,
        steps: [
          {
            stepNumber: 1,
            title: 'Arithmetic Evaluation',
            expression: `${clean} = ${result}`,
            explanation: `Computed evaluated result using standard order of operations.`,
          },
        ],
        aiExplanation: `Evaluating: ${clean} = ${result} ✅`,
        visualModel: null,
      };
    }
  } catch {}

  // 4. Conceptual response
  return {
    rawInput: clean,
    type: 'conceptual',
    originalEquation: clean,
    solution: 'Analysis ready',
    steps: [],
    aiExplanation: `I've analyzed your question: "${clean}". 

To explore this on the whiteboard, you can write out equations directly with the pen tool, or try entering standard equations like:
• Linear: 2x + 5 = 15
• Quadratic: x^2 - 5x + 6 = 0
• Binomial: (x + 2)(x + 3)

The interactive Balance Scale, Algebra Tiles, and Quadratic Curve models above will automatically sync to demonstrate the concepts!`,
    visualModel: null,
  };
}
