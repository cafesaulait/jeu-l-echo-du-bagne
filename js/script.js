// ============================================================
// LANGUE
// ============================================================
let lang = localStorage.getItem("lang") || "fr";

let currentScene = "";
let currentDialog = [];
let dialogIndex = 0;

function goToScene(sceneName) {
  runScene(sceneName);
}

const T = {
  fr: {
    title: "L'Écho du Bagne",
    subtitle: "Une enquête sur le campus de Nouville",
    warning: "⚠️ Ne fermez pas la page pendant votre exploration",
    start: "Commencer",
    resume: "Reprendre",
    noSave: "Aucune sauvegarde trouvée.",
    saveOk: "Partie sauvegardée !",
    tapHint: "▼",
    wrongPwd: "Ce n'est pas le bon mot de passe. Réessayez.",
    wrongCode: "Ce n'est pas le bon code. Vous passez votre chemin.",
    map: "CARTE",
    close: "FERMER",
    gmTitle: "Menu",
    gmResume: "Reprendre la partie",
    gmSave: "Sauvegarder",
    gmLoad: "Charger la sauvegarde",
    gmQuit: "Quitter le jeu",
    quit: "Quitter",
    confirmQuit: "Voulez-vous vraiment quitter ?",
    questionnaireText: "Avez-vous 3 minutes pour répondre à notre questionnaire ?",
    questionnaireOui: "Oui, avec plaisir !",
    questionnaireNon: "Non, merci.",
    merciFin:
      "Merci d'avoir joué ! Venez nous retrouver à notre stand sur l'agora.",
  },
  en: {
    title: "Echoes of the Penal Colony",
    subtitle: "An investigation on the Nouville campus",
    warning: "⚠️ Do not close the page during your exploration",
    start: "Start",
    resume: "Resume",
    noSave: "No save found.",
    saveOk: "Game saved!",
    tapHint: "▼",
    wrongPwd: "Wrong password. Try again.",
    wrongCode: "Wrong code. You move on.",
    map: "MAP",
    close: "CLOSE",
    gmTitle: "Menu",
    gmResume: "Resume game",
    gmSave: "Save game",
    gmLoad: "Load save",
    gmQuit: "Quit game",
    quit: "Quit",
    confirmQuit: "Do you really want to quit?",
    questionnaireText: "Do you have 3 minutes to fill out our questionnaire?",
    questionnaireOui: "Yes, with pleasure!",
    questionnaireNon: "No, thank you.",
    merciFin: "Thank you for playing! Come find us at our booth.",
  },
};

function setLang(l) {
  lang = l;
  localStorage.setItem("lang", lang);
  updateMenuLang();
}

// Changer la langue depuis le menu en jeu (re-render la scène)
function setLangInGame(l) {
  lang = l;
  localStorage.setItem("lang", lang);
  closeGameMenu();
  // Mettre à jour les labels UI sans relancer la scène
  updateGameUI();
}

function updateMenuLang() {
  const t = T[lang];
  document.getElementById("menuTitle").innerText = t.title;
  document.getElementById("menuSubtitle").innerText = t.subtitle;
  document.getElementById("menuWarning").innerText = t.warning;
  document.getElementById("btnCommencer").innerText = t.start;
  document.getElementById("btnReprendre").innerText = t.resume;
  document.getElementById("gmQuit").innerText = t.quit;
}

function updateGameUI() {
  const t = T[lang];
  document.getElementById("mapButton").innerText = t.map;
  document.getElementById("closeMapBtn").innerText = t.close;
  document.getElementById("gmTitle").innerText = t.gmTitle;
  document.getElementById("gmResume").innerText = t.gmResume;
  document.getElementById("gmSave").innerText = t.gmSave;
  document.getElementById("gmLoad").innerText = t.gmLoad;
  document.getElementById("gmQuit").innerText = t.gmQuit;
  document.getElementById("tapHint").innerText = t.tapHint;
}

// ============================================================
// PLEIN ÉCRAN
// ============================================================
function requestFullscreen() {
  const el = document.documentElement;
  try {
    if      (el.requestFullscreen)       el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
    else if (el.msRequestFullscreen)     el.msRequestFullscreen();
  } catch(e) { /* silencieux sur iOS */ }
}
// Bloquer le scroll tactile (simule plein écran sur iOS)
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

// File de dialogues à afficher un par un
let dialogQueue = [];
let waitingClick = false; // true = un clic sur textBox avance
let nextSceneId = null; // scène à charger après le clic
let choiceMenu = null; // si on attend un choix

// ============================================================
// SAVE / LOAD
// ============================================================
let objet_trouve = localStorage.getItem("objet_trouve") === "true";
let repas_trouve = localStorage.getItem("repas_trouve") === "true";
 
function saveGame() {
  localStorage.setItem("save", currentScene);
  localStorage.setItem("objet_trouve", objet_trouve);
  localStorage.setItem("repas_trouve", repas_trouve);
}
 
function showSaveNotif() {
  const n = document.getElementById("saveNotif");
  n.innerText = T[lang].saveOk;
  n.style.opacity = "1";
  clearTimeout(n._t);
  n._t = setTimeout(() => { n.style.opacity = "0"; }, 1800);
}
 
function startGame() {
  requestFullscreen();
  currentScene = "start";
  objet_trouve = false;
  repas_trouve = false;
  saveGame();
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  updateGameUI();
  document.documentElement.requestFullscreen();
  goToScene("start");
}
 
function loadGame() {
  requestFullscreen();
  const saved = localStorage.getItem("save");
  if (!saved) {
    alert(T[lang].noSave);
    return;
  }
  currentScene = saved;
  objet_trouve = localStorage.getItem("objet_trouve") === "true";
  repas_trouve = localStorage.getItem("repas_trouve") === "true";
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  updateGameUI();
  render();
}

// ============================================================
// MENU EN JEU
// ============================================================
function openGameMenu() {
  updateGameUI();
  document.getElementById("gameMenuPopup").style.display = "flex";
}
function closeGameMenu() {
  document.getElementById("gameMenuPopup").style.display = "none";
}
function loadGameFromMenu() {
  closeGameMenu();
  const saved = localStorage.getItem("save");
  if (!saved) { alert(T[lang].noSave); return; }
  currentScene = saved;
  objet_trouve = localStorage.getItem("objet_trouve") === "true";
  repas_trouve = localStorage.getItem("repas_trouve") === "true";
  render();
}
function quitterJeu() {
  if (confirm(T[lang].confirmQuit)) {
    try { window.close(); } catch(e) {}
    // Fallback : retour au menu
    document.getElementById("game").style.display = "none";
    document.getElementById("menu").style.display = "flex";
    updateMenuLang();
  }
}
function quitterJeuDepuisJeu() {
  closeGameMenu();
  quitterJeu();
}

// ============================================================
// MOTEUR DE SCÈNE
// ============================================================

// Chaque scène est une fonction qui appelle des helpers :
//   say(speaker, text, bg, char)
//   ask(question, answer, successScene, [failMsg])
//   choice(question, [ {label, action?, next} ])
//   goto(sceneId)
//   end()

// ---------- Helpers de base ----------

function setBg(src) {
  const el = document.getElementById("background");
  el.src = src ? "img/" + src : "";
}

function setChar(src) {
  const el = document.getElementById("character");
  if (src) {
    el.src = "img/" + src;
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
}

function setSpeaker(name) {
  document.getElementById("speakerName").innerText = name || "";
}

function hideChoices() {
  document.getElementById("choices").innerHTML = "";
}

function hideInput() {
  document.getElementById("inputZone").style.display = "none";
}

// ---------- say() : file de messages ----------
// msgs = [ {speaker, text, bg, char}, ... ]
// onDone = fonction appelée quand tout est lu
function sayMany(msgs, onDone) {
  dialogQueue = msgs;
  dialogIndex = 0;
  showNextDialog(onDone);
}

function showNextDialog(onDone) {
  if (dialogIndex >= dialogQueue.length) {
    document.getElementById("tapHint").style.display = "none";
    waitingClick = false;
    nextSceneId = null;
    hideChoices();
    hideInput();
    if (onDone) onDone();
    return;
  }

  const msg = dialogQueue[dialogIndex];

  const content = typeof msg.text === "object" ? msg.text[lang] : msg.text;

  if (msg.bg !== undefined) setBg(msg.bg);
  if (msg.char !== undefined) setChar(msg.char);
  if (msg.speaker !== undefined) setSpeaker(msg.speaker);

  document.getElementById("text").innerText = content;
  document.getElementById("tapHint").style.display = "block";

  hideChoices();
  hideInput();

  waitingClick = true;
  window._dialogOnDone = onDone;
}

function advanceDialog() {
  if (choiceMenu) return;
  if (!waitingClick) return;
  waitingClick = false;
  document.getElementById("tapHint").style.display = "none";
  dialogIndex++;
  showNextDialog(window._dialogOnDone);
}

// ---------- ask() : saisie mot de passe ----------
function ask(question, answer, successScene, failMsg) {
  waitingClick = false;
  document.getElementById("tapHint").style.display = "none";
  hideChoices();
  setSpeaker("");
  document.getElementById("text").innerText = "";

  const iz = document.getElementById("inputZone");
  iz.style.display = "block";
  document.getElementById("question").innerText = question;
  document.getElementById("userInput").value = "";

  // Stocker pour submitInput
  window._askAnswer = answer;
  window._askSuccess = successScene;
  window._askFail = failMsg || T[lang].wrongPwd;

  setTimeout(() => document.getElementById("userInput").focus(), 80);
}

// ---------- choice() : menu de choix ----------
// items = [ {label, action?, next} ]
function choice(items) {
  waitingClick = false;
  document.getElementById("tapHint").style.display = "none";
  hideInput();

  const div = document.getElementById("choices");
  div.innerHTML = "";
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.innerText = item.label;
    btn.onclick = (e) => {
      e.stopPropagation();
      hideChoices();
      if (item.action) item.action();
      runScene(item.next);
    };
    div.appendChild(btn);
  });
}

// ---------- goto() ----------
function goto(sceneId) {
  currentScene = sceneId;
  saveGame();
  runScene(sceneId);
}

// ============================================================
// SCÈNES DU JEU
// ============================================================
function runScene(id) {
  currentScene = id;
  saveGame();
  // Réinitialiser
  waitingClick = false;
  hideChoices();
  hideInput();
  document.getElementById("tapHint").style.display = "none";

  const scene = scenes[id];
  if (!scene) {
    console.error("Scène introuvable:", id);
    return;
  }
  scene();
}

const scenes = {
  // =====================
  // ACCUEIL
  // =====================
  start() {
    setBg("iut_modif.jpg");
    setChar(null);
    sayMany(
      [
        {
          text: {
            fr: "Bienvenue sur le campus de Nouville. Quelque chose d'étrange flotte dans l'air… comme si ces vieux murs avaient des choses à vous raconter.",
            en: "Welcome to the Nouville campus. Something strange is in the air… as if these old walls had stories to tell.",
          },
        },
      ],
      () => goto("mot_de_passe_debut"),
    );
  },

  // =====================
  // MOT DE PASSE IUT
  // =====================
  mot_de_passe_debut() {
    setBg("iut_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche à l'IUT et entrez le mot de passe :",
      "appartements",
      "scene_auguste",
    );
  },

  // =====================
  // AUGUSTE
  // =====================
  scene_auguste() {
    setBg("iut_modif.jpg");
    setChar("Auguste.png");
    sayMany(
      [
        {
          text: "Une silhouette translucide se matérialise devant vous. L'air autour de vous se rafraîchit d'un coup, comme si quelqu'un venait d'ouvrir une fenêtre sur le passé.",
        },
        {
          speaker: "Auguste",
          text: "Vous… vous pouvez me voir ? Et m'entendre ?",
        },
        {
          text: "Il vous regarde avec des yeux écarquillés, incrédule, comme si votre simple présence était un miracle.",
        },
        {
          speaker: "Auguste",
          text: "Cela fait si longtemps… Des décennies, peut-être. Je parlais dans le vide, ma voix se perdait dans le vent sans que personne ne l'entende jamais.",
        },
        {
          speaker: "Auguste",
          text: "Je m'appelle Auguste. J'étais surveillant ici, à l'époque du bagne. Ces bâtiments que vous voyez autour de vous… c'étaient nos appartements. Nos foyers.",
        },
      ],
      () => {
        choice([
          {
            label: "Vous viviez ici, sur le campus ?",
            next: "auguste_choix_1",
          },
          {
            label: "Depuis combien de temps errez-vous ici ?",
            next: "auguste_choix_2",
          },
        ]);
      },
    );
  },

  auguste_choix_1() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: "Oui. Le site de Nouville accueillait les surveillants et leurs familles. Des maisons modestes, mais c'était chez nous. On y avait nos habitudes, nos routines… notre vie.",
        },
      ],
      () => goto("auguste_suite"),
    );
  },

  auguste_choix_2() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: "Je ne sais plus vraiment. Le temps n'a plus la même consistance quand on est dans cet état. Je sais seulement que je cherche depuis trop longtemps.",
        },
      ],
      () => goto("auguste_suite"),
    );
  },

  auguste_suite() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: "Ma femme… On s'était promis de repartir ensemble en France quand son séjour serait terminé. Mais elle a disparu avant que je puisse tenir cette promesse.",
        },
      ],
      () => {
        choice([
          {
            label: "On va vous aider à la retrouver.",
            next: "auguste_reponse_1",
          },
          {
            label:
              "Vous pensez qu'elle est encore quelque part sur le campus ?",
            next: "auguste_reponse_2",
          },
        ]);
      },
    );
  },

  auguste_reponse_1() {
    sayMany(
      [
        { speaker: "Auguste", text: "Vraiment ? Vous feriez ça pour moi ?" },
        {
          text: "Sa voix se brise légèrement. On sent qu'il ne s'attendait pas à tant de bienveillance.",
        },
        {
          speaker: "Auguste",
          text: "Merci… Ça fait du bien d'entendre une voix humaine. Une vraie voix, qui me répond.",
        },
      ],
      () => goto("auguste_depart"),
    );
  },

  auguste_reponse_2() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: "Je l'ignore. J'espère qu'elle n'est pas coincée ici comme moi… mais une partie de moi espère aussi qu'elle n'est pas trop loin.",
        },
      ],
      () => goto("auguste_depart"),
    );
  },

  auguste_depart() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: "J'ai entendu des murmures. Des bruits étranges qui venaient du côté des bâtiments A, les anciens ateliers. Peut-être un autre fantôme ? Peut-être quelqu'un qui l'aurait vue ?",
        },
        {
          speaker: "Auguste",
          text: "Allez voir là-bas. Et ensuite, rejoignez-moi sous le grand banian. Je vous attendrai.",
        },
        {
          char: null,
          text: "La silhouette s'évanouit doucement. Vous regardez en direction des ateliers.",
        },
      ],
      () => goto("mot_de_passe_ateliers"),
    );
  },

  // =====================
  // MOT DE PASSE ATELIERS
  // =====================
  mot_de_passe_ateliers() {
    setBg("iut_modif.jpg");
    setChar(null);
    sayMany(
      [
        {
          text: "Sur le chemin vers les ateliers, gardez l'œil ouvert… il paraît qu'un objet mystérieux traîne quelque part par ici.",
        },
      ],
      () =>
        ask(
          "Scannez l'affiche aux bâtiments A et entrez le mot de passe :",
          "ateliers",
          "chemin_coquillage",
        ),
    );
  },

  // =====================
  // COQUILLAGE (OBJET OPTIONNEL)
  // =====================
  chemin_coquillage() {
    setSpeaker("");
    document.getElementById("text").innerText =
      "Sur le chemin, avez-vous trouvé un objet particulier ?";
    document.getElementById("tapHint").style.display = "none";
    hideInput();
    choice([
      { label: "Oui, j'ai trouvé quelque chose.", next: "saisie_coquillage" },
      {
        label: "Non, je n'ai rien trouvé.",
        action: () => {
          objet_trouve = false;
        },
        next: "scene_ateliers",
      },
    ]);
  },

  saisie_coquillage() {
    ask(
      "Scannez l'objet et entrez le mot de passe :",
      "coquillage",
      "decouverte_coquillage",
      "Ce n'est pas le bon code. Vous passez votre chemin.",
    );
    window._askFailOverride = () => {
  objet_trouve = false;
  window._askFailOverride = null;
  runScene("scene_ateliers");
};
  },

  decouverte_coquillage() {
    setBg("lieu-coquillage-nacre.jpg");
    setChar("coquillage.png");
    objet_trouve = true;
    saveGame();
    sayMany(
      [
        {
          text: "Un coquillage nacré, finement gravé, brille faiblement entre les pierres. Des motifs délicats y ont été tracés avec soin — une fleur, une vague, quelques lettres à peine lisibles.",
        },
        {
          text: "On imagine la main qui a travaillé ça, la nuit, à la lumière d'une bougie volée. Un artiste malgré tout.",
        },
      ],
      () => goto("scene_ateliers"),
    );
  },

  // =====================
  // ATELIERS - RAOUL
  // =====================
  scene_ateliers() {
    setBg("ateliers_modif.jpg");
    setChar("Raoul-Tellier.png");
    sayMany(
      [
        {
          text: "Une silhouette robuste se détache dans la lumière. Il vous observe avec curiosité, les bras croisés, l'air à la fois méfiant et amusé.",
        },
        {
          speaker: "Raoul Tellier",
          text: "Tiens, tiens… Des visiteurs. Et qui peuvent me voir, en plus. Ça faisait longtemps.",
        },
        {
          speaker: "Raoul Tellier",
          text: "Je m'appelle Raoul Tellier. Ancien bagnard, transporté pour vol et rébellion contre l'autorité. Je ne vais pas vous mentir : j'étais loin d'être un saint.",
        },
      ],
      () => {
        choice([
          { label: "Vous avez essayé de vous évader ?", next: "raoul_choix_1" },
          {
            label: "Qu'est-ce que le bagne vous a appris ?",
            next: "raoul_choix_2",
          },
        ]);
      },
    );
  },

  raoul_choix_1() {
    sayMany(
      [
        {
          speaker: "Raoul Tellier",
          text: "Seize fois. Seize tentatives, seize échecs. Mais je ne regrette rien. Chaque nuit que je passais dehors, même repris, même puni, c'était une nuit de liberté.",
        },
        {
          speaker: "Raoul Tellier",
          text: "La mer m'appelait. J'entendais les vagues depuis les dortoirs. C'était une torture.",
        },
      ],
      () => goto("raoul_suite"),
    );
  },

  raoul_choix_2() {
    sayMany(
      [
        {
          speaker: "Raoul Tellier",
          text: "Que les hommes peuvent s'habituer à tout. C'est leur force et leur faiblesse. On finit par trouver une routine, même dans l'horreur.",
        },
      ],
      () => goto("raoul_suite"),
    );
  },

  raoul_suite() {
    const msgs = [
      {
        speaker: "Raoul Tellier",
        text: "Ici, c'étaient les ateliers : menuiserie, cordonnerie, forge… Le bruit des marteaux résonnait du lever au coucher du soleil. On réparait, on fabriquait, on construisait pour une ville qui nous méprisait.",
      },
    ];

    if (objet_trouve) {
      msgs.push(
        {
          text: "Vous sortez le coquillage gravé et le lui montrez. Ses yeux s'écarquillent légèrement.",
        },
        {
          speaker: "Raoul Tellier",
          text: "… Oh. Un coquillage nacré. Je n'en avais pas vu depuis une éternité.",
        },
        {
          speaker: "Raoul Tellier",
          text: "On gravait ça la nuit, en cachette. C'était notre seule façon de créer quelque chose de beau dans cet endroit. Certains les offraient à des gardiens pour obtenir des faveurs. D'autres les gardaient comme talismans.",
        },
        {
          speaker: "Raoul Tellier",
          text: "Celui-là appartenait à quelqu'un qui avait de l'espoir. On le voit dans les traits. Gardez-le.",
        },
      );
    } else {
      msgs.push({
        speaker: "Raoul Tellier",
        text: "Certains bagnards gravaient des coquillages la nuit pour tromper l'ennui. Une façon de s'évader par la création quand le corps ne pouvait pas fuir.",
      });
    }

    msgs.push(
      {
        text: "Nous cherchons la femme d'un ancien surveillant. Elle erre quelque part sur le campus. Vous l'avez croisée ?",
      },
      {
        speaker: "Raoul Tellier",
        text: "Une femme de surveillant… Non, ça ne me dit rien. Les femmes des gardiens, on ne les voyait pas beaucoup. Ils les tenaient à l'écart de nous, c'est compréhensible.",
      },
      {
        speaker: "Raoul Tellier",
        text: "Mais allez voir Macé du côté des dortoirs. Lui, il a tout vu, tout entendu. Si quelqu'un sait quelque chose, c'est lui.",
      },
      {
        text: "Il esquisse quelque chose qui ressemble à un sourire, puis hoche la tête.",
      },
      {
        speaker: "Raoul Tellier",
        text: "Ce fut un honneur de vous rencontrer. Prenez soin de vous, dans ce monde si compliqué qui est le vôtre.",
      },
      { char: null, text: "" },
    );

    sayMany(msgs, () => goto("mot_de_passe_dortoirs"));
  },

  // =====================
  // MOT DE PASSE DORTOIRS
  // =====================
  mot_de_passe_dortoirs() {
    setBg("ateliers_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche au GEIP et entrez le mot de passe :",
      "dortoirs",
      "scene_dortoirs",
    );
  },

  // =====================
  // DORTOIRS - MACÉ
  // =====================
  scene_dortoirs() {
    setBg("dortoirs_modif.jpg");
    setChar("Mace.png");
    sayMany(
      [
        {
          text: "Avant même que vous ayez le temps de regarder autour de vous, une voix grave vous interpelle.",
        },
        { speaker: "Macé", text: "Vous là-bas ! Vous l'avez vue ?!" },
        { text: "Vue quoi ?" },
        {
          speaker: "Macé",
          text: "Ma guillotine… elle est encore là ? Est-ce qu'ils l'ont déplacée ?",
        },
        { text: "Il réalise votre air décontenancé et s'arrête." },
        {
          speaker: "Macé",
          text: "Pardonnez-moi. Je suis dans tous mes états, comme toujours. Permettez-moi de me présenter : je suis Macé. Le bourreau du bagne.",
        },
      ],
      () => {
        choice([
          { label: "Le… bourreau ?", next: "mace_choix_1" },
          {
            label: "Pourquoi y avait-il une guillotine ici ?",
            next: "mace_choix_2",
          },
        ]);
      },
    );
  },

  mace_choix_1() {
    sayMany(
      [
        {
          speaker: "Macé",
          text: "Oui. C'est le titre qu'on m'a donné. Ce n'est pas un métier qu'on choisit vraiment. C'est un métier qu'on vous confie, et ensuite vous le portez pour le restant de vos jours.",
        },
        {
          speaker: "Macé",
          text: "Chaque nuit, j'entends encore le bruit de la lame. Même ici, même maintenant.",
        },
      ],
      () => goto("mace_suite"),
    );
  },

  mace_choix_2() {
    sayMany(
      [
        {
          speaker: "Macé",
          text: "Pour l'exemple. Ils faisaient rassembler tous les bagnards pour les exécutions. C'était censé dissuader. Ça ne dissuadait personne. Ça brisait juste les hommes un peu plus.",
        },
      ],
      () => goto("mace_suite"),
    );
  },

  mace_suite() {
    sayMany(
      [
        {
          speaker: "Macé",
          text: "Ces dortoirs… des dizaines d'hommes entassés dans des chaleurs étouffantes. L'odeur était insupportable. Les chaînes cliquetaient toute la nuit. Certains pleuraient. D'autres priaient.",
        },
        {
          speaker: "Macé",
          text: "Et moi, j'étais là, avec mon rôle que personne ne voulait.",
        },
        {
          text: "Il y a une tristesse immense dans sa voix. Ce fantôme n'est pas effrayant — il est épuisé.",
        },
        { text: "Nous cherchons la femme d'un surveillant. Vous l'avez vue ?" },
        {
          speaker: "Macé",
          text: "La femme d'un surveillant… Non, pas par ici. Mais allez voir du côté de la boulangerie. Jean Honoré y tient compagnie depuis des années. Il parle à tout le monde, lui. Si elle est passée dans les parages, il le sait sûrement.",
        },
        { char: null, text: "" },
      ],
      () => goto("mot_de_passe_boulangerie"),
    );
  },

  // =====================
  // MOT DE PASSE BOULANGERIE
  // =====================
  mot_de_passe_boulangerie() {
    setBg("dortoirs_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche au musée du bagne et entrez le mot de passe :",
      "boulangerie",
      "scene_boulangerie",
    );
  },

  // =====================
  // BOULANGERIE - JEAN HONORÉ
  // =====================
  scene_boulangerie() {
    setBg("boulangerie_modif.jpg");
    setChar("Jean-Honore.png");
    sayMany(
      [
        {
          text: "Une odeur imaginaire de pain chaud semble flotter dans l'air. Une silhouette ronde et chaleureuse vous accueille avec un sourire.",
        },
        {
          speaker: "Jean Honoré",
          text: "Ah ! Des visiteurs ! Bienvenue, bienvenue. Je suis Jean Honoré. Boulanger de métier, transporté pour une histoire de dette que je n'avais pas les moyens de rembourser.",
        },
        {
          speaker: "Jean Honoré",
          text: "Je faisais le pain pour tout le bagne. Des centaines de miches par jour. C'était épuisant, mais au moins, mon travail nourrissait les hommes. Ça donnait un sens à tout ça.",
        },
      ],
      () => {
        choice([
          { label: "Le pain était important pour eux ?", next: "jean_choix_1" },
          {
            label: "Comment supportiez-vous la vie ici ?",
            next: "jean_choix_2",
          },
        ]);
      },
    );
  },

  jean_choix_1() {
    sayMany(
      [
        {
          speaker: "Jean Honoré",
          text: "Vital. Littéralement. L'odeur du pain chaud le matin, c'était la seule chose agréable dans leur journée. Je mettais tout mon cœur dans chaque fournée, même si la farine était de mauvaise qualité.",
        },
      ],
      () => goto("jean_suite"),
    );
  },

  jean_choix_2() {
    sayMany(
      [
        {
          speaker: "Jean Honoré",
          text: "En faisant ce que je savais faire. Pétrir, façonner, cuire. Quand on travaille avec ses mains, la tête se vide un peu. C'est une forme de paix.",
        },
      ],
      () => goto("jean_suite"),
    );
  },

  jean_suite() {
    sayMany(
      [
        {
          speaker: "Jean Honoré",
          text: "Si vous voulez vraiment comprendre ce qu'était la vie ici, gardez l'œil ouvert près de cette boulangerie. Il y a peut-être un objet qui traîne quelque part… quelque chose qui vous en dira plus sur ce que les bagnards mangeaient.",
        },
        {
          text: "Nous cherchons la femme d'un surveillant. Elle erre sur le campus. Vous la connaissez ?",
        },
        {
          speaker: "Jean Honoré",
          text: "La femme d'un surveillant… Ça me dit quelque chose. Une femme douce, discrète. Elle passait parfois dans le coin, mais ça fait longtemps. Je ne l'ai plus croisée par ici.",
        },
        {
          speaker: "Jean Honoré",
          text: "La villa du commandant, peut-être ? Louis y rôde encore. Il en sait plus que moi sur ce qui se passait là-haut.",
        },
        { char: null, text: "" },
      ],
      () => goto("chemin_repas"),
    );
  },

  // =====================
  // REPAS (OBJET OPTIONNEL)
  // =====================
  chemin_repas() {
    setBg("boulangerie_modif.jpg");
    setChar(null);
    setSpeaker("");
    document.getElementById("text").innerText =
      "Avez-vous trouvé un objet près de la boulangerie ?";
    hideInput();
    choice([
      { label: "Oui, j'ai trouvé quelque chose.", next: "saisie_repas" },
      {
        label: "Non, rien trouvé.",
        action: () => {
          repas_trouve = false;
        },
        next: "mot_de_passe_villa",
      },
    ]);
  },

  saisie_repas() {
    ask(
      "Scannez l'objet et entrez le mot de passe :",
      "repas",
      "decouverte_repas",
      "Ce n'est pas le bon code.",
    );
    window._askFailOverride = () => {
      repas_trouve = false;
      window._askFailOverride = null;
      runScene("mot_de_passe_villa");
    };
  },

  decouverte_repas() {
    setBg("lieu-repas-bagnard.jpg");
    setChar("repas.png");
    repas_trouve = true;
    saveGame();
    sayMany(
      [
        {
          text: "Une gamelle en bois apparaît devant vous : une soupe grumeleuse aux reflets grisâtres et un morceau de pain noir et dur.",
        },
        {
          text: "C'était ça, le repas quotidien des bagnards. Frugal, souvent insipide. Mais après des heures de travail forcé sous le soleil de Nouvelle-Calédonie, c'était tout ce qu'ils avaient pour tenir debout.",
        },
        {
          bg: "boulangerie_modif.jpg",
          char: null,
          text: "Vous repensez au sourire de Jean Honoré. Même dans la misère, il avait mis son cœur dans ce qu'il faisait.",
        },
      ],
      () => goto("mot_de_passe_villa"),
    );
  },

  // =====================
  // MOT DE PASSE VILLA
  // =====================
  mot_de_passe_villa() {
    setBg("boulangerie_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche au CREIPAC et entrez le mot de passe :",
      "villa",
      "scene_villa",
    );
  },

  // =====================
  // VILLA - LOUIS
  // =====================
  scene_villa() {
    setBg("villa-commandant_modif.jpg");
    setChar("Louis.png");
    sayMany(
      [
        {
          text: "Un bagnard, portant les habits d'époque, fait les cent pas devant la villa. Il s'arrête en vous apercevant.",
        },
        { speaker: "Louis", text: "Joseline… Joseline, c'est toi ?" },
        { text: "Il réalise son erreur et baisse les yeux." },
        {
          speaker: "Louis",
          text: "Pardonnez-moi. Je croyais… Non, c'est impossible. Je m'appelle Louis. J'étais au service du commandant, ici à la villa.",
        },
      ],
      () => {
        choice([
          { label: "Qui est Joseline ?", next: "louis_choix_1" },
          {
            label: "Depuis combien de temps cherchez-vous ?",
            next: "louis_choix_2",
          },
        ]);
      },
    );
  },

  louis_choix_1() {
    sayMany(
      [
        {
          speaker: "Louis",
          text: "Ma femme. Elle est quelque part sur ce campus et je ne peux pas la trouver. Je l'entends parfois, sa voix dans le vent, mais quand je m'approche… rien.",
        },
      ],
      () => goto("louis_suite"),
    );
  },

  louis_choix_2() {
    sayMany(
      [
        {
          speaker: "Louis",
          text: "Je ne compte plus. Le temps passe différemment pour nous. Je sais juste que chaque jour sans elle est un jour de trop.",
        },
      ],
      () => goto("louis_suite"),
    );
  },

  louis_suite() {
    sayMany(
      [
        {
          speaker: "Louis",
          text: "Je l'ai vue une dernière fois près de la villa, mais depuis… elle a disparu. Quelqu'un m'a dit qu'elle errait du côté du port.",
        },
        {
          speaker: "Louis",
          text: "S'il vous plaît… Si vous la croisez, dites-lui que je suis là. Que je ne suis allé nulle part. Que je l'attends.",
        },
        { char: null, text: "" },
      ],
      () => goto("mot_de_passe_joseline"),
    );
  },

  // =====================
  // MOT DE PASSE JOSELINE
  // =====================
  mot_de_passe_joseline() {
    setBg("villa-commandant_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche et entrez le mot de passe :",
      "joseline",
      "scene_joseline",
    );
  },

  // =====================
  // JOSELINE (PORT)
  // =====================
  scene_joseline() {
    setBg("joseline-seule_modif.jpg");
    setChar("Joseline.png");
    sayMany(
      [
        {
          text: "Une silhouette féminine se tient à l'écart, les yeux dans le vide, les bras croisés sur sa poitrine comme pour se réchauffer.",
        },
        { speaker: "Joseline", text: "… Oh. Vous pouvez me voir ?" },
        {
          text: "Elle tourne la tête vers vous avec une expression mêlant surprise et mélancolie.",
        },
        {
          speaker: "Joseline",
          text: "Ça faisait longtemps que personne ne m'avait regardée. Je suis Joseline.",
        },
      ],
      () => {
        choice([
          { label: "Votre mari vous cherche.", next: "joseline_choix_1" },
          {
            label: "Louis nous a demandé de vous retrouver.",
            next: "joseline_choix_2",
          },
        ]);
      },
    );
  },

  joseline_choix_1() {
    sayMany(
      [
        { speaker: "Joseline", text: "Louis… Il est encore là ?" },
        {
          text: "Quelque chose s'illumine dans ses yeux, timidement, comme une flamme qu'on croyait éteinte.",
        },
        {
          speaker: "Joseline",
          text: "Je pensais qu'il était reparti. Que je l'avais perdu pour de bon.",
        },
      ],
      () => goto("joseline_suite"),
    );
  },

  joseline_choix_2() {
    sayMany(
      [
        {
          speaker: "Joseline",
          text: "Il vous a envoyés ? Il… il pense encore à moi ?",
        },
        { text: "Sa voix tremble légèrement." },
        {
          speaker: "Joseline",
          text: "Toutes ces années, j'ai cru errer seule.",
        },
      ],
      () => goto("joseline_suite"),
    );
  },

  joseline_suite() {
    sayMany(
      [
        {
          speaker: "Joseline",
          text: "Je me suis éloignée de la villa parce que je ne voulais pas lui peser. Je pensais qu'il serait mieux sans moi, qu'il finirait par passer à autre chose…",
        },
        {
          speaker: "Joseline",
          text: "Mais si vous me dites qu'il attend encore…",
        },
        { text: "Il attend. Il n'est allé nulle part." },
        { speaker: "Joseline", text: "Alors… menez-moi à lui." },
        { text: "Pour la première fois, elle sourit vraiment." },
        { char: null, text: "" },
      ],
      () => goto("mot_de_passe_retrouvailles"),
    );
  },

  // =====================
  // MOT DE PASSE RETROUVAILLES
  // =====================
  mot_de_passe_retrouvailles() {
    setBg("joseline-seule_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche et entrez le mot de passe :",
      "amoureux",
      "scene_retrouvailles",
    );
  },

  // =====================
  // RETROUVAILLES LOUIS & JOSELINE
  // =====================
  scene_retrouvailles() {
    setBg("amoureux_modif.jpg");
    setChar("Lovebirds.png");
    sayMany(
      [
        {
          text: "Au bord de la mer, face à l'horizon, ils se retrouvent. Rien d'autre autour d'eux que le bruit des vagues et l'air salé. Louis et Joseline restent un instant immobiles, comme s'ils n'osaient pas y croire.",
        },
        { speaker: "Louis", text: "Joseline…" },
        { speaker: "Joseline", text: "Louis." },
        {
          text: "Ils s'assoient côte à côte, collés l'un à l'autre, les yeux perdus dans le bleu de la mer. Deux silhouettes translucides qui rattrapent doucement le temps perdu, sans avoir besoin de se dire grand-chose.",
        },
        {
          text: "Vous les regardez un instant. Puis vous faites demi-tour, doucement, pour ne pas les déranger. Il y a encore quelqu'un qui vous attend.",
        },
        { char: null, text: "" },
      ],
      () => goto("mot_de_passe_port"),
    );
  },

  // =====================
  // MOT DE PASSE PORT
  // =====================
  mot_de_passe_port() {
    setBg("amoureux_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche au débarcadère et entrez le mot de passe :",
      "port",
      "scene_port",
    );
  },

  // =====================
  // PORT - RENÉ
  // =====================
  scene_port() {
    setBg("port_modif.jpg");
    setChar("Rene.png");
    sayMany(
      [
        {
          text: "Un vieil homme contemple l'horizon depuis le bord du port. Il n'a pas l'air surpris de vous voir.",
        },
        {
          speaker: "René",
          text: "Je savais que quelqu'un viendrait un jour. J'ai vu tant de gens passer par ici… des navires chargés d'hommes brisés, et puis des navires qui repartaient à moitié vides.",
        },
        {
          speaker: "René",
          text: "Je suis René. Ancien surveillant, comme Auguste. Sauf que moi, je n'ai jamais eu envie de repartir en France. La mer me manquerait trop.",
        },
      ],
      () => {
        choice([
          { label: "Vous connaissez Auguste ?", next: "rene_choix_1" },
          {
            label: "Avez-vous vu la femme du surveillant ?",
            next: "rene_choix_2",
          },
        ]);
      },
    );
  },

  rene_choix_1() {
    sayMany(
      [
        {
          speaker: "René",
          text: "Oui. Un homme bien. Trop attaché à l'espoir, peut-être. Il cherche sa femme depuis toujours.",
        },
      ],
      () => goto("rene_suite"),
    );
  },

  rene_choix_2() {
    sayMany(
      [
        {
          speaker: "René",
          text: "C'est justement pour ça que vous êtes là, n'est-ce pas ?",
        },
      ],
      () => goto("rene_suite"),
    );
  },

  rene_suite() {
    sayMany(
      [
        {
          speaker: "René",
          text: "La femme du surveillant… Je l'ai croisée ici, il y a quelques années de ça. Elle était venue au port, elle regardait les bateaux partir.",
        },
        {
          speaker: "René",
          text: "Elle m'a dit qu'elle attendait Auguste depuis trop longtemps. Qu'elle avait besoin de croire qu'ils se retrouveraient, mais que ce ne serait pas sur cette île.",
        },
        { text: "Il marque une pause, les yeux tournés vers la mer." },
        {
          speaker: "René",
          text: "Elle est partie dans l'au-delà. Volontairement. Elle était convaincue qu'il l'y rejoindrait bientôt, et que là-bas, rien ne les séparerait plus.",
        },
        {
          speaker: "René",
          text: "Ce n'était pas un abandon. C'était une promesse faite à l'envers.",
        },
        {
          text: "Vous pensez à Auguste, qui attend sous le banian. Cette nouvelle va lui faire du bien et du mal à la fois.",
        },
        { char: null, text: "" },
      ],
      () => goto("mot_de_passe_banian"),
    );
  },

  // =====================
  // MOT DE PASSE BANIAN
  // =====================
  mot_de_passe_banian() {
    setBg("port_modif.jpg");
    setChar(null);
    ask(
      "Scannez l'affiche au banian et entrez le mot de passe :",
      "adieu",
      "scene_finale",
    );
  },

  // =====================
  // FINALE - AUGUSTE
  // =====================
  scene_finale() {
    setBg("banian_modif.jpg");
    setChar("Auguste.png");
    sayMany(
      [
        {
          text: "Auguste vous attend sous le grand banian, exactement là où il l'avait promis. Il se redresse en vous voyant arriver.",
        },
        { speaker: "Auguste", text: "Alors… ? Vous l'avez trouvée ?" },
      ],
      () => {
        choice([
          {
            label:
              "Elle est déjà partie dans l'au-delà. En vous attendant là-bas.",
            next: "finale_choix_1",
          },
          {
            label:
              "Elle ne vous a pas oublié. Elle vous attend de l'autre côté.",
            next: "finale_choix_2",
          },
        ]);
      },
    );
  },

  finale_choix_1() {
    sayMany(
      [
        { speaker: "Auguste", text: "…" },
        { text: "Un long silence. Il ferme les yeux." },
        {
          speaker: "Auguste",
          text: "Elle a toujours été plus courageuse que moi.",
        },
      ],
      () => goto("finale_suite"),
    );
  },

  finale_choix_2() {
    sayMany(
      [
        { speaker: "Auguste", text: "De l'autre côté…" },
        {
          text: "Il répète ces mots doucement, comme s'il les goûtait pour la première fois.",
        },
        { speaker: "Auguste", text: "Oui. Oui, ça lui ressemble." },
      ],
      () => goto("finale_suite"),
    );
  },

  finale_suite() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: "Je pensais que cette nouvelle m'écraserait. Mais étrangement… je me sens plus léger.",
        },
        { text: "Il vous regarde avec une profonde gratitude." },
        {
          speaker: "Auguste",
          text: "Vous savez, même si je n'ai pas retrouvé ma femme aujourd'hui, vous avez réuni deux autres âmes perdues. Ce n'est pas rien. C'est même beaucoup.",
        },
        {
          speaker: "Auguste",
          text: "Merci. Pour tout ce que vous avez fait, pour tout ce que vous avez parcouru, et pour tout ce que vous avez écouté. Ces histoires méritaient d'être entendues.",
        },
        {
          text: "Il esquisse un sourire serein, le premier vrai sourire depuis peut-être un siècle.",
        },
        {
          speaker: "Auguste",
          text: "Je m'en vais la rejoindre. Il est temps.",
        },
        { speaker: "Auguste", text: "Adieu." },
        {
          char: null,
          bg: "banian_modif.jpg",
          text: "La silhouette d'Auguste s'efface lentement, comme une brume qui se dissout dans la lumière du matin. Le grand banian bruisse doucement, comme pour lui dire au revoir.",
        },
        {
          text: "Vous restez là un moment, entouré du silence du campus. Ces murs ont gardé leurs secrets longtemps. Aujourd'hui, ils vous en ont livré quelques-uns.",
        },
      ],
      () => goto("scene_fin"),
    );
  },

  // =====================
  // FIN & QUESTIONNAIRE
  // =====================
  scene_fin() {
    setBg("banian_modif.jpg");
    setChar(null);
    setSpeaker("");
    document.getElementById("text").innerText =
      "Merci d'avoir participé à notre parcours !\nNous espérons que cela vous a plu.";
    hideInput();
    // Effacer la save pour un prochain début propre
    localStorage.removeItem("save");
    localStorage.removeItem("objet_trouve");
    localStorage.removeItem("repas_trouve");

    // Afficher le popup questionnaire après un clic
    document.getElementById("tapHint").style.display = "block";
    waitingClick = true;
    window._dialogOnDone = () => afficherQuestionnaire();
  },
};

// ============================================================
// QUESTIONNAIRE
// ============================================================
function afficherQuestionnaire() {
  const popup = document.getElementById("questionnairePopup");
  document.getElementById("questionnaireText").innerText =
    T[lang].questionnaireText;
  document.getElementById("btnQuestionnaireOui").innerText =
    T[lang].questionnaireOui;
  document.getElementById("btnQuestionnaireNon").innerText =
    T[lang].questionnaireNon;
  popup.style.display = "flex";
}

function ouvrirQuestionnaire() {
  document.getElementById("questionnairePopup").style.display = "none";
  window.open("https://sphinx-campus.com/tiny/a/nn2l2sdx", "_blank");
  document.getElementById("text").innerText =
    "Merci beaucoup pour votre retour, ça nous aide vraiment !\nVenez nous retrouver à notre stand sur l'agora de l'université.";
}

function fermerQuestionnaire() {
  document.getElementById("questionnairePopup").style.display = "none";
  document.getElementById("text").innerText =
    "Pas de souci, merci quand même d'avoir joué !\nVenez nous retrouver à notre stand sur l'agora si vous avez des questions ou des retours.";
}

// ============================================================
// CLIC SUR LA TEXTBOX POUR AVANCER
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnCommencer").addEventListener("click", startGame);
  document.getElementById("textBox").addEventListener("click", () => {
    advanceDialog();
  });
});

// ============================================================
// ENTRÉE CLAVIER POUR VALIDER MOT DE PASSE
// ============================================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const iz = document.getElementById("inputZone");
    if (iz && iz.style.display !== "none") submitInput();
  }
});

// ============================================================
// OVERRIDE submitInput pour gérer les échecs avec redirection
// ============================================================
const _originalSubmit = submitInput;
// Redéfinition pour gérer le _askFailOverride
function submitInput() {
  const val = document.getElementById("userInput").value.trim().toLowerCase();

  const q = document.getElementById("question").innerText;
  const ans = window._askAnswer;
  const success = window._askSuccess;
  const failMsg = window._askFail;
  const override = window._askFailOverride;

  document.getElementById("userInput").value = "";
  hideInput();

  // ✅ BONNE RÉPONSE
  if (val === ans) {
    window._askFailOverride = null;
    runScene(success);
    return;
  }

  // ❌ MAUVAISE RÉPONSE + cas spécial (override objet)
  if (override) {
    window._askFailOverride = null;
    override();
    return;
  }

  // ❌ MAUVAISE RÉPONSE CLASSIQUE
  setSpeaker("");
  document.getElementById("text").innerText = failMsg;
  document.getElementById("tapHint").style.display = "block";

  // réaffiche la question après un court délai
  setTimeout(() => {
    ask(q, ans, success, failMsg);
  }, 400);
}

// ============================================================
// CARTE
// ============================================================
function openMap() {
  document.getElementById("mapPopup").style.display = "flex";
}
function closeMap() {
  document.getElementById("mapPopup").style.display = "none";
}

// ============================================================
// INIT
// ============================================================
updateMenuLang();
