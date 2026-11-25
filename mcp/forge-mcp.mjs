#!/usr/bin/env node
import { createRequire as __kimiCreateRequire } from 'node:module'; const require = __kimiCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = Symbol.for("yaml.alias");
    var DOC = Symbol.for("yaml.document");
    var MAP = Symbol.for("yaml.map");
    var PAIR = Symbol.for("yaml.pair");
    var SCALAR = Symbol.for("yaml.scalar");
    var SEQ = Symbol.for("yaml.seq");
    var NODE_TYPE = Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap2 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq2 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap2;
    exports.isNode = isNode;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci2 = visit_(i, node.items[i], visitor, path);
            if (typeof ci2 === "number")
              i = ci2 - 1;
            else if (ci2 === BREAK)
              return BREAK;
            else if (ci2 === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci2 = await visitAsync_(i, node.items[i], visitor, path);
            if (typeof ci2 === "number")
              i = ci2 - 1;
            else if (ci2 === BREAK)
              return BREAK;
            else if (ci2 === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt2 = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt2} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn2) => tn2.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle2, prefix] = parts;
            this.tags[handle2] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle2, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle2];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle2 === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle2, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle2 + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle2, prefix] of tagEntries) {
          if (handle2 === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn2) => tn2.startsWith(prefix)))
            lines.push(`%TAG ${handle2} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k2 of Array.from(val.keys())) {
            const v0 = val.get(k2);
            const v1 = applyReviver(reviver, val, k2, v0);
            if (v1 === void 0)
              val.delete(k2);
            else if (v1 !== v0)
              val.set(k2, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k2, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k2, v0);
            if (v1 === void 0)
              delete val[k2];
            else if (v1 !== v0)
              val[k2] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v2, i) => toJS(v2, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        if (found && ctx) {
          const { anchors: anchors2, doc: doc2, maxAliasCount } = ctx;
          let data = anchors2.get(found);
          if (!data) {
            toJS.toJS(found, null, ctx);
            data = anchors2.get(found);
          }
          if (data?.res === void 0) {
            const msg = "This should not happen: Alias anchor was not resolved?";
            throw new ReferenceError(msg);
          }
          if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
              data.aliasCount = getAliasCount(doc2, found, anchors2);
            if (data.count * data.aliasCount > maxAliasCount) {
              const msg = "Excessive alias count indicates a resource exhaustion attack";
              throw new ReferenceError(msg);
            }
          }
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v2 = value;
      for (let i = path.length - 1; i >= 0; --i) {
        const k2 = path[i];
        if (typeof k2 === "number" && Number.isInteger(k2) && k2 >= 0) {
          const a = [];
          a[k2] = v2;
          v2 = a;
        } else {
          v2 = /* @__PURE__ */ new Map([[k2, v2]]);
        }
      }
      return createNode.createNode(v2, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it2) => identity.isNode(it2) || identity.isPair(it2) ? it2.clone(schema) : it2);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str2) => str2.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str2, indent, comment) => str2.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str2.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j2 = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j2])
                return text;
              folds.push(j2);
              escapedFolds[j2] = true;
              end = j2 + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str2) => /^(%|---|\.\.\.)/m.test(str2);
    function lineLengthOverLimit(str2, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str2.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str2[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str2 = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str2 += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str2 += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str2 += "\\0";
                    break;
                  case "0007":
                    str2 += "\\a";
                    break;
                  case "000b":
                    str2 += "\\v";
                    break;
                  case "001b":
                    str2 += "\\e";
                    break;
                  case "0085":
                    str2 += "\\N";
                    break;
                  case "00a0":
                    str2 += "\\_";
                    break;
                  case "2028":
                    str2 += "\\L";
                    break;
                  case "2029":
                    str2 += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str2 += "\\x" + code.substr(2);
                    else
                      str2 += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str2 += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str2 += "\n";
                  i += 2;
                }
                str2 += indent;
                if (json[i + 2] === " ")
                  str2 += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str2 = start ? str2 + json.slice(start) : json;
      return implicitKey ? str2 : foldFlowLines.foldFlowLines(str2, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs2;
      if (singleQuote === false)
        qs2 = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs2 = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs2 = doubleQuotedString;
        else
          qs2 = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs2(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str2 = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str2);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str2 : foldFlowLines.foldFlowLines(str2, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss2 = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss2.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss2.value, ctx) : blockString(ss2, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss2.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss2.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss2, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str2 = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str2;
      return identity.isScalar(node) || str2[0] === "{" || str2[0] === "[" ? `${props} ${str2}` : `${props}
${ctx.indent}${str2}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str2 = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str2.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str2 === "" ? "?" : explicitKey ? `? ${str2}` : str2;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str2 = `? ${str2}`;
        if (keyComment && !keyCommentDone) {
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str2;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
        str2 = `? ${str2}
${indent}:`;
      } else {
        str2 = `${str2}:`;
        if (keyComment)
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str2.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws2 = " ";
      if (keyComment || vsb || vcb) {
        ws2 = vsb ? "\n" : "";
        if (vcb) {
          const cs2 = commentString(vcb);
          ws2 += `
${stringifyComment.indentComment(cs2, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws2 === "\n" && valueComment)
            ws2 = "\n\n";
        } else {
          ws2 += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws2 = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws2 = "";
      }
      str2 += ws2 + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str2;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it2 of source.items)
          mergeValue(ctx, map, it2);
      else if (Array.isArray(source))
        for (const it2 of source)
          mergeValue(ctx, map, it2);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k2 = createNode.createNode(key, void 0, ctx);
      const v2 = createNode.createNode(value, void 0, ctx);
      return new Pair(k2, v2);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_2, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str3 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str3 += stringifyComment.lineComment(str3, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str3);
      }
      let str2;
      if (lines.length === 0) {
        str2 = flowChars.start + flowChars.end;
      } else {
        str2 = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str2 += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str2 += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str2;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str2 = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str2.includes("\n"));
        if (i < items.length - 1) {
          str2 += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str2.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str2 += ",";
          }
        }
        if (comment)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment));
        lines.push(str2);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str2 = start;
          for (const line of lines)
            str2 += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str2}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k2 = identity.isScalar(key) ? key.value : key;
      for (const it2 of items) {
        if (identity.isPair(it2)) {
          if (it2.key === key || it2.key === k2)
            return it2;
          if (identity.isScalar(it2.key) && it2.key.value === k2)
            return it2;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it2 = findPair(this.items, key);
        if (!it2)
          return false;
        const del = this.items.splice(this.items.indexOf(it2), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it2 = findPair(this.items, key);
        const node = it2?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_2, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it2 = this.items[idx];
        return !keepScalar && identity.isScalar(it2) ? it2.value : it2;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_2, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it2 of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it2 : String(i++);
              it2 = replacer.call(obj, key, it2);
            }
            seq.items.push(createNode.createNode(it2, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str2) => str2,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str2) => new Scalar.Scalar(str2[0] === "t" || str2[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num2 = typeof value === "number" ? value : Number(value);
      if (!isFinite(num2))
        return isNaN(num2) ? ".nan" : num2 < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str2) => str2.slice(-3).toLowerCase() === "nan" ? NaN : str2[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str2) => parseFloat(str2),
      stringify(node) {
        const num2 = Number(node.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str2) {
        const node = new Scalar.Scalar(parseFloat(str2));
        const dot = str2.indexOf(".");
        if (dot !== -1 && str2[str2.length - 1] === "0")
          node.minFractionDigits = str2.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str2, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str2) : parseInt(str2.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool2 = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool2.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str2) => str2,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str2) => str2 === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str2, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str2) : parseInt(str2, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str2) => parseFloat(str2),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str2, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str2)}`);
        return str2;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str2 = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str2.length);
          for (let i = 0; i < str2.length; ++i)
            buffer[i] = str2.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str2;
        if (typeof node_buffer.Buffer === "function") {
          str2 = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s3 = "";
          for (let i = 0; i < buf.length; ++i)
            s3 += String.fromCharCode(buf[i]);
          str2 = btoa(s3);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str2.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str2.substr(o, lineWidth);
          }
          str2 = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str2 }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn2 = pair.value ?? pair.key;
              cn2.comment = cn2.comment ? `${item.comment}
${cn2.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it2 of iterable) {
          if (typeof replacer === "function")
            it2 = replacer.call(iterable, String(i++), it2);
          let key, value;
          if (Array.isArray(it2)) {
            if (it2.length === 2) {
              key = it2[0];
              value = it2[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it2}`);
          } else if (it2 && it2 instanceof Object) {
            const keys = Object.keys(it2);
            if (keys.length === 1) {
              key = keys[0];
              value = it2[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it2;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_2, ctx) {
        if (!ctx)
          return super.toJSON(_2);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str2) => str2.slice(-3).toLowerCase() === "nan" ? NaN : str2[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str2) => parseFloat(str2.replace(/_/g, "")),
      stringify(node) {
        const num2 = Number(node.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str2) {
        const node = new Scalar.Scalar(parseFloat(str2.replace(/_/g, "")));
        const dot = str2.indexOf(".");
        if (dot !== -1) {
          const f2 = str2.substring(dot + 1).replace(/_/g, "");
          if (f2[f2.length - 1] === "0")
            node.minFractionDigits = f2.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str2, offset, radix, { intAsBigInt }) {
      const sign = str2[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str2 = str2.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str2 = `0b${str2}`;
            break;
          case 8:
            str2 = `0o${str2}`;
            break;
          case 16:
            str2 = `0x${str2}`;
            break;
        }
        const n2 = BigInt(str2);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str2, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str2 = value.toString(radix);
        return value < 0 ? "-" + prefix + str2.substr(1) : prefix + str2;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_2, ctx) {
        return super.toJSON(_2, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str2, asBigInt) {
      const sign = str2[0];
      const parts = sign === "-" || sign === "+" ? str2.substring(1) : str2;
      const num2 = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p2) => res2 * num2(60) + num2(p2), num2(0));
      return sign === "-" ? num2(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num2 = (n) => n;
      if (typeof value === "bigint")
        num2 = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num2(-1);
      }
      const _60 = num2(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str2, _onError, { intAsBigInt }) => parseSexagesimal(str2, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str2) => parseSexagesimal(str2, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str2) {
        const match = str2.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool2 = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool2.trueTag,
      bool2.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool2 = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool2.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b2) => a.key < b2.key ? -1 : a.key > b2.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs2 = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs2, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs2 = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs2, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs2 = commentString(doc.comment);
          if (cs2.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs2, ""));
          } else {
            lines.push(`... ${cs2}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v2) => typeof v2 === "number" || v2 instanceof String || v2 instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k2 = this.createNode(key, null, options);
        const v2 = this.createNode(value, null, options);
        return new Pair.Pair(k2, v2);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s3 = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s3}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci2 = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci2 >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci2 - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci2 -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci2))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci2));
        }
        const pointer = " ".repeat(ci2) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st2 of key.end)
              if (st2.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it2 of key.items) {
            for (const st2 of it2.start)
              if (st2.type === "newline")
                return true;
            if (it2.sep) {
              for (const st2 of it2.sep)
                if (st2.type === "newline")
                  return true;
            }
            if (containsNewline(it2.key) || containsNewline(it2.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b2) => a === b2 || identity.isScalar(a) && identity.isScalar(b2) && a.value === b2.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep: sep4, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep4?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep4) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep4 ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep4, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs2, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs2.offset;
      let commentEnd = null;
      for (const { start, value } of bs2.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs2.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs2.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs2.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep4 = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep4 + cb;
              sep4 = "";
              break;
            }
            case "newline":
              if (comment)
                sep4 += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap2 = fc.start.source === "{";
      const fcName = isMap2 ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap2 ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep: sep4, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep4?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep4 && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap2 && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st2 of start) {
              switch (st2.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st2.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap2 && !sep4 && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep4, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep4 ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap2 && !props.found && ctx.options.strict) {
              if (sep4)
                for (const st2 of sep4) {
                  if (st2 === valueProps.found)
                    break;
                  if (st2.type === "newline") {
                    onError(st2, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep4, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap2) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap2 ? "}" : "]";
      const [ce2, ...ee2] = fc.end;
      let cePos = offset;
      if (ce2?.source === expectedEnd)
        cePos = ce2.offset + ce2.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce2 && ce2.source.length !== 1)
          ee2.unshift(ce2);
      }
      if (ee2.length > 0) {
        const end = resolveEnd.resolveEnd(ee2, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt2 = ctx.schema.knownTags[tagName];
        if (kt2?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt2, { default: false }));
          tag = kt2;
        } else {
          if (kt2) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt2.tag} used for ${expType} collection, but expects ${kt2.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep4 = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep4 + indent.slice(trimIndent) + content;
          sep4 = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep4 === " ")
            sep4 = "\n";
          else if (!prevMoreIndented && sep4 === "\n")
            sep4 = "\n\n";
          value += sep4 + indent.slice(trimIndent) + content;
          sep4 = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep4 === "\n")
            value += "\n";
          else
            sep4 = "\n";
        } else {
          value += sep4 + content;
          sep4 = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts2 = token.source;
            if (ts2 && typeof ts2 === "string")
              length += ts2.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m2 = first.match(/^( *)/);
      const line0 = m2?.[1] ? [m2[1], first.slice(m2[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re2 = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re2.comment,
        range: [offset, valueEnd, re2.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return unfoldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function unfoldLines(source) {
      const line = /(.*?)\r?\n/sy;
      let match = line.exec(source);
      if (!match)
        return source;
      let trimEnd, trimBoth;
      try {
        trimEnd = new RegExp("(?<![ 	])[ 	]+$");
        trimBoth = new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
      } catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
      }
      let res = match[1].replace(trimEnd, "");
      let sep4 = " ";
      let pos = line.lastIndex;
      while (match = line.exec(source)) {
        const lm = match[1].replace(trimBoth, "");
        if (lm === "") {
          if (sep4 === "\n")
            res += sep4;
          else
            sep4 = "\n";
        } else {
          res += sep4 + lm;
          sep4 = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep4 + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt2 = schema.knownTags[tagName];
      if (kt2 && !kt2.collection) {
        schema.tags.push(Object.assign({}, kt2, { default: false, test: void 0 }));
        return kt2;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts2 = directives.tagString(tag.tag);
          const cs2 = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts2} or ${cs2}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st2 = before[i];
          switch (st2.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st2.source.length;
              continue;
          }
          st2 = before[++i];
          while (st2?.type === "space") {
            offset += st2.source.length;
            st2 = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re2 = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re2.offset];
      if (re2.comment)
        alias.comment = re2.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re2 = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re2.comment)
        doc.comment = re2.comment;
      doc.range = [offset, contentEnd, re2.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it2 = dc.items[0];
            if (identity.isPair(it2))
              it2 = it2.key;
            const cb = it2.commentBefore;
            it2.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he2 = source.indexOf("\n");
          const head = source.substring(0, he2);
          const body = source.substring(he2 + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he2 = source.indexOf("\n");
      const head = source.substring(0, he2);
      const body = source.substring(he2 + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st2 of end)
          switch (st2.type) {
            case "space":
            case "comment":
              props.push(st2);
              break;
            case "newline":
              props.push(st2);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st2) => st2.type === "space" || st2.type === "comment" || st2.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st2 of token.end)
            res += st2.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st2 of token.end)
              res += st2.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st2 of token.end)
              res += st2.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep: sep4, value }) {
      let res = "";
      for (const st2 of start)
        res += st2.source;
      if (key)
        res += stringifyToken(key);
      if (sep4)
        for (const st2 of sep4)
          res += st2.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci2 = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci2 === "number")
              i = ci2 - 1;
            else if (ci2 === BREAK)
              return BREAK;
            else if (ci2 === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports.visit = visit;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt2 = this.buffer.substr(offset, 3);
          if ((dt2 === "---" || dt2 === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs2 = line.indexOf("#");
          while (cs2 !== -1) {
            const ch = line[cs2 - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs2 - 1;
              break;
            } else {
              cs2 = line.indexOf("#", cs2 + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s3 = this.peek(3);
          if ((s3 === "---" || s3 === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s3 === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs2 = this.continueScalar(nl + 1);
            if (cs2 === -1)
              break;
            nl = qb.indexOf("\n", cs2);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs2 = this.continueScalar(nl + 1);
            if (cs2 === -1)
              break;
            nl = this.buffer.indexOf("\n", cs2);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs2 = this.continueScalar(i + 1);
              if (cs2 === -1)
                break;
              i = Math.max(i, cs2 - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s3 = this.buffer.slice(this.pos, i);
        if (s3) {
          yield s3;
          this.pos += s3.length;
          return s3.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it2 = parent.items[parent.items.length - 1];
          return it2.sep ?? it2.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it2 of fc.items) {
          if (it2.sep && !it2.value && !includesToken(it2.start, "explicit-key-ind") && !includesToken(it2.sep, "map-value-ind")) {
            if (it2.key)
              it2.value = it2.key;
            delete it2.key;
            if (isFlowToken(it2.value)) {
              if (it2.value.end)
                arrayPushArray(it2.value.end, it2.sep);
              else
                it2.value.end = it2.sep;
            } else
              arrayPushArray(it2.start, it2.sep);
            delete it2.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st2 = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st2;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it2 = top.items[top.items.length - 1];
              if (it2.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it2.sep) {
                it2.value = token;
              } else {
                Object.assign(it2, { key: token, sep: [] });
                this.onKeyLine = !it2.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it2 = top.items[top.items.length - 1];
              if (it2.value)
                top.items.push({ start: [], value: token });
              else
                it2.value = token;
              break;
            }
            case "flow-collection": {
              const it2 = top.items[top.items.length - 1];
              if (!it2 || it2.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it2.sep)
                it2.value = token;
              else
                Object.assign(it2, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st2) => st2.type !== "comment" || st2.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep4;
          if (scalar.end) {
            sep4 = scalar.end;
            sep4.push(this.sourceToken);
            delete scalar.end;
          } else
            sep4 = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep: sep4 }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it2 = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it2.value) {
              const end = "end" in it2.value ? it2.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it2.sep) {
              it2.sep.push(this.sourceToken);
            } else {
              it2.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it2.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it2.sep) {
              it2.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it2.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it2.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it2.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it2.sep || it2.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it2.sep && !it2.value) {
            const nl = [];
            for (let i = 0; i < it2.sep.length; ++i) {
              const st2 = it2.sep[i];
              switch (st2.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st2.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it2.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it2.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it2.sep) {
                it2.sep.push(this.sourceToken);
              } else {
                it2.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it2.sep && !it2.explicitKey) {
                it2.start.push(this.sourceToken);
                it2.explicitKey = true;
              } else if (atNextItem || it2.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it2.explicitKey) {
                if (!it2.sep) {
                  if (includesToken(it2.start, "newline")) {
                    Object.assign(it2, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it2.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it2.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it2.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it2.key) && !includesToken(it2.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it2.start);
                  const key = it2.key;
                  const sep4 = it2.sep;
                  sep4.push(this.sourceToken);
                  delete it2.key;
                  delete it2.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep: sep4 }]
                  });
                } else if (start.length > 0) {
                  it2.sep = it2.sep.concat(start, this.sourceToken);
                } else {
                  it2.sep.push(this.sourceToken);
                }
              } else {
                if (!it2.sep) {
                  Object.assign(it2, { key: null, sep: [this.sourceToken] });
                } else if (it2.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it2.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it2.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs2 = this.flowScalar(this.type);
              if (atNextItem || it2.value) {
                map.items.push({ start, key: fs2, sep: [] });
                this.onKeyLine = true;
              } else if (it2.sep) {
                this.stack.push(fs2);
              } else {
                Object.assign(it2, { key: fs2, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it2.explicitKey && it2.sep && !includesToken(it2.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it2 = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it2.value) {
              const end = "end" in it2.value ? it2.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it2.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it2.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it2.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it2.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it2.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it2.value || this.indent <= seq.indent)
              break;
            it2.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it2.value || includesToken(it2.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it2.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it2 = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it2 || it2.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it2.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it2 || it2.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it2.sep)
                it2.sep.push(this.sourceToken);
              else
                Object.assign(it2, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it2 || it2.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it2.sep)
                it2.sep.push(this.sourceToken);
              else
                it2.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs2 = this.flowScalar(this.type);
              if (!it2 || it2.value)
                fc.items.push({ start: [], key: fs2, sep: [] });
              else if (it2.sep)
                this.stack.push(fs2);
              else
                Object.assign(it2, { key: fs2, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep4 = fc.end.splice(1, fc.end.length);
            sep4.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep: sep4 }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st2) => st2.type === "newline" || st2.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument3(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument3(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument3;
    exports.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// src/forge-mcp.mjs
import { createInterface } from "node:readline";
import { join as join19 } from "node:path";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/bootstrap.js
import { execFile as execFile2 } from "node:child_process";
import { existsSync as existsSync2 } from "node:fs";
import { chmod, copyFile as copyFile2, lstat, mkdir as mkdir2, rm as rm2, symlink } from "node:fs/promises";
import { join as join5, resolve as resolve3 } from "node:path";
import { promisify as promisify2 } from "node:util";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/environment.js
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir as readdir2, readFile as readFile2, rm, stat as stat2, statfs, writeFile } from "node:fs/promises";
import { connect } from "node:net";
import { join as join3 } from "node:path";
import { promisify } from "node:util";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/models.js
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
var RESERVED_ENTRIES = /* @__PURE__ */ new Set(["cache", "blobs", "registry.json"]);
var METADATA_FILES = /* @__PURE__ */ new Set(["receipt.json", "model.json", "README.md", "LICENSE", "LICENSE.txt"]);
var WEIGHT_EXTENSIONS = /* @__PURE__ */ new Set([
  ".safetensors",
  ".pt",
  ".pth",
  ".ckpt",
  ".onnx",
  ".gguf",
  ".bin",
  ".engine",
  ".trt",
  ".weights"
]);
var ModelStore = class {
  root;
  constructor(root) {
    this.root = root;
  }
  /** Scan every local model revision under `root`. Read-only; never creates directories. */
  async list(referencedBy = /* @__PURE__ */ new Map()) {
    const rootInfo = await statSafe(this.root);
    if (rootInfo === void 0) {
      return { root: this.root, exists: false, count: 0, totalBytes: 0, models: [], diagnostics: [] };
    }
    if (!rootInfo.isDirectory()) {
      return {
        root: this.root,
        exists: false,
        count: 0,
        totalBytes: 0,
        models: [],
        diagnostics: [{
          id: "",
          path: this.root,
          code: "FORGE_MODEL_ROOT_INVALID",
          message: `${this.root} exists but is not a directory`
        }]
      };
    }
    const models = [];
    const diagnostics = [];
    const idEntries = await readdirSafe(this.root);
    for (const idEntry of idEntries) {
      if (idEntry.name.startsWith(".") || RESERVED_ENTRIES.has(idEntry.name))
        continue;
      if (!idEntry.isDirectory())
        continue;
      const id = idEntry.name;
      const modelDir = join(this.root, id);
      const children = await readdirSafe(modelDir);
      const revisionDirs = children.filter((child) => !child.name.startsWith(".") && child.isDirectory());
      const directFiles = children.filter((child) => !child.name.startsWith(".") && !child.isDirectory());
      if (revisionDirs.length > 0) {
        for (const revEntry of revisionDirs) {
          const scanned = await scanRevision(id, revEntry.name, join(modelDir, revEntry.name), referencedBy);
          models.push(scanned.entry);
          if (scanned.diagnostic !== void 0)
            diagnostics.push(scanned.diagnostic);
        }
      } else if (directFiles.length > 0) {
        const scanned = await scanRevision(id, "default", modelDir, referencedBy);
        models.push(scanned.entry);
        if (scanned.diagnostic !== void 0)
          diagnostics.push(scanned.diagnostic);
      }
    }
    models.sort((left, right) => left.id.localeCompare(right.id) || left.revision.localeCompare(right.revision));
    const totalBytes = models.reduce((sum, item) => sum + item.bytes, 0);
    return {
      root: this.root,
      exists: true,
      count: models.length,
      totalBytes,
      models,
      diagnostics
    };
  }
  /** Search local models by free-text query, id, tag or referencing skill. */
  async search(filter = {}, referencedBy = /* @__PURE__ */ new Map()) {
    const listing = await this.list(referencedBy);
    const idFilter = filter.id?.trim();
    const tagFilter = filter.tag?.trim().toLowerCase();
    const skillFilter = filter.skill?.trim();
    const tokens = (filter.query ?? "").trim().toLowerCase().split(/\s+/).filter((token) => token.length > 0);
    const matched = listing.models.filter((entry) => {
      if (idFilter !== void 0 && idFilter.length > 0 && entry.id !== idFilter)
        return false;
      if (tagFilter !== void 0 && tagFilter.length > 0) {
        if (!entry.tags.some((tag) => tag.toLowerCase() === tagFilter))
          return false;
      }
      if (skillFilter !== void 0 && skillFilter.length > 0) {
        if (!entry.referencedBy.includes(skillFilter))
          return false;
      }
      if (tokens.length === 0)
        return true;
      const haystack = [
        entry.id,
        entry.revision,
        entry.filename ?? "",
        entry.description ?? "",
        entry.source ?? "",
        entry.license ?? "",
        ...entry.tags,
        ...entry.referencedBy,
        ...entry.files.map((file) => file.name)
      ].join("\n").toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
    const totalBytes = matched.reduce((sum, item) => sum + item.bytes, 0);
    return {
      root: listing.root,
      exists: listing.exists,
      count: matched.length,
      totalBytes,
      models: matched,
      diagnostics: listing.diagnostics
    };
  }
  /** Look up one model id (and optional revision), returning all available revisions too. */
  async info(id, revision, referencedBy = /* @__PURE__ */ new Map()) {
    const listing = await this.list(referencedBy);
    const candidates = listing.models.filter((entry) => entry.id === id);
    if (candidates.length === 0)
      return void 0;
    const selected = revision !== void 0 && revision.length > 0 ? candidates.find((entry) => entry.revision === revision) : pickPreferredRevision(candidates);
    if (selected === void 0)
      return void 0;
    const receipt = await readReceiptFile(join(selected.dir, "receipt.json"));
    return {
      root: this.root,
      model: selected,
      revisions: candidates.map((entry) => entry.revision),
      ...receipt.receipt === void 0 ? {} : { receipt: receipt.receipt }
    };
  }
  /** Verify the primary weight file's actual SHA256 against `receipt.json`. */
  async verify(id, revision) {
    const found = await this.info(id, revision);
    if (found === void 0) {
      return {
        ok: false,
        id,
        revision: revision ?? "default",
        status: "missing",
        detail: revision === void 0 ? `model "${id}" is not installed under ${this.root}` : `model "${id}@${revision}" is not installed under ${this.root}`
      };
    }
    const { model } = found;
    const target = model.primaryFile;
    if (target === void 0) {
      return {
        ok: false,
        id: model.id,
        revision: model.revision,
        status: "missing",
        path: model.dir,
        detail: `${model.id}@${model.revision}: no weight file found in ${model.dir}`
      };
    }
    const actualSha256 = await sha256File(target);
    const expectedSha256 = model.sha256?.toLowerCase();
    if (expectedSha256 === void 0) {
      return {
        ok: true,
        id: model.id,
        revision: model.revision,
        status: "unverified",
        path: target,
        actualSha256,
        detail: `${model.id}@${model.revision}: present without pinned sha256 in receipt.json (actual ${actualSha256})`
      };
    }
    if (actualSha256 !== expectedSha256) {
      return {
        ok: false,
        id: model.id,
        revision: model.revision,
        status: "mismatch",
        path: target,
        expectedSha256,
        actualSha256,
        detail: `${model.id}@${model.revision}: digest ${actualSha256} does not match receipt ${expectedSha256}`
      };
    }
    return {
      ok: true,
      id: model.id,
      revision: model.revision,
      status: "verified",
      path: target,
      expectedSha256,
      actualSha256,
      detail: `${model.id}@${model.revision}: verified ${actualSha256}`
    };
  }
  /** Resolve one `skill.yaml` `required_models` entry against local disk state (fast metadata check). */
  async resolveRequirement(requirement) {
    const optional = requirement.optional === true;
    const found = await this.info(requirement.id, requirement.revision);
    if (found === void 0) {
      const label = requirement.revision === void 0 ? requirement.id : `${requirement.id}@${requirement.revision}`;
      return {
        id: requirement.id,
        ...requirement.revision === void 0 ? {} : { revision: requirement.revision },
        ...requirement.env === void 0 ? {} : { env: requirement.env },
        optional,
        state: "missing",
        detail: `${label}: not installed under ${this.root}`
      };
    }
    const { model } = found;
    const targetPath = requirement.filename !== void 0 ? join(model.dir, requirement.filename) : model.primaryFile ?? model.dir;
    const targetInfo = await statSafe(targetPath);
    if (targetInfo === void 0) {
      return {
        id: requirement.id,
        revision: model.revision,
        ...requirement.env === void 0 ? {} : { env: requirement.env },
        optional,
        state: "missing",
        path: targetPath,
        detail: `${model.id}@${model.revision}: expected file ${requirement.filename ?? targetPath} is missing`
      };
    }
    if (requirement.sha256 !== void 0) {
      const expected = requirement.sha256.toLowerCase();
      const recorded = model.sha256?.toLowerCase();
      if (recorded === void 0) {
        return {
          id: requirement.id,
          revision: model.revision,
          ...requirement.env === void 0 ? {} : { env: requirement.env },
          optional,
          state: "unverified",
          path: targetPath,
          detail: `${model.id}@${model.revision}: present at ${targetPath} without receipt.json digest`
        };
      }
      if (recorded !== expected) {
        return {
          id: requirement.id,
          revision: model.revision,
          ...requirement.env === void 0 ? {} : { env: requirement.env },
          optional,
          state: "mismatch",
          path: targetPath,
          detail: `${model.id}@${model.revision}: receipt digest ${recorded} does not match required ${expected}`
        };
      }
    }
    return {
      id: requirement.id,
      revision: model.revision,
      ...requirement.env === void 0 ? {} : { env: requirement.env },
      optional,
      state: "ready",
      path: targetPath,
      detail: `${model.id}@${model.revision}: ${targetPath}`
    };
  }
};
async function scanRevision(id, revision, dir, referencedBy) {
  const receiptPath = join(dir, "receipt.json");
  const { exists: receiptExists, receipt, error } = await readReceiptFile(receiptPath);
  const files = await collectFiles(dir, dir);
  const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const filename = receipt?.filename ?? detectPrimaryFilename(files);
  const primaryFile = filename !== void 0 ? join(dir, filename) : void 0;
  const refs = /* @__PURE__ */ new Set([
    ...referencedBy.get(id) ?? [],
    ...referencedBy.get(`${id}@${revision}`) ?? []
  ]);
  const entry = {
    id,
    revision,
    dir,
    ...primaryFile !== void 0 && (await statSafe(primaryFile))?.isFile() ? { primaryFile } : {},
    ...filename === void 0 ? {} : { filename },
    files,
    bytes,
    ...receipt?.sha256 === void 0 ? {} : { sha256: receipt.sha256 },
    ...receipt?.source === void 0 ? {} : { source: receipt.source },
    ...receipt?.description === void 0 ? {} : { description: receipt.description },
    tags: receipt?.tags ?? [],
    ...receipt?.license === void 0 ? {} : { license: receipt.license },
    ...receipt?.installedAt === void 0 ? {} : { installedAt: receipt.installedAt },
    receiptExists,
    referencedBy: [...refs].sort()
  };
  if (error !== void 0) {
    return {
      entry,
      diagnostic: {
        id,
        revision,
        path: receiptPath,
        code: "FORGE_MODEL_RECEIPT_INVALID",
        message: error
      }
    };
  }
  return { entry };
}
function detectPrimaryFilename(files) {
  const candidates = files.filter((file) => !METADATA_FILES.has(file.name));
  if (candidates.length === 0)
    return void 0;
  const weights = candidates.filter((file) => WEIGHT_EXTENSIONS.has(extname(file.name).toLowerCase())).sort((left, right) => right.bytes - left.bytes || left.name.localeCompare(right.name));
  if (weights.length > 0)
    return weights[0]?.name;
  if (candidates.length === 1)
    return candidates[0]?.name;
  return void 0;
}
function pickPreferredRevision(candidates) {
  if (candidates.length === 0)
    return void 0;
  if (candidates.length === 1)
    return candidates[0];
  return [...candidates].sort((left, right) => {
    const byDate = (right.installedAt ?? "").localeCompare(left.installedAt ?? "");
    if (byDate !== 0)
      return byDate;
    return right.revision.localeCompare(left.revision);
  })[0];
}
async function readReceiptFile(path) {
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT")
      return { exists: false };
    return { exists: true, error: error.message };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { exists: true, error: `invalid JSON in receipt.json: ${error.message}` };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { exists: true, error: "receipt.json root must be a JSON object" };
  }
  const obj = parsed;
  const str2 = (key) => typeof obj[key] === "string" && obj[key].length > 0 ? obj[key] : void 0;
  const num2 = (key) => typeof obj[key] === "number" && Number.isFinite(obj[key]) ? obj[key] : void 0;
  const tags = Array.isArray(obj["tags"]) ? obj["tags"].filter((item) => typeof item === "string" && item.length > 0) : void 0;
  const receipt = {
    ...str2("id") === void 0 ? {} : { id: str2("id") },
    ...str2("revision") === void 0 ? {} : { revision: str2("revision") },
    ...str2("filename") === void 0 ? {} : { filename: str2("filename") },
    ...str2("sha256") === void 0 ? {} : { sha256: str2("sha256").toLowerCase() },
    ...num2("size") === void 0 ? {} : { size: num2("size") },
    ...str2("source") === void 0 ? {} : { source: str2("source") },
    ...str2("description") === void 0 ? {} : { description: str2("description") },
    ...tags === void 0 ? {} : { tags },
    ...str2("license") === void 0 ? {} : { license: str2("license") },
    ...str2("installedAt") === void 0 ? {} : { installedAt: str2("installedAt") }
  };
  return { exists: true, receipt };
}
async function collectFiles(root, current) {
  const results = [];
  for (const entry of await readdirSafe(current)) {
    if (entry.name.startsWith("."))
      continue;
    const full = join(current, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectFiles(root, full));
    } else {
      const info = await statSafe(full);
      if (info === void 0 || !info.isFile())
        continue;
      const rel = full.slice(root.length + 1).replace(/\\/g, "/");
      results.push({ name: rel, path: full, bytes: info.size });
    }
  }
  return results.sort((left, right) => left.name.localeCompare(right.name));
}
async function sha256File(path) {
  return new Promise((resolveHash, rejectHash) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", rejectHash);
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}
async function readdirSafe(path) {
  try {
    return await readdir(path, { withFileTypes: true });
  } catch {
    return [];
  }
}
async function statSafe(path) {
  try {
    return await stat(path);
  } catch {
    return void 0;
  }
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/paths.js
import { homedir } from "node:os";
import { join as join2, resolve } from "node:path";
var FORGE_MODELS_ENV = "DSH_FORGE_MODELS";
function resolveForgeModelsRoot(home2, explicit, env = process.env) {
  if (explicit !== void 0 && explicit.length > 0)
    return resolve(home2, expandHome(explicit));
  const override = env[FORGE_MODELS_ENV];
  if (override !== void 0 && override.length > 0)
    return resolve(home2, expandHome(override));
  return join2(home2, "models");
}
function expandHome(value) {
  if (value === "~")
    return homedir();
  if (value.startsWith("~/"))
    return join2(homedir(), value.slice(2));
  return value;
}
function forgePaths(home2, modelsRoot) {
  return {
    home: home2,
    skills: join2(home2, "skills"),
    models: resolveForgeModelsRoot(home2, modelsRoot),
    runtime: join2(home2, "runtime"),
    nodes: join2(home2, "runtime", "nodes"),
    logs: join2(home2, "runtime", "logs")
  };
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/environment.js
var execFileAsync = promisify(execFile);
var MIN_NODE_MAJOR = 22;
var DORA_REFERENCE_MINOR = "0.4";
var DORA1_MIN = "1.0.1";
var DORA1_MAX_MAJOR = 2;
var MIN_PYTHON = "3.10";
var GIB = 1024 ** 3;
var DISK_FAIL_BYTES = 1 * GIB;
var DISK_WARN_BYTES = 5 * GIB;
var REPORT_DIR = "runtime/reports";
var EnvironmentCode = {
  platformUnsupported: "FORGE_ENV_PLATFORM_UNSUPPORTED",
  nodeVersion: "FORGE_ENV_NODE_VERSION",
  doraMissing: "FORGE_ENV_DORA_MISSING",
  doraVersion: "FORGE_ENV_DORA_VERSION",
  dora1Missing: "FORGE_ENV_DORA1_MISSING",
  dora1Version: "FORGE_ENV_DORA1_VERSION",
  pythonMissing: "FORGE_ENV_PYTHON_MISSING",
  pythonVersion: "FORGE_ENV_PYTHON_VERSION",
  homeUnwritable: "FORGE_ENV_HOME_UNWRITABLE",
  diskLow: "FORGE_ENV_DISK_LOW",
  registryUnreachable: "FORGE_ENV_REGISTRY_UNREACHABLE",
  portBusy: "FORGE_ENV_PORT_BUSY",
  noSkills: "FORGE_ENV_NO_SKILLS",
  runtimeStateBroken: "FORGE_ENV_RUNTIME_STATE_BROKEN",
  envMissing: "FORGE_ENV_ENV_MISSING",
  envStale: "FORGE_ENV_ENV_STALE"
};
async function checkEnvironment(options) {
  const env = options.env ?? process.env;
  const exec = options.exec ?? defaultExec;
  const checks = [];
  const push = (check) => {
    checks.push(check);
  };
  const platform = `${process.platform}/${process.arch}`;
  if (process.platform === "linux" && process.arch === "x64") {
    push({ id: "platform", status: "pass", detail: `${platform} (reference platform)` });
  } else {
    push({
      id: "platform",
      status: "warn",
      code: EnvironmentCode.platformUnsupported,
      detail: `${platform}; node artifacts are published per platform`,
      hint: "install only skills whose artifact locks match this host, or rebuild their nodes"
    });
  }
  const nodeVersion = process.versions.node;
  const nodeMajor = Number(nodeVersion.split(".")[0]);
  if (Number.isFinite(nodeMajor) && nodeMajor >= MIN_NODE_MAJOR) {
    push({ id: "node", status: "pass", detail: `v${nodeVersion}` });
  } else {
    push({
      id: "node",
      status: "fail",
      code: EnvironmentCode.nodeVersion,
      detail: `v${nodeVersion} is below the supported major ${MIN_NODE_MAJOR}`,
      hint: `upgrade Node.js to ${MIN_NODE_MAJOR} or newer`
    });
  }
  const dora = resolveCli(options.dora, env["DSH_FORGE_DORA"], options.home, "dora");
  const doraProbe = await probe(dora, ["--version"], exec);
  const doraVersion = parseVersion(doraProbe.text);
  if (!doraProbe.ok) {
    push({
      id: "dora",
      status: "fail",
      code: EnvironmentCode.doraMissing,
      detail: `${dora}: ${firstLine(doraProbe.text)}`,
      hint: `set runtime.dora (or DSH_FORGE_DORA, or <home>/support/bin/dora) to the Forge 1 dora CLI (0.4.1 baseline)`
    });
  } else if (doraVersion === void 0) {
    push({
      id: "dora",
      status: "warn",
      code: EnvironmentCode.doraVersion,
      detail: `${dora} answered without a version: ${firstLine(doraProbe.text)}`,
      hint: "expected `dora-cli 0.4.x`"
    });
  } else if (`${doraVersion.major}.${doraVersion.minor}` !== DORA_REFERENCE_MINOR) {
    push({
      id: "dora",
      status: "warn",
      code: EnvironmentCode.doraVersion,
      detail: `dora-cli ${formatVersion(doraVersion)} at ${dora}; Forge 1 baseline is ${DORA_REFERENCE_MINOR}.1`,
      hint: "Forge 1 dataflows are validated against dora 0.4.1; pin runtime.dora to it"
    });
  } else {
    push({ id: "dora", status: "pass", detail: `dora-cli ${formatVersion(doraVersion)} (${dora})` });
  }
  const dora1 = resolveCli(options.dora1, env["DSH_FORGE_DORA1"], options.home, "dora1");
  const dora1Probe = await probe(dora1, ["--version"], exec);
  const dora1Version = parseVersion(dora1Probe.text);
  if (!dora1Probe.ok) {
    push({
      id: "dora1",
      status: "fail",
      code: EnvironmentCode.dora1Missing,
      detail: `${dora1}: ${firstLine(dora1Probe.text)}`,
      hint: "set runtime.dora1 (or DSH_FORGE_DORA1, or <home>/support/bin/dora1) to the Forge 2 dora CLI (>=1.0.1,<2)"
    });
  } else if (dora1Version === void 0) {
    push({
      id: "dora1",
      status: "fail",
      code: EnvironmentCode.dora1Version,
      detail: `${dora1} answered without a version: ${firstLine(dora1Probe.text)}`,
      hint: "expected `dora-cli >=1.0.1,<2`"
    });
  } else if (!atLeast(dora1Version, parseRequired(DORA1_MIN)) || dora1Version.major >= DORA1_MAX_MAJOR) {
    push({
      id: "dora1",
      status: "fail",
      code: EnvironmentCode.dora1Version,
      detail: `dora-cli ${formatVersion(dora1Version)} at ${dora1} is outside >=${DORA1_MIN},<${DORA1_MAX_MAJOR}`,
      hint: `install dora-cli ${DORA1_MIN} or newer 1.x and point runtime.dora1 at it`
    });
  } else {
    push({ id: "dora1", status: "pass", detail: `dora-cli ${formatVersion(dora1Version)} (${dora1})` });
  }
  const python = env["DSH_FORGE_PYTHON"] ?? "python3";
  const pythonProbe = await probe(python, ["--version"], exec);
  const pythonVersion = parseVersion(pythonProbe.text);
  if (!pythonProbe.ok) {
    push({
      id: "python",
      status: "warn",
      code: EnvironmentCode.pythonMissing,
      detail: `${python}: ${firstLine(pythonProbe.text)}`,
      hint: "only Forge 2 source skills need Python; install python3 >= 3.10 to run them"
    });
  } else if (pythonVersion === void 0) {
    push({
      id: "python",
      status: "warn",
      code: EnvironmentCode.pythonVersion,
      detail: `${python} answered without a version: ${firstLine(pythonProbe.text)}`,
      hint: `expected Python >= ${MIN_PYTHON}`
    });
  } else if (!atLeast(pythonVersion, parseRequired(MIN_PYTHON))) {
    push({
      id: "python",
      status: "warn",
      code: EnvironmentCode.pythonVersion,
      detail: `Python ${formatVersion(pythonVersion)} is below ${MIN_PYTHON}`,
      hint: `upgrade to Python ${MIN_PYTHON} or newer for Forge 2 source skills`
    });
  } else {
    push({ id: "python", status: "pass", detail: `Python ${formatVersion(pythonVersion)} (${python})` });
  }
  const homeReady = await prepareHome(options.home, push, EnvironmentCode.homeUnwritable);
  if (homeReady) {
    const free = await freeBytes(options.home);
    if (free === void 0) {
      push({ id: "disk", status: "warn", detail: "free space unavailable for the data root" });
    } else {
      const detail = `${(free / GIB).toFixed(1)} GiB free under ${options.home}`;
      if (free < DISK_FAIL_BYTES) {
        push({
          id: "disk",
          status: "fail",
          code: EnvironmentCode.diskLow,
          detail,
          hint: "node artifacts and MuJoCo models need multiple GiB; free space or move the data root"
        });
      } else if (free < DISK_WARN_BYTES) {
        push({
          id: "disk",
          status: "warn",
          code: EnvironmentCode.diskLow,
          detail,
          hint: "a single skill install can consume several GiB"
        });
      } else {
        push({ id: "disk", status: "pass", detail });
      }
    }
  }
  const modelsRoot = resolveForgeModelsRoot(options.home, options.modelsRoot, env);
  const modelListing = await new ModelStore(modelsRoot).list();
  if (modelListing.diagnostics.length > 0) {
    push({
      id: "models",
      status: "warn",
      detail: `${modelListing.count} model(s) under ${modelsRoot} (${modelListing.diagnostics.length} diagnostic(s))`,
      hint: modelListing.diagnostics[0]?.message
    });
  } else if (!modelListing.exists) {
    push({
      id: "models",
      status: "pass",
      detail: `no models installed yet (${modelsRoot})`
    });
  } else {
    push({
      id: "models",
      status: "pass",
      detail: `${modelListing.count} model(s), ${(modelListing.totalBytes / GIB).toFixed(2)} GiB under ${modelsRoot}`
    });
  }
  const variables = [
    "DSH_FORGE_HOME",
    "DSH_FORGE_MODELS",
    "DSH_FORGE_DORA",
    "DSH_FORGE_DORA1",
    "DSH_FORGE_PYTHON",
    "DSH_FORGE_REGISTRY_URL",
    "DSH_FORGE_REGISTRY_TOKEN"
  ];
  const present = variables.filter((name) => (env[name] ?? "").length > 0);
  push({
    id: "variables",
    status: "pass",
    detail: present.length === 0 ? "none set; defaults apply" : `set: ${present.join(", ")}`
  });
  push(await checkRegistry({
    offline: options.offline === true,
    url: options.registryUrl,
    timeoutMs: options.registryTimeoutMs ?? 5e3,
    fetchImpl: options.fetch ?? fetch
  }));
  const skills = options.skills ?? [];
  if (skills.length === 0) {
    push({
      id: "ports",
      status: "warn",
      code: EnvironmentCode.noSkills,
      detail: "no skill installed, so no gateway port is claimed yet",
      hint: "install a skill with forge_skill_install or drop a bundle under <home>/skills"
    });
  } else {
    for (const url of uniqueGatewayUrls(skills)) {
      const busy = await portBusy(url);
      push(busy ? {
        id: `port.${idSafe(url)}`,
        status: "warn",
        code: EnvironmentCode.portBusy,
        detail: `${url} is already in use`,
        hint: "stop the process holding it, or change gateway_url in the skill manifest"
      } : { id: `port.${idSafe(url)}`, status: "pass", detail: `${url} is free` });
    }
  }
  const stateFile = options.stateFile ?? join3(options.home, "runtime", "state.json");
  const envRoot = options.envRoot ?? join3(options.home, "runtime", "env");
  const persisted = await readRuntimeState(stateFile);
  const envDirs = await listEnvDirs(envRoot);
  const instances = [];
  for (const runtime of persisted.state) {
    const envDir = runtime.envDir;
    const envDirExists = envDir !== void 0 && envDirs.includes(envDir);
    const lock = envDirExists && envDir !== void 0 ? await readRuntimeLock(envDir) : void 0;
    instances.push({ ...runtime, envDirExists, ...lock === void 0 ? {} : { lock } });
  }
  const referenced = new Set(instances.flatMap((instance) => instance.envDir === void 0 ? [] : [instance.envDir]));
  const orphans = envDirs.filter((dir) => !referenced.has(dir));
  const runtimeContext = {
    stateFile,
    envRoot,
    stateExists: persisted.exists,
    instances,
    envDirs: envDirs.length,
    orphans,
    isolation: runtimeIsolation(envRoot)
  };
  if (!persisted.exists) {
    push({
      id: "runtime.state",
      status: "warn",
      detail: `no runtime recorded yet (${stateFile})`,
      hint: "the file appears with the first forge_runtime_start"
    });
  } else if (persisted.error !== void 0) {
    push({
      id: "runtime.state",
      status: "warn",
      code: EnvironmentCode.runtimeStateBroken,
      detail: `${stateFile}: ${persisted.error}`,
      hint: "the next start rewrites the file; delete it only when it stays corrupt"
    });
  } else {
    push({ id: "runtime.state", status: "pass", detail: `${instances.length} runtime(s) recorded` });
  }
  const missing = instances.filter((instance) => instance.envDir !== void 0 && !instance.envDirExists);
  if (missing.length > 0) {
    push({
      id: "runtime.env",
      status: "warn",
      code: EnvironmentCode.envMissing,
      detail: `${missing.length} recorded runtime(s) lost their env dir: ${missing.map((instance) => `${instance.skill}/${instance.profile ?? "?"}`).join(", ")}`,
      hint: "start the skill again to re-materialize its isolated environment"
    });
  } else if (instances.length === 0) {
    push(orphans.length > 0 ? {
      id: "runtime.env",
      status: "warn",
      code: EnvironmentCode.envStale,
      detail: `${orphans.length} leftover env dir(s) with no recorded runtime`,
      hint: `inspect ${envRoot}; remove directories for skills/profiles you no longer run`
    } : { id: "runtime.env", status: "warn", detail: `no isolated env dir yet under ${envRoot}` });
  } else {
    push({ id: "runtime.env", status: "pass", detail: `${instances.length} isolated env dir(s) present` });
  }
  if (instances.length > 0) {
    push(orphans.length === 0 ? { id: "runtime.orphans", status: "pass", detail: "no orphan env dir" } : {
      id: "runtime.orphans",
      status: "warn",
      code: EnvironmentCode.envStale,
      detail: `${orphans.length} env dir(s) not referenced by any recorded runtime`,
      hint: `inspect ${envRoot} and remove directories for skills/profiles you no longer run`
    });
  }
  const summary = {
    pass: checks.filter((check) => check.status === "pass").length,
    warn: checks.filter((check) => check.status === "warn").length,
    fail: checks.filter((check) => check.status === "fail").length
  };
  const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const base = {
    ok: summary.fail === 0,
    generatedAt,
    home: options.home,
    platform,
    node: `v${nodeVersion}`,
    summary,
    checks,
    runtime: runtimeContext
  };
  if (options.writeReport === false)
    return base;
  const path = await writeReport(base);
  return path === void 0 ? base : { ...base, path };
}
function resolveCli(explicit, override, home2, name) {
  if (explicit !== void 0 && explicit.length > 0)
    return explicit;
  if (override !== void 0 && override.length > 0)
    return override;
  const local = join3(home2, "support", "bin", name);
  return existsSync(local) ? local : name;
}
var defaultExec = async (file, args) => {
  const { stdout, stderr } = await execFileAsync(file, [...args], { timeout: 5e3 });
  return { stdout, stderr };
};
async function probe(file, args, exec) {
  try {
    const { stdout, stderr } = await exec(file, args);
    return { ok: true, text: `${stdout}${stderr ?? ""}`.trim() };
  } catch (error) {
    const failed = error;
    const text = `${failed.stdout ?? ""}${failed.stderr ?? ""}`.trim();
    return { ok: false, text: text.length > 0 ? text : failed.message ?? String(error) };
  }
}
function parseVersion(text) {
  const match = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(text);
  if (match === null)
    return void 0;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3] ?? 0) };
}
function parseRequired(text) {
  const parsed = parseVersion(text);
  if (parsed === void 0)
    throw new Error(`not a version: ${text}`);
  return parsed;
}
function atLeast(version, minimum) {
  if (version.major !== minimum.major)
    return version.major > minimum.major;
  if (version.minor !== minimum.minor)
    return version.minor > minimum.minor;
  return version.patch >= minimum.patch;
}
function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}
function firstLine(text) {
  const line = text.split("\n").find((candidate) => candidate.trim().length > 0);
  return line === void 0 ? "no output" : line.trim();
}
async function prepareHome(home2, push, code) {
  const marker = join3(home2, `.environment-check-${process.pid}`);
  try {
    await mkdir(home2, { recursive: true });
    await writeFile(marker, "ok\n", { mode: 384 });
    await rm(marker, { force: true });
    push({ id: "home", status: "pass", detail: `${home2} is writable` });
    return true;
  } catch (error) {
    push({
      id: "home",
      status: "fail",
      code,
      detail: `${home2}: ${error.message}`,
      hint: "fix ownership or point home at a writable directory"
    });
    return false;
  }
}
async function freeBytes(path) {
  try {
    const info = await statfs(path);
    return Number(info.bavail) * Number(info.bsize);
  } catch {
    return void 0;
  }
}
async function checkRegistry(options) {
  if (options.offline) {
    return { id: "registry", status: "warn", detail: "probe skipped (offline)" };
  }
  if (options.url === void 0 || options.url.length === 0) {
    return {
      id: "registry",
      status: "warn",
      code: EnvironmentCode.registryUnreachable,
      detail: "no registry URL configured",
      hint: "set registry.url or DSH_FORGE_REGISTRY_URL; offline installs work from <home>/skills"
    };
  }
  const started = Date.now();
  try {
    const response = await options.fetchImpl(options.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(options.timeoutMs)
    });
    const elapsed = Date.now() - started;
    const reachable = response.status < 500;
    return reachable ? { id: "registry", status: "pass", detail: `HTTP ${response.status} in ${elapsed} ms (${options.url})` } : {
      id: "registry",
      status: "warn",
      code: EnvironmentCode.registryUnreachable,
      detail: `HTTP ${response.status} in ${elapsed} ms (${options.url})`,
      hint: "the registry answered with a server error; installs may fail"
    };
  } catch (error) {
    return {
      id: "registry",
      status: "warn",
      code: EnvironmentCode.registryUnreachable,
      detail: `${options.url}: ${error.message}`,
      hint: "online installs need a reachable registry; offline installs can drop bundles under <home>/skills"
    };
  }
}
function uniqueGatewayUrls(skills) {
  const seen = /* @__PURE__ */ new Set();
  const urls = [];
  for (const skill of skills) {
    const url = skill.gatewayUrl;
    if (url === void 0 || url.length === 0 || seen.has(url))
      continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}
async function portBusy(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const port = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));
  if (!Number.isInteger(port) || port <= 0)
    return false;
  return new Promise((resolvePort) => {
    const socket = connect({ host: parsed.hostname, port });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolvePort(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolvePort(false);
    });
    socket.once("error", () => resolvePort(false));
  });
}
function idSafe(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port.length > 0 ? parsed.port : "default"}`;
  } catch {
    return url.replace(/[^a-z0-9]+/gi, "-");
  }
}
async function writeReport(report) {
  try {
    const dir = join3(report.home, REPORT_DIR);
    const stamp3 = report.generatedAt.replace(/[:.]/g, "-");
    const path = join3(dir, `env-${stamp3}.json`);
    await mkdir(dir, { recursive: true });
    await writeFile(path, `${JSON.stringify(report, null, 2)}
`, { mode: 384 });
    return path;
  } catch {
    return void 0;
  }
}
var INJECTED_VARIABLES = [
  "FORGE_RUNTIME_BIN",
  "FORGE_MODELS_DIR",
  "PAOS_SKILL_ROOT",
  "PAOS_SKILL_NAME",
  "PAOS_SKILL_VERSION",
  "PAOS_RUNTIME_INSTANCE_ID",
  "FORGE_FLOW_ID"
];
function runtimeIsolation(envRoot) {
  return {
    envDirTemplate: join3(envRoot, "<skill>", "<profile>", "<hash>"),
    injected: INJECTED_VARIABLES,
    launch: {
      start: "coordinator flow: dora up + dora start --detach, stopped by flow name; state.json keeps dora and launch=start",
      run: "isolated process: dora run in its own process group, pid recorded in state.json, stopped by killing the group"
    }
  };
}
async function readRuntimeState(file) {
  let text;
  try {
    text = await readFile2(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT")
      return { exists: false, state: [] };
    return { exists: true, error: error.message, state: [] };
  }
  try {
    const parsed = JSON.parse(text);
    const state = [];
    for (const [skill, value] of Object.entries(parsed.skills ?? {})) {
      const runtime = pickRuntime(skill, value);
      if (runtime !== void 0)
        state.push(runtime);
    }
    return { exists: true, state };
  } catch (error) {
    return { exists: true, error: error.message, state: [] };
  }
}
function pickRuntime(skill, value) {
  if (typeof value !== "object" || value === null)
    return void 0;
  const record = value;
  const text = (key) => typeof record[key] === "string" ? record[key] : void 0;
  const status = text("status") ?? "unknown";
  const profile = text("profile");
  const flow = text("flow");
  const dora = text("dora");
  const forgeVersion = text("forgeVersion");
  const gatewayUrl = text("gatewayUrl");
  const envDir = text("envDir");
  const startedAt = text("startedAt");
  const launch = record["launch"] === "run" ? "run" : record["launch"] === "start" ? "start" : void 0;
  return {
    skill,
    status,
    ...profile === void 0 ? {} : { profile },
    ...flow === void 0 ? {} : { flow },
    ...launch === void 0 ? {} : { launch },
    ...dora === void 0 ? {} : { dora },
    ...forgeVersion === void 0 ? {} : { forgeVersion },
    ...gatewayUrl === void 0 ? {} : { gatewayUrl },
    ...envDir === void 0 ? {} : { envDir },
    ...startedAt === void 0 ? {} : { startedAt }
  };
}
async function readRuntimeLock(envDir) {
  try {
    const parsed = JSON.parse(await readFile2(join3(envDir, "runtime-lock.json"), "utf8"));
    const version = typeof parsed.version === "string" ? parsed.version : void 0;
    const artifacts = typeof parsed.artifacts === "object" && parsed.artifacts !== null ? Object.keys(parsed.artifacts).length : void 0;
    const summary = {};
    if (version !== void 0)
      summary.version = version;
    if (artifacts !== void 0)
      summary.artifacts = artifacts;
    return summary;
  } catch {
    return void 0;
  }
}
async function listEnvDirs(envRoot) {
  const dirs = [];
  for (const skill of await readdirSafe2(envRoot)) {
    const skillDir = join3(envRoot, skill);
    if (!await isDirectory(skillDir))
      continue;
    for (const profile of await readdirSafe2(skillDir)) {
      const profileDir = join3(skillDir, profile);
      if (!await isDirectory(profileDir))
        continue;
      for (const hash of await readdirSafe2(profileDir)) {
        const dir = join3(profileDir, hash);
        if (await isDirectory(dir))
          dirs.push(dir);
      }
    }
  }
  return dirs;
}
async function readdirSafe2(path) {
  try {
    const entries = await readdir2(path);
    return entries.filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}
async function isDirectory(path) {
  try {
    return (await stat2(path)).isDirectory();
  } catch {
    return false;
  }
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/settings.js
var import_yaml = __toESM(require_dist(), 1);
import { copyFile, readFile as readFile3, readdir as readdir3, rename, stat as stat3, writeFile as writeFile2 } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import { join as join4, resolve as resolve2 } from "node:path";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/errors.js
var ForgeError = class extends Error {
  code;
  path;
  constructor(code, message, path) {
    super(`${code}: ${message}`);
    this.code = code;
    this.path = path;
    this.name = "ForgeError";
  }
};
var ErrorCode = {
  manifestInvalid: "FORGE_MANIFEST_INVALID",
  skillDocMissing: "FORGE_SKILL_DOC_MISSING",
  profileUnknown: "FORGE_PROFILE_UNKNOWN",
  dataflowMissing: "FORGE_DATAFLOW_MISSING",
  assetMissing: "FORGE_ASSET_MISSING",
  nodeMissing: "FORGE_NODE_MISSING",
  modelMissing: "FORGE_MODEL_MISSING",
  forgeVersion: "FORGE_FORGE_VERSION",
  registryUnavailable: "FORGE_REGISTRY_UNAVAILABLE"
};

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/settings.js
var FORGE_ROW_ID = "forge-skill";
var DshProfileStore = class {
  root;
  constructor(options = {}) {
    const dshHome = process.env["DSH_HOME"];
    this.root = options.profilesRoot ?? (dshHome === void 0 || dshHome.length === 0 ? join4(homedir2(), ".dsh", "profiles") : join4(resolve2(dshHome), "profiles"));
  }
  /** Profiles that look like a DSH profile (they carry a package.json). */
  async listProfiles() {
    let entries;
    try {
      entries = await readdir3(this.root, { withFileTypes: true });
    } catch {
      return [];
    }
    const names = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith("."))
        continue;
      try {
        await stat3(join4(this.root, entry.name, "package.json"));
        names.push(entry.name);
      } catch {
      }
    }
    return names.sort();
  }
  /** Read the current row config for one profile. */
  async read(profile) {
    const path = this.patchPath(profile);
    const raw = await readFile3(path, "utf8").catch(() => "");
    const doc = (0, import_yaml.parseDocument)(raw.length === 0 ? "[]\n" : raw);
    const row = findRow(doc.contents);
    const node = row?.get("config");
    const config = node?.toJSON?.() ?? {};
    return { profile, path, rowExists: row !== void 0, config, raw };
  }
  /** Validate and write the row config, returning the backup path. */
  async write(profile, config) {
    const normalized = validateConfig(config);
    const path = this.patchPath(profile);
    const raw = await readFile3(path, "utf8").catch(() => void 0);
    const doc = (0, import_yaml.parseDocument)(raw ?? "[]\n");
    if (!(0, import_yaml.isSeq)(doc.contents)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `${path} does not contain a top-level list`);
    }
    const seq = doc.contents;
    if (seq.flow === true)
      seq.flow = false;
    let row = findRow(seq);
    if (row === void 0) {
      const node = doc.createNode({ id: FORGE_ROW_ID, config: normalized });
      seq.add(node);
    } else {
      row.set("config", doc.createNode(normalized));
      if (row.flow === true)
        row.flow = false;
    }
    const text = String(doc);
    let backup;
    if (raw !== void 0) {
      backup = `${path}.bak-${stamp()}`;
      await copyFile(path, backup);
    }
    const temp = `${path}.tmp-${process.pid}`;
    await writeFile2(temp, text, { mode: 384 });
    await rename(temp, path);
    return { path, ...backup === void 0 ? {} : { backup } };
  }
  /** Backups created by this store, newest first. */
  async listBackups(profile) {
    const path = this.patchPath(profile);
    const dir = path.slice(0, path.lastIndexOf("/"));
    const base = path.slice(path.lastIndexOf("/") + 1);
    let names = [];
    try {
      names = (await readdir3(dir)).filter((name) => name.startsWith(`${base}.bak-`));
    } catch {
      return [];
    }
    const backups = [];
    for (const name of names) {
      try {
        const info = await stat3(join4(dir, name));
        backups.push({ file: name, at: new Date(info.mtimeMs).toISOString(), size: info.size });
      } catch {
      }
    }
    return backups.sort((left, right) => right.at.localeCompare(left.at));
  }
  /** Restore one backup, keeping the current file as another backup first. */
  async restoreBackup(profile, file) {
    const path = this.patchPath(profile);
    if (!/^[A-Za-z0-9._-]+\.bak-[0-9-]+$/.test(file)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `invalid backup name "${file}"`);
    }
    if (!file.startsWith("cordis.patch.yml.bak-")) {
      throw new ForgeError("FORGE_CONFIG_INVALID", "backup does not belong to this profile");
    }
    const source = join4(path.slice(0, path.lastIndexOf("/")), file);
    const content = await readFile3(source, "utf8");
    let previous;
    try {
      await stat3(path);
      previous = `${path}.bak-${stamp()}`;
      await copyFile(path, previous);
    } catch {
      previous = void 0;
    }
    const temp = `${path}.tmp-${process.pid}`;
    await writeFile2(temp, content, { mode: 384 });
    await rename(temp, path);
    return { path, restored: file, ...previous === void 0 ? {} : { previous } };
  }
  patchPath(profile) {
    if (!/^[A-Za-z0-9._-]+$/.test(profile)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `invalid profile name "${profile}"`);
    }
    return join4(this.root, profile, "cordis.patch.yml");
  }
};
function findRow(contents) {
  if (!(0, import_yaml.isSeq)(contents))
    return void 0;
  for (const item of contents.items) {
    if ((0, import_yaml.isMap)(item) && item.get("id") === FORGE_ROW_ID)
      return item;
  }
  return void 0;
}
function validateConfig(input2) {
  if (input2 === null || typeof input2 !== "object" || Array.isArray(input2)) {
    throw new ForgeError("FORGE_CONFIG_INVALID", "config must be an object");
  }
  const source = input2;
  const config = {};
  const string = (value, key) => {
    if (typeof value !== "string")
      throw new ForgeError("FORGE_CONFIG_INVALID", `${key} must be a string`);
    return value;
  };
  const number = (value, key) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `${key} must be a non-negative number`);
    }
    return value;
  };
  const boolean = (value, key) => {
    if (typeof value !== "boolean")
      throw new ForgeError("FORGE_CONFIG_INVALID", `${key} must be a boolean`);
    return value;
  };
  const record = (value, key) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `${key} must be an object`);
    }
    return value;
  };
  const allowed = /* @__PURE__ */ new Set(["home", "skills", "models", "registry", "runtime", "gateway", "ui"]);
  for (const key of Object.keys(source)) {
    if (!allowed.has(key))
      throw new ForgeError("FORGE_CONFIG_INVALID", `unknown config key "${key}"`);
  }
  if (source["home"] !== void 0)
    config.home = string(source["home"], "home");
  if (source["skills"] !== void 0) {
    const skills = record(source["skills"], "skills");
    for (const key of Object.keys(skills))
      if (key !== "roots" && key !== "watch")
        throw new ForgeError("FORGE_CONFIG_INVALID", `unknown key skills.${key}`);
    config.skills = {};
    if (skills["roots"] !== void 0) {
      if (!Array.isArray(skills["roots"]) || skills["roots"].some((item) => typeof item !== "string")) {
        throw new ForgeError("FORGE_CONFIG_INVALID", "skills.roots must be an array of strings");
      }
      config.skills.roots = skills["roots"];
    }
    if (skills["watch"] !== void 0)
      config.skills.watch = boolean(skills["watch"], "skills.watch");
  }
  if (source["models"] !== void 0) {
    const models = record(source["models"], "models");
    for (const key of Object.keys(models))
      if (key !== "root" && key !== "mirror")
        throw new ForgeError("FORGE_CONFIG_INVALID", `unknown key models.${key}`);
    config.models = {};
    if (models["root"] !== void 0)
      config.models.root = string(models["root"], "models.root");
    if (models["mirror"] !== void 0)
      config.models.mirror = string(models["mirror"], "models.mirror");
  }
  if (source["registry"] !== void 0) {
    const registry = record(source["registry"], "registry");
    for (const key of Object.keys(registry))
      if (!["url", "timeoutMs", "token", "tokenEnv"].includes(key))
        throw new ForgeError("FORGE_CONFIG_INVALID", `unknown key registry.${key}`);
    config.registry = {};
    if (registry["url"] !== void 0)
      config.registry.url = string(registry["url"], "registry.url");
    if (registry["timeoutMs"] !== void 0)
      config.registry.timeoutMs = number(registry["timeoutMs"], "registry.timeoutMs");
    if (registry["token"] !== void 0)
      config.registry.token = string(registry["token"], "registry.token");
    if (registry["tokenEnv"] !== void 0)
      config.registry.tokenEnv = string(registry["tokenEnv"], "registry.tokenEnv");
  }
  if (source["runtime"] !== void 0) {
    const runtime = record(source["runtime"], "runtime");
    for (const key of Object.keys(runtime))
      if (!["dora", "dora1", "startTimeoutMs"].includes(key))
        throw new ForgeError("FORGE_CONFIG_INVALID", `unknown key runtime.${key}`);
    config.runtime = {};
    if (runtime["dora"] !== void 0)
      config.runtime.dora = string(runtime["dora"], "runtime.dora");
    if (runtime["dora1"] !== void 0)
      config.runtime.dora1 = string(runtime["dora1"], "runtime.dora1");
    if (runtime["startTimeoutMs"] !== void 0)
      config.runtime.startTimeoutMs = number(runtime["startTimeoutMs"], "runtime.startTimeoutMs");
  }
  if (source["gateway"] !== void 0) {
    const gateway = record(source["gateway"], "gateway");
    for (const key of Object.keys(gateway))
      if (key !== "callTimeoutMs")
        throw new ForgeError("FORGE_CONFIG_INVALID", `unknown key gateway.${key}`);
    config.gateway = {};
    if (gateway["callTimeoutMs"] !== void 0)
      config.gateway.callTimeoutMs = number(gateway["callTimeoutMs"], "gateway.callTimeoutMs");
  }
  if (source["ui"] !== void 0) {
    const ui2 = record(source["ui"], "ui");
    for (const key of Object.keys(ui2))
      if (key !== "port" && key !== "enabled")
        throw new ForgeError("FORGE_CONFIG_INVALID", `unknown key ui.${key}`);
    config.ui = {};
    if (ui2["port"] !== void 0)
      config.ui.port = number(ui2["port"], "ui.port");
    if (ui2["enabled"] !== void 0)
      config.ui.enabled = boolean(ui2["enabled"], "ui.enabled");
  }
  return config;
}
var backupCounter = 0;
function stamp() {
  const now = /* @__PURE__ */ new Date();
  const pad = (value) => String(value).padStart(2, "0");
  backupCounter += 1;
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${String(now.getMilliseconds()).padStart(3, "0")}-${backupCounter}`;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/bootstrap.js
var execFileAsync2 = promisify2(execFile2);
var DEFAULT_DORA_VERSION = "0.4.1";
var DEFAULT_DORA1_VERSION = "1.0.1";
async function bootstrapEnvironment(options) {
  const env = options.env ?? process.env;
  const exec = options.exec ?? defaultExec2;
  const paths = forgePaths(options.home, options.modelsRoot);
  const supportRoot = join5(paths.home, "support");
  const supportBin = join5(supportRoot, "bin");
  const doraTarget = join5(supportBin, "dora");
  const dora1Target = join5(supportBin, "dora1");
  const doraVersion = options.doraVersion ?? DEFAULT_DORA_VERSION;
  const dora1Version = options.dora1Version ?? DEFAULT_DORA1_VERSION;
  const dryRun = options.dryRun === true;
  const force = options.force === true;
  const requested = new Set(options.components ?? (options.writeProfileConfig === true ? ["directories", "dora", "dora1", "profileConfig"] : ["directories", "dora", "dora1"]));
  if (options.writeProfileConfig === true)
    requested.add("profileConfig");
  const steps = [];
  const installer = await detectInstaller(options.python, env, exec);
  let privateModels = resolve3(paths.models) === resolve3(join5(paths.home, "models"));
  if (privateModels) {
    try {
      privateModels = !(await lstat(paths.models)).isSymbolicLink();
    } catch (error) {
      if (error.code !== "ENOENT")
        throw error;
    }
  }
  const managedDirs = [
    paths.home,
    paths.skills,
    // A non-default model root is a read-only shared asset, not managed storage.
    ...privateModels ? [paths.models, join5(paths.models, "cache")] : [join5(paths.runtime, "cache", "models")],
    supportRoot,
    supportBin,
    paths.runtime
  ];
  if (requested.has("directories")) {
    if (dryRun) {
      steps.push({
        id: "directories",
        status: "planned",
        target: paths.home,
        detail: `ensure Forge directories under ${paths.home} (skills, models, support/bin, runtime)`
      });
    } else {
      try {
        for (const dir of managedDirs)
          await mkdir2(dir, { recursive: true });
        steps.push({
          id: "directories",
          status: "updated",
          target: paths.home,
          detail: `ensured Forge directories under ${paths.home}; shared model roots are never created or written`
        });
      } catch (error) {
        steps.push({
          id: "directories",
          status: "failed",
          target: paths.home,
          detail: `failed to create Forge directories: ${error.message}`,
          hint: "check write permissions on the Forge home and models root"
        });
      }
    }
  } else {
    steps.push({ id: "directories", status: "skipped", target: paths.home, detail: "not requested" });
  }
  const doraSummary = await setupDoraGeneration({
    id: "dora",
    enabled: requested.has("dora"),
    generation: "1",
    targetBin: doraTarget,
    venvDir: join5(supportRoot, "dora-venv"),
    pinnedVersion: doraVersion,
    localBinaryPath: options.doraBinaryPath,
    python: options.python,
    indexUrl: options.indexUrl,
    installer,
    force,
    dryRun,
    env,
    exec,
    steps
  });
  const dora1Summary = await setupDoraGeneration({
    id: "dora1",
    enabled: requested.has("dora1"),
    generation: "2",
    targetBin: dora1Target,
    venvDir: join5(supportRoot, "dora1-venv"),
    pinnedVersion: dora1Version,
    localBinaryPath: options.dora1BinaryPath,
    python: options.python,
    indexUrl: options.indexUrl,
    installer,
    force,
    dryRun,
    env,
    exec,
    steps
  });
  if (requested.has("profileConfig")) {
    const profile = options.profile ?? "web";
    const store = new DshProfileStore({ profilesRoot: options.profilesRoot });
    const snapshot = await store.read(profile);
    const nextConfig = mergeForgeRowConfig(snapshot.config, {
      runtime: {
        ...doraSummary.status !== "failed" ? { dora: doraTarget } : {},
        ...dora1Summary.status !== "failed" ? { dora1: dora1Target } : {}
      },
      ...options.modelsRoot !== void 0 && options.modelsRoot.length > 0 ? { models: { root: paths.models } } : {}
    });
    if (dryRun) {
      steps.push({
        id: "profileConfig",
        status: "planned",
        target: snapshot.path,
        detail: `update forge-skill config in profile "${profile}" (${snapshot.path}) with runtime.dora / runtime.dora1`
      });
    } else {
      try {
        const written = await store.write(profile, nextConfig);
        steps.push({
          id: "profileConfig",
          status: "updated",
          target: written.path,
          detail: `updated profile "${profile}" (${written.path})${written.backup ? `; backup: ${written.backup}` : ""}`
        });
      } catch (error) {
        steps.push({
          id: "profileConfig",
          status: "failed",
          target: snapshot.path,
          detail: `failed to update profile "${profile}": ${error.message}`,
          hint: "verify the profile directory exists and cordis.patch.yml contains a valid YAML list"
        });
      }
    }
  } else {
    steps.push({
      id: "profileConfig",
      status: "skipped",
      detail: "not requested (<home>/support/bin/{dora,dora1} is auto-discovered without editing cordis.patch.yml)"
    });
  }
  const stepFailed = steps.some((step) => step.status === "failed");
  let environment;
  if (!dryRun && options.verify !== false) {
    const envExec = async (file, args) => exec(file, args, { timeoutMs: 5e3, env });
    environment = await checkEnvironment({
      home: paths.home,
      modelsRoot: paths.models,
      dora: existsSync2(doraTarget) ? doraTarget : void 0,
      dora1: existsSync2(dora1Target) ? dora1Target : void 0,
      registryUrl: options.registryUrl,
      skills: options.skills,
      offline: options.offline,
      env,
      exec: envExec
    });
  }
  const ok = !stepFailed && (environment === void 0 ? true : environment.ok);
  return {
    ok,
    dryRun,
    home: paths.home,
    modelsRoot: paths.models,
    supportBin,
    installer: installer.kind,
    dora: doraSummary,
    dora1: dora1Summary,
    steps,
    ...environment === void 0 ? {} : { environment }
  };
}
function mergeForgeRowConfig(current, patch) {
  const result = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === void 0)
      continue;
    const prev = result[key];
    if (isPlainObject(prev) && isPlainObject(value)) {
      result[key] = { ...prev, ...value };
    } else {
      result[key] = value;
    }
  }
  return result;
}
async function setupDoraGeneration(args) {
  const { id, generation, targetBin, venvDir, pinnedVersion, force, dryRun, env, exec, steps } = args;
  if (!args.enabled) {
    steps.push({ id, status: "skipped", target: targetBin, detail: "not requested" });
    return { path: targetBin, status: "skipped" };
  }
  if (!force && existsSync2(targetBin)) {
    const existing = await probeDoraVersion(targetBin, exec, env);
    if (existing.ok && existing.version !== void 0 && matchesGeneration(generation, existing.version)) {
      const formatted2 = formatVersion2(existing.version);
      steps.push({
        id,
        status: "kept",
        target: targetBin,
        version: formatted2,
        detail: `dora-cli ${formatted2} already ready at ${targetBin} (pass force=true to reinstall)`
      });
      return { path: targetBin, version: formatted2, status: "kept" };
    }
  }
  if (args.localBinaryPath !== void 0 && args.localBinaryPath.length > 0) {
    const source = resolve3(expandHome(args.localBinaryPath));
    const command = `install ${source} -> ${targetBin}`;
    if (dryRun) {
      steps.push({
        id,
        status: "planned",
        target: targetBin,
        command,
        detail: `copy local executable ${source} to ${targetBin} and verify Forge ${generation} version`
      });
      return { path: targetBin, status: "planned" };
    }
    const probe3 = await probeDoraVersion(source, exec, env);
    if (!probe3.ok || probe3.version === void 0 || !matchesGeneration(generation, probe3.version)) {
      steps.push({
        id,
        status: "failed",
        target: targetBin,
        command,
        detail: `${source} is not a valid Forge ${generation} dora binary: ${probe3.text}`,
        hint: generation === "1" ? "provide a dora-cli 0.4.x executable (baseline 0.4.1)" : "provide a dora-cli >=1.0.1,<2 executable"
      });
      return { path: targetBin, status: "failed" };
    }
    try {
      await mkdir2(join5(targetBin, ".."), { recursive: true });
      await rm2(targetBin, { force: true });
      await copyFile2(source, targetBin);
      await chmod(targetBin, 493);
      const formatted2 = formatVersion2(probe3.version);
      steps.push({
        id,
        status: "installed",
        target: targetBin,
        version: formatted2,
        command,
        detail: `installed dora-cli ${formatted2} from ${source} to ${targetBin}`
      });
      return { path: targetBin, version: formatted2, status: "installed" };
    } catch (error) {
      steps.push({
        id,
        status: "failed",
        target: targetBin,
        command,
        detail: `failed to copy ${source} to ${targetBin}: ${error.message}`
      });
      return { path: targetBin, status: "failed" };
    }
  }
  if (args.installer.kind === "none" || args.installer.command === void 0) {
    steps.push({
      id,
      status: "failed",
      target: targetBin,
      detail: `no uv or Python interpreter found to create ${venvDir}`,
      hint: "install uv (recommended) or python3 >= 3.11 with venv/pip, or supply doraBinaryPath / dora1BinaryPath"
    });
    return { path: targetBin, status: "failed" };
  }
  const venvPython = join5(venvDir, "bin", "python");
  const venvDora = join5(venvDir, "bin", "dora");
  const pkgSpec = `dora-rs-cli==${pinnedVersion}`;
  const indexArgs = args.indexUrl !== void 0 && args.indexUrl.length > 0 ? ["--index-url", args.indexUrl] : [];
  const pythonSpec = args.python !== void 0 && args.python.length > 0 ? args.python : "3.12";
  const createCmd = args.installer.kind === "uv" ? [args.installer.command, ["venv", "--python", pythonSpec, "--clear", venvDir]] : [args.installer.command, ["-m", "venv", "--clear", venvDir]];
  const installCmd = args.installer.kind === "uv" ? [args.installer.command, ["pip", "install", "--python", venvPython, ...indexArgs, pkgSpec]] : [venvPython, ["-m", "pip", "install", ...indexArgs, pkgSpec]];
  const displayCommand = `${formatCommand(createCmd)} && ${formatCommand(installCmd)}`;
  if (dryRun) {
    steps.push({
      id,
      status: "planned",
      target: targetBin,
      version: pinnedVersion,
      command: displayCommand,
      detail: `install ${pkgSpec} into isolated venv ${venvDir} via ${args.installer.kind} and link ${targetBin}`
    });
    return { path: targetBin, version: pinnedVersion, status: "planned" };
  }
  try {
    await mkdir2(join5(targetBin, ".."), { recursive: true });
    if (force)
      await rm2(venvDir, { recursive: true, force: true });
    await exec(createCmd[0], createCmd[1], { timeoutMs: 18e4, env });
    await exec(installCmd[0], installCmd[1], { timeoutMs: 3e5, env });
    await rm2(targetBin, { force: true });
    const relativeTarget = join5("..", `${id}-venv`, "bin", "dora");
    await symlink(relativeTarget, targetBin);
  } catch (error) {
    const failed = error;
    const output = `${failed.stderr ?? ""}
${failed.stdout ?? ""}`.trim();
    steps.push({
      id,
      status: "failed",
      target: targetBin,
      version: pinnedVersion,
      command: displayCommand,
      detail: `failed to install ${pkgSpec}: ${firstLine2(output.length > 0 ? output : failed.message ?? String(error))}`,
      hint: args.indexUrl === void 0 ? "if PyPI is slow or blocked, retry with indexUrl (e.g. a PyPI mirror) or supply a local binary path" : "check network access to the configured indexUrl and Python compatibility"
    });
    return { path: targetBin, status: "failed" };
  }
  const probe2 = await probeDoraVersion(existsSync2(targetBin) ? targetBin : venvDora, exec, env);
  if (!probe2.ok || probe2.version === void 0 || !matchesGeneration(generation, probe2.version)) {
    steps.push({
      id,
      status: "failed",
      target: targetBin,
      version: pinnedVersion,
      command: displayCommand,
      detail: `installed ${pkgSpec} but verification failed at ${targetBin}: ${probe2.text}`,
      hint: `expected Forge ${generation} dora-cli version; inspect ${venvDir}`
    });
    return { path: targetBin, status: "failed" };
  }
  const formatted = formatVersion2(probe2.version);
  steps.push({
    id,
    status: "installed",
    target: targetBin,
    version: formatted,
    command: displayCommand,
    detail: `installed dora-cli ${formatted} in ${venvDir} and linked ${targetBin}`
  });
  return { path: targetBin, version: formatted, status: "installed" };
}
async function detectInstaller(explicitPython, env, exec) {
  try {
    const { stdout } = await exec("uv", ["--version"], { timeoutMs: 5e3, env });
    return { kind: "uv", command: "uv", detail: firstLine2(stdout) };
  } catch {
  }
  const candidates = [
    explicitPython,
    env["DSH_FORGE_PYTHON"],
    "python3.12",
    "python3.11",
    "python3"
  ].filter((value, index, list) => value !== void 0 && value.length > 0 && list.indexOf(value) === index);
  for (const candidate of candidates) {
    try {
      const { stdout, stderr } = await exec(candidate, ["--version"], { timeoutMs: 5e3, env });
      const text = `${stdout}${stderr ?? ""}`.trim();
      if (parseVersion2(text) !== void 0) {
        return { kind: "python", command: candidate, detail: firstLine2(text) };
      }
    } catch {
    }
  }
  return { kind: "none", detail: "neither uv nor python3 is runnable" };
}
async function probeDoraVersion(binary, exec, env) {
  try {
    const { stdout, stderr } = await exec(binary, ["--version"], { timeoutMs: 5e3, env });
    const text = `${stdout}${stderr ?? ""}`.trim();
    const version = parseVersion2(text);
    return { ok: true, text, ...version === void 0 ? {} : { version } };
  } catch (error) {
    const failed = error;
    const text = `${failed.stdout ?? ""}${failed.stderr ?? ""}`.trim();
    return { ok: false, text: text.length > 0 ? text : failed.message ?? String(error) };
  }
}
function matchesGeneration(generation, version) {
  if (generation === "1")
    return version.major === 0 && version.minor === 4;
  return version.major === 1 && (version.minor > 0 || version.patch >= 1);
}
function parseVersion2(text) {
  const match = /\b(\d+)\.(\d+)(?:\.(\d+))?\b/.exec(text);
  if (match === null)
    return void 0;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] ?? "0")
  };
}
function formatVersion2(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}
function firstLine2(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length > 0) ?? "(no output)";
}
function formatCommand([file, args]) {
  return [file, ...args].map((part) => /\s/.test(part) ? JSON.stringify(part) : part).join(" ");
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var defaultExec2 = async (file, args, options) => {
  const { stdout, stderr } = await execFileAsync2(file, [...args], {
    timeout: options?.timeoutMs ?? 6e4,
    env: options?.env
  });
  return { stdout, stderr };
};

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/catalog.js
import { readdir as readdir4, readFile as readFile4, stat as stat4 } from "node:fs/promises";
import { join as join6 } from "node:path";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/forge-version.js
var SUPPORTED_FORGE_VERSIONS = ["1", "2"];
var DEFAULT_FORGE_VERSION = "1";
function isForgeGeneration(value) {
  return SUPPORTED_FORGE_VERSIONS.includes(value);
}
function forgeGenerationLabel(value) {
  return value === "2" ? "Forge 2 (dora 1.x, forge-tool 2.x)" : "Forge 1 (dora 0.4.1)";
}
function unsupportedForgeVersionDetail(value) {
  const supported = SUPPORTED_FORGE_VERSIONS.map((generation) => forgeGenerationLabel(generation)).join(", ");
  return `bundle targets Forge ${value}; this build implements ${supported}`;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/manifest.js
var import_yaml2 = __toESM(require_dist(), 1);
var MANIFEST_VERSION = 2;
var SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
var ARTIFACT_TYPES = /* @__PURE__ */ new Set(["executable_tar_gz", "directory_tar_gz"]);
var SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
var SHA256_HEX = /^[a-f0-9]{64}$/i;
var ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
function parseManifest(text, source = "skill.yaml") {
  const issues = [];
  const add = (path, code, message) => {
    issues.push({ path, code, message });
  };
  let raw;
  try {
    raw = (0, import_yaml2.parse)(text);
  } catch (error) {
    add(source, ErrorCode.manifestInvalid, `invalid YAML: ${error.message}`);
    return { issues };
  }
  if (!isRecord(raw)) {
    add(source, ErrorCode.manifestInvalid, "manifest root must be a mapping");
    return { issues };
  }
  if (raw["manifest_version"] !== MANIFEST_VERSION) {
    add("manifest_version", ErrorCode.manifestInvalid, `expected ${MANIFEST_VERSION}, got ${String(raw["manifest_version"])}`);
  }
  const forgeVersion = readForgeVersion(raw["forge_version"], add);
  const name = readString(raw, "name", add);
  if (name !== void 0 && !SKILL_NAME.test(name)) {
    add("name", ErrorCode.manifestInvalid, `"${name}" is not kebab-case`);
  }
  const version = readString(raw, "version", add);
  if (version !== void 0 && !SEMVER.test(version)) {
    add("version", ErrorCode.manifestInvalid, `"${version}" is not a semver version`);
  }
  const description = readString(raw, "description", add);
  if (description !== void 0 && description.trim().length === 0) {
    add("description", ErrorCode.manifestInvalid, "description must not be empty");
  }
  const skillDocument = readString(raw, "skill_document", add) ?? "SKILL.md";
  let gatewayUrl;
  const rawGateway = raw["gateway_url"];
  if (rawGateway !== void 0) {
    if (typeof rawGateway !== "string") {
      add("gateway_url", ErrorCode.manifestInvalid, "gateway_url must be a string");
    } else if (!isHttpUrl(rawGateway)) {
      add("gateway_url", ErrorCode.manifestInvalid, `"${rawGateway}" is not an http(s) URL`);
    } else {
      gatewayUrl = rawGateway;
    }
  } else {
    add("gateway_url", ErrorCode.manifestInvalid, "gateway_url is required");
  }
  const requiredTools = readStringArray(raw["required_tools"], "required_tools", add) ?? [];
  const requiredModels = readRequiredModels(raw["required_models"], "required_models", add);
  const profiles = readProfiles(raw["profiles"], add);
  const artifacts = readArtifacts(raw["artifacts"], add);
  if (issues.length > 0 || name === void 0 || version === void 0 || description === void 0) {
    return { issues };
  }
  const manifest = {
    name,
    version,
    forgeVersion,
    description,
    skillDocument,
    ...gatewayUrl === void 0 ? {} : { gatewayUrl },
    requiredTools,
    ...requiredModels.length === 0 ? {} : { requiredModels },
    profiles,
    artifacts
  };
  return { manifest, issues };
}
function toolsForProfile(manifest, profileId) {
  const profile = manifest.profiles[profileId];
  return profile?.requiredTools ?? manifest.requiredTools;
}
function modelsForProfile(manifest, profileId) {
  const merged = /* @__PURE__ */ new Map();
  for (const model of manifest.requiredModels ?? [])
    merged.set(model.id, model);
  const profile = manifest.profiles[profileId];
  for (const model of profile?.requiredModels ?? [])
    merged.set(model.id, model);
  return [...merged.values()];
}
function readForgeVersion(value, add) {
  if (value === void 0)
    return "1";
  if (typeof value === "number" && (value === 1 || value === 2))
    return value === 2 ? "2" : "1";
  if (typeof value !== "string") {
    add("forge_version", ErrorCode.manifestInvalid, 'forge_version must be "1" or "2"');
    return "1";
  }
  const text = value.trim();
  const major = text.split(".")[0];
  if (major === "1" || major === "2")
    return major;
  add("forge_version", ErrorCode.manifestInvalid, `"${text}" is not a supported Forge generation ("1" or "2")`);
  return "1";
}
function readProfiles(value, add) {
  if (!isRecord(value)) {
    add("profiles", ErrorCode.manifestInvalid, "profiles must be a mapping");
    return {};
  }
  const profiles = {};
  for (const [id, raw] of Object.entries(value)) {
    const base = `profiles.${id}`;
    if (!isRecord(raw)) {
      add(base, ErrorCode.manifestInvalid, "profile must be a mapping");
      continue;
    }
    const dataflow = readString(raw, "dataflow", add, base);
    if (dataflow === void 0) {
      add(`${base}.dataflow`, ErrorCode.manifestInvalid, "dataflow is required");
      continue;
    }
    profiles[id] = {
      id,
      dataflow,
      requiredBinaries: readStringArray(raw["required_binaries"], `${base}.required_binaries`, add) ?? [],
      requiredAssets: readStringArray(raw["required_assets"], `${base}.required_assets`, add) ?? [],
      requiredEnvironment: readStringArray(raw["required_environment"], `${base}.required_environment`, add) ?? [],
      environment: readStringMap(raw["environment"], `${base}.environment`, add),
      ...(() => {
        const requiredTools = readStringArray(raw["required_tools"], `${base}.required_tools`, add);
        return requiredTools === void 0 ? {} : { requiredTools };
      })(),
      ...(() => {
        const requiredModels = readRequiredModels(raw["required_models"], `${base}.required_models`, add);
        return requiredModels.length === 0 ? {} : { requiredModels };
      })()
    };
  }
  if (Object.keys(profiles).length === 0) {
    add("profiles", ErrorCode.manifestInvalid, "at least one profile is required");
  }
  return profiles;
}
function readArtifacts(value, add) {
  if (value === void 0)
    return {};
  if (!isRecord(value)) {
    add("artifacts", ErrorCode.manifestInvalid, "artifacts must be a mapping");
    return {};
  }
  const nodes = value["nodes"];
  if (nodes === void 0)
    return {};
  if (!isRecord(nodes)) {
    add("artifacts.nodes", ErrorCode.manifestInvalid, "artifacts.nodes must be a mapping");
    return {};
  }
  const artifacts = {};
  for (const [nodeId, raw] of Object.entries(nodes)) {
    const base = `artifacts.nodes.${nodeId}`;
    if (!isRecord(raw)) {
      add(base, ErrorCode.manifestInvalid, "artifact lock must be a mapping");
      continue;
    }
    const artifactId = readString(raw, "artifact_id", add, base);
    const version = readString(raw, "version", add, base);
    const platform = readString(raw, "platform", add, base);
    const arch = readString(raw, "arch", add, base);
    const artifactType = readString(raw, "artifact_type", add, base);
    const entrypoint = readString(raw, "entrypoint", add, base);
    if (artifactId === void 0 || version === void 0 || platform === void 0 || arch === void 0 || artifactType === void 0 || entrypoint === void 0) {
      continue;
    }
    if (!ARTIFACT_TYPES.has(artifactType)) {
      add(`${base}.artifact_type`, ErrorCode.manifestInvalid, `"${artifactType}" is not a known archive type`);
      continue;
    }
    const sha256 = readString(raw, "sha256", add, base);
    artifacts[nodeId] = {
      nodeId,
      artifactId,
      version,
      platform,
      arch,
      artifactType,
      entrypoint,
      ...sha256 === void 0 ? {} : { sha256 }
    };
  }
  return artifacts;
}
function readString(raw, key, add, base = "") {
  const value = raw[key];
  const path = base.length === 0 ? key : `${base}.${key}`;
  if (value === void 0)
    return void 0;
  if (typeof value !== "string") {
    add(path, ErrorCode.manifestInvalid, `${key} must be a string`);
    return void 0;
  }
  return value;
}
function readStringArray(value, path, add) {
  if (value === void 0)
    return void 0;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    add(path, ErrorCode.manifestInvalid, `${path} must be an array of strings`);
    return void 0;
  }
  return value;
}
function readStringMap(value, path, add) {
  if (value === void 0)
    return {};
  if (!isRecord(value) || Object.values(value).some((item) => typeof item !== "string")) {
    add(path, ErrorCode.manifestInvalid, `${path} must map strings to strings`);
    return {};
  }
  return value;
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readRequiredModels(value, path, add) {
  if (value === void 0)
    return [];
  if (!Array.isArray(value)) {
    add(path, ErrorCode.manifestInvalid, `${path} must be a list`);
    return [];
  }
  const models = [];
  for (let index = 0; index < value.length; index += 1) {
    const base = `${path}[${index}]`;
    const raw = value[index];
    if (!isRecord(raw)) {
      add(base, ErrorCode.manifestInvalid, "model requirement must be a mapping");
      continue;
    }
    const id = readString(raw, "id", add, base);
    if (id === void 0 || id.length === 0) {
      add(`${base}.id`, ErrorCode.manifestInvalid, "id is required");
      continue;
    }
    if (!SAFE_SEGMENT.test(id)) {
      add(`${base}.id`, ErrorCode.manifestInvalid, `"${id}" is not a valid model id`);
      continue;
    }
    const revision = readString(raw, "revision", add, base);
    if (revision !== void 0 && !SAFE_SEGMENT.test(revision)) {
      add(`${base}.revision`, ErrorCode.manifestInvalid, `"${revision}" is not a valid model revision`);
      continue;
    }
    const filename = readString(raw, "filename", add, base);
    if (filename !== void 0) {
      const normalized = filename.replace(/\\/g, "/");
      if (normalized.length === 0 || normalized.startsWith("/") || normalized.split("/").some((seg) => seg === ".." || seg === ".")) {
        add(`${base}.filename`, ErrorCode.manifestInvalid, `"${filename}" must be a relative path inside the model directory`);
        continue;
      }
    }
    const sha256 = readString(raw, "sha256", add, base);
    if (sha256 !== void 0 && !SHA256_HEX.test(sha256)) {
      add(`${base}.sha256`, ErrorCode.manifestInvalid, `"${sha256}" must be a 64-character hex sha256 digest`);
      continue;
    }
    const env = readString(raw, "env", add, base);
    if (env !== void 0 && !ENV_NAME.test(env)) {
      add(`${base}.env`, ErrorCode.manifestInvalid, `"${env}" is not a valid environment variable name`);
      continue;
    }
    let optional;
    if (raw["optional"] !== void 0) {
      if (typeof raw["optional"] !== "boolean") {
        add(`${base}.optional`, ErrorCode.manifestInvalid, "optional must be a boolean");
        continue;
      }
      optional = raw["optional"];
    }
    models.push({
      id,
      ...revision === void 0 ? {} : { revision },
      ...filename === void 0 ? {} : { filename },
      ...sha256 === void 0 ? {} : { sha256: sha256.toLowerCase() },
      ...env === void 0 ? {} : { env },
      ...optional === void 0 ? {} : { optional }
    });
  }
  return models;
}
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/catalog.js
var SAFE_NAME = /^[a-z0-9][a-z0-9-]*$/;
var ForgeCatalog = class {
  root;
  constructor(root) {
    this.root = root;
  }
  /** Scan every bundle directly under the root. Nested bundles are intentionally unsupported. */
  async list() {
    let entries;
    try {
      entries = await readdir4(this.root, { withFileTypes: true });
    } catch (error) {
      if (isMissing(error))
        return { skills: [], diagnostics: [] };
      throw error;
    }
    const skills = [];
    const diagnostics = [];
    for (const entry of entries.sort((a, b2) => a.name.localeCompare(b2.name))) {
      if (!entry.isDirectory() || entry.name.startsWith("."))
        continue;
      const dir = join6(this.root, entry.name);
      const text = await readIfExists(join6(dir, "skill.yaml"));
      if (text === void 0) {
        diagnostics.push({
          name: entry.name,
          dir,
          code: ErrorCode.manifestInvalid,
          message: "skill.yaml is missing",
          issues: [{ path: "skill.yaml", code: ErrorCode.manifestInvalid, message: "file not found" }]
        });
        continue;
      }
      const parsed = parseManifest(text, `skills/${entry.name}/skill.yaml`);
      if (parsed.manifest === void 0) {
        const first = parsed.issues[0];
        diagnostics.push({
          name: entry.name,
          dir,
          code: first?.code ?? ErrorCode.manifestInvalid,
          message: first === void 0 ? "manifest is invalid" : `${first.path}: ${first.message}`,
          issues: parsed.issues
        });
        continue;
      }
      skills.push({ name: parsed.manifest.name, dir, manifest: parsed.manifest });
    }
    return { skills, diagnostics };
  }
  /** Load one bundle by its manifest name. */
  async load(name) {
    if (!SAFE_NAME.test(name))
      return void 0;
    const dir = join6(this.root, name);
    const text = await readIfExists(join6(dir, "skill.yaml"));
    if (text === void 0)
      return void 0;
    const parsed = parseManifest(text, `skills/${name}/skill.yaml`);
    if (parsed.manifest === void 0)
      return void 0;
    return { name: parsed.manifest.name, dir, manifest: parsed.manifest };
  }
  /** Read the instruction document of one bundle. */
  async readDocument(name) {
    const entry = await this.load(name);
    if (entry === void 0)
      return void 0;
    return readIfExists(join6(entry.dir, entry.manifest.skillDocument));
  }
  /** Static structural check: documents, dataflows, assets and artifact locks. */
  async inspect(name) {
    const entry = await this.load(name);
    if (entry === void 0)
      return void 0;
    const { manifest, dir } = entry;
    const checks = [];
    const document = join6(dir, manifest.skillDocument);
    checks.push(await fileCheck("skill_document", document));
    const forgeVersion = manifest.forgeVersion ?? DEFAULT_FORGE_VERSION;
    checks.push({
      id: "forge_version",
      status: isForgeGeneration(forgeVersion) ? "pass" : "fail",
      detail: isForgeGeneration(forgeVersion) ? forgeGenerationLabel(forgeVersion) : unsupportedForgeVersionDetail(forgeVersion)
    });
    for (const profile of Object.values(manifest.profiles)) {
      checks.push(await fileCheck(`profile.${profile.id}.dataflow`, join6(dir, profile.dataflow)));
      for (const asset of profile.requiredAssets) {
        checks.push(await fileCheck(`profile.${profile.id}.asset.${asset}`, join6(dir, asset)));
      }
      const missingLocks = profile.requiredBinaries.filter((binary) => manifest.artifacts[binary] === void 0);
      checks.push({
        id: `profile.${profile.id}.artifact_locks`,
        status: missingLocks.length === 0 ? "pass" : "fail",
        detail: missingLocks.length === 0 ? `${profile.requiredBinaries.length} binaries locked` : `no artifact lock for: ${missingLocks.join(", ")}`
      });
    }
    return { entry, checks };
  }
};
async function fileCheck(id, path) {
  try {
    const info = await stat4(path);
    return { id, status: info.isFile() ? "pass" : "warn", detail: path };
  } catch (error) {
    if (isMissing(error))
      return { id, status: "fail", detail: `${path} is missing` };
    return { id, status: "fail", detail: `${path}: ${error.message}` };
  }
}
async function readIfExists(path) {
  try {
    return await readFile4(path, "utf8");
  } catch (error) {
    if (isMissing(error))
      return void 0;
    throw error;
  }
}
function isMissing(error) {
  return typeof error === "object" && error !== null && error.code === "ENOENT";
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/operations.js
var import_yaml6 = __toESM(require_dist(), 1);
import { mkdir as mkdir14, readFile as readFile13, readdir as readdir11, rm as rm10, stat as stat13, writeFile as writeFile9 } from "node:fs/promises";
import { join as join16 } from "node:path";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/diff.js
function diffValues(before, after, prefix = "") {
  const left = flatten(before, prefix);
  const right = flatten(after, prefix);
  const keys = [.../* @__PURE__ */ new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  const lines = [];
  for (const key of keys) {
    if (left[key] === right[key])
      continue;
    lines.push(`${key}: ${left[key] ?? "(unset)"} \u2192 ${right[key] ?? "(unset)"}`);
  }
  return lines;
}
function flatten(value, prefix) {
  const result = {};
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    result[prefix] = JSON.stringify(value);
    return result;
  }
  for (const [key, item] of Object.entries(value)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    if (item !== null && typeof item === "object" && !Array.isArray(item)) {
      Object.assign(result, flatten(item, path));
    } else {
      result[path] = JSON.stringify(item);
    }
  }
  return result;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/validate.js
import { readFile as readFile5, stat as stat5 } from "node:fs/promises";
import { isAbsolute, join as join7, resolve as resolve4, sep } from "node:path";
async function validateBundle(root) {
  const dir = resolve4(root);
  const issues = [];
  const add = (path, code, message, severity = "error") => {
    issues.push({ path, code, message, severity });
  };
  let text;
  try {
    text = await readFile5(join7(dir, "skill.yaml"), "utf8");
  } catch {
    return {
      ok: false,
      root: dir,
      issues: [{ path: "skill.yaml", code: "FORGE_MANIFEST_INVALID", message: "skill.yaml is missing", severity: "error" }],
      summary: { profiles: 0, artifacts: 0, assets: 0 }
    };
  }
  const parsed = parseManifest(text, "skill.yaml");
  if (parsed.manifest === void 0) {
    return {
      ok: false,
      root: dir,
      issues: parsed.issues.map((issue) => ({ path: issue.path, code: issue.code, message: issue.message, severity: "error" })),
      summary: { profiles: 0, artifacts: 0, assets: 0 }
    };
  }
  const manifest = parsed.manifest;
  if (!await exists(join7(dir, manifest.skillDocument))) {
    add(manifest.skillDocument, "FORGE_SKILL_DOC_MISSING", `${manifest.skillDocument} is missing`);
  }
  const archiveManifest = join7(dir, "archive-manifest.json");
  if (await exists(archiveManifest)) {
    try {
      JSON.parse(await readFile5(archiveManifest, "utf8"));
    } catch {
      add("archive-manifest.json", "FORGE_FILE_INVALID", "archive-manifest.json is not valid JSON", "warn");
    }
  }
  let assets = 0;
  for (const profile of Object.values(manifest.profiles)) {
    if (!await exists(join7(dir, profile.dataflow))) {
      add(profile.dataflow, "FORGE_DATAFLOW_MISSING", `dataflow for profile ${profile.id} is missing`);
    }
    for (const asset of profile.requiredAssets) {
      assets += 1;
      if (!await exists(join7(dir, asset)))
        add(asset, "FORGE_ASSET_MISSING", `asset for profile ${profile.id} is missing`);
    }
    if (profile.requiredBinaries.length === 0) {
      add(`profiles.${profile.id}.required_binaries`, "FORGE_MANIFEST_INVALID", "profile declares no required binaries", "warn");
    }
    for (const binary of profile.requiredBinaries) {
      const lock = manifest.artifacts[binary];
      if (lock === void 0) {
        add(`artifacts.nodes.${binary}`, "FORGE_NODE_MISSING", `no artifact lock for required binary ${binary}`);
        continue;
      }
      if (lock.platform !== process.platform || lock.arch !== archName()) {
        add(`artifacts.nodes.${binary}`, "FORGE_NODE_PLATFORM", `locked for ${lock.platform}/${lock.arch}, host is ${process.platform}/${archName()}`, "warn");
      }
      if (lock.sha256 === void 0) {
        add(`artifacts.nodes.${binary}.sha256`, "FORGE_NODE_INTEGRITY", "artifact lock has no sha256", "warn");
      }
      if (lock.artifactType === "executable_tar_gz" && lock.entrypoint.trim().length === 0) {
        add(`artifacts.nodes.${binary}.entrypoint`, "FORGE_NODE_ENTRYPOINT", "executable archives need an entrypoint");
      }
    }
  }
  for (const profile of Object.values(manifest.profiles)) {
    for (const relative5 of [profile.dataflow, ...profile.requiredAssets]) {
      const target = resolve4(dir, relative5);
      if (isAbsolute(relative5) || !target.startsWith(dir + sep)) {
        add(relative5, "FORGE_MANIFEST_INVALID", "path escapes the bundle root");
      }
    }
  }
  const errors = issues.filter((issue) => issue.severity === "error");
  return {
    ok: errors.length === 0,
    root: dir,
    name: manifest.name,
    version: manifest.version,
    issues,
    summary: { profiles: Object.keys(manifest.profiles).length, artifacts: Object.keys(manifest.artifacts).length, assets }
  };
}
async function exists(path) {
  try {
    await stat5(path);
    return true;
  } catch {
    return false;
  }
}
function archName() {
  if (process.arch === "x64")
    return "x86_64";
  if (process.arch === "arm64")
    return "aarch64";
  if (process.arch === "ia32")
    return "x86";
  return process.arch;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/tool-client.js
var ForgeToolClient = class {
  gatewayUrl;
  timeoutMs;
  constructor(gatewayUrl, timeoutMs = 15e3) {
    this.gatewayUrl = gatewayUrl.replace(/\/+$/, "");
    this.timeoutMs = timeoutMs;
  }
  /** Discover the tools the running gateway exposes. */
  async tools() {
    const value = (await this.request("GET", "/tools")).data;
    const data = value?.data ?? value;
    const list = Array.isArray(data) ? data : data?.tools;
    if (!Array.isArray(list))
      return [];
    return list.map((item) => {
      const record = item;
      const toolId = String(record["tool_id"] ?? record["id"] ?? record["name"] ?? "");
      return {
        toolId,
        semantics: typeof record["semantics"] === "string" ? record["semantics"] : void 0,
        endpointId: typeof record["endpoint_id"] === "string" ? record["endpoint_id"] : void 0,
        operation: typeof record["operation"] === "string" ? record["operation"] : void 0,
        raw: item
      };
    }).filter((tool2) => tool2.toolId.length > 0);
  }
  /** Read the live context/readiness of one tool without invoking it. */
  async context(toolId) {
    return (await this.request("GET", `/tools/${encodeURIComponent(toolId)}/context`)).data;
  }
  /** Invoke a tool; queries route through their endpoint operation, actions through the tool id. */
  async invoke(toolId, args, timeoutMs) {
    const spec = await this.spec(toolId);
    const path = spec?.semantics === "query" && spec.endpointId !== void 0 && spec.operation !== void 0 ? `/tools/${encodeURIComponent(spec.endpointId)}/${encodeURIComponent(spec.operation)}:invoke` : `/tools/${encodeURIComponent(toolId)}:invoke`;
    return this.request("POST", path, { arguments: args, timeout_ms: Math.min(timeoutMs ?? this.timeoutMs, 2e4) });
  }
  async spec(toolId) {
    try {
      const tools = await this.tools();
      return tools.find((tool2) => tool2.toolId === toolId);
    } catch {
      return void 0;
    }
  }
  /** Read invocation status. */
  async invocation(invocationId) {
    return (await this.request("GET", `/invocations/${encodeURIComponent(invocationId)}`)).data;
  }
  /** Read invocation result. */
  async result(invocationId) {
    return (await this.request("GET", `/invocations/${encodeURIComponent(invocationId)}/result`)).data;
  }
  /** Request cancellation without asserting that anything stopped. */
  async cancel(invocationId) {
    return this.request("POST", `/invocations/${encodeURIComponent(invocationId)}/cancel`, {});
  }
  /** Stop an owned session. */
  async stopSession(invocationId) {
    return this.request("POST", `/invocations/${encodeURIComponent(invocationId)}/stop`, {});
  }
  async request(method, path, body) {
    let response;
    try {
      response = await fetch(`${this.gatewayUrl}${path}`, {
        method,
        headers: body === void 0 ? { accept: "application/json" } : { "content-type": "application/json", accept: "application/json" },
        body: body === void 0 ? void 0 : JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      throw new ForgeError("FORGE_GATEWAY_UNREACHABLE", `${path}: ${error.message}`);
    }
    const text = await response.text();
    let payload = text;
    try {
      payload = text.length === 0 ? void 0 : JSON.parse(text);
    } catch {
    }
    const record = payload ?? {};
    const data = record["data"] ?? payload;
    const invocationId = typeof data === "object" && data !== null ? data["invocation_id"] : void 0;
    const phase = typeof data === "object" && data !== null ? data["phase"] : void 0;
    if (!response.ok) {
      const message = typeof record["message"] === "string" ? record["message"] : text.slice(0, 300);
      throw new ForgeError("FORGE_GATEWAY_UNREACHABLE", `${method} ${path}: HTTP ${response.status} ${message}`);
    }
    return {
      ok: record["ok"] !== false,
      httpStatus: response.status,
      ...invocationId === void 0 ? {} : { invocationId },
      ...phase === void 0 ? {} : { phase },
      data: payload
    };
  }
};

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/doctor.js
async function diagnoseSkill(options) {
  const entry = await options.catalog.load(options.skill);
  if (entry === void 0) {
    return {
      skill: options.skill,
      ...options.profile === void 0 ? {} : { profile: options.profile },
      ok: false,
      checks: [{ id: "manifest", status: "fail", detail: `skill "${options.skill}" is not installed` }]
    };
  }
  const inspection = await options.catalog.inspect(options.skill);
  const checks = [...inspection?.checks ?? []];
  const profileId = options.profile ?? Object.keys(entry.manifest.profiles)[0];
  if (profileId === void 0) {
    checks.push({ id: "profile", status: "fail", detail: "manifest has no profile" });
    return { skill: options.skill, ok: false, checks };
  }
  checks.push({ id: "profile", status: "pass", detail: profileId });
  const runtime = await options.runtime?.status(options.skill);
  if (runtime !== void 0) {
    checks.push({
      id: "runtime",
      status: runtime.status === "healthy" ? "pass" : runtime.status === "failed" ? "fail" : "warn",
      detail: `${runtime.status} (${runtime.profile}, flow ${runtime.flow})`
    });
    if (runtime.status === "healthy") {
      const client = new ForgeToolClient(runtime.gatewayUrl);
      try {
        const tools = await client.tools();
        const required = toolsForProfile(entry.manifest, runtime.profile);
        const available = new Set(tools.map((tool2) => tool2.toolId));
        const missing = required.filter((tool2) => !available.has(tool2));
        checks.push({
          id: "gateway.tools",
          status: missing.length === 0 ? "pass" : "fail",
          detail: missing.length === 0 ? `${available.size} tools exposed` : `missing: ${missing.join(", ")}`
        });
      } catch (error) {
        checks.push({ id: "gateway.tools", status: "fail", detail: error.message });
      }
    }
  } else if (options.runtime !== void 0) {
    checks.push({ id: "runtime", status: "warn", detail: "no runtime started" });
  }
  return {
    skill: options.skill,
    profile: profileId,
    ok: checks.every((check) => check.status !== "fail"),
    checks,
    ...runtime === void 0 ? {} : { runtime }
  };
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/events.js
import { appendFile, mkdir as mkdir3 } from "node:fs/promises";
import { dirname } from "node:path";
var EventLog = class {
  path;
  enabled;
  constructor(path, enabled = true) {
    this.path = path;
    this.enabled = enabled;
  }
  async append(event, fields = {}) {
    if (!this.enabled)
      return;
    try {
      await mkdir3(dirname(this.path), { recursive: true });
      const row = { ts: (/* @__PURE__ */ new Date()).toISOString(), event, ...fields };
      await appendFile(this.path, `${JSON.stringify(row)}
`, { mode: 384 });
    } catch {
    }
  }
};

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/package.js
import { createHash as createHash2 } from "node:crypto";
import { createReadStream as createReadStream2 } from "node:fs";
import { lstat as lstat2, mkdir as mkdir4, readFile as readFile6, readdir as readdir5, rename as rename2, rm as rm3, stat as stat6, writeFile as writeFile3 } from "node:fs/promises";
import { join as join8, relative, sep as sep2 } from "node:path";

// node_modules/.pnpm/tar@7.5.23/node_modules/tar/dist/esm/index.min.js
import Qr from "events";
import I from "fs";
import { EventEmitter as Di } from "node:events";
import Cs from "node:stream";
import { StringDecoder as Hr } from "node:string_decoder";
import cr from "node:path";
import Kt from "node:fs";
import { dirname as Fn, parse as kn } from "path";
import { EventEmitter as Dn } from "events";
import zi from "assert";
import { Buffer as Ot } from "buffer";
import * as Ps from "zlib";
import en from "zlib";
import { posix as Zt } from "node:path";
import { basename as _n } from "node:path";
import mi from "fs";
import X from "fs";
import js from "path";
import { win32 as Pn } from "node:path";
import ar from "path";
import Br from "node:fs";
import co from "node:assert";
import { randomBytes as Mr } from "node:crypto";
import u from "node:fs";
import R from "node:path";
import pr from "fs";
import wi from "node:fs";
import we from "node:path";
import k from "node:fs";
import ro from "node:fs/promises";
import Si from "node:path";
import { join as xr } from "node:path";
import v from "node:fs";
import Pr from "node:path";
var zr = Object.defineProperty;
var Ur = (s3, t) => {
  for (var e in t) zr(s3, e, { get: t[e], enumerable: true });
};
var Ds = typeof process == "object" && process ? process : { stdout: null, stderr: null };
var Wr = (s3) => !!s3 && typeof s3 == "object" && (s3 instanceof A || s3 instanceof Cs || Gr(s3) || Zr(s3));
var Gr = (s3) => !!s3 && typeof s3 == "object" && s3 instanceof Di && typeof s3.pipe == "function" && s3.pipe !== Cs.Writable.prototype.pipe;
var Zr = (s3) => !!s3 && typeof s3 == "object" && s3 instanceof Di && typeof s3.write == "function" && typeof s3.end == "function";
var Q = Symbol("EOF");
var J = Symbol("maybeEmitEnd");
var nt = Symbol("emittedEnd");
var De = Symbol("emittingEnd");
var qt = Symbol("emittedError");
var Ne = Symbol("closed");
var Ns = Symbol("read");
var Ae = Symbol("flush");
var As = Symbol("flushChunk");
var z = Symbol("encoding");
var Mt = Symbol("decoder");
var g = Symbol("flowing");
var Qt = Symbol("paused");
var Bt = Symbol("resume");
var b = Symbol("buffer");
var N = Symbol("pipes");
var _ = Symbol("bufferLength");
var bi = Symbol("bufferPush");
var Ie = Symbol("bufferShift");
var L = Symbol("objectMode");
var S = Symbol("destroyed");
var _i = Symbol("error");
var Oi = Symbol("emitData");
var Is = Symbol("emitEnd");
var Ti = Symbol("emitEnd2");
var Z = Symbol("async");
var xi = Symbol("abort");
var Ce = Symbol("aborted");
var Jt = Symbol("signal");
var Rt = Symbol("dataListeners");
var C = Symbol("discarded");
var jt = (s3) => Promise.resolve().then(s3);
var Yr = (s3) => s3();
var Kr = (s3) => s3 === "end" || s3 === "finish" || s3 === "prefinish";
var Vr = (s3) => s3 instanceof ArrayBuffer || !!s3 && typeof s3 == "object" && s3.constructor && s3.constructor.name === "ArrayBuffer" && s3.byteLength >= 0;
var $r = (s3) => !Buffer.isBuffer(s3) && ArrayBuffer.isView(s3);
var Fe = class {
  src;
  dest;
  opts;
  ondrain;
  constructor(t, e, i) {
    this.src = t, this.dest = e, this.opts = i, this.ondrain = () => t[Bt](), this.dest.on("drain", this.ondrain);
  }
  unpipe() {
    this.dest.removeListener("drain", this.ondrain);
  }
  proxyErrors(t) {
  }
  end() {
    this.unpipe(), this.opts.end && this.dest.end();
  }
};
var Li = class extends Fe {
  unpipe() {
    this.src.removeListener("error", this.proxyErrors), super.unpipe();
  }
  constructor(t, e, i) {
    super(t, e, i), this.proxyErrors = (r) => this.dest.emit("error", r), t.on("error", this.proxyErrors);
  }
};
var Xr = (s3) => !!s3.objectMode;
var qr = (s3) => !s3.objectMode && !!s3.encoding && s3.encoding !== "buffer";
var A = class extends Di {
  [g] = false;
  [Qt] = false;
  [N] = [];
  [b] = [];
  [L];
  [z];
  [Z];
  [Mt];
  [Q] = false;
  [nt] = false;
  [De] = false;
  [Ne] = false;
  [qt] = null;
  [_] = 0;
  [S] = false;
  [Jt];
  [Ce] = false;
  [Rt] = 0;
  [C] = false;
  writable = true;
  readable = true;
  constructor(...t) {
    let e = t[0] || {};
    if (super(), e.objectMode && typeof e.encoding == "string") throw new TypeError("Encoding and objectMode may not be used together");
    Xr(e) ? (this[L] = true, this[z] = null) : qr(e) ? (this[z] = e.encoding, this[L] = false) : (this[L] = false, this[z] = null), this[Z] = !!e.async, this[Mt] = this[z] ? new Hr(this[z]) : null, e && e.debugExposeBuffer === true && Object.defineProperty(this, "buffer", { get: () => this[b] }), e && e.debugExposePipes === true && Object.defineProperty(this, "pipes", { get: () => this[N] });
    let { signal: i } = e;
    i && (this[Jt] = i, i.aborted ? this[xi]() : i.addEventListener("abort", () => this[xi]()));
  }
  get bufferLength() {
    return this[_];
  }
  get encoding() {
    return this[z];
  }
  set encoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  setEncoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  get objectMode() {
    return this[L];
  }
  set objectMode(t) {
    throw new Error("objectMode must be set at instantiation time");
  }
  get async() {
    return this[Z];
  }
  set async(t) {
    this[Z] = this[Z] || !!t;
  }
  [xi]() {
    this[Ce] = true, this.emit("abort", this[Jt]?.reason), this.destroy(this[Jt]?.reason);
  }
  get aborted() {
    return this[Ce];
  }
  set aborted(t) {
  }
  write(t, e, i) {
    if (this[Ce]) return false;
    if (this[Q]) throw new Error("write after end");
    if (this[S]) return this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" })), true;
    typeof e == "function" && (i = e, e = "utf8"), e || (e = "utf8");
    let r = this[Z] ? jt : Yr;
    if (!this[L] && !Buffer.isBuffer(t)) {
      if ($r(t)) t = Buffer.from(t.buffer, t.byteOffset, t.byteLength);
      else if (Vr(t)) t = Buffer.from(t);
      else if (typeof t != "string") throw new Error("Non-contiguous data written to non-objectMode stream");
    }
    return this[L] ? (this[g] && this[_] !== 0 && this[Ae](true), this[g] ? this.emit("data", t) : this[bi](t), this[_] !== 0 && this.emit("readable"), i && r(i), this[g]) : t.length ? (typeof t == "string" && !(e === this[z] && !this[Mt]?.lastNeed) && (t = Buffer.from(t, e)), Buffer.isBuffer(t) && this[z] && (t = this[Mt].write(t)), this[g] && this[_] !== 0 && this[Ae](true), this[g] ? this.emit("data", t) : this[bi](t), this[_] !== 0 && this.emit("readable"), i && r(i), this[g]) : (this[_] !== 0 && this.emit("readable"), i && r(i), this[g]);
  }
  read(t) {
    if (this[S]) return null;
    if (this[C] = false, this[_] === 0 || t === 0 || t && t > this[_]) return this[J](), null;
    this[L] && (t = null), this[b].length > 1 && !this[L] && (this[b] = [this[z] ? this[b].join("") : Buffer.concat(this[b], this[_])]);
    let e = this[Ns](t || null, this[b][0]);
    return this[J](), e;
  }
  [Ns](t, e) {
    if (this[L]) this[Ie]();
    else {
      let i = e;
      t === i.length || t === null ? this[Ie]() : typeof i == "string" ? (this[b][0] = i.slice(t), e = i.slice(0, t), this[_] -= t) : (this[b][0] = i.subarray(t), e = i.subarray(0, t), this[_] -= t);
    }
    return this.emit("data", e), !this[b].length && !this[Q] && this.emit("drain"), e;
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, t = void 0), typeof e == "function" && (i = e, e = "utf8"), t !== void 0 && this.write(t, e), i && this.once("end", i), this[Q] = true, this.writable = false, (this[g] || !this[Qt]) && this[J](), this;
  }
  [Bt]() {
    this[S] || (!this[Rt] && !this[N].length && (this[C] = true), this[Qt] = false, this[g] = true, this.emit("resume"), this[b].length ? this[Ae]() : this[Q] ? this[J]() : this.emit("drain"));
  }
  resume() {
    return this[Bt]();
  }
  pause() {
    this[g] = false, this[Qt] = true, this[C] = false;
  }
  get destroyed() {
    return this[S];
  }
  get flowing() {
    return this[g];
  }
  get paused() {
    return this[Qt];
  }
  [bi](t) {
    this[L] ? this[_] += 1 : this[_] += t.length, this[b].push(t);
  }
  [Ie]() {
    return this[L] ? this[_] -= 1 : this[_] -= this[b][0].length, this[b].shift();
  }
  [Ae](t = false) {
    do
      ;
    while (this[As](this[Ie]()) && this[b].length);
    !t && !this[b].length && !this[Q] && this.emit("drain");
  }
  [As](t) {
    return this.emit("data", t), this[g];
  }
  pipe(t, e) {
    if (this[S]) return t;
    this[C] = false;
    let i = this[nt];
    return e = e || {}, t === Ds.stdout || t === Ds.stderr ? e.end = false : e.end = e.end !== false, e.proxyErrors = !!e.proxyErrors, i ? e.end && t.end() : (this[N].push(e.proxyErrors ? new Li(this, t, e) : new Fe(this, t, e)), this[Z] ? jt(() => this[Bt]()) : this[Bt]()), t;
  }
  unpipe(t) {
    let e = this[N].find((i) => i.dest === t);
    e && (this[N].length === 1 ? (this[g] && this[Rt] === 0 && (this[g] = false), this[N] = []) : this[N].splice(this[N].indexOf(e), 1), e.unpipe());
  }
  addListener(t, e) {
    return this.on(t, e);
  }
  on(t, e) {
    let i = super.on(t, e);
    if (t === "data") this[C] = false, this[Rt]++, !this[N].length && !this[g] && this[Bt]();
    else if (t === "readable" && this[_] !== 0) super.emit("readable");
    else if (Kr(t) && this[nt]) super.emit(t), this.removeAllListeners(t);
    else if (t === "error" && this[qt]) {
      let r = e;
      this[Z] ? jt(() => r.call(this, this[qt])) : r.call(this, this[qt]);
    }
    return i;
  }
  removeListener(t, e) {
    return this.off(t, e);
  }
  off(t, e) {
    let i = super.off(t, e);
    return t === "data" && (this[Rt] = this.listeners("data").length, this[Rt] === 0 && !this[C] && !this[N].length && (this[g] = false)), i;
  }
  removeAllListeners(t) {
    let e = super.removeAllListeners(t);
    return (t === "data" || t === void 0) && (this[Rt] = 0, !this[C] && !this[N].length && (this[g] = false)), e;
  }
  get emittedEnd() {
    return this[nt];
  }
  [J]() {
    !this[De] && !this[nt] && !this[S] && this[b].length === 0 && this[Q] && (this[De] = true, this.emit("end"), this.emit("prefinish"), this.emit("finish"), this[Ne] && this.emit("close"), this[De] = false);
  }
  emit(t, ...e) {
    let i = e[0];
    if (t !== "error" && t !== "close" && t !== S && this[S]) return false;
    if (t === "data") return !this[L] && !i ? false : this[Z] ? (jt(() => this[Oi](i)), true) : this[Oi](i);
    if (t === "end") return this[Is]();
    if (t === "close") {
      if (this[Ne] = true, !this[nt] && !this[S]) return false;
      let n = super.emit("close");
      return this.removeAllListeners("close"), n;
    } else if (t === "error") {
      this[qt] = i, super.emit(_i, i);
      let n = !this[Jt] || this.listeners("error").length ? super.emit("error", i) : false;
      return this[J](), n;
    } else if (t === "resume") {
      let n = super.emit("resume");
      return this[J](), n;
    } else if (t === "finish" || t === "prefinish") {
      let n = super.emit(t);
      return this.removeAllListeners(t), n;
    }
    let r = super.emit(t, ...e);
    return this[J](), r;
  }
  [Oi](t) {
    for (let i of this[N]) i.dest.write(t) === false && this.pause();
    let e = this[C] ? false : super.emit("data", t);
    return this[J](), e;
  }
  [Is]() {
    return this[nt] ? false : (this[nt] = true, this.readable = false, this[Z] ? (jt(() => this[Ti]()), true) : this[Ti]());
  }
  [Ti]() {
    if (this[Mt]) {
      let e = this[Mt].end();
      if (e) {
        for (let i of this[N]) i.dest.write(e);
        this[C] || super.emit("data", e);
      }
    }
    for (let e of this[N]) e.end();
    let t = super.emit("end");
    return this.removeAllListeners("end"), t;
  }
  async collect() {
    let t = Object.assign([], { dataLength: 0 });
    this[L] || (t.dataLength = 0);
    let e = this.promise();
    return this.on("data", (i) => {
      t.push(i), this[L] || (t.dataLength += i.length);
    }), await e, t;
  }
  async concat() {
    if (this[L]) throw new Error("cannot concat in objectMode");
    let t = await this.collect();
    return this[z] ? t.join("") : Buffer.concat(t, t.dataLength);
  }
  async promise() {
    return new Promise((t, e) => {
      this.on(S, () => e(new Error("stream destroyed"))), this.on("error", (i) => e(i)), this.on("end", () => t());
    });
  }
  [Symbol.asyncIterator]() {
    this[C] = false;
    let t = false, e = async () => (this.pause(), t = true, { value: void 0, done: true });
    return { next: () => {
      if (t) return e();
      let r = this.read();
      if (r !== null) return Promise.resolve({ done: false, value: r });
      if (this[Q]) return e();
      let n, o, h = (d) => {
        this.off("data", a), this.off("end", l), this.off(S, c), e(), o(d);
      }, a = (d) => {
        this.off("error", h), this.off("end", l), this.off(S, c), this.pause(), n({ value: d, done: !!this[Q] });
      }, l = () => {
        this.off("error", h), this.off("data", a), this.off(S, c), e(), n({ done: true, value: void 0 });
      }, c = () => h(new Error("stream destroyed"));
      return new Promise((d, y) => {
        o = y, n = d, this.once(S, c), this.once("error", h), this.once("end", l), this.once("data", a);
      });
    }, throw: e, return: e, [Symbol.asyncIterator]() {
      return this;
    }, [Symbol.asyncDispose]: async () => {
    } };
  }
  [Symbol.iterator]() {
    this[C] = false;
    let t = false, e = () => (this.pause(), this.off(_i, e), this.off(S, e), this.off("end", e), t = true, { done: true, value: void 0 }), i = () => {
      if (t) return e();
      let r = this.read();
      return r === null ? e() : { done: false, value: r };
    };
    return this.once("end", e), this.once(_i, e), this.once(S, e), { next: i, throw: e, return: e, [Symbol.iterator]() {
      return this;
    }, [Symbol.dispose]: () => {
    } };
  }
  destroy(t) {
    if (this[S]) return t ? this.emit("error", t) : this.emit(S), this;
    this[S] = true, this[C] = true, this[b].length = 0, this[_] = 0;
    let e = this;
    return typeof e.close == "function" && !this[Ne] && e.close(), t ? this.emit("error", t) : this.emit(S), this;
  }
  static get isStream() {
    return Wr;
  }
};
var Jr = I.writev;
var ht = Symbol("_autoClose");
var H = Symbol("_close");
var te = Symbol("_ended");
var m = Symbol("_fd");
var Ni = Symbol("_finished");
var tt = Symbol("_flags");
var Ai = Symbol("_flush");
var ki = Symbol("_handleChunk");
var vi = Symbol("_makeBuf");
var ie = Symbol("_mode");
var ke = Symbol("_needDrain");
var Ut = Symbol("_onerror");
var Ht = Symbol("_onopen");
var Ii = Symbol("_onread");
var Pt = Symbol("_onwrite");
var at = Symbol("_open");
var U = Symbol("_path");
var ot = Symbol("_pos");
var Y = Symbol("_queue");
var zt = Symbol("_read");
var Ci = Symbol("_readSize");
var j = Symbol("_reading");
var ee = Symbol("_remain");
var Fi = Symbol("_size");
var ve = Symbol("_write");
var gt = Symbol("_writing");
var Me = Symbol("_defaultFlag");
var bt = Symbol("_errored");
var _t = class extends A {
  [bt] = false;
  [m];
  [U];
  [Ci];
  [j] = false;
  [Fi];
  [ee];
  [ht];
  constructor(t, e) {
    if (e = e || {}, super(e), this.readable = true, this.writable = false, typeof t != "string") throw new TypeError("path must be a string");
    this[bt] = false, this[m] = typeof e.fd == "number" ? e.fd : void 0, this[U] = t, this[Ci] = e.readSize || 16 * 1024 * 1024, this[j] = false, this[Fi] = typeof e.size == "number" ? e.size : 1 / 0, this[ee] = this[Fi], this[ht] = typeof e.autoClose == "boolean" ? e.autoClose : true, typeof this[m] == "number" ? this[zt]() : this[at]();
  }
  get fd() {
    return this[m];
  }
  get path() {
    return this[U];
  }
  write() {
    throw new TypeError("this is a readable stream");
  }
  end() {
    throw new TypeError("this is a readable stream");
  }
  [at]() {
    I.open(this[U], "r", (t, e) => this[Ht](t, e));
  }
  [Ht](t, e) {
    t ? this[Ut](t) : (this[m] = e, this.emit("open", e), this[zt]());
  }
  [vi]() {
    return Buffer.allocUnsafe(Math.min(this[Ci], this[ee]));
  }
  [zt]() {
    if (!this[j]) {
      this[j] = true;
      let t = this[vi]();
      if (t.length === 0) return process.nextTick(() => this[Ii](null, 0, t));
      I.read(this[m], t, 0, t.length, null, (e, i, r) => this[Ii](e, i, r));
    }
  }
  [Ii](t, e, i) {
    this[j] = false, t ? this[Ut](t) : this[ki](e, i) && this[zt]();
  }
  [H]() {
    if (this[ht] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.close(t, (e) => e ? this.emit("error", e) : this.emit("close"));
    }
  }
  [Ut](t) {
    this[j] = true, this[H](), this.emit("error", t);
  }
  [ki](t, e) {
    let i = false;
    return this[ee] -= t, t > 0 && (i = super.write(t < e.length ? e.subarray(0, t) : e)), (t === 0 || this[ee] <= 0) && (i = false, this[H](), super.end()), i;
  }
  emit(t, ...e) {
    switch (t) {
      case "prefinish":
      case "finish":
        return false;
      case "drain":
        return typeof this[m] == "number" && this[zt](), false;
      case "error":
        return this[bt] ? false : (this[bt] = true, super.emit(t, ...e));
      default:
        return super.emit(t, ...e);
    }
  }
};
var Be = class extends _t {
  [at]() {
    let t = true;
    try {
      this[Ht](null, I.openSync(this[U], "r")), t = false;
    } finally {
      t && this[H]();
    }
  }
  [zt]() {
    let t = true;
    try {
      if (!this[j]) {
        this[j] = true;
        do {
          let e = this[vi](), i = e.length === 0 ? 0 : I.readSync(this[m], e, 0, e.length, null);
          if (!this[ki](i, e)) break;
        } while (true);
        this[j] = false;
      }
      t = false;
    } finally {
      t && this[H]();
    }
  }
  [H]() {
    if (this[ht] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.closeSync(t), this.emit("close");
    }
  }
};
var et = class extends Qr {
  readable = false;
  writable = true;
  [bt] = false;
  [gt] = false;
  [te] = false;
  [Y] = [];
  [ke] = false;
  [U];
  [ie];
  [ht];
  [m];
  [Me];
  [tt];
  [Ni] = false;
  [ot];
  constructor(t, e) {
    e = e || {}, super(e), this[U] = t, this[m] = typeof e.fd == "number" ? e.fd : void 0, this[ie] = e.mode === void 0 ? 438 : e.mode, this[ot] = typeof e.start == "number" ? e.start : void 0, this[ht] = typeof e.autoClose == "boolean" ? e.autoClose : true;
    let i = this[ot] !== void 0 ? "r+" : "w";
    this[Me] = e.flags === void 0, this[tt] = e.flags === void 0 ? i : e.flags, this[m] === void 0 && this[at]();
  }
  emit(t, ...e) {
    if (t === "error") {
      if (this[bt]) return false;
      this[bt] = true;
    }
    return super.emit(t, ...e);
  }
  get fd() {
    return this[m];
  }
  get path() {
    return this[U];
  }
  [Ut](t) {
    this[H](), this[gt] = true, this.emit("error", t);
  }
  [at]() {
    I.open(this[U], this[tt], this[ie], (t, e) => this[Ht](t, e));
  }
  [Ht](t, e) {
    this[Me] && this[tt] === "r+" && t && t.code === "ENOENT" ? (this[tt] = "w", this[at]()) : t ? this[Ut](t) : (this[m] = e, this.emit("open", e), this[gt] || this[Ai]());
  }
  end(t, e) {
    return t && this.write(t, e), this[te] = true, !this[gt] && !this[Y].length && typeof this[m] == "number" && this[Pt](null, 0), this;
  }
  write(t, e) {
    return typeof t == "string" && (t = Buffer.from(t, e)), this[te] ? (this.emit("error", new Error("write() after end()")), false) : this[m] === void 0 || this[gt] || this[Y].length ? (this[Y].push(t), this[ke] = true, false) : (this[gt] = true, this[ve](t), true);
  }
  [ve](t) {
    I.write(this[m], t, 0, t.length, this[ot], (e, i) => this[Pt](e, i));
  }
  [Pt](t, e) {
    t ? this[Ut](t) : (this[ot] !== void 0 && typeof e == "number" && (this[ot] += e), this[Y].length ? this[Ai]() : (this[gt] = false, this[te] && !this[Ni] ? (this[Ni] = true, this[H](), this.emit("finish")) : this[ke] && (this[ke] = false, this.emit("drain"))));
  }
  [Ai]() {
    if (this[Y].length === 0) this[te] && this[Pt](null, 0);
    else if (this[Y].length === 1) this[ve](this[Y].pop());
    else {
      let t = this[Y];
      this[Y] = [], Jr(this[m], t, this[ot], (e, i) => this[Pt](e, i));
    }
  }
  [H]() {
    if (this[ht] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.close(t, (e) => e ? this.emit("error", e) : this.emit("close"));
    }
  }
};
var Wt = class extends et {
  [at]() {
    let t;
    if (this[Me] && this[tt] === "r+") try {
      t = I.openSync(this[U], this[tt], this[ie]);
    } catch (e) {
      if (e?.code === "ENOENT") return this[tt] = "w", this[at]();
      throw e;
    }
    else t = I.openSync(this[U], this[tt], this[ie]);
    this[Ht](null, t);
  }
  [H]() {
    if (this[ht] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.closeSync(t), this.emit("close");
    }
  }
  [ve](t) {
    let e = true;
    try {
      this[Pt](null, I.writeSync(this[m], t, 0, t.length, this[ot])), e = false;
    } finally {
      if (e) try {
        this[H]();
      } catch {
      }
    }
  }
};
var jr = /* @__PURE__ */ new Map([["C", "cwd"], ["f", "file"], ["z", "gzip"], ["P", "preservePaths"], ["U", "unlink"], ["strip-components", "strip"], ["stripComponents", "strip"], ["keep-newer", "newer"], ["keepNewer", "newer"], ["keep-newer-files", "newer"], ["keepNewerFiles", "newer"], ["k", "keep"], ["keep-existing", "keep"], ["keepExisting", "keep"], ["m", "noMtime"], ["no-mtime", "noMtime"], ["p", "preserveOwner"], ["L", "follow"], ["h", "follow"], ["onentry", "onReadEntry"]]);
var Fs = (s3) => !!s3.sync && !!s3.file;
var ks = (s3) => !s3.sync && !!s3.file;
var vs = (s3) => !!s3.sync && !s3.file;
var Ms = (s3) => !s3.sync && !s3.file;
var Bs = (s3) => !!s3.file;
var tn = (s3) => {
  let t = jr.get(s3);
  return t || s3;
};
var se = (s3 = {}) => {
  if (!s3) return {};
  let t = {};
  for (let [e, i] of Object.entries(s3)) {
    let r = tn(e);
    t[r] = i;
  }
  return t.chmod === void 0 && t.noChmod === false && (t.chmod = true), delete t.noChmod, t;
};
var K = (s3, t, e, i, r) => Object.assign((n = [], o, h) => {
  Array.isArray(n) && (o = n, n = {}), typeof o == "function" && (h = o, o = void 0), o = o ? Array.from(o) : [];
  let a = se(n);
  if (r?.(a, o), Fs(a)) {
    if (typeof h == "function") throw new TypeError("callback not supported for sync tar functions");
    return s3(a, o);
  } else if (ks(a)) {
    let l = t(a, o);
    return h ? l.then(() => h(), h) : l;
  } else if (vs(a)) {
    if (typeof h == "function") throw new TypeError("callback not supported for sync tar functions");
    return e(a, o);
  } else if (Ms(a)) {
    if (typeof h == "function") throw new TypeError("callback only supported with file option");
    return i(a, o);
  }
  throw new Error("impossible options??");
}, { syncFile: s3, asyncFile: t, syncNoFile: e, asyncNoFile: i, validate: r });
var sn = en.constants || { ZLIB_VERNUM: 4736 };
var M = Object.freeze(Object.assign(/* @__PURE__ */ Object.create(null), { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_MEM_ERROR: -4, Z_BUF_ERROR: -5, Z_VERSION_ERROR: -6, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, DEFLATE: 1, INFLATE: 2, GZIP: 3, GUNZIP: 4, DEFLATERAW: 5, INFLATERAW: 6, UNZIP: 7, BROTLI_DECODE: 8, BROTLI_ENCODE: 9, Z_MIN_WINDOWBITS: 8, Z_MAX_WINDOWBITS: 15, Z_DEFAULT_WINDOWBITS: 15, Z_MIN_CHUNK: 64, Z_MAX_CHUNK: 1 / 0, Z_DEFAULT_CHUNK: 16384, Z_MIN_MEMLEVEL: 1, Z_MAX_MEMLEVEL: 9, Z_DEFAULT_MEMLEVEL: 8, Z_MIN_LEVEL: -1, Z_MAX_LEVEL: 9, Z_DEFAULT_LEVEL: -1, BROTLI_OPERATION_PROCESS: 0, BROTLI_OPERATION_FLUSH: 1, BROTLI_OPERATION_FINISH: 2, BROTLI_OPERATION_EMIT_METADATA: 3, BROTLI_MODE_GENERIC: 0, BROTLI_MODE_TEXT: 1, BROTLI_MODE_FONT: 2, BROTLI_DEFAULT_MODE: 0, BROTLI_MIN_QUALITY: 0, BROTLI_MAX_QUALITY: 11, BROTLI_DEFAULT_QUALITY: 11, BROTLI_MIN_WINDOW_BITS: 10, BROTLI_MAX_WINDOW_BITS: 24, BROTLI_LARGE_MAX_WINDOW_BITS: 30, BROTLI_DEFAULT_WINDOW: 22, BROTLI_MIN_INPUT_BLOCK_BITS: 16, BROTLI_MAX_INPUT_BLOCK_BITS: 24, BROTLI_PARAM_MODE: 0, BROTLI_PARAM_QUALITY: 1, BROTLI_PARAM_LGWIN: 2, BROTLI_PARAM_LGBLOCK: 3, BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4, BROTLI_PARAM_SIZE_HINT: 5, BROTLI_PARAM_LARGE_WINDOW: 6, BROTLI_PARAM_NPOSTFIX: 7, BROTLI_PARAM_NDIRECT: 8, BROTLI_DECODER_RESULT_ERROR: 0, BROTLI_DECODER_RESULT_SUCCESS: 1, BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0, BROTLI_DECODER_PARAM_LARGE_WINDOW: 1, BROTLI_DECODER_NO_ERROR: 0, BROTLI_DECODER_SUCCESS: 1, BROTLI_DECODER_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1, BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5, BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6, BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7, BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10, BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11, BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12, BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13, BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14, BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15, BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16, BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19, BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21, BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27, BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30, BROTLI_DECODER_ERROR_UNREACHABLE: -31 }, sn));
var rn = Ot.concat;
var zs = Object.getOwnPropertyDescriptor(Ot, "concat");
var nn = (s3) => s3;
var Bi = zs?.writable === true || zs?.set !== void 0 ? (s3) => {
  Ot.concat = s3 ? nn : rn;
} : (s3) => {
};
var Tt = Symbol("_superWrite");
var Gt = class extends Error {
  code;
  errno;
  constructor(t, e) {
    super("zlib: " + t.message, { cause: t }), this.code = t.code, this.errno = t.errno, this.code || (this.code = "ZLIB_ERROR"), this.message = "zlib: " + t.message, Error.captureStackTrace(this, e ?? this.constructor);
  }
  get name() {
    return "ZlibError";
  }
};
var Pi = Symbol("flushFlag");
var re = class extends A {
  #t = false;
  #i = false;
  #s;
  #n;
  #r;
  #e;
  #o;
  get sawError() {
    return this.#t;
  }
  get handle() {
    return this.#e;
  }
  get flushFlag() {
    return this.#s;
  }
  constructor(t, e) {
    if (!t || typeof t != "object") throw new TypeError("invalid options for ZlibBase constructor");
    if (super(t), this.#s = t.flush ?? 0, this.#n = t.finishFlush ?? 0, this.#r = t.fullFlushFlag ?? 0, typeof Ps[e] != "function") throw new TypeError("Compression method not supported: " + e);
    try {
      this.#e = new Ps[e](t);
    } catch (i) {
      throw new Gt(i, this.constructor);
    }
    this.#o = (i) => {
      this.#t || (this.#t = true, this.close(), this.emit("error", i));
    }, this.#e?.on("error", (i) => this.#o(new Gt(i))), this.once("end", () => this.close);
  }
  close() {
    this.#e && (this.#e.close(), this.#e = void 0, this.emit("close"));
  }
  reset() {
    if (!this.#t) return zi(this.#e, "zlib binding closed"), this.#e.reset?.();
  }
  flush(t) {
    this.ended || (typeof t != "number" && (t = this.#r), this.write(Object.assign(Ot.alloc(0), { [Pi]: t })));
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, e = void 0, t = void 0), typeof e == "function" && (i = e, e = void 0), t && (e ? this.write(t, e) : this.write(t)), this.flush(this.#n), this.#i = true, super.end(i);
  }
  get ended() {
    return this.#i;
  }
  [Tt](t) {
    return super.write(t);
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = "utf8"), typeof t == "string" && (t = Ot.from(t, e)), this.#t) return;
    zi(this.#e, "zlib binding closed");
    let r = this.#e._handle, n = r.close;
    r.close = () => {
    };
    let o = this.#e.close;
    this.#e.close = () => {
    }, Bi(true);
    let h;
    try {
      let l = typeof t[Pi] == "number" ? t[Pi] : this.#s;
      h = this.#e._processChunk(t, l), Bi(false);
    } catch (l) {
      Bi(false), this.#o(new Gt(l, this.write));
    } finally {
      this.#e && (this.#e._handle = r, r.close = n, this.#e.close = o, this.#e.removeAllListeners("error"));
    }
    this.#e && this.#e.on("error", (l) => this.#o(new Gt(l, this.write)));
    let a;
    if (h) if (Array.isArray(h) && h.length > 0) {
      let l = h[0];
      a = this[Tt](Ot.from(l));
      for (let c = 1; c < h.length; c++) a = this[Tt](h[c]);
    } else a = this[Tt](Ot.from(h));
    return i && i(), a;
  }
};
var Pe = class extends re {
  #t;
  #i;
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.Z_NO_FLUSH, t.finishFlush = t.finishFlush || M.Z_FINISH, t.fullFlushFlag = M.Z_FULL_FLUSH, super(t, e), this.#t = t.level, this.#i = t.strategy;
  }
  params(t, e) {
    if (!this.sawError) {
      if (!this.handle) throw new Error("cannot switch params when binding is closed");
      if (!this.handle.params) throw new Error("not supported in this implementation");
      if (this.#t !== t || this.#i !== e) {
        this.flush(M.Z_SYNC_FLUSH), zi(this.handle, "zlib binding closed");
        let i = this.handle.flush;
        this.handle.flush = (r, n) => {
          typeof r == "function" && (n = r, r = this.flushFlag), this.flush(r), n?.();
        };
        try {
          this.handle.params(t, e);
        } finally {
          this.handle.flush = i;
        }
        this.handle && (this.#t = t, this.#i = e);
      }
    }
  }
};
var ze = class extends Pe {
  #t;
  constructor(t) {
    super(t, "Gzip"), this.#t = t && !!t.portable;
  }
  [Tt](t) {
    return this.#t ? (this.#t = false, t[9] = 255, super[Tt](t)) : super[Tt](t);
  }
};
var Ue = class extends Pe {
  constructor(t) {
    super(t, "Unzip");
  }
};
var He = class extends re {
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.BROTLI_OPERATION_PROCESS, t.finishFlush = t.finishFlush || M.BROTLI_OPERATION_FINISH, t.fullFlushFlag = M.BROTLI_OPERATION_FLUSH, super(t, e);
  }
};
var We = class extends He {
  constructor(t) {
    super(t, "BrotliCompress");
  }
};
var Ge = class extends He {
  constructor(t) {
    super(t, "BrotliDecompress");
  }
};
var Ze = class extends re {
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.ZSTD_e_continue, t.finishFlush = t.finishFlush || M.ZSTD_e_end, t.fullFlushFlag = M.ZSTD_e_flush, super(t, e);
  }
};
var Ye = class extends Ze {
  constructor(t) {
    super(t, "ZstdCompress");
  }
};
var Ke = class extends Ze {
  constructor(t) {
    super(t, "ZstdDecompress");
  }
};
var Us = (s3, t) => {
  if (Number.isSafeInteger(s3)) s3 < 0 ? an(s3, t) : hn(s3, t);
  else throw Error("cannot encode number outside of javascript safe integer range");
  return t;
};
var hn = (s3, t) => {
  t[0] = 128;
  for (var e = t.length; e > 1; e--) t[e - 1] = s3 & 255, s3 = Math.floor(s3 / 256);
};
var an = (s3, t) => {
  t[0] = 255;
  var e = false;
  s3 = s3 * -1;
  for (var i = t.length; i > 1; i--) {
    var r = s3 & 255;
    s3 = Math.floor(s3 / 256), e ? t[i - 1] = Ws(r) : r === 0 ? t[i - 1] = 0 : (e = true, t[i - 1] = Gs(r));
  }
};
var Hs = (s3) => {
  let t = s3[0], e = t === 128 ? cn(s3.subarray(1, s3.length)) : t === 255 ? ln(s3) : null;
  if (e === null) throw Error("invalid base256 encoding");
  if (!Number.isSafeInteger(e)) throw Error("parsed number outside of javascript safe integer range");
  return e;
};
var ln = (s3) => {
  for (var t = s3.length, e = 0, i = false, r = t - 1; r > -1; r--) {
    var n = Number(s3[r]), o;
    i ? o = Ws(n) : n === 0 ? o = n : (i = true, o = Gs(n)), o !== 0 && (e -= o * Math.pow(256, t - r - 1));
  }
  return e;
};
var cn = (s3) => {
  for (var t = s3.length, e = 0, i = t - 1; i > -1; i--) {
    var r = Number(s3[i]);
    r !== 0 && (e += r * Math.pow(256, t - i - 1));
  }
  return e;
};
var Ws = (s3) => (255 ^ s3) & 255;
var Gs = (s3) => (255 ^ s3) + 1 & 255;
var Hi = {};
Ur(Hi, { code: () => Ve, isCode: () => ne, isName: () => dn, name: () => oe, normalFsTypes: () => Ui });
var ne = (s3) => oe.has(s3);
var dn = (s3) => Ve.has(s3);
var Ui = /* @__PURE__ */ new Set(["0", "", "1", "2", "3", "4", "5", "6", "7", "D"]);
var oe = /* @__PURE__ */ new Map([["0", "File"], ["", "OldFile"], ["1", "Link"], ["2", "SymbolicLink"], ["3", "CharacterDevice"], ["4", "BlockDevice"], ["5", "Directory"], ["6", "FIFO"], ["7", "ContiguousFile"], ["g", "GlobalExtendedHeader"], ["x", "ExtendedHeader"], ["A", "SolarisACL"], ["D", "GNUDumpDir"], ["I", "Inode"], ["K", "NextFileHasLongLinkpath"], ["L", "NextFileHasLongPath"], ["M", "ContinuationFile"], ["N", "OldGnuLongPath"], ["S", "SparseFile"], ["V", "TapeVolumeHeader"], ["X", "OldExtendedHeader"]]);
var Ve = new Map(Array.from(oe).map((s3) => [s3[1], s3[0]]));
var un = (s3) => s3 === void 0 || s3 < 0 ? void 0 : s3;
var F = class {
  cksumValid = false;
  needPax = false;
  nullBlock = false;
  block;
  path;
  mode;
  uid;
  gid;
  size;
  cksum;
  #t = "Unsupported";
  linkpath;
  uname;
  gname;
  devmaj = 0;
  devmin = 0;
  atime;
  ctime;
  mtime;
  charset;
  comment;
  constructor(t, e = 0, i, r) {
    Buffer.isBuffer(t) ? this.decode(t, e || 0, i, r) : t && this.#i(t);
  }
  decode(t, e, i, r) {
    if (e || (e = 0), !t || !(t.length >= e + 512)) throw new Error("need 512 bytes for header");
    let n = xt(t, e + 156, 1), o = Ui.has(n), h = o ? i : void 0, a = o ? r : void 0;
    if (this.path = h?.path ?? xt(t, e, 100), this.mode = h?.mode ?? a?.mode ?? lt(t, e + 100, 8), this.uid = h?.uid ?? a?.uid ?? lt(t, e + 108, 8), this.gid = h?.gid ?? a?.gid ?? lt(t, e + 116, 8), this.size = un(h?.size ?? a?.size ?? lt(t, e + 124, 12)), this.mtime = h?.mtime ?? a?.mtime ?? Wi(t, e + 136, 12), this.cksum = lt(t, e + 148, 12), a && this.#i(a, true), h && this.#i(h), ne(n) && (this.#t = n || "0"), this.#t === "0" && this.path.slice(-1) === "/" && (this.#t = "5"), this.#t === "5" && (this.size = 0), this.linkpath = xt(t, e + 157, 100), t.subarray(e + 257, e + 265).toString() === "ustar\x0000") if (this.uname = h?.uname ?? a?.uname ?? xt(t, e + 265, 32), this.gname = h?.gname ?? a?.gname ?? xt(t, e + 297, 32), this.devmaj = h?.devmaj ?? a?.devmaj ?? lt(t, e + 329, 8) ?? 0, this.devmin = h?.devmin ?? a?.devmin ?? lt(t, e + 337, 8) ?? 0, t[e + 475] !== 0) {
      let c = xt(t, e + 345, 155);
      this.path = c + "/" + this.path;
    } else {
      let c = xt(t, e + 345, 130);
      c && (this.path = c + "/" + this.path), this.atime = i?.atime ?? r?.atime ?? Wi(t, e + 476, 12), this.ctime = i?.ctime ?? r?.ctime ?? Wi(t, e + 488, 12);
    }
    let l = 256;
    for (let c = e; c < e + 148; c++) l += t[c];
    for (let c = e + 156; c < e + 512; c++) l += t[c];
    this.cksumValid = l === this.cksum, this.cksum === void 0 && l === 256 && (this.nullBlock = true);
  }
  #i(t, e = false) {
    Object.assign(this, Object.fromEntries(Object.entries(t).filter(([i, r]) => !(r == null || i === "size" && Number(r) < 0 || i === "path" && e || i === "linkpath" && e || i === "global"))));
  }
  encode(t, e = 0) {
    if (t || (t = this.block = Buffer.alloc(512)), this.#t === "Unsupported" && (this.#t = "0"), !(t.length >= e + 512)) throw new Error("need 512 bytes for header");
    let i = this.ctime || this.atime ? 130 : 155, r = mn(this.path || "", i), n = r[0], o = r[1];
    this.needPax = !!r[2], this.needPax = Lt(t, e, 100, n) || this.needPax, this.needPax = ct(t, e + 100, 8, this.mode) || this.needPax, this.needPax = ct(t, e + 108, 8, this.uid) || this.needPax, this.needPax = ct(t, e + 116, 8, this.gid) || this.needPax, this.needPax = ct(t, e + 124, 12, this.size) || this.needPax, this.needPax = Gi(t, e + 136, 12, this.mtime) || this.needPax, t[e + 156] = Number(this.#t.codePointAt(0)), this.needPax = Lt(t, e + 157, 100, this.linkpath) || this.needPax, t.write("ustar\x0000", e + 257, 8), this.needPax = Lt(t, e + 265, 32, this.uname) || this.needPax, this.needPax = Lt(t, e + 297, 32, this.gname) || this.needPax, this.needPax = ct(t, e + 329, 8, this.devmaj) || this.needPax, this.needPax = ct(t, e + 337, 8, this.devmin) || this.needPax, this.needPax = Lt(t, e + 345, i, o) || this.needPax, t[e + 475] !== 0 ? this.needPax = Lt(t, e + 345, 155, o) || this.needPax : (this.needPax = Lt(t, e + 345, 130, o) || this.needPax, this.needPax = Gi(t, e + 476, 12, this.atime) || this.needPax, this.needPax = Gi(t, e + 488, 12, this.ctime) || this.needPax);
    let h = 256;
    for (let a = e; a < e + 148; a++) h += t[a];
    for (let a = e + 156; a < e + 512; a++) h += t[a];
    return this.cksum = h, ct(t, e + 148, 8, this.cksum), this.cksumValid = true, this.needPax;
  }
  get type() {
    return this.#t === "Unsupported" ? this.#t : oe.get(this.#t);
  }
  get typeKey() {
    return this.#t;
  }
  set type(t) {
    let e = String(Ve.get(t));
    if (ne(e) || e === "Unsupported") this.#t = e;
    else if (ne(t)) this.#t = t;
    else throw new TypeError("invalid entry type: " + t);
  }
};
var mn = (s3, t) => {
  let i = s3, r = "", n, o = Zt.parse(s3).root || ".";
  if (Buffer.byteLength(i) < 100) n = [i, r, false];
  else {
    r = Zt.dirname(i), i = Zt.basename(i);
    do
      Buffer.byteLength(i) <= 100 && Buffer.byteLength(r) <= t ? n = [i, r, false] : Buffer.byteLength(i) > 100 && Buffer.byteLength(r) <= t ? n = [i.slice(0, 99), r, true] : (i = Zt.join(Zt.basename(r), i), r = Zt.dirname(r));
    while (r !== o && n === void 0);
    n || (n = [s3.slice(0, 99), "", true]);
  }
  return n;
};
var xt = (s3, t, e) => s3.subarray(t, t + e).toString("utf8").replace(/\0.*/, "");
var Wi = (s3, t, e) => pn(lt(s3, t, e));
var pn = (s3) => s3 === void 0 ? void 0 : new Date(s3 * 1e3);
var lt = (s3, t, e) => Number(s3[t]) & 128 ? Hs(s3.subarray(t, t + e)) : wn(s3, t, e);
var En = (s3) => isNaN(s3) ? void 0 : s3;
var wn = (s3, t, e) => En(parseInt(s3.subarray(t, t + e).toString("utf8").replace(/\0.*$/, "").trim(), 8));
var Sn = { 12: 8589934591, 8: 2097151 };
var ct = (s3, t, e, i) => i === void 0 ? false : i > Sn[e] || i < 0 ? (Us(i, s3.subarray(t, t + e)), true) : (yn(s3, t, e, i), false);
var yn = (s3, t, e, i) => s3.write(Rn(i, e), t, e, "ascii");
var Rn = (s3, t) => gn(Math.floor(s3).toString(8), t);
var gn = (s3, t) => (s3.length === t - 1 ? s3 : new Array(t - s3.length - 1).join("0") + s3 + " ") + "\0";
var Gi = (s3, t, e, i) => i === void 0 ? false : ct(s3, t, e, i.getTime() / 1e3);
var bn = new Array(156).join("\0");
var Lt = (s3, t, e, i) => i === void 0 ? false : (s3.write(i + bn, t, e, "utf8"), i.length !== Buffer.byteLength(i) || i.length > e);
var ft = class s {
  atime;
  mtime;
  ctime;
  charset;
  comment;
  gid;
  uid;
  gname;
  uname;
  linkpath;
  dev;
  ino;
  nlink;
  path;
  size;
  mode;
  global;
  constructor(t, e = false) {
    this.atime = t.atime, this.charset = t.charset, this.comment = t.comment, this.ctime = t.ctime, this.dev = t.dev, this.gid = t.gid, this.global = e, this.gname = t.gname, this.ino = t.ino, this.linkpath = t.linkpath, this.mtime = t.mtime, this.nlink = t.nlink, this.path = t.path, this.size = t.size, this.uid = t.uid, this.uname = t.uname;
  }
  encode() {
    let t = this.encodeBody();
    if (t === "") return Buffer.allocUnsafe(0);
    let e = Buffer.byteLength(t), i = 512 * Math.ceil(1 + e / 512), r = Buffer.allocUnsafe(i);
    for (let n = 0; n < 512; n++) r[n] = 0;
    new F({ path: ("PaxHeader/" + _n(this.path ?? "")).slice(0, 99), mode: this.mode || 420, uid: this.uid, gid: this.gid, size: e, mtime: this.mtime, type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader", linkpath: "", uname: this.uname || "", gname: this.gname || "", devmaj: 0, devmin: 0, atime: this.atime, ctime: this.ctime }).encode(r), r.write(t, 512, e, "utf8");
    for (let n = e + 512; n < r.length; n++) r[n] = 0;
    return r;
  }
  encodeBody() {
    return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
  }
  encodeField(t) {
    if (this[t] === void 0) return "";
    let e = this[t], i = e instanceof Date ? e.getTime() / 1e3 : e, r = " " + (t === "dev" || t === "ino" || t === "nlink" ? "SCHILY." : "") + t + "=" + i + `
`, n = Buffer.byteLength(r), o = Math.floor(Math.log(n) / Math.log(10)) + 1;
    return n + o >= Math.pow(10, o) && (o += 1), o + n + r;
  }
  static parse(t, e, i = false) {
    return new s(On(Tn(t), e), i);
  }
};
var On = (s3, t) => t ? Object.assign({}, t, s3) : s3;
var Tn = (s3) => s3.replace(/\n$/, "").split(`
`).reduce(xn, /* @__PURE__ */ Object.create(null));
var xn = (s3, t) => {
  let e = parseInt(t, 10);
  if (e !== Buffer.byteLength(t) + 1) return s3;
  t = t.slice((e + " ").length);
  let i = t.split("="), r = i.shift();
  if (!r) return s3;
  let n = r.replace(/^SCHILY\.(dev|ino|nlink)/, "$1"), o = i.join("=").replace(/\0.*/, "");
  switch (n) {
    case "path":
    case "linkpath":
    case "type":
    case "charset":
    case "comment":
    case "gname":
    case "uname":
      s3[n] = o;
      break;
    case "ctime":
    case "atime":
    case "mtime":
      s3[n] = new Date(Number(o) * 1e3);
      break;
    case "size":
      let h = +o;
      h >= 0 && (s3[n] = h);
      break;
    case "gid":
    case "uid":
    case "dev":
    case "ino":
    case "nlink":
    case "mode":
      s3[n] = +o;
      break;
  }
  return s3;
};
var Ln = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var f = Ln !== "win32" ? (s3) => String(s3) : (s3) => String(s3).replaceAll(/\\/g, "/");
var $e = class extends A {
  extended;
  globalExtended;
  header;
  startBlockSize;
  blockRemain;
  remain;
  type;
  meta = false;
  ignore = false;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  size = 0;
  mtime;
  atime;
  ctime;
  linkpath;
  dev;
  ino;
  nlink;
  invalid = false;
  absolute;
  unsupported = false;
  constructor(t, e, i) {
    switch (super({}), this.pause(), this.extended = e, this.globalExtended = i, this.header = t, this.remain = t.size ?? 0, this.startBlockSize = 512 * Math.ceil(this.remain / 512), this.blockRemain = this.startBlockSize, this.type = t.type, this.type) {
      case "File":
      case "OldFile":
      case "Link":
      case "SymbolicLink":
      case "CharacterDevice":
      case "BlockDevice":
      case "Directory":
      case "FIFO":
      case "ContiguousFile":
      case "GNUDumpDir":
        break;
      case "NextFileHasLongLinkpath":
      case "NextFileHasLongPath":
      case "OldGnuLongPath":
      case "GlobalExtendedHeader":
      case "ExtendedHeader":
      case "OldExtendedHeader":
        this.meta = true;
        break;
      default:
        this.ignore = true;
    }
    if (!t.path) throw new Error("no path provided for tar.ReadEntry");
    this.path = f(t.path), this.mode = t.mode, this.mode && (this.mode = this.mode & 4095), this.uid = t.uid, this.gid = t.gid, this.uname = t.uname, this.gname = t.gname, this.size = this.remain, this.mtime = t.mtime, this.atime = t.atime, this.ctime = t.ctime, this.linkpath = t.linkpath ? f(t.linkpath) : void 0, this.uname = t.uname, this.gname = t.gname, e && this.#t(e), i && this.#t(i, true);
  }
  write(t) {
    let e = t.length;
    if (e > this.blockRemain) throw new Error("writing more to entry than is appropriate");
    let i = this.remain, r = this.blockRemain;
    return this.remain = Math.max(0, i - e), this.blockRemain = Math.max(0, r - e), this.ignore ? true : i >= e ? super.write(t) : super.write(t.subarray(0, i));
  }
  #t(t, e = false) {
    t.path && (t.path = f(t.path)), t.linkpath && (t.linkpath = f(t.linkpath)), Object.assign(this, Object.fromEntries(Object.entries(t).filter(([i, r]) => !(r == null || i === "path" && e))));
  }
};
var Dt = (s3, t, e, i = {}) => {
  s3.file && (i.file = s3.file), s3.cwd && (i.cwd = s3.cwd), i.code = e instanceof Error && e.code || t, i.tarCode = t, !s3.strict && i.recoverable !== false ? (e instanceof Error && (i = Object.assign(e, i), e = e.message), s3.emit("warn", t, e, i)) : e instanceof Error ? s3.emit("error", Object.assign(e, i)) : s3.emit("error", Object.assign(new Error(`${t}: ${e}`), i));
};
var Nn = 1024 * 1024;
var Xi = Buffer.from([31, 139]);
var qi = Buffer.from([40, 181, 47, 253]);
var An = Math.max(Xi.length, qi.length);
var B = Symbol("state");
var Nt = Symbol("writeEntry");
var it = Symbol("readEntry");
var Zi = Symbol("nextEntry");
var Zs = Symbol("processEntry");
var V = Symbol("extendedHeader");
var he = Symbol("globalExtendedHeader");
var dt = Symbol("meta");
var Ys = Symbol("emitMeta");
var p = Symbol("buffer");
var st = Symbol("queue");
var ut = Symbol("ended");
var Yi = Symbol("emittedEnd");
var At = Symbol("emit");
var w = Symbol("unzip");
var Xe = Symbol("consumeChunk");
var qe = Symbol("consumeChunkSub");
var Ki = Symbol("consumeBody");
var Ks = Symbol("consumeMeta");
var Vs = Symbol("consumeHeader");
var ae = Symbol("consuming");
var Vi = Symbol("bufferConcat");
var Qe = Symbol("maybeEnd");
var Yt = Symbol("writing");
var $ = Symbol("aborted");
var Je = Symbol("onDone");
var It = Symbol("sawValidEntry");
var je = Symbol("sawNullBlock");
var ti = Symbol("sawEOF");
var $s = Symbol("closeStream");
var In = 1e3;
var le = Symbol("compressedBytesRead");
var $i = Symbol("decompressedBytesRead");
var Xs = Symbol("checkDecompressionRatio");
var Cn = () => true;
var rt = class extends Dn {
  file;
  strict;
  maxMetaEntrySize;
  filter;
  brotli;
  zstd;
  maxDecompressionRatio;
  writable = true;
  readable = false;
  [st] = [];
  [p];
  [it];
  [Nt];
  [B] = "begin";
  [dt] = "";
  [V];
  [he];
  [ut] = false;
  [w];
  [$] = false;
  [It];
  [je] = false;
  [ti] = false;
  [Yt] = false;
  [ae] = false;
  [Yi] = false;
  [le] = 0;
  [$i] = 0;
  constructor(t = {}) {
    super(), this.file = t.file || "", this.on(Je, () => {
      (this[B] === "begin" || this[It] === false) && this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
    }), t.ondone ? this.on(Je, t.ondone) : this.on(Je, () => {
      this.emit("prefinish"), this.emit("finish"), this.emit("end");
    }), this.strict = !!t.strict, this.maxDecompressionRatio = typeof t.maxDecompressionRatio == "number" ? t.maxDecompressionRatio : In, this.maxMetaEntrySize = t.maxMetaEntrySize || Nn, this.filter = typeof t.filter == "function" ? t.filter : Cn;
    let e = t.file && (t.file.endsWith(".tar.br") || t.file.endsWith(".tbr"));
    this.brotli = !(t.gzip || t.zstd) && t.brotli !== void 0 ? t.brotli : e ? void 0 : false;
    let i = t.file && (t.file.endsWith(".tar.zst") || t.file.endsWith(".tzst"));
    this.zstd = !(t.gzip || t.brotli) && t.zstd !== void 0 ? t.zstd : i ? true : void 0, this.on("end", () => this[$s]()), typeof t.onwarn == "function" && this.on("warn", t.onwarn), typeof t.onReadEntry == "function" && this.on("entry", t.onReadEntry);
  }
  warn(t, e, i = {}) {
    Dt(this, t, e, i);
  }
  [Vs](t, e) {
    this[It] === void 0 && (this[It] = false);
    let i;
    try {
      i = new F(t, e, this[V], this[he]);
    } catch (r) {
      return this.warn("TAR_ENTRY_INVALID", r);
    }
    if (i.nullBlock) this[je] ? (this[ti] = true, this[B] === "begin" && (this[B] = "header"), this[At]("eof")) : (this[je] = true, this[At]("nullBlock"));
    else if (this[je] = false, !i.cksumValid) this.warn("TAR_ENTRY_INVALID", "checksum failure", { header: i });
    else if (!i.path) this.warn("TAR_ENTRY_INVALID", "path is required", { header: i });
    else {
      let r = i.type;
      if (/^(Symbolic)?Link$/.test(r) && !i.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath required", { header: i });
      else if (!/^(Symbolic)?Link$/.test(r) && !/^(Global)?ExtendedHeader$/.test(r) && i.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", { header: i });
      else {
        let n = this[Nt] = new $e(i, this[V], this[he]);
        if (!this[It]) if (n.remain) {
          let o = () => {
            n.invalid || (this[It] = true);
          };
          n.on("end", o);
        } else this[It] = true;
        n.meta ? n.size > this.maxMetaEntrySize ? (n.ignore = true, this[At]("ignoredEntry", n), this[B] = "ignore", n.resume()) : n.size > 0 && (this[dt] = "", n.on("data", (o) => this[dt] += o), this[B] = "meta") : (this[V] = void 0, n.ignore = n.ignore || !this.filter(n.path, n), n.ignore ? (this[At]("ignoredEntry", n), this[B] = n.remain ? "ignore" : "header", n.resume()) : (n.remain ? this[B] = "body" : (this[B] = "header", n.end()), this[it] ? this[st].push(n) : (this[st].push(n), this[Zi]())));
      }
    }
  }
  [$s]() {
    queueMicrotask(() => this.emit("close"));
  }
  [Zs](t) {
    let e = true;
    if (!t) this[it] = void 0, e = false;
    else if (Array.isArray(t)) {
      let [i, ...r] = t;
      this.emit(i, ...r);
    } else this[it] = t, this.emit("entry", t), t.emittedEnd || (t.on("end", () => this[Zi]()), e = false);
    return e;
  }
  [Zi]() {
    do
      ;
    while (this[Zs](this[st].shift()));
    if (this[st].length === 0) {
      let t = this[it];
      !t || t.flowing || t.size === t.remain ? this[Yt] || this.emit("drain") : t.once("drain", () => this.emit("drain"));
    }
  }
  [Ki](t, e) {
    let i = this[Nt];
    if (!i) throw new Error("attempt to consume body without entry??");
    let r = i.blockRemain ?? 0, n = r >= t.length && e === 0 ? t : t.subarray(e, e + r);
    return i.write(n), i.blockRemain || (this[B] = "header", this[Nt] = void 0, i.end()), n.length;
  }
  [Ks](t, e) {
    let i = this[Nt], r = this[Ki](t, e);
    return !this[Nt] && i && this[Ys](i), r;
  }
  [At](t, e, i) {
    this[st].length === 0 && !this[it] ? this.emit(t, e, i) : this[st].push([t, e, i]);
  }
  [Ys](t) {
    switch (this[At]("meta", this[dt]), t.type) {
      case "ExtendedHeader":
      case "OldExtendedHeader":
        this[V] = ft.parse(this[dt], this[V], false);
        break;
      case "GlobalExtendedHeader":
        this[he] = ft.parse(this[dt], this[he], true);
        break;
      case "NextFileHasLongPath":
      case "OldGnuLongPath": {
        let e = this[V] ?? /* @__PURE__ */ Object.create(null);
        this[V] = e, e.path = this[dt].replace(/\0.*/, "");
        break;
      }
      case "NextFileHasLongLinkpath": {
        let e = this[V] || /* @__PURE__ */ Object.create(null);
        this[V] = e, e.linkpath = this[dt].replace(/\0.*/, "");
        break;
      }
      default:
        throw new Error("unknown meta: " + t.type);
    }
  }
  abort(t) {
    if (!this[$]) {
      if (this[w]) {
        let e = this[w];
        e.write = () => true, e.end = () => e, e.emit = () => false, e.destroy?.();
      }
      this[$] = true, this.emit("abort", t), this.warn("TAR_ABORT", t, { recoverable: false });
    }
  }
  [Xs](t) {
    this[$i] += t.length;
    let e = this[$i] / this[le];
    return e > this.maxDecompressionRatio ? (this.abort(new Error(`max decompression ratio exceeded: ${e.toFixed(2)} > ${this.maxDecompressionRatio}`)), false) : true;
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8")), this[$]) return i?.(), false;
    if ((this[w] === void 0 || this.brotli === void 0 && this[w] === false) && t) {
      if (this[p] && (t = Buffer.concat([this[p], t]), this[p] = void 0), t.length < An) return this[p] = t, i?.(), true;
      for (let a = 0; this[w] === void 0 && a < Xi.length; a++) t[a] !== Xi[a] && (this[w] = false);
      let o = false;
      if (this[w] === false && this.zstd !== false) {
        o = true;
        for (let a = 0; a < qi.length; a++) if (t[a] !== qi[a]) {
          o = false;
          break;
        }
      }
      let h = this.brotli === void 0 && !o;
      if (this[w] === false && h) if (t.length < 512) if (this[ut]) this.brotli = true;
      else return this[p] = t, i?.(), true;
      else try {
        new F(t.subarray(0, 512)), this.brotli = false;
      } catch {
        this.brotli = true;
      }
      if (this[w] === void 0 || this[w] === false && (this.brotli || o)) {
        let a = this[ut];
        this[ut] = false, this[w] = this[w] === void 0 ? new Ue({}) : o ? new Ke({}) : new Ge({}), this[w].on("data", (c) => {
          this[Xs](c) && this[Xe](c);
        }), this[w].on("error", (c) => {
          this[$] || this.abort(c);
        }), this[w].on("end", () => {
          this[ut] = true, this[Xe]();
        }), this[Yt] = true, this[le] += t.length;
        let l = !!this[w][a ? "end" : "write"](t);
        return this[Yt] = false, i?.(), l;
      }
    }
    this[Yt] = true, this[w] ? (this[le] += t.length, this[w].write(t)) : this[Xe](t), this[Yt] = false;
    let n = this[st].length > 0 ? false : this[it] ? this[it].flowing : true;
    return !n && this[st].length === 0 && this[it]?.once("drain", () => this.emit("drain")), i?.(), n;
  }
  [Vi](t) {
    t && !this[$] && (this[p] = this[p] ? Buffer.concat([this[p], t]) : t);
  }
  [Qe]() {
    if (this[ut] && !this[Yi] && !this[$] && !this[ae]) {
      this[Yi] = true;
      let t = this[Nt];
      if (t?.blockRemain) {
        let e = this[p] ? this[p].length : 0;
        this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${t.blockRemain} more bytes, only ${e} available)`, { entry: t }), this[p] && t.write(this[p]), t.end();
      }
      this[At](Je);
    }
  }
  [Xe](t) {
    if (this[ae] && t) this[Vi](t);
    else if (!t && !this[p]) this[Qe]();
    else if (t) {
      if (this[ae] = true, this[p]) {
        this[Vi](t);
        let e = this[p];
        this[p] = void 0, this[qe](e);
      } else this[qe](t);
      for (; this[p] && this[p]?.length >= 512 && !this[$] && !this[ti]; ) {
        let e = this[p];
        this[p] = void 0, this[qe](e);
      }
      this[ae] = false;
    }
    (!this[p] || this[ut]) && this[Qe]();
  }
  [qe](t) {
    let e = 0, i = t.length;
    for (; e + 512 <= i && !this[$] && !this[ti]; ) switch (this[B]) {
      case "begin":
      case "header":
        this[Vs](t, e), e += 512;
        break;
      case "ignore":
      case "body":
        e += this[Ki](t, e);
        break;
      case "meta":
        e += this[Ks](t, e);
        break;
      default:
        throw new Error("invalid state: " + this[B]);
    }
    e < i && (this[p] = this[p] ? Buffer.concat([t.subarray(e), this[p]]) : t.subarray(e));
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, e = void 0, t = void 0), typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, e)), i && this.once("finish", i), this[$] || (this[w] ? (t && (this[le] += t.length, this[w].write(t)), this[w].end()) : (this[ut] = true, (this.brotli === void 0 || this.zstd === void 0) && (t = t || Buffer.alloc(0)), t && this.write(t), this[Qe]())), this;
  }
};
var mt = (s3) => {
  let t = s3.length - 1, e = -1;
  for (; t > -1 && s3.charAt(t) === "/"; ) e = t, t--;
  return e === -1 ? s3 : s3.slice(0, e);
};
var vn = (s3) => {
  let t = s3.onReadEntry;
  s3.onReadEntry = t ? (e) => {
    t(e), e.resume();
  } : (e) => e.resume();
};
var Qi = (s3, t) => {
  let e = new Map(t.map((o) => [mt(o), true])), i = s3.filter, r = 100, n = (o, h = "", a = 0) => {
    if (a >= r) return e.set(o, false), false;
    let l = h || kn(o).root || ".", c;
    if (o === l) c = false;
    else {
      let d = e.get(o);
      c = d !== void 0 ? d : n(Fn(o), l, a + 1);
    }
    return e.set(o, c), c;
  };
  s3.filter = i ? (o, h) => i(o, h) && n(mt(o)) : (o) => n(mt(o));
};
var Mn = (s3) => {
  let t = new rt(s3), e = s3.file, i;
  try {
    i = Kt.openSync(e, "r");
    let r = Kt.fstatSync(i), n = s3.maxReadSize || 16 * 1024 * 1024;
    if (r.size < n) {
      let o = Buffer.allocUnsafe(r.size), h = Kt.readSync(i, o, 0, r.size, 0);
      t.end(h === o.byteLength ? o : o.subarray(0, h));
    } else {
      let o = 0, h = Buffer.allocUnsafe(n);
      for (; o < r.size; ) {
        let a = Kt.readSync(i, h, 0, n, o);
        if (a === 0) break;
        o += a, t.write(h.subarray(0, a));
      }
      t.end();
    }
  } finally {
    if (typeof i == "number") try {
      Kt.closeSync(i);
    } catch {
    }
  }
};
var Bn = (s3, t) => {
  let e = new rt(s3), i = s3.maxReadSize || 16 * 1024 * 1024, r = s3.file;
  return new Promise((o, h) => {
    e.on("error", h), e.on("end", o), Kt.stat(r, (a, l) => {
      if (a) h(a);
      else {
        let c = new _t(r, { readSize: i, size: l.size });
        c.on("error", h), c.pipe(e);
      }
    });
  });
};
var Ct = K(Mn, Bn, (s3) => new rt(s3), (s3) => new rt(s3), (s3, t) => {
  t?.length && Qi(s3, t), s3.noResume || vn(s3);
});
var Ji = (s3, t, e) => (s3 &= 4095, e && (s3 = (s3 | 384) & -19), t && (s3 & 256 && (s3 |= 64), s3 & 32 && (s3 |= 8), s3 & 4 && (s3 |= 1)), s3);
var { isAbsolute: zn, parse: qs } = Pn;
var ce = (s3) => {
  let t = "", e = qs(s3);
  for (; zn(s3) || e.root; ) {
    let i = s3.charAt(0) === "/" && s3.slice(0, 4) !== "//?/" ? "/" : e.root;
    s3 = s3.slice(i.length), t += i, e = qs(s3);
  }
  return [t, s3];
};
var ei = ["|", "<", ">", "?", ":"];
var ji = ei.map((s3) => String.fromCodePoint(61440 + Number(s3.codePointAt(0))));
var Un = new Map(ei.map((s3, t) => [s3, ji[t]]));
var Hn = new Map(ji.map((s3, t) => [s3, ei[t]]));
var ts = (s3) => ei.reduce((t, e) => t.split(e).join(Un.get(e)), s3);
var Qs = (s3) => ji.reduce((t, e) => t.split(e).join(Hn.get(e)), s3);
var rr = (s3, t) => t ? (s3 = f(s3).replace(/^\.(\/|$)/, ""), mt(t) + "/" + s3) : f(s3);
var Wn = 16 * 1024 * 1024;
var tr = Symbol("process");
var er = Symbol("file");
var ir = Symbol("directory");
var is = Symbol("symlink");
var sr = Symbol("hardlink");
var fe = Symbol("header");
var ii = Symbol("read");
var ss = Symbol("lstat");
var si = Symbol("onlstat");
var rs = Symbol("onread");
var ns = Symbol("onreadlink");
var os = Symbol("openfile");
var hs = Symbol("onopenfile");
var pt = Symbol("close");
var ri = Symbol("mode");
var as = Symbol("awaitDrain");
var es = Symbol("ondrain");
var q = Symbol("prefix");
var de = class extends A {
  path;
  portable;
  myuid = process.getuid && process.getuid() || 0;
  myuser = process.env.USER || "";
  maxReadSize;
  linkCache;
  statCache;
  preservePaths;
  cwd;
  strict;
  mtime;
  noPax;
  noMtime;
  prefix;
  fd;
  blockLen = 0;
  blockRemain = 0;
  buf;
  pos = 0;
  remain = 0;
  length = 0;
  offset = 0;
  win32;
  absolute;
  header;
  type;
  linkpath;
  stat;
  onWriteEntry;
  #t = false;
  constructor(t, e = {}) {
    let i = se(e);
    super(), this.path = f(t), this.portable = !!i.portable, this.maxReadSize = i.maxReadSize || Wn, this.linkCache = i.linkCache || /* @__PURE__ */ new Map(), this.statCache = i.statCache || /* @__PURE__ */ new Map(), this.preservePaths = !!i.preservePaths, this.cwd = f(i.cwd || process.cwd()), this.strict = !!i.strict, this.noPax = !!i.noPax, this.noMtime = !!i.noMtime, this.mtime = i.mtime, this.prefix = i.prefix ? f(i.prefix) : void 0, this.onWriteEntry = i.onWriteEntry, typeof i.onwarn == "function" && this.on("warn", i.onwarn);
    let r = false;
    if (!this.preservePaths) {
      let [o, h] = ce(this.path);
      o && typeof h == "string" && (this.path = h, r = o);
    }
    this.win32 = !!i.win32 || process.platform === "win32", this.win32 && (this.path = Qs(this.path.replaceAll(/\\/g, "/")), t = t.replaceAll(/\\/g, "/")), this.absolute = f(i.absolute || js.resolve(this.cwd, t)), this.path === "" && (this.path = "./"), r && this.warn("TAR_ENTRY_INFO", `stripping ${r} from absolute path`, { entry: this, path: r + this.path });
    let n = this.statCache.get(this.absolute);
    n ? this[si](n) : this[ss]();
  }
  warn(t, e, i = {}) {
    return Dt(this, t, e, i);
  }
  emit(t, ...e) {
    return t === "error" && (this.#t = true), super.emit(t, ...e);
  }
  [ss]() {
    X.lstat(this.absolute, (t, e) => {
      if (t) return this.emit("error", t);
      this[si](e);
    });
  }
  [si](t) {
    this.statCache.set(this.absolute, t), this.stat = t, t.isFile() || (t.size = 0), this.type = Gn(t), this.emit("stat", t), this[tr]();
  }
  [tr]() {
    switch (this.type) {
      case "File":
        return this[er]();
      case "Directory":
        return this[ir]();
      case "SymbolicLink":
        return this[is]();
      default:
        return this.end();
    }
  }
  [ri](t) {
    return Ji(t, this.type === "Directory", this.portable);
  }
  [q](t) {
    return rr(t, this.prefix);
  }
  [fe]() {
    if (!this.stat) throw new Error("cannot write header before stat");
    this.type === "Directory" && this.portable && (this.noMtime = true), this.onWriteEntry?.(this), this.header = new F({ path: this[q](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[q](this.linkpath) : this.linkpath, mode: this[ri](this.stat.mode), uid: this.portable ? void 0 : this.stat.uid, gid: this.portable ? void 0 : this.stat.gid, size: this.stat.size, mtime: this.noMtime ? void 0 : this.mtime || this.stat.mtime, type: this.type === "Unsupported" ? void 0 : this.type, uname: this.portable ? void 0 : this.stat.uid === this.myuid ? this.myuser : "", atime: this.portable ? void 0 : this.stat.atime, ctime: this.portable ? void 0 : this.stat.ctime }), this.header.encode() && !this.noPax && super.write(new ft({ atime: this.portable ? void 0 : this.header.atime, ctime: this.portable ? void 0 : this.header.ctime, gid: this.portable ? void 0 : this.header.gid, mtime: this.noMtime ? void 0 : this.mtime || this.header.mtime, path: this[q](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[q](this.linkpath) : this.linkpath, size: this.header.size, uid: this.portable ? void 0 : this.header.uid, uname: this.portable ? void 0 : this.header.uname, dev: this.portable ? void 0 : this.stat.dev, ino: this.portable ? void 0 : this.stat.ino, nlink: this.portable ? void 0 : this.stat.nlink }).encode());
    let t = this.header?.block;
    if (!t) throw new Error("failed to encode header");
    super.write(t);
  }
  [ir]() {
    if (!this.stat) throw new Error("cannot create directory entry without stat");
    this.path.slice(-1) !== "/" && (this.path += "/"), this.stat.size = 0, this[fe](), this.end();
  }
  [is]() {
    X.readlink(this.absolute, (t, e) => {
      if (t) return this.emit("error", t);
      this[ns](e);
    });
  }
  [ns](t) {
    this.linkpath = f(t), this[fe](), this.end();
  }
  [sr](t) {
    if (!this.stat) throw new Error("cannot create link entry without stat");
    this.type = "Link", this.linkpath = f(js.relative(this.cwd, t)), this.stat.size = 0, this[fe](), this.end();
  }
  [er]() {
    if (!this.stat) throw new Error("cannot create file entry without stat");
    if (this.stat.nlink > 1) {
      let t = `${this.stat.dev}:${this.stat.ino}`, e = this.linkCache.get(t);
      if (e?.indexOf(this.cwd) === 0) return this[sr](e);
      this.linkCache.set(t, this.absolute);
    }
    if (this[fe](), this.stat.size === 0) return this.end();
    this[os]();
  }
  [os]() {
    X.open(this.absolute, "r", (t, e) => {
      if (t) return this.emit("error", t);
      this[hs](e);
    });
  }
  [hs](t) {
    if (this.fd = t, this.#t) return this[pt]();
    if (!this.stat) throw new Error("should stat before calling onopenfile");
    this.blockLen = 512 * Math.ceil(this.stat.size / 512), this.blockRemain = this.blockLen;
    let e = Math.min(this.blockLen, this.maxReadSize);
    this.buf = Buffer.allocUnsafe(e), this.offset = 0, this.pos = 0, this.remain = this.stat.size, this.length = this.buf.length, this[ii]();
  }
  [ii]() {
    let { fd: t, buf: e, offset: i, length: r, pos: n } = this;
    if (t === void 0 || e === void 0) throw new Error("cannot read file without first opening");
    X.read(t, e, i, r, n, (o, h) => {
      if (o) return this[pt](() => this.emit("error", o));
      this[rs](h);
    });
  }
  [pt](t = () => {
  }) {
    this.fd !== void 0 && X.close(this.fd, t);
  }
  [rs](t) {
    if (t <= 0 && this.remain > 0) {
      let r = Object.assign(new Error("encountered unexpected EOF"), { path: this.absolute, syscall: "read", code: "EOF" });
      return this[pt](() => this.emit("error", r));
    }
    if (t > this.remain) {
      let r = Object.assign(new Error("did not encounter expected EOF"), { path: this.absolute, syscall: "read", code: "EOF" });
      return this[pt](() => this.emit("error", r));
    }
    if (!this.buf) throw new Error("should have created buffer prior to reading");
    if (t === this.remain) for (let r = t; r < this.length && t < this.blockRemain; r++) this.buf[r + this.offset] = 0, t++, this.remain++;
    let e = this.offset === 0 && t === this.buf.length ? this.buf : this.buf.subarray(this.offset, this.offset + t);
    this.write(e) ? this[es]() : this[as](() => this[es]());
  }
  [as](t) {
    this.once("drain", t);
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8")), this.blockRemain < t.length) {
      let r = Object.assign(new Error("writing more data than expected"), { path: this.absolute });
      return this.emit("error", r);
    }
    return this.remain -= t.length, this.blockRemain -= t.length, this.pos += t.length, this.offset += t.length, super.write(t, null, i);
  }
  [es]() {
    if (!this.remain) return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), this[pt]((t) => t ? this.emit("error", t) : this.end());
    if (!this.buf) throw new Error("buffer lost somehow in ONDRAIN");
    this.offset >= this.length && (this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length)), this.offset = 0), this.length = this.buf.length - this.offset, this[ii]();
  }
};
var ni = class extends de {
  sync = true;
  [ss]() {
    this[si](X.lstatSync(this.absolute));
  }
  [is]() {
    this[ns](X.readlinkSync(this.absolute));
  }
  [os]() {
    this[hs](X.openSync(this.absolute, "r"));
  }
  [ii]() {
    let t = true;
    try {
      let { fd: e, buf: i, offset: r, length: n, pos: o } = this;
      if (e === void 0 || i === void 0) throw new Error("fd and buf must be set in READ method");
      let h = X.readSync(e, i, r, n, o);
      this[rs](h), t = false;
    } finally {
      if (t) try {
        this[pt](() => {
        });
      } catch {
      }
    }
  }
  [as](t) {
    t();
  }
  [pt](t = () => {
  }) {
    this.fd !== void 0 && X.closeSync(this.fd), t();
  }
};
var oi = class extends A {
  blockLen = 0;
  blockRemain = 0;
  buf = 0;
  pos = 0;
  remain = 0;
  length = 0;
  preservePaths;
  portable;
  strict;
  noPax;
  noMtime;
  readEntry;
  type;
  prefix;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  header;
  mtime;
  atime;
  ctime;
  linkpath;
  size;
  onWriteEntry;
  warn(t, e, i = {}) {
    return Dt(this, t, e, i);
  }
  constructor(t, e = {}) {
    let i = se(e);
    super(), this.preservePaths = !!i.preservePaths, this.portable = !!i.portable, this.strict = !!i.strict, this.noPax = !!i.noPax, this.noMtime = !!i.noMtime, this.onWriteEntry = i.onWriteEntry, this.readEntry = t;
    let { type: r } = t;
    if (r === "Unsupported") throw new Error("writing entry that should be ignored");
    this.type = r, this.type === "Directory" && this.portable && (this.noMtime = true), this.prefix = i.prefix, this.path = f(t.path), this.mode = t.mode !== void 0 ? this[ri](t.mode) : void 0, this.uid = this.portable ? void 0 : t.uid, this.gid = this.portable ? void 0 : t.gid, this.uname = this.portable ? void 0 : t.uname, this.gname = this.portable ? void 0 : t.gname, this.size = t.size, this.mtime = this.noMtime ? void 0 : i.mtime || t.mtime, this.atime = this.portable ? void 0 : t.atime, this.ctime = this.portable ? void 0 : t.ctime, this.linkpath = t.linkpath !== void 0 ? f(t.linkpath) : void 0, typeof i.onwarn == "function" && this.on("warn", i.onwarn);
    let n = false;
    if (!this.preservePaths) {
      let [h, a] = ce(this.path);
      h && typeof a == "string" && (this.path = a, n = h);
    }
    this.remain = t.size, this.blockRemain = t.startBlockSize, this.onWriteEntry?.(this), this.header = new F({ path: this[q](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[q](this.linkpath) : this.linkpath, mode: this.mode, uid: this.portable ? void 0 : this.uid, gid: this.portable ? void 0 : this.gid, size: this.size, mtime: this.noMtime ? void 0 : this.mtime, type: this.type, uname: this.portable ? void 0 : this.uname, atime: this.portable ? void 0 : this.atime, ctime: this.portable ? void 0 : this.ctime }), n && this.warn("TAR_ENTRY_INFO", `stripping ${n} from absolute path`, { entry: this, path: n + this.path }), this.header.encode() && !this.noPax && super.write(new ft({ atime: this.portable ? void 0 : this.atime, ctime: this.portable ? void 0 : this.ctime, gid: this.portable ? void 0 : this.gid, mtime: this.noMtime ? void 0 : this.mtime, path: this[q](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[q](this.linkpath) : this.linkpath, size: this.size, uid: this.portable ? void 0 : this.uid, uname: this.portable ? void 0 : this.uname, dev: this.portable ? void 0 : this.readEntry.dev, ino: this.portable ? void 0 : this.readEntry.ino, nlink: this.portable ? void 0 : this.readEntry.nlink }).encode());
    let o = this.header?.block;
    if (!o) throw new Error("failed to encode header");
    super.write(o), t.pipe(this);
  }
  [q](t) {
    return rr(t, this.prefix);
  }
  [ri](t) {
    return Ji(t, this.type === "Directory", this.portable);
  }
  write(t, e, i) {
    typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8"));
    let r = t.length;
    if (r > this.blockRemain) throw new Error("writing more to entry than is appropriate");
    return this.blockRemain -= r, super.write(t, i);
  }
  end(t, e, i) {
    return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), typeof t == "function" && (i = t, e = void 0, t = void 0), typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, e ?? "utf8")), i && this.once("finish", i), t ? super.end(t, i) : super.end(i), this;
  }
};
var Gn = (s3) => s3.isFile() ? "File" : s3.isDirectory() ? "Directory" : s3.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
var hi = class s2 {
  tail;
  head;
  length = 0;
  static create(t = []) {
    return new s2(t);
  }
  constructor(t = []) {
    for (let e of t) this.push(e);
  }
  *[Symbol.iterator]() {
    for (let t = this.head; t; t = t.next) yield t.value;
  }
  removeNode(t) {
    if (t.list !== this) throw new Error("removing node which does not belong to this list");
    let e = t.next, i = t.prev;
    return e && (e.prev = i), i && (i.next = e), t === this.head && (this.head = e), t === this.tail && (this.tail = i), this.length--, t.next = void 0, t.prev = void 0, t.list = void 0, e;
  }
  unshiftNode(t) {
    if (t === this.head) return;
    t.list && t.list.removeNode(t);
    let e = this.head;
    t.list = this, t.next = e, e && (e.prev = t), this.head = t, this.tail || (this.tail = t), this.length++;
  }
  pushNode(t) {
    if (t === this.tail) return;
    t.list && t.list.removeNode(t);
    let e = this.tail;
    t.list = this, t.prev = e, e && (e.next = t), this.tail = t, this.head || (this.head = t), this.length++;
  }
  push(...t) {
    for (let e = 0, i = t.length; e < i; e++) Yn(this, t[e]);
    return this.length;
  }
  unshift(...t) {
    for (var e = 0, i = t.length; e < i; e++) Kn(this, t[e]);
    return this.length;
  }
  pop() {
    if (!this.tail) return;
    let t = this.tail.value, e = this.tail;
    return this.tail = this.tail.prev, this.tail ? this.tail.next = void 0 : this.head = void 0, e.list = void 0, this.length--, t;
  }
  shift() {
    if (!this.head) return;
    let t = this.head.value, e = this.head;
    return this.head = this.head.next, this.head ? this.head.prev = void 0 : this.tail = void 0, e.list = void 0, this.length--, t;
  }
  forEach(t, e) {
    e = e || this;
    for (let i = this.head, r = 0; i; r++) t.call(e, i.value, r, this), i = i.next;
  }
  forEachReverse(t, e) {
    e = e || this;
    for (let i = this.tail, r = this.length - 1; i; r--) t.call(e, i.value, r, this), i = i.prev;
  }
  get(t) {
    let e = 0, i = this.head;
    for (; i && e < t; e++) i = i.next;
    if (e === t && i) return i.value;
  }
  getReverse(t) {
    let e = 0, i = this.tail;
    for (; i && e < t; e++) i = i.prev;
    if (e === t && i) return i.value;
  }
  map(t, e) {
    e = e || this;
    let i = new s2();
    for (let r = this.head; r; ) i.push(t.call(e, r.value, this)), r = r.next;
    return i;
  }
  mapReverse(t, e) {
    e = e || this;
    var i = new s2();
    for (let r = this.tail; r; ) i.push(t.call(e, r.value, this)), r = r.prev;
    return i;
  }
  reduce(t, e) {
    let i, r = this.head;
    if (arguments.length > 1) i = e;
    else if (this.head) r = this.head.next, i = this.head.value;
    else throw new TypeError("Reduce of empty list with no initial value");
    for (var n = 0; r; n++) i = t(i, r.value, n), r = r.next;
    return i;
  }
  reduceReverse(t, e) {
    let i, r = this.tail;
    if (arguments.length > 1) i = e;
    else if (this.tail) r = this.tail.prev, i = this.tail.value;
    else throw new TypeError("Reduce of empty list with no initial value");
    for (let n = this.length - 1; r; n--) i = t(i, r.value, n), r = r.prev;
    return i;
  }
  toArray() {
    let t = new Array(this.length);
    for (let e = 0, i = this.head; i; e++) t[e] = i.value, i = i.next;
    return t;
  }
  toArrayReverse() {
    let t = new Array(this.length);
    for (let e = 0, i = this.tail; i; e++) t[e] = i.value, i = i.prev;
    return t;
  }
  slice(t = 0, e = this.length) {
    e < 0 && (e += this.length), t < 0 && (t += this.length);
    let i = new s2();
    if (e < t || e < 0) return i;
    t < 0 && (t = 0), e > this.length && (e = this.length);
    let r = this.head, n = 0;
    for (n = 0; r && n < t; n++) r = r.next;
    for (; r && n < e; n++, r = r.next) i.push(r.value);
    return i;
  }
  sliceReverse(t = 0, e = this.length) {
    e < 0 && (e += this.length), t < 0 && (t += this.length);
    let i = new s2();
    if (e < t || e < 0) return i;
    t < 0 && (t = 0), e > this.length && (e = this.length);
    let r = this.length, n = this.tail;
    for (; n && r > e; r--) n = n.prev;
    for (; n && r > t; r--, n = n.prev) i.push(n.value);
    return i;
  }
  splice(t, e = 0, ...i) {
    t > this.length && (t = this.length - 1), t < 0 && (t = this.length + t);
    let r = this.head;
    for (let o = 0; r && o < t; o++) r = r.next;
    let n = [];
    for (let o = 0; r && o < e; o++) n.push(r.value), r = this.removeNode(r);
    r ? r !== this.tail && (r = r.prev) : r = this.tail;
    for (let o of i) r = Zn(this, r, o);
    return n;
  }
  reverse() {
    let t = this.head, e = this.tail;
    for (let i = t; i; i = i.prev) {
      let r = i.prev;
      i.prev = i.next, i.next = r;
    }
    return this.head = e, this.tail = t, this;
  }
};
function Zn(s3, t, e) {
  let i = t, r = t ? t.next : s3.head, n = new ue(e, i, r, s3);
  return n.next === void 0 && (s3.tail = n), n.prev === void 0 && (s3.head = n), s3.length++, n;
}
function Yn(s3, t) {
  s3.tail = new ue(t, s3.tail, void 0, s3), s3.head || (s3.head = s3.tail), s3.length++;
}
function Kn(s3, t) {
  s3.head = new ue(t, void 0, s3.head, s3), s3.tail || (s3.tail = s3.head), s3.length++;
}
var ue = class {
  list;
  next;
  prev;
  value;
  constructor(t, e, i, r) {
    this.list = r, this.value = t, e ? (e.next = this, this.prev = e) : this.prev = void 0, i ? (i.prev = this, this.next = i) : this.next = void 0;
  }
};
var pi = class {
  path;
  absolute;
  entry;
  stat;
  readdir;
  pending = false;
  pendingLink = false;
  ignore = false;
  piped = false;
  constructor(t, e) {
    this.path = t || "./", this.absolute = e;
  }
};
var nr = Buffer.alloc(1024);
var li = Symbol("onStat");
var me = Symbol("ended");
var W = Symbol("queue");
var pe = Symbol("pendingLinks");
var Et = Symbol("current");
var Ft = Symbol("process");
var Ee = Symbol("processing");
var ai = Symbol("processJob");
var G = Symbol("jobs");
var ls = Symbol("jobDone");
var ci = Symbol("addFSEntry");
var or = Symbol("addTarEntry");
var ds = Symbol("stat");
var us = Symbol("readdir");
var fi = Symbol("onreaddir");
var di = Symbol("pipe");
var hr = Symbol("entry");
var cs = Symbol("entryOpt");
var ui = Symbol("writeEntryClass");
var lr = Symbol("write");
var fs = Symbol("ondrain");
var wt = class extends A {
  sync = false;
  opt;
  cwd;
  maxReadSize;
  preservePaths;
  strict;
  noPax;
  prefix;
  linkCache;
  statCache;
  file;
  portable;
  zip;
  readdirCache;
  noDirRecurse;
  follow;
  noMtime;
  mtime;
  filter;
  jobs;
  [ui];
  onWriteEntry;
  [W];
  [pe] = /* @__PURE__ */ new Map();
  [G] = 0;
  [Ee] = false;
  [me] = false;
  constructor(t = {}) {
    if (super(), this.opt = t, this.file = t.file || "", this.cwd = t.cwd || process.cwd(), this.maxReadSize = t.maxReadSize, this.preservePaths = !!t.preservePaths, this.strict = !!t.strict, this.noPax = !!t.noPax, this.prefix = f(t.prefix || ""), this.linkCache = t.linkCache || /* @__PURE__ */ new Map(), this.statCache = t.statCache || /* @__PURE__ */ new Map(), this.readdirCache = t.readdirCache || /* @__PURE__ */ new Map(), this.onWriteEntry = t.onWriteEntry, this[ui] = de, typeof t.onwarn == "function" && this.on("warn", t.onwarn), this.portable = !!t.portable, t.gzip || t.brotli || t.zstd) {
      if ((t.gzip ? 1 : 0) + (t.brotli ? 1 : 0) + (t.zstd ? 1 : 0) > 1) throw new TypeError("gzip, brotli, zstd are mutually exclusive");
      if (t.gzip && (typeof t.gzip != "object" && (t.gzip = {}), this.portable && (t.gzip.portable = true), this.zip = new ze(t.gzip)), t.brotli && (typeof t.brotli != "object" && (t.brotli = {}), this.zip = new We(t.brotli)), t.zstd && (typeof t.zstd != "object" && (t.zstd = {}), this.zip = new Ye(t.zstd)), !this.zip) throw new Error("impossible");
      let e = this.zip;
      e.on("data", (i) => super.write(i)), e.on("end", () => super.end()), e.on("drain", () => this[fs]()), this.on("resume", () => e.resume());
    } else this.on("drain", this[fs]);
    this.noDirRecurse = !!t.noDirRecurse, this.follow = !!t.follow, this.noMtime = !!t.noMtime, t.mtime && (this.mtime = t.mtime), this.filter = typeof t.filter == "function" ? t.filter : () => true, this[W] = new hi(), this[G] = 0, this.jobs = Number(t.jobs) || 4, this[Ee] = false, this[me] = false;
  }
  [lr](t) {
    return super.write(t);
  }
  add(t) {
    return this.write(t), this;
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, t = void 0), typeof e == "function" && (i = e, e = void 0), t && this.add(t), this[me] = true, this[Ft](), i && i(), this;
  }
  write(t) {
    if (this[me]) throw new Error("write after end");
    return typeof t == "string" ? this[ci](t) : this[or](t), this.flowing;
  }
  [or](t) {
    let e = f(ar.resolve(this.cwd, t.path));
    if (!this.filter(t.path, t)) t.resume();
    else {
      let i = new pi(t.path, e);
      i.entry = new oi(t, this[cs](i)), i.entry.on("end", () => this[ls](i)), this[G] += 1, this[W].push(i);
    }
    this[Ft]();
  }
  [ci](t) {
    let e = f(ar.resolve(this.cwd, t));
    this[W].push(new pi(t, e)), this[Ft]();
  }
  [ds](t) {
    t.pending = true, this[G] += 1;
    let e = this.follow ? "stat" : "lstat";
    mi[e](t.absolute, (i, r) => {
      t.pending = false, this[G] -= 1, i ? this.emit("error", i) : this[li](t, r);
    });
  }
  [li](t, e) {
    if (this.statCache.set(t.absolute, e), t.stat = e, !this.filter(t.path, e)) t.ignore = true;
    else if (e.isFile() && e.nlink > 1 && !this.linkCache.get(`${e.dev}:${e.ino}`) && !this.sync) if (t === this[Et]) this[ai](t);
    else {
      let i = `${e.dev}:${e.ino}`, r = this[pe].get(i);
      r ? r.push(t) : this[pe].set(i, [t]), t.pendingLink = true, t.pending = true;
    }
    this[Ft]();
  }
  [us](t) {
    t.pending = true, this[G] += 1, mi.readdir(t.absolute, (e, i) => {
      if (t.pending = false, this[G] -= 1, e) return this.emit("error", e);
      this[fi](t, i);
    });
  }
  [fi](t, e) {
    this.readdirCache.set(t.absolute, e), t.readdir = e, this[Ft]();
  }
  [Ft]() {
    if (!this[Ee]) {
      this[Ee] = true;
      for (let t = this[W].head; t && this[G] < this.jobs; t = t.next) if (this[ai](t.value), t.value.ignore) {
        let e = t.next;
        this[W].removeNode(t), t.next = e;
      }
      this[Ee] = false, this[me] && this[W].length === 0 && this[G] === 0 && (this.zip ? this.zip.end(nr) : (super.write(nr), super.end()));
    }
  }
  get [Et]() {
    return this[W] && this[W].head && this[W].head.value;
  }
  [ls](t) {
    this[W].shift(), this[G] -= 1;
    let { stat: e } = t;
    if (e && e.isFile() && e.nlink > 1) {
      let i = `${e.dev}:${e.ino}`, r = this[pe].get(i);
      if (r) {
        this[pe].delete(i);
        for (let n of r) n.pending = false, this[ai](n);
      }
    }
    this[Ft]();
  }
  [ai](t) {
    if (t.pending && t.pendingLink && t === this[Et] && (t.pending = false, t.pendingLink = false), !t.pending) {
      if (t.entry) {
        t === this[Et] && !t.piped && this[di](t);
        return;
      }
      if (!t.stat) {
        let e = this.statCache.get(t.absolute);
        e ? this[li](t, e) : this[ds](t);
      }
      if (t.stat && !t.ignore) {
        if (!this.noDirRecurse && t.stat.isDirectory() && !t.readdir) {
          let e = this.readdirCache.get(t.absolute);
          if (e ? this[fi](t, e) : this[us](t), !t.readdir) return;
        }
        if (t.entry = this[hr](t), !t.entry) {
          t.ignore = true;
          return;
        }
        t === this[Et] && !t.piped && this[di](t);
      }
    }
  }
  [cs](t) {
    return { onwarn: (e, i, r) => this.warn(e, i, r), noPax: this.noPax, cwd: this.cwd, absolute: t.absolute, preservePaths: this.preservePaths, maxReadSize: this.maxReadSize, strict: this.strict, portable: this.portable, linkCache: this.linkCache, statCache: this.statCache, noMtime: this.noMtime, mtime: this.mtime, prefix: this.prefix, onWriteEntry: this.onWriteEntry };
  }
  [hr](t) {
    this[G] += 1;
    try {
      return new this[ui](t.path, this[cs](t)).on("end", () => this[ls](t)).on("error", (i) => this.emit("error", i));
    } catch (e) {
      this.emit("error", e);
    }
  }
  [fs]() {
    this[Et] && this[Et].entry && this[Et].entry.resume();
  }
  [di](t) {
    t.piped = true, t.readdir && t.readdir.forEach((r) => {
      let n = t.path, o = n === "./" ? "" : n.replace(/\/*$/, "/");
      this[ci](o + r);
    });
    let e = t.entry, i = this.zip;
    if (!e) throw new Error("cannot pipe without source");
    i ? e.on("data", (r) => {
      i.write(r) || e.pause();
    }) : e.on("data", (r) => {
      super.write(r) || e.pause();
    });
  }
  pause() {
    return this.zip && this.zip.pause(), super.pause();
  }
  warn(t, e, i = {}) {
    Dt(this, t, e, i);
  }
};
var kt = class extends wt {
  sync = true;
  constructor(t) {
    super(t), this[ui] = ni;
  }
  pause() {
  }
  resume() {
  }
  [ds](t) {
    let e = this.follow ? "statSync" : "lstatSync";
    this[li](t, mi[e](t.absolute));
  }
  [us](t) {
    this[fi](t, mi.readdirSync(t.absolute));
  }
  [di](t) {
    let e = t.entry, i = this.zip;
    if (t.readdir && t.readdir.forEach((r) => {
      let n = t.path, o = n === "./" ? "" : n.replace(/\/*$/, "/");
      this[ci](o + r);
    }), !e) throw new Error("Cannot pipe without source");
    i ? e.on("data", (r) => {
      i.write(r);
    }) : e.on("data", (r) => {
      super[lr](r);
    });
  }
};
var Vn = (s3, t) => {
  let e = new kt(s3), i = new Wt(s3.file, { mode: s3.mode || 438 });
  e.pipe(i), fr(e, t);
};
var $n = (s3, t) => {
  let e = new wt(s3), i = new et(s3.file, { mode: s3.mode || 438 });
  e.pipe(i);
  let r = new Promise((n, o) => {
    i.on("error", o), i.on("close", n), e.on("error", o);
  });
  return dr(e, t).catch((n) => e.emit("error", n)), r;
};
var fr = (s3, t) => {
  t.forEach((e) => {
    e.charAt(0) === "@" ? Ct({ file: cr.resolve(s3.cwd, e.slice(1)), sync: true, noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  }), s3.end();
};
var dr = async (s3, t) => {
  for (let e of t) e.charAt(0) === "@" ? await Ct({ file: cr.resolve(String(s3.cwd), e.slice(1)), noResume: true, onReadEntry: (i) => {
    s3.add(i);
  } }) : s3.add(e);
  s3.end();
};
var Xn = (s3, t) => {
  let e = new kt(s3);
  return fr(e, t), e;
};
var qn = (s3, t) => {
  let e = new wt(s3);
  return dr(e, t).catch((i) => e.emit("error", i)), e;
};
var Qn = K(Vn, $n, Xn, qn, (s3, t) => {
  if (!t?.length) throw new TypeError("no paths specified to add to archive");
});
var Jn = process.env.__FAKE_PLATFORM__ || process.platform;
var Er = Jn === "win32";
var { O_CREAT: wr, O_NOFOLLOW: ur, O_TRUNC: Sr, O_WRONLY: yr } = pr.constants;
var Rr = Number(process.env.__FAKE_FS_O_FILENAME__) || pr.constants.UV_FS_O_FILEMAP || 0;
var jn = Er && !!Rr;
var to = 512 * 1024;
var eo = Rr | Sr | wr | yr;
var mr = !Er && typeof ur == "number" ? ur | Sr | wr | yr : null;
var ms = mr !== null ? () => mr : jn ? (s3) => s3 < to ? eo : "w" : () => "w";
var ps = (s3, t, e) => {
  try {
    return wi.lchownSync(s3, t, e);
  } catch (i) {
    if (i?.code !== "ENOENT") throw i;
  }
};
var Ei = (s3, t, e, i) => {
  wi.lchown(s3, t, e, (r) => {
    i(r && r?.code !== "ENOENT" ? r : null);
  });
};
var io = (s3, t, e, i, r) => {
  if (t.isDirectory()) Es(we.resolve(s3, t.name), e, i, (n) => {
    if (n) return r(n);
    let o = we.resolve(s3, t.name);
    Ei(o, e, i, r);
  });
  else {
    let n = we.resolve(s3, t.name);
    Ei(n, e, i, r);
  }
};
var Es = (s3, t, e, i) => {
  wi.readdir(s3, { withFileTypes: true }, (r, n) => {
    if (r) {
      if (r.code === "ENOENT") return i();
      if (r.code !== "ENOTDIR" && r.code !== "ENOTSUP") return i(r);
    }
    if (r || !n.length) return Ei(s3, t, e, i);
    let o = n.length, h = null, a = (l) => {
      if (!h) {
        if (l) return i(h = l);
        if (--o === 0) return Ei(s3, t, e, i);
      }
    };
    for (let l of n) io(s3, l, t, e, a);
  });
};
var so = (s3, t, e, i) => {
  t.isDirectory() && ws(we.resolve(s3, t.name), e, i), ps(we.resolve(s3, t.name), e, i);
};
var ws = (s3, t, e) => {
  let i;
  try {
    i = wi.readdirSync(s3, { withFileTypes: true });
  } catch (r) {
    let n = r;
    if (n?.code === "ENOENT") return;
    if (n?.code === "ENOTDIR" || n?.code === "ENOTSUP") return ps(s3, t, e);
    throw n;
  }
  for (let r of i) so(s3, r, t, e);
  return ps(s3, t, e);
};
var Se = class extends Error {
  path;
  code;
  syscall = "chdir";
  constructor(t, e) {
    super(`${e}: Cannot cd into '${t}'`), this.path = t, this.code = e;
  }
  get name() {
    return "CwdError";
  }
};
var St = class extends Error {
  path;
  symlink;
  syscall = "symlink";
  code = "TAR_SYMLINK_ERROR";
  constructor(t, e) {
    super("TAR_SYMLINK_ERROR: Cannot extract through symbolic link"), this.symlink = t, this.path = e;
  }
  get name() {
    return "SymlinkError";
  }
};
var no = (s3, t) => {
  k.stat(s3, (e, i) => {
    (e || !i.isDirectory()) && (e = new Se(s3, e?.code || "ENOTDIR")), t(e);
  });
};
var gr = (s3, t, e) => {
  s3 = f(s3);
  let i = t.umask ?? 18, r = t.mode | 448, n = (r & i) !== 0, o = t.uid, h = t.gid, a = typeof o == "number" && typeof h == "number" && (o !== t.processUid || h !== t.processGid), l = t.preserve, c = t.unlink, d = f(t.cwd), y = (E, x) => {
    E ? e(E) : x && a ? Es(x, o, h, (Le) => y(Le)) : n ? k.chmod(s3, r, e) : e();
  };
  if (s3 === d) return no(s3, y);
  if (l) return ro.mkdir(s3, { mode: r, recursive: true }).then((E) => y(null, E ?? void 0), y);
  let D = f(Si.relative(d, s3)).split("/");
  Ss(d, D, r, c, d, void 0, y);
};
var Ss = (s3, t, e, i, r, n, o) => {
  if (t.length === 0) return o(null, n);
  let h = t.shift(), a = f(Si.resolve(s3 + "/" + h));
  k.mkdir(a, e, br(a, t, e, i, r, n, o));
};
var br = (s3, t, e, i, r, n, o) => (h) => {
  h ? k.lstat(s3, (a, l) => {
    if (a) a.path = a.path && f(a.path), o(a);
    else if (l.isDirectory()) Ss(s3, t, e, i, r, n, o);
    else if (i) k.unlink(s3, (c) => {
      if (c) return o(c);
      k.mkdir(s3, e, br(s3, t, e, i, r, n, o));
    });
    else {
      if (l.isSymbolicLink()) return o(new St(s3, s3 + "/" + t.join("/")));
      o(h);
    }
  }) : (n = n || s3, Ss(s3, t, e, i, r, n, o));
};
var oo = (s3) => {
  let t = false, e;
  try {
    t = k.statSync(s3).isDirectory();
  } catch (i) {
    e = i?.code;
  } finally {
    if (!t) throw new Se(s3, e ?? "ENOTDIR");
  }
};
var _r = (s3, t) => {
  s3 = f(s3);
  let e = t.umask ?? 18, i = t.mode | 448, r = (i & e) !== 0, n = t.uid, o = t.gid, h = typeof n == "number" && typeof o == "number" && (n !== t.processUid || o !== t.processGid), a = t.preserve, l = t.unlink, c = f(t.cwd), d = (E) => {
    E && h && ws(E, n, o), r && k.chmodSync(s3, i);
  };
  if (s3 === c) return oo(c), d();
  if (a) return d(k.mkdirSync(s3, { mode: i, recursive: true }) ?? void 0);
  let T = f(Si.relative(c, s3)).split("/"), D;
  for (let E = T.shift(), x = c; E && (x += "/" + E); E = T.shift()) {
    x = f(Si.resolve(x));
    try {
      k.mkdirSync(x, i), D = D || x;
    } catch {
      let Le = k.lstatSync(x);
      if (Le.isDirectory()) continue;
      if (l) {
        k.unlinkSync(x), k.mkdirSync(x, i), D = D || x;
        continue;
      } else if (Le.isSymbolicLink()) return new St(x, x + "/" + T.join("/"));
    }
  }
  return d(D);
};
var ys = /* @__PURE__ */ Object.create(null);
var Or = 1e4;
var Vt = /* @__PURE__ */ new Set();
var Tr = (s3) => {
  Vt.has(s3) ? Vt.delete(s3) : ys[s3] = s3.normalize("NFD").toLocaleLowerCase("en").toLocaleUpperCase("en"), Vt.add(s3);
  let t = ys[s3], e = Vt.size - Or;
  if (e > Or / 10) {
    for (let i of Vt) if (Vt.delete(i), delete ys[i], --e <= 0) break;
  }
  return t;
};
var ho = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var ao = ho === "win32";
var lo = (s3) => s3.split("/").slice(0, -1).reduce((e, i) => {
  let r = e.at(-1);
  return r !== void 0 && (i = xr(r, i)), e.push(i || "/"), e;
}, []);
var yi = class {
  #t = /* @__PURE__ */ new Map();
  #i = /* @__PURE__ */ new Map();
  #s = /* @__PURE__ */ new Set();
  reserve(t, e) {
    t = ao ? ["win32 parallelization disabled"] : t.map((r) => mt(xr(Tr(r))));
    let i = new Set(t.map((r) => lo(r)).reduce((r, n) => r.concat(n)));
    this.#i.set(e, { dirs: i, paths: t });
    for (let r of t) {
      let n = this.#t.get(r);
      n ? n.push(e) : this.#t.set(r, [e]);
    }
    for (let r of i) {
      let n = this.#t.get(r);
      if (!n) this.#t.set(r, [/* @__PURE__ */ new Set([e])]);
      else {
        let o = n.at(-1);
        o instanceof Set ? o.add(e) : n.push(/* @__PURE__ */ new Set([e]));
      }
    }
    return this.#r(e);
  }
  #n(t) {
    let e = this.#i.get(t);
    if (!e) throw new Error("function does not have any path reservations");
    return { paths: e.paths.map((i) => this.#t.get(i)), dirs: [...e.dirs].map((i) => this.#t.get(i)) };
  }
  check(t) {
    let { paths: e, dirs: i } = this.#n(t);
    return e.every((r) => r && r[0] === t) && i.every((r) => r && r[0] instanceof Set && r[0].has(t));
  }
  #r(t) {
    return this.#s.has(t) || !this.check(t) ? false : (this.#s.add(t), t(() => this.#e(t)), true);
  }
  #e(t) {
    if (!this.#s.has(t)) return false;
    let e = this.#i.get(t);
    if (!e) throw new Error("invalid reservation");
    let { paths: i, dirs: r } = e, n = /* @__PURE__ */ new Set();
    for (let o of i) {
      let h = this.#t.get(o);
      if (!h || h?.[0] !== t) continue;
      let a = h[1];
      if (!a) {
        this.#t.delete(o);
        continue;
      }
      if (h.shift(), typeof a == "function") n.add(a);
      else for (let l of a) n.add(l);
    }
    for (let o of r) {
      let h = this.#t.get(o), a = h?.[0];
      if (!(!h || !(a instanceof Set))) if (a.size === 1 && h.length === 1) {
        this.#t.delete(o);
        continue;
      } else if (a.size === 1) {
        h.shift();
        let l = h[0];
        typeof l == "function" && n.add(l);
      } else a.delete(t);
    }
    return this.#s.delete(t), n.forEach((o) => this.#r(o)), true;
  }
};
var Lr = () => process.umask();
var Dr = Symbol("onEntry");
var _s = Symbol("checkFs");
var Nr = Symbol("checkFs2");
var Os = Symbol("isReusable");
var P = Symbol("makeFs");
var Ts = Symbol("file");
var xs = Symbol("directory");
var gi = Symbol("link");
var Ar = Symbol("symlink");
var Ir = Symbol("hardlink");
var Re = Symbol("ensureNoSymlink");
var Cr = Symbol("unsupported");
var Fr = Symbol("checkPath");
var Rs = Symbol("stripAbsolutePath");
var yt = Symbol("mkdir");
var O = Symbol("onError");
var Ri = Symbol("pending");
var kr = Symbol("pend");
var $t = Symbol("unpend");
var gs = Symbol("ended");
var bs = Symbol("maybeClose");
var Ls = Symbol("skip");
var ge = Symbol("doChown");
var be = Symbol("uid");
var _e = Symbol("gid");
var Oe = Symbol("checkedCwd");
var fo = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var Te = fo === "win32";
var uo = 1024;
var mo = (s3, t) => {
  if (!Te) return u.unlink(s3, t);
  let e = s3 + ".DELETE." + Mr(16).toString("hex");
  u.rename(s3, e, (i) => {
    if (i) return t(i);
    u.unlink(e, t);
  });
};
var po = (s3) => {
  if (!Te) return u.unlinkSync(s3);
  let t = s3 + ".DELETE." + Mr(16).toString("hex");
  u.renameSync(s3, t), u.unlinkSync(t);
};
var vr = (s3, t, e) => s3 !== void 0 && s3 === s3 >>> 0 ? s3 : t !== void 0 && t === t >>> 0 ? t : e;
var Xt = class extends rt {
  [gs] = false;
  [Oe] = false;
  [Ri] = 0;
  reservations = new yi();
  transform;
  writable = true;
  readable = false;
  uid;
  gid;
  setOwner;
  preserveOwner;
  processGid;
  processUid;
  maxDepth;
  forceChown;
  win32;
  newer;
  keep;
  noMtime;
  preservePaths;
  unlink;
  cwd;
  strip;
  processUmask;
  umask;
  dmode;
  fmode;
  chmod;
  constructor(t = {}) {
    if (t.ondone = () => {
      this[gs] = true, this[bs]();
    }, super(t), this.transform = t.transform, this.chmod = !!t.chmod, typeof t.uid == "number" || typeof t.gid == "number") {
      if (typeof t.uid != "number" || typeof t.gid != "number") throw new TypeError("cannot set owner without number uid and gid");
      if (t.preserveOwner) throw new TypeError("cannot preserve owner in archive and also set owner explicitly");
      this.uid = t.uid, this.gid = t.gid, this.setOwner = true;
    } else this.uid = void 0, this.gid = void 0, this.setOwner = false;
    this.preserveOwner = t.preserveOwner === void 0 && typeof t.uid != "number" ? process.getuid?.() === 0 : !!t.preserveOwner, this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : void 0, this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : void 0, this.maxDepth = typeof t.maxDepth == "number" ? t.maxDepth : uo, this.forceChown = t.forceChown === true, this.win32 = !!t.win32 || Te, this.newer = !!t.newer, this.keep = !!t.keep, this.noMtime = !!t.noMtime, this.preservePaths = !!t.preservePaths, this.unlink = !!t.unlink, this.cwd = f(R.resolve(t.cwd || process.cwd())), this.strip = Number(t.strip) || 0, this.processUmask = this.chmod ? typeof t.processUmask == "number" ? t.processUmask : Lr() : 0, this.umask = typeof t.umask == "number" ? t.umask : this.processUmask, this.dmode = t.dmode || 511 & ~this.umask, this.fmode = t.fmode || 438 & ~this.umask, this.on("entry", (e) => this[Dr](e));
  }
  warn(t, e, i = {}) {
    return (t === "TAR_BAD_ARCHIVE" || t === "TAR_ABORT") && (i.recoverable = false), super.warn(t, e, i);
  }
  [bs]() {
    this[gs] && this[Ri] === 0 && (this.emit("prefinish"), this.emit("finish"), this.emit("end"));
  }
  [Rs](t, e) {
    let i = t[e], { type: r } = t;
    if (!i || this.preservePaths) return true;
    let [n, o] = ce(i), h = o.replaceAll(/\\/g, "/").split("/");
    if (h.includes("..") || Te && /^[a-z]:\.\.$/i.test(h[0] ?? "")) {
      if (e === "path" || r === "Link") return this.warn("TAR_ENTRY_ERROR", `${e} contains '..'`, { entry: t, [e]: i }), false;
      let a = R.posix.dirname(t.path), l = R.posix.normalize(R.posix.join(a, h.join("/")));
      if (l.startsWith("../") || l === "..") return this.warn("TAR_ENTRY_ERROR", `${e} escapes extraction directory`, { entry: t, [e]: i }), false;
    }
    return n && (t[e] = String(o), this.warn("TAR_ENTRY_INFO", `stripping ${n} from absolute ${e}`, { entry: t, [e]: i })), true;
  }
  [Fr](t) {
    let e = f(t.path), i = e.split("/");
    if (this.strip) {
      if (i.length < this.strip) return false;
      if (t.type === "Link") {
        let r = f(String(t.linkpath)).split("/");
        if (r.length >= this.strip) t.linkpath = r.slice(this.strip).join("/");
        else return false;
      }
      i.splice(0, this.strip), t.path = i.join("/");
    }
    if (isFinite(this.maxDepth) && i.length > this.maxDepth) return this.warn("TAR_ENTRY_ERROR", "path excessively deep", { entry: t, path: e, depth: i.length, maxDepth: this.maxDepth }), false;
    if (!this[Rs](t, "path") || !this[Rs](t, "linkpath")) return false;
    if (t.absolute = R.isAbsolute(t.path) ? f(R.resolve(t.path)) : f(R.resolve(this.cwd, t.path)), !this.preservePaths && typeof t.absolute == "string" && t.absolute.indexOf(this.cwd + "/") !== 0 && t.absolute !== this.cwd) return this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", { entry: t, path: f(t.path), resolvedPath: t.absolute, cwd: this.cwd }), false;
    if (t.absolute === this.cwd && t.type !== "Directory" && t.type !== "GNUDumpDir") return false;
    if (this.win32) {
      let { root: r } = R.win32.parse(String(t.absolute));
      t.absolute = r + ts(String(t.absolute).slice(r.length));
      let { root: n } = R.win32.parse(t.path);
      t.path = n + ts(t.path.slice(n.length));
    }
    return true;
  }
  [Dr](t) {
    if (!this[Fr](t)) return t.resume();
    switch (co.equal(typeof t.absolute, "string"), t.type) {
      case "Directory":
      case "GNUDumpDir":
        t.mode && (t.mode = t.mode | 448);
      case "File":
      case "OldFile":
      case "ContiguousFile":
      case "Link":
      case "SymbolicLink":
        return this[_s](t);
      default:
        return this[Cr](t);
    }
  }
  [O](t, e) {
    t.name === "CwdError" ? this.emit("error", t) : (this.warn("TAR_ENTRY_ERROR", t, { entry: e }), this[$t](), e.resume());
  }
  [yt](t, e, i) {
    gr(f(t), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: e }, i);
  }
  [ge](t) {
    return this.forceChown || this.preserveOwner && (typeof t.uid == "number" && t.uid !== this.processUid || typeof t.gid == "number" && t.gid !== this.processGid) || typeof this.uid == "number" && this.uid !== this.processUid || typeof this.gid == "number" && this.gid !== this.processGid;
  }
  [be](t) {
    return vr(this.uid, t.uid, this.processUid);
  }
  [_e](t) {
    return vr(this.gid, t.gid, this.processGid);
  }
  [Ts](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.fmode, r = new et(String(t.absolute), { flags: ms(t.size), mode: i, autoClose: false });
    r.on("error", (a) => {
      r.fd && u.close(r.fd, () => {
      }), r.write = () => true, this[O](a, t), e();
    });
    let n = 1, o = (a) => {
      if (a) {
        r.fd && u.close(r.fd, () => {
        }), this[O](a, t), e();
        return;
      }
      --n === 0 && r.fd !== void 0 && u.close(r.fd, (l) => {
        l ? this[O](l, t) : this[$t](), e();
      });
    };
    r.on("finish", () => {
      let a = String(t.absolute), l = r.fd;
      if (typeof l == "number" && t.mtime && !this.noMtime) {
        n++;
        let c = t.atime || /* @__PURE__ */ new Date(), d = t.mtime;
        u.futimes(l, c, d, (y) => y ? u.utimes(a, c, d, (T) => o(T && y)) : o());
      }
      if (typeof l == "number" && this[ge](t)) {
        n++;
        let c = this[be](t), d = this[_e](t);
        typeof c == "number" && typeof d == "number" && u.fchown(l, c, d, (y) => y ? u.chown(a, c, d, (T) => o(T && y)) : o());
      }
      o();
    });
    let h = this.transform && this.transform(t) || t;
    h !== t && (h.on("error", (a) => {
      this[O](a, t), e();
    }), t.pipe(h)), h.pipe(r);
  }
  [xs](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.dmode;
    this[yt](String(t.absolute), i, (r) => {
      if (r) {
        this[O](r, t), e();
        return;
      }
      let n = 1, o = () => {
        --n === 0 && (e(), this[$t](), t.resume());
      };
      t.mtime && !this.noMtime && (n++, u.utimes(String(t.absolute), t.atime || /* @__PURE__ */ new Date(), t.mtime, o)), this[ge](t) && (n++, u.chown(String(t.absolute), Number(this[be](t)), Number(this[_e](t)), o)), o();
    });
  }
  [Cr](t) {
    t.unsupported = true, this.warn("TAR_ENTRY_UNSUPPORTED", `unsupported entry type: ${t.type}`, { entry: t }), t.resume();
  }
  [Ar](t, e) {
    let i = f(R.relative(this.cwd, R.resolve(R.dirname(String(t.absolute)), String(t.linkpath)))).split("/");
    this[Re](t, this.cwd, i, () => this[gi](t, String(t.linkpath), "symlink", e), (r) => {
      this[O](r, t), e();
    });
  }
  [Ir](t, e) {
    let i = f(R.resolve(this.cwd, String(t.linkpath))), r = f(String(t.linkpath)).split("/");
    this[Re](t, this.cwd, r, () => this[gi](t, i, "link", e), (n) => {
      this[O](n, t), e();
    });
  }
  [Re](t, e, i, r, n) {
    let o = i.shift();
    if (this.preservePaths || o === void 0) return r();
    let h = R.resolve(e, o);
    u.lstat(h, (a, l) => {
      if (a) return r();
      if (l?.isSymbolicLink()) return n(new St(h, R.resolve(h, i.join("/"))));
      this[Re](t, h, i, r, n);
    });
  }
  [kr]() {
    this[Ri]++;
  }
  [$t]() {
    this[Ri]--, this[bs]();
  }
  [Ls](t) {
    this[$t](), t.resume();
  }
  [Os](t, e) {
    return t.type === "File" && !this.unlink && e.isFile() && e.nlink <= 1 && !Te;
  }
  [_s](t) {
    this[kr]();
    let e = [t.path];
    t.linkpath && e.push(t.linkpath), this.reservations.reserve(e, (i) => this[Nr](t, i));
  }
  [Nr](t, e) {
    let i = (h) => {
      e(h);
    }, r = () => {
      this[yt](this.cwd, this.dmode, (h) => {
        if (h) {
          this[O](h, t), i();
          return;
        }
        this[Oe] = true, n();
      });
    }, n = () => {
      if (t.absolute !== this.cwd) {
        let h = f(R.dirname(String(t.absolute)));
        if (h !== this.cwd) return this[yt](h, this.dmode, (a) => {
          if (a) {
            this[O](a, t), i();
            return;
          }
          o();
        });
      }
      o();
    }, o = () => {
      u.lstat(String(t.absolute), (h, a) => {
        if (a && (this.keep || this.newer && a.mtime > (t.mtime ?? a.mtime))) {
          this[Ls](t), i();
          return;
        }
        if (h || this[Os](t, a)) return this[P](null, t, i);
        if (a.isDirectory()) {
          if (t.type === "Directory") {
            let l = this.chmod && t.mode && (a.mode & 4095) !== t.mode, c = (d) => this[P](d ?? null, t, i);
            return l ? u.chmod(String(t.absolute), Number(t.mode), c) : c();
          }
          if (t.absolute !== this.cwd) return u.rmdir(String(t.absolute), (l) => this[P](l ?? null, t, i));
        }
        if (t.absolute === this.cwd) return this[P](null, t, i);
        mo(String(t.absolute), (l) => this[P](l ?? null, t, i));
      });
    };
    this[Oe] ? n() : r();
  }
  [P](t, e, i) {
    if (t) {
      this[O](t, e), i();
      return;
    }
    switch (e.type) {
      case "File":
      case "OldFile":
      case "ContiguousFile":
        return this[Ts](e, i);
      case "Link":
        return this[Ir](e, i);
      case "SymbolicLink":
        return this[Ar](e, i);
      case "Directory":
      case "GNUDumpDir":
        return this[xs](e, i);
    }
  }
  [gi](t, e, i, r) {
    u[i](e, String(t.absolute), (n) => {
      n ? this[O](n, t) : (this[$t](), t.resume()), r();
    });
  }
};
var ye = (s3) => {
  try {
    return [null, s3()];
  } catch (t) {
    return [t, null];
  }
};
var xe = class extends Xt {
  sync = true;
  [P](t, e) {
    return super[P](t, e, () => {
    });
  }
  [_s](t) {
    if (!this[Oe]) {
      let n = this[yt](this.cwd, this.dmode);
      if (n) return this[O](n, t);
      this[Oe] = true;
    }
    if (t.absolute !== this.cwd) {
      let n = f(R.dirname(String(t.absolute)));
      if (n !== this.cwd) {
        let o = this[yt](n, this.dmode);
        if (o) return this[O](o, t);
      }
    }
    let [e, i] = ye(() => u.lstatSync(String(t.absolute)));
    if (i && (this.keep || this.newer && i.mtime > (t.mtime ?? i.mtime))) return this[Ls](t);
    if (e || this[Os](t, i)) return this[P](null, t);
    if (i.isDirectory()) {
      if (t.type === "Directory") {
        let o = this.chmod && t.mode && (i.mode & 4095) !== t.mode, [h] = o ? ye(() => {
          u.chmodSync(String(t.absolute), Number(t.mode));
        }) : [];
        return this[P](h, t);
      }
      let [n] = ye(() => u.rmdirSync(String(t.absolute)));
      this[P](n, t);
    }
    let [r] = t.absolute === this.cwd ? [] : ye(() => po(String(t.absolute)));
    this[P](r, t);
  }
  [Ts](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.fmode, r = (h) => {
      let a;
      try {
        u.closeSync(n);
      } catch (l) {
        a = l;
      }
      (h || a) && this[O](h || a, t), e();
    }, n;
    try {
      n = u.openSync(String(t.absolute), ms(t.size), i);
    } catch (h) {
      return r(h);
    }
    let o = this.transform && this.transform(t) || t;
    o !== t && (o.on("error", (h) => this[O](h, t)), t.pipe(o)), o.on("data", (h) => {
      try {
        u.writeSync(n, h, 0, h.length);
      } catch (a) {
        r(a);
      }
    }), o.on("end", () => {
      let h = null;
      if (t.mtime && !this.noMtime) {
        let a = t.atime || /* @__PURE__ */ new Date(), l = t.mtime;
        try {
          u.futimesSync(n, a, l);
        } catch (c) {
          try {
            u.utimesSync(String(t.absolute), a, l);
          } catch {
            h = c;
          }
        }
      }
      if (this[ge](t)) {
        let a = this[be](t), l = this[_e](t);
        try {
          u.fchownSync(n, Number(a), Number(l));
        } catch (c) {
          try {
            u.chownSync(String(t.absolute), Number(a), Number(l));
          } catch {
            h = h || c;
          }
        }
      }
      r(h);
    });
  }
  [xs](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.dmode, r = this[yt](String(t.absolute), i);
    if (r) {
      this[O](r, t), e();
      return;
    }
    if (t.mtime && !this.noMtime) try {
      u.utimesSync(String(t.absolute), t.atime || /* @__PURE__ */ new Date(), t.mtime);
    } catch {
    }
    if (this[ge](t)) try {
      u.chownSync(String(t.absolute), Number(this[be](t)), Number(this[_e](t)));
    } catch {
    }
    e(), t.resume();
  }
  [yt](t, e) {
    try {
      return _r(f(t), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: e });
    } catch (i) {
      return i;
    }
  }
  [Re](t, e, i, r, n) {
    if (this.preservePaths || i.length === 0) return r();
    let o = e;
    for (let h of i) {
      o = R.resolve(o, h);
      let [a, l] = ye(() => u.lstatSync(o));
      if (a) return r();
      if (l.isSymbolicLink()) return n(new St(o, R.resolve(e, i.join("/"))));
    }
    r();
  }
  [gi](t, e, i, r) {
    let n = `${i}Sync`;
    try {
      u[n](e, String(t.absolute)), r(), t.resume();
    } catch (o) {
      return this[O](o, t);
    }
  }
};
var Eo = (s3) => {
  let t = new xe(s3), e = s3.file, i = Br.statSync(e), r = s3.maxReadSize || 16 * 1024 * 1024;
  new Be(e, { readSize: r, size: i.size }).pipe(t);
};
var wo = (s3, t) => {
  let e = new Xt(s3), i = s3.maxReadSize || 16 * 1024 * 1024, r = s3.file;
  return new Promise((o, h) => {
    e.on("error", h), e.on("close", o), Br.stat(r, (a, l) => {
      if (a) h(a);
      else {
        let c = new _t(r, { readSize: i, size: l.size });
        c.on("error", h), c.pipe(e);
      }
    });
  });
};
var So = K(Eo, wo, (s3) => new xe(s3), (s3) => new Xt(s3), (s3, t) => {
  t?.length && Qi(s3, t);
});
var yo = (s3, t) => {
  let e = new kt(s3), i = true, r, n;
  try {
    try {
      r = v.openSync(s3.file, "r+");
    } catch (a) {
      if (a?.code === "ENOENT") r = v.openSync(s3.file, "w+");
      else throw a;
    }
    let o = v.fstatSync(r), h = Buffer.alloc(512);
    t: for (n = 0; n < o.size; n += 512) {
      for (let c = 0, d = 0; c < 512; c += d) {
        if (d = v.readSync(r, h, c, h.length - c, n + c), n === 0 && h[0] === 31 && h[1] === 139) throw new Error("cannot append to compressed archives");
        if (!d) break t;
      }
      let a = new F(h);
      if (!a.cksumValid) break;
      let l = 512 * Math.ceil((a.size || 0) / 512);
      if (n + l + 512 > o.size) break;
      n += l, s3.mtimeCache && a.mtime && s3.mtimeCache.set(String(a.path), a.mtime);
    }
    i = false, Ro(s3, e, n, r, t);
  } finally {
    if (i) try {
      v.closeSync(r);
    } catch {
    }
  }
};
var Ro = (s3, t, e, i, r) => {
  let n = new Wt(s3.file, { fd: i, start: e });
  t.pipe(n), bo(t, r);
};
var go = (s3, t) => {
  t = Array.from(t);
  let e = new wt(s3), i = (n, o, h) => {
    let a = (T, D) => {
      T ? v.close(n, (E) => h(T)) : h(null, D);
    }, l = 0;
    if (o === 0) return a(null, 0);
    let c = 0, d = Buffer.alloc(512), y = (T, D) => {
      if (T || D === void 0) return a(T);
      if (c += D, c < 512 && D) return v.read(n, d, c, d.length - c, l + c, y);
      if (l === 0 && d[0] === 31 && d[1] === 139) return a(new Error("cannot append to compressed archives"));
      if (c < 512) return a(null, l);
      let E = new F(d);
      if (!E.cksumValid) return a(null, l);
      let x = 512 * Math.ceil((E.size ?? 0) / 512);
      if (l + x + 512 > o || (l += x + 512, l >= o)) return a(null, l);
      s3.mtimeCache && E.mtime && s3.mtimeCache.set(String(E.path), E.mtime), c = 0, v.read(n, d, 0, 512, l, y);
    };
    v.read(n, d, 0, 512, l, y);
  };
  return new Promise((n, o) => {
    e.on("error", o);
    let h = "r+", a = (l, c) => {
      if (l && l.code === "ENOENT" && h === "r+") return h = "w+", v.open(s3.file, h, a);
      if (l || !c) return o(l);
      v.fstat(c, (d, y) => {
        if (d) return v.close(c, () => o(d));
        i(c, y.size, (T, D) => {
          if (T) return o(T);
          let E = new et(s3.file, { fd: c, start: D });
          e.pipe(E), E.on("error", o), E.on("close", n), _o(e, t);
        });
      });
    };
    v.open(s3.file, h, a);
  });
};
var bo = (s3, t) => {
  t.forEach((e) => {
    e.charAt(0) === "@" ? Ct({ file: Pr.resolve(s3.cwd, e.slice(1)), sync: true, noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  }), s3.end();
};
var _o = async (s3, t) => {
  for (let e of t) e.charAt(0) === "@" ? await Ct({ file: Pr.resolve(String(s3.cwd), e.slice(1)), noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  s3.end();
};
var vt = K(yo, go, () => {
  throw new TypeError("file is required");
}, () => {
  throw new TypeError("file is required");
}, (s3, t) => {
  if (!Bs(s3)) throw new TypeError("file is required");
  if (s3.gzip || s3.brotli || s3.zstd || s3.file.endsWith(".br") || s3.file.endsWith(".tbr")) throw new TypeError("cannot append to compressed archives");
  if (!t?.length) throw new TypeError("no paths specified to add/replace");
});
var Oo = K(vt.syncFile, vt.asyncFile, vt.syncNoFile, vt.asyncNoFile, (s3, t = []) => {
  vt.validate?.(s3, t), To(s3);
});
var To = (s3) => {
  let t = s3.filter;
  s3.mtimeCache || (s3.mtimeCache = /* @__PURE__ */ new Map()), s3.filter = t ? (e, i) => t(e, i) && !((s3.mtimeCache?.get(e) ?? i.mtime ?? 0) > (i.mtime ?? 0)) : (e, i) => !((s3.mtimeCache?.get(e) ?? i.mtime ?? 0) > (i.mtime ?? 0));
};

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/package.js
var EXCLUDED_PARTS = /* @__PURE__ */ new Set([
  ".git",
  ".hg",
  ".svn",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache",
  "node_modules",
  "build"
]);
var MANIFEST_NAME = "archive-manifest.json";
function safeIdentity(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ForgeError("FORGE_PACKAGE_INVALID", `${label} must be a non-empty string`);
  }
  const trimmed = value.trim();
  if (trimmed === "." || trimmed === ".." || trimmed.includes("/") || trimmed.includes("\\")) {
    throw new ForgeError("FORGE_PACKAGE_INVALID", `${label} must be a directory-safe name`);
  }
  return trimmed;
}
async function readIdentity(bundleDir) {
  let text;
  try {
    text = await readFile6(join8(bundleDir, "skill.yaml"), "utf8");
  } catch {
    throw new ForgeError("FORGE_PACKAGE_INVALID", "bundle has no skill.yaml");
  }
  const scalars = {};
  for (const line of text.split(/\r?\n/)) {
    if (line.length === 0 || line.startsWith(" ") || line.startsWith("	") || line.startsWith("#"))
      continue;
    const separator = line.indexOf(":");
    if (separator <= 0)
      continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (raw.length > 0 && (key === "name" || key === "version"))
      scalars[key] = raw;
  }
  const name = safeIdentity(scalars["name"], "skill.yaml name");
  const version = safeIdentity(scalars["version"], "skill.yaml version");
  try {
    await stat6(join8(bundleDir, "SKILL.md"));
  } catch {
    throw new ForgeError("FORGE_PACKAGE_INVALID", "bundle has no SKILL.md");
  }
  return { name, version };
}
function isExcluded(parts, includeVenv) {
  if (parts.some((part) => EXCLUDED_PARTS.has(part)))
    return true;
  if (parts.some((part) => part.endsWith(".egg-info")))
    return true;
  return includeVenv ? false : parts.includes("venv");
}
async function sha256File2(file) {
  const hash = createHash2("sha256");
  for await (const chunk of createReadStream2(file))
    hash.update(chunk);
  return hash.digest("hex");
}
async function collect(bundleDir, includeVenv) {
  const files = [];
  const walk2 = async (dir) => {
    for (const entry of await readdir5(dir, { withFileTypes: true })) {
      const absolute = join8(dir, entry.name);
      const parts = relative(bundleDir, absolute).split(sep2);
      if (isExcluded(parts, includeVenv))
        continue;
      const info = await lstat2(absolute);
      if (info.isSymbolicLink()) {
        throw new ForgeError("FORGE_PACKAGE_INVALID", `symlinks are not allowed in a bundle: ${parts.join("/")}`);
      }
      if (info.isDirectory()) {
        await walk2(absolute);
        continue;
      }
      if (!info.isFile())
        continue;
      if (parts.join("/") === MANIFEST_NAME)
        continue;
      files.push({ path: parts.join("/"), size: info.size, sha256: await sha256File2(absolute) });
    }
  };
  await walk2(bundleDir);
  files.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  if (files.length === 0) {
    throw new ForgeError("FORGE_PACKAGE_INVALID", "bundle contains no payload files");
  }
  return files;
}
async function packageSkill(options) {
  const bundleDir = options.bundleDir.replace(/[\\/]+$/, "");
  const { name, version } = await readIdentity(bundleDir);
  if (bundleDir.split(/[\\/]/).at(-1) !== name) {
    throw new ForgeError("FORGE_PACKAGE_INVALID", `bundle directory must be named "${name}" so the archive root matches the skill name`);
  }
  const outputDir = options.outputDir;
  if (outputDir.trim().length === 0) {
    throw new ForgeError("FORGE_PACKAGE_INVALID", "an output directory is required");
  }
  await mkdir4(outputDir, { recursive: true });
  const archivePath = join8(outputDir, `${name}-${version}.tar.gz`);
  const existing = await stat6(archivePath).catch(() => void 0);
  if (existing !== void 0 && options.force !== true) {
    throw new ForgeError("FORGE_PACKAGE_EXISTS", `${archivePath} already exists; pass force to replace it`);
  }
  const files = await collect(bundleDir, options.includeVenv === true);
  const excludedVenv = !options.includeVenv && await stat6(join8(bundleDir, "support", "venv")).catch(() => void 0) !== void 0;
  const manifestPath = join8(bundleDir, MANIFEST_NAME);
  const manifest = JSON.stringify({
    schema_version: 1,
    files: files.map((file) => ({ path: file.path, size: file.size, sha256: file.sha256 }))
  });
  await writeFile3(manifestPath, manifest, "utf8");
  const staging = `${archivePath}.partial-${process.pid}`;
  await rm3(staging, { force: true });
  try {
    const directories = [
      ...new Set(files.map((file) => file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : "").filter((directory) => directory.length > 0))
    ].sort();
    const entries = [
      ...directories.map((directory) => `./${directory}`),
      ...files.map((file) => `./${file.path}`),
      `./${MANIFEST_NAME}`
    ];
    await Qn({
      cwd: bundleDir,
      file: staging,
      portable: true,
      noDirRecurse: true,
      mtime: /* @__PURE__ */ new Date(0),
      gzip: { level: 9 },
      prefix: name,
      // Fixed ordering and a pinned header timestamp per entry keep the digest stable.
      onWriteEntry(entry) {
        entry.mtime = /* @__PURE__ */ new Date(0);
      }
    }, entries);
    await rename2(staging, archivePath);
  } finally {
    await rm3(staging, { force: true });
    await rm3(manifestPath, { force: true });
  }
  const sha256 = await sha256File2(archivePath);
  const { size } = await stat6(archivePath);
  await writeFile3(`${archivePath}.sha256`, `${sha256}  ${name}-${version}.tar.gz
`, "utf8");
  return {
    ok: true,
    name,
    version,
    archivePath,
    sha256,
    bytes: size,
    files: files.length + 1,
    excludedVenv
  };
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/install.js
import { lstat as lstat4, mkdir as mkdir7, mkdtemp, rename as rename4, rm as rm6, stat as stat8 } from "node:fs/promises";
import { dirname as dirname4, join as join10, resolve as resolve6 } from "node:path";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/archive.js
import { lstat as lstat3, mkdir as mkdir5, readdir as readdir6, realpath, rm as rm4, symlink as symlink2 } from "node:fs/promises";
import { dirname as dirname2, isAbsolute as isAbsolute2, join as join9, posix, relative as relative2, resolve as resolve5, win32 } from "node:path";
async function extractArchive(file, cwd, options = {}) {
  const unsafe = (message) => new ForgeError("FORGE_ARCHIVE_UNSAFE", message);
  const root = resolve5(cwd);
  if (!(await lstat3(root)).isDirectory() || (await readdir6(root)).length !== 0)
    throw unsafe("extraction requires an empty, non-symlink directory");
  const entries = /* @__PURE__ */ new Map();
  const links = /* @__PURE__ */ new Map();
  const violations = [];
  const safePath = (path) => typeof path === "string" && path.length > 0 && !path.includes("\\") && !path.includes("\0") && !path.includes(":") && !isAbsolute2(path) && !win32.isAbsolute(path) && !/^[a-z]:/i.test(path);
  await Ct({ file, strict: true, onReadEntry: (entry) => {
    const path = posix.normalize(entry.path);
    if (!safePath(entry.path) || entry.path.split("/").includes("..")) {
      violations.push(`path escapes archive root: ${entry.path}`);
      return;
    }
    const name = path.replace(/\/$/, "");
    if (name === "." || name === "") {
      if (entry.type !== "Directory") violations.push("archive root must be a directory");
      return;
    }
    const previous = entries.get(name);
    if (previous !== void 0 && !(previous === "Directory" && entry.type === "Directory"))
      violations.push(`duplicate archive entry: ${name}`);
    entries.set(name, entry.type);
    if (entry.type === "SymbolicLink" && options.allowInternalLinks === true) {
      const target = entry.linkpath;
      const normalized = posix.normalize(posix.join(posix.dirname(name), target));
      if (!safePath(target) || normalized === ".." || normalized.startsWith("../"))
        violations.push(`link target escapes archive root: ${name}`);
      else
        links.set(name, target);
    } else if (entry.type === "SymbolicLink" || entry.type === "Link")
      violations.push(`link entries are not allowed: ${name}`);
    else if (!["File", "OldFile", "Directory"].includes(entry.type))
      violations.push(`unsupported archive entry: ${name} (${entry.type})`);
  } });
  for (const name of entries.keys()) {
    let parent = posix.dirname(name);
    while (parent !== ".") {
      if (entries.has(parent) && entries.get(parent) !== "Directory") {
        violations.push(`archive entry has a non-directory parent: ${name}`);
        break;
      }
      parent = posix.dirname(parent);
    }
  }
  if (violations.length > 0)
    throw unsafe(violations.slice(0, 3).join("; "));
  const created = [];
  try {
    await So({
      file,
      cwd: root,
      strict: true,
      filter: (_path, entry) => ["File", "OldFile", "Directory"].includes(entry.type)
    });
    for (const [name, target] of links) {
      const path = join9(root, name);
      await mkdir5(dirname2(path), { recursive: true });
      await symlink2(target, path);
      created.push(path);
    }
    const canonicalRoot = await realpath(root);
    for (const name of links.keys()) {
      let target;
      try {
        target = await realpath(join9(root, name));
      } catch {
        throw unsafe(`dangling or cyclic symbolic link: ${name}`);
      }
      const path = relative2(canonicalRoot, target);
      if (isAbsolute2(path) || path === ".." || path.startsWith("../") || path.startsWith("..\\"))
        throw unsafe(`link target escapes archive root: ${name}`);
    }
    const visited = /* @__PURE__ */ new Set();
    const active = /* @__PURE__ */ new Set();
    async function visit(directory) {
      const canonical = await realpath(directory);
      if (active.has(canonical))
        throw unsafe(`cyclic directory symbolic link: ${relative2(root, directory)}`);
      if (visited.has(canonical)) return;
      active.add(canonical);
      for (const entry of await readdir6(canonical, { withFileTypes: true })) {
        const child = join9(canonical, entry.name);
        if (entry.isDirectory() || entry.isSymbolicLink() && (await lstat3(await realpath(child))).isDirectory())
          await visit(child);
      }
      active.delete(canonical);
      visited.add(canonical);
    }
    if (links.size > 0) await visit(root);
  } catch (error) {
    for (const path of created.reverse())
      await rm4(path, { force: true }).catch(() => void 0);
    throw error;
  }
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/download.js
import { createHash as createHash3 } from "node:crypto";
import { createWriteStream, existsSync as existsSync3 } from "node:fs";
import { createReadStream as createReadStream3 } from "node:fs";
import { mkdir as mkdir6, rename as rename3, rm as rm5, stat as stat7, statfs as statfs2 } from "node:fs/promises";
import { dirname as dirname3 } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
async function downloadFile(options) {
  validateArtifactIntegrity(options);
  await mkdir6(dirname3(options.dest), { recursive: true });
  const part = `${options.dest}.part`;
  const idleTimeoutMs = options.idleTimeoutMs ?? 12e4;
  let offset = 0;
  try {
    offset = (await stat7(part)).size;
  } catch {
    offset = 0;
  }
  if (options.size !== void 0)
    await ensureSpace(dirname3(options.dest), Math.max(options.size - offset, 0));
  const controller = new AbortController();
  const abort = (reason) => {
    controller.abort(reason instanceof Error ? reason : new Error(String(reason)));
  };
  const onOuterAbort = () => abort(options.signal?.reason ?? new ForgeError("FORGE_CANCELLED", "download cancelled"));
  options.signal?.addEventListener("abort", onOuterAbort, { once: true });
  let idleTimer;
  const armIdle = () => {
    if (idleTimer !== void 0)
      clearTimeout(idleTimer);
    idleTimer = setTimeout(() => abort(new ForgeError("FORGE_TIMEOUT", `no data for ${idleTimeoutMs} ms`)), idleTimeoutMs);
    idleTimer.unref?.();
  };
  let resumed = offset > 0;
  try {
    armIdle();
    const headers = {};
    if (offset > 0)
      headers["range"] = `bytes=${offset}-`;
    let response;
    try {
      response = await fetch(options.url, { headers, signal: controller.signal });
    } catch (error) {
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `download failed: ${error.message}`);
    }
    if (response.status === 416 && offset > 0) {
      resumed = true;
    } else if (response.status === 206 && offset > 0) {
      resumed = true;
    } else if (response.ok) {
      if (offset > 0) {
        resumed = false;
        offset = 0;
        await rm5(part, { force: true });
      }
    } else {
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `download failed: HTTP ${response.status}`);
    }
    if (response.body !== null && !(response.status === 416 && offset > 0)) {
      const source = Readable.fromWeb(response.body);
      let downloaded = offset;
      source.on("data", (chunk) => {
        downloaded += chunk.length;
        armIdle();
        options.onProgress?.({ downloaded, total: options.size });
      });
      await pipeline(source, createWriteStream(part, { flags: offset > 0 ? "a" : "w" }));
      if (idleTimer !== void 0)
        clearTimeout(idleTimer);
    }
    if (idleTimer !== void 0)
      clearTimeout(idleTimer);
    if (existsSync3(part))
      await rename3(part, options.dest);
  } catch (error) {
    if (error instanceof ForgeError)
      throw error;
    throw new ForgeError("FORGE_DOWNLOAD_FAILED", error.message);
  } finally {
    if (idleTimer !== void 0)
      clearTimeout(idleTimer);
    options.signal?.removeEventListener("abort", onOuterAbort);
  }
  const info = await stat7(options.dest);
  if (options.size !== void 0 && info.size !== options.size) {
    await rm5(options.dest, { force: true });
    throw new ForgeError("FORGE_NODE_INTEGRITY", `size mismatch: expected ${options.size}, got ${info.size}`);
  }
  options.onProgress?.({ downloaded: info.size, total: options.size ?? info.size });
  const digest = await hashFile(options.dest);
  if (options.sha256 !== void 0 && digest !== options.sha256.toLowerCase()) {
    await rm5(options.dest, { force: true });
    throw new ForgeError("FORGE_NODE_INTEGRITY", `sha256 mismatch: expected ${options.sha256}, got ${digest}`);
  }
  return { path: options.dest, bytes: info.size, sha256: digest, resumed };
}
async function ensureSpace(dir, needed) {
  try {
    const info = await statfs2(dir);
    const available = Number(info.bavail) * Number(info.bsize);
    if (available < needed) {
      throw new ForgeError("FORGE_DISK_FULL", `need ${needed} bytes in ${dir}, only ${available} available`);
    }
  } catch (error) {
    if (error instanceof ForgeError)
      throw error;
  }
}
function validateArtifactIntegrity(artifact) {
  if (typeof artifact.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(artifact.sha256)) {
    throw new ForgeError("FORGE_NODE_INTEGRITY", "remote artifact requires a pinned SHA256 digest");
  }
  if (!Number.isSafeInteger(artifact.size) || artifact.size < 0) {
    throw new ForgeError("FORGE_NODE_INTEGRITY", "remote artifact requires a non-negative safe-integer byte length");
  }
}
async function hashFile(path) {
  const hash = createHash3("sha256");
  const stream = createReadStream3(path);
  for await (const chunk of stream)
    hash.update(chunk);
  return hash.digest("hex");
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/install.js
async function installSkill(name, options) {
  options.onProgress?.("resolve");
  const artifact = await options.registry.skill(name, options.version);
  const archive = await fetchArchive(artifact, options);
  await mkdir7(options.skillsRoot, { recursive: true });
  const staging = await mkdtemp(join10(options.skillsRoot, `.staging-${slug(name)}-`));
  const target = join10(options.skillsRoot, name);
  const backup = `${target}.old-${Date.now()}`;
  try {
    await extractArchive(archive.path, staging);
    const manifestText = await readManifestFile(staging);
    const parsed = parseManifest(manifestText, `skills/${name}/skill.yaml`);
    if (parsed.manifest === void 0) {
      const first = parsed.issues[0];
      throw new ForgeError("FORGE_MANIFEST_INVALID", first === void 0 ? "manifest is invalid" : `${first.path}: ${first.message}`);
    }
    if (parsed.manifest.name !== name) {
      throw new ForgeError("FORGE_MANIFEST_INVALID", `bundle name "${parsed.manifest.name}" does not match requested "${name}"`);
    }
    if (options.version !== void 0 && parsed.manifest.version !== options.version) {
      throw new ForgeError("FORGE_MANIFEST_INVALID", `registry served version ${parsed.manifest.version}, requested ${options.version}`);
    }
    await rm6(backup, { recursive: true, force: true });
    let hadPrevious = false;
    try {
      await stat8(target);
      hadPrevious = true;
    } catch {
      hadPrevious = false;
    }
    if (hadPrevious)
      await rename4(target, backup);
    try {
      await rename4(staging, target);
    } catch (error) {
      if (hadPrevious)
        await rename4(backup, target).catch(() => void 0);
      throw error;
    }
    await rm6(backup, { recursive: true, force: true });
    return {
      name,
      version: parsed.manifest.version,
      path: target,
      downloaded: artifact.sha256 === void 0 || !archive.fromCache,
      bytes: archive.bytes
    };
  } finally {
    await rm6(staging, { recursive: true, force: true }).catch(() => void 0);
  }
}
async function installFromArchive(archivePath, options) {
  const source = resolve6(archivePath);
  let info;
  try {
    info = await stat8(source);
  } catch {
    throw new ForgeError("FORGE_INSTALL_SOURCE_MISSING", `no such archive: ${source}`);
  }
  if (!info.isFile()) {
    throw new ForgeError("FORGE_INSTALL_SOURCE_MISSING", `not a file: ${source}`);
  }
  options.onProgress?.("extract");
  await mkdir7(options.skillsRoot, { recursive: true });
  const staging = await mkdtemp(join10(options.skillsRoot, `.skill-install-`));
  try {
    await extractArchive(source, staging);
    const payload = await resolvePayloadRoot(staging);
    const manifestText = await readManifestFile(payload);
    const parsed = parseManifest(manifestText, "skill.yaml");
    if (parsed.manifest === void 0) {
      const first = parsed.issues[0];
      throw new ForgeError("FORGE_MANIFEST_INVALID", first === void 0 ? "manifest is invalid" : `${first.path}: ${first.message}`);
    }
    const manifest = parsed.manifest;
    if (manifest.skillDocument !== "SKILL.md") {
      throw new ForgeError("FORGE_MANIFEST_INVALID", "installed bundles must use SKILL.md");
    }
    try {
      await stat8(join10(payload, "SKILL.md"));
    } catch {
      throw new ForgeError("FORGE_MANIFEST_INVALID", "archive root must contain SKILL.md");
    }
    if (options.running?.includes(manifest.name) === true) {
      throw new ForgeError("FORGE_SKILL_RUNNING", `skill "${manifest.name}" is running; stop it before replacing its bundle`);
    }
    options.onProgress?.("swap");
    const target = join10(options.skillsRoot, manifest.name);
    let replaced;
    let backup;
    const existing = await stat8(target).catch(() => void 0);
    if (existing !== void 0) {
      const stamp3 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const previousVersion = await currentVersion(target);
      backup = join10(options.skillsRoot, ".backups", manifest.name, `${previousVersion}-${stamp3}`);
      await mkdir7(dirname4(backup), { recursive: true });
      await rename4(target, backup);
      replaced = await directorySize(target).catch(() => void 0) ?? existing.size;
    }
    try {
      await rename4(payload, target);
    } catch (error) {
      if (backup !== void 0)
        await rename4(backup, target).catch(() => void 0);
      throw error;
    }
    return {
      name: manifest.name,
      version: manifest.version,
      path: target,
      bytes: info.size,
      ...replaced === void 0 ? {} : { replaced }
    };
  } finally {
    await rm6(staging, { recursive: true, force: true }).catch(() => void 0);
  }
}
async function resolvePayloadRoot(extracted) {
  const hasManifest = async (dir) => {
    try {
      await stat8(join10(dir, "skill.yaml"));
      return true;
    } catch {
      return false;
    }
  };
  if (await hasManifest(extracted))
    return extracted;
  const { readdir: readdir13 } = await import("node:fs/promises");
  const entries = await readdir13(extracted, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());
  if (directories.length === 1 && entries.length === 1) {
    const candidate = join10(extracted, directories[0].name);
    if (await hasManifest(candidate))
      return candidate;
  }
  throw new ForgeError("FORGE_MANIFEST_INVALID", entries.length === 0 ? "archive is empty" : "archive does not contain skill.yaml at its root or in a single top-level directory");
}
async function currentVersion(dir) {
  const { readFile: readFile15 } = await import("node:fs/promises");
  try {
    const text = await readFile15(join10(dir, "skill.yaml"), "utf8");
    const match = /^version:[ \t]*(.+)$/m.exec(text);
    if (match !== null) {
      const value = match[1].trim().replace(/^['"]|['"]$/g, "");
      if (value.length > 0 && !value.includes("/"))
        return value;
    }
  } catch {
  }
  return "unknown";
}
async function directorySize(dir) {
  const { readdir: readdir13 } = await import("node:fs/promises");
  let total = 0;
  for (const entry of await readdir13(dir, { withFileTypes: true })) {
    const absolute = join10(dir, entry.name);
    const info = await lstat4(absolute);
    total += info.isDirectory() ? await directorySize(absolute) : info.size;
  }
  return total;
}
async function fetchArchive(artifact, options) {
  validateArtifactIntegrity(artifact);
  await mkdir7(options.cacheRoot, { recursive: true });
  const path = join10(options.cacheRoot, `${artifact.sha256.toLowerCase()}.tar.gz`);
  let info;
  try {
    info = await stat8(path);
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
  }
  if (info !== void 0) {
    if (!info.isFile() || info.size !== artifact.size) {
      throw new ForgeError("FORGE_NODE_INTEGRITY", `cached archive size mismatch: expected ${artifact.size}, got ${info.size}`);
    }
    const digest = await hashFile(path);
    if (digest !== artifact.sha256.toLowerCase()) {
      throw new ForgeError("FORGE_NODE_INTEGRITY", `cached archive sha256 mismatch: expected ${artifact.sha256}, got ${digest}`);
    }
    options.onProgress?.("download", info.size, info.size);
    return { path, bytes: info.size, fromCache: true };
  }
  options.onProgress?.("download", 0, artifact.size);
  const transfer = await downloadFile({
    url: artifact.url,
    dest: path,
    sha256: artifact.sha256,
    size: artifact.size,
    signal: options.signal,
    onProgress: (progress) => options.onProgress?.("download", progress.downloaded, progress.total ?? artifact.size)
  });
  return { path: transfer.path, bytes: transfer.bytes, fromCache: false };
}
async function readManifestFile(dir) {
  const { readFile: readFile15 } = await import("node:fs/promises");
  try {
    return await readFile15(join10(dir, "skill.yaml"), "utf8");
  } catch {
    throw new ForgeError("FORGE_MANIFEST_INVALID", "archive does not contain skill.yaml at its root");
  }
}
function slug(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-");
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/jobs.js
import { randomUUID } from "node:crypto";
import { mkdir as mkdir8, readFile as readFile7, readdir as readdir7, rename as rename5, writeFile as writeFile4 } from "node:fs/promises";
import { join as join11 } from "node:path";
var JobRunner = class {
  root;
  jobs = /* @__PURE__ */ new Map();
  controllers = /* @__PURE__ */ new Map();
  writes = /* @__PURE__ */ new Map();
  completions = /* @__PURE__ */ new Map();
  constructor(root) {
    this.root = root;
  }
  /** Start a job; the returned record is live-updated and persisted. */
  start(kind, skill, task) {
    const id = `${kind}-${randomUUID().slice(0, 8)}`;
    const record = {
      id,
      kind,
      skill,
      state: "running",
      phase: "starting",
      startedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.jobs.set(id, record);
    const controller = new AbortController();
    this.controllers.set(id, controller);
    void this.persist(record);
    let settle;
    this.completions.set(id, new Promise((resolveDone) => {
      settle = resolveDone;
    }));
    void (async () => {
      try {
        const result = await task({
          signal: controller.signal,
          progress: (update) => {
            record.phase = update.phase;
            if (update.downloadedBytes !== void 0)
              record.downloadedBytes = update.downloadedBytes;
            if (update.totalBytes !== void 0)
              record.totalBytes = update.totalBytes;
            void this.persist(record);
          }
        });
        if (controller.signal.aborted) {
          record.state = "cancelled";
          record.phase = "cancelled";
        } else {
          record.state = "succeeded";
          record.phase = "done";
          record.result = result;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (controller.signal.aborted || message.includes("FORGE_CANCELLED")) {
          record.state = "cancelled";
          record.phase = "cancelled";
        } else {
          record.state = "failed";
          record.phase = "failed";
          record.error = message;
        }
      } finally {
        record.finishedAt = (/* @__PURE__ */ new Date()).toISOString();
        this.controllers.delete(id);
        await this.persist(record);
        settle();
      }
    })();
    return record;
  }
  /** Wait until the job settles (including its final record write). */
  async wait(id) {
    const pending = this.completions.get(id);
    if (pending !== void 0)
      await pending;
    return this.get(id);
  }
  /** Read one job (memory first, then disk after a restart). */
  async get(id) {
    const live = this.jobs.get(id);
    if (live !== void 0)
      return { ...live };
    try {
      return JSON.parse(await readFile7(join11(this.root, `${id}.json`), "utf8"));
    } catch {
      return void 0;
    }
  }
  /** Recent jobs, newest first. */
  async list(limit = 20) {
    let names = [];
    try {
      names = (await readdir7(this.root)).filter((name) => name.endsWith(".json"));
    } catch {
      names = [];
    }
    const records = [];
    for (const name of names) {
      const record = await this.get(name.slice(0, -".json".length));
      if (record !== void 0)
        records.push(record);
    }
    for (const live of this.jobs.values()) {
      if (!records.some((record) => record.id === live.id))
        records.push({ ...live });
    }
    return records.sort((left, right) => right.startedAt.localeCompare(left.startedAt)).slice(0, limit);
  }
  /** Request cancellation; the task observes the aborted signal. */
  cancel(id) {
    const controller = this.controllers.get(id);
    if (controller === void 0)
      return false;
    controller.abort(new ForgeError("FORGE_CANCELLED", "cancelled by request"));
    return true;
  }
  async persist(record) {
    const previous = this.writes.get(record.id) ?? Promise.resolve();
    const next = previous.then(async () => {
      await mkdir8(this.root, { recursive: true });
      const target = join11(this.root, `${record.id}.json`);
      const temp = `${target}.tmp-${process.pid}`;
      await writeFile4(temp, JSON.stringify({ ...record }, null, 2));
      await rename5(temp, target);
    }).catch(() => void 0);
    this.writes.set(record.id, next);
    await next;
  }
};

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/lock.js
import { open, readFile as readFile8, rm as rm7, stat as stat9 } from "node:fs/promises";
import { mkdir as mkdir9 } from "node:fs/promises";
import { dirname as dirname5 } from "node:path";
async function withLock(path, task, options = {}) {
  const timeoutMs = options.timeoutMs ?? 6e4;
  const staleMs = options.staleMs ?? 10 * 6e4;
  const deadline = Date.now() + timeoutMs;
  await mkdir9(dirname5(path), { recursive: true });
  for (; ; ) {
    try {
      const handle2 = await open(path, "wx", 384);
      try {
        await handle2.writeFile(JSON.stringify({ pid: process.pid, at: (/* @__PURE__ */ new Date()).toISOString() }));
      } finally {
        await handle2.close();
      }
      break;
    } catch (error) {
      if (error.code !== "EEXIST")
        throw error;
      if (await isStale(path, staleMs)) {
        await rm7(path, { force: true });
        continue;
      }
      if (Date.now() > deadline) {
        throw new ForgeError("FORGE_BUSY", `another forge process holds ${path}`);
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    }
  }
  try {
    return await task();
  } finally {
    await rm7(path, { force: true });
  }
}
async function isStale(path, staleMs) {
  try {
    const owner = JSON.parse(await readFile8(path, "utf8"));
    if (typeof owner.pid === "number" && owner.pid !== process.pid && !isAlive(owner.pid))
      return true;
    const info = await stat9(path);
    return Date.now() - info.mtimeMs > staleMs;
  } catch {
    return true;
  }
}
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/portable.js
var import_yaml3 = __toESM(require_dist(), 1);
import { cp, mkdir as mkdir10, readFile as readFile9, writeFile as writeFile5 } from "node:fs/promises";
import { join as join12 } from "node:path";
async function exportPortableSkill(entry, outDir) {
  const body = await readFile9(join12(entry.dir, entry.manifest.skillDocument), "utf8").catch(() => void 0);
  if (body === void 0) {
    throw new ForgeError("FORGE_SKILL_DOC_MISSING", `${entry.name} has no ${entry.manifest.skillDocument}`);
  }
  const profiles = Object.keys(entry.manifest.profiles);
  const frontmatter = {
    name: entry.name,
    description: entry.manifest.description,
    ...profiles.length === 0 ? {} : { whenToUse: `Use when the task needs the ${entry.name} capability.` },
    metadata: {
      forge: {
        version: entry.manifest.version,
        profiles,
        ...entry.manifest.gatewayUrl === void 0 ? {} : { gatewayUrl: entry.manifest.gatewayUrl }
      }
    }
  };
  const preamble = [
    "> Exported from a Forge bundle by `forge skill export`.",
    "> Tools are invoked with `forge_tool_call(tool_id, arguments)`; use the ids from the manifest below.",
    `> Profiles: ${profiles.join(", ") || "(none)"}.`,
    ""
  ].join("\n");
  const document = `---
${(0, import_yaml3.stringify)(frontmatter)}---

${preamble}
${body}`;
  const target = join12(outDir, entry.name);
  await mkdir10(join12(target, "profiles"), { recursive: true });
  await writeFile5(join12(target, "SKILL.md"), document);
  await cp(join12(entry.dir, "skill.yaml"), join12(target, "skill.yaml"));
  for (const profile of Object.values(entry.manifest.profiles)) {
    const source = join12(entry.dir, "profiles", profile.id);
    await cp(source, join12(target, "profiles", profile.id), { recursive: true }).catch(() => void 0);
  }
  const parsed = (0, import_yaml3.parse)(document.split("---")[1] ?? "");
  if (typeof parsed?.name !== "string" || typeof parsed?.description !== "string") {
    throw new ForgeError("FORGE_EXPORT_INVALID", "exported frontmatter is missing name/description");
  }
  return { path: target, skill: entry.name, profiles };
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/repositories.js
var REPOSITORY_CATALOG = [
  {
    id: "forge",
    url: "https://github.com/PhyAgentOS/forge",
    category: "framework",
    role: "library",
    description: "Shared framework: common, msgs, robot, policy, kinematics, tool; Endpoint SPI and Wire models",
    keyPaths: [
      "interfaces/forge_msgs/{SCHEMA.md,common.v1.yaml,control.v1.yaml,sensor.v1.yaml,motion.v1.yaml,tool.v1.yaml}",
      "interfaces/forge_tool/PROTOCOL.md",
      "packages/tool/src/forge_tool/endpoint/protocol.py",
      "packages/tool/src/forge_tool/handler.py",
      "packages/robot/src/forge_robot/robot_protocol.py",
      "packages/policy/src/forge_policy/policy_protocol.py"
    ],
    nodes: [],
    endpoints: [],
    snapshot: "e59693910bb5f9572cf39c5a59475c0747ba76e8"
  },
  {
    id: "adapter-forge-gateway",
    url: "https://github.com/PhyAgentOS/adapter-forge-gateway",
    category: "adapter",
    role: "gateway",
    description: "HTTP/WebSocket Tool API, Tool routing, registry and readiness gate",
    keyPaths: [
      "src/forge_gateway/controllers/tool_controller.py",
      "src/forge_gateway/services/tool_gateway_service.py",
      "tests/test_tool_session.py"
    ],
    nodes: ["gateway"],
    endpoints: [],
    snapshot: "5aaa9d16aff1c1b689dbb53acbcdef406dcb8d97"
  },
  {
    id: "adapter-camera-orbbec",
    url: "https://github.com/PhyAgentOS/adapter-camera-orbbec",
    category: "adapter",
    role: "sensor",
    description: "Orbbec color/depth/IR; depth is Image 32FC1 metres, zero invalid",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "de3cbc5361533d8799f586939266289d7527b203"
  },
  {
    id: "adapter-camera-realsense",
    url: "https://github.com/PhyAgentOS/adapter-camera-realsense",
    category: "adapter",
    role: "sensor",
    description: "RealSense D400 color/depth/IR; depth is Image 32FC1 metres, zero invalid",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "77627b4d8e3977aabf016af6846e9f6857cfcde6"
  },
  {
    id: "adapter-camera-usb",
    url: "https://github.com/PhyAgentOS/adapter-camera-usb",
    category: "adapter",
    role: "sensor",
    description: "Rust/V4L2 USB camera; raw and compressed images",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "bdbe5ebb016da299ff1e0b461260ce1ddd52d234"
  },
  {
    id: "adapter-franka-fr3",
    url: "https://github.com/PhyAgentOS/adapter-franka-fr3",
    category: "adapter",
    role: "robot",
    description: "Franka FR3v2 and Franka Hand driver/models",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "efd7a6bd019c7135ae506274ca73ef5879f4a384"
  },
  {
    id: "adapter-robot-piper",
    url: "https://github.com/PhyAgentOS/adapter-robot-piper",
    category: "adapter",
    role: "robot",
    description: "AgileX Piper driver, Dora examples and multi-format models",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "3ea5156cb369c302bb2e3ff6f1ebfb6af90a08d8"
  },
  {
    id: "adapter-robot-so101",
    url: "https://github.com/PhyAgentOS/adapter-robot-so101",
    category: "adapter",
    role: "robot",
    description: "SO101 serial/Feetech driver and MJCF model",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "fb6b59292366059acd10cb2439d155c4c8015cfc"
  },
  {
    id: "adapter-robot-xlerobot",
    url: "https://github.com/PhyAgentOS/adapter-robot-xlerobot",
    category: "adapter",
    role: "robot",
    description: "XLeRobot dual-arm mobile robot integration",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "5ceb37fdea4d6c7e454914b1b5e180b4728ef0fa"
  },
  {
    id: "adapter-robot-zerith_h1_pro",
    url: "https://github.com/PhyAgentOS/adapter-robot-zerith_h1_pro",
    category: "adapter",
    role: "robot",
    description: "Zerith H1 Pro joint/base integration and SDK",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [],
    snapshot: "e36dc9b0bdfd68342d55180485b561c73162cfc3"
  },
  {
    id: "adapter-viewer-image",
    url: "https://github.com/PhyAgentOS/adapter-viewer-image",
    category: "adapter",
    role: "viewer",
    description: "Image viewer consuming Forge image messages",
    keyPaths: ["README.md"],
    nodes: ["image_viewer"],
    endpoints: [],
    snapshot: "ea5900a7225c2bfadd89bbfe23c023ec9fbe1bb6"
  },
  {
    id: "operator-controls",
    url: "https://github.com/PhyAgentOS/operator-controls",
    category: "operator",
    role: "control",
    description: "joint_trajectory_controller, gripper_action_controller and fake plant",
    keyPaths: [
      "packages/joint_trajectory_controller",
      "packages/gripper_action_controller",
      "scripts/build_pyinstaller.sh"
    ],
    nodes: ["joint_trajectory_controller", "gripper_action_controller"],
    endpoints: [],
    snapshot: "cde73dc2a6222d81b01ffc32f69f12cb12e42760"
  },
  {
    id: "operator-gripper-action-policy",
    url: "https://github.com/PhyAgentOS/operator-gripper-action-policy",
    category: "operator",
    role: "provider",
    description: "Gripper Tool opening requests to gripper Actions and execution results",
    keyPaths: ["src/gripper_action_policy_node/runner.py"],
    nodes: ["gripper_action_policy"],
    endpoints: [{ id: "gripper.controller", operations: [{ name: "set_opening", semantics: "action" }] }],
    snapshot: "bb69223497b944dd1a0f6fe9ecb36486168a8cc4"
  },
  {
    id: "operator-motion",
    url: "https://github.com/PhyAgentOS/operator-motion",
    category: "operator",
    role: "provider",
    description: "motion_server and motion_action_policy: goals, IK, trajectories",
    keyPaths: ["packages/motion_server/server.py", "packages/motion_server/policy_nodes.py"],
    nodes: ["motion_server", "motion_action_policy"],
    endpoints: [{
      id: "motion.server",
      operations: [
        { name: "move_joints", semantics: "action" },
        { name: "move_pose", semantics: "action" }
      ]
    }],
    snapshot: "24c8a430715f697eea8431bf169c21b8cbb5eb92"
  },
  {
    id: "operator-sim-control-policy",
    url: "https://github.com/PhyAgentOS/operator-sim-control-policy",
    category: "operator",
    role: "provider",
    description: "Robot descriptor queries, simulation reset and deferred re-home",
    keyPaths: ["src/sim_control_policy_node/runner.py", "TOOL_CONTRACTS.md"],
    nodes: ["sim_control_policy"],
    endpoints: [{
      id: "sim.control",
      operations: [
        { name: "get_robot_info", semantics: "query" },
        { name: "reset", semantics: "action" }
      ]
    }],
    snapshot: "85679a4be8953e9071de426c7c0973155121d96f"
  },
  {
    id: "operator-simulator-mujoco",
    url: "https://github.com/PhyAgentOS/operator-simulator-mujoco",
    category: "operator",
    role: "simulator",
    description: "MuJoCo stepping, joint commands, images and proprio state",
    keyPaths: ["src/mujoco_sim/runtime.py"],
    nodes: ["mujoco_sim"],
    endpoints: [],
    snapshot: "0a84a1a81807b467338e696032a38b084cb35747"
  },
  {
    id: "operator-relative-pose-policy",
    url: "https://github.com/PhyAgentOS/operator-relative-pose-policy",
    category: "operator",
    role: "provider",
    description: "Relative end-effector pose resolution (motion.relative_pose)",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [{ id: "motion.relative_pose", operations: [{ name: "resolve", semantics: "query" }] }],
    snapshot: "4749b696a8b3210e193860d6aeed92382fbad113"
  },
  {
    id: "operator-kai0",
    url: "https://github.com/PhyAgentOS/operator-kai0",
    category: "operator",
    role: "policy",
    description: "Kai0 policy source and inference node",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [{ id: "policy.runner", operations: [{ name: "serve", semantics: "session" }] }],
    snapshot: "94baa639fe6d36bb5d41d214923108993aa002cc"
  },
  {
    id: "operator-lerobot-runner",
    url: "https://github.com/PhyAgentOS/operator-lerobot-runner",
    category: "operator",
    role: "policy",
    description: "LeRobot policy execution, observations and control",
    keyPaths: ["README.md"],
    nodes: [],
    endpoints: [{ id: "policy.runner", operations: [{ name: "serve", semantics: "session" }] }],
    snapshot: "f6b26f4f89bbd9831f64e3fc43d36499d6c86a92"
  },
  {
    id: "benchmark-libero",
    url: "https://github.com/PhyAgentOS/benchmark-libero",
    category: "benchmark",
    role: "benchmark",
    description: "LIBERO simulation/evaluation and node packaging",
    keyPaths: ["main.py", "bench_tool/descriptor.py"],
    nodes: [],
    endpoints: [{
      id: "benchmark.controller",
      operations: [
        { name: "describe", semantics: "query" },
        { name: "run", semantics: "session" }
      ]
    }],
    snapshot: "e01cd66167b85522afe427c5b85da8af30c00c97"
  }
];
function searchRepositories(options = {}) {
  const query = (options.query ?? "").trim().toLowerCase();
  return REPOSITORY_CATALOG.filter((entry) => {
    if (options.category !== void 0 && entry.category !== options.category)
      return false;
    if (query.length === 0)
      return true;
    const haystack = [
      entry.id,
      entry.description,
      entry.category,
      entry.role,
      entry.url,
      ...entry.nodes,
      ...entry.keyPaths,
      ...entry.endpoints.flatMap((endpoint) => [endpoint.id, ...endpoint.operations.map((operation) => operation.name)])
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}
function findRepository(idOrNode) {
  const needle = idOrNode.trim().toLowerCase();
  return REPOSITORY_CATALOG.find((entry) => entry.id.toLowerCase() === needle) ?? REPOSITORY_CATALOG.find((entry) => entry.nodes.some((node) => node.toLowerCase() === needle));
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/registry.js
var DEFAULT_REGISTRY_URL = "https://paos-resource-platform.dev.x-era.com";
var ForgeRegistryClient = class {
  baseUrl;
  timeoutMs;
  token;
  constructor(options = {}) {
    const configured = options.baseUrl ?? process.env["DSH_FORGE_REGISTRY_URL"] ?? DEFAULT_REGISTRY_URL;
    this.baseUrl = configured.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 2e4;
    const envName = options.tokenEnv ?? "DSH_FORGE_REGISTRY_TOKEN";
    this.token = options.token ?? process.env[envName] ?? void 0;
  }
  /** Search the registry; an empty query lists everything. */
  async search(query = "") {
    const suffix = query.length === 0 ? "" : `?q=${encodeURIComponent(query)}`;
    const value = await this.get(`/v1/skills${suffix}`);
    const items = Array.isArray(value) ? value : value.items;
    if (!Array.isArray(items)) {
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", "registry search response has no item list");
    }
    return items.map((item) => {
      const record = item;
      const profiles = Array.isArray(record["profiles"]) ? record["profiles"].map((profile) => String(profile["id"] ?? "")) : [];
      return {
        name: String(record["name"] ?? ""),
        version: typeof record["version"] === "string" ? record["version"] : void 0,
        description: String(record["description"] ?? ""),
        profiles,
        tags: Array.isArray(record["tags"]) ? record["tags"] : []
      };
    }).filter((summary) => summary.name.length > 0);
  }
  /** Resolve a skill artifact; pass version to pin a published revision. */
  async skill(name, version) {
    const suffix = version === void 0 ? "" : `?version=${encodeURIComponent(version)}`;
    return artifactFrom(await this.get(`/v1/skills/${encodeURIComponent(name)}${suffix}`), name);
  }
  /** Every published version of one skill, plus the current one. */
  async skillVersions(name) {
    const value = await this.get(`/v1/skills/${encodeURIComponent(name)}/versions`);
    const items = Array.isArray(value["items"]) ? value["items"] : [];
    return {
      name: typeof value["name"] === "string" ? value["name"] : name,
      ...typeof value["current_version"] === "string" ? { currentVersion: value["current_version"] } : {},
      versions: items.map((item) => ({
        version: String(item["version"] ?? ""),
        ...typeof item["sha256"] === "string" ? { sha256: item["sha256"] } : {},
        ...typeof item["description"] === "string" ? { description: item["description"] } : {},
        ...typeof item["state"] === "string" ? { state: item["state"] } : {},
        ...typeof item["forge_version"] === "number" ? { forgeVersion: item["forge_version"] } : {}
      })).filter((item) => item.version.length > 0)
    };
  }
  /** Resolve one locked node artifact. */
  async node(artifactId) {
    return artifactFrom(await this.get(`/v1/forge-nodes/${encodeURIComponent(artifactId)}`), artifactId);
  }
  async get(path) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: {
          accept: "application/json",
          ...this.token === void 0 ? {} : { authorization: `Bearer ${this.token}` }
        }
      });
    } catch (error) {
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `${this.baseUrl}${path}: ${error.message}`);
    }
    if (!response.ok) {
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `${this.baseUrl}${path}: HTTP ${response.status}`);
    }
    return response.json();
  }
};
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function sourceFrom(raw) {
  const str2 = (key) => typeof raw[key] === "string" ? raw[key] : void 0;
  return {
    ...str2("repository_url") === void 0 ? {} : { repositoryUrl: str2("repository_url") },
    ...str2("ref") === void 0 ? {} : { ref: str2("ref") },
    ...str2("ref_type") === void 0 ? {} : { refType: str2("ref_type") },
    ...str2("commit_sha") === void 0 ? {} : { commitSha: str2("commit_sha") },
    ...str2("path") === void 0 ? {} : { path: str2("path") },
    ...str2("archive_url") === void 0 ? {} : { archiveUrl: str2("archive_url") },
    ...str2("raw_base_url") === void 0 ? {} : { rawBaseUrl: str2("raw_base_url") },
    ...str2("browse_url") === void 0 ? {} : { browseUrl: str2("browse_url") },
    ...typeof raw["verified_at"] === "number" ? { verifiedAt: raw["verified_at"] } : {}
  };
}
function artifactFrom(value, name) {
  const record = value;
  const url = record["download_url"] ?? record["url"];
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `artifact ${name} has no download URL`);
  }
  return {
    name: typeof record["name"] === "string" ? record["name"] : name,
    version: typeof record["version"] === "string" ? record["version"] : void 0,
    url,
    sha256: typeof record["sha256"] === "string" ? record["sha256"] : void 0,
    size: typeof record["size"] === "number" ? record["size"] : void 0,
    ...typeof record["github_url"] === "string" ? { sourceUrl: record["github_url"] } : {},
    ...typeof record["display_name"] === "string" ? { displayName: record["display_name"] } : {},
    ...typeof record["node_type"] === "string" ? { nodeType: record["node_type"] } : {},
    ...typeof record["source_status"] === "string" ? { sourceStatus: record["source_status"] } : {},
    ...typeof record["forge_version"] === "number" ? { forgeVersion: record["forge_version"] } : {},
    ...isObject(record["source"]) ? { source: sourceFrom(record["source"]) } : {}
  };
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/runtime.js
var import_yaml4 = __toESM(require_dist(), 1);
import { createHash as createHash4 } from "node:crypto";
import { closeSync, existsSync as existsSync4, openSync, readFileSync, symlinkSync } from "node:fs";
import { chmod as chmod2, cp as cp2, mkdir as mkdir12, readdir as readdir9, readFile as readFile11, rm as rm9, stat as stat11, writeFile as writeFile7 } from "node:fs/promises";
import { basename, dirname as dirname6, isAbsolute as isAbsolute3, join as join14, relative as relative3 } from "node:path";
import { execFile as execFile3, spawn } from "node:child_process";
import { promisify as promisify3 } from "node:util";

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/nodes.js
import { mkdir as mkdir11, readFile as readFile10, readdir as readdir8, rename as rename6, rm as rm8, stat as stat10, writeFile as writeFile6 } from "node:fs/promises";
import { join as join13 } from "node:path";
var NodeStore = class {
  root;
  registry;
  cacheRoot;
  constructor(root, registry, cacheRoot) {
    this.root = root;
    this.registry = registry;
    this.cacheRoot = cacheRoot;
  }
  /** Read-only cache inspection; never downloads. */
  async inspect(lock, binary = lock.nodeId) {
    const dir = join13(this.root, lock.artifactId);
    const entrypoint = join13(dir, lock.entrypoint);
    if (!await isExecutable(entrypoint)) {
      return { artifactId: lock.artifactId, entrypoint, state: "missing", detail: `${binary}: ${dir} is not installed` };
    }
    let metadata;
    try {
      metadata = JSON.parse(await readFile10(join13(dir, ".artifact.json"), "utf8"));
    } catch {
      metadata = void 0;
    }
    if (metadata === void 0) {
      return { artifactId: lock.artifactId, entrypoint, state: "unverified", detail: `${binary}: present without digest record` };
    }
    if (lock.sha256 !== void 0 && metadata.sha256 !== lock.sha256) {
      return {
        artifactId: lock.artifactId,
        entrypoint,
        state: "mismatch",
        detail: `${binary}: digest ${metadata.sha256 ?? "unknown"} does not match lock ${lock.sha256}`
      };
    }
    return { artifactId: lock.artifactId, entrypoint, state: "ready", detail: `${binary}: verified ${metadata.sha256 ?? "unpinned"}` };
  }
  /** Ensure every artifact referenced by the manifest is present and verified. */
  async ensureManifest(manifest, artifactIds, hooks = {}) {
    const lockList = Object.values(manifest.artifacts).filter((lock) => artifactIds === void 0 || artifactIds.includes(lock.artifactId)).sort((left, right) => left.artifactId.localeCompare(right.artifactId));
    const installed = [];
    const reused = [];
    let bytes = 0;
    for (const lock of lockList) {
      const status = await this.inspect(lock);
      if (status.state === "ready") {
        reused.push(lock.artifactId);
        continue;
      }
      bytes += await this.download(lock, hooks);
      installed.push(lock.artifactId);
    }
    return { installed, reused, bytes };
  }
  /** Measure the cache: one row per installed artifact directory. */
  async summary() {
    const artifacts = [];
    let totalBytes = 0;
    let entries;
    try {
      entries = await readdir8(this.root, { withFileTypes: true });
    } catch {
      return { artifacts, totalBytes };
    }
    for (const entry of entries) {
      if (!entry.isDirectory())
        continue;
      const bytes = await directorySize2(join13(this.root, entry.name));
      artifacts.push({ id: entry.name, bytes });
      totalBytes += bytes;
    }
    return { artifacts: artifacts.sort((left, right) => left.id.localeCompare(right.id)), totalBytes };
  }
  /** Remove artifacts no installed skill references; `dryRun` only measures. */
  async gc(referenced, dryRun = false) {
    const removed = [];
    const kept = [];
    let freedBytes = 0;
    let entries;
    try {
      entries = await readdir8(this.root, { withFileTypes: true });
    } catch {
      return { removed, freedBytes, kept };
    }
    for (const entry of entries) {
      if (!entry.isDirectory())
        continue;
      if (referenced.has(entry.name)) {
        kept.push(entry.name);
        continue;
      }
      const path = join13(this.root, entry.name);
      freedBytes += await directorySize2(path);
      if (!dryRun)
        await rm8(path, { recursive: true, force: true });
      removed.push(entry.name);
    }
    return { removed, freedBytes, kept };
  }
  async download(lock, hooks) {
    if (lock.platform !== process.platform || lock.arch !== archName2()) {
      throw new ForgeError("FORGE_NODE_PLATFORM", `${lock.artifactId} targets ${lock.platform}/${lock.arch}`);
    }
    const artifact = await this.registry.node(lock.artifactId);
    if (lock.sha256 !== void 0 && artifact.sha256 !== void 0 && artifact.sha256 !== lock.sha256) {
      throw new ForgeError("FORGE_NODE_INTEGRITY", `registry digest for ${lock.artifactId} disagrees with the skill lock`);
    }
    const expected = lock.sha256 ?? artifact.sha256;
    await mkdir11(this.cacheRoot, { recursive: true });
    const archive = join13(this.cacheRoot, `${lock.artifactId}.tar.gz`);
    const transfer = await downloadFile({
      url: artifact.url,
      dest: archive,
      sha256: expected,
      size: artifact.size,
      signal: hooks.signal,
      onProgress: (progress) => hooks.onProgress?.(lock.artifactId, progress.downloaded, progress.total)
    });
    const target = join13(this.root, lock.artifactId);
    const staging = `${target}.staging-${process.pid}`;
    await rm8(staging, { recursive: true, force: true });
    await mkdir11(staging, { recursive: true });
    try {
      await extractArchive(archive, staging, { allowInternalLinks: true });
      if (!await isExecutable(join13(staging, lock.entrypoint))) {
        throw new ForgeError("FORGE_NODE_ENTRYPOINT", `${lock.artifactId} has no executable ${lock.entrypoint}`);
      }
      const metadata = {
        artifactId: lock.artifactId,
        ...expected === void 0 ? {} : { sha256: expected },
        ...lock.version === void 0 ? {} : { version: lock.version },
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await rm8(join13(staging, ".artifact.json"), { force: true });
      await writeFile6(join13(staging, ".artifact.json"), JSON.stringify(metadata, null, 2));
      await rm8(target, { recursive: true, force: true });
      await rename6(staging, target);
    } finally {
      await rm8(staging, { recursive: true, force: true });
    }
    await rm8(archive, { force: true });
    return transfer.bytes;
  }
};
async function directorySize2(path) {
  let total = 0;
  let entries;
  try {
    entries = await readdir8(path, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const child = join13(path, entry.name);
    if (entry.isDirectory())
      total += await directorySize2(child);
    else {
      try {
        total += (await stat10(child)).size;
      } catch {
      }
    }
  }
  return total;
}
async function isExecutable(path) {
  try {
    const info = await stat10(path);
    return info.isFile() && (info.mode & 73) !== 0;
  } catch {
    return false;
  }
}
function archName2() {
  if (process.arch === "x64")
    return "x86_64";
  if (process.arch === "arm64")
    return "aarch64";
  if (process.arch === "ia32")
    return "x86";
  return process.arch;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/runtime.js
var execFileAsync3 = promisify3(execFile3);
var SkillRuntimeManager = class {
  paths;
  nodes;
  models;
  options;
  states = /* @__PURE__ */ new Map();
  /** `<home>/support/bin/dora` (Forge 1) and `dora1` (Forge 2) are the convention. */
  localDora;
  localDora1;
  constructor(options) {
    this.options = options;
    this.paths = forgePaths(options.home, options.modelsRoot);
    this.nodes = new NodeStore(this.paths.nodes, options.registry, join14(this.paths.runtime, "cache"));
    this.models = new ModelStore(this.paths.models);
    const supportBin = join14(this.paths.home, "support", "bin");
    const localDora = join14(supportBin, "dora");
    const localDora1 = join14(supportBin, "dora1");
    this.localDora = existsSync4(localDora) ? localDora : "dora";
    this.localDora1 = existsSync4(localDora1) ? localDora1 : "dora1";
  }
  /** Forge 1 CLI (dora 0.4.1 by default). */
  get dora() {
    return this.options.dora ?? process.env["DSH_FORGE_DORA"] ?? this.localDora;
  }
  /** Forge 2 CLI (dora 1.0.1 by default). */
  get dora1() {
    return this.options.dora1 ?? process.env["DSH_FORGE_DORA1"] ?? this.localDora1;
  }
  /** Pick the CLI by the bundle's declared Forge generation. */
  doraFor(forgeVersion) {
    return (forgeVersion ?? DEFAULT_FORGE_VERSION) === "2" ? this.dora1 : this.dora;
  }
  /** Load persisted state from disk (best effort). */
  async load() {
    try {
      const text = await readFile11(join14(this.paths.runtime, "state.json"), "utf8");
      const parsed = JSON.parse(text);
      for (const [skill, state] of Object.entries(parsed.skills ?? {}))
        this.states.set(skill, state);
      await this.reconcile();
    } catch {
    }
  }
  /** Drop states whose Dora flow is no longer running (host restart, crash). */
  async reconcile() {
    const runningByDora = /* @__PURE__ */ new Map();
    const runningOf = async (dora) => {
      const cached = runningByDora.get(dora);
      if (cached !== void 0)
        return cached;
      try {
        const { stdout } = await execFileAsync3(dora, ["list"], { timeout: 8e3 });
        const names = new Set(stdout.split("\n").slice(1).map((line) => line.split(/\s{2,}/)[1]).filter((name) => typeof name === "string" && name.length > 0));
        runningByDora.set(dora, names);
        return names;
      } catch {
        runningByDora.set(dora, /* @__PURE__ */ new Set());
        return void 0;
      }
    };
    let changed = false;
    for (const state of this.states.values()) {
      if (state.status === "stopped")
        continue;
      if (state.launch === "run" || state.pid !== void 0) {
        if (state.pid !== void 0 && isAlive2(state.pid))
          continue;
        await killByFlow(state.flow).catch(() => 0);
        state.status = "stopped";
        delete state.pid;
        changed = true;
        continue;
      }
      const dora = state.dora ?? this.dora;
      if (await runningOf(dora) === void 0)
        continue;
      if (!runningByDora.get(dora).has(state.flow)) {
        await killByFlow(state.flow).catch(() => 0);
        state.status = "stopped";
        changed = true;
      }
    }
    if (changed)
      await this.persist();
  }
  async status(skill) {
    return this.states.get(skill);
  }
  async stopAll() {
    for (const skill of [...this.states.keys()]) {
      const state = this.states.get(skill);
      if (state === void 0 || state.status === "stopped")
        continue;
      await this.stop(skill).catch(() => void 0);
    }
  }
  /** Static dependency resolution: dora, binaries, assets, environment, port. */
  async preflight(entry, profileId) {
    const checks = [];
    const forgeVersion = entry.manifest.forgeVersion ?? DEFAULT_FORGE_VERSION;
    const dora = this.doraFor(forgeVersion);
    checks.push({
      id: "forge_version",
      status: isForgeGeneration(forgeVersion) ? "pass" : "fail",
      detail: isForgeGeneration(forgeVersion) ? `${forgeGenerationLabel(forgeVersion)} via ${dora}` : unsupportedForgeVersionDetail(forgeVersion)
    });
    const profile = entry.manifest.profiles[profileId];
    if (profile === void 0) {
      return { ok: false, checks: [{ id: "profile", status: "fail", detail: `unknown profile "${profileId}"` }], binaries: {} };
    }
    try {
      const { stdout } = await execFileAsync3(dora, ["--version"], { timeout: 5e3 });
      checks.push({ id: "dora", status: "pass", detail: `${stdout.trim().split("\n")[0] ?? "dora"} (${dora})` });
    } catch (error) {
      checks.push({ id: "dora", status: "fail", detail: `dora not runnable: ${error.message}` });
    }
    const binaries = {};
    for (const binary of profile.requiredBinaries) {
      const lock = entry.manifest.artifacts[binary];
      if (lock === void 0) {
        checks.push({ id: `binary.${binary}`, status: "fail", detail: "no artifact lock" });
        continue;
      }
      if (lock.platform !== process.platform || lock.arch !== archName3()) {
        checks.push({ id: `binary.${binary}`, status: "fail", detail: `lock is ${lock.platform}/${lock.arch}, host is ${process.platform}/${archName3()}` });
        continue;
      }
      const status = await this.nodes.inspect(lock, binary);
      if (status.state === "ready") {
        binaries[binary] = status.entrypoint;
        checks.push({ id: `binary.${binary}`, status: "pass", detail: status.detail });
      } else if (status.state === "unverified") {
        binaries[binary] = status.entrypoint;
        checks.push({ id: `binary.${binary}`, status: "warn", detail: status.detail });
      } else {
        checks.push({ id: `binary.${binary}`, status: "fail", detail: `${status.detail} (install nodes for this skill)` });
      }
    }
    for (const asset of profile.requiredAssets) {
      const path = join14(entry.dir, asset);
      checks.push(await existsCheck(`asset.${asset}`, path));
    }
    const modelEnv = {};
    for (const req of modelsForProfile(entry.manifest, profileId)) {
      const status = await this.models.resolveRequirement(req);
      if (status.path !== void 0 && req.env !== void 0 && status.state !== "missing" && status.state !== "mismatch") {
        modelEnv[req.env] = status.path;
      }
      if (status.state === "ready") {
        checks.push({ id: `model.${req.id}`, status: "pass", detail: status.detail });
      } else if (status.state === "unverified") {
        checks.push({ id: `model.${req.id}`, status: "warn", detail: status.detail });
      } else {
        checks.push({
          id: `model.${req.id}`,
          status: status.optional ? "warn" : "fail",
          detail: status.detail
        });
      }
    }
    const missingEnv = profile.requiredEnvironment.filter((name) => (process.env[name] ?? profile.environment[name] ?? modelEnv[name]) === void 0);
    checks.push({
      id: "environment",
      status: missingEnv.length === 0 ? "pass" : "fail",
      detail: missingEnv.length === 0 ? "all required variables present" : `missing: ${missingEnv.join(", ")}`
    });
    const gateway = entry.manifest.gatewayUrl;
    if (gateway === void 0) {
      checks.push({ id: "gateway_url", status: "fail", detail: "manifest has no gateway_url" });
    } else {
      const busy = await portBusy2(gateway);
      const own = [...this.states.values()].some((state) => state.gatewayUrl === gateway && state.status !== "stopped");
      checks.push({
        id: "gateway_url",
        status: busy && !own ? "fail" : "pass",
        detail: busy ? own ? `${gateway} held by this manager` : `${gateway} is already in use` : `${gateway} is free`
      });
    }
    return { ok: checks.every((check) => check.status !== "fail"), checks, binaries, modelEnv };
  }
  /** Start one skill/profile pair and wait for the gateway to be healthy. */
  async start(skill, profileId, options = {}) {
    const entry = await this.options.catalog.load(skill);
    if (entry === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${skill}" is not installed`);
    const profile = entry.manifest.profiles[profileId];
    if (profile === void 0)
      throw new ForgeError("FORGE_PROFILE_UNKNOWN", `profile "${profileId}" does not exist`);
    if (entry.manifest.gatewayUrl === void 0)
      throw new ForgeError("FORGE_MANIFEST_INVALID", "manifest has no gateway_url");
    const existing = this.states.get(skill);
    if (existing !== void 0 && existing.status !== "stopped" && existing.status !== "failed") {
      if (existing.profile === profileId && existing.status === "healthy")
        return existing;
      throw new ForgeError("FORGE_RUNTIME_STALE", `skill "${skill}" already has an active runtime (${existing.profile}); stop it first`);
    }
    const preflight = await this.preflight(entry, profileId);
    if (!preflight.ok) {
      const failed = preflight.checks.filter((check) => check.status === "fail");
      throw new ForgeError("FORGE_NODE_MISSING", failed.map((check) => `${check.id}: ${check.detail}`).join("; "));
    }
    const requiredArtifacts = profile.requiredBinaries.map((binary) => entry.manifest.artifacts[binary]?.artifactId).filter((artifactId) => artifactId !== void 0);
    const nodePlan = await this.nodes.ensureManifest(entry.manifest, requiredArtifacts);
    const binaries = { ...preflight.binaries };
    for (const binary of profile.requiredBinaries) {
      const lock = entry.manifest.artifacts[binary];
      if (lock === void 0)
        continue;
      const status = await this.nodes.inspect(lock, binary);
      if (status.state === "ready" || status.state === "unverified")
        binaries[binary] = status.entrypoint;
    }
    const forgeVersion = entry.manifest.forgeVersion ?? "1";
    const dora = this.doraFor(forgeVersion);
    const launch = options.launch ?? "start";
    const flow = `forge-${slug2(skill)}-${slug2(profileId)}-${Date.now().toString(36)}`;
    const modelEnv = preflight.modelEnv ?? {};
    const envDir = await this.materialize(entry, profile, binaries, flow, modelEnv);
    const gatewayUrl = entry.manifest.gatewayUrl;
    const state = {
      skill,
      profile: profileId,
      flow,
      envDir,
      gatewayUrl,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: entry.manifest.version,
      artifactIds: Object.values(entry.manifest.artifacts).map((artifact) => artifact.artifactId),
      dora,
      forgeVersion,
      launch,
      status: "starting"
    };
    this.states.set(skill, state);
    await this.persist();
    try {
      if (launch === "run") {
        state.pid = await this.spawnRun(dora, entry, profile, flow, envDir, modelEnv);
      } else {
        await this.ensureCoordinator(dora, envDir);
        await execFileAsync3(dora, [
          "start",
          join14(envDir, "launch", profile.dataflow),
          "--name",
          flow,
          "--detach"
        ], { cwd: join14(envDir, "launch", dirname6(profile.dataflow)), env: this.flowEnv(entry, profile, envDir, modelEnv), timeout: 6e4 });
      }
      await this.waitForGateway(gatewayUrl);
      state.status = "healthy";
      await this.persist();
      return state;
    } catch (error) {
      if (state.pid !== void 0)
        await killProcessTree(state.pid).catch(() => void 0);
      await killByFlow(state.flow).catch(() => 0);
      state.status = "failed";
      state.error = error.message;
      await this.persist();
      throw error;
    }
  }
  /** Launch a flow with `dora run`: no coordinator, process-owned. */
  async spawnRun(dora, entry, profile, flow, envDir, modelEnv = {}) {
    const dataflow = join14(envDir, "launch", profile.dataflow);
    await mkdir12(this.paths.logs, { recursive: true });
    const logPath = join14(this.paths.logs, `${flow}.log`);
    const fd = openSync(logPath, "a");
    try {
      const child = spawn(dora, ["run", dataflow], {
        cwd: dirname6(dataflow),
        env: this.flowEnv(entry, profile, envDir, modelEnv),
        detached: true,
        stdio: ["ignore", fd, fd]
      });
      child.unref();
      if (child.pid === void 0)
        throw new ForgeError("FORGE_DORA_MISSING", `failed to spawn ${dora} run`);
      return child.pid;
    } finally {
      closeSync(fd);
    }
  }
  /** Stop the runtime of one skill. */
  async stop(skill, force = false) {
    const state = this.states.get(skill);
    if (state === void 0)
      return void 0;
    if (state.status === "stopped")
      return state;
    if (state.status === "failed" && state.pid === void 0) {
      state.status = "stopped";
      delete state.error;
      await this.persist();
      return state;
    }
    if (state.launch === "run" || state.pid !== void 0) {
      if (state.pid !== void 0)
        await killProcessTree(state.pid, force);
      await killByFlow(state.flow, force).catch(() => 0);
      state.status = "stopped";
      delete state.pid;
      delete state.error;
      await this.persist();
      return state;
    }
    const args = ["stop", "--name", state.flow];
    if (force)
      args.push("--force");
    let stopError;
    try {
      await execFileAsync3(state.dora ?? this.dora, args, { timeout: 3e4 });
    } catch (error) {
      stopError = error.message;
    }
    const orphans = await killByFlow(state.flow, force).catch(() => 0);
    const leftover = (await pidsForFlow(state.flow).catch(() => [])).length;
    if (leftover > 0) {
      state.status = "failed";
      state.error = `dora stop failed and ${leftover} node process(es) remain: ${stopError ?? "unknown error"}`;
      await this.persist();
      throw new ForgeError("FORGE_RUNTIME_STALE", state.error);
    }
    state.status = "stopped";
    delete state.error;
    await this.persist();
    return state;
  }
  /** Tail a runtime log file. */
  async logs(skill, lines = 120) {
    const state = this.states.get(skill);
    if (state === void 0)
      return "";
    try {
      const files = await readdir9(this.paths.logs);
      const relevant = files.filter((name) => name.startsWith(`${state.flow}`)).sort();
      const chunks = [];
      for (const file of relevant) {
        const text = await readFile11(join14(this.paths.logs, file), "utf8").catch(() => "");
        chunks.push(text.split("\n").slice(-lines).join("\n"));
      }
      return chunks.join("\n").trim();
    } catch {
      return "";
    }
  }
  async materialize(entry, profile, binaries, flow, modelEnv = {}) {
    const hash = createHash4("sha256").update(entry.manifest.version).update(profile.id).update(readFileSync(join14(entry.dir, profile.dataflow))).digest("hex").slice(0, 16);
    const envDir = join14(this.paths.runtime, "env", entry.name, profile.id, hash);
    await rm9(envDir, { recursive: true, force: true });
    await mkdir12(envDir, { recursive: true, mode: 448 });
    await chmod2(envDir, 448);
    await mkdir12(join14(envDir, "bin"), { mode: 448 });
    for (const [binary, path] of Object.entries(binaries)) {
      symlinkSync(path, join14(envDir, "bin", binary));
    }
    const launch = join14(envDir, "launch");
    await cp2(entry.dir, launch, {
      recursive: true,
      filter: (source) => !/node_modules|\.git|(^|\/)nodes(\/|$)/.test(source)
    });
    await protectRuntimeTree(launch);
    await rewritePlaceholders(launch, "${FORGE_RUNTIME_BIN}", join14(envDir, "bin"));
    await rewritePlaceholders(launch, "${FORGE_MODELS_DIR}", this.paths.models);
    await rewritePlaceholders(launch, "${PAOS_SKILL_ROOT}", entry.dir);
    await rewritePlaceholders(launch, "${PAOS_SKILL_NAME}", entry.name);
    await rewritePlaceholders(launch, "${PAOS_SKILL_VERSION}", entry.manifest.version);
    await rewritePlaceholders(launch, "${PAOS_RUNTIME_INSTANCE_ID}", basename(envDir));
    await rewritePlaceholders(launch, "${FORGE_FLOW_ID}", flow);
    await injectDataflowEnv(join14(launch, profile.dataflow), {
      ...modelEnv,
      ...profile.environment,
      ...Object.fromEntries(profile.requiredEnvironment.filter((name) => profile.environment[name] === void 0 && process.env[name] !== void 0).map((name) => [name, process.env[name]])),
      FORGE_RUNTIME_BIN: join14(envDir, "bin"),
      FORGE_MODELS_DIR: this.paths.models,
      PAOS_SKILL_ROOT: entry.dir,
      PAOS_SKILL_NAME: entry.name,
      PAOS_SKILL_VERSION: entry.manifest.version,
      PAOS_RUNTIME_INSTANCE_ID: basename(envDir),
      FORGE_FLOW_ID: flow
    });
    await writeFile7(join14(envDir, "runtime-lock.json"), JSON.stringify({
      skill: entry.name,
      version: entry.manifest.version,
      profile: profile.id,
      binaries,
      modelsRoot: this.paths.models,
      modelEnv,
      artifacts: Object.fromEntries(Object.entries(entry.manifest.artifacts).map(([key, value]) => [key, value.artifactId]))
    }, null, 2), { mode: 384 });
    await chmod2(join14(envDir, "runtime-lock.json"), 384);
    await mkdir12(this.paths.logs, { recursive: true });
    return envDir;
  }
  flowEnv(entry, profile, envDir, modelEnv = {}) {
    return {
      ...modelEnv,
      ...process.env,
      ...profile.environment,
      FORGE_RUNTIME_BIN: join14(envDir, "bin"),
      FORGE_MODELS_DIR: this.paths.models,
      PAOS_SKILL_ROOT: entry.dir,
      PAOS_SKILL_NAME: entry.name,
      PAOS_SKILL_VERSION: entry.manifest.version,
      PAOS_RUNTIME_INSTANCE_ID: basename(envDir)
    };
  }
  async ensureCoordinator(dora, envDir) {
    if (await coordinatorReady(dora))
      return;
    await mkdir12(this.paths.logs, { recursive: true });
    const fd = openSync(join14(this.paths.logs, "dora-coordinator.log"), "a");
    try {
      const child = spawn(dora, ["up"], { cwd: envDir, detached: true, stdio: ["ignore", fd, fd] });
      child.unref();
    } finally {
      closeSync(fd);
    }
    const deadline = Date.now() + 15e3;
    while (Date.now() < deadline) {
      if (await coordinatorReady(dora))
        return;
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
    throw new ForgeError("FORGE_DORA_MISSING", "dora coordinator did not become ready");
  }
  async waitForGateway(gatewayUrl) {
    const deadline = Date.now() + (this.options.startTimeoutMs ?? 12e4);
    const interval = this.options.pollIntervalMs ?? 500;
    let last = "no response";
    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${gatewayUrl.replace(/\/+$/, "")}/tools`, { signal: AbortSignal.timeout(2e3) });
        if (response.ok)
          return;
        last = `HTTP ${response.status}`;
      } catch (error) {
        last = error.message;
      }
      await new Promise((resolveWait) => setTimeout(resolveWait, interval));
    }
    throw new ForgeError("FORGE_GATEWAY_UNREACHABLE", `${gatewayUrl}/tools not ready: ${last}`);
  }
  async persist() {
    await mkdir12(this.paths.runtime, { recursive: true });
    const payload = { skills: Object.fromEntries(this.states) };
    const target = join14(this.paths.runtime, "state.json");
    const temp = `${target}.tmp`;
    await writeFile7(temp, JSON.stringify(payload, null, 2));
    const { rename: rename9 } = await import("node:fs/promises");
    await rename9(temp, target);
  }
};
async function protectRuntimeTree(root) {
  await chmod2(root, 448);
  for (const entry of await readdir9(root, { withFileTypes: true })) {
    const path = join14(root, entry.name);
    if (entry.isDirectory()) {
      await protectRuntimeTree(path);
    } else if (entry.isSymbolicLink()) {
      throw new ForgeError("FORGE_ARCHIVE_UNSAFE", `runtime payload contains a symbolic link: ${path}`);
    } else if (entry.isFile()) {
      const info = await stat11(path);
      await chmod2(path, (info.mode & 73) !== 0 ? 448 : 384);
    }
  }
}
async function rewritePlaceholders(root, needle, value) {
  const entries = await readdir9(root, { withFileTypes: true });
  for (const entry of entries) {
    const path = join14(root, entry.name);
    if (entry.isDirectory()) {
      await rewritePlaceholders(path, needle, value);
      continue;
    }
    if (!/\.(ya?ml|json|sh|txt|toml)$/.test(entry.name))
      continue;
    const text = await readFile11(path, "utf8");
    if (!text.includes(needle))
      continue;
    await writeFile7(path, text.split(needle).join(value));
  }
}
async function existsCheck(id, path) {
  try {
    const info = await stat11(path);
    return { id, status: info.isFile() ? "pass" : "warn", detail: path };
  } catch {
    return { id, status: "fail", detail: `${path} is missing` };
  }
}
async function portBusy2(url) {
  try {
    const parsed = new URL(url);
    const port = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));
    const { connect: connect2 } = await import("node:net");
    return await new Promise((resolvePort) => {
      const socket = connect2({ host: parsed.hostname, port });
      socket.setTimeout(500);
      socket.once("connect", () => {
        socket.destroy();
        resolvePort(true);
      });
      socket.once("timeout", () => {
        socket.destroy();
        resolvePort(false);
      });
      socket.once("error", () => resolvePort(false));
    });
  } catch {
    return false;
  }
}
function archName3() {
  if (process.arch === "x64")
    return "x86_64";
  if (process.arch === "arm64")
    return "aarch64";
  if (process.arch === "ia32")
    return "x86";
  return process.arch;
}
function slug2(value) {
  return value.replace(/[^a-z0-9]+/gi, "-");
}
async function killProcessTree(pid, force = false) {
  const signalAll = (signal, pids) => {
    for (const target of pids) {
      try {
        process.kill(target, signal);
      } catch {
      }
    }
  };
  const signalGroup = (signal) => {
    try {
      process.kill(-pid, signal);
    } catch {
      try {
        process.kill(pid, signal);
      } catch {
      }
    }
  };
  let descendants = await listDescendants(pid).catch(() => []);
  if (!force) {
    signalGroup("SIGINT");
    if (await waitForExit(pid, 2e3)) {
      signalAll("SIGKILL", await listDescendants(pid).catch(() => descendants));
      return;
    }
  }
  signalAll("SIGTERM", [pid, ...descendants]);
  signalGroup("SIGTERM");
  if (!force && await waitForExit(pid, 3e3)) {
    signalAll("SIGKILL", await listDescendants(pid).catch(() => descendants));
    return;
  }
  const remaining = /* @__PURE__ */ new Set([pid, ...descendants]);
  for (const extra of await listDescendants(pid).catch(() => []))
    remaining.add(extra);
  signalAll("SIGKILL", [...remaining]);
  signalGroup("SIGKILL");
}
async function listDescendants(root) {
  const { stdout } = await execFileAsync3("ps", ["-eo", "pid=,ppid="], { timeout: 5e3 });
  const children = /* @__PURE__ */ new Map();
  for (const line of stdout.split("\n")) {
    const [pidText, parentText] = line.trim().split(/\s+/);
    const pid = Number(pidText);
    const parent = Number(parentText);
    if (!Number.isFinite(pid) || !Number.isFinite(parent))
      continue;
    const list = children.get(parent) ?? [];
    list.push(pid);
    children.set(parent, list);
  }
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const child of children.get(current) ?? []) {
      result.push(child);
      queue.push(child);
    }
  }
  return result;
}
async function waitForExit(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive2(pid))
      return true;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  return !isAlive2(pid);
}
function isAlive2(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
async function injectDataflowEnv(path, env) {
  const entries = Object.entries(env).filter(([, value]) => typeof value === "string" && value.length > 0);
  if (entries.length === 0)
    return;
  const document = (0, import_yaml4.parseDocument)(await readFile11(path, "utf8"));
  const nodes = document.get("nodes");
  const count = Array.isArray(nodes) ? nodes.length : nodes?.items?.length ?? 0;
  if (count === 0)
    return;
  for (let index = 0; index < count; index += 1) {
    for (const [name, value] of entries) {
      document.setIn(["nodes", index, "env", name], value);
    }
  }
  await chmod2(path, 384);
  await writeFile7(path, String(document), { mode: 384 });
}
async function coordinatorReady(dora) {
  try {
    await execFileAsync3(dora, ["list"], { timeout: 5e3 });
    return true;
  } catch {
    return false;
  }
}
async function pidsForFlow(flow) {
  const marker = `FORGE_FLOW_ID=${flow}`;
  const pids = [];
  let entries = [];
  try {
    entries = await readdir9("/proc");
  } catch {
    return pids;
  }
  for (const name of entries) {
    if (!/^\d+$/.test(name))
      continue;
    try {
      const environ = await readFile11(`/proc/${name}/environ`);
      if (environ.includes(marker))
        pids.push(Number(name));
    } catch {
    }
  }
  return pids;
}
async function killByFlow(flow, force = false) {
  let pids = await pidsForFlow(flow);
  if (pids.length === 0)
    return 0;
  const signal = (signalName) => {
    for (const pid of pids) {
      try {
        process.kill(pid, signalName);
      } catch {
      }
    }
  };
  signal("SIGTERM");
  if (!force) {
    const deadline = Date.now() + 2e3;
    while (Date.now() < deadline) {
      pids = pids.filter(isAlive2);
      if (pids.length === 0)
        return 0;
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    }
  }
  const remaining = await pidsForFlow(flow);
  for (const pid of remaining) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
    }
  }
  return remaining.length;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/skill-files.js
var import_yaml5 = __toESM(require_dist(), 1);
import { copyFile as copyFile3, mkdir as mkdir13, readdir as readdir10, readFile as readFile12, rename as rename7, stat as stat12, writeFile as writeFile8 } from "node:fs/promises";
import { join as join15, relative as relative4, resolve as resolve7, sep as sep3 } from "node:path";
var EDITABLE = /\.(ya?ml|json|txt|md)$/i;
var SkillFileStore = class {
  catalog;
  backupsRoot;
  constructor(catalog, backupsRoot) {
    this.catalog = catalog;
    this.backupsRoot = backupsRoot;
  }
  /** Enumerate installed skills, their profiles and editable files. */
  async tree() {
    const { skills } = await this.catalog.list();
    const result = [];
    for (const entry of skills) {
      const profiles = [];
      for (const id of Object.keys(entry.manifest.profiles)) {
        const dir = join15(entry.dir, "profiles", id);
        const files = [];
        for (const path of await walk(dir)) {
          const info = await stat12(path);
          files.push({ path: relative4(dir, path).split(sep3).join("/"), size: info.size, modified: info.mtime.toISOString() });
        }
        profiles.push({ id, files: files.sort((left, right) => left.path.localeCompare(right.path)) });
      }
      result.push({ name: entry.name, version: entry.manifest.version, profiles });
    }
    return result;
  }
  /** Bundle-level documentation: docs/** plus the root instruction and manifest files. */
  async bundleDocs(skill) {
    const entry = await this.catalog.load(skill);
    if (entry === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${skill}" is not installed`);
    const files = [];
    for (const name of ["SKILL.md", "skill.yaml", "README.md"]) {
      const path = join15(entry.dir, name);
      try {
        const info = await stat12(path);
        files.push({ path: name, size: info.size, modified: info.mtime.toISOString() });
      } catch {
      }
    }
    for (const path of await walk(join15(entry.dir, "docs"))) {
      const info = await stat12(path);
      files.push({ path: `docs/${relative4(join15(entry.dir, "docs"), path).split(sep3).join("/")}`, size: info.size, modified: info.mtime.toISOString() });
    }
    return files.sort((left, right) => left.path.localeCompare(right.path));
  }
  /** Read one bundle document (docs/**, SKILL.md, skill.yaml, README.md). */
  async readBundleDoc(skill, file) {
    const entry = await this.catalog.load(skill);
    if (entry === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${skill}" is not installed`);
    const allowed = file === "SKILL.md" || file === "skill.yaml" || file === "README.md" || file.startsWith("docs/");
    if (!allowed)
      throw new ForgeError("FORGE_FILE_INVALID", `${file} is not a bundle document`);
    const target = resolve7(entry.dir, file);
    if (!target.startsWith(resolve7(entry.dir) + sep3))
      throw new ForgeError("FORGE_FILE_INVALID", "path escapes the bundle");
    try {
      return await readFile12(target, "utf8");
    } catch {
      throw new ForgeError("FORGE_FILE_INVALID", `${file} does not exist`);
    }
  }
  /** Read one profile file. */
  async read(skill, profile, file) {
    return readFile12(await this.resolve(skill, profile, file), "utf8");
  }
  /** Validate and write one profile file, returning the backup path. */
  async write(skill, profile, file, content) {
    const path = await this.resolve(skill, profile, file);
    if (/\.ya?ml$/i.test(file)) {
      try {
        (0, import_yaml5.parse)(content);
      } catch (error) {
        throw new ForgeError("FORGE_FILE_INVALID", `${file}: ${error.message}`);
      }
    }
    const backup = await this.backupPath(path);
    await copyFile3(path, backup);
    const temp = `${path}.tmp-${process.pid}`;
    await writeFile8(temp, content);
    await rename7(temp, path);
    return { path, backup };
  }
  /** Backups live outside the bundle unless no dedicated root was configured. */
  async backupPath(path) {
    if (this.backupsRoot === void 0)
      return `${path}.bak-${Date.now()}`;
    const target = join15(this.backupsRoot, String(Date.now()), path.split(sep3).slice(-4).join(sep3));
    await mkdir13(join15(target, ".."), { recursive: true });
    return target;
  }
  async resolve(skill, profile, file) {
    const entry = await this.catalog.load(skill);
    if (entry === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${skill}" is not installed`);
    if (entry.manifest.profiles[profile] === void 0) {
      throw new ForgeError("FORGE_PROFILE_UNKNOWN", `profile "${profile}" does not exist`);
    }
    const root = resolve7(entry.dir, "profiles", profile);
    const target = resolve7(root, file);
    if (!target.startsWith(root + sep3))
      throw new ForgeError("FORGE_FILE_INVALID", "path escapes the profile directory");
    if (!EDITABLE.test(target))
      throw new ForgeError("FORGE_FILE_INVALID", "file type is not editable");
    try {
      await stat12(target);
    } catch {
      throw new ForgeError("FORGE_FILE_INVALID", `${file} does not exist`);
    }
    return target;
  }
};
async function walk(dir) {
  let entries;
  try {
    entries = await readdir10(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const paths = [];
  for (const entry of entries) {
    if (entry.name.startsWith("."))
      continue;
    const path = join15(dir, entry.name);
    if (entry.isDirectory())
      paths.push(...await walk(path));
    else if (entry.isFile() && EDITABLE.test(entry.name))
      paths.push(path);
  }
  return paths;
}

// node_modules/.pnpm/@x-era+forge-core@0.2.0_patch_hash=fea3e581967bb4925db445de39369111eded8a26d698060a74acd46c50d55d63/node_modules/@x-era/forge-core/lib/operations.js
var ForgeOperations = class {
  paths;
  catalog;
  catalogs;
  registry;
  runtime;
  models;
  profiles;
  defaultProfile;
  files;
  jobs;
  events;
  callTimeoutMs;
  onCatalogChange;
  dora;
  dora1;
  loaded;
  constructor(options) {
    this.paths = forgePaths(options.home, options.modelsRoot);
    this.registry = options.registry ?? new ForgeRegistryClient();
    const roots = options.roots === void 0 || options.roots.length === 0 ? [this.paths.skills] : options.roots;
    this.catalogs = roots.map((root) => new ForgeCatalog(root));
    this.catalog = this.catalogs[0];
    this.runtime = new SkillRuntimeManager({
      home: options.home,
      modelsRoot: this.paths.models,
      catalog: this.catalog,
      registry: this.registry,
      dora: options.dora,
      dora1: options.dora1,
      startTimeoutMs: options.startTimeoutMs
    });
    this.models = this.runtime.models;
    this.profiles = new DshProfileStore({ profilesRoot: options.profilesRoot });
    this.defaultProfile = options.profile !== void 0 && options.profile.length > 0 ? options.profile : "web";
    this.files = new SkillFileStore(this.catalog, join16(this.paths.runtime, "backups"));
    this.jobs = new JobRunner(join16(this.paths.runtime, "jobs"));
    this.events = new EventLog(join16(this.paths.runtime, "logs", "events.jsonl"), options.events !== false);
    this.callTimeoutMs = options.callTimeoutMs ?? 15e3;
    this.onCatalogChange = options.onCatalogChange;
    this.dora = options.dora;
    this.dora1 = options.dora1;
  }
  changed() {
    this.onCatalogChange?.();
  }
  async ready() {
    this.loaded ??= this.runtime.load();
    return this.loaded;
  }
  async find(name) {
    for (const catalog of this.catalogs) {
      const entry = await catalog.load(name);
      if (entry !== void 0)
        return { catalog, entry };
    }
    return void 0;
  }
  // ---- catalog -----------------------------------------------------------
  async list() {
    await this.ready();
    const skills = [];
    const diagnostics = [];
    for (const catalog of this.catalogs) {
      const listing = await catalog.list();
      for (const entry of listing.skills) {
        skills.push({
          name: entry.name,
          version: entry.manifest.version,
          description: entry.manifest.description,
          profiles: Object.keys(entry.manifest.profiles),
          forgeVersion: entry.manifest.forgeVersion ?? "1",
          path: entry.dir,
          runtime: await this.runtime.status(entry.name) ?? null
        });
      }
      for (const diagnostic of listing.diagnostics) {
        diagnostics.push({ name: diagnostic.name, code: diagnostic.code, message: diagnostic.message, path: diagnostic.dir });
      }
    }
    return { skills, diagnostics };
  }
  async inspect(name) {
    const found = await this.find(name);
    if (found === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    const inspection = await found.catalog.inspect(name);
    if (inspection === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    const { entry, checks } = inspection;
    return {
      ok: checks.every((check) => check.status !== "fail"),
      name: entry.name,
      version: entry.manifest.version,
      description: entry.manifest.description,
      forgeVersion: entry.manifest.forgeVersion ?? "1",
      gatewayUrl: entry.manifest.gatewayUrl ?? null,
      profiles: Object.values(entry.manifest.profiles).map((profile) => ({
        id: profile.id,
        dataflow: profile.dataflow,
        requiredBinaries: profile.requiredBinaries,
        requiredAssets: profile.requiredAssets,
        requiredEnvironment: profile.requiredEnvironment,
        requiredTools: profile.requiredTools ?? entry.manifest.requiredTools,
        requiredModels: modelsForProfile(entry.manifest, profile.id)
      })),
      requiredModels: entry.manifest.requiredModels ?? [],
      artifacts: Object.values(entry.manifest.artifacts).map((artifact) => ({ ...artifact })),
      checks
    };
  }
  async read(name) {
    const found = await this.find(name);
    if (found === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    const content = await found.catalog.readDocument(name);
    if (content === void 0)
      throw new ForgeError("FORGE_SKILL_DOC_MISSING", `${name} has no instruction document`);
    return {
      name: found.entry.name,
      version: found.entry.manifest.version,
      profiles: Object.keys(found.entry.manifest.profiles),
      content
    };
  }
  search(query = "") {
    return this.registry.search(query);
  }
  // ---- install -----------------------------------------------------------
  lockPath() {
    return join16(this.paths.runtime, "forge.lock");
  }
  listSkillVersions(name) {
    return this.registry.skillVersions(name);
  }
  install(name, withNodes = true, version) {
    return this.jobs.start("install", name, async (job) => {
      await this.ready();
      return withLock(this.lockPath(), async () => {
        void this.events.append("install.start", { name, nodes: withNodes });
        job.progress({ phase: "bundle" });
        const result = await installSkill(name, {
          registry: this.registry,
          skillsRoot: this.paths.skills,
          cacheRoot: join16(this.paths.runtime, "cache"),
          signal: job.signal,
          ...version === void 0 ? {} : { version },
          onProgress: (phase, downloaded, total) => {
            job.progress({
              phase,
              ...downloaded === void 0 ? {} : { downloadedBytes: downloaded },
              ...total === void 0 ? {} : { totalBytes: total }
            });
          }
        });
        this.changed();
        let nodes = null;
        if (withNodes) {
          const found = await this.find(name);
          if (found !== void 0) {
            nodes = await this.runtime.nodes.ensureManifest(found.entry.manifest, void 0, {
              signal: job.signal,
              onProgress: (artifactId, downloaded, total) => {
                job.progress({
                  phase: `node:${artifactId}`,
                  downloadedBytes: downloaded,
                  ...total === void 0 ? {} : { totalBytes: total }
                });
              }
            });
          }
        }
        void this.events.append("install.finish", { name, version: result.version, bytes: result.bytes, nodes });
        return { ...result, nodes };
      });
    });
  }
  async update(name, apply = false, version) {
    const found = await this.find(name);
    if (found === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    const installed = found.entry.manifest.version;
    const versions = await this.registry.skillVersions(name);
    const latest = version ?? versions.currentVersion ?? (await this.registry.skill(name)).version;
    const updateAvailable = latest !== void 0 && latest !== installed;
    const available = versions.versions.map((item) => item.version);
    if (apply) {
      if (latest === void 0)
        throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", "registry did not report a target version");
      const record = this.install(name, true, latest);
      return { installed, latest, updateAvailable, available, jobId: record.id };
    }
    return { installed, latest: latest ?? null, updateAvailable, available };
  }
  async remove(name) {
    await this.ready();
    const state = await this.runtime.status(name);
    if (state !== void 0 && state.status !== "stopped") {
      throw new ForgeError("FORGE_RUNTIME_STALE", `stop the runtime first (${state.status})`);
    }
    const found = await this.find(name);
    if (found === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    return withLock(this.lockPath(), async () => {
      await rm10(found.entry.dir, { recursive: true, force: true });
      this.changed();
      void this.events.append("skill.remove", { name });
      return { name, removed: found.entry.dir };
    });
  }
  async jobStatus(id) {
    return await this.jobs.get(id) ?? null;
  }
  jobList(limit = 10) {
    return this.jobs.list(limit);
  }
  cancelJob(id) {
    return this.jobs.cancel(id);
  }
  // ---- doctor ------------------------------------------------------------
  /** Node repository catalog (static, from the TrackB manuals). */
  listRepositories(query, category) {
    return searchRepositories({ query, category });
  }
  /** One repository by id or by a node id it produces. */
  repository(idOrNode) {
    return findRepository(idOrNode);
  }
  /** Registry metadata for one locked node, including its source pinning. */
  async nodeInfo(artifactId) {
    const artifact = await this.registry.node(artifactId);
    return {
      artifactId,
      version: artifact.version ?? null,
      displayName: artifact.displayName ?? null,
      nodeType: artifact.nodeType ?? null,
      sourceUrl: artifact.sourceUrl ?? artifact.source?.repositoryUrl ?? null,
      sourceStatus: artifact.sourceStatus ?? null,
      forgeVersion: artifact.forgeVersion ?? null,
      source: artifact.source ?? null,
      sha256: artifact.sha256 ?? null,
      size: artifact.size ?? null
    };
  }
  /**
   * Read a source file from the registry's pinned revision.
   *
   * Requires the updated registry (`source.raw_base_url` + `commit_sha`). Files
   * are cached per commit under runtime/sources/; pass refresh to bypass.
   */
  async nodeSource(artifactId, file = "README.md", refresh = false) {
    const artifact = await this.registry.node(artifactId);
    const source = artifact.source;
    if (source?.rawBaseUrl === void 0 || source.rawBaseUrl.length === 0) {
      throw new ForgeError("FORGE_SOURCE_UNAVAILABLE", `registry has no pinned source for ${artifactId}`);
    }
    const base = new URL(source.rawBaseUrl);
    if (base.protocol !== "https:" || !SOURCE_HOSTS.has(base.hostname)) {
      throw new ForgeError("FORGE_SOURCE_UNAVAILABLE", `refusing to fetch from ${base.hostname}`);
    }
    const relative5 = normalizeSourcePath(file);
    const prefix = source.path === void 0 || source.path === "." || source.path === "./" ? "" : `${source.path.replace(/^\/+|\/+$/g, "")}/`;
    const url = new URL(`${base.pathname}${prefix}${relative5}`.replace(/\/{2,}/g, "/"), base.origin).toString();
    const revision = source.commitSha ?? source.ref ?? "unknown";
    const cachePath = join16(this.paths.runtime, "sources", artifactId, revision, relative5);
    if (!refresh) {
      const cached = await readFile13(cachePath, "utf8").catch(() => void 0);
      if (cached !== void 0) {
        return { artifactId, file: relative5, url, ref: source.ref ?? null, commitSha: source.commitSha ?? null, repositoryUrl: source.repositoryUrl ?? null, cached: true, content: cached };
      }
    }
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(2e4), headers: { accept: "text/plain" } });
    } catch (error) {
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `${url}: ${error.message}`);
    }
    if (!response.ok)
      throw new ForgeError("FORGE_REGISTRY_UNAVAILABLE", `${url}: HTTP ${response.status}`);
    const content = await response.text();
    await mkdir14(join16(cachePath, ".."), { recursive: true });
    await writeFile9(cachePath, content);
    void this.events.append("node.source", { artifactId, file: relative5, ref: source.ref ?? null, commit: source.commitSha ?? null });
    return { artifactId, file: relative5, url, ref: source.ref ?? null, commitSha: source.commitSha ?? null, repositoryUrl: source.repositoryUrl ?? null, cached: false, content };
  }
  async doctor(name, profile) {
    await this.ready();
    const diagnosis = await diagnoseSkill({ catalog: this.catalog, runtime: this.runtime, skill: name, profile });
    void this.events.append("doctor.run", { skill: name, ok: diagnosis.ok });
    return diagnosis;
  }
  async doctorReport(name) {
    await this.ready();
    const listing = await this.catalog.list();
    const names = name === void 0 ? listing.skills.map((skill) => skill.name) : [name];
    const skills = [];
    for (const skill of names) {
      skills.push(await diagnoseSkill({ catalog: this.catalog, runtime: this.runtime, skill }));
    }
    const runtimes = [];
    for (const skill of names)
      runtimes.push({ name: skill, runtime: await this.runtime.status(skill) ?? null });
    const report = {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      home: this.paths.home,
      skillsRoot: this.paths.skills,
      nodesRoot: this.paths.nodes,
      registry: this.registry.baseUrl,
      skills,
      diagnostics: listing.diagnostics,
      runtimes
    };
    const stamp3 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const path = join16(this.paths.runtime, "reports", `doctor-${stamp3}.json`);
    await mkdir14(join16(this.paths.runtime, "reports"), { recursive: true });
    await writeFile9(path, JSON.stringify(report, null, 2), { mode: 384 });
    void this.events.append("doctor.report", { path, skills: skills.length });
    return {
      path,
      summary: {
        skills: skills.length,
        failing: skills.filter((skill) => !skill.ok).length,
        diagnostics: listing.diagnostics.length
      }
    };
  }
  // ---- environment -------------------------------------------------------
  /**
   * Base environment check that does not depend on one skill.
   *
   * Run it right after the plugin is installed ("can this machine run Forge at
   * all?") and before blaming a skill for a failure that is really a missing
   * dora CLI, an unwritable data root or a busy gateway port.
   */
  async environmentCheck(options = {}) {
    await this.ready();
    const listing = await this.list();
    const skills = [];
    for (const summary of listing.skills) {
      const found = await this.find(summary.name);
      const gatewayUrl = found?.entry.manifest.gatewayUrl;
      skills.push({ name: summary.name, ...gatewayUrl === void 0 ? {} : { gatewayUrl } });
    }
    const report = await checkEnvironment({
      home: this.paths.home,
      modelsRoot: this.paths.models,
      dora: this.dora,
      dora1: this.dora1,
      registryUrl: this.registry.baseUrl,
      skills,
      ...options.offline === true ? { offline: true } : {}
    });
    void this.events.append("environment.check", {
      ok: report.ok,
      fail: report.summary.fail,
      warn: report.summary.warn,
      path: report.path ?? null
    });
    return report;
  }
  /**
   * Deterministically bootstrap Forge runtime dependencies (`dora` 0.4.1, `dora1` 1.0.1,
   * managed directories, and optional `cordis.patch.yml` config) on a new or incomplete host.
   */
  async environmentSetup(options = {}) {
    await this.ready();
    const listing = await this.list();
    const skills = [];
    for (const summary of listing.skills) {
      const found = await this.find(summary.name);
      const gatewayUrl = found?.entry.manifest.gatewayUrl;
      skills.push({ name: summary.name, ...gatewayUrl === void 0 ? {} : { gatewayUrl } });
    }
    const run = () => bootstrapEnvironment({
      home: this.paths.home,
      modelsRoot: this.paths.models,
      components: options.components,
      doraVersion: options.doraVersion,
      dora1Version: options.dora1Version,
      doraBinaryPath: options.doraBinaryPath,
      dora1BinaryPath: options.dora1BinaryPath,
      python: options.python,
      indexUrl: options.indexUrl,
      force: options.force,
      dryRun: options.dryRun,
      writeProfileConfig: options.writeProfileConfig,
      profile: options.profile ?? this.defaultProfile,
      profilesRoot: this.profiles.root,
      verify: options.verify,
      offline: options.offline,
      registryUrl: this.registry.baseUrl,
      skills,
      exec: options.exec
    });
    const result = options.dryRun === true ? await run() : await withLock(this.lockPath(), run);
    if (options.dryRun !== true) {
      void this.events.append("environment.setup", {
        ok: result.ok,
        installer: result.installer,
        dora: result.dora.status,
        dora1: result.dora1.status
      });
    }
    return result;
  }
  // ---- DSH profile config (cordis.patch.yml) -----------------------------
  /** Read the `forge-skill` plugin row config, available DSH profiles and backups. */
  async configRead(profile) {
    const target = profile !== void 0 && profile.length > 0 ? profile : this.defaultProfile;
    const [profiles, snapshot, backups] = await Promise.all([
      this.profiles.listProfiles(),
      this.profiles.read(target),
      this.profiles.listBackups(target)
    ]);
    return {
      profile: target,
      profiles,
      path: snapshot.path,
      rowExists: snapshot.rowExists,
      config: snapshot.config,
      backups
    };
  }
  /**
   * Safely validate and write the `forge-skill` row in `<profile>/cordis.patch.yml`.
   *
   * Merges onto the current row config by default (`merge !== false`) so partial updates
   * (such as `runtime.dora` or `models.root`) never clobber sibling settings. Always keeps
   * a timestamped backup and returns a field-level diff.
   */
  async configWrite(profile, config, options = {}) {
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", "config must be an object");
    }
    const target = profile !== void 0 && profile.length > 0 ? profile : this.defaultProfile;
    const before = await this.profiles.read(target);
    const next = options.merge === false ? config : mergeForgeRowConfig(before.config, config);
    const written = await withLock(this.lockPath(), () => this.profiles.write(target, next));
    const after = await this.profiles.read(target);
    const diff = diffValues(before.config, after.config);
    void this.events.append("config.write", { profile: target, changed: diff.length, backup: written.backup ?? null });
    return {
      profile: target,
      path: written.path,
      ...written.backup === void 0 ? {} : { backup: written.backup },
      changed: diff.length,
      diff,
      config: after.config,
      note: "DSH profile cordis.patch.yml updated; HMR reloads plugin config, restart DSH if the plugin was not mounted yet"
    };
  }
  /** Restore a previous `cordis.patch.yml.bak-*` backup for one DSH profile. */
  async configRestore(profile, backup) {
    const target = profile !== void 0 && profile.length > 0 ? profile : this.defaultProfile;
    const restored = await withLock(this.lockPath(), () => this.profiles.restoreBackup(target, backup));
    void this.events.append("config.restore", { profile: target, restored: backup });
    return { profile: target, ...restored };
  }
  // ---- runtime -----------------------------------------------------------
  async runtimeStart(name, profile, launch = "start") {
    await this.ready();
    const state = await withLock(this.lockPath(), () => this.runtime.start(name, profile, { launch }));
    void this.events.append("runtime.start", { skill: name, profile, flow: state.flow, launch });
    return state;
  }
  async runtimeStatus(name) {
    await this.ready();
    return await this.runtime.status(name) ?? null;
  }
  async runtimeStop(name, force = false) {
    await this.ready();
    const state = await withLock(this.lockPath(), () => this.runtime.stop(name, force));
    void this.events.append("runtime.stop", { skill: name, force });
    return state ?? null;
  }
  async runtimeLogs(name, lines = 120) {
    await this.ready();
    return this.runtime.logs(name, lines);
  }
  // ---- gateway -----------------------------------------------------------
  async clientFor(name) {
    const state = await this.runtimeStatus(name);
    if (state === null || state.status !== "healthy") {
      throw new ForgeError("FORGE_RUNTIME_STALE", `skill "${name}" has no healthy runtime`);
    }
    return new ForgeToolClient(state.gatewayUrl, this.callTimeoutMs);
  }
  /** ToolSpecs exposed by the running gateway (used for dynamic registration). */
  async gatewayTools(name) {
    return (await this.clientFor(name)).tools();
  }
  async toolContext(name, toolId) {
    return (await this.clientFor(name)).context(toolId);
  }
  async toolCall(name, toolId, args = {}) {
    const client = await this.clientFor(name);
    const result = await client.invoke(toolId, args);
    void this.events.append("tool.call", { skill: name, tool: toolId, httpStatus: result.httpStatus, invocationId: result.invocationId ?? null });
    const payload = result.data ?? {};
    const inner = payload["data"] ?? payload;
    const outputs = inner["response"]?.["result"]?.["outputs"] ?? null;
    return { ok: result.ok, httpStatus: result.httpStatus, invocationId: result.invocationId ?? null, outputs, data: result.data };
  }
  async invocationRead(name, invocationId) {
    const client = await this.clientFor(name);
    const [status, result] = await Promise.all([client.invocation(invocationId), client.result(invocationId)]);
    return { status, result };
  }
  // ---- skill profile files ----------------------------------------------
  /** Every editable profile file of every installed skill. */
  profileTree() {
    return this.files.tree();
  }
  /** Validate a bundle directory before installing it (local development). */
  /**
   * Package one installed skill bundle into a deterministic `tar.gz` under the
   * forge home, returning the digest a lock file would record.
   */
  /**
   * Install a locally built bundle archive (see `forge_skill_package`).
   *
   * Refuses to replace a skill whose runtime is active, and keeps the previous
   * bundle under `<skills>/.backups/<name>/`. Node artifacts are not fetched:
   * node builds are distributed through their own releases.
   */
  async installLocal(archivePath) {
    const running = [];
    for (const row of (await this.list()).skills) {
      const state = await this.runtime.status(row.name);
      if (state !== void 0 && state.status !== "stopped")
        running.push(row.name);
    }
    return installFromArchive(archivePath, { skillsRoot: this.paths.skills, running });
  }
  async packageSkill(name, options = {}) {
    const entry = await this.catalog.load(name);
    if (entry === void 0) {
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    }
    return packageSkill({
      bundleDir: entry.dir,
      outputDir: options.outputDir ?? join16(this.paths.runtime, "dist"),
      force: options.force === true,
      includeVenv: options.includeVenv === true
    });
  }
  validateLocalBundle(path) {
    return validateBundle(path);
  }
  /** Bundle documentation shipped with a skill (docs/ plus SKILL.md and skill.yaml). */
  async skillDocs(name) {
    const entry = await this.find(name);
    if (entry === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    return { skill: name, files: await this.files.bundleDocs(name) };
  }
  async readSkillDoc(name, file) {
    return { skill: name, file, content: await this.files.readBundleDoc(name, file) };
  }
  /** Read one profile file with a parsed summary. */
  async profileRead(name, profile, file) {
    const content = await this.files.read(name, profile, file);
    const parsed = parseStructured(file, content);
    return {
      skill: name,
      profile,
      file,
      content,
      valid: parsed.ok,
      ...parsed.ok ? {} : { error: parsed.error }
    };
  }
  /** Write one profile file after validation, returning the field-level diff. */
  async profileWrite(name, profile, file, content) {
    const before = await this.files.read(name, profile, file);
    const parsed = parseStructured(file, content);
    if (!parsed.ok) {
      throw new ForgeError("FORGE_FILE_INVALID", `${file}: ${parsed.error}`);
    }
    const previous = parseStructured(file, before);
    const beforeValue = previous.ok ? previous.value : void 0;
    const afterValue = parsed.ok ? parsed.value : void 0;
    const diff = beforeValue === void 0 || afterValue === void 0 ? [] : diffValues(beforeValue, afterValue);
    const written = await withLock(this.lockPath(), () => this.files.write(name, profile, file, content));
    this.changed();
    void this.events.append("profile.write", { skill: name, profile, file, changed: diff.length });
    return {
      skill: name,
      profile,
      file,
      path: written.path,
      backup: written.backup,
      changed: diff.length,
      diff,
      restartRequired: true,
      note: "restart the skill runtime for this change to take effect"
    };
  }
  // ---- models ------------------------------------------------------------
  /** Search or list local models under `<home>/models` (or `models.root`). */
  async modelSearch(query = {}) {
    const refs = await this.modelReferences();
    return this.models.search(query, refs);
  }
  /** Inspect one local model by id (and optional revision). */
  async modelInfo(id, revision) {
    const refs = await this.modelReferences();
    const found = await this.models.info(id, revision, refs);
    if (found === void 0) {
      const label = revision === void 0 ? id : `${id}@${revision}`;
      throw new ForgeError("FORGE_MODEL_NOT_FOUND", `model "${label}" is not installed under ${this.paths.models}`);
    }
    return found;
  }
  /** Verify the primary weight file's SHA256 against its `receipt.json`. */
  async modelVerify(id, revision) {
    return this.models.verify(id, revision);
  }
  async modelReferences() {
    const map = /* @__PURE__ */ new Map();
    const add = (key, skill) => {
      let set = map.get(key);
      if (set === void 0) {
        set = /* @__PURE__ */ new Set();
        map.set(key, set);
      }
      set.add(skill);
    };
    for (const catalog of this.catalogs) {
      for (const skill of (await catalog.list()).skills) {
        for (const req of skill.manifest.requiredModels ?? []) {
          add(req.id, skill.name);
          if (req.revision !== void 0)
            add(`${req.id}@${req.revision}`, skill.name);
        }
        for (const profile of Object.values(skill.manifest.profiles)) {
          for (const req of profile.requiredModels ?? []) {
            add(req.id, skill.name);
            if (req.revision !== void 0)
              add(`${req.id}@${req.revision}`, skill.name);
          }
        }
      }
    }
    return new Map([...map.entries()].map(([key, set]) => [key, [...set].sort()]));
  }
  // ---- cache / export ----------------------------------------------------
  cacheSummary() {
    return this.runtime.nodes.summary();
  }
  async cacheGc(dryRun = false) {
    const referenced = /* @__PURE__ */ new Set();
    for (const catalog of this.catalogs) {
      for (const skill of (await catalog.list()).skills) {
        for (const artifact of Object.values(skill.manifest.artifacts))
          referenced.add(artifact.artifactId);
      }
    }
    const result = await withLock(this.lockPath(), () => this.runtime.nodes.gc(referenced, dryRun));
    return { ...result, referenced: [...referenced].sort() };
  }
  async exportPortable(name, outDir) {
    const found = await this.find(name);
    if (found === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    const result = await exportPortableSkill(found.entry, outDir);
    void this.events.append("skill.export", { name, path: result.path });
    return result;
  }
  /** Every artifact id referenced by installed skills (used by tests and GC). */
  async referencedArtifacts() {
    const ids = /* @__PURE__ */ new Set();
    for (const catalog of this.catalogs) {
      for (const skill of (await catalog.list()).skills) {
        for (const artifact of Object.values(skill.manifest.artifacts))
          ids.add(artifact.artifactId);
      }
    }
    return [...ids].sort();
  }
  /** Read the manifest of one installed skill (used by diagnostics). */
  async manifest(name) {
    const found = await this.find(name);
    if (found === void 0)
      throw new ForgeError("FORGE_SKILL_NOT_FOUND", `skill "${name}" is not installed`);
    return found.entry.manifest;
  }
  /** List the installed skill directories (used by diagnostics and exports). */
  async installedDirs() {
    const listing = await this.catalog.list();
    return listing.skills.map((skill) => skill.dir);
  }
  /** Count installed skills without touching the registry. */
  async installedCount() {
    const dirs = await readdir11(this.paths.skills).catch(() => []);
    return dirs.filter((name) => !name.startsWith(".")).length;
  }
  /** Size of a path in bytes (best effort, used by reports). */
  async sizeOf(path) {
    try {
      const info = await stat13(path);
      return info.size;
    } catch {
      return 0;
    }
  }
};
function parseStructured(file, content) {
  try {
    if (/\.ya?ml$/i.test(file))
      return { ok: true, value: (0, import_yaml6.parse)(content) };
    if (/\.json$/i.test(file))
      return { ok: true, value: JSON.parse(content) };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
var SOURCE_HOSTS = /* @__PURE__ */ new Set(["raw.githubusercontent.com", "github.com"]);
function normalizeSourcePath(file) {
  const cleaned = file.trim().replace(/^\/+/, "");
  if (cleaned.length === 0 || cleaned.split("/").some((segment) => segment === ".." || segment === ".")) {
    throw new ForgeError("FORGE_FILE_INVALID", `invalid source file "${file}"`);
  }
  return cleaned;
}

// src/config-store.mjs
import { copyFile as copyFile4, mkdir as mkdir15, readFile as readFile14, readdir as readdir12, rename as rename8, stat as stat14, writeFile as writeFile10 } from "node:fs/promises";
import { basename as basename2, join as join17 } from "node:path";
var CONFIG_FILE = "config.json";
var backupSeq = 0;
function stamp2() {
  const now = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  backupSeq += 1;
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${String(now.getMilliseconds()).padStart(3, "0")}-${backupSeq}`;
}
var KimiConfigStore = class {
  constructor(home2, lockFile = join17(home2, "runtime", "forge.lock")) {
    this.home = home2;
    this.path = join17(home2, CONFIG_FILE);
    this.lockFile = lockFile;
  }
  async read() {
    let raw;
    try {
      raw = await readFile14(this.path, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        return { path: this.path, exists: false, config: {}, backups: await this.listBackups() };
      }
      throw error;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `${this.path} contains invalid JSON: ${error.message}`);
    }
    const config = validateConfig(parsed);
    return { path: this.path, exists: true, config, backups: await this.listBackups() };
  }
  async write(patch, { merge = true } = {}) {
    if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", "config must be an object");
    }
    if ("home" in patch) {
      throw new ForgeError("FORGE_CONFIG_INVALID", "home is controlled by KIMI_FORGE_HOME / DSH_FORGE_HOME, not config.json");
    }
    return withLock(this.lockFile, async () => {
      const before = await this.read();
      const candidate = merge ? mergeForgeRowConfig(before.config, patch) : patch;
      const normalized = validateConfig(candidate);
      await mkdir15(this.home, { recursive: true });
      let backup;
      if (before.exists) {
        backup = `${this.path}.bak-${stamp2()}`;
        await copyFile4(this.path, backup);
      }
      const temp = `${this.path}.tmp-${process.pid}-${stamp2()}`;
      await writeFile10(temp, `${JSON.stringify(normalized, null, 2)}
`, { mode: 384 });
      await rename8(temp, this.path);
      const diff = diffValues(before.config, normalized);
      return {
        path: this.path,
        ...backup === void 0 ? {} : { backup: basename2(backup) },
        changed: diff.length,
        diff,
        config: normalized,
        note: "Applied immediately to the active Kimi Forge MCP session."
      };
    });
  }
  async listBackups() {
    let entries = [];
    try {
      entries = (await readdir12(this.home)).filter((name) => name.startsWith(`${CONFIG_FILE}.bak-`));
    } catch {
      return [];
    }
    const backups = [];
    for (const file of entries) {
      try {
        const info = await stat14(join17(this.home, file));
        backups.push({ file, at: new Date(info.mtimeMs).toISOString(), size: info.size });
      } catch {
      }
    }
    return backups.sort((a, b2) => b2.at.localeCompare(a.at));
  }
  async restore(file) {
    if (typeof file !== "string" || !/^config\.json\.bak-[0-9-]+$/.test(file)) {
      throw new ForgeError("FORGE_CONFIG_INVALID", `invalid backup filename "${file}"`);
    }
    return withLock(this.lockFile, async () => {
      const source = join17(this.home, file);
      let raw;
      try {
        raw = await readFile14(source, "utf8");
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new ForgeError("FORGE_CONFIG_INVALID", `backup "${file}" does not exist`);
        }
        throw error;
      }
      const normalized = validateConfig(JSON.parse(raw));
      let previous;
      try {
        await stat14(this.path);
        const prevPath = `${this.path}.bak-${stamp2()}`;
        await copyFile4(this.path, prevPath);
        previous = basename2(prevPath);
      } catch {
        previous = void 0;
      }
      const temp = `${this.path}.tmp-${process.pid}-${stamp2()}`;
      await writeFile10(temp, `${JSON.stringify(normalized, null, 2)}
`, { mode: 384 });
      await rename8(temp, this.path);
      return {
        path: this.path,
        restored: file,
        ...previous === void 0 ? {} : { previous },
        config: normalized
      };
    });
  }
};

// src/paths.mjs
import { homedir as homedir3 } from "node:os";
import { join as join18, resolve as resolve8 } from "node:path";
function resolveKimiCodeHome(env = process.env) {
  const raw = env.KIMI_CODE_HOME?.trim();
  return raw ? resolve8(expandHome(raw)) : join18(homedir3(), ".kimi-code");
}
function resolveKimiForgeHome(env = process.env, explicit = void 0) {
  for (const candidate of [explicit, env.KIMI_FORGE_HOME, env.DSH_FORGE_HOME]) {
    const trimmed = candidate?.trim();
    if (trimmed) return resolve8(expandHome(trimmed));
  }
  return join18(resolveKimiCodeHome(env), "forge");
}
function resolveKimiSkillsDir(env = process.env) {
  return join18(resolveKimiCodeHome(env), "skills");
}
function expandUserPath(value, baseDir = void 0) {
  const expanded = expandHome(value);
  return baseDir ? resolve8(baseDir, expanded) : resolve8(expanded);
}

// src/forge-mcp.mjs
var SERVER_NAME = "phyagentos-kimi-mcp";
var SERVER_VERSION = "0.2.0";
var DEFAULT_PROTOCOL_VERSION = "2024-11-05";
var SUPPORTED_PROTOCOLS = /* @__PURE__ */ new Set(["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"]);
var writeStderr = (...args) => process.stderr.write(`${args.map(String).join(" ")}
`);
console.log = writeStderr;
console.info = writeStderr;
console.warn = writeStderr;
var home = resolveKimiForgeHome(process.env);
var configStore = new KimiConfigStore(home);
async function createOperations(previousJobs = void 0) {
  let cfg = {};
  try {
    const snap = await configStore.read();
    cfg = snap.config;
  } catch (error) {
    writeStderr(`[${SERVER_NAME}] warning: failed to load config.json: ${error.message}`);
  }
  const roots = cfg.skills?.roots?.length ? cfg.skills.roots.map((root) => expandUserPath(root, home)) : void 0;
  const modelsExplicit = cfg.models?.root || process.env.KIMI_FORGE_MODELS || process.env.DSH_FORGE_MODELS;
  const modelsRoot = modelsExplicit ? expandUserPath(modelsExplicit, home) : void 0;
  const registryUrl = cfg.registry?.url || process.env.KIMI_FORGE_REGISTRY_URL || process.env.DSH_FORGE_REGISTRY_URL || DEFAULT_REGISTRY_URL;
  const registry = new ForgeRegistryClient({
    baseUrl: registryUrl,
    timeoutMs: cfg.registry?.timeoutMs,
    ...cfg.registry?.token ? { token: cfg.registry.token } : {},
    ...cfg.registry?.tokenEnv ? { tokenEnv: cfg.registry.tokenEnv } : {}
  });
  const doraRaw = cfg.runtime?.dora || process.env.KIMI_FORGE_DORA || process.env.DSH_FORGE_DORA;
  const dora1Raw = cfg.runtime?.dora1 || process.env.KIMI_FORGE_DORA1 || process.env.DSH_FORGE_DORA1;
  const resolveBin = (raw) => raw && (raw.includes("/") || raw.startsWith("~")) ? expandUserPath(raw, home) : raw || void 0;
  const next = new ForgeOperations({
    home,
    roots,
    modelsRoot,
    profilesRoot: join19(home, "profiles"),
    registry,
    dora: resolveBin(doraRaw),
    dora1: resolveBin(dora1Raw),
    startTimeoutMs: cfg.runtime?.startTimeoutMs,
    callTimeoutMs: cfg.gateway?.callTimeoutMs
  });
  if (previousJobs !== void 0) {
    next.jobs = previousJobs;
  }
  await next.runtime.load();
  return next;
}
var operations = await createOperations();
async function reloadOperations() {
  operations = await createOperations(operations.jobs);
}
var tool = (name, description, properties = {}, required = []) => ({
  name,
  description,
  inputSchema: { type: "object", properties, required, additionalProperties: false }
});
var str = (description) => ({ type: "string", description });
var bool = (description) => ({ type: "boolean", description });
var num = (description) => ({ type: "number", description });
var TOOLS = [
  tool("forge_skill_list", "List installed Forge skills and their runtime state under the isolated Kimi Forge home.", {}, []),
  tool("forge_skill_search", "Search the PhyAgentOS Forge resource registry.", { query: str("Optional search text") }, []),
  tool("forge_skill_inspect", "Inspect one installed skill (profiles, artifacts, models, checks).", { name: str("Skill name") }, ["name"]),
  tool("forge_skill_read", "Read the SKILL.md workflow instructions of one installed skill.", { name: str("Skill name") }, ["name"]),
  tool("forge_skill_install", "Install or update a skill from the registry as a background job.", {
    name: str("Registry skill name"),
    nodes: bool("Also install locked node artifacts (default true)"),
    version: str("Optional published version to pin")
  }, ["name"]),
  tool("forge_skill_install_local", "Install or update a skill from a local .tar.gz bundle archive built by forge_skill_package.", {
    path: str("Path to local bundle .tar.gz")
  }, ["path"]),
  tool("forge_skill_package", "Package one installed skill bundle into a deterministic .tar.gz archive with sha256 sidecar.", {
    name: str("Installed skill name to package"),
    output_dir: str("Optional destination directory (defaults to <home>/runtime/dist)"),
    force: bool("Overwrite an existing archive of the same name/version"),
    include_venv: bool("Include Python venv trees (default false)")
  }, ["name"]),
  tool("forge_skill_versions", "List published versions of a skill in the registry.", { name: str("Registry skill name") }, ["name"]),
  tool("forge_install_status", "Read one background install job or recent jobs.", { job_id: str("Job id") }, []),
  tool("forge_install_cancel", "Cancel a running background install job.", { job_id: str("Job id") }, ["job_id"]),
  tool("forge_skill_update", "Compare installed and registry versions; set apply=true to start the update job.", {
    name: str("Skill name"),
    apply: bool("Start the update job"),
    version: str("Target version")
  }, ["name"]),
  tool("forge_skill_remove", "Remove an installed skill (must stop its runtime first).", { name: str("Skill name") }, ["name"]),
  tool("forge_profile_files", "List editable profile configuration files of an installed skill.", {
    name: str("Skill name"),
    profile: str("Optional profile id")
  }, ["name"]),
  tool("forge_profile_read", "Read one profile file inside an installed skill.", {
    name: str("Skill name"),
    profile: str("Profile id"),
    file: str("File path inside the profile")
  }, ["name", "profile", "file"]),
  tool("forge_profile_write", "Validate, back up and overwrite one profile file (returns field diff and restartRequired).", {
    name: str("Skill name"),
    profile: str("Profile id"),
    file: str("File path inside the profile"),
    content: str("Complete updated file content")
  }, ["name", "profile", "file", "content"]),
  tool("forge_repo_search", "Search the Forge node source repository catalog.", {
    query: str("Free-text query"),
    category: str("framework | adapter | operator | benchmark")
  }, []),
  tool("forge_repo_info", "Read one node repository entry by repository id or node id.", { id_or_node: str("Repository id or node id") }, ["id_or_node"]),
  tool("forge_node_source", "Read a source file from the registry-pinned commit of a node artifact.", {
    artifact_id: str("Artifact id"),
    file: str("Path inside the repository (default README.md)"),
    refresh: bool("Bypass local source cache")
  }, ["artifact_id"]),
  tool("forge_skill_docs", "List or read authoring documentation shipped inside an installed skill.", {
    name: str("Skill name"),
    file: str("Optional document path")
  }, ["name"]),
  tool("forge_skill_validate", "Validate a local skill bundle directory before installing or packaging.", { path: str("Bundle directory path") }, ["path"]),
  tool("forge_node_info", "Look up a locked node artifact and its source provenance in the registry.", { artifact_id: str("Artifact id") }, ["artifact_id"]),
  tool("forge_skill_doctor", "Run preflight and integrity diagnostics for one installed skill.", {
    name: str("Skill name"),
    profile: str("Optional profile id")
  }, ["name"]),
  tool("forge_doctor_report", "Write a JSON diagnostics report under <home>/runtime/reports.", { name: str("Optional skill name") }, []),
  tool("forge_environment_check", "Check local base prerequisites for Forge: platform, Node, Python, dora/dora1, isolated home, disk, registry and gateway ports.", {
    offline: bool("Skip network registry probe")
  }, []),
  tool("forge_environment_setup", "Bootstrap Forge runtime dependencies (isolated directories, pinned Forge 1 dora 0.4.1 & Forge 2 dora1 1.0.1 under <home>/support/bin/) and reload the active MCP session.", {
    dry_run: bool("Preview plan without modifying disk"),
    dora_version: str("Forge 1 dora-rs-cli version (default 0.4.1)"),
    dora1_version: str("Forge 2 dora-rs-cli version (default 1.0.1)"),
    dora_binary_path: str("Optional local Forge 1 dora executable"),
    dora1_binary_path: str("Optional local Forge 2 dora1 executable"),
    python: str("Optional Python interpreter or version"),
    index_url: str("Optional PyPI mirror URL (e.g. https://pypi.tuna.tsinghua.edu.cn/simple)"),
    force: bool("Reinstall even if matching versions already exist"),
    write_config: bool("Persist installed dora/dora1 paths into <home>/config.json"),
    offline: bool("Skip registry probe during post-setup verification")
  }, []),
  tool("forge_config_read", "Read the isolated Kimi Forge config (<home>/config.json), active home path and available backups.", {}, []),
  tool("forge_config_write", "Validate, back up and update <home>/config.json (merges by default) and reload active Forge settings.", {
    config: { type: "object", description: "Forge config object (models, skills, registry, runtime, gateway)", additionalProperties: true },
    merge: bool("Merge onto existing config (default true)")
  }, ["config"]),
  tool("forge_config_restore", "Restore a previous config.json.bak-* backup and reload active Forge settings.", {
    backup: str("Backup filename (e.g. config.json.bak-...)")
  }, ["backup"]),
  tool("forge_runtime_start", "Start a skill runtime for one profile and wait until its Gateway is healthy. Requires explicit user instruction.", {
    name: str("Skill name"),
    profile: str("Profile id"),
    mode: { type: "string", enum: ["start", "run"], description: "start (Dora coordinator) or run (isolated process, required for Forge 2)" }
  }, ["name", "profile"]),
  tool("forge_runtime_status", "Read runtime status for one installed skill.", { name: str("Skill name") }, ["name"]),
  tool("forge_runtime_stop", "Stop a running skill runtime. Requires explicit user instruction.", {
    name: str("Skill name"),
    force: bool("Force stop")
  }, ["name"]),
  tool("forge_runtime_logs", "Read the tail of a skill runtime log.", {
    name: str("Skill name"),
    lines: num("Number of lines (default 120)")
  }, ["name"]),
  tool("forge_tool_context", "Read a Gateway ToolSpec context (schema, readiness, frames, units) without invoking it.", {
    name: str("Skill name"),
    tool_id: str("Tool id")
  }, ["name", "tool_id"]),
  tool("forge_tool_call", "Invoke a Query, Action or Session tool on a running skill Gateway.", {
    name: str("Skill name"),
    tool_id: str("Tool id"),
    arguments: { type: "object", description: "Tool arguments", additionalProperties: true }
  }, ["name", "tool_id"]),
  tool("forge_invocation_read", "Read status and result of an asynchronous Gateway invocation.", {
    name: str("Skill name"),
    invocation_id: str("Invocation id")
  }, ["name", "invocation_id"]),
  tool("forge_cache_summary", "Summarize disk usage of cached node artifacts.", {}, []),
  tool("forge_cache_gc", "Garbage-collect unreferenced node artifacts.", { dry_run: bool("Measure only without deleting") }, []),
  tool("forge_model_search", "Search or list local model weights under <home>/models (or configured models.root).", {
    query: str("Optional free-text query"),
    id: str("Optional exact model id"),
    tag: str("Optional tag filter"),
    skill: str("Optional referencing skill name")
  }, []),
  tool("forge_model_info", "Inspect one local model entry by id and optional revision.", {
    id: str("Model id"),
    revision: str("Optional revision")
  }, ["id"]),
  tool("forge_model_verify", "Verify a local model weight SHA256 against its receipt.json.", {
    id: str("Model id"),
    revision: str("Optional revision")
  }, ["id"]),
  tool("forge_skill_export", "Export an installed Forge bundle as a portable SKILL.md directory (optionally straight into Kimi user skills for live /skill: reload).", {
    name: str("Skill name"),
    out: str("Destination directory (defaults to <home>/portable unless kimi_skills=true)"),
    kimi_skills: bool("Export directly to $KIMI_CODE_HOME/skills (~/.kimi-code/skills) so Kimi auto-discovers it")
  }, ["name"])
];
async function dispatch(name, args) {
  switch (name) {
    case "forge_skill_list":
      return { home, ...await operations.list() };
    case "forge_skill_search":
      return { registry: operations.registry.baseUrl, skills: await operations.search(args.query ?? "") };
    case "forge_skill_inspect":
      return operations.inspect(args.name);
    case "forge_skill_read":
      return operations.read(args.name);
    case "forge_skill_install":
      return operations.install(args.name, args.nodes !== false, args.version);
    case "forge_skill_install_local":
      return operations.installLocal(expandUserPath(args.path));
    case "forge_skill_package":
      return operations.packageSkill(args.name, {
        ...args.output_dir === void 0 ? {} : { outputDir: expandUserPath(args.output_dir) },
        ...args.force === void 0 ? {} : { force: args.force },
        ...args.include_venv === void 0 ? {} : { includeVenv: args.include_venv }
      });
    case "forge_skill_versions":
      return operations.listSkillVersions(args.name);
    case "forge_install_status":
      return args.job_id === void 0 ? operations.jobList(10) : operations.jobStatus(args.job_id);
    case "forge_install_cancel":
      return { cancelled: operations.cancelJob(args.job_id) };
    case "forge_skill_update":
      return operations.update(args.name, args.apply === true, args.version);
    case "forge_skill_remove":
      return operations.remove(args.name);
    case "forge_profile_files":
      return { profiles: (await operations.profileTree()).find((skill) => skill.name === args.name)?.profiles ?? [] };
    case "forge_profile_read":
      return operations.profileRead(args.name, args.profile, args.file);
    case "forge_profile_write":
      return operations.profileWrite(args.name, args.profile, args.file, args.content);
    case "forge_repo_search":
      return { repositories: operations.listRepositories(args.query, args.category) };
    case "forge_repo_info":
      return operations.repository(args.id_or_node) ?? { error: `no catalog entry for ${args.id_or_node}` };
    case "forge_node_source":
      return operations.nodeSource(args.artifact_id, args.file ?? "README.md", args.refresh === true);
    case "forge_skill_docs":
      return args.file === void 0 ? operations.skillDocs(args.name) : operations.readSkillDoc(args.name, args.file);
    case "forge_skill_validate":
      return operations.validateLocalBundle(expandUserPath(args.path));
    case "forge_node_info":
      return operations.nodeInfo(args.artifact_id);
    case "forge_skill_doctor":
      return operations.doctor(args.name, args.profile);
    case "forge_doctor_report":
      return operations.doctorReport(args.name);
    case "forge_environment_check":
      return operations.environmentCheck({ offline: args.offline === true });
    case "forge_environment_setup": {
      const result = await operations.environmentSetup({
        dryRun: args.dry_run === true,
        doraVersion: args.dora_version,
        dora1Version: args.dora1_version,
        doraBinaryPath: args.dora_binary_path ? expandUserPath(args.dora_binary_path) : void 0,
        dora1BinaryPath: args.dora1_binary_path ? expandUserPath(args.dora1_binary_path) : void 0,
        python: args.python,
        indexUrl: args.index_url,
        force: args.force === true,
        writeProfileConfig: false,
        // never write to DSH cordis.patch.yml
        offline: args.offline === true
      });
      let configWriteResult;
      if (args.dry_run !== true) {
        if (args.write_config === true) {
          configWriteResult = await configStore.write({
            runtime: { dora: result.dora.path, dora1: result.dora1.path }
          }, { merge: true });
        }
        await reloadOperations();
      }
      return configWriteResult === void 0 ? result : { ...result, configUpdated: configWriteResult };
    }
    case "forge_config_read":
      return { home, ...await configStore.read() };
    case "forge_config_write": {
      const written = await configStore.write(args.config, { merge: args.merge !== false });
      await reloadOperations();
      return written;
    }
    case "forge_config_restore": {
      const restored = await configStore.restore(args.backup);
      await reloadOperations();
      return restored;
    }
    case "forge_runtime_start":
      return operations.runtimeStart(args.name, args.profile, args.mode === "run" ? "run" : "start");
    case "forge_runtime_status":
      return operations.runtimeStatus(args.name);
    case "forge_runtime_stop":
      return operations.runtimeStop(args.name, args.force === true);
    case "forge_runtime_logs":
      return { log: await operations.runtimeLogs(args.name, args.lines ?? 120) };
    case "forge_tool_context":
      return operations.toolContext(args.name, args.tool_id);
    case "forge_tool_call":
      return operations.toolCall(args.name, args.tool_id, args.arguments ?? {});
    case "forge_invocation_read":
      return operations.invocationRead(args.name, args.invocation_id);
    case "forge_cache_summary":
      return operations.cacheSummary();
    case "forge_cache_gc":
      return operations.cacheGc(args.dry_run === true);
    case "forge_model_search":
      return operations.modelSearch({ query: args.query, id: args.id, tag: args.tag, skill: args.skill });
    case "forge_model_info":
      return operations.modelInfo(args.id, args.revision);
    case "forge_model_verify":
      return operations.modelVerify(args.id, args.revision);
    case "forge_skill_export": {
      const targetOut = args.out ? expandUserPath(args.out) : args.kimi_skills === true ? resolveKimiSkillsDir(process.env) : join19(home, "portable");
      return operations.exportPortable(args.name, targetOut);
    }
    default:
      throw Object.assign(new Error(`unknown tool ${name}`), { code: "FORGE_USAGE" });
  }
}
var send = (message) => process.stdout.write(`${JSON.stringify(message)}
`);
async function handle(method, params) {
  switch (method) {
    case "initialize": {
      const requested = typeof params.protocolVersion === "string" ? params.protocolVersion : "";
      const protocolVersion = SUPPORTED_PROTOCOLS.has(requested) ? requested : DEFAULT_PROTOCOL_VERSION;
      return {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION }
      };
    }
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call": {
      const name = params.name;
      try {
        const value = await dispatch(name, params.arguments ?? {});
        return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError: false };
      } catch (error) {
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: false, code: error.code ?? "FORGE_ERROR", message: error.message }) }],
          isError: true
        };
      }
    }
    default:
      throw Object.assign(new Error(`unknown method ${method}`), { code: "FORGE_USAGE" });
  }
}
var input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", (line) => {
  if (line.trim().length === 0) return;
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
    return;
  }
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    send({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "invalid request" } });
    return;
  }
  const { id, method, params } = request;
  if (id === void 0) return;
  void handle(method, params ?? {}).then((result) => {
    send({ jsonrpc: "2.0", id, result });
  }).catch((error) => {
    send({
      jsonrpc: "2.0",
      id,
      error: {
        code: error.code === "FORGE_USAGE" ? -32601 : -32603,
        message: error instanceof Error ? error.message : String(error)
      }
    });
  });
});
