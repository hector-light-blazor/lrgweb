
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

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
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
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

    /* src/components/Header.svelte generated by Svelte v3.16.7 */

    const file = "src/components/Header.svelte";

    function create_fragment(ctx) {
    	let head;
    	let meta;
    	let t0;
    	let style;
    	let t2;
    	let body;
    	let div4;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let div1;
    	let button0;
    	let t8;
    	let div0;
    	let a2;
    	let t10;
    	let a3;
    	let t12;
    	let div3;
    	let button1;
    	let t14;
    	let div2;
    	let a4;
    	let t16;
    	let a5;
    	let t18;
    	let a6;
    	let t20;
    	let a7;
    	let t22;
    	let div5;
    	let t23;
    	let div6;

    	const block = {
    		c: function create() {
    			head = element("head");
    			meta = element("meta");
    			t0 = space();
    			style = element("style");
    			style.textContent = "#header{\n        background-color: #d0d3d9;\n        width: 100%;\n        height: 15%;\n           }\n    #sub {\n        background-color: #ffffff;\n        width: 100%;\n        height: 10%;\n           }\n\nbody {\n  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif\n}\n\n.navbar {\n  overflow: hidden;\n  height: 6%;\n  padding-left: 20%;\n  padding-top: 2%;\n  font-weight: 500;\n  padding-bottom: 7px;\n  background-color: #073392 ;\n}\n\n.navbar a {\n  float: left;\n  font-size: 20px;\n  color: white;\n  text-align: center;\n  padding: 14px 16px;\n  text-decoration: none;\n}\n\n.dropdown {\n  float: left;\n  overflow: hidden;\n}\n\n.dropdown .dropbtn {\n  font-size: 20px; \n  border: none;\n  outline: none;\n  color: white;\n  padding: 14px 16px;\n  background-color: inherit;\n  font-family: inherit;\n  margin: 0;\n}\n\n.navbar a:hover, .dropdown:hover .dropbtn {\n  background-color: #4169e1;\n}\n\n.dropdown-content {\n  display: none;\n  position: absolute;\n  background-color: #f9f9f9;\n  min-width: 160px;\n  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);\n  z-index: 1;\n}\n\n.dropdown-content a {\n  float: none;\n  color: black;\n  padding: 12px 16px;\n  text-decoration: none;\n  display: block;\n  text-align: left;\n}\n\n.dropdown-content a:hover {\n  background-color: #ddd;\n}\n\n.dropdown:hover .dropdown-content {\n  display: block;\n}";
    			t2 = space();
    			body = element("body");
    			div4 = element("div");
    			a0 = element("a");
    			a0.textContent = "HOME";
    			t4 = space();
    			a1 = element("a");
    			a1.textContent = "PUBLIC EDUCATION";
    			t6 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "SERVICES";
    			t8 = space();
    			div0 = element("div");
    			a2 = element("a");
    			a2.textContent = "Link 1";
    			t10 = space();
    			a3 = element("a");
    			a3.textContent = "Link 2";
    			t12 = space();
    			div3 = element("div");
    			button1 = element("button");
    			button1.textContent = "TRAININGS";
    			t14 = space();
    			div2 = element("div");
    			a4 = element("a");
    			a4.textContent = "Link 1";
    			t16 = space();
    			a5 = element("a");
    			a5.textContent = "Link 2";
    			t18 = space();
    			a6 = element("a");
    			a6.textContent = "ABOUT US";
    			t20 = space();
    			a7 = element("a");
    			a7.textContent = "CONTACT";
    			t22 = space();
    			div5 = element("div");
    			t23 = space();
    			div6 = element("div");
    			attr_dev(meta, "name", "viewport");
    			attr_dev(meta, "content", "width=device-width, initial-scale=1");
    			add_location(meta, file, 3, 0, 9);
    			add_location(style, file, 10, 1, 85);
    			add_location(head, file, 2, 0, 2);
    			attr_dev(a0, "href", "#Home");
    			add_location(a0, file, 99, 2, 1510);
    			attr_dev(a1, "href", "PubEd");
    			add_location(a1, file, 100, 2, 1537);
    			attr_dev(button0, "class", "dropbtn");
    			add_location(button0, file, 103, 24, 1600);
    			attr_dev(a2, "href", "Serv1");
    			add_location(a2, file, 105, 6, 1682);
    			attr_dev(a3, "href", "Serv2");
    			add_location(a3, file, 106, 6, 1715);
    			attr_dev(div0, "class", "dropdown-content");
    			add_location(div0, file, 104, 2, 1645);
    			attr_dev(div1, "class", "dropdown");
    			add_location(div1, file, 103, 2, 1578);
    			attr_dev(button1, "class", "dropbtn");
    			add_location(button1, file, 109, 26, 1789);
    			attr_dev(a4, "href", "Train1");
    			add_location(a4, file, 111, 6, 1872);
    			attr_dev(a5, "href", "Train2");
    			add_location(a5, file, 112, 6, 1906);
    			attr_dev(div2, "class", "dropdown-content");
    			add_location(div2, file, 110, 2, 1835);
    			attr_dev(div3, "class", "dropdown");
    			add_location(div3, file, 109, 4, 1767);
    			attr_dev(a6, "href", "#AboutUs");
    			add_location(a6, file, 116, 2, 1958);
    			attr_dev(a7, "href", "Contact");
    			add_location(a7, file, 117, 2, 1992);
    			attr_dev(div4, "class", "navbar");
    			add_location(div4, file, 98, 0, 1487);
    			add_location(body, file, 96, 0, 1479);
    			attr_dev(div5, "id", "header");
    			add_location(div5, file, 125, 0, 2042);
    			attr_dev(div6, "id", "sub");
    			add_location(div6, file, 126, 0, 2066);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, meta);
    			append_dev(head, t0);
    			append_dev(head, style);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, div4);
    			append_dev(div4, a0);
    			append_dev(div4, t4);
    			append_dev(div4, a1);
    			append_dev(div4, t6);
    			append_dev(div4, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			append_dev(div0, a2);
    			append_dev(div0, t10);
    			append_dev(div0, a3);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(div3, t14);
    			append_dev(div3, div2);
    			append_dev(div2, a4);
    			append_dev(div2, t16);
    			append_dev(div2, a5);
    			append_dev(div4, t18);
    			append_dev(div4, a6);
    			append_dev(div4, t20);
    			append_dev(div4, a7);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, div5, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div6, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(body);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div6);
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

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.16.7 */

    const file$1 = "src/components/Footer.svelte";

    function create_fragment$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "footer");
    			attr_dev(div, "class", "svelte-5m6u79");
    			add_location(div, file$1, 16, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    /* src/pages/Home.svelte generated by Svelte v3.16.7 */

    const file$2 = "src/pages/Home.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Hello Test Page";
    			add_location(h3, file$2, 1, 4, 10);
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/AboutUs.svelte generated by Svelte v3.16.7 */

    const file$3 = "src/pages/AboutUs.svelte";

    function create_fragment$3(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "About Us";
    			add_location(h2, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class AboutUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutUs",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const CTX_ROUTER = {};

    function navigateTo(path) {
      // If path empty or no string, throws error
      if (!path || typeof path !== 'string') {
        throw Error(`svero expects navigateTo() to have a string parameter. The parameter provided was: ${path} of type ${typeof path} instead.`);
      }

      if (path[0] !== '/' && path[0] !== '#') {
        throw Error(`svero expects navigateTo() param to start with slash or hash, e.g. "/${path}" or "#${path}" instead of "${path}".`);
      }

      // If no History API support, fallbacks to URL redirect
      if (!history.pushState || !window.dispatchEvent) {
        window.location.href = path;
        return;
      }

      // If has History API support, uses it
      history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var index_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, function () {
      var defaultExport = /*@__PURE__*/(function (Error) {
        function defaultExport(route, path) {
          var message = "Unreachable '" + route + "', segment '" + path + "' is not defined";
          Error.call(this, message);
          this.message = message;
        }

        if ( Error ) defaultExport.__proto__ = Error;
        defaultExport.prototype = Object.create( Error && Error.prototype );
        defaultExport.prototype.constructor = defaultExport;

        return defaultExport;
      }(Error));

      function buildMatcher(path, parent) {
        var regex;

        var _isSplat;

        var _priority = -100;

        var keys = [];
        regex = path.replace(/[-$.]/g, '\\$&').replace(/\(/g, '(?:').replace(/\)/g, ')?').replace(/([:*]\w+)(?:<([^<>]+?)>)?/g, function (_, key, expr) {
          keys.push(key.substr(1));

          if (key.charAt() === ':') {
            _priority += 100;
            return ("((?!#)" + (expr || '[^#/]+?') + ")");
          }

          _isSplat = true;
          _priority += 500;
          return ("((?!#)" + (expr || '[^#]+?') + ")");
        });

        try {
          regex = new RegExp(("^" + regex + "$"));
        } catch (e) {
          throw new TypeError(("Invalid route expression, given '" + parent + "'"));
        }

        var _hashed = path.includes('#') ? 0.5 : 1;

        var _depth = path.length * _priority * _hashed;

        return {
          keys: keys,
          regex: regex,
          _depth: _depth,
          _isSplat: _isSplat
        };
      }
      var PathMatcher = function PathMatcher(path, parent) {
        var ref = buildMatcher(path, parent);
        var keys = ref.keys;
        var regex = ref.regex;
        var _depth = ref._depth;
        var _isSplat = ref._isSplat;
        return {
          _isSplat: _isSplat,
          _depth: _depth,
          match: function (value) {
            var matches = value.match(regex);

            if (matches) {
              return keys.reduce(function (prev, cur, i) {
                prev[cur] = typeof matches[i + 1] === 'string' ? decodeURIComponent(matches[i + 1]) : null;
                return prev;
              }, {});
            }
          }
        };
      };

      PathMatcher.push = function push (key, prev, leaf, parent) {
        var root = prev[key] || (prev[key] = {});

        if (!root.pattern) {
          root.pattern = new PathMatcher(key, parent);
          root.route = (leaf || '').replace(/\/$/, '') || '/';
        }

        prev.keys = prev.keys || [];

        if (!prev.keys.includes(key)) {
          prev.keys.push(key);
          PathMatcher.sort(prev);
        }

        return root;
      };

      PathMatcher.sort = function sort (root) {
        root.keys.sort(function (a, b) {
          return root[a].pattern._depth - root[b].pattern._depth;
        });
      };

      function merge(path, parent) {
        return ("" + (parent && parent !== '/' ? parent : '') + (path || ''));
      }
      function walk(path, cb) {
        var matches = path.match(/<[^<>]*\/[^<>]*>/);

        if (matches) {
          throw new TypeError(("RegExp cannot contain slashes, given '" + matches + "'"));
        }

        var parts = path.split(/(?=\/|#)/);
        var root = [];

        if (parts[0] !== '/') {
          parts.unshift('/');
        }

        parts.some(function (x, i) {
          var parent = root.slice(1).concat(x).join('') || null;
          var segment = parts.slice(i + 1).join('') || null;
          var retval = cb(x, parent, segment ? ("" + (x !== '/' ? x : '') + segment) : null);
          root.push(x);
          return retval;
        });
      }
      function reduce(key, root, _seen) {
        var params = {};
        var out = [];
        var splat;
        walk(key, function (x, leaf, extra) {
          var found;

          if (!root.keys) {
            throw new defaultExport(key, x);
          }

          root.keys.some(function (k) {
            if (_seen.includes(k)) { return false; }
            var ref = root[k].pattern;
            var match = ref.match;
            var _isSplat = ref._isSplat;
            var matches = match(_isSplat ? extra || x : x);

            if (matches) {
              Object.assign(params, matches);

              if (root[k].route) {
                var routeInfo = Object.assign({}, root[k].info); // properly handle exact-routes!

                var hasMatch = false;

                if (routeInfo.exact) {
                  hasMatch = extra === null;
                } else {
                  hasMatch = !(x && leaf === null) || x === leaf || _isSplat || !extra;
                }

                routeInfo.matches = hasMatch;
                routeInfo.params = Object.assign({}, params);
                routeInfo.route = root[k].route;
                routeInfo.path = _isSplat && extra || leaf || x;
                out.push(routeInfo);
              }

              if (extra === null && !root[k].keys) {
                return true;
              }

              if (k !== '/') { _seen.push(k); }
              splat = _isSplat;
              root = root[k];
              found = true;
              return true;
            }

            return false;
          });

          if (!(found || root.keys.some(function (k) { return root[k].pattern.match(x); }))) {
            throw new defaultExport(key, x);
          }

          return splat || !found;
        });
        return out;
      }
      function find(path, routes, retries) {
        var get = reduce.bind(null, path, routes);
        var set = [];

        while (retries > 0) {
          retries -= 1;

          try {
            return get(set);
          } catch (e) {
            if (retries > 0) {
              return get(set);
            }

            throw e;
          }
        }
      }
      function add(path, routes, parent, routeInfo) {
        var fullpath = merge(path, parent);
        var root = routes;
        var key;

        if (routeInfo && routeInfo.nested !== true) {
          key = routeInfo.key;
          delete routeInfo.key;
        }

        walk(fullpath, function (x, leaf) {
          root = PathMatcher.push(x, root, leaf, fullpath);

          if (x !== '/') {
            root.info = root.info || Object.assign({}, routeInfo);
          }
        });
        root.info = root.info || Object.assign({}, routeInfo);

        if (key) {
          root.info.key = key;
        }

        return fullpath;
      }
      function rm(path, routes, parent) {
        var fullpath = merge(path, parent);
        var root = routes;
        var leaf = null;
        var key = null;
        walk(fullpath, function (x) {
          if (!root) {
            leaf = null;
            return true;
          }

          if (!root.keys) {
            throw new defaultExport(path, x);
          }

          key = x;
          leaf = root;
          root = root[key];
        });

        if (!(leaf && key)) {
          throw new defaultExport(path, key);
        }

        if (leaf === routes) {
          leaf = routes['/'];
        }

        if (leaf.route !== key) {
          var offset = leaf.keys.indexOf(key);

          if (offset === -1) {
            throw new defaultExport(path, key);
          }

          leaf.keys.splice(offset, 1);
          PathMatcher.sort(leaf);
          delete leaf[key];
        }

        if (root.route === leaf.route) {
          delete leaf.info;
        }
      }

      var Router = function Router() {
        var routes = {};
        var stack = [];
        return {
          resolve: function (path, cb) {
            var url = path.split('?')[0];
            var seen = [];
            walk(url, function (x, leaf, extra) {
              try {
                cb(null, find(leaf, routes, 1).filter(function (r) {
                  if (!seen.includes(r.route)) {
                    seen.push(r.route);
                    return true;
                  }

                  return false;
                }));
              } catch (e) {
                cb(e, []);
              }
            });
          },
          mount: function (path, cb) {
            if (path !== '/') {
              stack.push(path);
            }

            cb();
            stack.pop();
          },
          find: function (path, retries) { return find(path, routes, retries === true ? 2 : retries || 1); },
          add: function (path, routeInfo) { return add(path, routes, stack.join(''), routeInfo); },
          rm: function (path) { return rm(path, routes, stack.join('')); }
        };
      };

      Router.matches = function matches (uri, path) {
        return buildMatcher(uri, path).regex.test(path);
      };

      return Router;

    }));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/lib/Router.svelte generated by Svelte v3.16.7 */

    const { Object: Object_1 } = globals;
    const file$4 = "src/lib/Router.svelte";

    // (139:0) {#if failure && !nofallback}
    function create_if_block(ctx) {
    	let fieldset;
    	let legend;
    	let t0;
    	let t1;
    	let t2;
    	let pre;
    	let t3;

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t0 = text("Router failure: ");
    			t1 = text(/*path*/ ctx[0]);
    			t2 = space();
    			pre = element("pre");
    			t3 = text(/*failure*/ ctx[2]);
    			add_location(legend, file$4, 140, 4, 4283);
    			add_location(pre, file$4, 141, 4, 4327);
    			add_location(fieldset, file$4, 139, 2, 4268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, legend);
    			append_dev(legend, t0);
    			append_dev(legend, t1);
    			append_dev(fieldset, t2);
    			append_dev(fieldset, pre);
    			append_dev(pre, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 1) set_data_dev(t1, /*path*/ ctx[0]);
    			if (dirty & /*failure*/ 4) set_data_dev(t3, /*failure*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(139:0) {#if failure && !nofallback}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t_1;
    	let current;
    	let dispose;
    	let if_block = /*failure*/ ctx[2] && !/*nofallback*/ ctx[1] && create_if_block(ctx);
    	const default_slot_template = /*$$slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t_1 = space();
    			if (default_slot) default_slot.c();
    			dispose = listen_dev(window, "popstate", /*handlePopState*/ ctx[5], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t_1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*failure*/ ctx[2] && !/*nofallback*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t_1.parentNode, t_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 131072) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[17], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[17], dirty, null));
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t_1);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const router = new index_umd();

    function cleanPath(route) {
    	return route.replace(/\?[^#]*/, "").replace(/(?!^)\/#/, "#").replace("/#", "#").replace(/\/$/, "");
    }

    function fixPath(route) {
    	if (route === "/#*" || route === "#*") return "#*_";
    	if (route === "/*" || route === "*") return "/*_";
    	return route;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $routeInfo;
    	let $basePath;
    	let t;
    	let failure;
    	let fallback;
    	let { path = "/" } = $$props;
    	let { nofallback = null } = $$props;
    	const routeInfo = writable({});
    	validate_store(routeInfo, "routeInfo");
    	component_subscribe($$self, routeInfo, value => $$invalidate(8, $routeInfo = value));
    	const routerContext = getContext(CTX_ROUTER);
    	const basePath = routerContext ? routerContext.basePath : writable(path);
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, value => $$invalidate(9, $basePath = value));

    	function handleRoutes(map) {
    		const params = map.reduce(
    			(prev, cur) => {
    				prev[cur.key] = Object.assign(prev[cur.key] || ({}), cur.params);
    				return prev;
    			},
    			{}
    		);

    		let skip;
    		let routes = {};

    		map.some(x => {
    			if (typeof x.condition === "boolean" || typeof x.condition === "function") {
    				const ok = typeof x.condition === "function"
    				? x.condition()
    				: x.condition;

    				if (ok === false && x.redirect) {
    					navigateTo(x.redirect);
    					skip = true;
    					return true;
    				}
    			}

    			if (x.key && !routes[x.key]) {
    				if (x.exact && !x.matches) return false;
    				routes[x.key] = { ...x, params: params[x.key] };
    			}

    			return false;
    		});

    		if (!skip) {
    			set_store_value(routeInfo, $routeInfo = routes);
    		}
    	}

    	function doFallback(e, path) {
    		set_store_value(
    			routeInfo,
    			$routeInfo[fallback] = {
    				failure: e,
    				params: { _: path.substr(1) || undefined }
    			},
    			$routeInfo
    		);
    	}

    	function resolveRoutes(path) {
    		const segments = path.split("#")[0].split("/");
    		const prefix = [];
    		const map = [];

    		segments.forEach(key => {
    			const sub = prefix.concat(`/${key}`).join("");
    			if (key) prefix.push(`/${key}`);

    			try {
    				const next = router.find(sub);
    				handleRoutes(next);
    				map.push(...next);
    			} catch(e_) {
    				doFallback(e_, path);
    			}
    		});

    		return map;
    	}

    	function handlePopState() {
    		let fullpath;

    		if (location.href.includes("file")) {
    			const testpath = cleanPath(`/${location.href.split("index.html").slice(1).join("/").replace(".", "")}`);

    			fullpath = testpath
    			? testpath
    			: cleanPath(`/${location.href.split("/").slice(3).join("/")}`);
    		} else {
    			fullpath = cleanPath(`/${location.href.split("/").slice(3).join("/")}`);
    		}

    		try {
    			const found = resolveRoutes(fullpath);

    			if (fullpath.includes("#")) {
    				const next = router.find(fullpath);
    				const keys = {};

    				handleRoutes(found.concat(next).reduce(
    					(prev, cur) => {
    						if (typeof keys[cur.key] === "undefined") {
    							keys[cur.key] = prev.length;
    						}

    						prev[keys[cur.key]] = cur;
    						return prev;
    					},
    					[]
    				));
    			}
    		} catch(e) {
    			if (!fallback) {
    				$$invalidate(2, failure = e);
    				return;
    			}

    			doFallback(e, fullpath);
    		}
    	}

    	function _handlePopState() {
    		clearTimeout(t);
    		t = setTimeout(handlePopState, 100);
    	}

    	function assignRoute(key, route, detail) {
    		key = key || Math.random().toString(36).substr(2);

    		const fixedRoot = $basePath !== path && $basePath !== "/"
    		? `${$basePath}${path}`
    		: path;

    		const handler = { key, ...detail };
    		let fullpath;

    		router.mount(fixedRoot, () => {
    			fullpath = router.add(fixPath(route), handler);
    			fallback = handler.fallback && key || fallback;
    		});

    		_handlePopState();
    		return [key, fullpath];
    	}

    	function unassignRoute(route) {
    		router.rm(fixPath(route));
    		_handlePopState();
    	}

    	setContext(CTX_ROUTER, {
    		basePath,
    		routeInfo,
    		assignRoute,
    		unassignRoute
    	});

    	const writable_props = ["path", "nofallback"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("nofallback" in $$props) $$invalidate(1, nofallback = $$props.nofallback);
    		if ("$$scope" in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			t,
    			failure,
    			fallback,
    			path,
    			nofallback,
    			$routeInfo,
    			$basePath
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("t" in $$props) t = $$props.t;
    		if ("failure" in $$props) $$invalidate(2, failure = $$props.failure);
    		if ("fallback" in $$props) fallback = $$props.fallback;
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("nofallback" in $$props) $$invalidate(1, nofallback = $$props.nofallback);
    		if ("$routeInfo" in $$props) routeInfo.set($routeInfo = $$props.$routeInfo);
    		if ("$basePath" in $$props) basePath.set($basePath = $$props.$basePath);
    	};

    	return [
    		path,
    		nofallback,
    		failure,
    		routeInfo,
    		basePath,
    		handlePopState,
    		t,
    		fallback,
    		$routeInfo,
    		$basePath,
    		routerContext,
    		handleRoutes,
    		doFallback,
    		resolveRoutes,
    		_handlePopState,
    		assignRoute,
    		unassignRoute,
    		$$scope,
    		$$slots
    	];
    }

    class Router_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$4, safe_not_equal, { path: 0, nofallback: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router_1",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get path() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nofallback() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofallback(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/lib/Route.svelte generated by Svelte v3.16.7 */

    const get_default_slot_changes = dirty => ({
    	router: dirty & /*activeRouter*/ 2,
    	props: dirty & /*activeProps*/ 4
    });

    const get_default_slot_context = ctx => ({
    	router: /*activeRouter*/ ctx[1],
    	props: /*activeProps*/ ctx[2]
    });

    // (41:0) {#if activeRouter}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:0) {#if activeRouter}",
    		ctx
    	});

    	return block;
    }

    // (44:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope, activeRouter, activeProps*/ 65542) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, get_default_slot_changes));
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(44:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#if component}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ router: /*activeRouter*/ ctx[1] }, /*activeProps*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeRouter, activeProps*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*activeRouter*/ 2 && ({ router: /*activeRouter*/ ctx[1] }),
    					dirty & /*activeProps*/ 4 && get_spread_object(/*activeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(42:2) {#if component}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeRouter*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*activeRouter*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getProps(given, required) {
    	const { props, ...others } = given;

    	if (Array.isArray(required)) {
    		required.forEach(k => {
    			delete others[k];
    		});
    	}

    	return { ...props, ...others };
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $routeInfo;
    	let { key = null } = $$props;
    	let { path = "" } = $$props;
    	let { props = null } = $$props;
    	let { exact = undefined } = $$props;
    	let { fallback = undefined } = $$props;
    	let { component = undefined } = $$props;
    	let { condition = undefined } = $$props;
    	let { redirect = undefined } = $$props;
    	const { assignRoute, unassignRoute, routeInfo } = getContext(CTX_ROUTER);
    	validate_store(routeInfo, "routeInfo");
    	component_subscribe($$self, routeInfo, value => $$invalidate(12, $routeInfo = value));
    	let activeRouter = null;
    	let activeProps = {};
    	let fullpath;
    	[key, fullpath] = assignRoute(key, path, { condition, redirect, fallback, exact });

    	onDestroy(() => {
    		unassignRoute(fullpath);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(15, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("key" in $$new_props) $$invalidate(4, key = $$new_props.key);
    		if ("path" in $$new_props) $$invalidate(5, path = $$new_props.path);
    		if ("props" in $$new_props) $$invalidate(6, props = $$new_props.props);
    		if ("exact" in $$new_props) $$invalidate(7, exact = $$new_props.exact);
    		if ("fallback" in $$new_props) $$invalidate(8, fallback = $$new_props.fallback);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("condition" in $$new_props) $$invalidate(9, condition = $$new_props.condition);
    		if ("redirect" in $$new_props) $$invalidate(10, redirect = $$new_props.redirect);
    		if ("$$scope" in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			key,
    			path,
    			props,
    			exact,
    			fallback,
    			component,
    			condition,
    			redirect,
    			activeRouter,
    			activeProps,
    			fullpath,
    			$routeInfo
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(15, $$props = assign(assign({}, $$props), $$new_props));
    		if ("key" in $$props) $$invalidate(4, key = $$new_props.key);
    		if ("path" in $$props) $$invalidate(5, path = $$new_props.path);
    		if ("props" in $$props) $$invalidate(6, props = $$new_props.props);
    		if ("exact" in $$props) $$invalidate(7, exact = $$new_props.exact);
    		if ("fallback" in $$props) $$invalidate(8, fallback = $$new_props.fallback);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("condition" in $$props) $$invalidate(9, condition = $$new_props.condition);
    		if ("redirect" in $$props) $$invalidate(10, redirect = $$new_props.redirect);
    		if ("activeRouter" in $$props) $$invalidate(1, activeRouter = $$new_props.activeRouter);
    		if ("activeProps" in $$props) $$invalidate(2, activeProps = $$new_props.activeProps);
    		if ("fullpath" in $$props) fullpath = $$new_props.fullpath;
    		if ("$routeInfo" in $$props) routeInfo.set($routeInfo = $$new_props.$routeInfo);
    	};

    	$$self.$$.update = () => {
    		 {
    			$$invalidate(1, activeRouter = $routeInfo[key]);
    			$$invalidate(2, activeProps = getProps($$props, arguments[0]["$$"].props));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		activeRouter,
    		activeProps,
    		routeInfo,
    		key,
    		path,
    		props,
    		exact,
    		fallback,
    		condition,
    		redirect,
    		fullpath,
    		$routeInfo,
    		assignRoute,
    		unassignRoute,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$5, safe_not_equal, {
    			key: 4,
    			path: 5,
    			props: 6,
    			exact: 7,
    			fallback: 8,
    			component: 0,
    			condition: 9,
    			redirect: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get key() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redirect() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redirect(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.7 */
    const file$5 = "src/App.svelte";

    // (25:4) <Router>
    function create_default_slot(ctx) {
    	let t;
    	let current;

    	const route0 = new Route({
    			props: { path: "#AboutUs", component: AboutUs },
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: { path: "#Home", component: Home },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(25:4) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current;
    	const header = new Header({ $$inline: true });

    	const router = new Router_1({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(router.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			add_location(div, file$5, 23, 1, 443);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(router);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self) {
    	onMount(() => {
    		let hash = window.location.href;

    		if (hash.indexOf("#") == -1) {
    			navigateTo("#Home");
    		}
    	});

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
        target: document.getElementById("app")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
