<script>
	import {onMount} from "svelte";
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	import Home from "./pages/Home.svelte";
	import AboutUs from "./pages/AboutUs.svelte";
	import PubEd from "./pages/PubEd.svelte";
	import PubEventForm from "./pages/PubEventForm.svelte";
	import { Router, Route, Link, navigateTo  } from './lib/main';


	onMount(() => {

		let hash = window.location.href;

		if(hash.indexOf("#") == -1) {
			navigateTo("#Home");
		}
		
	})

</script>
	<style>
		.wrapper{
			margin: 0 auto;
			max-width: 1400px;
			background: white;
		}

			@media only screen and (max-width: 600px) {
			.wrapper{
				max-width: 550px;
			}
		}

		@media only screen and (max-width: 400px) {
			.wrapper{
				max-width: 350px;
			}
		}
	

	</style>
<Header />
	<div class="wrapper">
			 <Router>
			    <Route path="#PubEdRequest" component={PubEventForm} />
			    <Route path="#PubEd" component={PubEd} />
                <Route path="#AboutUs" component={AboutUs} />
	            <Route path="#Home" component={Home} />        
            </Router>

	</div>

<Footer />