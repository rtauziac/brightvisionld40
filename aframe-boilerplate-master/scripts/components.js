function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        setTimeout(() => {
            let startTitle = document.createElement('a-start-title');
            startTitle.setAttribute("position", "0 2.3 -2");
            this.el.appendChild(startTitle);
        }, 2000);

        this.el.addEventListener("nextlevel", () => {
            this.nextLevel();
        });
    },
    update: function () { },
    tick: function () { },
    remove: function () { },
    pause: function () { },
    play: function () { },
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
            if (data.delay!= undefined ) {
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
                newKube.setAttribute("valid-selection", "");
            }
        }
        let kubeParent = document.createElement('a-entity');
        kubeParent.setAttribute("position", position);

        kubeParent.appendChild(newKube);
        this.el.appendChild(kubeParent);
        // newKube.setAttribute("interactable", interactable);
        // let kubeSound = document.createElement('a-sound');
        // kubeSound.setAttribute("src", "#appear_sound");
        // newKube.appendChild(kubeSound);
        this.allKubes.push(kubeParent);
        return kubeParent;
    },
    // startGame: function() {
    //     setTimeout( ()=>{
    //         // let newKube = document.createElement('a-kube');
    //         // newKube.setAttribute("position", "0 1.5 -1.5");
    //         // newKube.setAttribute("scale", "0.0001 0.0001 0.0001");
    //         // this.el.appendChild(newKube);
    //         this.allKubes.push(this.spawnKube("0 1.5 -1.5", true));
    //         this.allKubes.push(this.spawnKube("-1 1.5 -1.5"));
    //         this.allKubes.push(this.spawnKube("1 1.5 -1.5"));
    //     }, 2000);

    // },
    nextLevel: function () {

        console.log("Next level");
        // remove all kubes
        this.allKubes.forEach(element => {
            element.setAttribute("animation__remove", "property: scale; to: 0.0001 0.0001 0.0001; dir: normal; dur: 1000; easing: easeOutExpo;")
            setTimeout(() => {
                element.addEventListener("animation__remove-complete", function () {
                    element.parentNode.removeChild(element);
                });
            }, 5000);
        });

        // prepare next level
        //setTimeout(() => {
            this.data.level += 1;
            console.log("creating level "+this.data.level);
            switch (this.data.level) { // create the levels
                case 1:
                    var k1 = this.spawnKube("0 1.5 -1.5", true, { delay: 2000 });
                    k1.setAttribute("wobble-rotation", "");
                    break;

                case 2:
                    var k1 = this.spawnKube("-1 1.5 -1.5", false, { delay: 2000 });
                    k1.setAttribute("wobble-rotation", "delay: 2000");
                    var k2 = this.spawnKube("0 1.5 -1.5", false, { delay: 2300 });
                    k2.setAttribute("wobble-rotation", "delay: 2300");
                    var k3 = this.spawnKube("1 1.5 -1.5", true, { delay: 2600 });
                    k3.setAttribute("wobble-rotation", "delay: 2600");
                    break;
                
                case 3:
                    var rndm = getRandomInt(0, 7);
                    for (var j=0; j<2; j+=1) {
                        for (var i=0; i<4; i+=1) {
                            var count = (i + (4*j));
                            var coord = {x: 0.25 + ((i-2) * 0.5), y: 1.5 + (j * 0.5), z: -1.5}
                            var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), count === rndm, { delay: 2000 + (200*count)});
                            kn.setAttribute("wobble-rotation", "delay: " + (2000 + (200*count)));
                        }
                    }
                    break;

                case 4:
                    
                    var rndm = getRandomInt(0, 11);
                    for (var i=0; i<12; i+=1) {
                        console.log("create kube");
                        var coord = {x: Math.sin((Math.PI*2/12) * i) * 1.5, y: 1.5, z: Math.cos((Math.PI*2/12) * i) * 1.5}
                        var kn = this.spawnKube(AFRAME.utils.coordinates.stringify(coord), i === rndm, { delay: 2000 + (200*i) });
                        kn.setAttribute("wobble-rotation", "delay: " + (2000 + (200*i)) + "; duration: 1200;");
                    }
                    break;

                case 5:
                    var k1 = this.spawnKube("-1 1.5 -1.5", false, { delay: 2000});
                    k1.setAttribute("wobble-rotation", "delay: 2000");
                    var k2 = this.spawnKube("0 1.5 -1.5", true, { delay: 2300, selection: "grow-viral-selection" });
                    k2.setAttribute("wobble-rotation", "delay: 2300");
                    var k3 = this.spawnKube("1 1.5 -1.5", false, { delay: 2600 });
                    k3.setAttribute("wobble-rotation", "delay: 2600");
                    break;
            }
        //}, 2000);
    }
});

// All kinds of kubes
AFRAME.registerComponent("grow-viral-selection", {
    init: function () {
        this.el.addEventListener("mouseenter", (event) => {
            this.el.removeAttribute("sound__deflate");
            this.el.setAttribute("sound__rise", "src: url(sounds/Rise.mp3); autoplay: true; loop: false;");
            this.el.removeAttribute("animation__deflate");
            this.el.setAttribute("animation__grow_viral", "property: scale; dir: normal; dur: 5000; easing: easeInQuad; to: 3, 3, 3;");
        });

        this.el.addEventListener("mouseleave", (event) => {
            this.el.removeAttribute("animation__grow_viral");
            this.el.removeAttribute("sound__rise");
            this.el.setAttribute("animation__deflate", "property: scale; dir: normal; dur: 700; easing: easeOutExpo; to: 1, 1, 1;");
            if (this.el.components.scale.data.x > 1.2) {
                this.el.setAttribute("sound__deflate", "src: url(sounds/deflate.mp3); autoplay: true; loop: false;");
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
    schema: { },
    init: function () {
        var event_me;
        var event_ml;

        this.el.addEventListener("animation__grow_valid_scale-complete", (event) => {
            this.el.setAttribute("sound", "src: url(sounds/valid.mp3); autoplay: true;");
            document.querySelector('#gameManager').emit("nextlevel");
            this.el.removeEventListener("mouseenter", event_me);
            this.el.removeEventListener("mouseleave", event_ml);
        });
        
        event_me = this.el.addEventListener("mouseenter", (event) => {
            this.el.removeAttribute("animation__appear_scale");
            this.el.removeAttribute("animation__deflate_valid_scale");
            // this.el.removeAttribute("animation__deflate_valid_color");
            this.el.setAttribute("animation__grow_valid_scale", "property: scale; dir: normal; dur: 1300; easing: easeOutExpo; to: 1.3, 1.3, 1.3;");
            // this.el.setAttribute("animation__grow_valid_color", "property: color; dur: 400; easing: easeOutExpo; to: rgb(0, 0, 0);");
        });

        event_ml = this.el.addEventListener("mouseleave", (event) => {
            this.el.removeAttribute("animation__grow_valid_scale");
            // this.el.removeAttribute("animation__grow_valid_color");
            this.el.setAttribute("animation__deflate_valid_scale", "property: scale; dir: normal; dur: 1300; easing: easeOutExpo; to: 1, 1, 1;");
            // this.el.setAttribute("animation__deflate_valid_color", "property: color; dur: 400; easing: easeOutExpo; to: rgb(0, 0, 0);");
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
        this.el.setAttribute("animation__appear_scale", "property: scale; dir: normal; dur: 1700; delay: " + this.data.delay + "; easing: easeOutExpo; from: 0 0 0; to: 1 1 1");
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
        this.el.setAttribute("animation__wiggle", "property: rotation; easing: easeInOutSine; from: -5 -5 -5; to: 5 5 5; dir: alternate; delay: " + this.data.delay + "; dur: " + this.data.duration + "; loop: true;");
        // this.el.setAttribute("animation__appear_scale", "property: scale; dir: normal; dur: 1700; delay: " + this.data.delay + "; easing: easeOutExpo; from: 0 0 0; to: 1 1 1");
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
        this.el.addEventListener("click", (event) => {
            let gameManager = document.querySelector('#gameManager');
            gameManager.setAttribute("sound", "src: url(sounds/arpegio.mp3); autoplay: true; loop: false;");
            this.el.parentNode.removeChild(this.el);
            // console.log(document.querySelector('#gameManager'));
            gameManager.emit("nextlevel");
        });
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
