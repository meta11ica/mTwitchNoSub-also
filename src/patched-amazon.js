async function fetchTwitchData(vodID) {
    const resp = await fetch("https://api.twitch.tv/kraken/videos/" + vodID, {
        method: 'GET',
        headers: {
            'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
            'Accept': 'application/vnd.twitchtv.v5+json'
        }
    });

    return resp.json();
}

function createServingID() {
    const w = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
    let id = "";

    for (let i = 0; i < 32; i++) {
        id += w[Math.floor(Math.random() * w.length)];
    }

    return id;
}

const oldFetch = self.fetch;

self.fetch = async function (url, opt) {
    let response = await oldFetch(url, opt);

    // Patch playlist from unmuted to muted segments
    if (url.includes("cloudfront") && url.includes(".m3u8")) {
        const body = await response.text();

        return new Response(body.replace(/-unmuted/g, "-muted"), { status: 200 });
    }

    if (url.startsWith("https://usher.ttvnw.net/vod/")) {
        if (response.status != 200) {
            const vodId = url.split("https://usher.ttvnw.net/vod/")[1].split(".m3u8")[0];
            const data = await fetchTwitchData(vodId);

            if (data == undefined) {
                return new Promise((resolve, reject) => {
                    resolve(new Response("Unable to fetch twitch data API", 403));
                });
            }

            let resolutions = data.resolutions;

            let sorted_dict = Object.keys(resolutions);
            sorted_dict = sorted_dict.reverse();

            let ordered_resolutions = {};

            for (key in sorted_dict) {
                ordered_resolutions[sorted_dict[key]] = resolutions[sorted_dict[key]];
            }

            resolutions = ordered_resolutions;

            const currentURL = new URL(data.animated_preview_url);

            const domain = currentURL.host;
            const paths = currentURL.pathname.split("/");
            const vodSpecialID = paths[paths.findIndex(element => element.includes("storyboards")) - 1];

            const userSettings = { "ip": "127.0.0.1", "servingId": createServingID() };

            let fakePlaylist = `#EXTM3U
#EXT-X-TWITCH-INFO:ORIGIN="s3",B="false",REGION="EU",USER-IP="${userSettings.ip}",SERVING-ID="${userSettings.servingId}",CLUSTER="cloudfront_vod",USER-COUNTRY="BE",MANIFEST-CLUSTER="cloudfront_vod"`;
            let sources_ = [];

            switch (data.broadcast_type) {
                case "highlight":
                    for ([resKey, resValue] of Object.entries(resolutions)) {
                        sources_.push({
                            src: `https://${domain}/${vodSpecialID}/${resKey}/highlight-${vodId}.m3u8`,
                            quality: resKey,
                            resolution: resValue,
                            fps: Math.ceil(data.fps[resKey]),
                            enabled: resKey == "chunked" ? "YES" : "NO"
                        });
                    };

                    break;
                case "upload":
                    for ([resKey, resValue] of Object.entries(resolutions)) {
                        sources_.push({
                            src: `https://${domain}/${data.channel.name}/${vodId}/${vodSpecialID}/${resKey}/index-dvr.m3u8`,
                            quality: resKey,
                            resolution: resValue,
                            fps: Math.ceil(data.fps[resKey]),
                            enabled: resKey == "chunked" ? "YES" : "NO"
                        });
                    };

                    break;
                default:
                    for ([resKey, resValue] of Object.entries(resolutions)) {
                        sources_.push({
                            src: `https://${domain}/${vodSpecialID}/${resKey}/index-dvr.m3u8`,
                            quality: resKey,
                            resolution: resValue,
                            fps: Math.ceil(data.fps[resKey]),
                            enabled: resKey == "chunked" ? "YES" : "NO"
                        });
                    }
                    break;
            }

            let startQuality = 8534030;

            Object.entries(sources_).forEach(([_, value]) => {
                fakePlaylist += `
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="${value.quality}",NAME="${value.quality}",AUTOSELECT=${value.enabled},DEFAULT=${value.enabled}
#EXT-X-STREAM-INF:BANDWIDTH=${startQuality},CODECS="avc1.64002A,mp4a.40.2",RESOLUTION=${value.resolution},VIDEO="${value.quality}",FRAME-RATE=${value.fps}
${value.src}`;

                startQuality -= 100;
            });

            const header = new Headers();
            header.append('Content-Type', 'application/vnd.apple.mpegurl');

            response = new Response(fakePlaylist, { status: 200, headers: header });

            return new Promise((resolve, reject) => {
                resolve(response);
            });
        }
    }

    return response;
}

! function () {
    var e = {
        449: function (e, t, r) {
            "use strict";
            var n, o = (n = "undefined" != typeof document && document.currentScript ? document.currentScript.src : void 0, function (e) {
                var t, o;
                (e = void 0 !== (e = e || {}) ? e : {}).ready = new Promise((function (e, r) {
                    t = e, o = r
                }));
                var i, a = {};
                for (i in e) e.hasOwnProperty(i) && (a[i] = e[i]);
                var s, u = [],
                    c = "./this.program",
                    l = "";
                l = self.location.href, n && (l = n), l = 0 !== l.indexOf("blob:") ? l.substr(0, l.lastIndexOf("/") + 1) : "", s = function (e) {
                    var t = new XMLHttpRequest;
                    return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response)
                };
                var f, d, h = e.print || console.log.bind(console),
                    p = e.printErr || console.warn.bind(console);
                for (i in a) a.hasOwnProperty(i) && (e[i] = a[i]);

                function v(e) {
                    v.shown || (v.shown = {}), v.shown[e] || (v.shown[e] = 1, p(e))
                }
                a = null, e.arguments && (u = e.arguments), e.thisProgram && (c = e.thisProgram), e.quit && e.quit, e.wasmBinary && (f = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, "object" != typeof WebAssembly && z("no native wasm support detected");
                var y = !1,
                    m = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;

                function g(e, t, r) {
                    for (var n = t + r, o = t; e[o] && !(o >= n);) ++o;
                    if (o - t > 16 && e.subarray && m) return m.decode(e.subarray(t, o));
                    for (var i = ""; t < o;) {
                        var a = e[t++];
                        if (128 & a) {
                            var s = 63 & e[t++];
                            if (192 != (224 & a)) {
                                var u = 63 & e[t++];
                                if ((a = 224 == (240 & a) ? (15 & a) << 12 | s << 6 | u : (7 & a) << 18 | s << 12 | u << 6 | 63 & e[t++]) < 65536) i += String.fromCharCode(a);
                                else {
                                    var c = a - 65536;
                                    i += String.fromCharCode(55296 | c >> 10, 56320 | 1023 & c)
                                }
                            } else i += String.fromCharCode((31 & a) << 6 | s)
                        } else i += String.fromCharCode(a)
                    }
                    return i
                }

                function E(e, t) {
                    return e ? g(C, e, t) : ""
                }

                function b(e, t, r, n) {
                    if (!(n > 0)) return 0;
                    for (var o = r, i = r + n - 1, a = 0; a < e.length; ++a) {
                        var s = e.charCodeAt(a);
                        if (s >= 55296 && s <= 57343 && (s = 65536 + ((1023 & s) << 10) | 1023 & e.charCodeAt(++a)), s <= 127) {
                            if (r >= i) break;
                            t[r++] = s
                        } else if (s <= 2047) {
                            if (r + 1 >= i) break;
                            t[r++] = 192 | s >> 6, t[r++] = 128 | 63 & s
                        } else if (s <= 65535) {
                            if (r + 2 >= i) break;
                            t[r++] = 224 | s >> 12, t[r++] = 128 | s >> 6 & 63, t[r++] = 128 | 63 & s
                        } else {
                            if (r + 3 >= i) break;
                            t[r++] = 240 | s >> 18, t[r++] = 128 | s >> 12 & 63, t[r++] = 128 | s >> 6 & 63, t[r++] = 128 | 63 & s
                        }
                    }
                    return t[r] = 0, r - o
                }

                function w(e) {
                    for (var t = 0, r = 0; r < e.length; ++r) {
                        var n = e.charCodeAt(r);
                        n >= 55296 && n <= 57343 && (n = 65536 + ((1023 & n) << 10) | 1023 & e.charCodeAt(++r)), n <= 127 ? ++t : t += n <= 2047 ? 2 : n <= 65535 ? 3 : 4
                    }
                    return t
                }
                var T, _, C, S, k, A, R, P, O, D = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;

                function $(e, t) {
                    for (var r = e, n = r >> 1, o = n + t / 2; !(n >= o) && k[n];) ++n;
                    if ((r = n << 1) - e > 32 && D) return D.decode(C.subarray(e, r));
                    for (var i = "", a = 0; !(a >= t / 2); ++a) {
                        var s = S[e + 2 * a >> 1];
                        if (0 == s) break;
                        i += String.fromCharCode(s)
                    }
                    return i
                }

                function M(e, t, r) {
                    if (void 0 === r && (r = 2147483647), r < 2) return 0;
                    for (var n = t, o = (r -= 2) < 2 * e.length ? r / 2 : e.length, i = 0; i < o; ++i) {
                        var a = e.charCodeAt(i);
                        S[t >> 1] = a, t += 2
                    }
                    return S[t >> 1] = 0, t - n
                }

                function I(e) {
                    return 2 * e.length
                }

                function N(e, t) {
                    for (var r = 0, n = ""; !(r >= t / 4);) {
                        var o = A[e + 4 * r >> 2];
                        if (0 == o) break;
                        if (++r, o >= 65536) {
                            var i = o - 65536;
                            n += String.fromCharCode(55296 | i >> 10, 56320 | 1023 & i)
                        } else n += String.fromCharCode(o)
                    }
                    return n
                }

                function x(e, t, r) {
                    if (void 0 === r && (r = 2147483647), r < 4) return 0;
                    for (var n = t, o = n + r - 4, i = 0; i < e.length; ++i) {
                        var a = e.charCodeAt(i);
                        if (a >= 55296 && a <= 57343 && (a = 65536 + ((1023 & a) << 10) | 1023 & e.charCodeAt(++i)), A[t >> 2] = a, (t += 4) + 4 > o) break
                    }
                    return A[t >> 2] = 0, t - n
                }

                function j(e) {
                    for (var t = 0, r = 0; r < e.length; ++r) {
                        var n = e.charCodeAt(r);
                        n >= 55296 && n <= 57343 && ++r, t += 4
                    }
                    return t
                }

                function L(e) {
                    var t = w(e) + 1,
                        r = wt(t);
                    return r && b(e, _, r, t), r
                }

                function U(t) {
                    T = t, e.HEAP8 = _ = new Int8Array(t), e.HEAP16 = S = new Int16Array(t), e.HEAP32 = A = new Int32Array(t), e.HEAPU8 = C = new Uint8Array(t), e.HEAPU16 = k = new Uint16Array(t), e.HEAPU32 = R = new Uint32Array(t), e.HEAPF32 = P = new Float32Array(t), e.HEAPF64 = O = new Float64Array(t)
                }
                e.INITIAL_MEMORY;
                var F, W = [],
                    B = [],
                    G = [],
                    H = [];
                B.push({
                    func: function () {
                        bt()
                    }
                });
                var V = 0,
                    Y = null,
                    q = null;

                function z(t) {
                    e.onAbort && e.onAbort(t), p(t += ""), y = !0, t = "abort(" + t + "). Build with -s ASSERTIONS=1 for more info.";
                    var r = new WebAssembly.RuntimeError(t);
                    throw o(r), r
                }

                function K(e) {
                    return t = e, r = "data:application/octet-stream;base64,", String.prototype.startsWith ? t.startsWith(r) : 0 === t.indexOf(r);
                    var t, r
                }
                e.preloadedImages = {}, e.preloadedAudios = {};
                var X, Z = "amazon-ivs-wasmworker.min.wasm";

                function J(e) {
                    try {
                        if (e == Z && f) return new Uint8Array(f);
                        if (s) return s(e);
                        throw "both async and sync fetching of the wasm failed"
                    } catch (e) {
                        z(e)
                    }
                }

                function Q(t) {
                    for (; t.length > 0;) {
                        var r = t.shift();
                        if ("function" != typeof r) {
                            var n = r.func;
                            "number" == typeof n ? void 0 === r.arg ? F.get(n)() : F.get(n)(r.arg) : n(void 0 === r.arg ? null : r.arg)
                        } else r(e)
                    }
                }

                function ee() {
                    var e = new Error;
                    if (!e.stack) {
                        try {
                            throw new Error
                        } catch (t) {
                            e = t
                        }
                        if (!e.stack) return "(no stack trace available)"
                    }
                    return e.stack.toString()
                }
                K(Z) || (X = Z, Z = e.locateFile ? e.locateFile(X, l) : l + X);
                var te = {};

                function re(e) {
                    for (; e.length;) {
                        var t = e.pop();
                        e.pop()(t)
                    }
                }

                function ne(e) {
                    return this.fromWireType(R[e >> 2])
                }
                var oe = {},
                    ie = {},
                    ae = {};

                function se(e) {
                    if (void 0 === e) return "_unknown";
                    var t = (e = e.replace(/[^a-zA-Z0-9_]/g, "$")).charCodeAt(0);
                    return t >= 48 && t <= 57 ? "_" + e : e
                }

                function ue(e, t) {
                    return e = se(e),
                        function () {
                            return t.apply(this, arguments)
                        }
                }

                function ce(e, t) {
                    var r = ue(t, (function (e) {
                        this.name = t, this.message = e;
                        var r = new Error(e).stack;
                        void 0 !== r && (this.stack = this.toString() + "\n" + r.replace(/^Error(:[^\n]*)?\n/, ""))
                    }));
                    return r.prototype = Object.create(e.prototype), r.prototype.constructor = r, r.prototype.toString = function () {
                        return void 0 === this.message ? this.name : this.name + ": " + this.message
                    }, r
                }
                var le = void 0;

                function fe(e) {
                    throw new le(e)
                }

                function de(e, t, r) {
                    function n(t) {
                        var n = r(t);
                        n.length !== e.length && fe("Mismatched type converter count");
                        for (var o = 0; o < e.length; ++o) ge(e[o], n[o])
                    }
                    e.forEach((function (e) {
                        ae[e] = t
                    }));
                    var o = new Array(t.length),
                        i = [],
                        a = 0;
                    t.forEach((function (e, t) {
                        ie.hasOwnProperty(e) ? o[t] = ie[e] : (i.push(e), oe.hasOwnProperty(e) || (oe[e] = []), oe[e].push((function () {
                            o[t] = ie[e], ++a === i.length && n(o)
                        })))
                    })), 0 === i.length && n(o)
                }

                function he(e) {
                    switch (e) {
                        case 1:
                            return 0;
                        case 2:
                            return 1;
                        case 4:
                            return 2;
                        case 8:
                            return 3;
                        default:
                            throw new TypeError("Unknown type size: " + e)
                    }
                }
                var pe = void 0;

                function ve(e) {
                    for (var t = "", r = e; C[r];) t += pe[C[r++]];
                    return t
                }
                var ye = void 0;

                function me(e) {
                    throw new ye(e)
                }

                function ge(e, t, r) {
                    if (r = r || {}, !("argPackAdvance" in t)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
                    var n = t.name;
                    if (e || me('type "' + n + '" must have a positive integer typeid pointer'), ie.hasOwnProperty(e)) {
                        if (r.ignoreDuplicateRegistrations) return;
                        me("Cannot register type '" + n + "' twice")
                    }
                    if (ie[e] = t, delete ae[e], oe.hasOwnProperty(e)) {
                        var o = oe[e];
                        delete oe[e], o.forEach((function (e) {
                            e()
                        }))
                    }
                }

                function Ee(e) {
                    me(e.$$.ptrType.registeredClass.name + " instance already deleted")
                }
                var be = !1;

                function we(e) { }

                function Te(e) {
                    e.count.value -= 1, 0 === e.count.value && function (e) {
                        e.smartPtr ? e.smartPtrType.rawDestructor(e.smartPtr) : e.ptrType.registeredClass.rawDestructor(e.ptr)
                    }(e)
                }

                function _e(e) {
                    return "undefined" == typeof FinalizationGroup ? (_e = function (e) {
                        return e
                    }, e) : (be = new FinalizationGroup((function (e) {
                        for (var t = e.next(); !t.done; t = e.next()) {
                            var r = t.value;
                            r.ptr ? Te(r) : console.warn("object already deleted: " + r.ptr)
                        }
                    })), _e = function (e) {
                        return be.register(e, e.$$, e.$$), e
                    }, we = function (e) {
                        be.unregister(e.$$)
                    }, _e(e))
                }
                var Ce = void 0,
                    Se = [];

                function ke() {
                    for (; Se.length;) {
                        var e = Se.pop();
                        e.$$.deleteScheduled = !1, e.delete()
                    }
                }

                function Ae() { }
                var Re = {};

                function Pe(e, t, r) {
                    if (void 0 === e[t].overloadTable) {
                        var n = e[t];
                        e[t] = function () {
                            return e[t].overloadTable.hasOwnProperty(arguments.length) || me("Function '" + r + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + e[t].overloadTable + ")!"), e[t].overloadTable[arguments.length].apply(this, arguments)
                        }, e[t].overloadTable = [], e[t].overloadTable[n.argCount] = n
                    }
                }

                function Oe(e, t, r, n, o, i, a, s) {
                    this.name = e, this.constructor = t, this.instancePrototype = r, this.rawDestructor = n, this.baseClass = o, this.getActualType = i, this.upcast = a, this.downcast = s, this.pureVirtualFunctions = []
                }

                function De(e, t, r) {
                    for (; t !== r;) t.upcast || me("Expected null or instance of " + r.name + ", got an instance of " + t.name), e = t.upcast(e), t = t.baseClass;
                    return e
                }

                function $e(e, t) {
                    if (null === t) return this.isReference && me("null is not a valid " + this.name), 0;
                    t.$$ || me('Cannot pass "' + Ke(t) + '" as a ' + this.name), t.$$.ptr || me("Cannot pass deleted object as a pointer of type " + this.name);
                    var r = t.$$.ptrType.registeredClass;
                    return De(t.$$.ptr, r, this.registeredClass)
                }

                function Me(e, t) {
                    var r;
                    if (null === t) return this.isReference && me("null is not a valid " + this.name), this.isSmartPointer ? (r = this.rawConstructor(), null !== e && e.push(this.rawDestructor, r), r) : 0;
                    t.$$ || me('Cannot pass "' + Ke(t) + '" as a ' + this.name), t.$$.ptr || me("Cannot pass deleted object as a pointer of type " + this.name), !this.isConst && t.$$.ptrType.isConst && me("Cannot convert argument of type " + (t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name) + " to parameter type " + this.name);
                    var n = t.$$.ptrType.registeredClass;
                    if (r = De(t.$$.ptr, n, this.registeredClass), this.isSmartPointer) switch (void 0 === t.$$.smartPtr && me("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
                        case 0:
                            t.$$.smartPtrType === this ? r = t.$$.smartPtr : me("Cannot convert argument of type " + (t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name) + " to parameter type " + this.name);
                            break;
                        case 1:
                            r = t.$$.smartPtr;
                            break;
                        case 2:
                            if (t.$$.smartPtrType === this) r = t.$$.smartPtr;
                            else {
                                var o = t.clone();
                                r = this.rawShare(r, ze((function () {
                                    o.delete()
                                }))), null !== e && e.push(this.rawDestructor, r)
                            }
                            break;
                        default:
                            me("Unsupporting sharing policy")
                    }
                    return r
                }

                function Ie(e, t) {
                    if (null === t) return this.isReference && me("null is not a valid " + this.name), 0;
                    t.$$ || me('Cannot pass "' + Ke(t) + '" as a ' + this.name), t.$$.ptr || me("Cannot pass deleted object as a pointer of type " + this.name), t.$$.ptrType.isConst && me("Cannot convert argument of type " + t.$$.ptrType.name + " to parameter type " + this.name);
                    var r = t.$$.ptrType.registeredClass;
                    return De(t.$$.ptr, r, this.registeredClass)
                }

                function Ne(e, t, r) {
                    if (t === r) return e;
                    if (void 0 === r.baseClass) return null;
                    var n = Ne(e, t, r.baseClass);
                    return null === n ? null : r.downcast(n)
                }
                var xe = {};

                function je(e, t) {
                    return t.ptrType && t.ptr || fe("makeClassHandle requires ptr and ptrType"), !!t.smartPtrType != !!t.smartPtr && fe("Both smartPtrType and smartPtr must be specified"), t.count = {
                        value: 1
                    }, _e(Object.create(e, {
                        $$: {
                            value: t
                        }
                    }))
                }

                function Le(e, t, r, n, o, i, a, s, u, c, l) {
                    this.name = e, this.registeredClass = t, this.isReference = r, this.isConst = n, this.isSmartPointer = o, this.pointeeType = i, this.sharingPolicy = a, this.rawGetPointee = s, this.rawConstructor = u, this.rawShare = c, this.rawDestructor = l, o || void 0 !== t.baseClass ? this.toWireType = Me : n ? (this.toWireType = $e, this.destructorFunction = null) : (this.toWireType = Ie, this.destructorFunction = null)
                }

                function Ue(t, r, n) {
                    return -1 != t.indexOf("j") ? function (t, r, n) {
                        var o = e["dynCall_" + t];
                        return n && n.length ? o.apply(null, [r].concat(n)) : o.call(null, r)
                    }(t, r, n) : F.get(r).apply(null, n)
                }

                function Fe(e, t) {
                    var r, n, o, i = -1 != (e = ve(e)).indexOf("j") ? (r = e, n = t, o = [], function () {
                        o.length = arguments.length;
                        for (var e = 0; e < arguments.length; e++) o[e] = arguments[e];
                        return Ue(r, n, o)
                    }) : F.get(t);
                    return "function" != typeof i && me("unknown function pointer with signature " + e + ": " + t), i
                }
                var We = void 0;

                function Be(e) {
                    var t = Tt(e),
                        r = ve(t);
                    return Ct(t), r
                }

                function Ge(e, t) {
                    var r = [],
                        n = {};
                    throw t.forEach((function e(t) {
                        n[t] || ie[t] || (ae[t] ? ae[t].forEach(e) : (r.push(t), n[t] = !0))
                    })), new We(e + ": " + r.map(Be).join([", "]))
                }

                function He(e, t) {
                    for (var r = [], n = 0; n < e; n++) r.push(A[(t >> 2) + n]);
                    return r
                }
                var Ve = [],
                    Ye = [{}, {
                        value: void 0
                    }, {
                        value: null
                    }, {
                        value: !0
                    }, {
                        value: !1
                    }];

                function qe(e) {
                    e > 4 && 0 == --Ye[e].refcount && (Ye[e] = void 0, Ve.push(e))
                }

                function ze(e) {
                    switch (e) {
                        case void 0:
                            return 1;
                        case null:
                            return 2;
                        case !0:
                            return 3;
                        case !1:
                            return 4;
                        default:
                            var t = Ve.length ? Ve.pop() : Ye.length;
                            return Ye[t] = {
                                refcount: 1,
                                value: e
                            }, t
                    }
                }

                function Ke(e) {
                    if (null === e) return "null";
                    var t = typeof e;
                    return "object" === t || "array" === t || "function" === t ? e.toString() : "" + e
                }

                function Xe(e, t) {
                    switch (t) {
                        case 2:
                            return function (e) {
                                return this.fromWireType(P[e >> 2])
                            };
                        case 3:
                            return function (e) {
                                return this.fromWireType(O[e >> 3])
                            };
                        default:
                            throw new TypeError("Unknown float type: " + e)
                    }
                }

                function Ze(e, t, r) {
                    switch (t) {
                        case 0:
                            return r ? function (e) {
                                return _[e]
                            } : function (e) {
                                return C[e]
                            };
                        case 1:
                            return r ? function (e) {
                                return S[e >> 1]
                            } : function (e) {
                                return k[e >> 1]
                            };
                        case 2:
                            return r ? function (e) {
                                return A[e >> 2]
                            } : function (e) {
                                return R[e >> 2]
                            };
                        default:
                            throw new TypeError("Unknown integer type: " + e)
                    }
                }

                function Je(e) {
                    return e || me("Cannot use deleted val. handle = " + e), Ye[e].value
                }

                function Qe(e, t) {
                    var r = ie[e];
                    return void 0 === r && me(t + " has unknown type " + Be(e)), r
                }

                function et(e, t) {
                    for (var r = new Array(e), n = 0; n < e; ++n) r[n] = Qe(A[(t >> 2) + n], "parameter " + n);
                    return r
                }
                var tt = {};

                function rt(e) {
                    var t = tt[e];
                    return void 0 === t ? ve(e) : t
                }
                var nt, ot = [];

                function it() {
                    if ("object" == typeof globalThis) return globalThis;

                    function e(e) {
                        e.$$$embind_global$$$ = e;
                        var t = "object" == typeof $$$embind_global$$$ && e.$$$embind_global$$$ === e;
                        return t || delete e.$$$embind_global$$$, t
                    }
                    if ("object" == typeof $$$embind_global$$$) return $$$embind_global$$$;
                    if ("object" == typeof r.g && e(r.g) ? $$$embind_global$$$ = r.g : "object" == typeof self && e(self) && ($$$embind_global$$$ = self), "object" == typeof $$$embind_global$$$) return $$$embind_global$$$;
                    throw Error("unable to get global object.")
                }

                function at(e) {
                    if (!e || !e.callee || !e.callee.name) return [null, "", ""];
                    e.callee.toString();
                    var t = e.callee.name,
                        r = "(",
                        n = !0;
                    for (var o in e) {
                        var i = e[o];
                        n || (r += ", "), n = !1, r += "number" == typeof i || "string" == typeof i ? i : "(" + typeof i + ")"
                    }
                    r += ")";
                    var a = e.callee.caller;
                    return n && (r = ""), [e = a ? a.arguments : [], t, r]
                }

                function st(e) {
                    try {
                        return d.grow(e - T.byteLength + 65535 >>> 16), U(d.buffer), 1
                    } catch (e) { }
                }
                nt = function () {
                    return performance.now()
                }, e._emscripten_log_js = function (e, t) {
                    24 & e && (t = t.replace(/\s+$/, ""), t += (t.length > 0 ? "\n" : "") + function (e) {
                        var t = ee(),
                            r = t.lastIndexOf("_emscripten_log"),
                            n = t.lastIndexOf("_emscripten_get_callstack"),
                            o = t.indexOf("\n", Math.max(r, n)) + 1;
                        t = t.slice(o), 32 & e && v("EM_LOG_DEMANGLE is deprecated; ignoring"), 8 & e && "undefined" == typeof emscripten_source_map && (v('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.'), e ^= 8, e |= 16);
                        var i = null;
                        if (128 & e)
                            for (i = at(arguments); i[1].indexOf("_emscripten_") >= 0;) i = at(i[0]);
                        var a = t.split("\n");
                        t = "";
                        var s = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)"),
                            u = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?"),
                            c = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
                        for (var l in a) {
                            var f = a[l],
                                d = "",
                                h = "",
                                p = 0,
                                y = 0,
                                m = c.exec(f);
                            if (m && 5 == m.length) d = m[1], h = m[2], p = m[3], y = m[4];
                            else {
                                if ((m = s.exec(f)) || (m = u.exec(f)), !(m && m.length >= 4)) {
                                    t += f + "\n";
                                    continue
                                }
                                d = m[1], h = m[2], p = m[3], y = 0 | m[4]
                            }
                            var g = !1;
                            if (8 & e) {
                                var E = emscripten_source_map.originalPositionFor({
                                    line: p,
                                    column: y
                                });
                                (g = E && E.source) && (64 & e && (E.source = E.source.substring(E.source.replace(/\\/g, "/").lastIndexOf("/") + 1)), t += "    at " + d + " (" + E.source + ":" + E.line + ":" + E.column + ")\n")
                            } (16 & e || !g) && (64 & e && (h = h.substring(h.replace(/\\/g, "/").lastIndexOf("/") + 1)), t += (g ? "     = " + d : "    at " + d) + " (" + h + ":" + p + ":" + y + ")\n"), 128 & e && i[0] && (i[1] == d && i[2].length > 0 && (t = t.replace(/\s+$/, ""), t += " with values: " + i[1] + i[2] + "\n"), i = at(i[0]))
                        }
                        return t.replace(/\s+$/, "")
                    }(e)), 1 & e ? 4 & e ? console.error(t) : 2 & e ? console.warn(t) : 512 & e ? console.info(t) : 256 & e ? console.debug(t) : console.log(t) : 6 & e ? p(t) : h(t)
                };
                var ut = {};

                function ct() {
                    if (!ct.strings) {
                        var e = {
                            USER: "web_user",
                            LOGNAME: "web_user",
                            PATH: "/",
                            PWD: "/",
                            HOME: "/home/web_user",
                            LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
                            _: c || "./this.program"
                        };
                        for (var t in ut) e[t] = ut[t];
                        var r = [];
                        for (var t in e) r.push(t + "=" + e[t]);
                        ct.strings = r
                    }
                    return ct.strings
                }
                var lt = {
                    mappings: {},
                    buffers: [null, [],
                        []
                    ],
                    printChar: function (e, t) {
                        var r = lt.buffers[e];
                        0 === t || 10 === t ? ((1 === e ? h : p)(g(r, 0)), r.length = 0) : r.push(t)
                    },
                    varargs: void 0,
                    get: function () {
                        return lt.varargs += 4, A[lt.varargs - 4 >> 2]
                    },
                    getStr: function (e) {
                        return E(e)
                    },
                    get64: function (e, t) {
                        return e
                    }
                };

                function ft() {
                    if (!ft.called) {
                        ft.called = !0;
                        var e = (new Date).getFullYear(),
                            t = new Date(e, 0, 1),
                            r = new Date(e, 6, 1),
                            n = t.getTimezoneOffset(),
                            o = r.getTimezoneOffset(),
                            i = Math.max(n, o);
                        A[At() >> 2] = 60 * i, A[kt() >> 2] = Number(n != o);
                        var a = l(t),
                            s = l(r),
                            u = L(a),
                            c = L(s);
                        o < n ? (A[St() >> 2] = u, A[St() + 4 >> 2] = c) : (A[St() >> 2] = c, A[St() + 4 >> 2] = u)
                    }

                    function l(e) {
                        var t = e.toTimeString().match(/\(([A-Za-z ]+)\)$/);
                        return t ? t[1] : "GMT"
                    }
                }

                function dt(e) {
                    return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0)
                }

                function ht(e, t) {
                    for (var r = 0, n = 0; n <= t; r += e[n++]);
                    return r
                }
                var pt = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    vt = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                function yt(e, t) {
                    for (var r = new Date(e.getTime()); t > 0;) {
                        var n = dt(r.getFullYear()),
                            o = r.getMonth(),
                            i = (n ? pt : vt)[o];
                        if (!(t > i - r.getDate())) return r.setDate(r.getDate() + t), r;
                        t -= i - r.getDate() + 1, r.setDate(1), o < 11 ? r.setMonth(o + 1) : (r.setMonth(0), r.setFullYear(r.getFullYear() + 1))
                    }
                    return r
                }

                function mt(e, t, r, n) {
                    var o = A[n + 40 >> 2],
                        i = {
                            tm_sec: A[n >> 2],
                            tm_min: A[n + 4 >> 2],
                            tm_hour: A[n + 8 >> 2],
                            tm_mday: A[n + 12 >> 2],
                            tm_mon: A[n + 16 >> 2],
                            tm_year: A[n + 20 >> 2],
                            tm_wday: A[n + 24 >> 2],
                            tm_yday: A[n + 28 >> 2],
                            tm_isdst: A[n + 32 >> 2],
                            tm_gmtoff: A[n + 36 >> 2],
                            tm_zone: o ? E(o) : ""
                        },
                        a = E(r),
                        s = {
                            "%c": "%a %b %d %H:%M:%S %Y",
                            "%D": "%m/%d/%y",
                            "%F": "%Y-%m-%d",
                            "%h": "%b",
                            "%r": "%I:%M:%S %p",
                            "%R": "%H:%M",
                            "%T": "%H:%M:%S",
                            "%x": "%m/%d/%y",
                            "%X": "%H:%M:%S",
                            "%Ec": "%c",
                            "%EC": "%C",
                            "%Ex": "%m/%d/%y",
                            "%EX": "%H:%M:%S",
                            "%Ey": "%y",
                            "%EY": "%Y",
                            "%Od": "%d",
                            "%Oe": "%e",
                            "%OH": "%H",
                            "%OI": "%I",
                            "%Om": "%m",
                            "%OM": "%M",
                            "%OS": "%S",
                            "%Ou": "%u",
                            "%OU": "%U",
                            "%OV": "%V",
                            "%Ow": "%w",
                            "%OW": "%W",
                            "%Oy": "%y"
                        };
                    for (var u in s) a = a.replace(new RegExp(u, "g"), s[u]);
                    var c = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        l = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                    function f(e, t, r) {
                        for (var n = "number" == typeof e ? e.toString() : e || ""; n.length < t;) n = r[0] + n;
                        return n
                    }

                    function d(e, t) {
                        return f(e, t, "0")
                    }

                    function h(e, t) {
                        function r(e) {
                            return e < 0 ? -1 : e > 0 ? 1 : 0
                        }
                        var n;
                        return 0 === (n = r(e.getFullYear() - t.getFullYear())) && 0 === (n = r(e.getMonth() - t.getMonth())) && (n = r(e.getDate() - t.getDate())), n
                    }

                    function p(e) {
                        switch (e.getDay()) {
                            case 0:
                                return new Date(e.getFullYear() - 1, 11, 29);
                            case 1:
                                return e;
                            case 2:
                                return new Date(e.getFullYear(), 0, 3);
                            case 3:
                                return new Date(e.getFullYear(), 0, 2);
                            case 4:
                                return new Date(e.getFullYear(), 0, 1);
                            case 5:
                                return new Date(e.getFullYear() - 1, 11, 31);
                            case 6:
                                return new Date(e.getFullYear() - 1, 11, 30)
                        }
                    }

                    function v(e) {
                        var t = yt(new Date(e.tm_year + 1900, 0, 1), e.tm_yday),
                            r = new Date(t.getFullYear(), 0, 4),
                            n = new Date(t.getFullYear() + 1, 0, 4),
                            o = p(r),
                            i = p(n);
                        return h(o, t) <= 0 ? h(i, t) <= 0 ? t.getFullYear() + 1 : t.getFullYear() : t.getFullYear() - 1
                    }
                    var y = {
                        "%a": function (e) {
                            return c[e.tm_wday].substring(0, 3)
                        },
                        "%A": function (e) {
                            return c[e.tm_wday]
                        },
                        "%b": function (e) {
                            return l[e.tm_mon].substring(0, 3)
                        },
                        "%B": function (e) {
                            return l[e.tm_mon]
                        },
                        "%C": function (e) {
                            return d((e.tm_year + 1900) / 100 | 0, 2)
                        },
                        "%d": function (e) {
                            return d(e.tm_mday, 2)
                        },
                        "%e": function (e) {
                            return f(e.tm_mday, 2, " ")
                        },
                        "%g": function (e) {
                            return v(e).toString().substring(2)
                        },
                        "%G": function (e) {
                            return v(e)
                        },
                        "%H": function (e) {
                            return d(e.tm_hour, 2)
                        },
                        "%I": function (e) {
                            var t = e.tm_hour;
                            return 0 == t ? t = 12 : t > 12 && (t -= 12), d(t, 2)
                        },
                        "%j": function (e) {
                            return d(e.tm_mday + ht(dt(e.tm_year + 1900) ? pt : vt, e.tm_mon - 1), 3)
                        },
                        "%m": function (e) {
                            return d(e.tm_mon + 1, 2)
                        },
                        "%M": function (e) {
                            return d(e.tm_min, 2)
                        },
                        "%n": function () {
                            return "\n"
                        },
                        "%p": function (e) {
                            return e.tm_hour >= 0 && e.tm_hour < 12 ? "AM" : "PM"
                        },
                        "%S": function (e) {
                            return d(e.tm_sec, 2)
                        },
                        "%t": function () {
                            return "\t"
                        },
                        "%u": function (e) {
                            return e.tm_wday || 7
                        },
                        "%U": function (e) {
                            var t = new Date(e.tm_year + 1900, 0, 1),
                                r = 0 === t.getDay() ? t : yt(t, 7 - t.getDay()),
                                n = new Date(e.tm_year + 1900, e.tm_mon, e.tm_mday);
                            if (h(r, n) < 0) {
                                var o = ht(dt(n.getFullYear()) ? pt : vt, n.getMonth() - 1) - 31,
                                    i = 31 - r.getDate() + o + n.getDate();
                                return d(Math.ceil(i / 7), 2)
                            }
                            return 0 === h(r, t) ? "01" : "00"
                        },
                        "%V": function (e) {
                            var t, r = new Date(e.tm_year + 1900, 0, 4),
                                n = new Date(e.tm_year + 1901, 0, 4),
                                o = p(r),
                                i = p(n),
                                a = yt(new Date(e.tm_year + 1900, 0, 1), e.tm_yday);
                            return h(a, o) < 0 ? "53" : h(i, a) <= 0 ? "01" : (t = o.getFullYear() < e.tm_year + 1900 ? e.tm_yday + 32 - o.getDate() : e.tm_yday + 1 - o.getDate(), d(Math.ceil(t / 7), 2))
                        },
                        "%w": function (e) {
                            return e.tm_wday
                        },
                        "%W": function (e) {
                            var t = new Date(e.tm_year, 0, 1),
                                r = 1 === t.getDay() ? t : yt(t, 0 === t.getDay() ? 1 : 7 - t.getDay() + 1),
                                n = new Date(e.tm_year + 1900, e.tm_mon, e.tm_mday);
                            if (h(r, n) < 0) {
                                var o = ht(dt(n.getFullYear()) ? pt : vt, n.getMonth() - 1) - 31,
                                    i = 31 - r.getDate() + o + n.getDate();
                                return d(Math.ceil(i / 7), 2)
                            }
                            return 0 === h(r, t) ? "01" : "00"
                        },
                        "%y": function (e) {
                            return (e.tm_year + 1900).toString().substring(2)
                        },
                        "%Y": function (e) {
                            return e.tm_year + 1900
                        },
                        "%z": function (e) {
                            var t = e.tm_gmtoff,
                                r = t >= 0;
                            return t = (t = Math.abs(t) / 60) / 60 * 100 + t % 60, (r ? "+" : "-") + String("0000" + t).slice(-4)
                        },
                        "%Z": function (e) {
                            return e.tm_zone
                        },
                        "%%": function () {
                            return "%"
                        }
                    };
                    for (var u in y) a.indexOf(u) >= 0 && (a = a.replace(new RegExp(u, "g"), y[u](i)));
                    var m, g, T, C = (g = w(m = a) + 1, b(m, T = new Array(g), 0, T.length), T);
                    return C.length > t ? 0 : (function (e, t) {
                        _.set(e, t)
                    }(C, e), C.length - 1)
                }
                le = e.InternalError = ce(Error, "InternalError"),
                    function () {
                        for (var e = new Array(256), t = 0; t < 256; ++t) e[t] = String.fromCharCode(t);
                        pe = e
                    }(), ye = e.BindingError = ce(Error, "BindingError"), Ae.prototype.isAliasOf = function (e) {
                        if (!(this instanceof Ae)) return !1;
                        if (!(e instanceof Ae)) return !1;
                        for (var t = this.$$.ptrType.registeredClass, r = this.$$.ptr, n = e.$$.ptrType.registeredClass, o = e.$$.ptr; t.baseClass;) r = t.upcast(r), t = t.baseClass;
                        for (; n.baseClass;) o = n.upcast(o), n = n.baseClass;
                        return t === n && r === o
                    }, Ae.prototype.clone = function () {
                        if (this.$$.ptr || Ee(this), this.$$.preservePointerOnDelete) return this.$$.count.value += 1, this;
                        var e, t = _e(Object.create(Object.getPrototypeOf(this), {
                            $$: {
                                value: (e = this.$$, {
                                    count: e.count,
                                    deleteScheduled: e.deleteScheduled,
                                    preservePointerOnDelete: e.preservePointerOnDelete,
                                    ptr: e.ptr,
                                    ptrType: e.ptrType,
                                    smartPtr: e.smartPtr,
                                    smartPtrType: e.smartPtrType
                                })
                            }
                        }));
                        return t.$$.count.value += 1, t.$$.deleteScheduled = !1, t
                    }, Ae.prototype.delete = function () {
                        this.$$.ptr || Ee(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && me("Object already scheduled for deletion"), we(this), Te(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0)
                    }, Ae.prototype.isDeleted = function () {
                        return !this.$$.ptr
                    }, Ae.prototype.deleteLater = function () {
                        return this.$$.ptr || Ee(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && me("Object already scheduled for deletion"), Se.push(this), 1 === Se.length && Ce && Ce(ke), this.$$.deleteScheduled = !0, this
                    }, Le.prototype.getPointee = function (e) {
                        return this.rawGetPointee && (e = this.rawGetPointee(e)), e
                    }, Le.prototype.destructor = function (e) {
                        this.rawDestructor && this.rawDestructor(e)
                    }, Le.prototype.argPackAdvance = 8, Le.prototype.readValueFromPointer = ne, Le.prototype.deleteObject = function (e) {
                        null !== e && e.delete()
                    }, Le.prototype.fromWireType = function (e) {
                        var t = this.getPointee(e);
                        if (!t) return this.destructor(e), null;
                        var r = function (e, t) {
                            return t = function (e, t) {
                                for (void 0 === t && me("ptr should not be undefined"); e.baseClass;) t = e.upcast(t), e = e.baseClass;
                                return t
                            }(e, t), xe[t]
                        }(this.registeredClass, t);
                        if (void 0 !== r) {
                            if (0 === r.$$.count.value) return r.$$.ptr = t, r.$$.smartPtr = e, r.clone();
                            var n = r.clone();
                            return this.destructor(e), n
                        }

                        function o() {
                            return this.isSmartPointer ? je(this.registeredClass.instancePrototype, {
                                ptrType: this.pointeeType,
                                ptr: t,
                                smartPtrType: this,
                                smartPtr: e
                            }) : je(this.registeredClass.instancePrototype, {
                                ptrType: this,
                                ptr: e
                            })
                        }
                        var i, a = this.registeredClass.getActualType(t),
                            s = Re[a];
                        if (!s) return o.call(this);
                        i = this.isConst ? s.constPointerType : s.pointerType;
                        var u = Ne(t, this.registeredClass, i.registeredClass);
                        return null === u ? o.call(this) : this.isSmartPointer ? je(i.registeredClass.instancePrototype, {
                            ptrType: i,
                            ptr: u,
                            smartPtrType: this,
                            smartPtr: e
                        }) : je(i.registeredClass.instancePrototype, {
                            ptrType: i,
                            ptr: u
                        })
                    }, e.getInheritedInstanceCount = function () {
                        return Object.keys(xe).length
                    }, e.getLiveInheritedInstances = function () {
                        var e = [];
                        for (var t in xe) xe.hasOwnProperty(t) && e.push(xe[t]);
                        return e
                    }, e.flushPendingDeletes = ke, e.setDelayFunction = function (e) {
                        Ce = e, Se.length && Ce && Ce(ke)
                    }, We = e.UnboundTypeError = ce(Error, "UnboundTypeError"), e.count_emval_handles = function () {
                        for (var e = 0, t = 5; t < Ye.length; ++t) void 0 !== Ye[t] && ++e;
                        return e
                    }, e.get_first_emval = function () {
                        for (var e = 5; e < Ye.length; ++e)
                            if (void 0 !== Ye[e]) return Ye[e];
                        return null
                    };
                var gt, Et = {
                    s: function (e, t) { },
                    B: function (e) {
                        var t = te[e];
                        delete te[e];
                        var r = t.rawConstructor,
                            n = t.rawDestructor,
                            o = t.fields;
                        de([e], o.map((function (e) {
                            return e.getterReturnType
                        })).concat(o.map((function (e) {
                            return e.setterArgumentType
                        }))), (function (e) {
                            var i = {};
                            return o.forEach((function (t, r) {
                                var n = t.fieldName,
                                    a = e[r],
                                    s = t.getter,
                                    u = t.getterContext,
                                    c = e[r + o.length],
                                    l = t.setter,
                                    f = t.setterContext;
                                i[n] = {
                                    read: function (e) {
                                        return a.fromWireType(s(u, e))
                                    },
                                    write: function (e, t) {
                                        var r = [];
                                        l(f, e, c.toWireType(r, t)), re(r)
                                    }
                                }
                            })), [{
                                name: t.name,
                                fromWireType: function (e) {
                                    var t = {};
                                    for (var r in i) t[r] = i[r].read(e);
                                    return n(e), t
                                },
                                toWireType: function (e, t) {
                                    for (var o in i)
                                        if (!(o in t)) throw new TypeError('Missing field:  "' + o + '"');
                                    var a = r();
                                    for (o in i) i[o].write(a, t[o]);
                                    return null !== e && e.push(n, a), a
                                },
                                argPackAdvance: 8,
                                readValueFromPointer: ne,
                                destructorFunction: n
                            }]
                        }))
                    },
                    R: function (e, t, r, n, o) {
                        var i = he(r);
                        ge(e, {
                            name: t = ve(t),
                            fromWireType: function (e) {
                                return !!e
                            },
                            toWireType: function (e, t) {
                                return t ? n : o
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: function (e) {
                                var n;
                                if (1 === r) n = _;
                                else if (2 === r) n = S;
                                else {
                                    if (4 !== r) throw new TypeError("Unknown boolean type size: " + t);
                                    n = A
                                }
                                return this.fromWireType(n[e >> i])
                            },
                            destructorFunction: null
                        })
                    },
                    r: function (t, r, n, o, i, a, s, u, c, l, f, d, h) {
                        f = ve(f), a = Fe(i, a), u && (u = Fe(s, u)), l && (l = Fe(c, l)), h = Fe(d, h);
                        var p = se(f);
                        ! function (t, r, n) {
                            e.hasOwnProperty(t) ? (me("Cannot register public name '" + t + "' twice"), Pe(e, t, t), e.hasOwnProperty(void 0) && me("Cannot register multiple overloads of a function with the same number of arguments (undefined)!"), e[t].overloadTable[void 0] = r) : e[t] = r
                        }(p, (function () {
                            Ge("Cannot construct " + f + " due to unbound types", [o])
                        })), de([t, r, n], o ? [o] : [], (function (r) {
                            var n, i;
                            r = r[0], i = o ? (n = r.registeredClass).instancePrototype : Ae.prototype;
                            var s = ue(p, (function () {
                                if (Object.getPrototypeOf(this) !== c) throw new ye("Use 'new' to construct " + f);
                                if (void 0 === d.constructor_body) throw new ye(f + " has no accessible constructor");
                                var e = d.constructor_body[arguments.length];
                                if (void 0 === e) throw new ye("Tried to invoke ctor of " + f + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(d.constructor_body).toString() + ") parameters instead!");
                                return e.apply(this, arguments)
                            })),
                                c = Object.create(i, {
                                    constructor: {
                                        value: s
                                    }
                                });
                            s.prototype = c;
                            var d = new Oe(f, s, c, h, n, a, u, l),
                                v = new Le(f, d, !0, !1, !1),
                                y = new Le(f + "*", d, !1, !1, !1),
                                m = new Le(f + " const*", d, !1, !0, !1);
                            return Re[t] = {
                                pointerType: y,
                                constPointerType: m
                            },
                                function (t, r, n) {
                                    e.hasOwnProperty(t) || fe("Replacing nonexistant public symbol"), e[t].overloadTable, e[t] = r, e[t].argCount = void 0
                                }(p, s), [v, y, m]
                        }))
                    },
                    I: function (e, t, r, n, o, i) {
                        t > 0 || z("Assertion failed: " + void 0);
                        var a = He(t, r);
                        o = Fe(n, o);
                        var s = [i],
                            u = [];
                        de([], [e], (function (e) {
                            var r = "constructor " + (e = e[0]).name;
                            if (void 0 === e.registeredClass.constructor_body && (e.registeredClass.constructor_body = []), void 0 !== e.registeredClass.constructor_body[t - 1]) throw new ye("Cannot register multiple constructors with identical number of parameters (" + (t - 1) + ") for class '" + e.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
                            return e.registeredClass.constructor_body[t - 1] = function () {
                                Ge("Cannot construct " + e.name + " due to unbound types", a)
                            }, de([], a, (function (n) {
                                return e.registeredClass.constructor_body[t - 1] = function () {
                                    arguments.length !== t - 1 && me(r + " called with " + arguments.length + " arguments, expected " + (t - 1)), u.length = 0, s.length = t;
                                    for (var e = 1; e < t; ++e) s[e] = n[e].toWireType(u, arguments[e - 1]);
                                    var i = o.apply(null, s);
                                    return re(u), n[0].fromWireType(i)
                                }, []
                            })), []
                        }))
                    },
                    e: function (e, t, r, n, o, i, a, s) {
                        var u = He(r, n);
                        t = ve(t), i = Fe(o, i), de([], [e], (function (e) {
                            var n = (e = e[0]).name + "." + t;

                            function o() {
                                Ge("Cannot call " + n + " due to unbound types", u)
                            }
                            s && e.registeredClass.pureVirtualFunctions.push(t);
                            var c = e.registeredClass.instancePrototype,
                                l = c[t];
                            return void 0 === l || void 0 === l.overloadTable && l.className !== e.name && l.argCount === r - 2 ? (o.argCount = r - 2, o.className = e.name, c[t] = o) : (Pe(c, t, n), c[t].overloadTable[r - 2] = o), de([], u, (function (o) {
                                var s = function (e, t, r, n, o) {
                                    var i = t.length;
                                    i < 2 && me("argTypes array size mismatch! Must at least get return value and 'this' types!");
                                    for (var a = null !== t[1] && null !== r, s = !1, u = 1; u < t.length; ++u)
                                        if (null !== t[u] && void 0 === t[u].destructorFunction) {
                                            s = !0;
                                            break
                                        } var c = "void" !== t[0].name,
                                            l = i - 2,
                                            f = new Array(l),
                                            d = [],
                                            h = [];
                                    return function () {
                                        var r;
                                        arguments.length !== l && me("function " + e + " called with " + arguments.length + " arguments, expected " + l + " args!"), h.length = 0, d.length = a ? 2 : 1, d[0] = o, a && (r = t[1].toWireType(h, this), d[1] = r);
                                        for (var i = 0; i < l; ++i) f[i] = t[i + 2].toWireType(h, arguments[i]), d.push(f[i]);
                                        var u = n.apply(null, d);
                                        if (s) re(h);
                                        else
                                            for (i = a ? 1 : 2; i < t.length; i++) {
                                                var p = 1 === i ? r : f[i - 2];
                                                null !== t[i].destructorFunction && t[i].destructorFunction(p)
                                            }
                                        if (c) return t[0].fromWireType(u)
                                    }
                                }(n, o, e, i, a);
                                return void 0 === c[t].overloadTable ? (s.argCount = r - 2, c[t] = s) : c[t].overloadTable[r - 2] = s, []
                            })), []
                        }))
                    },
                    Q: function (e, t) {
                        ge(e, {
                            name: t = ve(t),
                            fromWireType: function (e) {
                                var t = Ye[e].value;
                                return qe(e), t
                            },
                            toWireType: function (e, t) {
                                return ze(t)
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: ne,
                            destructorFunction: null
                        })
                    },
                    E: function (e, t, r) {
                        var n = he(r);
                        ge(e, {
                            name: t = ve(t),
                            fromWireType: function (e) {
                                return e
                            },
                            toWireType: function (e, t) {
                                if ("number" != typeof t && "boolean" != typeof t) throw new TypeError('Cannot convert "' + Ke(t) + '" to ' + this.name);
                                return t
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: Xe(t, n),
                            destructorFunction: null
                        })
                    },
                    p: function (e, t, r, n, o) {
                        t = ve(t), -1 === o && (o = 4294967295);
                        var i = he(r),
                            a = function (e) {
                                return e
                            };
                        if (0 === n) {
                            var s = 32 - 8 * r;
                            a = function (e) {
                                return e << s >>> s
                            }
                        }
                        var u = -1 != t.indexOf("unsigned");
                        ge(e, {
                            name: t,
                            fromWireType: a,
                            toWireType: function (e, r) {
                                if ("number" != typeof r && "boolean" != typeof r) throw new TypeError('Cannot convert "' + Ke(r) + '" to ' + this.name);
                                if (r < n || r > o) throw new TypeError('Passing a number "' + Ke(r) + '" from JS side to C/C++ side to an argument of type "' + t + '", which is outside the valid range [' + n + ", " + o + "]!");
                                return u ? r >>> 0 : 0 | r
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: Ze(t, i, 0 !== n),
                            destructorFunction: null
                        })
                    },
                    n: function (e, t, r) {
                        var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t];

                        function o(e) {
                            var t = R,
                                r = t[e >>= 2],
                                o = t[e + 1];
                            return new n(T, o, r)
                        }
                        ge(e, {
                            name: r = ve(r),
                            fromWireType: o,
                            argPackAdvance: 8,
                            readValueFromPointer: o
                        }, {
                            ignoreDuplicateRegistrations: !0
                        })
                    },
                    F: function (e, t) {
                        var r = "std::string" === (t = ve(t));
                        ge(e, {
                            name: t,
                            fromWireType: function (e) {
                                var t, n = R[e >> 2];
                                if (r)
                                    for (var o = e + 4, i = 0; i <= n; ++i) {
                                        var a = e + 4 + i;
                                        if (i == n || 0 == C[a]) {
                                            var s = E(o, a - o);
                                            void 0 === t ? t = s : (t += String.fromCharCode(0), t += s), o = a + 1
                                        }
                                    } else {
                                    var u = new Array(n);
                                    for (i = 0; i < n; ++i) u[i] = String.fromCharCode(C[e + 4 + i]);
                                    t = u.join("")
                                }
                                return Ct(e), t
                            },
                            toWireType: function (e, t) {
                                t instanceof ArrayBuffer && (t = new Uint8Array(t));
                                var n = "string" == typeof t;
                                n || t instanceof Uint8Array || t instanceof Uint8ClampedArray || t instanceof Int8Array || me("Cannot pass non-string to std::string");
                                var o = (r && n ? function () {
                                    return w(t)
                                } : function () {
                                    return t.length
                                })(),
                                    i = wt(4 + o + 1);
                                if (R[i >> 2] = o, r && n) b(t, C, i + 4, o + 1);
                                else if (n)
                                    for (var a = 0; a < o; ++a) {
                                        var s = t.charCodeAt(a);
                                        s > 255 && (Ct(i), me("String has UTF-16 code units that do not fit in 8 bits")), C[i + 4 + a] = s
                                    } else
                                    for (a = 0; a < o; ++a) C[i + 4 + a] = t[a];
                                return null !== e && e.push(Ct, i), i
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: ne,
                            destructorFunction: function (e) {
                                Ct(e)
                            }
                        })
                    },
                    z: function (e, t, r) {
                        var n, o, i, a, s;
                        r = ve(r), 2 === t ? (n = $, o = M, a = I, i = function () {
                            return k
                        }, s = 1) : 4 === t && (n = N, o = x, a = j, i = function () {
                            return R
                        }, s = 2), ge(e, {
                            name: r,
                            fromWireType: function (e) {
                                for (var r, o = R[e >> 2], a = i(), u = e + 4, c = 0; c <= o; ++c) {
                                    var l = e + 4 + c * t;
                                    if (c == o || 0 == a[l >> s]) {
                                        var f = n(u, l - u);
                                        void 0 === r ? r = f : (r += String.fromCharCode(0), r += f), u = l + t
                                    }
                                }
                                return Ct(e), r
                            },
                            toWireType: function (e, n) {
                                "string" != typeof n && me("Cannot pass non-string to C++ string type " + r);
                                var i = a(n),
                                    u = wt(4 + i + t);
                                return R[u >> 2] = i >> s, o(n, u + 4, i + t), null !== e && e.push(Ct, u), u
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: ne,
                            destructorFunction: function (e) {
                                Ct(e)
                            }
                        })
                    },
                    G: function (e, t, r, n, o, i) {
                        te[e] = {
                            name: ve(t),
                            rawConstructor: Fe(r, n),
                            rawDestructor: Fe(o, i),
                            fields: []
                        }
                    },
                    m: function (e, t, r, n, o, i, a, s, u, c) {
                        te[e].fields.push({
                            fieldName: ve(t),
                            getterReturnType: r,
                            getter: Fe(n, o),
                            getterContext: i,
                            setterArgumentType: a,
                            setter: Fe(s, u),
                            setterContext: c
                        })
                    },
                    S: function (e, t) {
                        ge(e, {
                            isVoid: !0,
                            name: t = ve(t),
                            argPackAdvance: 0,
                            fromWireType: function () { },
                            toWireType: function (e, t) { }
                        })
                    },
                    i: function (e, t, r) {
                        e = Je(e), t = Qe(t, "emval::as");
                        var n = [],
                            o = ze(n);
                        return A[r >> 2] = o, t.toWireType(n, e)
                    },
                    w: function (e, t, r, n) {
                        e = Je(e);
                        for (var o = et(t, r), i = new Array(t), a = 0; a < t; ++a) {
                            var s = o[a];
                            i[a] = s.readValueFromPointer(n), n += s.argPackAdvance
                        }
                        return ze(e.apply(void 0, i))
                    },
                    t: function (e, t, r, n, o) {
                        return (e = ot[e])(t = Je(t), r = rt(r), function (e) {
                            var t = [];
                            return A[e >> 2] = ze(t), t
                        }(n), o)
                    },
                    g: function (e, t, r, n) {
                        (e = ot[e])(t = Je(t), r = rt(r), null, n)
                    },
                    a: qe,
                    u: function (e) {
                        return 0 === e ? ze(it()) : (e = rt(e), ze(it()[e]))
                    },
                    f: function (e, t) {
                        var r, n, o = et(e, t),
                            i = o[0],
                            a = new Array(e - 1);
                        return r = function (t, r, n, s) {
                            for (var u = 0, c = 0; c < e - 1; ++c) a[c] = o[c + 1].readValueFromPointer(s + u), u += o[c + 1].argPackAdvance;
                            var l = t[r].apply(t, a);
                            for (c = 0; c < e - 1; ++c) o[c + 1].deleteObject && o[c + 1].deleteObject(a[c]);
                            if (!i.isVoid) return i.toWireType(n, l)
                        }, n = ot.length, ot.push(r), n
                    },
                    A: function (t) {
                        return t = rt(t), ze(e[t])
                    },
                    d: function (e, t) {
                        return ze((e = Je(e))[t = Je(t)])
                    },
                    j: function (e) {
                        e > 4 && (Ye[e].refcount += 1)
                    },
                    v: function () {
                        return ze([])
                    },
                    b: function (e) {
                        return ze(rt(e))
                    },
                    q: function () {
                        return ze({})
                    },
                    h: function (e) {
                        re(Ye[e].value), qe(e)
                    },
                    l: function (e, t, r) {
                        e = Je(e), t = Je(t), r = Je(r), e[t] = r
                    },
                    k: function (e, t) {
                        return ze((e = Qe(e, "_emval_take_value")).readValueFromPointer(t))
                    },
                    o: function (e) {
                        return ze(typeof (e = Je(e)))
                    },
                    c: function () {
                        z()
                    },
                    C: function (e, t) {
                        var r;
                        if (0 === e) r = Date.now();
                        else {
                            if (1 !== e && 4 !== e) return A[_t() >> 2] = 28, -1;
                            r = nt()
                        }
                        return A[t >> 2] = r / 1e3 | 0, A[t + 4 >> 2] = r % 1e3 * 1e3 * 1e3 | 0, 0
                    },
                    K: function (e, t, r) {
                        C.copyWithin(e, t, t + r)
                    },
                    L: function (e) {
                        e >>>= 0;
                        var t = C.length,
                            r = 2147483648;
                        if (e > r) return !1;
                        for (var n, o = 1; o <= 4; o *= 2) {
                            var i = t * (1 + .2 / o);
                            if (i = Math.min(i, e + 100663296), st(Math.min(r, ((n = Math.max(16777216, e, i)) % 65536 > 0 && (n += 65536 - n % 65536), n)))) return !0
                        }
                        return !1
                    },
                    N: function (e, t) {
                        var r = 0;
                        return ct().forEach((function (n, o) {
                            var i = t + r;
                            A[e + 4 * o >> 2] = i,
                                function (e, t, r) {
                                    for (var n = 0; n < e.length; ++n) _[t++ >> 0] = e.charCodeAt(n);
                                    _[t >> 0] = 0
                                }(n, i), r += n.length + 1
                        })), 0
                    },
                    O: function (e, t) {
                        var r = ct();
                        A[e >> 2] = r.length;
                        var n = 0;
                        return r.forEach((function (e) {
                            n += e.length + 1
                        })), A[t >> 2] = n, 0
                    },
                    P: function (e) {
                        return 0
                    },
                    J: function (e, t, r, n, o) { },
                    D: function (e, t, r, n) {
                        for (var o = 0, i = 0; i < r; i++) {
                            for (var a = A[t + 8 * i >> 2], s = A[t + (8 * i + 4) >> 2], u = 0; u < s; u++) lt.printChar(e, C[a + u]);
                            o += s
                        }
                        return A[n >> 2] = o, 0
                    },
                    y: function e(t, r) {
                        var n = new Date(1e3 * A[t >> 2]);
                        A[r >> 2] = n.getUTCSeconds(), A[r + 4 >> 2] = n.getUTCMinutes(), A[r + 8 >> 2] = n.getUTCHours(), A[r + 12 >> 2] = n.getUTCDate(), A[r + 16 >> 2] = n.getUTCMonth(), A[r + 20 >> 2] = n.getUTCFullYear() - 1900, A[r + 24 >> 2] = n.getUTCDay(), A[r + 36 >> 2] = 0, A[r + 32 >> 2] = 0;
                        var o = Date.UTC(n.getUTCFullYear(), 0, 1, 0, 0, 0, 0),
                            i = (n.getTime() - o) / 864e5 | 0;
                        return A[r + 28 >> 2] = i, e.GMTString || (e.GMTString = L("GMT")), A[r + 40 >> 2] = e.GMTString, r
                    },
                    V: function (e, t) {
                        ft();
                        var r = new Date(1e3 * A[e >> 2]);
                        A[t >> 2] = r.getSeconds(), A[t + 4 >> 2] = r.getMinutes(), A[t + 8 >> 2] = r.getHours(), A[t + 12 >> 2] = r.getDate(), A[t + 16 >> 2] = r.getMonth(), A[t + 20 >> 2] = r.getFullYear() - 1900, A[t + 24 >> 2] = r.getDay();
                        var n = new Date(r.getFullYear(), 0, 1),
                            o = (r.getTime() - n.getTime()) / 864e5 | 0;
                        A[t + 28 >> 2] = o, A[t + 36 >> 2] = -60 * r.getTimezoneOffset();
                        var i = new Date(r.getFullYear(), 6, 1).getTimezoneOffset(),
                            a = n.getTimezoneOffset(),
                            s = 0 | (i != a && r.getTimezoneOffset() == Math.min(a, i));
                        A[t + 32 >> 2] = s;
                        var u = A[St() + (s ? 4 : 0) >> 2];
                        return A[t + 40 >> 2] = u, t
                    },
                    H: function (e) {
                        ft();
                        var t = new Date(A[e + 20 >> 2] + 1900, A[e + 16 >> 2], A[e + 12 >> 2], A[e + 8 >> 2], A[e + 4 >> 2], A[e >> 2], 0),
                            r = A[e + 32 >> 2],
                            n = t.getTimezoneOffset(),
                            o = new Date(t.getFullYear(), 0, 1),
                            i = new Date(t.getFullYear(), 6, 1).getTimezoneOffset(),
                            a = o.getTimezoneOffset(),
                            s = Math.min(a, i);
                        if (r < 0) A[e + 32 >> 2] = Number(i != a && s == n);
                        else if (r > 0 != (s == n)) {
                            var u = Math.max(a, i),
                                c = r > 0 ? s : u;
                            t.setTime(t.getTime() + 6e4 * (c - n))
                        }
                        A[e + 24 >> 2] = t.getDay();
                        var l = (t.getTime() - o.getTime()) / 864e5 | 0;
                        return A[e + 28 >> 2] = l, A[e >> 2] = t.getSeconds(), A[e + 4 >> 2] = t.getMinutes(), A[e + 8 >> 2] = t.getHours(), A[e + 12 >> 2] = t.getDate(), A[e + 16 >> 2] = t.getMonth(), t.getTime() / 1e3 | 0
                    },
                    x: function (e) { },
                    T: mt,
                    M: function (e, t, r, n) {
                        return mt(e, t, r, n)
                    },
                    U: function (e) {
                        var t = Date.now() / 1e3 | 0;
                        return e && (A[e >> 2] = t), t
                    }
                },
                    bt = (function () {
                        var t = {
                            a: Et
                        };

                        function r(t, r) {
                            var n = t.exports;
                            e.asm = n, U((d = e.asm.W).buffer), F = e.asm.Z,
                                function (t) {
                                    if (V--, e.monitorRunDependencies && e.monitorRunDependencies(V), 0 == V && (null !== Y && (clearInterval(Y), Y = null), q)) {
                                        var r = q;
                                        q = null, r()
                                    }
                                }()
                        }

                        function n(e) {
                            r(e.instance)
                        }

                        function i(e) {
                            return (f || "function" != typeof fetch ? Promise.resolve().then((function () {
                                return J(Z)
                            })) : fetch(Z, {
                                credentials: "same-origin"
                            }).then((function (e) {
                                if (!e.ok) throw "failed to load wasm binary file at '" + Z + "'";
                                return e.arrayBuffer()
                            })).catch((function () {
                                return J(Z)
                            }))).then((function (e) {
                                return WebAssembly.instantiate(e, t)
                            })).then(e, (function (e) {
                                p("failed to asynchronously prepare wasm: " + e), z(e)
                            }))
                        }
                        if (V++, e.monitorRunDependencies && e.monitorRunDependencies(V), e.instantiateWasm) try {
                            return e.instantiateWasm(t, r)
                        } catch (e) {
                            return p("Module.instantiateWasm callback failed with error: " + e), !1
                        } (f || "function" != typeof WebAssembly.instantiateStreaming || K(Z) || "function" != typeof fetch ? i(n) : fetch(Z, {
                            credentials: "same-origin"
                        }).then((function (e) {
                            return WebAssembly.instantiateStreaming(e, t).then(n, (function (e) {
                                return p("wasm streaming compile failed: " + e), p("falling back to ArrayBuffer instantiation"), i(n)
                            }))
                        }))).catch(o)
                    }(), e.___wasm_call_ctors = function () {
                        return (bt = e.___wasm_call_ctors = e.asm.X).apply(null, arguments)
                    }),
                    wt = e._malloc = function () {
                        return (wt = e._malloc = e.asm.Y).apply(null, arguments)
                    },
                    Tt = e.___getTypeName = function () {
                        return (Tt = e.___getTypeName = e.asm._).apply(null, arguments)
                    },
                    _t = (e.___embind_register_native_and_builtin_types = function () {
                        return (e.___embind_register_native_and_builtin_types = e.asm.$).apply(null, arguments)
                    }, e.___errno_location = function () {
                        return (_t = e.___errno_location = e.asm.aa).apply(null, arguments)
                    }),
                    Ct = e._free = function () {
                        return (Ct = e._free = e.asm.ba).apply(null, arguments)
                    },
                    St = e.__get_tzname = function () {
                        return (St = e.__get_tzname = e.asm.ca).apply(null, arguments)
                    },
                    kt = e.__get_daylight = function () {
                        return (kt = e.__get_daylight = e.asm.da).apply(null, arguments)
                    },
                    At = e.__get_timezone = function () {
                        return (At = e.__get_timezone = e.asm.ea).apply(null, arguments)
                    };

                function Rt(r) {
                    function n() {
                        gt || (gt = !0, e.calledRun = !0, y || (Q(B), Q(G), t(e), e.onRuntimeInitialized && e.onRuntimeInitialized(), function () {
                            if (e.postRun)
                                for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length;) t = e.postRun.shift(), H.unshift(t);
                            var t;
                            Q(H)
                        }()))
                    }
                    r = r || u, V > 0 || (function () {
                        if (e.preRun)
                            for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length;) t = e.preRun.shift(), W.unshift(t);
                        var t;
                        Q(W)
                    }(), V > 0 || (e.setStatus ? (e.setStatus("Running..."), setTimeout((function () {
                        setTimeout((function () {
                            e.setStatus("")
                        }), 1), n()
                    }), 1)) : n()))
                }
                if (e.dynCall_vij = function () {
                    return (e.dynCall_vij = e.asm.fa).apply(null, arguments)
                }, e.dynCall_viiij = function () {
                    return (e.dynCall_viiij = e.asm.ga).apply(null, arguments)
                }, e.dynCall_viji = function () {
                    return (e.dynCall_viji = e.asm.ha).apply(null, arguments)
                }, e.dynCall_ji = function () {
                    return (e.dynCall_ji = e.asm.ia).apply(null, arguments)
                }, e.dynCall_j = function () {
                    return (e.dynCall_j = e.asm.ja).apply(null, arguments)
                }, e.dynCall_viij = function () {
                    return (e.dynCall_viij = e.asm.ka).apply(null, arguments)
                }, e.dynCall_iijiiiii = function () {
                    return (e.dynCall_iijiiiii = e.asm.la).apply(null, arguments)
                }, e.dynCall_jiii = function () {
                    return (e.dynCall_jiii = e.asm.ma).apply(null, arguments)
                }, e.dynCall_vijii = function () {
                    return (e.dynCall_vijii = e.asm.na).apply(null, arguments)
                }, e.dynCall_jiji = function () {
                    return (e.dynCall_jiji = e.asm.oa).apply(null, arguments)
                }, e.dynCall_iiiiij = function () {
                    return (e.dynCall_iiiiij = e.asm.pa).apply(null, arguments)
                }, e.dynCall_iiiiijj = function () {
                    return (e.dynCall_iiiiijj = e.asm.qa).apply(null, arguments)
                }, e.dynCall_iiiiiijj = function () {
                    return (e.dynCall_iiiiiijj = e.asm.ra).apply(null, arguments)
                }, q = function e() {
                    gt || Rt(), gt || (q = e)
                }, e.run = Rt, e.preInit)
                    for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); e.preInit.length > 0;) e.preInit.pop()();
                return Rt(), e.ready
            });
            t.Z = o
        },
        61: function (e, t, r) {
            var n = r(698).default;

            function o() {
                "use strict";
                e.exports = o = function () {
                    return t
                }, e.exports.__esModule = !0, e.exports.default = e.exports;
                var t = {},
                    r = Object.prototype,
                    i = r.hasOwnProperty,
                    a = "function" == typeof Symbol ? Symbol : {},
                    s = a.iterator || "@@iterator",
                    u = a.asyncIterator || "@@asyncIterator",
                    c = a.toStringTag || "@@toStringTag";

                function l(e, t, r) {
                    return Object.defineProperty(e, t, {
                        value: r,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    }), e[t]
                }
                try {
                    l({}, "")
                } catch (e) {
                    l = function (e, t, r) {
                        return e[t] = r
                    }
                }

                function f(e, t, r, n) {
                    var o = t && t.prototype instanceof p ? t : p,
                        i = Object.create(o.prototype),
                        a = new k(n || []);
                    return i._invoke = function (e, t, r) {
                        var n = "suspendedStart";
                        return function (o, i) {
                            if ("executing" === n) throw new Error("Generator is already running");
                            if ("completed" === n) {
                                if ("throw" === o) throw i;
                                return {
                                    value: void 0,
                                    done: !0
                                }
                            }
                            for (r.method = o, r.arg = i; ;) {
                                var a = r.delegate;
                                if (a) {
                                    var s = _(a, r);
                                    if (s) {
                                        if (s === h) continue;
                                        return s
                                    }
                                }
                                if ("next" === r.method) r.sent = r._sent = r.arg;
                                else if ("throw" === r.method) {
                                    if ("suspendedStart" === n) throw n = "completed", r.arg;
                                    r.dispatchException(r.arg)
                                } else "return" === r.method && r.abrupt("return", r.arg);
                                n = "executing";
                                var u = d(e, t, r);
                                if ("normal" === u.type) {
                                    if (n = r.done ? "completed" : "suspendedYield", u.arg === h) continue;
                                    return {
                                        value: u.arg,
                                        done: r.done
                                    }
                                }
                                "throw" === u.type && (n = "completed", r.method = "throw", r.arg = u.arg)
                            }
                        }
                    }(e, r, a), i
                }

                function d(e, t, r) {
                    try {
                        return {
                            type: "normal",
                            arg: e.call(t, r)
                        }
                    } catch (e) {
                        return {
                            type: "throw",
                            arg: e
                        }
                    }
                }
                t.wrap = f;
                var h = {};

                function p() { }

                function v() { }

                function y() { }
                var m = {};
                l(m, s, (function () {
                    return this
                }));
                var g = Object.getPrototypeOf,
                    E = g && g(g(A([])));
                E && E !== r && i.call(E, s) && (m = E);
                var b = y.prototype = p.prototype = Object.create(m);

                function w(e) {
                    ["next", "throw", "return"].forEach((function (t) {
                        l(e, t, (function (e) {
                            return this._invoke(t, e)
                        }))
                    }))
                }

                function T(e, t) {
                    function r(o, a, s, u) {
                        var c = d(e[o], e, a);
                        if ("throw" !== c.type) {
                            var l = c.arg,
                                f = l.value;
                            return f && "object" == n(f) && i.call(f, "__await") ? t.resolve(f.__await).then((function (e) {
                                r("next", e, s, u)
                            }), (function (e) {
                                r("throw", e, s, u)
                            })) : t.resolve(f).then((function (e) {
                                l.value = e, s(l)
                            }), (function (e) {
                                return r("throw", e, s, u)
                            }))
                        }
                        u(c.arg)
                    }
                    var o;
                    this._invoke = function (e, n) {
                        function i() {
                            return new t((function (t, o) {
                                r(e, n, t, o)
                            }))
                        }
                        return o = o ? o.then(i, i) : i()
                    }
                }

                function _(e, t) {
                    var r = e.iterator[t.method];
                    if (void 0 === r) {
                        if (t.delegate = null, "throw" === t.method) {
                            if (e.iterator.return && (t.method = "return", t.arg = void 0, _(e, t), "throw" === t.method)) return h;
                            t.method = "throw", t.arg = new TypeError("The iterator does not provide a 'throw' method")
                        }
                        return h
                    }
                    var n = d(r, e.iterator, t.arg);
                    if ("throw" === n.type) return t.method = "throw", t.arg = n.arg, t.delegate = null, h;
                    var o = n.arg;
                    return o ? o.done ? (t[e.resultName] = o.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", t.arg = void 0), t.delegate = null, h) : o : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), t.delegate = null, h)
                }

                function C(e) {
                    var t = {
                        tryLoc: e[0]
                    };
                    1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
                }

                function S(e) {
                    var t = e.completion || {};
                    t.type = "normal", delete t.arg, e.completion = t
                }

                function k(e) {
                    this.tryEntries = [{
                        tryLoc: "root"
                    }], e.forEach(C, this), this.reset(!0)
                }

                function A(e) {
                    if (e) {
                        var t = e[s];
                        if (t) return t.call(e);
                        if ("function" == typeof e.next) return e;
                        if (!isNaN(e.length)) {
                            var r = -1,
                                n = function t() {
                                    for (; ++r < e.length;)
                                        if (i.call(e, r)) return t.value = e[r], t.done = !1, t;
                                    return t.value = void 0, t.done = !0, t
                                };
                            return n.next = n
                        }
                    }
                    return {
                        next: R
                    }
                }

                function R() {
                    return {
                        value: void 0,
                        done: !0
                    }
                }
                return v.prototype = y, l(b, "constructor", y), l(y, "constructor", v), v.displayName = l(y, c, "GeneratorFunction"), t.isGeneratorFunction = function (e) {
                    var t = "function" == typeof e && e.constructor;
                    return !!t && (t === v || "GeneratorFunction" === (t.displayName || t.name))
                }, t.mark = function (e) {
                    return Object.setPrototypeOf ? Object.setPrototypeOf(e, y) : (e.__proto__ = y, l(e, c, "GeneratorFunction")), e.prototype = Object.create(b), e
                }, t.awrap = function (e) {
                    return {
                        __await: e
                    }
                }, w(T.prototype), l(T.prototype, u, (function () {
                    return this
                })), t.AsyncIterator = T, t.async = function (e, r, n, o, i) {
                    void 0 === i && (i = Promise);
                    var a = new T(f(e, r, n, o), i);
                    return t.isGeneratorFunction(r) ? a : a.next().then((function (e) {
                        return e.done ? e.value : a.next()
                    }))
                }, w(b), l(b, c, "Generator"), l(b, s, (function () {
                    return this
                })), l(b, "toString", (function () {
                    return "[object Generator]"
                })), t.keys = function (e) {
                    var t = [];
                    for (var r in e) t.push(r);
                    return t.reverse(),
                        function r() {
                            for (; t.length;) {
                                var n = t.pop();
                                if (n in e) return r.value = n, r.done = !1, r
                            }
                            return r.done = !0, r
                        }
                }, t.values = A, k.prototype = {
                    constructor: k,
                    reset: function (e) {
                        if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(S), !e)
                            for (var t in this) "t" === t.charAt(0) && i.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = void 0)
                    },
                    stop: function () {
                        this.done = !0;
                        var e = this.tryEntries[0].completion;
                        if ("throw" === e.type) throw e.arg;
                        return this.rval
                    },
                    dispatchException: function (e) {
                        if (this.done) throw e;
                        var t = this;

                        function r(r, n) {
                            return a.type = "throw", a.arg = e, t.next = r, n && (t.method = "next", t.arg = void 0), !!n
                        }
                        for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                            var o = this.tryEntries[n],
                                a = o.completion;
                            if ("root" === o.tryLoc) return r("end");
                            if (o.tryLoc <= this.prev) {
                                var s = i.call(o, "catchLoc"),
                                    u = i.call(o, "finallyLoc");
                                if (s && u) {
                                    if (this.prev < o.catchLoc) return r(o.catchLoc, !0);
                                    if (this.prev < o.finallyLoc) return r(o.finallyLoc)
                                } else if (s) {
                                    if (this.prev < o.catchLoc) return r(o.catchLoc, !0)
                                } else {
                                    if (!u) throw new Error("try statement without catch or finally");
                                    if (this.prev < o.finallyLoc) return r(o.finallyLoc)
                                }
                            }
                        }
                    },
                    abrupt: function (e, t) {
                        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                            var n = this.tryEntries[r];
                            if (n.tryLoc <= this.prev && i.call(n, "finallyLoc") && this.prev < n.finallyLoc) {
                                var o = n;
                                break
                            }
                        }
                        o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                        var a = o ? o.completion : {};
                        return a.type = e, a.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, h) : this.complete(a)
                    },
                    complete: function (e, t) {
                        if ("throw" === e.type) throw e.arg;
                        return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), h
                    },
                    finish: function (e) {
                        for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                            var r = this.tryEntries[t];
                            if (r.finallyLoc === e) return this.complete(r.completion, r.afterLoc), S(r), h
                        }
                    },
                    catch: function (e) {
                        for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                            var r = this.tryEntries[t];
                            if (r.tryLoc === e) {
                                var n = r.completion;
                                if ("throw" === n.type) {
                                    var o = n.arg;
                                    S(r)
                                }
                                return o
                            }
                        }
                        throw new Error("illegal catch attempt")
                    },
                    delegateYield: function (e, t, r) {
                        return this.delegate = {
                            iterator: A(e),
                            resultName: t,
                            nextLoc: r
                        }, "next" === this.method && (this.arg = void 0), h
                    }
                }, t
            }
            e.exports = o, e.exports.__esModule = !0, e.exports.default = e.exports
        },
        698: function (e) {
            function t(r) {
                return e.exports = t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
                    return typeof e
                } : function (e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                }, e.exports.__esModule = !0, e.exports.default = e.exports, t(r)
            }
            e.exports = t, e.exports.__esModule = !0, e.exports.default = e.exports
        },
        687: function (e, t, r) {
            var n = r(61)();
            e.exports = n;
            try {
                regeneratorRuntime = n
            } catch (e) {
                "object" == typeof globalThis ? globalThis.regeneratorRuntime = n : Function("r", "regeneratorRuntime = r")(n)
            }
        }
    },
        t = {};

    function r(n) {
        var o = t[n];
        if (void 0 !== o) return o.exports;
        var i = t[n] = {
            exports: {}
        };
        return e[n](i, i.exports, r), i.exports
    }
    r.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return r.d(t, {
            a: t
        }), t
    }, r.d = function (e, t) {
        for (var n in t) r.o(t, n) && !r.o(e, n) && Object.defineProperty(e, n, {
            enumerable: !0,
            get: t[n]
        })
    }, r.g = function () {
        if ("object" == typeof globalThis) return globalThis;
        try {
            return this || new Function("return this")()
        } catch (e) {
            if ("object" == typeof window) return window
        }
    }(), r.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    },
        function () {
            "use strict";
            ! function (e) {
                if ("performance" in e || (e.performance = {}), !("now" in e.performance)) {
                    var t = Date.now();
                    e.performance = {
                        now: function () {
                            return Date.now() - t
                        }
                    }
                }
            }(self)
        }(),
        function () {
            "use strict";
            var e, t, n, o;
            ! function (e) {
                e.GENERIC = "Error", e.NOT_SUPPORTED = "ErrorNotSupported", e.NO_SOURCE = "ErrorNoSource", e.INVALID_DATA = "ErrorInvalidData", e.INVALID_STATE = "ErrorInvalidState", e.INVALID_PARAMETER = "ErrorInvalidParameter", e.TIMEOUT = "ErrorTimeout", e.NETWORK = "ErrorNetwork", e.NETWORK_IO = "ErrorNetworkIO", e.AUTHORIZATION = "ErrorAuthorization", e.NOT_AVAILABLE = "ErrorNotAvailable"
            }(e || (e = {})),
                function (e) {
                    e[e.GEOBLOCKED = 1] = "GEOBLOCKED", e[e.UNSUPPORTED_DEVICE = 2] = "UNSUPPORTED_DEVICE", e[e.ANONYMIZER_BLOCKED = 3] = "ANONYMIZER_BLOCKED", e[e.CELLULAR_NETWORK_PROHIBITED = 4] = "CELLULAR_NETWORK_PROHIBITED", e[e.UNAUTHORIZATION_ENTITLEMENTS = 5] = "UNAUTHORIZATION_ENTITLEMENTS", e[e.VOD_RESTRICTED = 6] = "VOD_RESTRICTED"
                }(t || (t = {})),
                function (e) {
                    e.INITIALIZED = "PlayerInitialized", e.QUALITY_CHANGED = "PlayerQualityChanged", e.DURATION_CHANGED = "PlayerDurationChanged", e.VOLUME_CHANGED = "PlayerVolumeChanged", e.MUTED_CHANGED = "PlayerMutedChanged", e.PLAYBACK_RATE_CHANGED = "PlayerPlaybackRateChanged", e.REBUFFERING = "PlayerRebuffering", e.AUDIO_BLOCKED = "PlayerAudioBlocked", e.PLAYBACK_BLOCKED = "PlayerPlaybackBlocked", e.ERROR = "PlayerError", e.RECOVERABLE_ERROR = "PlayerRecoverableError", e.ANALYTICS_EVENT = "PlayerAnalyticsEvent", e.TIME_UPDATE = "PlayerTimeUpdate", e.BUFFER_UPDATE = "PlayerBufferUpdate", e.SEEK_COMPLETED = "PlayerSeekCompleted", e.SESSION_DATA = "PlayerSessionData", e.STATE_CHANGED = "PlayerStateChanged", e.WORKER_ERROR = "PlayerWorkerError", e.METADATA = "PlayerMetadata", e.TEXT_CUE = "PlayerTextCue", e.TEXT_METADATA_CUE = "PlayerTextMetadataCue", e.AD_CUE = "PlayerAdCue", e.STREAM_SOURCE_CUE = "PlayerStreamSourceCue", e.NETWORK_UNAVAILABLE = "PlayerNetworkUnavailable", e.SEGMENT_DISCONTINUITY = "PlayerSegmentDiscontinuity", e.SEGMENT_METADATA = "PlayerSegmentMetadata"
                }(n || (n = {})),
                function (e) {
                    e[e.STATE_CHANGED = 0] = "STATE_CHANGED", e[e.CONFIGURE = 1] = "CONFIGURE", e[e.RESET = 2] = "RESET", e[e.ADD_CUE = 3] = "ADD_CUE", e[e.GET_DECODE_INFO = 4] = "GET_DECODE_INFO", e[e.MEDIA_SINK_RPC = 5] = "MEDIA_SINK_RPC", e[e.GET_EXPERIMENTS = 6] = "GET_EXPERIMENTS", e[e.LOG_MESSAGE = 7] = "LOG_MESSAGE", e[e.DATA_CHANNEL_CREATE = 8] = "DATA_CHANNEL_CREATE", e[e.DATA_CHANNEL_CLOSE = 9] = "DATA_CHANNEL_CLOSE", e[e.DATA_CHANNEL_SEND = 10] = "DATA_CHANNEL_SEND", e[e.RTC_SET_REMOTE_DESCRIPTION = 11] = "RTC_SET_REMOTE_DESCRIPTION", e[e.PROPERTY_CHANGED = 12] = "PROPERTY_CHANGED", e[e.BUFFERED_RANGES = 13] = "BUFFERED_RANGES", e[e.DESTROY = 14] = "DESTROY"
                }(o || (o = {}));
            var i = setTimeout;

            function a(e) {
                return Boolean(e && void 0 !== e.length)
            }

            function s() { }

            function u(e) {
                if (!(this instanceof u)) throw new TypeError("Promises must be constructed via new");
                if ("function" != typeof e) throw new TypeError("not a function");
                this._state = 0, this._handled = !1, this._value = void 0, this._deferreds = [], p(e, this)
            }

            function c(e, t) {
                for (; 3 === e._state;) e = e._value;
                0 !== e._state ? (e._handled = !0, u._immediateFn((function () {
                    var r = 1 === e._state ? t.onFulfilled : t.onRejected;
                    if (null !== r) {
                        var n;
                        try {
                            n = r(e._value)
                        } catch (e) {
                            return void f(t.promise, e)
                        }
                        l(t.promise, n)
                    } else (1 === e._state ? l : f)(t.promise, e._value)
                }))) : e._deferreds.push(t)
            }

            function l(e, t) {
                try {
                    if (t === e) throw new TypeError("A promise cannot be resolved with itself.");
                    if (t && ("object" == typeof t || "function" == typeof t)) {
                        var r = t.then;
                        if (t instanceof u) return e._state = 3, e._value = t, void d(e);
                        if ("function" == typeof r) return void p((n = r, o = t, function () {
                            n.apply(o, arguments)
                        }), e)
                    }
                    e._state = 1, e._value = t, d(e)
                } catch (t) {
                    f(e, t)
                }
                var n, o
            }

            function f(e, t) {
                e._state = 2, e._value = t, d(e)
            }

            function d(e) {
                2 === e._state && 0 === e._deferreds.length && u._immediateFn((function () {
                    e._handled || u._unhandledRejectionFn(e._value)
                }));
                for (var t = 0, r = e._deferreds.length; t < r; t++) c(e, e._deferreds[t]);
                e._deferreds = null
            }

            function h(e, t, r) {
                this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof t ? t : null, this.promise = r
            }

            function p(e, t) {
                var r = !1;
                try {
                    e((function (e) {
                        r || (r = !0, l(t, e))
                    }), (function (e) {
                        r || (r = !0, f(t, e))
                    }))
                } catch (e) {
                    if (r) return;
                    r = !0, f(t, e)
                }
            }
            u.prototype.catch = function (e) {
                return this.then(null, e)
            }, u.prototype.then = function (e, t) {
                var r = new this.constructor(s);
                return c(this, new h(e, t, r)), r
            }, u.prototype.finally = function (e) {
                var t = this.constructor;
                return this.then((function (r) {
                    return t.resolve(e()).then((function () {
                        return r
                    }))
                }), (function (r) {
                    return t.resolve(e()).then((function () {
                        return t.reject(r)
                    }))
                }))
            }, u.all = function (e) {
                return new u((function (t, r) {
                    if (!a(e)) return r(new TypeError("Promise.all accepts an array"));
                    var n = Array.prototype.slice.call(e);
                    if (0 === n.length) return t([]);
                    var o = n.length;

                    function i(e, a) {
                        try {
                            if (a && ("object" == typeof a || "function" == typeof a)) {
                                var s = a.then;
                                if ("function" == typeof s) return void s.call(a, (function (t) {
                                    i(e, t)
                                }), r)
                            }
                            n[e] = a, 0 == --o && t(n)
                        } catch (e) {
                            r(e)
                        }
                    }
                    for (var s = 0; s < n.length; s++) i(s, n[s])
                }))
            }, u.allSettled = function (e) {
                return new this((function (t, r) {
                    if (!e || void 0 === e.length) return r(new TypeError(typeof e + " " + e + " is not iterable(cannot read property Symbol(Symbol.iterator))"));
                    var n = Array.prototype.slice.call(e);
                    if (0 === n.length) return t([]);
                    var o = n.length;

                    function i(e, r) {
                        if (r && ("object" == typeof r || "function" == typeof r)) {
                            var a = r.then;
                            if ("function" == typeof a) return void a.call(r, (function (t) {
                                i(e, t)
                            }), (function (r) {
                                n[e] = {
                                    status: "rejected",
                                    reason: r
                                }, 0 == --o && t(n)
                            }))
                        }
                        n[e] = {
                            status: "fulfilled",
                            value: r
                        }, 0 == --o && t(n)
                    }
                    for (var a = 0; a < n.length; a++) i(a, n[a])
                }))
            }, u.resolve = function (e) {
                return e && "object" == typeof e && e.constructor === u ? e : new u((function (t) {
                    t(e)
                }))
            }, u.reject = function (e) {
                return new u((function (t, r) {
                    r(e)
                }))
            }, u.race = function (e) {
                return new u((function (t, r) {
                    if (!a(e)) return r(new TypeError("Promise.race accepts an array"));
                    for (var n = 0, o = e.length; n < o; n++) u.resolve(e[n]).then(t, r)
                }))
            }, u._immediateFn = "function" == typeof setImmediate && function (e) {
                setImmediate(e)
            } || function (e) {
                i(e, 0)
            }, u._unhandledRejectionFn = function (e) {
                "undefined" != typeof console && console && console.warn("Possible Unhandled Promise Rejection:", e)
            };
            var v, y = u,
                m = ("undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== r.g ? r.g : void 0).Promise || y,
                g = function () {
                    function e() {
                        this.buffer = void 0, this.head = void 0, this.tail = void 0, this.buffer = [], this.head = 0, this.tail = 0
                    }
                    var t = e.prototype;
                    return t.push = function (e) {
                        this.tail === this.buffer.length ? this.buffer.push(e) : this.buffer[this.tail] = e, this.tail++
                    }, t.pop = function () {
                        var e, t = null != (e = this.buffer[this.head]) ? e : null;
                        return this.buffer[this.head] = null, this.head++, this.empty() && (this.head = 0, this.tail = 0), t
                    }, t.size = function () {
                        return this.tail - this.head
                    }, t.empty = function () {
                        return this.head >= this.tail
                    }, e
                }();
            ! function (e) {
                e[e.Readable = 0] = "Readable", e[e.Closed = 1] = "Closed", e[e.Errored = 2] = "Errored"
            }(v || (v = {}));
            var E = function () {
                function e(e) {
                    this.state = void 0, this.queuedChunks = void 0, this.readRequest = void 0, this.storedError = void 0, this.onCancel = void 0, this.state = v.Readable, this.queuedChunks = new g, this.readRequest = null, this.storedError = null, this.onCancel = e
                }
                var t = e.prototype;
                return t.read = function () {
                    var t = this;
                    switch (this.state) {
                        case v.Readable:
                            return this.queuedChunks.empty() ? new m((function (e, r) {
                                t.readRequest = {
                                    resolve: e,
                                    reject: r
                                }
                            })) : this.queuedChunks.pop();
                        case v.Closed:
                            return this.queuedChunks.empty() ? m.resolve(e.DONE_CHUNK) : this.queuedChunks.pop();
                        case v.Errored:
                            return m.reject(this.storedError)
                    }
                }, t.cancel = function () {
                    this.onCancel(), this.close()
                }, t.error = function (e) {
                    this.state === v.Readable && (this.state = v.Errored, this.storedError = e, this.readRequest && (this.readRequest.reject(e), this.readRequest = null), this.queuedChunks = new g)
                }, t.write = function (e) {
                    if (this.state === v.Readable) {
                        var t = {
                            done: !1,
                            value: e
                        };
                        this.readRequest ? (this.readRequest.resolve(t), this.readRequest = null) : this.queuedChunks.push(m.resolve(t))
                    }
                }, t.close = function () {
                    this.state === v.Readable && (this.readRequest && (this.readRequest.resolve(e.DONE_CHUNK), this.readRequest = null), this.state = v.Closed)
                }, e
            }();
            E.DONE_CHUNK = {
                done: !0,
                value: void 0
            };
            var b = function () {
                function e(e, t) {
                    this.reader = void 0, this.reader = new E(e.abort.bind(e)), this.initReadableStreamShim(e, t)
                }
                var t = e.prototype;
                return t.getReader = function () {
                    return this.reader
                }, t.initReadableStreamShim = function (e, t) {
                    var r = this;
                    switch (e.responseType = t, t) {
                        case "moz-chunked-arraybuffer":
                            e.addEventListener("progress", (function () {
                                r.reader.write(new Uint8Array(e.response))
                            })), e.addEventListener("load", this.reader.close.bind(this.reader));
                            break;
                        case "ms-stream":
                            e.addEventListener("readystatechange", (function () {
                                if (e.readyState === e.LOADING) {
                                    var t = new self.MSStreamReader,
                                        n = 0;
                                    t.onprogress = function () {
                                        t.result.byteLength > n && (r.reader.write(new Uint8Array(t.result, n)), n = t.result.byteLength)
                                    }, t.onload = r.reader.close.bind(r.reader), t.readAsArrayBuffer(e.response)
                                }
                            }));
                            break;
                        case "arraybuffer":
                            e.addEventListener("progress", this.reader.write.bind(this.reader, new Uint8Array(0))), e.addEventListener("load", (function () {
                                e.response && r.reader.write(new Uint8Array(e.response)), r.reader.close()
                            }))
                    }
                }, e
            }(),
                w = self.fetch && self.ReadableStream ? self.fetch.bind(self) : function (e, t) {
                    return void 0 === t && (t = {}), new m((function (r, n) {
                        var o = new XMLHttpRequest;
                        for (var i in o.open(t.method || "GET", e), t.headers) Object.prototype.hasOwnProperty.call(t.headers, i) && o.setRequestHeader(i, t.headers[i]);
                        "include" === t.credentials && (o.withCredentials = !0);
                        var a = new b(o, T);
                        o.addEventListener("readystatechange", (function e() {
                            2 === o.readyState && (o.removeEventListener("readystatechange", e), r(new _(o, a)))
                        })), t.signal && (t.signal.onabort = function () {
                            o.abort();
                            var e = new Error("request aborted");
                            e.name = "AbortError", a.getReader().error(e), n(e)
                        }), o.addEventListener("error", (function () {
                            var e = new Error("network error");
                            a.getReader().error(e), n(e)
                        })), o.send(t.body || null)
                    }))
                },
                T = self.fetch && self.ReadableStream ? "arraybuffer" : S("moz-chunked-arraybuffer") || S("ms-stream") || "arraybuffer",
                _ = function (e, t) {
                    this.body = void 0, this.status = void 0, this.headers = void 0, this.body = t, this.status = e.status, this.headers = new C(e)
                },
                C = function () {
                    function e(e) {
                        this.xhr = void 0, this.xhr = e
                    }
                    var t = e.prototype;
                    return t.has = function (e) {
                        return null !== this.xhr.getResponseHeader(e)
                    }, t.get = function (e) {
                        return this.xhr.getResponseHeader(e)
                    }, e
                }();

            function S(e) {
                try {
                    var t = new XMLHttpRequest;
                    return t.open("GET", "https://twitch.tv"), t.responseType = e, t.responseType === e ? e : ""
                } catch (e) {
                    return ""
                }
            }
            var k, A, R = function () {
                function e(e, t) {
                    this.cancelled = void 0, this.module = void 0, this.pendingAbort = void 0, this.response = void 0, this.reader = void 0, this.abortController = void 0, this.cancelled = !1, this.module = e, this.pendingAbort = !1, this.response = null, this.reader = null, this.abortController = t, this.readBody = this.readBody.bind(this)
                }
                var t = e.prototype;
                return t.setResponse = function (e) {
                    this.response = e, this.pendingAbort && (this.pendingAbort = !1, this.getReader().cancel())
                }, t.abort = function () {
                    this.response ? this.getReader().cancel() : this.abortController ? this.abortController.abort() : this.pendingAbort = !0
                }, t.cancel = function () {
                    this.cancelled = !0, this.abort()
                }, t.getHeader = function (e) {
                    var t, r;
                    return null != (t = this.response) && t.headers.has(e) && null != (r = this.response.headers.get(e)) ? r : ""
                }, t.getStatus = function () {
                    var e, t;
                    return null != (e = null == (t = this.response) ? void 0 : t.status) ? e : 0
                }, t.readBody = function (e, t) {
                    var r = this,
                        n = performance.now(),
                        o = t > 0 ? self.setTimeout((function i() {
                            var a = performance.now() - n;
                            a < t && t > 0 ? o = self.setTimeout(i, t - a) : (r.abort(), e.error(!0, "Read response timeout"))
                        }), t) : -1;
                    this.getReader().read().then((function t(o) {
                        var i = o.done,
                            a = o.value;
                        if (!r.cancelled) {
                            if (!i) {
                                var s = null == a ? void 0 : a.byteLength;
                                return s && e.read(r.module.copyUint8ArrayToEmscriptenHeap(a), s), n = performance.now(), r.getReader().read().then(t)
                            }
                            e.end()
                        }
                    })).catch((function (t) {
                        console.error("HTTP Read Error:", t), e.error(!1, t.message)
                    })).then((function () {
                        -1 !== o && clearTimeout(o), e.delete()
                    }))
                }, t.getReader = function () {
                    if (!this.reader) try {
                        this.reader = this.response.body.getReader()
                    } catch (e) {
                        this.reader = new P
                    }
                    return this.reader
                }, e
            }(),
                P = function () {
                    function e() {
                        this.closed = void 0, this.closed = m.resolve()
                    }
                    var t = e.prototype;
                    return t.read = function () {
                        return m.resolve({
                            done: !0
                        })
                    }, t.cancel = function () {
                        return m.resolve()
                    }, t.releaseLock = function () { }, e
                }();

            function O() {
                return O = Object.assign ? Object.assign.bind() : function (e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var r = arguments[t];
                        for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
                    }
                    return e
                }, O.apply(this, arguments)
            }

            function D(e, t) {
                for (var r = 0; r < t.length; r++) {
                    var n = t[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
                }
            }

            function $(e, t, r) {
                return t && D(e.prototype, t), r && D(e, r), Object.defineProperty(e, "prototype", {
                    writable: !1
                }), e
            }

            function M(e, t) {
                return M = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (e, t) {
                    return e.__proto__ = t, e
                }, M(e, t)
            } ! function (e) {
                e.ID3 = "MetaID3", e.CAPTION = "MetaCaption"
            }(k || (k = {})),
                function (e) {
                    e.METADATA_ID = "metadata.live-video.net", e.INBAND_METADATA_ID = "inband.metadata.live-video.net"
                }(A || (A = {}));
            var I = 1 << 30,
                N = {
                    audio: 1936684398,
                    video: 1986618469
                };

            function x(e, t, r) {
                return e.addEventListener(t, r),
                    function () {
                        e.removeEventListener(t, r)
                    }
            }
            var j = function () {
                function e(e, t, r, n, o) {
                    this.rawCodec = t, this.group = r, this.isProtected = n, this.onError = o, this.pending = void 0, this.unsubscribers = [], this.srcBuf = void 0, this.blocked = !1, this.srcBuf = e, this.pending = new g, this.unsubscribers.push(x(e, "updateend", this.process.bind(this)))
                }
                var t = e.prototype;
                return t.getBufferedRanges = function () {
                    try {
                        var e = [];
                        if (this.srcBuf)
                            for (var t = this.srcBuf.buffered, r = 0; r < t.length; r++) e.push({
                                start: t.start(r),
                                end: t.end(r)
                            });
                        return e
                    } catch (e) {
                        return []
                    }
                }, t.abort = function () {
                    this.schedule((function (e) {
                        e.abort()
                    }))
                }, t.appendBuffer = function (e) {
                    this.schedule((function (t) {
                        try {
                            t.appendBuffer(e)
                        } catch (e) {
                            if ("QuotaExceededError" !== e.name) throw e;
                            var r = t.buffered,
                                n = r.start(0),
                                o = r.end(r.length - 1),
                                i = (n + o) / 2;
                            t.remove(i, o)
                        }
                    }))
                }, t.setTimestampOffset = function (e) {
                    this.schedule((function (t) {
                        t.timestampOffset = e
                    }))
                }, t.remove = function (e, t) {
                    this.schedule((function (r) {
                        var n = r.buffered;
                        if (n.length) {
                            var o = Math.max(e, n.start(0)),
                                i = Math.min(t, n.end(n.length - 1));
                            o < i && r.remove(o, i)
                        }
                    }))
                }, t.block = function () {
                    var e = this;
                    return new Promise((function (t) {
                        e.schedule((function () {
                            e.blocked = !0, t()
                        }))
                    }))
                }, t.unblock = function () {
                    this.blocked = !1, this.process()
                }, t.destroy = function () {
                    this.pending = new g, this.unsubscribers.forEach((function (e) {
                        return e()
                    })), this.srcBuf = void 0
                }, t.schedule = function (e) {
                    this.pending.empty() && this.canProcess() ? this.safeExecute(e) : (this.pending.push(e), this.process())
                }, t.safeExecute = function (e) {
                    try {
                        if (!this.srcBuf) throw new Error("srcBuf is undefined");
                        e(this.srcBuf)
                    } catch (e) {
                        this.onError(e, !1)
                    }
                }, t.process = function () {
                    for (; !this.pending.empty() && this.canProcess();) this.safeExecute(this.pending.pop())
                }, t.canProcess = function () {
                    return !(!this.srcBuf || this.srcBuf.updating || this.blocked)
                }, $(e, [{
                    key: "buffer",
                    get: function () {
                        return this.srcBuf
                    }
                }, {
                    key: "codec",
                    get: function () {
                        return this.rawCodec
                    }
                }, {
                    key: "timestampOffset",
                    get: function () {
                        return this.buffer ? this.buffer.timestampOffset : 0
                    }
                }]), e
            }(),
                L = function () {
                    function e(e, t, r) {
                        this.mediaSource = e, this.onEnded = t, this.onError = r, this.sourceBuffers = Object.create(null), this.unsubscribers = [], this.unsubscribers.push(x(e, "sourceended", this.onEnded))
                    }
                    e.isSupported = function () {
                        return void 0 !== self.MediaSource
                    }, e.isSupportedInWorker = function () {
                        return e.isSupported() && MediaSource.canConstructInDedicatedWorker && "function" == typeof MediaSourceHandle
                    }, e.create = function (t, r) {
                        var n = new MediaSource,
                            o = new Promise((function (o, i) {
                                var a = x(n, "sourceopen", (function () {
                                    "open" === n.readyState ? (o(new e(n, t, r)), a()) : i("The MediaSource was closed upon opening")
                                }))
                            }));
                        return {
                            ms: n,
                            sink: o
                        }
                    };
                    var t = e.prototype;
                    return t.getBufferedRanges = function (e) {
                        var t, r;
                        return null != (t = null == (r = this.sourceBuffers[N[e]]) ? void 0 : r.getBufferedRanges()) ? t : []
                    }, t.addTrack = function (e, t, r, n) {
                        var o, i = this.mediaSource,
                            a = this.sourceBuffers;
                        if (a[e]) return null != (o = a[e].buffer) ? o : null;
                        try {
                            var s = i.addSourceBuffer("video/mp4;" + t);
                            return a[e] = new j(s, t, r, n, this.handleError.bind(this)), s
                        } catch (e) {
                            this.handleError(e, "open" === i.readyState)
                        }
                        return null
                    }, t.append = function (e, t) {
                        var r;
                        null == (r = this.sourceBuffers[e]) || r.appendBuffer(t)
                    }, t.remove = function (e, t) {
                        for (var r = this.sourceBuffers, n = 0, o = Object.keys(r); n < o.length; n++) r[o[n]].remove(e, t)
                    }, t.setTimestampOffset = function (e, t) {
                        var r = this.sourceBuffers[e];
                        r && (r.abort(), r.setTimestampOffset(t))
                    }, t.setDuration = function (e) {
                        var t = this;
                        this.scheduleUpdate((function () {
                            return t.mediaSource.duration = e
                        })).catch((function (e) {
                            return t.handleError(e, !1)
                        }))
                    }, t.setLiveSeekableRange = function (e, t) {
                        var r = this;
                        this.scheduleUpdate((function () {
                            return r.mediaSource.setLiveSeekableRange(e, t)
                        })).catch((function (e) {
                            return r.handleError(e, !1)
                        }))
                    }, t.scheduleUpdate = function (e) {
                        var t = this;
                        void 0 === e && (e = U);
                        var r = Object.keys(this.sourceBuffers).map((function (e) {
                            return t.sourceBuffers[e]
                        }));
                        return Promise.all(r.map((function (e) {
                            return e.block()
                        }))).then(e).then((function () {
                            return r.forEach((function (e) {
                                return e.unblock()
                            }))
                        }))
                    }, t.destroy = function () {
                        this.destroySourceBuffers(), this.unsubscribers.forEach((function (e) {
                            return e()
                        })), this.unsubscribers = []
                    }, t.handleError = function (e, t) {
                        var r = e.code || 102,
                            n = 102;
                        "NotSupportedError" === e.name && (n = r = 4), this.onError(n, r, e.message, t)
                    }, t.destroySourceBuffers = function () {
                        for (var e = this.mediaSource; e.sourceBuffers.length > 0;) try {
                            e.removeSourceBuffer(e.sourceBuffers[0])
                        } catch (e) {
                            this.handleError(e, !1);
                            break
                        }
                        for (var t = 0, r = Object.keys(this.sourceBuffers); t < r.length; t++) {
                            var n = r[t];
                            this.sourceBuffers[n].destroy()
                        }
                        this.sourceBuffers = Object.create(null)
                    }, $(e, [{
                        key: "duration",
                        get: function () {
                            return this.mediaSource.duration
                        }
                    }, {
                        key: "bufferProperties",
                        get: function () {
                            var e = this.sourceBuffers;
                            return Object.keys(e).map((function (t) {
                                var r = e[t];
                                return {
                                    trackID: Number(t),
                                    codec: r.codec,
                                    mode: "mse",
                                    path: "",
                                    isProtected: r.isProtected,
                                    group: r.group,
                                    srcObj: null
                                }
                            }))
                        }
                    }]), e
                }(),
                U = function () { },
                F = function (e) {
                    var t, r;

                    function n(t, r) {
                        var n;
                        return (n = e.call(this) || this).sendMessageToClient = t, n.sendMessageToCore = r, n.mseSink = void 0, n.awaitSink = void 0, n.sendRPC = void 0, n.nativeControlsEnabled = !1, n.resolveIdleDeferral = void 0, n.paused = !0, n.sendRPC = t.bind(function (e) {
                            if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                            return e
                        }(n), o.MEDIA_SINK_RPC), n.awaitSink = void 0, n
                    }
                    r = e, (t = n).prototype = Object.create(r.prototype), t.prototype.constructor = t, M(t, r);
                    var i = n.prototype;
                    return i.invoke = function (e, t) {
                        var r = this.awaitSink,
                            n = this.mseSink;
                        r && n ? ["enqueue", "addTrack", "setTimestampOffset"].includes(e.name) ? this.invokeAsync(e) : this.invokeSync(e) : r ? this.invokeAsync(e) : n ? this.invokeSync(e) : this.sendRPC(e, t)
                    }, i.configure = function (e) {
                        var t = this,
                            r = this.awaitSink,
                            n = this.mseSink,
                            i = e.mode,
                            a = e.isProtected;
                        if ("mse-worker" === i) {
                            if (!n && !r) {
                                console.info("MSE in workers enabled");
                                var s = L.create(this.onMediaSourceEnded.bind(this), this.onMediaSourceError.bind(this)),
                                    u = s.ms.handle;
                                this.sendMessageToClient(o.CONFIGURE, O({}, e, {
                                    srcObj: u
                                }), [u]), this.awaitSink = new m((function (e, r) {
                                    s.sink.then((function (r) {
                                        t.handleCreateSuccess(r), e()
                                    })).catch((function (e) {
                                        t.handleCreateError(e), r()
                                    }))
                                }))
                            }
                            this.isContentProtectionChanging(a) && !this.awaitSink && (this.awaitSink = new m((function (e, r) {
                                t.deferUntilIdle().then((function () {
                                    var e = L.create(t.onMediaSourceEnded.bind(t), t.onMediaSourceError.bind(t));
                                    return t.changeSrcObj(e.ms.handle), e.sink
                                })).then((function (r) {
                                    t.destroyMSESink(), t.handleCreateSuccess(r), t.play(), e()
                                })).catch((function (e) {
                                    t.handleCreateError(e), r()
                                }))
                            }))), e.isProtected && this.sendMessageToClient(o.CONFIGURE, e), this.invoke({
                                name: "addTrack",
                                arg: O({}, W, e)
                            })
                        } else this.sendMessageToClient(o.CONFIGURE, e)
                    }, i.addTrack = function (e) {
                        var t = e.trackID,
                            r = e.codec,
                            n = e.group,
                            o = e.isProtected;
                        this.mseSink.addTrack(t, r, n, o)
                    }, i.enqueue = function (e) {
                        var t = e.trackID,
                            r = e.buffer;
                        this.mseSink.append(t, r)
                    }, i.remove = function (e) {
                        var t = e.start,
                            r = e.end;
                        this.mseSink.remove(t, r)
                    }, i.setTimestampOffset = function (e) {
                        var t = e.trackID,
                            r = e.offset;
                        this.mseSink.setTimestampOffset(t, r)
                    }, i.onSourceDurationChanged = function (e) {
                        var t = this.mseSink,
                            r = t.duration,
                            n = function (e, t, r) {
                                var n = e;
                                return e === 1 / 0 || e === I ? r ? n = 1 / 0 : r || (n = I) : e !== t && (n = e), n
                            }(e, r, this.nativeControlsEnabled);
                        n !== r && t.setDuration(n)
                    }, i.play = function () {
                        var e = this;
                        this.paused = !1, this.mseSink.scheduleUpdate().then((function () {
                            return e.sendRPC({
                                name: "play",
                                arg: void 0
                            })
                        }))
                    }, i.pause = function () {
                        var e = this;
                        this.paused = !0, this.mseSink.scheduleUpdate().then((function () {
                            return e.sendRPC({
                                name: "pause",
                                arg: void 0
                            })
                        }))
                    }, i.seekTo = function (e) {
                        var t = this;
                        this.mseSink.scheduleUpdate().then((function () {
                            return t.sendRPC({
                                name: "seekTo",
                                arg: e
                            })
                        }))
                    }, i.setVolume = function (e) {
                        this.sendRPC({
                            name: "setVolume",
                            arg: e
                        })
                    }, i.setMuted = function (e) {
                        this.sendRPC({
                            name: "setMuted",
                            arg: e
                        })
                    }, i.setPlaybackRate = function (e) {
                        this.sendRPC({
                            name: "setPlaybackRate",
                            arg: e
                        })
                    }, i.endOfStream = function () {
                        var e = this;
                        this.mseSink.scheduleUpdate().then((function () {
                            return e.sendRPC({
                                name: "endOfStream",
                                arg: void 0
                            })
                        }))
                    }, i.changeSrcObj = function (e) {
                        this.sendRPC({
                            name: "changeSrcObj",
                            arg: e
                        }, [e])
                    }, i.unblockIfWaitingForIdle = function () {
                        var e;
                        null == (e = this.resolveIdleDeferral) || e.call(this), this.resolveIdleDeferral = void 0
                    }, i.reset = function () {
                        this.destroyMSESink(), this.sendMessageToClient(o.RESET)
                    }, i.delete = function () {
                        this.destroyMSESink(), this.sendMessageToClient(o.DESTROY)
                    }, i.invokeSync = function (e) {
                        this[e.name].call(this, e.arg)
                    }, i.invokeAsync = function (e) {
                        var t = this;
                        this.awaitSink.then((function () {
                            return t.invokeSync(e)
                        })).catch((function () { }))
                    }, i.isContentProtectionChanging = function (e) {
                        var t = this.awaitSink,
                            r = this.mseSink;
                        if (!r || t) return !1;
                        var n = r.bufferProperties;
                        return !!n.length && n.some((function (t) {
                            return t.isProtected !== e
                        }))
                    }, i.handleCreateSuccess = function (e) {
                        this.mseSink = e, this.awaitSink = void 0, this.onSourceDurationChanged(I), this.mseSink.setLiveSeekableRange(0, I)
                    }, i.handleCreateError = function (e) {
                        this.sendMessageToCore("onClientSinkError", [4, 4, e.toString()]), this.awaitSink = void 0
                    }, i.deferUntilIdle = function () {
                        var e = this,
                            t = this.mseSink;
                        return new m((function (r) {
                            t && !e.paused ? e.resolveIdleDeferral = r : r()
                        }))
                    }, i.onMediaSourceError = function (e, t, r, n) {
                        var o = [e, t, r];
                        r.includes("HTMLMediaElement.error") && (n = !0, this.destroyMSESink()), n ? this.sendMessageToCore("onClientSinkError", o) : this.sendMessageToCore("onClientSinkRecoverableError", o)
                    }, i.onMediaSourceEnded = function () {
                        this.destroyMSESink(), this.sendMessageToCore("onClientSinkReset", void 0)
                    }, i.destroyMSESink = function () {
                        var e = this,
                            t = function () {
                                e.mseSink.destroy(), e.awaitSink = void 0, e.mseSink = void 0, e.paused = !0
                            };
                        this.mseSink ? t() : this.awaitSink && this.awaitSink.then((function () {
                            return t()
                        }))
                    }, $(n, [{
                        key: "controls",
                        set: function (e) {
                            this.nativeControlsEnabled = e, this.mseSink && this.invoke({
                                name: "onSourceDurationChanged",
                                arg: this.mseSink.duration
                            })
                        }
                    }]), n
                }(function () {
                    function e() { }
                    var t = e.prototype;
                    return t.addTrack = function (e) { }, t.bufferDuration = function () {
                        return 0
                    }, t.buffered = function () {
                        return {
                            start: 0,
                            end: 0
                        }
                    }, t.getBufferedRanges = function (e) {
                        return []
                    }, t.captureGesture = function () { }, t.configure = function (e) { }, t.decodedFrames = function () {
                        return 0
                    }, t.delete = function () { }, t.droppedFrames = function () {
                        return 0
                    }, t.endOfStream = function () { }, t.enqueue = function (e) { }, t.framerate = function () {
                        return 0
                    }, t.getCurrentTime = function () {
                        return 0
                    }, t.getDisplayHeight = function () {
                        return 0
                    }, t.getDisplayWidth = function () {
                        return 0
                    }, t.getPlaybackRate = function () {
                        return 0
                    }, t.getVolume = function () {
                        return 0
                    }, t.invoke = function (e) {
                        this[e.name].call(this, e.arg)
                    }, t.isMuted = function () {
                        return !1
                    }, t.onSourceDurationChanged = function (e) { }, t.pause = function () { }, t.play = function () { }, t.reinit = function () { }, t.remove = function (e) { }, t.seekTo = function (e) { }, t.setMuted = function (e) { }, t.setPlaybackRate = function (e) { }, t.setTimestampOffset = function (e) { }, t.setVolume = function (e) { }, t.changeSrc = function (e) { }, t.changeSrcObj = function (e) { }, t.onSegmentDiscontinuity = function () { }, e
                }()),
                W = {
                    trackID: 0,
                    codec: "",
                    mode: "mse-worker",
                    isProtected: !1,
                    path: "",
                    group: "",
                    srcObj: null
                };

            function B(e, t, r, n, o, i, a) {
                try {
                    var s = e[i](a),
                        u = s.value
                } catch (e) {
                    return void r(e)
                }
                s.done ? t(u) : Promise.resolve(u).then(n, o)
            }

            function G(e) {
                return function () {
                    var t = this,
                        r = arguments;
                    return new Promise((function (n, o) {
                        var i = e.apply(t, r);

                        function a(e) {
                            B(i, n, o, a, s, "next", e)
                        }

                        function s(e) {
                            B(i, n, o, a, s, "throw", e)
                        }
                        a(void 0)
                    }))
                }
            }
            var H = r(687),
                V = r.n(H),
                Y = function () {
                    function e(e, t) {
                        this.pointerReferenceValidSet = void 0, this.module = void 0, this.webTransport = void 0, this.listener = void 0, this.closed = void 0, this.blockOnWrite = void 0, this.closed = !1, this.module = e, this.listener = t, this.pointerReferenceValidSet = new Set, this.blockOnWrite = Promise.resolve()
                    }
                    var t = e.prototype;
                    return t.connectWebTransport = function () {
                        var e = G(V().mark((function e(t) {
                            var r = this;
                            return V().wrap((function (e) {
                                for (; ;) switch (e.prev = e.next) {
                                    case 0:
                                        return this.webTransport = new WebTransport(t.replace("quic-transport://", "https://")), this.webTransport.closed.then((function (e) {
                                            r.closed || (r.closed = !0, r.listener.onClosed(e.errorCode, e.reason))
                                        })).catch((function (e) {
                                            console.warn(e), r.closed || (r.closed = !0, r.listener.onError(1, e.message))
                                        })), e.next = 4, this.webTransport.ready;
                                    case 4:
                                        return this.closed || this.listener.onReady(), e.next = 7, this.setupReceiveStreams();
                                    case 7:
                                    case "end":
                                        return e.stop()
                                }
                            }), e, this)
                        })));
                        return function (t) {
                            return e.apply(this, arguments)
                        }
                    }(), t.setupSendStream = function () {
                        var e = G(V().mark((function e(t) {
                            var r;
                            return V().wrap((function (e) {
                                for (; ;) switch (e.prev = e.next) {
                                    case 0:
                                        return e.prev = 0, e.next = 3, this.webTransport.createUnidirectionalStream();
                                    case 3:
                                        r = e.sent, this.closed || t.onStreamReceived(r), e.next = 11;
                                        break;
                                    case 7:
                                        e.prev = 7, e.t0 = e.catch(0), console.warn(e.t0), this.closed || this.listener.onError(1, e.t0.message);
                                    case 11:
                                    case "end":
                                        return e.stop()
                                }
                            }), e, this, [
                                [0, 7]
                            ])
                        })));
                        return function (t) {
                            return e.apply(this, arguments)
                        }
                    }(), t.getWriter = function (e) {
                        return e.writable ? e.writable.getWriter() : e.getWriter()
                    }, t.closeWriter = function () {
                        var e = G(V().mark((function e(t) {
                            return V().wrap((function (e) {
                                for (; ;) switch (e.prev = e.next) {
                                    case 0:
                                        if (!this.closed) try {
                                            this.blockOnWrite = new Promise((function (e) {
                                                t.close().finally(e)
                                            }))
                                        } catch (e) {
                                            console.error("Error closing writer", e)
                                        }
                                    case 1: case "end": return e.stop()
                                }
                            }), e, this)
                        })));
                        return function (t) {
                            return e.apply(this, arguments)
                        }
                    }(), t.getReader = function (e) {
                        return e.readable ? e.readable.getReader() : e.getReader()
                    }, t.readDataFromReader = function (e, t) {
                        var r = this;
                        this.addReferenceValid(t), e.read().then((function (n) {
                            var o = n.done,
                                i = n.value;
                            if (r.closed) e.cancel();
                            else if (o) !r.closed && r.isReferenceValid(t) && t.onStreamClose(0);
                            else {
                                var a = i.byteLength;
                                if (a > 0) {
                                    var s = r.module.copyUint8ArrayToEmscriptenHeap(i);
                                    r.isReferenceValid(t) && t.onStreamData(s, a)
                                }
                            }
                        })).catch((function (e) {
                            console.warn(e), !r.closed && r.isReferenceValid(t) && t.onStreamClose(1)
                        }))
                    }, t.writeDataToWriter = function () {
                        var e = G(V().mark((function e(t, r) {
                            var n;
                            return V().wrap((function (e) {
                                for (; ;) switch (e.prev = e.next) {
                                    case 0:
                                        if (!this.closed) {
                                            e.next = 2;
                                            break
                                        }
                                        return e.abrupt("return");
                                    case 2:
                                        return e.prev = 2, n = Uint8Array.from(r), e.next = 6, t.ready;
                                    case 6:
                                        if (this.closed) {
                                            e.next = 9;
                                            break
                                        }
                                        return e.next = 9, t.write(n);
                                    case 9:
                                        e.next = 14;
                                        break;
                                    case 11:
                                        e.prev = 11, e.t0 = e.catch(2), console.error("Writing failed", e.t0);
                                    case 14:
                                    case "end":
                                        return e.stop()
                                }
                            }), e, this, [
                                [2, 11]
                            ])
                        })));
                        return function (t, r) {
                            return e.apply(this, arguments)
                        }
                    }(), t.closeWebTransport = function () {
                        var e = G(V().mark((function e(t, r) {
                            return V().wrap((function (e) {
                                for (; ;) switch (e.prev = e.next) {
                                    case 0:
                                        if (void 0 === t && (t = 0), void 0 === r && (r = ""), this.closed) {
                                            e.next = 14;
                                            break
                                        }
                                        return this.closed = !0, e.prev = 4, e.next = 7, this.blockOnWrite;
                                    case 7:
                                        return e.next = 9, this.webTransport.ready;
                                    case 9:
                                        this.webTransport.close({
                                            errorCode: t,
                                            reason: r
                                        }), e.next = 14;
                                        break;
                                    case 12:
                                        e.prev = 12, e.t0 = e.catch(4);
                                    case 14:
                                    case "end":
                                        return e.stop()
                                }
                            }), e, this, [
                                [4, 12]
                            ])
                        })));
                        return function (t, r) {
                            return e.apply(this, arguments)
                        }
                    }(), t.deletePointerReference = function (e) {
                        var t, r = null == e || null == (t = e.$$) ? void 0 : t.ptr;
                        r && this.pointerReferenceValidSet.delete(r)
                    }, t.isReferenceValid = function (e) {
                        var t, r = null == e || null == (t = e.$$) ? void 0 : t.ptr;
                        return r && this.pointerReferenceValidSet.has(r)
                    }, t.addReferenceValid = function (e) {
                        var t, r = null == e || null == (t = e.$$) ? void 0 : t.ptr;
                        r && this.pointerReferenceValidSet.add(r)
                    }, t.setupReceiveStreams = function () {
                        var e = G(V().mark((function e() {
                            var t, r, n, o, i = this;
                            return V().wrap((function (e) {
                                for (; ;) switch (e.prev = e.next) {
                                    case 0:
                                        t = this.webTransport.incomingUnidirectionalStreams, r = t.getReader(), n = function (e) {
                                            console.warn(e), i.closed || (i.closed = !0, i.listener.onError(1, e.message))
                                        }, o = function e(t) {
                                            var o = t.done,
                                                a = t.value;
                                            i.closed ? r.cancel() : o || (i.listener.onStreamReceived(a), r.read().then(e).catch(n))
                                        }, r.read().then(o).catch(n);
                                    case 5:
                                    case "end":
                                        return e.stop()
                                }
                            }), e, this)
                        })));
                        return function () {
                            return e.apply(this, arguments)
                        }
                    }(), e
                }(),
                q = function () {
                    function e(e, t, r, o) {
                        var i = this;
                        this.id = void 0, this.port = void 0, this.module = void 0, this.player = void 0, this.playerFactory = void 0, this.workerSink = new F(this.postMessage.bind(this), this.onClientMessage.bind(this)), this.startCapture = void 0, this.stopCapture = void 0, this.requestCaptureAnalytics = void 0, this.captureEntireSegmentBytes = void 0, this.id = t, this.port = e, this.module = r, this.playerFactory = function (e) {
                            return new i.module.WebMediaPlayer(e, o)
                        }, this.player = this.playerFactory(this), this.postMessage(n.INITIALIZED)
                    }
                    var t = e.prototype;
                    return t.recreatePlayer = function () {
                        this.port.postMessage("recreatePlayer"), this.player = this.playerFactory(this)
                    }, t.getPointer = function () {
                        return this.player.$$.ptr
                    }, t.onClientMessage = function (e, t) {
                        var r;
                        this.applyMessageToSink(e, t), "function" == typeof this.player[e] ? (r = this.player)[e].apply(r, t) : this[e]
                    }, t.getDecodingInfo = function (e) {
                        this.postMessage(o.GET_DECODE_INFO, e)
                    }, t.onExperiments = function (e) {
                        this.postMessage(o.GET_EXPERIMENTS, e)
                    }, t.onSessionData = function (e) {
                        this.postMessage(n.SESSION_DATA, {
                            sessionData: e
                        })
                    }, t.onStateChanged = function (e) {
                        this.postMessage(o.STATE_CHANGED, e)
                    }, t.onSegmentDiscontinuity = function () {
                        this.postMessage(n.SEGMENT_DISCONTINUITY)
                    }, t.onNetworkUnavailable = function () {
                        this.postMessage(n.NETWORK_UNAVAILABLE)
                    }, t.onRebuffering = function () {
                        this.postMessage(n.REBUFFERING)
                    }, t.onQualityChanged = function (e) {
                        this.postMessage(n.QUALITY_CHANGED, e)
                    }, t.onSeekCompleted = function (e) {
                        this.postMessage(n.SEEK_COMPLETED, e)
                    }, t.onDurationChanged = function (e) {
                        this.postMessage(n.DURATION_CHANGED, e), this.workerSink.invoke({
                            name: "onSourceDurationChanged",
                            arg: e
                        })
                    }, t.onBufferedRanges = function (e, t) {
                        this.postMessage(o.BUFFERED_RANGES, {
                            audio: e,
                            video: t
                        })
                    }, t.onJSONMetadata = function (e) {
                        var t, r, n = K(e);
                        "ID3" in n ? (t = k.ID3, r = n.ID3) : "caption" in n && (t = k.CAPTION, r = n.caption), t && this.postMessage(t, r)
                    }, t.onMetadata = function (e, t) {
                        if (t.buffer) {
                            var r = new Uint8Array(t).buffer;
                            this.postMessage(n.METADATA, {
                                type: e,
                                data: r
                            }, [r])
                        } else this.postMessage(n.METADATA, {
                            type: e,
                            data: t
                        })
                    }, t.onCue = function (e) {
                        if ("TextCue" === e.type) this.postMessage(n.TEXT_CUE, e);
                        else if ("TextMetadataCue" === e.type) {
                            var t = e;
                            if (this.postMessage(n.TEXT_METADATA_CUE, e), "segmentmetadata" === t.description && t.text) try {
                                var r = JSON.parse(t.text);
                                void 0 !== r.stream_offset && this.postMessage(n.SEGMENT_METADATA, {
                                    streamOffset: r.stream_offset
                                })
                            } catch (e) { }
                        } else "AdCue" === e.type ? this.postMessage(n.AD_CUE, e) : "StreamSourceCue" === e.type && this.postMessage(n.STREAM_SOURCE_CUE, e)
                    }, t.onError = function (e, t, r, o) {
                        this.postMessage(n.ERROR, {
                            type: e,
                            code: t,
                            source: r,
                            message: o
                        })
                    }, t.onRecoverableError = function (e, t, r, o) {
                        this.postMessage(n.RECOVERABLE_ERROR, {
                            type: e,
                            code: t,
                            source: r,
                            message: o
                        })
                    }, t.onAnalyticsEvent = function (e, t) {
                        var r = K(t);
                        this.postMessage(n.ANALYTICS_EVENT, {
                            name: e,
                            properties: r
                        })
                    }, t.configure = function (e, t, r, n, o, i) {
                        this.workerSink.configure({
                            trackID: e,
                            codec: t,
                            path: r,
                            mode: n,
                            isProtected: o,
                            group: i,
                            srcObj: null
                        })
                    }, t.enqueue = function (e, t) {
                        var r = new Uint8Array(t).buffer;
                        this.workerSink.invoke({
                            name: "enqueue",
                            arg: {
                                trackID: e,
                                buffer: r
                            }
                        }, [r])
                    }, t.endOfStream = function () {
                        this.workerSink.invoke({
                            name: "endOfStream",
                            arg: void 0
                        })
                    }, t.setTimestampOffset = function (e, t) {
                        this.workerSink.invoke({
                            name: "setTimestampOffset",
                            arg: {
                                trackID: e,
                                offset: t
                            }
                        })
                    }, t.play = function () {
                        this.workerSink.invoke({
                            name: "play",
                            arg: void 0
                        })
                    }, t.pause = function () {
                        this.workerSink.invoke({
                            name: "pause",
                            arg: void 0
                        })
                    }, t.reset = function () {
                        this.workerSink.reset()
                    }, t.remove = function (e, t) {
                        this.workerSink.invoke({
                            name: "remove",
                            arg: {
                                start: e,
                                end: t
                            }
                        })
                    }, t.seekTo = function (e) {
                        this.workerSink.invoke({
                            name: "seekTo",
                            arg: e
                        })
                    }, t.setPlaybackRate = function (e) {
                        this.workerSink.invoke({
                            name: "setPlaybackRate",
                            arg: e
                        }), this.postMessage(n.PLAYBACK_RATE_CHANGED, e)
                    }, t.setVolume = function (e) {
                        this.workerSink.invoke({
                            name: "setVolume",
                            arg: e
                        })
                    }, t.addCue = function (e, t, r) {
                        this.postMessage(o.ADD_CUE, {
                            id: e,
                            start: t,
                            end: r
                        })
                    }, t.getWebTransportProxy = function (e) {
                        return new Y(this.module, e)
                    }, t.onPropertyChanged = function (e, t) {
                        this.postMessage(o.PROPERTY_CHANGED, {
                            key: e,
                            value: t
                        })
                    }, t.postMessage = function (e, t, r) {
                        z(this.port, this.id, e, t, r)
                    }, t.applyMessageToSink = function (e, t) {
                        switch (e) {
                            case "delete":
                                this.workerSink.delete();
                                break;
                            case "setControls":
                                this.workerSink.controls = t[0];
                                break;
                            case "onClientSinkIdle":
                                this.workerSink.unblockIfWaitingForIdle()
                        }
                    }, e
                }();

            function z(e, t, r, n, o) {
                e.postMessage({
                    id: t,
                    type: r,
                    arg: n
                }, o)
            }

            function K(e) {
                try {
                    return JSON.parse(e)
                } catch (t) {
                    return console.error("Failed JSON parse:", e), {}
                }
            }
            var X, Z = r(449).Z;
            (X = "undefined" == typeof messageHandler ? self : messageHandler).onmessage = function (e) {
                var t = new J(X);
                X.onmessage = function (e) {
                    return t.dispatch(e)
                },
                    function (e, t) {
                        var r, n, o;
                        Z({
                            locateFile: function () {
                                return t.wasmBinaryUrl
                            },
                            sendFetchRequest: function (e, t, n, o) {
                                return function (e, t, r, n, o) {
                                    var i = null;
                                    "undefined" != typeof AbortController && (i = new AbortController, n.signal = i.signal);
                                    var a = new R(e, i),
                                        s = -1;

                                    function u() {
                                        -1 !== s && clearTimeout(s), t.delete()
                                    }
                                    return o > 0 && (s = self.setTimeout((function () {
                                        return a.abort()
                                    }), o)), w(r, n).then((async function (e) {
                                        a.setResponse(e), a.cancelled || t.response(a)
                                    })).catch((function (e) {
                                        a.cancelled || (console.error("HTTP Response Error:", e.name, e.message), t.error("AbortError" === e.name, e.message))
                                    })).then(u, u),
                                        function () {
                                            return a.cancel()
                                        }
                                }(r, e, t, n, o)
                            },
                            onAbort: function (n) {
                                if (r) {
                                    var o, a = null != (o = Error().stack) ? o : "Stack information not available";
                                    if (t.showWorkerLogs) return void e.logMessage("error", n + "\n" + JSON.stringify(a));
                                    i(n), i(JSON.stringify(a).replace(/\\n/g, "\n"));
                                    var s = JSON.stringify({
                                        logList: r.getLogListAndClear(),
                                        stack: a
                                    });
                                    e.sendErrorMessage(s, 0)
                                } else console.error(n)
                            },
                            logMessage: function (n, o) {
                                if (t.showWorkerLogs) {
                                    var a = "log";
                                    return 4 & n ? a = "error" : 2 & n && (a = "warn"), void e.logMessage(a, o)
                                }
                                r._emscripten_log_js(n, o), i(o)
                            },
                            getLogListAndClear: function () {
                                var e = r.logList;
                                return r.logList = [], e
                            },
                            print: function (e) {
                                i(e), console.log(e)
                            },
                            printErr: function (e) {
                                i(e), console.warn(e)
                            },
                            copyUint8ArrayToEmscriptenHeap: (n = 0, o = 0, function (e, t) {
                                void 0 === t && (t = !1);
                                var i = r,
                                    a = i.HEAPU8,
                                    s = i._free,
                                    u = i._malloc,
                                    c = e.byteLength;
                                if (t) {
                                    var l = u(c);
                                    return a.set(e, l), l
                                }
                                return c > o && (n && s(n), n = u(c), o = c), a.set(e, n), n
                            })
                        }).then((function (t) {
                            r = t, e.ready(r)
                        }));
                        var i = function (e) {
                            r && r.collectLogs && r.logList.push(e)
                        }
                    }(t, e.data)
            };
            var J = function () {
                function t(e) {
                    this.activePlayers = void 0, this.port = void 0, this.eventQueue = void 0, this.module = void 0, this.activePlayers = Object.create(null), this.port = e, this.eventQueue = [], this.module = null
                }
                var r = t.prototype;
                return r.dispatch = function (t) {
                    var r = this;
                    if (null !== this.module) {
                        if (!this.module.skipEvents) {
                            var o = t.data,
                                i = o.id,
                                a = o.funcName,
                                s = o.args;
                            try {
                                if ("create" === a) {
                                    var u = s[0];
                                    return this.activePlayers[i] = new q(this.port, i, this.module, u), void (!0 === u.testOnly && (this.module.recreatePlayer = function () {
                                        var e;
                                        null == (e = r.activePlayers[i]) || e.recreatePlayer()
                                    }, this.module.getPointer = function () {
                                        var e, t;
                                        return r.module.skipEvents = !1, null != (e = null == (t = r.activePlayers[i]) ? void 0 : t.getPointer()) ? e : 0
                                    }, this.module.skipWorkerMessage = function () {
                                        r.module.skipEvents = !0
                                    }))
                                }
                                if ("runTests" === a) return this.module.collectLogs = !0, this.module.logList = [], this.module.cliOptions = s[0], void this.module._runTests();
                                if (!this.activePlayers[i]) return;
                                this.activePlayers[i].onClientMessage(a, s), "delete" === a && (this.activePlayers[i] = null)
                            } catch (t) {
                                console.warn(t), this.activePlayers[i] && z(this.port, i, n.WORKER_ERROR, {
                                    code: e.GENERIC,
                                    source: "worker",
                                    message: t.message
                                })
                            }
                        }
                    } else this.eventQueue.push(t)
                }, r.ready = function (e) {
                    this.module = e, this.eventQueue.forEach(this.dispatch, this), this.eventQueue = []
                }, r.logMessage = function (e, t) {
                    z(this.port, 0, o.LOG_MESSAGE, {
                        level: e,
                        message: t
                    })
                }, r.sendErrorMessage = function (t, r) {
                    z(this.port, r, n.WORKER_ERROR, {
                        code: e.GENERIC,
                        source: "worker",
                        message: t
                    })
                }, t
            }()
        }()
}();