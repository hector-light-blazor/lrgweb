
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if (typeof $$scope.dirty === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

const globals = (typeof window !== 'undefined' ? window : global);
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, detail));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
}

/* src\components\Header.svelte generated by Svelte v3.16.7 */

const file = "src\\components\\Header.svelte";

function create_fragment(ctx) {
	let div6;
	let div0;
	let img;
	let img_src_value;
	let t0;
	let div5;
	let a0;
	let t2;
	let a1;
	let t4;
	let div2;
	let button0;
	let t6;
	let div1;
	let a2;
	let t8;
	let a3;
	let t10;
	let div4;
	let button1;
	let t12;
	let div3;
	let a4;
	let t14;
	let a5;
	let t16;
	let a6;
	let t18;
	let a7;
	let dispose;

	const block = {
		c: function create() {
			div6 = element("div");
			div0 = element("div");
			img = element("img");
			t0 = space();
			div5 = element("div");
			a0 = element("a");
			a0.textContent = "HOME";
			t2 = space();
			a1 = element("a");
			a1.textContent = "PUBLIC EDUCATION";
			t4 = space();
			div2 = element("div");
			button0 = element("button");
			button0.textContent = "SERVICES";
			t6 = space();
			div1 = element("div");
			a2 = element("a");
			a2.textContent = "Link 1";
			t8 = space();
			a3 = element("a");
			a3.textContent = "Link 2";
			t10 = space();
			div4 = element("div");
			button1 = element("button");
			button1.textContent = "TRAININGS";
			t12 = space();
			div3 = element("div");
			a4 = element("a");
			a4.textContent = "Link 1";
			t14 = space();
			a5 = element("a");
			a5.textContent = "Link 2";
			t16 = space();
			a6 = element("a");
			a6.textContent = "ABOUT US";
			t18 = space();
			a7 = element("a");
			a7.textContent = "CONTACT";
			attr_dev(img, "alt", "logo");
			if (img.src !== (img_src_value = "/build/assets/logo/public_safety_logo.webp")) attr_dev(img, "src", img_src_value);
			attr_dev(img, "class", "svelte-i8614r");
			add_location(img, file, 105, 6, 1615);
			attr_dev(div0, "class", "logo svelte-i8614r");
			add_location(div0, file, 104, 4, 1589);
			attr_dev(a0, "href", "#Home");
			attr_dev(a0, "class", "svelte-i8614r");
			add_location(a0, file, 109, 6, 1733);
			attr_dev(a1, "href", "#PubEd");
			attr_dev(a1, "class", "svelte-i8614r");
			add_location(a1, file, 110, 6, 1824);
			attr_dev(button0, "class", "dropbtn svelte-i8614r");
			add_location(button0, file, 113, 28, 1959);
			attr_dev(a2, "href", "Serv1");
			attr_dev(a2, "class", "svelte-i8614r");
			add_location(a2, file, 115, 10, 2051);
			attr_dev(a3, "href", "Serv2");
			attr_dev(a3, "class", "svelte-i8614r");
			add_location(a3, file, 116, 10, 2089);
			attr_dev(div1, "class", "dropdown-content svelte-i8614r");
			add_location(div1, file, 114, 6, 2009);
			attr_dev(div2, "class", "dropdown svelte-i8614r");
			add_location(div2, file, 113, 6, 1937);
			attr_dev(button1, "class", "dropbtn svelte-i8614r");
			add_location(button1, file, 119, 30, 2178);
			attr_dev(a4, "href", "Train1");
			attr_dev(a4, "class", "svelte-i8614r");
			add_location(a4, file, 121, 10, 2271);
			attr_dev(a5, "href", "Train2");
			attr_dev(a5, "class", "svelte-i8614r");
			add_location(a5, file, 122, 10, 2310);
			attr_dev(div3, "class", "dropdown-content svelte-i8614r");
			add_location(div3, file, 120, 6, 2229);
			attr_dev(div4, "class", "dropdown svelte-i8614r");
			add_location(div4, file, 119, 8, 2156);
			attr_dev(a6, "href", "#AboutUs");
			attr_dev(a6, "class", "svelte-i8614r");
			add_location(a6, file, 126, 6, 2378);
			attr_dev(a7, "href", "Contact");
			attr_dev(a7, "class", "svelte-i8614r");
			add_location(a7, file, 127, 6, 2417);
			attr_dev(div5, "class", "navbar svelte-i8614r");
			add_location(div5, file, 107, 4, 1701);
			attr_dev(div6, "class", "wrapper svelte-i8614r");
			add_location(div6, file, 103, 0, 1562);

			dispose = [
				listen_dev(a0, "click", prevent_default(/*click_handler*/ ctx[0]), false, true, false),
				listen_dev(a1, "click", prevent_default(/*click_handler_1*/ ctx[1]), false, true, false)
			];
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div6, anchor);
			append_dev(div6, div0);
			append_dev(div0, img);
			append_dev(div6, t0);
			append_dev(div6, div5);
			append_dev(div5, a0);
			append_dev(div5, t2);
			append_dev(div5, a1);
			append_dev(div5, t4);
			append_dev(div5, div2);
			append_dev(div2, button0);
			append_dev(div2, t6);
			append_dev(div2, div1);
			append_dev(div1, a2);
			append_dev(div1, t8);
			append_dev(div1, a3);
			append_dev(div5, t10);
			append_dev(div5, div4);
			append_dev(div4, button1);
			append_dev(div4, t12);
			append_dev(div4, div3);
			append_dev(div3, a4);
			append_dev(div3, t14);
			append_dev(div3, a5);
			append_dev(div5, t16);
			append_dev(div5, a6);
			append_dev(div5, t18);
			append_dev(div5, a7);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div6);
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self) {
	console.log(window.app);

	const click_handler = () => {
		window.app.navigate("/");
	};

	const click_handler_1 = () => {
		window.app.navigate("/PubEd");
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		
	};

	return [click_handler, click_handler_1];
}

class Header extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Header",
			options,
			id: create_fragment.name
		});
	}
}

/* src\components\Footer.svelte generated by Svelte v3.16.7 */

const file$1 = "src\\components\\Footer.svelte";

function create_fragment$1(ctx) {
	let div1;
	let div0;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			attr_dev(div0, "id", "footer-internal");
			attr_dev(div0, "class", "svelte-1entcyp");
			add_location(div0, file$1, 23, 3, 317);
			attr_dev(div1, "id", "footer");
			attr_dev(div1, "class", "svelte-1entcyp");
			add_location(div1, file$1, 21, 0, 293);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

class Footer extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, null, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Footer",
			options,
			id: create_fragment$1.name
		});
	}
}

/* src\components\Wrapper.svelte generated by Svelte v3.16.7 */

const file$2 = "src\\components\\Wrapper.svelte";

function create_fragment$2(ctx) {
	let div;
	let current;
	const default_slot_template = /*$$slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

	const block = {
		c: function create() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr_dev(div, "class", "wrapper svelte-8ceet4");
			add_location(div, file$2, 21, 0, 303);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => {
		return {};
	};

	$$self.$inject_state = $$props => {
		
	};

	return [$$scope, $$slots];
}

class Wrapper extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Wrapper",
			options,
			id: create_fragment$2.name
		});
	}
}

export { noop as A, globals as B, bubble as C, group_outros as D, check_outros as E, Footer as F, Header as H, SvelteComponentDev as S, Wrapper as W, createEventDispatcher as a, attr_dev as b, create_slot as c, dispatch_dev as d, element as e, add_location as f, insert_dev as g, get_slot_context as h, init as i, get_slot_changes as j, transition_out as k, listen_dev as l, detach_dev as m, create_component as n, onMount as o, prevent_default as p, space as q, append_dev as r, safe_not_equal as s, transition_in as t, mount_component as u, destroy_component as v, binding_callbacks as w, text as x, set_style as y, set_data_dev as z };
//# sourceMappingURL=Wrapper-391a0201.js.map
