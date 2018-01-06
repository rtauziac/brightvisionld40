function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function $_GET(param) {
    var vars = {};
    window.location.href.replace(location.hash, '').replace(
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function (m, key, value) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if (param) {
        return vars[param] ? vars[param] : null;
    }
    return vars;
}

// Components
AFRAME.registerComponent("crazyrems", {
    schema: {},
    init: function () {
        console.log("Game made by @crazyrems with A-FRAME");
    },
    update: function () { },
    tick: function () { },
    remove: function () { },
    pause: function () { },
    play: function () { }
});

AFRAME.registerComponent("game-manager", {
    schema: {
        level: {
            type: "int", default: 0
        }
    },
    init: function () {
        this.allKubes = [];
        this.kube9PositionsIndex = 0;
        this.kube9Positions = [
            "-0.3 1.5 -1.5",
            "-0.3 2.1 -1.5",
            "0.3 1.5 -1.5",
            "0.3 2.1 -1.5",
            // "0 1.8 -1.5"
        ]
        setTimeout(() => {
            let startTitle = document.createElement('a-start-title');
            startTitle.setAttribute("position", "0 2.3 -2");
            this.el.appendChild(startTitle);
        }, 2000);

        this.el.addEventListener("nextlevel", () => {
            this.nextLevel();
        });

        this.el.addEventListener("nextpart", () => {
            if (this.el.querySelector("#room_entity").getAttribute("visible") == true) {
                this.sceneDecimate();
            }
            else {
                this.sceneUnboxed();
            }
        });

        var heightParam = $_GET("playerHeight");
        if (heightParam != null) {
            this.el.querySelector("#camera").setAttribute("position", "0 " + heightParam + " 0");
        }
    },
    update: function () { },
    tick: function (time, timeDelta) {
        if (this.kube9Timer != undefined) {
            this.kube9Timer += timeDelta;
            if (this.kube9Timer >= 1460) {
                this.kube9PositionsIndex = (this.kube9PositionsIndex + 1) % this.kube9Positions.length;
                this.kube9Timer = 0;
                this.kube9.setAttribute("position", this.kube9Positions[this.kube9PositionsIndex]);
            }
        }
    },
    remove: function () { },
    pause: function () { },
    play: function () {
        //this.el.setAttribute("sound__static", "src: url(sounds/static.mp3); autoplay: true; loop: false;");
    },
    spawnKube: function (position, interactable = false, data) {
        let newKube = document.createElement('a-box');
        newKube.setAttribute("width", "0.2");
        newKube.setAttribute("height", "0.2");
        newKube.setAttribute("depth", "0.2");
        newKube.setAttribute("scale", "0 0 0");
        newKube.setAttribute("material", "color: black");
        // newKube.setAttribute("mixin", "black cube");
        var animProps = [];
        if (data != undefined) {
            if (data.delay != undefined) {
                animProps.push("delay: " + data.delay);
            }
        }
        newKube.setAttribute("appear-scale", animProps.join(";"));
        if (interactable === true) {
            // newKube.setAttribute("material", "color: #888");
            if (data != undefined && data.selection != undefined) {
                newKube.setAttribute(data.selection, "");
            }
            else {
                if (data != undefined && data.soundEffect != undefined) {
                    newKube.setAttribute("valid-selection", "soundEffect: " + data.soundEffect);
                }
                else {
                    newKube.setAttribute("valid-selection", "");
                }
            }
        }
        let kubeParent = document.createElement('a-entity');
        kubeParent.setAttribute("position", position);

        kubeParent.appendChild(newKube);

        if (data != undefined && data.parent != undefined) {
            data.parent.appendChild(kubeParent);
        }
        else {
            this.el.appendChild(kubeParent);
        }

        this.allKubes.push(kubeParent);
        return kubeParent;
    },
    nextLevel: function () {
        // console.log("Next level");
        // remove all kubes
        console.log("remove " + this.allKubes.length + " kubes");
        this.allKubes.forEach(element => {
            element.setAttribute("animation__remove", "property: scale; autoplay: true; to: 0.0001 0.0001 0.0001; dir: normal; dur: 1000; easing: easeOutExpo;")
            setTimeout(() => {
                if (element.parentNode != undefined || element.parentNode != null) {
                    // console.log("removing kube");
                    element.parentNode.removeChild(element);
                }
            }, 5000);
        });

        this.kube9 = undefined;
        this.kube9Timer = undefined;

        // prepare next level
        setTimeout(() => {
            this.data.level += 1;
            // console.log("creating level "+this.data.level);
            switch (this.data.level) { // create the levels
                case 1:
                    var k1 = this.spawnKube("0 1.5 -1.5", true);
                    k1.setAttribute("wobble-rotation", "");
                    break;

                case 2:
                    var k1 = this.spawnKube("-1 1.5 -1.5", false);
                    k1.setAttribute("wobble-rotation", "");
                    var k2 = this.spawnKube("0 1.5 -1.5", false, { delay: 300 });
                    k2.setAttribute("wobble-rotation", "delay: 300");
                    var k3 = this.spawnKube("1 1.5 -1.5", true, { delay: 600 });
                    k3.setAttribute("wobble-rotation", "delay: 600");
                    break;

                case 3:
                    var rndm = getRandomInt(0, 7);
                    for (var j = 0; j < 2; j += 1) {
                        for (var i = 0; i < 4; i += 1) {
                            var count = (i + (4 * j));
                            var coord = { x: 0.25 + ((i - 2) * 0.5), y: 1.5 + (j * 0.5), z: -1.5 }
                            var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), count === rndm, { delay: 200 * count });
                            kn.setAttribute("wobble-rotation", "delay: " + (200 * count));
                        }
                    }
                    break;

                case 4:
                    var rndm = getRandomInt(0, 11);
                    for (var i = 0; i < 12; i += 1) {
                        // console.log("create kube");
                        var coord = { x: Math.sin((Math.PI * 2 / 12) * i) * 1.5, y: 1.5, z: Math.cos((Math.PI * 2 / 12) * i) * 1.5 }
                        var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), i === rndm, { delay: 200 * i });
                        kn.setAttribute("wobble-rotation", "delay: " + (200 * i) + "; duration: 1200;");
                    }
                    break;

                case 5:
                    var k1 = this.spawnKube("0 1.5 -1.5", true, { selection: "grow-viral-selection" });
                    k1.setAttribute("wobble-rotation", "");
                    break;

                case 6:
                    var rndm = getRandomInt(0, 7);
                    for (var i = 0; i < 8; i += 1) {
                        var coord = { x: (-0.35 * 3.5) + (i * 0.35), y: 1.5, z: -1.5 }
                        var coordUp = { x: (-0.35 * 3.5) + (i * 0.35), y: 2.5, z: -1.5 }
                        var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), i === rndm, { delay: 200 * i, soundEffect: "laugth" });
                        kn.setAttribute("wobble-rotation", "delay: " + (200 * i));
                        kn.setAttribute("animation__updown", "property: position; autoplay: true; easing: easeInOutSine; dir: alternate; loop: true; dur: 2400; delay: " + (i * 300) + " from: " + AFRAME.utils.coordinates.stringify(coord) + "; to: " + AFRAME.utils.coordinates.stringify(coordUp));
                    }
                    break;

                case 7:
                    var rndm = getRandomInt(0, 11);
                    let carousel = document.createElement('a-entity');
                    carousel.setAttribute("animation__carousel", "property: rotation; autoplay: true; dir: normal; dur: 20000; easing: linear; from: 0 0 0; to: 0 360 0; loop: true;");
                    this.el.appendChild(carousel);
                    for (var i = 0; i < 12; i += 1) {
                        // console.log("create kube");
                        var coord = { x: Math.sin((Math.PI * 2 / 12) * i) * 1.5, y: 1.5, z: Math.cos((Math.PI * 2 / 12) * i) * 1.5 }
                        var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), i === rndm, { delay: 200 * i, parent: carousel, soundEffect: "laugth" });
                        kn.setAttribute("wobble-rotation", "delay: " + (200 * i) + "; duration: 1200;");
                    }
                    break;

                case 8:
                    var rndm = getRandomInt(0, 29);
                    for (var j = 0; j < 5; j += 1) {
                        for (var i = 0; i < 6; i += 1) {
                            var count = (6 * j) + i;
                            var coord = { x: (-0.35 * 2.5) + (i * 0.35), y: 2.6 - (j * 0.35), z: -1.5 }
                            var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), count === rndm, { delay: 200 * (i + j), soundEffect: "laugth" });
                            kn.setAttribute("wobble-rotation", "delay: " + 200 * (i + j));
                        }
                    }
                    break;

                case 9:
                    this.kube9 = this.spawnKube(this.kube9Positions[this.kube9PositionsIndex], true, { soundEffect: "laugth" });
                    this.kube9.setAttribute("wobble-rotation", "");
                    this.kube9Timer = 0;
                    break;

                case 10:
                    var rndm = getRandomInt(5, 15);
                    var delays = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                    for (var j = 0; j < 4; j += 1) {
                        for (var i = 0; i < 4; i += 1) {
                            var count = (4 * j) + i;
                            var coord = { x: 3, y: 2.6 - (j * 0.35), z: -1.5 - (i * 0.35) }
                            var coordend = { x: -3, y: 2.6 - (j * 0.35), z: -1.5 - (i * 0.35) }
                            var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), delays[count] === rndm, { delay: 200 * (i + (j * 4)), soundEffect: "laugth" });
                            kn.setAttribute("wobble-rotation", "delay: " + 200 * (i + j * 4));
                            kn.setAttribute("animation__scrolling", "property: position; autoplay: true; dir: normal; loop: true; easing: linear; dur: 12000; delay:" + (750 * delays[count]) + " from: " + AFRAME.utils.coordinates.stringify(coord) + "; to: " + AFRAME.utils.coordinates.stringify(coordend) + ";");
                        }
                    }
                    break;

                case 11:
                    var k1 = this.spawnKube("0 1.5 -1.5", true, { selection: "grow-viral-selection" });
                    k1.setAttribute("wobble-rotation", "");
                    break;
            }
        }, 2000);
    },
    sceneDecimate: function () {
        this.el.querySelector("#room_entity").setAttribute("visible", "false");
        this.el.querySelector("#room_decimate_entity").setAttribute("visible", "true");

        this.allKubes.forEach(element => {
            element.setAttribute("animation__decimate_scale", "property: scale; autoplay: true; to: 0.0001 0.0001 0.0001; dir: normal; dur: 2500; easing: easeInExpo;")
            element.setAttribute("animation__decimate_rotation", "property: rotation; autoplay: true; to: -400 -400 -400; dir: normal; dur: 2500; easing: easeInExpo;")
            setTimeout(() => {
                if (element.parentNode != undefined || element.parentNode != null) {
                    // console.log("removing kube");
                    element.parentNode.removeChild(element);
                }
            }, 5000);
        });

        setTimeout(() => {
            this.nextLevel();
        }, 2000);
        this.el.removeAttribute("sound__static");
        this.el.setAttribute("sound__rime", "src: url(sounds/rimes.mp3); autoplay: true; loop: true;");
        this.el.setAttribute("sound__noise", "src: url(sounds/beatnoise.mp3); autoplay: true; loop: true;");
    },
    sceneUnboxed: function () {
        this.el.querySelector("#room_decimate_entity").setAttribute("visible", "false");
        this.el.querySelector("#room_unboxed_entity").setAttribute("visible", "true");

        this.allKubes.forEach(element => {
            element.removeAttribute("animation__wiggle");
            element.removeAttribute("animation__decimate_rotation");
            element.setAttribute("animation__unboxed_rotation", "property: rotation; autoplay: true; to: 0 0 0; dir: normal; dur: 1000; easing: easeOutExpo;")
        });

        this.el.removeAttribute("sound__rime");
        this.el.removeAttribute("sound__noise");
        this.el.setAttribute("sound__freedom", "src: url(sounds/freedom.mp3); autoplay: true; loop: false;");

        setTimeout(() => {
            this.el.querySelector("#thxText").setAttribute("visible", true);
        }, 13680);
    }
});

// All kinds of kubes
AFRAME.registerComponent("grow-viral-selection", {
    schema: {
        selected: {
            type: "boolean", default: "false"
        }
    },
    init: function () {
        this.event_gv = (event) => {
            if (this.data.selected != true) {
                this.el.removeAttribute("sound__deflate");
                this.el.setAttribute("sound__rise", "src: url(sounds/Rise.mp3); autoplay: true; loop: false;");
                this.el.removeAttribute("animation__deflate");
                this.el.setAttribute("animation__grow_viral", "property: scale; autoplay: true; dir: normal; dur: 6530; easing: easeInQuad; to: 3.5, 3.5, 3.5;");
            }
        };
        this.el.addEventListener("mouseenter", this.event_gv);

        this.event_le = (event) => {
            if (this.data.selected != true) {
                this.el.removeAttribute("animation__grow_viral");
                this.el.removeAttribute("sound__rise");
                this.el.setAttribute("animation__deflate", "property: scale; autoplay: true; dir: normal; dur: 700; easing: easeOutExpo; to: 1, 1, 1;");
                // if (this.el.components.scale.data.x > 1.2) {
                    this.el.setAttribute("sound__deflate", "src: url(sounds/deflate.mp3); autoplay: true; loop: false;");
                // }
            }
        };
        this.el.addEventListener("mouseleave", this.event_le);

        // this.el.addEventListener("animation__grow_viral-complete", (event) => {
        //     // this.el.setAttribute("sound", "src: url(sounds/valid.mp3); autoplay: true;");
        //     document.querySelector('#gameManager').emit("nextpart");
        //     this.el.removeEventListener("mouseenter", this.event_gv);
        //     this.el.removeEventListener("mouseleave", this.event_le);
        // });

        this.el.addEventListener("animationcomplete", (event) => {
            if (event.detail.name == "animation__grow_viral") {
                // console.log("Event " + event.detail.name + " just finished!");
                this.data.selected = true;
                if (this.data.soundEffect) {
                    this.el.setAttribute("sound", "src: url(sounds/" + this.data.soundEffect + ".mp3); autoplay: true;");
                }
                this.el.removeEventListener("mouseenter", this.event_me);
                this.el.removeEventListener("mouseleave", this.event_ml);
                document.querySelector('#gameManager').emit("nextpart");
            }
        });
    }
});

AFRAME.registerComponent("color-highlight", {
    schema: {
        color: {
            type: "color", default: "#000"
        }
    },
    init: function () {
        this.el.addEventListener("mouseenter", (event) => {
            this.el.setAttribute("material", "color: " + this.data.color);
        });

        this.el.addEventListener("mouseleave", (event) => {
            this.el.setAttribute("material", "color: #000");
        });
    }
});

AFRAME.registerComponent("valid-selection", {
    schema: {
        soundEffect: {
            type: "string", default: "valid"
        }
    },
    init: function () {
        this.event_me = (event) => {
            this.el.removeAttribute("animation__appear_scale");
            this.el.removeAttribute("animation__deflate_valid_scale");
            // this.el.removeAttribute("animation__deflate_valid_color");
            this.el.setAttribute("animation__grow_valid_scale", "property: scale; autoplay: true; dir: normal; dur: 1300; easing: easeOutExpo; to: 1.5, 1.5, 1.5;");
            // this.el.setAttribute("animation__grow_valid_color", "property: color; dur: 400; easing: easeOutExpo; to: rgb(0, 0, 0);");
        };
        this.el.addEventListener("mouseenter", this.event_me);

        this.event_ml = (event) => {
            this.el.removeAttribute("animation__grow_valid_scale");
            // this.el.removeAttribute("animation__grow_valid_color");
            this.el.setAttribute("animation__deflate_valid_scale", "property: scale; autoplay: true; dir: normal; dur: 1300; easing: easeOutExpo; to: 1, 1, 1;");
            // this.el.setAttribute("animation__deflate_valid_color", "property: color; dur: 400; easing: easeOutExpo; to: rgb(0, 0, 0);");
        };
        this.el.addEventListener("mouseleave", this.event_ml);

        // this.el.addEventListener("animation__grow_valid_scale-complete", (event) => {
        //     this.el.setAttribute("sound", "src: url(sounds/" + this.data.soundEffect + ".mp3); autoplay: true;");
        //     document.querySelector('#gameManager').emit("nextlevel");
        //     this.el.removeEventListener("mouseenter", this.event_me);
        //     this.el.removeEventListener("mouseleave", this.event_ml);
        // });

        this.el.addEventListener("animationcomplete", (event) => {
            if (event.detail.name == "animation__grow_valid_scale") {
                // console.log("Event " + event.detail.name + " just finished!");

                this.el.setAttribute("sound", "src: url(sounds/" + this.data.soundEffect + ".mp3); autoplay: true;");
                document.querySelector('#gameManager').emit("nextlevel");
                this.el.removeEventListener("mouseenter", this.event_me);
                this.el.removeEventListener("mouseleave", this.event_ml);
            }
        });
    }
});

AFRAME.registerComponent("appear-scale", {
    schema: {
        delay: {
            type: "int", default: 0
        }
    },
    init: function () {
        // console.log("animation__appear_scale", "property: scale; dir: normal; dur: 1700; delay: " + this.data.delay + "; easing: easeOutExpo; from: 0 0 0; to: 1 1 1");
        this.el.setAttribute("animation__appear_scale", "property: scale; autoplay: true; dir: normal; dur: 1700; delay: " + this.data.delay + "; easing: easeOutExpo; from: 0 0 0; to: 1 1 1");
    }
});

AFRAME.registerComponent("wobble-rotation", {
    schema: {
        delay: {
            type: "int", default: 0
        },
        duration: {
            type: "number", default: 1300
        }
    },
    init: function () {
        this.el.setAttribute("animation__wiggle", "property: rotation; autoplay: true; easing: easeInOutSine; from: -8 -8 -8; to: 8 8 8; dir: alternate; delay: " + this.data.delay + "; dur: " + this.data.duration + "; loop: true;");
    }
});

// animation__appear_scale: {
//     property: "scale",
//     dir: "normal",
//     dur: 1700,
//     easing: "easeOutExpo",
//     loop: false,
//     from: "0 0 0",
//     to: "1 1 1"
// },

// AFRAME.registerComponent("kube-manager", {
//     schema: {
//         interactable: {
//             type: "bool", default: false
//         }
//     },
//     init: function () {
//         // let current = this;
//         if (this.data.interactable === true) {
//             this.el.addEventListener("mouseenter", (event) => {
//                 // console.log("gazed");
//                 // console.log(this);
//                 // console.log(event);
//                 // console.log(current);
//                 this.el.removeAttribute("sound__deflate");
//                 this.el.setAttribute("sound__rise", "src: url(sounds/Rise.mp3); autoplay: true; loop: false;");
//                 this.el.removeAttribute("animation__gaze_leave");
//                 this.el.setAttribute("animation__gaze_enter", "property: scale; dir: normal; dur: 5000; easing: easeInQuad; to: 2, 2, 2;");
//             });
//             this.el.addEventListener("mouseleave", (event) => {
//                 // console.log("out");
//                 this.el.removeAttribute("animation__gaze_enter");
//                 this.el.removeAttribute("sound__rise");
//                 this.el.setAttribute("sound__deflate", "src: url(sounds/deflate.mp3); autoplay: true; loop: false;");
//                 this.el.setAttribute("animation__gaze_leave", "property: scale; dir: normal; dur: 700; easing: easeOutExpo; to: 1, 1, 1;");
//             });
//             this.el.addEventListener("animation__gaze_enter-complete", (event) => {
//                 console.log("BOOM");
//             });
//         }
//     },
//     update: function () { },
//     tick: function () { },
//     remove: function () { },
//     pause: function () { },
//     play: function () { }
// });

AFRAME.registerComponent("start-title-manager", {
    schema: {},
    init: function () {
        let gameManager = document.querySelector('#gameManager');
        gameManager.setAttribute("sound__static", "src: url(sounds/static2.mp3); autoplay: true; loop: true;");
        this.el.addEventListener("click", (event) => {
            gameManager.setAttribute("sound__start", "src: url(sounds/arpegio.mp3); autoplay: true; loop: false;");
            this.el.parentNode.removeChild(this.el);
            gameManager.querySelector("#instructionText").setAttribute("visible", false);
            gameManager.emit("nextlevel");
        });
    },
    start: function () {
    }
});

// Primitives
// AFRAME.registerPrimitive("a-kube", {
//     // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
//     defaultComponents: {
//         geometry: { primitive: "box",
//             depth: 0.2,
//             height: 0.2,
//             width: 0.2
//         },
//         material: {
//             color: "black"
//         },
//         sound__appear: {
//             src: "url(sounds/appear01.mp3)",
//             autoplay: true,
//             loop: false
//         },
//         animation__appear_scale: {
//             property: "scale",
//             dir: "normal",
//             dur: 1700,
//             easing: "easeOutExpo",
//             loop: false,
//             from: "0 0 0",
//             to: "1 1 1"
//         },
//         // ["kube-manager"]: ""
//         ["grow-viral"]: "",
//         deflate: ""
//     },
//     mappings: {
//         interactable: "kube-manager.interactable"
//     }
// });

AFRAME.registerPrimitive("a-start-title", {
    defaultComponents: {
        text: {
            value: "START",
            color: "black",
            font: "monoid",
            anchor: "center",
            align: "center",
            width: "17"
        },
        geometry: {
            primitive: "plane",
            height: 0.8,
            width: 2.6
        },
        scale: "0.5 0.5 0.5",
        material: {
            color: "white"
        },
        sound__appear: {
            src: "url(sounds/appear01.mp3)",
            autoplay: true,
            loop: false
        },
        ["start-title-manager"]: ""
    },
    mappings: {}
});
