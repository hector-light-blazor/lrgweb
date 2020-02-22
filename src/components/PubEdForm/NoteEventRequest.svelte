<script>
    import { blur } from 'svelte/transition';
    export let title = "Hello World";
    export let notes = "Test";
    let enable = true;
    function handleOnClick() {
        enable =false;
    }
</script>

<style>
    .note {
        position: absolute;
        z-index: 3;
         left: 50%;
        top: 50%;
        margin-left: -250px;
        margin-top: -200px;
        bottom: 10px;
        width: 540px;
        height: 400px;
        background: #F5F5F5;
        border-radius: 20px;
        box-shadow: 1px 2px 4px rgba(0, 0, 0, .5);
    }        
    
    .title {
        color: white;
        text-align: center;
        height: 20px; width: 100%; 
        border-top-left-radius: 20px; border-top-right-radius:20px;
        background: #2E3257 !important; 
    }
    .btnCon {
    position:relative;
    left: 49%;
    bottom: 22px;
    border-radius: 50%;
}
button {
    border-radius: 50%;
    width: 30px;
    height: 30px;
    background: #BB2026;
    color: white;
}
button:hover {
    cursor: pointer;
    background: rgb(212, 11, 18);
}
.overlay{
    position: absolute;
    top:0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1;
    background: rgba(0,0,0,0.5)
}
ol{
    color: #BB2026;
}
.wrapper {
    position: absolute;
    display: inline-block;
    width: 3.4em;
    height: 3.4em;
    z-index: 4;
    line-height: 3.4em;
    background: #2E3257;
    border-radius: 50%;
    text-align: center;
    color: white;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, .5);
}
.wrapper:hover {
    cursor: pointer;
}
</style>

{#if enable}
     <div class="overlay"></div>
    <div class="note">
        
        <div class="title">
    
            {title}
            <div class="btnCon"><button on:click={handleOnClick}>X</button></div>
        </div>
        <ol>
            {#each notes as item}
                <li>{item}</li>
            {/each}
            <li>E-mail
                <a href="mailto:amorales@lrgvdc911.org">Ariana Morales</a>
                or 
                <a href="mailto:dgutierrez@lrgvdc911.org">Daniel Gutierrez</a>
                for more information regarding Public Education.
            </li>
        </ol>
    </div>
{:else}
     <div transition:blur="{{duration: 800, amount: 10}}" on:click="{()=>{enable= true;}}" class="wrapper">
        NOTE
     </div>
{/if}