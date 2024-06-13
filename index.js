import {
  Project,
  Sprite,
  Trigger,
  Costume,
  Color
} from "https://unpkg.com/leopard@^1/dist/index.esm.js";
function overridePrototype(class_, property, fn) {
  let proto = class_.prototype;
  let original = proto[property];
  proto[property] = function (...args) {
    return fn.call(this, original ? original.bind(this) : null, ...args)
  }
}
function override(object, property, fn) {
  let original = object[property]
  if (original) {
    original = original.bind(object)
  }
  object[property] = function (...args) {
    return fn.call(object, original ?? null, ...args)
  }
}
let __onStepCallbacks = []
overridePrototype(Project, 'onStep', function (_, fn) {
  __onStepCallbacks.push(fn)
  return fn
});
overridePrototype(Project, 'offStep', function (_, fn) {
  __onStepCallbacks.splice(__onStepCallbacks.indexOf(fn), 1);
  return fn
})
overridePrototype(Project, 'onStepOnce', function (_, fn) {
  let cb = this.onStep(function (...args) {
    this.offStep(cb);
    fn(...args)
  })
});
overridePrototype(Project, 'step', function (step, ...args) {
  __onStepCallbacks.forEach(fn => fn(...args));
  return step(...args)
})
/* overridePrototype(Trigger, 'start', function (original, target) {
  if (this.trigger !== Trigger.BROADCAST || this.options.name.toLowerCase() !== 'rearrange gui') return original(target);
  console.log(Error(`${target.constructor.name} recieved broadcast ${this.options.name}`));
  return original(target);
}) */
let textCostumeCache = Object.create(null);
let textCanvas = document.createElement('canvas');
let textContext = textCanvas.getContext('2d');
overridePrototype(Sprite, 'text', function (_, text, size=50, color="white", font="Minecraft") {
  // set costume to on the spot generated costume object corrisponding to the text options
  if (color instanceof Color) {
    color = color.toRGBString(true)
  }
  let key = `${text}|${size}|${color}|${font}`;
  if (!textCostumeCache[key]) {
    // costumes are made using a name, url, and a center point
    // calcuate center
    textContext.font = `${size}px "${font}"`;
    let textStats = textContext.measureText(text);
    textCanvas.height = size * 2; // JUST IN CASE
    textCanvas.width = textStats.width;
    console.log(textCanvas, color)
    textContext.font = `${size}px "${font}"`;
    console.log(textContext.font)
    textContext.fillStyle = color;
    textContext.fillText(text, -textStats.actualBoundingBoxLeft, size);
    // convert to dataURL
    let dataURL = textCanvas.toDataURL();
    textCostumeCache[key] = new Costume("text-"+key, dataURL, {
      x: textStats.width / 2,
      y: size / 2
    })
  }
  if (!(this.costumes.find(costume => costume.name === "text-"+key))) this.costumes.push(textCostumeCache[key]);
  return "text-"+key;
});
overridePrototype(Sprite, 'drawText', function (_, text, size=50, color="white", font="Minecraft") {
  let oldCost = this.costume;
  this.costume = this.text(text, size, color, font);
  this.stamp();
  this.costume = oldCost;
})
overridePrototype(Project, 'fireTrigger', function (_, e, i) {
  if (e === Trigger.GREEN_FLAG) {
      this.restartTimer(),
      this.stopAllSounds(),
      this.runningTriggers = [];
      for (const t in this.sprites) {
          this.sprites[t].clones = []
      }
      for (const t of this.spritesAndStage)
          t.effects.clear(),
          t.audioEffects.clear()
  }
  const s = this._matchingTriggers(((t,s)=>t.matches(e, i, s)));
  if (i?.name) console.log(i.name, "was received by", s)
  return this._startTriggers(s)
})
overridePrototype(Sprite, 'runWithoutScreenRefresh', function (original, generator) { // original is undefined because this is an original function
  for (let _ of generator) {}
  // leopard uses generators to emulate scratches async code running, so this prevents the yields from reaching leopards event loop and allowing it to continue.
});
overridePrototype(Sprite, '_getSkin', (original, t) => {
  try {
    return original(t);
  } catch (e) {
    console.error(this.constructor.name, 'getSkin', t, e)
  }
});
overridePrototype(Sprite, 'broadcast', function (broadcast, name) {
  console.log(`${this.constructor.name} broadcast ${name}`)
  return broadcast(name)
});
overridePrototype(Sprite, 'letterOf', function (original, text) {
  return original((text ?? '').toString());
});
overridePrototype(Trigger, 'matches', function (triggerMatches, trigger, options, target) {
  if (this.trigger !== Trigger.BROADCAST) return triggerMatches(trigger, options, target);
  if (this.trigger !== trigger) return false;
  for (const option in options) {
    if (option === 'name') {
      if (this.option(option, target).toString().toLowerCase() !== options[option].toString().toLowerCase()) return false
      continue
    }
    if (this.option(option, target) !== options[option]) return false;
  }

  return true;
})
import Stage from "./Stage/Stage.js";
import Blank from "./Blank/Blank.js";
import Generator from "./Generator/Generator.js";
import Processor from "./Processor/Processor.js";
import SteveArm from "./SteveArm/SteveArm.js";
import Steve from "./Steve/Steve.js";
import SteveLegs2 from "./SteveLegs2/SteveLegs2.js";
import StevesHead from "./StevesHead/StevesHead.js";
import Tiles from "./Tiles/Tiles.js";
import Cursor from "./Cursor/Cursor.js";
import GuiInvrow from "./GuiInvrow/GuiInvrow.js";
import GuiInvsel from "./GuiInvsel/GuiInvsel.js";
import Counts from "./Counts/Counts.js";
import ArrowProgress from "./ArrowProgress/ArrowProgress.js";
import SmeltProgress from "./SmeltProgress/SmeltProgress.js";
import Mob from "./Mob/Mob.js";
import Health from "./Health/Health.js";
import Oxygen from "./Oxygen/Oxygen.js";
import Armor from "./Armor/Armor.js";
import Hunger from "./Hunger/Hunger.js";
import Selected from "./Selected/Selected.js";
import Creativeoverlay from "./Creativeoverlay/Creativeoverlay.js";
import Menu1 from "./Menu1/Menu1.js";
import SplashSelect from "./SplashSelect/SplashSelect.js";
import Menu2 from "./Menu2/Menu2.js";
import SaveGame from "./SaveGame/SaveGame.js";
import Commands from "./Commands/Commands.js";
import PseudorandomCycle from "./PseudorandomCycle/PseudorandomCycle.js";
import StageSprite from "./StageSprite/StageSprite.js";
import Snow from "./Snow/Snow.js";
const stage = new Stage({ costumeNumber: 1 });

const sprites = {
  Blank: new Blank({
    x: 36,
    y: 28,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: true,
    layerOrder: 5,
  }),
  Generator: new Generator({
    x: -69,
    y: 6,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: true,
    layerOrder: 2,
  }),
  Processor: new Processor({
    x: 76,
    y: -36,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.LEFT_RIGHT,
    costumeNumber: 1,
    size: 55.00000000000001,
    visible: false,
    layerOrder: 3,
  }),
  SteveArm: new SteveArm({
    x: 85,
    y: -57,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 210,
    visible: false,
    layerOrder: 27,
  }),
  Steve: new Steve({
    x: 85,
    y: -72,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.LEFT_RIGHT,
    costumeNumber: 1,
    size: 220.00000000000003,
    visible: false,
    layerOrder: 16,
  }),
  SteveLegs2: new SteveLegs2({
    x: 85,
    y: -77,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 210,
    visible: false,
    layerOrder: 17,
  }),
  StevesHead: new StevesHead({
    x: 85,
    y: -54,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 2,
    size: 200,
    visible: false,
    layerOrder: 18,
  }),
  Tiles: new Tiles({
    x: 67.98848481499999,
    y: -73.4792878105,
    direction: 22.5,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 2,
    size: 40,
    visible: false,
    layerOrder: 26,
  }),
  Cursor: new Cursor({
    x: -5,
    y: 34,
    direction: 119.6784899251352,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 28,
  }),
  GuiInvrow: new GuiInvrow({
    x: 0,
    y: -158,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 11,
  }),
  GuiInvsel: new GuiInvsel({
    x: -160,
    y: -158,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 12,
  }),
  Counts: new Counts({
    x: -75,
    y: -173,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 2,
    size: 100,
    visible: false,
    layerOrder: 24,
  }),
  ArrowProgress: new ArrowProgress({
    x: 40,
    y: 64,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 130,
    visible: false,
    layerOrder: 13,
  }),
  SmeltProgress: new SmeltProgress({
    x: -40,
    y: 64,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 172,
    visible: false,
    layerOrder: 14,
  }),
  Mob: new Mob({
    x: 7,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.LEFT_RIGHT,
    costumeNumber: 101,
    size: 27.77777777777778,
    visible: false,
    layerOrder: 10,
  }),
  Health: new Health({
    x: -101,
    y: -124,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 21,
    size: 100,
    visible: false,
    layerOrder: 19,
  }),
  Oxygen: new Oxygen({
    x: 100,
    y: -103,
    direction: -90,
    rotationStyle: Sprite.RotationStyle.LEFT_RIGHT,
    costumeNumber: 21,
    size: 200,
    visible: false,
    layerOrder: 15,
  }),
  Armor: new Armor({
    x: -101,
    y: -104,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 2,
    size: 100,
    visible: false,
    layerOrder: 25,
  }),
  Hunger: new Hunger({
    x: 101,
    y: -123,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 17,
    size: 200,
    visible: false,
    layerOrder: 20,
  }),
  Selected: new Selected({
    x: 0,
    y: -21,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 21,
  }),
  Creativeoverlay: new Creativeoverlay({
    x: 0,
    y: -22,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 22,
  }),
  Menu1: new Menu1({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 2,
    size: 100,
    visible: false,
    layerOrder: 7,
  }),
  SplashSelect: new SplashSelect({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 8,
  }),
  Menu2: new Menu2({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 9,
  }),
  SaveGame: new SaveGame({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 34,
    size: 100,
    visible: false,
    layerOrder: 6,
  }),
  Commands: new Commands({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 23,
  }),
  PseudorandomCycle: new PseudorandomCycle({
    x: 71,
    y: -19,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 1,
    size: 100,
    visible: false,
    layerOrder: 4,
  }),
  StageSprite: new StageSprite({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.DONT_ROTATE,
    costumeNumber: 3,
    size: 100,
    visible: true,
    layerOrder: 1,
  }),
  Snow: new Snow({
    x: 0,
    y: 0,
    direction: 90,
    rotationStyle: Sprite.RotationStyle.ALL_AROUND,
    costumeNumber: 1,
    size: 400,
    visible: false,
    layerOrder: 29,
  }),
};

const project = new Project(stage, sprites, {
  frameRate: 30, // Set to 60 to make your project run faster
});
/* overridePrototype(project.renderer, 'createStage', function (original, w, h) {
  const stage = document.createElement("canvas");
  stage.width = w;
  stage.height = h;

  // Size canvas to parent container
  stage.style.width = stage.style.height = "100%";

  // If the container width is a non-integer size, don't blur the canvas.
  // Chrome:
  stage.style.imageRendering = "pixelated";
  // Firefox:
  stage.style.imageRendering = "crisp-edges";
  // Safari + Opera:
  stage.style.imageRendering = "-webkit-optimize-contrast";

  return stage;
}) */
window.project = project;
override(project.renderer, '_getSkin', function (original, t) {
  try {
    return original(t);
  } catch (e) {
    // try again which works usually for some reason
    return original(t);
  }
})
export default project;
