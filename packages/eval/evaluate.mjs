import shapeshifter from './shapeshifter.mjs';
import * as strudel from '@strudel/core/strudel.mjs';
import '@strudel/tone/tone.mjs';
import '@strudel/midi/midi.mjs';
import '@strudel/tonal/voicings.mjs';
import '@strudel/tonal/tonal.mjs';
import '@strudel/xen/xen.mjs';
import '@strudel/xen/tune.mjs';
import '@strudel/core/euclid.mjs';
import euclid from '@strudel/core/euclid.mjs';
import '@strudel/tone/pianoroll.mjs';
import '@strudel/tone/draw.mjs';
import * as uiHelpers from '@strudel/tone/ui.mjs';
import * as drawHelpers from '@strudel/tone/draw.mjs';
import gist from '@strudel/core/gist.js';
import { mini } from '@strudel/mini/mini.mjs';
import { Tone } from '@strudel/tone';
import * as toneHelpers from '@strudel/tone/tone.mjs';
import * as voicingHelpers from '@strudel/tonal/voicings.mjs';

// this will add all methods from definedMethod to strudel + connect all the partial application stuff
const bootstrapped = { ...strudel, ...strudel.Pattern.prototype.bootstrap() };
// console.log('bootstrapped',bootstrapped.transpose(2).transpose);

function hackLiteral(literal, names, func) {
  names.forEach((name) => {
    Object.defineProperty(literal.prototype, name, {
      get: function () {
        return func(String(this));
      },
    });
  });
}

// with this, you can do 'c2 [eb2 g2]'.mini.fast(2) or 'c2 [eb2 g2]'.m.fast(2),
hackLiteral(String, ['mini', 'm'], bootstrapped.mini); // comment out this line if you panic
hackLiteral(String, ['pure', 'p'], bootstrapped.pure); // comment out this line if you panic

// this will add everything to global scope, which is accessed by eval
Object.assign(globalThis, Tone, bootstrapped, toneHelpers, voicingHelpers, drawHelpers, uiHelpers, {
  gist,
  euclid,
  mini,
  Tone,
});

export const evaluate = async (code) => {
  const shapeshifted = shapeshifter(code); // transform syntactically correct js code to semantically usable code
  drawHelpers.cleanup();
  uiHelpers.cleanup();
  let evaluated = await eval(shapeshifted);
  if (!isPattern(evaluated)) {
    console.log('evaluated', evaluated);
    const message = `got "${typeof evaluated}" instead of pattern`;
    throw new Error(message + (typeof evaluated === 'function' ? ', did you forget to call a function?' : '.'));
  }
  return { mode: 'javascript', pattern: evaluated };
};
