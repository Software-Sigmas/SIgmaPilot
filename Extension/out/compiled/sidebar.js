var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/** @returns {void} */
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

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function select_option(select, value, mounting) {
		for (let i = 0; i < select.options.length; i += 1) {
			const option = select.options[i];
			if (option.__value === value) {
				option.selected = true;
				return;
			}
		}
		if (!mounting || value !== undefined) {
			select.selectedIndex = -1; // no option should be selected
		}
	}

	function select_value(select) {
		const selected_option = select.querySelector(':checked');
		return selected_option && selected_option.__value;
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
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

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
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
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.9';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Element} node
	 * @param {string} property
	 * @param {any} [value]
	 * @returns {void}
	 */
	function prop_dev(node, property, value) {
		node[property] = value;
		dispatch_dev('SvelteDOMSetProperty', { node, property, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/* webviews\components\Sidebar.svelte generated by Svelte v4.2.9 */
	const file = "webviews\\components\\Sidebar.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[10] = list[i];
		return child_ctx;
	}

	// (80:1) {#each options as option}
	function create_each_block(ctx) {
		let option_1;
		let t_value = /*option*/ ctx[10] + "";
		let t;

		const block = {
			c: function create() {
				option_1 = element("option");
				t = text(t_value);
				option_1.__value = /*option*/ ctx[10];
				set_input_value(option_1, option_1.__value);
				add_location(option_1, file, 80, 2, 2381);
			},
			m: function mount(target, anchor) {
				insert_dev(target, option_1, anchor);
				append_dev(option_1, t);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(option_1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(80:1) {#each options as option}",
			ctx
		});

		return block;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[11] = list[i];
		return child_ctx;
	}

	// (34:4) {#each options as option}
	function create_each_block(ctx) {
		let option_1;
		let t_value = /*option*/ ctx[11] + "";
		let t;

		const block = {
			c: function create() {
				option_1 = element("option");
				t = text(t_value);
				option_1.__value = /*option*/ ctx[11];
				set_input_value(option_1, option_1.__value);
				add_location(option_1, file, 34, 8, 760);
			},
			m: function mount(target, anchor) {
				insert_dev(target, option_1, anchor);
				append_dev(option_1, t);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(option_1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(34:4) {#each options as option}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let div0;
		let t1;
		let form0;
		let input;
		let input_disabled_value;
		let t2;
		let div1;
		let t4;
		let select;
		let option_1;
		let t6;
		let div2;
		let t8;
		let form1;
		let textarea;
		let t9;
		let div3;
		let t11;
		let button;
		let t13;
		let div4;
		let t14;
		let mounted;
		let dispose;
		let each_value = ensure_array_like_dev(/*options*/ ctx[4]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				div0 = element("div");
				div0.textContent = "Custom Prompt:";
				t1 = space();
				form0 = element("form");
				input = element("input");
				t2 = space();
				div1 = element("div");
				div1.textContent = "Standard Prompt:";
				t4 = space();
				select = element("select");
				option_1 = element("option");
				option_1.textContent = "Use Custom Prompt";

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t6 = space();
				div2 = element("div");
				div2.textContent = "Code:";
				t8 = space();
				form1 = element("form");
				textarea = element("textarea");
				t9 = space();
				div3 = element("div");
				div3.textContent = "Answer:";
				t11 = space();
				button = element("button");
				button.textContent = "Generate";
				t13 = space();
				div4 = element("div");
				t14 = text(/*answer*/ ctx[0]);
				add_location(div0, file, 34, 0, 931);
				attr_dev(input, "placeholder", "Optional");
				input.disabled = input_disabled_value = /*selectedOption*/ ctx[3] != '';
				add_location(input, file, 72, 1, 2130);
				add_location(form0, file, 71, 0, 2085);
				add_location(div1, file, 75, 0, 2227);
				option_1.__value = "";
				set_input_value(option_1, option_1.__value);
				option_1.selected = true;
				add_location(option_1, file, 78, 1, 2297);
				if (/*selectedOption*/ ctx[3] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
				add_location(select, file, 77, 0, 2258);
				add_location(div2, file, 84, 0, 2446);
				attr_dev(textarea, "id", "mytextarea");
				attr_dev(textarea, "placeholder", "Optional");
				attr_dev(textarea, "class", "svelte-kwez1x");
				add_location(textarea, file, 52, 1, 1386);
				add_location(form1, file, 51, 0, 1341);
				add_location(div3, file, 55, 0, 1503);
				add_location(button, file, 57, 0, 1525);
				add_location(div4, file, 63, 0, 1626);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, form0, anchor);
				append_dev(form0, input);
				set_input_value(input, /*prompt*/ ctx[1]);
				insert_dev(target, t2, anchor);
				insert_dev(target, div1, anchor);
				insert_dev(target, t4, anchor);
				insert_dev(target, select, anchor);
				append_dev(select, option_1);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(select, null);
					}
				}

				select_option(select, /*selectedOption*/ ctx[3], true);
				insert_dev(target, t6, anchor);
				insert_dev(target, div2, anchor);
				insert_dev(target, t8, anchor);
				insert_dev(target, form1, anchor);
				append_dev(form1, textarea);
				set_input_value(textarea, /*code*/ ctx[2]);
				insert_dev(target, t9, anchor);
				insert_dev(target, div3, anchor);
				insert_dev(target, t11, anchor);
				insert_dev(target, button, anchor);
				insert_dev(target, t13, anchor);
				insert_dev(target, div4, anchor);
				append_dev(div4, t14);

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
						listen_dev(form0, "submit", prevent_default(submit_handler), false, true, false, false),
						listen_dev(select, "change", /*select_change_handler*/ ctx[7]),
						listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]),
						listen_dev(textarea, "input", resizeTextarea, false, false, false, false),
						listen_dev(form1, "submit", prevent_default(submit_handler_1), false, true, false, false),
						listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
<<<<<<< Updated upstream
				if (dirty & /*selectedOption, options*/ 24 && input_disabled_value !== (input_disabled_value = /*selectedOption*/ ctx[3] != '')) {
=======
				if (dirty & /*selectedOption, options*/ 24 && input_disabled_value !== (input_disabled_value = /*selectedOption*/ ctx[3] != "")) {
>>>>>>> Stashed changes
					prop_dev(input, "disabled", input_disabled_value);
				}

				if (dirty & /*prompt*/ 2 && input.value !== /*prompt*/ ctx[1]) {
					set_input_value(input, /*prompt*/ ctx[1]);
				}

				if (dirty & /*options*/ 16) {
					each_value = ensure_array_like_dev(/*options*/ ctx[4]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*selectedOption, options*/ 24) {
					select_option(select, /*selectedOption*/ ctx[3]);
				}

				if (dirty & /*code*/ 4) {
					set_input_value(textarea, /*code*/ ctx[2]);
				}

				if (dirty & /*answer*/ 1) set_data_dev(t14, /*answer*/ ctx[0]);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div0);
					detach_dev(t1);
					detach_dev(form0);
					detach_dev(t2);
					detach_dev(div1);
					detach_dev(t4);
					detach_dev(select);
					detach_dev(t6);
					detach_dev(div2);
					detach_dev(t8);
					detach_dev(form1);
					detach_dev(t9);
					detach_dev(div3);
					detach_dev(t11);
					detach_dev(button);
					detach_dev(t13);
					detach_dev(div4);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
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

	const MAXHEIGHT = 200;

	// resize text area based on text amount
	function resizeTextarea(event) {
		let target;

		if (event) {
			target = event.target;
		} else {
			// Correctly select the textarea by its ID
			target = document.getElementById('mytextarea');
		}

		if (!target) return; // Exit if textarea is not found, for safety
		target.style.height = 'auto';
		target.style.height = `${Math.min(target.scrollHeight, MAXHEIGHT)}px`;
	}

	const submit_handler = () => {
		
	};

	const submit_handler_1 = () => {
		
	};

=======
	function resizeTextarea(event) {
		const target = event.target;
		target.style.height = 'auto';
		target.style.height = `${target.scrollHeight}px`;
	}

>>>>>>> Stashed changes
	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Sidebar', slots, []);
		let answer = '';
		let prompt = '';
		let code = '';
		let selectedOption = '';
<<<<<<< Updated upstream
		const options = ['Formatting', 'Efficiency', 'Explanation'];

		// recieve commands from webview
		window.addEventListener('message', event => {
			const message = event.data;

			switch (message.command) {
				case 'setCode':
					$$invalidate(2, code = message.code);
					setTimeout(resizeTextarea, 0);
					break;
				case 'quickReview':
					$$invalidate(2, code = message.code);
					$$invalidate(1, prompt = '');
					$$invalidate(3, selectedOption = 'Explanation');
					setTimeout(resizeTextarea, 0);
					generateResponse();
					break;
				case 'modelResponse':
					$$invalidate(0, answer = message.answer);
					break;
			}
		});

		function generateResponse() {
			let finalPrompt = 'Hello World';

			switch (selectedOption) {
				case 'Formatting':
					finalPrompt = FORMATTING_PROMPT;
					break;
				case 'Efficiency':
					finalPrompt = EFFICIENCY_PROMPT;
					break;
				case 'Explanation':
					finalPrompt = EXPLANATION_PROMPT;
					break;
				case '':
					finalPrompt = prompt + '\n';
					break;
				default:
					finalPrompt = EXPLANATION_PROMPT;
					break;
			}

			finalPrompt = finalPrompt + code;

			tsvscode.postMessage({
				type: 'generateResponse',
				value: finalPrompt
			});
		}

=======
		const options = ["Formatting", "Efficiency", "Security", "Variable Naming", "Explanation"];
>>>>>>> Stashed changes
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sidebar> was created with unknown prop '${key}'`);
		});

		function input_input_handler() {
			prompt = this.value;
			$$invalidate(1, prompt);
		}

<<<<<<< Updated upstream
=======
		const submit_handler = () => {
			$$invalidate(0, answer = 'AI generated result goes here');
		};

>>>>>>> Stashed changes
		function select_change_handler() {
			selectedOption = select_value(this);
			$$invalidate(3, selectedOption);
			$$invalidate(4, options);
		}

		function textarea_input_handler() {
			code = this.value;
			$$invalidate(2, code);
		}
<<<<<<< Updated upstream
=======

		const submit_handler_1 = () => {
			$$invalidate(0, answer = 'AI generated result goes here');
		};
>>>>>>> Stashed changes

		const click_handler = () => {
			generateResponse();
		};

		$$self.$capture_state = () => ({
			MAXHEIGHT,
=======
>>>>>>> Stashed changes
			answer,
			prompt,
			code,
			selectedOption,
			options,
			resizeTextarea,
			generateResponse
		});

		$$self.$inject_state = $$props => {
			if ('answer' in $$props) $$invalidate(0, answer = $$props.answer);
			if ('prompt' in $$props) $$invalidate(1, prompt = $$props.prompt);
			if ('code' in $$props) $$invalidate(2, code = $$props.code);
			if ('selectedOption' in $$props) $$invalidate(3, selectedOption = $$props.selectedOption);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			answer,
			prompt,
			code,
			selectedOption,
			options,
			generateResponse,
			input_input_handler,
<<<<<<< Updated upstream
			select_change_handler,
			textarea_input_handler,
=======
			submit_handler,
			select_change_handler,
			textarea_input_handler,
			submit_handler_1,
>>>>>>> Stashed changes
			click_handler
		];
	}

	class Sidebar extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Sidebar",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Sidebar({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=sidebar.js.map
