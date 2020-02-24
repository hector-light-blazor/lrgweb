<script>
	import {onMount} from "svelte";
	
	// import Home from "./pages/Home.svelte";
	import svelte from 'crayon-svelte';
	import crayon from 'crayon';

	// const routes = {
    // Exact path
    // '/': Home,
	// '#/PubEdRequest': Chunk(()=> import('./pages/PubEventForm.svelte')),
    // Using named parameters, with last being optional
    // '#/PubEd': Chunk(()=> import('./pages/PubEd.svelte'))
	// }

	const app = crayon.create();
	const outlet = document.getElementById('app')
	app.use(svelte.router(outlet));

	app.path('/', async ctx => {
			
			const Home = await import('./pages/Home')
			return ctx.mount(Home)
			//app.load();
	})

	onMount(() => {
		app.load()
	})

</script>
	

	
			 <!-- <Router>
			    <Route path="#PubEdRequest" component={Chunk(()=> import('./pages/PubEventForm.svelte'))} />
			    <Route path="#PubEd" component={Chunk(()=> import('./pages/PubEd.svelte'))} />
                <Route path="#AboutUs" component={Chunk(()=> import('./pages/AboutUs.svelte'))} />
	            <Route path="#Home" component={Home} />        
            </Router> -->
	