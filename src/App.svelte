<script>
	import {onMount} from "svelte";
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	import Home from "./pages/Home.svelte";
	import AboutUs from "./pages/AboutUs.svelte";
	
	import { Router, Route, Link, navigateTo  } from './lib/main';


	onMount(() => {

		let hash = window.location.href;

		if(hash.indexOf("#") == -1) {
			navigateTo("#Home");
		}
		
	})

</script>

<Header />
	<div>
			 <Router>
			   
                <Route path="#AboutUs" component={AboutUs} />
	            <Route path="#Home" component={Home} />        
            </Router>

	</div>

<Footer />