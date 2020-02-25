import svelte from 'crayon-svelte';
import crayon from 'crayon';
import animate from 'crayon-animate'
import transition from 'crayon-transition'
import Home from './pages/Home.svelte';
import { ChunkGenerator } from 'svelte-spa-chunk'
import ChunkComponent from 'svelte-spa-chunk/Chunk.svelte'
const Chunk = ChunkGenerator(ChunkComponent)


const outlet = document.getElementById('app')
window.app = crayon.create() 

app.use(svelte.router(outlet))
app.use(transition.loader())
app.use(animate.defaults({
    name: transition.pushLeft,
    duration: 350
}))

app.path('/', (req, res) => {
    req.mount(Home);
})

//ADD any new paths into the website by following this code below...

app.path('/AboutUs', async ctx=>{
    ctx.mount(Chunk(()=> import("./pages/AboutUs.svelte")));
});
app.path('/PubEd', async ctx => {
    ctx.mount(Chunk(()=> import('./pages/PubEd.svelte')));
})


app.path('/OpenTickets', async ctx => {
    ctx.mount(Chunk(() => import('./pages/OpenTickets.svelte')));
});

//Call this function below to load your app....
app.load()
