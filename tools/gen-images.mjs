// Genera imágenes con Codex (ChatGPT) en paralelo y las copia a content/gen/<nombre>.png
// Uso: node tools/gen-images.mjs [nombre1 nombre2 ...]   (sin nombres: todas las que falten)
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT = 'content/gen';
const REF = path.resolve(OUT, 'test-lavarropas.png');
const TECH = 'the same technician as in the attached reference image (a man in his 40s with short dark hair greying at the temples and short stubble, wearing a plain dark slate-grey work polo with a thin teal trim and dark work trousers)';
const STYLE = 'Photorealistic, shot on a 35mm lens at eye level, soft natural daylight, clean bright interiors with white and light grey surfaces and subtle cool teal accents, muted cool color grading with subtle film grain, honest and unposed, sharp focus on the hands and the work. Landscape 4:3. No text, no watermark, no logos, no brand names on any appliance, tool or clothing.';
const PRODUCT = 'A high-resolution studio product photograph on a seamless pure white background, three-quarter front view at eye level, soft diffused three-point softbox lighting with a gentle contact shadow, ultra-realistic materials, the whole appliance fully in frame with generous white margin, generic modern design. Square 1:1. No text, no watermark, no logos, no brand names, no stickers.';

const JOBS = {
  'svc-secarropas': [true, `A medium shot of ${TECH}, crouching in front of an open front-loading tumble dryer in a bright modern Buenos Aires apartment laundry room, pulling out and inspecting the lint filter with one hand while holding a small flashlight. ${STYLE}`],
  'svc-lavavajillas': [true, `A medium shot of ${TECH}, kneeling in front of an open built-in stainless steel dishwasher in a bright modern kitchen, the lower rack pulled out, removing the round drain filter from the bottom of the tub. ${STYLE}`],
  'svc-heladeras': [true, `A medium shot of ${TECH}, standing at an open stainless steel French-door refrigerator in a bright modern kitchen, checking the temperature control panel inside the fridge with a digital thermometer in his other hand. The shelves hold a few neatly arranged groceries. ${STYLE}`],
  'svc-termotanques': [true, `A medium shot of ${TECH}, kneeling beside a tall white gas water heater tank (an Argentine termotanque) standing in a bright utility room next to a washing machine, adjusting the gas valve and pilot control at the base with a wrench, a small toolbox open on the floor. ${STYLE}`],
  'svc-calefones': [true, `A medium shot of ${TECH}, standing in a bright kitchen with the front cover of a white wall-mounted instantaneous gas water heater (an Argentine calefón) removed, checking the burner and pilot assembly with a screwdriver and a small flashlight. ${STYLE}`],
  'svc-hornos-y-cocinas': [true, `A medium shot of ${TECH}, leaning over a stainless steel freestanding gas range in a bright modern kitchen, with one burner cap removed, cleaning and adjusting the burner with a small brush and screwdriver, the oven door closed below. ${STYLE}`],
  'svc-estufas': [true, `A medium shot of ${TECH}, kneeling in a bright living room in front of a white wall-mounted gas room heater (balanced-flue type, typical in Buenos Aires apartments) with its front panel open, checking the pilot and thermocouple with a small flashlight, a sofa and a plant softly blurred in the background. ${STYLE}`],
  'svc-aire-acondicionado': [true, `A medium shot of ${TECH}, standing on a small aluminium step ladder in a bright living room, the front cover of a white wall-mounted split air conditioner indoor unit lifted open, removing a mesh air filter to clean it. ${STYLE}`],
  'proceso-visita': [true, `A medium-wide shot of ${TECH}, arriving at the open front door of a bright Buenos Aires apartment, holding a black toolbox, greeting a friendly woman in her 60s with grey hair who opens the door smiling, both relaxed and cordial, a hallway with a plant behind her. ${STYLE}`],
  'equipo-camioneta': [true, `A wide shot of three appliance repair technicians standing together in front of a plain white delivery van with no markings, parked on a tree-lined street in Villa Devoto, Buenos Aires, on a sunny morning. All three wear the same dark slate-grey work polo with a thin teal trim; one of them is ${TECH}, the other two are a younger man in his late 20s and a woman in her 30s with her hair tied back. Natural, confident, smiling slightly, arms relaxed, one holds a toolbox. Soft morning light, shallow depth of field, muted cool color grading, subtle film grain. Landscape 4:3. No text, no watermark, no logos, no brand names on the van or clothing.`],
  'taller-capacitacion': [true, `A medium shot of ${TECH}, at a clean workbench in a bright small workshop, showing an electronic control board from a washing machine to a younger technician in his late 20s wearing the same dark slate-grey polo with teal trim, both looking at the board, a multimeter and neatly organized spare parts on the bench. ${STYLE}`],
  'contacto-operadora': [false, `A photorealistic medium shot of a friendly customer service coordinator, a woman in her 30s with dark hair tied back, wearing a dark slate-grey polo with a thin teal trim, sitting at a tidy desk in a bright small office in Buenos Aires, wearing a light headset and smiling while typing a message on her smartphone, a laptop with a calendar open beside her and a plant in the background. Soft window light from the left, muted cool color grading with subtle film grain, honest and unposed. Landscape 4:3. No text visible on any screen, no watermark, no logos, no brand names.`],
  'blog-errores': [false, `A photorealistic close-up of two hands pushing far too many clothes into an overloaded front-loading washing machine, the drum stuffed tight with towels, jeans and shirts, in a bright white laundry room. Soft daylight, muted cool color grading with subtle film grain, editorial style. Landscape 16:10. No text, no watermark, no logos, no brand names.`],
  'blog-index': [false, `A photorealistic top-down flat lay on a light grey stone kitchen counter: a neatly arranged set of appliance repair tools — a digital multimeter, screwdrivers, a small flashlight, a set of nut drivers, a coiled washing machine drain hose, a door gasket and a few spare parts — with generous empty space on the right side. Soft diffused daylight, muted cool color grading with subtle teal accents, subtle film grain, editorial style. Landscape 16:9. No text, no watermark, no logos, no brand names.`],
  'prod-lavarropas': [false, `A white front-loading washing machine with a round chrome-rimmed door and a simple control dial. ${PRODUCT}`],
  'prod-secarropas': [false, `A white front-loading tumble dryer with a round door and a simple control dial. ${PRODUCT}`],
  'prod-lavavajillas': [false, `A freestanding stainless steel dishwasher with a slim top control panel. ${PRODUCT}`],
  'prod-heladeras': [false, `A tall stainless steel two-door refrigerator with a bottom freezer and vertical handles. ${PRODUCT}`],
  'prod-termotanques': [false, `A tall white cylindrical gas water heater tank (an Argentine termotanque) with a small control knob near the base. ${PRODUCT}`],
  'prod-aire-acondicionado': [false, `A white wall-mounted split air conditioner indoor unit, seen from the front with a slight angle. ${PRODUCT}`],
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS).filter(n => !fs.existsSync(path.join(OUT, n + '.png')));
console.log('a generar:', wanted.length, wanted.join(', '));
const CONC = 4;
let i = 0;
const runOne = name => new Promise(resolve => {
  const [useRef, prompt] = JOBS[name];
  const args = ['exec', '--skip-git-repo-check', '-C', path.resolve(OUT)];
  if (useRef) args.push('-i', REF);
  args.push('-');
  // el pedido va por stdin: con shell:true en Windows los argumentos con espacios se parten en palabras
  const p = spawn('codex', args, { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
  p.stdin.end(`Generate ONE image with your built-in image generation tool (do not write code, do not use Python or any library to draw, do not edit an existing file). Then reply with the absolute path of the generated file.\n\nImage: ${prompt}`);
  let out = '';
  p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
  const t = setTimeout(() => p.kill(), 8 * 60 * 1000);
  p.on('close', () => {
    clearTimeout(t);
    const m = [...out.matchAll(/([A-Za-z]:\\[^\s`'"]*generated_images\\[^\s`'"]+\.png)/g)].map(x => x[1]);
    if (m.length && fs.existsSync(m[m.length - 1])) { fs.copyFileSync(m[m.length - 1], path.join(OUT, name + '.png')); console.log('OK', name); }
    else { fs.writeFileSync(path.join(OUT, name + '.log'), out); console.log('FALLÓ', name); }
    resolve();
  });
});
const worker = async () => { while (i < wanted.length) await runOne(wanted[i++]); };
await Promise.all(Array.from({ length: CONC }, worker));
console.log('listo');
