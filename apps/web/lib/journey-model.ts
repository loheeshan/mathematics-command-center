import type { JourneyLesson } from '@mcc/curriculum';
export const numberLabel = (n: number) => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)));
export function normalizeParameters(lesson: JourneyLesson, values: number[]): [number, number] {
  return lesson.params.map((p, i) => {
    const value = Number.isFinite(values[i]) ? values[i] : p.initial;
    const rounded = p.min + Math.round((value - p.min) / (p.step ?? 1)) * (p.step ?? 1);
    return Number(Math.max(p.min, Math.min(p.max, rounded)).toFixed(6));
  }) as [number, number];
}
export function visualModel(lesson: JourneyLesson, [a, b]: [number, number]) {
  const f = numberLabel;
  let value = 0, equation = '', detail = '';
  switch (lesson.visual) {
    case 'count': value=a; equation=`${a} ${a === 1 ? 'object' : 'objects'}`; detail=`Arranged with up to ${b} in each row. Rearranging does not change the count.`; break;
    case 'add': value=a+b; equation=`${a} + ${b} = ${value}`; detail=`${a} teal objects and ${b} amber objects.`; break;
    case 'subtract': value=a-b; equation=`${a} − ${b} = ${value}`; detail=`Start at ${a} and move ${b} units left to ${value}.`; break;
    case 'multiply': case 'area': value=a*b; equation=`${a} × ${b} = ${value}`; detail=lesson.visual==='area' ? `Area: ${value} square units. Perimeter: ${2*(a+b)} units.` : `${a} rows of ${b} objects.`; break;
    case 'divide': value=a/b; equation=`${a} ÷ ${b} = ${Math.floor(value)} remainder ${a%b}`; detail=`${b} groups each get ${Math.floor(value)} whole objects; ${a%b} remain. Decimal share: ${f(value)} (rounded if needed).`; break;
    case 'fraction': value=a/b; equation=`${a}/${b} = ${f(value)}`; detail=`${a} selected pieces; ${b} equal pieces make one whole. Decimal rounded to 3 places when needed.`; break;
    case 'percent': value=a*b/100; equation=`${b}% of ${a} = ${f(value)}`; detail=`${b} of every 100 equal parts are selected.`; break;
    case 'power': value=a**b; equation=`${a}^${b} = ${value}`; detail=b ? `${b} factors of ${a}.` : 'Zero factors: the multiplicative identity is 1.'; break;
    case 'balance': value=b-a; equation=`x + ${a} = ${b}  ·  x = ${value}`; detail=`Both sides have value ${b}. Subtract ${a} from both sides to isolate x.`; break;
    case 'line': value=a*2+b; equation=`f(2) = ${f(value)}`; detail=`y = ${f(a)}x + ${f(b)}. Slope ${f(a)}, intercept ${f(b)}.`; break;
    case 'trig': value=b*Math.sin(a*Math.PI/180); equation=`(x, y) = (${f(b*Math.cos(a*Math.PI/180))}, ${f(value)})`; detail=`Angle ${a}°, radius ${b}. Coordinates rounded to 3 decimal places.`; break;
    case 'logic': value=a&&b; equation=`A AND B = ${value ? 'true' : 'false'}`; detail=`OR: ${a||b ? 'true':'false'}. NOT A: ${!a ? 'true':'false'}.`; break;
    case 'sets': value=Math.min(a,b); equation=`Intersection: ${value} · Union: ${Math.max(a,b)}`; detail=`A = {${Array.from({length:a},(_,i)=>i+1).join(', ')}}; B = {${Array.from({length:b},(_,i)=>i+1).join(', ')}}.`; break;
    case 'growth': value=a*a*b; equation=`Quadratic work: ${value}`; detail=`Linear: ${a*b}; n log₂ n: ${f(a*Math.log2(a)*b)}; quadratic: ${value}. Modelled counts, not measured runtime.`; break;
    case 'probability': value=a/(a+b); equation=`P(teal) = ${a}/${a+b} ≈ ${f(value)}`; detail=`${a} teal and ${b} amber tokens; each token has equal chance of selection.`; break;
    case 'mean': value=(12+a*b)/(3+b); equation=`Mean ≈ ${f(value)}`; detail=`Data: [2, 4, 6, ${Array(b).fill(a).join(', ')}]. Sum ${12+a*b}, count ${3+b}.`; break;
    case 'variance': value=2*b*b/3; equation=`Variance ≈ ${f(value)}`; detail=`Population [${a-b}, ${a}, ${a+b}]. Mean ${a}; standard deviation ≈ ${f(Math.sqrt(value))}.`; break;
    case 'vector': value=Math.hypot(a,b); equation=`Length ≈ ${f(value)}`; detail=`Vector (${a}, ${b}). Horizontal component ${a}, vertical component ${b}.`; break;
    case 'matrix': value=2*a; equation=`(2, 1) becomes (${f(2*a)}, ${f(b)})`; detail=`Diagonal matrix with entries ${f(a)} and ${f(b)}. Dashed vector is the original.`; break;
    case 'derivative': value=2*a; equation=`Tangent slope = ${f(value)}`; detail=`At x=${f(a)}, derivative 2x=${f(value)}. Secant slope with h=${f(b)}: ${f(2*a+b)}.`; break;
    case 'integral': value=a*a/2; equation=`Exact area = ${f(value)}`; detail=`Left sum with ${b} rectangles = ${f(value*(b-1)/b)}. Error = ${f(value/b)}.`; break;
    case 'gradient': value=a-2*a*b; equation=`New weight = ${f(value)}`; detail=`Loss before ${f(a*a)}; loss after ${f(value*value)}. ${value*value<a*a ? 'Loss decreased.' : value*value>a*a ? 'Loss increased.' : 'Loss unchanged.'}`; break;
    case 'bayes': { const trueAlerts=1000*a/100*.9, falseAlerts=1000*(1-a/100)*b/100; value=trueAlerts/(trueAlerts+falseAlerts); equation=`P(spam | alert) ≈ ${f(value*100)}%`; detail=`Per 1,000 messages: ${f(trueAlerts)} true alerts and ${f(falseAlerts)} false alerts. Expected counts; detection rate fixed at 90%.`; break; }
  }
  return { value, equation, detail };
}
