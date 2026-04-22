var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

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
    questionnaireText:
      "Avez-vous 3 minutes pour répondre à notre questionnaire ?",
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

  let el = document.getElementById("title");
  if (el) el.innerText = t.title;
  if (T[lang] === T.en) {
    el.classList.add("en");
  } else {
    el.classList.remove("en");
  }

  el = document.getElementById("menuSubtitle");
  if (el) el.innerText = t.subtitle;

  el = document.getElementById("menuWarning");
  if (el) el.innerText = t.warning;

  el = document.getElementById("btnCommencer");
  if (el) el.innerText = t.start;

  el = document.getElementById("btnReprendre");
  if (el) el.innerText = t.resume;

  el = document.getElementById("gmQuit");
  if (el) el.innerText = t.quit;
}

function updateGameUI() {
  const t = T[lang];
  el = document.getElementById("mapButton");
  if (el) el.innerText = t.map;
  el = document.getElementById("closeMapBtn");
  if (el) el.innerText = t.close;
  el = document.getElementById("gmTitle");
  if (el) el.innerText = t.gmTitle;
  el = document.getElementById("gmResume");
  if (el) el.innerText = t.gmResume;
  el = document.getElementById("gmSave");
  if (el) el.innerText = t.gmSave;
  el = document.getElementById("gmLoad");
  if (el) el.innerText = t.gmLoad;
  el = document.getElementById("gmQuit");
  if (el) el.innerText = t.gmQuit;
  el = document.getElementById("tapHint");
  if (el) el.innerText = t.tapHint;
}

// ============================================================
// PLEIN ÉCRAN
// ============================================================
function requestFullscreen() {
  const el = document.documentElement;
  try {
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  } catch (e) {
    /* silencieux sur iOS */
  }
}

toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    requestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
};

if (iOS) {
  document.getElementById("btnFullscreen").style.display = "none";
}

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
  n._t = setTimeout(() => {
    n.style.opacity = "0";
  }, 1800);
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
  /*document.documentElement.requestFullscreen();*/
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
  if (!saved) {
    alert(T[lang].noSave);
    return;
  }
  currentScene = saved;
  objet_trouve = localStorage.getItem("objet_trouve") === "true";
  repas_trouve = localStorage.getItem("repas_trouve") === "true";
  render();
}
function quitterJeu() {
  if (confirm(T[lang].confirmQuit)) {
    try {
      window.close();
    } catch (e) {}
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

if (iOS) {
  document.getElementById("mapContent").style.flexDirection = "row";
}

// ---------- say() : file de messages ----------
// msgs = [ {speaker, text, bg, char}, ... ]
// onDone = fonction appelée quand tout est lu
function sayMany(msgs, onDone) {
  msgs.forEach((msg) => {
    if (!msg.speaker) {
      msg.speaker = "";
    }
  });
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
      lang === "fr"
        ? "Scannez l'affiche à l'IUT et entrez le mot de passe :"
        : "Scan the poster at the IUT and enter the password (in French):",
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
          text: {
            fr: "Une silhouette translucide se matérialise devant vous. L'air autour de vous se rafraîchit d'un coup, comme si quelqu'un venait d'ouvrir une fenêtre sur le passé.",
            en: "A translucent figure materialises before you. The air around you grows suddenly cold, as if someone had just opened a window onto the past.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Vous… vous pouvez me voir ? Et m'entendre ?",
            en: "You… you can see me? And hear me?",
          },
        },
        {
          text: {
            fr: "Il vous regarde avec des yeux écarquillés, incrédule, comme si votre simple présence était un miracle.",
            en: "He stares at you wide-eyed, disbelieving, as if your mere presence were a miracle.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Cela fait si longtemps… Des décennies, peut-être. Je parlais dans le vide, ma voix se perdait dans le vent sans que personne ne l'entende jamais.",
            en: "It has been so long… Decades, perhaps. I spoke into the void, my voice carried away by the wind, never heard by anyone.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Je m'appelle Auguste. J'étais surveillant ici, à l'époque du bagne. Ces bâtiments que vous voyez autour de vous… c'étaient nos appartements. Nos foyers.",
            en: "My name is Auguste. I was a guard here, during the time of the penal colony. These buildings around you… they were our apartments. Our homes.",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "Vous viviez ici, sur le campus ?"
                : "Did you live here, on the campus?",
            next: "auguste_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Depuis combien de temps errez-vous ici ?"
                : "How long have you been wandering here?",
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
          text: {
            fr: "Oui. Le site de Nouville accueillait les surveillants et leurs familles. Des maisons modestes, mais c'était chez nous. On y avait nos habitudes, nos routines… notre vie.",
            en: "Yes. The Nouville site housed the guards and their families. Modest homes, but they were ours. We had our habits, our routines… our life.",
          },
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
          text: {
            fr: "Je ne sais plus vraiment. Le temps n'a plus la même consistance quand on est dans cet état. Je sais seulement que je cherche depuis trop longtemps.",
            en: "I no longer really know. Time loses its texture when you are like this. I only know that I have been searching for far too long.",
          },
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
          text: {
            fr: "Ma femme… On s'était promis de repartir ensemble en France quand son séjour serait terminé. Mais elle a disparu avant que je puisse tenir cette promesse.",
            en: "My wife… We had promised each other we would return to France together when her stay was over. But she disappeared before I could keep that promise.",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "On va vous aider à la retrouver."
                : "We will help you find her.",
            next: "auguste_reponse_1",
          },
          {
            label:
              lang === "fr"
                ? "Vous pensez qu'elle est encore quelque part sur le campus ?"
                : "Do you think she is still somewhere on the campus?",
            next: "auguste_reponse_2",
          },
        ]);
      },
    );
  },

  auguste_reponse_1() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: {
            fr: "Vraiment ? Vous feriez ça pour moi ?",
            en: "Truly? You would do that for me?",
          },
        },
        {
          text: {
            fr: "Sa voix se brise légèrement. On sent qu'il ne s'attendait pas à tant de bienveillance.",
            en: "His voice breaks slightly. You can tell he did not expect such kindness.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Merci… Ça fait du bien d'entendre une voix humaine. Une vraie voix, qui me répond.",
            en: "Thank you… It feels good to hear a human voice. A real voice, that answers me.",
          },
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
          text: {
            fr: "Je l'ignore. J'espère qu'elle n'est pas coincée ici comme moi… mais une partie de moi espère aussi qu'elle n'est pas trop loin.",
            en: "I don't know. I hope she is not trapped here as I am… but part of me also hopes she is not too far away.",
          },
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
          text: {
            fr: "J'ai entendu des murmures. Des bruits étranges qui venaient du côté des bâtiments A, les anciens ateliers. Peut-être un autre fantôme ? Peut-être quelqu'un qui l'aurait vue ?",
            en: "I have heard whispers. Strange sounds coming from the direction of Building A, the old workshops. Perhaps another ghost? Perhaps someone who might have seen her?",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Allez voir là-bas. Et ensuite, rejoignez-moi sous le grand banian. Je vous attendrai.",
            en: "Go and see. And then come find me under the great banyan tree. I will be waiting.",
          },
        },
        {
          char: null,
          text: {
            fr: "La silhouette s'évanouit doucement. Vous regardez en direction des ateliers.",
            en: "The figure fades away gently. You look towards the workshops.",
          },
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
          text: {
            fr: "Sur le chemin vers les ateliers, gardez l'œil ouvert… il paraît qu'un objet mystérieux traîne quelque part par ici.",
            en: "On the way to the workshops, keep your eyes open… rumour has it a mysterious object is hidden somewhere around here.",
          },
        },
      ],
      () =>
        ask(
          lang === "fr"
            ? "Scannez l'affiche aux bâtiments A et entrez le mot de passe :"
            : "Scan the poster at Building A and enter the password (in French):",
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
      lang === "fr"
        ? "Sur le chemin, avez-vous trouvé un objet particulier ?"
        : "On the way, did you find a particular object?";
    document.getElementById("tapHint").style.display = "none";
    hideInput();
    choice([
      {
        label:
          lang === "fr"
            ? "Oui, j'ai trouvé quelque chose."
            : "Yes, I found something.",
        next: "saisie_coquillage",
      },
      {
        label:
          lang === "fr"
            ? "Non, je n'ai rien trouvé."
            : "No, I didn't find anything.",
        action: () => {
          objet_trouve = false;
        },
        next: "scene_ateliers",
      },
    ]);
  },

  saisie_coquillage() {
    ask(
      lang === "fr"
        ? "Scannez l'objet et entrez le mot de passe :"
        : "Scan the object and enter the password (in French):",
      "coquillage",
      "decouverte_coquillage",
      lang === "fr"
        ? "Ce n'est pas le bon code. Vous passez votre chemin."
        : "That's not the correct code. You move on.",
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
          text: {
            fr: "Un coquillage nacré, finement gravé, brille faiblement entre les pierres. Des motifs délicats y ont été tracés avec soin — une fleur, une vague, quelques lettres à peine lisibles.",
            en: "A pearlescent shell, finely engraved, gleams faintly between the stones. Delicate patterns have been carefully carved into it — a flower, a wave, a few barely legible letters.",
          },
        },
        {
          text: {
            fr: "On imagine la main qui a travaillé ça, la nuit, à la lumière d'une bougie volée. Un artiste malgré tout.",
            en: "You picture the hand that worked on this, at night, by the light of a stolen candle. An artist in spite of everything.",
          },
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
          text: {
            fr: "Une silhouette robuste se détache dans la lumière. Il vous observe avec curiosité, les bras croisés, l'air à la fois méfiant et amusé.",
            en: "A sturdy figure stands out in the light. He watches you with curiosity, arms crossed, looking both wary and amused.",
          },
        },
        {
          speaker: "Raoul Tellier",
          text: {
            fr: "Tiens, tiens… Des visiteurs. Et qui peuvent me voir, en plus. Ça faisait longtemps.",
            en: "Well, well… Visitors. And ones who can see me, no less. It's been a while.",
          },
        },
        {
          speaker: "Raoul Tellier",
          text: {
            fr: "Je m'appelle Raoul Tellier. Ancien bagnard, transporté pour vol et rébellion contre l'autorité. Je ne vais pas vous mentir : j'étais loin d'être un saint.",
            en: "My name is Raoul Tellier. Former convict, transported for theft and rebellion against authority. I won't lie to you — I was far from a saint.",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "Vous avez essayé de vous évader ?"
                : "Did you try to escape?",
            next: "raoul_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Qu'est-ce que le bagne vous a appris ?"
                : "What did the penal colony teach you?",
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
          text: {
            fr: "Seize fois. Seize tentatives, seize échecs. Mais je ne regrette rien. Chaque nuit que je passais dehors, même repris, même puni, c'était une nuit de liberté.",
            en: "Sixteen times. Sixteen attempts, sixteen failures. But I regret nothing. Every night I spent outside, even when caught, even when punished — it was a night of freedom.",
          },
        },
        {
          speaker: "Raoul Tellier",
          text: {
            fr: "La mer m'appelait. J'entendais les vagues depuis les dortoirs. C'était une torture.",
            en: "The sea called to me. I could hear the waves from the dormitories. It was torture.",
          },
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
          text: {
            fr: "Que les hommes peuvent s'habituer à tout. C'est leur force et leur faiblesse. On finit par trouver une routine, même dans l'horreur.",
            en: "That men can get used to anything. That is both their strength and their weakness. You end up finding a routine, even in horror.",
          },
        },
      ],
      () => goto("raoul_suite"),
    );
  },

  raoul_suite() {
    const msgs = [
      {
        speaker: "Raoul Tellier",
        text: {
          fr: "Ici, c'étaient les ateliers : menuiserie, cordonnerie, forge… Le bruit des marteaux résonnait du lever au coucher du soleil. On réparait, on fabriquait, on construisait pour une ville qui nous méprisait.",
          en: "This was the workshop area: carpentry, cobbling, forging… The sound of hammers rang out from sunrise to sunset. We repaired, we built, we constructed for a city that despised us.",
        },
      },
    ];

    if (objet_trouve) {
      msgs.push(
        {
          text: {
            fr: "Vous sortez le coquillage gravé et le lui montrez. Ses yeux s'écarquillent légèrement.",
            en: "You take out the engraved shell and show it to him. His eyes widen slightly.",
          },
        },
        {
          speaker: "Raoul Tellier",
          text: {
            fr: "… Oh. Un coquillage nacré. Je n'en avais pas vu depuis une éternité.",
            en: "… Oh. A pearlescent shell. I haven't seen one of those in an eternity.",
          },
        },
        {
          speaker: "Raoul Tellier",
          text: {
            fr: "On gravait ça la nuit, en cachette. C'était notre seule façon de créer quelque chose de beau dans cet endroit. Certains les offraient à des gardiens pour obtenir des faveurs. D'autres les gardaient comme talismans.",
            en: "We engraved them at night, in secret. It was our only way of creating something beautiful in this place. Some offered them to guards in exchange for favours. Others kept them as talismans.",
          },
        },
        {
          speaker: "Raoul Tellier",
          text: {
            fr: "Celui-là appartenait à quelqu'un qui avait de l'espoir. On le voit dans les traits. Gardez-le.",
            en: "This one belonged to someone who had hope. You can see it in the lines. Keep it.",
          },
        },
      );
    } else {
      msgs.push({
        speaker: "Raoul Tellier",
        text: {
          fr: "Certains bagnards gravaient des coquillages la nuit pour tromper l'ennui. Une façon de s'évader par la création quand le corps ne pouvait pas fuir.",
          en: "Some convicts engraved shells at night to fight the boredom. A way of escaping through creation when the body could not flee.",
        },
      });
    }

    msgs.push(
      {
        text: {
          fr: "Nous cherchons la femme d'un ancien surveillant. Elle erre quelque part sur le campus. Vous l'avez croisée ?",
          en: "We are looking for the wife of a former guard. She wanders somewhere on the campus. Have you come across her?",
        },
      },
      {
        speaker: "Raoul Tellier",
        text: {
          fr: "Une femme de surveillant… Non, ça ne me dit rien. Les femmes des gardiens, on ne les voyait pas beaucoup. Ils les tenaient à l'écart de nous, c'est compréhensible.",
          en: "A guard's wife… No, that doesn't ring a bell. The guards' wives, we didn't see them much. They kept them away from us — understandably.",
        },
      },
      {
        speaker: "Raoul Tellier",
        text: {
          fr: "Mais allez voir Macé du côté des dortoirs. Lui, il a tout vu, tout entendu. Si quelqu'un sait quelque chose, c'est lui.",
          en: "But go and see Macé near the dormitories. He has seen everything, heard everything. If anyone knows something, it's him.",
        },
      },
      {
        text: {
          fr: "Il esquisse quelque chose qui ressemble à un sourire, puis hoche la tête.",
          en: "He sketches something that resembles a smile, then nods his head.",
        },
      },
      {
        speaker: "Raoul Tellier",
        text: {
          fr: "Ce fut un honneur de vous rencontrer. Prenez soin de vous, dans ce monde si compliqué qui est le vôtre.",
          en: "It was an honour to meet you. Take care of yourselves, in that complicated world of yours.",
        },
      }
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
      lang === "fr"
        ? "Scannez l'affiche au GEIP et entrez le mot de passe :"
        : "Scan the poster at GEIP and enter the password (in French):",
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
          text: {
            fr: "Avant même que vous ayez le temps de regarder autour de vous, une voix grave vous interpelle.",
            en: "Before you even have time to look around, a deep voice calls out to you.",
          },
        },
        {
          speaker: "Macé",
          text: {
            fr: "Vous là-bas ! Vous l'avez vue ?!",
            en: "You there! Have you seen it?!",
          },
        },
        {
          text: {
            fr: "Vue quoi ?",
            en: "Seen what?",
          },
        },
        {
          speaker: "Macé",
          text: {
            fr: "Ma guillotine… elle est encore là ? Est-ce qu'ils l'ont déplacée ?",
            en: "My guillotine… is it still there? Have they moved it?",
          },
        },
        {
          text: {
            fr: "Il réalise votre air décontenancé et s'arrête.",
            en: "He notices your bewildered expression and stops himself.",
          },
        },
        {
          speaker: "Macé",
          text: {
            fr: "Pardonnez-moi. Je suis dans tous mes états, comme toujours. Permettez-moi de me présenter : je suis Macé. Le bourreau du bagne.",
            en: "Forgive me. I am beside myself, as always. Allow me to introduce myself: I am Macé. The executioner of the penal colony.",
          },
        },
      ],
      () => {
        choice([
          {
            label: lang === "fr" ? "Le… bourreau ?" : "The… executioner?",
            next: "mace_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Pourquoi y avait-il une guillotine ici ?"
                : "Why was there a guillotine here?",
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
          text: {
            fr: "Oui. C'est le titre qu'on m'a donné. Ce n'est pas un métier qu'on choisit vraiment. C'est un métier qu'on vous confie, et ensuite vous le portez pour le restant de vos jours.",
            en: "Yes. That is the title they gave me. It is not a trade one truly chooses. It is a trade that is entrusted to you, and then you carry it for the rest of your days.",
          },
        },
        {
          speaker: "Macé",
          text: {
            fr: "Chaque nuit, j'entends encore le bruit de la lame. Même ici, même maintenant.",
            en: "Every night, I still hear the sound of the blade. Even here. Even now.",
          },
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
          text: {
            fr: "Pour l'exemple. Ils faisaient rassembler tous les bagnards pour les exécutions. C'était censé dissuader. Ça ne dissuadait personne. Ça brisait juste les hommes un peu plus.",
            en: "As a warning. They would gather all the convicts for the executions. It was meant to deter them. It deterred no one. It just broke the men a little more.",
          },
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
          text: {
            fr: "Ces dortoirs… des dizaines d'hommes entassés dans des chaleurs étouffantes. L'odeur était insupportable. Les chaînes cliquetaient toute la nuit. Certains pleuraient. D'autres priaient.",
            en: "These dormitories… dozens of men crammed together in suffocating heat. The smell was unbearable. Chains rattled through the night. Some wept. Others prayed.",
          },
        },
        {
          speaker: "Macé",
          text: {
            fr: "Et moi, j'étais là, avec mon rôle que personne ne voulait.",
            en: "And I was there, with my role that no one wanted.",
          },
        },
        {
          text: {
            fr: "Il y a une tristesse immense dans sa voix. Ce fantôme n'est pas effrayant — il est épuisé.",
            en: "There is an immense sadness in his voice. This ghost is not frightening — he is exhausted.",
          },
        },
        {
          text: {
            fr: "Nous cherchons la femme d'un surveillant. Vous l'avez vue ?",
            en: "We are looking for a guard's wife. Have you seen her?",
          },
        },
        {
          speaker: "Macé",
          text: {
            fr: "La femme d'un surveillant… Non, pas par ici. Mais allez voir du côté de la boulangerie. Jean Honoré y tient compagnie depuis des années. Il parle à tout le monde, lui. Si elle est passée dans les parages, il le sait sûrement.",
            en: "A guard's wife… No, not around here. But go and check near the bakery. Jean Honoré has kept company there for years. He talks to everyone, that one. If she passed by, he would surely know.",
          },
        }
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
      lang === "fr"
        ? "Scannez l'affiche au musée du bagne et entrez le mot de passe :"
        : "Scan the poster at the prison museum and enter the password (in French):",
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
          text: {
            fr: "Une odeur imaginaire de pain chaud semble flotter dans l'air. Une silhouette ronde et chaleureuse vous accueille avec un sourire.",
            en: "An imaginary smell of warm bread seems to drift through the air. A round, warm figure welcomes you with a smile.",
          },
        },
        {
          speaker: "Jean Honoré",
          text: {
            fr: "Ah ! Des visiteurs ! Bienvenue, bienvenue. Je suis Jean Honoré. Boulanger de métier, transporté pour une histoire de dette que je n'avais pas les moyens de rembourser.",
            en: "Ah! Visitors! Welcome, welcome. I am Jean Honoré. A baker by trade, transported for a debt I had no means to repay.",
          },
        },
        {
          speaker: "Jean Honoré",
          text: {
            fr: "Je faisais le pain pour tout le bagne. Des centaines de miches par jour. C'était épuisant, mais au moins, mon travail nourrissait les hommes. Ça donnait un sens à tout ça.",
            en: "I baked bread for the entire colony. Hundreds of loaves a day. It was exhausting, but at least my work fed the men. It gave some meaning to all of this.",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "Le pain était important pour eux ?"
                : "Was bread important to them?",
            next: "jean_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Comment supportiez-vous la vie ici ?"
                : "How did you cope with life here?",
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
          text: {
            fr: "Vital. Littéralement. L'odeur du pain chaud le matin, c'était la seule chose agréable dans leur journée. Je mettais tout mon cœur dans chaque fournée, même si la farine était de mauvaise qualité.",
            en: "Vital. Literally. The smell of warm bread in the morning was the only pleasant thing in their day. I put my whole heart into every batch, even when the flour was of poor quality.",
          },
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
          text: {
            fr: "En faisant ce que je savais faire. Pétrir, façonner, cuire. Quand on travaille avec ses mains, la tête se vide un peu. C'est une forme de paix.",
            en: "By doing what I knew how to do. Kneading, shaping, baking. When you work with your hands, the mind quiets down a little. It is a form of peace.",
          },
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
          text: {
            fr: "Si vous voulez vraiment comprendre ce qu'était la vie ici, gardez l'œil ouvert près de cette boulangerie. Il y a peut-être un objet qui traîne quelque part… quelque chose qui vous en dira plus sur ce que les bagnards mangeaient.",
            en: "If you truly want to understand what life was like here, keep your eyes open near the bakery. There may be an object lying somewhere… something that will tell you more about what the convicts ate.",
          },
        },
        {
          text: {
            fr: "Nous cherchons la femme d'un surveillant. Elle erre sur le campus. Vous la connaissez ?",
            en: "We are looking for a guard's wife. She wanders the campus. Do you know her?",
          },
        },
        {
          speaker: "Jean Honoré",
          text: {
            fr: "La femme d'un surveillant… Ça me dit quelque chose. Une femme douce, discrète. Elle passait parfois dans le coin, mais ça fait longtemps. Je ne l'ai plus croisée par ici.",
            en: "A guard's wife… That rings a bell. A gentle, discreet woman. She used to pass by sometimes, but that was long ago. I haven't seen her around here lately.",
          },
        },
        {
          speaker: "Jean Honoré",
          text: {
            fr: "La villa du commandant, peut-être ? Louis y rôde encore. Il en sait plus que moi sur ce qui se passait là-haut.",
            en: "The commander's villa, perhaps? Louis still lingers there. He knows more than I do about what went on up there.",
          },
        }
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
      lang === "fr"
        ? "Avez-vous trouvé un objet près de la boulangerie ?"
        : "Did you find an object near the bakery?";
    hideInput();
    choice([
      {
        label:
          lang === "fr"
            ? "Oui, j'ai trouvé quelque chose."
            : "Yes, I found something.",
        next: "saisie_repas",
      },
      {
        label: lang === "fr" ? "Non, rien trouvé." : "No, nothing found.",
        action: () => {
          repas_trouve = false;
        },
        next: "mot_de_passe_villa",
      },
    ]);
  },

  saisie_repas() {
    ask(
      lang === "fr"
        ? "Scannez l'objet et entrez le mot de passe :"
        : "Scan the object and enter the password (in French):",
      "repas",
      "decouverte_repas",
      lang === "fr"
        ? "Ce n'est pas le bon code."
        : "That's not the correct code.",
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
          text: {
            fr: "Une gamelle en bois apparaît devant vous : une soupe grumeleuse aux reflets grisâtres et un morceau de pain noir et dur.",
            en: "A wooden bowl appears before you: a lumpy soup with greyish hues and a piece of black, hard bread.",
          },
        },
        {
          text: {
            fr: "C'était ça, le repas quotidien des bagnards. Frugal, souvent insipide. Mais après des heures de travail forcé sous le soleil de Nouvelle-Calédonie, c'était tout ce qu'ils avaient pour tenir debout.",
            en: "This was the daily meal of the convicts. Frugal, often tasteless. But after hours of forced labour under the New Caledonian sun, it was all they had to keep going.",
          },
        },
        {
          bg: "boulangerie_modif.jpg",
          char: null,
          text: {
            fr: "Vous repensez au sourire de Jean Honoré. Même dans la misère, il avait mis son cœur dans ce qu'il faisait.",
            en: "You think back to Jean Honoré's smile. Even in misery, he had put his heart into what he did.",
          },
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
      lang === "fr"
        ? "Scannez l'affiche au CREIPAC et entrez le mot de passe :"
        : "Scan the poster at CREIPAC and enter the password (in French):",
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
          text: {
            fr: "Un bagnard, portant les habits d'époque, fait les cent pas devant la villa. Il s'arrête en vous apercevant.",
            en: "A convict, wearing period clothing, paces back and forth in front of the villa. He stops when he notices you.",
          },
        },
        {
          speaker: "Louis",
          text: {
            fr: "Joseline… Joseline, c'est toi ?",
            en: "Joseline… Joseline, is that you?",
          },
        },
        {
          text: {
            fr: "Il réalise son erreur et baisse les yeux.",
            en: "He realises his mistake and lowers his eyes.",
          },
        },
        {
          speaker: "Louis",
          text: {
            fr: "Pardonnez-moi. Je croyais… Non, c'est impossible. Je m'appelle Louis. J'étais au service du commandant, ici à la villa.",
            en: "Forgive me. I thought… No, that's impossible. My name is Louis. I was in service to the commander, here at the villa.",
          },
        },
      ],
      () => {
        choice([
          {
            label: lang === "fr" ? "Qui est Joseline ?" : "Who is Joseline?",
            next: "louis_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Depuis combien de temps cherchez-vous ?"
                : "How long have you been searching?",
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
          text: {
            fr: "Ma femme. Elle est quelque part sur ce campus et je ne peux pas la trouver. Je l'entends parfois, sa voix dans le vent, mais quand je m'approche… rien.",
            en: "My wife. She is somewhere on this campus and I cannot find her. I hear her sometimes, her voice in the wind, but when I draw close… nothing.",
          },
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
          text: {
            fr: "Je ne compte plus. Le temps passe différemment pour nous. Je sais juste que chaque jour sans elle est un jour de trop.",
            en: "I have lost count. Time passes differently for us. I only know that every day without her is one day too many.",
          },
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
          text: {
            fr: "Je l'ai vue une dernière fois près de la villa, mais depuis… elle a disparu. Quelqu'un m'a dit qu'elle errait du côté du port.",
            en: "I saw her one last time near the villa, but since then… she has vanished. Someone told me she was wandering near the port.",
          },
        },
        {
          speaker: "Louis",
          text: {
            fr: "S'il vous plaît… Si vous la croisez, dites-lui que je suis là. Que je ne suis allé nulle part. Que je l'attends.",
            en: "Please… If you come across her, tell her I am here. That I have gone nowhere. That I am waiting for her.",
          },
        }
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
      lang === "fr"
        ? "Scannez l'affiche et entrez le mot de passe :"
        : "Scan the poster and enter the password (in French):",
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
          text: {
            fr: "Une silhouette féminine se tient à l'écart, les yeux dans le vide, les bras croisés sur sa poitrine comme pour se réchauffer.",
            en: "A female figure stands apart, eyes vacant, arms crossed over her chest as if trying to keep warm.",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "… Oh. Vous pouvez me voir ?",
            en: "… Oh. You can see me?",
          },
        },
        {
          text: {
            fr: "Elle tourne la tête vers vous avec une expression mêlant surprise et mélancolie.",
            en: "She turns her head towards you with an expression mixing surprise and melancholy.",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "Ça faisait longtemps que personne ne m'avait regardée. Je suis Joseline.",
            en: "It has been a long time since anyone looked at me. I am Joseline.",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "Votre mari vous cherche."
                : "Your husband is looking for you.",
            next: "joseline_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Louis nous a demandé de vous retrouver."
                : "Louis asked us to find you.",
            next: "joseline_choix_2",
          },
        ]);
      },
    );
  },

  joseline_choix_1() {
    sayMany(
      [
        {
          speaker: "Joseline",
          text: {
            fr: "Louis… Il est encore là ?",
            en: "Louis… He is still there?",
          },
        },
        {
          text: {
            fr: "Quelque chose s'illumine dans ses yeux, timidement, comme une flamme qu'on croyait éteinte.",
            en: "Something lights up in her eyes, timidly, like a flame one thought had gone out.",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "Je pensais qu'il était reparti. Que je l'avais perdu pour de bon.",
            en: "I thought he had left. That I had lost him for good.",
          },
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
          text: {
            fr: "Il vous a envoyés ? Il… il pense encore à moi ?",
            en: "He sent you? He… he still thinks of me?",
          },
        },
        {
          text: {
            fr: "Sa voix tremble légèrement.",
            en: "Her voice trembles slightly.",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "Toutes ces années, j'ai cru errer seule.",
            en: "All these years, I believed I was wandering alone.",
          },
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
          text: {
            fr: "Je me suis éloignée de la villa parce que je ne voulais pas lui peser. Je pensais qu'il serait mieux sans moi, qu'il finirait par passer à autre chose…",
            en: "I moved away from the villa because I did not want to be a burden to him. I thought he would be better off without me, that he would eventually move on…",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "Mais si vous me dites qu'il attend encore…",
            en: "But if you are telling me he is still waiting…",
          },
        },
        {
          text: {
            fr: "Il attend. Il n'est allé nulle part.",
            en: "He is waiting. He has gone nowhere.",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "Alors… menez-moi à lui.",
            en: "Then… take me to him.",
          },
        },
        {
          text: {
            fr: "Pour la première fois, elle sourit vraiment.",
            en: "For the first time, she truly smiles.",
          },
        }
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
      lang === "fr"
        ? "Scannez l'affiche et entrez le mot de passe :"
        : "Scan the poster and enter the password (in French):",
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
          text: {
            fr: "Au bord de la mer, face à l'horizon, ils se retrouvent. Rien d'autre autour d'eux que le bruit des vagues et l'air salé. Louis et Joseline restent un instant immobiles, comme s'ils n'osaient pas y croire.",
            en: "At the edge of the sea, facing the horizon, they find each other again. Nothing around them but the sound of waves and the salty air. Louis and Joseline stand motionless for a moment, as if they dare not believe it.",
          },
        },
        {
          speaker: "Louis",
          text: {
            fr: "Joseline…",
            en: "Joseline…",
          },
        },
        {
          speaker: "Joseline",
          text: {
            fr: "Louis.",
            en: "Louis.",
          },
        },
        {
          text: {
            fr: "Ils s'assoient côte à côte, collés l'un à l'autre, les yeux perdus dans le bleu de la mer. Deux silhouettes translucides qui rattrapent doucement le temps perdu, sans avoir besoin de se dire grand-chose.",
            en: "They sit side by side on the bench, pressed close together, their eyes lost in the blue of the sea. Two translucent figures quietly making up for the lost time, without needing to say much at all. The sea continues to speak for them.",
          },
        },
        {
          text: {
            fr: "Vous les regardez un instant. Puis vous faites demi-tour, doucement, pour ne pas les déranger. Il y a encore quelqu'un qui vous attend.",
            en: "You watch them for a moment. Then you turn around, gently, so as not to disturb them. There is still someone waiting for you.",
          },
        }
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
      lang === "fr"
        ? "Scannez l'affiche au débarcadère et entrez le mot de passe :"
        : "Scan the poster at the pier and enter the password (in French):",
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
          text: {
            fr: "Un vieil homme contemple l'horizon depuis le bord du port. Il n'a pas l'air surpris de vous voir.",
            en: "An old man gazes at the horizon from the edge of the port. He does not seem surprised to see you.",
          },
        },
        {
          speaker: "René",
          text: {
            fr: "Je savais que quelqu'un viendrait un jour. J'ai vu tant de gens passer par ici… des navires chargés d'hommes brisés, et puis des navires qui repartaient à moitié vides.",
            en: "I knew someone would come one day. I have seen so many people pass through here… ships laden with broken men, and then ships leaving half empty.",
          },
        },
        {
          speaker: "René",
          text: {
            fr: "Je suis René. Ancien surveillant, comme Auguste. Sauf que moi, je n'ai jamais eu envie de repartir en France. La mer me manquerait trop.",
            en: "I am René. A former guard, like Auguste. Except that I never wanted to go back to France. I would miss the sea too much.",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "Vous connaissez Auguste ?"
                : "Do you know Auguste?",
            next: "rene_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Avez-vous vu la femme du surveillant ?"
                : "Have you seen the guard's wife?",
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
          text: {
            fr: "Oui. Un homme bien. Trop attaché à l'espoir, peut-être. Il cherche sa femme depuis toujours.",
            en: "Yes. A good man. Too attached to hope, perhaps. He has been searching for his wife forever.",
          },
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
          text: {
            fr: "C'est justement pour ça que vous êtes là, n'est-ce pas ?",
            en: "That is precisely why you are here, isn't it?",
          },
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
          text: {
            fr: "La femme du surveillant… Je l'ai croisée ici, il y a quelques années de ça. Elle était venue au port, elle regardait les bateaux partir.",
            en: "The guard's wife… I came across her here, a few years ago. She had come to the port and was watching the boats leave.",
          },
        },
        {
          speaker: "René",
          text: {
            fr: "Elle m'a dit qu'elle attendait Auguste depuis trop longtemps. Qu'elle avait besoin de croire qu'ils se retrouveraient, mais que ce ne serait pas sur cette île.",
            en: "She told me she had waited for Auguste for too long. That she needed to believe they would find each other again, but not on this island.",
          },
        },
        {
          text: {
            fr: "Il marque une pause, les yeux tournés vers la mer.",
            en: "He pauses, his eyes turned towards the sea.",
          },
        },
        {
          speaker: "René",
          text: {
            fr: "Elle est partie dans l'au-delà. Volontairement. Elle était convaincue qu'il l'y rejoindrait bientôt, et que là-bas, rien ne les séparerait plus.",
            en: "She passed on to the beyond. Willingly. She was convinced he would join her there soon, and that beyond, nothing would separate them anymore.",
          },
        },
        {
          speaker: "René",
          text: {
            fr: "Ce n'était pas un abandon. C'était une promesse faite à l'envers.",
            en: "It was not an abandonment. It was a promise made in reverse.",
          },
        },
        {
          text: {
            fr: "Vous pensez à Auguste, qui attend sous le banian. Cette nouvelle va lui faire du bien et du mal à la fois.",
            en: "You think of Auguste, waiting under the banyan tree. This news will bring him both comfort and pain.",
          },
        }
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
      lang === "fr"
        ? "Scannez l'affiche au banian et entrez le mot de passe :"
        : "Scan the poster at the banyan tree and enter the password (in French):",
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
          text: {
            fr: "Auguste vous attend sous le grand banian, exactement là où il l'avait promis. Il se redresse en vous voyant arriver.",
            en: "Auguste waits for you under the great banyan tree, exactly where he had promised. He straightens up when he sees you arrive.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Alors… ? Vous l'avez trouvée ?",
            en: "So… ? Did you find her?",
          },
        },
      ],
      () => {
        choice([
          {
            label:
              lang === "fr"
                ? "Elle est déjà partie dans l'au-delà. En vous attendant là-bas."
                : "She has already passed on. Waiting for you on the other side.",
            next: "finale_choix_1",
          },
          {
            label:
              lang === "fr"
                ? "Elle ne vous a pas oublié. Elle vous attend de l'autre côté."
                : "She has not forgotten you. She is waiting for you on the other side.",
            next: "finale_choix_2",
          },
        ]);
      },
    );
  },

  finale_choix_1() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: {
            fr: "…",
            en: "…",
          },
        },
        {
          text: {
            fr: "Un long silence. Il ferme les yeux.",
            en: "A long silence. He closes his eyes.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Elle a toujours été plus courageuse que moi.",
            en: "She was always braver than me.",
          },
        },
      ],
      () => goto("finale_suite"),
    );
  },

  finale_choix_2() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: {
            fr: "De l'autre côté…",
            en: "On the other side…",
          },
        },
        {
          text: {
            fr: "Il répète ces mots doucement, comme s'il les goûtait pour la première fois.",
            en: "He repeats these words softly, as if tasting them for the first time.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Oui. Oui, ça lui ressemble.",
            en: "Yes. Yes, that sounds like her.",
          },
        },
      ],
      () => goto("finale_suite"),
    );
  },

  finale_suite() {
    sayMany(
      [
        {
          speaker: "Auguste",
          text: {
            fr: "Je pensais que cette nouvelle m'écraserait. Mais étrangement… je me sens plus léger.",
            en: "I thought this news would crush me. But strangely… I feel lighter.",
          },
        },
        {
          text: {
            fr: "Il vous regarde avec une profonde gratitude.",
            en: "He looks at you with deep gratitude.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Vous savez, même si je n'ai pas retrouvé ma femme aujourd'hui, vous avez réuni deux autres âmes perdues. Ce n'est pas rien. C'est même beaucoup.",
            en: "You know, even though I did not find my wife today, you brought two other lost souls back together. That is no small thing. It is even quite a lot.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Merci. Pour tout ce que vous avez fait, pour tout ce que vous avez parcouru, et pour tout ce que vous avez écouté. Ces histoires méritaient d'être entendues.",
            en: "Thank you. For everything you have done, for every step you have taken, and for everything you have listened to. These stories deserved to be heard.",
          },
        },
        {
          text: {
            fr: "Il esquisse un sourire serein, le premier vrai sourire depuis peut-être un siècle.",
            en: "He sketches a serene smile, the first true smile in perhaps a century.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Je m'en vais la rejoindre. Il est temps.",
            en: "I am going to join her. It is time.",
          },
        },
        {
          speaker: "Auguste",
          text: {
            fr: "Adieu.",
            en: "Farewell.",
          },
        },
        {
          char: null,
          bg: "banian_modif.jpg",
          text: {
            fr: "La silhouette d'Auguste s'efface lentement, comme une brume qui se dissout dans la lumière du matin. Le grand banian bruisse doucement, comme pour lui dire au revoir.",
            en: "Auguste's figure fades slowly, like a mist dissolving in the morning light. The great banyan tree rustles softly, as if to bid him farewell.",
          },
        },
        {
          text: {
            fr: "Vous restez là un moment, entouré du silence du campus. Ces murs ont gardé leurs secrets longtemps. Aujourd'hui, ils vous en ont livré quelques-uns.",
            en: "You stand there for a moment, surrounded by the silence of the campus. These walls have kept their secrets for a long time. Today, they have given you a few of them.",
          },
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
      lang === "fr"
        ? "Merci d'avoir participé à notre parcours !\nNous espérons que cela vous a plu."
        : "Thank you for being part of our course!\nWe hope you enjoyed it.";
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
    lang === "fr"
      ? "Merci beaucoup pour votre retour, ça nous aide vraiment !\nVenez nous retrouver à notre stand sur l'agora de l'université."
      : "Thank you so much for your feedback, it really helps us!\nDo not hesitate to meet us at our booth in the university's agora.";
}

function fermerQuestionnaire() {
  document.getElementById("questionnairePopup").style.display = "none";
  document.getElementById("text").innerText =
    lang === "fr"
      ? "Pas de souci, merci quand même d'avoir joué !\nVenez nous retrouver à notre stand sur l'agora si vous avez des questions ou des retours."
      : "No problem, thanks still for playing!\nCome and meet us at our booth in the agora if you have any questions or feedback.";
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
document.addEventListener("DOMContentLoaded", () => {
  try {
    updateMenuLang();
    // + ton init jeu ici
  } catch (e) {
    console.error("Erreur init jeu :", e);
  }
});
