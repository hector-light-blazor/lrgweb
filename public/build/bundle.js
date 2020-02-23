
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
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
    	let div4;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let div1;
    	let button0;
    	let t5;
    	let div0;
    	let a2;
    	let t7;
    	let a3;
    	let t9;
    	let div3;
    	let button1;
    	let t11;
    	let div2;
    	let a4;
    	let t13;
    	let a5;
    	let t15;
    	let a6;
    	let t17;
    	let a7;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			a0 = element("a");
    			a0.textContent = "HOME";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "PUBLIC EDUCATION";
    			t3 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "SERVICES";
    			t5 = space();
    			div0 = element("div");
    			a2 = element("a");
    			a2.textContent = "Link 1";
    			t7 = space();
    			a3 = element("a");
    			a3.textContent = "Link 2";
    			t9 = space();
    			div3 = element("div");
    			button1 = element("button");
    			button1.textContent = "TRAININGS";
    			t11 = space();
    			div2 = element("div");
    			a4 = element("a");
    			a4.textContent = "Link 1";
    			t13 = space();
    			a5 = element("a");
    			a5.textContent = "Link 2";
    			t15 = space();
    			a6 = element("a");
    			a6.textContent = "ABOUT US";
    			t17 = space();
    			a7 = element("a");
    			a7.textContent = "CONTACT";
    			attr_dev(a0, "href", "#Home");
    			attr_dev(a0, "class", "svelte-1o8ldzy");
    			add_location(a0, file, 87, 2, 1312);
    			attr_dev(a1, "href", "#PubEd");
    			attr_dev(a1, "class", "svelte-1o8ldzy");
    			add_location(a1, file, 88, 2, 1339);
    			attr_dev(button0, "class", "dropbtn svelte-1o8ldzy");
    			add_location(button0, file, 91, 24, 1403);
    			attr_dev(a2, "href", "Serv1");
    			attr_dev(a2, "class", "svelte-1o8ldzy");
    			add_location(a2, file, 93, 6, 1485);
    			attr_dev(a3, "href", "Serv2");
    			attr_dev(a3, "class", "svelte-1o8ldzy");
    			add_location(a3, file, 94, 6, 1518);
    			attr_dev(div0, "class", "dropdown-content svelte-1o8ldzy");
    			add_location(div0, file, 92, 2, 1448);
    			attr_dev(div1, "class", "dropdown svelte-1o8ldzy");
    			add_location(div1, file, 91, 2, 1381);
    			attr_dev(button1, "class", "dropbtn svelte-1o8ldzy");
    			add_location(button1, file, 97, 26, 1592);
    			attr_dev(a4, "href", "Train1");
    			attr_dev(a4, "class", "svelte-1o8ldzy");
    			add_location(a4, file, 99, 6, 1675);
    			attr_dev(a5, "href", "Train2");
    			attr_dev(a5, "class", "svelte-1o8ldzy");
    			add_location(a5, file, 100, 6, 1709);
    			attr_dev(div2, "class", "dropdown-content svelte-1o8ldzy");
    			add_location(div2, file, 98, 2, 1638);
    			attr_dev(div3, "class", "dropdown svelte-1o8ldzy");
    			add_location(div3, file, 97, 4, 1570);
    			attr_dev(a6, "href", "#AboutUs");
    			attr_dev(a6, "class", "svelte-1o8ldzy");
    			add_location(a6, file, 104, 2, 1761);
    			attr_dev(a7, "href", "Contact");
    			attr_dev(a7, "class", "svelte-1o8ldzy");
    			add_location(a7, file, 105, 2, 1795);
    			attr_dev(div4, "class", "navbar svelte-1o8ldzy");
    			add_location(div4, file, 86, 0, 1289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, a0);
    			append_dev(div4, t1);
    			append_dev(div4, a1);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, a2);
    			append_dev(div0, t7);
    			append_dev(div0, a3);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, a4);
    			append_dev(div2, t13);
    			append_dev(div2, a5);
    			append_dev(div4, t15);
    			append_dev(div4, a6);
    			append_dev(div4, t17);
    			append_dev(div4, a7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", "footer-internal");
    			attr_dev(div0, "class", "svelte-14zl8c7");
    			add_location(div0, file$1, 23, 3, 294);
    			attr_dev(div1, "id", "footer");
    			attr_dev(div1, "class", "svelte-14zl8c7");
    			add_location(div1, file$1, 21, 0, 272);
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
    const file$2 = "src/lib/Router.svelte";

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
    			add_location(legend, file$2, 140, 4, 4283);
    			add_location(pre, file$2, 141, 4, 4327);
    			add_location(fieldset, file$2, 139, 2, 4268);
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

    function create_fragment$2(ctx) {
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
    		id: create_fragment$2.name,
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
    		init(this, options, instance, create_fragment$2, safe_not_equal, { path: 0, nofallback: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router_1",
    			options,
    			id: create_fragment$2.name
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

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
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

    		init(this, options, instance$1, create_fragment$3, safe_not_equal, {
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
    			id: create_fragment$3.name
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

    /* src/lib/Link.svelte generated by Svelte v3.16.7 */
    const file$3 = "src/lib/Link.svelte";

    function create_fragment$4(ctx) {
    	let a;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", /*href*/ ctx[1]);
    			attr_dev(a, "class", /*className*/ ctx[0]);
    			add_location(a, file$3, 24, 0, 677);
    			dispose = listen_dev(a, "click", prevent_default(/*onClick*/ ctx[2]), false, true, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    			}

    			if (!current || dirty & /*href*/ 2) {
    				attr_dev(a, "href", /*href*/ ctx[1]);
    			}

    			if (!current || dirty & /*className*/ 1) {
    				attr_dev(a, "class", /*className*/ ctx[0]);
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
    			if (detaching) detach_dev(a);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { class: cssClass = "" } = $$props;
    	let { href = "/" } = $$props;
    	let { className = "" } = $$props;
    	let { title = "" } = $$props;

    	onMount(() => {
    		$$invalidate(0, className = className || cssClass);
    	});

    	const dispatch = createEventDispatcher();

    	function onClick(e) {
    		let fixedHref = href;

    		if (fixedHref.charAt() !== "/") {
    			fixedHref = window.location.pathname + fixedHref;
    		}

    		navigateTo(fixedHref);
    		dispatch("click", e);
    	}

    	const writable_props = ["class", "href", "className", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("class" in $$props) $$invalidate(3, cssClass = $$props.class);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { cssClass, href, className, title };
    	};

    	$$self.$inject_state = $$props => {
    		if ("cssClass" in $$props) $$invalidate(3, cssClass = $$props.cssClass);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    	};

    	return [className, href, onClick, cssClass, title, dispatch, $$scope, $$slots];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$4, safe_not_equal, {
    			class: 3,
    			href: 1,
    			className: 0,
    			title: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * SSR Window 1.0.1
     * Better handling for window object in SSR environment
     * https://github.com/nolimits4web/ssr-window
     *
     * Copyright 2018, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: July 18, 2018
     */
    var doc = (typeof document === 'undefined') ? {
      body: {},
      addEventListener: function addEventListener() {},
      removeEventListener: function removeEventListener() {},
      activeElement: {
        blur: function blur() {},
        nodeName: '',
      },
      querySelector: function querySelector() {
        return null;
      },
      querySelectorAll: function querySelectorAll() {
        return [];
      },
      getElementById: function getElementById() {
        return null;
      },
      createEvent: function createEvent() {
        return {
          initEvent: function initEvent() {},
        };
      },
      createElement: function createElement() {
        return {
          children: [],
          childNodes: [],
          style: {},
          setAttribute: function setAttribute() {},
          getElementsByTagName: function getElementsByTagName() {
            return [];
          },
        };
      },
      location: { hash: '' },
    } : document; // eslint-disable-line

    var win = (typeof window === 'undefined') ? {
      document: doc,
      navigator: {
        userAgent: '',
      },
      location: {},
      history: {},
      CustomEvent: function CustomEvent() {
        return this;
      },
      addEventListener: function addEventListener() {},
      removeEventListener: function removeEventListener() {},
      getComputedStyle: function getComputedStyle() {
        return {
          getPropertyValue: function getPropertyValue() {
            return '';
          },
        };
      },
      Image: function Image() {},
      Date: function Date() {},
      screen: {},
      setTimeout: function setTimeout() {},
      clearTimeout: function clearTimeout() {},
    } : window; // eslint-disable-line

    /**
     * Dom7 2.1.3
     * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
     * http://framework7.io/docs/dom.html
     *
     * Copyright 2019, Vladimir Kharlampidi
     * The iDangero.us
     * http://www.idangero.us/
     *
     * Licensed under MIT
     *
     * Released on: February 11, 2019
     */

    class Dom7 {
      constructor(arr) {
        const self = this;
        // Create array-like object
        for (let i = 0; i < arr.length; i += 1) {
          self[i] = arr[i];
        }
        self.length = arr.length;
        // Return collection with methods
        return this;
      }
    }

    function $(selector, context) {
      const arr = [];
      let i = 0;
      if (selector && !context) {
        if (selector instanceof Dom7) {
          return selector;
        }
      }
      if (selector) {
          // String
        if (typeof selector === 'string') {
          let els;
          let tempParent;
          const html = selector.trim();
          if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
            let toCreate = 'div';
            if (html.indexOf('<li') === 0) toCreate = 'ul';
            if (html.indexOf('<tr') === 0) toCreate = 'tbody';
            if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
            if (html.indexOf('<tbody') === 0) toCreate = 'table';
            if (html.indexOf('<option') === 0) toCreate = 'select';
            tempParent = doc.createElement(toCreate);
            tempParent.innerHTML = html;
            for (i = 0; i < tempParent.childNodes.length; i += 1) {
              arr.push(tempParent.childNodes[i]);
            }
          } else {
            if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
              // Pure ID selector
              els = [doc.getElementById(selector.trim().split('#')[1])];
            } else {
              // Other selectors
              els = (context || doc).querySelectorAll(selector.trim());
            }
            for (i = 0; i < els.length; i += 1) {
              if (els[i]) arr.push(els[i]);
            }
          }
        } else if (selector.nodeType || selector === win || selector === doc) {
          // Node/element
          arr.push(selector);
        } else if (selector.length > 0 && selector[0].nodeType) {
          // Array of elements or instance of Dom
          for (i = 0; i < selector.length; i += 1) {
            arr.push(selector[i]);
          }
        }
      }
      return new Dom7(arr);
    }

    $.fn = Dom7.prototype;
    $.Class = Dom7;
    $.Dom7 = Dom7;

    function unique(arr) {
      const uniqueArray = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (uniqueArray.indexOf(arr[i]) === -1) uniqueArray.push(arr[i]);
      }
      return uniqueArray;
    }

    // Classes and attributes
    function addClass(className) {
      if (typeof className === 'undefined') {
        return this;
      }
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i += 1) {
        for (let j = 0; j < this.length; j += 1) {
          if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.add(classes[i]);
        }
      }
      return this;
    }
    function removeClass(className) {
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i += 1) {
        for (let j = 0; j < this.length; j += 1) {
          if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.remove(classes[i]);
        }
      }
      return this;
    }
    function hasClass(className) {
      if (!this[0]) return false;
      return this[0].classList.contains(className);
    }
    function toggleClass(className) {
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i += 1) {
        for (let j = 0; j < this.length; j += 1) {
          if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.toggle(classes[i]);
        }
      }
      return this;
    }
    function attr$1(attrs, value) {
      if (arguments.length === 1 && typeof attrs === 'string') {
        // Get attr
        if (this[0]) return this[0].getAttribute(attrs);
        return undefined;
      }

      // Set attrs
      for (let i = 0; i < this.length; i += 1) {
        if (arguments.length === 2) {
          // String
          this[i].setAttribute(attrs, value);
        } else {
          // Object
          // eslint-disable-next-line
          for (const attrName in attrs) {
            this[i][attrName] = attrs[attrName];
            this[i].setAttribute(attrName, attrs[attrName]);
          }
        }
      }
      return this;
    }
    // eslint-disable-next-line
    function removeAttr(attr) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].removeAttribute(attr);
      }
      return this;
    }
    function data(key, value) {
      let el;
      if (typeof value === 'undefined') {
        el = this[0];
        // Get value
        if (el) {
          if (el.dom7ElementDataStorage && (key in el.dom7ElementDataStorage)) {
            return el.dom7ElementDataStorage[key];
          }

          const dataKey = el.getAttribute(`data-${key}`);
          if (dataKey) {
            return dataKey;
          }
          return undefined;
        }
        return undefined;
      }

      // Set value
      for (let i = 0; i < this.length; i += 1) {
        el = this[i];
        if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
        el.dom7ElementDataStorage[key] = value;
      }
      return this;
    }
    // Transforms
    // eslint-disable-next-line
    function transform(transform) {
      for (let i = 0; i < this.length; i += 1) {
        const elStyle = this[i].style;
        elStyle.webkitTransform = transform;
        elStyle.transform = transform;
      }
      return this;
    }
    function transition(duration) {
      if (typeof duration !== 'string') {
        duration = `${duration}ms`; // eslint-disable-line
      }
      for (let i = 0; i < this.length; i += 1) {
        const elStyle = this[i].style;
        elStyle.webkitTransitionDuration = duration;
        elStyle.transitionDuration = duration;
      }
      return this;
    }
    // Events
    function on(...args) {
      let [eventType, targetSelector, listener, capture] = args;
      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }
      if (!capture) capture = false;

      function handleLiveEvent(e) {
        const target = e.target;
        if (!target) return;
        const eventData = e.target.dom7EventData || [];
        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }
        if ($(target).is(targetSelector)) listener.apply(target, eventData);
        else {
          const parents = $(target).parents(); // eslint-disable-line
          for (let k = 0; k < parents.length; k += 1) {
            if ($(parents[k]).is(targetSelector)) listener.apply(parents[k], eventData);
          }
        }
      }
      function handleEvent(e) {
        const eventData = e && e.target ? e.target.dom7EventData || [] : [];
        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }
        listener.apply(this, eventData);
      }
      const events = eventType.split(' ');
      let j;
      for (let i = 0; i < this.length; i += 1) {
        const el = this[i];
        if (!targetSelector) {
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7Listeners) el.dom7Listeners = {};
            if (!el.dom7Listeners[event]) el.dom7Listeners[event] = [];
            el.dom7Listeners[event].push({
              listener,
              proxyListener: handleEvent,
            });
            el.addEventListener(event, handleEvent, capture);
          }
        } else {
          // Live events
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7LiveListeners) el.dom7LiveListeners = {};
            if (!el.dom7LiveListeners[event]) el.dom7LiveListeners[event] = [];
            el.dom7LiveListeners[event].push({
              listener,
              proxyListener: handleLiveEvent,
            });
            el.addEventListener(event, handleLiveEvent, capture);
          }
        }
      }
      return this;
    }
    function off(...args) {
      let [eventType, targetSelector, listener, capture] = args;
      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }
      if (!capture) capture = false;

      const events = eventType.split(' ');
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];
          let handlers;
          if (!targetSelector && el.dom7Listeners) {
            handlers = el.dom7Listeners[event];
          } else if (targetSelector && el.dom7LiveListeners) {
            handlers = el.dom7LiveListeners[event];
          }
          if (handlers && handlers.length) {
            for (let k = handlers.length - 1; k >= 0; k -= 1) {
              const handler = handlers[k];
              if (listener && handler.listener === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (listener && handler.listener && handler.listener.dom7proxy && handler.listener.dom7proxy === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (!listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              }
            }
          }
        }
      }
      return this;
    }
    function trigger(...args) {
      const events = args[0].split(' ');
      const eventData = args[1];
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];
          let evt;
          try {
            evt = new win.CustomEvent(event, {
              detail: eventData,
              bubbles: true,
              cancelable: true,
            });
          } catch (e) {
            evt = doc.createEvent('Event');
            evt.initEvent(event, true, true);
            evt.detail = eventData;
          }
          // eslint-disable-next-line
          el.dom7EventData = args.filter((data, dataIndex) => dataIndex > 0);
          el.dispatchEvent(evt);
          el.dom7EventData = [];
          delete el.dom7EventData;
        }
      }
      return this;
    }
    function transitionEnd(callback) {
      const events = ['webkitTransitionEnd', 'transitionend'];
      const dom = this;
      let i;
      function fireCallBack(e) {
        /* jshint validthis:true */
        if (e.target !== this) return;
        callback.call(this, e);
        for (i = 0; i < events.length; i += 1) {
          dom.off(events[i], fireCallBack);
        }
      }
      if (callback) {
        for (i = 0; i < events.length; i += 1) {
          dom.on(events[i], fireCallBack);
        }
      }
      return this;
    }
    function outerWidth(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          // eslint-disable-next-line
          const styles = this.styles();
          return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
        }
        return this[0].offsetWidth;
      }
      return null;
    }
    function outerHeight(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          // eslint-disable-next-line
          const styles = this.styles();
          return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
        }
        return this[0].offsetHeight;
      }
      return null;
    }
    function offset() {
      if (this.length > 0) {
        const el = this[0];
        const box = el.getBoundingClientRect();
        const body = doc.body;
        const clientTop = el.clientTop || body.clientTop || 0;
        const clientLeft = el.clientLeft || body.clientLeft || 0;
        const scrollTop = el === win ? win.scrollY : el.scrollTop;
        const scrollLeft = el === win ? win.scrollX : el.scrollLeft;
        return {
          top: (box.top + scrollTop) - clientTop,
          left: (box.left + scrollLeft) - clientLeft,
        };
      }

      return null;
    }
    function styles() {
      if (this[0]) return win.getComputedStyle(this[0], null);
      return {};
    }
    function css(props, value) {
      let i;
      if (arguments.length === 1) {
        if (typeof props === 'string') {
          if (this[0]) return win.getComputedStyle(this[0], null).getPropertyValue(props);
        } else {
          for (i = 0; i < this.length; i += 1) {
            // eslint-disable-next-line
            for (let prop in props) {
              this[i].style[prop] = props[prop];
            }
          }
          return this;
        }
      }
      if (arguments.length === 2 && typeof props === 'string') {
        for (i = 0; i < this.length; i += 1) {
          this[i].style[props] = value;
        }
        return this;
      }
      return this;
    }
    // Iterate over the collection passing elements to `callback`
    function each(callback) {
      // Don't bother continuing without a callback
      if (!callback) return this;
      // Iterate over the current collection
      for (let i = 0; i < this.length; i += 1) {
        // If the callback returns false
        if (callback.call(this[i], i, this[i]) === false) {
          // End the loop early
          return this;
        }
      }
      // Return `this` to allow chained DOM operations
      return this;
    }
    function filter(callback) {
      const matchedItems = [];
      const dom = this;
      for (let i = 0; i < dom.length; i += 1) {
        if (callback.call(dom[i], i, dom[i])) matchedItems.push(dom[i]);
      }
      return new Dom7(matchedItems);
    }
    // eslint-disable-next-line
    function html(html) {
      if (typeof html === 'undefined') {
        return this[0] ? this[0].innerHTML : undefined;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].innerHTML = html;
      }
      return this;
    }
    // eslint-disable-next-line
    function text$1(text) {
      if (typeof text === 'undefined') {
        if (this[0]) {
          return this[0].textContent.trim();
        }
        return null;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].textContent = text;
      }
      return this;
    }
    function is(selector) {
      const el = this[0];
      let compareWith;
      let i;
      if (!el || typeof selector === 'undefined') return false;
      if (typeof selector === 'string') {
        if (el.matches) return el.matches(selector);
        else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
        else if (el.msMatchesSelector) return el.msMatchesSelector(selector);

        compareWith = $(selector);
        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }
        return false;
      } else if (selector === doc) return el === doc;
      else if (selector === win) return el === win;

      if (selector.nodeType || selector instanceof Dom7) {
        compareWith = selector.nodeType ? [selector] : selector;
        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }
        return false;
      }
      return false;
    }
    function index() {
      let child = this[0];
      let i;
      if (child) {
        i = 0;
        // eslint-disable-next-line
        while ((child = child.previousSibling) !== null) {
          if (child.nodeType === 1) i += 1;
        }
        return i;
      }
      return undefined;
    }
    // eslint-disable-next-line
    function eq(index) {
      if (typeof index === 'undefined') return this;
      const length = this.length;
      let returnIndex;
      if (index > length - 1) {
        return new Dom7([]);
      }
      if (index < 0) {
        returnIndex = length + index;
        if (returnIndex < 0) return new Dom7([]);
        return new Dom7([this[returnIndex]]);
      }
      return new Dom7([this[index]]);
    }
    function append$1(...args) {
      let newChild;

      for (let k = 0; k < args.length; k += 1) {
        newChild = args[k];
        for (let i = 0; i < this.length; i += 1) {
          if (typeof newChild === 'string') {
            const tempDiv = doc.createElement('div');
            tempDiv.innerHTML = newChild;
            while (tempDiv.firstChild) {
              this[i].appendChild(tempDiv.firstChild);
            }
          } else if (newChild instanceof Dom7) {
            for (let j = 0; j < newChild.length; j += 1) {
              this[i].appendChild(newChild[j]);
            }
          } else {
            this[i].appendChild(newChild);
          }
        }
      }

      return this;
    }
    function prepend(newChild) {
      let i;
      let j;
      for (i = 0; i < this.length; i += 1) {
        if (typeof newChild === 'string') {
          const tempDiv = doc.createElement('div');
          tempDiv.innerHTML = newChild;
          for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
          }
        } else if (newChild instanceof Dom7) {
          for (j = 0; j < newChild.length; j += 1) {
            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
          }
        } else {
          this[i].insertBefore(newChild, this[i].childNodes[0]);
        }
      }
      return this;
    }
    function next(selector) {
      if (this.length > 0) {
        if (selector) {
          if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
            return new Dom7([this[0].nextElementSibling]);
          }
          return new Dom7([]);
        }

        if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
        return new Dom7([]);
      }
      return new Dom7([]);
    }
    function nextAll(selector) {
      const nextEls = [];
      let el = this[0];
      if (!el) return new Dom7([]);
      while (el.nextElementSibling) {
        const next = el.nextElementSibling; // eslint-disable-line
        if (selector) {
          if ($(next).is(selector)) nextEls.push(next);
        } else nextEls.push(next);
        el = next;
      }
      return new Dom7(nextEls);
    }
    function prev(selector) {
      if (this.length > 0) {
        const el = this[0];
        if (selector) {
          if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
            return new Dom7([el.previousElementSibling]);
          }
          return new Dom7([]);
        }

        if (el.previousElementSibling) return new Dom7([el.previousElementSibling]);
        return new Dom7([]);
      }
      return new Dom7([]);
    }
    function prevAll(selector) {
      const prevEls = [];
      let el = this[0];
      if (!el) return new Dom7([]);
      while (el.previousElementSibling) {
        const prev = el.previousElementSibling; // eslint-disable-line
        if (selector) {
          if ($(prev).is(selector)) prevEls.push(prev);
        } else prevEls.push(prev);
        el = prev;
      }
      return new Dom7(prevEls);
    }
    function parent(selector) {
      const parents = []; // eslint-disable-line
      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode !== null) {
          if (selector) {
            if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
          } else {
            parents.push(this[i].parentNode);
          }
        }
      }
      return $(unique(parents));
    }
    function parents(selector) {
      const parents = []; // eslint-disable-line
      for (let i = 0; i < this.length; i += 1) {
        let parent = this[i].parentNode; // eslint-disable-line
        while (parent) {
          if (selector) {
            if ($(parent).is(selector)) parents.push(parent);
          } else {
            parents.push(parent);
          }
          parent = parent.parentNode;
        }
      }
      return $(unique(parents));
    }
    function closest(selector) {
      let closest = this; // eslint-disable-line
      if (typeof selector === 'undefined') {
        return new Dom7([]);
      }
      if (!closest.is(selector)) {
        closest = closest.parents(selector).eq(0);
      }
      return closest;
    }
    function find(selector) {
      const foundElements = [];
      for (let i = 0; i < this.length; i += 1) {
        const found = this[i].querySelectorAll(selector);
        for (let j = 0; j < found.length; j += 1) {
          foundElements.push(found[j]);
        }
      }
      return new Dom7(foundElements);
    }
    function children$1(selector) {
      const children = []; // eslint-disable-line
      for (let i = 0; i < this.length; i += 1) {
        const childNodes = this[i].childNodes;

        for (let j = 0; j < childNodes.length; j += 1) {
          if (!selector) {
            if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
          } else if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) {
            children.push(childNodes[j]);
          }
        }
      }
      return new Dom7(unique(children));
    }
    function remove() {
      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
      }
      return this;
    }
    function add(...args) {
      const dom = this;
      let i;
      let j;
      for (i = 0; i < args.length; i += 1) {
        const toAdd = $(args[i]);
        for (j = 0; j < toAdd.length; j += 1) {
          dom[dom.length] = toAdd[j];
          dom.length += 1;
        }
      }
      return dom;
    }

    /**
     * Swiper 5.3.1
     * Most modern mobile touch slider and framework with hardware accelerated transitions
     * http://swiperjs.com
     *
     * Copyright 2014-2020 Vladimir Kharlampidi
     *
     * Released under the MIT License
     *
     * Released on: February 8, 2020
     */

    const Methods = {
      addClass,
      removeClass,
      hasClass,
      toggleClass,
      attr: attr$1,
      removeAttr,
      data,
      transform,
      transition: transition,
      on,
      off,
      trigger,
      transitionEnd: transitionEnd,
      outerWidth,
      outerHeight,
      offset,
      css,
      each,
      html,
      text: text$1,
      is,
      index,
      eq,
      append: append$1,
      prepend,
      next,
      nextAll,
      prev,
      prevAll,
      parent,
      parents,
      closest,
      find,
      children: children$1,
      filter,
      remove,
      add,
      styles,
    };

    Object.keys(Methods).forEach((methodName) => {
      $.fn[methodName] = $.fn[methodName] || Methods[methodName];
    });

    const Utils = {
      deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach((key) => {
          try {
            object[key] = null;
          } catch (e) {
            // no getter for object
          }
          try {
            delete object[key];
          } catch (e) {
            // something got wrong
          }
        });
      },
      nextTick(callback, delay = 0) {
        return setTimeout(callback, delay);
      },
      now() {
        return Date.now();
      },
      getTranslate(el, axis = 'x') {
        let matrix;
        let curTransform;
        let transformMatrix;

        const curStyle = win.getComputedStyle(el, null);

        if (win.WebKitCSSMatrix) {
          curTransform = curStyle.transform || curStyle.webkitTransform;
          if (curTransform.split(',').length > 6) {
            curTransform = curTransform.split(', ').map((a) => a.replace(',', '.')).join(', ');
          }
          // Some old versions of Webkit choke when 'none' is passed; pass
          // empty string instead in this case
          transformMatrix = new win.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
        } else {
          transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
          matrix = transformMatrix.toString().split(',');
        }

        if (axis === 'x') {
          // Latest Chrome and webkits Fix
          if (win.WebKitCSSMatrix) curTransform = transformMatrix.m41;
          // Crazy IE10 Matrix
          else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
          // Normal Browsers
          else curTransform = parseFloat(matrix[4]);
        }
        if (axis === 'y') {
          // Latest Chrome and webkits Fix
          if (win.WebKitCSSMatrix) curTransform = transformMatrix.m42;
          // Crazy IE10 Matrix
          else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
          // Normal Browsers
          else curTransform = parseFloat(matrix[5]);
        }
        return curTransform || 0;
      },
      parseUrlQuery(url) {
        const query = {};
        let urlToParse = url || win.location.href;
        let i;
        let params;
        let param;
        let length;
        if (typeof urlToParse === 'string' && urlToParse.length) {
          urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
          params = urlToParse.split('&').filter((paramsPart) => paramsPart !== '');
          length = params.length;

          for (i = 0; i < length; i += 1) {
            param = params[i].replace(/#\S+/g, '').split('=');
            query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param[1]) || '';
          }
        }
        return query;
      },
      isObject(o) {
        return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
      },
      extend(...args) {
        const to = Object(args[0]);
        for (let i = 1; i < args.length; i += 1) {
          const nextSource = args[i];
          if (nextSource !== undefined && nextSource !== null) {
            const keysArray = Object.keys(Object(nextSource));
            for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
              const nextKey = keysArray[nextIndex];
              const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
              if (desc !== undefined && desc.enumerable) {
                if (Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                  Utils.extend(to[nextKey], nextSource[nextKey]);
                } else if (!Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                  to[nextKey] = {};
                  Utils.extend(to[nextKey], nextSource[nextKey]);
                } else {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }
        }
        return to;
      },
    };

    const Support = (function Support() {
      return {
        touch: (win.Modernizr && win.Modernizr.touch === true) || (function checkTouch() {
          return !!((win.navigator.maxTouchPoints > 0) || ('ontouchstart' in win) || (win.DocumentTouch && doc instanceof win.DocumentTouch));
        }()),

        pointerEvents: !!win.PointerEvent && ('maxTouchPoints' in win.navigator) && win.navigator.maxTouchPoints > 0,

        observer: (function checkObserver() {
          return ('MutationObserver' in win || 'WebkitMutationObserver' in win);
        }()),

        passiveListener: (function checkPassiveListener() {
          let supportsPassive = false;
          try {
            const opts = Object.defineProperty({}, 'passive', {
              // eslint-disable-next-line
              get() {
                supportsPassive = true;
              },
            });
            win.addEventListener('testPassiveListener', null, opts);
          } catch (e) {
            // No support
          }
          return supportsPassive;
        }()),

        gestures: (function checkGestures() {
          return 'ongesturestart' in win;
        }()),
      };
    }());

    class SwiperClass {
      constructor(params = {}) {
        const self = this;
        self.params = params;

        // Events
        self.eventsListeners = {};

        if (self.params && self.params.on) {
          Object.keys(self.params.on).forEach((eventName) => {
            self.on(eventName, self.params.on[eventName]);
          });
        }
      }

      on(events, handler, priority) {
        const self = this;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';
        events.split(' ').forEach((event) => {
          if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
          self.eventsListeners[event][method](handler);
        });
        return self;
      }

      once(events, handler, priority) {
        const self = this;
        if (typeof handler !== 'function') return self;
        function onceHandler(...args) {
          self.off(events, onceHandler);
          if (onceHandler.f7proxy) {
            delete onceHandler.f7proxy;
          }
          handler.apply(self, args);
        }
        onceHandler.f7proxy = handler;
        return self.on(events, onceHandler, priority);
      }

      off(events, handler) {
        const self = this;
        if (!self.eventsListeners) return self;
        events.split(' ').forEach((event) => {
          if (typeof handler === 'undefined') {
            self.eventsListeners[event] = [];
          } else if (self.eventsListeners[event] && self.eventsListeners[event].length) {
            self.eventsListeners[event].forEach((eventHandler, index) => {
              if (eventHandler === handler || (eventHandler.f7proxy && eventHandler.f7proxy === handler)) {
                self.eventsListeners[event].splice(index, 1);
              }
            });
          }
        });
        return self;
      }

      emit(...args) {
        const self = this;
        if (!self.eventsListeners) return self;
        let events;
        let data;
        let context;
        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
          events = args[0];
          data = args.slice(1, args.length);
          context = self;
        } else {
          events = args[0].events;
          data = args[0].data;
          context = args[0].context || self;
        }
        const eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach((event) => {
          if (self.eventsListeners && self.eventsListeners[event]) {
            const handlers = [];
            self.eventsListeners[event].forEach((eventHandler) => {
              handlers.push(eventHandler);
            });
            handlers.forEach((eventHandler) => {
              eventHandler.apply(context, data);
            });
          }
        });
        return self;
      }

      useModulesParams(instanceParams) {
        const instance = this;
        if (!instance.modules) return;
        Object.keys(instance.modules).forEach((moduleName) => {
          const module = instance.modules[moduleName];
          // Extend params
          if (module.params) {
            Utils.extend(instanceParams, module.params);
          }
        });
      }

      useModules(modulesParams = {}) {
        const instance = this;
        if (!instance.modules) return;
        Object.keys(instance.modules).forEach((moduleName) => {
          const module = instance.modules[moduleName];
          const moduleParams = modulesParams[moduleName] || {};
          // Extend instance methods and props
          if (module.instance) {
            Object.keys(module.instance).forEach((modulePropName) => {
              const moduleProp = module.instance[modulePropName];
              if (typeof moduleProp === 'function') {
                instance[modulePropName] = moduleProp.bind(instance);
              } else {
                instance[modulePropName] = moduleProp;
              }
            });
          }
          // Add event listeners
          if (module.on && instance.on) {
            Object.keys(module.on).forEach((moduleEventName) => {
              instance.on(moduleEventName, module.on[moduleEventName]);
            });
          }

          // Module create callback
          if (module.create) {
            module.create.bind(instance)(moduleParams);
          }
        });
      }

      static set components(components) {
        const Class = this;
        if (!Class.use) return;
        Class.use(components);
      }

      static installModule(module, ...params) {
        const Class = this;
        if (!Class.prototype.modules) Class.prototype.modules = {};
        const name = module.name || (`${Object.keys(Class.prototype.modules).length}_${Utils.now()}`);
        Class.prototype.modules[name] = module;
        // Prototype
        if (module.proto) {
          Object.keys(module.proto).forEach((key) => {
            Class.prototype[key] = module.proto[key];
          });
        }
        // Class
        if (module.static) {
          Object.keys(module.static).forEach((key) => {
            Class[key] = module.static[key];
          });
        }
        // Callback
        if (module.install) {
          module.install.apply(Class, params);
        }
        return Class;
      }

      static use(module, ...params) {
        const Class = this;
        if (Array.isArray(module)) {
          module.forEach((m) => Class.installModule(m));
          return Class;
        }
        return Class.installModule(module, ...params);
      }
    }

    function updateSize () {
      const swiper = this;
      let width;
      let height;
      const $el = swiper.$el;
      if (typeof swiper.params.width !== 'undefined') {
        width = swiper.params.width;
      } else {
        width = $el[0].clientWidth;
      }
      if (typeof swiper.params.height !== 'undefined') {
        height = swiper.params.height;
      } else {
        height = $el[0].clientHeight;
      }
      if ((width === 0 && swiper.isHorizontal()) || (height === 0 && swiper.isVertical())) {
        return;
      }

      // Subtract paddings
      width = width - parseInt($el.css('padding-left'), 10) - parseInt($el.css('padding-right'), 10);
      height = height - parseInt($el.css('padding-top'), 10) - parseInt($el.css('padding-bottom'), 10);

      Utils.extend(swiper, {
        width,
        height,
        size: swiper.isHorizontal() ? width : height,
      });
    }

    function updateSlides () {
      const swiper = this;
      const params = swiper.params;

      const {
        $wrapperEl, size: swiperSize, rtlTranslate: rtl, wrongRTL,
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
      const slides = $wrapperEl.children(`.${swiper.params.slideClass}`);
      const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
      let snapGrid = [];
      const slidesGrid = [];
      const slidesSizesGrid = [];

      function slidesForMargin(slideIndex) {
        if (!params.cssMode) return true;
        if (slideIndex === slides.length - 1) {
          return false;
        }
        return true;
      }

      let offsetBefore = params.slidesOffsetBefore;
      if (typeof offsetBefore === 'function') {
        offsetBefore = params.slidesOffsetBefore.call(swiper);
      }

      let offsetAfter = params.slidesOffsetAfter;
      if (typeof offsetAfter === 'function') {
        offsetAfter = params.slidesOffsetAfter.call(swiper);
      }

      const previousSnapGridLength = swiper.snapGrid.length;
      const previousSlidesGridLength = swiper.snapGrid.length;

      let spaceBetween = params.spaceBetween;
      let slidePosition = -offsetBefore;
      let prevSlideSize = 0;
      let index = 0;
      if (typeof swiperSize === 'undefined') {
        return;
      }
      if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiperSize;
      }

      swiper.virtualSize = -spaceBetween;

      // reset margins
      if (rtl) slides.css({ marginLeft: '', marginTop: '' });
      else slides.css({ marginRight: '', marginBottom: '' });

      let slidesNumberEvenToRows;
      if (params.slidesPerColumn > 1) {
        if (Math.floor(slidesLength / params.slidesPerColumn) === slidesLength / swiper.params.slidesPerColumn) {
          slidesNumberEvenToRows = slidesLength;
        } else {
          slidesNumberEvenToRows = Math.ceil(slidesLength / params.slidesPerColumn) * params.slidesPerColumn;
        }
        if (params.slidesPerView !== 'auto' && params.slidesPerColumnFill === 'row') {
          slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, params.slidesPerView * params.slidesPerColumn);
        }
      }

      // Calc slides
      let slideSize;
      const slidesPerColumn = params.slidesPerColumn;
      const slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
      const numFullColumns = Math.floor(slidesLength / params.slidesPerColumn);
      for (let i = 0; i < slidesLength; i += 1) {
        slideSize = 0;
        const slide = slides.eq(i);
        if (params.slidesPerColumn > 1) {
          // Set slides order
          let newSlideOrderIndex;
          let column;
          let row;
          if (params.slidesPerColumnFill === 'row' && params.slidesPerGroup > 1) {
            const groupIndex = Math.floor(i / (params.slidesPerGroup * params.slidesPerColumn));
            const slideIndexInGroup = i - params.slidesPerColumn * params.slidesPerGroup * groupIndex;
            const columnsInGroup = groupIndex === 0
              ? params.slidesPerGroup
              : Math.min(Math.ceil((slidesLength - groupIndex * slidesPerColumn * params.slidesPerGroup) / slidesPerColumn), params.slidesPerGroup);
            row = Math.floor(slideIndexInGroup / columnsInGroup);
            column = (slideIndexInGroup - row * columnsInGroup) + groupIndex * params.slidesPerGroup;

            newSlideOrderIndex = column + ((row * slidesNumberEvenToRows) / slidesPerColumn);
            slide
              .css({
                '-webkit-box-ordinal-group': newSlideOrderIndex,
                '-moz-box-ordinal-group': newSlideOrderIndex,
                '-ms-flex-order': newSlideOrderIndex,
                '-webkit-order': newSlideOrderIndex,
                order: newSlideOrderIndex,
              });
          } else if (params.slidesPerColumnFill === 'column') {
            column = Math.floor(i / slidesPerColumn);
            row = i - (column * slidesPerColumn);
            if (column > numFullColumns || (column === numFullColumns && row === slidesPerColumn - 1)) {
              row += 1;
              if (row >= slidesPerColumn) {
                row = 0;
                column += 1;
              }
            }
          } else {
            row = Math.floor(i / slidesPerRow);
            column = i - (row * slidesPerRow);
          }
          slide.css(
            `margin-${swiper.isHorizontal() ? 'top' : 'left'}`,
            (row !== 0 && params.spaceBetween) && (`${params.spaceBetween}px`)
          );
        }
        if (slide.css('display') === 'none') continue; // eslint-disable-line

        if (params.slidesPerView === 'auto') {
          const slideStyles = win.getComputedStyle(slide[0], null);
          const currentTransform = slide[0].style.transform;
          const currentWebKitTransform = slide[0].style.webkitTransform;
          if (currentTransform) {
            slide[0].style.transform = 'none';
          }
          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = 'none';
          }
          if (params.roundLengths) {
            slideSize = swiper.isHorizontal()
              ? slide.outerWidth(true)
              : slide.outerHeight(true);
          } else {
            // eslint-disable-next-line
            if (swiper.isHorizontal()) {
              const width = parseFloat(slideStyles.getPropertyValue('width'));
              const paddingLeft = parseFloat(slideStyles.getPropertyValue('padding-left'));
              const paddingRight = parseFloat(slideStyles.getPropertyValue('padding-right'));
              const marginLeft = parseFloat(slideStyles.getPropertyValue('margin-left'));
              const marginRight = parseFloat(slideStyles.getPropertyValue('margin-right'));
              const boxSizing = slideStyles.getPropertyValue('box-sizing');
              if (boxSizing && boxSizing === 'border-box') {
                slideSize = width + marginLeft + marginRight;
              } else {
                slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight;
              }
            } else {
              const height = parseFloat(slideStyles.getPropertyValue('height'));
              const paddingTop = parseFloat(slideStyles.getPropertyValue('padding-top'));
              const paddingBottom = parseFloat(slideStyles.getPropertyValue('padding-bottom'));
              const marginTop = parseFloat(slideStyles.getPropertyValue('margin-top'));
              const marginBottom = parseFloat(slideStyles.getPropertyValue('margin-bottom'));
              const boxSizing = slideStyles.getPropertyValue('box-sizing');
              if (boxSizing && boxSizing === 'border-box') {
                slideSize = height + marginTop + marginBottom;
              } else {
                slideSize = height + paddingTop + paddingBottom + marginTop + marginBottom;
              }
            }
          }
          if (currentTransform) {
            slide[0].style.transform = currentTransform;
          }
          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = currentWebKitTransform;
          }
          if (params.roundLengths) slideSize = Math.floor(slideSize);
        } else {
          slideSize = (swiperSize - ((params.slidesPerView - 1) * spaceBetween)) / params.slidesPerView;
          if (params.roundLengths) slideSize = Math.floor(slideSize);

          if (slides[i]) {
            if (swiper.isHorizontal()) {
              slides[i].style.width = `${slideSize}px`;
            } else {
              slides[i].style.height = `${slideSize}px`;
            }
          }
        }
        if (slides[i]) {
          slides[i].swiperSlideSize = slideSize;
        }
        slidesSizesGrid.push(slideSize);


        if (params.centeredSlides) {
          slidePosition = slidePosition + (slideSize / 2) + (prevSlideSize / 2) + spaceBetween;
          if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - (swiperSize / 2) - spaceBetween;
          if (i === 0) slidePosition = slidePosition - (swiperSize / 2) - spaceBetween;
          if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index) % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
        } else {
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
          slidePosition = slidePosition + slideSize + spaceBetween;
        }

        swiper.virtualSize += slideSize + spaceBetween;

        prevSlideSize = slideSize;

        index += 1;
      }
      swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
      let newSlidesGrid;

      if (
        rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
        $wrapperEl.css({ width: `${swiper.virtualSize + params.spaceBetween}px` });
      }
      if (params.setWrapperSize) {
        if (swiper.isHorizontal()) $wrapperEl.css({ width: `${swiper.virtualSize + params.spaceBetween}px` });
        else $wrapperEl.css({ height: `${swiper.virtualSize + params.spaceBetween}px` });
      }

      if (params.slidesPerColumn > 1) {
        swiper.virtualSize = (slideSize + params.spaceBetween) * slidesNumberEvenToRows;
        swiper.virtualSize = Math.ceil(swiper.virtualSize / params.slidesPerColumn) - params.spaceBetween;
        if (swiper.isHorizontal()) $wrapperEl.css({ width: `${swiper.virtualSize + params.spaceBetween}px` });
        else $wrapperEl.css({ height: `${swiper.virtualSize + params.spaceBetween}px` });
        if (params.centeredSlides) {
          newSlidesGrid = [];
          for (let i = 0; i < snapGrid.length; i += 1) {
            let slidesGridItem = snapGrid[i];
            if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
            if (snapGrid[i] < swiper.virtualSize + snapGrid[0]) newSlidesGrid.push(slidesGridItem);
          }
          snapGrid = newSlidesGrid;
        }
      }

      // Remove last grid elements depending on width
      if (!params.centeredSlides) {
        newSlidesGrid = [];
        for (let i = 0; i < snapGrid.length; i += 1) {
          let slidesGridItem = snapGrid[i];
          if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
          if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
            newSlidesGrid.push(slidesGridItem);
          }
        }
        snapGrid = newSlidesGrid;
        if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
          snapGrid.push(swiper.virtualSize - swiperSize);
        }
      }
      if (snapGrid.length === 0) snapGrid = [0];

      if (params.spaceBetween !== 0) {
        if (swiper.isHorizontal()) {
          if (rtl) slides.filter(slidesForMargin).css({ marginLeft: `${spaceBetween}px` });
          else slides.filter(slidesForMargin).css({ marginRight: `${spaceBetween}px` });
        } else slides.filter(slidesForMargin).css({ marginBottom: `${spaceBetween}px` });
      }

      if (params.centeredSlides && params.centeredSlidesBounds) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach((slideSizeValue) => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;
        const maxSnap = allSlidesSize - swiperSize;
        snapGrid = snapGrid.map((snap) => {
          if (snap < 0) return -offsetBefore;
          if (snap > maxSnap) return maxSnap + offsetAfter;
          return snap;
        });
      }

      if (params.centerInsufficientSlides) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach((slideSizeValue) => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;
        if (allSlidesSize < swiperSize) {
          const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
          snapGrid.forEach((snap, snapIndex) => {
            snapGrid[snapIndex] = snap - allSlidesOffset;
          });
          slidesGrid.forEach((snap, snapIndex) => {
            slidesGrid[snapIndex] = snap + allSlidesOffset;
          });
        }
      }

      Utils.extend(swiper, {
        slides,
        snapGrid,
        slidesGrid,
        slidesSizesGrid,
      });

      if (slidesLength !== previousSlidesLength) {
        swiper.emit('slidesLengthChange');
      }
      if (snapGrid.length !== previousSnapGridLength) {
        if (swiper.params.watchOverflow) swiper.checkOverflow();
        swiper.emit('snapGridLengthChange');
      }
      if (slidesGrid.length !== previousSlidesGridLength) {
        swiper.emit('slidesGridLengthChange');
      }

      if (params.watchSlidesProgress || params.watchSlidesVisibility) {
        swiper.updateSlidesOffset();
      }
    }

    function updateAutoHeight (speed) {
      const swiper = this;
      const activeSlides = [];
      let newHeight = 0;
      let i;
      if (typeof speed === 'number') {
        swiper.setTransition(speed);
      } else if (speed === true) {
        swiper.setTransition(swiper.params.speed);
      }
      // Find slides currently in view
      if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
        for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
          const index = swiper.activeIndex + i;
          if (index > swiper.slides.length) break;
          activeSlides.push(swiper.slides.eq(index)[0]);
        }
      } else {
        activeSlides.push(swiper.slides.eq(swiper.activeIndex)[0]);
      }

      // Find new height from highest slide in view
      for (i = 0; i < activeSlides.length; i += 1) {
        if (typeof activeSlides[i] !== 'undefined') {
          const height = activeSlides[i].offsetHeight;
          newHeight = height > newHeight ? height : newHeight;
        }
      }

      // Update Height
      if (newHeight) swiper.$wrapperEl.css('height', `${newHeight}px`);
    }

    function updateSlidesOffset () {
      const swiper = this;
      const slides = swiper.slides;
      for (let i = 0; i < slides.length; i += 1) {
        slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
      }
    }

    function updateSlidesProgress (translate = (this && this.translate) || 0) {
      const swiper = this;
      const params = swiper.params;

      const { slides, rtlTranslate: rtl } = swiper;

      if (slides.length === 0) return;
      if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();

      let offsetCenter = -translate;
      if (rtl) offsetCenter = translate;

      // Visible Slides
      slides.removeClass(params.slideVisibleClass);

      swiper.visibleSlidesIndexes = [];
      swiper.visibleSlides = [];

      for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        const slideProgress = (
          (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0)) - slide.swiperSlideOffset
        ) / (slide.swiperSlideSize + params.spaceBetween);
        if (params.watchSlidesVisibility) {
          const slideBefore = -(offsetCenter - slide.swiperSlideOffset);
          const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
          const isVisible = (slideBefore >= 0 && slideBefore < swiper.size - 1)
                    || (slideAfter > 1 && slideAfter <= swiper.size)
                    || (slideBefore <= 0 && slideAfter >= swiper.size);
          if (isVisible) {
            swiper.visibleSlides.push(slide);
            swiper.visibleSlidesIndexes.push(i);
            slides.eq(i).addClass(params.slideVisibleClass);
          }
        }
        slide.progress = rtl ? -slideProgress : slideProgress;
      }
      swiper.visibleSlides = $(swiper.visibleSlides);
    }

    function updateProgress (translate) {
      const swiper = this;
      if (typeof translate === 'undefined') {
        const multiplier = swiper.rtlTranslate ? -1 : 1;
        // eslint-disable-next-line
        translate = (swiper && swiper.translate && (swiper.translate * multiplier)) || 0;
      }
      const params = swiper.params;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      let { progress, isBeginning, isEnd } = swiper;
      const wasBeginning = isBeginning;
      const wasEnd = isEnd;
      if (translatesDiff === 0) {
        progress = 0;
        isBeginning = true;
        isEnd = true;
      } else {
        progress = (translate - swiper.minTranslate()) / (translatesDiff);
        isBeginning = progress <= 0;
        isEnd = progress >= 1;
      }
      Utils.extend(swiper, {
        progress,
        isBeginning,
        isEnd,
      });

      if (params.watchSlidesProgress || params.watchSlidesVisibility) swiper.updateSlidesProgress(translate);

      if (isBeginning && !wasBeginning) {
        swiper.emit('reachBeginning toEdge');
      }
      if (isEnd && !wasEnd) {
        swiper.emit('reachEnd toEdge');
      }
      if ((wasBeginning && !isBeginning) || (wasEnd && !isEnd)) {
        swiper.emit('fromEdge');
      }

      swiper.emit('progress', progress);
    }

    function updateSlidesClasses () {
      const swiper = this;

      const {
        slides, params, $wrapperEl, activeIndex, realIndex,
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;

      slides.removeClass(`${params.slideActiveClass} ${params.slideNextClass} ${params.slidePrevClass} ${params.slideDuplicateActiveClass} ${params.slideDuplicateNextClass} ${params.slideDuplicatePrevClass}`);

      let activeSlide;
      if (isVirtual) {
        activeSlide = swiper.$wrapperEl.find(`.${params.slideClass}[data-swiper-slide-index="${activeIndex}"]`);
      } else {
        activeSlide = slides.eq(activeIndex);
      }

      // Active classes
      activeSlide.addClass(params.slideActiveClass);

      if (params.loop) {
        // Duplicate to all looped slides
        if (activeSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl
            .children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${realIndex}"]`)
            .addClass(params.slideDuplicateActiveClass);
        } else {
          $wrapperEl
            .children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${realIndex}"]`)
            .addClass(params.slideDuplicateActiveClass);
        }
      }
      // Next Slide
      let nextSlide = activeSlide.nextAll(`.${params.slideClass}`).eq(0).addClass(params.slideNextClass);
      if (params.loop && nextSlide.length === 0) {
        nextSlide = slides.eq(0);
        nextSlide.addClass(params.slideNextClass);
      }
      // Prev Slide
      let prevSlide = activeSlide.prevAll(`.${params.slideClass}`).eq(0).addClass(params.slidePrevClass);
      if (params.loop && prevSlide.length === 0) {
        prevSlide = slides.eq(-1);
        prevSlide.addClass(params.slidePrevClass);
      }
      if (params.loop) {
        // Duplicate to all looped slides
        if (nextSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl
            .children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicateNextClass);
        } else {
          $wrapperEl
            .children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicateNextClass);
        }
        if (prevSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl
            .children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicatePrevClass);
        } else {
          $wrapperEl
            .children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicatePrevClass);
        }
      }
    }

    function updateActiveIndex (newActiveIndex) {
      const swiper = this;
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      const {
        slidesGrid, snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex,
      } = swiper;
      let activeIndex = newActiveIndex;
      let snapIndex;
      if (typeof activeIndex === 'undefined') {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - ((slidesGrid[i + 1] - slidesGrid[i]) / 2)) {
              activeIndex = i;
            } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
              activeIndex = i + 1;
            }
          } else if (translate >= slidesGrid[i]) {
            activeIndex = i;
          }
        }
        // Normalize slideIndex
        if (params.normalizeSlideIndex) {
          if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
        }
      }
      if (snapGrid.indexOf(translate) >= 0) {
        snapIndex = snapGrid.indexOf(translate);
      } else {
        const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
        snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
      }
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
      if (activeIndex === previousIndex) {
        if (snapIndex !== previousSnapIndex) {
          swiper.snapIndex = snapIndex;
          swiper.emit('snapIndexChange');
        }
        return;
      }

      // Get real index
      const realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);

      Utils.extend(swiper, {
        snapIndex,
        realIndex,
        previousIndex,
        activeIndex,
      });
      swiper.emit('activeIndexChange');
      swiper.emit('snapIndexChange');
      if (previousRealIndex !== realIndex) {
        swiper.emit('realIndexChange');
      }
      if (swiper.initialized || swiper.runCallbacksOnInit) {
        swiper.emit('slideChange');
      }
    }

    function updateClickedSlide (e) {
      const swiper = this;
      const params = swiper.params;
      const slide = $(e.target).closest(`.${params.slideClass}`)[0];
      let slideFound = false;
      if (slide) {
        for (let i = 0; i < swiper.slides.length; i += 1) {
          if (swiper.slides[i] === slide) slideFound = true;
        }
      }

      if (slide && slideFound) {
        swiper.clickedSlide = slide;
        if (swiper.virtual && swiper.params.virtual.enabled) {
          swiper.clickedIndex = parseInt($(slide).attr('data-swiper-slide-index'), 10);
        } else {
          swiper.clickedIndex = $(slide).index();
        }
      } else {
        swiper.clickedSlide = undefined;
        swiper.clickedIndex = undefined;
        return;
      }
      if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
        swiper.slideToClickedSlide();
      }
    }

    var update$1 = {
      updateSize,
      updateSlides,
      updateAutoHeight,
      updateSlidesOffset,
      updateSlidesProgress,
      updateProgress,
      updateSlidesClasses,
      updateActiveIndex,
      updateClickedSlide,
    };

    function getTranslate (axis = this.isHorizontal() ? 'x' : 'y') {
      const swiper = this;

      const {
        params, rtlTranslate: rtl, translate, $wrapperEl,
      } = swiper;

      if (params.virtualTranslate) {
        return rtl ? -translate : translate;
      }
      if (params.cssMode) {
        return translate;
      }

      let currentTranslate = Utils.getTranslate($wrapperEl[0], axis);
      if (rtl) currentTranslate = -currentTranslate;

      return currentTranslate || 0;
    }

    function setTranslate (translate, byController) {
      const swiper = this;
      const {
        rtlTranslate: rtl, params, $wrapperEl, wrapperEl, progress,
      } = swiper;
      let x = 0;
      let y = 0;
      const z = 0;

      if (swiper.isHorizontal()) {
        x = rtl ? -translate : translate;
      } else {
        y = translate;
      }

      if (params.roundLengths) {
        x = Math.floor(x);
        y = Math.floor(y);
      }

      if (params.cssMode) {
        wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
      } else if (!params.virtualTranslate) {
        $wrapperEl.transform(`translate3d(${x}px, ${y}px, ${z}px)`);
      }
      swiper.previousTranslate = swiper.translate;
      swiper.translate = swiper.isHorizontal() ? x : y;

      // Check if we need to update progress
      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (translate - swiper.minTranslate()) / (translatesDiff);
      }
      if (newProgress !== progress) {
        swiper.updateProgress(translate);
      }

      swiper.emit('setTranslate', swiper.translate, byController);
    }

    function minTranslate () {
      return (-this.snapGrid[0]);
    }

    function maxTranslate () {
      return (-this.snapGrid[this.snapGrid.length - 1]);
    }

    function translateTo (translate = 0, speed = this.params.speed, runCallbacks = true, translateBounds = true, internal) {
      const swiper = this;

      const {
        params,
        wrapperEl,
      } = swiper;

      if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }

      const minTranslate = swiper.minTranslate();
      const maxTranslate = swiper.maxTranslate();
      let newTranslate;
      if (translateBounds && translate > minTranslate) newTranslate = minTranslate;
      else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;
      else newTranslate = translate;

      // Update progress
      swiper.updateProgress(newTranslate);

      if (params.cssMode) {
        const isH = swiper.isHorizontal();
        if (speed === 0) {
          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
        } else {
          // eslint-disable-next-line
          if (wrapperEl.scrollTo) {
            wrapperEl.scrollTo({
              [isH ? 'left' : 'top']: -newTranslate,
              behavior: 'smooth',
            });
          } else {
            wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
          }
        }
        return true;
      }

      if (speed === 0) {
        swiper.setTransition(0);
        swiper.setTranslate(newTranslate);
        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionEnd');
        }
      } else {
        swiper.setTransition(speed);
        swiper.setTranslate(newTranslate);
        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionStart');
        }
        if (!swiper.animating) {
          swiper.animating = true;
          if (!swiper.onTranslateToWrapperTransitionEnd) {
            swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
              if (!swiper || swiper.destroyed) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
              swiper.onTranslateToWrapperTransitionEnd = null;
              delete swiper.onTranslateToWrapperTransitionEnd;
              if (runCallbacks) {
                swiper.emit('transitionEnd');
              }
            };
          }
          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
        }
      }

      return true;
    }

    var translate = {
      getTranslate,
      setTranslate,
      minTranslate,
      maxTranslate,
      translateTo,
    };

    function setTransition (duration, byController) {
      const swiper = this;

      if (!swiper.params.cssMode) {
        swiper.$wrapperEl.transition(duration);
      }

      swiper.emit('setTransition', duration, byController);
    }

    function transitionStart (runCallbacks = true, direction) {
      const swiper = this;
      const { activeIndex, params, previousIndex } = swiper;
      if (params.cssMode) return;
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }

      let dir = direction;
      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';
        else if (activeIndex < previousIndex) dir = 'prev';
        else dir = 'reset';
      }

      swiper.emit('transitionStart');

      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit('slideResetTransitionStart');
          return;
        }
        swiper.emit('slideChangeTransitionStart');
        if (dir === 'next') {
          swiper.emit('slideNextTransitionStart');
        } else {
          swiper.emit('slidePrevTransitionStart');
        }
      }
    }

    function transitionEnd$1 (runCallbacks = true, direction) {
      const swiper = this;
      const { activeIndex, previousIndex, params } = swiper;
      swiper.animating = false;
      if (params.cssMode) return;
      swiper.setTransition(0);

      let dir = direction;
      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';
        else if (activeIndex < previousIndex) dir = 'prev';
        else dir = 'reset';
      }

      swiper.emit('transitionEnd');

      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit('slideResetTransitionEnd');
          return;
        }
        swiper.emit('slideChangeTransitionEnd');
        if (dir === 'next') {
          swiper.emit('slideNextTransitionEnd');
        } else {
          swiper.emit('slidePrevTransitionEnd');
        }
      }
    }

    var transition$1 = {
      setTransition,
      transitionStart,
      transitionEnd: transitionEnd$1,
    };

    function slideTo (index = 0, speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      let slideIndex = index;
      if (slideIndex < 0) slideIndex = 0;

      const {
        params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl,
      } = swiper;
      if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }

      const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
      let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

      if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
        swiper.emit('beforeSlideChangeStart');
      }

      const translate = -snapGrid[snapIndex];

      // Update progress
      swiper.updateProgress(translate);

      // Normalize slideIndex
      if (params.normalizeSlideIndex) {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          if (-Math.floor(translate * 100) >= Math.floor(slidesGrid[i] * 100)) {
            slideIndex = i;
          }
        }
      }
      // Directions locks
      if (swiper.initialized && slideIndex !== activeIndex) {
        if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
          return false;
        }
        if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
          if ((activeIndex || 0) !== slideIndex) return false;
        }
      }

      let direction;
      if (slideIndex > activeIndex) direction = 'next';
      else if (slideIndex < activeIndex) direction = 'prev';
      else direction = 'reset';


      // Update Index
      if ((rtl && -translate === swiper.translate) || (!rtl && translate === swiper.translate)) {
        swiper.updateActiveIndex(slideIndex);
        // Update Height
        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }
        swiper.updateSlidesClasses();
        if (params.effect !== 'slide') {
          swiper.setTranslate(translate);
        }
        if (direction !== 'reset') {
          swiper.transitionStart(runCallbacks, direction);
          swiper.transitionEnd(runCallbacks, direction);
        }
        return false;
      }
      if (params.cssMode) {
        const isH = swiper.isHorizontal();
        if (speed === 0) {
          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -translate;
        } else {
          // eslint-disable-next-line
          if (wrapperEl.scrollTo) {
            wrapperEl.scrollTo({
              [isH ? 'left' : 'top']: -translate,
              behavior: 'smooth',
            });
          } else {
            wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -translate;
          }
        }
        return true;
      }

      if (speed === 0) {
        swiper.setTransition(0);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit('beforeTransitionStart', speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        swiper.transitionEnd(runCallbacks, direction);
      } else {
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit('beforeTransitionStart', speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (!swiper.animating) {
          swiper.animating = true;
          if (!swiper.onSlideToWrapperTransitionEnd) {
            swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
              if (!swiper || swiper.destroyed) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
              swiper.onSlideToWrapperTransitionEnd = null;
              delete swiper.onSlideToWrapperTransitionEnd;
              swiper.transitionEnd(runCallbacks, direction);
            };
          }
          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
        }
      }

      return true;
    }

    function slideToLoop (index = 0, speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      let newIndex = index;
      if (swiper.params.loop) {
        newIndex += swiper.loopedSlides;
      }

      return swiper.slideTo(newIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideNext (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      const { params, animating } = swiper;
      const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup;
      if (params.loop) {
        if (animating) return false;
        swiper.loopFix();
        // eslint-disable-next-line
        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }
      return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slidePrev (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      const {
        params, animating, snapGrid, slidesGrid, rtlTranslate,
      } = swiper;

      if (params.loop) {
        if (animating) return false;
        swiper.loopFix();
        // eslint-disable-next-line
        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }
      const translate = rtlTranslate ? swiper.translate : -swiper.translate;
      function normalize(val) {
        if (val < 0) return -Math.floor(Math.abs(val));
        return Math.floor(val);
      }
      const normalizedTranslate = normalize(translate);
      const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
      const normalizedSlidesGrid = slidesGrid.map((val) => normalize(val));

      const currentSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate)];
      let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
      if (typeof prevSnap === 'undefined' && params.cssMode) {
        snapGrid.forEach((snap) => {
          if (!prevSnap && normalizedTranslate >= snap) prevSnap = snap;
        });
      }
      let prevIndex;
      if (typeof prevSnap !== 'undefined') {
        prevIndex = slidesGrid.indexOf(prevSnap);
        if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
      }
      return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideReset (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideToClosest (speed = this.params.speed, runCallbacks = true, internal, threshold = 0.5) {
      const swiper = this;
      let index = swiper.activeIndex;
      const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
      const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);

      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;

      if (translate >= swiper.snapGrid[snapIndex]) {
        // The current translate is on or after the current snap index, so the choice
        // is between the current index and the one after it.
        const currentSnap = swiper.snapGrid[snapIndex];
        const nextSnap = swiper.snapGrid[snapIndex + 1];
        if ((translate - currentSnap) > (nextSnap - currentSnap) * threshold) {
          index += swiper.params.slidesPerGroup;
        }
      } else {
        // The current translate is before the current snap index, so the choice
        // is between the current index and the one before it.
        const prevSnap = swiper.snapGrid[snapIndex - 1];
        const currentSnap = swiper.snapGrid[snapIndex];
        if ((translate - prevSnap) <= (currentSnap - prevSnap) * threshold) {
          index -= swiper.params.slidesPerGroup;
        }
      }
      index = Math.max(index, 0);
      index = Math.min(index, swiper.slidesGrid.length - 1);

      return swiper.slideTo(index, speed, runCallbacks, internal);
    }

    function slideToClickedSlide () {
      const swiper = this;
      const { params, $wrapperEl } = swiper;

      const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
      let slideToIndex = swiper.clickedIndex;
      let realIndex;
      if (params.loop) {
        if (swiper.animating) return;
        realIndex = parseInt($(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);
        if (params.centeredSlides) {
          if (
            (slideToIndex < swiper.loopedSlides - (slidesPerView / 2))
            || (slideToIndex > (swiper.slides.length - swiper.loopedSlides) + (slidesPerView / 2))
          ) {
            swiper.loopFix();
            slideToIndex = $wrapperEl
              .children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`)
              .eq(0)
              .index();

            Utils.nextTick(() => {
              swiper.slideTo(slideToIndex);
            });
          } else {
            swiper.slideTo(slideToIndex);
          }
        } else if (slideToIndex > swiper.slides.length - slidesPerView) {
          swiper.loopFix();
          slideToIndex = $wrapperEl
            .children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`)
            .eq(0)
            .index();

          Utils.nextTick(() => {
            swiper.slideTo(slideToIndex);
          });
        } else {
          swiper.slideTo(slideToIndex);
        }
      } else {
        swiper.slideTo(slideToIndex);
      }
    }

    var slide = {
      slideTo,
      slideToLoop,
      slideNext,
      slidePrev,
      slideReset,
      slideToClosest,
      slideToClickedSlide,
    };

    function loopCreate () {
      const swiper = this;
      const { params, $wrapperEl } = swiper;
      // Remove duplicated slides
      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}`).remove();

      let slides = $wrapperEl.children(`.${params.slideClass}`);

      if (params.loopFillGroupWithBlank) {
        const blankSlidesNum = params.slidesPerGroup - (slides.length % params.slidesPerGroup);
        if (blankSlidesNum !== params.slidesPerGroup) {
          for (let i = 0; i < blankSlidesNum; i += 1) {
            const blankNode = $(doc.createElement('div')).addClass(`${params.slideClass} ${params.slideBlankClass}`);
            $wrapperEl.append(blankNode);
          }
          slides = $wrapperEl.children(`.${params.slideClass}`);
        }
      }

      if (params.slidesPerView === 'auto' && !params.loopedSlides) params.loopedSlides = slides.length;

      swiper.loopedSlides = Math.ceil(parseFloat(params.loopedSlides || params.slidesPerView, 10));
      swiper.loopedSlides += params.loopAdditionalSlides;
      if (swiper.loopedSlides > slides.length) {
        swiper.loopedSlides = slides.length;
      }

      const prependSlides = [];
      const appendSlides = [];
      slides.each((index, el) => {
        const slide = $(el);
        if (index < swiper.loopedSlides) appendSlides.push(el);
        if (index < slides.length && index >= slides.length - swiper.loopedSlides) prependSlides.push(el);
        slide.attr('data-swiper-slide-index', index);
      });
      for (let i = 0; i < appendSlides.length; i += 1) {
        $wrapperEl.append($(appendSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }
      for (let i = prependSlides.length - 1; i >= 0; i -= 1) {
        $wrapperEl.prepend($(prependSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }
    }

    function loopFix () {
      const swiper = this;

      swiper.emit('beforeLoopFix');

      const {
        activeIndex, slides, loopedSlides, allowSlidePrev, allowSlideNext, snapGrid, rtlTranslate: rtl,
      } = swiper;
      let newIndex;
      swiper.allowSlidePrev = true;
      swiper.allowSlideNext = true;

      const snapTranslate = -snapGrid[activeIndex];
      const diff = snapTranslate - swiper.getTranslate();

      // Fix For Negative Oversliding
      if (activeIndex < loopedSlides) {
        newIndex = (slides.length - (loopedSlides * 3)) + activeIndex;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);
        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      } else if (activeIndex >= slides.length - loopedSlides) {
        // Fix For Positive Oversliding
        newIndex = -slides.length + activeIndex + loopedSlides;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);
        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      }
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;

      swiper.emit('loopFix');
    }

    function loopDestroy () {
      const swiper = this;
      const { $wrapperEl, params, slides } = swiper;
      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass},.${params.slideClass}.${params.slideBlankClass}`).remove();
      slides.removeAttr('data-swiper-slide-index');
    }

    var loop$1 = {
      loopCreate,
      loopFix,
      loopDestroy,
    };

    function setGrabCursor (moving) {
      const swiper = this;
      if (Support.touch || !swiper.params.simulateTouch || (swiper.params.watchOverflow && swiper.isLocked) || swiper.params.cssMode) return;
      const el = swiper.el;
      el.style.cursor = 'move';
      el.style.cursor = moving ? '-webkit-grabbing' : '-webkit-grab';
      el.style.cursor = moving ? '-moz-grabbin' : '-moz-grab';
      el.style.cursor = moving ? 'grabbing' : 'grab';
    }

    function unsetGrabCursor () {
      const swiper = this;
      if (Support.touch || (swiper.params.watchOverflow && swiper.isLocked) || swiper.params.cssMode) return;
      swiper.el.style.cursor = '';
    }

    var grabCursor = {
      setGrabCursor,
      unsetGrabCursor,
    };

    function appendSlide (slides) {
      const swiper = this;
      const { $wrapperEl, params } = swiper;
      if (params.loop) {
        swiper.loopDestroy();
      }
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) $wrapperEl.append(slides[i]);
        }
      } else {
        $wrapperEl.append(slides);
      }
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
    }

    function prependSlide (slides) {
      const swiper = this;
      const { params, $wrapperEl, activeIndex } = swiper;

      if (params.loop) {
        swiper.loopDestroy();
      }
      let newActiveIndex = activeIndex + 1;
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) $wrapperEl.prepend(slides[i]);
        }
        newActiveIndex = activeIndex + slides.length;
      } else {
        $wrapperEl.prepend(slides);
      }
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
      swiper.slideTo(newActiveIndex, 0, false);
    }

    function addSlide (index, slides) {
      const swiper = this;
      const { $wrapperEl, params, activeIndex } = swiper;
      let activeIndexBuffer = activeIndex;
      if (params.loop) {
        activeIndexBuffer -= swiper.loopedSlides;
        swiper.loopDestroy();
        swiper.slides = $wrapperEl.children(`.${params.slideClass}`);
      }
      const baseLength = swiper.slides.length;
      if (index <= 0) {
        swiper.prependSlide(slides);
        return;
      }
      if (index >= baseLength) {
        swiper.appendSlide(slides);
        return;
      }
      let newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + 1 : activeIndexBuffer;

      const slidesBuffer = [];
      for (let i = baseLength - 1; i >= index; i -= 1) {
        const currentSlide = swiper.slides.eq(i);
        currentSlide.remove();
        slidesBuffer.unshift(currentSlide);
      }

      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) $wrapperEl.append(slides[i]);
        }
        newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + slides.length : activeIndexBuffer;
      } else {
        $wrapperEl.append(slides);
      }

      for (let i = 0; i < slidesBuffer.length; i += 1) {
        $wrapperEl.append(slidesBuffer[i]);
      }

      if (params.loop) {
        swiper.loopCreate();
      }
      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
      if (params.loop) {
        swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
      } else {
        swiper.slideTo(newActiveIndex, 0, false);
      }
    }

    function removeSlide (slidesIndexes) {
      const swiper = this;
      const { params, $wrapperEl, activeIndex } = swiper;

      let activeIndexBuffer = activeIndex;
      if (params.loop) {
        activeIndexBuffer -= swiper.loopedSlides;
        swiper.loopDestroy();
        swiper.slides = $wrapperEl.children(`.${params.slideClass}`);
      }
      let newActiveIndex = activeIndexBuffer;
      let indexToRemove;

      if (typeof slidesIndexes === 'object' && 'length' in slidesIndexes) {
        for (let i = 0; i < slidesIndexes.length; i += 1) {
          indexToRemove = slidesIndexes[i];
          if (swiper.slides[indexToRemove]) swiper.slides.eq(indexToRemove).remove();
          if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
        }
        newActiveIndex = Math.max(newActiveIndex, 0);
      } else {
        indexToRemove = slidesIndexes;
        if (swiper.slides[indexToRemove]) swiper.slides.eq(indexToRemove).remove();
        if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
        newActiveIndex = Math.max(newActiveIndex, 0);
      }

      if (params.loop) {
        swiper.loopCreate();
      }

      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
      if (params.loop) {
        swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
      } else {
        swiper.slideTo(newActiveIndex, 0, false);
      }
    }

    function removeAllSlides () {
      const swiper = this;

      const slidesIndexes = [];
      for (let i = 0; i < swiper.slides.length; i += 1) {
        slidesIndexes.push(i);
      }
      swiper.removeSlide(slidesIndexes);
    }

    var manipulation = {
      appendSlide,
      prependSlide,
      addSlide,
      removeSlide,
      removeAllSlides,
    };

    const Device = (function Device() {
      const platform = win.navigator.platform;
      const ua = win.navigator.userAgent;

      const device = {
        ios: false,
        android: false,
        androidChrome: false,
        desktop: false,
        iphone: false,
        ipod: false,
        ipad: false,
        edge: false,
        ie: false,
        firefox: false,
        macos: false,
        windows: false,
        cordova: !!(win.cordova || win.phonegap),
        phonegap: !!(win.cordova || win.phonegap),
        electron: false,
      };

      const screenWidth = win.screen.width;
      const screenHeight = win.screen.height;

      const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
      let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
      const ie = ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
      const edge = ua.indexOf('Edge/') >= 0;
      const firefox = ua.indexOf('Gecko/') >= 0 && ua.indexOf('Firefox/') >= 0;
      const windows = platform === 'Win32';
      const electron = ua.toLowerCase().indexOf('electron') >= 0;
      let macos = platform === 'MacIntel';

      // iPadOs 13 fix
      if (!ipad
        && macos
        && Support.touch
        && (
          (screenWidth === 1024 && screenHeight === 1366) // Pro 12.9
          || (screenWidth === 834 && screenHeight === 1194) // Pro 11
          || (screenWidth === 834 && screenHeight === 1112) // Pro 10.5
          || (screenWidth === 768 && screenHeight === 1024) // other
        )
      ) {
        ipad = ua.match(/(Version)\/([\d.]+)/);
        macos = false;
      }

      device.ie = ie;
      device.edge = edge;
      device.firefox = firefox;

      // Android
      if (android && !windows) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
      }
      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      }
      // iOS
      if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
      }
      if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
      }
      if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.ipod = true;
      }
      // iOS 8+ changed UA
      if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
          device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
      }

      // Webview
      device.webView = !!((iphone || ipad || ipod) && (ua.match(/.*AppleWebKit(?!.*Safari)/i) || win.navigator.standalone))
        || (win.matchMedia && win.matchMedia('(display-mode: standalone)').matches);
      device.webview = device.webView;
      device.standalone = device.webView;

      // Desktop
      device.desktop = !(device.ios || device.android) || electron;
      if (device.desktop) {
        device.electron = electron;
        device.macos = macos;
        device.windows = windows;
        if (device.macos) {
          device.os = 'macos';
        }
        if (device.windows) {
          device.os = 'windows';
        }
      }

      // Pixel Ratio
      device.pixelRatio = win.devicePixelRatio || 1;

      // Export object
      return device;
    }());

    function onTouchStart (event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      const { params, touches } = swiper;

      if (swiper.animating && params.preventInteractionOnTransition) {
        return;
      }
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      const $targetEl = $(e.target);

      if (params.touchEventsTarget === 'wrapper') {
        if (!$targetEl.closest(swiper.wrapperEl).length) return;
      }
      data.isTouchEvent = e.type === 'touchstart';
      if (!data.isTouchEvent && 'which' in e && e.which === 3) return;
      if (!data.isTouchEvent && 'button' in e && e.button > 0) return;
      if (data.isTouched && data.isMoved) return;
      if (params.noSwiping && $targetEl.closest(params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`)[0]) {
        swiper.allowClick = true;
        return;
      }
      if (params.swipeHandler) {
        if (!$targetEl.closest(params.swipeHandler)[0]) return;
      }

      touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      const startX = touches.currentX;
      const startY = touches.currentY;

      // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore

      const edgeSwipeDetection = params.edgeSwipeDetection || params.iOSEdgeSwipeDetection;
      const edgeSwipeThreshold = params.edgeSwipeThreshold || params.iOSEdgeSwipeThreshold;
      if (
        edgeSwipeDetection
        && ((startX <= edgeSwipeThreshold)
        || (startX >= win.screen.width - edgeSwipeThreshold))
      ) {
        return;
      }

      Utils.extend(data, {
        isTouched: true,
        isMoved: false,
        allowTouchCallbacks: true,
        isScrolling: undefined,
        startMoving: undefined,
      });

      touches.startX = startX;
      touches.startY = startY;
      data.touchStartTime = Utils.now();
      swiper.allowClick = true;
      swiper.updateSize();
      swiper.swipeDirection = undefined;
      if (params.threshold > 0) data.allowThresholdMove = false;
      if (e.type !== 'touchstart') {
        let preventDefault = true;
        if ($targetEl.is(data.formElements)) preventDefault = false;
        if (
          doc.activeElement
          && $(doc.activeElement).is(data.formElements)
          && doc.activeElement !== $targetEl[0]
        ) {
          doc.activeElement.blur();
        }

        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if (params.touchStartForcePreventDefault || shouldPreventDefault) {
          e.preventDefault();
        }
      }
      swiper.emit('touchStart', e);
    }

    function onTouchMove (event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      const { params, touches, rtlTranslate: rtl } = swiper;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      if (!data.isTouched) {
        if (data.startMoving && data.isScrolling) {
          swiper.emit('touchMoveOpposite', e);
        }
        return;
      }
      if (data.isTouchEvent && e.type === 'mousemove') return;
      const targetTouch = e.type === 'touchmove' && e.targetTouches && (e.targetTouches[0] || e.changedTouches[0]);
      const pageX = e.type === 'touchmove' ? targetTouch.pageX : e.pageX;
      const pageY = e.type === 'touchmove' ? targetTouch.pageY : e.pageY;
      if (e.preventedByNestedSwiper) {
        touches.startX = pageX;
        touches.startY = pageY;
        return;
      }
      if (!swiper.allowTouchMove) {
        // isMoved = true;
        swiper.allowClick = false;
        if (data.isTouched) {
          Utils.extend(touches, {
            startX: pageX,
            startY: pageY,
            currentX: pageX,
            currentY: pageY,
          });
          data.touchStartTime = Utils.now();
        }
        return;
      }
      if (data.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
        if (swiper.isVertical()) {
          // Vertical
          if (
            (pageY < touches.startY && swiper.translate <= swiper.maxTranslate())
            || (pageY > touches.startY && swiper.translate >= swiper.minTranslate())
          ) {
            data.isTouched = false;
            data.isMoved = false;
            return;
          }
        } else if (
          (pageX < touches.startX && swiper.translate <= swiper.maxTranslate())
          || (pageX > touches.startX && swiper.translate >= swiper.minTranslate())
        ) {
          return;
        }
      }
      if (data.isTouchEvent && doc.activeElement) {
        if (e.target === doc.activeElement && $(e.target).is(data.formElements)) {
          data.isMoved = true;
          swiper.allowClick = false;
          return;
        }
      }
      if (data.allowTouchCallbacks) {
        swiper.emit('touchMove', e);
      }
      if (e.targetTouches && e.targetTouches.length > 1) return;

      touches.currentX = pageX;
      touches.currentY = pageY;

      const diffX = touches.currentX - touches.startX;
      const diffY = touches.currentY - touches.startY;
      if (swiper.params.threshold && Math.sqrt((diffX ** 2) + (diffY ** 2)) < swiper.params.threshold) return;

      if (typeof data.isScrolling === 'undefined') {
        let touchAngle;
        if ((swiper.isHorizontal() && touches.currentY === touches.startY) || (swiper.isVertical() && touches.currentX === touches.startX)) {
          data.isScrolling = false;
        } else {
          // eslint-disable-next-line
          if ((diffX * diffX) + (diffY * diffY) >= 25) {
            touchAngle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
            data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : (90 - touchAngle > params.touchAngle);
          }
        }
      }
      if (data.isScrolling) {
        swiper.emit('touchMoveOpposite', e);
      }
      if (typeof data.startMoving === 'undefined') {
        if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
          data.startMoving = true;
        }
      }
      if (data.isScrolling) {
        data.isTouched = false;
        return;
      }
      if (!data.startMoving) {
        return;
      }
      swiper.allowClick = false;
      if (!params.cssMode) {
        e.preventDefault();
      }
      if (params.touchMoveStopPropagation && !params.nested) {
        e.stopPropagation();
      }

      if (!data.isMoved) {
        if (params.loop) {
          swiper.loopFix();
        }
        data.startTranslate = swiper.getTranslate();
        swiper.setTransition(0);
        if (swiper.animating) {
          swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
        }
        data.allowMomentumBounce = false;
        // Grab Cursor
        if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
          swiper.setGrabCursor(true);
        }
        swiper.emit('sliderFirstMove', e);
      }
      swiper.emit('sliderMove', e);
      data.isMoved = true;

      let diff = swiper.isHorizontal() ? diffX : diffY;
      touches.diff = diff;

      diff *= params.touchRatio;
      if (rtl) diff = -diff;

      swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
      data.currentTranslate = diff + data.startTranslate;

      let disableParentSwiper = true;
      let resistanceRatio = params.resistanceRatio;
      if (params.touchReleaseOnEdges) {
        resistanceRatio = 0;
      }
      if ((diff > 0 && data.currentTranslate > swiper.minTranslate())) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = (swiper.minTranslate() - 1) + ((-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio);
      } else if (diff < 0 && data.currentTranslate < swiper.maxTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = (swiper.maxTranslate() + 1) - ((swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio);
      }

      if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
      }

      // Directions locks
      if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }
      if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }


      // Threshold
      if (params.threshold > 0) {
        if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
          if (!data.allowThresholdMove) {
            data.allowThresholdMove = true;
            touches.startX = touches.currentX;
            touches.startY = touches.currentY;
            data.currentTranslate = data.startTranslate;
            touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
            return;
          }
        } else {
          data.currentTranslate = data.startTranslate;
          return;
        }
      }

      if (!params.followFinger || params.cssMode) return;

      // Update active index in free mode
      if (params.freeMode || params.watchSlidesProgress || params.watchSlidesVisibility) {
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      if (params.freeMode) {
        // Velocity
        if (data.velocities.length === 0) {
          data.velocities.push({
            position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
            time: data.touchStartTime,
          });
        }
        data.velocities.push({
          position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
          time: Utils.now(),
        });
      }
      // Update progress
      swiper.updateProgress(data.currentTranslate);
      // Update translate
      swiper.setTranslate(data.currentTranslate);
    }

    function onTouchEnd (event) {
      const swiper = this;
      const data = swiper.touchEventsData;

      const {
        params, touches, rtlTranslate: rtl, $wrapperEl, slidesGrid, snapGrid,
      } = swiper;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      if (data.allowTouchCallbacks) {
        swiper.emit('touchEnd', e);
      }
      data.allowTouchCallbacks = false;
      if (!data.isTouched) {
        if (data.isMoved && params.grabCursor) {
          swiper.setGrabCursor(false);
        }
        data.isMoved = false;
        data.startMoving = false;
        return;
      }
      // Return Grab Cursor
      if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(false);
      }

      // Time diff
      const touchEndTime = Utils.now();
      const timeDiff = touchEndTime - data.touchStartTime;

      // Tap, doubleTap, Click
      if (swiper.allowClick) {
        swiper.updateClickedSlide(e);
        swiper.emit('tap click', e);
        if (timeDiff < 300 && (touchEndTime - data.lastClickTime) < 300) {
          swiper.emit('doubleTap doubleClick', e);
        }
      }

      data.lastClickTime = Utils.now();
      Utils.nextTick(() => {
        if (!swiper.destroyed) swiper.allowClick = true;
      });

      if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        return;
      }
      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;

      let currentPos;
      if (params.followFinger) {
        currentPos = rtl ? swiper.translate : -swiper.translate;
      } else {
        currentPos = -data.currentTranslate;
      }

      if (params.cssMode) {
        return;
      }

      if (params.freeMode) {
        if (currentPos < -swiper.minTranslate()) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (currentPos > -swiper.maxTranslate()) {
          if (swiper.slides.length < snapGrid.length) {
            swiper.slideTo(snapGrid.length - 1);
          } else {
            swiper.slideTo(swiper.slides.length - 1);
          }
          return;
        }

        if (params.freeModeMomentum) {
          if (data.velocities.length > 1) {
            const lastMoveEvent = data.velocities.pop();
            const velocityEvent = data.velocities.pop();

            const distance = lastMoveEvent.position - velocityEvent.position;
            const time = lastMoveEvent.time - velocityEvent.time;
            swiper.velocity = distance / time;
            swiper.velocity /= 2;
            if (Math.abs(swiper.velocity) < params.freeModeMinimumVelocity) {
              swiper.velocity = 0;
            }
            // this implies that the user stopped moving a finger then released.
            // There would be no events with distance zero, so the last event is stale.
            if (time > 150 || (Utils.now() - lastMoveEvent.time) > 300) {
              swiper.velocity = 0;
            }
          } else {
            swiper.velocity = 0;
          }
          swiper.velocity *= params.freeModeMomentumVelocityRatio;

          data.velocities.length = 0;
          let momentumDuration = 1000 * params.freeModeMomentumRatio;
          const momentumDistance = swiper.velocity * momentumDuration;

          let newPosition = swiper.translate + momentumDistance;
          if (rtl) newPosition = -newPosition;

          let doBounce = false;
          let afterBouncePosition;
          const bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeModeMomentumBounceRatio;
          let needsLoopFix;
          if (newPosition < swiper.maxTranslate()) {
            if (params.freeModeMomentumBounce) {
              if (newPosition + swiper.maxTranslate() < -bounceAmount) {
                newPosition = swiper.maxTranslate() - bounceAmount;
              }
              afterBouncePosition = swiper.maxTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.maxTranslate();
            }
            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (newPosition > swiper.minTranslate()) {
            if (params.freeModeMomentumBounce) {
              if (newPosition - swiper.minTranslate() > bounceAmount) {
                newPosition = swiper.minTranslate() + bounceAmount;
              }
              afterBouncePosition = swiper.minTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.minTranslate();
            }
            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (params.freeModeSticky) {
            let nextSlide;
            for (let j = 0; j < snapGrid.length; j += 1) {
              if (snapGrid[j] > -newPosition) {
                nextSlide = j;
                break;
              }
            }

            if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === 'next') {
              newPosition = snapGrid[nextSlide];
            } else {
              newPosition = snapGrid[nextSlide - 1];
            }
            newPosition = -newPosition;
          }
          if (needsLoopFix) {
            swiper.once('transitionEnd', () => {
              swiper.loopFix();
            });
          }
          // Fix duration
          if (swiper.velocity !== 0) {
            if (rtl) {
              momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
            } else {
              momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
            }
            if (params.freeModeSticky) {
              // If freeModeSticky is active and the user ends a swipe with a slow-velocity
              // event, then durations can be 20+ seconds to slide one (or zero!) slides.
              // It's easy to see this when simulating touch with mouse events. To fix this,
              // limit single-slide swipes to the default slide duration. This also has the
              // nice side effect of matching slide speed if the user stopped moving before
              // lifting finger or mouse vs. moving slowly before lifting the finger/mouse.
              // For faster swipes, also apply limits (albeit higher ones).
              const moveDistance = Math.abs((rtl ? -newPosition : newPosition) - swiper.translate);
              const currentSlideSize = swiper.slidesSizesGrid[swiper.activeIndex];
              if (moveDistance < currentSlideSize) {
                momentumDuration = params.speed;
              } else if (moveDistance < 2 * currentSlideSize) {
                momentumDuration = params.speed * 1.5;
              } else {
                momentumDuration = params.speed * 2.5;
              }
            }
          } else if (params.freeModeSticky) {
            swiper.slideToClosest();
            return;
          }

          if (params.freeModeMomentumBounce && doBounce) {
            swiper.updateProgress(afterBouncePosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            swiper.animating = true;
            $wrapperEl.transitionEnd(() => {
              if (!swiper || swiper.destroyed || !data.allowMomentumBounce) return;
              swiper.emit('momentumBounce');

              swiper.setTransition(params.speed);
              swiper.setTranslate(afterBouncePosition);
              $wrapperEl.transitionEnd(() => {
                if (!swiper || swiper.destroyed) return;
                swiper.transitionEnd();
              });
            });
          } else if (swiper.velocity) {
            swiper.updateProgress(newPosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            if (!swiper.animating) {
              swiper.animating = true;
              $wrapperEl.transitionEnd(() => {
                if (!swiper || swiper.destroyed) return;
                swiper.transitionEnd();
              });
            }
          } else {
            swiper.updateProgress(newPosition);
          }

          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        } else if (params.freeModeSticky) {
          swiper.slideToClosest();
          return;
        }

        if (!params.freeModeMomentum || timeDiff >= params.longSwipesMs) {
          swiper.updateProgress();
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
        return;
      }

      // Find current slide
      let stopIndex = 0;
      let groupSize = swiper.slidesSizesGrid[0];
      for (let i = 0; i < slidesGrid.length; i += (i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup)) {
        const increment = (i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup);
        if (typeof slidesGrid[i + increment] !== 'undefined') {
          if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
            stopIndex = i;
            groupSize = slidesGrid[i + increment] - slidesGrid[i];
          }
        } else if (currentPos >= slidesGrid[i]) {
          stopIndex = i;
          groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
        }
      }

      // Find current slide size
      const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
      const increment = (stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup);

      if (timeDiff > params.longSwipesMs) {
        // Long touches
        if (!params.longSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (swiper.swipeDirection === 'next') {
          if (ratio >= params.longSwipesRatio) swiper.slideTo(stopIndex + increment);
          else swiper.slideTo(stopIndex);
        }
        if (swiper.swipeDirection === 'prev') {
          if (ratio > (1 - params.longSwipesRatio)) swiper.slideTo(stopIndex + increment);
          else swiper.slideTo(stopIndex);
        }
      } else {
        // Short swipes
        if (!params.shortSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
        if (!isNavButtonTarget) {
          if (swiper.swipeDirection === 'next') {
            swiper.slideTo(stopIndex + increment);
          }
          if (swiper.swipeDirection === 'prev') {
            swiper.slideTo(stopIndex);
          }
        } else if (e.target === swiper.navigation.nextEl) {
          swiper.slideTo(stopIndex + increment);
        } else {
          swiper.slideTo(stopIndex);
        }
      }
    }

    function onResize () {
      const swiper = this;

      const { params, el } = swiper;

      if (el && el.offsetWidth === 0) return;

      // Breakpoints
      if (params.breakpoints) {
        swiper.setBreakpoint();
      }

      // Save locks
      const { allowSlideNext, allowSlidePrev, snapGrid } = swiper;

      // Disable locks on resize
      swiper.allowSlideNext = true;
      swiper.allowSlidePrev = true;

      swiper.updateSize();
      swiper.updateSlides();

      swiper.updateSlidesClasses();
      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
        swiper.slideTo(swiper.slides.length - 1, 0, false, true);
      } else {
        swiper.slideTo(swiper.activeIndex, 0, false, true);
      }

      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.run();
      }
      // Return locks after resize
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;

      if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
      }
    }

    function onClick (e) {
      const swiper = this;
      if (!swiper.allowClick) {
        if (swiper.params.preventClicks) e.preventDefault();
        if (swiper.params.preventClicksPropagation && swiper.animating) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    }

    function onScroll () {
      const swiper = this;
      const { wrapperEl } = swiper;
      swiper.previousTranslate = swiper.translate;
      swiper.translate = swiper.isHorizontal() ? -wrapperEl.scrollLeft : -wrapperEl.scrollTop;
      // eslint-disable-next-line
      if (swiper.translate === -0) swiper.translate = 0;

      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();

      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (swiper.translate - swiper.minTranslate()) / (translatesDiff);
      }
      if (newProgress !== swiper.progress) {
        swiper.updateProgress(swiper.translate);
      }

      swiper.emit('setTranslate', swiper.translate, false);
    }

    let dummyEventAttached = false;
    function dummyEventListener() {}

    function attachEvents() {
      const swiper = this;
      const {
        params, touchEvents, el, wrapperEl,
      } = swiper;

      swiper.onTouchStart = onTouchStart.bind(swiper);
      swiper.onTouchMove = onTouchMove.bind(swiper);
      swiper.onTouchEnd = onTouchEnd.bind(swiper);
      if (params.cssMode) {
        swiper.onScroll = onScroll.bind(swiper);
      }

      swiper.onClick = onClick.bind(swiper);

      const capture = !!params.nested;

      // Touch Events
      if (!Support.touch && Support.pointerEvents) {
        el.addEventListener(touchEvents.start, swiper.onTouchStart, false);
        doc.addEventListener(touchEvents.move, swiper.onTouchMove, capture);
        doc.addEventListener(touchEvents.end, swiper.onTouchEnd, false);
      } else {
        if (Support.touch) {
          const passiveListener = touchEvents.start === 'touchstart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
          el.addEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
          el.addEventListener(touchEvents.move, swiper.onTouchMove, Support.passiveListener ? { passive: false, capture } : capture);
          el.addEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
          if (touchEvents.cancel) {
            el.addEventListener(touchEvents.cancel, swiper.onTouchEnd, passiveListener);
          }
          if (!dummyEventAttached) {
            doc.addEventListener('touchstart', dummyEventListener);
            dummyEventAttached = true;
          }
        }
        if ((params.simulateTouch && !Device.ios && !Device.android) || (params.simulateTouch && !Support.touch && Device.ios)) {
          el.addEventListener('mousedown', swiper.onTouchStart, false);
          doc.addEventListener('mousemove', swiper.onTouchMove, capture);
          doc.addEventListener('mouseup', swiper.onTouchEnd, false);
        }
      }
      // Prevent Links Clicks
      if (params.preventClicks || params.preventClicksPropagation) {
        el.addEventListener('click', swiper.onClick, true);
      }
      if (params.cssMode) {
        wrapperEl.addEventListener('scroll', swiper.onScroll);
      }

      // Resize handler
      if (params.updateOnWindowResize) {
        swiper.on((Device.ios || Device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate'), onResize, true);
      } else {
        swiper.on('observerUpdate', onResize, true);
      }
    }

    function detachEvents() {
      const swiper = this;

      const {
        params, touchEvents, el, wrapperEl,
      } = swiper;

      const capture = !!params.nested;

      // Touch Events
      if (!Support.touch && Support.pointerEvents) {
        el.removeEventListener(touchEvents.start, swiper.onTouchStart, false);
        doc.removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
        doc.removeEventListener(touchEvents.end, swiper.onTouchEnd, false);
      } else {
        if (Support.touch) {
          const passiveListener = touchEvents.start === 'onTouchStart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
          el.removeEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
          el.removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
          el.removeEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
          if (touchEvents.cancel) {
            el.removeEventListener(touchEvents.cancel, swiper.onTouchEnd, passiveListener);
          }
        }
        if ((params.simulateTouch && !Device.ios && !Device.android) || (params.simulateTouch && !Support.touch && Device.ios)) {
          el.removeEventListener('mousedown', swiper.onTouchStart, false);
          doc.removeEventListener('mousemove', swiper.onTouchMove, capture);
          doc.removeEventListener('mouseup', swiper.onTouchEnd, false);
        }
      }
      // Prevent Links Clicks
      if (params.preventClicks || params.preventClicksPropagation) {
        el.removeEventListener('click', swiper.onClick, true);
      }

      if (params.cssMode) {
        wrapperEl.removeEventListener('scroll', swiper.onScroll);
      }

      // Resize handler
      swiper.off((Device.ios || Device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate'), onResize);
    }

    var events = {
      attachEvents,
      detachEvents,
    };

    function setBreakpoint () {
      const swiper = this;
      const {
        activeIndex, initialized, loopedSlides = 0, params, $el,
      } = swiper;
      const breakpoints = params.breakpoints;
      if (!breakpoints || (breakpoints && Object.keys(breakpoints).length === 0)) return;

      // Get breakpoint for window width and update parameters
      const breakpoint = swiper.getBreakpoint(breakpoints);

      if (breakpoint && swiper.currentBreakpoint !== breakpoint) {
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
        if (breakpointOnlyParams) {
          ['slidesPerView', 'spaceBetween', 'slidesPerGroup', 'slidesPerGroupSkip', 'slidesPerColumn'].forEach((param) => {
            const paramValue = breakpointOnlyParams[param];
            if (typeof paramValue === 'undefined') return;
            if (param === 'slidesPerView' && (paramValue === 'AUTO' || paramValue === 'auto')) {
              breakpointOnlyParams[param] = 'auto';
            } else if (param === 'slidesPerView') {
              breakpointOnlyParams[param] = parseFloat(paramValue);
            } else {
              breakpointOnlyParams[param] = parseInt(paramValue, 10);
            }
          });
        }

        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = params.slidesPerColumn > 1;
        const isMultiRow = breakpointParams.slidesPerColumn > 1;
        if (wasMultiRow && !isMultiRow) {
          $el.removeClass(`${params.containerModifierClass}multirow ${params.containerModifierClass}multirow-column`);
        } else if (!wasMultiRow && isMultiRow) {
          $el.addClass(`${params.containerModifierClass}multirow`);
          if (breakpointParams.slidesPerColumnFill === 'column') {
            $el.addClass(`${params.containerModifierClass}multirow-column`);
          }
        }

        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);

        if (directionChanged && initialized) {
          swiper.changeDirection();
        }

        Utils.extend(swiper.params, breakpointParams);

        Utils.extend(swiper, {
          allowTouchMove: swiper.params.allowTouchMove,
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,
        });

        swiper.currentBreakpoint = breakpoint;

        if (needsReLoop && initialized) {
          swiper.loopDestroy();
          swiper.loopCreate();
          swiper.updateSlides();
          swiper.slideTo((activeIndex - loopedSlides) + swiper.loopedSlides, 0, false);
        }

        swiper.emit('breakpoint', breakpointParams);
      }
    }

    function getBreakpoint (breakpoints) {
      // Get breakpoint for window width
      if (!breakpoints) return undefined;
      let breakpoint = false;

      const points = Object.keys(breakpoints).map((point) => {
        if (typeof point === 'string' && point.startsWith('@')) {
          const minRatio = parseFloat(point.substr(1));
          const value = win.innerHeight * minRatio;
          return { value, point };
        }
        return { value: point, point };
      });

      points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
      for (let i = 0; i < points.length; i += 1) {
        const { point, value } = points[i];
        if (value <= win.innerWidth) {
          breakpoint = point;
        }
      }
      return breakpoint || 'max';
    }

    var breakpoints = { setBreakpoint, getBreakpoint };

    function addClasses () {
      const swiper = this;
      const {
        classNames, params, rtl, $el,
      } = swiper;
      const suffixes = [];

      suffixes.push('initialized');
      suffixes.push(params.direction);

      if (params.freeMode) {
        suffixes.push('free-mode');
      }
      if (params.autoHeight) {
        suffixes.push('autoheight');
      }
      if (rtl) {
        suffixes.push('rtl');
      }
      if (params.slidesPerColumn > 1) {
        suffixes.push('multirow');
        if (params.slidesPerColumnFill === 'column') {
          suffixes.push('multirow-column');
        }
      }
      if (Device.android) {
        suffixes.push('android');
      }
      if (Device.ios) {
        suffixes.push('ios');
      }

      if (params.cssMode) {
        suffixes.push('css-mode');
      }

      suffixes.forEach((suffix) => {
        classNames.push(params.containerModifierClass + suffix);
      });

      $el.addClass(classNames.join(' '));
    }

    function removeClasses () {
      const swiper = this;
      const { $el, classNames } = swiper;

      $el.removeClass(classNames.join(' '));
    }

    var classes = { addClasses, removeClasses };

    function loadImage (imageEl, src, srcset, sizes, checkForComplete, callback) {
      let image;
      function onReady() {
        if (callback) callback();
      }
      if (!imageEl.complete || !checkForComplete) {
        if (src) {
          image = new win.Image();
          image.onload = onReady;
          image.onerror = onReady;
          if (sizes) {
            image.sizes = sizes;
          }
          if (srcset) {
            image.srcset = srcset;
          }
          if (src) {
            image.src = src;
          }
        } else {
          onReady();
        }
      } else {
        // image already loaded...
        onReady();
      }
    }

    function preloadImages () {
      const swiper = this;
      swiper.imagesToLoad = swiper.$el.find('img');
      function onReady() {
        if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) return;
        if (swiper.imagesLoaded !== undefined) swiper.imagesLoaded += 1;
        if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
          if (swiper.params.updateOnImagesReady) swiper.update();
          swiper.emit('imagesReady');
        }
      }
      for (let i = 0; i < swiper.imagesToLoad.length; i += 1) {
        const imageEl = swiper.imagesToLoad[i];
        swiper.loadImage(
          imageEl,
          imageEl.currentSrc || imageEl.getAttribute('src'),
          imageEl.srcset || imageEl.getAttribute('srcset'),
          imageEl.sizes || imageEl.getAttribute('sizes'),
          true,
          onReady
        );
      }
    }

    var images = {
      loadImage,
      preloadImages,
    };

    function checkOverflow() {
      const swiper = this;
      const params = swiper.params;
      const wasLocked = swiper.isLocked;
      const lastSlidePosition = swiper.slides.length > 0 && (params.slidesOffsetBefore + (params.spaceBetween * (swiper.slides.length - 1)) + ((swiper.slides[0]).offsetWidth) * swiper.slides.length);

      if (params.slidesOffsetBefore && params.slidesOffsetAfter && lastSlidePosition) {
        swiper.isLocked = lastSlidePosition <= swiper.size;
      } else {
        swiper.isLocked = swiper.snapGrid.length === 1;
      }

      swiper.allowSlideNext = !swiper.isLocked;
      swiper.allowSlidePrev = !swiper.isLocked;

      // events
      if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? 'lock' : 'unlock');

      if (wasLocked && wasLocked !== swiper.isLocked) {
        swiper.isEnd = false;
        swiper.navigation.update();
      }
    }

    var checkOverflow$1 = { checkOverflow };

    var defaults = {
      init: true,
      direction: 'horizontal',
      touchEventsTarget: 'container',
      initialSlide: 0,
      speed: 300,
      cssMode: false,
      updateOnWindowResize: true,
      //
      preventInteractionOnTransition: false,

      // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
      edgeSwipeDetection: false,
      edgeSwipeThreshold: 20,

      // Free mode
      freeMode: false,
      freeModeMomentum: true,
      freeModeMomentumRatio: 1,
      freeModeMomentumBounce: true,
      freeModeMomentumBounceRatio: 1,
      freeModeMomentumVelocityRatio: 1,
      freeModeSticky: false,
      freeModeMinimumVelocity: 0.02,

      // Autoheight
      autoHeight: false,

      // Set wrapper width
      setWrapperSize: false,

      // Virtual Translate
      virtualTranslate: false,

      // Effects
      effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

      // Breakpoints
      breakpoints: undefined,

      // Slides grid
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerColumn: 1,
      slidesPerColumnFill: 'column',
      slidesPerGroup: 1,
      slidesPerGroupSkip: 0,
      centeredSlides: false,
      centeredSlidesBounds: false,
      slidesOffsetBefore: 0, // in px
      slidesOffsetAfter: 0, // in px
      normalizeSlideIndex: true,
      centerInsufficientSlides: false,

      // Disable swiper and hide navigation when container not overflow
      watchOverflow: false,

      // Round length
      roundLengths: false,

      // Touches
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      allowTouchMove: true,
      threshold: 0,
      touchMoveStopPropagation: false,
      touchStartPreventDefault: true,
      touchStartForcePreventDefault: false,
      touchReleaseOnEdges: false,

      // Unique Navigation Elements
      uniqueNavElements: true,

      // Resistance
      resistance: true,
      resistanceRatio: 0.85,

      // Progress
      watchSlidesProgress: false,
      watchSlidesVisibility: false,

      // Cursor
      grabCursor: false,

      // Clicks
      preventClicks: true,
      preventClicksPropagation: true,
      slideToClickedSlide: false,

      // Images
      preloadImages: true,
      updateOnImagesReady: true,

      // loop
      loop: false,
      loopAdditionalSlides: 0,
      loopedSlides: null,
      loopFillGroupWithBlank: false,

      // Swiping/no swiping
      allowSlidePrev: true,
      allowSlideNext: true,
      swipeHandler: null, // '.swipe-handler',
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      noSwipingSelector: null,

      // Passive Listeners
      passiveListeners: true,

      // NS
      containerModifierClass: 'swiper-container-', // NEW
      slideClass: 'swiper-slide',
      slideBlankClass: 'swiper-slide-invisible-blank',
      slideActiveClass: 'swiper-slide-active',
      slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
      slideVisibleClass: 'swiper-slide-visible',
      slideDuplicateClass: 'swiper-slide-duplicate',
      slideNextClass: 'swiper-slide-next',
      slideDuplicateNextClass: 'swiper-slide-duplicate-next',
      slidePrevClass: 'swiper-slide-prev',
      slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
      wrapperClass: 'swiper-wrapper',

      // Callbacks
      runCallbacksOnInit: true,
    };

    /* eslint no-param-reassign: "off" */

    const prototypes = {
      update: update$1,
      translate,
      transition: transition$1,
      slide,
      loop: loop$1,
      grabCursor,
      manipulation,
      events,
      breakpoints,
      checkOverflow: checkOverflow$1,
      classes,
      images,
    };

    const extendedDefaults = {};

    class Swiper extends SwiperClass {
      constructor(...args) {
        let el;
        let params;
        if (args.length === 1 && args[0].constructor && args[0].constructor === Object) {
          params = args[0];
        } else {
          [el, params] = args;
        }
        if (!params) params = {};

        params = Utils.extend({}, params);
        if (el && !params.el) params.el = el;

        super(params);

        Object.keys(prototypes).forEach((prototypeGroup) => {
          Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
            if (!Swiper.prototype[protoMethod]) {
              Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
            }
          });
        });

        // Swiper Instance
        const swiper = this;
        if (typeof swiper.modules === 'undefined') {
          swiper.modules = {};
        }
        Object.keys(swiper.modules).forEach((moduleName) => {
          const module = swiper.modules[moduleName];
          if (module.params) {
            const moduleParamName = Object.keys(module.params)[0];
            const moduleParams = module.params[moduleParamName];
            if (typeof moduleParams !== 'object' || moduleParams === null) return;
            if (!(moduleParamName in params && 'enabled' in moduleParams)) return;
            if (params[moduleParamName] === true) {
              params[moduleParamName] = { enabled: true };
            }
            if (
              typeof params[moduleParamName] === 'object'
              && !('enabled' in params[moduleParamName])
            ) {
              params[moduleParamName].enabled = true;
            }
            if (!params[moduleParamName]) params[moduleParamName] = { enabled: false };
          }
        });

        // Extend defaults with modules params
        const swiperParams = Utils.extend({}, defaults);
        swiper.useModulesParams(swiperParams);

        // Extend defaults with passed params
        swiper.params = Utils.extend({}, swiperParams, extendedDefaults, params);
        swiper.originalParams = Utils.extend({}, swiper.params);
        swiper.passedParams = Utils.extend({}, params);

        // Save Dom lib
        swiper.$ = $;

        // Find el
        const $el = $(swiper.params.el);
        el = $el[0];

        if (!el) {
          return undefined;
        }

        if ($el.length > 1) {
          const swipers = [];
          $el.each((index, containerEl) => {
            const newParams = Utils.extend({}, params, { el: containerEl });
            swipers.push(new Swiper(newParams));
          });
          return swipers;
        }

        el.swiper = swiper;
        $el.data('swiper', swiper);

        // Find Wrapper
        let $wrapperEl;
        if (el && el.shadowRoot && el.shadowRoot.querySelector) {
          $wrapperEl = $(el.shadowRoot.querySelector(`.${swiper.params.wrapperClass}`));
          // Children needs to return slot items
          $wrapperEl.children = (options) => $el.children(options);
        } else {
          $wrapperEl = $el.children(`.${swiper.params.wrapperClass}`);
        }
        // Extend Swiper
        Utils.extend(swiper, {
          $el,
          el,
          $wrapperEl,
          wrapperEl: $wrapperEl[0],

          // Classes
          classNames: [],

          // Slides
          slides: $(),
          slidesGrid: [],
          snapGrid: [],
          slidesSizesGrid: [],

          // isDirection
          isHorizontal() {
            return swiper.params.direction === 'horizontal';
          },
          isVertical() {
            return swiper.params.direction === 'vertical';
          },
          // RTL
          rtl: (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
          rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
          wrongRTL: $wrapperEl.css('display') === '-webkit-box',

          // Indexes
          activeIndex: 0,
          realIndex: 0,

          //
          isBeginning: true,
          isEnd: false,

          // Props
          translate: 0,
          previousTranslate: 0,
          progress: 0,
          velocity: 0,
          animating: false,

          // Locks
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,

          // Touch Events
          touchEvents: (function touchEvents() {
            const touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
            let desktop = ['mousedown', 'mousemove', 'mouseup'];
            if (Support.pointerEvents) {
              desktop = ['pointerdown', 'pointermove', 'pointerup'];
            }
            swiper.touchEventsTouch = {
              start: touch[0],
              move: touch[1],
              end: touch[2],
              cancel: touch[3],
            };
            swiper.touchEventsDesktop = {
              start: desktop[0],
              move: desktop[1],
              end: desktop[2],
            };
            return Support.touch || !swiper.params.simulateTouch ? swiper.touchEventsTouch : swiper.touchEventsDesktop;
          }()),
          touchEventsData: {
            isTouched: undefined,
            isMoved: undefined,
            allowTouchCallbacks: undefined,
            touchStartTime: undefined,
            isScrolling: undefined,
            currentTranslate: undefined,
            startTranslate: undefined,
            allowThresholdMove: undefined,
            // Form elements to match
            formElements: 'input, select, option, textarea, button, video, label',
            // Last click time
            lastClickTime: Utils.now(),
            clickTimeout: undefined,
            // Velocities
            velocities: [],
            allowMomentumBounce: undefined,
            isTouchEvent: undefined,
            startMoving: undefined,
          },

          // Clicks
          allowClick: true,

          // Touches
          allowTouchMove: swiper.params.allowTouchMove,

          touches: {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0,
          },

          // Images
          imagesToLoad: [],
          imagesLoaded: 0,

        });

        // Install Modules
        swiper.useModules();

        // Init
        if (swiper.params.init) {
          swiper.init();
        }

        // Return app instance
        return swiper;
      }

      slidesPerViewDynamic() {
        const swiper = this;
        const {
          params, slides, slidesGrid, size: swiperSize, activeIndex,
        } = swiper;
        let spv = 1;
        if (params.centeredSlides) {
          let slideSize = slides[activeIndex].swiperSlideSize;
          let breakLoop;
          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
          for (let i = activeIndex - 1; i >= 0; i -= 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
        } else {
          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slidesGrid[i] - slidesGrid[activeIndex] < swiperSize) {
              spv += 1;
            }
          }
        }
        return spv;
      }

      update() {
        const swiper = this;
        if (!swiper || swiper.destroyed) return;
        const { snapGrid, params } = swiper;
        // Breakpoints
        if (params.breakpoints) {
          swiper.setBreakpoint();
        }
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();

        function setTranslate() {
          const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
          const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
          swiper.setTranslate(newTranslate);
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
        let translated;
        if (swiper.params.freeMode) {
          setTranslate();
          if (swiper.params.autoHeight) {
            swiper.updateAutoHeight();
          }
        } else {
          if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
            translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
          } else {
            translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
          }
          if (!translated) {
            setTranslate();
          }
        }
        if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
          swiper.checkOverflow();
        }
        swiper.emit('update');
      }

      changeDirection(newDirection, needUpdate = true) {
        const swiper = this;
        const currentDirection = swiper.params.direction;
        if (!newDirection) {
          // eslint-disable-next-line
          newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        }
        if ((newDirection === currentDirection) || (newDirection !== 'horizontal' && newDirection !== 'vertical')) {
          return swiper;
        }

        swiper.$el
          .removeClass(`${swiper.params.containerModifierClass}${currentDirection}`)
          .addClass(`${swiper.params.containerModifierClass}${newDirection}`);

        swiper.params.direction = newDirection;

        swiper.slides.each((slideIndex, slideEl) => {
          if (newDirection === 'vertical') {
            slideEl.style.width = '';
          } else {
            slideEl.style.height = '';
          }
        });

        swiper.emit('changeDirection');
        if (needUpdate) swiper.update();

        return swiper;
      }

      init() {
        const swiper = this;
        if (swiper.initialized) return;

        swiper.emit('beforeInit');

        // Set breakpoint
        if (swiper.params.breakpoints) {
          swiper.setBreakpoint();
        }

        // Add Classes
        swiper.addClasses();

        // Create loop
        if (swiper.params.loop) {
          swiper.loopCreate();
        }

        // Update size
        swiper.updateSize();

        // Update slides
        swiper.updateSlides();

        if (swiper.params.watchOverflow) {
          swiper.checkOverflow();
        }

        // Set Grab Cursor
        if (swiper.params.grabCursor) {
          swiper.setGrabCursor();
        }

        if (swiper.params.preloadImages) {
          swiper.preloadImages();
        }

        // Slide To Initial Slide
        if (swiper.params.loop) {
          swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit);
        } else {
          swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit);
        }

        // Attach events
        swiper.attachEvents();

        // Init Flag
        swiper.initialized = true;

        // Emit
        swiper.emit('init');
      }

      destroy(deleteInstance = true, cleanStyles = true) {
        const swiper = this;
        const {
          params, $el, $wrapperEl, slides,
        } = swiper;

        if (typeof swiper.params === 'undefined' || swiper.destroyed) {
          return null;
        }

        swiper.emit('beforeDestroy');

        // Init Flag
        swiper.initialized = false;

        // Detach events
        swiper.detachEvents();

        // Destroy loop
        if (params.loop) {
          swiper.loopDestroy();
        }

        // Cleanup styles
        if (cleanStyles) {
          swiper.removeClasses();
          $el.removeAttr('style');
          $wrapperEl.removeAttr('style');
          if (slides && slides.length) {
            slides
              .removeClass([
                params.slideVisibleClass,
                params.slideActiveClass,
                params.slideNextClass,
                params.slidePrevClass,
              ].join(' '))
              .removeAttr('style')
              .removeAttr('data-swiper-slide-index');
          }
        }

        swiper.emit('destroy');

        // Detach emitter events
        Object.keys(swiper.eventsListeners).forEach((eventName) => {
          swiper.off(eventName);
        });

        if (deleteInstance !== false) {
          swiper.$el[0].swiper = null;
          swiper.$el.data('swiper', null);
          Utils.deleteProps(swiper);
        }
        swiper.destroyed = true;

        return null;
      }

      static extendDefaults(newDefaults) {
        Utils.extend(extendedDefaults, newDefaults);
      }

      static get extendedDefaults() {
        return extendedDefaults;
      }

      static get defaults() {
        return defaults;
      }

      static get Class() {
        return SwiperClass;
      }

      static get $() {
        return $;
      }
    }

    var Device$1 = {
      name: 'device',
      proto: {
        device: Device,
      },
      static: {
        device: Device,
      },
    };

    var Support$1 = {
      name: 'support',
      proto: {
        support: Support,
      },
      static: {
        support: Support,
      },
    };

    const Browser = (function Browser() {
      function isSafari() {
        const ua = win.navigator.userAgent.toLowerCase();
        return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
      }
      return {
        isEdge: !!win.navigator.userAgent.match(/Edge/g),
        isSafari: isSafari(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(win.navigator.userAgent),
      };
    }());

    var Browser$1 = {
      name: 'browser',
      proto: {
        browser: Browser,
      },
      static: {
        browser: Browser,
      },
    };

    var Resize = {
      name: 'resize',
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          resize: {
            resizeHandler() {
              if (!swiper || swiper.destroyed || !swiper.initialized) return;
              swiper.emit('beforeResize');
              swiper.emit('resize');
            },
            orientationChangeHandler() {
              if (!swiper || swiper.destroyed || !swiper.initialized) return;
              swiper.emit('orientationchange');
            },
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          // Emit resize
          win.addEventListener('resize', swiper.resize.resizeHandler);

          // Emit orientationchange
          win.addEventListener('orientationchange', swiper.resize.orientationChangeHandler);
        },
        destroy() {
          const swiper = this;
          win.removeEventListener('resize', swiper.resize.resizeHandler);
          win.removeEventListener('orientationchange', swiper.resize.orientationChangeHandler);
        },
      },
    };

    const Observer = {
      func: win.MutationObserver || win.WebkitMutationObserver,
      attach(target, options = {}) {
        const swiper = this;

        const ObserverFunc = Observer.func;
        const observer = new ObserverFunc((mutations) => {
          // The observerUpdate event should only be triggered
          // once despite the number of mutations.  Additional
          // triggers are redundant and are very costly
          if (mutations.length === 1) {
            swiper.emit('observerUpdate', mutations[0]);
            return;
          }
          const observerUpdate = function observerUpdate() {
            swiper.emit('observerUpdate', mutations[0]);
          };

          if (win.requestAnimationFrame) {
            win.requestAnimationFrame(observerUpdate);
          } else {
            win.setTimeout(observerUpdate, 0);
          }
        });

        observer.observe(target, {
          attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
          childList: typeof options.childList === 'undefined' ? true : options.childList,
          characterData: typeof options.characterData === 'undefined' ? true : options.characterData,
        });

        swiper.observer.observers.push(observer);
      },
      init() {
        const swiper = this;
        if (!Support.observer || !swiper.params.observer) return;
        if (swiper.params.observeParents) {
          const containerParents = swiper.$el.parents();
          for (let i = 0; i < containerParents.length; i += 1) {
            swiper.observer.attach(containerParents[i]);
          }
        }
        // Observe container
        swiper.observer.attach(swiper.$el[0], { childList: swiper.params.observeSlideChildren });

        // Observe wrapper
        swiper.observer.attach(swiper.$wrapperEl[0], { attributes: false });
      },
      destroy() {
        const swiper = this;
        swiper.observer.observers.forEach((observer) => {
          observer.disconnect();
        });
        swiper.observer.observers = [];
      },
    };

    var Observer$1 = {
      name: 'observer',
      params: {
        observer: false,
        observeParents: false,
        observeSlideChildren: false,
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          observer: {
            init: Observer.init.bind(swiper),
            attach: Observer.attach.bind(swiper),
            destroy: Observer.destroy.bind(swiper),
            observers: [],
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.observer.init();
        },
        destroy() {
          const swiper = this;
          swiper.observer.destroy();
        },
      },
    };

    const Virtual = {
      update(force) {
        const swiper = this;
        const { slidesPerView, slidesPerGroup, centeredSlides } = swiper.params;
        const { addSlidesBefore, addSlidesAfter } = swiper.params.virtual;
        const {
          from: previousFrom,
          to: previousTo,
          slides,
          slidesGrid: previousSlidesGrid,
          renderSlide,
          offset: previousOffset,
        } = swiper.virtual;
        swiper.updateActiveIndex();
        const activeIndex = swiper.activeIndex || 0;

        let offsetProp;
        if (swiper.rtlTranslate) offsetProp = 'right';
        else offsetProp = swiper.isHorizontal() ? 'left' : 'top';

        let slidesAfter;
        let slidesBefore;
        if (centeredSlides) {
          slidesAfter = Math.floor(slidesPerView / 2) + slidesPerGroup + addSlidesBefore;
          slidesBefore = Math.floor(slidesPerView / 2) + slidesPerGroup + addSlidesAfter;
        } else {
          slidesAfter = slidesPerView + (slidesPerGroup - 1) + addSlidesBefore;
          slidesBefore = slidesPerGroup + addSlidesAfter;
        }
        const from = Math.max((activeIndex || 0) - slidesBefore, 0);
        const to = Math.min((activeIndex || 0) + slidesAfter, slides.length - 1);
        const offset = (swiper.slidesGrid[from] || 0) - (swiper.slidesGrid[0] || 0);

        Utils.extend(swiper.virtual, {
          from,
          to,
          offset,
          slidesGrid: swiper.slidesGrid,
        });

        function onRendered() {
          swiper.updateSlides();
          swiper.updateProgress();
          swiper.updateSlidesClasses();
          if (swiper.lazy && swiper.params.lazy.enabled) {
            swiper.lazy.load();
          }
        }

        if (previousFrom === from && previousTo === to && !force) {
          if (swiper.slidesGrid !== previousSlidesGrid && offset !== previousOffset) {
            swiper.slides.css(offsetProp, `${offset}px`);
          }
          swiper.updateProgress();
          return;
        }
        if (swiper.params.virtual.renderExternal) {
          swiper.params.virtual.renderExternal.call(swiper, {
            offset,
            from,
            to,
            slides: (function getSlides() {
              const slidesToRender = [];
              for (let i = from; i <= to; i += 1) {
                slidesToRender.push(slides[i]);
              }
              return slidesToRender;
            }()),
          });
          onRendered();
          return;
        }
        const prependIndexes = [];
        const appendIndexes = [];
        if (force) {
          swiper.$wrapperEl.find(`.${swiper.params.slideClass}`).remove();
        } else {
          for (let i = previousFrom; i <= previousTo; i += 1) {
            if (i < from || i > to) {
              swiper.$wrapperEl.find(`.${swiper.params.slideClass}[data-swiper-slide-index="${i}"]`).remove();
            }
          }
        }
        for (let i = 0; i < slides.length; i += 1) {
          if (i >= from && i <= to) {
            if (typeof previousTo === 'undefined' || force) {
              appendIndexes.push(i);
            } else {
              if (i > previousTo) appendIndexes.push(i);
              if (i < previousFrom) prependIndexes.push(i);
            }
          }
        }
        appendIndexes.forEach((index) => {
          swiper.$wrapperEl.append(renderSlide(slides[index], index));
        });
        prependIndexes.sort((a, b) => b - a).forEach((index) => {
          swiper.$wrapperEl.prepend(renderSlide(slides[index], index));
        });
        swiper.$wrapperEl.children('.swiper-slide').css(offsetProp, `${offset}px`);
        onRendered();
      },
      renderSlide(slide, index) {
        const swiper = this;
        const params = swiper.params.virtual;
        if (params.cache && swiper.virtual.cache[index]) {
          return swiper.virtual.cache[index];
        }
        const $slideEl = params.renderSlide
          ? $(params.renderSlide.call(swiper, slide, index))
          : $(`<div class="${swiper.params.slideClass}" data-swiper-slide-index="${index}">${slide}</div>`);
        if (!$slideEl.attr('data-swiper-slide-index')) $slideEl.attr('data-swiper-slide-index', index);
        if (params.cache) swiper.virtual.cache[index] = $slideEl;
        return $slideEl;
      },
      appendSlide(slides) {
        const swiper = this;
        if (typeof slides === 'object' && 'length' in slides) {
          for (let i = 0; i < slides.length; i += 1) {
            if (slides[i]) swiper.virtual.slides.push(slides[i]);
          }
        } else {
          swiper.virtual.slides.push(slides);
        }
        swiper.virtual.update(true);
      },
      prependSlide(slides) {
        const swiper = this;
        const activeIndex = swiper.activeIndex;
        let newActiveIndex = activeIndex + 1;
        let numberOfNewSlides = 1;

        if (Array.isArray(slides)) {
          for (let i = 0; i < slides.length; i += 1) {
            if (slides[i]) swiper.virtual.slides.unshift(slides[i]);
          }
          newActiveIndex = activeIndex + slides.length;
          numberOfNewSlides = slides.length;
        } else {
          swiper.virtual.slides.unshift(slides);
        }
        if (swiper.params.virtual.cache) {
          const cache = swiper.virtual.cache;
          const newCache = {};
          Object.keys(cache).forEach((cachedIndex) => {
            const $cachedEl = cache[cachedIndex];
            const cachedElIndex = $cachedEl.attr('data-swiper-slide-index');
            if (cachedElIndex) {
              $cachedEl.attr('data-swiper-slide-index', parseInt(cachedElIndex, 10) + 1);
            }
            newCache[parseInt(cachedIndex, 10) + numberOfNewSlides] = $cachedEl;
          });
          swiper.virtual.cache = newCache;
        }
        swiper.virtual.update(true);
        swiper.slideTo(newActiveIndex, 0);
      },
      removeSlide(slidesIndexes) {
        const swiper = this;
        if (typeof slidesIndexes === 'undefined' || slidesIndexes === null) return;
        let activeIndex = swiper.activeIndex;
        if (Array.isArray(slidesIndexes)) {
          for (let i = slidesIndexes.length - 1; i >= 0; i -= 1) {
            swiper.virtual.slides.splice(slidesIndexes[i], 1);
            if (swiper.params.virtual.cache) {
              delete swiper.virtual.cache[slidesIndexes[i]];
            }
            if (slidesIndexes[i] < activeIndex) activeIndex -= 1;
            activeIndex = Math.max(activeIndex, 0);
          }
        } else {
          swiper.virtual.slides.splice(slidesIndexes, 1);
          if (swiper.params.virtual.cache) {
            delete swiper.virtual.cache[slidesIndexes];
          }
          if (slidesIndexes < activeIndex) activeIndex -= 1;
          activeIndex = Math.max(activeIndex, 0);
        }
        swiper.virtual.update(true);
        swiper.slideTo(activeIndex, 0);
      },
      removeAllSlides() {
        const swiper = this;
        swiper.virtual.slides = [];
        if (swiper.params.virtual.cache) {
          swiper.virtual.cache = {};
        }
        swiper.virtual.update(true);
        swiper.slideTo(0, 0);
      },
    };

    var Virtual$1 = {
      name: 'virtual',
      params: {
        virtual: {
          enabled: false,
          slides: [],
          cache: true,
          renderSlide: null,
          renderExternal: null,
          addSlidesBefore: 0,
          addSlidesAfter: 0,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          virtual: {
            update: Virtual.update.bind(swiper),
            appendSlide: Virtual.appendSlide.bind(swiper),
            prependSlide: Virtual.prependSlide.bind(swiper),
            removeSlide: Virtual.removeSlide.bind(swiper),
            removeAllSlides: Virtual.removeAllSlides.bind(swiper),
            renderSlide: Virtual.renderSlide.bind(swiper),
            slides: swiper.params.virtual.slides,
            cache: {},
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (!swiper.params.virtual.enabled) return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}virtual`);
          const overwriteParams = {
            watchSlidesProgress: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);

          if (!swiper.params.initialSlide) {
            swiper.virtual.update();
          }
        },
        setTranslate() {
          const swiper = this;
          if (!swiper.params.virtual.enabled) return;
          swiper.virtual.update();
        },
      },
    };

    const Keyboard = {
      handle(event) {
        const swiper = this;
        const { rtlTranslate: rtl } = swiper;
        let e = event;
        if (e.originalEvent) e = e.originalEvent; // jquery fix
        const kc = e.keyCode || e.charCode;
        // Directions locks
        if (!swiper.allowSlideNext && ((swiper.isHorizontal() && kc === 39) || (swiper.isVertical() && kc === 40) || kc === 34)) {
          return false;
        }
        if (!swiper.allowSlidePrev && ((swiper.isHorizontal() && kc === 37) || (swiper.isVertical() && kc === 38) || kc === 33)) {
          return false;
        }
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
          return undefined;
        }
        if (doc.activeElement && doc.activeElement.nodeName && (doc.activeElement.nodeName.toLowerCase() === 'input' || doc.activeElement.nodeName.toLowerCase() === 'textarea')) {
          return undefined;
        }
        if (swiper.params.keyboard.onlyInViewport && (kc === 33 || kc === 34 || kc === 37 || kc === 39 || kc === 38 || kc === 40)) {
          let inView = false;
          // Check that swiper should be inside of visible area of window
          if (swiper.$el.parents(`.${swiper.params.slideClass}`).length > 0 && swiper.$el.parents(`.${swiper.params.slideActiveClass}`).length === 0) {
            return undefined;
          }
          const windowWidth = win.innerWidth;
          const windowHeight = win.innerHeight;
          const swiperOffset = swiper.$el.offset();
          if (rtl) swiperOffset.left -= swiper.$el[0].scrollLeft;
          const swiperCoord = [
            [swiperOffset.left, swiperOffset.top],
            [swiperOffset.left + swiper.width, swiperOffset.top],
            [swiperOffset.left, swiperOffset.top + swiper.height],
            [swiperOffset.left + swiper.width, swiperOffset.top + swiper.height],
          ];
          for (let i = 0; i < swiperCoord.length; i += 1) {
            const point = swiperCoord[i];
            if (
              point[0] >= 0 && point[0] <= windowWidth
              && point[1] >= 0 && point[1] <= windowHeight
            ) {
              inView = true;
            }
          }
          if (!inView) return undefined;
        }
        if (swiper.isHorizontal()) {
          if (kc === 33 || kc === 34 || kc === 37 || kc === 39) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
          }
          if (((kc === 34 || kc === 39) && !rtl) || ((kc === 33 || kc === 37) && rtl)) swiper.slideNext();
          if (((kc === 33 || kc === 37) && !rtl) || ((kc === 34 || kc === 39) && rtl)) swiper.slidePrev();
        } else {
          if (kc === 33 || kc === 34 || kc === 38 || kc === 40) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
          }
          if (kc === 34 || kc === 40) swiper.slideNext();
          if (kc === 33 || kc === 38) swiper.slidePrev();
        }
        swiper.emit('keyPress', kc);
        return undefined;
      },
      enable() {
        const swiper = this;
        if (swiper.keyboard.enabled) return;
        $(doc).on('keydown', swiper.keyboard.handle);
        swiper.keyboard.enabled = true;
      },
      disable() {
        const swiper = this;
        if (!swiper.keyboard.enabled) return;
        $(doc).off('keydown', swiper.keyboard.handle);
        swiper.keyboard.enabled = false;
      },
    };

    var Keyboard$1 = {
      name: 'keyboard',
      params: {
        keyboard: {
          enabled: false,
          onlyInViewport: true,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          keyboard: {
            enabled: false,
            enable: Keyboard.enable.bind(swiper),
            disable: Keyboard.disable.bind(swiper),
            handle: Keyboard.handle.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.keyboard.enabled) {
            swiper.keyboard.enable();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.keyboard.enabled) {
            swiper.keyboard.disable();
          }
        },
      },
    };

    function isEventSupported() {
      const eventName = 'onwheel';
      let isSupported = eventName in doc;

      if (!isSupported) {
        const element = doc.createElement('div');
        element.setAttribute(eventName, 'return;');
        isSupported = typeof element[eventName] === 'function';
      }

      if (!isSupported
        && doc.implementation
        && doc.implementation.hasFeature
        // always returns true in newer browsers as per the standard.
        // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
        && doc.implementation.hasFeature('', '') !== true
      ) {
        // This is the only way to test support for the `wheel` event in IE9+.
        isSupported = doc.implementation.hasFeature('Events.wheel', '3.0');
      }

      return isSupported;
    }
    const Mousewheel = {
      lastScrollTime: Utils.now(),
      lastEventBeforeSnap: undefined,
      recentWheelEvents: [],
      event() {
        if (win.navigator.userAgent.indexOf('firefox') > -1) return 'DOMMouseScroll';
        return isEventSupported() ? 'wheel' : 'mousewheel';
      },
      normalize(e) {
        // Reasonable defaults
        const PIXEL_STEP = 10;
        const LINE_HEIGHT = 40;
        const PAGE_HEIGHT = 800;

        let sX = 0;
        let sY = 0; // spinX, spinY
        let pX = 0;
        let pY = 0; // pixelX, pixelY

        // Legacy
        if ('detail' in e) {
          sY = e.detail;
        }
        if ('wheelDelta' in e) {
          sY = -e.wheelDelta / 120;
        }
        if ('wheelDeltaY' in e) {
          sY = -e.wheelDeltaY / 120;
        }
        if ('wheelDeltaX' in e) {
          sX = -e.wheelDeltaX / 120;
        }

        // side scrolling on FF with DOMMouseScroll
        if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
          sX = sY;
          sY = 0;
        }

        pX = sX * PIXEL_STEP;
        pY = sY * PIXEL_STEP;

        if ('deltaY' in e) {
          pY = e.deltaY;
        }
        if ('deltaX' in e) {
          pX = e.deltaX;
        }

        if (e.shiftKey && !pX) { // if user scrolls with shift he wants horizontal scroll
          pX = pY;
          pY = 0;
        }

        if ((pX || pY) && e.deltaMode) {
          if (e.deltaMode === 1) { // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
          } else { // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
          }
        }

        // Fall-back if spin cannot be determined
        if (pX && !sX) {
          sX = (pX < 1) ? -1 : 1;
        }
        if (pY && !sY) {
          sY = (pY < 1) ? -1 : 1;
        }

        return {
          spinX: sX,
          spinY: sY,
          pixelX: pX,
          pixelY: pY,
        };
      },
      handleMouseEnter() {
        const swiper = this;
        swiper.mouseEntered = true;
      },
      handleMouseLeave() {
        const swiper = this;
        swiper.mouseEntered = false;
      },
      handle(event) {
        let e = event;
        const swiper = this;
        const params = swiper.params.mousewheel;

        if (swiper.params.cssMode) {
          e.preventDefault();
        }

        let target = swiper.$el;
        if (swiper.params.mousewheel.eventsTarged !== 'container') {
          target = $(swiper.params.mousewheel.eventsTarged);
        }
        if (!swiper.mouseEntered && !target[0].contains(e.target) && !params.releaseOnEdges) return true;

        if (e.originalEvent) e = e.originalEvent; // jquery fix
        let delta = 0;
        const rtlFactor = swiper.rtlTranslate ? -1 : 1;

        const data = Mousewheel.normalize(e);

        if (params.forceToAxis) {
          if (swiper.isHorizontal()) {
            if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) delta = data.pixelX * rtlFactor;
            else return true;
          } else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) delta = data.pixelY;
          else return true;
        } else {
          delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
        }

        if (delta === 0) return true;

        if (params.invert) delta = -delta;

        if (!swiper.params.freeMode) {
          // Register the new event in a variable which stores the relevant data
          const newEvent = {
            time: Utils.now(),
            delta: Math.abs(delta),
            direction: Math.sign(delta),
            raw: event,
          };

          // Keep the most recent events
          const recentWheelEvents = swiper.mousewheel.recentWheelEvents;
          if (recentWheelEvents.length >= 2) {
            recentWheelEvents.shift(); // only store the last N events
          }
          const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : undefined;
          recentWheelEvents.push(newEvent);

          // If there is at least one previous recorded event:
          //   If direction has changed or
          //   if the scroll is quicker than the previous one:
          //     Animate the slider.
          // Else (this is the first time the wheel is moved):
          //     Animate the slider.
          if (prevEvent) {
            if (newEvent.direction !== prevEvent.direction || newEvent.delta > prevEvent.delta) {
              swiper.mousewheel.animateSlider(newEvent);
            }
          } else {
            swiper.mousewheel.animateSlider(newEvent);
          }

          // If it's time to release the scroll:
          //   Return now so you don't hit the preventDefault.
          if (swiper.mousewheel.releaseScroll(newEvent)) {
            return true;
          }
        } else {
          // Freemode or scrollContainer:

          // If we recently snapped after a momentum scroll, then ignore wheel events
          // to give time for the deceleration to finish. Stop ignoring after 500 msecs
          // or if it's a new scroll (larger delta or inverse sign as last event before
          // an end-of-momentum snap).
          const newEvent = { time: Utils.now(), delta: Math.abs(delta), direction: Math.sign(delta) };
          const { lastEventBeforeSnap } = swiper.mousewheel;
          const ignoreWheelEvents = lastEventBeforeSnap
            && newEvent.time < lastEventBeforeSnap.time + 500
            && newEvent.delta <= lastEventBeforeSnap.delta
            && newEvent.direction === lastEventBeforeSnap.direction;
          if (!ignoreWheelEvents) {
            swiper.mousewheel.lastEventBeforeSnap = undefined;

            if (swiper.params.loop) {
              swiper.loopFix();
            }
            let position = swiper.getTranslate() + (delta * params.sensitivity);
            const wasBeginning = swiper.isBeginning;
            const wasEnd = swiper.isEnd;

            if (position >= swiper.minTranslate()) position = swiper.minTranslate();
            if (position <= swiper.maxTranslate()) position = swiper.maxTranslate();

            swiper.setTransition(0);
            swiper.setTranslate(position);
            swiper.updateProgress();
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();

            if ((!wasBeginning && swiper.isBeginning) || (!wasEnd && swiper.isEnd)) {
              swiper.updateSlidesClasses();
            }

            if (swiper.params.freeModeSticky) {
              // When wheel scrolling starts with sticky (aka snap) enabled, then detect
              // the end of a momentum scroll by storing recent (N=15?) wheel events.
              // 1. do all N events have decreasing or same (absolute value) delta?
              // 2. did all N events arrive in the last M (M=500?) msecs?
              // 3. does the earliest event have an (absolute value) delta that's
              //    at least P (P=1?) larger than the most recent event's delta?
              // 4. does the latest event have a delta that's smaller than Q (Q=6?) pixels?
              // If 1-4 are "yes" then we're near the end of a momuntum scroll deceleration.
              // Snap immediately and ignore remaining wheel events in this scroll.
              // See comment above for "remaining wheel events in this scroll" determination.
              // If 1-4 aren't satisfied, then wait to snap until 500ms after the last event.
              clearTimeout(swiper.mousewheel.timeout);
              swiper.mousewheel.timeout = undefined;
              const recentWheelEvents = swiper.mousewheel.recentWheelEvents;
              if (recentWheelEvents.length >= 15) {
                recentWheelEvents.shift(); // only store the last N events
              }
              const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : undefined;
              const firstEvent = recentWheelEvents[0];
              recentWheelEvents.push(newEvent);
              if (prevEvent && (newEvent.delta > prevEvent.delta || newEvent.direction !== prevEvent.direction)) {
                // Increasing or reverse-sign delta means the user started scrolling again. Clear the wheel event log.
                recentWheelEvents.splice(0);
              } else if (recentWheelEvents.length >= 15
                  && newEvent.time - firstEvent.time < 500
                  && firstEvent.delta - newEvent.delta >= 1
                  && newEvent.delta <= 6
              ) {
                // We're at the end of the deceleration of a momentum scroll, so there's no need
                // to wait for more events. Snap ASAP on the next tick.
                // Also, because there's some remaining momentum we'll bias the snap in the
                // direction of the ongoing scroll because it's better UX for the scroll to snap
                // in the same direction as the scroll instead of reversing to snap.  Therefore,
                // if it's already scrolled more than 20% in the current direction, keep going.
                const snapToThreshold = delta > 0 ? 0.8 : 0.2;
                swiper.mousewheel.lastEventBeforeSnap = newEvent;
                recentWheelEvents.splice(0);
                swiper.mousewheel.timeout = Utils.nextTick(() => {
                  swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                }, 0); // no delay; move on next tick
              }
              if (!swiper.mousewheel.timeout) {
                // if we get here, then we haven't detected the end of a momentum scroll, so
                // we'll consider a scroll "complete" when there haven't been any wheel events
                // for 500ms.
                swiper.mousewheel.timeout = Utils.nextTick(() => {
                  const snapToThreshold = 0.5;
                  swiper.mousewheel.lastEventBeforeSnap = newEvent;
                  recentWheelEvents.splice(0);
                  swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                }, 500);
              }
            }

            // Emit event
            if (!ignoreWheelEvents) swiper.emit('scroll', e);

            // Stop autoplay
            if (swiper.params.autoplay && swiper.params.autoplayDisableOnInteraction) swiper.autoplay.stop();
            // Return page scroll on edge positions
            if (position === swiper.minTranslate() || position === swiper.maxTranslate()) return true;
          }
        }

        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        return false;
      },
      animateSlider(newEvent) {
        const swiper = this;
        // If the movement is NOT big enough and
        // if the last time the user scrolled was too close to the current one (avoid continuously triggering the slider):
        //   Don't go any further (avoid insignificant scroll movement).
        if (newEvent.delta >= 6 && Utils.now() - swiper.mousewheel.lastScrollTime < 60) {
          // Return false as a default
          return true;
        }
        // If user is scrolling towards the end:
        //   If the slider hasn't hit the latest slide or
        //   if the slider is a loop and
        //   if the slider isn't moving right now:
        //     Go to next slide and
        //     emit a scroll event.
        // Else (the user is scrolling towards the beginning) and
        // if the slider hasn't hit the first slide or
        // if the slider is a loop and
        // if the slider isn't moving right now:
        //   Go to prev slide and
        //   emit a scroll event.
        if (newEvent.direction < 0) {
          if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
            swiper.slideNext();
            swiper.emit('scroll', newEvent.raw);
          }
        } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
          swiper.slidePrev();
          swiper.emit('scroll', newEvent.raw);
        }
        // If you got here is because an animation has been triggered so store the current time
        swiper.mousewheel.lastScrollTime = (new win.Date()).getTime();
        // Return false as a default
        return false;
      },
      releaseScroll(newEvent) {
        const swiper = this;
        const params = swiper.params.mousewheel;
        if (newEvent.direction < 0) {
          if (swiper.isEnd && !swiper.params.loop && params.releaseOnEdges) {
            // Return true to animate scroll on edges
            return true;
          }
        } else if (swiper.isBeginning && !swiper.params.loop && params.releaseOnEdges) {
          // Return true to animate scroll on edges
          return true;
        }
        return false;
      },
      enable() {
        const swiper = this;
        const event = Mousewheel.event();
        if (swiper.params.cssMode) {
          swiper.wrapperEl.removeEventListener(event, swiper.mousewheel.handle);
          return true;
        }
        if (!event) return false;
        if (swiper.mousewheel.enabled) return false;
        let target = swiper.$el;
        if (swiper.params.mousewheel.eventsTarged !== 'container') {
          target = $(swiper.params.mousewheel.eventsTarged);
        }
        target.on('mouseenter', swiper.mousewheel.handleMouseEnter);
        target.on('mouseleave', swiper.mousewheel.handleMouseLeave);
        target.on(event, swiper.mousewheel.handle);
        swiper.mousewheel.enabled = true;
        return true;
      },
      disable() {
        const swiper = this;
        const event = Mousewheel.event();
        if (swiper.params.cssMode) {
          swiper.wrapperEl.addEventListener(event, swiper.mousewheel.handle);
          return true;
        }
        if (!event) return false;
        if (!swiper.mousewheel.enabled) return false;
        let target = swiper.$el;
        if (swiper.params.mousewheel.eventsTarged !== 'container') {
          target = $(swiper.params.mousewheel.eventsTarged);
        }
        target.off(event, swiper.mousewheel.handle);
        swiper.mousewheel.enabled = false;
        return true;
      },
    };

    var Mousewheel$1 = {
      name: 'mousewheel',
      params: {
        mousewheel: {
          enabled: false,
          releaseOnEdges: false,
          invert: false,
          forceToAxis: false,
          sensitivity: 1,
          eventsTarged: 'container',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          mousewheel: {
            enabled: false,
            enable: Mousewheel.enable.bind(swiper),
            disable: Mousewheel.disable.bind(swiper),
            handle: Mousewheel.handle.bind(swiper),
            handleMouseEnter: Mousewheel.handleMouseEnter.bind(swiper),
            handleMouseLeave: Mousewheel.handleMouseLeave.bind(swiper),
            animateSlider: Mousewheel.animateSlider.bind(swiper),
            releaseScroll: Mousewheel.releaseScroll.bind(swiper),
            lastScrollTime: Utils.now(),
            lastEventBeforeSnap: undefined,
            recentWheelEvents: [],
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (!swiper.params.mousewheel.enabled && swiper.params.cssMode) {
            swiper.mousewheel.disable();
          }
          if (swiper.params.mousewheel.enabled) swiper.mousewheel.enable();
        },
        destroy() {
          const swiper = this;
          if (swiper.params.cssMode) {
            swiper.mousewheel.enable();
          }
          if (swiper.mousewheel.enabled) swiper.mousewheel.disable();
        },
      },
    };

    const Navigation = {
      update() {
        // Update Navigation Buttons
        const swiper = this;
        const params = swiper.params.navigation;

        if (swiper.params.loop) return;
        const { $nextEl, $prevEl } = swiper.navigation;

        if ($prevEl && $prevEl.length > 0) {
          if (swiper.isBeginning) {
            $prevEl.addClass(params.disabledClass);
          } else {
            $prevEl.removeClass(params.disabledClass);
          }
          $prevEl[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
        }
        if ($nextEl && $nextEl.length > 0) {
          if (swiper.isEnd) {
            $nextEl.addClass(params.disabledClass);
          } else {
            $nextEl.removeClass(params.disabledClass);
          }
          $nextEl[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
        }
      },
      onPrevClick(e) {
        const swiper = this;
        e.preventDefault();
        if (swiper.isBeginning && !swiper.params.loop) return;
        swiper.slidePrev();
      },
      onNextClick(e) {
        const swiper = this;
        e.preventDefault();
        if (swiper.isEnd && !swiper.params.loop) return;
        swiper.slideNext();
      },
      init() {
        const swiper = this;
        const params = swiper.params.navigation;
        if (!(params.nextEl || params.prevEl)) return;

        let $nextEl;
        let $prevEl;
        if (params.nextEl) {
          $nextEl = $(params.nextEl);
          if (
            swiper.params.uniqueNavElements
            && typeof params.nextEl === 'string'
            && $nextEl.length > 1
            && swiper.$el.find(params.nextEl).length === 1
          ) {
            $nextEl = swiper.$el.find(params.nextEl);
          }
        }
        if (params.prevEl) {
          $prevEl = $(params.prevEl);
          if (
            swiper.params.uniqueNavElements
            && typeof params.prevEl === 'string'
            && $prevEl.length > 1
            && swiper.$el.find(params.prevEl).length === 1
          ) {
            $prevEl = swiper.$el.find(params.prevEl);
          }
        }

        if ($nextEl && $nextEl.length > 0) {
          $nextEl.on('click', swiper.navigation.onNextClick);
        }
        if ($prevEl && $prevEl.length > 0) {
          $prevEl.on('click', swiper.navigation.onPrevClick);
        }

        Utils.extend(swiper.navigation, {
          $nextEl,
          nextEl: $nextEl && $nextEl[0],
          $prevEl,
          prevEl: $prevEl && $prevEl[0],
        });
      },
      destroy() {
        const swiper = this;
        const { $nextEl, $prevEl } = swiper.navigation;
        if ($nextEl && $nextEl.length) {
          $nextEl.off('click', swiper.navigation.onNextClick);
          $nextEl.removeClass(swiper.params.navigation.disabledClass);
        }
        if ($prevEl && $prevEl.length) {
          $prevEl.off('click', swiper.navigation.onPrevClick);
          $prevEl.removeClass(swiper.params.navigation.disabledClass);
        }
      },
    };

    var Navigation$1 = {
      name: 'navigation',
      params: {
        navigation: {
          nextEl: null,
          prevEl: null,

          hideOnClick: false,
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
          lockClass: 'swiper-button-lock',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          navigation: {
            init: Navigation.init.bind(swiper),
            update: Navigation.update.bind(swiper),
            destroy: Navigation.destroy.bind(swiper),
            onNextClick: Navigation.onNextClick.bind(swiper),
            onPrevClick: Navigation.onPrevClick.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.navigation.init();
          swiper.navigation.update();
        },
        toEdge() {
          const swiper = this;
          swiper.navigation.update();
        },
        fromEdge() {
          const swiper = this;
          swiper.navigation.update();
        },
        destroy() {
          const swiper = this;
          swiper.navigation.destroy();
        },
        click(e) {
          const swiper = this;
          const { $nextEl, $prevEl } = swiper.navigation;
          if (
            swiper.params.navigation.hideOnClick
            && !$(e.target).is($prevEl)
            && !$(e.target).is($nextEl)
          ) {
            let isHidden;
            if ($nextEl) {
              isHidden = $nextEl.hasClass(swiper.params.navigation.hiddenClass);
            } else if ($prevEl) {
              isHidden = $prevEl.hasClass(swiper.params.navigation.hiddenClass);
            }
            if (isHidden === true) {
              swiper.emit('navigationShow', swiper);
            } else {
              swiper.emit('navigationHide', swiper);
            }
            if ($nextEl) {
              $nextEl.toggleClass(swiper.params.navigation.hiddenClass);
            }
            if ($prevEl) {
              $prevEl.toggleClass(swiper.params.navigation.hiddenClass);
            }
          }
        },
      },
    };

    const Pagination = {
      update() {
        // Render || Update Pagination bullets/items
        const swiper = this;
        const rtl = swiper.rtl;
        const params = swiper.params.pagination;
        if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const $el = swiper.pagination.$el;
        // Current/Total
        let current;
        const total = swiper.params.loop ? Math.ceil((slidesLength - (swiper.loopedSlides * 2)) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
        if (swiper.params.loop) {
          current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);
          if (current > slidesLength - 1 - (swiper.loopedSlides * 2)) {
            current -= (slidesLength - (swiper.loopedSlides * 2));
          }
          if (current > total - 1) current -= total;
          if (current < 0 && swiper.params.paginationType !== 'bullets') current = total + current;
        } else if (typeof swiper.snapIndex !== 'undefined') {
          current = swiper.snapIndex;
        } else {
          current = swiper.activeIndex || 0;
        }
        // Types
        if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
          const bullets = swiper.pagination.bullets;
          let firstIndex;
          let lastIndex;
          let midIndex;
          if (params.dynamicBullets) {
            swiper.pagination.bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
            $el.css(swiper.isHorizontal() ? 'width' : 'height', `${swiper.pagination.bulletSize * (params.dynamicMainBullets + 4)}px`);
            if (params.dynamicMainBullets > 1 && swiper.previousIndex !== undefined) {
              swiper.pagination.dynamicBulletIndex += (current - swiper.previousIndex);
              if (swiper.pagination.dynamicBulletIndex > (params.dynamicMainBullets - 1)) {
                swiper.pagination.dynamicBulletIndex = params.dynamicMainBullets - 1;
              } else if (swiper.pagination.dynamicBulletIndex < 0) {
                swiper.pagination.dynamicBulletIndex = 0;
              }
            }
            firstIndex = current - swiper.pagination.dynamicBulletIndex;
            lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
            midIndex = (lastIndex + firstIndex) / 2;
          }
          bullets.removeClass(`${params.bulletActiveClass} ${params.bulletActiveClass}-next ${params.bulletActiveClass}-next-next ${params.bulletActiveClass}-prev ${params.bulletActiveClass}-prev-prev ${params.bulletActiveClass}-main`);
          if ($el.length > 1) {
            bullets.each((index, bullet) => {
              const $bullet = $(bullet);
              const bulletIndex = $bullet.index();
              if (bulletIndex === current) {
                $bullet.addClass(params.bulletActiveClass);
              }
              if (params.dynamicBullets) {
                if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                  $bullet.addClass(`${params.bulletActiveClass}-main`);
                }
                if (bulletIndex === firstIndex) {
                  $bullet
                    .prev()
                    .addClass(`${params.bulletActiveClass}-prev`)
                    .prev()
                    .addClass(`${params.bulletActiveClass}-prev-prev`);
                }
                if (bulletIndex === lastIndex) {
                  $bullet
                    .next()
                    .addClass(`${params.bulletActiveClass}-next`)
                    .next()
                    .addClass(`${params.bulletActiveClass}-next-next`);
                }
              }
            });
          } else {
            const $bullet = bullets.eq(current);
            const bulletIndex = $bullet.index();
            $bullet.addClass(params.bulletActiveClass);
            if (params.dynamicBullets) {
              const $firstDisplayedBullet = bullets.eq(firstIndex);
              const $lastDisplayedBullet = bullets.eq(lastIndex);
              for (let i = firstIndex; i <= lastIndex; i += 1) {
                bullets.eq(i).addClass(`${params.bulletActiveClass}-main`);
              }
              if (swiper.params.loop) {
                if (bulletIndex >= bullets.length - params.dynamicMainBullets) {
                  for (let i = params.dynamicMainBullets; i >= 0; i -= 1) {
                    bullets.eq(bullets.length - i).addClass(`${params.bulletActiveClass}-main`);
                  }
                  bullets.eq(bullets.length - params.dynamicMainBullets - 1).addClass(`${params.bulletActiveClass}-prev`);
                } else {
                  $firstDisplayedBullet
                    .prev()
                    .addClass(`${params.bulletActiveClass}-prev`)
                    .prev()
                    .addClass(`${params.bulletActiveClass}-prev-prev`);
                  $lastDisplayedBullet
                    .next()
                    .addClass(`${params.bulletActiveClass}-next`)
                    .next()
                    .addClass(`${params.bulletActiveClass}-next-next`);
                }
              } else {
                $firstDisplayedBullet
                  .prev()
                  .addClass(`${params.bulletActiveClass}-prev`)
                  .prev()
                  .addClass(`${params.bulletActiveClass}-prev-prev`);
                $lastDisplayedBullet
                  .next()
                  .addClass(`${params.bulletActiveClass}-next`)
                  .next()
                  .addClass(`${params.bulletActiveClass}-next-next`);
              }
            }
          }
          if (params.dynamicBullets) {
            const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
            const bulletsOffset = (((swiper.pagination.bulletSize * dynamicBulletsLength) - (swiper.pagination.bulletSize)) / 2) - (midIndex * swiper.pagination.bulletSize);
            const offsetProp = rtl ? 'right' : 'left';
            bullets.css(swiper.isHorizontal() ? offsetProp : 'top', `${bulletsOffset}px`);
          }
        }
        if (params.type === 'fraction') {
          $el.find(`.${params.currentClass}`).text(params.formatFractionCurrent(current + 1));
          $el.find(`.${params.totalClass}`).text(params.formatFractionTotal(total));
        }
        if (params.type === 'progressbar') {
          let progressbarDirection;
          if (params.progressbarOpposite) {
            progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
          } else {
            progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
          }
          const scale = (current + 1) / total;
          let scaleX = 1;
          let scaleY = 1;
          if (progressbarDirection === 'horizontal') {
            scaleX = scale;
          } else {
            scaleY = scale;
          }
          $el.find(`.${params.progressbarFillClass}`).transform(`translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`).transition(swiper.params.speed);
        }
        if (params.type === 'custom' && params.renderCustom) {
          $el.html(params.renderCustom(swiper, current + 1, total));
          swiper.emit('paginationRender', swiper, $el[0]);
        } else {
          swiper.emit('paginationUpdate', swiper, $el[0]);
        }
        $el[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
      },
      render() {
        // Render Container
        const swiper = this;
        const params = swiper.params.pagination;
        if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;

        const $el = swiper.pagination.$el;
        let paginationHTML = '';
        if (params.type === 'bullets') {
          const numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - (swiper.loopedSlides * 2)) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
          for (let i = 0; i < numberOfBullets; i += 1) {
            if (params.renderBullet) {
              paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
            } else {
              paginationHTML += `<${params.bulletElement} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
          }
          $el.html(paginationHTML);
          swiper.pagination.bullets = $el.find(`.${params.bulletClass}`);
        }
        if (params.type === 'fraction') {
          if (params.renderFraction) {
            paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
          } else {
            paginationHTML = `<span class="${params.currentClass}"></span>`
            + ' / '
            + `<span class="${params.totalClass}"></span>`;
          }
          $el.html(paginationHTML);
        }
        if (params.type === 'progressbar') {
          if (params.renderProgressbar) {
            paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
          } else {
            paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
          }
          $el.html(paginationHTML);
        }
        if (params.type !== 'custom') {
          swiper.emit('paginationRender', swiper.pagination.$el[0]);
        }
      },
      init() {
        const swiper = this;
        const params = swiper.params.pagination;
        if (!params.el) return;

        let $el = $(params.el);
        if ($el.length === 0) return;

        if (
          swiper.params.uniqueNavElements
          && typeof params.el === 'string'
          && $el.length > 1
          && swiper.$el.find(params.el).length === 1
        ) {
          $el = swiper.$el.find(params.el);
        }

        if (params.type === 'bullets' && params.clickable) {
          $el.addClass(params.clickableClass);
        }

        $el.addClass(params.modifierClass + params.type);

        if (params.type === 'bullets' && params.dynamicBullets) {
          $el.addClass(`${params.modifierClass}${params.type}-dynamic`);
          swiper.pagination.dynamicBulletIndex = 0;
          if (params.dynamicMainBullets < 1) {
            params.dynamicMainBullets = 1;
          }
        }
        if (params.type === 'progressbar' && params.progressbarOpposite) {
          $el.addClass(params.progressbarOppositeClass);
        }

        if (params.clickable) {
          $el.on('click', `.${params.bulletClass}`, function onClick(e) {
            e.preventDefault();
            let index = $(this).index() * swiper.params.slidesPerGroup;
            if (swiper.params.loop) index += swiper.loopedSlides;
            swiper.slideTo(index);
          });
        }

        Utils.extend(swiper.pagination, {
          $el,
          el: $el[0],
        });
      },
      destroy() {
        const swiper = this;
        const params = swiper.params.pagination;
        if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
        const $el = swiper.pagination.$el;

        $el.removeClass(params.hiddenClass);
        $el.removeClass(params.modifierClass + params.type);
        if (swiper.pagination.bullets) swiper.pagination.bullets.removeClass(params.bulletActiveClass);
        if (params.clickable) {
          $el.off('click', `.${params.bulletClass}`);
        }
      },
    };

    var Pagination$1 = {
      name: 'pagination',
      params: {
        pagination: {
          el: null,
          bulletElement: 'span',
          clickable: false,
          hideOnClick: false,
          renderBullet: null,
          renderProgressbar: null,
          renderFraction: null,
          renderCustom: null,
          progressbarOpposite: false,
          type: 'bullets', // 'bullets' or 'progressbar' or 'fraction' or 'custom'
          dynamicBullets: false,
          dynamicMainBullets: 1,
          formatFractionCurrent: (number) => number,
          formatFractionTotal: (number) => number,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
          modifierClass: 'swiper-pagination-', // NEW
          currentClass: 'swiper-pagination-current',
          totalClass: 'swiper-pagination-total',
          hiddenClass: 'swiper-pagination-hidden',
          progressbarFillClass: 'swiper-pagination-progressbar-fill',
          progressbarOppositeClass: 'swiper-pagination-progressbar-opposite',
          clickableClass: 'swiper-pagination-clickable', // NEW
          lockClass: 'swiper-pagination-lock',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          pagination: {
            init: Pagination.init.bind(swiper),
            render: Pagination.render.bind(swiper),
            update: Pagination.update.bind(swiper),
            destroy: Pagination.destroy.bind(swiper),
            dynamicBulletIndex: 0,
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.pagination.init();
          swiper.pagination.render();
          swiper.pagination.update();
        },
        activeIndexChange() {
          const swiper = this;
          if (swiper.params.loop) {
            swiper.pagination.update();
          } else if (typeof swiper.snapIndex === 'undefined') {
            swiper.pagination.update();
          }
        },
        snapIndexChange() {
          const swiper = this;
          if (!swiper.params.loop) {
            swiper.pagination.update();
          }
        },
        slidesLengthChange() {
          const swiper = this;
          if (swiper.params.loop) {
            swiper.pagination.render();
            swiper.pagination.update();
          }
        },
        snapGridLengthChange() {
          const swiper = this;
          if (!swiper.params.loop) {
            swiper.pagination.render();
            swiper.pagination.update();
          }
        },
        destroy() {
          const swiper = this;
          swiper.pagination.destroy();
        },
        click(e) {
          const swiper = this;
          if (
            swiper.params.pagination.el
            && swiper.params.pagination.hideOnClick
            && swiper.pagination.$el.length > 0
            && !$(e.target).hasClass(swiper.params.pagination.bulletClass)
          ) {
            const isHidden = swiper.pagination.$el.hasClass(swiper.params.pagination.hiddenClass);
            if (isHidden === true) {
              swiper.emit('paginationShow', swiper);
            } else {
              swiper.emit('paginationHide', swiper);
            }
            swiper.pagination.$el.toggleClass(swiper.params.pagination.hiddenClass);
          }
        },
      },
    };

    const Scrollbar = {
      setTranslate() {
        const swiper = this;
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        const { scrollbar, rtlTranslate: rtl, progress } = swiper;
        const {
          dragSize, trackSize, $dragEl, $el,
        } = scrollbar;
        const params = swiper.params.scrollbar;

        let newSize = dragSize;
        let newPos = (trackSize - dragSize) * progress;
        if (rtl) {
          newPos = -newPos;
          if (newPos > 0) {
            newSize = dragSize - newPos;
            newPos = 0;
          } else if (-newPos + dragSize > trackSize) {
            newSize = trackSize + newPos;
          }
        } else if (newPos < 0) {
          newSize = dragSize + newPos;
          newPos = 0;
        } else if (newPos + dragSize > trackSize) {
          newSize = trackSize - newPos;
        }
        if (swiper.isHorizontal()) {
          $dragEl.transform(`translate3d(${newPos}px, 0, 0)`);
          $dragEl[0].style.width = `${newSize}px`;
        } else {
          $dragEl.transform(`translate3d(0px, ${newPos}px, 0)`);
          $dragEl[0].style.height = `${newSize}px`;
        }
        if (params.hide) {
          clearTimeout(swiper.scrollbar.timeout);
          $el[0].style.opacity = 1;
          swiper.scrollbar.timeout = setTimeout(() => {
            $el[0].style.opacity = 0;
            $el.transition(400);
          }, 1000);
        }
      },
      setTransition(duration) {
        const swiper = this;
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        swiper.scrollbar.$dragEl.transition(duration);
      },
      updateSize() {
        const swiper = this;
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;

        const { scrollbar } = swiper;
        const { $dragEl, $el } = scrollbar;

        $dragEl[0].style.width = '';
        $dragEl[0].style.height = '';
        const trackSize = swiper.isHorizontal() ? $el[0].offsetWidth : $el[0].offsetHeight;

        const divider = swiper.size / swiper.virtualSize;
        const moveDivider = divider * (trackSize / swiper.size);
        let dragSize;
        if (swiper.params.scrollbar.dragSize === 'auto') {
          dragSize = trackSize * divider;
        } else {
          dragSize = parseInt(swiper.params.scrollbar.dragSize, 10);
        }

        if (swiper.isHorizontal()) {
          $dragEl[0].style.width = `${dragSize}px`;
        } else {
          $dragEl[0].style.height = `${dragSize}px`;
        }

        if (divider >= 1) {
          $el[0].style.display = 'none';
        } else {
          $el[0].style.display = '';
        }
        if (swiper.params.scrollbar.hide) {
          $el[0].style.opacity = 0;
        }
        Utils.extend(scrollbar, {
          trackSize,
          divider,
          moveDivider,
          dragSize,
        });
        scrollbar.$el[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](swiper.params.scrollbar.lockClass);
      },
      getPointerPosition(e) {
        const swiper = this;
        if (swiper.isHorizontal()) {
          return ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].clientX : e.clientX);
        }
        return ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].clientY : e.clientY);
      },
      setDragPosition(e) {
        const swiper = this;
        const { scrollbar, rtlTranslate: rtl } = swiper;
        const {
          $el,
          dragSize,
          trackSize,
          dragStartPos,
        } = scrollbar;

        let positionRatio;
        positionRatio = ((scrollbar.getPointerPosition(e)) - $el.offset()[swiper.isHorizontal() ? 'left' : 'top']
          - (dragStartPos !== null ? dragStartPos : dragSize / 2)) / (trackSize - dragSize);
        positionRatio = Math.max(Math.min(positionRatio, 1), 0);
        if (rtl) {
          positionRatio = 1 - positionRatio;
        }

        const position = swiper.minTranslate() + ((swiper.maxTranslate() - swiper.minTranslate()) * positionRatio);

        swiper.updateProgress(position);
        swiper.setTranslate(position);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      },
      onDragStart(e) {
        const swiper = this;
        const params = swiper.params.scrollbar;
        const { scrollbar, $wrapperEl } = swiper;
        const { $el, $dragEl } = scrollbar;
        swiper.scrollbar.isTouched = true;
        swiper.scrollbar.dragStartPos = (e.target === $dragEl[0] || e.target === $dragEl)
          ? scrollbar.getPointerPosition(e) - e.target.getBoundingClientRect()[swiper.isHorizontal() ? 'left' : 'top'] : null;
        e.preventDefault();
        e.stopPropagation();

        $wrapperEl.transition(100);
        $dragEl.transition(100);
        scrollbar.setDragPosition(e);

        clearTimeout(swiper.scrollbar.dragTimeout);

        $el.transition(0);
        if (params.hide) {
          $el.css('opacity', 1);
        }
        if (swiper.params.cssMode) {
          swiper.$wrapperEl.css('scroll-snap-type', 'none');
        }
        swiper.emit('scrollbarDragStart', e);
      },
      onDragMove(e) {
        const swiper = this;
        const { scrollbar, $wrapperEl } = swiper;
        const { $el, $dragEl } = scrollbar;

        if (!swiper.scrollbar.isTouched) return;
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        scrollbar.setDragPosition(e);
        $wrapperEl.transition(0);
        $el.transition(0);
        $dragEl.transition(0);
        swiper.emit('scrollbarDragMove', e);
      },
      onDragEnd(e) {
        const swiper = this;

        const params = swiper.params.scrollbar;
        const { scrollbar, $wrapperEl } = swiper;
        const { $el } = scrollbar;

        if (!swiper.scrollbar.isTouched) return;
        swiper.scrollbar.isTouched = false;
        if (swiper.params.cssMode) {
          swiper.$wrapperEl.css('scroll-snap-type', '');
          $wrapperEl.transition('');
        }
        if (params.hide) {
          clearTimeout(swiper.scrollbar.dragTimeout);
          swiper.scrollbar.dragTimeout = Utils.nextTick(() => {
            $el.css('opacity', 0);
            $el.transition(400);
          }, 1000);
        }
        swiper.emit('scrollbarDragEnd', e);
        if (params.snapOnRelease) {
          swiper.slideToClosest();
        }
      },
      enableDraggable() {
        const swiper = this;
        if (!swiper.params.scrollbar.el) return;
        const {
          scrollbar, touchEventsTouch, touchEventsDesktop, params,
        } = swiper;
        const $el = scrollbar.$el;
        const target = $el[0];
        const activeListener = Support.passiveListener && params.passiveListeners ? { passive: false, capture: false } : false;
        const passiveListener = Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
        if (!Support.touch) {
          target.addEventListener(touchEventsDesktop.start, swiper.scrollbar.onDragStart, activeListener);
          doc.addEventListener(touchEventsDesktop.move, swiper.scrollbar.onDragMove, activeListener);
          doc.addEventListener(touchEventsDesktop.end, swiper.scrollbar.onDragEnd, passiveListener);
        } else {
          target.addEventListener(touchEventsTouch.start, swiper.scrollbar.onDragStart, activeListener);
          target.addEventListener(touchEventsTouch.move, swiper.scrollbar.onDragMove, activeListener);
          target.addEventListener(touchEventsTouch.end, swiper.scrollbar.onDragEnd, passiveListener);
        }
      },
      disableDraggable() {
        const swiper = this;
        if (!swiper.params.scrollbar.el) return;
        const {
          scrollbar, touchEventsTouch, touchEventsDesktop, params,
        } = swiper;
        const $el = scrollbar.$el;
        const target = $el[0];
        const activeListener = Support.passiveListener && params.passiveListeners ? { passive: false, capture: false } : false;
        const passiveListener = Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
        if (!Support.touch) {
          target.removeEventListener(touchEventsDesktop.start, swiper.scrollbar.onDragStart, activeListener);
          doc.removeEventListener(touchEventsDesktop.move, swiper.scrollbar.onDragMove, activeListener);
          doc.removeEventListener(touchEventsDesktop.end, swiper.scrollbar.onDragEnd, passiveListener);
        } else {
          target.removeEventListener(touchEventsTouch.start, swiper.scrollbar.onDragStart, activeListener);
          target.removeEventListener(touchEventsTouch.move, swiper.scrollbar.onDragMove, activeListener);
          target.removeEventListener(touchEventsTouch.end, swiper.scrollbar.onDragEnd, passiveListener);
        }
      },
      init() {
        const swiper = this;
        if (!swiper.params.scrollbar.el) return;
        const { scrollbar, $el: $swiperEl } = swiper;
        const params = swiper.params.scrollbar;

        let $el = $(params.el);
        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1 && $swiperEl.find(params.el).length === 1) {
          $el = $swiperEl.find(params.el);
        }

        let $dragEl = $el.find(`.${swiper.params.scrollbar.dragClass}`);
        if ($dragEl.length === 0) {
          $dragEl = $(`<div class="${swiper.params.scrollbar.dragClass}"></div>`);
          $el.append($dragEl);
        }

        Utils.extend(scrollbar, {
          $el,
          el: $el[0],
          $dragEl,
          dragEl: $dragEl[0],
        });

        if (params.draggable) {
          scrollbar.enableDraggable();
        }
      },
      destroy() {
        const swiper = this;
        swiper.scrollbar.disableDraggable();
      },
    };

    var Scrollbar$1 = {
      name: 'scrollbar',
      params: {
        scrollbar: {
          el: null,
          dragSize: 'auto',
          hide: false,
          draggable: false,
          snapOnRelease: true,
          lockClass: 'swiper-scrollbar-lock',
          dragClass: 'swiper-scrollbar-drag',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          scrollbar: {
            init: Scrollbar.init.bind(swiper),
            destroy: Scrollbar.destroy.bind(swiper),
            updateSize: Scrollbar.updateSize.bind(swiper),
            setTranslate: Scrollbar.setTranslate.bind(swiper),
            setTransition: Scrollbar.setTransition.bind(swiper),
            enableDraggable: Scrollbar.enableDraggable.bind(swiper),
            disableDraggable: Scrollbar.disableDraggable.bind(swiper),
            setDragPosition: Scrollbar.setDragPosition.bind(swiper),
            getPointerPosition: Scrollbar.getPointerPosition.bind(swiper),
            onDragStart: Scrollbar.onDragStart.bind(swiper),
            onDragMove: Scrollbar.onDragMove.bind(swiper),
            onDragEnd: Scrollbar.onDragEnd.bind(swiper),
            isTouched: false,
            timeout: null,
            dragTimeout: null,
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.scrollbar.init();
          swiper.scrollbar.updateSize();
          swiper.scrollbar.setTranslate();
        },
        update() {
          const swiper = this;
          swiper.scrollbar.updateSize();
        },
        resize() {
          const swiper = this;
          swiper.scrollbar.updateSize();
        },
        observerUpdate() {
          const swiper = this;
          swiper.scrollbar.updateSize();
        },
        setTranslate() {
          const swiper = this;
          swiper.scrollbar.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          swiper.scrollbar.setTransition(duration);
        },
        destroy() {
          const swiper = this;
          swiper.scrollbar.destroy();
        },
      },
    };

    const Parallax = {
      setTransform(el, progress) {
        const swiper = this;
        const { rtl } = swiper;

        const $el = $(el);
        const rtlFactor = rtl ? -1 : 1;

        const p = $el.attr('data-swiper-parallax') || '0';
        let x = $el.attr('data-swiper-parallax-x');
        let y = $el.attr('data-swiper-parallax-y');
        const scale = $el.attr('data-swiper-parallax-scale');
        const opacity = $el.attr('data-swiper-parallax-opacity');

        if (x || y) {
          x = x || '0';
          y = y || '0';
        } else if (swiper.isHorizontal()) {
          x = p;
          y = '0';
        } else {
          y = p;
          x = '0';
        }

        if ((x).indexOf('%') >= 0) {
          x = `${parseInt(x, 10) * progress * rtlFactor}%`;
        } else {
          x = `${x * progress * rtlFactor}px`;
        }
        if ((y).indexOf('%') >= 0) {
          y = `${parseInt(y, 10) * progress}%`;
        } else {
          y = `${y * progress}px`;
        }

        if (typeof opacity !== 'undefined' && opacity !== null) {
          const currentOpacity = opacity - ((opacity - 1) * (1 - Math.abs(progress)));
          $el[0].style.opacity = currentOpacity;
        }
        if (typeof scale === 'undefined' || scale === null) {
          $el.transform(`translate3d(${x}, ${y}, 0px)`);
        } else {
          const currentScale = scale - ((scale - 1) * (1 - Math.abs(progress)));
          $el.transform(`translate3d(${x}, ${y}, 0px) scale(${currentScale})`);
        }
      },
      setTranslate() {
        const swiper = this;
        const {
          $el, slides, progress, snapGrid,
        } = swiper;
        $el.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]')
          .each((index, el) => {
            swiper.parallax.setTransform(el, progress);
          });
        slides.each((slideIndex, slideEl) => {
          let slideProgress = slideEl.progress;
          if (swiper.params.slidesPerGroup > 1 && swiper.params.slidesPerView !== 'auto') {
            slideProgress += Math.ceil(slideIndex / 2) - (progress * (snapGrid.length - 1));
          }
          slideProgress = Math.min(Math.max(slideProgress, -1), 1);
          $(slideEl).find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]')
            .each((index, el) => {
              swiper.parallax.setTransform(el, slideProgress);
            });
        });
      },
      setTransition(duration = this.params.speed) {
        const swiper = this;
        const { $el } = swiper;
        $el.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]')
          .each((index, parallaxEl) => {
            const $parallaxEl = $(parallaxEl);
            let parallaxDuration = parseInt($parallaxEl.attr('data-swiper-parallax-duration'), 10) || duration;
            if (duration === 0) parallaxDuration = 0;
            $parallaxEl.transition(parallaxDuration);
          });
      },
    };

    var Parallax$1 = {
      name: 'parallax',
      params: {
        parallax: {
          enabled: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          parallax: {
            setTransform: Parallax.setTransform.bind(swiper),
            setTranslate: Parallax.setTranslate.bind(swiper),
            setTransition: Parallax.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.params.watchSlidesProgress = true;
          swiper.originalParams.watchSlidesProgress = true;
        },
        init() {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.parallax.setTranslate();
        },
        setTranslate() {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.parallax.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.parallax.setTransition(duration);
        },
      },
    };

    const Zoom = {
      // Calc Scale From Multi-touches
      getDistanceBetweenTouches(e) {
        if (e.targetTouches.length < 2) return 1;
        const x1 = e.targetTouches[0].pageX;
        const y1 = e.targetTouches[0].pageY;
        const x2 = e.targetTouches[1].pageX;
        const y2 = e.targetTouches[1].pageY;
        const distance = Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
        return distance;
      },
      // Events
      onGestureStart(e) {
        const swiper = this;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        zoom.fakeGestureTouched = false;
        zoom.fakeGestureMoved = false;
        if (!Support.gestures) {
          if (e.type !== 'touchstart' || (e.type === 'touchstart' && e.targetTouches.length < 2)) {
            return;
          }
          zoom.fakeGestureTouched = true;
          gesture.scaleStart = Zoom.getDistanceBetweenTouches(e);
        }
        if (!gesture.$slideEl || !gesture.$slideEl.length) {
          gesture.$slideEl = $(e.target).closest('.swiper-slide');
          if (gesture.$slideEl.length === 0) gesture.$slideEl = swiper.slides.eq(swiper.activeIndex);
          gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
          gesture.$imageWrapEl = gesture.$imageEl.parent(`.${params.containerClass}`);
          gesture.maxRatio = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
          if (gesture.$imageWrapEl.length === 0) {
            gesture.$imageEl = undefined;
            return;
          }
        }
        gesture.$imageEl.transition(0);
        swiper.zoom.isScaling = true;
      },
      onGestureChange(e) {
        const swiper = this;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        if (!Support.gestures) {
          if (e.type !== 'touchmove' || (e.type === 'touchmove' && e.targetTouches.length < 2)) {
            return;
          }
          zoom.fakeGestureMoved = true;
          gesture.scaleMove = Zoom.getDistanceBetweenTouches(e);
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        if (Support.gestures) {
          zoom.scale = e.scale * zoom.currentScale;
        } else {
          zoom.scale = (gesture.scaleMove / gesture.scaleStart) * zoom.currentScale;
        }
        if (zoom.scale > gesture.maxRatio) {
          zoom.scale = (gesture.maxRatio - 1) + (((zoom.scale - gesture.maxRatio) + 1) ** 0.5);
        }
        if (zoom.scale < params.minRatio) {
          zoom.scale = (params.minRatio + 1) - (((params.minRatio - zoom.scale) + 1) ** 0.5);
        }
        gesture.$imageEl.transform(`translate3d(0,0,0) scale(${zoom.scale})`);
      },
      onGestureEnd(e) {
        const swiper = this;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        if (!Support.gestures) {
          if (!zoom.fakeGestureTouched || !zoom.fakeGestureMoved) {
            return;
          }
          if (e.type !== 'touchend' || (e.type === 'touchend' && e.changedTouches.length < 2 && !Device.android)) {
            return;
          }
          zoom.fakeGestureTouched = false;
          zoom.fakeGestureMoved = false;
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        zoom.scale = Math.max(Math.min(zoom.scale, gesture.maxRatio), params.minRatio);
        gesture.$imageEl.transition(swiper.params.speed).transform(`translate3d(0,0,0) scale(${zoom.scale})`);
        zoom.currentScale = zoom.scale;
        zoom.isScaling = false;
        if (zoom.scale === 1) gesture.$slideEl = undefined;
      },
      onTouchStart(e) {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture, image } = zoom;
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        if (image.isTouched) return;
        if (Device.android) e.preventDefault();
        image.isTouched = true;
        image.touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        image.touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      },
      onTouchMove(e) {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture, image, velocity } = zoom;
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        swiper.allowClick = false;
        if (!image.isTouched || !gesture.$slideEl) return;

        if (!image.isMoved) {
          image.width = gesture.$imageEl[0].offsetWidth;
          image.height = gesture.$imageEl[0].offsetHeight;
          image.startX = Utils.getTranslate(gesture.$imageWrapEl[0], 'x') || 0;
          image.startY = Utils.getTranslate(gesture.$imageWrapEl[0], 'y') || 0;
          gesture.slideWidth = gesture.$slideEl[0].offsetWidth;
          gesture.slideHeight = gesture.$slideEl[0].offsetHeight;
          gesture.$imageWrapEl.transition(0);
          if (swiper.rtl) {
            image.startX = -image.startX;
            image.startY = -image.startY;
          }
        }
        // Define if we need image drag
        const scaledWidth = image.width * zoom.scale;
        const scaledHeight = image.height * zoom.scale;

        if (scaledWidth < gesture.slideWidth && scaledHeight < gesture.slideHeight) return;

        image.minX = Math.min(((gesture.slideWidth / 2) - (scaledWidth / 2)), 0);
        image.maxX = -image.minX;
        image.minY = Math.min(((gesture.slideHeight / 2) - (scaledHeight / 2)), 0);
        image.maxY = -image.minY;

        image.touchesCurrent.x = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        image.touchesCurrent.y = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

        if (!image.isMoved && !zoom.isScaling) {
          if (
            swiper.isHorizontal()
            && (
              (Math.floor(image.minX) === Math.floor(image.startX) && image.touchesCurrent.x < image.touchesStart.x)
              || (Math.floor(image.maxX) === Math.floor(image.startX) && image.touchesCurrent.x > image.touchesStart.x)
            )
          ) {
            image.isTouched = false;
            return;
          } if (
            !swiper.isHorizontal()
            && (
              (Math.floor(image.minY) === Math.floor(image.startY) && image.touchesCurrent.y < image.touchesStart.y)
              || (Math.floor(image.maxY) === Math.floor(image.startY) && image.touchesCurrent.y > image.touchesStart.y)
            )
          ) {
            image.isTouched = false;
            return;
          }
        }
        e.preventDefault();
        e.stopPropagation();

        image.isMoved = true;
        image.currentX = (image.touchesCurrent.x - image.touchesStart.x) + image.startX;
        image.currentY = (image.touchesCurrent.y - image.touchesStart.y) + image.startY;

        if (image.currentX < image.minX) {
          image.currentX = (image.minX + 1) - (((image.minX - image.currentX) + 1) ** 0.8);
        }
        if (image.currentX > image.maxX) {
          image.currentX = (image.maxX - 1) + (((image.currentX - image.maxX) + 1) ** 0.8);
        }

        if (image.currentY < image.minY) {
          image.currentY = (image.minY + 1) - (((image.minY - image.currentY) + 1) ** 0.8);
        }
        if (image.currentY > image.maxY) {
          image.currentY = (image.maxY - 1) + (((image.currentY - image.maxY) + 1) ** 0.8);
        }

        // Velocity
        if (!velocity.prevPositionX) velocity.prevPositionX = image.touchesCurrent.x;
        if (!velocity.prevPositionY) velocity.prevPositionY = image.touchesCurrent.y;
        if (!velocity.prevTime) velocity.prevTime = Date.now();
        velocity.x = (image.touchesCurrent.x - velocity.prevPositionX) / (Date.now() - velocity.prevTime) / 2;
        velocity.y = (image.touchesCurrent.y - velocity.prevPositionY) / (Date.now() - velocity.prevTime) / 2;
        if (Math.abs(image.touchesCurrent.x - velocity.prevPositionX) < 2) velocity.x = 0;
        if (Math.abs(image.touchesCurrent.y - velocity.prevPositionY) < 2) velocity.y = 0;
        velocity.prevPositionX = image.touchesCurrent.x;
        velocity.prevPositionY = image.touchesCurrent.y;
        velocity.prevTime = Date.now();

        gesture.$imageWrapEl.transform(`translate3d(${image.currentX}px, ${image.currentY}px,0)`);
      },
      onTouchEnd() {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture, image, velocity } = zoom;
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        if (!image.isTouched || !image.isMoved) {
          image.isTouched = false;
          image.isMoved = false;
          return;
        }
        image.isTouched = false;
        image.isMoved = false;
        let momentumDurationX = 300;
        let momentumDurationY = 300;
        const momentumDistanceX = velocity.x * momentumDurationX;
        const newPositionX = image.currentX + momentumDistanceX;
        const momentumDistanceY = velocity.y * momentumDurationY;
        const newPositionY = image.currentY + momentumDistanceY;

        // Fix duration
        if (velocity.x !== 0) momentumDurationX = Math.abs((newPositionX - image.currentX) / velocity.x);
        if (velocity.y !== 0) momentumDurationY = Math.abs((newPositionY - image.currentY) / velocity.y);
        const momentumDuration = Math.max(momentumDurationX, momentumDurationY);

        image.currentX = newPositionX;
        image.currentY = newPositionY;

        // Define if we need image drag
        const scaledWidth = image.width * zoom.scale;
        const scaledHeight = image.height * zoom.scale;
        image.minX = Math.min(((gesture.slideWidth / 2) - (scaledWidth / 2)), 0);
        image.maxX = -image.minX;
        image.minY = Math.min(((gesture.slideHeight / 2) - (scaledHeight / 2)), 0);
        image.maxY = -image.minY;
        image.currentX = Math.max(Math.min(image.currentX, image.maxX), image.minX);
        image.currentY = Math.max(Math.min(image.currentY, image.maxY), image.minY);

        gesture.$imageWrapEl.transition(momentumDuration).transform(`translate3d(${image.currentX}px, ${image.currentY}px,0)`);
      },
      onTransitionEnd() {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        if (gesture.$slideEl && swiper.previousIndex !== swiper.activeIndex) {
          gesture.$imageEl.transform('translate3d(0,0,0) scale(1)');
          gesture.$imageWrapEl.transform('translate3d(0,0,0)');

          zoom.scale = 1;
          zoom.currentScale = 1;

          gesture.$slideEl = undefined;
          gesture.$imageEl = undefined;
          gesture.$imageWrapEl = undefined;
        }
      },
      // Toggle Zoom
      toggle(e) {
        const swiper = this;
        const zoom = swiper.zoom;

        if (zoom.scale && zoom.scale !== 1) {
          // Zoom Out
          zoom.out();
        } else {
          // Zoom In
          zoom.in(e);
        }
      },
      in(e) {
        const swiper = this;

        const zoom = swiper.zoom;
        const params = swiper.params.zoom;
        const { gesture, image } = zoom;

        if (!gesture.$slideEl) {
          gesture.$slideEl = swiper.clickedSlide ? $(swiper.clickedSlide) : swiper.slides.eq(swiper.activeIndex);
          gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
          gesture.$imageWrapEl = gesture.$imageEl.parent(`.${params.containerClass}`);
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;

        gesture.$slideEl.addClass(`${params.zoomedSlideClass}`);

        let touchX;
        let touchY;
        let offsetX;
        let offsetY;
        let diffX;
        let diffY;
        let translateX;
        let translateY;
        let imageWidth;
        let imageHeight;
        let scaledWidth;
        let scaledHeight;
        let translateMinX;
        let translateMinY;
        let translateMaxX;
        let translateMaxY;
        let slideWidth;
        let slideHeight;

        if (typeof image.touchesStart.x === 'undefined' && e) {
          touchX = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
          touchY = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
        } else {
          touchX = image.touchesStart.x;
          touchY = image.touchesStart.y;
        }

        zoom.scale = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
        zoom.currentScale = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
        if (e) {
          slideWidth = gesture.$slideEl[0].offsetWidth;
          slideHeight = gesture.$slideEl[0].offsetHeight;
          offsetX = gesture.$slideEl.offset().left;
          offsetY = gesture.$slideEl.offset().top;
          diffX = (offsetX + (slideWidth / 2)) - touchX;
          diffY = (offsetY + (slideHeight / 2)) - touchY;

          imageWidth = gesture.$imageEl[0].offsetWidth;
          imageHeight = gesture.$imageEl[0].offsetHeight;
          scaledWidth = imageWidth * zoom.scale;
          scaledHeight = imageHeight * zoom.scale;

          translateMinX = Math.min(((slideWidth / 2) - (scaledWidth / 2)), 0);
          translateMinY = Math.min(((slideHeight / 2) - (scaledHeight / 2)), 0);
          translateMaxX = -translateMinX;
          translateMaxY = -translateMinY;

          translateX = diffX * zoom.scale;
          translateY = diffY * zoom.scale;

          if (translateX < translateMinX) {
            translateX = translateMinX;
          }
          if (translateX > translateMaxX) {
            translateX = translateMaxX;
          }

          if (translateY < translateMinY) {
            translateY = translateMinY;
          }
          if (translateY > translateMaxY) {
            translateY = translateMaxY;
          }
        } else {
          translateX = 0;
          translateY = 0;
        }
        gesture.$imageWrapEl.transition(300).transform(`translate3d(${translateX}px, ${translateY}px,0)`);
        gesture.$imageEl.transition(300).transform(`translate3d(0,0,0) scale(${zoom.scale})`);
      },
      out() {
        const swiper = this;

        const zoom = swiper.zoom;
        const params = swiper.params.zoom;
        const { gesture } = zoom;

        if (!gesture.$slideEl) {
          gesture.$slideEl = swiper.clickedSlide ? $(swiper.clickedSlide) : swiper.slides.eq(swiper.activeIndex);
          gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
          gesture.$imageWrapEl = gesture.$imageEl.parent(`.${params.containerClass}`);
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;

        zoom.scale = 1;
        zoom.currentScale = 1;
        gesture.$imageWrapEl.transition(300).transform('translate3d(0,0,0)');
        gesture.$imageEl.transition(300).transform('translate3d(0,0,0) scale(1)');
        gesture.$slideEl.removeClass(`${params.zoomedSlideClass}`);
        gesture.$slideEl = undefined;
      },
      // Attach/Detach Events
      enable() {
        const swiper = this;
        const zoom = swiper.zoom;
        if (zoom.enabled) return;
        zoom.enabled = true;

        const passiveListener = swiper.touchEvents.start === 'touchstart' && Support.passiveListener && swiper.params.passiveListeners ? { passive: true, capture: false } : false;
        const activeListenerWithCapture = Support.passiveListener ? { passive: false, capture: true } : true;

        // Scale image
        if (Support.gestures) {
          swiper.$wrapperEl.on('gesturestart', '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.on('gesturechange', '.swiper-slide', zoom.onGestureChange, passiveListener);
          swiper.$wrapperEl.on('gestureend', '.swiper-slide', zoom.onGestureEnd, passiveListener);
        } else if (swiper.touchEvents.start === 'touchstart') {
          swiper.$wrapperEl.on(swiper.touchEvents.start, '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.on(swiper.touchEvents.move, '.swiper-slide', zoom.onGestureChange, activeListenerWithCapture);
          swiper.$wrapperEl.on(swiper.touchEvents.end, '.swiper-slide', zoom.onGestureEnd, passiveListener);
          if (swiper.touchEvents.cancel) {
            swiper.$wrapperEl.on(swiper.touchEvents.cancel, '.swiper-slide', zoom.onGestureEnd, passiveListener);
          }
        }

        // Move image
        swiper.$wrapperEl.on(swiper.touchEvents.move, `.${swiper.params.zoom.containerClass}`, zoom.onTouchMove, activeListenerWithCapture);
      },
      disable() {
        const swiper = this;
        const zoom = swiper.zoom;
        if (!zoom.enabled) return;

        swiper.zoom.enabled = false;

        const passiveListener = swiper.touchEvents.start === 'touchstart' && Support.passiveListener && swiper.params.passiveListeners ? { passive: true, capture: false } : false;
        const activeListenerWithCapture = Support.passiveListener ? { passive: false, capture: true } : true;

        // Scale image
        if (Support.gestures) {
          swiper.$wrapperEl.off('gesturestart', '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.off('gesturechange', '.swiper-slide', zoom.onGestureChange, passiveListener);
          swiper.$wrapperEl.off('gestureend', '.swiper-slide', zoom.onGestureEnd, passiveListener);
        } else if (swiper.touchEvents.start === 'touchstart') {
          swiper.$wrapperEl.off(swiper.touchEvents.start, '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.off(swiper.touchEvents.move, '.swiper-slide', zoom.onGestureChange, activeListenerWithCapture);
          swiper.$wrapperEl.off(swiper.touchEvents.end, '.swiper-slide', zoom.onGestureEnd, passiveListener);
          if (swiper.touchEvents.cancel) {
            swiper.$wrapperEl.off(swiper.touchEvents.cancel, '.swiper-slide', zoom.onGestureEnd, passiveListener);
          }
        }

        // Move image
        swiper.$wrapperEl.off(swiper.touchEvents.move, `.${swiper.params.zoom.containerClass}`, zoom.onTouchMove, activeListenerWithCapture);
      },
    };

    var Zoom$1 = {
      name: 'zoom',
      params: {
        zoom: {
          enabled: false,
          maxRatio: 3,
          minRatio: 1,
          toggle: true,
          containerClass: 'swiper-zoom-container',
          zoomedSlideClass: 'swiper-slide-zoomed',
        },
      },
      create() {
        const swiper = this;
        const zoom = {
          enabled: false,
          scale: 1,
          currentScale: 1,
          isScaling: false,
          gesture: {
            $slideEl: undefined,
            slideWidth: undefined,
            slideHeight: undefined,
            $imageEl: undefined,
            $imageWrapEl: undefined,
            maxRatio: 3,
          },
          image: {
            isTouched: undefined,
            isMoved: undefined,
            currentX: undefined,
            currentY: undefined,
            minX: undefined,
            minY: undefined,
            maxX: undefined,
            maxY: undefined,
            width: undefined,
            height: undefined,
            startX: undefined,
            startY: undefined,
            touchesStart: {},
            touchesCurrent: {},
          },
          velocity: {
            x: undefined,
            y: undefined,
            prevPositionX: undefined,
            prevPositionY: undefined,
            prevTime: undefined,
          },
        };

        ('onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out').split(' ').forEach((methodName) => {
          zoom[methodName] = Zoom[methodName].bind(swiper);
        });
        Utils.extend(swiper, {
          zoom,
        });

        let scale = 1;
        Object.defineProperty(swiper.zoom, 'scale', {
          get() {
            return scale;
          },
          set(value) {
            if (scale !== value) {
              const imageEl = swiper.zoom.gesture.$imageEl ? swiper.zoom.gesture.$imageEl[0] : undefined;
              const slideEl = swiper.zoom.gesture.$slideEl ? swiper.zoom.gesture.$slideEl[0] : undefined;
              swiper.emit('zoomChange', value, imageEl, slideEl);
            }
            scale = value;
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.zoom.enabled) {
            swiper.zoom.enable();
          }
        },
        destroy() {
          const swiper = this;
          swiper.zoom.disable();
        },
        touchStart(e) {
          const swiper = this;
          if (!swiper.zoom.enabled) return;
          swiper.zoom.onTouchStart(e);
        },
        touchEnd(e) {
          const swiper = this;
          if (!swiper.zoom.enabled) return;
          swiper.zoom.onTouchEnd(e);
        },
        doubleTap(e) {
          const swiper = this;
          if (swiper.params.zoom.enabled && swiper.zoom.enabled && swiper.params.zoom.toggle) {
            swiper.zoom.toggle(e);
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.zoom.enabled && swiper.params.zoom.enabled) {
            swiper.zoom.onTransitionEnd();
          }
        },
        slideChange() {
          const swiper = this;
          if (swiper.zoom.enabled && swiper.params.zoom.enabled && swiper.params.cssMode) {
            swiper.zoom.onTransitionEnd();
          }
        },
      },
    };

    const Lazy = {
      loadInSlide(index, loadInDuplicate = true) {
        const swiper = this;
        const params = swiper.params.lazy;
        if (typeof index === 'undefined') return;
        if (swiper.slides.length === 0) return;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

        const $slideEl = isVirtual
          ? swiper.$wrapperEl.children(`.${swiper.params.slideClass}[data-swiper-slide-index="${index}"]`)
          : swiper.slides.eq(index);

        let $images = $slideEl.find(`.${params.elementClass}:not(.${params.loadedClass}):not(.${params.loadingClass})`);
        if ($slideEl.hasClass(params.elementClass) && !$slideEl.hasClass(params.loadedClass) && !$slideEl.hasClass(params.loadingClass)) {
          $images = $images.add($slideEl[0]);
        }
        if ($images.length === 0) return;

        $images.each((imageIndex, imageEl) => {
          const $imageEl = $(imageEl);
          $imageEl.addClass(params.loadingClass);

          const background = $imageEl.attr('data-background');
          const src = $imageEl.attr('data-src');
          const srcset = $imageEl.attr('data-srcset');
          const sizes = $imageEl.attr('data-sizes');

          swiper.loadImage($imageEl[0], (src || background), srcset, sizes, false, () => {
            if (typeof swiper === 'undefined' || swiper === null || !swiper || (swiper && !swiper.params) || swiper.destroyed) return;
            if (background) {
              $imageEl.css('background-image', `url("${background}")`);
              $imageEl.removeAttr('data-background');
            } else {
              if (srcset) {
                $imageEl.attr('srcset', srcset);
                $imageEl.removeAttr('data-srcset');
              }
              if (sizes) {
                $imageEl.attr('sizes', sizes);
                $imageEl.removeAttr('data-sizes');
              }
              if (src) {
                $imageEl.attr('src', src);
                $imageEl.removeAttr('data-src');
              }
            }

            $imageEl.addClass(params.loadedClass).removeClass(params.loadingClass);
            $slideEl.find(`.${params.preloaderClass}`).remove();
            if (swiper.params.loop && loadInDuplicate) {
              const slideOriginalIndex = $slideEl.attr('data-swiper-slide-index');
              if ($slideEl.hasClass(swiper.params.slideDuplicateClass)) {
                const originalSlide = swiper.$wrapperEl.children(`[data-swiper-slide-index="${slideOriginalIndex}"]:not(.${swiper.params.slideDuplicateClass})`);
                swiper.lazy.loadInSlide(originalSlide.index(), false);
              } else {
                const duplicatedSlide = swiper.$wrapperEl.children(`.${swiper.params.slideDuplicateClass}[data-swiper-slide-index="${slideOriginalIndex}"]`);
                swiper.lazy.loadInSlide(duplicatedSlide.index(), false);
              }
            }
            swiper.emit('lazyImageReady', $slideEl[0], $imageEl[0]);
          });

          swiper.emit('lazyImageLoad', $slideEl[0], $imageEl[0]);
        });
      },
      load() {
        const swiper = this;
        const {
          $wrapperEl, params: swiperParams, slides, activeIndex,
        } = swiper;
        const isVirtual = swiper.virtual && swiperParams.virtual.enabled;
        const params = swiperParams.lazy;

        let slidesPerView = swiperParams.slidesPerView;
        if (slidesPerView === 'auto') {
          slidesPerView = 0;
        }

        function slideExist(index) {
          if (isVirtual) {
            if ($wrapperEl.children(`.${swiperParams.slideClass}[data-swiper-slide-index="${index}"]`).length) {
              return true;
            }
          } else if (slides[index]) return true;
          return false;
        }
        function slideIndex(slideEl) {
          if (isVirtual) {
            return $(slideEl).attr('data-swiper-slide-index');
          }
          return $(slideEl).index();
        }

        if (!swiper.lazy.initialImageLoaded) swiper.lazy.initialImageLoaded = true;
        if (swiper.params.watchSlidesVisibility) {
          $wrapperEl.children(`.${swiperParams.slideVisibleClass}`).each((elIndex, slideEl) => {
            const index = isVirtual ? $(slideEl).attr('data-swiper-slide-index') : $(slideEl).index();
            swiper.lazy.loadInSlide(index);
          });
        } else if (slidesPerView > 1) {
          for (let i = activeIndex; i < activeIndex + slidesPerView; i += 1) {
            if (slideExist(i)) swiper.lazy.loadInSlide(i);
          }
        } else {
          swiper.lazy.loadInSlide(activeIndex);
        }
        if (params.loadPrevNext) {
          if (slidesPerView > 1 || (params.loadPrevNextAmount && params.loadPrevNextAmount > 1)) {
            const amount = params.loadPrevNextAmount;
            const spv = slidesPerView;
            const maxIndex = Math.min(activeIndex + spv + Math.max(amount, spv), slides.length);
            const minIndex = Math.max(activeIndex - Math.max(spv, amount), 0);
            // Next Slides
            for (let i = activeIndex + slidesPerView; i < maxIndex; i += 1) {
              if (slideExist(i)) swiper.lazy.loadInSlide(i);
            }
            // Prev Slides
            for (let i = minIndex; i < activeIndex; i += 1) {
              if (slideExist(i)) swiper.lazy.loadInSlide(i);
            }
          } else {
            const nextSlide = $wrapperEl.children(`.${swiperParams.slideNextClass}`);
            if (nextSlide.length > 0) swiper.lazy.loadInSlide(slideIndex(nextSlide));

            const prevSlide = $wrapperEl.children(`.${swiperParams.slidePrevClass}`);
            if (prevSlide.length > 0) swiper.lazy.loadInSlide(slideIndex(prevSlide));
          }
        }
      },
    };

    var Lazy$1 = {
      name: 'lazy',
      params: {
        lazy: {
          enabled: false,
          loadPrevNext: false,
          loadPrevNextAmount: 1,
          loadOnTransitionStart: false,

          elementClass: 'swiper-lazy',
          loadingClass: 'swiper-lazy-loading',
          loadedClass: 'swiper-lazy-loaded',
          preloaderClass: 'swiper-lazy-preloader',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          lazy: {
            initialImageLoaded: false,
            load: Lazy.load.bind(swiper),
            loadInSlide: Lazy.loadInSlide.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.lazy.enabled && swiper.params.preloadImages) {
            swiper.params.preloadImages = false;
          }
        },
        init() {
          const swiper = this;
          if (swiper.params.lazy.enabled && !swiper.params.loop && swiper.params.initialSlide === 0) {
            swiper.lazy.load();
          }
        },
        scroll() {
          const swiper = this;
          if (swiper.params.freeMode && !swiper.params.freeModeSticky) {
            swiper.lazy.load();
          }
        },
        resize() {
          const swiper = this;
          if (swiper.params.lazy.enabled) {
            swiper.lazy.load();
          }
        },
        scrollbarDragMove() {
          const swiper = this;
          if (swiper.params.lazy.enabled) {
            swiper.lazy.load();
          }
        },
        transitionStart() {
          const swiper = this;
          if (swiper.params.lazy.enabled) {
            if (swiper.params.lazy.loadOnTransitionStart || (!swiper.params.lazy.loadOnTransitionStart && !swiper.lazy.initialImageLoaded)) {
              swiper.lazy.load();
            }
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.params.lazy.enabled && !swiper.params.lazy.loadOnTransitionStart) {
            swiper.lazy.load();
          }
        },
        slideChange() {
          const swiper = this;
          if (swiper.params.lazy.enabled && swiper.params.cssMode) {
            swiper.lazy.load();
          }
        },
      },
    };

    /* eslint no-bitwise: ["error", { "allow": [">>"] }] */

    const Controller = {
      LinearSpline: function LinearSpline(x, y) {
        const binarySearch = (function search() {
          let maxIndex;
          let minIndex;
          let guess;
          return (array, val) => {
            minIndex = -1;
            maxIndex = array.length;
            while (maxIndex - minIndex > 1) {
              guess = maxIndex + minIndex >> 1;
              if (array[guess] <= val) {
                minIndex = guess;
              } else {
                maxIndex = guess;
              }
            }
            return maxIndex;
          };
        }());
        this.x = x;
        this.y = y;
        this.lastIndex = x.length - 1;
        // Given an x value (x2), return the expected y2 value:
        // (x1,y1) is the known point before given value,
        // (x3,y3) is the known point after given value.
        let i1;
        let i3;

        this.interpolate = function interpolate(x2) {
          if (!x2) return 0;

          // Get the indexes of x1 and x3 (the array indexes before and after given x2):
          i3 = binarySearch(this.x, x2);
          i1 = i3 - 1;

          // We have our indexes i1 & i3, so we can calculate already:
          // y2 := ((x2−x1) × (y3−y1)) ÷ (x3−x1) + y1
          return (((x2 - this.x[i1]) * (this.y[i3] - this.y[i1])) / (this.x[i3] - this.x[i1])) + this.y[i1];
        };
        return this;
      },
      // xxx: for now i will just save one spline function to to
      getInterpolateFunction(c) {
        const swiper = this;
        if (!swiper.controller.spline) {
          swiper.controller.spline = swiper.params.loop
            ? new Controller.LinearSpline(swiper.slidesGrid, c.slidesGrid)
            : new Controller.LinearSpline(swiper.snapGrid, c.snapGrid);
        }
      },
      setTranslate(setTranslate, byController) {
        const swiper = this;
        const controlled = swiper.controller.control;
        let multiplier;
        let controlledTranslate;
        function setControlledTranslate(c) {
          // this will create an Interpolate function based on the snapGrids
          // x is the Grid of the scrolled scroller and y will be the controlled scroller
          // it makes sense to create this only once and recall it for the interpolation
          // the function does a lot of value caching for performance
          const translate = swiper.rtlTranslate ? -swiper.translate : swiper.translate;
          if (swiper.params.controller.by === 'slide') {
            swiper.controller.getInterpolateFunction(c);
            // i am not sure why the values have to be multiplicated this way, tried to invert the snapGrid
            // but it did not work out
            controlledTranslate = -swiper.controller.spline.interpolate(-translate);
          }

          if (!controlledTranslate || swiper.params.controller.by === 'container') {
            multiplier = (c.maxTranslate() - c.minTranslate()) / (swiper.maxTranslate() - swiper.minTranslate());
            controlledTranslate = ((translate - swiper.minTranslate()) * multiplier) + c.minTranslate();
          }

          if (swiper.params.controller.inverse) {
            controlledTranslate = c.maxTranslate() - controlledTranslate;
          }
          c.updateProgress(controlledTranslate);
          c.setTranslate(controlledTranslate, swiper);
          c.updateActiveIndex();
          c.updateSlidesClasses();
        }
        if (Array.isArray(controlled)) {
          for (let i = 0; i < controlled.length; i += 1) {
            if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
              setControlledTranslate(controlled[i]);
            }
          }
        } else if (controlled instanceof Swiper && byController !== controlled) {
          setControlledTranslate(controlled);
        }
      },
      setTransition(duration, byController) {
        const swiper = this;
        const controlled = swiper.controller.control;
        let i;
        function setControlledTransition(c) {
          c.setTransition(duration, swiper);
          if (duration !== 0) {
            c.transitionStart();
            if (c.params.autoHeight) {
              Utils.nextTick(() => {
                c.updateAutoHeight();
              });
            }
            c.$wrapperEl.transitionEnd(() => {
              if (!controlled) return;
              if (c.params.loop && swiper.params.controller.by === 'slide') {
                c.loopFix();
              }
              c.transitionEnd();
            });
          }
        }
        if (Array.isArray(controlled)) {
          for (i = 0; i < controlled.length; i += 1) {
            if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
              setControlledTransition(controlled[i]);
            }
          }
        } else if (controlled instanceof Swiper && byController !== controlled) {
          setControlledTransition(controlled);
        }
      },
    };
    var Controller$1 = {
      name: 'controller',
      params: {
        controller: {
          control: undefined,
          inverse: false,
          by: 'slide', // or 'container'
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          controller: {
            control: swiper.params.controller.control,
            getInterpolateFunction: Controller.getInterpolateFunction.bind(swiper),
            setTranslate: Controller.setTranslate.bind(swiper),
            setTransition: Controller.setTransition.bind(swiper),
          },
        });
      },
      on: {
        update() {
          const swiper = this;
          if (!swiper.controller.control) return;
          if (swiper.controller.spline) {
            swiper.controller.spline = undefined;
            delete swiper.controller.spline;
          }
        },
        resize() {
          const swiper = this;
          if (!swiper.controller.control) return;
          if (swiper.controller.spline) {
            swiper.controller.spline = undefined;
            delete swiper.controller.spline;
          }
        },
        observerUpdate() {
          const swiper = this;
          if (!swiper.controller.control) return;
          if (swiper.controller.spline) {
            swiper.controller.spline = undefined;
            delete swiper.controller.spline;
          }
        },
        setTranslate(translate, byController) {
          const swiper = this;
          if (!swiper.controller.control) return;
          swiper.controller.setTranslate(translate, byController);
        },
        setTransition(duration, byController) {
          const swiper = this;
          if (!swiper.controller.control) return;
          swiper.controller.setTransition(duration, byController);
        },
      },
    };

    const a11y = {
      makeElFocusable($el) {
        $el.attr('tabIndex', '0');
        return $el;
      },
      addElRole($el, role) {
        $el.attr('role', role);
        return $el;
      },
      addElLabel($el, label) {
        $el.attr('aria-label', label);
        return $el;
      },
      disableEl($el) {
        $el.attr('aria-disabled', true);
        return $el;
      },
      enableEl($el) {
        $el.attr('aria-disabled', false);
        return $el;
      },
      onEnterKey(e) {
        const swiper = this;
        const params = swiper.params.a11y;
        if (e.keyCode !== 13) return;
        const $targetEl = $(e.target);
        if (swiper.navigation && swiper.navigation.$nextEl && $targetEl.is(swiper.navigation.$nextEl)) {
          if (!(swiper.isEnd && !swiper.params.loop)) {
            swiper.slideNext();
          }
          if (swiper.isEnd) {
            swiper.a11y.notify(params.lastSlideMessage);
          } else {
            swiper.a11y.notify(params.nextSlideMessage);
          }
        }
        if (swiper.navigation && swiper.navigation.$prevEl && $targetEl.is(swiper.navigation.$prevEl)) {
          if (!(swiper.isBeginning && !swiper.params.loop)) {
            swiper.slidePrev();
          }
          if (swiper.isBeginning) {
            swiper.a11y.notify(params.firstSlideMessage);
          } else {
            swiper.a11y.notify(params.prevSlideMessage);
          }
        }
        if (swiper.pagination && $targetEl.is(`.${swiper.params.pagination.bulletClass}`)) {
          $targetEl[0].click();
        }
      },
      notify(message) {
        const swiper = this;
        const notification = swiper.a11y.liveRegion;
        if (notification.length === 0) return;
        notification.html('');
        notification.html(message);
      },
      updateNavigation() {
        const swiper = this;

        if (swiper.params.loop || !swiper.navigation) return;
        const { $nextEl, $prevEl } = swiper.navigation;

        if ($prevEl && $prevEl.length > 0) {
          if (swiper.isBeginning) {
            swiper.a11y.disableEl($prevEl);
          } else {
            swiper.a11y.enableEl($prevEl);
          }
        }
        if ($nextEl && $nextEl.length > 0) {
          if (swiper.isEnd) {
            swiper.a11y.disableEl($nextEl);
          } else {
            swiper.a11y.enableEl($nextEl);
          }
        }
      },
      updatePagination() {
        const swiper = this;
        const params = swiper.params.a11y;
        if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
          swiper.pagination.bullets.each((bulletIndex, bulletEl) => {
            const $bulletEl = $(bulletEl);
            swiper.a11y.makeElFocusable($bulletEl);
            swiper.a11y.addElRole($bulletEl, 'button');
            swiper.a11y.addElLabel($bulletEl, params.paginationBulletMessage.replace(/{{index}}/, $bulletEl.index() + 1));
          });
        }
      },
      init() {
        const swiper = this;

        swiper.$el.append(swiper.a11y.liveRegion);

        // Navigation
        const params = swiper.params.a11y;
        let $nextEl;
        let $prevEl;
        if (swiper.navigation && swiper.navigation.$nextEl) {
          $nextEl = swiper.navigation.$nextEl;
        }
        if (swiper.navigation && swiper.navigation.$prevEl) {
          $prevEl = swiper.navigation.$prevEl;
        }
        if ($nextEl) {
          swiper.a11y.makeElFocusable($nextEl);
          swiper.a11y.addElRole($nextEl, 'button');
          swiper.a11y.addElLabel($nextEl, params.nextSlideMessage);
          $nextEl.on('keydown', swiper.a11y.onEnterKey);
        }
        if ($prevEl) {
          swiper.a11y.makeElFocusable($prevEl);
          swiper.a11y.addElRole($prevEl, 'button');
          swiper.a11y.addElLabel($prevEl, params.prevSlideMessage);
          $prevEl.on('keydown', swiper.a11y.onEnterKey);
        }

        // Pagination
        if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
          swiper.pagination.$el.on('keydown', `.${swiper.params.pagination.bulletClass}`, swiper.a11y.onEnterKey);
        }
      },
      destroy() {
        const swiper = this;
        if (swiper.a11y.liveRegion && swiper.a11y.liveRegion.length > 0) swiper.a11y.liveRegion.remove();

        let $nextEl;
        let $prevEl;
        if (swiper.navigation && swiper.navigation.$nextEl) {
          $nextEl = swiper.navigation.$nextEl;
        }
        if (swiper.navigation && swiper.navigation.$prevEl) {
          $prevEl = swiper.navigation.$prevEl;
        }
        if ($nextEl) {
          $nextEl.off('keydown', swiper.a11y.onEnterKey);
        }
        if ($prevEl) {
          $prevEl.off('keydown', swiper.a11y.onEnterKey);
        }

        // Pagination
        if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
          swiper.pagination.$el.off('keydown', `.${swiper.params.pagination.bulletClass}`, swiper.a11y.onEnterKey);
        }
      },
    };
    var A11y = {
      name: 'a11y',
      params: {
        a11y: {
          enabled: true,
          notificationClass: 'swiper-notification',
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          firstSlideMessage: 'This is the first slide',
          lastSlideMessage: 'This is the last slide',
          paginationBulletMessage: 'Go to slide {{index}}',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          a11y: {
            liveRegion: $(`<span class="${swiper.params.a11y.notificationClass}" aria-live="assertive" aria-atomic="true"></span>`),
          },
        });
        Object.keys(a11y).forEach((methodName) => {
          swiper.a11y[methodName] = a11y[methodName].bind(swiper);
        });
      },
      on: {
        init() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.init();
          swiper.a11y.updateNavigation();
        },
        toEdge() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.updateNavigation();
        },
        fromEdge() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.updateNavigation();
        },
        paginationUpdate() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.updatePagination();
        },
        destroy() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.destroy();
        },
      },
    };

    const History = {
      init() {
        const swiper = this;
        if (!swiper.params.history) return;
        if (!win.history || !win.history.pushState) {
          swiper.params.history.enabled = false;
          swiper.params.hashNavigation.enabled = true;
          return;
        }
        const history = swiper.history;
        history.initialized = true;
        history.paths = History.getPathValues();
        if (!history.paths.key && !history.paths.value) return;
        history.scrollToSlide(0, history.paths.value, swiper.params.runCallbacksOnInit);
        if (!swiper.params.history.replaceState) {
          win.addEventListener('popstate', swiper.history.setHistoryPopState);
        }
      },
      destroy() {
        const swiper = this;
        if (!swiper.params.history.replaceState) {
          win.removeEventListener('popstate', swiper.history.setHistoryPopState);
        }
      },
      setHistoryPopState() {
        const swiper = this;
        swiper.history.paths = History.getPathValues();
        swiper.history.scrollToSlide(swiper.params.speed, swiper.history.paths.value, false);
      },
      getPathValues() {
        const pathArray = win.location.pathname.slice(1).split('/').filter((part) => part !== '');
        const total = pathArray.length;
        const key = pathArray[total - 2];
        const value = pathArray[total - 1];
        return { key, value };
      },
      setHistory(key, index) {
        const swiper = this;
        if (!swiper.history.initialized || !swiper.params.history.enabled) return;
        const slide = swiper.slides.eq(index);
        let value = History.slugify(slide.attr('data-history'));
        if (!win.location.pathname.includes(key)) {
          value = `${key}/${value}`;
        }
        const currentState = win.history.state;
        if (currentState && currentState.value === value) {
          return;
        }
        if (swiper.params.history.replaceState) {
          win.history.replaceState({ value }, null, value);
        } else {
          win.history.pushState({ value }, null, value);
        }
      },
      slugify(text) {
        return text.toString()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      },
      scrollToSlide(speed, value, runCallbacks) {
        const swiper = this;
        if (value) {
          for (let i = 0, length = swiper.slides.length; i < length; i += 1) {
            const slide = swiper.slides.eq(i);
            const slideHistory = History.slugify(slide.attr('data-history'));
            if (slideHistory === value && !slide.hasClass(swiper.params.slideDuplicateClass)) {
              const index = slide.index();
              swiper.slideTo(index, speed, runCallbacks);
            }
          }
        } else {
          swiper.slideTo(0, speed, runCallbacks);
        }
      },
    };

    var History$1 = {
      name: 'history',
      params: {
        history: {
          enabled: false,
          replaceState: false,
          key: 'slides',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          history: {
            init: History.init.bind(swiper),
            setHistory: History.setHistory.bind(swiper),
            setHistoryPopState: History.setHistoryPopState.bind(swiper),
            scrollToSlide: History.scrollToSlide.bind(swiper),
            destroy: History.destroy.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.history.enabled) {
            swiper.history.init();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.params.history.enabled) {
            swiper.history.destroy();
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.history.initialized) {
            swiper.history.setHistory(swiper.params.history.key, swiper.activeIndex);
          }
        },
        slideChange() {
          const swiper = this;
          if (swiper.history.initialized && swiper.params.cssMode) {
            swiper.history.setHistory(swiper.params.history.key, swiper.activeIndex);
          }
        },
      },
    };

    const HashNavigation = {
      onHashCange() {
        const swiper = this;
        const newHash = doc.location.hash.replace('#', '');
        const activeSlideHash = swiper.slides.eq(swiper.activeIndex).attr('data-hash');
        if (newHash !== activeSlideHash) {
          const newIndex = swiper.$wrapperEl.children(`.${swiper.params.slideClass}[data-hash="${newHash}"]`).index();
          if (typeof newIndex === 'undefined') return;
          swiper.slideTo(newIndex);
        }
      },
      setHash() {
        const swiper = this;
        if (!swiper.hashNavigation.initialized || !swiper.params.hashNavigation.enabled) return;
        if (swiper.params.hashNavigation.replaceState && win.history && win.history.replaceState) {
          win.history.replaceState(null, null, (`#${swiper.slides.eq(swiper.activeIndex).attr('data-hash')}` || ''));
        } else {
          const slide = swiper.slides.eq(swiper.activeIndex);
          const hash = slide.attr('data-hash') || slide.attr('data-history');
          doc.location.hash = hash || '';
        }
      },
      init() {
        const swiper = this;
        if (!swiper.params.hashNavigation.enabled || (swiper.params.history && swiper.params.history.enabled)) return;
        swiper.hashNavigation.initialized = true;
        const hash = doc.location.hash.replace('#', '');
        if (hash) {
          const speed = 0;
          for (let i = 0, length = swiper.slides.length; i < length; i += 1) {
            const slide = swiper.slides.eq(i);
            const slideHash = slide.attr('data-hash') || slide.attr('data-history');
            if (slideHash === hash && !slide.hasClass(swiper.params.slideDuplicateClass)) {
              const index = slide.index();
              swiper.slideTo(index, speed, swiper.params.runCallbacksOnInit, true);
            }
          }
        }
        if (swiper.params.hashNavigation.watchState) {
          $(win).on('hashchange', swiper.hashNavigation.onHashCange);
        }
      },
      destroy() {
        const swiper = this;
        if (swiper.params.hashNavigation.watchState) {
          $(win).off('hashchange', swiper.hashNavigation.onHashCange);
        }
      },
    };
    var HashNavigation$1 = {
      name: 'hash-navigation',
      params: {
        hashNavigation: {
          enabled: false,
          replaceState: false,
          watchState: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          hashNavigation: {
            initialized: false,
            init: HashNavigation.init.bind(swiper),
            destroy: HashNavigation.destroy.bind(swiper),
            setHash: HashNavigation.setHash.bind(swiper),
            onHashCange: HashNavigation.onHashCange.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.hashNavigation.enabled) {
            swiper.hashNavigation.init();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.params.hashNavigation.enabled) {
            swiper.hashNavigation.destroy();
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.hashNavigation.initialized) {
            swiper.hashNavigation.setHash();
          }
        },
        slideChange() {
          const swiper = this;
          if (swiper.hashNavigation.initialized && swiper.params.cssMode) {
            swiper.hashNavigation.setHash();
          }
        },
      },
    };

    /* eslint no-underscore-dangle: "off" */

    const Autoplay = {
      run() {
        const swiper = this;
        const $activeSlideEl = swiper.slides.eq(swiper.activeIndex);
        let delay = swiper.params.autoplay.delay;
        if ($activeSlideEl.attr('data-swiper-autoplay')) {
          delay = $activeSlideEl.attr('data-swiper-autoplay') || swiper.params.autoplay.delay;
        }
        clearTimeout(swiper.autoplay.timeout);
        swiper.autoplay.timeout = Utils.nextTick(() => {
          if (swiper.params.autoplay.reverseDirection) {
            if (swiper.params.loop) {
              swiper.loopFix();
              swiper.slidePrev(swiper.params.speed, true, true);
              swiper.emit('autoplay');
            } else if (!swiper.isBeginning) {
              swiper.slidePrev(swiper.params.speed, true, true);
              swiper.emit('autoplay');
            } else if (!swiper.params.autoplay.stopOnLastSlide) {
              swiper.slideTo(swiper.slides.length - 1, swiper.params.speed, true, true);
              swiper.emit('autoplay');
            } else {
              swiper.autoplay.stop();
            }
          } else if (swiper.params.loop) {
            swiper.loopFix();
            swiper.slideNext(swiper.params.speed, true, true);
            swiper.emit('autoplay');
          } else if (!swiper.isEnd) {
            swiper.slideNext(swiper.params.speed, true, true);
            swiper.emit('autoplay');
          } else if (!swiper.params.autoplay.stopOnLastSlide) {
            swiper.slideTo(0, swiper.params.speed, true, true);
            swiper.emit('autoplay');
          } else {
            swiper.autoplay.stop();
          }
          if (swiper.params.cssMode && swiper.autoplay.running) swiper.autoplay.run();
        }, delay);
      },
      start() {
        const swiper = this;
        if (typeof swiper.autoplay.timeout !== 'undefined') return false;
        if (swiper.autoplay.running) return false;
        swiper.autoplay.running = true;
        swiper.emit('autoplayStart');
        swiper.autoplay.run();
        return true;
      },
      stop() {
        const swiper = this;
        if (!swiper.autoplay.running) return false;
        if (typeof swiper.autoplay.timeout === 'undefined') return false;

        if (swiper.autoplay.timeout) {
          clearTimeout(swiper.autoplay.timeout);
          swiper.autoplay.timeout = undefined;
        }
        swiper.autoplay.running = false;
        swiper.emit('autoplayStop');
        return true;
      },
      pause(speed) {
        const swiper = this;
        if (!swiper.autoplay.running) return;
        if (swiper.autoplay.paused) return;
        if (swiper.autoplay.timeout) clearTimeout(swiper.autoplay.timeout);
        swiper.autoplay.paused = true;
        if (speed === 0 || !swiper.params.autoplay.waitForTransition) {
          swiper.autoplay.paused = false;
          swiper.autoplay.run();
        } else {
          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.autoplay.onTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.autoplay.onTransitionEnd);
        }
      },
    };

    var Autoplay$1 = {
      name: 'autoplay',
      params: {
        autoplay: {
          enabled: false,
          delay: 3000,
          waitForTransition: true,
          disableOnInteraction: true,
          stopOnLastSlide: false,
          reverseDirection: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          autoplay: {
            running: false,
            paused: false,
            run: Autoplay.run.bind(swiper),
            start: Autoplay.start.bind(swiper),
            stop: Autoplay.stop.bind(swiper),
            pause: Autoplay.pause.bind(swiper),
            onVisibilityChange() {
              if (document.visibilityState === 'hidden' && swiper.autoplay.running) {
                swiper.autoplay.pause();
              }
              if (document.visibilityState === 'visible' && swiper.autoplay.paused) {
                swiper.autoplay.run();
                swiper.autoplay.paused = false;
              }
            },
            onTransitionEnd(e) {
              if (!swiper || swiper.destroyed || !swiper.$wrapperEl) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.autoplay.onTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.autoplay.onTransitionEnd);
              swiper.autoplay.paused = false;
              if (!swiper.autoplay.running) {
                swiper.autoplay.stop();
              } else {
                swiper.autoplay.run();
              }
            },
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.autoplay.enabled) {
            swiper.autoplay.start();
            document.addEventListener('visibilitychange', swiper.autoplay.onVisibilityChange);
          }
        },
        beforeTransitionStart(speed, internal) {
          const swiper = this;
          if (swiper.autoplay.running) {
            if (internal || !swiper.params.autoplay.disableOnInteraction) {
              swiper.autoplay.pause(speed);
            } else {
              swiper.autoplay.stop();
            }
          }
        },
        sliderFirstMove() {
          const swiper = this;
          if (swiper.autoplay.running) {
            if (swiper.params.autoplay.disableOnInteraction) {
              swiper.autoplay.stop();
            } else {
              swiper.autoplay.pause();
            }
          }
        },
        touchEnd() {
          const swiper = this;
          if (swiper.params.cssMode && swiper.autoplay.paused && !swiper.params.autoplay.disableOnInteraction) {
            swiper.autoplay.run();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.autoplay.running) {
            swiper.autoplay.stop();
          }
          document.removeEventListener('visibilitychange', swiper.autoplay.onVisibilityChange);
        },
      },
    };

    const Fade = {
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset = $slideEl[0].swiperSlideOffset;
          let tx = -offset;
          if (!swiper.params.virtualTranslate) tx -= swiper.translate;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    };

    var EffectFade = {
      name: 'effect-fade',
      params: {
        fadeEffect: {
          crossFade: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          fadeEffect: {
            setTranslate: Fade.setTranslate.bind(swiper),
            setTransition: Fade.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'fade') return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            spaceBetween: 0,
            virtualTranslate: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'fade') return;
          swiper.fadeEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'fade') return;
          swiper.fadeEffect.setTransition(duration);
        },
      },
    };

    const Cube = {
      setTranslate() {
        const swiper = this;
        const {
          $el, $wrapperEl, slides, width: swiperWidth, height: swiperHeight, rtlTranslate: rtl, size: swiperSize,
        } = swiper;
        const params = swiper.params.cubeEffect;
        const isHorizontal = swiper.isHorizontal();
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let wrapperRotate = 0;
        let $cubeShadowEl;
        if (params.shadow) {
          if (isHorizontal) {
            $cubeShadowEl = $wrapperEl.find('.swiper-cube-shadow');
            if ($cubeShadowEl.length === 0) {
              $cubeShadowEl = $('<div class="swiper-cube-shadow"></div>');
              $wrapperEl.append($cubeShadowEl);
            }
            $cubeShadowEl.css({ height: `${swiperWidth}px` });
          } else {
            $cubeShadowEl = $el.find('.swiper-cube-shadow');
            if ($cubeShadowEl.length === 0) {
              $cubeShadowEl = $('<div class="swiper-cube-shadow"></div>');
              $el.append($cubeShadowEl);
            }
          }
        }
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let slideIndex = i;
          if (isVirtual) {
            slideIndex = parseInt($slideEl.attr('data-swiper-slide-index'), 10);
          }
          let slideAngle = slideIndex * 90;
          let round = Math.floor(slideAngle / 360);
          if (rtl) {
            slideAngle = -slideAngle;
            round = Math.floor(-slideAngle / 360);
          }
          const progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          let tx = 0;
          let ty = 0;
          let tz = 0;
          if (slideIndex % 4 === 0) {
            tx = -round * 4 * swiperSize;
            tz = 0;
          } else if ((slideIndex - 1) % 4 === 0) {
            tx = 0;
            tz = -round * 4 * swiperSize;
          } else if ((slideIndex - 2) % 4 === 0) {
            tx = swiperSize + (round * 4 * swiperSize);
            tz = swiperSize;
          } else if ((slideIndex - 3) % 4 === 0) {
            tx = -swiperSize;
            tz = (3 * swiperSize) + (swiperSize * 4 * round);
          }
          if (rtl) {
            tx = -tx;
          }

          if (!isHorizontal) {
            ty = tx;
            tx = 0;
          }

          const transform = `rotateX(${isHorizontal ? 0 : -slideAngle}deg) rotateY(${isHorizontal ? slideAngle : 0}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
          if (progress <= 1 && progress > -1) {
            wrapperRotate = (slideIndex * 90) + (progress * 90);
            if (rtl) wrapperRotate = (-slideIndex * 90) - (progress * 90);
          }
          $slideEl.transform(transform);
          if (params.slideShadows) {
            // Set shadows
            let shadowBefore = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let shadowAfter = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
        }
        $wrapperEl.css({
          '-webkit-transform-origin': `50% 50% -${swiperSize / 2}px`,
          '-moz-transform-origin': `50% 50% -${swiperSize / 2}px`,
          '-ms-transform-origin': `50% 50% -${swiperSize / 2}px`,
          'transform-origin': `50% 50% -${swiperSize / 2}px`,
        });

        if (params.shadow) {
          if (isHorizontal) {
            $cubeShadowEl.transform(`translate3d(0px, ${(swiperWidth / 2) + params.shadowOffset}px, ${-swiperWidth / 2}px) rotateX(90deg) rotateZ(0deg) scale(${params.shadowScale})`);
          } else {
            const shadowAngle = Math.abs(wrapperRotate) - (Math.floor(Math.abs(wrapperRotate) / 90) * 90);
            const multiplier = 1.5 - (
              (Math.sin((shadowAngle * 2 * Math.PI) / 360) / 2)
              + (Math.cos((shadowAngle * 2 * Math.PI) / 360) / 2)
            );
            const scale1 = params.shadowScale;
            const scale2 = params.shadowScale / multiplier;
            const offset = params.shadowOffset;
            $cubeShadowEl.transform(`scale3d(${scale1}, 1, ${scale2}) translate3d(0px, ${(swiperHeight / 2) + offset}px, ${-swiperHeight / 2 / scale2}px) rotateX(-90deg)`);
          }
        }
        const zFactor = (Browser.isSafari || Browser.isUiWebView) ? (-swiperSize / 2) : 0;
        $wrapperEl
          .transform(`translate3d(0px,0,${zFactor}px) rotateX(${swiper.isHorizontal() ? 0 : wrapperRotate}deg) rotateY(${swiper.isHorizontal() ? -wrapperRotate : 0}deg)`);
      },
      setTransition(duration) {
        const swiper = this;
        const { $el, slides } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.cubeEffect.shadow && !swiper.isHorizontal()) {
          $el.find('.swiper-cube-shadow').transition(duration);
        }
      },
    };

    var EffectCube = {
      name: 'effect-cube',
      params: {
        cubeEffect: {
          slideShadows: true,
          shadow: true,
          shadowOffset: 20,
          shadowScale: 0.94,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          cubeEffect: {
            setTranslate: Cube.setTranslate.bind(swiper),
            setTransition: Cube.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'cube') return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}cube`);
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            resistanceRatio: 0,
            spaceBetween: 0,
            centeredSlides: false,
            virtualTranslate: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'cube') return;
          swiper.cubeEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'cube') return;
          swiper.cubeEffect.setTransition(duration);
        },
      },
    };

    const Flip = {
      setTranslate() {
        const swiper = this;
        const { slides, rtlTranslate: rtl } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let progress = $slideEl[0].progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          }
          const offset = $slideEl[0].swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = -offset;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }

          $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;

          if (swiper.params.flipEffect.slideShadows) {
            // Set shadows
            let shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = $(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = $(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
          $slideEl
            .transform(`translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, activeIndex, $wrapperEl } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          // eslint-disable-next-line
          slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            // if (!$(this).hasClass(swiper.params.slideActiveClass)) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    };

    var EffectFlip = {
      name: 'effect-flip',
      params: {
        flipEffect: {
          slideShadows: true,
          limitRotation: true,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          flipEffect: {
            setTranslate: Flip.setTranslate.bind(swiper),
            setTransition: Flip.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'flip') return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            spaceBetween: 0,
            virtualTranslate: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'flip') return;
          swiper.flipEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'flip') return;
          swiper.flipEffect.setTransition(duration);
        },
      },
    };

    const Coverflow = {
      setTranslate() {
        const swiper = this;
        const {
          width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid,
        } = swiper;
        const params = swiper.params.coverflowEffect;
        const isHorizontal = swiper.isHorizontal();
        const transform = swiper.translate;
        const center = isHorizontal ? -transform + (swiperWidth / 2) : -transform + (swiperHeight / 2);
        const rotate = isHorizontal ? params.rotate : -params.rotate;
        const translate = params.depth;
        // Each slide offset from center
        for (let i = 0, length = slides.length; i < length; i += 1) {
          const $slideEl = slides.eq(i);
          const slideSize = slidesSizesGrid[i];
          const slideOffset = $slideEl[0].swiperSlideOffset;
          const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

          let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
          let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
          // var rotateZ = 0
          let translateZ = -translate * Math.abs(offsetMultiplier);

          let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
          let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

          // Fix for ultra small values
          if (Math.abs(translateX) < 0.001) translateX = 0;
          if (Math.abs(translateY) < 0.001) translateY = 0;
          if (Math.abs(translateZ) < 0.001) translateZ = 0;
          if (Math.abs(rotateY) < 0.001) rotateY = 0;
          if (Math.abs(rotateX) < 0.001) rotateX = 0;

          const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

          $slideEl.transform(slideTransform);
          $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
          if (params.slideShadows) {
            // Set shadows
            let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if ($shadowBeforeEl.length === 0) {
              $shadowBeforeEl = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
              $slideEl.append($shadowBeforeEl);
            }
            if ($shadowAfterEl.length === 0) {
              $shadowAfterEl = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
              $slideEl.append($shadowAfterEl);
            }
            if ($shadowBeforeEl.length) $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
            if ($shadowAfterEl.length) $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
          }
        }

        // Set correct perspective for IE10
        if (Support.pointerEvents || Support.prefixedPointerEvents) {
          const ws = $wrapperEl[0].style;
          ws.perspectiveOrigin = `${center}px 50%`;
        }
      },
      setTransition(duration) {
        const swiper = this;
        swiper.slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
      },
    };

    var EffectCoverflow = {
      name: 'effect-coverflow',
      params: {
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          coverflowEffect: {
            setTranslate: Coverflow.setTranslate.bind(swiper),
            setTransition: Coverflow.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'coverflow') return;

          swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

          swiper.params.watchSlidesProgress = true;
          swiper.originalParams.watchSlidesProgress = true;
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'coverflow') return;
          swiper.coverflowEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'coverflow') return;
          swiper.coverflowEffect.setTransition(duration);
        },
      },
    };

    const Thumbs = {
      init() {
        const swiper = this;
        const { thumbs: thumbsParams } = swiper.params;
        const SwiperClass = swiper.constructor;
        if (thumbsParams.swiper instanceof SwiperClass) {
          swiper.thumbs.swiper = thumbsParams.swiper;
          Utils.extend(swiper.thumbs.swiper.originalParams, {
            watchSlidesProgress: true,
            slideToClickedSlide: false,
          });
          Utils.extend(swiper.thumbs.swiper.params, {
            watchSlidesProgress: true,
            slideToClickedSlide: false,
          });
        } else if (Utils.isObject(thumbsParams.swiper)) {
          swiper.thumbs.swiper = new SwiperClass(Utils.extend({}, thumbsParams.swiper, {
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            slideToClickedSlide: false,
          }));
          swiper.thumbs.swiperCreated = true;
        }
        swiper.thumbs.swiper.$el.addClass(swiper.params.thumbs.thumbsContainerClass);
        swiper.thumbs.swiper.on('tap', swiper.thumbs.onThumbClick);
      },
      onThumbClick() {
        const swiper = this;
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper) return;
        const clickedIndex = thumbsSwiper.clickedIndex;
        const clickedSlide = thumbsSwiper.clickedSlide;
        if (clickedSlide && $(clickedSlide).hasClass(swiper.params.thumbs.slideThumbActiveClass)) return;
        if (typeof clickedIndex === 'undefined' || clickedIndex === null) return;
        let slideToIndex;
        if (thumbsSwiper.params.loop) {
          slideToIndex = parseInt($(thumbsSwiper.clickedSlide).attr('data-swiper-slide-index'), 10);
        } else {
          slideToIndex = clickedIndex;
        }
        if (swiper.params.loop) {
          let currentIndex = swiper.activeIndex;
          if (swiper.slides.eq(currentIndex).hasClass(swiper.params.slideDuplicateClass)) {
            swiper.loopFix();
            // eslint-disable-next-line
            swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
            currentIndex = swiper.activeIndex;
          }
          const prevIndex = swiper.slides.eq(currentIndex).prevAll(`[data-swiper-slide-index="${slideToIndex}"]`).eq(0).index();
          const nextIndex = swiper.slides.eq(currentIndex).nextAll(`[data-swiper-slide-index="${slideToIndex}"]`).eq(0).index();
          if (typeof prevIndex === 'undefined') slideToIndex = nextIndex;
          else if (typeof nextIndex === 'undefined') slideToIndex = prevIndex;
          else if (nextIndex - currentIndex < currentIndex - prevIndex) slideToIndex = nextIndex;
          else slideToIndex = prevIndex;
        }
        swiper.slideTo(slideToIndex);
      },
      update(initial) {
        const swiper = this;
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper) return;

        const slidesPerView = thumbsSwiper.params.slidesPerView === 'auto'
          ? thumbsSwiper.slidesPerViewDynamic()
          : thumbsSwiper.params.slidesPerView;

        if (swiper.realIndex !== thumbsSwiper.realIndex) {
          let currentThumbsIndex = thumbsSwiper.activeIndex;
          let newThumbsIndex;
          if (thumbsSwiper.params.loop) {
            if (thumbsSwiper.slides.eq(currentThumbsIndex).hasClass(thumbsSwiper.params.slideDuplicateClass)) {
              thumbsSwiper.loopFix();
              // eslint-disable-next-line
              thumbsSwiper._clientLeft = thumbsSwiper.$wrapperEl[0].clientLeft;
              currentThumbsIndex = thumbsSwiper.activeIndex;
            }
            // Find actual thumbs index to slide to
            const prevThumbsIndex = thumbsSwiper.slides.eq(currentThumbsIndex).prevAll(`[data-swiper-slide-index="${swiper.realIndex}"]`).eq(0).index();
            const nextThumbsIndex = thumbsSwiper.slides.eq(currentThumbsIndex).nextAll(`[data-swiper-slide-index="${swiper.realIndex}"]`).eq(0).index();
            if (typeof prevThumbsIndex === 'undefined') newThumbsIndex = nextThumbsIndex;
            else if (typeof nextThumbsIndex === 'undefined') newThumbsIndex = prevThumbsIndex;
            else if (nextThumbsIndex - currentThumbsIndex === currentThumbsIndex - prevThumbsIndex) newThumbsIndex = currentThumbsIndex;
            else if (nextThumbsIndex - currentThumbsIndex < currentThumbsIndex - prevThumbsIndex) newThumbsIndex = nextThumbsIndex;
            else newThumbsIndex = prevThumbsIndex;
          } else {
            newThumbsIndex = swiper.realIndex;
          }
          if (thumbsSwiper.visibleSlidesIndexes && thumbsSwiper.visibleSlidesIndexes.indexOf(newThumbsIndex) < 0) {
            if (thumbsSwiper.params.centeredSlides) {
              if (newThumbsIndex > currentThumbsIndex) {
                newThumbsIndex = newThumbsIndex - Math.floor(slidesPerView / 2) + 1;
              } else {
                newThumbsIndex = newThumbsIndex + Math.floor(slidesPerView / 2) - 1;
              }
            } else if (newThumbsIndex > currentThumbsIndex) {
              newThumbsIndex = newThumbsIndex - slidesPerView + 1;
            }
            thumbsSwiper.slideTo(newThumbsIndex, initial ? 0 : undefined);
          }
        }

        // Activate thumbs
        let thumbsToActivate = 1;
        const thumbActiveClass = swiper.params.thumbs.slideThumbActiveClass;

        if (swiper.params.slidesPerView > 1 && !swiper.params.centeredSlides) {
          thumbsToActivate = swiper.params.slidesPerView;
        }

        if (!swiper.params.thumbs.multipleActiveThumbs) {
          thumbsToActivate = 1;
        }

        thumbsToActivate = Math.floor(thumbsToActivate);

        thumbsSwiper.slides.removeClass(thumbActiveClass);
        if (thumbsSwiper.params.loop || (thumbsSwiper.params.virtual && thumbsSwiper.params.virtual.enabled)) {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            thumbsSwiper.$wrapperEl.children(`[data-swiper-slide-index="${swiper.realIndex + i}"]`).addClass(thumbActiveClass);
          }
        } else {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            thumbsSwiper.slides.eq(swiper.realIndex + i).addClass(thumbActiveClass);
          }
        }
      },
    };
    var Thumbs$1 = {
      name: 'thumbs',
      params: {
        thumbs: {
          multipleActiveThumbs: true,
          swiper: null,
          slideThumbActiveClass: 'swiper-slide-thumb-active',
          thumbsContainerClass: 'swiper-container-thumbs',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          thumbs: {
            swiper: null,
            init: Thumbs.init.bind(swiper),
            update: Thumbs.update.bind(swiper),
            onThumbClick: Thumbs.onThumbClick.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          const { thumbs } = swiper.params;
          if (!thumbs || !thumbs.swiper) return;
          swiper.thumbs.init();
          swiper.thumbs.update(true);
        },
        slideChange() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        update() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        resize() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        observerUpdate() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        setTransition(duration) {
          const swiper = this;
          const thumbsSwiper = swiper.thumbs.swiper;
          if (!thumbsSwiper) return;
          thumbsSwiper.setTransition(duration);
        },
        beforeDestroy() {
          const swiper = this;
          const thumbsSwiper = swiper.thumbs.swiper;
          if (!thumbsSwiper) return;
          if (swiper.thumbs.swiperCreated && thumbsSwiper) {
            thumbsSwiper.destroy();
          }
        },
      },
    };

    // Swiper Class

    const components = [
      Device$1,
      Support$1,
      Browser$1,
      Resize,
      Observer$1,
      Virtual$1,
      Keyboard$1,
      Mousewheel$1,
      Navigation$1,
      Pagination$1,
      Scrollbar$1,
      Parallax$1,
      Zoom$1,
      Lazy$1,
      Controller$1,
      A11y,
      History$1,
      HashNavigation$1,
      Autoplay$1,
      EffectFade,
      EffectCube,
      EffectFlip,
      EffectCoverflow,
      Thumbs$1
    ];

    if (typeof Swiper.use === 'undefined') {
      Swiper.use = Swiper.Class.use;
      Swiper.installModule = Swiper.Class.installModule;
    }

    Swiper.use(components);
    //# sourceMappingURL=swiper.esm.bundle.js.map

    /* src/components/Carousel.svelte generated by Svelte v3.16.7 */
    const file$4 = "src/components/Carousel.svelte";

    // (66:12) <Link href="#PubEdRequest">
    function create_default_slot(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "clickable svelte-1nkrsmo");
    			attr_dev(img, "alt", "PUB");
    			if (img.src !== (img_src_value = "./build/assets/carousel/event_banner.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$4, 66, 17, 1374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(66:12) <Link href=\\\"#PubEdRequest\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div8;
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t3;
    	let div5;
    	let t4;
    	let div6;
    	let t5;
    	let div7;
    	let current;

    	const link = new Link({
    			props: {
    				href: "#PubEdRequest",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			create_component(link.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t3 = space();
    			div5 = element("div");
    			t4 = space();
    			div6 = element("div");
    			t5 = space();
    			div7 = element("div");
    			attr_dev(div0, "class", "swiper-slide svelte-1nkrsmo");
    			add_location(div0, file$4, 63, 5, 1273);
    			attr_dev(img0, "loading", "lazy");
    			attr_dev(img0, "alt", "Training");
    			if (img0.src !== (img0_src_value = "./build/assets/carousel/training_banner.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "svelte-1nkrsmo");
    			add_location(img0, file$4, 73, 16, 1581);
    			attr_dev(div1, "class", "swiper-slide svelte-1nkrsmo");
    			add_location(div1, file$4, 72, 7, 1538);
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "alt", "Training");
    			if (img1.src !== (img1_src_value = "./build/assets/carousel/911tips_banner.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "svelte-1nkrsmo");
    			add_location(img1, file$4, 78, 16, 1740);
    			attr_dev(div2, "class", "swiper-slide svelte-1nkrsmo");
    			add_location(div2, file$4, 77, 6, 1697);
    			attr_dev(img2, "loading", "lazy");
    			attr_dev(img2, "alt", "PUB");
    			if (img2.src !== (img2_src_value = "./build/assets/carousel/pubed_banner.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-1nkrsmo");
    			add_location(img2, file$4, 83, 16, 1898);
    			attr_dev(div3, "class", "swiper-slide svelte-1nkrsmo");
    			add_location(div3, file$4, 82, 6, 1855);
    			attr_dev(div4, "class", "swiper-wrapper");
    			add_location(div4, file$4, 61, 4, 1238);
    			attr_dev(div5, "class", "swiper-pagination");
    			add_location(div5, file$4, 89, 4, 2048);
    			attr_dev(div6, "class", "swiper-button-next");
    			add_location(div6, file$4, 91, 4, 2114);
    			attr_dev(div7, "class", "swiper-button-prev");
    			add_location(div7, file$4, 92, 4, 2157);
    			attr_dev(div8, "class", "swiper-container svelte-1nkrsmo");
    			add_location(div8, file$4, 60, 0, 1181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div4);
    			append_dev(div4, div0);
    			mount_component(link, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, img0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, img1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, img2);
    			append_dev(div8, t3);
    			append_dev(div8, div5);
    			append_dev(div8, t4);
    			append_dev(div8, div6);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			/*div8_binding*/ ctx[1](div8);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(link);
    			/*div8_binding*/ ctx[1](null);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let controll;

    	onMount(() => {
    		var swiper = new Swiper(controll,
    		{
    				slidesPerView: 1,
    				spaceBetween: 4,
    				loop: true,
    				autoplay: { delay: 5000 },
    				pagination: {
    					el: ".swiper-pagination",
    					clickable: true
    				},
    				navigation: {
    					nextEl: ".swiper-button-next",
    					prevEl: ".swiper-button-prev"
    				}
    			});
    	});

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, controll = $$value);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("controll" in $$props) $$invalidate(0, controll = $$props.controll);
    	};

    	return [controll, div8_binding];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/RoundCard.svelte generated by Svelte v3.16.7 */
    const file$5 = "src/components/RoundCard.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let h2;
    	let t0;
    	let t1;
    	let div1;
    	let h3;
    	let t2;
    	let t3;
    	let p_1;
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(/*statusNumber*/ ctx[7]);
    			t1 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t2 = text(/*title*/ ctx[5]);
    			t3 = space();
    			p_1 = element("p");
    			t4 = text(/*p*/ ctx[6]);
    			set_style(h2, "color", /*circleTextColor*/ ctx[4]);
    			attr_dev(h2, "class", "svelte-1he6o5v");
    			add_location(h2, file$5, 67, 8, 1565);
    			attr_dev(div0, "id", "round");
    			set_style(div0, "background-color", /*circleBackColor*/ ctx[3]);
    			set_style(div0, "height", /*circleSize*/ ctx[2] + "px");
    			set_style(div0, "width", /*circleSize*/ ctx[2] + "px");
    			set_style(div0, "margin-top", "-" + /*circleSize*/ ctx[2] / 2 + "px");
    			set_style(div0, "margin-left", "-" + /*circleSize*/ ctx[2] / 2 + "px");
    			attr_dev(div0, "class", "svelte-1he6o5v");
    			add_location(div0, file$5, 63, 4, 1368);
    			attr_dev(h3, "class", "svelte-1he6o5v");
    			add_location(h3, file$5, 70, 8, 1651);
    			add_location(p_1, file$5, 71, 8, 1676);
    			add_location(div1, file$5, 69, 4, 1637);
    			attr_dev(div2, "id", "card");
    			set_style(div2, "height", /*cardHeight*/ ctx[0] + "px");
    			set_style(div2, "width", /*cardWidth*/ ctx[1] + "px");
    			attr_dev(div2, "class", "svelte-1he6o5v");
    			add_location(div2, file$5, 62, 0, 1294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p_1);
    			append_dev(p_1, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*statusNumber*/ 128) set_data_dev(t0, /*statusNumber*/ ctx[7]);

    			if (dirty & /*circleTextColor*/ 16) {
    				set_style(h2, "color", /*circleTextColor*/ ctx[4]);
    			}

    			if (dirty & /*circleBackColor*/ 8) {
    				set_style(div0, "background-color", /*circleBackColor*/ ctx[3]);
    			}

    			if (dirty & /*circleSize*/ 4) {
    				set_style(div0, "height", /*circleSize*/ ctx[2] + "px");
    			}

    			if (dirty & /*circleSize*/ 4) {
    				set_style(div0, "width", /*circleSize*/ ctx[2] + "px");
    			}

    			if (dirty & /*circleSize*/ 4) {
    				set_style(div0, "margin-top", "-" + /*circleSize*/ ctx[2] / 2 + "px");
    			}

    			if (dirty & /*circleSize*/ 4) {
    				set_style(div0, "margin-left", "-" + /*circleSize*/ ctx[2] / 2 + "px");
    			}

    			if (dirty & /*title*/ 32) set_data_dev(t2, /*title*/ ctx[5]);
    			if (dirty & /*p*/ 64) set_data_dev(t4, /*p*/ ctx[6]);

    			if (dirty & /*cardHeight*/ 1) {
    				set_style(div2, "height", /*cardHeight*/ ctx[0] + "px");
    			}

    			if (dirty & /*cardWidth*/ 2) {
    				set_style(div2, "width", /*cardWidth*/ ctx[1] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { cardHeight = 280 } = $$props;
    	let { cardWidth = 430 } = $$props;
    	let { circleSize = 80 } = $$props;
    	let { circleBackColor = "#2B4988" } = $$props;
    	let { circleTextColor = "#fff" } = $$props;
    	let { circleValue = 100 } = $$props;
    	let { timerAnimation = 40 } = $$props;
    	let { title } = $$props;
    	let { p } = $$props;
    	let statusNumber = 0;
    	let interval;

    	onMount(async () => {
    		interval = setInterval(
    			() => {
    				if (circleValue != statusNumber) {
    					$$invalidate(7, statusNumber += 5);
    				} else {
    					$$invalidate(7, statusNumber = circleValue);
    					clearInterval(interval);
    				}
    			},
    			timerAnimation
    		);
    	});

    	const writable_props = [
    		"cardHeight",
    		"cardWidth",
    		"circleSize",
    		"circleBackColor",
    		"circleTextColor",
    		"circleValue",
    		"timerAnimation",
    		"title",
    		"p"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RoundCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("cardHeight" in $$props) $$invalidate(0, cardHeight = $$props.cardHeight);
    		if ("cardWidth" in $$props) $$invalidate(1, cardWidth = $$props.cardWidth);
    		if ("circleSize" in $$props) $$invalidate(2, circleSize = $$props.circleSize);
    		if ("circleBackColor" in $$props) $$invalidate(3, circleBackColor = $$props.circleBackColor);
    		if ("circleTextColor" in $$props) $$invalidate(4, circleTextColor = $$props.circleTextColor);
    		if ("circleValue" in $$props) $$invalidate(8, circleValue = $$props.circleValue);
    		if ("timerAnimation" in $$props) $$invalidate(9, timerAnimation = $$props.timerAnimation);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("p" in $$props) $$invalidate(6, p = $$props.p);
    	};

    	$$self.$capture_state = () => {
    		return {
    			cardHeight,
    			cardWidth,
    			circleSize,
    			circleBackColor,
    			circleTextColor,
    			circleValue,
    			timerAnimation,
    			title,
    			p,
    			statusNumber,
    			interval
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("cardHeight" in $$props) $$invalidate(0, cardHeight = $$props.cardHeight);
    		if ("cardWidth" in $$props) $$invalidate(1, cardWidth = $$props.cardWidth);
    		if ("circleSize" in $$props) $$invalidate(2, circleSize = $$props.circleSize);
    		if ("circleBackColor" in $$props) $$invalidate(3, circleBackColor = $$props.circleBackColor);
    		if ("circleTextColor" in $$props) $$invalidate(4, circleTextColor = $$props.circleTextColor);
    		if ("circleValue" in $$props) $$invalidate(8, circleValue = $$props.circleValue);
    		if ("timerAnimation" in $$props) $$invalidate(9, timerAnimation = $$props.timerAnimation);
    		if ("title" in $$props) $$invalidate(5, title = $$props.title);
    		if ("p" in $$props) $$invalidate(6, p = $$props.p);
    		if ("statusNumber" in $$props) $$invalidate(7, statusNumber = $$props.statusNumber);
    		if ("interval" in $$props) interval = $$props.interval;
    	};

    	return [
    		cardHeight,
    		cardWidth,
    		circleSize,
    		circleBackColor,
    		circleTextColor,
    		title,
    		p,
    		statusNumber,
    		circleValue,
    		timerAnimation
    	];
    }

    class RoundCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$6, safe_not_equal, {
    			cardHeight: 0,
    			cardWidth: 1,
    			circleSize: 2,
    			circleBackColor: 3,
    			circleTextColor: 4,
    			circleValue: 8,
    			timerAnimation: 9,
    			title: 5,
    			p: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoundCard",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*title*/ ctx[5] === undefined && !("title" in props)) {
    			console.warn("<RoundCard> was created without expected prop 'title'");
    		}

    		if (/*p*/ ctx[6] === undefined && !("p" in props)) {
    			console.warn("<RoundCard> was created without expected prop 'p'");
    		}
    	}

    	get cardHeight() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardHeight(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cardWidth() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardWidth(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleSize() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleSize(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleBackColor() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleBackColor(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleTextColor() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleTextColor(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleValue() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleValue(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timerAnimation() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timerAnimation(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get p() {
    		throw new Error("<RoundCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set p(value) {
    		throw new Error("<RoundCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.16.7 */
    const file$6 = "src/pages/Home.svelte";

    function create_fragment$7(ctx) {
    	let div9;
    	let div8;
    	let t0;
    	let div5;
    	let div4;
    	let div0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let div1;
    	let span2;
    	let t6;
    	let span3;
    	let t8;
    	let div2;
    	let span4;
    	let t10;
    	let span5;
    	let t12;
    	let div3;
    	let span6;
    	let t14;
    	let span7;
    	let t16;
    	let div7;
    	let h1;
    	let t18;
    	let h3;
    	let t20;
    	let div6;
    	let t21;
    	let t22;
    	let current;
    	const carousel = new Carousel({ $$inline: true });

    	const roundcard0 = new RoundCard({
    			props: {
    				p: "Find out what services the Cameron County 911 Communication District provides to the citizens of Cameron County.",
    				title: "Per Year"
    			},
    			$$inline: true
    		});

    	const roundcard1 = new RoundCard({
    			props: {
    				p: "Find out what services the Cameron County 911 Communication District provides to the citizens of Cameron County.",
    				title: "Per Month"
    			},
    			$$inline: true
    		});

    	const roundcard2 = new RoundCard({
    			props: {
    				p: "Find out what services the Cameron County 911 Communication District provides to the citizens of Cameron County.",
    				title: "Per Quarter"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div8 = element("div");
    			create_component(carousel.$$.fragment);
    			t0 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "2";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Counties";
    			t4 = space();
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "1";
    			t6 = space();
    			span3 = element("span");
    			span3.textContent = "Million Served";
    			t8 = space();
    			div2 = element("div");
    			span4 = element("span");
    			span4.textContent = "17";
    			t10 = space();
    			span5 = element("span");
    			span5.textContent = "PSAPs";
    			t12 = space();
    			div3 = element("div");
    			span6 = element("span");
    			span6.textContent = "20";
    			t14 = space();
    			span7 = element("span");
    			span7.textContent = "Municipalities";
    			t16 = space();
    			div7 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Address Request";
    			t18 = space();
    			h3 = element("h3");
    			h3.textContent = "Summary Overview";
    			t20 = space();
    			div6 = element("div");
    			create_component(roundcard0.$$.fragment);
    			t21 = space();
    			create_component(roundcard1.$$.fragment);
    			t22 = space();
    			create_component(roundcard2.$$.fragment);
    			add_location(span0, file$6, 92, 20, 2033);
    			add_location(span1, file$6, 93, 20, 2068);
    			attr_dev(div0, "class", "title svelte-59jlh8");
    			add_location(div0, file$6, 91, 16, 1993);
    			add_location(span2, file$6, 96, 20, 2169);
    			add_location(span3, file$6, 97, 20, 2204);
    			attr_dev(div1, "class", "title svelte-59jlh8");
    			add_location(div1, file$6, 95, 16, 2129);
    			add_location(span4, file$6, 100, 20, 2311);
    			add_location(span5, file$6, 101, 20, 2347);
    			attr_dev(div2, "class", "title svelte-59jlh8");
    			add_location(div2, file$6, 99, 16, 2271);
    			add_location(span6, file$6, 104, 20, 2445);
    			add_location(span7, file$6, 105, 20, 2481);
    			attr_dev(div3, "class", "title svelte-59jlh8");
    			add_location(div3, file$6, 103, 16, 2405);
    			attr_dev(div4, "id", "innerComms");
    			attr_dev(div4, "class", "svelte-59jlh8");
    			add_location(div4, file$6, 89, 12, 1938);
    			attr_dev(div5, "class", "ecoms svelte-59jlh8");
    			add_location(div5, file$6, 87, 8, 1849);
    			attr_dev(h1, "class", "svelte-59jlh8");
    			add_location(h1, file$6, 110, 12, 2603);
    			attr_dev(h3, "class", "svelte-59jlh8");
    			add_location(h3, file$6, 111, 12, 2640);
    			attr_dev(div6, "class", "flex svelte-59jlh8");
    			add_location(div6, file$6, 112, 12, 2678);
    			attr_dev(div7, "id", "title");
    			add_location(div7, file$6, 109, 8, 2574);
    			attr_dev(div8, "class", "flex-main svelte-59jlh8");
    			add_location(div8, file$6, 84, 4, 1787);
    			add_location(div9, file$6, 83, 0, 1777);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			mount_component(carousel, div8, null);
    			append_dev(div8, t0);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(div4, t4);
    			append_dev(div4, div1);
    			append_dev(div1, span2);
    			append_dev(div1, t6);
    			append_dev(div1, span3);
    			append_dev(div4, t8);
    			append_dev(div4, div2);
    			append_dev(div2, span4);
    			append_dev(div2, t10);
    			append_dev(div2, span5);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			append_dev(div3, span6);
    			append_dev(div3, t14);
    			append_dev(div3, span7);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div7, h1);
    			append_dev(div7, t18);
    			append_dev(div7, h3);
    			append_dev(div7, t20);
    			append_dev(div7, div6);
    			mount_component(roundcard0, div6, null);
    			append_dev(div6, t21);
    			mount_component(roundcard1, div6, null);
    			append_dev(div6, t22);
    			mount_component(roundcard2, div6, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);
    			transition_in(roundcard0.$$.fragment, local);
    			transition_in(roundcard1.$$.fragment, local);
    			transition_in(roundcard2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			transition_out(roundcard0.$$.fragment, local);
    			transition_out(roundcard1.$$.fragment, local);
    			transition_out(roundcard2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_component(carousel);
    			destroy_component(roundcard0);
    			destroy_component(roundcard1);
    			destroy_component(roundcard2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/AboutUs.svelte generated by Svelte v3.16.7 */

    const file$7 = "src/pages/AboutUs.svelte";

    function create_fragment$8(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "About Us";
    			add_location(h2, file$7, 0, 0, 0);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class AboutUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutUs",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/VideoPlayer.svelte generated by Svelte v3.16.7 */

    const file$8 = "src/components/VideoPlayer.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let button;
    	let t1;
    	let video;
    	let source;
    	let source_src_value;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Go Back";
    			t1 = space();
    			video = element("video");
    			source = element("source");
    			t2 = text("\n  Your browser does not support HTML5 video.");
    			attr_dev(button, "class", "svelte-xeodby");
    			add_location(button, file$8, 24, 4, 371);
    			attr_dev(div, "class", "btn-close svelte-xeodby");
    			add_location(div, file$8, 23, 0, 343);
    			if (source.src !== (source_src_value = /*src*/ ctx[0])) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$8, 27, 2, 440);
    			video.controls = true;
    			video.autoplay = true;
    			attr_dev(video, "class", "svelte-xeodby");
    			add_location(video, file$8, 26, 0, 412);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 1 && source.src !== (source_src_value = /*src*/ ctx[0])) {
    				attr_dev(source, "src", source_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(video);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { src } = $$props;
    	const writable_props = ["src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VideoPlayer> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	$$self.$capture_state = () => {
    		return { src };
    	};

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	return [src, click_handler];
    }

    class VideoPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$9, safe_not_equal, { src: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoPlayer",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<VideoPlayer> was created without expected prop 'src'");
    		}
    	}

    	get src() {
    		throw new Error("<VideoPlayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<VideoPlayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/PubEd.svelte generated by Svelte v3.16.7 */
    const file$9 = "src/pages/PubEd.svelte";

    // (141:14) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "imgResponsive svelte-1ig10dm");
    			if (img.src !== (img_src_value = "/build/assets/pages/pubed/text_to_911_banner.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "TXT 911 Banner");
    			add_location(img, file$9, 141, 20, 5032);
    			dispose = listen_dev(img, "click", /*click_handler_2*/ ctx[3], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(141:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (139:14) {#if txtVideo}
    function create_if_block$2(ctx) {
    	let current;

    	const videoplayer = new VideoPlayer({
    			props: {
    				src: "./build/assets/videos/txt_to_911.mp4"
    			},
    			$$inline: true
    		});

    	videoplayer.$on("click", /*click_handler_1*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(videoplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(videoplayer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(videoplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(139:14) {#if txtVideo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div10;
    	let h1;
    	let b;
    	let i0;
    	let t2;
    	let div4;
    	let div1;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let p2;
    	let t8;
    	let div0;
    	let button;
    	let t10;
    	let div2;
    	let t11;
    	let div3;
    	let img0;
    	let img0_src_value;
    	let t12;
    	let div9;
    	let h3;
    	let i1;
    	let t14;
    	let p3;
    	let t16;
    	let img1;
    	let img1_src_value;
    	let t17;
    	let div5;
    	let t19;
    	let img2;
    	let img2_src_value;
    	let t20;
    	let div6;
    	let t22;
    	let current_block_type_index;
    	let if_block;
    	let t23;
    	let div7;
    	let t24;
    	let br;
    	let t25;
    	let a;
    	let t27;
    	let div8;
    	let img3;
    	let img3_src_value;
    	let t28;
    	let h2;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*txtVideo*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			h1 = element("h1");
    			b = element("b");
    			b.textContent = "Public Education ";
    			i0 = element("i");
    			i0.textContent = "Program";
    			t2 = space();
    			div4 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "We attend several events which gives us the opportunity to promote and educate the public on how to properly use the 9-1-1 system.";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "We give presentations that local cities, school, daycares, Fire, Police Depts. and Emergency Medical Services (EMS) companies within the Hidalgo and Willacy Counties. While attending these events, our mascots (Cell Phone Sally, Josh and Keith Friendly Kid) have become a great part of our education program";
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "Using multi-media, we demonstrate the proper way to call 9-1-1 and what is considered a 9-1-1 emergency call. Promotional item distribution is a major part of our program.";
    			t8 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "EVENT REQUEST";
    			t10 = space();
    			div2 = element("div");
    			t11 = space();
    			div3 = element("div");
    			img0 = element("img");
    			t12 = space();
    			div9 = element("div");
    			h3 = element("h3");
    			i1 = element("i");
    			i1.textContent = "Do you know how to make 9-1-1 work for you?";
    			t14 = space();
    			p3 = element("p");
    			p3.textContent = "For forty years, 9-1-1 has served as the vital link between the American public and emergency services. Public education and awareness initiatives throughout the years have contributed in large measure to the incredible and ongoing success of the emergency communications system as a whole. It is imperative that 9-1-1 professionals, teachers, government officials, media representatives, and industry leaders are equipped with the tools necessary to continue these efforts in the face of an ever-changing telecommunications landscape, and that citizens of all ages are well versed in the role they play in ensuring effective and efficient emergency response for themselves and their fellow citizens.The resources below provide you with the tools necessary to educate yourself and your community on the proper use of the 9-1-1 system, no matter which side of the phone you are on.";
    			t16 = space();
    			img1 = element("img");
    			t17 = space();
    			div5 = element("div");
    			div5.textContent = "require multi-line telephone systems to have a configuration that permits users to directly initiate \n                a call to 9-1-1 without dialing any additional digit, code, prefix, or post-fix, and for other purposes.";
    			t19 = space();
    			img2 = element("img");
    			t20 = space();
    			div6 = element("div");
    			div6.textContent = "We work with other agencies such as the United States Postal Service (USPS), telephone companies and others to make sure the 9-1-1 physical address is well known.";
    			t22 = space();
    			if_block.c();
    			t23 = space();
    			div7 = element("div");
    			t24 = text("Text-to-911 is the ability to send a text message to reach 911 emergency call takers from your mobile phone or device. However, because text-to-911 is currently only available in certain locations, you should always make a voice call to contact 911 during an emergency whenever possible.\n               ");
    			br = element("br");
    			t25 = text("Visit: ");
    			a = element("a");
    			a.textContent = "https://www.congress.gov/bill/115th-congress/house-bill/582/text";
    			t27 = space();
    			div8 = element("div");
    			img3 = element("img");
    			t28 = space();
    			h2 = element("h2");
    			h2.textContent = "Click here for event information";
    			add_location(b, file$9, 97, 9, 1817);
    			attr_dev(i0, "class", "svelte-1ig10dm");
    			add_location(i0, file$9, 97, 33, 1841);
    			attr_dev(h1, "class", "svelte-1ig10dm");
    			add_location(h1, file$9, 97, 5, 1813);
    			attr_dev(p0, "class", "svelte-1ig10dm");
    			add_location(p0, file$9, 101, 17, 1942);
    			attr_dev(p1, "class", "svelte-1ig10dm");
    			add_location(p1, file$9, 105, 16, 2152);
    			attr_dev(p2, "class", "svelte-1ig10dm");
    			add_location(p2, file$9, 108, 16, 2500);
    			attr_dev(button, "class", "svelte-1ig10dm");
    			add_location(button, file$9, 113, 19, 2773);
    			attr_dev(div0, "id", "btnEvent");
    			attr_dev(div0, "class", "svelte-1ig10dm");
    			add_location(div0, file$9, 112, 16, 2734);
    			add_location(div1, file$9, 99, 8, 1906);
    			add_location(div2, file$9, 116, 8, 2897);
    			attr_dev(img0, "id", "imgCon");
    			if (img0.src !== (img0_src_value = "/build/assets/pages/pubed/main-photo.webp")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Kids with mascot");
    			attr_dev(img0, "class", "svelte-1ig10dm");
    			add_location(img0, file$9, 118, 14, 2937);
    			add_location(div3, file$9, 117, 8, 2917);
    			attr_dev(div4, "class", "grid-container-3 svelte-1ig10dm");
    			add_location(div4, file$9, 98, 4, 1867);
    			add_location(i1, file$9, 125, 16, 3095);
    			attr_dev(h3, "class", "svelte-1ig10dm");
    			add_location(h3, file$9, 125, 12, 3091);
    			attr_dev(p3, "class", "svelte-1ig10dm");
    			add_location(p3, file$9, 126, 12, 3163);
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "imgResponsive svelte-1ig10dm");
    			if (img1.src !== (img1_src_value = "/build/assets/pages/pubed/karis_law_banner.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Kari Banner");
    			add_location(img1, file$9, 128, 12, 4064);
    			attr_dev(div5, "class", "bannerMsg svelte-1ig10dm");
    			add_location(div5, file$9, 129, 12, 4193);
    			attr_dev(img2, "loading", "lazy");
    			attr_dev(img2, "class", "imgResponsive svelte-1ig10dm");
    			if (img2.src !== (img2_src_value = "/build/assets/pages/pubed/lv_banner.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Lv banner");
    			add_location(img2, file$9, 133, 12, 4487);
    			attr_dev(div6, "class", "bannerMsg svelte-1ig10dm");
    			add_location(div6, file$9, 134, 13, 4607);
    			add_location(br, file$9, 146, 15, 5578);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://www.congress.gov/bill/115th-congress/house-bill/582/text");
    			add_location(a, file$9, 146, 26, 5589);
    			attr_dev(div7, "class", "bannerMsg svelte-1ig10dm");
    			add_location(div7, file$9, 144, 12, 5236);
    			attr_dev(img3, "loading", "lazy");
    			attr_dev(img3, "class", "imgResponsive svelte-1ig10dm");
    			attr_dev(img3, "width", "850");
    			if (img3.src !== (img3_src_value = "/assets/jpg/team_banner.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Team Banner");
    			add_location(img3, file$9, 150, 16, 5816);
    			set_style(h2, "text-align", "center");
    			set_style(h2, "color", "#88362E");
    			attr_dev(h2, "class", "svelte-1ig10dm");
    			add_location(h2, file$9, 151, 16, 5942);
    			add_location(div8, file$9, 149, 12, 5793);
    			add_location(div9, file$9, 124, 8, 3073);
    			attr_dev(div10, "class", "flex-container svelte-1ig10dm");
    			add_location(div10, file$9, 96, 0, 1779);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, h1);
    			append_dev(h1, b);
    			append_dev(h1, i0);
    			append_dev(div10, t2);
    			append_dev(div10, div4);
    			append_dev(div4, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(div1, t6);
    			append_dev(div1, p2);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div4, t10);
    			append_dev(div4, div2);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, img0);
    			append_dev(div10, t12);
    			append_dev(div10, div9);
    			append_dev(div9, h3);
    			append_dev(h3, i1);
    			append_dev(div9, t14);
    			append_dev(div9, p3);
    			append_dev(div9, t16);
    			append_dev(div9, img1);
    			append_dev(div9, t17);
    			append_dev(div9, div5);
    			append_dev(div9, t19);
    			append_dev(div9, img2);
    			append_dev(div9, t20);
    			append_dev(div9, div6);
    			append_dev(div9, t22);
    			if_blocks[current_block_type_index].m(div9, null);
    			append_dev(div9, t23);
    			append_dev(div9, div7);
    			append_dev(div7, t24);
    			append_dev(div7, br);
    			append_dev(div7, t25);
    			append_dev(div7, a);
    			append_dev(div9, t27);
    			append_dev(div9, div8);
    			append_dev(div8, img3);
    			append_dev(div8, t28);
    			append_dev(div8, h2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(div9, t23);
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
    			if (detaching) detach_dev(div10);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let txtVideo = false;

    	const click_handler = () => {
    		navigateTo("#PubEdRequest");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, txtVideo = false);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, txtVideo = !txtVideo);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("txtVideo" in $$props) $$invalidate(0, txtVideo = $$props.txtVideo);
    	};

    	return [txtVideo, click_handler, click_handler_1, click_handler_2];
    }

    class PubEd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PubEd",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/PubEdForm/ButtonNext.svelte generated by Svelte v3.16.7 */

    const file$a = "src/components/PubEdForm/ButtonNext.svelte";

    function create_fragment$b(ctx) {
    	let button;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*lbl*/ ctx[0]);
    			attr_dev(button, "type", "button");
    			set_style(button, "float", /*float*/ ctx[1]);
    			set_style(button, "border-radius", "10%");
    			set_style(button, "cursor", "pointer");
    			set_style(button, "background", "#2D2D61");
    			set_style(button, "color", "white");
    			add_location(button, file$a, 4, 0, 67);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lbl*/ 1) set_data_dev(t, /*lbl*/ ctx[0]);

    			if (dirty & /*float*/ 2) {
    				set_style(button, "float", /*float*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { lbl = "" } = $$props;
    	let { float = "" } = $$props;
    	const writable_props = ["lbl", "float"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonNext> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("lbl" in $$props) $$invalidate(0, lbl = $$props.lbl);
    		if ("float" in $$props) $$invalidate(1, float = $$props.float);
    	};

    	$$self.$capture_state = () => {
    		return { lbl, float };
    	};

    	$$self.$inject_state = $$props => {
    		if ("lbl" in $$props) $$invalidate(0, lbl = $$props.lbl);
    		if ("float" in $$props) $$invalidate(1, float = $$props.float);
    	};

    	return [lbl, float, click_handler];
    }

    class ButtonNext extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$b, safe_not_equal, { lbl: 0, float: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonNext",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get lbl() {
    		throw new Error("<ButtonNext>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lbl(value) {
    		throw new Error("<ButtonNext>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get float() {
    		throw new Error("<ButtonNext>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set float(value) {
    		throw new Error("<ButtonNext>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PubEdForm/EventRequest.svelte generated by Svelte v3.16.7 */
    const file$b = "src/components/PubEdForm/EventRequest.svelte";

    // (317:53) 
    function create_if_block_3(ctx) {
    	let div2;
    	let div0;
    	let label0;
    	let t1;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let select1;
    	let option3;
    	let option4;
    	let option5;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Will Identification be required to enter premises?";
    			t1 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option1 = element("option");
    			option1.textContent = "Yes";
    			option2 = element("option");
    			option2.textContent = "No";
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Will this be an Indoor/OutDoor Event";
    			t6 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option4 = element("option");
    			option4.textContent = "Indoor";
    			option5 = element("option");
    			option5.textContent = "Outdoor";
    			attr_dev(label0, "class", "svelte-55iz75");
    			add_location(label0, file$b, 319, 32, 15602);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$b, 321, 34, 15757);
    			option1.__value = "Yes";
    			option1.value = option1.__value;
    			add_location(option1, file$b, 322, 34, 15810);
    			option2.__value = "No";
    			option2.value = option2.__value;
    			add_location(option2, file$b, 323, 34, 15865);
    			attr_dev(select0, "name", "");
    			attr_dev(select0, "id", "");
    			attr_dev(select0, "class", "svelte-55iz75");
    			add_location(select0, file$b, 320, 32, 15700);
    			attr_dev(div0, "class", "group");
    			add_location(div0, file$b, 318, 30, 15550);
    			attr_dev(label1, "class", "svelte-55iz75");
    			add_location(label1, file$b, 327, 34, 16048);
    			option3.__value = "";
    			option3.value = option3.__value;
    			add_location(option3, file$b, 329, 36, 16180);
    			option4.__value = "Indoor";
    			option4.value = option4.__value;
    			add_location(option4, file$b, 330, 36, 16234);
    			option5.__value = "Outdoor";
    			option5.value = option5.__value;
    			add_location(option5, file$b, 331, 36, 16294);
    			attr_dev(select1, "class", "svelte-55iz75");
    			add_location(select1, file$b, 328, 34, 16135);
    			attr_dev(div1, "class", "group");
    			add_location(div1, file$b, 326, 30, 15994);
    			attr_dev(div2, "id", "wrapper");
    			add_location(div2, file$b, 317, 26, 15501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(317:53) ",
    		ctx
    	});

    	return block;
    }

    // (271:54) 
    function create_if_block_2(ctx) {
    	let h30;
    	let t1;
    	let div4;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let div3;
    	let label3;
    	let t12;
    	let input3;
    	let div4_transition;
    	let t13;
    	let h31;
    	let t15;
    	let div9;
    	let div5;
    	let label4;
    	let t17;
    	let input4;
    	let t18;
    	let div6;
    	let label5;
    	let t20;
    	let input5;
    	let t21;
    	let div7;
    	let label6;
    	let t23;
    	let input6;
    	let t24;
    	let div8;
    	let label7;
    	let t26;
    	let input7;
    	let div9_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "Main Contact";
    			t1 = space();
    			div4 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "First Name:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Last Name:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Phone Number:";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "E-mail:";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			h31 = element("h3");
    			h31.textContent = "Alternate Contact";
    			t15 = space();
    			div9 = element("div");
    			div5 = element("div");
    			label4 = element("label");
    			label4.textContent = "First Name:";
    			t17 = space();
    			input4 = element("input");
    			t18 = space();
    			div6 = element("div");
    			label5 = element("label");
    			label5.textContent = "Last Name:";
    			t20 = space();
    			input5 = element("input");
    			t21 = space();
    			div7 = element("div");
    			label6 = element("label");
    			label6.textContent = "Phone Number:";
    			t23 = space();
    			input6 = element("input");
    			t24 = space();
    			div8 = element("div");
    			label7 = element("label");
    			label7.textContent = "E-mail:";
    			t26 = space();
    			input7 = element("input");
    			attr_dev(h30, "class", "svelte-55iz75");
    			add_location(h30, file$b, 271, 28, 13382);
    			attr_dev(label0, "class", "svelte-55iz75");
    			add_location(label0, file$b, 274, 34, 13581);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-55iz75");
    			add_location(input0, file$b, 275, 34, 13642);
    			attr_dev(div0, "class", "group");
    			add_location(div0, file$b, 273, 30, 13527);
    			attr_dev(label1, "class", "svelte-55iz75");
    			add_location(label1, file$b, 279, 34, 13786);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-55iz75");
    			add_location(input1, file$b, 280, 34, 13846);
    			attr_dev(div1, "class", "group");
    			add_location(div1, file$b, 278, 30, 13732);
    			attr_dev(label2, "class", "svelte-55iz75");
    			add_location(label2, file$b, 285, 34, 14025);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-55iz75");
    			add_location(input2, file$b, 286, 34, 14088);
    			attr_dev(div2, "class", "group");
    			add_location(div2, file$b, 284, 30, 13971);
    			attr_dev(label3, "class", "svelte-55iz75");
    			add_location(label3, file$b, 289, 34, 14232);
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "class", "svelte-55iz75");
    			add_location(input3, file$b, 290, 34, 14289);
    			attr_dev(div3, "class", "group");
    			add_location(div3, file$b, 288, 31, 14178);
    			attr_dev(div4, "id", "wrapper");
    			add_location(div4, file$b, 272, 27, 13431);
    			attr_dev(h31, "class", "svelte-55iz75");
    			add_location(h31, file$b, 294, 28, 14413);
    			attr_dev(label4, "class", "svelte-55iz75");
    			add_location(label4, file$b, 297, 34, 14617);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "svelte-55iz75");
    			add_location(input4, file$b, 298, 34, 14678);
    			attr_dev(div5, "class", "group");
    			add_location(div5, file$b, 296, 30, 14563);
    			attr_dev(label5, "class", "svelte-55iz75");
    			add_location(label5, file$b, 302, 34, 14822);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "svelte-55iz75");
    			add_location(input5, file$b, 303, 34, 14882);
    			attr_dev(div6, "class", "group");
    			add_location(div6, file$b, 301, 30, 14768);
    			attr_dev(label6, "class", "svelte-55iz75");
    			add_location(label6, file$b, 308, 34, 15061);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "svelte-55iz75");
    			add_location(input6, file$b, 309, 34, 15124);
    			attr_dev(div7, "class", "group");
    			add_location(div7, file$b, 307, 30, 15007);
    			attr_dev(label7, "class", "svelte-55iz75");
    			add_location(label7, file$b, 312, 34, 15268);
    			attr_dev(input7, "type", "email");
    			attr_dev(input7, "class", "svelte-55iz75");
    			add_location(input7, file$b, 313, 34, 15325);
    			attr_dev(div8, "class", "group");
    			add_location(div8, file$b, 311, 31, 15214);
    			attr_dev(div9, "id", "wrapper");
    			add_location(div9, file$b, 295, 27, 14467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			append_dev(div4, t4);
    			append_dev(div4, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			append_dev(div4, t7);
    			append_dev(div4, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t12);
    			append_dev(div3, input3);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div5);
    			append_dev(div5, label4);
    			append_dev(div5, t17);
    			append_dev(div5, input4);
    			append_dev(div9, t18);
    			append_dev(div9, div6);
    			append_dev(div6, label5);
    			append_dev(div6, t20);
    			append_dev(div6, input5);
    			append_dev(div9, t21);
    			append_dev(div9, div7);
    			append_dev(div7, label6);
    			append_dev(div7, t23);
    			append_dev(div7, input6);
    			append_dev(div9, t24);
    			append_dev(div9, div8);
    			append_dev(div8, label7);
    			append_dev(div8, t26);
    			append_dev(div8, input7);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fly, { x: 200, duration: 200 }, true);
    				div4_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div9_transition) div9_transition = create_bidirectional_transition(div9, fly, { x: 200, duration: 200 }, true);
    				div9_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fly, { x: 200, duration: 200 }, false);
    			div4_transition.run(0);
    			if (!div9_transition) div9_transition = create_bidirectional_transition(div9, fly, { x: 200, duration: 200 }, false);
    			div9_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_transition) div4_transition.end();
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div9);
    			if (detaching && div9_transition) div9_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(271:54) ",
    		ctx
    	});

    	return block;
    }

    // (96:24) {#if (selectedIndex == 0)}
    function create_if_block$3(ctx) {
    	let div8;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let small;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let div3;
    	let label3;
    	let t12;
    	let input3;
    	let t13;
    	let div4;
    	let label4;
    	let t15;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let option12;
    	let option13;
    	let option14;
    	let option15;
    	let option16;
    	let option17;
    	let option18;
    	let option19;
    	let option20;
    	let option21;
    	let option22;
    	let option23;
    	let option24;
    	let option25;
    	let option26;
    	let option27;
    	let option28;
    	let option29;
    	let option30;
    	let option31;
    	let option32;
    	let option33;
    	let option34;
    	let option35;
    	let option36;
    	let option37;
    	let option38;
    	let option39;
    	let option40;
    	let t56;
    	let div5;
    	let label5;
    	let t58;
    	let select1;
    	let option41;
    	let option42;
    	let option43;
    	let option44;
    	let option45;
    	let option46;
    	let option47;
    	let option48;
    	let option49;
    	let option50;
    	let option51;
    	let option52;
    	let option53;
    	let option54;
    	let option55;
    	let option56;
    	let option57;
    	let option58;
    	let option59;
    	let option60;
    	let option61;
    	let option62;
    	let option63;
    	let option64;
    	let option65;
    	let option66;
    	let option67;
    	let option68;
    	let option69;
    	let option70;
    	let option71;
    	let option72;
    	let option73;
    	let option74;
    	let option75;
    	let option76;
    	let option77;
    	let option78;
    	let option79;
    	let option80;
    	let option81;
    	let t99;
    	let div6;
    	let label6;
    	let t101;
    	let select2;
    	let option82;
    	let option83;
    	let option84;
    	let option85;
    	let option86;
    	let option87;
    	let option88;
    	let option89;
    	let option90;
    	let option91;
    	let option92;
    	let option93;
    	let option94;
    	let option95;
    	let option96;
    	let option97;
    	let option98;
    	let option99;
    	let option100;
    	let option101;
    	let option102;
    	let option103;
    	let option104;
    	let option105;
    	let option106;
    	let option107;
    	let option108;
    	let option109;
    	let option110;
    	let option111;
    	let option112;
    	let option113;
    	let option114;
    	let option115;
    	let option116;
    	let option117;
    	let option118;
    	let option119;
    	let option120;
    	let option121;
    	let option122;
    	let t142;
    	let div7;
    	let div8_transition;
    	let current;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*fileName*/ ctx[8]) return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Event Name:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "From Date:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			small = element("small");
    			small.textContent = "The event needs to be 14 business day or more in advance.";
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "To Date:";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Address of Event:";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Setup Time:";
    			t15 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option1 = element("option");
    			option1.textContent = "5:00 AM";
    			option2 = element("option");
    			option2.textContent = "5:30 AM";
    			option3 = element("option");
    			option3.textContent = "6:00 AM";
    			option4 = element("option");
    			option4.textContent = "6:30 AM";
    			option5 = element("option");
    			option5.textContent = "7:00 AM";
    			option6 = element("option");
    			option6.textContent = "7:30 AM";
    			option7 = element("option");
    			option7.textContent = "8:00 AM";
    			option8 = element("option");
    			option8.textContent = "8:30 AM";
    			option9 = element("option");
    			option9.textContent = "9:00 AM";
    			option10 = element("option");
    			option10.textContent = "9:30 AM";
    			option11 = element("option");
    			option11.textContent = "10:00 AM";
    			option12 = element("option");
    			option12.textContent = "10:30 AM";
    			option13 = element("option");
    			option13.textContent = "11:00 AM";
    			option14 = element("option");
    			option14.textContent = "11:30 AM";
    			option15 = element("option");
    			option15.textContent = "12:00 PM";
    			option16 = element("option");
    			option16.textContent = "12:30 PM";
    			option17 = element("option");
    			option17.textContent = "1:00 PM";
    			option18 = element("option");
    			option18.textContent = "1:30 PM";
    			option19 = element("option");
    			option19.textContent = "2:00 PM";
    			option20 = element("option");
    			option20.textContent = "2:30 PM";
    			option21 = element("option");
    			option21.textContent = "3:00 PM";
    			option22 = element("option");
    			option22.textContent = "3:30 PM";
    			option23 = element("option");
    			option23.textContent = "4:00 PM";
    			option24 = element("option");
    			option24.textContent = "4:30 PM";
    			option25 = element("option");
    			option25.textContent = "5:00 PM";
    			option26 = element("option");
    			option26.textContent = "5:30 PM";
    			option27 = element("option");
    			option27.textContent = "6:00 PM";
    			option28 = element("option");
    			option28.textContent = "6:30 PM";
    			option29 = element("option");
    			option29.textContent = "7:00 PM";
    			option30 = element("option");
    			option30.textContent = "7:30 PM";
    			option31 = element("option");
    			option31.textContent = "8:00 PM";
    			option32 = element("option");
    			option32.textContent = "8:30 PM";
    			option33 = element("option");
    			option33.textContent = "9:00 PM";
    			option34 = element("option");
    			option34.textContent = "9:30 PM";
    			option35 = element("option");
    			option35.textContent = "10:00 PM";
    			option36 = element("option");
    			option36.textContent = "10:30 PM";
    			option37 = element("option");
    			option37.textContent = "11:00 PM";
    			option38 = element("option");
    			option38.textContent = "11:30 PM";
    			option39 = element("option");
    			option39.textContent = "12:00 AM";
    			option40 = element("option");
    			option40.textContent = "12:30 AM";
    			t56 = space();
    			div5 = element("div");
    			label5 = element("label");
    			label5.textContent = "Event Start Time:";
    			t58 = space();
    			select1 = element("select");
    			option41 = element("option");
    			option42 = element("option");
    			option42.textContent = "5:00 AM";
    			option43 = element("option");
    			option43.textContent = "5:30 AM";
    			option44 = element("option");
    			option44.textContent = "6:00 AM";
    			option45 = element("option");
    			option45.textContent = "6:30 AM";
    			option46 = element("option");
    			option46.textContent = "7:00 AM";
    			option47 = element("option");
    			option47.textContent = "7:30 AM";
    			option48 = element("option");
    			option48.textContent = "8:00 AM";
    			option49 = element("option");
    			option49.textContent = "8:30 AM";
    			option50 = element("option");
    			option50.textContent = "9:00 AM";
    			option51 = element("option");
    			option51.textContent = "9:30 AM";
    			option52 = element("option");
    			option52.textContent = "10:00 AM";
    			option53 = element("option");
    			option53.textContent = "10:30 AM";
    			option54 = element("option");
    			option54.textContent = "11:00 AM";
    			option55 = element("option");
    			option55.textContent = "11:30 AM";
    			option56 = element("option");
    			option56.textContent = "12:00 PM";
    			option57 = element("option");
    			option57.textContent = "12:30 PM";
    			option58 = element("option");
    			option58.textContent = "1:00 PM";
    			option59 = element("option");
    			option59.textContent = "1:30 PM";
    			option60 = element("option");
    			option60.textContent = "2:00 PM";
    			option61 = element("option");
    			option61.textContent = "2:30 PM";
    			option62 = element("option");
    			option62.textContent = "3:00 PM";
    			option63 = element("option");
    			option63.textContent = "3:30 PM";
    			option64 = element("option");
    			option64.textContent = "4:00 PM";
    			option65 = element("option");
    			option65.textContent = "4:30 PM";
    			option66 = element("option");
    			option66.textContent = "5:00 PM";
    			option67 = element("option");
    			option67.textContent = "5:30 PM";
    			option68 = element("option");
    			option68.textContent = "6:00 PM";
    			option69 = element("option");
    			option69.textContent = "6:30 PM";
    			option70 = element("option");
    			option70.textContent = "7:00 PM";
    			option71 = element("option");
    			option71.textContent = "7:30 PM";
    			option72 = element("option");
    			option72.textContent = "8:00 PM";
    			option73 = element("option");
    			option73.textContent = "8:30 PM";
    			option74 = element("option");
    			option74.textContent = "9:00 PM";
    			option75 = element("option");
    			option75.textContent = "9:30 PM";
    			option76 = element("option");
    			option76.textContent = "10:00 PM";
    			option77 = element("option");
    			option77.textContent = "10:30 PM";
    			option78 = element("option");
    			option78.textContent = "11:00 PM";
    			option79 = element("option");
    			option79.textContent = "11:30 PM";
    			option80 = element("option");
    			option80.textContent = "12:00 AM";
    			option81 = element("option");
    			option81.textContent = "12:30 AM";
    			t99 = space();
    			div6 = element("div");
    			label6 = element("label");
    			label6.textContent = "Event End Time:";
    			t101 = space();
    			select2 = element("select");
    			option82 = element("option");
    			option83 = element("option");
    			option83.textContent = "5:00 AM";
    			option84 = element("option");
    			option84.textContent = "5:30 AM";
    			option85 = element("option");
    			option85.textContent = "6:00 AM";
    			option86 = element("option");
    			option86.textContent = "6:30 AM";
    			option87 = element("option");
    			option87.textContent = "7:00 AM";
    			option88 = element("option");
    			option88.textContent = "7:30 AM";
    			option89 = element("option");
    			option89.textContent = "8:00 AM";
    			option90 = element("option");
    			option90.textContent = "8:30 AM";
    			option91 = element("option");
    			option91.textContent = "9:00 AM";
    			option92 = element("option");
    			option92.textContent = "9:30 AM";
    			option93 = element("option");
    			option93.textContent = "10:00 AM";
    			option94 = element("option");
    			option94.textContent = "10:30 AM";
    			option95 = element("option");
    			option95.textContent = "11:00 AM";
    			option96 = element("option");
    			option96.textContent = "11:30 AM";
    			option97 = element("option");
    			option97.textContent = "12:00 PM";
    			option98 = element("option");
    			option98.textContent = "12:30 PM";
    			option99 = element("option");
    			option99.textContent = "1:00 PM";
    			option100 = element("option");
    			option100.textContent = "1:30 PM";
    			option101 = element("option");
    			option101.textContent = "2:00 PM";
    			option102 = element("option");
    			option102.textContent = "2:30 PM";
    			option103 = element("option");
    			option103.textContent = "3:00 PM";
    			option104 = element("option");
    			option104.textContent = "3:30 PM";
    			option105 = element("option");
    			option105.textContent = "4:00 PM";
    			option106 = element("option");
    			option106.textContent = "4:30 PM";
    			option107 = element("option");
    			option107.textContent = "5:00 PM";
    			option108 = element("option");
    			option108.textContent = "5:30 PM";
    			option109 = element("option");
    			option109.textContent = "6:00 PM";
    			option110 = element("option");
    			option110.textContent = "6:30 PM";
    			option111 = element("option");
    			option111.textContent = "7:00 PM";
    			option112 = element("option");
    			option112.textContent = "7:30 PM";
    			option113 = element("option");
    			option113.textContent = "8:00 PM";
    			option114 = element("option");
    			option114.textContent = "8:30 PM";
    			option115 = element("option");
    			option115.textContent = "9:00 PM";
    			option116 = element("option");
    			option116.textContent = "9:30 PM";
    			option117 = element("option");
    			option117.textContent = "10:00 PM";
    			option118 = element("option");
    			option118.textContent = "10:30 PM";
    			option119 = element("option");
    			option119.textContent = "11:00 PM";
    			option120 = element("option");
    			option120.textContent = "11:30 PM";
    			option121 = element("option");
    			option121.textContent = "12:00 AM";
    			option122 = element("option");
    			option122.textContent = "12:30 AM";
    			t142 = space();
    			div7 = element("div");
    			if_block.c();
    			attr_dev(label0, "class", "svelte-55iz75");
    			add_location(label0, file$b, 98, 34, 2698);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-55iz75");
    			add_location(input0, file$b, 99, 34, 2759);
    			attr_dev(div0, "class", "group");
    			add_location(div0, file$b, 97, 30, 2644);
    			attr_dev(label1, "class", "svelte-55iz75");
    			add_location(label1, file$b, 103, 34, 2927);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-55iz75");
    			add_location(input1, file$b, 104, 34, 2987);
    			attr_dev(small, "id", "dateHelp");
    			attr_dev(small, "class", "form-text text-muted svelte-55iz75");
    			add_location(small, file$b, 105, 34, 3066);
    			attr_dev(div1, "class", "group");
    			add_location(div1, file$b, 102, 30, 2873);
    			attr_dev(label2, "class", "svelte-55iz75");
    			add_location(label2, file$b, 109, 34, 3304);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-55iz75");
    			add_location(input2, file$b, 110, 34, 3362);
    			attr_dev(div2, "class", "group");
    			add_location(div2, file$b, 108, 30, 3250);
    			attr_dev(label3, "class", "svelte-55iz75");
    			add_location(label3, file$b, 115, 34, 3562);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "svelte-55iz75");
    			add_location(input3, file$b, 116, 34, 3629);
    			attr_dev(div3, "class", "group");
    			add_location(div3, file$b, 114, 30, 3508);
    			attr_dev(label4, "class", "svelte-55iz75");
    			add_location(label4, file$b, 120, 34, 3794);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$b, 122, 40, 3989);
    			option1.__value = "5:00 AM";
    			option1.value = option1.__value;
    			add_location(option1, file$b, 123, 40, 4047);
    			option2.__value = "5:30 AM";
    			option2.value = option2.__value;
    			add_location(option2, file$b, 124, 40, 4112);
    			option3.__value = "6:00 AM";
    			option3.value = option3.__value;
    			add_location(option3, file$b, 125, 40, 4177);
    			option4.__value = "6:30 AM";
    			option4.value = option4.__value;
    			add_location(option4, file$b, 126, 40, 4242);
    			option5.__value = "7:00 AM";
    			option5.value = option5.__value;
    			add_location(option5, file$b, 127, 40, 4307);
    			option6.__value = "7:30 AM";
    			option6.value = option6.__value;
    			add_location(option6, file$b, 128, 40, 4372);
    			option7.__value = "8:00 AM";
    			option7.value = option7.__value;
    			add_location(option7, file$b, 129, 40, 4437);
    			option8.__value = "8:30 AM";
    			option8.value = option8.__value;
    			add_location(option8, file$b, 130, 40, 4502);
    			option9.__value = "9:00 AM";
    			option9.value = option9.__value;
    			add_location(option9, file$b, 131, 40, 4567);
    			option10.__value = "9:30 AM";
    			option10.value = option10.__value;
    			add_location(option10, file$b, 132, 40, 4632);
    			option11.__value = "10:00 AM";
    			option11.value = option11.__value;
    			add_location(option11, file$b, 133, 40, 4697);
    			option12.__value = "10:30 AM";
    			option12.value = option12.__value;
    			add_location(option12, file$b, 134, 40, 4763);
    			option13.__value = "11:00 AM";
    			option13.value = option13.__value;
    			add_location(option13, file$b, 135, 40, 4829);
    			option14.__value = "11:30 AM";
    			option14.value = option14.__value;
    			add_location(option14, file$b, 136, 40, 4895);
    			option15.__value = "12:00 PM";
    			option15.value = option15.__value;
    			add_location(option15, file$b, 137, 40, 4961);
    			option16.__value = "12:30 PM";
    			option16.value = option16.__value;
    			add_location(option16, file$b, 138, 40, 5027);
    			option17.__value = "1:00 PM";
    			option17.value = option17.__value;
    			add_location(option17, file$b, 139, 40, 5093);
    			option18.__value = "1:30 PM";
    			option18.value = option18.__value;
    			add_location(option18, file$b, 140, 40, 5158);
    			option19.__value = "2:00 PM";
    			option19.value = option19.__value;
    			add_location(option19, file$b, 141, 40, 5223);
    			option20.__value = "2:30 PM";
    			option20.value = option20.__value;
    			add_location(option20, file$b, 142, 40, 5288);
    			option21.__value = "3:00 PM";
    			option21.value = option21.__value;
    			add_location(option21, file$b, 143, 40, 5353);
    			option22.__value = "3:30 PM";
    			option22.value = option22.__value;
    			add_location(option22, file$b, 144, 40, 5418);
    			option23.__value = "4:00 PM";
    			option23.value = option23.__value;
    			add_location(option23, file$b, 145, 40, 5483);
    			option24.__value = "4:30 PM";
    			option24.value = option24.__value;
    			add_location(option24, file$b, 146, 40, 5548);
    			option25.__value = "5:00 PM";
    			option25.value = option25.__value;
    			add_location(option25, file$b, 147, 40, 5613);
    			option26.__value = "5:30 PM";
    			option26.value = option26.__value;
    			add_location(option26, file$b, 148, 40, 5678);
    			option27.__value = "6:00 PM";
    			option27.value = option27.__value;
    			add_location(option27, file$b, 149, 40, 5743);
    			option28.__value = "6:30 PM";
    			option28.value = option28.__value;
    			add_location(option28, file$b, 150, 40, 5808);
    			option29.__value = "7:00 PM";
    			option29.value = option29.__value;
    			add_location(option29, file$b, 151, 40, 5873);
    			option30.__value = "7:30 PM";
    			option30.value = option30.__value;
    			add_location(option30, file$b, 152, 40, 5938);
    			option31.__value = "8:00 PM";
    			option31.value = option31.__value;
    			add_location(option31, file$b, 153, 40, 6003);
    			option32.__value = "8:30 PM";
    			option32.value = option32.__value;
    			add_location(option32, file$b, 154, 40, 6068);
    			option33.__value = "9:00 PM";
    			option33.value = option33.__value;
    			add_location(option33, file$b, 155, 40, 6133);
    			option34.__value = "9:30 PM";
    			option34.value = option34.__value;
    			add_location(option34, file$b, 156, 40, 6198);
    			option35.__value = "10:00 PM";
    			option35.value = option35.__value;
    			add_location(option35, file$b, 157, 40, 6263);
    			option36.__value = "10:30 PM";
    			option36.value = option36.__value;
    			add_location(option36, file$b, 158, 40, 6329);
    			option37.__value = "11:00 PM";
    			option37.value = option37.__value;
    			add_location(option37, file$b, 159, 40, 6395);
    			option38.__value = "11:30 PM";
    			option38.value = option38.__value;
    			add_location(option38, file$b, 160, 40, 6461);
    			option39.__value = "12:00 AM";
    			option39.value = option39.__value;
    			add_location(option39, file$b, 161, 40, 6527);
    			option40.__value = "12:30 AM";
    			option40.value = option40.__value;
    			add_location(option40, file$b, 162, 40, 6593);
    			attr_dev(select0, "name", "StpTime");
    			attr_dev(select0, "class", "form-control svelte-55iz75");
    			attr_dev(select0, "id", "StpTime");
    			select0.required = "";
    			if (/*setup_time*/ ctx[5] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[18].call(select0));
    			add_location(select0, file$b, 121, 34, 3855);
    			attr_dev(div4, "class", "group");
    			add_location(div4, file$b, 119, 30, 3740);
    			attr_dev(label5, "class", "svelte-55iz75");
    			add_location(label5, file$b, 167, 34, 6785);
    			option41.__value = "";
    			option41.value = option41.__value;
    			add_location(option41, file$b, 169, 40, 6987);
    			option42.__value = "5:00 AM";
    			option42.value = option42.__value;
    			add_location(option42, file$b, 170, 40, 7045);
    			option43.__value = "5:30 AM";
    			option43.value = option43.__value;
    			add_location(option43, file$b, 171, 40, 7110);
    			option44.__value = "6:00 AM";
    			option44.value = option44.__value;
    			add_location(option44, file$b, 172, 40, 7175);
    			option45.__value = "6:30 AM";
    			option45.value = option45.__value;
    			add_location(option45, file$b, 173, 40, 7240);
    			option46.__value = "7:00 AM";
    			option46.value = option46.__value;
    			add_location(option46, file$b, 174, 40, 7305);
    			option47.__value = "7:30 AM";
    			option47.value = option47.__value;
    			add_location(option47, file$b, 175, 40, 7370);
    			option48.__value = "8:00 AM";
    			option48.value = option48.__value;
    			add_location(option48, file$b, 176, 40, 7435);
    			option49.__value = "8:30 AM";
    			option49.value = option49.__value;
    			add_location(option49, file$b, 177, 40, 7500);
    			option50.__value = "9:00 AM";
    			option50.value = option50.__value;
    			add_location(option50, file$b, 178, 40, 7565);
    			option51.__value = "9:30 AM";
    			option51.value = option51.__value;
    			add_location(option51, file$b, 179, 40, 7630);
    			option52.__value = "10:00 AM";
    			option52.value = option52.__value;
    			add_location(option52, file$b, 180, 40, 7695);
    			option53.__value = "10:30 AM";
    			option53.value = option53.__value;
    			add_location(option53, file$b, 181, 40, 7761);
    			option54.__value = "11:00 AM";
    			option54.value = option54.__value;
    			add_location(option54, file$b, 182, 40, 7827);
    			option55.__value = "11:30 AM";
    			option55.value = option55.__value;
    			add_location(option55, file$b, 183, 40, 7893);
    			option56.__value = "12:00 PM";
    			option56.value = option56.__value;
    			add_location(option56, file$b, 184, 40, 7959);
    			option57.__value = "12:30 PM";
    			option57.value = option57.__value;
    			add_location(option57, file$b, 185, 40, 8025);
    			option58.__value = "1:00 PM";
    			option58.value = option58.__value;
    			add_location(option58, file$b, 186, 40, 8091);
    			option59.__value = "1:30 PM";
    			option59.value = option59.__value;
    			add_location(option59, file$b, 187, 40, 8156);
    			option60.__value = "2:00 PM";
    			option60.value = option60.__value;
    			add_location(option60, file$b, 188, 40, 8221);
    			option61.__value = "2:30 PM";
    			option61.value = option61.__value;
    			add_location(option61, file$b, 189, 40, 8286);
    			option62.__value = "3:00 PM";
    			option62.value = option62.__value;
    			add_location(option62, file$b, 190, 40, 8351);
    			option63.__value = "3:30 PM";
    			option63.value = option63.__value;
    			add_location(option63, file$b, 191, 40, 8416);
    			option64.__value = "4:00 PM";
    			option64.value = option64.__value;
    			add_location(option64, file$b, 192, 40, 8481);
    			option65.__value = "4:30 PM";
    			option65.value = option65.__value;
    			add_location(option65, file$b, 193, 40, 8546);
    			option66.__value = "5:00 PM";
    			option66.value = option66.__value;
    			add_location(option66, file$b, 194, 40, 8611);
    			option67.__value = "5:30 PM";
    			option67.value = option67.__value;
    			add_location(option67, file$b, 195, 40, 8676);
    			option68.__value = "6:00 PM";
    			option68.value = option68.__value;
    			add_location(option68, file$b, 196, 40, 8741);
    			option69.__value = "6:30 PM";
    			option69.value = option69.__value;
    			add_location(option69, file$b, 197, 40, 8806);
    			option70.__value = "7:00 PM";
    			option70.value = option70.__value;
    			add_location(option70, file$b, 198, 40, 8871);
    			option71.__value = "7:30 PM";
    			option71.value = option71.__value;
    			add_location(option71, file$b, 199, 40, 8936);
    			option72.__value = "8:00 PM";
    			option72.value = option72.__value;
    			add_location(option72, file$b, 200, 40, 9001);
    			option73.__value = "8:30 PM";
    			option73.value = option73.__value;
    			add_location(option73, file$b, 201, 40, 9066);
    			option74.__value = "9:00 PM";
    			option74.value = option74.__value;
    			add_location(option74, file$b, 202, 40, 9131);
    			option75.__value = "9:30 PM";
    			option75.value = option75.__value;
    			add_location(option75, file$b, 203, 40, 9196);
    			option76.__value = "10:00 PM";
    			option76.value = option76.__value;
    			add_location(option76, file$b, 204, 40, 9261);
    			option77.__value = "10:30 PM";
    			option77.value = option77.__value;
    			add_location(option77, file$b, 205, 40, 9327);
    			option78.__value = "11:00 PM";
    			option78.value = option78.__value;
    			add_location(option78, file$b, 206, 40, 9393);
    			option79.__value = "11:30 PM";
    			option79.value = option79.__value;
    			add_location(option79, file$b, 207, 40, 9459);
    			option80.__value = "12:00 AM";
    			option80.value = option80.__value;
    			add_location(option80, file$b, 208, 40, 9525);
    			option81.__value = "12:30 AM";
    			option81.value = option81.__value;
    			add_location(option81, file$b, 209, 40, 9591);
    			attr_dev(select1, "name", "StpTime");
    			attr_dev(select1, "class", "form-control svelte-55iz75");
    			attr_dev(select1, "id", "StpTime");
    			select1.required = "";
    			if (/*event_start*/ ctx[6] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[19].call(select1));
    			add_location(select1, file$b, 168, 34, 6852);
    			attr_dev(div5, "class", "group");
    			add_location(div5, file$b, 166, 30, 6731);
    			attr_dev(label6, "class", "svelte-55iz75");
    			add_location(label6, file$b, 214, 34, 9783);
    			option82.__value = "";
    			option82.value = option82.__value;
    			add_location(option82, file$b, 216, 40, 9981);
    			option83.__value = "5:00 AM";
    			option83.value = option83.__value;
    			add_location(option83, file$b, 217, 40, 10039);
    			option84.__value = "5:30 AM";
    			option84.value = option84.__value;
    			add_location(option84, file$b, 218, 40, 10104);
    			option85.__value = "6:00 AM";
    			option85.value = option85.__value;
    			add_location(option85, file$b, 219, 40, 10169);
    			option86.__value = "6:30 AM";
    			option86.value = option86.__value;
    			add_location(option86, file$b, 220, 40, 10234);
    			option87.__value = "7:00 AM";
    			option87.value = option87.__value;
    			add_location(option87, file$b, 221, 40, 10299);
    			option88.__value = "7:30 AM";
    			option88.value = option88.__value;
    			add_location(option88, file$b, 222, 40, 10364);
    			option89.__value = "8:00 AM";
    			option89.value = option89.__value;
    			add_location(option89, file$b, 223, 40, 10429);
    			option90.__value = "8:30 AM";
    			option90.value = option90.__value;
    			add_location(option90, file$b, 224, 40, 10494);
    			option91.__value = "9:00 AM";
    			option91.value = option91.__value;
    			add_location(option91, file$b, 225, 40, 10559);
    			option92.__value = "9:30 AM";
    			option92.value = option92.__value;
    			add_location(option92, file$b, 226, 40, 10624);
    			option93.__value = "10:00 AM";
    			option93.value = option93.__value;
    			add_location(option93, file$b, 227, 40, 10689);
    			option94.__value = "10:30 AM";
    			option94.value = option94.__value;
    			add_location(option94, file$b, 228, 40, 10755);
    			option95.__value = "11:00 AM";
    			option95.value = option95.__value;
    			add_location(option95, file$b, 229, 40, 10821);
    			option96.__value = "11:30 AM";
    			option96.value = option96.__value;
    			add_location(option96, file$b, 230, 40, 10887);
    			option97.__value = "12:00 PM";
    			option97.value = option97.__value;
    			add_location(option97, file$b, 231, 40, 10953);
    			option98.__value = "12:30 PM";
    			option98.value = option98.__value;
    			add_location(option98, file$b, 232, 40, 11019);
    			option99.__value = "1:00 PM";
    			option99.value = option99.__value;
    			add_location(option99, file$b, 233, 40, 11085);
    			option100.__value = "1:30 PM";
    			option100.value = option100.__value;
    			add_location(option100, file$b, 234, 40, 11150);
    			option101.__value = "2:00 PM";
    			option101.value = option101.__value;
    			add_location(option101, file$b, 235, 40, 11215);
    			option102.__value = "2:30 PM";
    			option102.value = option102.__value;
    			add_location(option102, file$b, 236, 40, 11280);
    			option103.__value = "3:00 PM";
    			option103.value = option103.__value;
    			add_location(option103, file$b, 237, 40, 11345);
    			option104.__value = "3:30 PM";
    			option104.value = option104.__value;
    			add_location(option104, file$b, 238, 40, 11410);
    			option105.__value = "4:00 PM";
    			option105.value = option105.__value;
    			add_location(option105, file$b, 239, 40, 11475);
    			option106.__value = "4:30 PM";
    			option106.value = option106.__value;
    			add_location(option106, file$b, 240, 40, 11540);
    			option107.__value = "5:00 PM";
    			option107.value = option107.__value;
    			add_location(option107, file$b, 241, 40, 11605);
    			option108.__value = "5:30 PM";
    			option108.value = option108.__value;
    			add_location(option108, file$b, 242, 40, 11670);
    			option109.__value = "6:00 PM";
    			option109.value = option109.__value;
    			add_location(option109, file$b, 243, 40, 11735);
    			option110.__value = "6:30 PM";
    			option110.value = option110.__value;
    			add_location(option110, file$b, 244, 40, 11800);
    			option111.__value = "7:00 PM";
    			option111.value = option111.__value;
    			add_location(option111, file$b, 245, 40, 11865);
    			option112.__value = "7:30 PM";
    			option112.value = option112.__value;
    			add_location(option112, file$b, 246, 40, 11930);
    			option113.__value = "8:00 PM";
    			option113.value = option113.__value;
    			add_location(option113, file$b, 247, 40, 11995);
    			option114.__value = "8:30 PM";
    			option114.value = option114.__value;
    			add_location(option114, file$b, 248, 40, 12060);
    			option115.__value = "9:00 PM";
    			option115.value = option115.__value;
    			add_location(option115, file$b, 249, 40, 12125);
    			option116.__value = "9:30 PM";
    			option116.value = option116.__value;
    			add_location(option116, file$b, 250, 40, 12190);
    			option117.__value = "10:00 PM";
    			option117.value = option117.__value;
    			add_location(option117, file$b, 251, 40, 12255);
    			option118.__value = "10:30 PM";
    			option118.value = option118.__value;
    			add_location(option118, file$b, 252, 40, 12321);
    			option119.__value = "11:00 PM";
    			option119.value = option119.__value;
    			add_location(option119, file$b, 253, 40, 12387);
    			option120.__value = "11:30 PM";
    			option120.value = option120.__value;
    			add_location(option120, file$b, 254, 40, 12453);
    			option121.__value = "12:00 AM";
    			option121.value = option121.__value;
    			add_location(option121, file$b, 255, 40, 12519);
    			option122.__value = "12:30 AM";
    			option122.value = option122.__value;
    			add_location(option122, file$b, 256, 40, 12585);
    			attr_dev(select2, "name", "StpTime");
    			attr_dev(select2, "class", "form-control svelte-55iz75");
    			attr_dev(select2, "id", "StpTime");
    			select2.required = "";
    			if (/*event_end*/ ctx[7] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[20].call(select2));
    			add_location(select2, file$b, 215, 34, 9848);
    			attr_dev(div6, "class", "group");
    			add_location(div6, file$b, 213, 30, 9729);
    			attr_dev(div7, "class", "group");
    			add_location(div7, file$b, 259, 30, 12722);
    			attr_dev(div8, "id", "wrapper");
    			add_location(div8, file$b, 96, 28, 2548);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[16]),
    				listen_dev(input3, "input", /*input3_input_handler*/ ctx[17]),
    				listen_dev(select0, "change", /*select0_change_handler*/ ctx[18]),
    				listen_dev(select1, "change", /*select1_change_handler*/ ctx[19]),
    				listen_dev(select2, "change", /*select2_change_handler*/ ctx[20])
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*event_name*/ ctx[1]);
    			append_dev(div8, t2);
    			append_dev(div8, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*from_date*/ ctx[2]);
    			append_dev(div1, t5);
    			append_dev(div1, small);
    			append_dev(div8, t7);
    			append_dev(div8, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*to_date*/ ctx[3]);
    			append_dev(div8, t10);
    			append_dev(div8, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t12);
    			append_dev(div3, input3);
    			set_input_value(input3, /*address*/ ctx[4]);
    			append_dev(div8, t13);
    			append_dev(div8, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t15);
    			append_dev(div4, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			append_dev(select0, option5);
    			append_dev(select0, option6);
    			append_dev(select0, option7);
    			append_dev(select0, option8);
    			append_dev(select0, option9);
    			append_dev(select0, option10);
    			append_dev(select0, option11);
    			append_dev(select0, option12);
    			append_dev(select0, option13);
    			append_dev(select0, option14);
    			append_dev(select0, option15);
    			append_dev(select0, option16);
    			append_dev(select0, option17);
    			append_dev(select0, option18);
    			append_dev(select0, option19);
    			append_dev(select0, option20);
    			append_dev(select0, option21);
    			append_dev(select0, option22);
    			append_dev(select0, option23);
    			append_dev(select0, option24);
    			append_dev(select0, option25);
    			append_dev(select0, option26);
    			append_dev(select0, option27);
    			append_dev(select0, option28);
    			append_dev(select0, option29);
    			append_dev(select0, option30);
    			append_dev(select0, option31);
    			append_dev(select0, option32);
    			append_dev(select0, option33);
    			append_dev(select0, option34);
    			append_dev(select0, option35);
    			append_dev(select0, option36);
    			append_dev(select0, option37);
    			append_dev(select0, option38);
    			append_dev(select0, option39);
    			append_dev(select0, option40);
    			select_option(select0, /*setup_time*/ ctx[5]);
    			append_dev(div8, t56);
    			append_dev(div8, div5);
    			append_dev(div5, label5);
    			append_dev(div5, t58);
    			append_dev(div5, select1);
    			append_dev(select1, option41);
    			append_dev(select1, option42);
    			append_dev(select1, option43);
    			append_dev(select1, option44);
    			append_dev(select1, option45);
    			append_dev(select1, option46);
    			append_dev(select1, option47);
    			append_dev(select1, option48);
    			append_dev(select1, option49);
    			append_dev(select1, option50);
    			append_dev(select1, option51);
    			append_dev(select1, option52);
    			append_dev(select1, option53);
    			append_dev(select1, option54);
    			append_dev(select1, option55);
    			append_dev(select1, option56);
    			append_dev(select1, option57);
    			append_dev(select1, option58);
    			append_dev(select1, option59);
    			append_dev(select1, option60);
    			append_dev(select1, option61);
    			append_dev(select1, option62);
    			append_dev(select1, option63);
    			append_dev(select1, option64);
    			append_dev(select1, option65);
    			append_dev(select1, option66);
    			append_dev(select1, option67);
    			append_dev(select1, option68);
    			append_dev(select1, option69);
    			append_dev(select1, option70);
    			append_dev(select1, option71);
    			append_dev(select1, option72);
    			append_dev(select1, option73);
    			append_dev(select1, option74);
    			append_dev(select1, option75);
    			append_dev(select1, option76);
    			append_dev(select1, option77);
    			append_dev(select1, option78);
    			append_dev(select1, option79);
    			append_dev(select1, option80);
    			append_dev(select1, option81);
    			select_option(select1, /*event_start*/ ctx[6]);
    			append_dev(div8, t99);
    			append_dev(div8, div6);
    			append_dev(div6, label6);
    			append_dev(div6, t101);
    			append_dev(div6, select2);
    			append_dev(select2, option82);
    			append_dev(select2, option83);
    			append_dev(select2, option84);
    			append_dev(select2, option85);
    			append_dev(select2, option86);
    			append_dev(select2, option87);
    			append_dev(select2, option88);
    			append_dev(select2, option89);
    			append_dev(select2, option90);
    			append_dev(select2, option91);
    			append_dev(select2, option92);
    			append_dev(select2, option93);
    			append_dev(select2, option94);
    			append_dev(select2, option95);
    			append_dev(select2, option96);
    			append_dev(select2, option97);
    			append_dev(select2, option98);
    			append_dev(select2, option99);
    			append_dev(select2, option100);
    			append_dev(select2, option101);
    			append_dev(select2, option102);
    			append_dev(select2, option103);
    			append_dev(select2, option104);
    			append_dev(select2, option105);
    			append_dev(select2, option106);
    			append_dev(select2, option107);
    			append_dev(select2, option108);
    			append_dev(select2, option109);
    			append_dev(select2, option110);
    			append_dev(select2, option111);
    			append_dev(select2, option112);
    			append_dev(select2, option113);
    			append_dev(select2, option114);
    			append_dev(select2, option115);
    			append_dev(select2, option116);
    			append_dev(select2, option117);
    			append_dev(select2, option118);
    			append_dev(select2, option119);
    			append_dev(select2, option120);
    			append_dev(select2, option121);
    			append_dev(select2, option122);
    			select_option(select2, /*event_end*/ ctx[7]);
    			append_dev(div8, t142);
    			append_dev(div8, div7);
    			if_block.m(div7, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*event_name*/ 2 && input0.value !== /*event_name*/ ctx[1]) {
    				set_input_value(input0, /*event_name*/ ctx[1]);
    			}

    			if (dirty & /*from_date*/ 4 && input1.value !== /*from_date*/ ctx[2]) {
    				set_input_value(input1, /*from_date*/ ctx[2]);
    			}

    			if (dirty & /*to_date*/ 8 && input2.value !== /*to_date*/ ctx[3]) {
    				set_input_value(input2, /*to_date*/ ctx[3]);
    			}

    			if (dirty & /*address*/ 16 && input3.value !== /*address*/ ctx[4]) {
    				set_input_value(input3, /*address*/ ctx[4]);
    			}

    			if (dirty & /*setup_time*/ 32) {
    				select_option(select0, /*setup_time*/ ctx[5]);
    			}

    			if (dirty & /*event_start*/ 64) {
    				select_option(select1, /*event_start*/ ctx[6]);
    			}

    			if (dirty & /*event_end*/ 128) {
    				select_option(select2, /*event_end*/ ctx[7]);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div7, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div8_transition) div8_transition = create_bidirectional_transition(div8, fly, { x: 200, duration: 200 }, true);
    				div8_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div8_transition) div8_transition = create_bidirectional_transition(div8, fly, { x: 200, duration: 200 }, false);
    			div8_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if_block.d();
    			if (detaching && div8_transition) div8_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(96:24) {#if (selectedIndex == 0)}",
    		ctx
    	});

    	return block;
    }

    // (264:34) {:else}
    function create_else_block$2(ctx) {
    	let label;
    	let t1;
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Please attach event flier. (Only PDF)";
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "class", "svelte-55iz75");
    			add_location(label, file$b, 264, 37, 12992);
    			attr_dev(input, "accept", "application/pdf");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "svelte-55iz75");
    			add_location(input, file$b, 265, 37, 13082);
    			dispose = listen_dev(input, "change", /*handleFile*/ ctx[9], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(264:34) {:else}",
    		ctx
    	});

    	return block;
    }

    // (261:34) {#if fileName}
    function create_if_block_1$1(ctx) {
    	let label;
    	let t;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(/*fileName*/ ctx[8]);
    			attr_dev(label, "class", "svelte-55iz75");
    			add_location(label, file$b, 262, 37, 12887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileName*/ 256) set_data_dev(t, /*fileName*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(261:34) {#if fileName}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let ul;
    	let li0;
    	let button0;
    	let t2;
    	let t3;
    	let li1;
    	let button1;
    	let t5;
    	let t6;
    	let li2;
    	let button2;
    	let t8;
    	let t9;
    	let form;
    	let div4;
    	let div1;
    	let t10;
    	let div2;
    	let current_block_type_index;
    	let if_block;
    	let t11;
    	let t12;
    	let div3;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedIndex*/ ctx[0] == 0) return 0;
    		if (/*selectedIndex*/ ctx[0] == 1) return 1;
    		if (/*selectedIndex*/ ctx[0] == 2) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const buttonnext = new ButtonNext({
    			props: {
    				float: "right",
    				lbl: /*selectedIndex*/ ctx[0] < 2 ? "Next" : "Finish"
    			},
    			$$inline: true
    		});

    	buttonnext.$on("click", /*click_handler_3*/ ctx[21]);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "1";
    			t2 = text(" EVENT INFORMATION");
    			t3 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "2";
    			t5 = text(" CONTACT INFORMATION");
    			t6 = space();
    			li2 = element("li");
    			button2 = element("button");
    			button2.textContent = "3";
    			t8 = text(" ADDITIONAL INFORMATION");
    			t9 = space();
    			form = element("form");
    			div4 = element("div");
    			div1 = element("div");
    			t10 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t11 = space();
    			create_component(buttonnext.$$.fragment);
    			t12 = space();
    			div3 = element("div");
    			set_style(div0, "height", "20px");
    			set_style(div0, "width", "100%");
    			set_style(div0, "border-top-left-radius", "20px");
    			set_style(div0, "border-top-right-radius", "20px");
    			set_style(div0, "background", "#2E3257");
    			add_location(div0, file$b, 82, 17, 1646);
    			attr_dev(button0, "class", "svelte-55iz75");
    			toggle_class(button0, "active", /*selectedIndex*/ ctx[0] == 0);
    			add_location(button0, file$b, 85, 24, 1862);
    			attr_dev(li0, "class", "svelte-55iz75");
    			add_location(li0, file$b, 85, 20, 1858);
    			attr_dev(button1, "class", "svelte-55iz75");
    			toggle_class(button1, "active", /*selectedIndex*/ ctx[0] == 1);
    			add_location(button1, file$b, 86, 24, 2002);
    			attr_dev(li1, "class", "svelte-55iz75");
    			add_location(li1, file$b, 86, 20, 1998);
    			attr_dev(button2, "class", "svelte-55iz75");
    			toggle_class(button2, "active", /*selectedIndex*/ ctx[0] == 2);
    			add_location(button2, file$b, 87, 24, 2143);
    			attr_dev(li2, "class", "svelte-55iz75");
    			add_location(li2, file$b, 87, 20, 2139);
    			attr_dev(ul, "class", "horizontal-list svelte-55iz75");
    			add_location(ul, file$b, 84, 17, 1809);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$b, 91, 24, 2378);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$b, 92, 24, 2426);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$b, 341, 24, 16713);
    			attr_dev(div4, "class", "container svelte-55iz75");
    			add_location(div4, file$b, 90, 20, 2330);
    			add_location(form, file$b, 89, 17, 2303);
    			attr_dev(div5, "id", "form");
    			attr_dev(div5, "class", "svelte-55iz75");
    			add_location(div5, file$b, 81, 0, 1613);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[11], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[12], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[13], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(li0, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(li1, t5);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, button2);
    			append_dev(li2, t8);
    			append_dev(div5, t9);
    			append_dev(div5, form);
    			append_dev(form, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t10);
    			append_dev(div4, div2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div2, null);
    			}

    			append_dev(div2, t11);
    			mount_component(buttonnext, div2, null);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedIndex*/ 1) {
    				toggle_class(button0, "active", /*selectedIndex*/ ctx[0] == 0);
    			}

    			if (dirty & /*selectedIndex*/ 1) {
    				toggle_class(button1, "active", /*selectedIndex*/ ctx[0] == 1);
    			}

    			if (dirty & /*selectedIndex*/ 1) {
    				toggle_class(button2, "active", /*selectedIndex*/ ctx[0] == 2);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div2, t11);
    				} else {
    					if_block = null;
    				}
    			}

    			const buttonnext_changes = {};
    			if (dirty & /*selectedIndex*/ 1) buttonnext_changes.lbl = /*selectedIndex*/ ctx[0] < 2 ? "Next" : "Finish";
    			buttonnext.$set(buttonnext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(buttonnext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(buttonnext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(buttonnext);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let selectedIndex = 0;
    	let event_name = "";
    	let from_date = "";
    	let to_date = "";
    	let address = "";
    	let setup_time = "";
    	let event_start = "";
    	let event_end = "";
    	let fileName = "";
    	let files;

    	function handleFile(e) {
    		const target = e.target || e.srcElement;
    		var found = false;

    		for (var file of target.files) {
    			files = file;
    			$$invalidate(8, fileName = file.name);
    			let name = file.name.toLowerCase();

    			if (!name.includes(".pdf")) {
    				alert("Please attach pdf only");
    				found = true;
    				break;
    			}
    		}

    		if (found) {
    			target.value = "";
    		}
    	}

    	const click_handler = () => {
    		$$invalidate(0, selectedIndex = 0);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, selectedIndex = 1);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, selectedIndex = 2);
    	};

    	function input0_input_handler() {
    		event_name = this.value;
    		$$invalidate(1, event_name);
    	}

    	function input1_input_handler() {
    		from_date = this.value;
    		$$invalidate(2, from_date);
    	}

    	function input2_input_handler() {
    		to_date = this.value;
    		$$invalidate(3, to_date);
    	}

    	function input3_input_handler() {
    		address = this.value;
    		$$invalidate(4, address);
    	}

    	function select0_change_handler() {
    		setup_time = select_value(this);
    		$$invalidate(5, setup_time);
    	}

    	function select1_change_handler() {
    		event_start = select_value(this);
    		$$invalidate(6, event_start);
    	}

    	function select2_change_handler() {
    		event_end = select_value(this);
    		$$invalidate(7, event_end);
    	}

    	const click_handler_3 = () => {
    		selectedIndex < 3
    		? $$invalidate(0, selectedIndex++, selectedIndex)
    		: "";
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("selectedIndex" in $$props) $$invalidate(0, selectedIndex = $$props.selectedIndex);
    		if ("event_name" in $$props) $$invalidate(1, event_name = $$props.event_name);
    		if ("from_date" in $$props) $$invalidate(2, from_date = $$props.from_date);
    		if ("to_date" in $$props) $$invalidate(3, to_date = $$props.to_date);
    		if ("address" in $$props) $$invalidate(4, address = $$props.address);
    		if ("setup_time" in $$props) $$invalidate(5, setup_time = $$props.setup_time);
    		if ("event_start" in $$props) $$invalidate(6, event_start = $$props.event_start);
    		if ("event_end" in $$props) $$invalidate(7, event_end = $$props.event_end);
    		if ("fileName" in $$props) $$invalidate(8, fileName = $$props.fileName);
    		if ("files" in $$props) files = $$props.files;
    	};

    	return [
    		selectedIndex,
    		event_name,
    		from_date,
    		to_date,
    		address,
    		setup_time,
    		event_start,
    		event_end,
    		fileName,
    		handleFile,
    		files,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		click_handler_3
    	];
    }

    class EventRequest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EventRequest",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/PubEdForm/NoteEventRequest.svelte generated by Svelte v3.16.7 */
    const file$c = "src/components/PubEdForm/NoteEventRequest.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (102:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "NOTE";
    			attr_dev(div, "class", "wrapper svelte-1slgjn8");
    			add_location(div, file$c, 102, 5, 2215);
    			dispose = listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 800, amount: 10 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 800, amount: 10 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(102:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:0) {#if enable}
    function create_if_block$4(ctx) {
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let t1;
    	let t2;
    	let div1;
    	let button;
    	let t4;
    	let ol;
    	let t5;
    	let li;
    	let t6;
    	let a0;
    	let t8;
    	let a1;
    	let t10;
    	let dispose;
    	let each_value = /*notes*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "X";
    			t4 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			li = element("li");
    			t6 = text("E-mail\n                ");
    			a0 = element("a");
    			a0.textContent = "Ariana Morales";
    			t8 = text("\n                or \n                ");
    			a1 = element("a");
    			a1.textContent = "Daniel Gutierrez";
    			t10 = text("\n                for more information regarding Public Education.");
    			attr_dev(div0, "class", "overlay svelte-1slgjn8");
    			add_location(div0, file$c, 81, 5, 1588);
    			attr_dev(button, "class", "svelte-1slgjn8");
    			add_location(button, file$c, 87, 32, 1733);
    			attr_dev(div1, "class", "btnCon svelte-1slgjn8");
    			add_location(div1, file$c, 87, 12, 1713);
    			attr_dev(div2, "class", "title svelte-1slgjn8");
    			add_location(div2, file$c, 84, 8, 1656);
    			attr_dev(a0, "href", "mailto:amorales@lrgvdc911.org");
    			add_location(a0, file$c, 94, 16, 1936);
    			attr_dev(a1, "href", "mailto:dgutierrez@lrgvdc911.org");
    			add_location(a1, file$c, 96, 16, 2031);
    			add_location(li, file$c, 93, 12, 1909);
    			attr_dev(ol, "class", "svelte-1slgjn8");
    			add_location(ol, file$c, 89, 8, 1806);
    			attr_dev(div3, "class", "note svelte-1slgjn8");
    			add_location(div3, file$c, 82, 4, 1620);
    			dispose = listen_dev(button, "click", /*handleOnClick*/ ctx[3], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(div3, t4);
    			append_dev(div3, ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			append_dev(ol, t5);
    			append_dev(ol, li);
    			append_dev(li, t6);
    			append_dev(li, a0);
    			append_dev(li, t8);
    			append_dev(li, a1);
    			append_dev(li, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (dirty & /*notes*/ 2) {
    				each_value = /*notes*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(81:0) {#if enable}",
    		ctx
    	});

    	return block;
    }

    // (91:12) {#each notes as item}
    function create_each_block(ctx) {
    	let li;
    	let t_value = /*item*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$c, 91, 16, 1861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notes*/ 2 && t_value !== (t_value = /*item*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(91:12) {#each notes as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*enable*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { title = "Hello World" } = $$props;
    	let { notes = "Test" } = $$props;
    	let enable = true;

    	function handleOnClick() {
    		$$invalidate(2, enable = false);
    	}

    	const writable_props = ["title", "notes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NoteEventRequest> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, enable = true);
    	};

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("notes" in $$props) $$invalidate(1, notes = $$props.notes);
    	};

    	$$self.$capture_state = () => {
    		return { title, notes, enable };
    	};

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("notes" in $$props) $$invalidate(1, notes = $$props.notes);
    		if ("enable" in $$props) $$invalidate(2, enable = $$props.enable);
    	};

    	return [title, notes, enable, handleOnClick, click_handler];
    }

    class NoteEventRequest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$d, safe_not_equal, { title: 0, notes: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoteEventRequest",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get title() {
    		throw new Error("<NoteEventRequest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<NoteEventRequest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notes() {
    		throw new Error("<NoteEventRequest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notes(value) {
    		throw new Error("<NoteEventRequest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/PubEventForm.svelte generated by Svelte v3.16.7 */
    const file$d = "src/pages/PubEventForm.svelte";

    function create_fragment$e(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let t3;
    	let h3;
    	let img;
    	let img_src_value;
    	let t4;
    	let t5;
    	let t6;
    	let div2;
    	let current;

    	const noteeventrequest = new NoteEventRequest({
    			props: { title: "Note", notes: /*notes*/ ctx[0] },
    			$$inline: true
    		});

    	const eventrequest = new EventRequest({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Event Request";
    			t2 = space();
    			create_component(noteeventrequest.$$.fragment);
    			t3 = space();
    			h3 = element("h3");
    			img = element("img");
    			t4 = text("Click to view scheduled events");
    			t5 = space();
    			create_component(eventrequest.$$.fragment);
    			t6 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "grid-item");
    			add_location(div0, file$d, 34, 4, 908);
    			attr_dev(h1, "class", "svelte-1yf1apt");
    			add_location(h1, file$d, 38, 8, 987);
    			attr_dev(img, "width", "18");
    			attr_dev(img, "height", "18");
    			if (img.src !== (img_src_value = "/assets/png/calendar.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Calendar");
    			add_location(img, file$d, 40, 72, 1132);
    			set_style(h3, "text-align", "center");
    			set_style(h3, "color", "#263E70");
    			set_style(h3, "cursor", "pointer");
    			attr_dev(h3, "class", "svelte-1yf1apt");
    			add_location(h3, file$d, 40, 8, 1068);
    			attr_dev(div1, "class", "grid-item");
    			add_location(div1, file$d, 37, 4, 955);
    			attr_dev(div2, "class", "grid-item");
    			add_location(div2, file$d, 43, 4, 1289);
    			attr_dev(div3, "class", "grid-container svelte-1yf1apt");
    			add_location(div3, file$d, 33, 0, 875);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			mount_component(noteeventrequest, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, h3);
    			append_dev(h3, img);
    			append_dev(h3, t4);
    			append_dev(div1, t5);
    			mount_component(eventrequest, div1, null);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noteeventrequest.$$.fragment, local);
    			transition_in(eventrequest.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noteeventrequest.$$.fragment, local);
    			transition_out(eventrequest.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(noteeventrequest);
    			destroy_component(eventrequest);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self) {
    	let notes = [
    		"All Public Event Requests must be submitted to LRGVDC at a minimum of 14 business day prior to your event.",
    		"Requests between the 14 day period will not be accepted by the online system.",
    		"If you are experiencing problems with your online request please call us directly at (956) 682-3481 ext. 150"
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("notes" in $$props) $$invalidate(0, notes = $$props.notes);
    	};

    	return [notes];
    }

    class PubEventForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PubEventForm",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.7 */
    const file$e = "src/App.svelte";

    // (46:4) <Router>
    function create_default_slot$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const route0 = new Route({
    			props: {
    				path: "#PubEdRequest",
    				component: PubEventForm
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: { path: "#PubEd", component: PubEd },
    			$$inline: true
    		});

    	const route2 = new Route({
    			props: { path: "#AboutUs", component: AboutUs },
    			$$inline: true
    		});

    	const route3 = new Route({
    			props: { path: "#Home", component: Home },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(46:4) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current;
    	const header = new Header({ $$inline: true });

    	const router = new Router_1({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
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
    			attr_dev(div, "class", "wrapper svelte-a9fug3");
    			add_location(div, file$e, 44, 1, 824);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self) {
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
    		init(this, options, instance$b, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    const app = new App({
        target: document.getElementById("app")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
